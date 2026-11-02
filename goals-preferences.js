(() => {
  const fields = [
    ['about','routine','Как обычно проходит ваш день?','select',[['desk','В основном сижу'],['mixed','Чередую сидение и движение'],['standing','Много стою или хожу'],['physical','Физическая работа'],['variable','Каждый день по-разному']]],
    ['about','guidance','Как удобнее получать рекомендации?','select',[['simple','Короткий список действий'],['explained','План с объяснениями'],['flexible','Несколько вариантов на выбор']]],
    ['nutrition','approach','Как удобнее следить за питанием?','select',[['macros','Калории и БЖУ'],['portions','Понятные порции'],['logging','Пока только записывать еду']]],
    ['nutrition','diet','Как вы предпочитаете питаться?','select',[['mixed','Ем разные продукты'],['pescatarian','Без мяса, но с рыбой'],['vegetarian','Без мяса и рыбы'],['vegan','Без животных продуктов']]],
    ['nutrition','allergyStatus','Есть ли пищевая аллергия?','select',[['unknown','Не знаю'],['none','Нет известных аллергий'],['listed','Да — укажу ниже']]],
    ['nutrition','allergens','Какие продукты вызывают аллергию?','multi',[['milk','Молоко'],['eggs','Яйца'],['fish','Рыба'],['shellfish','Ракообразные'],['peanuts','Арахис'],['nuts','Орехи'],['soy','Соя'],['wheat','Пшеница'],['sesame','Кунжут'],['other','Другие']]],
    ['nutrition','allergyOther','Другие аллергены (необязательно)','text',[]],
    ['nutrition','intolerances','Непереносимости или ограничения врача (необязательно)','text',[]],
    ['nutrition','dislikes','Что вы не любите? Это предпочтение, не аллергия.','multi',[['fish','Рыба'],['meat','Мясо'],['dairy','Молочные продукты'],['legumes','Бобовые'],['spicy','Острое'],['liver','Печень'],['curd','Творог'],['broccoli','Брокколи'],['buckwheat','Гречка'],['other','Другое']]],
    ['nutrition','dislikesOther','Другие нелюбимые продукты (необязательно)','text',[]],
    ['nutrition','meals','Сколько приёмов пищи вам удобно?','select',[['1to2','Один–два'],['3','Три'],['4','Четыре'],['5plus','Пять и больше'],['flexible','Без фиксированного режима']]],
    ['nutrition','foodSource','Как обычно организуете еду?','select',[['home','Готовлю дома'],['family','Готовит семья'],['out','Ем вне дома'],['delivery','Заказываю'],['mixed','Комбинирую']]],
    ['nutrition','cooking','Сколько времени готовы готовить?','select',[['15','До 15 минут'],['30','До 30 минут'],['60','До часа'],['flexible','Время не принципиально']]],
    ['nutrition','budget','Какой бюджет учитывать?','select',[['economy','Экономный'],['medium','Средний'],['flexible','Без особых ограничений']]],
    ['sport','activities','Какие занятия вам нравятся? Можно несколько.','multi',[['walk','Ходьба'],['strength','Силовые'],['bike','Велосипед'],['run','Бег'],['mobility','Подвижность'],['other','Другие']]],
    ['sport','company','Как комфортнее заниматься?','select',[['alone','Самостоятельно'],['partner','С партнёром'],['group','В группе'],['coach','С тренером']]],
    ['sport','sportTime','Когда удобнее заниматься?','select',[['morning','Утром'],['day','Днём'],['evening','Вечером'],['flexible','По обстоятельствам']]],
    ['habits','habitChoices','Какие привычки хотите добавить?','multi',[['walk','Гулять'],['breaks','Делать перерывы от сидения'],['produce','Добавлять овощи или фрукты'],['sleep','Следить за режимом сна'],['training','Выполнять запланированные занятия'],['custom','Своя привычка']]],
    ['habits','customHabit','Название своей привычки (необязательно)','text',[]],
    ['habits','habitFrequency','Как часто хотите отмечать привычки?','select',[['daily','Каждый день'],['weekdays','По будням'],['three','Три раза в неделю'],['flexible','Без фиксированного расписания']]],
    ['habits','habitTime','Когда удобнее вспоминать о привычках?','select',[['morning','Утром'],['day','Днём'],['evening','Вечером'],['none','Без напоминаний']]]
  ];
  const id = key => 'gqp-' + key;
  const escape = value => esc(String(value ?? ''));
  function question(field, answers) {
    const [,key,title,type,options] = field;
    const value = answers[key];
    let control;
    if (type === 'select') {
      control = '<select id="' + id(key) + '"><option value="">Пока пропустить</option>' + options.map(([v,t]) => '<option value="' + v + '" ' + (value === v ? 'selected' : '') + '>' + t + '</option>').join('') + '</select>';
    } else if (type === 'multi') {
      return '<fieldset data-gqp="' + key + '" style="border:1px solid var(--ln);border-radius:12px;padding:12px;margin:14px 0"><legend>' + title + '</legend>' + options.map(([v,t]) => '<label class="chk"><input type="checkbox" data-gqp-key="' + key + '" value="' + v + '" ' + (Array.isArray(value) && value.includes(v) ? 'checked' : '') + '>' + t + '</label>').join('') + '</fieldset>';
    } else {
      control = '<input id="' + id(key) + '" type="text" maxlength="300" value="' + escape(value) + '">';
    }
    return '<div data-gqp="' + key + '"><label for="' + id(key) + '">' + title + '</label>' + control + '</div>';
  }
  function conditional(root) {
    const rules = {
      allergens: root.querySelector('#gqp-allergyStatus')?.value === 'listed',
      allergyOther: root.querySelector('#gqp-allergyStatus')?.value === 'listed' && !!root.querySelector('[data-gqp-key="allergens"][value="other"]:checked'),
      dislikesOther: !!root.querySelector('[data-gqp-key="dislikes"][value="other"]:checked'),
      customHabit: !!root.querySelector('[data-gqp-key="habitChoices"][value="custom"]:checked')
    };
    for (const [key, visible] of Object.entries(rules)) {
      const node = root.querySelector('[data-gqp="' + key + '"]');
      if (node) node.hidden = !visible;
    }
  }
  const previousForm = formView;
  formView = function () {
    const template = document.createElement('template');
    template.innerHTML = previousForm();
    const answers = S.profile?.questionnairePreferences?.answers || {};
    for (const block of ['about','nutrition','sport','habits']) {
      const target = template.content.querySelector('#goals-questionnaire-' + block);
      if (!target) continue;
      target.insertAdjacentHTML('beforeend', fields.filter(f => f[0] === block).map(f => question(f, answers)).join(''));
    }
    const habits = template.content.querySelector('#goals-questionnaire-habits');
    if (habits) habits.insertAdjacentHTML('beforeend', '<p class="subtle">Новые ответы пока сохраняются как предпочтения. Подбор меню, дополнительные трекеры и уведомления ещё не подключены. Сохранение не отправляет данные в ИИ.</p>');
    conditional(template.content);
    return template.innerHTML;
  };
  document.addEventListener('change', event => {
    if (event.target.closest('[data-gqp]')) conditional(document);
  });
  function readAnswers() {
    const answers = {};
    for (const [,key,,type,options] of fields) {
      if (type === 'multi') {
        answers[key] = [...document.querySelectorAll('[data-gqp-key="' + key + '"]:checked')].map(n => n.value).filter(v => options.some(o => o[0] === v));
      } else {
        const value = document.getElementById(id(key))?.value || '';
        if (type === 'select' && value && !options.some(o => o[0] === value)) throw Error('Проверьте выбранные предпочтения');
        if (value.length > 300) throw Error('Сократите текст до 300 символов');
        answers[key] = value.trim();
      }
    }
    if (answers.allergyStatus !== 'listed') { answers.allergens = []; answers.allergyOther = ''; }
    if (!answers.allergens.includes('other')) answers.allergyOther = '';
    if (!answers.dislikes.includes('other')) answers.dislikesOther = '';
    if (!answers.habitChoices.includes('custom')) answers.customHabit = '';
    if (answers.allergyStatus === 'listed' && !answers.allergens.length) throw Error('Укажите аллерген или выберите «Другие»');
    if (answers.allergens.includes('other') && !answers.allergyOther) throw Error('Укажите другие аллергены');
    if (answers.habitChoices.includes('custom') && !answers.customHabit) throw Error('Введите название своей привычки');
    return answers;
  }
  const previousSave = saveForm;
  saveForm = function () {
    if (!document.getElementById('gqp-routine')) return previousSave();
    try {
      const answers = readAnswers();
      const val = id => document.getElementById(id)?.value ?? '';
      const num = id => val(id) === '' ? null : Number(val(id));
      const valid = (n,lo,hi) => Number.isFinite(n) && n >= lo && n <= hi;
      const profile = {...S.profile, sex:val('sex'), age:num('age'), h:num('h'), w:num('w'), tw:num('tw'), act:num('act'), goal:val('goal'), bodyGoal:val('food-body-goal'), health:[...document.querySelectorAll('.hl:checked')].map(n => n.value), notes:val('notes').trim(), pw:num('pw'), pl:num('pl')};
      if (!['f','m'].includes(profile.sex) || !valid(profile.age,10,120) || !valid(profile.h,100.1,250) || !valid(profile.w,25.1,399.9) || !valid(profile.tw,25.1,399.9) || ![1.2,1.375,1.55,1.725].includes(profile.act) || !['lose','gain','maintain'].includes(profile.goal) || !['lose','gain','recomp','maintain','reverse','cut'].includes(profile.bodyGoal) || !valid(profile.pw,3.1,20) || !valid(profile.pl,8.1,35)) throw Error('Проверьте возраст, рост, вес, цель и размеры ладони');
      const settings = {...profile.nutritionGoalSettings, proteinFactor:num('food-protein-factor'), addedSugarGrams:num('food-sugar-limit'), waterMl:num('food-water-goal'), eatingWindowHours:num('food-eating-window'), newFoodsPerWeek:num('food-new-week'), trackingDays:num('food-tracking-days')};
      for (const [key,lo,hi] of [['proteinFactor',0.5,3],['waterMl',250,10000],['eatingWindowHours',1,23],['newFoodsPerWeek',1,21],['trackingDays',1,365]]) if (!valid(settings[key],lo,hi)) throw Error('Проверьте личные ориентиры питания');
      if (!Number.isInteger(settings.waterMl) || (settings.addedSugarGrams !== null && !valid(settings.addedSugarGrams,0,200))) throw Error('Проверьте цель воды и сахара');
      profile.nutritionGoals = [...document.querySelectorAll('.food-nutrition-goal:checked')].map(n => n.value).filter(v => ['calories','protein','sugar','water','fasting','quality','new_food','tracking'].includes(v));
      profile.nutritionGoalSettings = settings;
      profile.questionnairePreferences = {...profile.questionnairePreferences, version:1, answers};
      const sportsProfile = {...S.sports?.profile, enabled:!!document.getElementById('sp-enabled')?.checked, level:val('sp-level'), goal:val('sp-goal'), place:val('sp-place'), equipment:val('sp-equipment').trim(), minutes:num('sp-minutes'), days:[...document.querySelectorAll('.sp-day:checked')].map(n => Number(n.value)), restrictions:val('sp-restrictions')};
      if (typeof window.foodCollectSport === "function") profile.sportQuestionnaire = window.foodCollectSport(profile, sportsProfile);
      if (!sportsProfile.enabled) { if (!sportsProfile.days.length) sportsProfile.days = [0,2,4]; if (!valid(sportsProfile.minutes,10,90)) sportsProfile.minutes = 25; }
      if (!['beginner','regular','experienced'].includes(sportsProfile.level) || !['activity','strength','endurance','muscle','mobility'].includes(sportsProfile.goal) || !['home','gym','outdoor'].includes(sportsProfile.place) || !['none','yes','unsure'].includes(sportsProfile.restrictions) || !Number.isInteger(sportsProfile.minutes) || !valid(sportsProfile.minutes,10,90) || sportsProfile.equipment.length > 200 || sportsProfile.days.length < 1 || sportsProfile.days.length > 5 || new Set(sportsProfile.days).size !== sportsProfile.days.length || sportsProfile.days.some(n => !Number.isInteger(n) || n < 0 || n > 6)) throw Error('Проверьте спорт: 1–5 дней и 10–90 минут');
      if (typeof window.foodCollectHabits === "function") profile.habitsV2 = window.foodCollectHabits(profile);
      if (typeof window.foodCollectNutrition === "function") profile.nutritionQuestionnaire = window.foodCollectNutrition(profile);
      const next = {...S, profile, waterGoal:settings.waterMl, weights:{...S.weights,[today()]:profile.w}, sports:{...S.sports,profile:sportsProfile}};
      localStorage.setItem('nt1', JSON.stringify(next));
      S = next;
      editing = false;
      tab = 'goals';
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Не удалось сохранить анкету');
      return;
    }
    render();
    toast('Анкета и предпочтения сохранены');
  };
  render();
})();
