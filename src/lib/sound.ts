// Advanced Sound Alert & Tab Keep-Alive Manager for TI Support Panel
// Solves browser tab throttling, suspended AudioContexts, and autoplay restrictions in background tabs.

let sharedAudioCtx: AudioContext | null = null;
let keepAliveAudio: HTMLAudioElement | null = null;
let keepAliveInterval: any = null;

// Base64 silent 1-second MP3 to keep the browser tab awake and audio context authorized
// This prevents Chrome/Edge from putting the tab or Firestore WebSockets to sleep!
const SILENT_AUDIO_BASE64 = 'data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAACcQCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA//sQxAAMAAAABAAAAEAAAAAAAAP/7kMQAAAAYAAAABAAAAP/7kMQAAAAYAAAABAAAA';

export function getAudioContext(): AudioContext | null {
  if (!sharedAudioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      sharedAudioCtx = new AudioContextClass();
    }
  }
  return sharedAudioCtx;
}

// Unlocks AudioContext upon first user interaction (click anywhere on the panel)
export function unlockAudio() {
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch((err) => console.warn('AudioContext resume error:', err));
    }

    // Start background keep-alive audio so Chrome NEVER sleeps the tab
    startBackgroundKeepAlive();
  } catch (e) {
    console.warn('Error unlocking audio:', e);
  }
}

// Keeps the tab awake in background using an inaudible loop
export function startBackgroundKeepAlive() {
  if (keepAliveAudio) return; // already active

  try {
    keepAliveAudio = new Audio(SILENT_AUDIO_BASE64);
    keepAliveAudio.loop = true;
    keepAliveAudio.volume = 0.01;
    keepAliveAudio.play().catch(() => {
      // If blocked, wait for user gesture
    });

    // Also run an interval to keep AudioContext active
    if (!keepAliveInterval) {
      keepAliveInterval = setInterval(() => {
        if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
          sharedAudioCtx.resume().catch(() => {});
        }
      }, 15000);
    }
  } catch (e) {
    console.warn('Keep-alive audio error:', e);
  }
}

export function playAlertSound() {
  try {
    // 1. Ensure audio context is ready
    unlockAudio();

    // 2. Check if user uploaded a custom audio in localStorage
    const customAudioData = localStorage.getItem('ti_custom_alert_audio');
    if (customAudioData) {
      const audio = new Audio(customAudioData);
      audio.volume = 1.0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Error al reproducir audio personalizado en segundo plano:', err);
          playFallbackAudioFile();
        });
      }
      return;
    }

    // 3. Try loading /alerta.mp3 from public folder
    playFallbackAudioFile();
  } catch (err) {
    console.warn('Error en playAlertSound:', err);
    playSynthesizedChime();
  }
}

function playFallbackAudioFile() {
  const audio = new Audio('/alerta.mp3');
  audio.volume = 1.0;
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      // If /alerta.mp3 does not exist (404) or cannot play in background, use Web Audio API chime
      playSynthesizedChime();
    });
  } else {
    playSynthesizedChime();
  }
}

export function playSynthesizedChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    // Melodic 3-tone notification chime (D5 -> A5 -> D6)
    const tones = [
      { freq: 587.33, start: 0, dur: 0.18, type: 'sine' as OscillatorType, vol: 0.4 },
      { freq: 880.00, start: 0.13, dur: 0.20, type: 'sine' as OscillatorType, vol: 0.45 },
      { freq: 1174.66, start: 0.28, dur: 0.55, type: 'triangle' as OscillatorType, vol: 0.5 }
    ];

    tones.forEach(({ freq, start, dur, type, vol }) => {
      const startTime = ctx.currentTime + start;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(vol, startTime + 0.03);
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
        reject(new Error('El archivo de audio es muy pesado para el almacenamiento local. Te recomendamos usar un MP3 de menos de 2MB.'));
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
