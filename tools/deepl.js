/**
 * Minimal DeepL client shared by the translation scripts.
 *
 * Runs in GitHub Actions, never in the Coolify build: the build container is
 * ephemeral, so translating there would redo all 70 posts on every deploy and
 * exhaust the free quota within a few pushes.
 */
const FREE_ENDPOINT = 'https://api-free.deepl.com/v2';
const PRO_ENDPOINT = 'https://api.deepl.com/v2';

/** DeepL target codes. Locale codes on our side stay lowercase and short. */
export const DEEPL_TARGETS = {
  en: 'EN-US',
  de: 'DE',
  fr: 'FR',
  es: 'ES',
  ar: 'AR',
  tr: 'TR',
};

/** Names that must survive translation verbatim. */
const PROTECTED_TERMS = [
  'ANKAVERSE',
  'Ankaverse',
  'Vaktia',
  'ANKAVERSE Nexus',
  'ANKAVERSE Hub',
  'Suguya',
];

const MAX_TEXTS_PER_REQUEST = 50;

export class DeepLError extends Error {}

function endpointFor(key) {
  // DeepL free keys end in ":fx"; pro keys do not.
  return key.trim().endsWith(':fx') ? FREE_ENDPOINT : PRO_ENDPOINT;
}

export function createClient(apiKey = process.env.DEEPL_API_KEY) {
  if (!apiKey) {
    throw new DeepLError('DEEPL_API_KEY is not set (GitHub Secrets, or .env for local runs)');
  }

  const base = endpointFor(apiKey);
  const auth = { Authorization: `DeepL-Auth-Key ${apiKey.trim()}` };

  async function call(path, body) {
    // Content-Type is set only when there is a body: DeepL rejects a bodyless
    // GET that declares application/json with "a non-empty request body is
    // required".
    const response = await fetch(`${base}${path}`, {
      method: body ? 'POST' : 'GET',
      headers: body ? { ...auth, 'Content-Type': 'application/json' } : auth,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new DeepLError(`DeepL ${path} failed: ${response.status} ${response.statusText} ${detail}`);
    }
    return response.json();
  }

  return {
    usage: () => call('/usage'),
    targetLanguages: () => call('/languages?type=target'),

    async translate(texts, targetLang, { html = false, sourceLang = 'TR' } = {}) {
      if (texts.length === 0) return [];

      const results = [];
      for (let offset = 0; offset < texts.length; offset += MAX_TEXTS_PER_REQUEST) {
        const batch = texts.slice(offset, offset + MAX_TEXTS_PER_REQUEST);
        const data = await call('/translate', {
          text: batch,
          source_lang: sourceLang,
          target_lang: targetLang,
          preserve_formatting: true,
          ...(html ? { tag_handling: 'html' } : {}),
        });
        results.push(...data.translations.map((item) => item.text));
      }
      return results;
    },
  };
}

/**
 * Restore brand names DeepL may have transliterated or case-folded.
 * Cheaper and safer than wrapping every occurrence in translate="no" markup,
 * which would leak span tags into plain-text fields.
 */
export function restoreProtectedTerms(translated, source) {
  let result = translated;
  for (const term of PROTECTED_TERMS) {
    if (!source.includes(term)) continue;
    const pattern = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    result = result.replace(pattern, term);
  }
  return result;
}

/** Characters DeepL will bill for a set of strings. */
export const countCharacters = (texts) => texts.reduce((total, text) => total + text.length, 0);

/**
 * Fails loudly when a locale is not supported rather than letting the caller
 * write Turkish text into a file that then gets served under a foreign
 * hreflang -- the quietest and most damaging failure in this pipeline.
 */
export async function assertTargetsSupported(client, locales) {
  const supported = new Set((await client.targetLanguages()).map((lang) => lang.language.toUpperCase()));

  const missing = locales.filter((locale) => {
    const target = DEEPL_TARGETS[locale];
    if (!target) return true;
    return !supported.has(target) && !supported.has(target.split('-')[0]);
  });

  if (missing.length > 0) {
    throw new DeepLError(
      `DeepL does not support: ${missing.join(', ')}. Supported: ${[...supported].sort().join(', ')}`,
    );
  }
}

/** Stops before spending anything when the remaining quota cannot cover the job. */
export async function assertQuota(client, requiredCharacters) {
  const usage = await client.usage();
  const used = usage.character_count ?? 0;
  const limit = usage.character_limit ?? Infinity;
  const remaining = limit - used;

  console.log(
    `DeepL quota: ${used.toLocaleString('en-US')} / ${limit.toLocaleString('en-US')} used, ` +
      `${remaining.toLocaleString('en-US')} left; this run needs ${requiredCharacters.toLocaleString('en-US')}`,
  );

  if (requiredCharacters > remaining) {
    throw new DeepLError(
      `Not enough quota: need ${requiredCharacters.toLocaleString('en-US')}, ` +
        `${remaining.toLocaleString('en-US')} left. Nothing was translated -- a half-finished ` +
        'run would leave some pages in Turkish under a foreign hreflang.',
    );
  }
}
