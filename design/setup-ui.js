(() => {
'use strict';

try {
  if (!localStorage.getItem('nt1')) {
    const defaultState = {
      k: 2100, p: 130, f: 65, c: 240,
      entries: [],
      water: 0,
      waterTarget: 2000,
      goals: { mode: 'maintain' }
    };
    localStorage.setItem('nt1', JSON.stringify(defaultState));
  }
} catch (e) {}

const css = `
html body:has(#nav) {
  padding-left: 0 !important;
  padding-bottom: calc(96px + env(safe-area-inset-bottom, 0px)) !important;
}
html body #nav {
  position: fixed !important;
  top: auto !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  width: 100% !important;
  height: auto !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 16px calc(10px + env(safe-area-inset-bottom, 0px)) !important;
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  overflow: visible !important;
  z-index: 60;
  pointer-events: none;
}
#nav .setup-native-nav-item {
  display: none !important;
}
html body #nav .setup-wordnav {
  pointer-events: auto;
}
.welcome, #app > .welcome {
  display: none !important;
}
.setup-nav-orb-inner {
  position: relative !important;
}
.setup-sphere-layer {
  position: absolute;
  inset: 0;
  opacity: 0;
  transform: scale(0.8);
  transition: opacity 0.8s ease-in-out, transform 0.8s cubic-bezier(0.34, 1.3, 0.64, 1);
  pointer-events: none;
  will-change: opacity, transform;
}
.setup-sphere-layer.is-on {
  opacity: 1;
  transform: scale(1);
}
.setup-sphere-layer > svg {
  width: 100%;
  height: 100%;
  display: block;
}
`;

// Three identical glowing spheres; only the icon in the middle differs.
// Icons (barbell, fork and knife) are drawn in solid white: a gradient stroke on a perfectly horizontal/vertical
// line has a zero-size bounding box and is not rendered, which is why parts of them used to be missing.
const SPHERE_SVGS = {
  tracker: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="sphereGrad" cx="38%" cy="28%" r="70%" fx="32%" fy="22%">
      <stop offset="0%" stop-color="#454a4e"/>
      <stop offset="25%" stop-color="#1b1e21"/>
      <stop offset="70%" stop-color="#090a0c"/>
      <stop offset="100%" stop-color="#000000"/>
    </radialGradient>
    <radialGradient id="rimLight" cx="50%" cy="92%" r="45%">
      <stop offset="0%" stop-color="#2c3e35" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="neonGrad" x1="20%" y1="15%" x2="80%" y2="85%">
      <stop offset="0%" stop-color="#b4ff6b"/>
      <stop offset="45%" stop-color="#76e86c"/>
      <stop offset="100%" stop-color="#2ba859"/>
    </linearGradient>
    <linearGradient id="glossTop" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.0"/>
    </linearGradient>
    <linearGradient id="glossSide" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.0"/>
    </linearGradient>
    <filter id="neonGlow" x="-25%" y="-25%" width="150%" height="150%">
      <feGaussianBlur stdDeviation="5" result="blur1"/>
      <feGaussianBlur stdDeviation="12" result="blur2"/>
      <feMerge>
        <feMergeNode in="blur2"/>
        <feMergeNode in="blur1"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <clipPath id="sphereClip">
      <circle cx="256" cy="256" r="236"/>
    </clipPath>
  </defs>
  <g clip-path="url(#sphereClip)">
    <circle cx="256" cy="256" r="236" fill="url(#sphereGrad)"/>
    <circle cx="256" cy="256" r="236" fill="url(#rimLight)"/>
    <circle cx="256" cy="256" r="175" fill="#4ce66d" opacity="0.12" filter="url(#neonGlow)"/>
    <g fill="none" stroke="url(#neonGrad)" stroke-linecap="round" stroke-linejoin="round" filter="url(#neonGlow)">
      <path d="M 244 90 A 166 166 0 0 0 90 244 L 122 244" stroke-width="11"/>
      <path d="M 268 90 A 166 166 0 0 1 422 244" stroke-width="11"/>
      <path d="M 90 268 A 166 166 0 0 0 244 422 L 244 390" stroke-width="11"/>
      <path d="M 422 268 A 166 166 0 0 1 268 422 L 268 390" stroke-width="11"/>
      <path d="M 244 122 A 134 134 0 0 0 122 244" stroke-width="11"/>
      <path d="M 268 122 A 134 134 0 0 1 390 244 L 358 244" stroke-width="11"/>
      <path d="M 122 268 A 134 134 0 0 0 220 385" stroke-width="11"/>
      <path d="M 390 268 A 134 134 0 0 1 292 385" stroke-width="11"/>
      <path d="M 162 215 A 102 102 0 0 1 350 215" stroke-width="11"/>
      <path d="M 154 268 A 102 102 0 0 0 358 268" stroke-width="11"/>
      <path d="M 186 256 A 70 70 0 1 1 326 256 A 70 70 0 0 1 268 325 L 268 358" stroke-width="11"/>
      <path d="M 186 256 A 70 70 0 0 0 244 325 L 244 358" stroke-width="11"/>
      <path d="M 244 292 A 38 38 0 1 1 268 292" stroke-width="11"/>
      <circle cx="145" cy="215" r="7" fill="#0d1210" stroke-width="4.5"/>
      <circle cx="348" cy="188" r="7" fill="#0d1210" stroke-width="4.5"/>
      <circle cx="404" cy="212" r="7" fill="#0d1210" stroke-width="4.5"/>
      <circle cx="185" cy="340" r="7" fill="#0d1210" stroke-width="4.5"/>
      <circle cx="332" cy="336" r="7" fill="#0d1210" stroke-width="4.5"/>
    </g>
    <path d="M 118 112 C 165 44, 347 44, 394 112 C 345 78, 167 78, 118 112 Z" fill="url(#glossTop)"/>
    <path d="M 65 170 C 44 215, 44 275, 62 315 C 66 270, 68 215, 86 175 Z" fill="url(#glossSide)"/>
    <circle cx="256" cy="256" r="235" fill="none" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"/>
  </g>
</svg>`,
  sport: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="sphereGrad" cx="38%" cy="28%" r="70%" fx="32%" fy="22%">
      <stop offset="0%" stop-color="#454a4e"/>
      <stop offset="25%" stop-color="#1b1e21"/>
      <stop offset="70%" stop-color="#090a0c"/>
      <stop offset="100%" stop-color="#000000"/>
    </radialGradient>
    <radialGradient id="rimLight" cx="50%" cy="92%" r="45%">
      <stop offset="0%" stop-color="#2c3e35" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="neonGrad" x1="15%" y1="15%" x2="85%" y2="85%">
      <stop offset="0%" stop-color="#b4ff6b"/>
      <stop offset="45%" stop-color="#76e86c"/>
      <stop offset="100%" stop-color="#2ba859"/>
    </linearGradient>
    <linearGradient id="glossTop" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.0"/>
    </linearGradient>
    <linearGradient id="glossSide" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.0"/>
    </linearGradient>
    <filter id="neonGlow" x="-25%" y="-25%" width="150%" height="150%">
      <feGaussianBlur stdDeviation="4.5" result="blur1"/>
      <feGaussianBlur stdDeviation="12" result="blur2"/>
      <feMerge>
        <feMergeNode in="blur2"/>
        <feMergeNode in="blur1"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <clipPath id="sphereClip">
      <circle cx="256" cy="256" r="236"/>
    </clipPath>
  </defs>
  <g clip-path="url(#sphereClip)">
    <circle cx="256" cy="256" r="236" fill="url(#sphereGrad)"/>
    <circle cx="256" cy="256" r="236" fill="url(#rimLight)"/>
    <circle cx="256" cy="256" r="180" fill="#4ce66d" opacity="0.12" filter="url(#neonGlow)"/>
    <g fill="none" stroke="url(#neonGrad)" stroke-linecap="round" stroke-linejoin="round" filter="url(#neonGlow)">
      <path d="M 96 194 A 172 172 0 0 1 244 84 L 244 116" stroke-width="10"/>
      <path d="M 268 84 A 172 172 0 0 1 416 194" stroke-width="10"/>
      <path d="M 96 318 A 172 172 0 0 0 244 428 L 244 396" stroke-width="10"/>
      <path d="M 416 318 A 172 172 0 0 1 268 428 L 268 396" stroke-width="10"/>
      <path d="M 134 186 A 140 140 0 0 1 224 120" stroke-width="10"/>
      <path d="M 268 116 A 140 140 0 0 1 378 186" stroke-width="10"/>
      <path d="M 134 326 A 140 140 0 0 0 224 392" stroke-width="10"/>
      <path d="M 378 326 A 140 140 0 0 1 288 392" stroke-width="10"/>
      <path d="M 176 184 A 108 108 0 0 1 336 184" stroke-width="10"/>
      <path d="M 176 328 A 108 108 0 0 0 336 328" stroke-width="10"/>
      <path d="M 212 198 A 74 74 0 0 1 300 198" stroke-width="9"/>
      <path d="M 212 314 A 74 74 0 0 0 300 314" stroke-width="9"/>
      <circle cx="134" cy="186" r="6" fill="#0d1210" stroke-width="4"/>
      <circle cx="378" cy="186" r="6" fill="#0d1210" stroke-width="4"/>
      <circle cx="134" cy="326" r="6" fill="#0d1210" stroke-width="4"/>
      <circle cx="378" cy="326" r="6" fill="#0d1210" stroke-width="4"/>
      <circle cx="224" cy="120" r="5.5" fill="#0d1210" stroke-width="4"/>
      <circle cx="288" cy="392" r="5.5" fill="#0d1210" stroke-width="4"/>
    </g>
    <!-- Barbell, solid white -->
    <g fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round">
      <line x1="102" y1="256" x2="410" y2="256" stroke-width="11"/>
      <line x1="102" y1="244" x2="102" y2="268" stroke-width="7"/>
      <line x1="410" y1="244" x2="410" y2="268" stroke-width="7"/>
      <rect x="116" y="226" width="14" height="60" rx="5" fill="#0d1410" stroke-width="8"/>
      <rect x="138" y="212" width="16" height="88" rx="6" fill="#0d1410" stroke-width="8.5"/>
      <rect x="162" y="198" width="18" height="116" rx="6" fill="#0d1410" stroke-width="9"/>
      <rect x="332" y="198" width="18" height="116" rx="6" fill="#0d1410" stroke-width="9"/>
      <rect x="358" y="212" width="16" height="88" rx="6" fill="#0d1410" stroke-width="8.5"/>
      <rect x="382" y="226" width="14" height="60" rx="5" fill="#0d1410" stroke-width="8"/>
      <rect x="186" y="245" width="8" height="22" rx="3" fill="#ffffff" stroke="none"/>
      <rect x="318" y="245" width="8" height="22" rx="3" fill="#ffffff" stroke="none"/>
    </g>
    <path d="M 118 112 C 165 44, 347 44, 394 112 C 345 78, 167 78, 118 112 Z" fill="url(#glossTop)"/>
    <path d="M 65 170 C 44 215, 44 275, 62 315 C 66 270, 68 215, 86 175 Z" fill="url(#glossSide)"/>
    <circle cx="256" cy="256" r="235" fill="none" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"/>
  </g>
</svg>`,
  eat: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="sphereGrad" cx="38%" cy="28%" r="70%" fx="32%" fy="22%">
      <stop offset="0%" stop-color="#454a4e"/>
      <stop offset="25%" stop-color="#1b1e21"/>
      <stop offset="70%" stop-color="#090a0c"/>
      <stop offset="100%" stop-color="#000000"/>
    </radialGradient>
    <radialGradient id="rimLight" cx="50%" cy="92%" r="45%">
      <stop offset="0%" stop-color="#2c3e35" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="neonGrad" x1="15%" y1="15%" x2="85%" y2="85%">
      <stop offset="0%" stop-color="#b4ff6b"/>
      <stop offset="45%" stop-color="#76e86c"/>
      <stop offset="100%" stop-color="#2ba859"/>
    </linearGradient>
    <linearGradient id="glossTop" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.0"/>
    </linearGradient>
    <linearGradient id="glossSide" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.0"/>
    </linearGradient>
    <filter id="neonGlow" x="-25%" y="-25%" width="150%" height="150%">
      <feGaussianBlur stdDeviation="4.5" result="blur1"/>
      <feGaussianBlur stdDeviation="12" result="blur2"/>
      <feMerge>
        <feMergeNode in="blur2"/>
        <feMergeNode in="blur1"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <clipPath id="sphereClip">
      <circle cx="256" cy="256" r="236"/>
    </clipPath>
  </defs>
  <g clip-path="url(#sphereClip)">
    <circle cx="256" cy="256" r="236" fill="url(#sphereGrad)"/>
    <circle cx="256" cy="256" r="236" fill="url(#rimLight)"/>
    <circle cx="256" cy="256" r="180" fill="#4ce66d" opacity="0.12" filter="url(#neonGlow)"/>
    <g fill="none" stroke="url(#neonGrad)" stroke-linecap="round" stroke-linejoin="round" filter="url(#neonGlow)">
      <path d="M 244 84 A 172 172 0 0 0 84 244 L 116 244" stroke-width="10"/>
      <path d="M 268 84 A 172 172 0 0 1 428 244" stroke-width="10"/>
      <path d="M 84 268 A 172 172 0 0 0 244 428 L 244 396" stroke-width="10"/>
      <path d="M 428 268 A 172 172 0 0 1 268 428 L 268 396" stroke-width="10"/>
      <path d="M 244 116 A 140 140 0 0 0 116 244" stroke-width="10"/>
      <path d="M 268 116 A 140 140 0 0 1 396 244 L 364 244" stroke-width="10"/>
      <path d="M 116 268 A 140 140 0 0 0 212 389" stroke-width="10"/>
      <path d="M 396 268 A 140 140 0 0 1 300 389" stroke-width="10"/>
      <path d="M 180 180 A 108 108 0 0 0 180 332" stroke-width="9.5"/>
      <path d="M 332 180 A 108 108 0 0 1 332 332" stroke-width="9.5"/>
      <circle cx="138" cy="182" r="6" fill="#0d1210" stroke-width="4"/>
      <circle cx="374" cy="182" r="6" fill="#0d1210" stroke-width="4"/>
      <circle cx="138" cy="330" r="6" fill="#0d1210" stroke-width="4"/>
      <circle cx="374" cy="330" r="6" fill="#0d1210" stroke-width="4"/>
      <circle cx="212" cy="389" r="5.5" fill="#0d1210" stroke-width="4"/>
      <circle cx="300" cy="389" r="5.5" fill="#0d1210" stroke-width="4"/>
    </g>
    <!-- Fork and knife, solid white -->
    <g fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 200 166 L 200 208 C 200 226, 212 234, 220 234" stroke-width="8.5"/>
      <path d="M 240 166 L 240 208 C 240 226, 228 234, 220 234" stroke-width="8.5"/>
      <line x1="220" y1="166" x2="220" y2="234" stroke-width="8.5"/>
      <line x1="220" y1="234" x2="220" y2="346" stroke-width="10.5"/>
      <path d="M 298 258 L 298 166 C 276 174, 272 210, 272 252 L 298 258 Z" fill="#ffffff" fill-opacity="0.18" stroke-width="9"/>
      <line x1="298" y1="258" x2="298" y2="346" stroke-width="10.5"/>
    </g>
    <path d="M 118 112 C 165 44, 347 44, 394 112 C 345 78, 167 78, 118 112 Z" fill="url(#glossTop)"/>
    <path d="M 65 170 C 44 215, 44 275, 62 315 C 66 270, 68 215, 86 175 Z" fill="url(#glossSide)"/>
    <circle cx="256" cy="256" r="235" fill="none" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"/>
  </g>
</svg>`
};

// Each inline SVG gets its own id namespace so the three spheres never share gradients/filters
function uniqueSvg(svg, prefix) {
  return svg.replace(/(id="|url\(#)(sphereGrad|rimLight|neonGrad|glossTop|glossSide|neonGlow|sphereClip)/g, `$1${prefix}-$2`);
}

const ICON_PATHS = {
  sport: '<circle cx="5" cy="7" r="2"/><circle cx="19" cy="17" r="2"/><path d="m7 8 10 8M3 14l5-5m8 6 5-5"/>',
  eat: '<path d="M4 3v6a3 3 0 0 0 6 0V3M7 3v18M20 21V3c-4 2-5 8 0 9"/>',
  tracker: '<rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2v4M16 2v4M3 10h18m4 5 3 3 5-5"/>',
  questionnaire: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  report: '<path d="M4 3v18h17M8 16v-5M13 16V7M18 16V4"/>',
  settings: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>'
};

function createSvgIcon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.9');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.classList.add('setup-brand-icon');
  svg.innerHTML = ICON_PATHS[name] || ICON_PATHS.menu;
  return svg;
}

let nav, bar, panel, up, svgDoc, curvePath, neonTopBorder, clipRect, orb, orbInner, glow, queued = false;
let currentCx = null;
let currentTab = null;
let notchTimer = null;
const targets = new Map();
const workout = /\/workouts\.html$/.test(location.pathname);

function kind(b) {
  if (b.dataset.setupNavKind) return b.dataset.setupNavKind;
  const t = b.textContent.trim();
  if (b.dataset.workoutJournal !== undefined || /Трениров|Спорт|^Sport$/.test(t)) return 'sport';
  if (/Привыч|^Tracker$/.test(t)) return 'tracker';
  if (/Питан|Дневник|^Eat$/.test(t)) return 'eat';
  if (/Отч|Прогресс/.test(t)) return 'report';
  if (/Настро|Профиль/.test(t)) return 'settings';
  if (/Цел|цели|[Аа]нкета/.test(t)) return 'questionnaire';
  return null;
}

function active(b) {
  return !!b && (b.classList.contains('on') || b.classList.contains('active') || b.getAttribute('aria-current') === 'page');
}

function close() {
  if (panel) panel.hidden = true;
  if (up) up.setAttribute('aria-expanded', 'false');
}

function choose(name) {
  pending = null;
  close();
  try {
    sessionStorage.setItem('setup_active_tab', name);
  } catch (e) {}

  if (workout) {
    if (name === 'sport') return;
    location.href = 'index.html?setupDestination=' + encodeURIComponent(name);
    return;
  }

  const clickedBtn = bar?.querySelector(`[data-setup-destination="${name}"]`);
  if (clickedBtn && !clickedBtn.classList.contains('setup-menu-trigger')) {
    bar.querySelectorAll('[data-setup-destination]:not(.setup-menu-trigger)').forEach(btn => {
      btn.classList.toggle('on', btn === clickedBtn);
    });
    updateNotch(true);
  }

  const target = targets.get(name);
  if (target?.isConnected) {
    target.click();
    schedule();
  }
}

function button(name, label) {
  const b = document.createElement('button');
  b.type = 'button';
  b.dataset.setupDestination = name;
  b.dataset.setupLabel = label;
  b.setAttribute('role', 'menuitem');
  b.appendChild(createSvgIcon(name));
  const span = document.createElement('span');
  span.className = 'setup-brand-label';
  span.textContent = label;
  b.appendChild(span);
  b.addEventListener('click', () => choose(name));
  return b;
}

// Bowl: one continuous cubic Bezier curve, horizontal tangent at both ends and at the bottom,
// so there are no corners anywhere. Depth 42px; closest distance to the orb (r=29) is >= 33px.
const BOWL_DEPTH = 42;
const BOWL_TIGHT = 40;

function shoulderFor(w, cx) {
  return Math.max(56, Math.min(150, cx - 16, w - 16 - cx));
}

// Same wave on every tab (the one used for "Habits"). Where it does not fit next to the panel edge
// ("Sport"), the wave simply continues past the edge and is clipped by the rounded panel outline.
function generateNotchPaths(w, h, cx, S) {
  const a = S * 0.63;
  const ls = cx - S, rs = cx + S;
  const leftFits = ls >= 16, rightFits = rs <= w - 16;

  const startD = leftFits ? `M 0 16 C 0 6 6 0 16 0 L ${ls} 0` : `M ${ls} 0`;
  const endD = rightFits ? `L ${w - 16} 0 C ${w - 6} 0 ${w} 6 ${w} 16` : '';

  const topBorderD = `
    ${startD}
    C ${ls + a} 0, ${cx - BOWL_TIGHT} ${BOWL_DEPTH}, ${cx} ${BOWL_DEPTH}
    C ${cx + BOWL_TIGHT} ${BOWL_DEPTH}, ${rs - a} 0, ${rs} 0
    ${endD}
  `;

  const fullFillD = `
    M -20 0
    L ${ls} 0
    C ${ls + a} 0, ${cx - BOWL_TIGHT} ${BOWL_DEPTH}, ${cx} ${BOWL_DEPTH}
    C ${cx + BOWL_TIGHT} ${BOWL_DEPTH}, ${rs - a} 0, ${rs} 0
    L ${w + 20} 0
    L ${w + 20} ${h + 20}
    L -20 ${h + 20}
    Z
  `;

  return { fullFillD, topBorderD };
}

function drawNotch(w, h, cx) {
  const habitsBtn = bar.querySelector(':scope > [data-setup-destination="tracker"]');
  const habitsCx = habitsBtn ? habitsBtn.offsetLeft + habitsBtn.offsetWidth / 2 : cx;
  const S = shoulderFor(w, habitsCx);
  const { fullFillD, topBorderD } = generateNotchPaths(w, h, cx, S);
  curvePath.setAttribute('d', fullFillD);
  if (neonTopBorder) neonTopBorder.setAttribute('d', topBorderD);
  if (clipRect) {
    clipRect.setAttribute('x', '0');
    clipRect.setAttribute('y', '-4');
    clipRect.setAttribute('width', String(w));
    clipRect.setAttribute('height', String(h + 4));
  }
}

// Smooth swap of the sphere artwork: the old sphere fades/shrinks out while the new one fades/grows in
function setSphere(tab) {
  if (!orbInner || !SPHERE_SVGS[tab]) return;
  orbInner.querySelectorAll('.setup-sphere-layer').forEach(layer => {
    layer.classList.toggle('is-on', layer.dataset.sphere === tab);
  });
}

function mount() {
  bar = document.createElement('div');
  bar.className = 'setup-wordnav';

  const svgNs = 'http://www.w3.org/2000/svg';
  svgDoc = document.createElementNS(svgNs, 'svg');
  svgDoc.classList.add('setup-dock-svg');
  svgDoc.setAttribute('preserveAspectRatio', 'none');

  const defs = document.createElementNS(svgNs, 'defs');
  defs.innerHTML = `
    <linearGradient id="setupDockGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#102c20" stop-opacity="0.94"/>
      <stop offset="100%" stop-color="#0a2219" stop-opacity="0.98"/>
    </linearGradient>
    <linearGradient id="setupNeonContourGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#76e86c" stop-opacity="0.4"/>
      <stop offset="50%" stop-color="#b4ff6b" stop-opacity="1"/>
      <stop offset="100%" stop-color="#76e86c" stop-opacity="0.4"/>
    </linearGradient>
    <clipPath id="setupDockClip"><rect id="setupDockClipRect" x="0" y="-4" width="400" height="80" rx="16" ry="16"/></clipPath>
  `;
  svgDoc.appendChild(defs);
  clipRect = defs.querySelector('#setupDockClipRect');

  curvePath = document.createElementNS(svgNs, 'path');
  curvePath.setAttribute('fill', 'url(#setupDockGrad)');
  curvePath.setAttribute('stroke', 'rgba(255, 255, 255, 0.08)');
  curvePath.setAttribute('stroke-width', '1');
  curvePath.setAttribute('stroke-linejoin', 'round');
  curvePath.setAttribute('clip-path', 'url(#setupDockClip)');
  svgDoc.appendChild(curvePath);

  neonTopBorder = document.createElementNS(svgNs, 'path');
  neonTopBorder.setAttribute('fill', 'none');
  neonTopBorder.setAttribute('stroke', 'url(#setupNeonContourGrad)');
  neonTopBorder.setAttribute('stroke-width', '2.2');
  neonTopBorder.setAttribute('stroke-linecap', 'round');
  neonTopBorder.setAttribute('stroke-linejoin', 'round');
  neonTopBorder.setAttribute('clip-path', 'url(#setupDockClip)');
  svgDoc.appendChild(neonTopBorder);

  bar.appendChild(svgDoc);

  glow = document.createElement('div');
  glow.className = 'setup-nav-glow';
  bar.appendChild(glow);

  orb = document.createElement('div');
  orb.id = 'setup-orb';
  orb.className = 'setup-nav-orb';
  orbInner = document.createElement('div');
  orbInner.className = 'setup-nav-orb-inner';
  for (const key of ['sport', 'eat', 'tracker']) {
    const layer = document.createElement('div');
    layer.className = 'setup-sphere-layer';
    layer.dataset.sphere = key;
    layer.innerHTML = uniqueSvg(SPHERE_SVGS[key], 'sph-' + key);
    orbInner.appendChild(layer);
  }
  orb.appendChild(orbInner);
  bar.appendChild(orb);

  bar.append(button('sport', 'Спорт'), button('eat', 'Питание'), button('tracker', 'Привычки'));

  up = document.createElement('button');
  up.type = 'button';
  up.className = 'setup-menu-trigger';
  up.setAttribute('aria-expanded', 'false');
  up.setAttribute('aria-controls', 'setup-up-panel');
  up.setAttribute('aria-label', 'Меню');
  up.title = 'Меню';
  up.appendChild(createSvgIcon('menu'));

  panel = document.createElement('div');
  panel.id = 'setup-up-panel';
  panel.className = 'setup-up-panel';
  panel.hidden = true;
  panel.setAttribute('role', 'menu');
  panel.append(button('questionnaire', 'Моя анкета'), button('report', 'Отчёты'), button('settings', 'Настройки'));

  up.addEventListener('click', () => {
    const open = panel.hidden;
    panel.hidden = !open;
    up.setAttribute('aria-expanded', String(open));
    if (open) panel.querySelector('button')?.focus();
  });

  bar.append(up, panel);
  nav.append(bar);
}

// Bubble-in-water motion: slow sine ease, gentle lazy rise, side-to-side sway and a jelly wobble that fades out
function flyOrb(prevCx, cx) {
  const dur = 1150;
  const dist = cx - prevCx;
  const dir = dist >= 0 ? 1 : -1;
  const rise = 20 + Math.min(10, Math.abs(dist) * 0.04);
  const N = 72;
  const move = [];
  const jelly = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const e = 0.5 - 0.5 * Math.cos(Math.PI * t);
    const env = Math.sin(Math.PI * t);
    const x = prevCx + dist * e + Math.sin(Math.PI * 3 * t) * 5 * env * dir;
    const y = -env * rise + Math.sin(Math.PI * 4 * t) * 3 * env;
    move.push({ transform: `translate3d(${x}px, ${y}px, 0) translate(-50%, 0)` });
    const fade = Math.pow(1 - t, 1.4);
    const s = 0.075 * Math.sin(Math.PI * 2 * 3 * t) * (0.35 + env) * fade;
    const tilt = 5 * Math.sin(Math.PI * 2 * 1.5 * t) * fade * dir;
    jelly.push({ transform: `rotate(${tilt}deg) scale(${1 + s}, ${1 - s})` });
  }
  const opts = { duration: dur, easing: 'linear' };
  orb.animate(move, opts);
  if (glow) glow.animate(move, opts);
  orbInner.animate(jelly, opts);
  return dur;
}

function updateNotch(animated = true) {
  if (!bar || !curvePath || !orb) return;
  const barRect = bar.getBoundingClientRect();
  const w = bar.offsetWidth || barRect.width || 420;
  const h = bar.offsetHeight || barRect.height || 72;

  svgDoc.setAttribute('viewBox', `0 0 ${w} ${h}`);

  let activeBtn = bar.querySelector('[data-setup-destination].on:not(.setup-menu-trigger)');
  if (!activeBtn) {
    let saved = null;
    try {
      saved = sessionStorage.getItem('setup_active_tab');
    } catch (e) {}
    if (saved) {
      activeBtn = bar.querySelector(`:scope > [data-setup-destination="${saved}"]`);
    }
    if (!activeBtn) {
      activeBtn = bar.querySelector(':scope > [data-setup-destination="eat"]');
    }
  }

  if (activeBtn) {
    let cx = activeBtn.offsetLeft + (activeBtn.offsetWidth / 2);
    if (!cx || isNaN(cx)) {
      const bRect = activeBtn.getBoundingClientRect();
      if (bRect.width > 0) {
        cx = (bRect.left + bRect.width / 2) - barRect.left;
      }
    }

    if (cx && !isNaN(cx) && cx > 0) {
      const tabName = activeBtn.dataset.setupDestination;
      const isDifferent = currentCx !== null && Math.abs(currentCx - cx) > 4;

      bar.style.setProperty('--orb-x', `${cx}px`);
      clearTimeout(notchTimer);
      setSphere(tabName);

      if (animated && isDifferent && typeof orb.animate === 'function') {
        const prev = currentCx;
        const dur = flyOrb(prev, cx);
        notchTimer = setTimeout(() => drawNotch(w, h, cx), dur * 0.7);
      } else {
        drawNotch(w, h, cx);
      }

      currentTab = tabName;
      currentCx = cx;
    }
  }
}

const requestedDestination = new URLSearchParams(location.search).get('setupDestination');
let savedTab = null;
try {
  savedTab = sessionStorage.getItem('setup_active_tab');
} catch (e) {}
let pending = workout ? null : (requestedDestination || savedTab || 'eat');

function sportHeader() {
  const app = document.getElementById('app');
  if (!app) return;
  const section = !workout ? (active(targets.get('sport')) ? 'sport' : active(targets.get('tracker')) ? 'tracker' : null) : null;
  const owned = app.querySelector('[data-setup-sport-header],[data-setup-section-header]');
  if (!section) {
    owned?.remove();
    return;
  }
  const copy = section === 'sport' ? ['Ваш спорт · ваша энергия', 'Сила в движении. Тонус в теле.'] : ['Ваши привычки · ваш выбор', 'Маленькие шаги. К тому, что важно.'];
  const integratedHeading = section === 'sport' ? document.querySelector('#sport-section h1') : null;
  if (integratedHeading && integratedHeading.textContent.trim() === copy[1]) {
    app.querySelectorAll('[data-setup-sport-header],[data-setup-section-header]').forEach(header => header.remove());
    return;
  }
  let heading = app.querySelector('h1');
  if (!heading) {
    const header = document.createElement('header');
    header.dataset.setupSectionHeader = section;
    const eyebrow = document.createElement('div');
    eyebrow.className = 'eyebrow';
    eyebrow.textContent = copy[0];
    heading = document.createElement('h1');
    heading.textContent = copy[1];
    header.append(eyebrow, heading);
    app.prepend(header);
    return;
  }
  if (owned && owned.dataset.setupSectionHeader !== section) owned.dataset.setupSectionHeader = section;
  let eyebrow = heading.previousElementSibling;
  if (!eyebrow?.classList.contains('eyebrow')) {
    eyebrow = document.createElement('div');
    eyebrow.className = 'eyebrow';
    heading.before(eyebrow);
  }
  if (eyebrow.textContent !== copy[0]) eyebrow.textContent = copy[0];
  if (heading.textContent !== copy[1]) heading.textContent = copy[1];
}

function render() {
  queued = false;
  let current = document.getElementById('nav');
  if (!current && workout) {
    current = document.createElement('nav');
    current.id = 'nav';
    document.body.append(current);
  }
  if (!current) return;
  if (nav !== current || !bar?.isConnected) {
    nav = current;
    targets.clear();
    mount();
  }
  nav.setAttribute('aria-label', 'Основная навигация');
  for (const b of nav.querySelectorAll('button')) {
    if (bar.contains(b)) continue;
    const name = kind(b);
    if (name) {
      b.dataset.setupNavKind = name;
      b.classList.add('setup-native-nav-item');
      targets.set(name, b);
    }
  }
  for (const b of bar.querySelectorAll('[data-setup-destination]')) {
    const name = b.dataset.setupDestination, target = targets.get(name), on = workout ? name === 'sport' : active(target);
    const disabled = !workout && (!target?.isConnected || !!target.disabled);
    if (b.disabled !== disabled) b.disabled = disabled;
    if (b.classList.contains('on') !== on) b.classList.toggle('on', on);
    if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  }
  const extra = !workout && ['questionnaire', 'report', 'settings'].some(n => active(targets.get(n)));
  if (up.classList.contains('on') !== extra) up.classList.toggle('on', extra);

  if (pending && targets.get(pending)?.isConnected && !targets.get(pending).disabled) {
    const name = pending;
    pending = null;
    choose(name);
    if (requestedDestination) {
      const url = new URL(location.href);
      url.searchParams.delete('setupDestination');
      history.replaceState(history.state, '', url);
    }
  }
  sportHeader();
  requestAnimationFrame(() => updateNotch(false));
}

function schedule() {
  if (!queued) {
    queued = true;
    requestAnimationFrame(render);
  }
}

function start() {
  const style = document.createElement('style');
  style.id = 'setup-wordnav-style';
  style.textContent = css;
  document.getElementById(style.id)?.remove();
  document.head.append(style);
  render();

  const observer = new MutationObserver(records => {
    if (records.some(r => !bar?.contains(r.target))) schedule();
  });
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'disabled', 'aria-current'] });

  document.addEventListener('pointerdown', e => {
    if (!bar?.contains(e.target)) close();
  });
  document.addEventListener('focusin', e => {
    if (!bar?.contains(e.target)) close();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel && !panel.hidden) {
      close();
      up.focus();
    }
  });

  window.addEventListener('resize', () => updateNotch(false));
  window.addEventListener('load', () => setTimeout(() => updateNotch(false), 50));
  window.addEventListener('pagehide', () => observer.disconnect(), { once: true });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();
})();
