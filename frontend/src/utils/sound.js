// Web Audio API Harmonic Success Chime Generator
export const playSuccessSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Harmonic pleasant chord (C5 -> E5 -> G5 -> C6)
    const notes = [
      { freq: 523.25, time: 0, duration: 0.14 },    // C5
      { freq: 659.25, time: 0.09, duration: 0.16 },  // E5
      { freq: 783.99, time: 0.18, duration: 0.20 },  // G5
      { freq: 1046.50, time: 0.28, duration: 0.40 }  // C6 (bright bell resolution)
    ];

    notes.forEach(note => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle'; // Smooth, warm chime tone
      osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.time);

      gain.gain.setValueAtTime(0, ctx.currentTime + note.time);
      gain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + note.time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + note.time + note.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + note.time);
      osc.stop(ctx.currentTime + note.time + note.duration + 0.05);
    });
  } catch (e) {
    console.warn("Audio playback not permitted yet:", e);
  }
};
