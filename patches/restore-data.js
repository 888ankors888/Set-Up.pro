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
    if (d.entries.some(e => !object(e) || !validDate(e.date) || typeof e.name !== 'string' ||
        !['g', 'k', 'p', 'f', 'c'].every(k => Number.isFinite(e[k]) && e[k] >= 0))) {
      throw new Error('Некорректная запись питания');
    }
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