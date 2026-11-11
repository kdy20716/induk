// Web Audio API 기반 전시장 사운드 — 외부 오디오 파일 없이 실시간 합성
export class ExhibitionAudio {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    this.master = null;
    this.hum = null;
  }

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.ctx.destination);
    this.noiseBuf = this._makeNoise(2);
    this._startAmbient();
    this._startProjectorHum();
  }

  setEnabled(on) {
    this.enabled = on;
    if (on) this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(on ? 0.9 : 0, t, 0.25);
  }

  _makeNoise(sec) {
    const len = this.ctx.sampleRate * sec;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  _noise(loop = false) {
    const s = this.ctx.createBufferSource();
    s.buffer = this.noiseBuf;
    s.loop = loop;
    return s;
  }

  // 전시장 공간감: 낮은 드론 + 은은한 룸톤
  _startAmbient() {
    const c = this.ctx;
    const g = c.createGain();
    g.gain.value = 0.05;
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 380;
    lp.connect(g).connect(this.master);
    [55, 82.4, 110.3, 164.8].forEach((f, i) => {
      const o = c.createOscillator();
      o.type = i % 2 ? 'triangle' : 'sine';
      o.frequency.value = f;
      o.detune.value = (i - 1.5) * 6;
      const og = c.createGain();
      og.gain.value = 0.22 / (i + 1);
      const lfo = c.createOscillator();
      lfo.frequency.value = 0.05 + i * 0.03;
      const lg = c.createGain();
      lg.gain.value = 0.08 / (i + 1);
      lfo.connect(lg).connect(og.gain);
      o.connect(og).connect(lp);
      o.start();
      lfo.start();
    });
    const n = this._noise(true);
    const bp = c.createBiquadFilter();
    bp.type = 'lowpass';
    bp.frequency.value = 600;
    const ng = c.createGain();
    ng.gain.value = 0.015;
    n.connect(bp).connect(ng).connect(this.master);
    n.start();
    this.ambientGain = g;
  }

  // 프로젝터 팬 소음 (켜짐 정도에 따라 볼륨)
  _startProjectorHum() {
    const c = this.ctx;
    const n = this._noise(true);
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 520;
    bp.Q.value = 0.8;
    const o = c.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = 120;
    const og = c.createGain();
    og.gain.value = 0.05;
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 300;
    this.hum = c.createGain();
    this.hum.gain.value = 0;
    n.connect(bp).connect(this.hum);
    o.connect(og).connect(lp).connect(this.hum);
    this.hum.connect(this.master);
    n.start();
    o.start();
  }

  setProjector(level) {
    if (!this.ctx) return;
    this.hum.gain.setTargetAtTime(level * 0.06, this.ctx.currentTime, 0.1);
  }

  // 프로젝터 전원 '딸깍'
  click() {
    if (!this.ctx || !this.enabled) return;
    const c = this.ctx, t = c.currentTime;
    const n = this._noise();
    const hp = c.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 1800;
    const g = c.createGain();
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    n.connect(hp).connect(g).connect(this.master);
    n.start(t);
    n.stop(t + 0.1);
    const o = c.createOscillator();
    o.frequency.setValueAtTime(2200, t + 0.05);
    o.frequency.exponentialRampToValueAtTime(900, t + 0.5);
    const og = c.createGain();
    og.gain.setValueAtTime(0.0001, t);
    og.gain.exponentialRampToValueAtTime(0.05, t + 0.08);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
    o.connect(og).connect(this.master);
    o.start(t);
    o.stop(t + 0.8);
  }

  // 묵직한 문 열림 (덜컹 + 럼블)
  door() {
    if (!this.ctx || !this.enabled) return;
    const c = this.ctx, t = c.currentTime;
    const n = this._noise();
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(180, t);
    lp.frequency.linearRampToValueAtTime(90, t + 2.2);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.9, t + 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
    n.connect(lp).connect(g).connect(this.master);
    n.start(t);
    n.stop(t + 2.7);
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(52, t);
    o.frequency.linearRampToValueAtTime(38, t + 2);
    const og = c.createGain();
    og.gain.setValueAtTime(0.0001, t);
    og.gain.exponentialRampToValueAtTime(0.35, t + 0.1);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
    o.connect(og).connect(this.master);
    o.start(t);
    o.stop(t + 2.3);
    // 금속성 '쿵'
    const m = c.createOscillator();
    m.type = 'triangle';
    m.frequency.value = 96;
    const mg = c.createGain();
    mg.gain.setValueAtTime(0.4, t);
    mg.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    m.connect(mg).connect(this.master);
    m.start(t);
    m.stop(t + 1);
    // 신비로운 화음 (문 안쪽 빛)
    [392, 587.3, 784, 1174.7].forEach((f, i) => {
      const s = c.createOscillator();
      s.type = 'sine';
      s.frequency.value = f;
      const sg = c.createGain();
      sg.gain.setValueAtTime(0.0001, t + 0.4);
      sg.gain.exponentialRampToValueAtTime(0.03 / (i + 1), t + 1.2 + i * 0.1);
      sg.gain.exponentialRampToValueAtTime(0.0001, t + 4);
      s.connect(sg).connect(this.master);
      s.start(t + 0.4);
      s.stop(t + 4.1);
    });
  }

  // 액자 호버 '똑'
  blip(pitch = 1) {
    if (!this.ctx || !this.enabled) return;
    const c = this.ctx, t = c.currentTime;
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(880 * pitch, t);
    o.frequency.exponentialRampToValueAtTime(1320 * pitch, t + 0.08);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.06, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + 0.3);
  }

  // 마리오64 그림 속으로 '퐁~ 우웅' 워프
  warp() {
    if (!this.ctx || !this.enabled) return;
    const c = this.ctx, t = c.currentTime;
    // 물방울 '퐁'
    const p = c.createOscillator();
    p.type = 'sine';
    p.frequency.setValueAtTime(320, t);
    p.frequency.exponentialRampToValueAtTime(1400, t + 0.12);
    const pg = c.createGain();
    pg.gain.setValueAtTime(0.0001, t);
    pg.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
    pg.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    p.connect(pg).connect(this.master);
    p.start(t);
    p.stop(t + 0.35);
    // 출렁이는 비브라토 하강음
    const o = c.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(1100, t + 0.15);
    o.frequency.exponentialRampToValueAtTime(140, t + 2.2);
    const lfo = c.createOscillator();
    lfo.frequency.setValueAtTime(7, t);
    lfo.frequency.linearRampToValueAtTime(14, t + 2);
    const lg = c.createGain();
    lg.gain.value = 70;
    lfo.connect(lg).connect(o.frequency);
    const og = c.createGain();
    og.gain.setValueAtTime(0.0001, t + 0.15);
    og.gain.exponentialRampToValueAtTime(0.16, t + 0.35);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
    o.connect(og).connect(this.master);
    o.start(t + 0.15);
    lfo.start(t);
    o.stop(t + 2.5);
    lfo.stop(t + 2.5);
    // 물 속 '쏴아' 노이즈
    const n = this._noise();
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 1.2;
    bp.frequency.setValueAtTime(2400, t);
    bp.frequency.exponentialRampToValueAtTime(300, t + 2);
    const ng = c.createGain();
    ng.gain.setValueAtTime(0.0001, t);
    ng.gain.exponentialRampToValueAtTime(0.2, t + 0.8);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 2.3);
    n.connect(bp).connect(ng).connect(this.master);
    n.start(t);
    n.stop(t + 2.4);
  }
}
