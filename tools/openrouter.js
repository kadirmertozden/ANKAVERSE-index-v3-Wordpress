/**
 * OpenRouter client for the translation scripts.
 *
 * Runs in GitHub Actions, never in the Coolify build: the build container is
 * ephemeral, so translating there would redo the whole archive on every deploy.
 * The key must not be added to Coolify -- there is no reason for it to reach
 * the VPS at all.
 */
import {
  ModelOutputError,
  TranslationError,
  assertHtmlIntact,
  assertNoEnvelopeLeftovers,
  assertTranslated,
  countCharacters,
  estimateCostUsd,
  orderedBatch,
  outputCeiling,
  restoreProtectedTerms,
} from './translation-guards.js';

export { countCharacters, restoreProtectedTerms, ModelOutputError, TranslationError };

const BASE = 'https://openrouter.ai/api/v1';

/** Locale code to the language name the prompt names. */
export const TARGET_LANGUAGES = {
  en: 'English',
  de: 'German',
  fr: 'French',
  es: 'Spanish',
  ar: 'Arabic',
  tr: 'Turkish',
};

/**
 * Smaller than DeepL's 50. A batch is one JSON object the model has to return
 * intact, and a long batch of HTML bodies is where models start dropping keys.
 */
const MAX_TEXTS_PER_REQUEST = 20;

const MAX_RETRIES = 3;

/**
 * How many times a batch is generated again after the model got it wrong.
 *
 * Generation is not deterministic even at temperature 0, and a fault that
 * shows up in one call out of a hundred will show up in most runs of a hundred
 * and forty. Aborting the whole archive over one malformed response wastes
 * everything translated before it.
 */
const GENERATION_RETRIES = 2;

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

function systemPrompt(languageName, html, envelope) {
  return [
    `You are a professional translator. Translate from Turkish into ${languageName}.`,
    '',
    'Rules:',
    envelope
      ? '- Return ONLY a JSON object whose keys are the same index strings you were given.'
      : `- Return ONLY the translated ${html ? 'HTML' : 'text'}, with nothing before or after it.`,
    '- Translate every value. Never copy the Turkish text through unchanged.',
    '- Never add commentary, notes, or explanation.',
    '- Keep these names exactly as written: ANKAVERSE, ANKAVERSE Nexus, ANKAVERSE Hub, Vaktia, Suguya.',
    '- Keep i18next placeholders such as {{count}} byte-for-byte identical.',
    html
      ? '- The values are HTML. Translate only the text between tags. Do not add, remove, reorder or rename any tag or attribute.'
      : '- The values are plain text. Do not add HTML.',
    '- Match the register of the source: corporate, precise, not marketing filler.',
  ].join('\n');
}

export function createClient({ apiKey = process.env.OPENROUTER_API_KEY, model } = {}) {
  if (!apiKey) {
    throw new TranslationError(
      'OPENROUTER_API_KEY is not set (GitHub Secrets, or .env for local runs)',
    );
  }
  if (!model) {
    throw new TranslationError('No model configured. Set OPENROUTER_MODEL.');
  }

  const headers = {
    Authorization: `Bearer ${apiKey.trim()}`,
    'HTTP-Referer': 'https://ankaverse.com.tr',
    'X-Title': 'ANKAVERSE content pipeline',
  };

  async function call(path, body) {
    let lastError;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
      const response = await fetch(`${BASE}${path}`, {
        method: body ? 'POST' : 'GET',
        headers: body ? { ...headers, 'Content-Type': 'application/json' } : headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (response.ok) return response.json();

      const detail = await response.text().catch(() => '');
      lastError = new TranslationError(
        `OpenRouter ${path} failed: ${response.status} ${response.statusText} ${detail}`,
      );

      // Only rate limiting and server faults are worth retrying. A 400 means
      // the request is wrong and will stay wrong.
      if (response.status !== 429 && response.status < 500) throw lastError;
      if (attempt < MAX_RETRIES) await sleep(2 ** attempt * 1000);
    }
    throw lastError;
  }

  // The catalogue is read twice per run -- once to check the model exists, once
  // for its price -- and it does not change mid-run.
  let modelsPromise;

  return {
    model,
    models: () => (modelsPromise ??= call('/models')),
    credits: () => call('/credits'),

    async translate(texts, targetLocale, { html = false, label = targetLocale } = {}) {
      if (texts.length === 0) return [];

      const languageName = TARGET_LANGUAGES[targetLocale];
      if (!languageName) {
        throw new TranslationError(`No language name configured for locale "${targetLocale}".`);
      }

      /** One generation of one batch, validated. Throws ModelOutputError. */
      const generate = async (batch, offset) => {
        // The JSON envelope only earns its keep when there is an order to
        // preserve. For one text it adds nothing and costs a great deal:
        // escaping a two-thousand-character HTML body into a JSON string sent
        // the model into a repeating loop that ran to its 16384-token output
        // limit, where the same body sent raw came back in 459.
        const envelope = batch.length > 1;
        const payload = Object.fromEntries(batch.map((text, index) => [String(index), text]));

        const data = await call('/chat/completions', {
          model,
          temperature: 0,
          // A ceiling turns a runaway generation into a fast failure instead of
          // ninety seconds of billed repetition, three times over with retries.
          max_tokens: outputCeiling(countCharacters(batch)),
          ...(envelope ? { response_format: { type: 'json_object' } } : {}),
          messages: [
            { role: 'system', content: systemPrompt(languageName, html, envelope) },
            { role: 'user', content: envelope ? JSON.stringify(payload) : batch[0] },
          ],
        });

        const choice = data?.choices?.[0];
        const content = choice?.message?.content;
        if (typeof content !== 'string') {
          throw new ModelOutputError(`OpenRouter returned no message content for ${label}.`);
        }

        // A response cut off at the output limit is still valid-looking at the
        // start, which is what made the first occurrence of this read as a
        // plain JSON fault. Naming it is the difference between "retry" and
        // "send less at a time".
        if (choice.finish_reason === 'length') {
          throw new ModelOutputError(
            `OpenRouter truncated the response for ${label} at the output limit ` +
              `(${data?.usage?.completion_tokens} completion tokens, provider ${data?.provider}).`,
          );
        }

        let translated;
        if (envelope) {
          let parsed;
          try {
            parsed = JSON.parse(content);
          } catch (error) {
            // The end, not the beginning: malformed JSON breaks where it stops.
            throw new ModelOutputError(
              `OpenRouter returned content that is not JSON for ${label} ` +
                `(provider ${data?.provider}, finish ${choice.finish_reason}): ${error.message}\n` +
                `  ...ends with: ${JSON.stringify(content.slice(-160))}`,
            );
          }
          translated = orderedBatch(batch, parsed);
        } else {
          // Without the envelope the whole reply is the translation, so a code
          // fence or a preamble would land in the file verbatim.
          if (html) assertNoEnvelopeLeftovers(content, label);
          translated = [content.trim()];
        }

        translated.forEach((value, index) => {
          const itemLabel = `${label}[${offset + index}]`;
          assertTranslated(batch[index], value, itemLabel);
          if (html) assertHtmlIntact(batch[index], value, itemLabel);
        });
        return translated;
      };

      const results = [];
      for (let offset = 0; offset < texts.length; offset += MAX_TEXTS_PER_REQUEST) {
        const batch = texts.slice(offset, offset + MAX_TEXTS_PER_REQUEST);

        for (let attempt = 0; ; attempt += 1) {
          try {
            results.push(...(await generate(batch, offset)));
            break;
          } catch (error) {
            // Only the model's own mistakes are worth asking again. A bad
            // request stays bad, and the guards run on every regeneration, so
            // nothing unvalidated is ever accepted.
            if (!(error instanceof ModelOutputError) || attempt >= GENERATION_RETRIES) throw error;
            console.warn(
              `  ! ${label}: ${error.message.split('\n')[0]} ` +
                `-- generating again (${attempt + 1}/${GENERATION_RETRIES})`,
            );
          }
        }
      }
      return results;
    },
  };
}

/**
 * Replaces DeepL's target-language check. An LLM will attempt any language, so
 * the failure that actually needs catching is a model id that does not exist --
 * a typo in the environment would otherwise surface as an opaque 400 partway
 * through a paid run.
 */
export async function assertModelAvailable(client) {
  const data = await client.models();
  const ids = new Set((data?.data ?? []).map((entry) => entry.id));

  if (!ids.has(client.model)) {
    throw new TranslationError(
      `OpenRouter has no model "${client.model}". ` +
        'Check OPENROUTER_MODEL against https://openrouter.ai/models',
    );
  }
}

/** The configured model's advertised price, per token, as OpenRouter reports it. */
async function pricingFor(client) {
  const data = await client.models();
  const entry = (data?.data ?? []).find((model) => model.id === client.model);
  return entry?.pricing;
}

/**
 * Replaces DeepL's quota check, and exists for the same reason: a run that
 * stops halfway leaves some pages translated and some Turkish under a foreign
 * hreflang. Pay-as-you-go makes this worse than a monthly quota -- DeepL simply
 * stopped, whereas here the balance drains until it runs out mid-job.
 *
 * The estimate uses the model's own advertised price rather than an assumed
 * rate. The two models this pipeline runs are a factor of twenty-five apart on
 * output, so one assumed rate would either wave through a run that empties the
 * balance or block one that costs cents.
 */
export async function assertBudget(client, estimatedCharacters) {
  const data = await client.credits();
  const total = data?.data?.total_credits;
  const used = data?.data?.total_usage;

  if (typeof total !== 'number' || typeof used !== 'number') {
    throw new TranslationError(
      `Could not read the OpenRouter credit balance: ${JSON.stringify(data).slice(0, 200)}`,
    );
  }

  const remaining = total - used;
  const estimate = estimateCostUsd(estimatedCharacters, await pricingFor(client));

  console.log(
    `OpenRouter credits: $${remaining.toFixed(2)} left; ` +
      `this run is estimated at $${estimate.toFixed(4)} ` +
      `(${estimatedCharacters.toLocaleString('en-US')} characters, model ${client.model})`,
  );

  if (estimate > remaining) {
    throw new TranslationError(
      `Not enough credit: estimated $${estimate.toFixed(4)}, $${remaining.toFixed(2)} left. ` +
        'Nothing was translated -- a half-finished run would leave some pages in Turkish ' +
        'under a foreign hreflang.',
    );
  }
}
