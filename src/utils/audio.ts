// Web Audio API procedural Lofi chill sound generator and interactive SFX engine

class LofiAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private masterGain: GainNode | null = null;
  private lofiInterval: any = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private customAudio: HTMLAudioElement | null = null;
  private isCustomPlaying = false;
  private currentVolume = 0.5;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Set master volume (0.0 to 1.0)
  public setVolume(vol: number) {
    this.currentVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
    }
    if (this.customAudio) {
      this.customAudio.volume = this.currentVolume;
    }
  }

  public getVolume(): number {
    return this.currentVolume;
  }

  // Play procedural Lofi Chill music
  public startLofi() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    if (this.isPlaying) return;

    // If custom audio was set, play that instead
    if (this.customAudio) {
      this.customAudio.play();
      this.isCustomPlaying = true;
      this.isPlaying = true;
      return;
    }

    this.isPlaying = true;

    // Create gentle vinyl crackle background noise
    this.startVinylNoise();

    // Lofi chord progression: Dm9 -> G13 -> Cmaj9 -> A7b13
    // Frequency tables in Hz
    const chordProgressions = [
      [146.83, 220.0, 261.63, 329.63, 392.0], // Dm9: D3, A3, C4, E4, G4
      [196.0, 246.94, 329.63, 392.0, 440.0],  // G13: G3, B3, E4, G4, A4
      [130.81, 196.0, 246.94, 329.63, 392.0], // Cmaj9: C3, G3, B3, E4, G4
      [220.0, 277.18, 329.63, 415.3, 523.25], // A7b13: A3, C#4, E4, G#4, C5
    ];

    let chordIndex = 0;

    const playNextChord = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;

      const chord = chordProgressions[chordIndex % chordProgressions.length];
      chordIndex++;

      const now = this.ctx.currentTime;
      const chordDuration = 4.2;

      // Soft filter to give warm, muted lo-fi tone
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.Q.setValueAtTime(1.2, now);
      filter.connect(this.masterGain);

      // Play notes with slight strumming delay and gentle envelope
      chord.forEach((freq, noteIdx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        // Warm Rhodes/Electric Piano hybrid: sine with gentle triangle overtone
        osc.type = noteIdx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + noteIdx * 0.04);

        // Subtly detune for vintage tape flutter
        osc.detune.setValueAtTime((Math.random() - 0.5) * 8, now);

        noteGain.gain.setValueAtTime(0.0001, now);
        noteGain.gain.exponentialRampToValueAtTime(0.04, now + noteIdx * 0.04 + 0.3);
        noteGain.gain.exponentialRampToValueAtTime(0.015, now + 2.5);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + chordDuration);

        osc.connect(noteGain);
        noteGain.connect(filter);

        osc.start(now + noteIdx * 0.04);
        osc.stop(now + chordDuration + 0.1);
      });

      // Ambient melody droplet (piano note) randomly played
      if (Math.random() > 0.3) {
        const melodyNotes = [523.25, 587.33, 659.25, 783.99, 880.0];
        const randomNote = melodyNotes[Math.floor(Math.random() * melodyNotes.length)];
        const melodyOsc = this.ctx.createOscillator();
        const melodyGain = this.ctx.createGain();
        melodyOsc.type = 'sine';
        melodyOsc.frequency.setValueAtTime(randomNote, now + 1.5);
        melodyGain.gain.setValueAtTime(0.0001, now + 1.5);
        melodyGain.gain.exponentialRampToValueAtTime(0.025, now + 1.6);
        melodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

        melodyOsc.connect(melodyGain);
        melodyGain.connect(filter);
        melodyOsc.start(now + 1.5);
        melodyOsc.stop(now + 3.6);
      }
    };

    playNextChord();
    this.lofiInterval = setInterval(playNextChord, 4000);
  }

  private startVinylNoise() {
    if (!this.ctx || !this.masterGain) return;
    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // Pinkish warm crackle
        const white = Math.random() * 2 - 1;
        output[i] = white * (Math.random() < 0.003 ? 0.3 : 0.015);
      }

      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = buffer;
      this.noiseNode.loop = true;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = 1200;
      noiseFilter.Q.value = 0.8;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.value = 0.03;

      this.noiseNode.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      this.noiseNode.start();
    } catch (e) {
      // Ignore audio buffer error
    }
  }

  public stopLofi() {
    this.isPlaying = false;
    if (this.lofiInterval) {
      clearInterval(this.lofiInterval);
      this.lofiInterval = null;
    }
    if (this.noiseNode) {
      try {
        this.noiseNode.stop();
        this.noiseNode.disconnect();
      } catch (e) {}
      this.noiseNode = null;
    }
    if (this.customAudio) {
      this.customAudio.pause();
      this.isCustomPlaying = false;
    }
  }

  public togglePlay(): boolean {
    if (this.isPlaying) {
      this.stopLofi();
      return false;
    } else {
      this.startLofi();
      return true;
    }
  }

  public isMusicPlaying(): boolean {
    return this.isPlaying;
  }

  // Upload and play custom audio file from user's device
  public loadCustomAudio(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        this.stopLofi();
        const objectUrl = URL.createObjectURL(file);
        if (this.customAudio) {
          this.customAudio.pause();
          this.customAudio.src = '';
        }
        this.customAudio = new Audio(objectUrl);
        this.customAudio.loop = true;
        this.customAudio.volume = this.currentVolume;
        this.customAudio.oncanplaythrough = () => {
          this.startLofi();
          resolve(file.name);
        };
        this.customAudio.onerror = (e) => reject(e);
      } catch (err) {
        reject(err);
      }
    });
  }

  public resetToBuiltinLofi() {
    if (this.customAudio) {
      this.customAudio.pause();
      this.customAudio = null;
    }
    if (this.isPlaying) {
      this.stopLofi();
      this.startLofi();
    }
  }

  // High-fidelity sound effects using synthesis
  public playSFX(type: 'correct' | 'wrong' | 'celebrate' | 'click' | 'flip') {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;

      if (type === 'correct') {
        // Bright pleasant harmonic chime (C6 -> G6)
        [1046.5, 1567.98].forEach((freq, idx) => {
          if (!this.ctx || !this.masterGain) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          gain.gain.setValueAtTime(0.001, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.08, now + idx * 0.1 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.45);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.5);
        });
      } else if (type === 'wrong') {
        // Soft low muted buzz (not harsh)
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.25);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'celebrate') {
        // Glorious fanfare triad: C5 -> E5 -> G5 -> C6
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          if (!this.ctx || !this.masterGain) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);
          gain.gain.setValueAtTime(0.001, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.09, now + idx * 0.12 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.6);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.65);
        });
      } else if (type === 'flip') {
        // Subtle card swish
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'click') {
        // Crisp gentle micro-tick
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch (e) {
      // AudioContext policy restriction before user gesture
    }
  }

  // Text-to-speech for English pronunciation
  public speakWord(word: string, accent: 'en-US' | 'en-GB' = 'en-US') {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = accent;
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }
}

export const soundEngine = new LofiAudioEngine();
