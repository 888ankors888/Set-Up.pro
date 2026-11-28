/* Подбор блюд для «Что съесть?»: приём пищи, анкета, тренировка дня, остаток КБЖУ. Работает локально, без ИИ. */
(() => {
'use strict';
if (window.FoodSuggest) return;
/* [название, приёмы (b завтрак, l обед, d ужин, s перекус), Б, Ж, У, порция, признаки] */
const D = [
['Овсяная каша на молоке с бананом','b',12,8,58,'300 г','grain,dairy,oat'],
['Гречневая каша с яйцом и маслом','bd',17,14,45,'250 г','grain,eggs,buck'],
['Сырники со сметаной','b',26,16,32,'3 шт, 200 г','curd,dairy,eggs,gluten'],
['Омлет из 3 яиц с овощами и тостом','bd',26,20,20,'280 г','eggs,gluten,veg'],
['Творог 5% с ягодами и мёдом','bds',30,11,24,'220 г','curd,dairy'],
['Греческий йогурт с гранолой и ягодами','bs',20,10,42,'250 г','dairy,grain'],
['Бутерброд с лососем и творожным сыром','b',20,15,27,'160 г','fish,dairy,gluten'],
['Тост с авокадо и двумя яйцами пашот','b',17,22,28,'220 г','eggs,gluten'],
['Рисовая каша на молоке с яблоком','b',10,7,62,'300 г','grain,dairy'],
['Блинчики с творогом','b',27,14,55,'3 шт, 240 г','curd,eggs,dairy,gluten'],
['Яичница из 2 яиц с индейкой и помидором','b',28,19,6,'230 г','eggs,meat,veg'],
['Мюсли с кефиром и бананом','bs',14,9,60,'300 г','dairy,grain,gluten'],
['Овсянка на воде с арахисовой пастой и ягодами','b',13,14,52,'280 г','grain,nuts,oat,vegan'],
['Смузи-боул с бананом, ягодами и протеином','bs',25,6,50,'300 г','dairy'],
['Протеиновые панкейки с ягодами','b',30,9,45,'220 г','eggs,dairy,gluten'],
['Тофу-скрэмбл с овощами и тостом','b',22,13,28,'260 г','soy,gluten,veg,vegan'],
['Хлебцы с творожным сыром и варёное яйцо','bs',17,12,24,'180 г','eggs,dairy,gluten'],
['Гречка с куриной грудкой и овощами','l',42,9,52,'350 г','meat,grain,buck,veg'],
['Куриный суп с лапшой и хлебом','l',25,9,38,'450 г','meat,gluten'],
['Борщ со сметаной и хлебом','l',14,13,35,'450 г','meat,dairy,gluten,veg'],
['Плов с курицей','l',27,18,62,'350 г','meat,grain'],
['Паста с индейкой и томатами','l',36,12,70,'380 г','meat,gluten,veg'],
['Рис с запечённым лососем и овощами','ld',35,20,58,'380 г','fish,grain,veg'],
['Боул с киноа, креветками и авокадо','ld',32,18,45,'350 г','seafood'],
['Чечевичный суп с овощами и хлебом','l',20,6,48,'400 г','legumes,veg,gluten,vegan'],
['Котлеты из индейки с картофельным пюре','ld',36,14,40,'350 г','meat,dairy,gluten'],
['Боул с нутом, киноа и овощами','l',19,14,68,'380 г','legumes,veg,vegan'],
['Тушёная говядина с гречкой','ld',38,16,48,'330 г','meat,grain,buck'],
['Запечённая треска с овощами','d',36,7,14,'330 г','fish,veg'],
['Филе индейки с овощами на гриле','ld',40,8,14,'300 г','meat,veg'],
['Куриная грудка с брокколи и рисом','ld',42,7,44,'350 г','meat,broc,grain'],
['Тунец с овощным салатом и яйцом','ld',38,12,10,'300 г','fish,eggs,veg'],
['Творог с зеленью и овощами','ds',32,9,10,'250 г','curd,dairy,veg'],
['Омлет со шпинатом и сыром','bd',26,20,5,'230 г','eggs,dairy'],
['Тофу с овощами вок и рисом','ld',22,14,55,'380 г','soy,grain,veg,vegan'],
['Креветки с овощами и киноа','ld',35,9,38,'350 г','seafood,veg'],
['Запечённый лосось с картофелем','d',36,22,34,'350 г','fish'],
['Яблоко с арахисовой пастой','s',5,10,30,'180 г','nuts,vegan'],
['Кефир с бананом','s',11,3,34,'350 г','dairy'],
['Греческий йогурт с ягодами','s',18,5,18,'200 г','dairy'],
['Творог 2% с ягодами','s',26,4,14,'180 г','curd,dairy'],
['Миндаль и сухофрукты','s',8,19,16,'50 г','nuts,vegan'],
['Протеиновый коктейль на молоке','s',30,6,18,'350 мл','dairy'],
['Хлебцы с хумусом','s',8,7,28,'100 г','legumes,gluten,vegan'],
['Два варёных яйца с огурцом','s',13,10,2,'150 г','eggs'],
['Банан и горсть орехов','s',5,13,32,'150 г','nuts,vegan'],
['Бутерброд с индейкой и сыром','s',20,9,25,'160 г','meat,dairy,gluten']
].map(x => ({n:x[0], m:x[1], p:x[2], f:x[3], c:x[4], w:x[5], fl:x[6].split(','), k:Math.round((x[2]*4+x[4]*4+x[3]*9)/5)*5}));
const SHARE = {'Завтрак':.27,'Обед':.35,'Ужин':.28,'Перекус':.10}, ORDER = ['Завтрак','Обед','Ужин','Перекус'], LET = {'Завтрак':'b','Обед':'l','Ужин':'d','Перекус':'s'};
const arr = v => Array.isArray(v) ? v : (v ? [v] : []);
const hash = s => { let h = 2166136261; for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0); };
const rnd = (seed, i) => { let x = (seed + i * 2654435761) >>> 0; x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; };
function planned(S, day) {
  const h = S.sportHub; if (!h) return null;
  const [y, m, d] = day.split('-').map(Number), wd = (new Date(y, m - 1, d).getDay() + 6) % 7;
  const diff = (a, b) => { const p = s => { const [yy, mm, dd] = s.split('-').map(Number); return new Date(yy, mm - 1, dd); }; return Math.round((p(b) - p(a)) / 864e5); };
  let id = h.dated && h.dated[day];
  if (!id) { const r = arr(h.repeats).find(x => x && day >= x.start && (!x.until || day <= x.until) && (x.wd ? x.wd.map(Number).includes(wd) : x.every > 0 && diff(x.start, day) % x.every === 0) && arr(h.workouts).some(w => w.id === x.wid)); id = r ? r.wid : h.plan && h.plan[wd]; }
  if (!id || id === 'rest') return null;
  const w = arr(h.workouts).find(x => x.id === id); if (!w) return null;
  const sets = arr(w.exercises).reduce((a, e) => a + arr(e.sets).length, 0), tags = arr(w.tags);
  const done = arr(h.sessions).some(x => x.date === day);
  return {title: w.title, sets, heavy: sets >= 18 || tags.includes('legs') || tags.includes('back'), done};
}
function excluded(dish, prof, dis) {
  const f = dish.fl, no = x => f.includes(x), diet = prof.diet, eth = prof.ethics;
  if (diet === 'vegan' || eth === 'vegan') { if (!no('vegan') && (no('meat') || no('fish') || no('seafood') || no('eggs') || no('dairy') || no('curd'))) return true; }
  if (diet === 'vegetarian' || eth === 'vegetarian') { if (no('meat') || no('fish') || no('seafood')) return true; }
  if (diet === 'pescatarian' && no('meat')) return true;
  if (dis.includes('meat') && no('meat')) return true;
  if (dis.includes('fish') && (no('fish') || no('seafood'))) return true;
  if (dis.includes('eggs') && no('eggs')) return true;
  if (dis.includes('dairy') && no('dairy')) return true;
  if (dis.includes('curd') && no('curd')) return true;
  if (dis.includes('legumes') && no('legumes')) return true;
  if (dis.includes('buckwheat') && (no('buck') || no('oat'))) return true;
  if (dis.includes('broccoli') && no('broc')) return true;
  if (dis.includes('vegetables') && no('veg')) return true;
  if (prof.other && prof.other.some(t => t && dish.n.toLowerCase().includes(t))) return true;
  return false;
}
/* ctx: {S, day, meal, t:{kcal,p,f,c}, v:{kcal,p,f,c}, goalKey, loggedMeals:[], seed} */
function pick(ctx) {
  const S = ctx.S, P = S.profile || {}, nq = (P.nutritionQuestionnaire || {}).answers || {}, qp = (P.questionnairePreferences || {}).answers || {};
  const meal = ctx.meal, L = LET[meal] || 's';
  const prof = {diet: qp.diet, ethics: Array.isArray(nq.ethics) ? nq.ethics[0] : nq.ethics,
    other: String(qp.dislikesOther || '').toLowerCase().split(/[,;\n]+/).map(s => s.trim()).filter(s => s.length > 2)};
  const dis = arr(qp.dislikes), likeP = arr(nq.protein), likeC = arr(nq.carbs), medical = arr(nq.medicalDiet);
  const lowcarb = likeC.includes('lowcarb'), diabetes = medical.includes('diabetes');
  const goal = ctx.goalKey || P.bodyGoal || P.goal, lose = goal === 'lose' || goal === 'cut', gain = goal === 'gain';
  /* оставшиеся приёмы и бюджет на текущий */
  const left = ORDER.filter(m => ORDER.indexOf(m) >= ORDER.indexOf(meal) && !ctx.loggedMeals.includes(m) || m === meal);
  const shareSum = left.reduce((a, m) => a + SHARE[m], 0) || 1, share = SHARE[meal] / shareSum;
  const hasT = ctx.t && ctx.t.kcal > 0;
  const remK = hasT ? Math.max(0, ctx.t.kcal - ctx.v.kcal) : 2000 * SHARE[meal];
  let target = hasT ? remK * share : 2000 * SHARE[meal];
  const CAP = {'Завтрак':650,'Обед':800,'Ужин':750,'Перекус':320}; target = Math.min(Math.max(target, meal === 'Перекус' ? 120 : 250), CAP[meal] || 700);
  const pNeed = ctx.t && ctx.t.p > 0 ? Math.max(0, ctx.t.p - ctx.v.p) * share : target * .25 / 4;
  /* тренировка */
  const wk = planned(S, ctx.day);
  let mode = null;
  if (wk) { if (wk.done || meal === 'Ужин') mode = 'post'; else mode = 'pre'; }
  let pool = D.filter(d => d.m.includes(L) && !excluded(d, prof, dis));
  if (pool.length < 3) pool = D.filter(d => d.m.includes(L));
  const seed = hash(ctx.day + meal + (ctx.seed || 0)), why = {};
  const scored = pool.map((d, i) => {
    let s = 0, r = [];
    s += (1 - Math.min(1, Math.abs(d.k - target) / target)) * 3;
    s += (1 - Math.min(1, Math.abs(d.p - pNeed) / Math.max(pNeed, 12))) * 2;
    const pc = d.p * 4 / d.k, cc = d.c * 4 / d.k, fc = d.f * 9 / d.k;
    if (mode === 'pre') { s += (cc - .4) * (wk.heavy ? 4 : 3); if (fc > .38) s -= 1; r.push('углеводы перед тренировкой'); }
    if (mode === 'post') { s += (pc - .22) * 4 + (wk.heavy ? (cc - .3) : 0); r.push('белок для восстановления'); }
    if (lose) s -= Math.max(0, fc - .3) * 3;
    if (gain) s += Math.min(d.k, target * 1.2) / target * .5;
    if (lowcarb || diabetes) s -= Math.max(0, cc - .35) * 3;
    if (diabetes && d.c > 60) s -= 1;
    if (prof.diet === 'flexitarian' && d.fl.includes('meat')) s -= .4;
    for (const [src, fl] of [['meat','meat'],['fish','fish'],['seafood','seafood'],['eggs','eggs'],['dairy','dairy'],['dairy','curd'],['legumes','legumes'],['soy','soy'],['nuts','nuts']]) if (likeP.includes(src) && d.fl.includes(fl)) { s += .4; break; }
    if (likeC.includes('grains') && d.fl.includes('grain')) s += .3;
    if (likeC.includes('wholegrain') && d.fl.includes('gluten')) s += .1;
    s += rnd(seed, i) * 1.1;
    return {d, s, r, pc, cc};
  }).sort((a, b) => b.s - a.s);
  const out = [], cnt = {};
  for (const x of scored) { const main = x.d.fl[0]; if ((cnt[main] || 0) >= 2) continue; cnt[main] = (cnt[main] || 0) + 1; out.push(x); if (out.length >= 4) break; }
  const items = out.map(x => {
    const bits = [x.d.w];
    if (L === 'b') bits.push('привычный завтрак');
    if (mode === 'pre' && x.cc >= .4) bits.push('энергия перед тренировкой');
    else if (mode === 'post' && x.pc >= .25) bits.push('белок после нагрузки');
    else if (x.d.p >= pNeed * .9 && pNeed > 15) bits.push('закрывает белок');
    return [x.d.n, bits.join(' · '), x.d.k, x.d.p, x.d.f, x.d.c];
  });
  const parts = [meal + ': ≈ ' + Math.round(target / 10) * 10 + ' ккал на приём'];
  if (wk) parts.push('тренировка «' + wk.title + '» ' + (wk.done ? 'уже выполнена — акцент на белок' : 'в плане — ' + (meal === 'Ужин' ? 'акцент на белок и восстановление' : 'больше углеводов для энергии')));
  if (prof.diet && prof.diet !== 'mixed' || dis.length) parts.push('учтены предпочтения из анкеты');
  if ((P.health || []).includes('Аллергии/непереносимость')) parts.push('аллергии не учтены — проверяйте состав');
  return {items, summary: parts.join(' · '), meal};
}
window.FoodSuggest = {pick, dishes: D};
})();
