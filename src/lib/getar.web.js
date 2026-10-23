// Web: getar lewat navigator.vibrate bila ada (Android Chrome), bunyi pendek lewat Web Audio (opsional).
export function getar(jenis = 'sukses') {
  try {
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; // peramban memblokir getar sebelum ada ketukan
    navigator.vibrate?.(jenis === 'sukses' ? 60 : [120, 70, 120]);
  } catch { /* tidak didukung */ }
}

let ctx = null;
export function bunyi(jenis = 'sukses') {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    const nada = jenis === 'sukses' ? [880, 1320] : [330, 220];
    nada.forEach((f, i) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = 'square'; o.frequency.value = f;
      const t = ctx.currentTime + i * 0.12;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.08, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
      o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 0.12);
    });
  } catch { /* tanpa bunyi */ }
}
