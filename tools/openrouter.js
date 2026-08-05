/**
 * OpenRouter client for the translation scripts.
 *
 * Runs in GitHub Actions, never in the Coolify build: the build container is
 * ephemeral, so translating there would redo the whole archive on every deploy.
 * The key must not be added to Coolify -- there is no reason for it to reach
 * the VPS at all.
 */
import {
  TranslationError,
  assertHtmlIntact,
  assertTranslated,
  countCharacters,
  orderedBatch,
  restoreProtectedTerms,
} from './translation-guards.js';

export { countCharacters, restoreProtectedTerms, TranslationError };

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

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

function systemPrompt(languageName, html) {
  return [
    `You are a professional translator. Translate from Turkish into ${languageName}.`,
    '',
    'Rules:',
    '- Return ONLY a JSON object whose keys are the same index strings you were given.',
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

  return {
    model,
    models: () => call('/models'),
    credits: () => call('/credits'),

    async translate(texts, targetLocale, { html = false, label = targetLocale } = {}) {
      if (texts.length === 0) return [];

      const languageName = TARGET_LANGUAGES[targetLocale];
      if (!languageName) {
        throw new TranslationError(`No language name configured for locale "${targetLocale}".`);
      }

      const results = [];
      for (let offset = 0; offset < texts.length; offset += MAX_TEXTS_PER_REQUEST) {
        const batch = texts.slice(offset, offset + MAX_TEXTS_PER_REQUEST);
        const payload = Object.fromEntries(batch.map((text, index) => [String(index), text]));

        const data = await call('/chat/completions', {
          model,
          temperature: 0,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt(languageName, html) },
            { role: 'user', content: JSON.stringify(payload) },
          ],
        });

        const content = data?.choices?.[0]?.message?.content;
        if (typeof content !== 'string') {
          throw new TranslationError(`OpenRouter returned no message content for ${label}.`);
        }

        let parsed;
        try {
          parsed = JSON.parse(content);
        } catch {
          throw new TranslationError(
            `OpenRouter returned content that is not JSON for ${label}: ${content.slice(0, 200)}`,
          );
        }

        const translated = orderedBatch(batch, parsed);
        translated.forEach((value, index) => {
          const itemLabel = `${label}[${offset + index}]`;
          assertTranslated(batch[index], value, itemLabel);
          if (html) assertHtmlIntact(batch[index], value, itemLabel);
        });

        results.push(...translated);
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

/**
 * Replaces DeepL's quota check, and exists for the same reason: a run that
 * stops halfway leaves some pages translated and some Turkish under a foreign
 * hreflang. Pay-as-you-go makes this worse than a monthly quota -- DeepL simply
 * stopped, whereas here the balance drains until it runs out mid-job.
 *
 * Characters are converted to a rough token estimate, then to a rough cost. The
 * numbers are deliberately pessimistic: the point is to refuse to start a run
 * that plainly cannot finish, not to bill accurately.
 */
const CHARS_PER_TOKEN = 3;
const USD_PER_MILLION_TOKENS_ASSUMED = 15;

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
  // Output roughly matches input in length for translation, hence the doubling.
  const tokens = (estimatedCharacters / CHARS_PER_TOKEN) * 2;
  const estimate = (tokens / 1_000_000) * USD_PER_MILLION_TOKENS_ASSUMED;

  console.log(
    `OpenRouter credits: $${remaining.toFixed(2)} left; ` +
      `this run is estimated at $${estimate.toFixed(2)} ` +
      `(${estimatedCharacters.toLocaleString('en-US')} characters, model ${client.model})`,
  );

  if (estimate > remaining) {
    throw new TranslationError(
      `Not enough credit: estimated $${estimate.toFixed(2)}, $${remaining.toFixed(2)} left. ` +
        'Nothing was translated -- a half-finished run would leave some pages in Turkish ' +
        'under a foreign hreflang.',
    );
  }
}
