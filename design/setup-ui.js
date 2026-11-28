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
  display: none;
  pointer-events: none;
}
.setup-sphere-layer.is-on {
  display: block;
}
.setup-sphere-layer > svg {
  width: 100%;
  height: 100%;
  display: block;
}

/* ===== Quick actions popover (opened by the neon plus), small, anchored to the right corner ===== */
.sqm {
  --sqm-lime: #B6FF3B;
  --sqm-aqua: #38bdf8;
  --sqm-spring: cubic-bezier(0.22, 1.18, 0.36, 1);
  --sqm-smooth: cubic-bezier(0.22, 1, 0.36, 1);
  position: fixed;
  right: 12px;
  bottom: calc(92px + env(safe-area-inset-bottom, 0px));
  width: min(272px, calc(100vw - 24px));
  max-height: calc(100vh - 180px);
  overflow-y: auto;
  z-index: 65;
  padding: 12px;
  border-radius: 28px;
  background: linear-gradient(160deg, rgba(14, 44, 33, 0.9) 0%, rgba(5, 20, 15, 0.94) 100%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  backdrop-filter: blur(24px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.2), 0 18px 44px -8px rgba(0, 0, 0, 0.85), 0 0 30px -8px rgba(163, 255, 18, 0.25);
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
  color: #f3fcf7;
  transform-origin: 100% 100%;
  transition: opacity 0.26s var(--sqm-smooth), transform 0.38s var(--sqm-spring), visibility 0.26s;
  -webkit-tap-highlight-color: transparent;
}
@media (min-width: 1000px) {
  .sqm { top: 92px; bottom: auto; right: 24px; transform-origin: 100% 0; }
}
.sqm.is-closed {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translateY(14px) scale(0.9);
}
.sqm * { box-sizing: border-box; }
.sqm-grid {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.sqm-item {
  opacity: 1;
  transform: translateY(0) scale(1);
  transition: opacity 0.3s var(--sqm-smooth), transform 0.44s var(--sqm-spring), border-color 0.25s ease, box-shadow 0.25s ease;
  transition-delay: calc(var(--i, 0) * 28ms);
}
.sqm.is-closed .sqm-item {
  opacity: 0;
  transform: translateY(14px) scale(0.92);
  transition: opacity 0.14s ease, transform 0.18s ease;
  transition-delay: 0ms;
}
.sqm-tile {
  position: relative;
  appearance: none;
  -webkit-appearance: none;
  font: inherit;
  color: inherit;
  text-align: left;
  background: linear-gradient(152deg, rgba(20, 54, 41, 0.72) 0%, rgba(8, 27, 20, 0.66) 55%, rgba(12, 37, 28, 0.7) 100%);
  border: 1px solid rgba(255, 255, 255, 0.13);
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.22), inset 0 -1px 0 0 rgba(255, 255, 255, 0.04), 0 8px 18px -8px rgba(0, 0, 0, 0.7);
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  overflow: hidden;
}
.sqm-tile::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.02) 34%, transparent 62%);
  pointer-events: none;
}
.sqm-tile:active { transform: scale(0.95) !important; }
@media (hover: hover) {
  .sqm-tile:hover {
    border-color: rgba(163, 255, 18, 0.45);
    box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.26), 0 8px 20px -6px rgba(0, 0, 0, 0.7), 0 0 18px -4px rgba(163, 255, 18, 0.22);
  }
}
.sqm-pill {
  height: 44px;
  border-radius: 999px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.sqm-pill span.sqm-label {
  position: relative;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.015em;
  color: #f3fcf7;
  white-space: nowrap;
}
.sqm-ico {
  position: relative;
  width: 20px;
  height: 20px;
  flex: none;
  color: var(--sqm-lime);
  filter: drop-shadow(0 0 6px rgba(163, 255, 18, 0.38));
}
.sqm-scanner {
  height: 52px;
  border-radius: 999px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: linear-gradient(132deg, rgba(163, 255, 18, 0.28) 0%, rgba(14, 58, 39, 0.76) 48%, rgba(182, 255, 59, 0.22) 100%);
  border-color: rgba(182, 255, 59, 0.44);
  box-shadow: inset 0 1px 0 0 rgba(232, 255, 184, 0.4), inset 0 -1px 0 0 rgba(163, 255, 18, 0.15), 0 8px 20px -6px rgba(0, 0, 0, 0.65), 0 0 22px -6px rgba(163, 255, 18, 0.32);
}
.sqm-scanner .sqm-ico { width: 22px; height: 22px; }
.sqm-scanner span.sqm-label {
  position: relative;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.015em;
  color: #f7ffeb;
}
.sqm-duo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  align-items: center;
}
.sqm-round {
  aspect-ratio: 1 / 1;
  width: 100%;
  max-height: 44px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  padding: 0;
}
.sqm-water {
  grid-row: span 2;
  min-height: 104px;
  border-radius: 24px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
}
.sqm-water:hover { border-color: rgba(56, 189, 248, 0.5); }
.sqm-fill {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 0%;
  opacity: 0;
  background: linear-gradient(180deg, rgba(56, 189, 248, 0.42) 0%, rgba(16, 185, 129, 0.28) 52%, rgba(6, 95, 70, 0.42) 100%);
  border-top: 1.5px solid rgba(125, 211, 252, 0.75);
  box-shadow: 0 -8px 24px rgba(56, 189, 248, 0.34);
  transition: height 0.68s var(--sqm-spring), opacity 0.3s ease;
  pointer-events: none;
}
.sqm-wave {
  position: absolute;
  top: -9px;
  left: -50%;
  width: 200%;
  height: 16px;
  background: radial-gradient(ellipse at 50% 100%, rgba(186, 230, 253, 0.42) 0%, transparent 65%);
  animation: sqm-wave 3.6s ease-in-out infinite alternate;
}
@keyframes sqm-wave { 0% { transform: translateX(-8%); } 100% { transform: translateX(8%); } }
.sqm-water .sqm-glass {
  position: relative;
  width: 30px;
  height: 33px;
  color: var(--sqm-aqua);
  filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.45));
}
.sqm-water-count {
  position: relative;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  font-size: 12px;
  color: rgba(209, 250, 229, 0.65);
}
.sqm-water-count b { font-size: 14px; font-weight: 700; color: #fff; }
.sqm-reset {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 3;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(3, 11, 8, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(186, 230, 253, 0.85);
  opacity: 0;
  pointer-events: none;
  transform: scale(0.75);
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.sqm-reset.is-on { opacity: 1; pointer-events: auto; transform: scale(1); }
.sqm-reset svg { width: 12px; height: 12px; }
/* The Menu button is a neon plus; it turns into a cross while the popover is open */
html body #nav .setup-wordnav > button.setup-menu-trigger.sqm-open .setup-brand-icon {
  transform: rotate(45deg) !important;
}
`;

// Three identical glowing spheres; only the icon in the middle differs.
// Icons (barbell, fork and knife) are drawn in solid white and scaled to 68% around the sphere centre.
// (A gradient stroke on a perfectly horizontal/vertical line has a zero-size bounding box and is not rendered.)
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
    <linearGradient id="checkWhiteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f2f7f3"/>
      <stop offset="100%" stop-color="#d2ded6"/>
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
    <filter id="checkShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000000" flood-opacity="0.85"/>
      <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#b4ff6b" flood-opacity="0.3"/>
    </filter>
    <mask id="mazeCutout">
      <rect x="0" y="0" width="512" height="512" fill="#ffffff"/>
      <circle cx="256" cy="256" r="96" fill="#000000"/>
      <path transform="translate(256 256) scale(0.5) translate(-260 -251)" d="M 168 256 L 230 318 L 352 184" fill="none" stroke="#000000" stroke-width="64" stroke-linecap="round" stroke-linejoin="round"/>
    </mask>
    <clipPath id="sphereClip">
      <circle cx="256" cy="256" r="236"/>
    </clipPath>
  </defs>
  <g clip-path="url(#sphereClip)">
    <circle cx="256" cy="256" r="236" fill="url(#sphereGrad)"/>
    <circle cx="256" cy="256" r="236" fill="url(#rimLight)"/>
    <circle cx="256" cy="256" r="175" fill="#4ce66d" opacity="0.12" filter="url(#neonGlow)"/>
    <g mask="url(#mazeCutout)">
      <g fill="none" stroke="url(#neonGrad)" stroke-linecap="round" stroke-linejoin="round" filter="url(#neonGlow)">
        <path d="M 244 90 A 166 166 0 0 0 90 244 L 122 244" stroke-width="11"/>
        <path d="M 268 90 A 166 166 0 0 1 422 244" stroke-width="11"/>
        <path d="M 90 268 A 166 166 0 0 0 244 422 L 244 390" stroke-width="11"/>
        <path d="M 422 268 A 166 166 0 0 1 268 422 L 268 390" stroke-width="11"/>
        <path d="M 244 122 A 134 134 0 0 0 122 244" stroke-width="11"/>
        <path d="M 268 122 A 134 134 0 0 1 390 244 L 358 244" stroke-width="11"/>
        <path d="M 122 268 A 134 134 0 0 0 220 385" stroke-width="11"/>
        <path d="M 390 268 A 134 134 0 0 1 292 385" stroke-width="11"/>
        <path d="M 162 215 A 104 104 0 0 1 350 215" stroke-width="11"/>
        <path d="M 154 268 A 104 104 0 0 0 358 268" stroke-width="11"/>
        <circle cx="145" cy="215" r="7" fill="#0d1210" stroke-width="4.5"/>
        <circle cx="404" cy="212" r="7" fill="#0d1210" stroke-width="4.5"/>
        <circle cx="185" cy="340" r="7" fill="#0d1210" stroke-width="4.5"/>
        <circle cx="332" cy="336" r="7" fill="#0d1210" stroke-width="4.5"/>
      </g>
    </g>
    <!-- Check mark, half of the original size, centred on the sphere -->
    <g transform="translate(256 256) scale(0.5) translate(-260 -251)" filter="url(#checkShadow)">
      <path d="M 168 256 L 230 318 L 352 184" fill="none" stroke="url(#checkWhiteGrad)" stroke-width="38" stroke-linecap="square" stroke-linejoin="miter"/>
      <path d="M 170 248 L 230 308 L 348 178" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="square" stroke-linejoin="miter" opacity="0.85"/>
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
    <!-- Barbell, solid white, smaller -->
    <g transform="translate(256 256) scale(0.68) translate(-256 -256)" fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round">
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
    <!-- Fork and knife, solid white, smaller -->
    <g transform="translate(256 256) scale(0.68) translate(-259 -256)" fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round">
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
(() => {
  const swap = (key, m) => { let t = SPHERE_SVGS[key]; for (const [a, b] of m) t = t.split(a).join(b); SPHERE_SVGS[key] = t; };
  swap('sport', [['#b4ff6b', '#a6f6ff'], ['#76e86c', '#38e8ff'], ['#2ba859', '#0a9fbd'], ['#4ce66d', '#38e8ff']]);
  swap('tracker', [['#b4ff6b', '#e3b0f5'], ['#76e86c', '#bb6bd9'], ['#2ba859', '#7a36a0'], ['#4ce66d', '#bb6bd9']]);
})();


// Each inline SVG gets its own id namespace so the spheres never share gradients/filters/masks
function uniqueSvg(svg, prefix) {
  return svg.replace(/(id="|url\(#)(sphereGrad|rimLight|neonGrad|checkWhiteGrad|glossTop|glossSide|neonGlow|checkShadow|mazeCutout|sphereClip)/g, `$1${prefix}-$2`);
}

const ICON_PATHS = {
  questionnaire: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  report: '<path d="M4 3v18h17M8 16v-5M13 16V7M18 16V4"/>',
  settings: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>'
};

// Navigation button icons use the same drawings as the spheres (white), with heavier strokes for small size.
// Every shape sits inside <g stroke="#fff"> so the page-wide `stroke: currentColor` rule cannot recolour it.
const ICON_ART = {
  sport: {
    viewBox: '78 78 356 356',
    body: `<g fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round">
      <line x1="102" y1="256" x2="410" y2="256" stroke-width="17"/>
      <line x1="102" y1="236" x2="102" y2="276" stroke-width="15"/>
      <line x1="410" y1="236" x2="410" y2="276" stroke-width="15"/>
      <rect x="118" y="226" width="12" height="60" rx="5" fill="#0b2a21" stroke-width="15"/>
      <rect x="142" y="208" width="14" height="96" rx="6" fill="#0b2a21" stroke-width="15"/>
      <rect x="168" y="188" width="16" height="136" rx="6" fill="#0b2a21" stroke-width="15"/>
      <rect x="328" y="188" width="16" height="136" rx="6" fill="#0b2a21" stroke-width="15"/>
      <rect x="356" y="208" width="14" height="96" rx="6" fill="#0b2a21" stroke-width="15"/>
      <rect x="382" y="226" width="12" height="60" rx="5" fill="#0b2a21" stroke-width="15"/>
    </g>`
  },
  eat: {
    viewBox: '139 146 220 220',
    body: `<g fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 200 166 L 200 208 C 200 226, 212 234, 220 234" stroke-width="15"/>
      <path d="M 240 166 L 240 208 C 240 226, 228 234, 220 234" stroke-width="15"/>
      <line x1="220" y1="166" x2="220" y2="234" stroke-width="15"/>
      <line x1="220" y1="234" x2="220" y2="346" stroke-width="17"/>
      <path d="M 298 258 L 298 166 C 276 174, 272 210, 272 252 L 298 258 Z" fill="#ffffff" fill-opacity="0.2" stroke-width="15"/>
      <line x1="298" y1="258" x2="298" y2="346" stroke-width="17"/>
    </g>`
  },
  // Habits: a check mark inside a target (two concentric rings), like a completed goal
  tracker: {
    viewBox: '70 70 372 372',
    body: `<g fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="256" cy="256" r="170" stroke-width="17"/>
      <circle cx="256" cy="256" r="124" stroke-width="17"/>
      <path d="M 194 258 L 240 304 L 322 208" stroke-width="30"/>
    </g>`
  },
  // Menu: neon lime plus with a glow (rotates into a cross while the quick menu is open)
  menu: {
    viewBox: '0 0 24 24',
    body: `<g fill="none" stroke="#C8FF5A" stroke-linecap="round" stroke-width="2.8">
      <path d="M12 4.5v15M4.5 12h15"/>
    </g>`,
    glow: 'drop-shadow(0 0 2px rgba(214, 255, 120, 0.95)) drop-shadow(0 0 6px rgba(163, 255, 18, 0.9)) drop-shadow(0 0 12px rgba(118, 232, 108, 0.7))'
  }
};

function createSvgIcon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('setup-brand-icon');
  const art = ICON_ART[name];
  if (art) {
    svg.setAttribute('viewBox', art.viewBox);
    svg.innerHTML = art.body;
    if (art.glow) {
      svg.style.filter = art.glow;
      svg.style.overflow = 'visible';
    }
  } else {
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.9');
    svg.innerHTML = ICON_PATHS[name];
  }
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
}

/* ===== Quick actions popover ===== */
let quick = null;
let quickOpen = false;

const Q_ICON = {
  data: '<rect x="2.5" y="4.5" width="19" height="15" rx="3.5" fill="currentColor" fill-opacity="0.12"/><circle cx="8.5" cy="10.2" r="2.1"/><path d="M5.5 15.8a3.2 3.2 0 0 1 6 0"/><path d="M14.5 9.5h4"/><path d="M14.5 13h3"/>',
  reports: '<rect x="3" y="3.5" width="18" height="17" rx="3.5" fill="currentColor" fill-opacity="0.12"/><path d="M8 16v-3.5"/><path d="M12 16V8.5"/><path d="M16 16v-5.5"/>',
  sport: '<path d="M6.5 6.5v11"/><path d="M17.5 6.5v11"/><path d="M3.5 9v6"/><path d="M20.5 9v6"/><path d="M6.5 12h11"/>',
  habits: '<path d="M20 12a8 8 0 0 1-14.9 4"/><path d="M4 12a8 8 0 0 1 14.9-4"/><path d="M19.5 4.5V8h-3.5"/><path d="M4.5 19.5V16H8"/><path d="m9.2 12.2 1.9 1.9 3.8-4"/>',
  scanner: '<path d="M4 8V6a2 2 0 0 1 2-2h2"/><path d="M16 4h2a2 2 0 0 1 2 2v2"/><path d="M20 16v2a2 2 0 0 1-2 2h-2"/><path d="M8 20H6a2 2 0 0 1-2-2v-2"/><path d="M10 9.6V8.4"/><path d="M12 9.2V8"/><path d="M14 9.6V8.4"/><path d="M7.5 12h9a4.5 4.5 0 0 1-9 0Z" fill="currentColor" fill-opacity="0.22"/>',
  plus: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8"/><path d="M8 12h8"/>'
};

function qSvg(key, cls) {
  return '<svg class="sqm-ico' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + Q_ICON[key] + '</svg>';
}

function qMeal(i, meal) {
  return '<button type="button" class="sqm-item sqm-tile sqm-pill" data-q="meal:' + meal + '" style="--i:' + i + '">' + qSvg('plus') + '<span class="sqm-label">' + meal + '</span></button>';
}

function buildQuick() {
  const el = document.createElement('div');
  el.id = 'setup-quick-menu';
  el.className = 'sqm is-closed';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-label', 'Быстрые действия');
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML =
    '<div class="sqm-grid">' +
      '<button type="button" class="sqm-item sqm-tile sqm-pill" data-q="data" style="--i:0">' + qSvg('data') + '<span class="sqm-label">Данные</span></button>' +
      '<button type="button" class="sqm-item sqm-tile sqm-pill" data-q="reports" style="--i:1">' + qSvg('reports') + '<span class="sqm-label">Отчёты</span></button>' +
      '<div class="sqm-item sqm-tile sqm-water" id="sqm-water" role="button" tabindex="0" aria-label="Добавить 250 мл воды" data-q="water" style="--i:2">' +
        '<div class="sqm-fill" id="sqm-fill"><div class="sqm-wave"></div></div>' +
        '<button type="button" class="sqm-reset" id="sqm-reset" data-q="water-reset" aria-label="Сбросить воду" title="Сбросить">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>' +
        '</button>' +
        '<svg class="sqm-glass" viewBox="0 0 40 44" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 6h24l-3.2 31a3 3 0 0 1-3 2.7H14.2a3 3 0 0 1-3-2.7L8 6Z" fill="rgba(56, 189, 248, 0.12)"/><path d="M20 17v10"/><path d="M15 22h10"/></svg>' +
        '<div class="sqm-water-count"><b id="sqm-water-now">0</b> / <span id="sqm-water-goal">2</span> л</div>' +
      '</div>' +
      '<div class="sqm-item sqm-duo" style="--i:3">' +
        '<button type="button" class="sqm-tile sqm-round" data-q="sport" aria-label="Спорт" title="Спорт">' + qSvg('sport') + '</button>' +
        '<button type="button" class="sqm-tile sqm-round" data-q="habits" aria-label="Привычки" title="Привычки">' + qSvg('habits') + '</button>' +
      '</div>' +
      '<button type="button" class="sqm-item sqm-tile sqm-scanner" data-q="scanner" style="--i:4">' + qSvg('scanner') + '<span class="sqm-label">Сканер<br>тарелки</span></button>' +
      qMeal(5, 'Завтрак') + qMeal(6, 'Обед') + qMeal(7, 'Ужин') + qMeal(8, 'Перекус') +
    '</div>';

  el.addEventListener('click', e => {
    const hit = e.target.closest('[data-q]');
    if (!hit) return;
    e.stopPropagation();
    quickAction(hit.dataset.q);
  });
  el.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.id === 'sqm-water') {
      e.preventDefault();
      quickAction('water');
    }
  });
  return el;
}

function ensureQuick() {
  if (quick && quick.isConnected) return quick;
  document.getElementById('setup-quick-menu')?.remove();
  quick = buildQuick();
  document.body.appendChild(quick);
  return quick;
}

function waterNow() {
  try {
    const ml = Number((S.water || {})[day] || 0);
    const goal = Number((S.profile && S.profile.nutritionGoalSettings && S.profile.nutritionGoalSettings.waterMl) || S.waterGoal || 2000);
    return { ml: Number.isFinite(ml) ? ml : 0, goal: Number.isFinite(goal) && goal > 0 ? goal : 2000 };
  } catch (e) {
    return { ml: 0, goal: 2000 };
  }
}

function fmtL(ml) {
  return (ml / 1000).toLocaleString('ru-RU', { maximumFractionDigits: 2 });
}

function refreshQuickWater() {
  if (!quick) return;
  const { ml, goal } = waterNow();
  quick.querySelector('#sqm-water-now').textContent = fmtL(ml);
  quick.querySelector('#sqm-water-goal').textContent = fmtL(goal);
  const fill = quick.querySelector('#sqm-fill');
  fill.style.height = Math.min(ml / goal, 1) * 100 + '%';
  fill.style.opacity = ml > 0 ? '1' : '0';
  quick.querySelector('#sqm-reset').classList.toggle('is-on', ml > 0);
}

function openQuick() {
  ensureQuick();
  refreshQuickWater();
  quickOpen = true;
  quick.classList.remove('is-closed');
  quick.setAttribute('aria-hidden', 'false');
  if (up) {
    up.setAttribute('aria-expanded', 'true');
    up.classList.add('sqm-open');
  }
}

function closeQuick() {
  quickOpen = false;
  if (quick) {
    quick.classList.add('is-closed');
    quick.setAttribute('aria-hidden', 'true');
  }
  if (up) {
    up.setAttribute('aria-expanded', 'false');
    up.classList.remove('sqm-open');
  }
}

function toggleQuick() {
  if (quickOpen) closeQuick(); else openQuick();
}

function quickAction(key) {
  if (key === 'water') {
    if (typeof foodDiaryWaterAdd === 'function') {
      foodDiaryWaterAdd(250);
      setTimeout(refreshQuickWater, 60);
    }
    return;
  }
  if (key === 'water-reset') {
    const { ml } = waterNow();
    if (ml > 0 && typeof foodDiaryWaterAdd === 'function') {
      foodDiaryWaterAdd(-ml);
      setTimeout(refreshQuickWater, 60);
    }
    return;
  }
  closeQuick();
  const openMeal = meal => setTimeout(() => {
    if (typeof window.foodOpenMealWindow === 'function') window.foodOpenMealWindow(meal);
  }, 160);
  if (key === 'data') return choose('questionnaire');
  if (key === 'reports') return choose('report');
  if (key === 'sport') return choose('sport');
  if (key === 'habits') return choose('tracker');
  if (key === 'scanner') {
    let meal = 'Завтрак';
    try { if (typeof mealNow === 'function') meal = mealNow(); } catch (e) {}
    choose('eat');
    return openMeal(meal);
  }
  if (key.startsWith('meal:')) {
    choose('eat');
    return openMeal(key.slice(5));
  }
}

function choose(name) {
  pending = null;
  close();
  closeQuick();
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
  // Tell nav-brand.js the icon is already in place so it does not replace it with its own old icon
  b.dataset.setupDecorated = 'true';
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
// so there are no corners anywhere. Desktop depth 42px; on mobile the panel is only 58px tall, so the bowl is 26px deep.
const BOWL_DEPTH_DESKTOP = 42;
const BOWL_DEPTH_MOBILE = 26;
const BOWL_TIGHT = 40;

function shoulderFor(w, cx) {
  return Math.max(56, Math.min(150, cx - 16, w - 16 - cx));
}

// Same wave on every tab (the one used for "Habits"). Where it does not fit next to the panel edge
// ("Sport"), the wave simply continues past the edge and is clipped by the rounded panel outline.
function generateNotchPaths(w, h, cx, S) {
  const BOWL_DEPTH = window.innerWidth < 1000 ? BOWL_DEPTH_MOBILE : BOWL_DEPTH_DESKTOP;
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

// Instant sphere swap: no fade or scale animation, the right sphere is simply shown
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
  up.dataset.setupDecorated = 'true';
  up.setAttribute('aria-expanded', 'false');
  up.setAttribute('aria-controls', 'setup-quick-menu');
  up.setAttribute('aria-label', 'Меню');
  up.title = 'Меню';
  up.appendChild(createSvgIcon('menu'));

  // The old drop-up panel is kept (hidden) only for compatibility; the plus button opens the quick-actions popover
  panel = document.createElement('div');
  panel.id = 'setup-up-panel';
  panel.className = 'setup-up-panel';
  panel.hidden = true;
  panel.setAttribute('role', 'menu');
  panel.append(button('questionnaire', 'Моя анкета'), button('report', 'Отчёты'), button('settings', 'Настройки'));

  up.addEventListener('click', toggleQuick);

  bar.append(up, panel);
  nav.append(bar);
  ensureQuick();
  if (quickOpen) {
    up.setAttribute('aria-expanded', 'true');
    up.classList.add('sqm-open');
  }
}

// Slow, smooth hop from one button to another along a high arc (no sway, no wobble).
// Horizontal motion eases in and out; the height follows a sine arc; a soft squash happens only on landing.
function flyOrb(prevCx, cx) {
  const dur = 1600;
  const dist = cx - prevCx;
  const lift = Math.min(60, 38 + Math.abs(dist) * 0.06);
  const N = 80;
  const move = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const e = 0.5 - 0.5 * Math.cos(Math.PI * t);
    const x = prevCx + dist * e;
    const y = -Math.sin(Math.PI * t) * lift;
    move.push({ transform: `translate3d(${x}px, ${y}px, 0) translate(-50%, 0)` });
  }
  const opts = { duration: dur, easing: 'linear' };
  orb.animate(move, opts);
  if (glow) glow.animate(move, opts);
  orbInner.animate([
    { transform: 'scale(1,1)', offset: 0 },
    { transform: 'scale(1,1)', offset: 0.82 },
    { transform: 'scale(1.08,0.92)', offset: 0.92 },
    { transform: 'scale(0.98,1.02)', offset: 0.97 },
    { transform: 'scale(1,1)', offset: 1 }
  ], { duration: dur, easing: 'ease-in-out' });
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
        notchTimer = setTimeout(() => drawNotch(w, h, cx), dur * 0.75);
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
  if (quickOpen) refreshQuickWater();
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
    if (records.some(r => !bar?.contains(r.target) && !(quick && quick.contains(r.target)))) schedule();
  });
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'disabled', 'aria-current'] });

  document.addEventListener('pointerdown', e => {
    if (!bar?.contains(e.target)) close();
    // Tapping anywhere outside the popover and the plus button closes the quick menu
    if (quickOpen && quick && !quick.contains(e.target) && !(up && up.contains(e.target))) closeQuick();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && quickOpen) {
      closeQuick();
      up?.focus();
    }
  });

  window.addEventListener('resize', () => updateNotch(false));
  window.addEventListener('load', () => setTimeout(() => updateNotch(false), 50));
  window.addEventListener('pagehide', () => observer.disconnect(), { once: true });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();
})();
