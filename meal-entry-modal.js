(() => {
  const MEALS = ['Завтрак', 'Обед', 'Ужин', 'Перекус'];
  let opened = false, selectedMeal = null;
  const automaticMeal = mealNow;
  mealNow = function (...args) { return selectedMeal || automaticMeal.apply(this, args); };
  document.addEventListener('change', event => {
    const input = event.target;
    if (!selectedMeal || !(input instanceof HTMLSelectElement) || !MEALS.includes(input.value)) return;
    if (!input.closest('#meal-entry-dialog,dialog,#meal-estimate')) return;
    selectedMeal = input.value;
    ME.meal = input.value;
    const heading = document.getElementById('meal-dialog-heading');
    if (heading) heading.textContent = 'Добавить · ' + selectedMeal;
  });

  function dialog() {
    let node = document.getElementById('meal-entry-dialog');
    if (node) return node;
    node = document.createElement('dialog');
    node.id = 'meal-entry-dialog';
    node.setAttribute('aria-label', 'Оценка приёма пищи');
    node.innerHTML = '<header class="meal-dialog-head"><h2 id="meal-dialog-heading">Добавить приём пищи</h2><button type="button" aria-label="Закрыть окно">×</button></header><div class="meal-dialog-body"></div>';
    node.querySelector('button').onclick = () => node.close();
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
    document.getElementById('meal-dialog-heading').textContent = 'Добавить · ' + (ME.meal || 'Приём пищи');
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
      node.scrollTop = 0;
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
})();
