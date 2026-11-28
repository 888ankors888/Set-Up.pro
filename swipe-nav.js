/* Переключение разделов «Спорт» - «Питание» - «Привычки» горизонтальным свайпом. */
(() => {
'use strict';
if (window.setupSwipeNav) return;
window.setupSwipeNav = true;
const ORDER = ['sport', 'eat', 'tracker'];
let sx = 0, sy = 0, st = 0, ok = false;
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
document.addEventListener('touchstart', e => {
  ok = e.touches.length === 1 && !blocked(e.target);
  if (!ok) return;
  sx = e.touches[0].clientX; sy = e.touches[0].clientY; st = Date.now();
}, {passive: true});
document.addEventListener('touchend', e => {
  if (!ok) return; ok = false;
  const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
  if (Math.abs(dx) < 70 || Math.abs(dy) > Math.abs(dx) * 0.6 || Date.now() - st > 700) return;
  const bar = document.getElementById('nav'); if (!bar) return;
  const on = bar.querySelector('[data-setup-destination].on:not(.setup-menu-trigger)');
  const i = on ? ORDER.indexOf(on.dataset.setupDestination) : -1;
  if (i < 0) return;
  const j = i + (dx < 0 ? 1 : -1);
  if (j < 0 || j >= ORDER.length) return;
  const btn = bar.querySelector('[data-setup-destination="' + ORDER[j] + '"]');
  if (btn && !btn.disabled) { try { navigator.vibrate && navigator.vibrate(8); } catch (_) {} btn.click(); window.scrollTo({top: 0}); }
}, {passive: true});
})();
