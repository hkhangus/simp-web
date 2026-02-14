/* ==========================================
   FLOWER SPAWNING ENGINE
   8 flower types with inline SVG heads
   ========================================== */

const FlowerEngine = (() => {
  // Track occupied positions to avoid overlapping
  const occupied = [];
  const MIN_DISTANCE = 3.5; // minimum % distance between flower centers

  // === FLOWER TYPE DEFINITIONS ===
  const flowerTypes = {
    rose: {
      className: 'rose',
      headWidth: 32,
      headHeight: 30,
      variants: [
        { primary: '#e63946', secondary: '#c1121f', center: '#a4133c' },
        { primary: '#ff6b8a', secondary: '#e5547a', center: '#c9184a' },
        { primary: '#dc143c', secondary: '#b30000', center: '#8b0000' },
      ],
      svg: (c) => `<svg viewBox="0 0 32 30" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="16" cy="15" rx="14" ry="13" fill="${c.primary}"/>
        <ellipse cx="12" cy="12" rx="8" ry="10" fill="${c.secondary}" opacity="0.7" transform="rotate(-15 12 12)"/>
        <ellipse cx="20" cy="12" rx="8" ry="10" fill="${c.secondary}" opacity="0.7" transform="rotate(15 20 12)"/>
        <ellipse cx="16" cy="10" rx="6" ry="7" fill="${c.primary}" opacity="0.8"/>
        <ellipse cx="16" cy="13" rx="4" ry="5" fill="${c.center}" opacity="0.6"/>
        <circle cx="16" cy="14" r="3" fill="${c.center}" opacity="0.4"/>
      </svg>`
    },

    tulip: {
      className: 'tulip',
      headWidth: 26,
      headHeight: 30,
      variants: [
        { primary: '#e63946', secondary: '#ff4d6d' },
        { primary: '#ff69b4', secondary: '#ff85c8' },
        { primary: '#ffd700', secondary: '#ffe44d' },
        { primary: '#9b59b6', secondary: '#bb77d4' },
      ],
      svg: (c) => `<svg viewBox="0 0 26 30" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 28 C8 20, 2 15, 4 6 C5 2, 9 0, 13 2" fill="${c.primary}"/>
        <path d="M13 28 C18 20, 24 15, 22 6 C21 2, 17 0, 13 2" fill="${c.secondary}"/>
        <path d="M13 28 C11 18, 10 10, 13 2 C16 10, 15 18, 13 28" fill="${c.primary}" opacity="0.6"/>
      </svg>`
    },

    daisy: {
      className: 'daisy',
      headWidth: 34,
      headHeight: 34,
      variants: [
        { petal: '#ffffff', center: '#ffd700' },
        { petal: '#fffde7', center: '#ffb300' },
      ],
      svg: (c) => {
        let petals = '';
        const count = 12;
        for (let i = 0; i < count; i++) {
          const angle = (360 / count) * i;
          petals += `<ellipse cx="17" cy="6" rx="3" ry="8" fill="${c.petal}" transform="rotate(${angle} 17 17)" opacity="0.9"/>`;
        }
        return `<svg viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg">
          ${petals}
          <circle cx="17" cy="17" r="5.5" fill="${c.center}"/>
          <circle cx="17" cy="17" r="3" fill="${c.center}" opacity="0.7"/>
        </svg>`;
      }
    },

    sunflower: {
      className: 'sunflower',
      headWidth: 40,
      headHeight: 40,
      variants: [
        { petal: '#ffc107', center: '#5d4037' },
        { petal: '#ff9800', center: '#4e342e' },
      ],
      svg: (c) => {
        let petals = '';
        const count = 18;
        for (let i = 0; i < count; i++) {
          const angle = (360 / count) * i;
          petals += `<ellipse cx="20" cy="5" rx="3.5" ry="9" fill="${c.petal}" transform="rotate(${angle} 20 20)" opacity="0.9"/>`;
        }
        return `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          ${petals}
          <circle cx="20" cy="20" r="8" fill="${c.center}"/>
          <circle cx="18" cy="18" r="1" fill="#3e2723" opacity="0.5"/>
          <circle cx="22" cy="19" r="1" fill="#3e2723" opacity="0.5"/>
          <circle cx="20" cy="22" r="1" fill="#3e2723" opacity="0.5"/>
          <circle cx="17" cy="21" r="0.8" fill="#3e2723" opacity="0.4"/>
          <circle cx="23" cy="17" r="0.8" fill="#3e2723" opacity="0.4"/>
        </svg>`;
      }
    },

    lily: {
      className: 'lily',
      headWidth: 36,
      headHeight: 32,
      variants: [
        { primary: '#ffffff', secondary: '#f8e8ee', stamen: '#ff9800' },
        { primary: '#fce4ec', secondary: '#f8bbd0', stamen: '#ffb74d' },
      ],
      svg: (c) => {
        let petals = '';
        for (let i = 0; i < 6; i++) {
          const angle = 60 * i;
          petals += `<ellipse cx="18" cy="5" rx="5" ry="12" fill="${c.primary}" stroke="${c.secondary}" stroke-width="0.5" transform="rotate(${angle} 18 16)" opacity="0.85"/>`;
        }
        return `<svg viewBox="0 0 36 32" xmlns="http://www.w3.org/2000/svg">
          ${petals}
          <circle cx="18" cy="16" r="3" fill="${c.stamen}" opacity="0.7"/>
          <line x1="18" y1="13" x2="16" y2="9" stroke="${c.stamen}" stroke-width="1" opacity="0.5"/>
          <line x1="18" y1="13" x2="20" y2="9" stroke="${c.stamen}" stroke-width="1" opacity="0.5"/>
          <line x1="18" y1="13" x2="18" y2="8" stroke="${c.stamen}" stroke-width="1" opacity="0.5"/>
        </svg>`;
      }
    },

    lavender: {
      className: 'lavender',
      headWidth: 14,
      headHeight: 40,
      variants: [
        { primary: '#9b59b6', secondary: '#8e44ad' },
        { primary: '#7e57c2', secondary: '#673ab7' },
      ],
      svg: (c) => {
        let florets = '';
        for (let i = 0; i < 8; i++) {
          const y = 4 + i * 4.5;
          const offset = (i % 2 === 0) ? -1 : 1;
          florets += `<ellipse cx="${7 + offset}" cy="${y}" rx="4" ry="2.5" fill="${c.primary}" opacity="${0.6 + Math.random() * 0.4}"/>`;
        }
        return `<svg viewBox="0 0 14 40" xmlns="http://www.w3.org/2000/svg">
          ${florets}
          <ellipse cx="7" cy="2" rx="2.5" ry="2" fill="${c.secondary}" opacity="0.8"/>
        </svg>`;
      }
    },

    poppy: {
      className: 'poppy',
      headWidth: 36,
      headHeight: 34,
      variants: [
        { primary: '#e63946', secondary: '#ff4d4d', center: '#1a1a1a' },
        { primary: '#ff6600', secondary: '#ff8533', center: '#2d2d2d' },
      ],
      svg: (c) => `<svg viewBox="0 0 36 34" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="10" cy="12" rx="10" ry="12" fill="${c.primary}" opacity="0.85" transform="rotate(-10 10 12)"/>
        <ellipse cx="26" cy="12" rx="10" ry="12" fill="${c.secondary}" opacity="0.85" transform="rotate(10 26 12)"/>
        <ellipse cx="10" cy="22" rx="10" ry="11" fill="${c.secondary}" opacity="0.8" transform="rotate(10 10 22)"/>
        <ellipse cx="26" cy="22" rx="10" ry="11" fill="${c.primary}" opacity="0.8" transform="rotate(-10 26 22)"/>
        <circle cx="18" cy="17" r="5" fill="${c.center}"/>
        <circle cx="18" cy="17" r="3" fill="${c.center}" opacity="0.6"/>
      </svg>`
    },

    cherry: {
      className: 'cherry',
      headWidth: 30,
      headHeight: 30,
      variants: [
        { primary: '#ffc0cb', secondary: '#ffb6c1', center: '#ff69b4' },
        { primary: '#ffffff', secondary: '#ffe4e9', center: '#ffb6c1' },
      ],
      svg: (c) => {
        let petals = '';
        for (let i = 0; i < 5; i++) {
          const angle = 72 * i - 90;
          const rad = angle * Math.PI / 180;
          const cx = 15 + Math.cos(rad) * 8;
          const cy = 15 + Math.sin(rad) * 8;
          // Notched petals via two overlapping circles
          petals += `<circle cx="${cx}" cy="${cy}" r="6" fill="${c.primary}" opacity="0.85"/>`;
          const innerCx = 15 + Math.cos(rad) * 10;
          const innerCy = 15 + Math.sin(rad) * 10;
          petals += `<circle cx="${innerCx}" cy="${innerCy}" r="2" fill="${c.secondary}" opacity="0.3"/>`;
        }
        return `<svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
          ${petals}
          <circle cx="15" cy="15" r="3.5" fill="${c.center}" opacity="0.6"/>
          <circle cx="14" cy="14" r="0.8" fill="#fff" opacity="0.5"/>
          <circle cx="16" cy="15" r="0.6" fill="#fff" opacity="0.4"/>
        </svg>`;
      }
    }
  };

  const typeNames = Object.keys(flowerTypes);

  // === Check position collision ===
  function isPositionFree(x) {
    for (const ox of occupied) {
      if (Math.abs(x - ox) < MIN_DISTANCE) return false;
    }
    return true;
  }

  function findFreePosition() {
    // Try random positions, fall back to any available
    for (let attempt = 0; attempt < 50; attempt++) {
      const x = 2 + Math.random() * 96; // 2% to 98%
      if (isPositionFree(x)) {
        occupied.push(x);
        return x;
      }
    }
    // Force place if all attempts fail — use tighter spacing
    const x = 2 + Math.random() * 96;
    occupied.push(x);
    return x;
  }

  // === Create a single flower ===
  function createFlower(typeName, xPercent) {
    const type = flowerTypes[typeName];
    if (!type) return null;

    const variant = type.variants[Math.floor(Math.random() * type.variants.length)];
    const stemHeight = 60 + Math.random() * 80; // 60-140px
    const swayDuration = 2.5 + Math.random() * 3; // 2.5-5.5s
    const swayDelay = Math.random() * 2;
    const growDelay = Math.random() * 0.6;
    const scale = 0.7 + Math.random() * 0.5; // 0.7-1.2

    // Wrapper handles positioning + scale (so animation transform isn't overridden)
    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.bottom = '0';
    wrapper.style.left = `${xPercent}%`;
    wrapper.style.transform = `scale(${scale})`;
    wrapper.style.transformOrigin = 'bottom center';

    const flower = document.createElement('div');
    const swayClass = Math.random() > 0.5 ? 'sway' : 'sway-wide';
    flower.className = `flower ${swayClass}`;
    flower.style.setProperty('--sway-duration', `${swayDuration}s`);
    flower.style.setProperty('--sway-delay', `${swayDelay}s`);
    flower.style.animationDelay = `${growDelay}s`;

    // Flower head with inline SVG
    const head = document.createElement('div');
    head.className = `flower-head flower-head-${type.className}`;
    head.innerHTML = type.svg(variant);

    // Stem
    const stem = document.createElement('div');
    stem.className = 'flower-stem';
    stem.style.height = `${stemHeight}px`;

    // Leaves (1-2 leaves)
    const leafCount = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < leafCount; i++) {
      const leaf = document.createElement('div');
      const side = i === 0 ? 'left' : 'right';
      leaf.className = `flower-leaf ${side}`;
      leaf.style.top = `${30 + Math.random() * 40}%`;
      stem.appendChild(leaf);
    }

    flower.appendChild(head);
    flower.appendChild(stem);
    wrapper.appendChild(flower);

    return wrapper;
  }

  // === Spawn batch of flowers for a screen ===
  const screenCounts = {
    1: 6,
    2: 10,
    3: 12,
    4: 14,
    5: 35
  };

  const spawnedScreens = new Set();

  function spawnFlowersForScreen(screenNum) {
    if (spawnedScreens.has(screenNum)) return;
    spawnedScreens.add(screenNum);

    const bed = document.getElementById('flowerBed');
    if (!bed) return;

    const count = screenCounts[screenNum] || 8;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
      const typeName = typeNames[Math.floor(Math.random() * typeNames.length)];
      const x = findFreePosition();
      const wrapper = createFlower(typeName, x);
      if (wrapper) {
        // Stagger the grow animation on the inner .flower element
        const delay = (i * 0.08) + Math.random() * 0.3;
        const flowerEl = wrapper.querySelector('.flower');
        if (flowerEl) flowerEl.style.animationDelay = `${delay}s`;
        fragment.appendChild(wrapper);
      }
    }

    bed.appendChild(fragment);
  }

  // Public API
  return {
    spawnFlowersForScreen,
    isScreenSpawned: (num) => spawnedScreens.has(num)
  };
})();
