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
`;

const CYBER_SPHERE_SVG = `
<svg class="setup-cyber-sphere" viewBox="0 0 512 512" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
  <defs>
    <radialGradient id="cyberSphereGrad" cx="38%" cy="28%" r="70%" fx="32%" fy="22%">
      <stop offset="0%" stop-color="#454a4e"/>
      <stop offset="25%" stop-color="#1b1e21"/>
      <stop offset="70%" stop-color="#090a0c"/>
      <stop offset="100%" stop-color="#000000"/>
    </radialGradient>
    <radialGradient id="cyberRimLight" cx="50%" cy="92%" r="45%">
      <stop offset="0%" stop-color="#2c3e35" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="cyberNeonGrad" x1="20%" y1="15%" x2="80%" y2="85%">
      <stop offset="0%" stop-color="#b4ff6b"/>
      <stop offset="45%" stop-color="#76e86c"/>
      <stop offset="100%" stop-color="#2ba859"/>
    </linearGradient>
    <linearGradient id="cyberGlossTop" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.0"/>
    </linearGradient>
    <linearGradient id="cyberGlossSide" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.0"/>
    </linearGradient>
  </defs>

  <circle cx="256" cy="256" r="236" fill="url(#cyberSphereGrad)"/>
  <circle cx="256" cy="256" r="236" fill="url(#cyberRimLight)"/>
  <circle cx="256" cy="256" r="175" fill="#4ce66d" opacity="0.16"/>

  <g fill="none" stroke="url(#cyberNeonGrad)" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 244 90 A 166 166 0 0 0 90 244 L 122 244" stroke-width="12"/>
    <path d="M 268 90 A 166 166 0 0 1 422 244" stroke-width="12"/>
    <path d="M 90 268 A 166 166 0 0 0 244 422 L 244 390" stroke-width="12"/>
    <path d="M 422 268 A 166 166 0 0 1 268 422 L 268 390" stroke-width="12"/>

    <path d="M 244 122 A 134 134 0 0 0 122 244" stroke-width="12"/>
    <path d="M 268 122 A 134 134 0 0 1 390 244 L 358 244" stroke-width="12"/>
    <path d="M 122 268 A 134 134 0 0 0 220 385" stroke-width="12"/>
    <path d="M 390 268 A 134 134 0 0 1 292 385" stroke-width="12"/>

    <path d="M 162 215 A 102 102 0 0 1 350 215" stroke-width="12"/>
    <path d="M 154 268 A 102 102 0 0 0 358 268" stroke-width="12"/>

    <path d="M 186 256 A 70 70 0 1 1 326 256 A 70 70 0 0 1 268 325 L 268 358" stroke-width="12"/>
    <path d="M 186 256 A 70 70 0 0 0 244 325 L 244 358" stroke-width="12"/>

    <path d="M 244 292 A 38 38 0 1 1 268 292" stroke-width="12"/>

    <circle cx="145" cy="215" r="8" fill="#0d1210" stroke="#b4ff6b" stroke-width="4.5"/>
    <circle cx="348" cy="188" r="8" fill="#0d1210" stroke="#b4ff6b" stroke-width="4.5"/>
    <circle cx="404" cy="212" r="8" fill="#0d1210" stroke="#b4ff6b" stroke-width="4.5"/>
    <circle cx="185" cy="340" r="8" fill="#0d1210" stroke="#b4ff6b" stroke-width="4.5"/>
    <circle cx="332" cy="336" r="8" fill="#0d1210" stroke="#b4ff6b" stroke-width="4.5"/>
  </g>

  <path d="M 118 112 C 165 44, 347 44, 394 112 C 345 78, 167 78, 118 112 Z" fill="url(#cyberGlossTop)"/>
  <path d="M 65 170 C 44 215, 44 275, 62 315 C 66 270, 68 215, 86 175 Z" fill="url(#cyberGlossSide)"/>
  <circle cx="256" cy="256" r="235" fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="2.5"/>
</svg>
`;

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

let nav, bar, panel, up, svgDoc, curvePath, neonTopBorder, orb, orbInner, glow, queued = false;
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

// Socket: round bowl (radius 34, centre 8px below the top edge) with very long, gentle S-curve shoulders
const SOCKET_R = 34;
const SOCKET_CY = 8;

function generateNotchPaths(w, h, cx) {
  const l = cx - SOCKET_R, r = cx + SOCKET_R;
  const sh = Math.max(16, Math.min(70, cx - SOCKET_R - 18, w - 18 - cx - SOCKET_R));
  const ls = l - sh, rs = r + sh;

  const topBorderD = `
    M 0 16
    Q 0 0 16 0
    L ${Math.max(16, ls)} 0
    C ${ls + sh * 0.62} 0, ${l} ${SOCKET_CY * 0.12}, ${l} ${SOCKET_CY}
    A ${SOCKET_R} ${SOCKET_R} 0 1 0 ${r} ${SOCKET_CY}
    C ${r} ${SOCKET_CY * 0.12}, ${rs - sh * 0.62} 0, ${rs} 0
    L ${w - 16} 0
    Q ${w} 0 ${w} 16
  `;

  const fullFillD = `
    ${topBorderD}
    L ${w} ${h - 16}
    Q ${w} ${h} ${w - 16} ${h}
    L 16 ${h}
    Q 0 ${h} 0 ${h - 16}
    Z
  `;

  return { fullFillD, topBorderD };
}

function drawNotch(w, h, cx) {
  const { fullFillD, topBorderD } = generateNotchPaths(w, h, cx);
  curvePath.setAttribute('d', fullFillD);
  if (neonTopBorder) neonTopBorder.setAttribute('d', topBorderD);
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
  `;
  svgDoc.appendChild(defs);

  curvePath = document.createElementNS(svgNs, 'path');
  curvePath.setAttribute('fill', 'url(#setupDockGrad)');
  curvePath.setAttribute('stroke', 'rgba(255, 255, 255, 0.08)');
  curvePath.setAttribute('stroke-width', '1');
  curvePath.setAttribute('stroke-linejoin', 'round');
  svgDoc.appendChild(curvePath);

  neonTopBorder = document.createElementNS(svgNs, 'path');
  neonTopBorder.setAttribute('fill', 'none');
  neonTopBorder.setAttribute('stroke', 'url(#setupNeonContourGrad)');
  neonTopBorder.setAttribute('stroke-width', '2.2');
  neonTopBorder.setAttribute('stroke-linecap', 'round');
  neonTopBorder.setAttribute('stroke-linejoin', 'round');
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
  orbInner.innerHTML = CYBER_SPHERE_SVG;
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

function flyOrb(prevCx, cx) {
  const dur = 560;
  const lift = 34 + Math.min(22, Math.abs(cx - prevCx) * 0.08);
  const frames = [];
  const N = 28;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const e = t * t * (3 - 2 * t);
    const x = prevCx + (cx - prevCx) * e;
    const y = -Math.sin(Math.PI * t) * lift;
    frames.push({ transform: `translate3d(${x}px, ${y}px, 0) translate(-50%, 0)` });
  }
  const opts = { duration: dur, easing: 'linear' };
  orb.animate(frames, opts);
  if (glow) glow.animate(frames, opts);
  orbInner.animate([
    { transform: 'scale(1,1)', offset: 0 },
    { transform: 'scale(0.94,1.08)', offset: 0.25 },
    { transform: 'scale(1,1)', offset: 0.7 },
    { transform: 'scale(1.14,0.86)', offset: 0.88 },
    { transform: 'scale(0.97,1.04)', offset: 0.95 },
    { transform: 'scale(1,1)', offset: 1 }
  ], { duration: dur, easing: 'ease-out' });
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
      activeBtn = bar.querySelector(`[data-setup-destination="${saved}"]`);
    }
    if (!activeBtn) {
      activeBtn = bar.querySelector('[data-setup-destination="eat"]');
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

      if (animated && isDifferent && typeof orb.animate === 'function') {
        const prev = currentCx;
        const dur = flyOrb(prev, cx);
        notchTimer = setTimeout(() => drawNotch(w, h, cx), dur * 0.62);
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
