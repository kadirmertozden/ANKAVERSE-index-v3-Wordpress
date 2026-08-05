/**
 * Recognising a page that is still running a previous build.
 *
 * Every deploy publishes a fresh container: the asset filenames and the
 * `static-loader-data-manifest-<hash>.json` that vite-react-ssg fetches on the
 * client are all content-hashed, and the previous build's copies are gone. A
 * tab that was loaded before the deploy therefore asks for files that no
 * longer exist. nginx answers those with the HTML 404 page, and the two ways
 * the app consumes them both fail loudly:
 *
 *   - the manifest is handed to `.json()`, which throws
 *     `SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON`
 *   - a lazy route chunk is handed to `import()`, which throws
 *     `TypeError: Failed to fetch dynamically imported module: ...`
 *
 * React Router treats either as a loader failure and replaces the whole page
 * with its error screen. Neither is an application bug and neither can be
 * repaired in place -- the running build is simply out of date. Reloading
 * fetches the current HTML (which revalidates on every request) and with it
 * the current hashes, so the page heals itself.
 *
 * Kept free of browser and bundler dependencies so `tools/verify-stale-deploy.js`
 * can exercise it under plain node.
 */

/**
 * How long a reload attempt suppresses the next one.
 *
 * Long enough that a crash recurring immediately after a reload stops there --
 * if the manifest is genuinely missing from the deploy rather than merely
 * renamed, reloading would otherwise loop forever. Short enough that a second
 * deploy hours later still heals a tab that was left open.
 */
export const RELOAD_WINDOW_MS = 30_000;

export const RELOAD_KEY = 'ankaverse:stale-deploy-reload';

// V8 says "is not valid JSON", SpiderMonkey prefixes "JSON.parse:", JavaScriptCore
// names the offending token -- which for our 404 page is DOCTYPE. A truncated
// download ends up as "Unexpected end of JSON input".
const PARSE_FAILURE = /is not valid json|json\.parse|unexpected end of json input|doctype|unexpected token '</i;

const MODULE_LOAD_FAILURE = /dynamically imported module|importing a module script failed/i;

/**
 * @param {unknown} error - whatever `useRouteError` returned.
 * @returns {boolean} true when the failure means "this build is gone", not
 *   "this code is wrong". Thrown Responses, which React Router surfaces as
 *   plain objects, are never a stale deployment.
 */
export function isStaleDeploymentError(error) {
  if (!error || typeof error !== 'object') return false;

  const message = typeof error.message === 'string' ? error.message : '';
  if (!message) return false;

  if (error.name === 'SyntaxError') return PARSE_FAILURE.test(message);
  return MODULE_LOAD_FAILURE.test(message);
}

/**
 * Records a reload attempt and reports whether one should happen now.
 *
 * @param {{getItem: (k: string) => string | null, setItem: (k: string, v: string) => void} | null} storage
 *   Normally `sessionStorage`. Safari in private browsing throws on access, so
 *   failure to read or write is treated as "do not reload" rather than allowed
 *   to become a second error inside the error boundary.
 * @param {number} now
 */
export function shouldAttemptReload(storage, now = Date.now()) {
  if (!storage) return false;

  try {
    const previous = Number(storage.getItem(RELOAD_KEY));
    if (previous > 0 && now - previous < RELOAD_WINDOW_MS) return false;

    storage.setItem(RELOAD_KEY, String(now));
    return true;
  } catch {
    return false;
  }
}
