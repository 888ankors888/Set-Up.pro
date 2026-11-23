(function(root, factory) {
  const node = typeof module === 'object' && module.exports;
  const api = factory(node ? require('./data-store.js') : root.SetUpDataStore);
  if (node) module.exports = api; else root.SetUpNutritionStore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(shared) {
  'use strict';
  if (!shared) throw Error('Не загружен общий модуль хранения');
  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  function error(code, message) { const e = new Error(message); e.code = code; throw e; }
  function dateOK(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(value + 'T12:00:00Z');
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10) === value;
  }
  function validateEntry(entry) {
    if (!object(entry) || typeof entry.id !== 'string' || !/^[-\w]{1,100}$/.test(entry.id) ||
        !dateOK(entry.date) || typeof entry.time !== 'string' || entry.time.length !== 5 ||
        !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(entry.time) ||
        !['Завтрак','Обед','Ужин','Перекус'].includes(entry.meal) ||
        typeof entry.name !== 'string' || !entry.name.trim() ||
        !['g','k','p','f','c'].every(key => Number.isFinite(entry[key]) && entry[key] >= 0)) {
      error('INVALID_FOOD_ENTRY', 'Некорректная запись питания');
    }
  }
  function validateState(state) {
    if (!object(state) || !Array.isArray(state.entries)) error('INVALID_FOOD_STATE', 'Нет корректного дневника питания');
    const ids = new Set();
    for (const entry of state.entries) {
      validateEntry(entry);
      if (ids.has(entry.id)) error('DUPLICATE_FOOD_ID', 'Повтор идентификатора записи питания');
      ids.add(entry.id);
    }
  }
  function createRepository({storage, today} = {}) {
    if (typeof today !== 'function') throw Error('Нужна функция текущей даты');
    const store = shared.createStore({storage, validate:validateState});
    function append(entries) {
      if (!Array.isArray(entries) || !entries.length) error('EMPTY_FOOD_BATCH', 'Нет записей для добавления');
      const day = today();
      if (!dateOK(day)) error('INVALID_TODAY', 'Проверьте текущую дату');
      for (const entry of entries) {
        validateEntry(entry);
        if (entry.date > day) error('FUTURE_FOOD_ENTRY', 'Нельзя записать питание в будущем');
      }
      return store.update(state => { state.entries.push(...entries); });
    }
    function remove(id, expected) {
      if (typeof id !== 'string' || !object(expected) || expected.id !== id) error('FOOD_SNAPSHOT_REQUIRED', 'Обновите дневник перед удалением');
      const signature = JSON.stringify(expected);
      return store.update(state => {
        const index = state.entries.findIndex(entry => entry.id === id);
        if (index < 0 || JSON.stringify(state.entries[index]) !== signature) error('FOOD_ENTRY_CHANGED', 'Запись изменилась или уже удалена. Обновите дневник');
        state.entries.splice(index, 1);
      });
    }
    return Object.freeze({append, remove, read:store.read});
  }
  return Object.freeze({createRepository, validateEntry, validateState});
});
