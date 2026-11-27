/* Quick check-in window for today's habits. Opens from the "+" quick menu when the "Привычки" tile is pressed. */
(() => {
'use strict';
if (window.habitQuickInstalled) return;
window.habitQuickInstalled = true;

const COLORS = ['#B4F74A','#C084FC','#FF7A6B','#FFB347','#7C83FF','#4DA6FF','#2DD4BF','#EAD84A','#F472B6','#E2A76F','#22D3EE','#E879F9','#CBD5E1','#5BD16F'];
const EMOJI = ['💧','🌿','🥗','🚶','🌙','📚','🎯','💰','🤝','🏡','📵','🎨','📝','🌍'];
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')'; };
let dlg = null;

function groupIndex(d) { return Number.isInteger(d.group) ? d.group : Number(String(d.id).split(':')[0]); }
function isDue(schedule, date) {
  const day = dt(date).getDay();
  return schedule === 'daily' || schedule === 'weekdays' && day >= 1 && day <= 5 || schedule === 'weekends' && (day === 0 || day === 6);
}
function isDone(id, date) { return S.habitTracker?.records?.[date]?.[id]?.done === true; }

function habits() {
  const defs = window.foodHabitDefinitions?.() || [];
  const cfg = window.foodHabitSettings?.() || {};
  const custom = Array.isArray(S.customHabits) ? S.customHabits.filter(h => h && typeof h.id === 'string' && typeof h.title === 'string' && Number.isInteger(h.group)) : [];
  const out = [];
  for (const d of defs) {
    const c = cfg[d.id];
    if (c?.enabled !== true) continue;
    const g = groupIndex(d);
    out.push({ id: d.id, title: d.id === '13:4' ? (c.target || 'Своя привычка') : d.title, group: g, emoji: typeof d.image === 'string' && d.image && d.image.length <= 4 ? d.image : (EMOJI[g] || '✨'), schedule: c.schedule || 'daily' });
  }
  for (const h of custom) {
    const base = defs.find(d => d.group === h.group) || {};
    out.push({ id: h.id, title: h.title, group: h.group, emoji: typeof base.image === 'string' && base.image && base.image.length <= 4 ? base.image : (EMOJI[h.group] || '✨'), schedule: h.schedule || 'daily' });
  }
  return out;
}

function ensureStyle() {
  if (document.getElementById('hq-style')) return;
  const style = document.createElement('style');
  style.id = 'hq-style';
  style.textContent = `
html body dialog.hq-dlg{box-sizing:border-box;width:min(400px,calc(100vw - 20px))!important;max-width:calc(100vw - 20px)!important;height:auto!important;max-height:calc(100vh - 32px)!important;max-height:calc(100dvh - 32px)!important;margin:auto!important;padding:0!important;overflow-x:hidden!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;border-radius:26px;background:rgba(8,26,21,.97);-webkit-backdrop-filter:blur(22px);backdrop-filter:blur(22px);border:1px solid rgba(180,247,74,.22);box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 28px 80px -12px rgba(0,0,0,.9);color:#F2FBF7;font-family:Inter,system-ui,-apple-system,'Segoe UI',sans-serif}
html body dialog.hq-dlg[open]{display:block!important}
html body dialog.hq-dlg::backdrop{background:rgba(2,10,7,.6);backdrop-filter:blur(4px)}
.hq-dlg *{box-sizing:border-box}
.hq-head{position:sticky;top:0;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 18px 10px;background:rgba(8,26,21,.98)}
.hq-head h2{margin:0;color:#F2FBF7;font:700 20px/1.2 'Exo 2',system-ui,sans-serif}
.hq-head small{display:block;margin-top:3px;color:#93B4A8;font:500 12px/1.3 Inter,system-ui,sans-serif}
.hq-x{display:grid;place-items:center;flex:none;width:36px;height:36px;margin:0;padding:0;border-radius:50%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:#8FAEA3;font:400 22px/1 Inter,system-ui,sans-serif;cursor:pointer}
.hq-body{padding:2px 18px 18px}
.hq-bar{height:6px;margin:4px 0 12px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden}
.hq-bar i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#B4F74A,#92E619);box-shadow:0 0 10px rgba(180,247,74,.4);transition:width .35s ease}
.hq-list{display:flex;flex-direction:column;gap:8px;margin:0;padding:0;list-style:none}
.hq-row{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:12px;width:100%;margin:0;padding:11px 12px;border-radius:16px;background:linear-gradient(135deg,var(--hq-a),rgba(255,255,255,.02));border:1px solid var(--hq-b);color:#F2FBF7;font:inherit;text-align:left;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:border-color .2s,background .2s,transform .15s}
.hq-row:active{transform:scale(.985)}
.hq-row.is-done{border-color:var(--hq-c);background:var(--hq-a)}
.hq-ico{display:grid;place-items:center;width:34px;height:34px;border-radius:11px;background:var(--hq-a);box-shadow:inset 0 0 0 1px var(--hq-b);font:400 18px/1 'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif}
.hq-name{min-width:0;font:600 14px/1.3 Inter,system-ui,sans-serif;overflow-wrap:anywhere}
.hq-row.is-done .hq-name{color:#C9DDD4}
.hq-check{display:grid;place-items:center;width:28px;height:28px;border-radius:50%;border:2px solid #5D7D72;color:transparent;transition:background .2s,border-color .2s,color .2s}
.hq-row.is-done .hq-check{background:var(--hq-c);border-color:var(--hq-c);color:#041410}
.hq-empty{margin:6px 0 4px;color:#93B4A8;font:400 14px/1.5 Inter,system-ui,sans-serif}
.hq-all{display:flex;align-items:center;justify-content:center;gap:8px;margin:12px 0 0;padding:10px 12px;border-radius:14px;background:rgba(180,247,74,.12);border:1px solid rgba(180,247,74,.4);color:#B4F74A;font:600 13px/1.3 Inter,system-ui,sans-serif}
.hq-link{display:block;width:100%;margin:14px 0 0;padding:12px;border-radius:14px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);color:#F2FBF7;font:600 14px/1.2 Inter,system-ui,sans-serif;cursor:pointer}
.hq-dlg button:focus-visible{outline:2px solid #B4F74A;outline-offset:2px}
@media(prefers-reduced-motion:reduce){.hq-row,.hq-bar i,.hq-check{transition:none}}
`;
  document.head.append(style);
}

function check() { return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>'; }

function render() {
  const date = today();
  const list = habits().filter(h => isDue(h.schedule, date));
  const total = list.length, count = list.filter(h => isDone(h.id, date)).length;
  const pct = total ? Math.round(count / total * 100) : 0;
  const scroll = dlg.scrollTop;
  let body;
  if (!total) {
    body = '<p class="hq-empty">' + (habits().length ? 'На сегодня по расписанию привычек нет.' : 'Пока нет выбранных привычек. Добавьте их в разделе «Привычки».') + '</p>';
  } else {
    body = '<div class="hq-bar" role="img" aria-label="Выполнено ' + count + ' из ' + total + '"><i style="width:' + pct + '%"></i></div><ul class="hq-list">' + list.map(h => {
      const c = COLORS[h.group] || COLORS[0], on = isDone(h.id, date);
      return '<li><button type="button" class="hq-row' + (on ? ' is-done' : '') + '" data-hq-id="' + esc(h.id) + '" aria-pressed="' + on + '" style="--hq-c:' + c + ';--hq-a:' + rgba(c, .12) + ';--hq-b:' + rgba(c, .38) + '"><span class="hq-ico" aria-hidden="true">' + esc(h.emoji) + '</span><span class="hq-name">' + esc(h.title) + '</span><span class="hq-check" aria-hidden="true">' + check() + '</span></button></li>';
    }).join('') + '</ul>' + (count === total ? '<div class="hq-all">' + check() + 'Все привычки на сегодня выполнены</div>' : '');
  }
  dlg.innerHTML = '<div class="hq-head"><div><h2 id="hq-title">Привычки сегодня</h2><small>' + (total ? 'Выполнено ' + count + ' из ' + total : 'Быстрая отметка') + '</small></div><button type="button" class="hq-x" data-hq-close aria-label="Закрыть">×</button></div><div class="hq-body">' + body + '<button type="button" class="hq-link" data-hq-open>Открыть раздел «Привычки»</button></div>';
  dlg.scrollTop = scroll;
}

function build() {
  if (dlg) return dlg;
  ensureStyle();
  dlg = document.createElement('dialog');
  dlg.className = 'hq-dlg';
  dlg.setAttribute('aria-labelledby', 'hq-title');
  dlg.addEventListener('click', event => {
    const t = event.target;
    if (t === dlg || t.closest('[data-hq-close]')) { dlg.close(); return; }
    if (t.closest('[data-hq-open]')) { dlg.close(); window.foodHabitsGo?.(); return; }
    const row = t.closest('[data-hq-id]');
    if (row) {
      const id = row.dataset.hqId;
      window.foodHabitToggle?.(id, today());
      render();
      dlg.querySelector('[data-hq-id="' + (window.CSS?.escape ? CSS.escape(id) : id) + '"]')?.focus({ preventScroll: true });
    }
  });
  document.body.append(dlg);
  return dlg;
}

function openQuick() {
  build();
  render();
  document.querySelector('.setup-menu-trigger.sqm-open')?.click();
  if (!dlg.open) dlg.showModal();
  dlg.scrollTop = 0;
}
window.habitQuickOpen = openQuick;

/* Intercept the "Привычки" tile of the "+" quick menu */
document.addEventListener('click', event => {
  const tile = event.target.closest?.('.sqm button,.sqm [role="button"],.sqm a');
  if (!tile || typeof S === 'undefined' || !S.profile) return;
  const text = [tile.textContent, tile.getAttribute('aria-label'), tile.getAttribute('title'), ...Object.values(tile.dataset || {})].join(' ');
  if (!/привыч|habit|tracker/i.test(text)) return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  openQuick();
}, true);
})();
