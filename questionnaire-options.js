(() => {
  if(window.foodQuestionnaireOptionsInstalled)return;
  window.foodQuestionnaireOptionsInstalled=true;
  const specs=[
    ['n','protein','diet','Какие источники белка обычно едите?','check','meat:Мясо|fish:Рыба|seafood:Морепродукты|eggs:Яйца|dairy:Молочные продукты|legumes:Бобовые|soy:Соя|nuts:Орехи|powder:Спортивное питание|none:Почти не ем'],
    ['n','carbs','diet','Какие продукты обычно едите?','check','grains:Крупы / каши (овсянка, гречка, рис и т.д.)|wholegrain:Цельнозерновой хлеб / хлебцы|pasta:Макароны (любые)|potato:Картофель (варёный, запечённый)|sweets:Белый хлеб, выпечка, сладости|lowcarb:Стараюсь есть мало углеводов (низкоуглеводная диета)'],
    ['n','fats','diet','Какие источники жиров обычно используете?','check','olive:Оливковое / льняное масло|sunflower:Подсолнечное / кукурузное масло|nuts:Орехи и семечки|fatfish:Жирная рыба (лосось, сельдь, скумбрия)|butter:Сливочное масло / сало / жирное мясо|avocado:Авокадо|none:Почти не использую'],
    ['n','ethics','limits','Дополнительные религиозные и этические ограничения','radio','none:Нет ограничений|halal:Халяль|kosher:Кошер|vegetarian:Вегетарианство|vegan:Веганство|other:Другое'],
    ['n','ethicsOther','limits','Другие ограничения','text',''],
    ['n','medicalDiet','limits','Есть диета, назначенная специалистом?','check','none:Нет, питаюсь как обычно|diabetes:Диабет 1 или 2 типа / Инсулинорезистентность|gi:Проблемы с ЖКТ (гастрит, язва, СРК, панкреатит, рефлюкс)|renal:Болезни почек / печени|other:Другое'],
    ['n','medicalOther','limits','Какая диета назначена?','text',''],
    ['p','diet','limits','Как вы предпочитаете питаться?','radio','mixed:Ем разные продукты (без ограничений)|flexitarian:Гибкое питание (мясо/рыба 1–2 раза в неделю)|pescatarian:Пескетарианство (ем рыбу, без мяса)|vegetarian:Вегетарианство (без мяса и рыбы, но с яйцами и молочным)|vegan:Веганство (полностью растительное питание)'],
    ['p','dislikes','limits','Что вы не любите? Это предпочтение, не аллергия.','check','meat:Мясо|fish:Рыба и морепродукты|eggs:Яйца|dairy:Молочные продукты (молоко, сыр)|curd:Творог|legumes:Бобовые (фасоль, горох, чечевица)|liver:Печень / субпродукты|buckwheat:Гречка / овсянка|broccoli:Брокколи|vegetables:Лук / грибы / помидоры|other:Другое'],
    ['p','dislikesOther','limits','Другие нелюбимые продукты','text',''],
    ['n','extraGoals','goal','Дополнительный ориентир','check','energy:Уровень энергии и бодрости|comfort:Комфорт пищеварения (вздутие, тяжесть)|glucose:Контроль сахара в крови|skin:Улучшение качества кожи/волос|none:Не ставлю дополнительную цель'],
    ['n','macros','numbers','Считаете БЖУ сейчас?','radio','yes:Да, считаю калории и БЖУ|calories:Считаю только калории (без БЖУ)|protein:Считаю только белок|no:Нет, никогда не считал(а)|learn:Нет, но хочу научиться это делать'],
    ['p','approach','numbers','Как удобнее следить за питанием?','radio','macros:Калории и БЖУ (точный подсчёт в граммах)|portions:Визуальные порции (без весов: ладонь, кулак и т.д.)|photo:Фотографировать еду (приблизительная оценка ИИ с проверкой)|logging:Просто вести дневник (записывать, что съел, без подсчёта цифр)'],
    ['n','weakSpots','behaviour','Есть ли у вас «слабые места» в питании?','check','sweets:Сладкое / выпечка|evening:Вечерние перекусы / «зажоры»|fastfood:Фастфуд / снеки|alcohol:Алкоголь|drinks:Сладкие напитки / газировка|onTheGo:Еда на ходу / переедание в гостях|none:Нет проблем, питаюсь осознанно'],
    ['s','primaryGoal','goal','Какова ваша основная спортивная цель?','radio','lose:Похудеть / Сжечь жир|muscle:Набор мышц|strength:Стать сильнее|endurance:Развить выносливость|activity:Больше двигаться|health:Поддерживать форму / Здоровье|recovery:Восстановление после травм'],
    ['s','tried','experience','Что уже пробовали?','check','machines:Тренажёры в зале|weights:Свободные веса (гантели, штанга)|groups:Групповые занятия (фитнес, йога, пилатес)|cardio:Кардиозона (дорожка, эллипс, велотренажёр)|pool:Бассейн / Аквааэробика|home:Домашние тренировки (по видео/приложениям)|outdoor:Уличные тренировки (воркаут, бег, ходьба)|none:Пока нет опыта (новичок)'],
    ['s','daysCount','rhythm','Сколько занятий в неделю реально выделить?','radio','1:Одно|2:Два|3:Три|4:Четыре|5plus:5 и более'],
    ['s','metrics','expectations','Что хотите отслеживать?','check','weight:Вес|measurements:Обхваты (грудь, талия, бедра)|photos:Фото прогресса тела|strength:Силовые показатели (рабочие веса и повторения)|steps:Шаги / Активность|nutrition:Питание (калории и БЖУ)|sleep:Сон (часы и качество)|wellbeing:Самочувствие и уровень энергии|none:Ничего из этого, просто вести дневник'],
    ['s','weighFrequency','expectations','Как часто хотите взвешиваться?','radio','daily:Ежедневно|weekly:Раз в неделю|monthly:Раз в месяц|flexible:Без фиксированного графика']
  ];
  const options=s=>s? s.split('|').map(v=>{const i=v.indexOf(':');return [v.slice(0,i),v.slice(i+1)];}):[];
  const source=(scope)=>scope==='n'?S.profile?.nutritionQuestionnaire?.answers||{}:scope==='p'?S.profile?.questionnairePreferences?.answers||{}:S.profile?.sportQuestionnaire?.answers||{};
  function initial(scope,key){
    let v=source(scope)[key];
    if(scope==='n'&&key==='ethics'&&Array.isArray(v))v=v.length===1?v[0]:'';
    if(scope==='s'&&key==='daysCount'&&v==='5')v='5plus';
    return v;
  }
  const groupId=(scope,key)=>'q2-'+scope+'-'+key;
  function build(spec,value){
    const [scope,key,,title,type,text]=spec,id=groupId(scope,key),node=document.createElement('fieldset');
    node.id=id;node.className=scope==='s'?'sport-question':'nutrition-question';node.dataset.q2=scope+':'+key;
    node.setAttribute(scope==='n'?'data-nq':scope==='p'?'data-gqp':'data-sq',key);
    const legend=document.createElement('legend');legend.textContent=title;node.appendChild(legend);
    if(type==='text'){
      const input=document.createElement('input');input.type='text';input.maxLength=300;input.value=typeof value==='string'?value:'';input.dataset.q2Input='';input.setAttribute('aria-label',title);node.appendChild(input);
    }else for(const [v,label] of options(text)){
      const row=document.createElement('label'),input=document.createElement('input');row.className='chk';input.type=type==='check'?'checkbox':'radio';input.name=id;input.value=v;input.dataset.q2Input='';input.checked=type==='check'?Array.isArray(value)&&value.includes(v):value===v;row.append(input,document.createTextNode(label));node.appendChild(row);
    }
    const hints={fats:'Разные масла отличаются составом жирных кислот. Важны общий рацион и количество; выбор ответа сам по себе не доказывает избыток или дефицит.',extraGoals:'Это пожелания для анализа анкеты, а не диагностика. Приложение не измеряет сахар в крови, не определяет причины симптомов и не гарантирует изменения кожи или волос. При диабете и симптомах ориентируйтесь на рекомендации специалиста.',primaryGoal:'Цель сохраняется для анализа анкеты. Генератор тренировок автоматически не перенастраивается. Восстановление после травм и допустимую нагрузку согласуйте со специалистом; приложение не назначает ЛФК.',daysCount:'«5 и более» — пожелание по частоте занятий. Действующий генератор по-прежнему ограничен пятью днями; эта анкета не расширяет программу автоматически.',weakSpots:'Можно выбрать несколько вариантов. Это самооценка привычек, без осуждения и диагнозов.'};
    if(hints[key]){const p=document.createElement('p');p.className='subtle';p.textContent=hints[key];node.appendChild(p);}
    return node;
  }
  function read(spec){
    const [scope,key,,,type,text]=spec,node=document.getElementById(groupId(scope,key));
    if(!node)return type==='check'?[]:'';
    if(type==='text'){const v=node.querySelector('input').value.trim();if(v.length>300)throw Error('Сократите пояснение до 300 символов');return v;}
    const values=[...node.querySelectorAll('input:checked')].map(n=>n.value),allowed=options(text).map(x=>x[0]);
    if(values.some(v=>!allowed.includes(v))||(type==='radio'&&values.length>1)||(values.includes('none')&&values.length>1))throw Error('Выберите вариант «Нет» отдельно от других ответов');
    return type==='check'?values:values[0]||'';
  }
  function readAll(){
    const result={n:{},p:{},s:{}};for(const spec of specs)result[spec[0]][spec[1]]=read(spec);
    if(result.n.ethics!=='other')result.n.ethicsOther='';
    if(!result.n.medicalDiet.includes('other'))result.n.medicalOther='';
    if(!result.p.dislikes.includes('other'))result.p.dislikesOther='';
    if(!result.s.metrics.includes('weight'))result.s.weighFrequency='';
    return result;
  }
  function conditional(){
    const is=(scope,key,v)=>!!document.getElementById(groupId(scope,key))?.querySelector('input[value="'+v+'"]:checked');
    for(const [scope,key,visible] of [['n','ethicsOther',is('n','ethics','other')],['n','medicalOther',is('n','medicalDiet','other')],['p','dislikesOther',is('p','dislikes','other')],['s','weighFrequency',is('s','metrics','weight')]]){const node=document.getElementById(groupId(scope,key));if(node)node.hidden=!visible;}
  }
  function update(){
    if(!document.getElementById('goals-questionnaire-nutrition')||document.getElementById('q2-n-protein'))return;
    for(const spec of specs){
      const [scope,key,card]=spec,root=document.getElementById('goals-questionnaire-'+(scope==='s'?'sport':'nutrition'));if(!root)continue;
      const old=key==='primaryGoal'?root.querySelector('#sp-goal'):root.querySelector('['+(scope==='n'?'data-nq':scope==='p'?'data-gqp':'data-sq')+'="'+key+'"]');
      if(old){old.hidden=true;if(key==='primaryGoal'){const label=root.querySelector('label[for="sp-goal"]');if(label)label.hidden=true;}}
      const node=build(spec,initial(scope,key));
      if(old)old.after(node);else root.querySelector('['+(scope==='s'?'data-sq-card':'data-nq-card')+'="'+card+'"]')?.appendChild(node);
    }
    conditional();
  }
  document.addEventListener('change',event=>{
    const input=event.target,group=input.closest?.('[data-q2]');if(!group)return;
    if(input.type==='checkbox'&&input.checked)group.querySelectorAll('input[type=checkbox]').forEach(other=>{if(other!==input&&(input.value==='none'||other.value==='none'))other.checked=false;});
    conditional();
  });
  const previousNutrition=window.foodCollectNutrition;
  window.foodCollectNutrition=function(profile){
    if(!document.getElementById('q2-n-protein'))return previousNutrition(profile);
    const next=readAll(),base=previousNutrition(profile);
    if(next.n.ethics==='other'&&!next.n.ethicsOther)throw Error('Укажите другие религиозные или этические ограничения');
    if(next.n.medicalDiet.includes('other')&&!next.n.medicalOther)throw Error('Укажите назначенную диету');
    if(next.p.dislikes.includes('other')&&!next.p.dislikesOther)throw Error('Укажите другие нелюбимые продукты');
    profile.questionnairePreferences={...profile.questionnairePreferences,answers:{...profile.questionnairePreferences?.answers,...next.p}};
    return {...base,version:2,previousAnswers:base.previousAnswers||source('n'),answers:{...base.answers,...next.n},requiresProfessionalReview:next.n.medicalDiet.some(v=>v!=='none')};
  };
  const previousSport=window.foodCollectSport;
  window.foodCollectSport=function(profile,sportsProfile){
    if(!document.getElementById('q2-s-primaryGoal'))return previousSport(profile,sportsProfile);
    const next=readAll(),legacy=document.getElementById('sq-daysCount'),value=legacy?.value;
    let base;
    try{if(legacy)legacy.value=next.s.daysCount==='5plus'?'':next.s.daysCount;base=previousSport(profile,sportsProfile);}finally{if(legacy)legacy.value=value;}
    const answers={...base.answers,...next.s};
    sportsProfile.questionnaireAnswers=answers;
    return {...base,version:2,answers};
  };
  const previousRender=render;render=function(){previousRender();update()};
  update();
})();
