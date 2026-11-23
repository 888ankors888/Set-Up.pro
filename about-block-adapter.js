(() => {
  'use strict';
  if (window.foodAboutAdapterInstalled) return;
  const api = window.SetUpAboutStore;
  const previousSave = window.foodSaveQuestionnaireBlock;
  if (!api || typeof previousSave !== 'function' || typeof render !== 'function' || typeof S === 'undefined') {
    throw Error('Блок «О вас»: сначала загрузите приложение, about-store.js и questionnaire-blocks.js');
  }
  const sessions = new WeakMap();
  function show(root, text) {
    try { const status = root?.querySelector('[data-block-save-status]'); if (status) status.textContent = text; } catch (_) {}
    try { toast(text); } catch (_) {}
  }
  function mount() {
    const root = document.getElementById('goals-questionnaire-about');
    if (!root || sessions.has(root)) return;
    try {
      const repository = api.createRepository({storage:localStorage, today});
      sessions.set(root, repository.begin(S));
    } catch (error) { show(root, api.message(error)); }
  }
  window.foodSaveQuestionnaireBlock = function(id) {
    if (id !== 'about') return previousSave.apply(this, arguments);
    const root = document.getElementById('goals-questionnaire-about');
    if (!root) return false;
    const session = sessions.get(root);
    if (!session) { show(root, 'Обновите форму «О вас» перед сохранением'); return false; }
    let result;
    try { result = session.save(api.collect(root)); }
    catch (error) { show(root, api.message(error)); return false; }
    S = result.state;
    show(root, 'Блок «О вас» сохранён');
    return true;
  };
  const previousRender = render;
  render = function() { const result = previousRender.apply(this, arguments); mount(); return result; };
  window.foodAboutAdapterInstalled = true;
  mount();
})();
