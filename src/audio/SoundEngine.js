/**
 * SoundEngine.js — Web Audio API synthesized sound system
 * All sounds are generated programmatically. No external files needed.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.ambientNodes = [];
    this.isInitialized = false;
    this.isMuted = false;
    this._volume = 0.5;
  }

  init() {
    if (this.isInitialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this._volume;
      this.masterGain.connect(this.ctx.destination);
      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API not available:', e);
    }
  }

  ensureContext() {
    if (!this.isInitialized) this.init();
    if (this.ctx?.state === 'suspended') this.ctx.resume();
    return this.isInitialized;
  }

  get volume() { return this._volume; }
  set volume(v) {
    this._volume = Math.max(0, Math.min(1, v));
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this._volume, this.ctx.currentTime);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(
        this.isMuted ? 0 : this._volume,
        this.ctx.currentTime
      );
    }
    return this.isMuted;
  }

  // ─── UTILITY ─────────────────────────────────────────

  _createNoise(duration, type = 'white') {
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    if (type === 'white') {
      for (let i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    } else if (type === 'brown') {
      let last = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (last + 0.02 * white) / 1.02;
        last = data[i];
        data[i] *= 3.5;
      }
    }
    return buffer;
  }

  _playTone(freq, duration, type = 'sine', gainVal = 0.1, delay = 0) {
    if (!this.ensureContext()) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(gainVal, t + 0.01);
    gain.gain.linearRampToValueAtTime(gainVal, t + duration - 0.02);
    gain.gain.linearRampToValueAtTime(0, t + duration);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + duration);
  }

  // ─── GAME SOUNDS ─────────────────────────────────────

  /** Mechanical typewriter key click */
  keyClick() {
    if (!this.ensureContext()) return;
    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.03;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 3000 + Math.random() * 2000;
    filter.Q.value = 5;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08 + Math.random() * 0.04, t);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start(t);
  }

  /** Radio static burst when sending a transmission */
  transmitSend() {
    if (!this.ensureContext()) return;
    const t = this.ctx.currentTime;

    // Static burst
    const noise = this._createNoise(0.3);
    const src = this.ctx.createBufferSource();
    src.buffer = noise;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.15, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2000;
    filter.Q.value = 1;
    src.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    src.start(t);

    // Morse-like beeps
    const morseFreq = 800;
    const pattern = [0.05, 0.03, 0.05, 0.03, 0.12]; // dit dit dit dit dah
    let offset = 0.05;
    pattern.forEach(dur => {
      this._playTone(morseFreq, dur, 'sine', 0.06, offset);
      offset += dur + 0.04;
    });
  }

  /** Scramble sound while waiting for AI response */
  startReceiving() {
    if (!this.ensureContext()) return;
    const t = this.ctx.currentTime;
    const duration = 2;

    const noise = this._createNoise(duration);
    const src = this.ctx.createBufferSource();
    src.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, t);
    filter.frequency.linearRampToValueAtTime(2000, t + duration * 0.5);
    filter.frequency.linearRampToValueAtTime(800, t + duration);
    filter.Q.value = 3;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.04, t);
    gain.gain.linearRampToValueAtTime(0.08, t + duration * 0.3);
    gain.gain.linearRampToValueAtTime(0.001, t + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    src.start(t);
    src.stop(t + duration);

    return { source: src, endTime: t + duration };
  }

  /** Confirmation tone — correct vote */
  confirmCorrect() {
    if (!this.ensureContext()) return;
    this._playTone(523, 0.12, 'sine', 0.1, 0);
    this._playTone(659, 0.12, 'sine', 0.1, 0.12);
    this._playTone(784, 0.25, 'sine', 0.12, 0.24);
  }

  /** Alarm klaxon — wrong vote */
  alarmWrong() {
    if (!this.ensureContext()) return;
    const t = this.ctx.currentTime;

    for (let i = 0; i < 3; i++) {
      const delay = i * 0.25;
      this._playTone(220, 0.12, 'sawtooth', 0.08, delay);
      this._playTone(180, 0.12, 'sawtooth', 0.08, delay + 0.12);
    }

    // Static burst
    const noise = this._createNoise(0.8);
    const src = this.ctx.createBufferSource();
    src.buffer = noise;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    src.connect(gain);
    gain.connect(this.masterGain);
    src.start(t);
  }

  /** Single heartbeat pulse — for timer warning */
  heartbeat() {
    if (!this.ensureContext()) return;
    const t = this.ctx.currentTime;
    // lub
    this._playTone(60, 0.08, 'sine', 0.15, 0);
    // dub
    this._playTone(50, 0.06, 'sine', 0.1, 0.12);
  }

  /** Timer tick — for last 30 seconds */
  timerTick() {
    if (!this.ensureContext()) return;
    this._playTone(1200, 0.02, 'square', 0.04, 0);
  }

  /** Critical timer — for last 10 seconds */
  timerCritical() {
    if (!this.ensureContext()) return;
    this._playTone(1600, 0.04, 'square', 0.08, 0);
    this._playTone(1200, 0.04, 'square', 0.06, 0.06);
  }

  /** Boot POST beep sequence */
  bootBeep(index = 0) {
    if (!this.ensureContext()) return;
    const freqs = [800, 1000, 1200, 600, 1400, 800, 1000, 900, 1100, 1500];
    const freq = freqs[index % freqs.length];
    this._playTone(freq, 0.06, 'square', 0.05, 0);
  }

  /** Round transition — static + frequency sweep */
  roundTransition() {
    if (!this.ensureContext()) return;
    const t = this.ctx.currentTime;

    // Frequency sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(2000, t + 0.5);
    osc.frequency.exponentialRampToValueAtTime(400, t + 1.0);
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.linearRampToValueAtTime(0.1, t + 0.3);
    gain.gain.linearRampToValueAtTime(0, t + 1.0);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 1.0);

    // Static
    const noise = this._createNoise(0.6);
    const src = this.ctx.createBufferSource();
    src.buffer = noise;
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.1, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;
    src.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.masterGain);
    src.start(t);
  }

  /** Start ambient CRT hum */
  startAmbient() {
    if (!this.ensureContext()) return;
    this.stopAmbient();

    // Low hum (50hz + harmonics — CRT power supply)
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 50;
    const gain1 = this.ctx.createGain();
    gain1.gain.value = 0.012;
    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    osc1.start();

    // Second harmonic
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 100;
    const gain2 = this.ctx.createGain();
    gain2.gain.value = 0.006;
    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    osc2.start();

    // Very quiet brown noise for warmth
    const noise = this._createNoise(4, 'brown');
    const nSrc = this.ctx.createBufferSource();
    nSrc.buffer = noise;
    nSrc.loop = true;
    const nGain = this.ctx.createGain();
    nGain.gain.value = 0.008;
    const nFilter = this.ctx.createBiquadFilter();
    nFilter.type = 'lowpass';
    nFilter.frequency.value = 300;
    nSrc.connect(nFilter);
    nFilter.connect(nGain);
    nGain.connect(this.masterGain);
    nSrc.start();

    this.ambientNodes = [
      { osc: osc1, gain: gain1 },
      { osc: osc2, gain: gain2 },
      { source: nSrc, gain: nGain }
    ];
  }

  /** Stop ambient sounds */
  stopAmbient() {
    this.ambientNodes.forEach(n => {
      try {
        if (n.osc) n.osc.stop();
        if (n.source) n.source.stop();
      } catch (e) { /* already stopped */ }
    });
    this.ambientNodes = [];
  }

  /** UI hover sound */
  hover() {
    if (!this.ensureContext()) return;
    this._playTone(1800, 0.015, 'sine', 0.02, 0);
  }

  /** UI select/click */
  uiClick() {
    if (!this.ensureContext()) return;
    this._playTone(600, 0.04, 'square', 0.04, 0);
    this._playTone(900, 0.03, 'square', 0.03, 0.04);
  }

  /** Suspense drone — for Round 5 twist */
  suspenseDrone(duration = 5) {
    if (!this.ensureContext()) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.linearRampToValueAtTime(60, t + duration);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, t);
    filter.frequency.linearRampToValueAtTime(100, t + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.08, t + duration * 0.3);
    gain.gain.linearRampToValueAtTime(0.1, t + duration * 0.8);
    gain.gain.linearRampToValueAtTime(0, t + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + duration);
  }

  /** Ending reveal — ethereal ascending tone */
  endingReveal() {
    if (!this.ensureContext()) return;
    const t = this.ctx.currentTime;

    [261, 329, 392, 523].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      const delay = i * 0.8;
      osc.frequency.setValueAtTime(freq, t + delay);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, t + delay);
      gain.gain.linearRampToValueAtTime(0.06, t + delay + 0.2);
      gain.gain.linearRampToValueAtTime(0.04, t + delay + 1.5);
      gain.gain.linearRampToValueAtTime(0, t + delay + 2.5);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + delay);
      osc.stop(t + delay + 2.5);
    });
  }

  /** Clean up */
  destroy() {
    this.stopAmbient();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.isInitialized = false;
  }
}

// Singleton
const soundEngine = new SoundEngine();
export default soundEngine;
