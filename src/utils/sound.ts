/**
 * Synthesized Web Audio API sound effects for MI6 intelligence archive.
 * Zero external audio files required. Completely self-contained, low-key, professional.
 */

let audioCtx: AudioContext | null = null;
let ambientOsc: OscillatorNode | null = null;
let ambientGain: GainNode | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export const soundManager = {
  isEnabled: false,
  isAmbientEnabled: false,

  init() {
    const saved = localStorage.getItem("mi6_sound_enabled");
    this.isEnabled = saved === "true";
  },

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    localStorage.setItem("mi6_sound_enabled", String(enabled));
  },

  isMuted() {
    return !this.isEnabled;
  },

  toggleMute() {
    return !this.toggleSound();
  },

  playClick() {
    this.playKeyClick();
  },

  playPaperRustle() {
    this.playDossierOpen();
  },

  playTeletype() {
    this.playKeyClick();
  },

  playAccessGranted() {
    this.playChirp();
  },

  playAlarm() {
    this.playWarning();
  },

  toggleSound(): boolean {
    this.isEnabled = !this.isEnabled;
    localStorage.setItem("mi6_sound_enabled", String(this.isEnabled));
    if (!this.isEnabled && this.isAmbientEnabled) {
      this.stopAmbient();
    } else if (this.isEnabled) {
      this.playChirp();
    }
    return this.isEnabled;
  },

  playKeyClick() {
    if (!this.isEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(800 + Math.random() * 400, ctx.currentTime);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.045);
    } catch {
      // Ignore audio failure
    }
  },

  playDossierOpen() {
    if (!this.isEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      // White noise buffer for paper slide
      const bufferSize = ctx.sampleRate * 0.12;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1400, ctx.currentTime);
      filter.Q.setValueAtTime(1.2, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch {
      // Ignore
    }
  },

  playChirp() {
    if (!this.isEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1320, now + 0.06);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Ignore
    }
  },

  playWarning() {
    if (!this.isEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(260, now + 0.2);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } catch {
      // Ignore
    }
  },

  toggleAmbient(): boolean {
    if (!this.isEnabled) return false;
    if (this.isAmbientEnabled) {
      this.stopAmbient();
      return false;
    } else {
      this.startAmbient();
      return true;
    }
  },

  startAmbient() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      this.stopAmbient();

      ambientOsc = ctx.createOscillator();
      ambientGain = ctx.createGain();

      ambientOsc.type = "sine";
      ambientOsc.frequency.setValueAtTime(65, ctx.currentTime);

      ambientGain.gain.setValueAtTime(0.008, ctx.currentTime);

      ambientOsc.connect(ambientGain);
      ambientGain.connect(ctx.destination);
      ambientOsc.start();
      this.isAmbientEnabled = true;
    } catch {
      // Ignore
    }
  },

  stopAmbient() {
    if (ambientOsc) {
      try {
        ambientOsc.stop();
        ambientOsc.disconnect();
      } catch {}
      ambientOsc = null;
    }
    this.isAmbientEnabled = false;
  },
};
