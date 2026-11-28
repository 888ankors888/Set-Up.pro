/* Автоподбор меры порции: напитки в мл, штучные продукты в штуках, масла и соусы в ложках, блюда в порциях, остальное в граммах. */
(function () {
  'use strict';
  if (window.FoodPortions) return;
  const norm = t => String(t || '').toLowerCase().replace(/ё/g, 'е');
  const B = w => new RegExp('(^|[^а-я])(?:' + w + ')');

  /* Единицы: [id, [1, 2-4, 5+], граммов в единице] */
  const FORMS = {
    pc: ['шт.', 'шт.', 'шт.'], g: ['г', 'г', 'г'], ml: ['мл', 'мл', 'мл'],
    cup: ['чашка', 'чашки', 'чашек'], mug: ['кружка', 'кружки', 'кружек'], glass: ['стакан', 'стакана', 'стаканов'],
    can: ['банка', 'банки', 'банок'], bottle: ['бутылка', 'бутылки', 'бутылок'], wine: ['бокал', 'бокала', 'бокалов'],
    shot: ['рюмка', 'рюмки', 'рюмок'], espresso: ['шот', 'шота', 'шотов'], tbsp: ['ст. л.', 'ст. л.', 'ст. л.'], tsp: ['ч. л.', 'ч. л.', 'ч. л.'],
    slice: ['ломтик', 'ломтика', 'ломтиков'], piece: ['кусок', 'куска', 'кусков'], plate: ['тарелка', 'тарелки', 'тарелок'],
    serv: ['порция', 'порции', 'порций'], handful: ['горсть', 'горсти', 'горстей'], scoop: ['шарик', 'шарика', 'шариков'],
    pot: ['баночка', 'баночки', 'баночек'], lump: ['кусочек', 'кусочка', 'кусочков'], seg: ['долька', 'дольки', 'долек'],
    bar: ['плитка', 'плитки', 'плиток'], pack: ['упаковка', 'упаковки', 'упаковок'], leaf: ['лист', 'листа', 'листов'], roll: ['ролл', 'ролла', 'роллов']
  };
  const u = (id, g, extra) => Object.assign({ id, f: FORMS[id] || FORMS.pc, g, step: g >= 100 || id === 'tbsp' || id === 'tsp' ? 0.5 : 1, min: 0.5, max: 50 }, extra || {});
  const pc = g => u('pc', g);
  const G = () => ({ id: 'g', f: FORMS.g, g: 1, step: 25, min: 5, max: 5000, pres: [100, 150, 200, 300], base: true });
  const ML = d => ({ id: 'ml', f: FORMS.ml, g: d || 1, step: 50, min: 10, max: 5000, pres: [100, 200, 250, 330, 500], base: true });

  const S = (units, def, extra) => Object.assign({ units, def }, extra || {});
  const serv = (g, def) => S([u('serv', g)], ['serv', def || 1]);
  const drink = (units, def, d) => S(units.concat([ML(d)]), def, { drink: true });

  /* Порядок важен: первое совпадение побеждает. */
  const RULES = [
    [B('питьев'), () => drink([u('glass', 200)], ['glass', 1])],
    [B('эспрессо'), () => drink([u('espresso', 30)], ['espresso', 1])],
    [B('латте|раф|какао|горячий шоколад'), () => drink([u('cup', 250), u('mug', 300)], ['cup', 1])],
    [B('чай|кофе|капучино|американо|маккиато|мокко'), () => drink([u('cup', 200), u('mug', 300)], ['cup', 1])],
    [B('пиво|сидр|эль(?![а-я])'), () => drink([u('can', 330), u('bottle', 500), u('glass', 250)], ['can', 1], 1.01)],
    [B('вино|шампанск|просекко|вермут'), () => drink([u('wine', 150), u('bottle', 750)], ['wine', 1], 0.99)],
    [B('водка|виски|коньяк|текила|ликер|настойка|джин(?![а-я])'), () => drink([u('shot', 50)], ['shot', 1], 0.95)],
    [B('кола|пепси|фанта|спрайт|лимонад|газировк|энергетик|тоник'), () => drink([u('can', 330), u('bottle', 500), u('glass', 250)], ['can', 1], 1.04)],
    [B('квас|сок(?![а-я])|сока|нектар|компот|морс|кисель|смузи|коктейл'), () => drink([u('glass', 200), u('bottle', 500)], ['glass', 1], 1.04)],
    [B('вода|воды|минералк'), () => drink([u('glass', 200), u('bottle', 500)], ['glass', 1])],
    [B('молоко|кефир|ряженка|айран|простокваш|варенец|кумыс'), () => drink([u('glass', 200)], ['glass', 1], 1.03)],

    [B('бульон|борщ|щи($|[^а-я])|суп|солянк|харчо|рассольник|уха($|[^а-я])|окрошк'), () => S([u('plate', 300)], ['plate', 1])],

    [B('масло слив|слив(очное|очного) масл'), () => S([u('lump', 10), u('tsp', 5), u('tbsp', 17)], ['lump', 1])],
    [B('масло($|[^а-я])|маргарин'), () => S([u('tsp', 4.6), u('tbsp', 14)], ['tbsp', 1])],
    [B('мед($|[^а-я])|мёд'), () => S([u('tsp', 10), u('tbsp', 30)], ['tsp', 1])],
    [B('сахар'), () => S([u('tsp', 7), u('lump', 5), u('tbsp', 20)], ['tsp', 2])],
    [B('сметан|майонез|кетчуп|соус|горчиц|сливки'), () => S([u('tbsp', 25), u('tsp', 8)], ['tbsp', 1])],
    [B('арахисов(ая|ой) паст|паста арахис|нутелла|шоколадная паста'), () => S([u('tbsp', 16), u('tsp', 6)], ['tbsp', 1])],
    [B('джем|варенье|повидло|сироп'), () => S([u('tbsp', 25), u('tsp', 8)], ['tbsp', 1])],
    [B('семена|чиа|кунжут|лен($|[^а-я])'), () => S([u('tbsp', 12), u('tsp', 5)], ['tbsp', 1])],

    [B('йогурт'), () => S([u('pot', 125)], ['pot', 1])],
    [B('творог'), () => S([u('serv', 150)], ['serv', 1])],
    [B('сыр($|[^а-я])|моцарелл|брынза|фета|адыгейск'), () => S([u('slice', 20)], ['slice', 2])],

    [B('банан'), () => S([pc(120)], ['pc', 1])],
    [B('яблок'), () => S([pc(180)], ['pc', 1])],
    [B('груш'), () => S([pc(170)], ['pc', 1])],
    [B('апельсин'), () => S([pc(150)], ['pc', 1])],
    [B('мандарин|клементин'), () => S([pc(80)], ['pc', 2])],
    [B('киви'), () => S([pc(75)], ['pc', 2])],
    [B('авокадо'), () => S([pc(150)], ['pc', 0.5])],
    [B('персик|нектарин|хурма'), () => S([pc(150)], ['pc', 1])],
    [B('слива|сливы|абрикос'), () => S([pc(40)], ['pc', 3])],
    [B('гранат'), () => S([pc(250)], ['pc', 0.5])],
    [B('лимон($|[^а-я])'), () => S([pc(80)], ['pc', 0.5])],
    [B('арбуз|дын'), () => S([u('piece', 250)], ['piece', 1])],
    [B('виноград|клубник|малин|черник|ежевик|смородин|голубик|вишн|черешн'), () => S([u('handful', 100)], ['handful', 1])],
    [B('огурец|огурц'), () => S([pc(100)], ['pc', 1])],
    [B('помидор|томат'), () => S([pc(120)], ['pc', 1])],
    [B('перец'), () => S([pc(150)], ['pc', 1])],
    [B('морков'), () => S([pc(80)], ['pc', 1])],
    [B('свекл|свёкл'), () => S([pc(100)], ['pc', 1])],
    [B('шампиньон|гриб'), () => S([pc(20)], ['pc', 5])],

    [B('омлет|яичниц'), () => serv(150)],
    [B('яйц|яйцо'), () => S([pc(50)], ['pc', 2])],
    [B('сосиск|сардельк'), () => S([pc(50)], ['pc', 2])],
    [B('колбас'), () => S([u('slice', 20)], ['slice', 3])],
    [B('ветчин|бекон'), () => S([u('slice', 25)], ['slice', 2])],
    [B('пельмен'), () => S([pc(12)], ['pc', 10])],
    [B('вареник'), () => S([pc(30)], ['pc', 5])],
    [B('блин(?!чик)|блины|блинчик'), () => S([pc(50)], ['pc', 2])],
    [B('сырник|оладь'), () => S([pc(50)], ['pc', 2])],
    [B('котлет|тефтел|фрикадельк'), () => S([pc(80)], ['pc', 2])],
    [B('круассан'), () => S([pc(60)], ['pc', 1])],
    [B('булочк|пирожок|пирожное'), () => S([pc(80)], ['pc', 1])],
    [B('хлеб|батон|тост'), () => S([u('slice', 30)], ['slice', 2])],
    [B('лаваш'), () => S([u('leaf', 80)], ['leaf', 1])],
    [B('печень[ея]|вафл|крекер|сушк|пряник'), () => S([pc(12)], ['pc', 3])],
    [B('конфет'), () => S([pc(12)], ['pc', 2])],
    [B('шоколад'), () => S([u('seg', 5), u('bar', 90)], ['seg', 4])],
    [B('мороженое|пломбир'), () => S([u('scoop', 50)], ['scoop', 2])],
    [B('пицц'), () => S([u('piece', 110)], ['piece', 2])],
    [B('бургер|чизбургер'), () => S([pc(200)], ['pc', 1])],
    [B('шаурм|шаверм|бутерброд|сэндвич|сендвич'), () => S([pc(200)], ['pc', 1])],
    [B('ролл|суши'), () => S([u('roll', 30)], ['roll', 8])],
    [B('миндал|грецк|арахис|орех|кешью|фундук|фисташк|семечк'), () => S([u('handful', 30)], ['handful', 1])],

    [B('пюре|картофель жарен|картошка жарен|плов|паста|макарон|спагетти|лапша|кускус|булгур|киноа|рис($|[^а-я])|греч|овсянк|каша|перловк|пшенн|манн|чечевиц|фасол|нут($|[^а-я])|гарнир'), () => serv(180)],
    [B('картофел|картошк'), () => S([pc(80)], ['pc', 2])],
    [B('салат|винегрет|оливье|овощн'), () => serv(200)],
    [B('грудк|бедр|индейк|говядин|свинин|кур(ица|иц)|куриный|печень|лосось|семга|треск|минтай|скумбри|тунец|рыба|рыбн|креветк|стейк|филе|мясо|баранин|утк'), () => serv(150)]
  ];

  const fallback = food => {
    if (food && food.kd === 'drink') return drink([u('glass', 200)], ['glass', 1]);
    if (food && food.kd === 'dish') return serv(250);
    return S([], ['g', 100]);
  };

  function profile(food) {
    const name = norm(food && food.n);
    let spec = null;
    for (const [re, mk] of RULES) { if (re.test(name)) { spec = mk(); break; } }
    if (!spec && food && food.pc && food.pc.g > 0) {
      const nm = norm(food.pc.n);
      const id = /ст\.?\s*л|столов/.test(nm) ? 'tbsp' : /ч\.?\s*л|чайн/.test(nm) ? 'tsp' : /стакан/.test(nm) ? 'glass' : /чашк/.test(nm) ? 'cup' : /ломт/.test(nm) ? 'slice' : /кус/.test(nm) ? 'piece' : /порц/.test(nm) ? 'serv' : 'pc';
      spec = S([u(id, food.pc.g)], [id, 1]);
      if (food.kd === 'drink') spec.drink = true;
    }
    if (!spec) spec = fallback(food);
    const drinkSpec = !!spec.drink || (food && food.kd === 'drink');
    const units = spec.units.map(x => Object.assign({}, x));
    if (food && (food.ai || food.ext) && food.pc && food.pc.g > 0 && !spec.drink) {
      const nm = norm(food.pc.n), hid = /ст\.?\s*л|столов/.test(nm) ? 'tbsp' : /ч\.?\s*л|чайн/.test(nm) ? 'tsp' : /ломт/.test(nm) ? 'slice' : /кус/.test(nm) ? 'piece' : /порц/.test(nm) ? 'serv' : /горст/.test(nm) ? 'handful' : 'pc';
      if (!units.some(x => x.id === hid)) units.push(u(hid, food.pc.g));
    }
    if (food && food.pk > 0 && food.pk <= 5000 && !units.some(x => x.id === 'pack')) units.push(Object.assign(u('pack', food.pk), { pres: [0.5, 1] }));
    if (!units.some(x => x.base)) units.push(drinkSpec ? ML(1) : G());
    if (drinkSpec) {
      units.forEach(x => { if (!x.base && !x.pres) x.pres = x.g >= 300 ? [0.5, 1, 2] : [1, 2, 3]; });
    } else {
      units.forEach(x => { if (!x.base && !x.pres) x.pres = x.g >= 100 && x.id !== 'plate' ? [0.5, 1, 2] : x.id === 'plate' || x.id === 'serv' ? [0.5, 1, 1.5, 2] : x.id === 'tbsp' || x.id === 'tsp' ? [1, 2, 3] : [1, 2, 3, 5]; });
    }
    const def = { u: spec.def[0], q: spec.def[1] };
    return { drink: drinkSpec, units, def };
  }

  const unitOf = (p, id) => p.units.find(x => x.id === id) || p.units[0];
  const round = (v, d) => { const m = Math.pow(10, d || 0); return Math.round(v * m) / m; };
  const grams = (p, id, q) => (Number(q) || 0) * unitOf(p, id).g;
  function plural(x, q) {
    if (x.f[0] === x.f[1]) return x.f[0];
    if (q !== Math.floor(q)) return x.f[1];
    const n = Math.abs(q) % 100, m = n % 10;
    return n > 10 && n < 20 ? x.f[2] : m === 1 ? x.f[0] : m >= 2 && m <= 4 ? x.f[1] : x.f[2];
  }
  const FR = { 0.25: '¼', 0.5: '½', 0.75: '¾' };
  function fmtQty(q) {
    q = round(q, 2);
    const w = Math.floor(q), fr = round(q - w, 2);
    if (fr === 0) return String(w);
    if (FR[fr]) return (w ? String(w) : '') + FR[fr];
    return String(q).replace('.', ',');
  }
  const label = (p, id, q) => { const x = unitOf(p, id); return fmtQty(q) + ' ' + plural(x, q); };
  const labelUnit = (p, id, q) => plural(unitOf(p, id), q);

  const UNIT_WORDS = [
    [/^(шт|штук|штуки|штука|ед|единиц)/, ['pc', 'piece', 'slice', 'serv', 'pot', 'leaf', 'roll', 'scoop']],
    [/^(ст\.?\s*л|столов|ложк)/, ['tbsp']], [/^(ч\.?\s*л|чайн)/, ['tsp']],
    [/^стакан/, ['glass']], [/^чашк/, ['cup', 'mug']], [/^кружк/, ['mug', 'cup']], [/^банк/, ['can', 'pot']], [/^бутыл/, ['bottle']],
    [/^(бокал)/, ['wine', 'glass']], [/^рюмк/, ['shot']], [/^ломт|^ломот/, ['slice']], [/^(кус|кусоч)/, ['piece', 'lump', 'slice']],
    [/^порц/, ['serv', 'plate', 'pot']], [/^тарелк/, ['plate', 'serv']], [/^горст/, ['handful']], [/^(долк|долек)/, ['seg']], [/^шарик/, ['scoop']],
    [/^плитк/, ['bar']], [/^лист/, ['leaf']], [/^ролл/, ['roll']], [/^баночк/, ['pot', 'can']]
  ];
  const GENERIC = { tbsp: 15, tsp: 5, glass: 200, cup: 200, mug: 300, can: 330, bottle: 500, wine: 150, shot: 50, slice: 25, piece: 100, serv: 200, plate: 300, handful: 50 };

  /* Из ответа разбора текста (вес, количество, единица) в меру профиля. */
  function fromParsed(p, item) {
    const w = item && Number(item.weight_g), qn = item && Number(item.quantity), uw = norm(item && item.unit).trim();
    const base = p.units.find(x => x.base);
    if (w > 0) return { u: base.id, q: round(w / base.g, 0) || 1 };
    if (qn > 0) {
      if (/^(г|гр|грамм)/.test(uw)) return { u: 'g', q: qn, forceG: true };
      if (/^мл|^миллил/.test(uw)) return { u: base.id, q: qn };
      if (/^(л|литр)/.test(uw)) return { u: base.id, q: qn * 1000 / base.g };
      if (/^(кг|килогр)/.test(uw)) return { u: p.units.find(x => x.id === 'g') ? 'g' : base.id, q: qn * 1000 / base.g };
      const hit = UNIT_WORDS.find(([re]) => re.test(uw));
      if (hit) {
        const own = p.units.find(x => hit[1].includes(x.id));
        if (own) return { u: own.id, q: qn };
        const gen = GENERIC[hit[1][0]];
        if (gen) { const gw = (hit[1][0] === 'tbsp' && !p.drink) ? 20 : gen; return { u: base.id, q: Math.max(1, round(qn * gw / base.g, 0)) }; }
      }
      const own = p.units.find(x => !x.base);
      if (own) return { u: own.id, q: qn };
    }
    return { u: p.def.u, q: p.def.q };
  }

  /* Лучшее представление граммов: целое число единиц, иначе базовая единица. */
  function fromGrams(p, g) {
    const base = p.units.find(x => x.base);
    return { u: base.id, q: round(g / base.g, 0) };
  }

  window.FoodPortions = { profile, unitOf, grams, label, labelUnit, plural, fmtQty, fromParsed, fromGrams, round };
})();
