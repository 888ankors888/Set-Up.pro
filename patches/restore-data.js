async function restoreData(input) {
  const file = input.files?.[0];
  if (!file) return;
  let next, serialized;
  try {
    const raw = JSON.parse(await file.text());
    const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
    if (!object(raw)) throw new Error('Ожидался объект JSON');
    const wrapped = Object.prototype.hasOwnProperty.call(raw, 'data');
    if (wrapped && raw.version !== 2) throw new Error('Неподдерживаемая версия копии');
    const d = wrapped ? raw.data : raw;
    if (!object(d) || !Array.isArray(d.entries)) throw new Error('Нет массива записей');
    if (d.profile !== null && (!object(d.profile) ||
        !['age', 'h', 'w', 'act'].every(k => Number.isFinite(d.profile[k])) ||
        !Array.isArray(d.profile.health))) throw new Error('Некорректный профиль');
    const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      Number.isFinite(dt(value).getTime()) && dk(dt(value)) === value && value <= today();
    const meals = ['Завтрак', 'Обед', 'Ужин', 'Перекус'];
    d.entries.forEach((e, index) => {
      const fail = field => { throw new Error('Запись питания №' + (index + 1) + ': ' + field); };
      if (!object(e)) fail('ожидался объект');
      if (!validDate(e.date)) fail('некорректная дата');
      if (typeof e.time !== 'string' || e.time.length !== 5 || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(e.time)) fail('время должно быть ЧЧ:ММ, от 00:00 до 23:59');
      if (!meals.includes(e.meal)) fail('неизвестный приём пищи');
      if (typeof e.name !== 'string' || !e.name.trim()) fail('название не должно быть пустым');
      for (const key of ['g', 'k', 'p', 'f', 'c']) {
        if (!Number.isFinite(e[key]) || e[key] < 0) fail('поле ' + key + ' должно быть неотрицательным числом');
      }
    });
    next = JSON.parse(JSON.stringify(d));
    const ids = new Set();
    next.entries = next.entries.map(e => {
      const id = e.id == null || e.id === '' ? crypto.randomUUID() : e.id;
      if (typeof id !== 'string' || !/^[-\w]{1,100}$/.test(id) || ids.has(id)) {
        throw new Error('Некорректный или повторный ID записи');
      }
      ids.add(id);
      return {...e, id, thumb: typeof e.thumb === 'string' && e.thumb.startsWith('data:image/') ? e.thumb : ''};
    });
    next.sports = window.sportsValidateImport(d.sports);
    next.waterGoalsByDate = window.foodValidateWaterGoals(d.waterGoalsByDate);
    next.weights ??= {};
    next.reports ??= {};
    next.rem ??= defRem();
    next.water ??= {};
    next.waterGoal ??= 2000;
    serialized = JSON.stringify(next);
  } catch (error) {
    input.value = '';
    toast('Импорт отменён: ' + error.message);
    return;
  }
  if (!confirm('Заменить текущие данные? Сначала сохраните текущую JSON-копию.')) {
    input.value = '';
    return;
  }
  try {
    localStorage.setItem('nt1', serialized);
  } catch (error) {
    input.value = '';
    toast('Не удалось записать копию. Текущие данные не изменены.');
    return;
  }
  S = next;
  tab = 'diary';
  input.value = '';
  try {
    render();
    toast('Данные восстановлены');
  } catch (error) {
    toast('Копия записана, но экран не обновился. Сохраните исходный файл для диагностики.');
  }
}