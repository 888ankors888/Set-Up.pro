(() => {
  const cards = [['routine','🕒','Мой режим'],['diet','🥗','Мой рацион'],['behaviour','🍽️','Мои привычки'],['limits','🛡️','Мои ограничения'],['goal','🎯','Моя цель по питанию'],['numbers','📊','Мои цифры'],['life','🏡','Мой быт'],['support','🤝','Мои ожидания']];
  const fields = [
    ['routine','breakfast','Завтракаете?','radio','daily:Каждый день|sometimes:Иногда|never:Никогда'],['routine','firstMeal','Когда обычно первый приём пищи?','time',''],['routine','lastMeal','Когда обычно последний приём пищи?','time',''],['routine','snacks','Сколько обычно перекусов?','radio','0:Нет|1:Один|2:Два|3plus:Три и больше'],['routine','trainingMeals','Связываете еду с тренировкой?','radio','before:Ем до|after:Ем после|none:Не привязываю|unknown:Пока не знаю'],
    ['diet','homeFood','Сколько дней в неделю едите домашнюю еду?','radio','7:Семь|5to6:Пять–шесть|3to4:Три–четыре|1to2:Один–два|0:Ни одного'],['diet','outside','Как часто едите в кафе или заказываете доставку?','radio','0:Не ем|1to2:1–2 раза в неделю|3to4:3–4 раза в неделю|5plus:5 и больше раз в неделю'],['diet','protein','Какие источники белка обычно едите?','check','meat:Мясо|fish:Рыба|eggs:Яйца|dairy:Молочные продукты|legumes:Бобовые|soy:Соя|powder:Протеиновый продукт|none:Почти не ем'],['diet','produce','Сколько порций овощей и фруктов обычно в день?','radio','0:Ноль|1to2:Одна–две|3to4:Три–четыре|5plus:Пять и больше|unknown:Не знаю'],['diet','carbs','Какие продукты обычно едите?','check','grains:Крупы|wholegrain:Цельнозерновой хлеб|pasta:Макароны твёрдых сортов|potato:Картофель|none:Почти не ем'],['diet','fats','Какие источники жиров обычно используете?','check','oils:Растительные масла|nuts:Орехи|avocado:Авокадо|fishoil:Рыбий жир|butter:Сливочное масло|none:Почти не использую'],
    ['behaviour','sweets','Как часто едите сладкое?','radio','none:Не ем|rare:Редко|daily:Ежедневно|often:Часто и много'],['behaviour','fastfood','Как часто едите фастфуд?','radio','none:Не ем|1to2:1–2 раза в неделю|3plus:3 и больше раз в неделю|daily:Ежедневно'],['behaviour','drinks','Сладкая газировка или соки','radio','none:Не пью|sometimes:Иногда|daily:Ежедневно'],['behaviour','alcohol','Алкоголь','radio','none:Не пью|holidays:По праздникам|1to2:1–2 раза в неделю|often:Чаще'],['behaviour','coffee','Чашек кофе в день; 0 — не пью','number',''],['behaviour','lateEating','Бывает, что вечером едите больше, чем хотели?','radio','no:Нет|sometimes:Иногда|often:Часто'],['behaviour','screenEating','Едите на ходу или перед экраном?','radio','no:Нет|sometimes:Иногда|often:Постоянно'],
    ['limits','ethics','Дополнительные религиозные ограничения','check','none:Нет|halal:Халяль|kosher:Кошер|other:Другие'],['limits','ethicsOther','Другие ограничения','text',''],['limits','medicalDiet','Есть диета, назначенная специалистом?','check','none:Нет|table5:Стол №5|diabetes:Питание при диабете|gi:Диета при заболеваниях ЖКТ|other:Другая'],['limits','medicalOther','Какая диета назначена? Необязательно','text',''],
    ['goal','extraGoals','Дополнительный ориентир','check','energy:Замечать уровень энергии|comfort:Обсудить пищеварение со специалистом|none:Не ставлю дополнительную цель'],['goal','caloriePlan','Как хотите работать с расчётом калорий?','radio','calculate:Нужен расчёт|own:Есть свой ориентир|unknown:Пока не знаю'],['goal','menus','Какой формат меню был бы удобен?','radio','week:Меню на неделю|day:Меню на день|ideas:Идеи блюд|none:Не нужно'],
    ['numbers','countCalories','Считаете калории сейчас?','radio','yes:Да|sometimes:Иногда|no:Нет'],['numbers','knowCalories','Есть свой ориентир калорий?','radio','yes:Да|no:Нет|want:Хочу узнать'],['numbers','ownCalories','Ваш ориентир, ккал; не меняет расчёт автоматически','number',''],['numbers','macros','Считаете БЖУ сейчас?','radio','yes:Да|no:Нет|protein:Только белок'],['numbers','apps','Какими приложениями пользуетесь?','check','none:Не пользуюсь|mfp:MyFitnessPal|fatsecret:FatSecret|other:Другими'],['numbers','appsOther','Какие приложения?','text',''],['numbers','usualWater','Сколько воды обычно пьёте, л/день? Это не цель.','number',''],
    ['life','cookDays','Когда есть возможность готовить?','radio','daily:Каждый день|few:2–3 раза в неделю|weekends:По выходным|none:Нет времени'],['life','mealPrep','Готовить еду заранее на несколько дней?','radio','yes:Удобно|no:Не подходит|learn:Интересно, но не умею'],['life','workContext','Что влияет на питание на работе?','check','office:Обед в офисе|travel:Командировки|irregular:Ненормированный график|none:Ничего из перечисленного'],
    ['support','consultation','Хотели бы консультацию специалиста по питанию?','radio','yes:Да|no:Нет|unknown:Пока не знаю']
  ];
  const choices = text => text ? text.split('|').map(item=>{const i=item.indexOf(':');return [item.slice(0,i),item.slice(i+1)];}) : [];
  const escape = value => esc(String(value ?? ''));
  function question([,key,title,type,text],answers){
    const options=choices(text),value=answers[key],id='nq-'+key;
    if(type==='radio'||type==='check')return '<fieldset class="nutrition-question" data-nq="'+key+'"><legend>'+title+'</legend>'+options.map(([v,t],i)=>'<label class="chk"><input type="'+(type==='check'?'checkbox':'radio')+'" name="'+id+'" id="'+id+'-'+i+'" data-nq-key="'+key+'" value="'+v+'" '+((type==='check'?Array.isArray(value)&&value.includes(v):value===v)?'checked':'')+'>'+t+'</label>').join('')+'</fieldset>';
    return '<div class="nutrition-question" data-nq="'+key+'"><label for="'+id+'">'+title+'</label><input id="'+id+'" type="'+type+'" '+(type==='number'?'min="0" step="any"':type==='text'?'maxlength="300"':'')+' value="'+escape(value??'')+'"></div>';
  }
  function move(root,id,target){
    const input=root.querySelector('#'+id);if(!input)return;
    const group=input.closest('[data-gqp]');
    if(group){target.appendChild(group);return;}
    const label=root.querySelector('label[for="'+id+'"]');if(label)target.appendChild(label);target.appendChild(input);
  }
  function jump(section,label){return '<button type="button" class="btn s" data-nq-jump="'+section+'">'+label+'</button>';}
  function conditional(root){
    const checked=(key,value)=>!!root.querySelector('[data-nq-key="'+key+'"][value="'+value+'"]:checked');
    for(const [key,show] of Object.entries({ethicsOther:checked('ethics','other'),medicalOther:checked('medicalDiet','other'),appsOther:checked('apps','other'),ownCalories:checked('knowCalories','yes')})){const node=root.querySelector('[data-nq="'+key+'"]');if(node)node.hidden=!show;}
  }
  const previousForm=formView;
  formView=function(){
    const template=document.createElement('template');template.innerHTML=previousForm();
    const root=template.content,block=root.querySelector('#goals-questionnaire-nutrition');if(!block)return template.innerHTML;
    const answers=S.profile?.nutritionQuestionnaire?.answers||{};
    const old=document.createElement('div');old.id='nutrition-legacy-fields';old.hidden=true;
    while(block.firstChild)old.appendChild(block.firstChild);
    old.querySelector('#goals-questionnaire-nutrition-title')?.remove();block.appendChild(old);
    block.insertAdjacentHTML('beforeend','<div class="eyebrow">Блок 2 из 4</div><h2 id="goals-questionnaire-nutrition-title">Питание</h2><p class="mu">Опишите привычный режим. Нет правильных или неправильных ответов; дополнительные вопросы можно пропустить.</p><div class="nutrition-categories">'+cards.map(([key,image,title])=>'<details class="nutrition-category"><summary><span aria-hidden="true">'+image+'</span><span>'+title+'</span><span aria-hidden="true">⌄</span></summary><div data-nq-card="'+key+'">'+fields.filter(f=>f[0]===key).map(f=>question(f,answers)).join('')+'</div></details>').join('')+'</div><p class="subtle">Эта анкета не диагностирует дефициты и заболевания. Медицинская диета указывается по назначению специалиста. Новые ответы пока сохраняются: автоматический подбор меню и уведомления ещё не подключены.</p>');
    const target=key=>block.querySelector('[data-nq-card="'+key+'"]');
    move(root,'gqp-meals',target('routine'));
    const meals=root.querySelector('#gqp-meals');
    if(meals){const value=S.profile?.questionnairePreferences?.answers?.meals;if(value==='2')meals.value='1to2';}
    for(const id of ['gqp-diet','gqp-allergyStatus','gqp-allergyOther','gqp-intolerances','gqp-dislikesOther'])move(root,id,target('limits'));
    for(const key of ['allergens','dislikes']){const node=old.querySelector('[data-gqp="'+key+'"]');if(node)target('limits').appendChild(node);}
    target('limits').insertAdjacentHTML('afterbegin','<p class="subtle">Аллергия и непереносимость — разные ограничения. Лактозу и иные непереносимости укажите в отдельном поле. Стиль питания, включая вегетарианство и веганство, выбирается один раз ниже.</p>');
    const goals=[...old.children].find(node=>node.querySelector('.food-nutrition-goal'));
    if(goals)target('goal').appendChild(goals);
    target('goal').insertAdjacentHTML('afterbegin','<p class="subtle">Основная цель по весу находится в «О вас», а регулярность записей — в привычках. Сохранение ответа о калориях не включает новую диету автоматически.</p>'+jump('about','Изменить основную цель')+jump('habits','Настроить регулярность записей'));
    move(root,'gqp-approach',target('numbers'));
    for(const id of ['gqp-foodSource','gqp-cooking','gqp-budget'])move(root,id,target('life'));
    const advice=root.querySelector('[data-sq="nutritionHelp"]');if(advice)target('support').appendChild(advice);
    target('support').insertAdjacentHTML('afterbegin','<p class="subtle">Метрики, частота напоминаний, каналы и мотивация задаются один раз в общих ожиданиях. Выбор канала не подключает отправку сообщений.</p>'+jump('expectations','Изменить общие ожидания'));
    const palm=[...old.querySelectorAll('details')].find(node=>node.querySelector('summary')?.textContent==='Ваша ладонь');if(palm)target('numbers').appendChild(palm);
    conditional(root);return template.innerHTML;
  };
  document.addEventListener('change',event=>{if(event.target.closest('[data-nq]'))conditional(document);});
  document.addEventListener('click',event=>{const button=event.target.closest('[data-nq-jump]');if(!button)return;const section=button.dataset.nqJump;let target;if(section==='expectations'){target=document.querySelector('[data-sq-card="expectations"]');const details=target?.closest('details');if(details)details.open=true;}else target=document.getElementById('goals-questionnaire-'+section);target?.scrollIntoView({behavior:'smooth',block:'start'});});
  window.foodCollectNutrition=function(profile){
    const answers={};
    for(const [,key,,type,text] of fields){
      const options=choices(text);
      let value=type==='check'?[...document.querySelectorAll('[data-nq-key="'+key+'"]:checked')].map(n=>n.value):type==='radio'?document.querySelector('[data-nq-key="'+key+'"]:checked')?.value||'':document.getElementById('nq-'+key)?.value||'';
      if(type==='check'&&(value.some(v=>!options.some(o=>o[0]===v))||(value.includes('none')&&value.length>1)))throw Error('Выберите «Нет» отдельно от других вариантов');
      if(type==='radio'&&value&&!options.some(o=>o[0]===value))throw Error('Проверьте варианты анкеты питания');
      if(type==='number'&&value!==''){value=Number(value);if(!Number.isFinite(value)||value<0||value>20000)throw Error('Проверьте числовые ответы питания');}
      if(type==='time'&&value&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(value))throw Error('Проверьте время приёма пищи');
      if(type==='text'){if(value.length>300)throw Error('Сократите пояснения до 300 символов');value=value.trim();}
      answers[key]=value;
    }
    if(!answers.ethics.includes('other'))answers.ethicsOther='';
    if(!answers.medicalDiet.includes('other'))answers.medicalOther='';
    if(!answers.apps.includes('other'))answers.appsOther='';
    if(answers.knowCalories!=='yes')answers.ownCalories='';
    if(answers.knowCalories==='yes'&&!(typeof answers.ownCalories==='number'&&answers.ownCalories>0))throw Error('Укажите свой ориентир калорий');
    if(answers.coffee!==''&&answers.coffee>30)throw Error('Проверьте число чашек кофе');
    if(answers.usualWater!==''&&answers.usualWater>20)throw Error('Проверьте объём воды: значение указывается в литрах');
    if(answers.ethics.includes('other')&&!answers.ethicsOther)throw Error('Укажите дополнительные ограничения');
    return {version:1,answers,requiresProfessionalReview:answers.medicalDiet.some(v=>v!=='none')};
  };
  const style=document.createElement('style');style.textContent='#goals-questionnaire-nutrition [hidden]{display:none!important}.nutrition-categories{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.nutrition-category{margin:0!important;padding:0!important;border:1px solid var(--ln)!important;border-radius:18px;align-self:start}.nutrition-category>summary{display:flex;align-items:center;gap:12px;padding:16px;list-style:none}.nutrition-category>summary>span:first-child{font-size:30px;display:grid;place-items:center;min-width:52px;height:52px;border-radius:16px;background:var(--ac2)}.nutrition-category>summary>span:nth-child(2){flex:1}.nutrition-category>summary::-webkit-details-marker{display:none}.nutrition-category>[data-nq-card]{padding:0 16px 16px}.nutrition-question{border:0;margin:14px 0;padding:0}.nutrition-question .chk{display:flex;align-items:flex-start;padding:8px 0}.nutrition-question input[type=radio],.nutrition-question input[type=checkbox]{width:auto;flex:none;margin-top:5px}@media(max-width:700px){.nutrition-categories{grid-template-columns:1fr}}';document.head.appendChild(style);
  render();
})();
