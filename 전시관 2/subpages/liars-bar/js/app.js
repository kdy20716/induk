/* ==========================================================================
   LIAR'S BAR : DEATH TABLE — PRESENTATION INTERACTIVE ENGINE (app.js)
   Features:
   - Slide Deck Controller (Keyboard, Wheel, Dots, Fullscreen, Print PDF)
   - Real Game Audio Engine (MP3s + Web Audio API Procedural Card/Wood SFX)
   - Interactive 6-Chamber Russian Roulette & Devil Card Live Demo
   - Atmospheric Speakeasy Ember Particle System
   ========================================================================== */

(function () {
  'use strict';

  // --- 1. Audio Engine (Game MP3s + Procedural WebAudio SFX) ---
  const audioPaths = {
    bgmCold: 'assets/audio/Liar%20Game%20Cold%20Pressure.mp3',
    bgmPulse: 'assets/audio/Pulse%20In%20The%20Dark.mp3',
    cock: 'assets/audio/cock.mp3',
    bang: 'assets/audio/bang.mp3',
    click: 'assets/audio/click.mp3',
    devil: 'assets/audio/devil.mp3'
  };

  const bgmPlayers = {
    cold: new Audio(audioPaths.bgmCold),
    pulse: new Audio(audioPaths.bgmPulse)
  };
  bgmPlayers.cold.loop = true;
  bgmPlayers.cold.volume = 0.42;
  bgmPlayers.pulse.loop = true;
  bgmPlayers.pulse.volume = 0.62;

  let currentBgm = null;
  let audioCtx = null;

  function ensureAudioCtx() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Subtle wooden tap / card slide sound via Web Audio API
  function playUiSound(type) {
    try {
      ensureAudioCtx();
      if (!audioCtx) return;
      const now = audioCtx.currentTime;

      if (type === 'slide' || type === 'card') {
        // Crisp card flip / slide swish
        const bufferSize = audioCtx.sampleRate * 0.09;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.32));
        }
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(type === 'card' ? 1650 : 950, now);
        filter.Q.setValueAtTime(2.2, now);

        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        noise.start(now);
      } else if (type === 'wood') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(190, now);
        osc.frequency.exponentialRampToValueAtTime(68, now + 0.045);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.055);
      }
    } catch (e) {
      // Ignore audio errors before user gesture
    }
  }

  function playSfx(name) {
    const src = audioPaths[name];
    if (!src) return;
    const sfx = new Audio(src);
    sfx.volume = name === 'bang' ? 0.9 : 0.8;
    sfx.play().catch(() => {});

    if (name === 'bang') {
      triggerBloodImpact();
    } else if (name === 'devil') {
      triggerDevilImpact();
    }
  }

  function toggleBgm(mode) {
    const btnCold = document.getElementById('btn-bgm-cold');
    const btnPulse = document.getElementById('btn-bgm-pulse');

    if (currentBgm === mode) {
      bgmPlayers.cold.pause();
      bgmPlayers.pulse.pause();
      currentBgm = null;
      if (btnCold) btnCold.classList.remove('active');
      if (btnPulse) btnPulse.classList.remove('active');
      return;
    }

    bgmPlayers.cold.pause();
    bgmPlayers.pulse.pause();
    if (btnCold) btnCold.classList.remove('active');
    if (btnPulse) btnPulse.classList.remove('active');

    if (mode === 'cold') {
      bgmPlayers.cold.currentTime = 0;
      bgmPlayers.cold.play().catch(() => {});
      currentBgm = 'cold';
      if (btnCold) btnCold.classList.add('active');
    } else if (mode === 'pulse') {
      bgmPlayers.pulse.currentTime = 0;
      bgmPlayers.pulse.play().catch(() => {});
      currentBgm = 'pulse';
      if (btnPulse) btnPulse.classList.add('active');
    }
  }

  function triggerBloodImpact() {
    const overlay = document.getElementById('fx-blood');
    document.body.classList.remove('shake');
    void document.body.offsetWidth;
    document.body.classList.add('shake');

    if (overlay) {
      overlay.classList.remove('active');
      void overlay.offsetWidth;
      overlay.classList.add('active');
    }
  }

  function triggerDevilImpact() {
    const overlay = document.getElementById('fx-devil');
    if (overlay) {
      overlay.classList.remove('active');
      void overlay.offsetWidth;
      overlay.classList.add('active');
    }
  }

  // Expose sound functions globally for inline buttons
  window.LiarDeckAudio = {
    playSfx,
    toggleBgm,
    playUiSound
  };

  // --- 2. Slide Deck Navigation ---
  let currentSlide = 0;
  let slides = [];
  let dots = [];

  function initSlides() {
    slides = Array.from(document.querySelectorAll('.slide'));
    const dotsContainer = document.getElementById('slide-dots');
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      slides.forEach((_, idx) => {
        const dot = document.createElement('div');
        dot.className = 'dot' + (idx === 0 ? ' active' : '');
        dot.title = `Slide ${idx + 1}`;
        dot.addEventListener('click', () => goToSlide(idx));
        dotsContainer.appendChild(dot);
      });
      dots = Array.from(dotsContainer.querySelectorAll('.dot'));
    }
    updateSlideUI();
  }

  function goToSlide(index) {
    if (index < 0 || index >= slides.length || index === currentSlide) return;
    slides[currentSlide].classList.remove('active');
    currentSlide = index;
    slides[currentSlide].classList.add('active');
    playUiSound('slide');
    updateSlideUI();
  }

  function nextSlide() {
    if (currentSlide < slides.length - 1) goToSlide(currentSlide + 1);
  }

  function prevSlide() {
    if (currentSlide > 0) goToSlide(currentSlide - 1);
  }

  function updateSlideUI() {
    dots.forEach((d, idx) => d.classList.toggle('active', idx === currentSlide));
    const counter = document.getElementById('slide-counter');
    if (counter) {
      const cur = String(currentSlide + 1).padStart(2, '0');
      const tot = String(slides.length).padStart(2, '0');
      counter.textContent = `${cur} / ${tot}`;
    }
  }

  window.LiarDeckNav = {
    nextSlide,
    prevSlide,
    goToSlide,
    toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    },
    printPdf() {
      window.print();
    }
  };

  // Keyboard & Hover Listeners
  window.addEventListener('keydown', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'f' || e.key === 'F') {
      window.LiarDeckNav.toggleFullscreen();
    } else if (e.key === 'Escape') {
      closeLightbox();
    }
  });

  // --- 3. Interactive Russian Roulette Live Simulator (Slide 9) ---
  let chamberIndex = 0;
  let bulletChamber = Math.floor(Math.random() * 6);
  let isDead = false;
  let isCountingDown = false;
  let countdownTimer = null;

  function renderCylinder() {
    const slots = document.querySelectorAll('.chamber-slot');
    slots.forEach((slot, idx) => {
      slot.className = 'chamber-slot';
      if (idx < chamberIndex) {
        slot.classList.add('spent');
        slot.textContent = '빈칸';
      } else if (idx === chamberIndex) {
        if (isDead) {
          slot.classList.add('bang');
          slot.textContent = 'BANG';
        } else {
          slot.classList.add('current');
          slot.textContent = `${idx + 1}/6`;
        }
      } else {
        slot.textContent = `${idx + 1}`;
      }
    });
  }

  function resetRoulette() {
    if (countdownTimer) clearInterval(countdownTimer);
    isCountingDown = false;
    chamberIndex = 0;
    bulletChamber = Math.floor(Math.random() * 6);
    isDead = false;
    playUiSound('wood');
    const status = document.getElementById('sim-status-text');
    if (status) {
      status.textContent = `실린더 리셋 완료 — 현재 탄약 0/6 (1발 치사율 16.7%)`;
      status.style.color = '#ffe082';
    }
    renderCylinder();
  }

  function pullTrigger5Sec() {
    if (isCountingDown) return;
    if (isDead) resetRoulette();

    isCountingDown = true;
    playSfx('cock');
    const prevBgm = currentBgm;
    toggleBgm('pulse');

    const status = document.getElementById('sim-status-text');
    let remain = 5.0;

    countdownTimer = setInterval(() => {
      remain -= 0.1;
      if (remain > 0) {
        if (status) {
          status.textContent = `[찰칵!] 관자놀이 조준 중... 격발까지 ${remain.toFixed(1)}s (치사율 ${Math.round((1 / (6 - chamberIndex)) * 100)}%)`;
          status.style.color = '#ff7b86';
        }
      } else {
        clearInterval(countdownTimer);
        countdownTimer = null;
        isCountingDown = false;

        if (chamberIndex === bulletChamber) {
          isDead = true;
          playSfx('bang');
          if (status) {
            status.textContent = `💥 [탕!] ${chamberIndex + 1}/6 발사 — 헤드샷 테이블 슬럼프 & 핏웅덩이 확산!`;
            status.style.color = '#ff2a3a';
          }
        } else {
          playSfx('click');
          chamberIndex++;
          if (status) {
            status.textContent = `😮‍💨 [틱!] 불발 생존 (${chamberIndex}/6) — 생존자가 다음 라운드 선공 시작!`;
            status.style.color = '#7ee787';
          }
        }
        renderCylinder();

        setTimeout(() => {
          if (prevBgm === 'cold') toggleBgm('cold');
          else if (!prevBgm && currentBgm === 'pulse') toggleBgm('pulse');
        }, 1200);
      }
    }, 100);
  }

  window.LiarRouletteSim = {
    pullTrigger5Sec,
    resetRoulette
  };

  // --- 4. Lightbox & YouTube Video Handler ---
  function openLightbox(src, caption) {
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    const cap = document.getElementById('lightbox-caption');
    if (lb && img && cap) {
      img.src = src;
      cap.textContent = caption || '';
      lb.classList.add('open');
      playUiSound('card');
    }
  }

  function closeLightbox() {
    const lb = document.getElementById('lightbox');
    if (lb) lb.classList.remove('open');
  }

  window.LiarLightbox = { openLightbox, closeLightbox };

  function applyYoutubeUrl() {
    const input = document.getElementById('yt-url-input');
    const frame = document.getElementById('yt-iframe');
    const linkBadge = document.getElementById('yt-pdf-link');
    if (!input) return;
    const raw = input.value.trim();
    if (!raw) return;

    localStorage.setItem('liarsbar_youtube_url', raw);
    if (linkBadge) {
      linkBadge.href = raw;
      linkBadge.textContent = raw;
    }

    // Parse YouTube ID
    let videoId = null;
    const match = raw.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
    if (match) videoId = match[1];

    if (videoId && frame) {
      frame.src = `https://www.youtube.com/embed/${videoId}?rel=0`;
      frame.style.display = 'block';
      const localVid = document.getElementById('local-gameplay-video');
      if (localVid) {
        localVid.pause();
        localVid.style.display = 'none';
      }
    }
    playUiSound('wood');
  }

  function showLocalVideo() {
    const frame = document.getElementById('yt-iframe');
    const localVid = document.getElementById('local-gameplay-video');
    if (frame) {
      frame.src = '';
      frame.style.display = 'none';
    }
    if (localVid) {
      localVid.style.display = 'block';
    }
    playUiSound('wood');
  }

  window.LiarYoutube = { applyYoutubeUrl, showLocalVideo };

  // --- 5. Speakeasy Ember Particle Background ---
  function initParticles() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    });

    const particles = Array.from({ length: 42 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2.1 + 0.6,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -Math.random() * 0.45 - 0.12,
      alpha: Math.random() * 0.55 + 0.15,
      crimson: Math.random() > 0.45
    }));

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.crimson
          ? `rgba(220, 38, 55, ${p.alpha})`
          : `rgba(217, 179, 84, ${p.alpha})`;
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  // --- Initialize on DOMContentLoaded ---
  document.addEventListener('DOMContentLoaded', () => {
    initSlides();
    initParticles();
    renderCylinder();

    // Restore saved YouTube URL if present
    const savedYt = localStorage.getItem('liarsbar_youtube_url');
    const ytInput = document.getElementById('yt-url-input');
    if (savedYt && ytInput) {
      ytInput.value = savedYt;
      applyYoutubeUrl();
    }

    // Attach hover sound to interactive cards & buttons
    document.querySelectorAll('.hud-btn, .action-btn, .panel-card').forEach((el) => {
      el.addEventListener('mouseenter', () => playUiSound('wood'));
    });
    document.querySelectorAll('.poker-card-3d').forEach((card) => {
      card.addEventListener('mouseenter', () => playUiSound('card'));
      card.addEventListener('click', () => {
        card.classList.toggle('flipped');
        playUiSound('card');
      });
    });
  });
})();
