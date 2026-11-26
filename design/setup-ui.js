(() => {
'use strict';
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
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.classList.add('setup-brand-icon');
  svg.innerHTML = ICON_PATHS[name] || ICON_PATHS.menu;
  return svg;
}

let nav, bar, panel, up, svgDoc, curvePath, orb, glow, orbIcon, queued = false;
let currentCx = null;
let currentTab = null;
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
  if (workout) {
    if (name === 'sport') return;
    location.href = 'index.html?setupDestination=' + encodeURIComponent(name);
    return;
  }

  // Pre-update UI and trigger jump immediately on user click
  const clickedBtn = bar.querySelector(`[data-setup-destination="${name}"]`);
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

function generateNotchPath(w, h, cx) {
  const notchRadius = 42;
  const depth = 28;
  const left = cx - notchRadius;
  const right = cx + notchRadius;

  return `
    M 0 16
    Q 0 0 16 0
    L ${Math.max(16, left - 12)} 0
    C ${left} 0, ${cx - 22} ${depth}, ${cx} ${depth}
    C ${cx + 22} ${depth}, ${right} 0, ${Math.min(w - 16, right + 12)} 0
    L ${w - 16} 0
    Q ${w} 0 ${w} 16
    L ${w} ${h - 16}
    Q ${w} ${h} ${w - 16} ${h}
    L 16 ${h}
    Q 0 ${h} 0 ${h - 16}
    Z
  `;
}

function mount() {
  bar = document.createElement('div');
  bar.className = 'setup-wordnav';

  // SVG Layer
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
  `;
  svgDoc.appendChild(defs);

  curvePath = document.createElementNS(svgNs, 'path');
  curvePath.setAttribute('fill', 'url(#setupDockGrad)');
  curvePath.setAttribute('stroke', 'rgba(255, 255, 255, 0.08)');
  curvePath.setAttribute('stroke-width', '1');
  svgDoc.appendChild(curvePath);
  bar.appendChild(svgDoc);

  // Orb Glow & Orb
  glow = document.createElement('div');
  glow.className = 'setup-nav-glow';
  bar.appendChild(glow);

  orb = document.createElement('div');
  orb.id = 'setup-orb';
  orb.className = 'setup-nav-orb';
  const orbInner = document.createElement('div');
  orbInner.className = 'setup-nav-orb-inner';
  orbIcon = document.createElement('div');
  orbIcon.className = 'setup-orb-icon';
  orbInner.appendChild(orbIcon);
  orb.appendChild(orbInner);
  bar.appendChild(orb);

  // Buttons: Sport, Eat, Habits
  bar.append(button('sport', 'Спорт'), button('eat', 'Питание'), button('tracker', 'Привычки'));

  // Separate Menu trigger
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

function updateNotch(animated = true) {
  if (!bar || !curvePath || !orb) return;
  const barRect = bar.getBoundingClientRect();
  const w = bar.offsetWidth || barRect.width || 420;
  const h = bar.offsetHeight || barRect.height || 72;

  svgDoc.setAttribute('viewBox', `0 0 ${w} ${h}`);

  const activeBtn = bar.querySelector('[data-setup-destination].on:not(.setup-menu-trigger)');
  if (activeBtn) {
    let cx = activeBtn.offsetLeft + (activeBtn.offsetWidth / 2);
    if (!cx || isNaN(cx)) {
      const bRect = activeBtn.getBoundingClientRect();
      cx = (bRect.left + bRect.width / 2) - barRect.left;
    }
    const tabName = activeBtn.dataset.setupDestination;

    orb.style.display = 'flex';
    glow.style.display = 'block';

    const isDifferent = currentCx !== null && Math.abs(currentCx - cx) > 4;

    bar.style.setProperty('--orb-x', `${cx}px`);
    curvePath.setAttribute('d', generateNotchPath(w, h, cx));

    if (currentTab !== tabName) {
      orbIcon.innerHTML = '';
      orbIcon.appendChild(createSvgIcon(tabName));
      currentTab = tabName;
    }

    if (animated && isDifferent) {
      orb.classList.remove('is-jumping');
      void orb.offsetWidth;
      orb.classList.add('is-jumping');
    }

    currentCx = cx;
  } else {
    orb.style.display = 'none';
    glow.style.display = 'none';
    curvePath.setAttribute('d', `M 0 16 Q 0 0 16 0 L ${w - 16} 0 Q ${w} 0 ${w} 16 L ${w} ${h - 16} Q ${w} ${h} ${w - 16} ${h} L 16 ${h} Q 0 ${h} 0 ${h - 16} Z`);
  }
}

const requestedDestination = new URLSearchParams(location.search).get('setupDestination');
let pending = workout ? null : (requestedDestination || 'eat');

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
  requestAnimationFrame(() => updateNotch(true));
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
