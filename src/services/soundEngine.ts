/**
 * Web Audio API procedural retro 8-bit sound effects & chiptune background music
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmInterval: number | null = null;
  private isBgmPlaying: boolean = false;
  private bgmStep: number = 0;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // 8-bit White noise burst helper for explosions
  private playNoise(duration: number, startFreq: number, endFreq: number, gainVal: number) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), this.ctx.currentTime + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();
      whiteNoise.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio fallback silent
    }
  }

  // Tone generator helper
  private playTone(
    freq: number, 
    type: OscillatorType, 
    duration: number, 
    gainVal: number, 
    targetFreq?: number
  ) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      if (targetFreq) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, targetFreq), this.ctx.currentTime + duration);
      }

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio fallback silent
    }
  }

  // Specific Game Sound Effects
  public playJump() {
    this.playTone(180, 'square', 0.14, 0.12, 450);
  }

  public playShootRifle() {
    this.playTone(600, 'square', 0.08, 0.12, 140);
  }

  public playShootMachine() {
    this.playTone(750, 'sawtooth', 0.06, 0.15, 180);
  }

  public playShootSpread() {
    this.playTone(520, 'square', 0.12, 0.2, 100);
    this.playNoise(0.08, 800, 200, 0.12);
  }

  public playShootLaser() {
    this.playTone(1200, 'sine', 0.2, 0.18, 250);
  }

  public playShootFlame() {
    this.playNoise(0.18, 900, 150, 0.2);
    this.playTone(280, 'triangle', 0.15, 0.15, 90);
  }

  public playShootHoming() {
    this.playTone(350, 'sawtooth', 0.1, 0.15, 700);
  }

  public playEnemyExplode() {
    this.playNoise(0.25, 450, 60, 0.28);
    this.playTone(120, 'square', 0.2, 0.15, 40);
  }

  public playBossExplode() {
    this.playNoise(0.65, 300, 40, 0.4);
    this.playTone(80, 'sawtooth', 0.5, 0.3, 30);
  }

  public playPlayerHit() {
    this.playTone(300, 'sawtooth', 0.3, 0.3, 80);
    this.playNoise(0.2, 300, 100, 0.2);
  }

  public playPowerUp() {
    if (this.isMuted) return;
    this.initCtx();
    const notes = [330, 440, 550, 660, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'square', 0.1, 0.15);
      }, idx * 45);
    });
  }

  public playCorrectAnswer() {
    if (this.isMuted) return;
    this.initCtx();
    // Glorious fanfare: C5 -> E5 -> G5 -> C6
    const chord = [523.25, 659.25, 783.99, 1046.50];
    chord.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.25, 0.25);
        this.playTone(freq * 0.5, 'square', 0.25, 0.1);
      }, idx * 90);
    });
  }

  public playWrongAnswer() {
    if (this.isMuted) return;
    this.initCtx();
    // Harsh error buzzer: Low sawtooth dissonant drop
    this.playTone(220, 'sawtooth', 0.25, 0.25, 110);
    this.playTone(207.65, 'sawtooth', 0.25, 0.25, 103.8);
  }

  public playBarrierHum() {
    this.playTone(120, 'sine', 0.3, 0.1, 150);
  }

  public playBarrierClear() {
    this.playNoise(0.4, 1200, 100, 0.3);
    this.playTone(880, 'sine', 0.35, 0.2, 220);
  }

  // Chiptune background music loop (Classic 8-bit Contra energetic driving bass + synth lead)
  public startBGM() {
    if (this.isMuted || this.isBgmPlaying) return;
    this.isBgmPlaying = true;
    this.bgmStep = 0;

    // Classic driving 16-step bassline & melody pattern (in C minor / D minor feel)
    const bassline = [
      110, 110, 130.81, 110,  146.83, 110, 130.81, 110,
      98,  98,  110,    98,   130.81, 98,  110,    123.47
    ];
    const melody = [
      440, 0, 523.25, 0,  587.33, 0, 523.25, 659.25,
      0, 587.33, 0, 440,  523.25, 0, 392, 0
    ];

    this.bgmInterval = window.setInterval(() => {
      if (this.isMuted || !this.isBgmPlaying) return;
      this.initCtx();

      const bFreq = bassline[this.bgmStep % bassline.length];
      if (bFreq > 0) {
        this.playTone(bFreq, 'sawtooth', 0.12, 0.05);
      }

      const mFreq = melody[this.bgmStep % melody.length];
      if (mFreq > 0) {
        this.playTone(mFreq, 'square', 0.1, 0.04);
      }

      this.bgmStep++;
    }, 140);
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const soundEngine = new SoundEngine();
