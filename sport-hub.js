/* Set-Up.pro: раздел «Спорт» — тренировочный хаб (связан с питанием и привычками). */
(() => {
'use strict';
if (window.__sportHub) return; window.__sportHub = true;
const SKEY = 'sportHubSession', HABIT = '3:4';
const GROUPS = {chest:'Грудь',shoulders:'Плечи',abs:'Пресс',arms:'Руки',legs:'Ноги',back:'Спина',glutes:'Ягодицы'};
const LIB = [
 {n:'Жим штанги лежа',m:'chest',w:60,r:8,rest:120,tempo:'3-1-1',e:'bar'},
 {n:'Жим гантелей на наклонной',m:'chest',w:24,r:10,rest:90,tempo:'3-0-1',e:'db'},
 {n:'Отжимания',m:'chest',w:0,r:12,rest:60,tempo:'2-0-1',e:'bw'},
 {n:'Подтягивания',m:'back',w:0,r:8,rest:90,tempo:'2-0-1',e:'bw'},
 {n:'Тяга штанги в наклоне',m:'back',w:60,r:10,rest:90,tempo:'2-1-1',e:'bar'},
 {n:'Тяга верхнего блока',m:'back',w:50,r:10,rest:75,tempo:'2-1-1',e:'cable'},
 {n:'Тяга гантели в наклоне',m:'back',w:24,r:10,rest:75,tempo:'2-1-1',e:'db'},
 {n:'Армейский жим стоя',m:'shoulders',w:40,r:8,rest:90,tempo:'2-0-1',e:'bar'},
 {n:'Жим гантелей сидя',m:'shoulders',w:18,r:10,rest:75,tempo:'2-0-1',e:'db'},
 {n:'Махи гантелей в стороны',m:'shoulders',w:8,r:15,rest:60,tempo:'2-0-2',e:'db'},
 {n:'Приседания со штангой',m:'legs',w:80,r:8,rest:150,tempo:'3-1-1',e:'bar'},
 {n:'Гоблет-присед',m:'legs',w:20,r:12,rest:90,tempo:'3-0-1',e:'db'},
 {n:'Выпады с гантелями',m:'legs',w:16,r:10,rest:75,tempo:'2-0-1',e:'db'},
 {n:'Жим ногами',m:'legs',w:120,r:12,rest:90,tempo:'3-0-1',e:'cable'},
 {n:'Румынская тяга',m:'glutes',w:70,r:10,rest:120,tempo:'3-1-1',e:'bar'},
 {n:'Ягодичный мост',m:'glutes',w:60,r:10,rest:90,tempo:'2-1-1',e:'bar'},
 {n:'Сгибания на бицепс',m:'arms',w:14,r:10,rest:60,tempo:'2-0-2',e:'db'},
 {n:'Французский жим',m:'arms',w:25,r:10,rest:60,tempo:'3-0-1',e:'bar'},
 {n:'Скручивания на пресс',m:'abs',w:0,r:15,rest:45,tempo:'2-0-2',e:'bw'}
];
LIB.push(
 {n:'Разводка гантелей',m:'chest',w:14,r:12,rest:60,tempo:'3-1-1',e:'db'},
 {n:'Разгибания на блоке',m:'arms',w:30,r:12,rest:60,tempo:'2-0-2',e:'cable'},
 {n:'Молотки',m:'arms',w:14,r:10,rest:60,tempo:'2-0-2',e:'db'},
 {n:'Тяга каната к лицу',m:'shoulders',w:25,r:15,rest:60,tempo:'2-1-2',e:'cable'},
 {n:'Болгарские выпады',m:'legs',w:14,r:10,rest:90,tempo:'3-0-1',e:'db'},
 {n:'Подъём ног в висе',m:'abs',w:0,r:12,rest:45,tempo:'2-0-2',e:'bw'},
 {n:'Скручивания в блоке',m:'abs',w:30,r:15,rest:45,tempo:'2-0-2',e:'cable'},
 {n:'Велосипед',m:'abs',w:0,r:20,rest:45,tempo:'1-0-1',e:'bw'}
);
LIB.push(
 {n:'Отжимания с упором ног на возвышении',m:'chest',w:0,r:10,rest:60,tempo:'2-0-1',e:'bw'},
 {n:'Алмазные отжимания',m:'arms',w:0,r:10,rest:60,tempo:'2-0-1',e:'bw'},
 {n:'Обратные отжимания от скамьи',m:'arms',w:0,r:12,rest:60,tempo:'2-0-1',e:'bw'},
 {n:'Пике-отжимания',m:'shoulders',w:0,r:10,rest:60,tempo:'2-0-1',e:'bw'},
 {n:'Австралийские подтягивания',m:'back',w:0,r:12,rest:60,tempo:'2-1-1',e:'bw'},
 {n:'Супермен',m:'back',w:0,r:15,rest:45,tempo:'2-1-1',e:'bw'},
 {n:'Приседания с собственным весом',m:'legs',w:0,r:20,rest:60,tempo:'2-0-1',e:'bw'},
 {n:'Выпады на месте',m:'legs',w:0,r:12,rest:60,tempo:'2-0-1',e:'bw'},
 {n:'Прыжки из приседа',m:'legs',w:0,r:15,rest:60,tempo:'1-0-1',e:'bw'},
 {n:'Ягодичный мостик без веса',m:'glutes',w:0,r:20,rest:45,tempo:'2-1-1',e:'bw'},
 {n:'Мостик на одной ноге',m:'glutes',w:0,r:12,rest:45,tempo:'2-1-1',e:'bw'},
 {n:'Скалолаз',m:'abs',w:0,r:30,rest:45,tempo:'1-0-1',e:'bw'},
 {n:'Подъём ног лёжа',m:'abs',w:0,r:15,rest:45,tempo:'2-0-2',e:'bw'}
);
const find = n => LIB.find(x => x.n === n);
const GCOL = {chest:'#ff7a6b',back:'#7c7cff',legs:'#ffb35c',shoulders:'#38bdf8',arms:'#4fd1c5',abs:'#f6d860',glutes:'#e879f9'};
const gc = g => GCOL[g] || '#b8ff2c';
const gdot = g => `<i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${gc(g)};margin-right:7px;flex:none"></i>`;
const gtxt = g => `<span style="color:${gc(g)};font-weight:700">${GROUPS[g]}</span>`;
const gtint = g => `border-color:${gc(g)}77;background:${gc(g)}22;color:${gc(g)}`;
const PRESETS = [
 {id:'preset-chest',title:'Грудь и трицепс',names:['Жим штанги лежа','Жим гантелей на наклонной','Разводка гантелей','Отжимания','Французский жим','Разгибания на блоке']},
 {id:'preset-back',title:'Спина и бицепс',names:['Подтягивания','Тяга штанги в наклоне','Тяга верхнего блока','Тяга гантели в наклоне','Сгибания на бицепс','Молотки']},
 {id:'preset-shoulders',title:'Плечи и руки',names:['Армейский жим стоя','Жим гантелей сидя','Махи гантелей в стороны','Тяга каната к лицу','Сгибания на бицепс','Французский жим']},
 {id:'preset-legs',title:'Ноги и ягодицы',names:['Приседания со штангой','Жим ногами','Болгарские выпады','Румынская тяга','Ягодичный мост']},
 {id:'preset-abs',title:'Пресс и кор',names:['Скручивания на пресс','Подъём ног в висе','Скручивания в блоке','Велосипед']}
];
const presetTags = p => [...new Set(p.names.map(n => find(n).m))];
const $s = s => document.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num = v => { const n = parseFloat(String(v).replace(',', '.')); return Number.isFinite(n) ? n : 0; };
const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const r05 = v => Math.round(v * 2) / 2;
const todayS = () => { try { return today(); } catch (e) { return new Date().toISOString().slice(0, 10); } };
const toast2 = t => { try { toast(t); } catch (e) {} };
const fmtT = ms => { const s = Math.max(0, Math.floor(ms / 1000)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
const fmtN = n => Math.round(n).toLocaleString('ru-RU');

/* ---------- данные ---------- */
function mkEx(l, mult) {
  const w = l.w ? r05(l.w * (mult || 1)) : 0, sets = [];
  if (l.w >= 40) sets.push({id:uid('s'),type:'w',weight:r05(w * .5),reps:l.r + 2,rir:3,done:false});
  for (let i = 0; i < 3; i++) sets.push({id:uid('s'),type:'n',weight:w,reps:l.r,rir:2,done:false});
  return {id:uid('e'),name:l.n,muscles:[l.m],tempo:l.tempo,restSec:l.rest,sets};
}
const mkW = (title, names, src, extra) => { const ex = names.map(n => mkEx(find(n))); return Object.assign({id:uid('w'),title,src:src||'manual',tags:[...new Set(ex.flatMap(e => e.muscles))],exercises:ex}, extra || {}); };
function seed() { return [
  mkW('Верх тела: сила и гипертрофия',['Жим штанги лежа','Тяга штанги в наклоне','Жим гантелей на наклонной','Армейский жим стоя'],'plan',{meso:'Мезоцикл 1 · Неделя 1',id:'seed-1'}),
  mkW('Ноги и кор',['Приседания со штангой','Румынская тяга','Выпады с гантелями','Скручивания на пресс'],'plan',{meso:'Мезоцикл 1 · Неделя 1',id:'seed-2'})
]; }
function rawState() { try { return JSON.parse(localStorage.getItem('nt1') || 'null'); } catch (e) { return null; } }
function hub() { const h = (rawState() || {}).sportHub; const o = h && typeof h === 'object' ? h : {}; return {version:1,mode:'pro',repeats:Array.isArray(o.repeats) ? o.repeats : [],dated:(o.dated && typeof o.dated === 'object' && !Array.isArray(o.dated)) ? o.dated : {},plan:(o.plan && typeof o.plan === 'object' && !Array.isArray(o.plan)) ? o.plan : {},workouts:Array.isArray(o.workouts) ? o.workouts : seed(),sessions:Array.isArray(o.sessions) ? o.sessions : []}; }
function commit(fn) {
  const st = rawState(); if (!st) throw Error('Сначала заполните профиль');
  fn(st); localStorage.setItem('nt1', JSON.stringify(st));
  try { for (const k of ['sportHub','workouts','habitTracker','water','profile']) if (k in st) S[k] = st[k]; } catch (e) {}
}
function setHub(fn) { const h = hub(); fn(h); h.sessions = h.sessions.slice(-200); try { commit(s => { s.sportHub = h; }); } catch (e) { toast2(e.message || 'Не удалось сохранить'); } return h; }
const loadSess = () => { try { return JSON.parse(localStorage.getItem(SKEY) || 'null'); } catch (e) { return null; } };
const saveSess = () => { try { if (sess) localStorage.setItem(SKEY, JSON.stringify(sess)); else localStorage.removeItem(SKEY); } catch (e) {} };

/* ---------- расчёты ---------- */
const doneSets = ex => ex.sets.filter(s => s.done);
const ton = s => s.type === 'w' ? 0 : num(s.weight) * num(s.reps);
const exTon = ex => doneSets(ex).reduce((a, s) => a + ton(s), 0);
const sessTon = ss => ss.exercises.reduce((a, e) => a + exTon(e), 0);
const sessSets = ss => ss.exercises.reduce((a, e) => a + doneSets(e).length, 0);
const wTon = w => w.exercises.reduce((a, e) => a + e.sets.reduce((b, s) => b + ton(s), 0), 0);
const e1rm = (w, r) => w > 0 && r > 0 && r <= 12 ? w * (1 + r / 30) : 0;
const dayKey = ms => { const d = new Date(ms), p = n => String(n).padStart(2, '0'); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); };
function recovery(h) {
  const last = {}, now = Date.now();
  for (const ss of h.sessions) for (const ex of ss.exercises) { const n = ex.sets.length; if (!n) continue; for (const m of ex.muscles) { const o = last[m] || (last[m] = {t:0,sets:0}); if (ss.endedAt > o.t) { o.t = ss.endedAt; o.sets = 0; } if (ss.endedAt === o.t) o.sets += n; } }
  const res = {};
  for (const g in GROUPS) { const o = last[g]; res[g] = o ? Math.min(100, Math.round((now - o.t) / 36e5 / (48 + Math.min(36, o.sets * 3)) * 100)) : 100; res[g] = 100 - res[g]; }
  return res;
}
function prevSets(h, name) { for (let i = h.sessions.length - 1; i >= 0; i--) { const ex = h.sessions[i].exercises.find(e => e.name === name); if (ex && ex.sets.length) return ex.sets.filter(s => s.type !== 'w'); } return null; }
function prs(h) { const m = {}; for (const ss of h.sessions) for (const ex of ss.exercises) for (const s of ex.sets) { const v = e1rm(num(s.weight), num(s.reps)); if (v > (m[ex.name] || 0)) m[ex.name] = v; } return m; }
const weekStart = () => { const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d; };
function weekTon(h) { const ws = weekStart().getTime(), a = [0,0,0,0,0,0,0]; for (const ss of h.sessions) { const i = Math.floor((ss.endedAt - ws) / 864e5); if (i >= 0 && i < 7) a[i] += sessTon(ss); } return a; }
function weekSets(h) { const ws = weekStart().getTime(), o = {}; for (const ss of h.sessions) if (ss.endedAt >= ws) for (const ex of ss.exercises) for (const m of ex.muscles) o[m] = (o[m] || 0) + ex.sets.length; return o; }
const kcalOf = (min) => { let kg = 75; try { kg = num(S.profile.w) || 75; } catch (e) {} return Math.round(5 * kg * min / 60); };
function nutri() { try { const t = targets(S.profile), e = tot(todayS()); return {t, e}; } catch (e) { return null; } }
function habitState() {
  try { const c = S.profile.habitsV2.items[HABIT]; const d = (window.foodHabitDefinitions?.() || []).find(x => x.id === HABIT);
    return {enabled: !!(c && c.enabled), title: d ? d.title : 'Выполнить запланированное занятие', done: S.habitTracker?.records?.[todayS()]?.[HABIT]?.done === true}; } catch (e) { return {enabled:false,title:'Выполнить запланированное занятие',done:false}; }
}

/* ---------- состояние UI ---------- */
let lastDay = '', root = null, sess = loadSess(), ticker = null, wasVisible = false;
const ui = {screen: sess ? 'workout' : 'dash', sel: null, body: 'front', muscle: null, day: (new Date().getDay() + 6) % 7, modal: null, draft: null, q: '', aq: '', ap: null, libm: 'all', ptab: 'ready', np: {name:'', sel:[], cfg:{}, edit:null}, pg: 'all', cfg: null, pv: null, back: null, result: null, ai: {goal:'hyper',eq:'gym',min:45,focus:[]}};
const mode = () => hub().mode;

/* ---------- отрисовка: дашборд ---------- */
/* киберпанк-силуэт: левая половина, правая зеркалится; abs — по центру */
const BODY_L = 'M50 22 L44 22 L44 28 Q34 30 27 34 Q19 37 17 46 L13 70 L11 90 Q10 98 12 104 L18 104 Q21 98 22 90 L26 68 L28 54 Q30 62 32 72 Q34 86 35 96 Q33 106 33 122 Q33 140 35 156 L36 176 Q35 182 34 186 L46 186 Q47 176 47 164 Q48 140 49 120 L50 106 Z';
const mpath = {
 front: [['shoulders','M27 34 Q19 37 17 46 L21 57 Q27 54 29 45 L30 37Z',1],['chest','M31 39 Q40 37 49 40 L49 58 Q40 63 32 57 Q29 48 31 39Z',1],['abs','M41 62 H59 V94 Q50 101 41 94Z',0],['arms','M16 57 L12 72 L10 92 L17 94 L22 74 L23 58Z',1],['legs','M35 106 Q34 130 36 156 L37 180 L46 180 Q47 160 48 136 L49 108Z',1]],
 back: [['shoulders','M27 34 Q19 37 17 46 L21 57 Q27 54 29 45 L30 37Z',1],['back','M31 38 Q40 36 49 38 L49 80 Q40 82 34 74 Q29 56 31 38Z',1],['arms','M16 57 L12 72 L10 92 L17 94 L22 74 L23 58Z',1],['glutes','M35 86 Q42 84 49 88 L49 107 Q40 111 34 104 Q32 94 35 86Z',1],['legs','M35 110 Q34 132 36 156 L37 180 L46 180 Q47 160 48 138 L49 110Z',1]]
};
const recCol = p => p > 60 ? '#ff5a5f' : p > 25 ? '#ffb020' : '#b8ff2c'; /* p — забитость, % */
const FIG = {
  m: {body:'M92 44 L92 56 Q76 58 60 68 Q60 80 62 100 L66 140 Q70 160 70 172 Q64 190 66 208 L66 250 Q62 270 70 292 L70 340 Q72 360 74 382 Q68 394 58 400 L88 400 Q92 392 90 380 L92 340 Q96 300 94 290 L96 232 L100 216 L100 44 Z', arm:'M60 66 Q46 70 42 90 L36 140 L24 190 L14 204 L16 212 L24 208 L30 214 L38 208 L42 196 L50 150 L56 108 L62 98 Q64 80 60 66Z'},
  f: {body:'M 93.2 44 L 93.2 56 Q 79.6 58 66 68 Q 66 80 67.7 100 L 73.2 140 Q 77.2 160 77.8 172 Q 65 190 60.1 208 L 63 250 Q 59.1 270 68.1 292 L 68.9 340 Q 71.3 360 73.7 382 Q 67.9 394 58 400 L 88 400 Q 92 392 89.9 380 L 91.7 340 Q 95.8 300 93.6 290 L 95.6 232 L 100 216 L 100 44 Z', arm:'M 64.8 66 Q 52.5 70 49 90 L 43.7 140 L 33.1 190 L 24.3 204 L 26.1 212 L 33.1 208 L 38.4 214 L 45.4 208 L 49 196 L 56 150 L 61.3 108 L 66.6 98 Q 68.3 80 64.8 66 Z', hair:'M86 26 Q84 6 100 6 Q116 6 114 26 Q116 40 112 48 Q108 40 108 34 L92 34 Q92 40 88 48 Q84 40 86 26Z'}
};
const FSX = {shoulders:.88, chest:.86, arms:.88, back:.86, abs:.76, glutes:1.16, legs:1.08};
const MUS = {"front": [["shoulders", "M56 70 Q44 72 42 90 Q43 100 50 100 Q58 92 60 78Z"], ["shoulders", "M96 58 Q82 62 68 70 Q76 74 86 72 Q93 68 96 58Z"], ["chest", "M62 78 Q80 70 99 76 L99 108 Q82 118 66 106 Q58 94 62 78Z"], ["abs", "M81 118 Q90 116 99 118 L99 134 Q90 136 81 134Z"], ["abs", "M81 138 Q90 136 99 138 L99 154 Q90 156 81 154Z"], ["abs", "M81 158 Q90 156 99 158 L99 174 Q90 176 81 174Z"], ["abs", "M82 178 Q90 176 99 178 L99 196 Q91 198 83 194Z"], ["abs", "M72 112 Q78 120 80 140 Q80 168 76 188 Q72 168 71 140Z"], ["arms", "M44 106 Q39 120 42 138 Q48 144 52 136 Q54 120 52 106Z"], ["arms", "M38 150 Q32 170 27 188 Q33 192 38 184 Q44 168 46 152Z"], ["legs", "M71 226 Q66 255 72 286 Q79 288 81 272 Q81 246 79 226Z"], ["legs", "M83 224 Q91 226 94 252 Q93 276 88 286 Q83 280 83 260Z"], ["legs", "M74 306 Q71 335 76 372 Q82 345 82 308Z"]], "back": [["shoulders", "M56 70 Q44 72 42 90 Q43 100 50 100 Q58 92 60 78Z"], ["back", "M99 58 Q82 62 64 72 Q74 88 99 98Z"], ["back", "M66 102 Q82 108 99 104 L99 158 Q84 168 74 156 Q66 132 66 102Z"], ["arms", "M44 106 Q39 120 42 138 Q48 144 52 136 Q54 120 52 106Z"], ["arms", "M38 150 Q32 170 27 188 Q33 192 38 184 Q44 168 46 152Z"], ["glutes", "M72 198 Q86 192 99 200 L99 232 Q84 240 72 228 Q68 212 72 198Z"], ["legs", "M71 240 Q66 265 72 292 Q80 294 83 272 Q82 252 80 240Z"], ["legs", "M85 240 Q94 252 94 278 Q91 292 86 292 Q84 270 85 240Z"], ["legs", "M71 306 Q66 330 73 356 Q82 348 83 322 Q83 308 71 306Z"], ["legs", "M85 306 Q92 326 90 350 Q86 356 84 350 Q84 326 85 306Z"]]};
const GREY = [142, 149, 155];
const hex2 = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mix = (c, t) => { const g = hex2(c); return 'rgb(' + g.map((v, i) => Math.round(GREY[i] + (v - GREY[i]) * t)).join(',') + ')'; };
function bodySvg(rec) {
  let fem = false; try { fem = S.profile && S.profile.sex === 'f'; } catch (e) {}
  const fig = fem ? FIG.f : FIG.m, front = ui.body === 'front', CY = '#38e8ff', NEON = '#b8ff2c';
  const sil = `<g class="sh-sil2">${fem ? `<path d="${fig.hair}"/>` : ''}<ellipse cx="100" cy="27" rx="${fem ? 12 : 13.5}" ry="${fem ? 16 : 17}"/>` +
    `<path d="${fig.body}"/><g transform="translate(200 0) scale(-1 1)"><path d="${fig.body}"/></g><path d="${fig.arm}"/><g transform="translate(200 0) scale(-1 1)"><path d="${fig.arm}"/></g><rect class="sh-seam" x="98" y="56" width="4" height="160"/></g>`;
  const mus = ([g, d]) => { const r = Math.max(0, Math.min(100, rec[g] == null ? 0 : rec[g])), t = r / 100, col = gc(g), sel = ui.muscle === g;
    const k = fem ? FSX[g] || 1 : 1, tr = k !== 1 ? ` transform="translate(100 0) scale(${k} 1) translate(-100 0)"` : '';
    const el = `<path class="sh-mp${sel ? ' sel' : ''}" data-act="muscle" data-id="${g}" d="${d}"${tr} style="fill:${mix(col, Math.min(1, t * 1.05))};filter:${t > .05 ? `drop-shadow(0 0 ${(1 + t * 4).toFixed(1)}px ${col})` : 'none'}"/>`;
    return el + `<g transform="translate(200 0) scale(-1 1)">${el}</g>`; };
  return `<svg viewBox="0 0 200 420" class="sh-cy sh-fig" role="img" aria-label="Мышцы забиты">
  <defs><linearGradient id="shs" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${CY}" stop-opacity="0"/><stop offset=".5" stop-color="${CY}" stop-opacity=".35"/><stop offset="1" stop-color="${CY}" stop-opacity="0"/></linearGradient><clipPath id="shc"><rect width="200" height="420"/></clipPath></defs>
  ${sil}
  ${MUS[ui.body].map(mus).join('')}
  <g clip-path="url(#shc)"><rect class="sh-scan" x="0" y="0" width="200" height="22" fill="url(#shs)"/></g>
  <text x="8" y="412" font-size="8" fill="${NEON}" fill-opacity=".7" font-family="monospace">${front ? 'FRONT' : 'REAR'}</text>
  </svg>`;
}

function pvList(x, wk) {
  if (!ui.pve || ui.pve.id !== x.id) {
    const list = x.names.map((n, i) => { const l = find(n); const src = wk && wk.exercises[i]; const ex = src ? JSON.parse(JSON.stringify(src)) : (l ? mkEx(l) : newEx(n, [x.tags[0]], null)); ex.sets.forEach(z => { z.done = false; }); return ex; });
    ui.pve = {id: x.id, list}; ui.pved = null;
  }
  return ui.pve.list;
}
function pvRows(x, wk) {
  const list = pvList(x, wk);
  if (!list.length) return '<p class="sh-mu" style="margin:10px 0">Упражнений не осталось. Закройте окно и откройте программу заново.</p>';
  const st = (i, k, lab, val) => `<div class="sh-row sh-sb" style="margin-top:10px"><span class="sh-lbl">${lab}</span><span class="sh-row" style="gap:10px"><button class="sh-sq sm" data-act="pvs" data-i="${i}" data-k="${k}" data-d="-1">−</button><b style="min-width:70px;text-align:center">${val}</b><button class="sh-sq sm" data-act="pvs" data-i="${i}" data-k="${k}" data-d="1">+</button></span></div>`;
  return list.map((e, i) => {
    const m = e.muscles[0], n = e.sets.length, r = e.sets[0] ? e.sets[0].reps : 0, w = e.sets[0] ? num(e.sets[0].weight) : 0, open = ui.pved === i;
    return `<div class="sh-item" style="border-left:3px solid ${gc(m)};flex-wrap:wrap"><span style="flex:1;min-width:0">${i + 1}. ${esc(e.name)}<br><span class="sh-mu">${gtxt(m)} · ${n} × ${r}${w ? ' · ' + w + ' кг' : ''}</span></span>` +
      `<span class="sh-row" style="gap:6px;flex:none"><button class="sh-chip${open ? ' on' : ''}" data-act="pved" data-i="${i}">${open ? 'Готово' : 'Изменить'}</button><button class="sh-chip" data-act="pvdel" data-i="${i}" style="color:var(--red);border-color:rgba(255,90,95,.4)">Удалить</button></span>` +
      (open ? `<div style="width:100%;margin-top:4px">${st(i, 'sets', 'Подходы', n)}${st(i, 'reps', 'Повторения', r)}${st(i, 'w', 'Вес', w ? w + ' кг' : 'свой вес')}</div>` : '') + `</div>`;
  }).join('');
}
function suggest(h, rec) {
  let best = null, bs = 101;
  for (const w of h.workouts.filter(z => !z.forDate)) { const t = w.tags.length ? w.tags : ['legs']; const v = t.reduce((a, g) => a + (rec[g] ?? 0), 0) / t.length; if (v < bs) { bs = v; best = w; } }
  return best;
}
const wdOf = d => { const [y, m, dd] = d.split('-').map(Number); return String((new Date(y, m - 1, dd).getDay() + 6) % 7); };
const dkey = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const dateLabel = d => { const [y, m, dd] = d.split('-').map(Number); return dd + ' ' + RU_M[m - 1]; };
const dtl = d => { const [y, m, dd] = d.split('-').map(Number); return new Date(y, m - 1, dd); };
const daysBetween = (a, b) => Math.round((dtl(b) - dtl(a)) / 864e5);
const repMatch = (r, d) => d >= r.start && (!r.until || d <= r.until) && (r.wd ? r.wd.includes(+wdOf(d)) : daysBetween(r.start, d) % r.every === 0);
const planOf = (h, d) => { if (h.dated[d]) return h.dated[d]; const r = h.repeats.find(x => repMatch(x, d) && h.workouts.some(w => w.id === x.wid)); return r ? r.wid : h.plan[wdOf(d)]; };
const plural = (n, a, b, c) => { const m = n % 100, k = n % 10; return m > 10 && m < 15 ? c : k === 1 ? a : k > 1 && k < 5 ? b : c; };
const assignDate = (id) => { const d = selDay(); setHub(h => { h.dated[d] = id; }); };
const isFuture = () => selDay() > todayS();
const setSel = id => { ui.sel = id; ui.selDay = selDay(); };
const WD = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'], WDL = ['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'];
const selDay = () => { try { return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : todayS(); } catch (e) { return todayS(); } };
const RU_M = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
function dayCard(h, d) {
  const ss = h.sessions.filter(x => x.date === d), en = ((rawState() || {}).workouts?.entries || []).filter(e => e.date === d && !String(e.id).startsWith('hub-'));
  const [y, m, dd] = d.split('-').map(Number), future = d > todayS();
  let o = `<div class="sh-card"><div class="sh-row sh-sb"><span class="sh-chip on">${dd} ${RU_M[m - 1]} ${y}</span><span class="sh-chip">${future ? 'Будущая дата' : 'Выполнено'}</span></div>`;
  const pw = future ? (planOf(h, d) && planOf(h, d) !== 'rest' ? h.workouts.find(x => x.id === planOf(h, d)) : null) : null;
  if (future && h.dated[d]) o += `<button class="sh-chip" style="margin-top:10px" data-act="undate">Убрать из плана на эту дату</button>`;
  if (future && pw) o += `<div class="sh-row sh-sb" style="margin:12px 0 6px"><h3 class="sh-h">По плану: ${esc(pw.title)}</h3><button class="sh-chip" data-act="editw" data-id="${pw.id}">Изменить</button></div>` + pw.exercises.map(e => `<div class="sh-item" style="border-left:3px solid ${gc(e.muscles[0])}"><span>${esc(e.name)}</span><span class="sh-mu">${e.sets.length} подх.</span></div>`).join('');
  else if (future && planOf(h, d) === 'rest') o += '<p class="sh-mu" style="margin-top:12px">По плану день отдыха.</p>';
  else if (!ss.length && !en.length) o += `<p class="sh-mu" style="margin-top:12px">${future ? 'Эта дата ещё не наступила.' : 'В этот день тренировок не записано.'}</p>`;
  ss.forEach(x => { const t = x.exercises.reduce((a, e) => a + e.sets.reduce((b, s) => b + (s.type === 'w' ? 0 : s.weight * s.reps), 0), 0), n = x.exercises.reduce((a, e) => a + e.sets.length, 0);
    o += `<h3 class="sh-h" style="margin:12px 0 6px">${esc(x.title)}</h3><div class="sh-row sh-wrap sh-mu"><span>${x.minutes} мин</span><span>·</span><span>${n} подх.</span><span>·</span><span>${fmtN(t)} кг</span></div>` + x.exercises.map(e => `<div class="sh-item" style="border-left:3px solid ${gc(e.muscles[0])}"><span>${esc(e.name)}</span><span class="sh-mu">${e.sets.filter(s => s.type !== 'w').map(s => s.weight + '×' + s.reps).join(', ')}</span></div>`).join('') + `<div class="sh-row" style="margin-top:12px"><button class="sh-btn" style="flex:1" data-act="repeat" data-id="${x.id}">Повторить</button><button class="sh-btn ghost" style="flex:1" data-act="sedit" data-id="${x.id}">Изменить</button></div>`; });
  en.forEach(e => { o += `<div class="sh-item"><span>${esc(e.name)}</span><span class="sh-mu">${e.minutes ? e.minutes + ' мин' : ''}</span></div>`; });
  return o + '</div>';
}
function dayItems(h, d, w) {
  const items = [];
  h.sessions.filter(x => x.date === d).forEach(x => x.exercises.forEach(e => items.push({g:e.muscles[0],done:true})));
  if (d === todayS()) {
    const doneToday = h.sessions.some(x => x.date === d && x.workoutId === (w && w.id));
    if (sess && sess.date === d) sess.exercises.forEach(e => items.push({g:e.muscles[0],done:e.sets.length > 0 && e.sets.every(z => z.done)}));
    else if (w && !doneToday) w.exercises.forEach(e => items.push({g:e.muscles[0],done:false}));
  }
  if (d > todayS() && w) { const pv = planOf(h, d), pw = pv && pv !== 'rest' ? h.workouts.find(x => x.id === pv) : null; if (pw) pw.exercises.forEach(e => items.push({g:e.muscles[0],done:false})); }
  return items;
}
function ringSvg(items) {
  const n = items.length, R = 60, C = 2 * Math.PI * R; let o = '<svg viewBox="0 0 150 150" style="width:150px;height:150px;flex:none"><circle cx="75" cy="75" r="60" fill="none" stroke="#1f2a26" stroke-width="12"/>';
  if (n) { const gap = n > 1 ? 7 : 0, seg = C / n; items.forEach((it, i) => { if (!it.done) return; o += `<circle cx="75" cy="75" r="60" fill="none" stroke="${GCOL[it.g] || '#b8ff2c'}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${Math.max(2, seg - gap)} ${C}" transform="rotate(${-90 + i * 360 / n + gap / 2 / R * 57.3} 75 75)" style="filter:drop-shadow(0 0 4px ${GCOL[it.g] || '#b8ff2c'}88)"/>`; }); }
  const dn = items.filter(x => x.done).length;
  return o + `<text x="75" y="76" text-anchor="middle" fill="#fff" font-size="24" font-weight="800">${dn} / ${n}</text><text x="75" y="96" text-anchor="middle" fill="#8b959c" font-size="12">выполнено</text></svg>`;
}
function hero(h, w, d) {
  const items = dayItems(h, d, w), n = items.length, dn = items.filter(x => x.done).length, pct = n ? Math.round(dn / n * 100) : 0, left = n - dn;
  const [y, m, dd] = d.split('-').map(Number), isT = d === todayS();
  const chip = !n ? (planOf(h, d) === 'rest' ? 'День отдыха' : 'Нет упражнений') : left ? 'Осталось: ' + left : 'Всё выполнено';
  return `<div class="sh-card sh-hero"><div class="sh-row sh-sb sh-wrap" style="margin-bottom:10px"><h2 class="sh-h" style="font-size:22px">Тренировки дня</h2><span class="sh-chip" style="padding:8px 14px">${chip}</span></div>
  <div class="sh-row sh-sb" style="gap:6px">${ringSvg(items)}<div style="text-align:center;flex:1"><div class="sh-mu" style="font-size:14px">Выполнение</div><div style="font-size:40px;font-weight:800;line-height:1.1">${pct}<span class="sh-mu" style="font-size:22px"> %</span></div><div class="sh-mu" style="font-size:14px">${isT ? 'сегодня' : dd + ' ' + RU_M[m - 1]}</div></div>
  <button data-act="addmenu" style="display:flex;flex-direction:column;align-items:center;gap:8px;flex:none;width:96px;color:var(--lime);font-weight:800;text-align:center;line-height:1.2"><span style="width:84px;height:84px;border-radius:50%;border:3px solid var(--lime);box-shadow:0 0 18px rgba(184,255,44,.45),inset 0 0 14px rgba(184,255,44,.2);display:flex;align-items:center;justify-content:center"><svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="#b8ff2c" stroke-width="2.6" stroke-linecap="round"><path d="M12 4v16M4 12h16"/></svg></span>Добавить тренировку</button></div>
  <div class="sh-row" style="margin-top:12px"><button class="sh-chip" data-act="progress">↗ Прогресс и PR</button></div></div>`;
}
function dash() {
  const h = hub(), rec = recovery(h), pro = h.mode === 'pro';
  const sg = suggest(h, rec); const dsel = selDay(), pv = planOf(h, dsel), planned = pv && pv !== 'rest' ? h.workouts.find(x => x.id === pv) : null, rest = pv === 'rest';
  let w = (ui.selDay === dsel && h.workouts.find(x => x.id === ui.sel)) || planned || (rest ? null : sg);
  const nu = nutri(), hb = habitState(), wt = weekTon(h);
  const ready = w && w.tags.length ? Math.round(w.tags.reduce((a, g) => a + rec[g], 0) / w.tags.length) : 0;
  const setsN = w ? w.exercises.reduce((a, e) => a + e.sets.length, 0) : 0, dur = w ? Math.round(w.exercises.reduce((a, e) => a + e.sets.length * (e.restSec + 40), 0) / 60) : 0;
  let o = '';
  if (sess) o += `<div class="sh-card sh-syn"><div class="sh-lbl">Тренировка идёт</div><p class="sh-h" style="margin:4px 0 10px">${esc(sess.title)}</p><button class="sh-btn big" data-act="resume">Продолжить · ${fmtT(Date.now() - sess.startedAt)}</button></div>`;
  const isToday = selDay() === todayS(), isFut = dsel > todayS(); let card = '';
  const wc = (label, btn, on) => `<div class="sh-card"><div class="sh-row sh-sb"><span class="sh-chip${on ? ' on' : ''}">${label}</span><span class="sh-row"><span class="sh-chip">${({ai:'Конструктор',plan:'План',preset:'Готовая',manual:'Вручную'})[w.src] || 'Вручную'}</span><button class="sh-chip" data-act="rep" data-id="${w.id}" title="Повторение" style="padding:5px 9px;line-height:0"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 013-3h15"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 01-3 3H3"/></svg></button><button class="sh-chip" data-act="editw" data-id="${w.id}">Изменить</button><button class="sh-chip" data-act="delplan" title="Удалить из плана" style="padding:5px 9px;line-height:0;color:#ff6b6b"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg></button></span></div>
  ${w.meso ? `<p class="sh-mu" style="margin-top:10px">${esc(w.meso)}</p>` : ''}<h3 class="sh-h" style="margin:4px 0 8px">${esc(w.title)}</h3>
  <div class="sh-row sh-wrap sh-mu"><span>~${dur} мин</span><span>·</span><span>${w.exercises.length} упр.</span><span>·</span><span>${setsN} подх.</span><span>·</span><span>${fmtN(wTon(w))} кг</span></div>
  <div class="sh-chips" style="margin:10px 0">${w.exercises.map(e => `<span class="sh-chip" style="${gtint(e.muscles[0])}">${esc(e.name)}</span>`).join('')}</div>
  <div class="sh-row sh-sb" style="margin-bottom:8px"><span class="sh-lbl">Забитость мышц</span><b style="color:${recCol(ready)}">${ready}%</b></div><div class="sh-bar" style="margin-bottom:14px"><i style="width:${ready}%;background:${recCol(ready)}"></i></div>${btn}</div>`;
  if (isFut && w && !rest && (planned || ui.selDay === dsel)) { const n = daysBetween(todayS(), dsel); card = wc('Запланировано', `<div class="sh-fbtn">Тренировка запланирована через ${n} ${plural(n, 'день', 'дня', 'дней')}</div>` + (h.dated[dsel] ? '<button class="sh-chip" style="margin-top:10px" data-act="undate">Убрать из плана на эту дату</button>' : ''), false); }
  else if (!isToday) card = dayCard(h, dsel);
  else if (!w && rest) card = `<div class="sh-card"><span class="sh-chip on">По плану</span><h3 class="sh-h" style="margin:10px 0 6px">День отдыха</h3><p class="sh-mu" style="margin-bottom:12px">Сегодня по плану восстановление. Можно выбрать тренировку вручную.</p><button class="sh-btn ghost big" data-act="favs">Выбрать программу</button></div>`;
  else if (w) card = wc(planned && w === planned ? 'По плану' : 'Сегодня', `<button class="sh-btn big" data-act="start" data-id="${w.id}">${sess ? 'Начать заново' : 'Начать тренировку'}</button>`, true);
  if (isToday && h.sessions.some(x => x.date === dsel)) card += dayCard(h, dsel);
  o += hero(h, w, selDay()) + card;
  const sm = ui.muscle;
  o += `<div class="sh-card"><div class="sh-row sh-sb" style="margin-bottom:10px"><h3 class="sh-h" style="font-size:16px">Мышцы забиты</h3><div class="sh-seg"><button data-act="body" data-v="front" class="${ui.body === 'front' ? 'on' : ''}">Спереди</button><button data-act="body" data-v="back" class="${ui.body === 'back' ? 'on' : ''}">Сзади</button></div></div>
  <div class="sh-body">${bodySvg(rec)}<div style="flex:1">${sm ? `<div class="sh-lbl" style="color:${gc(sm)}">${GROUPS[sm]}</div><p class="sh-h" style="color:${gc(sm)}">${rec[sm]}%</p><p class="sh-mu" style="margin:4px 0 8px">${rec[sm] <= 0 ? 'Не забита' : rec[sm] <= 25 ? 'Слегка забита' : 'Сильно забита, дай отдых'}</p>${h.workouts.filter(x => x.tags.includes(sm)).slice(0, 2).map(x => `<button class="sh-chip" data-act="sel" data-id="${x.id}">${esc(x.title)}</button>`).join(' ')}` : `<p class="sh-mu">Нажмите на группу мышц, чтобы увидеть забитость. Красный — сильно забита, лимонный — свежая.</p>`}</div></div>
  <div class="sh-row sh-wrap" style="margin-top:10px">${Object.keys(GROUPS).map(g => `<button class="sh-chip" data-act="muscle" data-id="${g}" style="${gtint(g)}">${GROUPS[g]} ${rec[g]}%</button>`).join('')}</div></div>`;
  /* синергия */
  const addKcal = w ? kcalOf(dur) : 0;
  let nline = '<p class="sh-mu">Данные питания недоступны</p>';
  if (nu && nu.t) { const k = Math.round(nu.e.k || nu.e.kcal || 0), tk = Math.round(nu.t.kcal || nu.t.k || 0), p = Math.round(nu.e.p || 0), tp = Math.round(nu.t.p || 0); nline = `<div class="sh-row sh-sb"><span>Калории сегодня</span><b>${fmtN(k)} / ${fmtN(tk)}</b></div><div class="sh-bar" style="margin:6px 0 10px"><i style="width:${tk ? Math.min(100, k / tk * 100) : 0}%"></i></div><div class="sh-row sh-sb"><span>Белок</span><b>${p} / ${tp} г</b></div><p class="sh-mu" style="margin-top:8px">В тренировочный день добавьте около ${addKcal} ккал и 20–30 г белка после занятия.</p>`; }
  o += `<div class="sh-card sh-syn"><div class="sh-lbl">Синергия Set-UP</div><div style="margin:10px 0">${nline}</div>
  <button class="sh-btn ghost big" data-act="food" style="margin-bottom:10px">Добавить приём пищи</button>
  <div class="sh-row sh-sb"><span>${esc(hb.title)}</span><b style="color:${hb.done ? 'var(--lime)' : 'var(--mu)'}">${hb.done ? 'выполнено' : hb.enabled ? 'ждёт тренировки' : 'не включена'}</b></div><p class="sh-mu" style="margin-top:6px">После тренировки привычка отметится автоматически.</p></div>`;
  const mx = Math.max(1, ...wt), names = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
  o += `<div class="sh-card"><div class="sh-row sh-sb" style="margin-bottom:10px"><h3 class="sh-h" style="font-size:16px">Тоннаж недели</h3><b>${fmtN(wt[ui.day])} кг</b></div><div class="sh-week">${wt.map((v, i) => `<button data-act="day" data-v="${i}" class="${i === ui.day ? 'on' : ''}"><i style="height:${Math.max(3, v / mx * 80)}px"></i>${names[i]}</button>`).join('')}</div></div>`;
  return o;
}

/* ---------- отрисовка: тренировка ---------- */
function workoutScreen() {
  const h = hub(), pro = h.mode === 'pro', all = sess.exercises.reduce((a, e) => a + e.sets.length, 0), dn = sessSets(sess);
  let o = `<div class="sh-top"><div class="sh-row sh-sb"><button class="sh-x" data-act="back">←</button><div style="flex:1;min-width:0;text-align:center"><div class="sh-h" style="font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(sess.title)}</div><div class="sh-mu"><span data-t="elapsed">${fmtT(Date.now() - sess.startedAt)}</span> · <span data-t="ton">${fmtN(sessTon(sess))}</span> кг</div></div><button class="sh-btn" style="padding:8px 12px" data-act="finish">Завершить</button></div><div class="sh-bar" style="margin-top:8px"><i data-t="bar" style="width:${all ? dn / all * 100 : 0}%"></i></div></div>`;
  o += `<div data-t="rest">${restHtml()}</div>`;
  if (sess.ai) o += `<div class="sh-ai"><b>Автокоррекция</b><p style="margin:4px 0 10px">Подход выполнен до отказа. Снизить вес следующего подхода до ${sess.ai.w} кг?</p><div class="sh-row"><button class="sh-btn" data-act="aiy">Снизить</button><button class="sh-btn ghost" data-act="ain">Оставить</button></div></div>`;
  sess.exercises.forEach((ex, ei) => {
    const prev = prevSets(h, ex.name), nov = pro ? '' : ' novice';
    o += `<div class="sh-ex" style="border-left:4px solid ${gc(ex.muscles[0])}"><div class="sh-row sh-sb"><div style="min-width:0"><div class="sh-h" style="font-size:16px">${esc(ex.name)}</div><div class="sh-mu">${ex.muscles.map(gtxt).join(', ')}${pro ? ` · темп ${esc(ex.tempo)}` : ''}${pro && ex.oneRm ? ` · 1ПМ ${Math.round(ex.oneRm)} кг` : ''}</div></div><button class="sh-chip" data-act="swap" data-e="${ei}">Занято / Болит</button></div>
    <div class="sh-hd${nov}"><span>${pro ? 'Тип' : '№'}</span><span>Пред.</span><span>Вес</span><span>Повт.</span>${pro ? '<span>RIR</span>' : ''}<span></span></div>`;
    ex.sets.forEach((s, si) => {
      const pv = prev && prev[Math.min(si, prev.length - 1)]; const wi = ex.sets.slice(0, si + 1).filter(x => x.type !== 'w').length;
      o += `<div class="sh-set${nov}${s.done ? ' done' : ''}"><button class="t" data-act="stype" data-e="${ei}" data-s="${si}">${pro ? ({w:'разм',n:'раб',d:'дроп'})[s.type] : si + 1}</button><span class="pv">${pv ? `${pv.weight}×${pv.reps}` : '—'}</span><input inputmode="decimal" data-f="weight" data-e="${ei}" data-s="${si}" value="${esc(s.weight)}"><input inputmode="numeric" data-f="reps" data-e="${ei}" data-s="${si}" value="${esc(s.reps)}">${pro ? `<input inputmode="numeric" data-f="rir" data-e="${ei}" data-s="${si}" value="${esc(s.rir)}">` : ''}<button class="sh-ck${s.done ? ' on' : ''}" data-act="check" data-e="${ei}" data-s="${si}">✓</button></div>`;
    });
    o += `<div class="sh-row" style="margin-top:10px"><button class="sh-chip" data-act="addset" data-e="${ei}">+ Подход</button><button class="sh-chip" data-act="delset" data-e="${ei}">− Подход</button></div></div>`;
  });
  o += `<button class="sh-btn ghost big" data-act="addex">+ Добавить упражнение</button><button class="sh-btn red big" data-act="cancel" style="margin-top:10px">Отменить тренировку</button>`;
  o += `<div class="sh-bot"><form data-form="quick"><input name="q" placeholder="Например: Жим 85 на 6, в запасе 1" autocomplete="off"><button type="button" class="sh-btn ghost" data-act="mic" style="padding:0 12px">🎤</button><button class="sh-btn" style="padding:0 16px">OK</button></form></div>`;
  return o;
}
function restHtml() {
  if (!sess || !sess.restEnd || sess.restEnd <= Date.now()) return '';
  const left = sess.restEnd - Date.now(), tot = sess.restTotal || left;
  return `<div class="sh-rest"><div class="sh-row sh-sb"><span class="sh-lbl">Отдых</span><b style="font-size:22px">${fmtT(left)}</b></div><div class="sh-bar" style="margin:8px 0"><i style="width:${Math.min(100, left / tot * 100)}%"></i></div><div class="sh-row"><button class="sh-btn ghost" data-act="rest" data-v="-15">−15 с</button><button class="sh-btn ghost" data-act="rest" data-v="15">+15 с</button><button class="sh-btn ghost" data-act="rest" data-v="0">Пропустить</button></div></div>`;
}

/* ---------- модальные окна ---------- */
const sheet = (t, b) => `<div class="sh-modal" data-act="mclose"><div class="sh-sheet" data-stop><div class="sh-row sh-sb" style="margin-bottom:12px"><h3 class="sh-h">${t}</h3><button class="sh-x" data-act="mclose">×</button></div>${b}</div></div>`;
function exList() {
  const q = ui.q.trim().toLowerCase(), l = LIB.filter(x => !q || x.n.toLowerCase().includes(q));
  return l.map(x => `<button class="sh-item" data-act="pick" data-n="${esc(x.n)}" style="border-left:3px solid ${gc(x.m)}"><span>${esc(x.n)}<br><span class="sh-mu">${gtxt(x.m)} · ${x.w ? x.w + ' кг × ' : ''}${x.r}</span></span><b style="color:var(--lime)">+</b></button>`).join('') + (q ? `<button class="sh-item" data-act="pickc"><span>Добавить свое: «${esc(ui.q.trim())}»</span><b style="color:var(--lime)">+</b></button>` : '');
}
function confirmHtml() {
  return `<div class="sh-modal" style="z-index:110;align-items:center;padding:16px"><div class="sh-sheet" style="border-radius:22px;max-width:380px;padding:20px"><h3 class="sh-h" style="margin-bottom:6px">Сохранить изменения?</h3><p class="sh-mu" style="margin-bottom:16px">Вы внесли правки, которые ещё не сохранены.</p><button class="sh-btn big" data-act="csave">Сохранить</button><button class="sh-btn red big" style="margin-top:8px" data-act="cdiscard">Не сохранять</button><button class="sh-btn ghost big" style="margin-top:8px" data-act="ccancel">Продолжить редактирование</button></div></div>`;
}
/* ---------- быстрое добавление ---------- */
const favGet = () => { try { const f = JSON.parse(localStorage.getItem('sportHubFavs')); return {ex:Array.isArray(f && f.ex) ? f.ex : [], pr:Array.isArray(f && f.pr) ? f.pr : []}; } catch (e) { return {ex:[], pr:[]}; } };
const favToggle = (k, v) => { const f = favGet(), i = f[k].indexOf(v); if (i < 0) f[k].push(v); else f[k].splice(i, 1); try { localStorage.setItem('sportHubFavs', JSON.stringify(f)); } catch (e) {} return i < 0; };
const heartI = on => `<svg width="18" height="18" viewBox="0 0 24 24" fill="${on ? '#ff6b7a' : 'none'}" stroke="${on ? '#ff6b7a' : 'currentColor'}" stroke-width="2" stroke-linejoin="round"><path d="M12 20.5s-7-4.4-9.2-8.6C1.1 8.6 3.2 5 6.8 5c2.1 0 3.8 1.1 5.2 2.8C13.4 6.1 15.1 5 17.2 5c3.6 0 5.7 3.6 4 6.9-2.2 4.2-9.2 8.6-9.2 8.6Z"/></svg>`;
function progList() {
  const h = hub();
  return PRESETS.map(x => ({id:x.id, title:x.title, names:x.names, tags:presetTags(x), mine:false}))
    .concat(h.workouts.filter(x => !x.forDate && !x.id.startsWith('preset-')).map(x => ({id:x.id, title:x.title, names:x.exercises.map(e => e.name), tags:x.tags || [], mine:true})));
}
const progRow = x => `<button class="sh-item" data-act="apv" data-id="${esc(x.id)}" style="border-left:3px solid ${gc(x.tags[0])}"><span><b>${esc(x.title)}</b><br><span class="sh-mu">${x.names.length} упр. · ${x.tags.map(gtxt).join(', ')}</span></span><b style="color:var(--mu)">›</b></button>`;
const exRow = (x, extra) => `<button class="sh-item" data-act="axpick" data-n="${esc(x.n)}" style="border-left:3px solid ${gc(x.m)}"><span>${esc(x.n)}<br><span class="sh-mu">${gtxt(x.m)} · ${x.w ? x.w + ' кг × ' : 'свой вес × '}${x.r}</span></span><b style="color:var(--lime)">${extra || '+'}</b></button>`;
function acHtml() {
  const q = ui.aq.trim().toLowerCase(); if (!q) return '';
  const ex = LIB.filter(x => x.n.toLowerCase().includes(q) || GROUPS[x.m].toLowerCase().includes(q)).slice(0, 7);
  const pr = progList().filter(x => x.title.toLowerCase().includes(q)).slice(0, 4);
  return (pr.length ? '<div class="sh-lbl" style="margin:10px 0 0">Программы</div>' + pr.map(progRow).join('') : '') + (ex.length ? '<div class="sh-lbl" style="margin:10px 0 0">Упражнения</div>' + ex.map(x => exRow(x)).join('') : '') + `<button class="sh-item" data-act="acust"><span>Добавить своё: «${esc(ui.aq.trim())}»</span><b style="color:var(--lime)">+</b></button>`;
}
const addSheet = (d, b) => `<div class="sh-modal sh-addm" data-act="mclose"><div class="sh-sheet sh-adds" data-stop><div class="sh-ahead"><div><div class="sh-aeye">SPORT.PRO</div><h3 class="sh-atitle">Добавить тренировку</h3><div class="sh-adate">${d}</div></div><button class="sh-ax" data-act="mclose" aria-label="Закрыть"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button></div><div class="sh-abody">${b}</div></div></div>`;
function addHtml() {
  const d = dateLabel(selDay()), ap = ui.ap, sc = (a, i) => `<button class="sh-sq${ap === a ? ' on' : ''}" data-act="apanel" data-v="${a}" title="${({auto:'Авто-подбор программы на день',fav:'Избранное',lib:'Библиотека упражнений',prog:'Программы тренировок'})[a]}">${i}</button>`;
  const back = `<div class="sh-row sh-sb" style="margin-bottom:10px"><button class="sh-chip" data-act="aback">← Назад</button>`;
  let body = '';
  if (ap === 'auto') {
    const a = ui.ai, sel = (k, arr) => `<div class="sh-seg" style="margin-bottom:12px">${arr.map(([v, t]) => `<button data-act="aiset" data-k="${k}" data-v="${v}" class="${String(a[k]) === String(v) ? 'on' : ''}">${t}</button>`).join('')}</div>`;
    body = back + `<span class="sh-chip">Алгоритм или ИИ</span></div><p class="sh-mu" style="margin-bottom:12px">Задайте параметры: из готовых упражнений программу соберёт встроенный алгоритм по забитости мышц с учётом времени и отдыха, либо ИИ на сервере.</p><div class="sh-lbl">Цель</div>${goalSel(a)}<div class="sh-lbl">Оборудование</div>${sel('eq', [['gym','Инвентарь + тренажёры'],['none','Без инвентаря']])}<div class="sh-lbl">Время, мин</div>${sel('min', [[20,'20'],[30,'30'],[45,'45'],[60,'60'],[75,'75'],[90,'90']])}<div class="sh-lbl" style="margin-bottom:6px">Акцент на мышцы (пусто — по забитости)</div><div class="sh-row sh-wrap" style="margin-bottom:14px">${Object.keys(GROUPS).map(g => `<button class="sh-chip" style="${a.focus.includes(g) ? 'background:' + gc(g) + ';color:#000;border-color:' + gc(g) : gtint(g)}" data-act="aiset" data-k="focus" data-v="${g}">${GROUPS[g]}</button>`).join('')}</div><button class="sh-btn big" data-act="aigen">Собрать программу из готовых</button><button class="sh-btn ghost big" style="margin-top:8px;border-color:rgba(184,255,44,.5);color:var(--lime)" data-act="aireal"${ui.aiBusy ? ' disabled' : ''}>${ui.aiBusy ? 'ИИ подбирает программу…' : 'Собрать через ИИ'}</button>${ui.aiErr ? `<p style="color:var(--red);margin-top:10px;font-size:13px">${esc(ui.aiErr)}</p>` : ''}<p class="sh-mu" style="margin-top:8px">ИИ работает через сервер приложения, ответ может занять до минуты.</p>`;
  } else if (ap === 'fav') {
    const f = favGet(), exs = f.ex.map(find).filter(Boolean), prs = progList().filter(x => f.pr.includes(x.id));
    body = back + `<b>Избранное · ${exs.length + prs.length}</b></div>` + (exs.length + prs.length ? (prs.length ? '<div class="sh-lbl">Программы</div>' + prs.map(progRow).join('') : '') + (exs.length ? '<div class="sh-lbl" style="margin-top:12px">Упражнения</div>' + exs.map(x => exRow(x)).join('') : '') : '<p class="sh-mu">Пока пусто. Отмечайте упражнения и программы сердечком, и они появятся здесь.</p>');
  } else if (ap === 'lib') {
    const m = ui.libm, l = LIB.filter(x => m === 'all' || x.m === m);
    body = back + `<b>Библиотека · ${l.length}</b></div><div class="sh-chips" style="margin-bottom:6px"><button class="sh-chip${m === 'all' ? ' on' : ''}" data-act="libm" data-v="all">Все</button>${Object.keys(GROUPS).map(g => `<button class="sh-chip" style="${m === g ? 'background:' + gc(g) + ';color:#000;border-color:' + gc(g) : gtint(g)}" data-act="libm" data-v="${g}">${GROUPS[g]}</button>`).join('')}</div>` + l.map(x => exRow(x)).join('');
  } else if (ap === 'prog') {
    const np = ui.np, pg = ui.pg || 'all';
    const chips = `<div class="sh-chips" style="margin:2px 0 8px"><button class="sh-chip${pg === 'all' ? ' on' : ''}" data-act="pgm" data-v="all">Все</button>${Object.keys(GROUPS).map(g => `<button class="sh-chip" style="${pg === g ? 'background:' + gc(g) + ';color:#000;border-color:' + gc(g) : gtint(g)}" data-act="pgm" data-v="${g}">${GROUPS[g]}</button>`).join('')}</div>`;
    const st = (k, v, lab) => `<div class="sh-row sh-sb" style="margin-top:10px"><span class="sh-lbl">${lab}</span><span class="sh-row" style="gap:10px"><button class="sh-sq sm" data-act="nps" data-k="${k}" data-d="-1">−</button><b style="min-width:70px;text-align:center">${v}</b><button class="sh-sq sm" data-act="nps" data-k="${k}" data-d="1">+</button></span></div>`;
    const row = x => {
      const c = np.cfg[x.n], on = np.sel.includes(x.n), ed = np.edit && np.edit.n === x.n, e = np.edit;
      return `<div class="sh-item" style="border-left:3px solid ${gc(x.m)};flex-wrap:wrap"><span style="flex:1;min-width:0">${esc(x.n)}<br><span class="sh-mu">${gtxt(x.m)}${on && c ? ' · ' + c.sets + ' × ' + c.reps + (c.w ? ' · ' + c.w + ' кг' : '') : ''}</span></span>` +
        `<button class="sh-sq sm" data-act="npe" data-n="${esc(x.n)}" style="${on ? 'color:var(--lime);border-color:var(--lime)!important' : ''}">${ed ? '×' : on ? '✓' : '+'}</button>` +
        (ed ? `<div style="width:100%;margin-top:6px">${st('sets', e.sets, 'Подходы')}${st('reps', e.reps, 'Повторения')}<div class="sh-row sh-sb" style="margin-top:10px"><span class="sh-lbl">Вес</span><button class="sh-chip${e.w ? '' : ' on'}" data-act="npbw">Свой вес</button></div>${e.w ? st('w', e.w + ' кг', '').replace('<span class="sh-lbl"></span>', '') : ''}<button class="sh-btn big" style="margin-top:12px" data-act="npok">${on ? 'Сохранить изменения' : '+ Добавить в новую программу'}</button><div class="sh-row" style="gap:8px;margin-top:8px"><button class="sh-btn ghost" style="flex:1" data-act="npcancel">${on ? 'Закрыть' : 'Отменить добавление'}</button>${on ? '<button class="sh-btn red" style="flex:1" data-act="nprm">Убрать</button>' : ''}</div></div>` : '') + `</div>`;
    };
    body = back + `<b>Программы тренировок</b></div><div class="sh-seg" style="margin-bottom:8px"><button class="${ui.ptab === 'ready' ? 'on' : ''}" data-act="ptab" data-v="ready">Готовые программы</button><button class="${ui.ptab === 'new' ? 'on' : ''}" data-act="ptab" data-v="new">+ Новая программа</button></div>` + chips + (ui.ptab === 'ready' ? (progList().filter(x => pg === 'all' || x.tags.includes(pg) || x.names.some(n => { const l = find(n); return l && l.m === pg; })).map(progRow).join('') || '<p class="sh-mu" style="margin:10px 0">Нет программ для этой группы</p>') : `<input data-npn placeholder="Название программы (напр. Спина + Дельты)" value="${esc(np.name)}"><div class="sh-lbl" style="margin:12px 0 4px">Выберите упражнения (выбрано: ${np.sel.length})</div>${LIB.filter(x => pg === 'all' || x.m === pg).map(row).join('')}<button class="sh-btn big" style="margin-top:12px" data-act="npsave"${np.name.trim() && np.sel.length ? '' : ' disabled'}>Сохранить и добавить</button><button class="sh-chip" style="margin-top:10px" data-act="manual">Расширенный конструктор</button>`);
  } else if (ap === 'cfg') {
    const c = ui.cfg, l = find(c.n), on = favGet().ex.includes(c.n), st = (k, v, lab) => `<div class="sh-row sh-sb" style="margin-top:12px"><span class="sh-lbl">${lab}</span><span class="sh-row" style="gap:10px"><button class="sh-sq sm" data-act="cfgs" data-k="${k}" data-d="-1">−</button><b style="min-width:70px;text-align:center">${v}</b><button class="sh-sq sm" data-act="cfgs" data-k="${k}" data-d="1">+</button></span></div>`;
    body = back + `<span class="sh-chip" style="${gtint(l.m)}">${GROUPS[l.m]}</span></div><div class="sh-row sh-sb"><h3 class="sh-h" style="color:${gc(l.m)}">${esc(c.n)}</h3><button class="sh-chip" data-act="afav" data-k="ex" data-v="${esc(c.n)}" style="line-height:0;padding:7px 9px">${heartI(on)}</button></div>${st('sets', c.sets, 'Подходы')}${st('reps', c.reps, 'Повторения')}<div class="sh-row sh-sb" style="margin-top:12px"><span class="sh-lbl">Вес</span><button class="sh-chip${c.w ? '' : ' on'}" data-act="cfgbw">Свой вес</button></div>${c.w ? st('w', c.w + ' кг', '').replace('<span class="sh-lbl"></span>', '') : ''}<div class="sh-stats" style="margin-top:16px"><div class="sh-stat"><b>${c.sets}×${c.reps}</b>схема</div><div class="sh-stat"><b>${c.sets * c.reps}</b>повторов</div><div class="sh-stat"><b>${fmtN(c.sets * c.reps * c.w)}</b>кг объём</div></div><button class="sh-btn big" data-act="cfgadd">Добавить на ${d}</button>`;
  } else if (ap === 'pv') {
    const x = progList().find(z => z.id === ui.pv); if (!x) { ui.ap = null; return addHtml(); }
    const on = favGet().pr.includes(x.id), h = hub(), wk = h.workouts.find(z => z.id === x.id);
    body = back + `<span class="sh-chip">${x.mine ? 'Моя программа' : 'Готовая программа'}</span></div><div class="sh-row sh-sb"><h3 class="sh-h">${esc(x.title)}</h3><button class="sh-chip" data-act="afav" data-k="pr" data-v="${esc(x.id)}" style="line-height:0;padding:7px 9px">${heartI(on)}</button></div><div style="margin:6px 0 10px">${x.tags.map(gtxt).join(', ')}</div>` + pvRows(x, wk) + `<button class="sh-btn big" style="margin-top:14px" data-act="pvadd" data-id="${esc(x.id)}">Добавить на ${d}</button>`;
  } else {
    body = '<p class="sh-mu" style="margin:2px 0 4px">Найдите упражнение или программу, либо выберите инструмент ниже.</p>';
  }
  const f = favGet(), n = f.ex.length + f.pr.length;
  return addSheet(d, `<div style="position:relative"><input data-aq placeholder="Найти упражнение или программу..." value="${esc(ui.aq)}"><div data-alist>${acHtml()}</div></div><div data-arest${ui.aq.trim() ? ' style="display:none"' : ''}><div class="sh-row sh-sqrow sh-mainbtns" style="margin:12px 0">${sc('prog', '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/></svg><span>Программы</span>')}${sc('auto', '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/></svg><span>Через ИИ</span>')}<span class="sh-favw" style="position:relative;flex:0 0 56px;display:flex">${sc('fav', heartI(ap === 'fav'))}${n ? `<b class="sh-fb">${n}</b>` : ''}</span></div>${body}</div>`);
}

/* ---------- ИИ-программа дня (сервер, GigaChat) ---------- */
const AI_API = 'https://food-pro-api.onrender.com/api/sports/day-plan';
const AIG = {chest:['chest'],back:['back'],shoulders:['shoulders'],arms:['biceps','triceps'],legs:['legs'],glutes:['glutes'],abs:['core']};
const AIM = {chest:'chest',back:'back',shoulders:'shoulders',biceps:'arms',triceps:'arms',legs:'legs',glutes:'glutes',core:'abs'};
function aiMatch(name, m) {
  const n = name.toLowerCase(), pool = LIB.filter(x => !m || x.m === m);
  let r = LIB.find(x => n.includes(x.n.toLowerCase()) || x.n.toLowerCase().includes(n)); if (r) return r;
  const stems = n.split(/[^а-яёa-z]+/).filter(z => z.length >= 5).map(z => z.slice(0, 5));
  return pool.find(x => stems.some(z => x.n.toLowerCase().includes(z))) || null;
}
async function aiGenerate() {
  const a = ui.ai, d = selDay(), h = hub(), pf = (S && S.profile) || {}, sp = (S && S.sports && S.sports.profile) || {};
  if (ui.aiBusy) return;
  if (!confirm('Отправить на сервер ИИ цель, возраст, уровень, оборудование и выбранные мышцы для подбора программы? Имя и прочие данные не передаются.')) return;
  const dl = n => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10), since = dl(28);
  const body = {date:d, age:Math.min(85, Math.max(18, Math.round(Number(pf.age)) || 30)), level:['beginner','regular','experienced'].includes(sp.level) ? sp.level : 'regular',
    goal:a.goal === 'strength' ? 'strength' : 'muscle', body_goal:a.goal === 'recomp' ? 'recomp' : a.goal === 'lose' ? 'lose' : (['lose','gain','maintain'].includes(pf.goal) ? pf.goal : 'maintain'),
    restrictions:['none','yes','unsure'].includes(sp.restrictions) ? sp.restrictions : 'none', health_flag:false, injury:'no', cardio:'no', limitations:false,
    minutes:a.min, profile_minutes:Math.min(90, Math.max(10, Number(sp.minutes) || a.min)), place:a.eq === 'none' ? 'home' : 'gym', equipment:a.eq === 'none' ? 'Без инвентаря, только вес тела' : 'Зал: штанги, гантели, тренажёры',
    kinds:['strength'], intensity:'moderate', wellbeing:'ready', existing_minutes:0,
    strength_dates:[...new Set(h.sessions.map(x => x.date).filter(x => x >= since))].slice(-28)};
  const groups = a.focus.flatMap(g => AIG[g] || []); if (groups.length) body.groups = groups;
  ui.aiBusy = true; ui.aiErr = ''; paint(true);
  try {
    let res = null;
    for (let i = 0; i < 3; i++) {
      const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), 120000);
      try { res = await fetch(AI_API, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body), signal:ctl.signal, credentials:'omit'}); } finally { clearTimeout(tm); }
      if (res.status !== 502 && res.status !== 503 && !(res.status === 500)) break;
    }
    if (res.status === 429) throw new Error('Слишком много запросов. Подождите минуту и повторите.');
    let j = null; try { j = await res.json(); } catch (e) {}
    if (!res.ok) throw new Error(typeof (j && j.detail) === 'string' ? j.detail : 'ИИ не смог собрать программу, повторите попытку.');
    const acts = (j.activities || []).filter(x => x.kind === 'strength' && x.name);
    if (!acts.length) throw new Error('ИИ не вернул силовых упражнений. Попробуйте другие параметры.');
    const ex = acts.slice(0, 10).map(x => {
      const m = AIM[x.muscleGroup] || null, l = aiMatch(x.name, m), mu = m || (l && l.m) || (a.focus[0]) || 'chest';
      const sets = Math.min(8, Math.max(1, x.sets || 3)), reps = Math.min(50, Math.max(1, x.reps || 10)), wt = x.weight != null ? num(x.weight) : (l ? l.w : 0);
      return {id:uid('e'), name:x.name, muscles:[mu], tempo:(l && l.tempo) || '2-0-1', restSec:(l && l.rest) || 90, note:x.notes || '', sets:Array.from({length:sets}, () => ({id:uid('s'), type:'n', weight:wt, reps, rir:2, done:false}))};
    });
    const w = {id:uid('w'), title:'Программа на ' + dateLabel(d), src:'ai', tags:[...new Set(ex.flatMap(e => e.muscles))], exercises:ex, forDate:d, meso:'ИИ · ' + (j.summary || '')};
    setHub(hh => { hh.workouts.push(w); hh.dated[d] = w.id; }); setSel(w.id);
    ui.aiBusy = false; ui.modal = null; paint(); toast2('Программа от ИИ добавлена на ' + dateLabel(d));
    if (Array.isArray(j.warnings) && j.warnings.length) setTimeout(() => toast2(j.warnings[0]), 2500);
  } catch (e) { ui.aiBusy = false; ui.aiErr = e.name === 'AbortError' ? 'Сервер долго не отвечает. Повторите попытку.' : (e.message && !/fetch|network/i.test(e.message) ? e.message : 'Нет связи с сервером ИИ. Проверьте интернет и повторите.'); paint(true); }
}
function modalHtml() {
  const m = ui.modal; if (!m) return '';
  const pro = mode() === 'pro';
  if (m === 'addmenu') return addHtml();
  if (m === 'plan') {
    const h = hub(), t = wdOf(todayS());
    return sheet('План недели', `<p class="sh-mu" style="margin-bottom:6px">Назначьте программу на каждый день. По плану она появится в карточке дня, и её можно сразу запустить.</p>${WDL.map((n2, i) => `<div class="sh-item"><b style="min-width:110px;${String(i) === t ? 'color:var(--lime)' : ''}">${n2}</b><select data-plan="${i}"><option value="">Не задано</option><option value="rest"${h.plan[i] === 'rest' ? ' selected' : ''}>День отдыха</option>${h.workouts.filter(z => !z.forDate).map(x => `<option value="${x.id}"${h.plan[i] === x.id ? ' selected' : ''}>${esc(x.title)}</option>`).join('')}</select></div>`).join('')}<div class="sh-row" style="margin-top:14px"><button class="sh-btn ghost" style="flex:1" data-act="manual">Создать программу</button><button class="sh-btn" style="flex:1" data-act="rclose">Готово</button></div>`);
  }
  if (m === 'sedit') {
    const d = ui.sdraft;
    return sheet('Изменить выполненную', d.exercises.map((e, i) => `<div class="sh-ex" style="border-left:4px solid ${gc(e.muscles[0])}"><div class="sh-row sh-sb"><b>${esc(e.name)}</b><button class="sh-chip" data-act="sxrem" data-e="${i}">Удалить</button></div>${e.sets.map((z, j) => `<div class="sh-set novice" style="grid-template-columns:24px 1fr 1fr 34px"><span class="t">${j + 1}</span><input inputmode="decimal" data-sf="weight" data-e="${i}" data-s="${j}" value="${esc(z.weight)}" placeholder="кг"><input inputmode="numeric" data-sf="reps" data-e="${i}" data-s="${j}" value="${esc(z.reps)}" placeholder="повт."><button class="sh-chip" data-act="ssdel" data-e="${i}" data-s="${j}">×</button></div>`).join('')}</div>`).join('') + `<div class="sh-row" style="margin-top:12px"><button class="sh-btn ghost" style="flex:1" data-act="sdelall">Удалить тренировку</button><button class="sh-btn" style="flex:1" data-act="ssave">Сохранить</button></div>`);
  }
  if (m === 'dayex') return sheet('Упражнения на ' + dateLabel(selDay()), `<input data-q placeholder="Поиск или свое упражнение" value="${esc(ui.q)}"><div data-exlist>${exList()}</div><button class="sh-btn big" style="margin-top:14px" data-act="mclose">Готово</button>`);
  if (m === 'rep') {
    const h = hub(), r = ui.rep, w = h.workouts.find(x => x.id === r.wid), mine = h.repeats.filter(x => x.wid === r.wid);
    const opt = [[1,'Каждый день'],[2,'Через день'],[3,'Каждые 3 дня'],[7,'Раз в неделю'],[14,'Раз в 2 недели'],['wd','По дням недели']];
    const desc = x => (x.wd ? 'по ' + x.wd.map(i => WD[i]).join(', ') : x.every === 1 ? 'каждый день' : x.every === 2 ? 'через день' : x.every === 7 ? 'раз в неделю' : x.every === 14 ? 'раз в 2 недели' : 'каждые ' + x.every + ' дня') + ' с ' + dateLabel(x.start) + (x.until ? ' до ' + dateLabel(x.until) : ', без конца');
    return sheet('Повторение тренировки', `<p class="sh-mu" style="margin-bottom:10px">${w ? esc(w.title) : ''}. Первое занятие выпадает на ${dateLabel(selDay())}.</p><div class="sh-lbl" style="margin-bottom:6px">Цикл повторения</div><div class="sh-row sh-wrap" style="margin-bottom:12px">${opt.map(([v, t]) => `<button class="sh-chip${String(r.every) === String(v) ? ' on' : ''}" data-act="repset" data-k="every" data-v="${v}">${t}</button>`).join('')}</div>${r.every === 'wd' ? `<div class="sh-row" style="gap:5px;margin-bottom:12px">${WD.map((n2, i) => `<button class="sh-chip${r.wd.includes(i) ? ' on' : ''}" data-act="repset" data-k="wd" data-v="${i}" style="flex:1;text-align:center;padding:7px 0">${n2}</button>`).join('')}</div>` : ''}<div class="sh-lbl" style="margin-bottom:6px">Как долго</div><div class="sh-row sh-wrap" style="margin-bottom:14px">${[[4,'4 недели'],[8,'8 недель'],[12,'12 недель'],[0,'Без конца']].map(([v, t]) => `<button class="sh-chip${r.len === v ? ' on' : ''}" data-act="repset" data-k="len" data-v="${v}">${t}</button>`).join('')}</div><button class="sh-btn big" data-act="repsave">Включить повторение</button>${mine.length ? '<div class="sh-lbl" style="margin:16px 0 2px">Уже настроено</div>' + mine.map(x => `<div class="sh-item"><span class="sh-mu" style="color:var(--tx)">${desc(x)}</span><button class="sh-chip" data-act="repdel" data-id="${x.id}">×</button></div>`).join('') : ''}`);
  }
  if (m === 'favs') {
    const h = hub(), mine = h.workouts.filter(x => !x.forDate && !x.id.startsWith('preset-')), tg = t => t.map(gtxt).join(', ');
    return sheet('Программа на ' + dateLabel(selDay()), '<button class="sh-btn ghost big" data-act="manual" style="margin-bottom:6px">+ Создать новую программу</button><div class="sh-lbl" style="margin:14px 0 2px">Готовые программы</div>' + PRESETS.map(x => `<button class="sh-item" data-act="presetpick" data-id="${x.id}" style="border-left:3px solid ${gc(presetTags(x)[0])}"><span><b>${esc(x.title)}</b><br><span class="sh-mu">${x.names.length} упр. · ${tg(presetTags(x))}</span></span><b style="color:var(--lime)">+</b></button>`).join('') + '<div class="sh-lbl" style="margin:16px 0 2px">Мои программы</div>' + (mine.length ? mine.map(x => `<div class="sh-item" style="border-left:3px solid ${gc((x.tags[0]))}"><button data-act="favpick" data-id="${x.id}" style="flex:1;text-align:left"><b>${esc(x.title)}</b><br><span class="sh-mu">${x.exercises.length} упр. · ${tg(x.tags)}</span></button><button class="sh-chip" data-act="favdel" data-id="${x.id}">×</button></div>`).join('') : '<p class="sh-mu" style="margin-top:6px">Своих программ пока нет.</p>') + (h.sessions.length ? '<div class="sh-lbl" style="margin:16px 0 4px">Повторить недавние</div>' + h.sessions.slice(-5).reverse().map(x => `<div class="sh-item"><span><b>${esc(x.title)}</b><br><span class="sh-mu">${x.date}</span></span><button class="sh-chip" data-act="repeat" data-id="${x.id}">Повторить</button></div>`).join('') : ''));
  }

  if (m === 'manual') {
    const d = ui.draft;
    return sheet(d.editId ? 'Изменить тренировку' : 'Новая тренировка', `<input data-d="title" value="${esc(d.title)}" placeholder="Название">${d.editId ? `<div class="sh-seg" style="margin:10px 0">${[['date','Только для этой даты'],['all','Везде']].map(([k, t]) => `<button data-act="dscope" data-v="${k}" class="${d.scope === k ? 'on' : ''}">${t}</button>`).join('')}</div>` : `<div class="sh-seg" style="margin:10px 0">${[['today','На сегодня'],['template','В шаблон'],['free','Свободная']].map(([k, t]) => `<button data-act="dstatus" data-v="${k}" class="${d.status === k ? 'on' : ''}">${t}</button>`).join('')}</div>`}
    ${d.exercises.map((e, i) => `<div class="sh-ex" style="border-left:4px solid ${gc(e.muscles[0])}"><div class="sh-row sh-sb"><b>${esc(e.name)}</b><span class="sh-row"><button class="sh-chip" data-act="dup" data-e="${i}">↑</button><button class="sh-chip" data-act="ddown" data-e="${i}">↓</button><button class="sh-chip" data-act="drem" data-e="${i}">×</button></span></div>${e.sets.map((s, j) => `<div class="sh-set novice" style="grid-template-columns:24px 1fr 1fr 34px"><span class="t">${j + 1}</span><input inputmode="decimal" data-df="weight" data-e="${i}" data-s="${j}" value="${esc(s.weight)}" placeholder="кг"><input inputmode="numeric" data-df="reps" data-e="${i}" data-s="${j}" value="${esc(s.reps)}" placeholder="повт."><button class="sh-chip" data-act="dsdel" data-e="${i}" data-s="${j}">×</button></div>`).join('')}<button class="sh-chip" style="margin-top:8px" data-act="dsadd" data-e="${i}">+ Подход</button></div>`).join('')}
    <div class="sh-lbl" style="margin:12px 0 6px">Библиотека упражнений</div><input data-q placeholder="Поиск или свое упражнение" value="${esc(ui.q)}"><div data-exlist>${exList()}</div>
    <div class="sh-row" style="margin-top:14px"><button class="sh-btn ghost" style="flex:1" data-act="dsave">${!d.editId && d.status === 'free' ? 'Закрыть' : 'Сохранить'}</button>${isFuture() ? '' : '<button class="sh-btn" style="flex:1" data-act="dstart">Сохранить и начать</button>'}</div>`);
  }
  if (m === 'ai') {
    const a = ui.ai, sel = (k, arr) => `<div class="sh-seg" style="margin-bottom:12px">${arr.map(([v, t]) => `<button data-act="aiset" data-k="${k}" data-v="${v}" class="${String(a[k]) === String(v) ? 'on' : ''}">${t}</button>`).join('')}</div>`;
    return sheet('Программа на ' + dateLabel(selDay()), `<p class="sh-mu" style="margin-bottom:12px">Программа собирается автоматически по вашим параметрам и забитости мышц. Нейросеть здесь не используется.</p><div class="sh-lbl">Цель</div>${goalSel(a)}<div class="sh-lbl">Оборудование</div>${sel('eq', [['gym','Инвентарь + тренажёры'],['none','Без инвентаря']])}<div class="sh-lbl">Время, мин</div>${sel('min', [[20,'20'],[30,'30'],[45,'45'],[60,'60'],[75,'75'],[90,'90']])}<div class="sh-lbl" style="margin-bottom:6px">Акцент на мышцы (пусто — подберу по забитости)</div><div class="sh-row sh-wrap" style="margin-bottom:14px">${Object.keys(GROUPS).map(g => `<button class="sh-chip${a.focus.includes(g) ? ' on' : ''}" data-act="aiset" data-k="focus" data-v="${g}">${GROUPS[g]}</button>`).join('')}</div><button class="sh-btn big" data-act="aigen">Собрать программу</button>`);
  }
  if (m === 'progress') {
    const h = hub(), p = prs(h), ws = weekSets(h), top = Object.entries(p).sort((a, b) => b[1] - a[1]).slice(0, 12), mm = {};
    h.sessions.forEach(x => x.exercises.forEach(e => { mm[e.name] = e.muscles[0]; }));
    return sheet('Прогресс и PR', `<div class="sh-lbl">Расчётный 1ПМ (формула Эпли)</div>${top.length ? top.map(([n, v]) => { const g = mm[n] || (find(n) || {}).m; return `<div class="sh-item" style="border-left:3px solid ${gc(g)}"><span>${esc(n)}<br>${g ? gtxt(g) : ''}</span><b style="color:${gc(g)}">${Math.round(v)} кг</b></div>`; }).join('') : '<p class="sh-mu" style="margin:8px 0">Пока нет завершённых тренировок.</p>'}<div class="sh-lbl" style="margin:16px 0 6px">Подходов за неделю (цель 10–16)</div>${Object.keys(GROUPS).map(g => { const v = ws[g] || 0; return `<div style="margin-top:8px"><div class="sh-row sh-sb"><span>${gtxt(g)}</span><b style="color:${gc(g)}">${v}</b></div><div class="sh-bar"><i style="width:${Math.min(100, v / 12 * 100)}%;background:${gc(g)}"></i></div></div>`; }).join('')}`);
  }

  if (m === 'swap') {
    const ex = sess.exercises[ui.swapE], base = find(ex.name), grp = ex.muscles[0];
    const alts = LIB.filter(x => x.m === grp && x.n !== ex.name && !sess.exercises.some(e => e.name === x.n));
    return sheet('Заменить упражнение', `<p class="sh-mu">${esc(ex.name)} — вес невыполненных подходов пересчитается.</p>${alts.length ? alts.map(x => `<button class="sh-item" data-act="swapto" data-n="${esc(x.n)}"><span>${esc(x.n)}<br><span class="sh-mu">${x.w ? x.w + ' кг × ' : ''}${x.r}</span></span><b style="color:${gc(x.m)}">→</b></button>`).join('') : '<p class="sh-mu" style="margin-top:10px">Альтернатив в библиотеке нет.</p>'}`);
  }
  if (m === 'addex') return sheet('Добавить упражнение', `<input data-q placeholder="Поиск или свое упражнение" value="${esc(ui.q)}"><div data-exlist>${exList()}</div>`);
  if (m === 'finish') {
    const min = Math.max(1, Math.round((Date.now() - sess.startedAt) / 6e4)), n = sessSets(sess);
    return sheet('Завершить тренировку', `<div class="sh-stats"><div class="sh-stat"><b>${min}</b>мин</div><div class="sh-stat"><b>${fmtN(sessTon(sess))}</b>кг</div><div class="sh-stat"><b>${n}</b>подх.</div></div><p class="sh-mu" style="margin-bottom:12px">Примерно ${kcalOf(min)} ккал. Привычка «${esc(habitState().title)}» отметится автоматически.</p>${n ? '' : '<p style="color:var(--amb);margin-bottom:12px">Нет выполненных подходов — сохранять нечего.</p>'}<button class="sh-btn big" data-act="fsave" ${n ? '' : 'disabled'}>Сохранить и завершить</button><button class="sh-btn ghost big" style="margin-top:8px" data-act="mclose">Вернуться к тренировке</button>`);
  }
  if (m === 'result') {
    const r = ui.result, hb = habitState();
    return sheet('Тренировка сохранена', `<div class="sh-stats"><div class="sh-stat"><b>${r.min}</b>мин</div><div class="sh-stat"><b>${fmtN(r.ton)}</b>кг</div><div class="sh-stat"><b>${r.kcal}</b>ккал</div></div>
    <p class="sh-mu">Запись добавлена в дневник тренировок.</p>
    <div class="sh-item"><span>Привычка: ${esc(hb.title)}</span><b style="color:${hb.done ? 'var(--lime)' : 'var(--mu)'}">${hb.done ? 'отмечена' : 'не включена'}</b></div>
    ${!hb.enabled ? '<button class="sh-btn ghost big" style="margin-top:8px" data-act="henable">Включить привычку и отметить</button>' : ''}
    <button class="sh-btn ghost big" style="margin-top:8px" data-act="water">+500 мл воды</button>
    <button class="sh-btn ghost big" style="margin-top:8px" data-act="food">Добавить приём пищи (+${r.kcal} ккал, +25 г белка)</button>
    <button class="sh-btn big" style="margin-top:12px" data-act="rclose">Готово</button>`);
  }
  return '';
}

/* ---------- сборка / отрисовка ---------- */
function paint(keep) {
  if (!root) return; const y = keep ? window.scrollY : null;
  root.innerHTML = (ui.screen === 'workout' && sess ? workoutScreen() : dash()) + modalHtml() + (ui.confirmClose && ui.modal ? confirmHtml() : '');
  if (y !== null) window.scrollTo(0, y);
  syncTicker();
}
function syncTicker() {
  const need = ui.screen === 'workout' && sess;
  if (need && !ticker) ticker = setInterval(tick, 1000); else if (!need && ticker) { clearInterval(ticker); ticker = null; }
}
function tick() {
  if (!root || !root.isConnected || root.offsetParent === null || !sess) return;
  const q = s => root.querySelector(s), el = q('[data-t=elapsed]'); if (el) el.textContent = fmtT(Date.now() - sess.startedAt);
  const r = q('[data-t=rest]'); if (r) { const had = !!r.firstElementChild; if (sess.restEnd && sess.restEnd <= Date.now()) { sess.restEnd = null; saveSess(); toast2('Отдых закончен'); try { navigator.vibrate && navigator.vibrate(200); } catch (e) {} } const html = restHtml(); if (html || had) r.innerHTML = html; }
}
function stats() {
  const q = s => root.querySelector(s); const t = q('[data-t=ton]'); if (t) t.textContent = fmtN(sessTon(sess));
  const all = sess.exercises.reduce((a, e) => a + e.sets.length, 0), b = q('[data-t=bar]'); if (b) b.style.width = (all ? sessSets(sess) / all * 100 : 0) + '%';
}

/* ---------- действия ---------- */
function startSess(w) {
  const h = hub(); const ex = JSON.parse(JSON.stringify(w.exercises)).map(e => {
    const pv = prevSets(h, e.name); e.sets.forEach(s => { s.done = false; s.id = uid('s'); }); e.oneRm = prs(h)[e.name] || 0; if (pv && pv.length) { const nw = e.sets.filter(s => s.type !== 'w'); nw.forEach((s, i) => { const p = pv[Math.min(i, pv.length - 1)]; if (num(p.weight) > 0) s.weight = p.weight; }); } return e; });
  sess = {id:uid('ss'),workoutId:w.id,title:w.title,date:todayS(),startedAt:Date.now(),restEnd:null,restTotal:0,ai:null,exercises:ex};
  saveSess(); ui.screen = 'workout'; ui.modal = null; paint(); scrollTo(0, 0);
}
function startRest(sec) { sess.restTotal = sec * 1000; sess.restEnd = Date.now() + sec * 1000; }
function applyQuick(text) {
  const t = text.toLowerCase(); const nums = (t.match(/\d+(?:[.,]\d+)?/g) || []).map(num); if (!nums.length) return toast2('Не нашёл числа: укажите вес и повторы');
  const word = (t.match(/[а-яa-z]+/) || [''])[0].slice(0, 4);
  const ex = sess.exercises.find(e => e.name.toLowerCase().includes(word)) || sess.exercises.find(e => e.sets.some(s => !s.done));
  if (!ex) return toast2('Упражнение не найдено');
  const s = ex.sets.find(x => !x.done); if (!s) return toast2('Все подходы выполнены');
  const wm = t.match(/(\d+(?:[.,]\d+)?)\s*(?:кг)?/), rm = t.match(/на\s*(\d+)/), im = t.match(/(?:запас\S*|rir)\s*(\d+)/);
  s.weight = num(wm ? wm[1] : nums[0]); s.reps = rm ? +rm[1] : Math.round(nums[1] || s.reps); if (im) s.rir = +im[1]; s.done = true; startRest(ex.restSec);
  saveSess(); paint(true); toast2(`${ex.name}: ${s.weight} × ${s.reps}`);
}
function buildProgram() {
  const a = ui.ai, mult = a.goal === 'strength' ? 1.1 : a.goal === 'recomp' ? .9 : 1, n = a.level === 'new' ? 4 : a.level === 'mid' ? 5 : 6;
  const lib = LIB.filter(x => eqOk(a, x)), by = g => lib.filter(x => x.m === g);
  const splits = {2:[['Всё тело A',['chest','back','legs','shoulders','abs','arms']],['Всё тело B',['legs','back','chest','glutes','shoulders','abs']]],
   3:[['Всё тело A',['chest','back','legs','shoulders','abs','arms']],['Всё тело B',['legs','back','chest','glutes','shoulders','abs']],['Всё тело C',['back','chest','legs','arms','shoulders','abs']]],
   4:[['Верх тела A',['chest','back','shoulders','arms','abs']],['Низ тела A',['legs','glutes','abs']],['Верх тела B',['back','chest','shoulders','arms']],['Низ тела B',['legs','glutes','abs']]],
   5:[['Грудь и руки',['chest','chest','shoulders','arms','arms']],['Спина',['back','back','back','arms']],['Ноги',['legs','legs','glutes','legs','abs']],['Плечи и пресс',['shoulders','shoulders','chest','abs']],['Всё тело',['legs','back','chest','shoulders','abs']]]}[+a.days];
  const out = splits.map(([title, groups], di) => { const used = new Set(), names = []; for (const g of groups.slice(0, n)) { const c = by(g); const x = c.find(z => !used.has(z.n) && (c.indexOf(z) + di) % Math.max(1, c.length) === di % Math.max(1, c.length)) || c.find(z => !used.has(z.n)); if (x) { used.add(x.n); names.push(x.n); } } const w = mkW(title, names, 'ai', {meso:'Конструктор · ' + ({hyper:'гипертрофия',strength:'сила',recomp:'рекомпозиция'})[a.goal]});
    w.exercises.forEach(e => { const l = find(e.name); const reps = a.goal === 'strength' ? 5 : a.goal === 'recomp' ? 12 : l.r; e.sets.forEach(s => { if (s.type === 'n') { s.reps = reps; s.weight = l.w ? r05(l.w * mult) : 0; } }); if (a.goal === 'strength' && l.rest < 150) e.restSec = l.rest + 30; }); return w; });
  return out;
}
function syncEntries(rec) {
  try { commit(st => {
    const W = window.FoodWorkoutsStore; if (!st.workouts && W) st.workouts = W.empty(); if (!st.workouts) return;
    const backup = JSON.stringify(st.workouts), pre = 'hub-' + rec.id + '-', total = rec.exercises.reduce((a, e) => a + e.sets.length, 0);
    st.workouts.entries = st.workouts.entries.filter(e => !String(e.id).startsWith(pre));
    rec.exercises.forEach((e, i) => { const ws = e.sets.filter(x => x.type !== 'w'), use = ws.length ? ws : e.sets; st.workouts.entries.push({id:pre + i,kind:'strength',name:e.name,minutes:Math.min(1440, Math.max(1, Math.round(rec.minutes * e.sets.length / total))),sets:use.length,reps:Math.max(1, Math.round(use.reduce((a, x) => a + x.reps, 0) / use.length)),weight:Math.min(10000, Math.max(...use.map(x => x.weight))),muscleGroup:null,notes:'Тренировка: ' + rec.title,date:rec.date}); });
    try { if (W && W.validate) W.validate(st.workouts); } catch (e) { st.workouts = JSON.parse(backup); }
  }); } catch (e) {}
}
const GOALS = {
  hyper:{t:'Гипертрофия',s:[3,5],reps:null,rest:1,rir:2,meso:'гипертрофия'},
  strength:{t:'Сила',s:[4,6],reps:5,rest:1.25,rir:1,meso:'сила',minRest:150},
  recomp:{t:'Рекомпозиция',s:[3,4],reps:12,rest:.8,rir:2,meso:'рекомпозиция',maxRest:75},
  lose:{t:'Похудение',s:[3,4],reps:15,rest:.6,rir:3,meso:'похудение',maxRest:45},
  endur:{t:'Выносливость',s:[3,5],reps:18,rest:.55,rir:3,meso:'силовая выносливость',maxRest:40},
  tone:{t:'Тонус',s:[3,4],reps:14,rest:.7,rir:3,meso:'тонус и форма',maxRest:60},
  mobility:{t:'Здоровье и осанка',s:[2,3],reps:15,rest:.6,rir:4,meso:'здоровье и осанка',maxRest:45}
};
const eqOk = (a, x) => a.eq === 'none' ? x.e === 'bw' : true;
const goalSel = a => `<div class="sh-row sh-wrap" style="margin-bottom:12px">${Object.keys(GOALS).map(k => `<button class="sh-chip${a.goal === k ? ' on' : ''}" data-act="aiset" data-k="goal" data-v="${k}">${GOALS[k].t}</button>`).join('')}</div>`;
function exParams(l, a) {
  const G = GOALS[a.goal] || GOALS.hyper, reps = G.reps || l.r;
  let rest = Math.round(l.rest * G.rest / 5) * 5;
  if (G.minRest && l.w >= 40) rest = Math.max(rest, G.minRest); else if (G.minRest) rest = Math.max(rest, l.rest);
  if (G.maxRest) rest = Math.min(rest, G.maxRest);
  rest = Math.max(30, rest);
  const sp = Math.round(reps * 3.5) + 5;
  const w = l.w ? r05(l.w * (a.goal === 'strength' ? 1.1 : a.goal === 'hyper' ? 1 : a.goal === 'recomp' ? .9 : .75)) : 0;
  return {reps, rest, sp, w, warm: l.w >= 40 && (a.goal === 'strength' || a.goal === 'hyper')};
}
const exSec = (p, n) => 50 + (p.warm ? 40 + 45 : 0) + n * p.sp + (n - 1) * p.rest;
function buildDay() {
  const a = ui.ai, h = hub(), rec = recovery(h), d = selDay(), G = GOALS[a.goal] || GOALS.hyper;
  const ng = a.min <= 30 ? 2 : a.min <= 60 ? 3 : 4;
  let groups = a.focus.length ? a.focus.slice() : Object.keys(GROUPS).filter(g => g !== 'abs').sort((x, y) => rec[x] - rec[y]).slice(0, ng);
  if (!a.focus.length && a.min >= 45 && ['lose', 'endur', 'tone'].includes(a.goal)) groups.push('abs');
  const lib = LIB.filter(x => eqOk(a, x)), pools = groups.map(g => lib.filter(x => x.m === g).sort((x, y) => (y.w >= 40) - (x.w >= 40))).filter(p => p.length);
  if (!pools.length) return null;
  const budget = Math.max(10, a.min - 5) * 60, chosen = []; let used = 0;
  for (let i = 0; i < 40 && chosen.length < 12; i++) {
    const pool = pools[i % pools.length], x = pool.find(z => !chosen.some(c => c.l === z));
    if (!x) { if (pools.every(p => p.every(z => chosen.some(c => c.l === z)))) break; continue; }
    const p = exParams(x, a), t = exSec(p, G.s[0]);
    if (used + t > budget) { if (chosen.length >= 2 || i > pools.length * 3) break; continue; }
    chosen.push({l:x, p, n:G.s[0]}); used += t;
  }
  if (!chosen.length) { const x = pools[0][0], p = exParams(x, a); chosen.push({l:x, p, n:2}); used = exSec(p, 2); }
  for (let grow = true; grow;) { grow = false; for (const c of chosen) { if (c.n < G.s[1] && used + c.p.sp + c.p.rest <= budget) { c.n++; used += c.p.sp + c.p.rest; grow = true; } } }
  const total = used + 300, w = mkW('Программа на ' + dateLabel(d), chosen.map(c => c.l.n), 'ai', {meso:'Авто-подбор · ' + G.meso + ' · ≈' + Math.round(total / 60) + ' мин', forDate:d});
  w.exercises.forEach((e, i) => { const c = chosen[i], p = c.p, warm = e.sets.filter(z => z.type === 'w'); e.sets = (p.warm ? warm : []).concat(Array.from({length:c.n}, () => ({id:uid('s'), type:'n', weight:p.w, reps:p.reps, rir:G.rir, done:false}))); if (p.warm && e.sets[0] && e.sets[0].type === 'w') e.sets[0].weight = r05(p.w * .5); e.restSec = p.rest; });
  w.estMin = Math.round(total / 60);
  return w;
}
function addExDay(name, l, pre) {
  const d = selDay(), h0 = hub(), pv = planOf(h0, d), planned = pv && pv !== 'rest' ? h0.workouts.find(x => x.id === pv) : null;
  const base = (ui.selDay === d && h0.workouts.find(x => x.id === ui.sel)) || planned || (d === todayS() && pv !== 'rest' ? suggest(h0, recovery(h0)) : null);
  const ex = pre || (l ? mkEx(l) : newEx(name)); let target;
  setHub(h => {
    if (base && base.forDate === d) target = h.workouts.find(x => x.id === base.id);
    else { target = base ? JSON.parse(JSON.stringify(base)) : {title:'Тренировка',src:'manual',tags:[],exercises:[]}; target.id = uid('w'); target.forDate = d; h.workouts.push(target); }
    target.exercises.push(ex); target.tags = [...new Set(target.exercises.flatMap(e => e.muscles))]; h.dated[d] = target.id;
  });
  if (target) setSel(target.id);
  toast2('Добавлено: ' + ex.name);
}
function saveSessEdit() { const d = ui.sdraft; d.exercises.forEach(x => { x.sets = x.sets.map(z => ({...z, weight:Math.min(10000, Math.max(0, num(z.weight))), reps:Math.max(1, Math.round(num(z.reps)) || 1)})); }); const ex = d.exercises.filter(x => x.sets.length); if (!ex.length) return toast2('Оставьте хотя бы один подход или удалите тренировку'); let rec = null; setHub(h => { const x = h.sessions.find(z => z.id === d.id); if (x) { x.exercises = ex; rec = x; } }); if (rec) syncEntries(rec); ui.modal = null; ui.sdraft = null; paint(true); toast2('Изменения сохранены');}
function finish() {
  const min = Math.max(1, Math.round((Date.now() - sess.startedAt) / 6e4)), ton = sessTon(sess), kcal = kcalOf(min), total = sessSets(sess);
  const rec = {id:sess.id,workoutId:sess.workoutId,title:sess.title,date:sess.date,startedAt:sess.startedAt,endedAt:Date.now(),minutes:min,exercises:sess.exercises.map(e => ({name:e.name,muscles:e.muscles,sets:doneSets(e).map(s => ({type:s.type,weight:num(s.weight),reps:Math.round(num(s.reps)),rir:Math.round(num(s.rir))}))})).filter(e => e.sets.length)};
  setHub(h => { h.sessions.push(rec); });
  syncEntries(rec);
  markHabit(false);
  sess = null; saveSess(); ui.result = {min, ton, kcal}; ui.modal = 'result'; ui.screen = 'dash'; paint(); scrollTo(0, 0);
}
function markHabit(enable) {
  try { commit(st => {
    const p = st.profile; if (!p) return; const items = (p.habitsV2 = p.habitsV2 || {version:1,items:{}}).items = p.habitsV2.items || {};
    if (!items[HABIT] || !items[HABIT].enabled) { if (!enable) return; items[HABIT] = {enabled:true,target:'',schedule:'daily',time:''}; }
    const c = items[HABIT], d = todayS(), t = st.habitTracker = st.habitTracker || {version:1,records:{}}; t.records = t.records || {}; t.records[d] = t.records[d] || {};
    t.records[d][HABIT] = {done:true,updatedAt:new Date().toISOString(),title:habitState().title,schedule:c.schedule || 'daily',time:c.time || '',target:c.target || ''};
  }); } catch (e) { toast2('Не удалось отметить привычку'); }
}
function addWater() { try { commit(st => { st.water = st.water || {}; st.water[todayS()] = (Number(st.water[todayS()]) || 0) + 500; }); toast2('Добавлено 500 мл воды'); } catch (e) { toast2('Не удалось добавить воду'); } }
function openDraft(d) { ui.draft = d || {title:'Своя тренировка',status:'today',exercises:[]}; ui.snap = JSON.stringify(ui.draft); ui.confirmClose = false; ui.q = ''; ui.modal = 'manual'; paint(true); }
function saveDraft(start) {
  const d = ui.draft; if (!d.exercises.length) return toast2('Добавьте хотя бы одно упражнение');
  const w = {id:uid('w'),title:(d.title || 'Своя тренировка').trim(),src:'manual',tags:[...new Set(d.exercises.flatMap(e => e.muscles))],exercises:d.exercises.map(e => ({...e,sets:e.sets.map(s => ({...s,weight:num(s.weight),reps:Math.round(num(s.reps)) || 1}))}))};
  if (d.editId) {
    if (d.scope === 'all') { w.id = d.editId; const old = hub().workouts.find(x => x.id === d.editId); if (old) { w.src = old.src; if (old.meso) w.meso = old.meso; } setHub(h => { h.workouts = h.workouts.map(x => x.id === d.editId ? w : x); }); setSel(w.id); }
    else { w.forDate = selDay(); setHub(h => { h.workouts.push(w); h.dated[selDay()] = w.id; }); setSel(w.id); }
  } else if (d.status !== 'free') { setHub(h => { h.workouts.push(w); }); if (d.status === 'today') { assignDate(w.id); setSel(w.id); } }
  ui.modal = null; ui.draft = null;
  if (start && !isFuture()) startSess(w); else { paint(); toast2(d.status === 'free' ? 'Черновик закрыт' : d.editId ? 'Изменения сохранены' : 'Тренировка сохранена'); }
}
function newEx(name, groups, l) { return l ? mkEx(l) : {id:uid('e'),name,muscles:groups || ['chest'],tempo:'2-0-1',restSec:90,sets:[0,1,2].map(() => ({id:uid('s'),type:'n',weight:0,reps:10,rir:2,done:false}))}; }

function onClick(ev) {
  const t = ev.target.closest('[data-act]'); if (!t || !root.contains(t)) return;
  if (t.classList.contains('sh-modal') && ev.target !== t) return;
  const a = t.dataset.act, e = +t.dataset.e, s = +t.dataset.s, v = t.dataset.v, id = t.dataset.id;
  switch (a) {
    case 'mode': setHub(h => { h.mode = v; }); paint(true); break;
    case 'sel': setSel(id); paint(true); break;
    case 'start': { const w = hub().workouts.find(x => x.id === id); if (!w) break; if (sess && !confirm('Текущая тренировка будет заменена. Продолжить?')) break; startSess(w); break; }
    case 'resume': ui.screen = 'workout'; paint(); break;
    case 'back': ui.screen = 'dash'; paint(); break;
    case 'editw': { const w = hub().workouts.find(x => x.id === id); if (!w) break; openDraft({title:w.title,status:'template',editId:w.id,scope:'date',exercises:JSON.parse(JSON.stringify(w.exercises)).map(e => { e.sets.forEach(z => { z.done = false; }); return e; })}); break; }
    case 'dscope': ui.draft.scope = v; paint(true); break;
    case 'sedit': { const x = hub().sessions.find(z => z.id === id); if (!x) break; ui.sdraft = {id, exercises:JSON.parse(JSON.stringify(x.exercises))}; ui.ssnap = JSON.stringify(ui.sdraft); ui.confirmClose = false; ui.modal = 'sedit'; paint(true); break; }
    case 'sxrem': ui.sdraft.exercises.splice(e, 1); paint(true); break;
    case 'ssdel': ui.sdraft.exercises[e].sets.splice(s, 1); if (!ui.sdraft.exercises[e].sets.length) ui.sdraft.exercises.splice(e, 1); paint(true); break;
    case 'sdelall': if (!confirm('Удалить тренировку из истории и дневника?')) break; { const sid = ui.sdraft.id, x = hub().sessions.find(z => z.id === sid); setHub(h => { h.sessions = h.sessions.filter(z => z.id !== sid); }); if (x) syncEntries({...x, exercises:[]}); } ui.modal = null; ui.sdraft = null; paint(); toast2('Тренировка удалена'); break;
    case 'ssave': saveSessEdit(); break;
    case 'rep': ui.rep = {wid:id, every:7, wd:[], len:8}; ui.modal = 'rep'; paint(true); break;
    case 'repset': { const r = ui.rep, k = t.dataset.k; if (k === 'wd') { const i = +v, j = r.wd.indexOf(i); if (j < 0) r.wd.push(i); else r.wd.splice(j, 1); } else r[k] = k === 'every' && v === 'wd' ? 'wd' : +v; paint(true); break; }
    case 'repsave': { const r = ui.rep; if (r.every === 'wd' && !r.wd.length) { toast2('Выберите хотя бы один день недели'); break; } const st = selDay(), u = r.len ? (() => { const d = dtl(st); d.setDate(d.getDate() + r.len * 7 - 1); return dkey(d); })() : null; setHub(h => { h.repeats.push({id:uid('r'), wid:r.wid, start:st, every:r.every === 'wd' ? null : r.every, wd:r.every === 'wd' ? r.wd.slice().sort() : null, until:u}); }); toast2('Повторение включено'); ui.modal = null; paint(true); break; }
    case 'repdel': setHub(h => { h.repeats = h.repeats.filter(x => x.id !== id); }); paint(true); break;
    case 'pved': { const i = +t.dataset.i; ui.pved = ui.pved === i ? null : i; paint(true); break; }
    case 'pvdel': { const i = +t.dataset.i; if (ui.pve) { ui.pve.list.splice(i, 1); ui.pved = null; } paint(true); break; }
    case 'pvs': { const ex = ui.pve && ui.pve.list[+t.dataset.i]; if (!ex) break; const k = t.dataset.k, dl = +t.dataset.d;
      if (k === 'sets') { if (dl > 0) { const l = ex.sets[ex.sets.length - 1]; ex.sets.push(Object.assign({}, l, {id:uid('s'), done:false})); } else if (ex.sets.length > 1) ex.sets.pop(); }
      else if (k === 'reps') ex.sets.forEach(z => { z.reps = Math.max(1, num(z.reps) + dl); });
      else ex.sets.forEach(z => { z.weight = Math.max(0, Math.round((num(z.weight) + dl * 2.5) * 10) / 10); });
      paint(true); break; }
    case 'pvadd': { const x = progList().find(z => z.id === id); if (!x) break; const pe = ui.pve;
      if (pe && pe.id === id) {
        if (!pe.list.length) { toast2('В программе не осталось упражнений'); break; }
        const ex = JSON.parse(JSON.stringify(pe.list)); ex.forEach(q => { q.id = uid('e'); q.sets.forEach(z => { z.id = uid('s'); z.done = false; }); });
        const w = {id:uid('w'), title:x.title, src:'manual', tags:[...new Set(ex.flatMap(q => q.muscles))], exercises:ex, forDate:selDay(), meso:'Изменённая программа'};
        setHub(hh => { hh.workouts.push(w); hh.dated[selDay()] = w.id; }); setSel(w.id);
      } else if (x.mine) { assignDate(id); setSel(id); }
      else { const pr = PRESETS.find(z => z.id === id); if (!pr) break; setHub(hh => { if (!hh.workouts.some(z => z.id === id)) hh.workouts.push(mkW(pr.title, pr.names, 'preset', {id, meso:'Готовая программа'})); hh.dated[selDay()] = id; }); setSel(id); }
      ui.pve = null; ui.pved = null; ui.modal = null; paint(true); toast2('Программа добавлена на ' + dateLabel(selDay())); break; }
    case 'presetpick': { const pr = PRESETS.find(x => x.id === id); setHub(h => { if (!h.workouts.some(x => x.id === id)) h.workouts.push(mkW(pr.title, pr.names, 'preset', {id, meso:'Готовая программа'})); h.dated[selDay()] = id; }); setSel(id); ui.modal = null; paint(true); toast2('Программа добавлена на ' + dateLabel(selDay())); break; }
    case 'plan': ui.modal = 'plan'; paint(true); break;
    case 'addmenu': if (selDay() < todayS()) { toast2('На прошедшую дату добавить нельзя'); break; } ui.modal = 'addmenu'; ui.ap = null; ui.aq = ''; ui.aiErr = ''; ui.np = {name:'', sel:[], cfg:{}, edit:null}; paint(true); break;
    case 'apanel': if (v === 'auto') { try { const p = S.sports && S.sports.profile; if (p) { ui.ai.goal = p.goal === 'strength' ? 'strength' : 'hyper'; ui.ai.eq = /без/i.test(p.equipment || '') ? 'none' : 'gym'; const mm = Number(p.minutes); if (mm) ui.ai.min = mm <= 30 ? 30 : mm <= 45 ? 45 : mm <= 60 ? 60 : 75; } } catch (x) {} } ui.ap = ui.ap === v ? null : v; ui.back = null; paint(true); break;
    case 'aback': ui.ap = ui.back || null; ui.back = null; paint(true); break;
    case 'libm': ui.libm = v; paint(true); break;
    case 'ptab': ui.ptab = v; paint(true); break;
    case 'axpick': { const l = find(t.dataset.n); if (!l) break; ui.cfg = {n:l.n, sets:3, reps:l.r, w:l.w}; ui.back = ui.aq.trim() ? null : ui.ap; ui.aq = ''; ui.ap = 'cfg'; paint(true); break; }
    case 'cfgs': { const k = t.dataset.k, dl = +t.dataset.d, c = ui.cfg; if (k === 'sets') c.sets = Math.min(10, Math.max(1, c.sets + dl)); else if (k === 'reps') c.reps = Math.min(50, Math.max(1, c.reps + dl)); else c.w = Math.min(500, Math.max(2.5, Math.round((c.w + dl * 2.5) * 10) / 10)); paint(true); break; }
    case 'cfgbw': { const l = find(ui.cfg.n); ui.cfg.w = ui.cfg.w ? 0 : (l.w || 20); paint(true); break; }
    case 'cfgadd': { const c = ui.cfg, l = find(c.n), ex = newEx(c.n, [l.m], l); ex.sets = Array.from({length:c.sets}, () => ({id:uid('s'),type:'n',weight:c.w,reps:c.reps,rir:2,done:false})); addExDay(c.n, l, ex); ui.ap = ui.back || null; ui.back = null; ui.cfg = null; paint(true); break; }
    case 'afav': favToggle(t.dataset.k, t.dataset.v); paint(true); break;
    case 'apv': ui.pve = null; ui.pved = null; ui.pv = id; ui.back = ui.aq.trim() ? null : ui.ap; ui.aq = ''; ui.ap = 'pv'; paint(true); break;
    case 'acust': { const nm = ui.aq.trim(); if (!nm) break; addExDay(nm, null); ui.aq = ''; paint(true); break; }
    case 'pgm': ui.pg = v; paint(true); break;
    case 'npe': { const n2 = t.dataset.n, np = ui.np; if (np.edit && np.edit.n === n2) { np.edit = null; paint(true); break; } const l = find(n2), c = np.cfg[n2]; np.edit = c ? {n:n2, sets:c.sets, reps:c.reps, w:c.w} : {n:n2, sets:3, reps:l ? l.r : 10, w:l ? l.w : 0}; paint(true); break; }
    case 'nps': { const e2 = ui.np.edit; if (!e2) break; const k = t.dataset.k, dl = +t.dataset.d; if (k === 'sets') e2.sets = Math.max(1, Math.min(10, e2.sets + dl)); else if (k === 'reps') e2.reps = Math.max(1, Math.min(60, e2.reps + dl)); else e2.w = Math.max(0, Math.round((e2.w + dl * 2.5) * 10) / 10); paint(true); break; }
    case 'npbw': { const e2 = ui.np.edit; if (!e2) break; const l = find(e2.n); e2.w = e2.w ? 0 : ((l && l.w) || 20); paint(true); break; }
    case 'npok': { const np = ui.np, e2 = np.edit; if (!e2) break; np.cfg[e2.n] = {sets:e2.sets, reps:e2.reps, w:e2.w}; if (!np.sel.includes(e2.n)) np.sel.push(e2.n); np.edit = null; paint(true); toast2('Добавлено: ' + e2.n); break; }
    case 'npcancel': ui.np.edit = null; paint(true); break;
    case 'nprm': { const np = ui.np, e2 = np.edit; if (!e2) break; np.sel = np.sel.filter(z => z !== e2.n); delete np.cfg[e2.n]; np.edit = null; paint(true); break; }
    case 'npt': { const n2 = t.dataset.n, i = ui.np.sel.indexOf(n2); if (i < 0) ui.np.sel.push(n2); else ui.np.sel.splice(i, 1); paint(true); break; }
    case 'npsave': { const np = ui.np; if (!np.name.trim() || !np.sel.length) break; const w = mkW(np.name.trim(), np.sel, 'manual'); w.exercises.forEach(q => { const c = np.cfg[q.name]; if (c) q.sets = Array.from({length:c.sets}, () => ({id:uid('s'),type:'n',weight:c.w,reps:c.reps,rir:2,done:false})); }); setHub(h => { h.workouts.push(w); h.dated[selDay()] = w.id; }); setSel(w.id); ui.modal = null; ui.np = {name:'', sel:[], cfg:{}, edit:null}; paint(true); toast2('Программа сохранена и добавлена на ' + dateLabel(selDay())); break; }
    case 'dayex': ui.q = ''; ui.modal = 'dayex'; paint(true); break;
    case 'favs': ui.modal = 'favs'; paint(true); break;
    case 'favpick': assignDate(id); setSel(id); toast2('Программа добавлена на ' + dateLabel(selDay())); ui.modal = null; paint(true); break;
    case 'delplan': { const h = hub(), d = selDay(), wid = planOf(h, d); if (!wid || wid === 'rest') break;
      const dup = h.repeats.some(r => r.wid === wid) || Object.keys(h.dated).some(k => k > d && h.dated[k] === wid) || Object.keys(h.plan).some(k => h.plan[k] === wid);
      if (dup) { ui.modal = 'delmenu'; paint(true); break; }
      if (!confirm('Удалить тренировку из плана на эту дату?')) break; setHub(x => { x.dated[d] = 'rest'; }); paint(true); break; }
    case 'delone': { const d = selDay(); setHub(x => { x.dated[d] = 'rest'; }); ui.modal = null; paint(true); toast2('Удалена тренировка на эту дату'); break; }
    case 'delall': { const d = selDay(); setHub(x => { const wid = planOf(x, d); x.repeats = x.repeats.filter(r => r.wid !== wid); Object.keys(x.dated).forEach(k => { if (k >= d && x.dated[k] === wid) delete x.dated[k]; }); Object.keys(x.plan).forEach(k => { if (x.plan[k] === wid) x.plan[k] = 'rest'; }); x.dated[d] = 'rest'; }); ui.modal = null; paint(true); toast2('Удалены эта и все будущие тренировки'); break; }
    case 'undate': setHub(h => { delete h.dated[selDay()]; }); paint(true); break;
    case 'repeat': { const h = hub(), x = h.sessions.find(z => z.id === id); if (!x) break; let w = h.workouts.find(z => z.id === x.workoutId); if (!w) { w = {id:uid('w'),title:x.title,src:'manual',tags:[...new Set(x.exercises.flatMap(e => e.muscles))],exercises:x.exercises.map(e => { const l = find(e.name) || {}; return {id:uid('e'),name:e.name,muscles:e.muscles,tempo:l.tempo || '2-0-1',restSec:l.rest || 90,sets:e.sets.map(z => ({id:uid('s'),type:z.type,weight:z.weight,reps:z.reps,rir:z.rir,done:false}))}; })}; setHub(hh => { hh.workouts.push(w); }); } if (isFuture()) { assignDate(w.id); toast2('Тренировка добавлена в план'); paint(true); } else { if (sess && !confirm('Текущая тренировка будет заменена. Продолжить?')) break; startSess(w); } break; }
    case 'favdel': if (confirm('Удалить программу?')) { setHub(h => { h.workouts = h.workouts.filter(x => x.id !== id); h.repeats = h.repeats.filter(x => x.wid !== id); }); if (ui.sel === id) ui.sel = null; paint(true); } break;
    case 'manual': openDraft(); break;
    case 'ai': try { const p = S.sports && S.sports.profile; if (p) { ui.ai.goal = p.goal === 'strength' ? 'strength' : 'hyper'; ui.ai.eq = /без/i.test(p.equipment || '') ? 'none' : 'gym'; const mm = Number(p.minutes); if (mm) ui.ai.min = mm <= 30 ? 30 : mm <= 45 ? 45 : mm <= 60 ? 60 : 75; } } catch (x) {} ui.modal = 'ai'; paint(true); break;
    case 'aiset': if (t.dataset.k === 'focus') { const f = ui.ai.focus, i = f.indexOf(v); if (i < 0) f.push(v); else f.splice(i, 1); } else ui.ai[t.dataset.k] = t.dataset.k === 'min' ? +v : v; paint(true); break;
    case 'aireal': aiGenerate(); break;
    case 'aigen': { const w = buildDay(); if (!w) { toast2('Не удалось подобрать упражнения'); break; } setHub(h => { h.workouts.push(w); h.dated[selDay()] = w.id; }); setSel(w.id); ui.modal = null; paint(); toast2('Программа добавлена на ' + dateLabel(selDay())); break; }
    case 'progress': ui.modal = 'progress'; paint(true); break;
    case 'mclose': if (t.classList.contains('sh-modal') && ev.target !== t) break;
      if ((ui.modal === 'manual' && ui.draft && ui.draft.exercises.length && JSON.stringify(ui.draft) !== ui.snap) || (ui.modal === 'sedit' && ui.sdraft && JSON.stringify(ui.sdraft) !== ui.ssnap)) { ui.confirmClose = true; paint(true); break; }
      ui.modal = null; paint(true); break;
    case 'ccancel': ui.confirmClose = false; paint(true); break;
    case 'cdiscard': ui.confirmClose = false; ui.modal = null; ui.draft = null; ui.sdraft = null; paint(true); break;
    case 'csave': { const was = ui.modal; ui.confirmClose = false; if (was === 'manual') saveDraft(false); else saveSessEdit(); if (ui.modal === was) paint(true); break; }
    case 'rclose': ui.modal = null; paint(true); break;
    case 'body': ui.body = v; paint(true); break;
    case 'muscle': ui.muscle = id; paint(true); break;
    case 'day': ui.day = +v; paint(true); break;
    case 'food': try { window.foodOpenMealWindow('Перекус'); } catch (x) { toast2('Окно питания недоступно'); } break;
    case 'henable': markHabit(true); paint(true); break;
    case 'water': addWater(); break;
    case 'dstatus': ui.draft.status = v; paint(true); break;
    case 'dup': { const l = ui.draft.exercises; if (e > 0) [l[e - 1], l[e]] = [l[e], l[e - 1]]; paint(true); break; }
    case 'ddown': { const l = ui.draft.exercises; if (e < l.length - 1) [l[e + 1], l[e]] = [l[e], l[e + 1]]; paint(true); break; }
    case 'drem': ui.draft.exercises.splice(e, 1); paint(true); break;
    case 'dsadd': { const ss = ui.draft.exercises[e].sets, l = ss[ss.length - 1]; ss.push({id:uid('s'),type:'n',weight:l ? l.weight : 0,reps:l ? l.reps : 10,rir:2,done:false}); paint(true); break; }
    case 'dsdel': if (ui.draft.exercises[e].sets.length > 1) ui.draft.exercises[e].sets.splice(s, 1); paint(true); break;
    case 'dsave': saveDraft(false); break;
    case 'dstart': saveDraft(true); break;
    case 'pick': { const l = find(t.dataset.n); if (ui.modal === 'dayex') { addExDay(l.n, l); break; } if (ui.modal === 'manual') ui.draft.exercises.push(mkEx(l)); else { sess.exercises.push(mkEx(l)); saveSess(); ui.modal = null; } ui.q = ''; paint(true); break; }
    case 'pickc': { if (ui.modal === 'dayex') { addExDay(ui.q.trim(), null); break; } const x = newEx(ui.q.trim()); if (ui.modal === 'manual') ui.draft.exercises.push(x); else { sess.exercises.push(x); saveSess(); ui.modal = null; } ui.q = ''; paint(true); break; }
    case 'stype': { if (mode() !== 'pro') break; const x = sess.exercises[e].sets[s]; x.type = x.type === 'n' ? 'w' : x.type === 'w' ? 'd' : 'n'; saveSess(); paint(true); break; }
    case 'check': {
      const ex = sess.exercises[e], x = ex.sets[s]; x.done = !x.done;
      if (x.done) { startRest(x.type === 'w' ? 45 : ex.restSec); const nx = ex.sets.slice(s + 1).find(z => !z.done && z.type !== 'w'); if (mode() === 'pro' && num(x.rir) === 0 && x.type !== 'w' && nx) sess.ai = {e, s: ex.sets.indexOf(nx), w: r05(num(nx.weight) * .94 / 1) }; }
      saveSess(); paint(true); break; }
    case 'addset': { const ss = sess.exercises[e].sets, l = ss[ss.length - 1]; ss.push({id:uid('s'),type:'n',weight:l ? l.weight : 0,reps:l ? l.reps : 10,rir:2,done:false}); saveSess(); paint(true); break; }
    case 'delset': { const ss = sess.exercises[e].sets; if (ss.length > 1 && !ss[ss.length - 1].done) ss.pop(); saveSess(); paint(true); break; }
    case 'rest': if (+v === 0) sess.restEnd = null; else { sess.restEnd = Math.max(Date.now() + 1000, (sess.restEnd || Date.now()) + v * 1000); sess.restTotal = Math.max(sess.restTotal, sess.restEnd - Date.now()); } saveSess(); paint(true); break;
    case 'aiy': { const x = sess.ai; sess.exercises[x.e].sets[x.s].weight = x.w; sess.ai = null; saveSess(); paint(true); break; }
    case 'ain': sess.ai = null; saveSess(); paint(true); break;
    case 'swap': ui.swapE = e; ui.modal = 'swap'; paint(true); break;
    case 'swapto': { const ex = sess.exercises[ui.swapE], b = find(ex.name), l = find(t.dataset.n), f = b && b.w && l.w ? l.w / b.w : 1; ex.sets.forEach(z => { if (!z.done) z.weight = l.w ? r05(num(z.weight) * f) : 0; }); ex.name = l.n; ex.muscles = [l.m]; ex.tempo = l.tempo; saveSess(); ui.modal = null; paint(true); break; }
    case 'addex': ui.q = ''; ui.modal = 'addex'; paint(true); break;
    case 'finish': ui.modal = 'finish'; paint(true); break;
    case 'fsave': finish(); break;
    case 'cancel': if (confirm('Отменить тренировку? Введённые данные не сохранятся.')) { sess = null; saveSess(); ui.screen = 'dash'; paint(); } break;
    case 'mic': { const R = window.SpeechRecognition || window.webkitSpeechRecognition; if (!R) return toast2('Голосовой ввод не поддерживается в этом браузере'); const r = new R(); r.lang = 'ru-RU'; r.onresult = x => { const i = root.querySelector('[name=q]'); if (i) i.value = x.results[0][0].transcript; }; r.onerror = () => toast2('Не удалось распознать речь'); r.start(); break; }
  }
}
function onInput(ev) {
  const t = ev.target;
  if (t.matches('[data-aq]')) { ui.aq = t.value; const l = root.querySelector('[data-alist]'), r = root.querySelector('[data-arest]'); if (l) l.innerHTML = acHtml(); if (r) r.style.display = ui.aq.trim() ? 'none' : ''; return; }
  if (t.matches('[data-npn]')) { ui.np.name = t.value; const b = root.querySelector('[data-act=npsave]'); if (b) b.disabled = !(ui.np.name.trim() && ui.np.sel.length); return; }
  if (t.matches('[data-q]')) { ui.q = t.value; const l = root.querySelector('[data-exlist]'); if (l) l.innerHTML = exList(); return; }
  if (t.dataset.plan !== undefined) { const k = t.dataset.plan, val = t.value; setHub(h => { if (val) h.plan[k] = val; else delete h.plan[k]; }); return; }
  if (t.dataset.d === 'title') { ui.draft.title = t.value; return; }
  if (t.dataset.sf) { ui.sdraft.exercises[+t.dataset.e].sets[+t.dataset.s][t.dataset.sf] = t.value; return; }
  if (t.dataset.df) { ui.draft.exercises[+t.dataset.e].sets[+t.dataset.s][t.dataset.df] = t.value; return; }
  if (t.dataset.f && sess) { const x = sess.exercises[+t.dataset.e].sets[+t.dataset.s]; x[t.dataset.f] = t.value; saveSess(); stats(); }
}
function onSubmit(ev) { const f = ev.target.closest('[data-form=quick]'); if (!f) return; ev.preventDefault(); const i = f.q; if (i.value.trim()) { applyQuick(i.value); } }

/* ---------- монтирование ---------- */
function mount() {
  const sec = document.getElementById('sport-section'); let vis = false;
  try { vis = !!sec && tab === 'sport' && sec.offsetParent !== null && !!S.profile; } catch (e) {}
  if (!vis) { wasVisible = false; return; }
  if (!root) {
    root = document.createElement('div'); root.id = 'sport-hub';
    root.addEventListener('click', onClick); root.addEventListener('input', onInput); root.addEventListener('submit', onSubmit);
  }
  if (!sec.contains(root)) { sec.append(root); wasVisible = false; }
  const dnow = selDay(); const chg = lastDay && lastDay !== dnow; lastDay = dnow;
  if (chg && wasVisible && ui.screen === 'dash' && !ui.modal) { ui.sel = null; paint(true); }
  if (!wasVisible) { wasVisible = true; if (!ui.modal || ui.modal === 'result') paint(); }
}
function init() {
  if (!document.querySelector('link[data-sport-hub]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = new URL('sport-hub.css?v=10', document.baseURI).href; l.dataset.sportHub = 'true'; document.head.append(l); }
  try { const o = window.render; if (typeof o === 'function') { window.render = function () { const r = o.apply(this, arguments); try { mount(); } catch (e) { console.warn(e); } return r; }; } } catch (e) {}
  mount();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true}); else init();
})();
