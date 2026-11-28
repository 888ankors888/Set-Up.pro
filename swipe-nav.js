/* Переключение разделов «Спорт» - «Питание» - «Привычки» горизонтальным свайпом. */
(() => {
'use strict';
if (window.setupSwipeNav) return;
window.setupSwipeNav = true;
const ORDER = ['sport', 'eat', 'tracker'];
let sx = 0, sy = 0, st = 0, ok = false, mode = '', dxNow = 0, busy = false, targets = [], bar = null, idx = -1;
function scrollableX(el) {
  for (let n = el; n && n !== document.body; n = n.parentElement) {
    if (n.scrollWidth > n.clientWidth + 4) {
      const ox = getComputedStyle(n).overflowX;
      if (ox === 'auto' || ox === 'scroll') return true;
    }
  }
  return false;
}
function blocked(t) {
  if (!t || !t.closest) return true;
  if (t.closest('input,textarea,select,dialog[open],.setup-calendar-week,.sc-pop,#nav,[data-no-swipe],[role=dialog],[aria-modal=true]')) return true;
  if (document.querySelector('dialog[open],[aria-modal=true]:not([hidden])')) return true;
  return scrollableX(t);
}

const W = () => window.innerWidth || document.documentElement.clientWidth || 390;
function collect() {
  const out = [];
  document.querySelectorAll('body > .w:not([hidden])').forEach(w => {
    if (w.id === 'sport-section') out.push(w);
    else [...w.children].forEach(c => { if (!c.hidden && !c.matches('.brand,.setup-home,script,style')) out.push(c); });
  });
  return out;
}
function place(list, x, anim) {
  list.forEach(el => {
    el.style.willChange = 'transform';
    el.style.transition = anim ? 'transform .26s cubic-bezier(.22,.8,.3,1),opacity .26s' : 'none';
    el.style.transform = x ? 'translate3d(' + x + 'px,0,0)' : '';
    el.style.opacity = x ? String(Math.max(.25, 1 - Math.abs(x) / W() * .6)) : '';
  });
}
function clear(list) { list.forEach(el => { el.style.transition = ''; el.style.transform = ''; el.style.opacity = ''; el.style.willChange = ''; }); }
function neighbour(dir) {
  bar = document.getElementById('nav'); if (!bar) return null;
  const on = bar.querySelector('[data-setup-destination].on:not(.setup-menu-trigger)');
  idx = on ? ORDER.indexOf(on.dataset.setupDestination) : -1;
  if (idx < 0) return null;
  const j = idx + dir;
  if (j < 0 || j >= ORDER.length) return null;
  const b = bar.querySelector('[data-setup-destination="' + ORDER[j] + '"]');
  return b && !b.disabled ? b : null;
}
document.addEventListener('touchstart', e => {
  if (busy) { ok = false; return; }
  ok = e.touches.length === 1 && !blocked(e.target);
  mode = '';
  if (!ok) return;
  sx = e.touches[0].clientX; sy = e.touches[0].clientY; st = Date.now(); dxNow = 0;
}, {passive: true});
document.addEventListener('touchmove', e => {
  if (!ok) return;
  const t = e.touches[0], dx = t.clientX - sx, dy = t.clientY - sy;
  if (!mode) {
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
    if (Math.abs(dx) > Math.abs(dy) * 1.2 && (neighbour(0), idx >= 0)) {
      mode = 'x'; targets = collect(); document.documentElement.style.overflowX = 'hidden';
    } else { mode = 'y'; ok = false; return; }
  }
  if (mode !== 'x') return;
  if (e.cancelable) e.preventDefault();
  const dir = dx < 0 ? 1 : -1, has = idx + dir >= 0 && idx + dir < ORDER.length;
  dxNow = has ? dx : dx * 0.25;
  place(targets, dxNow, false);
}, {passive: false});
function finish(e) {
  if (!ok || mode !== 'x') { ok = false; return; }
  ok = false;
  const dx = dxNow, dt = Math.max(1, Date.now() - st), v = Math.abs(dx) / dt, dir = dx < 0 ? 1 : -1;
  const go = (Math.abs(dx) > W() * 0.3 || (v > 0.5 && Math.abs(dx) > 40)) && neighbour(dir);
  const list = targets;
  if (!go) { place(list, 0, true); setTimeout(() => { clear(list); document.documentElement.style.overflowX = ''; }, 300); return; }
  const btn = neighbour(dir);
  busy = true;
  place(list, -dir * W(), true);
  setTimeout(() => {
    clear(list);
    try { navigator.vibrate && navigator.vibrate(8); } catch (_) {}
    btn.click(); window.scrollTo({top: 0});
    setTimeout(() => {
      const nl = collect();
      place(nl, dir * W() * 0.6, false);
      void document.body.offsetWidth;
      requestAnimationFrame(() => {
        place(nl, 0, true);
        setTimeout(() => { clear(nl); document.documentElement.style.overflowX = ''; busy = false; }, 300);
      });
    }, 70);
  }, 240);
}
document.addEventListener('touchend', finish, {passive: true});
document.addEventListener('touchcancel', finish, {passive: true});
})();
