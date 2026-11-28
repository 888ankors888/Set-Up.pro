/* Первое открытие: сразу раздел «Питание», окно-пояснение и подсказка, где найти «Мои данные». */
(() => {
'use strict';
if (window.setupFirstRun) return; window.setupFirstRun = true;
const KEY = 'setup_onboard';
const get = () => { try { return localStorage.getItem(KEY) || ''; } catch (e) { return 'done'; } };
const set = v => { try { localStorage.setItem(KEY, v); } catch (e) {} };
const css = document.createElement('style');
css.textContent = `
.fr-back{position:fixed;inset:0;z-index:9000;background:rgba(2,9,7,.78);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:18px}
.fr-card{width:100%;max-width:400px;background:#0c1d17;border:1px solid rgba(184,255,44,.35);border-radius:24px;padding:22px;color:#effff6;box-shadow:0 20px 60px rgba(0,0,0,.6),0 0 30px rgba(184,255,44,.15);font-family:system-ui,-apple-system,sans-serif}
.fr-card h2{margin:0 0 10px;font-size:22px;line-height:1.2}
.fr-card p{margin:0 0 10px;font-size:15px;line-height:1.5;color:#c3dccf}
.fr-btn{display:block;width:100%;border:0;border-radius:16px;padding:14px;font-size:16px;font-weight:700;background:#b8ff2c;color:#000;margin-top:14px;cursor:pointer}
.fr-btn.ghost{background:transparent;color:#9fbfae;border:1px solid rgba(255,255,255,.14);margin-top:8px;font-weight:600}
.fr-tip{position:fixed;z-index:9500;max-width:250px;background:#b8ff2c;color:#071108;border-radius:16px;padding:12px 34px 12px 14px;font:600 14px/1.35 system-ui,-apple-system,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.5),0 0 22px rgba(184,255,44,.6);animation:frpulse 1.6s ease-in-out infinite}
.fr-tip::after{content:"";position:absolute;left:var(--ax,50%);bottom:-8px;width:16px;height:16px;background:#b8ff2c;transform:translateX(-50%) rotate(45deg);border-radius:3px}
.fr-tip.below::after{bottom:auto;top:-8px}
.fr-tip button{position:absolute;top:6px;right:8px;border:0;background:none;color:#071108;font-size:20px;line-height:1;cursor:pointer}
@keyframes frpulse{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
`;
document.head.append(css);
let modal = null, tip = null, timer = 0;
function showModal() {
  if (modal) return;
  modal = document.createElement('div'); modal.className = 'fr-back';
  modal.innerHTML = `<div class="fr-card" role="dialog" aria-modal="true"><h2>Добро пожаловать в Set-Up</h2><p>Приложение работает по спортивным и нутриционным алгоритмам, а также включает много функций на основе ИИ.</p><p>Чтобы расчёты были точнее и персонально под вас, дополните информацию о себе в разделе «Мои данные». Пока используются примерные значения.</p><button class="fr-btn" data-fr="show">Показать, где это</button><button class="fr-btn ghost" data-fr="later">Позже</button></div>`;
  modal.addEventListener('click', e => { const b = e.target.closest('[data-fr]'); if (!b) return; modal.remove(); modal = null; if (b.dataset.fr === 'show') { set('hint'); startHint(); } else set('done'); });
  document.body.append(modal);
}
function stopHint() { clearInterval(timer); timer = 0; if (tip) { tip.remove(); tip = null; } }
function startHint() {
  if (tip) return;
  tip = document.createElement('div'); tip.className = 'fr-tip';
  tip.innerHTML = '<span></span><button type="button" aria-label="Закрыть">×</button>';
  tip.querySelector('button').addEventListener('click', () => { set('done'); stopHint(); });
  document.body.append(tip);
  const place = () => {
    if (!tip) return;
    const quick = document.getElementById('setup-quick-menu'), open = quick && !quick.classList.contains('is-closed');
    const target = open ? quick.querySelector('[data-q="data"]') : document.querySelector('#nav .setup-menu-trigger');
    if (!target) { tip.style.display = 'none'; return; }
    tip.style.display = '';
    tip.firstElementChild.textContent = open ? 'Здесь «Данные»: нажмите и заполните анкету о себе' : 'Нажмите «+», затем выберите «Данные»';
    const r = target.getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight, vw = innerWidth;
    let left = Math.min(vw - tw - 10, Math.max(10, r.left + r.width / 2 - tw / 2));
    const below = open; tip.classList.toggle('below', below);
    tip.style.left = left + 'px'; tip.style.top = (below ? r.bottom + 12 : r.top - th - 12) + 'px';
    tip.style.setProperty('--ax', (r.left + r.width / 2 - left) + 'px');
  };
  place(); timer = setInterval(place, 250);
}
document.addEventListener('click', e => {
  if (get() !== 'hint') return;
  if (e.target.closest('[data-q="data"]')) { set('done'); stopHint(); }
}, true);
function tick() {
  const st = get();
  if (st === 'done' || st === '') return;
  if (typeof S === 'undefined' || !S.profile || (typeof editing !== 'undefined' && editing)) return;
  if (st === 'pending') showModal();
  else if (st === 'hint') startHint();
}
setInterval(tick, 700);
})();
