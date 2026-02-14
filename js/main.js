/* ==========================================
   MAIN: Scroll detection, music, petals
   ========================================== */

(function () {
  'use strict';

  // === DOM References ===
  const scrollContainer = document.getElementById('scrollContainer');
  const musicBtn = document.getElementById('musicBtn');
  const bgMusic = document.getElementById('bgMusic');
  const petalContainer = document.getElementById('petalContainer');
  const sections = document.querySelectorAll('.screen');

  // === State ===
  let musicPlaying = false;
  let petalsSpawned = false;

  // === INTERSECTION OBSERVER ===
  // Observe each section and trigger flowers + visibility
  const observerOptions = {
    root: scrollContainer,
    threshold: 0.3
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const section = entry.target;
        const screenNum = parseInt(section.id.replace('screen', ''), 10);

        // Add visible class for content animations
        section.classList.add('screen-visible');

        // Spawn flowers for this screen
        FlowerEngine.spawnFlowersForScreen(screenNum);

        // Spawn petals + sparkles on screen 5
        if (screenNum === 5 && !petalsSpawned) {
          spawnPetals();
          spawnHeartSparkles();
          petalsSpawned = true;
        }
      }
    });
  }, observerOptions);

  // Observe all sections
  sections.forEach(section => observer.observe(section));

  // Screen 1 is visible immediately
  document.getElementById('screen1').classList.add('screen-visible');
  FlowerEngine.spawnFlowersForScreen(1);

  // === MUSIC CONTROL ===
  function toggleMusic() {
    if (musicPlaying) {
      bgMusic.pause();
      musicBtn.classList.add('paused');
      musicBtn.classList.remove('pulse-hint');
      musicPlaying = false;
    } else {
      bgMusic.play().then(() => {
        musicBtn.classList.remove('paused', 'pulse-hint');
        musicPlaying = true;
      }).catch(() => {
        // Autoplay blocked — keep hint pulsing
        musicBtn.classList.add('pulse-hint');
      });
    }
  }

  musicBtn.addEventListener('click', toggleMusic);

  // === SPLASH SCREEN — click starts music immediately ===
  const splashScreen = document.getElementById('splashScreen');
  const splashBtn = document.getElementById('splashBtn');
  bgMusic.volume = 0.4;

  splashBtn.addEventListener('click', () => {
    // User clicked — browser allows audio now
    bgMusic.play().then(() => {
      musicPlaying = true;
      musicBtn.classList.remove('paused');
    }).catch(() => {});
    splashScreen.classList.add('hidden');
  });

  // === PETAL PARTICLES ===
  function spawnPetals() {
    const count = 25;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
      const petal = document.createElement('div');
      petal.className = 'petal';
      petal.style.left = `${Math.random() * 100}%`;
      petal.style.setProperty('--fall-duration', `${5 + Math.random() * 7}s`);
      petal.style.setProperty('--fall-delay', `${Math.random() * 8}s`);
      petal.style.setProperty('--drift', `${-40 + Math.random() * 80}px`);

      const size = 8 + Math.random() * 8;
      petal.style.width = `${size}px`;
      petal.style.height = `${size * (0.8 + Math.random() * 0.6)}px`;

      fragment.appendChild(petal);
    }

    petalContainer.appendChild(fragment);
  }

  // === HEART SPARKLES ===
  function spawnHeartSparkles() {
    const container = document.getElementById('heartSparkles');
    if (!container) return;

    const count = 18;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';

      // Position around the center of the heart
      const angle = (360 / count) * i + Math.random() * 20;
      const rad = angle * Math.PI / 180;
      const cx = 50; // center %
      const cy = 50;

      sparkle.style.left = `${cx}%`;
      sparkle.style.top = `${cy}%`;

      // Start point (near heart edge)
      const startDist = 20 + Math.random() * 15;
      const sx = Math.cos(rad) * startDist;
      const sy = Math.sin(rad) * startDist;

      // End point (further out)
      const endDist = 50 + Math.random() * 40;
      const ex = Math.cos(rad) * endDist;
      const ey = Math.sin(rad) * endDist;

      sparkle.style.setProperty('--sx', `${sx}px`);
      sparkle.style.setProperty('--sy', `${sy}px`);
      sparkle.style.setProperty('--ex', `${ex}px`);
      sparkle.style.setProperty('--ey', `${ey}px`);
      sparkle.style.setProperty('--sparkle-duration', `${2 + Math.random() * 2.5}s`);
      sparkle.style.setProperty('--sparkle-delay', `${Math.random() * 3}s`);

      // Vary size
      const size = 2 + Math.random() * 4;
      sparkle.style.width = `${size}px`;
      sparkle.style.height = `${size}px`;

      fragment.appendChild(sparkle);
    }

    container.appendChild(fragment);
  }
})();
