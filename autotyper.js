/**
 * TypingClub AutoTyper
 * Automatically types for you on typingclub.com
 *
 * Usage:
 *   1. Go to typingclub.com and open a typing level
 *   2. Open your browser's Developer Console (F12 → Console)
 *   3. Paste this entire script and press ENTER
 */

// ─── Configuration ────────────────────────────────────────────────────────────

const minDelay = 60; // Minimum delay between keystrokes (ms)
const maxDelay = 60; // Maximum delay between keystrokes (ms)
// NOTE: Setting delay too low may cause the site to bug out and skip the results page.
// Recommended minimum: 60ms. For a more human-like feel, try minDelay=80, maxDelay=150.

// ─── Character Overrides ──────────────────────────────────────────────────────

const keyOverrides = {
  [String.fromCharCode(160)]: ' ', // convert non-breaking space to regular space
};

// ─── Core Finder ──────────────────────────────────────────────────────────────

/**
 * Finds the internal TypingClub API object that exposes record_keydown_time.
 * The site may store this under window.core or another key — this searches all of them.
 * @returns {object|null}
 */
function findCore() {
  if (window.core?.record_keydown_time) return window.core;
  for (const key of Object.keys(window)) {
    try {
      if (window[key]?.record_keydown_time) return window[key];
    } catch (e) {
      // skip non-accessible properties
    }
  }
  return null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Reads the target characters from the current lesson's DOM.
 * @returns {string[]}
 */
function getTargetCharacters() {
  const els = Array.from(document.querySelectorAll('.token span.token_unit'));

  if (els.length === 0) return [];

  return els
    .map((el) => {
      if (el.firstChild?.classList?.contains('_enter')) return '\n'; // ENTER key
      return el.textContent[0];
    })
    .map((c) => (keyOverrides.hasOwnProperty(c) ? keyOverrides[c] : c));
}

/**
 * Records a single keystroke via the TypingClub internal API.
 * @param {string} chr
 * @returns {boolean} false if core object was not found
 */
function recordKey(chr) {
  const core = findCore();
  if (!core) {
    console.error(
      '[AutoTyper] Could not find the TypingClub core object.\n' +
        'The site may have updated its internals. Please open a GitHub issue.'
    );
    return false;
  }
  core.record_keydown_time(chr);
  return true;
}

/**
 * Returns a promise that resolves after `ms` milliseconds.
 * @param {number} ms
 */
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

/**
 * Runs the autotyper for the current lesson.
 * @param {boolean} finish - If true, types the final character to trigger lesson completion.
 */
async function autoPlay(finish = true) {
  const chrs = getTargetCharacters();

  if (chrs.length === 0) {
    console.error(
      '[AutoTyper] No characters found.\n' +
        'Make sure you are inside an active typing lesson before running this script.'
    );
    return;
  }

  console.log(`[AutoTyper] Starting — ${chrs.length} characters to type.`);

  for (let i = 0; i < chrs.length - (!finish ? 1 : 0); i++) {
    const success = recordKey(chrs[i]);
    if (!success) return; // abort if core is missing
    await sleep(Math.random() * (maxDelay - minDelay) + minDelay);
  }

  console.log('[AutoTyper] Done!');
}

autoPlay(true);
