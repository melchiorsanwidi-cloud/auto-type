// Run this first and send me a photo of the output
console.log("=== WINDOW SCAN ===");
Object.keys(window).forEach(k => {
  try {
    const v = window[k];
    if (v && typeof v === 'object') {
      const keys = Object.keys(v);
      if (keys.some(x => x.includes('key') || x.includes('type') || x.includes('char') || x.includes('press') || x.includes('text'))) {
        console.log('CANDIDATE:', k, '->', keys.join(', '));
      }
    }
  } catch(e) {}
});
console.log("=== DONE ===");
