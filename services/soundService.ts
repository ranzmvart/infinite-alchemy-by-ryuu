class SoundService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMusicPlaying: boolean = false;
  
  // Sequencer state
  private nextNoteTime: number = 0;
  private timerID: number | null = null;
  private sequenceStep: number = 0;
  private tempo: number = 70; // BPM
  private lookahead: number = 25.0; // ms
  private scheduleAheadTime: number = 0.1; // s

  private getContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 1.0;
      this.masterGain.connect(this.ctx.destination);

      // SFX Bus
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.3; // Default SFX volume
      this.sfxGain.connect(this.masterGain);

      // Music Bus
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.2; // Default Music volume
      this.musicGain.connect(this.masterGain);
    }
    return { ctx: this.ctx, masterGain: this.masterGain, sfxGain: this.sfxGain, musicGain: this.musicGain };
  }

  setMusicVolume(volume: number) {
    const { musicGain } = this.getContext();
    if (musicGain && this.ctx) {
      const t = this.ctx.currentTime;
      musicGain.gain.cancelScheduledValues(t);
      musicGain.gain.setValueAtTime(musicGain.gain.value, t);
      musicGain.gain.linearRampToValueAtTime(volume, t + 0.1);
    }
  }

  startAmbientMusic() {
    if (this.isMusicPlaying) return;
    const { ctx, musicGain } = this.getContext();
    if (!ctx || !musicGain) return;

    this.isMusicPlaying = true;
    
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Start slightly in the future
    this.nextNoteTime = ctx.currentTime + 0.1;
    this.sequenceStep = 0;
    this.scheduler();
  }

  stopAmbientMusic() {
    this.isMusicPlaying = false;
    if (this.timerID !== null) {
      window.clearTimeout(this.timerID);
      this.timerID = null;
    }
  }

  private scheduler() {
    if (!this.isMusicPlaying) return;
    const { ctx } = this.getContext();
    if (!ctx) return;

    while (this.nextNoteTime < ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.sequenceStep, this.nextNoteTime);
      this.nextNote();
    }
    this.timerID = window.setTimeout(() => this.scheduler(), this.lookahead);
  }

  private nextNote() {
    const secondsPerBeat = 60.0 / this.tempo;
    this.nextNoteTime += secondsPerBeat;
    // 16 beat loop (4 bars of 4/4)
    this.sequenceStep = (this.sequenceStep + 1) % 16;
  }

  private scheduleNote(beatNumber: number, time: number) {
    const { ctx, musicGain } = this.getContext();
    if (!ctx || !musicGain) return;

    // Helper to play a tone
    const playTone = (freq: number, type: OscillatorType, dur: number, vol: number, attack = 0.05, release = 0.5, pan = 0) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const panner = ctx.createStereoPanner();
      
      osc.type = type;
      osc.frequency.value = freq;
      
      osc.connect(gain);
      gain.connect(panner);
      panner.connect(musicGain);

      panner.pan.value = pan;

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(vol, time + attack);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur + release);

      osc.start(time);
      osc.stop(time + dur + release + 0.1);
    };

    // --- Song Structure: C Major / A Minor Ambient ---
    // Chords change every 4 beats (1 bar)
    // Bar 1 (0-3): F Major 7 (F A C E)
    // Bar 2 (4-7): C Major 7 (C E G B)
    // Bar 3 (8-11): D Minor 9 (D F A C E)
    // Bar 4 (12-15): G 6 (G B D E)

    // 1. Bass (Roots) - Plays on beat 1 of each bar
    if (beatNumber % 4 === 0) {
      let freq = 0;
      if (beatNumber === 0) freq = 87.31;  // F2
      if (beatNumber === 4) freq = 130.81; // C3
      if (beatNumber === 8) freq = 73.42;  // D2
      if (beatNumber === 12) freq = 98.00; // G2
      
      // Deep sine sub
      playTone(freq, 'sine', 3, 0.4, 0.1, 2.0); 
      // Subtle harmonics
      playTone(freq * 2, 'triangle', 2, 0.05, 0.1, 1.5);
    }

    // 2. Chords / Pad Textures (Randomized arpeggio-like feel)
    const chords: Record<number, number[]> = {
      0: [174.61, 220.00, 261.63, 329.63], // F A C E
      1: [130.81, 164.81, 196.00, 246.94], // C E G B
      2: [146.83, 174.61, 220.00, 261.63], // D F A C
      3: [196.00, 246.94, 293.66, 329.63], // G B D E
    };

    const barIndex = Math.floor(beatNumber / 4);
    const currentChord = chords[barIndex as 0|1|2|3] || [];

    // On off-beats or randomly, play chord tones softly
    if (Math.random() > 0.2) {
      const note = currentChord[Math.floor(Math.random() * currentChord.length)];
      const octave = Math.random() > 0.7 ? 2 : 1;
      const pan = (Math.random() * 2) - 1;
      playTone(note * octave, 'sine', 2, 0.05, 0.5, 2.0, pan);
    }

    // 3. Melody (Pentatonic: C D E G A)
    // C Major Pentatonic scales generally work over this progression
    if (beatNumber % 2 !== 0 && Math.random() > 0.4) {
      const melodyNotes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C4 - C5 range
      const note = melodyNotes[Math.floor(Math.random() * melodyNotes.length)];
      playTone(note, 'triangle', 0.4, 0.08, 0.05, 1.0, (Math.random() - 0.5));
    }
  }

  resumeContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  play(type: 'click' | 'pop' | 'success' | 'discovery' | 'clear' | 'undo' | 'hover') {
    const { ctx, sfxGain } = this.getContext();
    if (!ctx || !sfxGain) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const t = ctx.currentTime;
    
    // Create nodes
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(sfxGain);

    switch (type) {
      case 'click':
        // High pitch tick
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.1);
        gain.gain.setValueAtTime(0.5, t); 
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
        break;

      case 'hover':
        // Very subtle tick
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, t);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        osc.start(t);
        osc.stop(t + 0.05);
        break;

      case 'pop':
         // Bubble sound for spawn
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.linearRampToValueAtTime(600, t + 0.1);
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.2);
        break;

      case 'success':
        // Simple chime
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, t); // C5
        osc.frequency.setValueAtTime(659.25, t + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, t + 0.2); // G5
        
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.3, t + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
        
        osc.start(t);
        osc.stop(t + 1.5);
        break;

      case 'discovery':
        // Magical Arpeggio (C Major 9)
        const frequencies = [523.25, 659.25, 783.99, 987.77, 1046.50]; 
        frequencies.forEach((f, i) => {
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(sfxGain);
            osc2.type = 'sine';
            osc2.frequency.value = f;
            
            const startT = t + i * 0.1;
            gain2.gain.setValueAtTime(0, startT);
            gain2.gain.linearRampToValueAtTime(0.3, startT + 0.1);
            gain2.gain.exponentialRampToValueAtTime(0.001, startT + 2);
            
            osc2.start(startT);
            osc2.stop(startT + 2);
        });
        return; 
      
      case 'clear':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.3);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.linearRampToValueAtTime(0.001, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
        break;
        
      case 'undo':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.linearRampToValueAtTime(400, t + 0.15);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.linearRampToValueAtTime(0.001, t + 0.15);
        osc.start(t);
        osc.stop(t + 0.15);
        break;
    }
  }
}

export const soundService = new SoundService();