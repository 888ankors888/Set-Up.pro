/* ===== FOOD.PRO compact add-food window: search, AI, favorites, photo, barcode, catalog ===== */
(() => {
'use strict';
const MEALS = ['Завтрак', 'Обед', 'Ужин', 'Перекус'];
const openEstimate = window.foodOpenMealWindow;
const FAV_KEY = 'setup_fav_foods';
const E = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const n1 = v => (Math.round(v * 10) / 10).toFixed(1).replace('.0', '');
const norm = t => String(t || '').toLowerCase().replace(/ё/g, 'е');
const todayStr = () => (typeof today === 'function' ? today() : new Date().toISOString().slice(0, 10));
const say = m => { try { toast(m); } catch (e) {} };

let favs = [];
try { favs = JSON.parse(localStorage.getItem(FAV_KEY) || '[]').filter(f => f && f.n); } catch (e) { favs = []; }
const saveFavs = () => { try { localStorage.setItem(FAV_KEY, JSON.stringify(favs)); } catch (e) {} };

const st = { meal: 'Завтрак', date: '', view: 'search', q: '', cat: 'Все', sel: null, ext: null, stream: null, timer: null,
  ai: { text: '', rows: [], busy: false, err: '', questions: [] }, bc: { busy: false, msg: '' } };

function foods() { try { return typeof FD !== 'undefined' && Array.isArray(FD) ? FD : []; } catch (e) { return []; } }
function allFoods() {
  const base = foods(), names = new Set(base.map(f => f.n));
  return base.concat(favs.filter(f => !names.has(f.n)));
}
function findFood(name) {
  return foods().find(f => f.n === name) || favs.find(f => f.n === name) || (st.ext && st.ext.n === name ? st.ext : null);
}
const isFav = name => favs.some(f => f.n === name);
function toggleFav(name) {
  const food = findFood(name);
  if (!food) return;
  if (isFav(name)) favs = favs.filter(f => f.n !== name);
  else favs.push({ n: food.n, k: food.k, p: food.p, f: food.f, u: food.u });
  saveFavs();
  say(isFav(name) ? 'Добавлено в избранное' : 'Убрано из избранного');
  syncHearts();
  if (st.view === 'fav') paint();
}
function kindOf(f) { return f.dish || f.kind === 'dish' || f.type === 'dish' || f.kind === 'Блюдо' ? 'Блюдо' : 'Продукт'; }
function catOf(f) {
  const c = f.cat || f.category || f.t;
  if (typeof c === 'string' && c.length < 24) return c;
  if (f.p >= 15) return 'Белок';
  if (f.u >= 40) return 'Углеводы';
  if (f.f >= 30) return 'Жиры';
  if (f.k <= 60) return 'Лёгкое';
  return 'Другое';
}
const macros = (f, g) => { const m = g / 100; return { k: f.k * m, p: f.p * m, f: f.f * m, u: f.u * m }; };
function hl(name, q) {
  const s = String(name), i = q ? norm(s).indexOf(norm(q)) : -1;
  if (i < 0) return E(s);
  return E(s.slice(0, i)) + '<mark>' + E(s.slice(i, i + q.length)) + '</mark>' + E(s.slice(i + q.length));
}
const heartSvg = on => '<svg width="16" height="16" viewBox="0 0 24 24" fill="' + (on ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5s-7-4.4-9.2-8.6C1.1 8.6 3.2 5 6.8 5c2.1 0 3.8 1.1 5.2 2.8C13.4 6.1 15.1 5 17.2 5c3.6 0 5.7 3.6 4 6.9-2.2 4.2-9.2 8.6-9.2 8.6Z"/></svg>';

const ICONS = {
  ai: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 4.8L18.6 9.6l-4.8 1.8L12 16.2l-1.8-4.8-4.8-1.8 4.8-1.8L12 3Z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z"/></svg>',
  fav: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 20.5s-7-4.4-9.2-8.6C1.1 8.6 3.2 5 6.8 5c2.1 0 3.8 1.1 5.2 2.8C13.4 6.1 15.1 5 17.2 5c3.6 0 5.7 3.6 4 6.9-2.2 4.2-9.2 8.6-9.2 8.6Z"/></svg>',
  photo: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.95" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8a2 2 0 0 1 2-2h2l1.5-2h5L16 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  barcode: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.95" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V5a1 1 0 0 1 1-1h2"/><path d="M17 4h2a1 1 0 0 1 1 1v2"/><path d="M20 17v2a1 1 0 0 1-1 1h-2"/><path d="M7 20H5a1 1 0 0 1-1-1v-2"/><path d="M8 8v8"/><path d="M11 8v8"/><path d="M14 8v8"/><path d="M16.5 8v8"/></svg>',
  catalog: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.95" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6"/></svg>'
};
const TITLES = { ai: 'Поиск через ИИ', fav: 'Избранное', photo: 'Распознавание по фото', barcode: 'Сканер штрихкода', catalog: 'Каталог' };

const CSS = `
#food-add-dialog{--bg:#081713;--bg2:#0b1f1a;--s1:#0f2821;--s2:#112d25;--s3:#15372e;--line:rgba(178,232,207,.16);--lime:#c6f85c;--lime2:#d3ff73;--ink:#0a1914;--tx:#eef7f2;--mu:#98b5aa;--mu2:#64857a;
 width:min(420px,calc(100vw - 20px));max-height:min(660px,88dvh);margin:auto;padding:0;overflow:hidden;color:var(--tx);border:1px solid var(--line);border-radius:26px;
 background:linear-gradient(180deg,var(--bg2) 0%,var(--bg) 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 28px 70px -12px rgba(0,0,0,.88),0 0 36px -12px rgba(198,248,92,.22);font:14px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;letter-spacing:0}
#food-add-dialog[open]{display:flex;flex-direction:column;animation:famIn .3s cubic-bezier(.22,1.15,.36,1)}
@keyframes famIn{from{opacity:0;transform:translateY(14px) scale(.96)}to{opacity:1;transform:none}}
#food-add-dialog::backdrop{background:radial-gradient(circle at 50% 40%,rgba(6,18,14,.55),rgba(2,9,7,.84));backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
#food-add-dialog *{box-sizing:border-box}
#food-add-dialog button{font:inherit;color:inherit;cursor:pointer;border:0;background:none;padding:0;-webkit-tap-highlight-color:transparent}
.fam-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:16px 16px 10px 20px;flex:none}
.fam-eyebrow{font-size:10.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--lime)}
.fam-title{margin:3px 0 0;font-size:20px;font-weight:800;letter-spacing:-.02em;color:var(--tx)}
.fam-date{font-size:12px;color:var(--mu);margin-top:1px}
.fam-close{width:36px;height:36px;border-radius:50%;border:1px solid var(--line)!important;background:var(--s2)!important;color:var(--mu);display:flex;align-items:center;justify-content:center;flex:none;transition:all .2s}
.fam-close:hover{background:var(--s3)!important;color:var(--tx);border-color:rgba(198,248,92,.35)!important}
.fam-top{padding:0 20px;flex:none}
.fam-search{display:flex;align-items:center;gap:10px;height:48px;padding:0 12px 0 14px;border-radius:15px;background:var(--s2);border:1px solid var(--line);transition:border-color .2s,box-shadow .2s,background .2s}
.fam-search:focus-within{background:var(--s3);border-color:var(--lime);box-shadow:0 0 0 3px rgba(198,248,92,.14)}
.fam-search svg{color:var(--lime);flex:none}
#food-add-dialog input.fam-input{flex:1;min-width:0;width:100%;height:100%;padding:0;margin:0;background:transparent;border:0;outline:0;box-shadow:none;color:var(--tx);font-size:16px;font-weight:500;border-radius:0}
#food-add-dialog input.fam-input::placeholder{color:var(--mu2);font-size:14px}
.fam-clear{width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.09)!important;color:var(--mu);display:none!important;align-items:center;justify-content:center;flex:none}
.fam-clear.on{display:flex!important}
.fam-dock{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:12px}
.fam-ib{position:relative;height:48px;min-height:44px;border-radius:16px;background:var(--s2)!important;border:1px solid var(--line)!important;color:var(--tx);display:flex;align-items:center;justify-content:center;box-shadow:inset 0 1px 0 rgba(255,255,255,.05),0 6px 14px -6px rgba(0,0,0,.5);transition:transform .2s cubic-bezier(.22,1.15,.36,1),background .2s,border-color .2s,box-shadow .2s,color .2s}
.fam-ib.ai{background:linear-gradient(145deg,rgba(198,248,92,.16),var(--s2) 78%)!important;border-color:rgba(198,248,92,.34)!important;color:var(--lime);box-shadow:inset 0 1px 0 rgba(198,248,92,.2),0 0 18px -4px rgba(198,248,92,.3)}
@media(hover:hover){.fam-ib:hover{background:var(--s3)!important;border-color:rgba(198,248,92,.5)!important;color:var(--lime)}}
.fam-ib:active{transform:scale(.93)}
.fam-ib.on{background:linear-gradient(145deg,rgba(198,248,92,.24),var(--s2) 80%)!important;border-color:var(--lime)!important;color:var(--lime);box-shadow:0 0 0 2px rgba(198,248,92,.16),0 0 22px -4px rgba(198,248,92,.45)}
.fam-badge-n{position:absolute;top:-5px;right:-5px;min-width:18px;height:18px;padding:0 5px;border-radius:999px;background:var(--lime);color:var(--ink);font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(198,248,92,.45);pointer-events:none}
.fam-badge-n[hidden]{display:none}
.fam-work{flex:1 1 auto;min-height:0;overflow-y:auto;padding:12px 20px 20px;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
.fam-work:empty{padding:6px 0 4px}
.fam-work::-webkit-scrollbar{width:5px}.fam-work::-webkit-scrollbar-thumb{background:rgba(198,248,92,.24);border-radius:999px}
.fam-in{animation:famFade .22s cubic-bezier(.22,1.15,.36,1)}
@keyframes famFade{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
.fam-list{border:1px solid var(--line);border-radius:16px;background:var(--s1);overflow:hidden}
.fam-row{display:flex;align-items:center;gap:8px;padding:10px 10px 10px 12px;border-bottom:1px solid rgba(255,255,255,.06);cursor:pointer;transition:background .15s}
.fam-row:last-child{border-bottom:0}
.fam-row:hover{background:var(--s3)}
.fam-row-main{flex:1;min-width:0}
.fam-row-top{display:flex;align-items:center;gap:7px}
.fam-name{font-size:13.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fam-name mark{background:none;color:var(--lime);font-weight:800}
.fam-tag{flex:none;font-size:10px;font-weight:700;padding:1px 6px;border-radius:6px;background:rgba(74,216,235,.12);color:#4ad8eb;border:1px solid rgba(74,216,235,.24)}
.fam-tag.dish{background:rgba(198,248,92,.14);color:var(--lime);border-color:rgba(198,248,92,.25)}
.fam-macros{font-size:11.5px;color:var(--mu);margin-top:2px;font-variant-numeric:tabular-nums}
.fam-macros i{font-style:normal;opacity:.6}
.fam-heart,.fam-plus{width:34px;height:34px;flex:none;border-radius:11px;display:flex;align-items:center;justify-content:center;transition:all .18s}
.fam-heart{background:rgba(255,255,255,.04)!important;border:1px solid rgba(255,255,255,.09)!important;color:var(--mu2)}
.fam-heart:hover{color:var(--tx);border-color:rgba(198,248,92,.4)!important}
.fam-heart.on{background:rgba(198,248,92,.14)!important;border-color:rgba(198,248,92,.45)!important;color:var(--lime)}
.fam-plus{background:var(--lime)!important;color:var(--ink);font-size:20px;font-weight:800;line-height:1}
.fam-plus:hover{background:var(--lime2)!important}
.fam-aifb{display:flex;align-items:center;gap:10px;padding:12px;border-radius:16px;background:rgba(198,248,92,.08)!important;border:1px dashed rgba(198,248,92,.34)!important;cursor:pointer;margin-top:8px;color:var(--lime);font-weight:700;font-size:13px;text-align:left;width:100%}
.fam-aifb span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fam-sub{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}
.fam-back{font-size:12.5px;font-weight:700;color:var(--lime);padding:4px 0;min-height:32px}
.fam-label{font-size:12px;font-weight:600;color:var(--mu)}
.fam-empty{padding:22px 14px;border-radius:16px;border:1px dashed var(--line);background:rgba(11,31,26,.6);text-align:center;color:var(--mu);font-size:13px}
.fam-card{padding:14px;border-radius:18px;background:var(--s2);border:1px solid var(--line)}
.fam-pname{font-size:16px;font-weight:700;line-height:1.3;margin:6px 0 0}
.fam-per{font-size:11px;color:var(--mu);font-variant-numeric:tabular-nums;margin-top:2px}
.fam-kcal{display:flex;align-items:baseline;gap:6px;margin:12px 0 4px;font-variant-numeric:tabular-nums}
.fam-kcal b{font-size:34px;font-weight:800;letter-spacing:-.03em;color:var(--lime);line-height:1}
.fam-kcal span{font-size:13px;color:var(--mu)}
.fam-mgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}
.fam-mgrid div{padding:8px 6px;border-radius:12px;background:var(--bg2);border:1px solid rgba(255,255,255,.06);text-align:center;font-variant-numeric:tabular-nums}
.fam-mgrid small{display:block;font-size:10.5px;color:var(--mu)}
.fam-mgrid b{font-size:14px}
.fam-step{display:flex;align-items:center;gap:8px}
.fam-sb{width:44px;height:44px;border-radius:13px;background:var(--s3)!important;border:1px solid var(--line)!important;font-size:20px;font-weight:700;color:var(--tx);display:flex;align-items:center;justify-content:center;flex:none;transition:all .15s}
.fam-sb:hover{border-color:var(--lime)!important;color:var(--lime)}.fam-sb:active{transform:scale(.93)}
.fam-gwrap{flex:1;display:flex;align-items:center;gap:6px;height:44px;padding:0 12px;border-radius:13px;background:var(--bg2);border:1px solid var(--line);margin:0}
.fam-gwrap:focus-within{border-color:var(--lime);box-shadow:0 0 0 3px rgba(198,248,92,.14)}
#food-add-dialog input.fam-g{width:100%;min-width:0;height:100%;padding:0;margin:0;border:0;outline:0;background:transparent;box-shadow:none;color:var(--tx);font-size:16px;font-weight:700;text-align:center;border-radius:0}
.fam-gwrap span{color:var(--mu);font-size:13px}
.fam-chips{display:flex;gap:6px;margin:10px 0 12px;flex-wrap:wrap}
.fam-chip{flex:1 0 auto;min-height:34px;padding:0 12px;border-radius:999px;background:var(--bg2)!important;border:1px solid rgba(255,255,255,.09)!important;font-size:12px;font-weight:600;color:var(--mu);white-space:nowrap;transition:all .16s}
.fam-chip:hover{color:var(--tx);border-color:rgba(198,248,92,.35)!important}
.fam-chip.on{background:var(--lime)!important;border-color:var(--lime)!important;color:var(--ink);font-weight:800}
.fam-primary{width:100%;min-height:46px;border-radius:14px;background:var(--lime)!important;color:var(--ink);font-weight:800;font-size:14px;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 8px 22px -6px rgba(198,248,92,.5);transition:transform .18s cubic-bezier(.22,1.15,.36,1),background .18s,opacity .18s}
.fam-primary:hover:not(:disabled){background:var(--lime2)!important}.fam-primary:active:not(:disabled){transform:scale(.97)}.fam-primary:disabled{opacity:.42;cursor:not-allowed;box-shadow:none}
.fam-ghost{min-height:46px;padding:0 14px;border-radius:14px;background:var(--s2)!important;border:1px solid var(--line)!important;color:var(--tx);font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;gap:6px;transition:all .18s}
.fam-ghost:hover{border-color:rgba(198,248,92,.45)!important;color:var(--lime)}
#food-add-dialog textarea.fam-ta{width:100%;min-height:80px;resize:none;padding:11px 12px;border-radius:14px;background:var(--s2);border:1px solid var(--line);color:var(--tx);font:inherit;font-size:14px;outline:0;margin-bottom:8px;box-shadow:none}
#food-add-dialog textarea.fam-ta:focus{border-color:var(--lime);box-shadow:0 0 0 3px rgba(198,248,92,.13)}
#food-add-dialog input.fam-text{width:100%;height:42px;padding:0 12px;border-radius:12px;background:var(--s2);border:1px solid var(--line);color:var(--tx);font:inherit;font-size:14px;outline:0;box-shadow:none;margin-bottom:8px}
#food-add-dialog input.fam-text:focus{border-color:var(--lime)}
.fam-pchips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}
.fam-pchip{padding:6px 10px;border-radius:999px;background:var(--s2)!important;border:1px solid rgba(255,255,255,.09)!important;font-size:11.5px;color:var(--mu);text-align:left;transition:all .16s}
.fam-pchip:hover{border-color:rgba(198,248,92,.4)!important;color:var(--lime)}
.fam-load{display:flex;align-items:center;justify-content:center;gap:10px;padding:16px;margin-top:10px;border-radius:14px;background:var(--s2);border:1px solid rgba(198,248,92,.25);color:var(--lime);font-weight:700;font-size:13px}
.fam-ring{width:18px;height:18px;border-radius:50%;border:2px solid rgba(198,248,92,.25);border-top-color:var(--lime);animation:famSpin .75s linear infinite}
@keyframes famSpin{to{transform:rotate(360deg)}}
.fam-err{margin-top:8px;padding:10px 12px;border-radius:12px;background:rgba(255,107,122,.1);border:1px solid rgba(255,107,122,.3);color:#ffb3bb;font-size:12.5px}
.fam-note{margin-top:8px;padding:10px 12px;border-radius:12px;background:var(--s2);border:1px solid var(--line);color:var(--mu);font-size:12px}
.fam-airow{display:flex;align-items:center;gap:8px;padding:9px 10px;margin-bottom:7px;border-radius:14px;background:var(--s2);border:1px solid rgba(255,255,255,.07);transition:opacity .2s}
.fam-airow.off{opacity:.5}
.fam-chk{width:24px;height:24px;border-radius:7px;flex:none;border:1.5px solid var(--lime)!important;background:var(--lime)!important;color:var(--ink);display:flex;align-items:center;justify-content:center}
.fam-airow.off .fam-chk{background:transparent!important;color:transparent;border-color:var(--mu2)!important}
.fam-mini{display:flex;align-items:center;gap:4px;flex:none}
.fam-mini button{width:28px;height:28px;border-radius:8px;background:var(--bg2)!important;border:1px solid rgba(255,255,255,.1)!important;font-weight:700;display:flex;align-items:center;justify-content:center}
.fam-mini button:hover{border-color:var(--lime)!important;color:var(--lime)}
.fam-mini span{min-width:40px;text-align:center;font-size:12px;font-weight:700;font-variant-numeric:tabular-nums}
.fam-total{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;margin:10px 0;border-radius:12px;background:var(--bg2);border:1px solid var(--line);font-size:12px;color:var(--mu);font-variant-numeric:tabular-nums}
.fam-total b{color:var(--lime);font-size:14px}
.fam-vf{position:relative;height:178px;border-radius:18px;overflow:hidden;background:radial-gradient(circle at 50% 50%,rgba(198,248,92,.1),rgba(6,16,13,.96));border:1px solid var(--line);display:flex;align-items:center;justify-content:center;text-align:center;margin-bottom:10px;padding:12px}
.fam-vf video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.fam-vf video[hidden]{display:none}
.fam-vf i{position:absolute;width:22px;height:22px;border:0 solid var(--lime);z-index:2;pointer-events:none}
.fam-vf i:nth-of-type(1){top:12px;left:12px;border-width:2.5px 0 0 2.5px;border-top-left-radius:8px}
.fam-vf i:nth-of-type(2){top:12px;right:12px;border-width:2.5px 2.5px 0 0;border-top-right-radius:8px}
.fam-vf i:nth-of-type(3){bottom:12px;left:12px;border-width:0 0 2.5px 2.5px;border-bottom-left-radius:8px}
.fam-vf i:nth-of-type(4){bottom:12px;right:12px;border-width:0 2.5px 2.5px 0;border-bottom-right-radius:8px}
.fam-vf .laser{position:absolute;left:14%;right:14%;height:2px;background:linear-gradient(90deg,transparent,var(--lime),transparent);box-shadow:0 0 12px var(--lime);animation:famLaser 2s ease-in-out infinite;z-index:2}
@keyframes famLaser{0%,100%{top:24%}50%{top:76%}}
.fam-vf-msg{position:relative;z-index:1;color:var(--mu);font-size:12.5px;max-width:230px}
.fam-vf-msg b{display:block;color:var(--tx);font-size:13px;margin-bottom:3px}
.fam-two{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.fam-cats{display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;margin-bottom:4px}
.fam-cats::-webkit-scrollbar{height:3px}.fam-cats::-webkit-scrollbar-thumb{background:rgba(198,248,92,.24);border-radius:999px}
.fam-cats .fam-chip{flex:none;min-height:32px;font-size:11.5px}
@media(max-width:400px){.fam-head{padding:14px 14px 8px 16px}.fam-top{padding:0 16px}.fam-work{padding:12px 16px 18px}.fam-dock{gap:6px}}
@media(prefers-reduced-motion:reduce){#food-add-dialog[open],.fam-in{animation:none}}
`;

let dlg = null;
function ensure() {
  if (dlg && dlg.isConnected) return dlg;
  if (!document.getElementById('food-add-style')) {
    const s = document.createElement('style');
    s.id = 'food-add-style';
    s.textContent = CSS;
    document.head.appendChild(s);
  }
  dlg = document.createElement('dialog');
  dlg.id = 'food-add-dialog';
  dlg.setAttribute('aria-label', 'Добавить еду');
  dlg.innerHTML =
    '<div class="fam-head"><div><div class="fam-eyebrow">FOOD.PRO</div><h2 class="fam-title" id="fam-title">Добавить</h2><div class="fam-date" id="fam-date" hidden></div></div>' +
    '<button type="button" class="fam-close" data-act="close" aria-label="Закрыть"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button></div>' +
    '<div class="fam-top"><div class="fam-search"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>' +
    '<input id="fam-input" class="fam-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search" placeholder="Что вы скушали? Введите блюдо или продукт..." aria-label="Поиск блюда или продукта">' +
    '<button type="button" class="fam-clear" id="fam-clear" data-act="clear" aria-label="Очистить"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button></div>' +
    '<div class="fam-dock" role="toolbar" aria-label="Способы добавления">' +
    ['ai', 'fav', 'photo', 'barcode', 'catalog'].map(m => '<button type="button" class="fam-ib ' + m + '" data-act="mode" data-mode="' + m + '" title="' + TITLES[m] + '" aria-label="' + TITLES[m] + '" aria-pressed="false">' + ICONS[m] + (m === 'fav' ? '<span class="fam-badge-n" id="fam-favn" hidden>0</span>' : '') + '</button>').join('') +
    '</div></div><div class="fam-work" id="fam-work" aria-live="polite"></div>';
  document.body.appendChild(dlg);

  dlg.addEventListener('click', onClick);
  dlg.addEventListener('input', onInput);
  dlg.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.id === 'fam-bc-manual') { e.preventDefault(); lookupBarcode(e.target.value); }
    if (e.key === 'Enter' && e.target.id === 'fam-input' && st.view === 'search') {
      const first = matches()[0];
      if (first) { e.preventDefault(); openPortion(first.n, 'search'); }
    }
  });
  dlg.addEventListener('close', () => { stopCamera(); document.documentElement.classList.remove('meal-entry-open'); });
  dlg.addEventListener('cancel', () => stopCamera());
  const vv = window.visualViewport;
  if (vv) {
    const fit = () => { dlg.style.maxHeight = Math.max(320, Math.min(660, vv.height - 20)) + 'px'; };
    vv.addEventListener('resize', fit);
    fit();
  }
  return dlg;
}
const $ = sel => dlg.querySelector(sel);

function syncHearts() {
  if (!dlg) return;
  const n = favs.length, b = $('#fam-favn');
  if (b) { b.textContent = n > 99 ? '99+' : n; b.hidden = n === 0; }
  dlg.querySelectorAll('.fam-heart').forEach(h => {
    const on = isFav(h.dataset.key);
    h.classList.toggle('on', on);
    h.innerHTML = heartSvg(on);
    h.setAttribute('aria-pressed', String(on));
  });
}

function matches() {
  const q = norm(st.q.trim());
  if (!q) return [];
  return allFoods().filter(f => norm(f.n).includes(q)).sort((a, b) => {
    const ai = norm(a.n).indexOf(q), bi = norm(b.n).indexOf(q);
    return (ai === 0 ? 0 : 1) - (bi === 0 ? 0 : 1) || a.n.length - b.n.length;
  }).slice(0, 30);
}

function row(f, opts = {}) {
  const k = E(f.n), kind = kindOf(f), fav = isFav(f.n);
  return '<div class="fam-row" data-act="pick" data-key="' + k + '"><div class="fam-row-main"><div class="fam-row-top"><span class="fam-name">' + hl(f.n, opts.q) + '</span><span class="fam-tag' + (kind === 'Блюдо' ? ' dish' : '') + '">' + kind + '</span></div>' +
    '<div class="fam-macros">' + Math.round(f.k) + ' ккал · Б ' + n1(f.p) + ' · Ж ' + n1(f.f) + ' · У ' + n1(f.u) + ' <i>/ 100 г</i></div></div>' +
    '<button type="button" class="fam-heart' + (fav ? ' on' : '') + '" data-act="fav" data-key="' + k + '" aria-label="Избранное" aria-pressed="' + fav + '">' + heartSvg(fav) + '</button>' +
    (opts.plus ? '<button type="button" class="fam-plus" data-act="quick" data-key="' + k + '" aria-label="Добавить 100 г" title="Добавить 100 г">+</button>' : '') + '</div>';
}

function paint() {
  if (!dlg) return;
  const v = st.view, work = $('#fam-work');
  $('#fam-title').textContent = 'Добавить · ' + st.meal;
  const dateEl = $('#fam-date');
  if (st.date && st.date !== todayStr()) {
    let label = st.date; try { if (typeof fmt === 'function') label = fmt(st.date); } catch (e) {}
    dateEl.textContent = label; dateEl.hidden = false;
  } else dateEl.hidden = true;
  dlg.querySelectorAll('.fam-ib').forEach(b => { const on = b.dataset.mode === v; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
  $('#fam-clear').classList.toggle('on', st.q.length > 0);
  let html = '';
  if (v === 'search') {
    const q = st.q.trim(), list = matches();
    if (q) {
      html = (list.length ? '<div class="fam-list">' + list.map(f => row(f, { q })).join('') + '</div>' : '') +
        '<button type="button" class="fam-aifb" data-act="aifrom"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 4.8L18.6 9.6l-4.8 1.8L12 16.2l-1.8-4.8-4.8-1.8 4.8-1.8L12 3Z"/></svg><span>Рассчитать «' + E(q) + '» через ИИ</span></button>';
    }
  } else if (v === 'portion') html = portionHtml();
  else if (v === 'ai') html = aiHtml();
  else if (v === 'fav') html = '<div class="fam-sub"><button type="button" class="fam-back" data-act="back">← Назад</button><span class="fam-label">Избранное · ' + favs.length + '</span></div>' +
    (favs.length ? '<div class="fam-list">' + favs.map(f => row(f, { plus: true })).join('') + '</div>' : '<div class="fam-empty">Здесь появятся ваши любимые блюда и продукты.<br>Нажмите ♥ рядом с любой позицией.</div>');
  else if (v === 'photo') html = photoHtml();
  else if (v === 'barcode') html = barcodeHtml();
  else if (v === 'catalog') html = catalogHtml();
  work.innerHTML = html ? '<div class="fam-in">' + html + '</div>' : '';
  syncHearts();
  if (v === 'portion') updatePortion();
  if (v === 'photo') startCamera(false);
  if (v === 'barcode') startCamera(true);
}

/* ----- portion card ----- */
function openPortion(name, from) {
  const f = findFood(name);
  if (!f) return;
  stopCamera();
  st.sel = { name, grams: 100, from: from || 'search' };
  st.view = 'portion';
  paint();
}
function portionHtml() {
  const s = st.sel, f = s && findFood(s.name);
  if (!f) return '';
  const kind = kindOf(f), fav = isFav(f.n);
  return '<div class="fam-sub"><button type="button" class="fam-back" data-act="back">← Назад</button>' +
    '<button type="button" class="fam-heart' + (fav ? ' on' : '') + '" data-act="fav" data-key="' + E(f.n) + '" aria-label="Избранное">' + heartSvg(fav) + '</button></div>' +
    '<div class="fam-card"><span class="fam-tag' + (kind === 'Блюдо' ? ' dish' : '') + '">' + kind + '</span><h3 class="fam-pname">' + E(f.n) + '</h3>' +
    '<div class="fam-per">на 100 г: ' + Math.round(f.k) + ' ккал · Б ' + n1(f.p) + ' · Ж ' + n1(f.f) + ' · У ' + n1(f.u) + '</div>' +
    '<div class="fam-kcal"><b id="fam-pk">0</b><span>ккал</span></div>' +
    '<div class="fam-mgrid"><div><small>Белки</small><b id="fam-pp">0</b></div><div><small>Жиры</small><b id="fam-pf">0</b></div><div><small>Углеводы</small><b id="fam-pu">0</b></div></div>' +
    '<div class="fam-step"><button type="button" class="fam-sb" data-act="gstep" data-d="-25" aria-label="Минус 25 г">−</button><label class="fam-gwrap"><input class="fam-g" id="fam-g" type="number" inputmode="decimal" min="1" max="5000" step="5" value="' + s.grams + '" aria-label="Вес в граммах"><span>г</span></label><button type="button" class="fam-sb" data-act="gstep" data-d="25" aria-label="Плюс 25 г">+</button></div>' +
    '<div class="fam-chips" id="fam-presets">' + [100, 150, 200, 300].map(g => '<button type="button" class="fam-chip" data-act="gset" data-g="' + g + '">' + g + ' г</button>').join('') + '</div>' +
    '<button type="button" class="fam-primary" data-act="add">Добавить в ' + E(st.meal) + '</button></div>';
}
function updatePortion() {
  const s = st.sel, f = s && findFood(s.name);
  if (!f || !dlg) return;
  const m = macros(f, s.grams);
  const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
  set('#fam-pk', Math.round(m.k)); set('#fam-pp', n1(m.p) + ' г'); set('#fam-pf', n1(m.f) + ' г'); set('#fam-pu', n1(m.u) + ' г');
  dlg.querySelectorAll('#fam-presets .fam-chip').forEach(c => c.classList.toggle('on', Number(c.dataset.g) === s.grams));
  const add = dlg.querySelector('[data-act="add"]');
  if (add) add.disabled = !(s.grams > 0 && s.grams <= 5000);
}

/* ----- AI ----- */
const EXAMPLES = ['Овсянка на молоке с бананом и 2 варёных яйца', 'Гречка 200 г, куриная грудка 150 г, салат', 'Творог 5% 180 г и йогурт'];
function aiHtml() {
  const a = st.ai;
  const rows = a.rows.map((r, i) => {
    const f = r.name ? findFood(r.name) : null;
    const m = f ? macros(f, r.grams) : null;
    return '<div class="fam-airow' + (r.on && f ? '' : ' off') + '"><button type="button" class="fam-chk" data-act="aichk" data-i="' + i + '" aria-label="Выбрать"' + (f ? '' : ' disabled') + '><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></button>' +
      '<div style="flex:1;min-width:0"><div class="fam-name">' + E(f ? f.n : r.label) + '</div><div class="fam-macros">' + (f ? Math.round(m.k) + ' ккал · Б ' + n1(m.p) + ' · Ж ' + n1(m.f) + ' · У ' + n1(m.u) : 'нет в каталоге — уточните описание') + '</div></div>' +
      (f ? '<div class="fam-mini"><button type="button" data-act="aistep" data-i="' + i + '" data-d="-25" aria-label="Минус 25 г">−</button><span>' + r.grams + ' г</span><button type="button" data-act="aistep" data-i="' + i + '" data-d="25" aria-label="Плюс 25 г">+</button></div>' +
      '<button type="button" class="fam-heart' + (isFav(f.n) ? ' on' : '') + '" data-act="fav" data-key="' + E(f.n) + '" aria-label="Избранное" style="width:28px;height:28px">' + heartSvg(isFav(f.n)) + '</button>' : '') + '</div>';
  }).join('');
  let tk = 0, tp = 0, tf = 0, tu = 0, n = 0;
  a.rows.forEach(r => { const f = r.name && findFood(r.name); if (f && r.on) { const m = macros(f, r.grams); tk += m.k; tp += m.p; tf += m.f; tu += m.u; n++; } });
  return '<div class="fam-sub"><button type="button" class="fam-back" data-act="back">← Назад</button><span class="fam-label">Поиск через ИИ</span></div>' +
    
    '<textarea class="fam-ta" id="fam-ai-text" maxlength="2000" placeholder="Опишите, что вы съели: например, овсянка с бананом и 2 яйца">' + E(a.text) + '</textarea>' +
    '<div class="fam-pchips">' + EXAMPLES.map((t, i) => '<button type="button" class="fam-pchip" data-act="aiex" data-i="' + i + '">' + E(t) + '</button>').join('') + '</div>' +
    '<button type="button" class="fam-primary" data-act="airun"' + (a.busy ? ' disabled' : '') + '>' + (a.busy ? 'Анализирую…' : 'Распознать') + '</button>' +
    (a.busy ? '<div class="fam-load"><span class="fam-ring"></span>ИИ разбирает описание…</div>' : '') +
    (a.err ? '<div class="fam-err">' + E(a.err) + '</div>' : '') +
    (a.questions.length ? '<div class="fam-note">' + a.questions.map(E).join('<br>') + '</div>' : '') +
    (a.rows.length ? '<div style="margin-top:12px">' + rows + '<div class="fam-total"><span>Итого</span><span><b>' + Math.round(tk) + ' ккал</b> · Б ' + n1(tp) + ' · Ж ' + n1(tf) + ' · У ' + n1(tu) + '</span></div>' +
      '<button type="button" class="fam-primary" data-act="aiadd"' + (n ? '' : ' disabled') + '>Добавить выбранное (' + n + ')</button></div>' : '');
}
function bestMatch(row) {
  try {
    if (typeof aiCandidates === 'function') {
      const c = aiCandidates(row)[0];
      if (c && c.score > 0) return c.food.n;
    }
  } catch (e) {}
  const w = norm(row.name).split(/[^а-яa-z0-9]+/).filter(x => x.length > 2);
  let best = null, bs = 0;
  foods().forEach(f => { const s = w.reduce((v, x) => v + (norm(f.n).includes(x.slice(0, 5)) ? 1 : 0), 0); if (s > bs) { bs = s; best = f.n; } });
  return best;
}
async function runAi() {
  const a = st.ai;
  const ta = $('#fam-ai-text'); if (ta) a.text = ta.value;
  const tok = $('#fam-token'); if (tok && tok.value) { try { aiAccess = tok.value; } catch (e) {} }
  if (a.text.trim().length < 2) { a.err = 'Опишите еду: минимум два символа.'; paint(); return; }
  let access = ''; try { access = aiAccess; } catch (e) {}
  a.busy = true; a.err = ''; a.rows = []; a.questions = []; paint();
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 90000);
  try {
    const api = typeof FOOD_API !== 'undefined' ? FOOD_API : 'https://food-pro-api.onrender.com';
    const res = await fetch(api + '/api/food/parse', { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, access ? { Authorization: 'Bearer ' + access } : {}), body: JSON.stringify({ text: a.text.trim() }), signal: ctl.signal, credentials: 'omit', cache: 'no-store' });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error({ 401: 'Сервер требует пароль доступа.', 503: 'Сервер ещё не настроен.', 422: 'Сервер отклонил описание.', 502: 'ИИ не смог разобрать описание. Попробуйте позже.' }[res.status] || 'Ошибка сервера ' + res.status);
    if (!data || !Array.isArray(data.items)) throw new Error('Сервер вернул неизвестный формат ответа.');
    a.rows = data.items.map(r => {
      const name = bestMatch(r);
      return { label: r.name, name, grams: Math.round(typeof r.weight_g === 'number' && r.weight_g > 0 ? r.weight_g : 100), on: !!name };
    });
    a.questions = Array.isArray(data.questions) ? data.questions : [];
    if (!a.rows.length) a.err = 'Продукты не найдены. Уточните описание.';
  } catch (e) {
    a.err = e.name === 'AbortError' ? 'Сервер не ответил за 90 секунд.' : e instanceof TypeError ? 'Нет соединения с сервером.' : e.message;
  } finally { clearTimeout(timer); a.busy = false; paint(); }
}

/* ----- photo / barcode ----- */
function photoHtml() {
  return '<div class="fam-sub"><button type="button" class="fam-back" data-act="back">← Назад</button><span class="fam-label">Сфотографируйте тарелку</span></div>' +
    '<div class="fam-vf"><video id="fam-video" playsinline muted hidden></video><i></i><i></i><i></i><i></i><div class="fam-vf-msg" id="fam-vf-msg"><b>Наведите камеру на тарелку</b>Или загрузите фото из галереи</div></div>' +
    '<div class="fam-two"><button type="button" class="fam-primary" data-act="snap">Сделать снимок</button><button type="button" class="fam-ghost" data-act="gallery">Из галереи</button></div>' +
    '<input type="file" id="fam-file" accept="image/*" hidden>';
}
function barcodeHtml() {
  return '<div class="fam-sub"><button type="button" class="fam-back" data-act="back">← Назад</button><span class="fam-label">Штрихкод</span></div>' +
    '<div class="fam-vf"><video id="fam-video" playsinline muted hidden></video><i></i><i></i><i></i><i></i><div class="laser"></div><div class="fam-vf-msg" id="fam-vf-msg"><b>Наведите на штрихкод</b>EAN-13 · EAN-8 · UPC</div></div>' +
    '<label class="fam-label" for="fam-bc-manual">Или введите цифры вручную</label><div class="fam-two" style="grid-template-columns:1fr auto;margin-top:6px"><input class="fam-text" style="margin:0" id="fam-bc-manual" type="text" inputmode="numeric" maxlength="14" placeholder="4607148900000"><button type="button" class="fam-primary" style="width:auto;padding:0 18px" data-act="bcfind"' + (st.bc.busy ? ' disabled' : '') + '>' + (st.bc.busy ? '…' : 'Найти') + '</button></div>' +
    (st.bc.msg ? '<div class="fam-note">' + E(st.bc.msg) + '</div>' : '');
}
function stopCamera() {
  clearInterval(st.timer); st.timer = null;
  if (st.stream) { st.stream.getTracks().forEach(t => t.stop()); st.stream = null; }
}
async function startCamera(scan) {
  stopCamera();
  const v = $('#fam-video'), msg = $('#fam-vf-msg');
  if (!v || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    if (msg) msg.innerHTML = '<b>Камера недоступна</b>' + (scan ? 'Введите штрихкод вручную' : 'Загрузите фото из галереи');
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
    if (!dlg.open || (st.view !== 'photo' && st.view !== 'barcode')) { stream.getTracks().forEach(t => t.stop()); return; }
    st.stream = stream; v.srcObject = stream; v.hidden = false; await v.play().catch(() => {});
    if (msg) msg.style.display = 'none';
    if (scan && 'BarcodeDetector' in window) {
      const det = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] });
      st.timer = setInterval(async () => {
        if (!v.videoWidth) return;
        try { const r = await det.detect(v); if (r[0] && r[0].rawValue) { clearInterval(st.timer); lookupBarcode(r[0].rawValue); } } catch (e) {}
      }, 450);
    } else if (scan && msg) { msg.style.display = ''; msg.innerHTML = '<b>Автосканирование не поддерживается</b>Введите цифры вручную'; }
  } catch (e) {
    if (msg) { msg.style.display = ''; msg.innerHTML = '<b>Нет доступа к камере</b>' + (scan ? 'Введите штрихкод вручную' : 'Загрузите фото из галереи'); }
  }
}
function snap() {
  const v = $('#fam-video');
  if (!v || !v.videoWidth) { const f = $('#fam-file'); if (f) { f.onchange = () => { if (f.files && f.files[0]) sendPhoto(f.files[0]); }; f.click(); } return; }
  const c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight;
  c.getContext('2d').drawImage(v, 0, 0);
  c.toBlob(b => { if (b) sendPhoto(new File([b], 'meal.jpg', { type: 'image/jpeg' })); }, 'image/jpeg', 0.9);
}
async function sendPhoto(file) {
  if (typeof onPhoto !== 'function' || typeof openEstimate !== 'function') { say('Распознавание по фото сейчас недоступно'); return; }
  if (typeof ME !== 'undefined' && ME.busy) { say('Дождитесь завершения текущего расчёта'); return; }
  const input = document.createElement('input'); input.type = 'file';
  try { const dt = new DataTransfer(); dt.items.add(file); input.files = dt.files; } catch (e) { say('Не удалось передать фото'); return; }
  const meal = st.meal, date = st.date;
  stopCamera(); dlg.close();
  try { Object.assign(ME, { date, meal, text: '', sourceText: '', dishes: [], questions: [], error: '', demo: false, confirmed: false }); } catch (e) {}
  openEstimate(meal);
  try { await onPhoto(input); } catch (e) { say('Не удалось распознать фото'); }
}
async function lookupBarcode(raw) {
  const code = String(raw || '').replace(/\D/g, '');
  if (code.length < 8 || code.length > 14) { st.bc.msg = 'Штрихкод — от 8 до 14 цифр.'; paint(); return; }
  stopCamera(); st.bc.busy = true; st.bc.msg = 'Ищу продукт…'; paint();
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 9000);
  try {
    const found = foods().find(f => String(f.bc || f.barcode || '') === code);
    if (found) { st.bc.busy = false; st.bc.msg = ''; openPortion(found.n, 'barcode'); return; }
    const res = await fetch('https://world.openfoodfacts.org/api/v2/product/' + code + '.json?fields=product_name,nutriments', { signal: ctl.signal });
    const data = await res.json();
    const p = data && data.product, nu = p && p.nutriments;
    if (!p || !nu || !(nu['energy-kcal_100g'] >= 0) || !p.product_name) throw new Error('nf');
    st.ext = { n: p.product_name, k: Number(nu['energy-kcal_100g']) || 0, p: Number(nu.proteins_100g) || 0, f: Number(nu.fat_100g) || 0, u: Number(nu.carbohydrates_100g) || 0 };
    st.bc.busy = false; st.bc.msg = '';
    openPortion(st.ext.n, 'barcode');
  } catch (e) {
    st.bc.busy = false; st.bc.msg = e.message === 'nf' ? 'Продукт с таким штрихкодом не найден.' : 'Не удалось выполнить поиск. Проверьте соединение.';
    if (st.view === 'barcode') { paint(); }
  } finally { clearTimeout(timer); }
}

/* ----- catalog ----- */
function catalogHtml() {
  const all = allFoods(), q = norm(st.q.trim());
  const counts = {}; all.forEach(f => { const c = catOf(f); counts[c] = (counts[c] || 0) + 1; });
  const cats = ['Все', 'Избранное'].concat(Object.keys(counts).sort((a, b) => counts[b] - counts[a]));
  let list = all;
  if (st.cat === 'Избранное') list = favs; else if (st.cat !== 'Все') list = all.filter(f => catOf(f) === st.cat);
  if (q) list = list.filter(f => norm(f.n).includes(q));
  const shown = list.slice(0, 120);
  return '<div class="fam-sub"><button type="button" class="fam-back" data-act="back">← Назад</button><span class="fam-label">' + list.length + ' позиций</span></div>' +
    '<div class="fam-cats">' + cats.map(c => '<button type="button" class="fam-chip' + (c === st.cat ? ' on' : '') + '" data-act="cat" data-cat="' + E(c) + '">' + E(c) + '</button>').join('') + '</div>' +
    (shown.length ? '<div class="fam-list">' + shown.map(f => row(f, { plus: true, q: st.q.trim() })).join('') + '</div>' : '<div class="fam-empty">Ничего не найдено.</div>');
}

/* ----- saving ----- */
function commit(items, keepOpen, message) {
  const list = items.filter(i => i.food && i.grams > 0);
  if (!list.length) return false;
  const time = new Date().toTimeString().slice(0, 5), r = n => Math.round(n * 10) / 10;
  const added = list.map(({ food, grams }) => { const m = grams / 100; return { id: crypto.randomUUID(), date: st.date, time, meal: st.meal, name: food.n, g: r(grams), k: r(food.k * m), p: r(food.p * m), f: r(food.f * m), c: r(food.u * m), thumb: '' }; });
  const next = { ...S, entries: [...S.entries, ...added] };
  try { localStorage.setItem('nt1', JSON.stringify(next)); } catch (e) { say('Не удалось сохранить. Освободите память браузера.'); return false; }
  S = next;
  if (!keepOpen) { stopCamera(); dlg.close(); }
  day = st.date; tab = 'diary';
  try { render(); } catch (e) {}
  say(message || (added.length > 1 ? 'Записано позиций: ' + added.length : added[0].name + ' · ' + added[0].g + ' г → ' + st.meal));
  return true;
}

/* ----- events ----- */
function setView(v) {
  if (st.view === 'photo' || st.view === 'barcode') stopCamera();
  st.view = v; paint();
}
function onInput(e) {
  const t = e.target;
  if (t.id === 'fam-input') {
    st.q = t.value;
    if (st.view !== 'search' && st.view !== 'catalog') { stopCamera(); st.view = 'search'; }
    paint();
  } else if (t.id === 'fam-g' && st.sel) {
    const g = Number(t.value);
    st.sel.grams = Number.isFinite(g) ? g : 0; updatePortion();
  } else if (t.id === 'fam-ai-text') st.ai.text = t.value;
}
function onClick(e) {
  if (e.target === dlg) { dlg.close(); return; }
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const act = el.dataset.act, key = el.dataset.key;
  if (act === 'close') dlg.close();
  else if (act === 'clear') { st.q = ''; $('#fam-input').value = ''; if (st.view === 'portion') st.view = 'search'; paint(); $('#fam-input').focus(); }
  else if (act === 'mode') {
    const m = el.dataset.mode;
    if (st.view === m) setView('search');
    else { if (st.view === 'photo' || st.view === 'barcode') stopCamera(); st.view = m; if (m === 'barcode') st.bc.msg = ''; paint(); }
  }
  else if (act === 'back') { const from = st.view === 'portion' ? (st.sel && st.sel.from) || 'search' : 'search'; setView(from); }
  else if (act === 'fav') { e.stopPropagation(); toggleFav(key); }
  else if (act === 'quick') { e.stopPropagation(); const f = findFood(key); if (f) commit([{ food: f, grams: 100 }], true); }
  else if (act === 'pick') openPortion(key, st.view === 'portion' ? 'search' : st.view);
  else if (act === 'gstep' && st.sel) { st.sel.grams = Math.max(0, Math.min(5000, (Number(st.sel.grams) || 0) + Number(el.dataset.d))); const g = $('#fam-g'); if (g) g.value = st.sel.grams; updatePortion(); }
  else if (act === 'gset' && st.sel) { st.sel.grams = Number(el.dataset.g); const g = $('#fam-g'); if (g) g.value = st.sel.grams; updatePortion(); }
  else if (act === 'add' && st.sel) { const f = findFood(st.sel.name); if (f) commit([{ food: f, grams: st.sel.grams }], false); }
  else if (act === 'aifrom') { st.ai.text = st.q.trim(); st.ai.rows = []; st.ai.err = ''; st.ai.questions = []; setView('ai'); setTimeout(runAi, 0); }
  else if (act === 'aiex') { st.ai.text = EXAMPLES[Number(el.dataset.i)]; const ta = $('#fam-ai-text'); if (ta) ta.value = st.ai.text; }
  else if (act === 'airun') runAi();
  else if (act === 'aichk') { const r = st.ai.rows[Number(el.dataset.i)]; if (r && r.name) { r.on = !r.on; const ta = $('#fam-ai-text'); if (ta) st.ai.text = ta.value; paint(); } }
  else if (act === 'aistep') { const r = st.ai.rows[Number(el.dataset.i)]; if (r) { r.grams = Math.max(25, Math.min(1000, r.grams + Number(el.dataset.d))); const ta = $('#fam-ai-text'); if (ta) st.ai.text = ta.value; paint(); } }
  else if (act === 'aiadd') { if (commit(st.ai.rows.filter(r => r.on && r.name).map(r => ({ food: findFood(r.name), grams: r.grams })), false)) { st.ai.rows = []; st.ai.text = ''; } }
  else if (act === 'snap') snap();
  else if (act === 'gallery') { const f = $('#fam-file'); if (f) { f.onchange = () => { if (f.files && f.files[0]) sendPhoto(f.files[0]); }; f.click(); } }
  else if (act === 'bcfind') lookupBarcode(($('#fam-bc-manual') || {}).value);
  else if (act === 'cat') { st.cat = el.dataset.cat; paint(); }
}

window.foodOpenMealWindow = function (meal) {
  if (!MEALS.includes(meal)) return;
  ensure();
  st.meal = meal;
  try { st.date = (typeof tab !== 'undefined' && tab === 'diary' && day) ? day : todayStr(); } catch (e) { st.date = todayStr(); }
  st.q = ''; st.view = 'search'; st.sel = null; st.bc = { busy: false, msg: '' };
  $('#fam-input').value = '';
  paint();
  if (!dlg.open) dlg.showModal();
  requestAnimationFrame(() => { try { $('#fam-input').focus({ preventScroll: true }); } catch (e) {} });
};
window.foodOpenEstimateWindow = openEstimate;
})();
