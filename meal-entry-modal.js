(() => {
  const MEALS = ['Завтрак', 'Обед', 'Ужин', 'Перекус'];
  let opened = false, selectedMeal = null;
  const automaticMeal = mealNow;
  mealNow = function (...args) { return selectedMeal || automaticMeal.apply(this, args); };

  function currentMeal() {
    return selectedMeal || (typeof ME !== 'undefined' && MEALS.includes(ME.meal) ? ME.meal : null) || automaticMeal();
  }

  function syncHead() {
    const node = document.getElementById('meal-entry-dialog');
    if (!node) return;
    const meal = currentMeal();
    const heading = node.querySelector('#meal-dialog-heading');
    if (heading) heading.textContent = meal;
    node.querySelectorAll('.meal-dialog-pills button').forEach(b => {
      const on = b.dataset.meal === meal;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', String(on));
    });
  }

  function mealSelect(node) {
    return [...node.querySelectorAll('.meal-dialog-body select')].find(s => [...s.options].some(o => MEALS.includes(o.value)));
  }

  document.addEventListener('change', event => {
    const input = event.target;
    if (!selectedMeal || !(input instanceof HTMLSelectElement) || !MEALS.includes(input.value)) return;
    if (!input.closest('#meal-entry-dialog,dialog,#meal-estimate')) return;
    selectedMeal = input.value;
    ME.meal = input.value;
    syncHead();
  });

  function pickMeal(meal) {
    selectedMeal = meal;
    ME.meal = meal;
    const node = document.getElementById('meal-entry-dialog');
    const select = node && mealSelect(node);
    if (select) {
      select.value = meal;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    syncHead();
  }

  function dialog() {
    let node = document.getElementById('meal-entry-dialog');
    if (node) return node;
    node = document.createElement('dialog');
    node.id = 'meal-entry-dialog';
    node.setAttribute('aria-label', 'Добавить приём пищи');
    node.innerHTML =
      '<header class="meal-dialog-head"><div class="meal-dialog-titles"><span class="meal-dialog-eyebrow">Добавить еду</span><h2 id="meal-dialog-heading">Приём пищи</h2></div>' +
      '<button type="button" class="meal-dialog-close" aria-label="Закрыть окно">×</button></header>' +
      '<div class="meal-dialog-pills" role="tablist" aria-label="Приём пищи">' +
      MEALS.map(m => '<button type="button" role="tab" data-meal="' + m + '">' + m + '</button>').join('') +
      '</div><div class="meal-dialog-body"></div>';
    node.querySelector('.meal-dialog-close').onclick = () => node.close();
    node.querySelector('.meal-dialog-pills').addEventListener('click', e => {
      const b = e.target.closest('button[data-meal]');
      if (b) pickMeal(b.dataset.meal);
    });
    node.addEventListener('click', e => { if (e.target === node) node.close(); });
    node.addEventListener('close', () => {
      opened = false;
      if (tab === 'diary') selectedMeal = null;
      document.documentElement.classList.remove('meal-entry-open');
      const index = MEALS.indexOf(ME.meal);
      document.querySelector('#meal-picker [data-meal-index="' + index + '"]')?.focus({ preventScroll: true });
    });
    document.body.appendChild(node);
    return node;
  }

  function hideInnerMealSelect(node) {
    const select = mealSelect(node);
    if (!select) return;
    const wrap = select.parentElement;
    if (wrap && !wrap.classList.contains('meal-dialog-body') && wrap.id !== 'meal-estimate' &&
        wrap.querySelectorAll('input,textarea,select,button').length === 1) {
      wrap.hidden = true;
      wrap.style.display = 'none';
    }
  }

  function mount() {
    const node = dialog();
    if (tab !== 'diary' || !S.profile || editing) {
      opened = false;
      if (node.open) node.close();
      return;
    }
    const card = document.querySelector('#app #meal-estimate');
    if (card) {
      let anchor = document.getElementById('meal-entry-anchor');
      if (!anchor) {
        anchor = document.createElement('span');
        anchor.id = 'meal-entry-anchor';
        anchor.hidden = true;
        card.before(anchor);
      }
      node.querySelector('.meal-dialog-body').replaceChildren(card);
    }
    hideInnerMealSelect(node);
    syncHead();
    if (opened && !node.open) {
      node.showModal();
      document.documentElement.classList.add('meal-entry-open');
    }
  }

  window.foodOpenMealWindow = function (meal) {
    if (ME.busy || !MEALS.includes(meal)) return;
    selectedMeal = meal;
    ME.meal = meal;
    opened = true;
    render();
    requestAnimationFrame(() => {
      document.getElementById('me-text')?.focus({ preventScroll: true });
      const node = dialog();
      const body = node.querySelector('.meal-dialog-body');
      if (body) body.scrollTop = 0;
    });
  };

  const previousRender = render;
  render = function () {
    document.querySelector('#meal-entry-dialog #meal-estimate')?.remove();
    previousRender();
    mount();
  };
  const previousRefresh = meRefresh;
  meRefresh = function () { previousRefresh(); mount(); };

  function afterSave(fn) {
    return function (...args) {
      const count = S.entries.length;
      const result = fn.apply(this, args);
      if (S.entries.length > count) {
        selectedMeal = null;
        opened = false;
        const node = dialog();
        if (node.open) node.close();
      }
      return result;
    };
  }
  meSave = afterSave(meSave);
  manualSave = afterSave(manualSave);
  jPut = afterSave(jPut);
  if (typeof aiSave === 'function') aiSave = afterSave(aiSave);
  render();

  // The compact add-food window (food-add-modal.js) replaces this dialog as the "Add food" entry point;
  // this dialog stays only for the photo estimate result (window.foodOpenEstimateWindow).
  // food-add-meals.js adds the meal buttons above the search field once the window script is loaded.
  const loader = document.createElement('script');
  loader.src = 'food-add-modal.js?v=8';
  loader.onload = () => {
    const meals = document.createElement('script');
    meals.src = 'food-add-meals.js?v=local';
    document.head.appendChild(meals);
    const pr = document.createElement('script');
    pr.src = 'photo-result.js?v=1';
    document.head.appendChild(pr);
  };
  const portions = document.createElement('script');
  portions.src = 'food-portions.js?v=4';
  portions.onload = portions.onerror = () => document.head.appendChild(loader);
  document.head.appendChild(portions);

  // Header logo: text + inline SVG sphere
  const logo = document.createElement('script');
  logo.src = 'design/header-logo.js?v=5';
  document.head.appendChild(logo);

  // Habit cards: category colours for status, CTA and the day strip
  const habitColors = document.createElement('link');
  habitColors.rel = 'stylesheet';
  habitColors.href = 'habit-tracker-colors.css?v=local';
  document.head.appendChild(habitColors);

  // Rename "Мои цели" -> "Мои данные"
  const rename = document.createElement('script');
  rename.src = 'goals-rename.js?v=local';
  document.head.appendChild(rename);
})();
