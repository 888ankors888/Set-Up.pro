(() => {
  const categories = [
    ['Здоровье и тело','💚',['Выпить воду — личная цель','Спать 7–8 часов','Ложиться спать до 23:00','Вставать в одно и то же время','Делать зарядку / растяжку','Пройти 10 000 шагов','Съесть овощи/фрукты','Ограничить сахар/фастфуд','Отметить приём назначенных витаминов/лекарств','Умыться и ухаживать за кожей вечером','Проветрить спальню перед сном','Не пить кофе после 15:00','Не есть за 2–3 часа до сна']],
    ['Психическое и эмоциональное здоровье','🌿',['Медитировать 5–10 минут','Сделать дыхательное упражнение','Записать 3 вещи, за которые благодарен','Провести 15 минут без телефона','Отметить настроение','Сделать паузу/перерыв в работе']],
    ['Питание','🥗',['Позавтракать','Готовить еду дома','Есть без экрана','Читать состав продуктов','Есть медленно, без спешки','Записывать питание','Пробовать новое блюдо']],
    ['Физическая активность','🚶',['Утренняя растяжка','Прогулка после еды','Разминаться каждый час при сидячей работе','Подниматься по лестнице вместо лифта','Выполнить запланированное занятие']],
    ['Сон и восстановление','🌙',['Убрать телефон за час до сна','Короткий отдых днём (10–20 мин)','Ложиться и вставать в одно время']],
    ['Обучение и развитие','📚',['Читать 20–30 минут','Учить 5–10 иностранных слов','Практиковать новый навык 15 минут','Записывать идеи/инсайты','Повторять изученное']],
    ['Работа и продуктивность','🎯',['Планировать день с вечера или утром','Начинать с самой важной задачи','Работать по таймеру (Pomodoro)','Делать перерывы каждые 45–60 минут','Вычёркивать выполненные задачи','Выключать рабочие чаты вечером']],
    ['Финансы','💰',['Записывать расходы за день','Не покупать импульсивно — правило 24 часов','Откладывать небольшую сумму']],
    ['Отношения и социальная жизнь','🤝',['Позвонить/написать близкому','Провести время без телефона с семьёй','Сказать комплимент/благодарность','Слушать, не перебивая']],
    ['Дом и порядок','🏡',['Заправлять кровать','Мыть посуду сразу','Убирать 10 минут в день','Поддерживать рабочий стол в порядке']],
    ['Цифровая гигиена','📵',['Не брать телефон первые 30 минут после пробуждения','Ограничивать соцсети по таймеру','Отключать уведомления на время работы','Не есть с телефоном в руке']],
    ['Творчество и хобби','🎨',['15 минут творчества','Читать художественную литературу','Записывать идеи']],
    ['Саморефлексия','📝',['Вести дневник утром или вечером','Ставить 1–3 цели на день','Записывать выводы/уроки дня','Отслеживать настроение']],
    ['Экология и осознанность','🌍',['Брать многоразовую бутылку/сумку','Сортировать мусор','Экономить воду/электричество','Ходить пешком/ездить на велосипеде','Своя привычка']]
  ];
  const aliases = {'3:0':'0:4','10:3':'2:2','11:2':'5:3','12:3':'1:4'};
  const key = (g,i) => aliases[g+':'+i] || g+':'+i;
  const all = [...new Set(categories.flatMap(([, , items],g) => items.map((_,i) => key(g,i))))];
  const legacy = {walk:'3:1',breaks:'3:2',produce:'0:6',sleep:'4:2',training:'3:4',custom:'13:4'};
  const escText = value => esc(String(value ?? ''));
  function initial() {
    const p = S.profile || {};
    if (p.habitsV2?.version === 1 && p.habitsV2.items) return p.habitsV2.items;
    const items = {};
    for (const id of p.questionnairePreferences?.answers?.habitChoices || []) {
      if (legacy[id]) items[legacy[id]] = {enabled:true,target:id === 'custom' ? p.questionnairePreferences.answers.customHabit || '' : '',schedule:'daily',time:''};
    }
    for (const [old,id] of [['water','0:0'],['tracking','2:5'],['new_food','2:6']]) {
      if (p.nutritionGoals?.includes(old)) items[id] = {enabled:true,target:id === '0:0' ? String(p.nutritionGoalSettings?.waterMl || S.waterGoal || 2000) : '',schedule:'daily',time:''};
    }
    return items;
  }
  function row(g,i,title,items) {
    const id = key(g,i), value = items[id] || {}, selected = value.enabled === true;
    const target = id === '0:0' ? String(S.profile?.nutritionGoalSettings?.waterMl || S.waterGoal || 2000) : value.target || '';
    const uid = 'habit-' + g + '-' + i;
    const targetControl=id==='0:0'?'<label for="'+uid+'-target">Личная цель воды, мл в день</label><input id="'+uid+'-target" data-habit-target type="number" min="250" max="10000" step="50" value="'+escText(target)+'">':id==='13:4'?'<label for="'+uid+'-target">Название своей привычки</label><input id="'+uid+'-target" data-habit-target type="text" maxlength="300" value="'+escText(target)+'">':'<input id="'+uid+'-target" data-habit-target type="hidden" value="'+escText(target)+'">';
    return '<div class="habit-choice" data-habit="'+id+'"><label class="habit-check"><input type="checkbox" data-habit-enabled '+(selected?'checked':'')+'><span>'+escText(title)+'</span></label><div class="habit-options" '+(selected?'':'hidden')+'>'+targetControl+'<label for="'+uid+'-schedule">Как часто</label><select id="'+uid+'-schedule" data-habit-schedule>'+[['daily','Каждый день'],['weekdays','По будням'],['weekends','По выходным'],['flexible','По возможности']].map(([v,t])=>'<option value="'+v+'" '+((value.schedule||'daily')===v?'selected':'')+'>'+t+'</option>').join('')+'</select><label for="'+uid+'-time">Удобное время, необязательно</label><input id="'+uid+'-time" data-habit-time type="time" value="'+escText(value.time||'')+'">'+(id==='0:8'?'<p class="subtle">Только по действующему назначению. Приложение не подбирает препараты, дозировки и схему приёма.</p>':'')+'</div></div>';
  }
  const previousForm = formView;
  formView = function () {
    const template = document.createElement('template');
    template.innerHTML = previousForm();
    const block = template.content.querySelector('#goals-questionnaire-habits');
    if (!block) return template.innerHTML;
    const compatibility = document.createElement('div');
    compatibility.hidden = true;
    compatibility.id = 'habits-legacy-fields';
    while (block.firstChild) compatibility.appendChild(block.firstChild);
    compatibility.querySelector('#goals-questionnaire-habits-title')?.remove();
    block.appendChild(compatibility);
    const items = initial();
    block.insertAdjacentHTML('beforeend','<div class="eyebrow">Блок 4 из 4</div><h2 id="goals-questionnaire-habits-title">Привычки</h2><p class="mu">Откройте категорию, выберите привычки и настройте их под себя. Числа в названиях — примеры, не обязательные нормы.</p><div class="habit-categories">'+categories.map(([title,image,list],g)=>'<details class="habit-category"><summary><span class="habit-picture" aria-hidden="true">'+image+'</span><span>'+title+'<small data-habit-count></small></span><span aria-hidden="true">⌄</span></summary><div class="habit-list">'+list.map((t,i)=>key(g,i)===g+':'+i?row(g,i,t,items):'').join('')+'</div></details>').join('')+'</div><p class="subtle">Сейчас настраивается список привычек. Отметки выполнения и уведомления будут подключены отдельно. Данные не отправляются в ИИ при сохранении.</p>');
    for (const [old,id] of [['water','0:0'],['tracking','2:5'],['new_food','2:6']]) {
      const input = compatibility.querySelector('.food-nutrition-goal[value="'+old+'"]');
      if (input) input.checked = items[id]?.enabled === true;
    }
    counts(block);
    return template.innerHTML;
  };
  function counts(root) {
    root.querySelectorAll('.habit-category').forEach(category => {
      const total = category.querySelectorAll('[data-habit-enabled]:checked').length;
      category.querySelector('[data-habit-count]').textContent = total ? 'Выбрано: '+total : 'Выбрать привычки';
    });
  }
  document.addEventListener('input', event => {
    const source = event.target.closest('[data-habit]');
    if (!source) return;
    const id = source.dataset.habit;
    for (const row of document.querySelectorAll('[data-habit="'+id+'"]')) {
      for (const attr of ['enabled','target','schedule','time']) {
        const from = source.querySelector('[data-habit-'+attr+']'), to = row.querySelector('[data-habit-'+attr+']');
        if (attr === 'enabled') to.checked = from.checked; else to.value = from.value;
      }
      row.querySelector('.habit-options').hidden = !row.querySelector('[data-habit-enabled]').checked;
    }
    const water = document.querySelector('[data-habit="0:0"] [data-habit-target]');
    const oldWater = document.getElementById('food-water-goal');
    if (water && oldWater && Number.isInteger(Number(water.value)) && Number(water.value) >= 250 && Number(water.value) <= 10000) oldWater.value = water.value;
    counts(document);
  });
  window.foodCollectHabits = function (profile) {
    const items = {...initial()};
    for (const id of all) {
      const row = document.querySelector('[data-habit="'+id+'"]');
      if (!row) throw Error('Не удалось прочитать привычки. Обновите страницу');
      const enabled = row.querySelector('[data-habit-enabled]').checked;
      const target = row.querySelector('[data-habit-target]').value.trim();
      const schedule = row.querySelector('[data-habit-schedule]').value;
      const time = row.querySelector('[data-habit-time]').value;
      if (target.length > 300 || !['daily','weekdays','weekends','flexible'].includes(schedule) || (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time))) throw Error('Проверьте цель, расписание и время привычки');
      if (enabled && id === '13:4' && !target) throw Error('Опишите свою привычку');
      if (enabled && id === '0:0') {
        const water = Number(target);
        if (!Number.isInteger(water) || water < 250 || water > 10000) throw Error('Укажите личную цель воды от 250 до 10000 мл');
        profile.nutritionGoalSettings.waterMl = water;
      }
      items[id] = {enabled,target,schedule,time};
    }
    for (const [old,id] of [['water','0:0'],['tracking','2:5'],['new_food','2:6']]) {
      profile.nutritionGoals = profile.nutritionGoals.filter(value => value !== old);
      if (items[id]?.enabled) profile.nutritionGoals.push(old);
    }
    const answers = profile.questionnairePreferences.answers;
    answers.habitChoices = Object.entries(legacy).filter(([,id]) => items[id]?.enabled).map(([name]) => name);
    answers.customHabit = items['13:4']?.enabled ? items['13:4'].target : '';
    return {version:1,items};
  };
  window.foodHabitDefinitions=()=>categories.flatMap(([category,image,list],g)=>list.map((title,i)=>({id:key(g,i),title,category,image,canonical:key(g,i)===g+':'+i}))).filter(d=>d.canonical);
  window.foodHabitSettings=initial;
  const style = document.createElement('style');
  style.textContent = '#goals-questionnaire-habits [hidden]{display:none!important}.habit-categories{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.habit-category{border:1px solid var(--ln)!important;border-radius:18px;padding:0!important;margin:0!important;align-self:start;background:var(--card)}.habit-category>summary{display:flex;align-items:center;gap:12px;padding:16px;list-style:none}.habit-category>summary::-webkit-details-marker{display:none}.habit-category>summary>span:nth-child(2){flex:1}.habit-category small{display:block;color:var(--mu);font-size:12px;font-weight:400;margin-top:4px}.habit-picture{display:grid;place-items:center;font-size:30px;min-width:52px;height:52px;background:var(--ac2);border-radius:16px}.habit-list{padding:0 16px 16px}.habit-choice{padding:12px 0;border-top:1px solid var(--ln)}.habit-check{display:flex;align-items:flex-start;gap:10px;color:var(--tx)}.habit-check input{margin-top:5px}.habit-options{padding:4px 0 10px 28px}@media(max-width:700px){.habit-categories{grid-template-columns:1fr}}';
  document.head.appendChild(style);
  render();
  const loadTracker=()=>{if(document.querySelector('script[data-habit-tracker]'))return;const script=document.createElement('script');script.dataset.habitTracker='';script.src=new URL('habit-tracker.js?v=1',document.baseURI).href;document.head.appendChild(script);};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',loadTracker,{once:true});else loadTracker();
})();
