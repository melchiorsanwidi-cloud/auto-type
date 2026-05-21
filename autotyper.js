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

const minDelay = 60;
const maxDelay = 60;
// NOTE: Setting delay too low may cause the site to skip the results page.
// For a more human-like feel, try minDelay=80, maxDelay=150.

// ─── Character Overrides ──────────────────────────────────────────────────────

const keyOverrides = {
  [String.fromCharCode(160)]: ' ', // convert non-breaking space to regular space
};

// ─── Core Finder ──────────────────────────────────────────────────────────────

/**
 * Tries to find the internal TypingClub API object.
 * Returns null if the site has changed its internals (common after updates).
 */
function findCore() {
  if (window.core?.record_keydown_time) return window.core;
  for (const key of Object.keys(window)) {
    try {
      if (window[key]?.record_keydown_time) return window[key];
    } catch (e) {}
  }
  return null;
}

// ─── Fallback: DOM Event Simulation ──────────────────────────────────────────

/**
 * Finds the active typing input element on the page.
 */
function getTypingTarget() {
  // TypingClub listens for keydown on the document or a specific input
  return document.querySelector('.typing-input, #typing-input, [data-typing]') 
    || document.activeElement 
    || document.body;
}

/**
 * Dispatches a real keydown + keypress + keyup sequence on the page.
 * This is the fallback when window.core is unavailable.
 */
function simulateKeyEvent(chr) {
  const target = getTypingTarget();
  const keyCode = chr.charCodeAt(0);

  ['keydown', 'keypress', 'keyup'].forEach(type => {
    const event = new KeyboardEvent(type, {
      bubbles: true,
      cancelable: true,
      key: chr === '\n' ? 'Enter' : chr,
      code: chr === '\n' ? 'Enter' : `Key${chr.toUpperCase()}`,
      keyCode: chr === '\n' ? 13 : keyCode,
      which: chr === '\n' ? 13 : keyCode,
      charCode: type === 'keypress' ? (chr === '\n' ? 13 : keyCode) : 0,
    });
    target.dispatchEvent(event);
  });

  // Also fire an input event in case the site listens for it
  if (chr !== '\n') {
    target.dispatchEvent(new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      data: chr,
      inputType: 'insertText',
    }));
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTargetCharacters() {
  const els = Array.from(document.querySelectorAll('.token span.token_unit'));
  if (els.length === 0) return [];
  return els
    .map(el => {
      if (el.firstChild?.classList?.contains('_enter')) return '\n';
      return el.textContent[0];
    })
    .map(c => (keyOverrides.hasOwnProperty(c) ? keyOverrides[c] : c));
}

function recordKey(chr) {
  const core = findCore();
  if (core) {
    // Use internal API if available (fastest and most reliable)
    core.record_keydown_time(chr);
  } else {
    // Fallback: simulate real DOM keyboard events
    simulateKeyEvent(chr);
  }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function autoPlay(finish = true) {
  const chrs = getTargetCharacters();

  if (chrs.length === 0) {
    console.error(
      '[AutoTyper] No characters found.\n' +
      'Make sure you are inside an active typing lesson before running this script.'
    );
    return;
  }

  const method = findCore() ? 'internal API' : 'DOM event simulation (fallback)';
  console.log(`[AutoTyper] Starting — ${chrs.length} characters to type. Method: ${method}`);

  for (let i = 0; i < chrs.length - (!finish ? 1 : 0); i++) {
    recordKey(chrs[i]);
    await sleep(Math.random() * (maxDelay - minDelay) + minDelay);
  }

  console.log('[AutoTyper] Done!');
}

autoPlay(true);
