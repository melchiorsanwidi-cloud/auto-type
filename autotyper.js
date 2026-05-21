/**
 * TypingClub / EDClub AutoTyper
 * 
 * Usage:
 *   1. Open a typing lesson (URL should contain .edclub.com or typingclub.com)
 *   2. Open Console (F12 → Console)
 *   3. Paste this and press ENTER
 */

// ── Config ────────────────────────────────────────────────────────────────────
const WPM = 80; // Words per minute — keep under 150 to avoid detection
// ─────────────────────────────────────────────────────────────────────────────

const msPerKeystroke = 12000 / WPM;

function waitForCore(timeout = 10000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      // NEW API: bound_keypress_handler + cur_char
      if (typeof core !== 'undefined' && typeof core.bound_keypress_handler === 'function') {
        console.log('[AutoTyper] Found core.bound_keypress_handler ✓');
        resolve('bound_keypress_handler');
        return;
      }
      // OLD API fallback: record_keydown_time
      if (typeof core !== 'undefined' && typeof core.record_keydown_time === 'function') {
        console.log('[AutoTyper] Found core.record_keydown_time ✓');
        resolve('record_keydown_time');
        return;
      }
      if (Date.now() - start > timeout) {
        reject(new Error('core object not found after ' + timeout + 'ms'));
        return;
      }
      setTimeout(check, 200);
    };
    check();
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function autoPlay() {
  let apiType;
  try {
    apiType = await waitForCore();
  } catch (e) {
    console.error('[AutoTyper] ERROR:', e.message);
    console.error('[AutoTyper] Make sure you are inside an active lesson.');
    return;
  }

  if (apiType === 'bound_keypress_handler') {
    // ── NEW API ──────────────────────────────────────────────────────────────
    // Uses core.cur_char (current expected character) and core.text (full text)
    const totalChars = core.text.length;
    console.log(`[AutoTyper] Starting — ${totalChars} characters at ${WPM} WPM`);

    let lastIndex = -1;
    let typed = 0;

    const interval = setInterval(() => {
      if (typed >= totalChars) {
        clearInterval(interval);
        console.log('[AutoTyper] Done!');
        return;
      }
      // Only advance if the game acknowledged the last keystroke
      if (lastIndex !== core.cur_char_index) {
        lastIndex = core.cur_char_index;
        typed++;
      }
      try {
        core.bound_keypress_handler({ key: core.cur_char.chr });
      } catch(e) {
        clearInterval(interval);
        console.error('[AutoTyper] Stopped:', e.message);
      }
    }, msPerKeystroke);

  } else {
    // ── OLD API fallback ─────────────────────────────────────────────────────
    const keyOverrides = { [String.fromCharCode(160)]: ' ' };
    const els = Array.from(document.querySelectorAll('.token span.token_unit'));
    const chrs = els
      .map(el => el.firstChild?.classList?.contains('_enter') ? '\n' : el.textContent[0])
      .map(c => keyOverrides[c] ?? c);

    if (chrs.length === 0) {
      console.error('[AutoTyper] No characters found in DOM.');
      return;
    }

    console.log(`[AutoTyper] Starting (old API) — ${chrs.length} characters`);
    for (let i = 0; i < chrs.length; i++) {
      core.record_keydown_time(chrs[i]);
      await sleep(msPerKeystroke);
    }
    console.log('[AutoTyper] Done!');
  }
}

autoPlay();
