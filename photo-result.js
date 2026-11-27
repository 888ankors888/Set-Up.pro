/* Compact result of the photo food estimate: dish, KBJU, portion size, one add button. */
(function () {
  if (window.__photoResultLoaded || typeof meView !== 'function') return; window.__photoResultLoaded = true;
  const PHOTO_TEXT = 'Приём пищи по фотографии';
  const isPhoto = () => { try { return ME.dishes.length && !ME.demo && ME.sourceText === PHOTO_TEXT; } catch (e) { return false; } };
  const SC = [[0.5, '½ порции'], [0.75, '¾ порции'], [1, 'Исходная порция'], [1.5, '1½ порции'], [2, 'Две порции']];
  const card = (d, i) => `<article class="card me-dish"><h3 style="margin:0 0 8px">${esc(d.name)}</h3><div class="me-grid">${ME_KEYS.map(([k, n]) => `<div><span class="subtle">${n}</span><b>~ ${meRange(d.nutrition[k])}</b></div>`).join('')}</div><label for="me-scale-${i}" style="margin-top:12px;display:block">Размер порции</label><select id="me-scale-${i}" onchange="meScale(${i},this.value)">${SC.map(([v, n]) => `<option value="${v}" ${d.scale === v ? 'selected' : ''}>${n}</option>`).join('')}</select></article>`;
  const full = meView;
  meView = function () {
    if (!isPhoto()) return full();
    if (!ME.date) ME.date = today(); if (!ME.meal) ME.meal = mealNow();
    return `<section class="card" id="meal-estimate" data-photo-result="1">${ME.dishes.map(card).join('')}<button class="btn" style="width:100%;margin-top:12px" onclick="ME.confirmed=true;meSave()" ${ME.busy ? 'disabled' : ''}>Добавить</button></section>`;
  };
  try { meRefresh(); } catch (e) {}
})();
