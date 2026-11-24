(function(root, factory) {
  const node = typeof module === 'object' && module.exports;
  const api = factory(node ? require('./data-store.js') : root.SetUpDataStore);
  if (node) module.exports = api; else root.SetUpAboutStore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(shared) {
  'use strict';
  if (!shared) throw Error('Не загружен общий модуль хранения');
  const FIELDS = Object.freeze(['sex','goal','bodyGoal','age','h','w','tw','act']);
  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
  function fail(code, message) { const e = new Error(message); e.code = code; throw e; }
  function dateOK(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(value + 'T12:00:00Z');
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10) === value;
  }
  function validateInput(input) {
    if (!object(input) || Reflect.ownKeys(input).length !== FIELDS.length ||
        !FIELDS.every(key => own(input, key))) fail('INVALID_FIELDS', 'Передайте только поля блока «О вас»');
    if (!['f','m'].includes(input.sex) || !['lose','gain','maintain'].includes(input.goal) ||
        !['lose','gain','recomp','maintain','reverse','cut'].includes(input.bodyGoal)) {
      fail('INVALID_ABOUT', 'Проверьте пол и основную цель');
    }
    for (const [key, lo, hi] of [['age',10,120],['h',100.1,250],['w',25.1,399.9],['tw',25.1,399.9]]) {
      if (!Number.isFinite(input[key]) || input[key] < lo || input[key] > hi ||
          (key === 'age' && !Number.isInteger(input[key]))) fail('INVALID_ABOUT', 'Проверьте поле «' + key + '»');
    }
    if (![1.2,1.375,1.55,1.725].includes(input.act)) fail('INVALID_ABOUT', 'Проверьте уровень активности');
    return Object.fromEntries(FIELDS.map(key => [key, input[key]]));
  }
  function validateState(state) {
    if (!object(state) || !object(state.profile) ||
        (state.weights !== undefined && !object(state.weights))) throw Error('Некорректный профиль или история веса');
  }
  const slot = (value, key) => own(value, key) ? JSON.stringify([true,value[key]]) : '[false]';
  const capture = profile => Object.fromEntries(FIELDS.map(key => [key, slot(profile,key)]));
  function createRepository({storage, today} = {}) {
    if (typeof today !== 'function') throw Error('Нужна функция текущей даты');
    const store = shared.createStore({storage, validate:validateState});
    function begin(displayedState) {
      validateState(displayedState);
      const date = today();
      if (!dateOK(date)) fail('INVALID_DATE', 'Проверьте текущую дату');
      let expected = capture(displayedState.profile);
      let expectedWeight = slot(displayedState.weights || {}, date);
      function save(input) {
        const patch = validateInput(input);
        if (today() !== date) fail('DATE_CHANGED', 'Дата изменилась. Обновите форму перед сохранением');
        const result = store.update(state => {
          if (FIELDS.some(key => slot(state.profile,key) !== expected[key])) {
            fail('ABOUT_CHANGED', 'Блок «О вас» изменился. Обновите форму перед сохранением');
          }
          const weightChanged = state.profile.w !== patch.w;
          if (weightChanged && slot(state.weights || {},date) !== expectedWeight) {
            fail('WEIGHT_CHANGED', 'Сегодняшняя запись веса изменилась. Обновите форму');
          }
          state.profile = {...state.profile, ...patch};
          if (weightChanged) state.weights = {...state.weights, [date]:patch.w};
        });
        expected = capture(result.state.profile);
        expectedWeight = slot(result.state.weights || {}, date);
        return result;
      }
      return Object.freeze({save});
    }
    return Object.freeze({begin});
  }
  function collect(root) {
    const result = {};
    for (const key of FIELDS) {
      const input = root.querySelector('#' + (key === 'bodyGoal' ? 'food-body-goal' : key));
      if (!input || typeof input.value !== 'string' || !input.value.trim()) fail('INCOMPLETE_FORM', 'Заполните блок «О вас»');
      result[key] = ['age','h','w','tw','act'].includes(key) ? Number(input.value) : input.value;
    }
    return validateInput(result);
  }
  const messages = Object.freeze({
    READ_FAILED:'Не удалось прочитать данные браузера',
    CORRUPT_JSON:'Данные повреждены. Исходная запись не изменена',
    VALIDATION_FAILED:'Некорректный профиль или история веса. Сохранение отменено',
    NOT_INITIALIZED:'Сначала сохраните основную анкету',
    WRITE_FAILED:'Не удалось сохранить данные в браузере',
    INVALID_JSON:'Данные содержат неподдерживаемые значения',
    CONFLICT:'Данные изменились во время сохранения. Повторите действие'
  });
  function message(error) { return messages[error?.code] || error?.message || 'Не удалось сохранить блок «О вас»'; }
  return Object.freeze({FIELDS, createRepository, collect, validateInput, message});
});
