/* Meal buttons (Завтрак / Обед / Ужин / Перекус) above the search field of the add-food window */
(() => {
'use strict';
const MEALS = ['Завтрак', 'Обед', 'Ужин', 'Перекус'];
const base = window.foodOpenMealWindow;
if (typeof base !== 'function') return;

const nowMeal = () => { const h = new Date().getHours(); return h < 11 ? MEALS[0] : h < 16 ? MEALS[1] : h < 21 ? MEALS[2] : MEALS[3]; };
let selected = MEALS[0];

const style = document.createElement('style');
style.id = 'food-add-meals-style';
style.textContent = `
#food-add-dialog .fam-mealrow{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:0 0 10px}
#food-add-dialog .fam-mealrow button{min-height:40px;padding:0 4px;border-radius:12px;background:#112d25!important;border:1px solid rgba(178,232,207,.16)!important;color:#98b5aa;font-size:12.5px;font-weight:600;text-align:center;transition:background .18s,border-color .18s,color .18s,box-shadow .18s,transform .18s}
#food-add-dialog .fam-mealrow button:hover{color:#eef7f2;border-color:rgba(198,248,92,.4)!important}
#food-add-dialog .fam-mealrow button:active{transform:scale(.95)}
#food-add-dialog .fam-mealrow button.is-now{background:rgba(198,248,92,.12)!important;border-color:#c6f85c!important;color:#c6f85c;font-weight:700;box-shadow:0 0 16px -5px rgba(198,248,92,.55)}
#food-add-dialog .fam-mealrow button.is-active{background:#c6f85c!important;border-color:#c6f85c!important;color:#000!important;font-weight:800;box-shadow:0 0 18px -4px rgba(198,248,92,.6)}
`;
document.head.appendChild(style);

function sync(row) {
  const now = nowMeal();
  row.querySelectorAll('button').forEach(b => {
    const m = b.dataset.meal;
    b.classList.toggle('is-active', m === selected);
    b.classList.toggle('is-now', m === now && m !== selected);
    b.setAttribute('aria-pressed', String(m === selected));
    b.title = m === now ? 'Подходит по времени' : '';
  });
}

function decorate() {
  const dlg = document.getElementById('food-add-dialog');
  const top = dlg && dlg.querySelector('.fam-top');
  if (!top) return;
  let row = top.querySelector('.fam-mealrow');
  if (!row) {
    row = document.createElement('div');
    row.className = 'fam-mealrow';
    row.setAttribute('role', 'group');
    row.setAttribute('aria-label', 'Приём пищи');
    row.innerHTML = MEALS.map(m => '<button type="button" data-meal="' + m + '">' + m + '</button>').join('');
    row.addEventListener('click', e => {
      const b = e.target.closest('button[data-meal]');
      if (!b || b.dataset.meal === selected) return;
      const input = dlg.querySelector('#fam-input');
      const q = input ? input.value : '';
      selected = b.dataset.meal;
      base(selected);
      const again = dlg.querySelector('#fam-input');
      if (again && q) {
        again.value = q;
        again.dispatchEvent(new Event('input', { bubbles: true }));
      }
      sync(row);
    });
    top.insertBefore(row, top.firstChild);
  }
  sync(row);
}

window.foodOpenMealWindow = function (meal) {
  if (MEALS.includes(meal)) selected = meal;
  base(meal);
  decorate();
};
})();
