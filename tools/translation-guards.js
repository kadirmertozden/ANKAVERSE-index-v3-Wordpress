/**
 * Validators for LLM translation output.
 *
 * Kept free of network and filesystem access so tools/verify-translation.js can
 * exercise every branch under plain node. The client in openrouter.js calls
 * these on every response.
 *
 * All of them throw. None of them repair: a response that failed a check is
 * evidence the model misunderstood the job, and writing a patched version of it
 * would put text on the site that nobody has seen.
 */
export class TranslationError extends Error {}

/**
 * Names that must survive translation verbatim.
 *
 * Longest first: restoreProtectedTerms rewrites in order, and "ANKAVERSE"
 * would otherwise consume the first word of "ANKAVERSE Nexus" and leave the
 * rest to be matched on its own.
 */
export const PROTECTED_TERMS = [
  'ANKAVERSE Nexus',
  'ANKAVERSE Hub',
  'ANKAVERSE',
  'Ankaverse',
  'Vaktia',
  'Suguya',
];

/**
 * Below this length an identical translation is normal rather than suspicious:
 * "Blog", "Demo" and "CTA" are the same word in most of our target languages.
 * Trap 8 in the postmortem was a validator whose false positives hid real
 * errors, so the threshold errs towards silence on short strings.
 */
export const UNTRANSLATED_MIN_LENGTH = 20;

/**
 * Turn the model's keyed response back into an ordered array.
 *
 * The request numbers each string and the reply is required to use the same
 * keys. Anything else -- a dropped item, an invented one, a blank value --
 * means the batch cannot be trusted as a whole, because there is no way to tell
 * which translation belongs to which source.
 */
export function orderedBatch(sent, received) {
  if (received === null || typeof received !== 'object' || Array.isArray(received)) {
    throw new TranslationError(
      `Model returned ${Array.isArray(received) ? 'an array' : typeof received}, ` +
        'expected a JSON object keyed by index.',
    );
  }

  const keys = Object.keys(received);
  if (keys.length !== sent.length) {
    throw new TranslationError(
      `Model returned ${keys.length} translations for ${sent.length} strings.`,
    );
  }

  return sent.map((_, index) => {
    const value = received[String(index)];
    if (typeof value !== 'string') {
      throw new TranslationError(`Model returned no string at index ${index}.`);
    }
    if (value.trim() === '') {
      throw new TranslationError(`Model returned an empty string at index ${index}.`);
    }
    return value;
  });
}

/** True when the string is nothing but brand names and punctuation. */
function isOnlyProtectedTerms(text) {
  let remainder = text;
  for (const term of PROTECTED_TERMS) {
    remainder = remainder.split(term).join(' ');
  }
  return remainder.trim().replace(/[\s\p{P}]/gu, '') === '';
}

/**
 * The cardinal sin: Turkish text written into a locale file and then served
 * under that locale's hreflang, telling Google the site misdescribes itself.
 */
export function assertTranslated(source, translated, label) {
  if (source.trim() !== translated.trim()) return;
  if (source.trim().length < UNTRANSLATED_MIN_LENGTH) return;
  if (isOnlyProtectedTerms(source)) return;

  throw new TranslationError(
    `Model returned the source text unchanged for ${label}: ${JSON.stringify(source.slice(0, 80))}`,
  );
}

/** Tag names in document order, closing tags marked with a leading slash. */
export function tagSequence(html) {
  return [...html.matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g)].map(
    (match) => `${match[1]}${match[2].toLowerCase()}`,
  );
}

/**
 * Blog and project bodies are HTML. A model that drops a closing tag or wraps
 * the text in an extra element produces markup that renders wrong on one page
 * in one language -- exactly the kind of fault nobody goes looking for.
 */
export function assertHtmlIntact(source, translated, label) {
  const before = tagSequence(source).join(',');
  const after = tagSequence(translated).join(',');
  if (before === after) return;

  throw new TranslationError(
    `Model changed the HTML structure of ${label}.\n` +
      `  source:     ${before}\n  translated: ${after}`,
  );
}

/**
 * Restore brand names the model transliterated or case-folded. Cheaper and
 * safer than wrapping every occurrence in markup, which would leak tags into
 * plain-text fields.
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

/** Characters in a set of strings, used for cost estimation. */
export const countCharacters = (texts) => texts.reduce((total, text) => total + text.length, 0);

/**
 * Roughly how many characters of Turkish or a European language fit in a token.
 * Deliberately low, so the estimate leans expensive.
 */
const CHARS_PER_TOKEN = 3;

/**
 * What a run will cost, from the model's own advertised price.
 *
 * OpenRouter reports prices as USD per token, as decimal strings. Reading them
 * rather than assuming a rate matters: the cheap and the expensive model here
 * are a factor of twenty-five apart on output, so a single assumed rate either
 * waves through a run that empties the balance or blocks one that costs cents.
 *
 * A translation comes back at roughly the length it went in, so output tokens
 * are estimated at the same count as input.
 */
export function estimateCostUsd(characters, pricing) {
  const prompt = Number(pricing?.prompt);
  const completion = Number(pricing?.completion);

  if (!Number.isFinite(prompt) || !Number.isFinite(completion)) {
    throw new TranslationError(
      `Could not read the model price: ${JSON.stringify(pricing)}. ` +
        'Refusing to estimate, because a price read as zero would let the budget ' +
        'check pass on any run.',
    );
  }

  const tokens = characters / CHARS_PER_TOKEN;
  return tokens * prompt + tokens * completion;
}
