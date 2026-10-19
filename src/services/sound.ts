// Web Audio API cinematic Netflix-style "Ta-dum" synth sound

let audioCtx: AudioContext | null = null;

export function playNetflixSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // 1. Deep sub bass hit (impact)
    const subOsc = audioCtx.createOscillator();
    const subGain = audioCtx.createGain();

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(80, now);
    subOsc.frequency.exponentialRampToValueAtTime(35, now + 1.2);

    subGain.gain.setValueAtTime(0.001, now);
    subGain.gain.exponentialRampToValueAtTime(0.4, now + 0.05);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

    subOsc.connect(subGain);
    subGain.connect(audioCtx.destination);

    subOsc.start(now);
    subOsc.stop(now + 1.6);

    // 2. Iconic double-beat chord ("Ta" ... "Dum")
    // Beat 1: "Ta" at t=0.08
    const taOsc = audioCtx.createOscillator();
    const taGain = audioCtx.createGain();
    taOsc.type = 'triangle';
    taOsc.frequency.setValueAtTime(110, now + 0.06);
    taGain.gain.setValueAtTime(0.001, now + 0.06);
    taGain.gain.linearRampToValueAtTime(0.3, now + 0.09);
    taGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    taOsc.connect(taGain);
    taGain.connect(audioCtx.destination);
    taOsc.start(now + 0.06);
    taOsc.stop(now + 0.45);

    // Beat 2: "Dum" at t=0.25 (deep, resonant, cinematic swell)
    const dumOsc = audioCtx.createOscillator();
    const dumGain = audioCtx.createGain();
    dumOsc.type = 'sawtooth';
    dumOsc.frequency.setValueAtTime(65, now + 0.22);
    dumOsc.frequency.exponentialRampToValueAtTime(50, now + 1.8);

    // Filter to warm it up
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now + 0.22);
    filter.frequency.exponentialRampToValueAtTime(120, now + 1.8);

    dumGain.gain.setValueAtTime(0.001, now + 0.22);
    dumGain.gain.linearRampToValueAtTime(0.35, now + 0.28);
    dumGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

    dumOsc.connect(filter);
    filter.connect(dumGain);
    dumGain.connect(audioCtx.destination);

    dumOsc.start(now + 0.22);
    dumOsc.stop(now + 2.1);
  } catch (e) {
    // Audio autoplay restrictions or unsupported
    console.debug('Audio play not allowed or not ready yet:', e);
  }
}
