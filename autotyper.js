/**
 * TypingClub AutoTyper — AngularJS Scope Edition
 * 
 * Usage:
 *   1. Go to typingclub.com and open a typing level
 *   2. Open Console (F12)
 *   3. Paste and press ENTER
 */

const minDelay = 60;
const maxDelay = 100;

const keyOverrides = {
  [String.fromCharCode(160)]: ' ',
};

// ── Strategy 1: window.core (old, may still work on some versions) ────────────
function findCore() {
  if (window.core?.record_keydown_time) return window.core;
  for (const key of Object.keys(window)) {
    try {
      if (window[key]?.record_keydown_time) return window[key];
    } catch (e) {}
  }
  return null;
}

// ── Strategy 2: AngularJS scope (works when window.core is gone) ──────────────
function findAngularRecorder() {
  try {
    // TypingClub is an AngularJS app — find the scope on the main typing element
    const selectors = [
      '[ng-controller]',
      '.play-zone',
      '.typing-zone', 
      '#home-row',
      '[ng-app]',
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const scope = angular.element(el).scope();
      if (!scope) continue;
      // Search the scope for record_keydown_time
      if (scope.record_keydown_time) return (c) => scope.record_keydown_time(c);
      if (scope.core?.record_keydown_time) return (c) => scope.core.record_keydown_time(c);
      // Search one level deeper in scope properties
      for (const k of Object.keys(scope)) {
        if (k.startsWith('$')) continue;
        try {
          if (scope[k]?.record_keydown_time) return (c) => scope[k].record_keydown_time(c);
        } catch(e) {}
      }
    }
    // Fallback: scan ALL angular scopes on page
    const all = document.querySelectorAll('*');
    for (const el of all) {
      try {
        const scope = angular.element(el).scope();
        if (scope?.record_keydown_time) return (c) => scope.record_keydown_time(c);
      } catch(e) {}
    }
  } catch(e) {
    console.warn('[AutoTyper] Angular scope search failed:', e.message);
  }
  return null;
}

// ── Strategy 3: Scan ALL window objects recursively ───────────────────────────
function deepScanWindow() {
  const seen = new Set();
  function scan(obj, depth = 0) {
    if (depth > 3 || !obj || typeof obj !== 'object' || seen.has(obj)) return null;
    seen.add(obj);
    for (const key of Object.keys(obj)) {
      try {
        if (key === 'record_keydown_time' && typeof obj[key] === 'function') return obj;
        const result = scan(obj[key], depth + 1);
        if (result) return result;
      } catch(e) {}
    }
    return null;
  }
  const found = scan(window, 0);
  if (found) return (c) => found.record_keydown_time(c);
  return null;
}

function getRecorder() {
  // Try all strategies in order
  const core = findCore();
  if (core) {
    console.log('[AutoTyper] Using strategy: window.core');
    return (c) => core.record_keydown_time(c);
  }
  const angular = findAngularRecorder();
  if (angular) {
    console.log('[AutoTyper] Using strategy: AngularJS scope');
    return angular;
  }
  const deep = deepScanWindow();
  if (deep) {
    console.log('[AutoTyper] Using strategy: deep window scan');
    return deep;
  }
  return null;
}

function getTargetCharacters() {
  const els = Array.from(document.querySelectorAll('.token span.token_unit'));
  if (els.length === 0) return [];
  return els
    .map(el => {
      if (el.firstChild?.classList?.contains('_enter')) return '\n';
      return el.textContent[0];
    })
    .map(c => keyOverrides.hasOwnProperty(c) ? keyOverrides[c] : c);
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function autoPlay(finish = true) {
  const chrs = getTargetCharacters();
  if (chrs.length === 0) {
    console.error('[AutoTyper] No characters found. Open an active lesson first.');
    return;
  }

  const recorder = getRecorder();
  if (!recorder) {
    console.error(
      '[AutoTyper] Could not find any typing API.\n' +
      'Try running this first to inspect what\'s available:\n' +
      '  Object.keys(window).filter(k => { try { return window[k]?.record_keydown_time } catch(e){} })'
    );
    return;
  }

  console.log(`[AutoTyper] Starting — ${chrs.length} characters to type.`);
  for (let i = 0; i < chrs.length - (!finish ? 1 : 0); i++) {
    recorder(chrs[i]);
    await sleep(Math.random() * (maxDelay - minDelay) + minDelay);
  }
  console.log('[AutoTyper] Done!');
}

autoPlay(true);
