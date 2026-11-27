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
const find = n => LIB.find(x => x.n === n);
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
function hub() { const h = (rawState() || {}).sportHub; const o = h && typeof h === 'object' ? h : {}; return {version:1,mode:'pro',plan:(o.plan && typeof o.plan === 'object' && !Array.isArray(o.plan)) ? o.plan : {},workouts:Array.isArray(o.workouts) ? o.workouts : seed(),sessions:Array.isArray(o.sessions) ? o.sessions : []}; }
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
  for (const g in GROUPS) { const o = last[g]; res[g] = o ? Math.min(100, Math.round((now - o.t) / 36e5 / (48 + Math.min(36, o.sets * 3)) * 100)) : 100; }
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
const ui = {screen: sess ? 'workout' : 'dash', sel: null, body: 'front', muscle: null, day: (new Date().getDay() + 6) % 7, modal: null, draft: null, q: '', result: null, ai: {goal:'hyper',level:'mid',eq:'gym',days:3}};
const mode = () => hub().mode;

/* ---------- отрисовка: дашборд ---------- */
const mpath = {
 front: [['shoulders','M22 38 q-10 2 -12 14 l10 4 q2 -10 8 -12z M78 38 q10 2 12 14 l-10 4 q-2 -10 -8 -12z'],['chest','M28 40 h20 v22 h-20z M52 40 h20 v22 h-20z'],['abs','M34 64 h32 v36 h-32z'],['arms','M8 56 l10 4 -4 36 -9 -3z M92 56 l-10 4 4 36 9 -3z'],['legs','M32 104 h16 v78 h-16z M52 104 h16 v78 h-16z']],
 back: [['shoulders','M22 38 q-10 2 -12 14 l10 4 q2 -10 8 -12z M78 38 q10 2 12 14 l-10 4 q-2 -10 -8 -12z'],['back','M28 40 h44 v44 h-44z'],['arms','M8 56 l10 4 -4 36 -9 -3z M92 56 l-10 4 4 36 9 -3z'],['glutes','M30 86 h40 v20 h-40z'],['legs','M32 108 h16 v74 h-16z M52 108 h16 v74 h-16z']]
};
const recCol = p => p < 40 ? '#ff5a5f' : p < 75 ? '#ffb020' : '#b8ff2c';
function bodySvg(rec) {
  return `<svg viewBox="0 0 100 190"><circle cx="50" cy="20" r="12" fill="#2d363d"/>${mpath[ui.body].map(([g, d]) => `<path class="sh-mp${ui.muscle === g ? ' sel' : ''}" data-act="muscle" data-id="${g}" d="${d}" style="fill:${recCol(rec[g])};fill-opacity:${.35 + rec[g] / 160}"/>`).join('')}</svg>`;
}
function suggest(h, rec) {
  let best = null, bs = -1;
  for (const w of h.workouts) { const t = w.tags.length ? w.tags : ['legs']; const v = t.reduce((a, g) => a + (rec[g] ?? 100), 0) / t.length; if (v > bs) { bs = v; best = w; } }
  return best;
}
const wdOf = d => { const [y, m, dd] = d.split('-').map(Number); return String((new Date(y, m - 1, dd).getDay() + 6) % 7); };
const setSel = id => { ui.sel = id; ui.selDay = selDay(); };
const WD = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'], WDL = ['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'];
const selDay = () => { try { return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : todayS(); } catch (e) { return todayS(); } };
const RU_M = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
function dayCard(h, d) {
  const ss = h.sessions.filter(x => x.date === d), en = ((rawState() || {}).workouts?.entries || []).filter(e => e.date === d && !String(e.id).startsWith('hub-'));
  const [y, m, dd] = d.split('-').map(Number), future = d > todayS();
  let o = `<div class="sh-card"><div class="sh-row sh-sb"><span class="sh-chip on">${dd} ${RU_M[m - 1]} ${y}</span><span class="sh-chip">${future ? 'Будущая дата' : 'Выполнено'}</span></div>`;
  const pw = future ? (h.plan[wdOf(d)] && h.plan[wdOf(d)] !== 'rest' ? h.workouts.find(x => x.id === h.plan[wdOf(d)]) : null) : null;
  if (future && pw) o += `<h3 class="sh-h" style="margin:12px 0 6px">По плану: ${esc(pw.title)}</h3>` + pw.exercises.map(e => `<div class="sh-item"><span>${esc(e.name)}</span><span class="sh-mu">${e.sets.length} подх.</span></div>`).join('');
  else if (future && h.plan[wdOf(d)] === 'rest') o += '<p class="sh-mu" style="margin-top:12px">По плану день отдыха.</p>';
  else if (!ss.length && !en.length) o += `<p class="sh-mu" style="margin-top:12px">${future ? 'Эта дата ещё не наступила.' : 'В этот день тренировок не записано.'}</p>`;
  ss.forEach(x => { const t = x.exercises.reduce((a, e) => a + e.sets.reduce((b, s) => b + (s.type === 'w' ? 0 : s.weight * s.reps), 0), 0), n = x.exercises.reduce((a, e) => a + e.sets.length, 0);
    o += `<h3 class="sh-h" style="margin:12px 0 6px">${esc(x.title)}</h3><div class="sh-row sh-wrap sh-mu"><span>${x.minutes} мин</span><span>·</span><span>${n} подх.</span><span>·</span><span>${fmtN(t)} кг</span></div>` + x.exercises.map(e => `<div class="sh-item"><span>${esc(e.name)}</span><span class="sh-mu">${e.sets.filter(s => s.type !== 'w').map(s => s.weight + '×' + s.reps).join(', ')}</span></div>`).join(''); });
  en.forEach(e => { o += `<div class="sh-item"><span>${esc(e.name)}</span><span class="sh-mu">${e.minutes ? e.minutes + ' мин' : ''}</span></div>`; });
  return o + '</div>';
}
const GCOL = {chest:'#ff7a6b',back:'#7c7cff',legs:'#ffb35c',shoulders:'#b8ff2c',arms:'#4fd1c5',abs:'#f6d860',glutes:'#e879f9'};
function dayItems(h, d, w) {
  const items = [];
  h.sessions.filter(x => x.date === d).forEach(x => x.exercises.forEach(e => items.push({g:e.muscles[0],done:true})));
  if (d === todayS()) {
    const doneToday = h.sessions.some(x => x.date === d && x.workoutId === (w && w.id));
    if (sess && sess.date === d) sess.exercises.forEach(e => items.push({g:e.muscles[0],done:e.sets.length > 0 && e.sets.every(z => z.done)}));
    else if (w && !doneToday) w.exercises.forEach(e => items.push({g:e.muscles[0],done:false}));
  }
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
  const chip = !n ? (h.plan[wdOf(d)] === 'rest' ? 'День отдыха' : 'Нет упражнений') : left ? 'Осталось: ' + left : 'Всё выполнено';
  return `<div class="sh-card"><div class="sh-row sh-sb sh-wrap" style="margin-bottom:10px"><h2 class="sh-h" style="font-size:22px">Тренировки дня</h2><span class="sh-chip" style="padding:8px 14px">${chip}</span></div>
  <div class="sh-row sh-sb" style="gap:6px">${ringSvg(items)}<div style="text-align:center;flex:1"><div class="sh-mu" style="font-size:14px">Выполнение</div><div style="font-size:40px;font-weight:800;line-height:1.1">${pct}<span class="sh-mu" style="font-size:22px"> %</span></div><div class="sh-mu" style="font-size:14px">${isT ? 'сегодня' : dd + ' ' + RU_M[m - 1]}</div></div>
  <button data-act="addmenu" style="display:flex;flex-direction:column;align-items:center;gap:8px;flex:none;width:96px;color:var(--lime);font-weight:800;text-align:center;line-height:1.2"><span style="width:84px;height:84px;border-radius:50%;border:3px solid var(--lime);box-shadow:0 0 18px rgba(184,255,44,.45),inset 0 0 14px rgba(184,255,44,.2);display:flex;align-items:center;justify-content:center"><svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="#b8ff2c" stroke-width="2.6" stroke-linecap="round"><path d="M12 4v16M4 12h16"/></svg></span>Добавить тренировку</button></div>
  <div class="sh-lbl" style="margin:14px 0 6px">План недели</div><div class="sh-row" style="gap:5px">${WD.map((n2, i) => { const pv = h.plan[i], on = wdOf(d) === String(i); return `<button data-act="plan" style="flex:1;padding:7px 0;border-radius:11px;border:1px solid ${on ? 'var(--lime)' : 'var(--bd)'};background:${pv && pv !== 'rest' ? 'rgba(184,255,44,.14)' : '#0b0e11'};font-size:11px;font-weight:700;color:${pv === 'rest' ? 'var(--mu)' : 'var(--tx)'}">${n2}<br><span style="color:${pv && pv !== 'rest' ? 'var(--lime)' : 'var(--mu)'}">${pv === 'rest' ? 'отдых' : pv ? '●' : '·'}</span></button>`; }).join('')}</div>
  <div class="sh-row" style="margin-top:10px"><button class="sh-chip" data-act="plan">Составить план недели</button><button class="sh-chip" data-act="progress">↗ Прогресс и PR</button></div></div>`;
}
function dash() {
  const h = hub(), rec = recovery(h), pro = h.mode === 'pro';
  const sg = suggest(h, rec); const dsel = selDay(), pv = h.plan[wdOf(dsel)], planned = pv && pv !== 'rest' ? h.workouts.find(x => x.id === pv) : null, rest = pv === 'rest';
  let w = (ui.selDay === dsel && h.workouts.find(x => x.id === ui.sel)) || planned || (rest ? null : sg);
  const nu = nutri(), hb = habitState(), wt = weekTon(h);
  const ready = w && w.tags.length ? Math.round(w.tags.reduce((a, g) => a + rec[g], 0) / w.tags.length) : 100;
  const setsN = w ? w.exercises.reduce((a, e) => a + e.sets.length, 0) : 0, dur = w ? Math.round(w.exercises.reduce((a, e) => a + e.sets.length * (e.restSec + 40), 0) / 60) : 0;
  let o = '';
  if (sess) o += `<div class="sh-card sh-syn"><div class="sh-lbl">Тренировка идёт</div><p class="sh-h" style="margin:4px 0 10px">${esc(sess.title)}</p><button class="sh-btn big" data-act="resume">Продолжить · ${fmtT(Date.now() - sess.startedAt)}</button></div>`;
  const isToday = selDay() === todayS(); let card = '';
  if (!isToday) card = dayCard(h, selDay()); else if (!w && rest) card = `<div class="sh-card"><span class="sh-chip on">По плану</span><h3 class="sh-h" style="margin:10px 0 6px">День отдыха</h3><p class="sh-mu" style="margin-bottom:12px">Сегодня по плану восстановление. Можно выбрать тренировку вручную.</p><button class="sh-btn ghost big" data-act="favs">Выбрать программу</button></div>`; else if (w) card = `<div class="sh-card"><div class="sh-row sh-sb"><span class="sh-chip on">${planned && w === planned ? 'По плану' : 'Сегодня'}</span><span class="sh-chip">${w.src === 'ai' ? 'Конструктор' : w.src === 'plan' ? 'План' : 'Вручную'}</span></div>
  ${w.meso ? `<p class="sh-mu" style="margin-top:10px">${esc(w.meso)}</p>` : ''}<h3 class="sh-h" style="margin:4px 0 8px">${esc(w.title)}</h3>
  <div class="sh-row sh-wrap sh-mu"><span>~${dur} мин</span><span>·</span><span>${w.exercises.length} упр.</span><span>·</span><span>${setsN} подх.</span><span>·</span><span>${fmtN(wTon(w))} кг</span></div>
  <div class="sh-chips" style="margin:10px 0">${w.exercises.map(e => `<span class="sh-chip">${esc(e.name)}</span>`).join('')}</div>
  <div class="sh-row sh-sb" style="margin-bottom:8px"><span class="sh-lbl">Готовность мышц</span><b style="color:${recCol(ready)}">${ready}%</b></div><div class="sh-bar" style="margin-bottom:14px"><i style="width:${ready}%;background:${recCol(ready)}"></i></div>
  <button class="sh-btn big" data-act="start" data-id="${w.id}">${sess ? 'Начать заново' : 'Начать тренировку'}</button></div>`;
  o += hero(h, w, selDay()) + card;
  const sm = ui.muscle;
  o += `<div class="sh-card"><div class="sh-row sh-sb" style="margin-bottom:10px"><h3 class="sh-h" style="font-size:16px">Восстановление мышц</h3><div class="sh-seg"><button data-act="body" data-v="front" class="${ui.body === 'front' ? 'on' : ''}">Спереди</button><button data-act="body" data-v="back" class="${ui.body === 'back' ? 'on' : ''}">Сзади</button></div></div>
  <div class="sh-body">${bodySvg(rec)}<div style="flex:1">${sm ? `<div class="sh-lbl">${GROUPS[sm]}</div><p class="sh-h" style="color:${recCol(rec[sm])}">${rec[sm]}%</p><p class="sh-mu" style="margin:4px 0 8px">${rec[sm] >= 100 ? 'Готова к нагрузке' : rec[sm] >= 75 ? 'Почти восстановилась' : 'Лучше дать отдых'}</p>${h.workouts.filter(x => x.tags.includes(sm)).slice(0, 2).map(x => `<button class="sh-chip" data-act="sel" data-id="${x.id}">${esc(x.title)}</button>`).join(' ')}` : `<p class="sh-mu">Нажмите на группу мышц, чтобы увидеть восстановление. Красный — отдыхает, лимонный — готова.</p>`}</div></div>
  <div class="sh-row sh-wrap" style="margin-top:10px">${Object.keys(GROUPS).map(g => `<button class="sh-chip" data-act="muscle" data-id="${g}" style="border-color:${recCol(rec[g])}55">${GROUPS[g]} ${rec[g]}%</button>`).join('')}</div></div>`;
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
    o += `<div class="sh-ex"><div class="sh-row sh-sb"><div style="min-width:0"><div class="sh-h" style="font-size:16px">${esc(ex.name)}</div><div class="sh-mu">${ex.muscles.map(m => GROUPS[m]).join(', ')}${pro ? ` · темп ${esc(ex.tempo)}` : ''}${pro && ex.oneRm ? ` · 1ПМ ${Math.round(ex.oneRm)} кг` : ''}</div></div><button class="sh-chip" data-act="swap" data-e="${ei}">Занято / Болит</button></div>
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
  return l.map(x => `<button class="sh-item" data-act="pick" data-n="${esc(x.n)}"><span>${esc(x.n)}<br><span class="sh-mu">${GROUPS[x.m]} · ${x.w ? x.w + ' кг × ' : ''}${x.r}</span></span><b style="color:var(--lime)">+</b></button>`).join('') + (q ? `<button class="sh-item" data-act="pickc"><span>Добавить свое: «${esc(ui.q.trim())}»</span><b style="color:var(--lime)">+</b></button>` : '');
}
function modalHtml() {
  const m = ui.modal; if (!m) return '';
  const pro = mode() === 'pro';
  if (m === 'addmenu') {
    const ic = d => `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#b8ff2c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
    const row = (a, i, t, sub) => `<button class="sh-item" data-act="${a}" style="padding:14px"><span class="sh-row" style="gap:14px">${ic(i)}<span><b>${t}</b><br><span class="sh-mu">${sub}</span></span></span><b style="color:var(--mu)">›</b></button>`;
    return sheet('Добавить тренировку', row('favs', '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>', 'Избранные программы', 'Выбрать из сохранённых') + row('manual', '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>', 'Создать свою', 'Собрать тренировку вручную') + row('ai', '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>', 'Конструктор программ', 'Собрать программу по цели'));
  }
  if (m === 'plan') {
    const h = hub(), t = wdOf(todayS());
    return sheet('План недели', `<p class="sh-mu" style="margin-bottom:6px">Назначьте программу на каждый день. По плану она появится в карточке дня, и её можно сразу запустить.</p>${WDL.map((n2, i) => `<div class="sh-item"><b style="min-width:110px;${String(i) === t ? 'color:var(--lime)' : ''}">${n2}</b><select data-plan="${i}"><option value="">Не задано</option><option value="rest"${h.plan[i] === 'rest' ? ' selected' : ''}>День отдыха</option>${h.workouts.map(x => `<option value="${x.id}"${h.plan[i] === x.id ? ' selected' : ''}>${esc(x.title)}</option>`).join('')}</select></div>`).join('')}<div class="sh-row" style="margin-top:14px"><button class="sh-btn ghost" style="flex:1" data-act="manual">Создать программу</button><button class="sh-btn" style="flex:1" data-act="rclose">Готово</button></div>`);
  }
  if (m === 'favs') {
    const h = hub();
    return sheet('Избранные программы', h.workouts.length ? h.workouts.map(x => `<div class="sh-item"><button data-act="favpick" data-id="${x.id}" style="flex:1;text-align:left"><b>${esc(x.title)}</b><br><span class="sh-mu">${x.exercises.length} упр. · ${x.tags.map(g => GROUPS[g]).join(', ')}</span></button><button class="sh-chip" data-act="favdel" data-id="${x.id}">×</button></div>`).join('') : '<p class="sh-mu">Сохранённых программ пока нет.</p>');
  }
  if (m === 'manual') {
    const d = ui.draft;
    return sheet('Новая тренировка', `<input data-d="title" value="${esc(d.title)}" placeholder="Название"><div class="sh-seg" style="margin:10px 0">${[['today','На сегодня'],['template','В шаблон'],['free','Свободная']].map(([k, t]) => `<button data-act="dstatus" data-v="${k}" class="${d.status === k ? 'on' : ''}">${t}</button>`).join('')}</div>
    ${d.exercises.map((e, i) => `<div class="sh-ex"><div class="sh-row sh-sb"><b>${esc(e.name)}</b><span class="sh-row"><button class="sh-chip" data-act="dup" data-e="${i}">↑</button><button class="sh-chip" data-act="ddown" data-e="${i}">↓</button><button class="sh-chip" data-act="drem" data-e="${i}">×</button></span></div>${e.sets.map((s, j) => `<div class="sh-set novice" style="grid-template-columns:24px 1fr 1fr 34px"><span class="t">${j + 1}</span><input inputmode="decimal" data-df="weight" data-e="${i}" data-s="${j}" value="${esc(s.weight)}" placeholder="кг"><input inputmode="numeric" data-df="reps" data-e="${i}" data-s="${j}" value="${esc(s.reps)}" placeholder="повт."><button class="sh-chip" data-act="dsdel" data-e="${i}" data-s="${j}">×</button></div>`).join('')}<button class="sh-chip" style="margin-top:8px" data-act="dsadd" data-e="${i}">+ Подход</button></div>`).join('')}
    <div class="sh-lbl" style="margin:12px 0 6px">Библиотека упражнений</div><input data-q placeholder="Поиск или свое упражнение" value="${esc(ui.q)}"><div data-exlist>${exList()}</div>
    <div class="sh-row" style="margin-top:14px"><button class="sh-btn ghost" style="flex:1" data-act="dsave">${d.status === 'free' ? 'Закрыть' : 'Сохранить'}</button><button class="sh-btn" style="flex:1" data-act="dstart">Сохранить и начать</button></div>`);
  }
  if (m === 'ai') {
    const a = ui.ai, sel = (k, arr) => `<div class="sh-seg" style="margin-bottom:12px">${arr.map(([v, t]) => `<button data-act="aiset" data-k="${k}" data-v="${v}" class="${String(a[k]) === String(v) ? 'on' : ''}">${t}</button>`).join('')}</div>`;
    return sheet('Конструктор программ', `<p class="sh-mu" style="margin-bottom:12px">Программа собирается по правилам из вашей цели и оборудования. Это не нейросеть.</p><div class="sh-lbl">Цель</div>${sel('goal', [['hyper','Гипертрофия'],['strength','Сила'],['recomp','Рекомпозиция']])}<div class="sh-lbl">Уровень</div>${sel('level', [['new','Новичок'],['mid','Средний'],['adv','Опытный']])}<div class="sh-lbl">Оборудование</div>${sel('eq', [['gym','Зал'],['home','Дома']])}<div class="sh-lbl">Дней в неделю</div>${sel('days', [[2,'2'],[3,'3'],[4,'4'],[5,'5']])}<button class="sh-btn big" data-act="aigen">Создать программу</button>`);
  }
  if (m === 'progress') {
    const h = hub(), p = prs(h), ws = weekSets(h), top = Object.entries(p).sort((a, b) => b[1] - a[1]).slice(0, 12);
    return sheet('Прогресс и PR', `<div class="sh-lbl">Расчётный 1ПМ (формула Эпли)</div>${top.length ? top.map(([n, v]) => `<div class="sh-item"><span>${esc(n)}</span><b>${Math.round(v)} кг</b></div>`).join('') : '<p class="sh-mu" style="margin:8px 0">Пока нет завершённых тренировок.</p>'}<div class="sh-lbl" style="margin:16px 0 6px">Подходов за неделю (цель 10–16)</div>${Object.keys(GROUPS).map(g => { const v = ws[g] || 0; return `<div style="margin-top:8px"><div class="sh-row sh-sb"><span>${GROUPS[g]}</span><b>${v}</b></div><div class="sh-bar"><i style="width:${Math.min(100, v / 12 * 100)}%"></i></div></div>`; }).join('')}`);
  }
  if (m === 'swap') {
    const ex = sess.exercises[ui.swapE], base = find(ex.name), grp = ex.muscles[0];
    const alts = LIB.filter(x => x.m === grp && x.n !== ex.name && !sess.exercises.some(e => e.name === x.n));
    return sheet('Заменить упражнение', `<p class="sh-mu">${esc(ex.name)} — вес невыполненных подходов пересчитается.</p>${alts.length ? alts.map(x => `<button class="sh-item" data-act="swapto" data-n="${esc(x.n)}"><span>${esc(x.n)}<br><span class="sh-mu">${x.w ? x.w + ' кг × ' : ''}${x.r}</span></span><b style="color:var(--lime)">→</b></button>`).join('') : '<p class="sh-mu" style="margin-top:10px">Альтернатив в библиотеке нет.</p>'}`);
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
  root.innerHTML = (ui.screen === 'workout' && sess ? workoutScreen() : dash()) + modalHtml();
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
  const lib = LIB.filter(x => a.eq === 'gym' || x.e === 'db' || x.e === 'bw'), by = g => lib.filter(x => x.m === g);
  const splits = {2:[['Всё тело A',['chest','back','legs','shoulders','abs','arms']],['Всё тело B',['legs','back','chest','glutes','shoulders','abs']]],
   3:[['Всё тело A',['chest','back','legs','shoulders','abs','arms']],['Всё тело B',['legs','back','chest','glutes','shoulders','abs']],['Всё тело C',['back','chest','legs','arms','shoulders','abs']]],
   4:[['Верх тела A',['chest','back','shoulders','arms','abs']],['Низ тела A',['legs','glutes','abs']],['Верх тела B',['back','chest','shoulders','arms']],['Низ тела B',['legs','glutes','abs']]],
   5:[['Грудь и руки',['chest','chest','shoulders','arms','arms']],['Спина',['back','back','back','arms']],['Ноги',['legs','legs','glutes','legs','abs']],['Плечи и пресс',['shoulders','shoulders','chest','abs']],['Всё тело',['legs','back','chest','shoulders','abs']]]}[+a.days];
  const out = splits.map(([title, groups], di) => { const used = new Set(), names = []; for (const g of groups.slice(0, n)) { const c = by(g); const x = c.find(z => !used.has(z.n) && (c.indexOf(z) + di) % Math.max(1, c.length) === di % Math.max(1, c.length)) || c.find(z => !used.has(z.n)); if (x) { used.add(x.n); names.push(x.n); } } const w = mkW(title, names, 'ai', {meso:'Конструктор · ' + ({hyper:'гипертрофия',strength:'сила',recomp:'рекомпозиция'})[a.goal]});
    w.exercises.forEach(e => { const l = find(e.name); const reps = a.goal === 'strength' ? 5 : a.goal === 'recomp' ? 12 : l.r; e.sets.forEach(s => { if (s.type === 'n') { s.reps = reps; s.weight = l.w ? r05(l.w * mult) : 0; } }); if (a.goal === 'strength' && l.rest < 150) e.restSec = l.rest + 30; }); return w; });
  return out;
}
function finish() {
  const min = Math.max(1, Math.round((Date.now() - sess.startedAt) / 6e4)), ton = sessTon(sess), kcal = kcalOf(min), total = sessSets(sess);
  const rec = {id:sess.id,workoutId:sess.workoutId,title:sess.title,date:sess.date,startedAt:sess.startedAt,endedAt:Date.now(),minutes:min,exercises:sess.exercises.map(e => ({name:e.name,muscles:e.muscles,sets:doneSets(e).map(s => ({type:s.type,weight:num(s.weight),reps:Math.round(num(s.reps)),rir:Math.round(num(s.rir))}))})).filter(e => e.sets.length)};
  setHub(h => { h.sessions.push(rec); });
  try { commit(st => {
    const W = window.FoodWorkoutsStore; if (!st.workouts && W) st.workouts = W.empty(); if (!st.workouts) return;
    const backup = JSON.stringify(st.workouts);
    rec.exercises.forEach((e, i) => { const ws = e.sets.filter(s => s.type !== 'w'), use = ws.length ? ws : e.sets; st.workouts.entries.push({id:'hub-' + rec.id + '-' + i,kind:'strength',name:e.name,minutes:Math.min(1440, Math.max(1, Math.round(min * e.sets.length / total))),sets:use.length,reps:Math.max(1, Math.round(use.reduce((a, s) => a + s.reps, 0) / use.length)),weight:Math.min(10000, Math.max(...use.map(s => s.weight))),muscleGroup:null,notes:'Тренировка: ' + rec.title,date:rec.date}); });
    try { if (W && W.validate) W.validate(st.workouts); } catch (e) { st.workouts = JSON.parse(backup); }
  }); } catch (e) {}
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
function openDraft(d) { ui.draft = d || {title:'Своя тренировка',status:'today',exercises:[]}; ui.q = ''; ui.modal = 'manual'; paint(true); }
function saveDraft(start) {
  const d = ui.draft; if (!d.exercises.length) return toast2('Добавьте хотя бы одно упражнение');
  const w = {id:uid('w'),title:(d.title || 'Своя тренировка').trim(),src:'manual',tags:[...new Set(d.exercises.flatMap(e => e.muscles))],exercises:d.exercises.map(e => ({...e,sets:e.sets.map(s => ({...s,weight:num(s.weight),reps:Math.round(num(s.reps)) || 1}))}))};
  if (d.status !== 'free') { setHub(h => { h.workouts.push(w); }); setSel(w.id); }
  ui.modal = null; ui.draft = null;
  if (start) startSess(w); else { paint(); toast2(d.status === 'free' ? 'Черновик закрыт' : 'Тренировка сохранена'); }
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
    case 'plan': ui.modal = 'plan'; paint(true); break;
    case 'addmenu': ui.modal = 'addmenu'; paint(true); break;
    case 'favs': ui.modal = 'favs'; paint(true); break;
    case 'favpick': setSel(id); ui.modal = null; paint(true); break;
    case 'favdel': if (confirm('Удалить программу?')) { setHub(h => { h.workouts = h.workouts.filter(x => x.id !== id); }); if (ui.sel === id) ui.sel = null; paint(true); } break;
    case 'manual': openDraft(); break;
    case 'ai': try { const p = S.sports && S.sports.profile; if (p) { ui.ai.level = p.level === 'experienced' ? 'adv' : p.level === 'regular' ? 'mid' : 'new'; ui.ai.goal = p.goal === 'strength' ? 'strength' : 'hyper'; ui.ai.eq = /без|дом/i.test(p.equipment || '') ? 'home' : 'gym'; if (p.days && p.days.length >= 2) ui.ai.days = Math.min(5, p.days.length); } } catch (x) {} ui.modal = 'ai'; paint(true); break;
    case 'aiset': ui.ai[t.dataset.k] = t.dataset.k === 'days' ? +v : v; paint(true); break;
    case 'aigen': { const l = buildProgram(); setHub(h => { h.workouts.push(...l); }); setSel(l[0].id); ui.modal = null; paint(); toast2('Программа создана: ' + l.length + ' трен.'); break; }
    case 'progress': ui.modal = 'progress'; paint(true); break;
    case 'mclose': if (t.classList.contains('sh-modal') && ev.target !== t) break; ui.modal = null; paint(true); break;
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
    case 'pick': { const l = find(t.dataset.n); if (ui.modal === 'manual') ui.draft.exercises.push(mkEx(l)); else { sess.exercises.push(mkEx(l)); saveSess(); ui.modal = null; } ui.q = ''; paint(true); break; }
    case 'pickc': { const x = newEx(ui.q.trim()); if (ui.modal === 'manual') ui.draft.exercises.push(x); else { sess.exercises.push(x); saveSess(); ui.modal = null; } ui.q = ''; paint(true); break; }
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
  if (t.matches('[data-q]')) { ui.q = t.value; const l = root.querySelector('[data-exlist]'); if (l) l.innerHTML = exList(); return; }
  if (t.dataset.plan !== undefined) { const k = t.dataset.plan, val = t.value; setHub(h => { if (val) h.plan[k] = val; else delete h.plan[k]; }); return; }
  if (t.dataset.d === 'title') { ui.draft.title = t.value; return; }
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
  if (!document.querySelector('link[data-sport-hub]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = new URL('sport-hub.css?v=2', document.baseURI).href; l.dataset.sportHub = 'true'; document.head.append(l); }
  try { const o = window.render; if (typeof o === 'function') { window.render = function () { const r = o.apply(this, arguments); try { mount(); } catch (e) { console.warn(e); } return r; }; } } catch (e) {}
  mount();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true}); else init();
})();
