// Sound alert manager for TI Support Panel
// Prioritizes custom uploaded audio -> /alerta.mp3 in public folder -> Web Audio API chime fallback.

export function playAlertSound() {
  try {
    // 1. Check if user uploaded a custom audio in local storage
    const customAudioData = localStorage.getItem('ti_custom_alert_audio');
    if (customAudioData) {
      const audio = new Audio(customAudioData);
      audio.play().catch((err) => {
        console.warn('Error al reproducir audio personalizado:', err);
        playFallbackAudioFile();
      });
      return;
    }

    // 2. Try loading /alerta.mp3 from public folder
    playFallbackAudioFile();
  } catch (err) {
    console.warn('Error en playAlertSound:', err);
    playSynthesizedChime();
  }
}

function playFallbackAudioFile() {
  const audio = new Audio('/alerta.mp3');
  audio.play()
    .catch(() => {
      // If /alerta.mp3 does not exist (404) or cannot play, fallback to synthesized chime
      playSynthesizedChime();
    });
}

export function playSynthesizedChime() {
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

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(vol, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + dur);
    });
  } catch (err) {
    console.warn('No se pudo reproducir el sonido sintetizado:', err);
  }
}

export function saveCustomAlertAudio(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      try {
        localStorage.setItem('ti_custom_alert_audio', dataUrl);
        localStorage.setItem('ti_custom_alert_name', file.name);
        resolve(dataUrl);
      } catch (err) {
        reject(new Error('El archivo de audio es muy pesado para el almacenamiento local. Te recomendamos usar un MP3 corto (menos de 2MB).'));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo de audio'));
    reader.readAsDataURL(file);
  });
}

export function removeCustomAlertAudio() {
  localStorage.removeItem('ti_custom_alert_audio');
  localStorage.removeItem('ti_custom_alert_name');
}
