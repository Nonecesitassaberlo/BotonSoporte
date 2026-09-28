// Web Audio API notification sound generator
// Requires no external audio files, has 0ms latency and 100% offline reliability.

export function playAlertSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Melodic 3-tone notification chime (D5 -> A5 -> D6)
    const tones = [
      { freq: 587.33, start: 0, dur: 0.14, type: 'sine' as OscillatorType, vol: 0.3 },
      { freq: 880.00, start: 0.11, dur: 0.16, type: 'sine' as OscillatorType, vol: 0.35 },
      { freq: 1174.66, start: 0.24, dur: 0.45, type: 'triangle' as OscillatorType, vol: 0.4 }
    ];

    tones.forEach(({ freq, start, dur, type, vol }) => {
      const startTime = ctx.currentTime + start;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      // Smooth attack and natural fade-out
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(vol, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + dur);
    });
  } catch (err) {
    console.warn('No se pudo reproducir el sonido de alerta:', err);
  }
}
