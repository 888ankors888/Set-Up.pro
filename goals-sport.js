(() => {
  const cards = [['goal','🎯','Моя цель'],['experience','🏋️','Мой опыт'],['health','🩺','Моё здоровье'],['rhythm','📅','Мой ритм'],['energy','⚡','Моя энергия'],['format','❤️','Мой формат'],['expectations','📈','Мои ожидания']];
  const fields = [
    ['goal','priority','Что для вас важнее?','radio','health:Здоровье|appearance:Внешний вид|numbers:Измеримый результат|enjoyment:Удовольствие от занятий'],
    ['goal','event','Есть событие или срок?','radio','no:Нет|yes:Да'],['goal','eventDate','Дата события','date',''],['goal','eventName','Что за событие?','text',''],
    ['experience','experience','Как долго вы тренируетесь?','radio','novice:До 3 месяцев|starter:3–12 месяцев|intermediate:1–3 года|advanced:Более 3 лет'],
    ['experience','previous','Занимались спортом раньше?','radio','no:Нет|yes:Да'],['experience','previousDetails','Каким спортом и сколько лет?','text',''],
    ['experience','tried','Что уже пробовали?','check','machines:Тренажёры|weights:Свободные веса|groups:Групповые занятия|cardio:Кардиозону|pool:Бассейн'],
    ['experience','technique','Насколько уверены в базовой технике?','radio','confident:Уверенно|partial:Частично|help:Нужен разбор'],
    ['health','limitations','Есть ограничения именно для движений?','check','back:Спина|knees:Колени|joints:Суставы|breathing:Дыхание|other:Другие'],
    ['health','limitationsOther','Какие ещё ограничения учитывать?','text',''],
    ['health','injury','Были травмы или операции за последние 2 года?','radio','no:Нет|yes:Да|unknown:Не уверен'],['health','injuryDetails','Какие? Необязательно','text',''],
    ['health','doctor','Обсуждали нагрузки с врачом?','radio','yes:Да|no:Нет|planned:Планирую консультацию'],
    ['health','cardio','Есть противопоказания к кардио?','radio','no:Нет известных|yes:Да|unknown:Не знаю'],
    ['rhythm','daysCount','Сколько занятий в неделю реально выделить?','select','1:Одно|2:Два|3:Три|4:Четыре|5:Пять'],
    ['energy','afterWorkEnergy','Как вы чувствуете себя после обычного рабочего дня?','radio','energized:Полон(а) сил, могу еще тренироваться|tired:Устаю, но легкая тренировка взбодрит|exhausted:Очень устаю, сил хватает только на диван'],
    ['format','avoid','Что не нравится?','check','running:Бег|squats:Приседания|plank:Планка|groups:Групповые занятия|steady:Однообразное кардио|other:Другое'],['format','avoidOther','Какие ещё нагрузки не нравятся?','text',''],
    ['format','coach','Нужна помощь тренера?','radio','always:Постоянно|sometimes:Периодически|independent:Справляюсь самостоятельно'],
    ['expectations','metrics','Что хотите отслеживать?','check','weight:Вес|measurements:Обхваты|photos:Фото|strength:Силовые показатели|steps:Шаги|wellbeing:Самочувствие'],
    ['expectations','reminders','Как часто хотели бы получать напоминания?','radio','daily:Ежедневно|three:Три раза в неделю|weekly:Раз в неделю|none:Не напоминать'],
    ['expectations','channels','Какой канал был бы удобен?','check','push:Push|email:Email|messenger:Telegram / WhatsApp|call:Звонок'],
    ['expectations','motivation','Что помогает продолжать?','check','numbers:Цифры прогресса|streak:Серия дней|badges:Награды|coach:Поддержка тренера|community:Сообщество']
  ];
  const choices = text => text ? text.split('|').map(item => { const i=item.indexOf(':'); return [item.slice(0,i),item.slice(i+1)]; }) : [];
  const escape = value => esc(String(value ?? ''));
  function question([,key,title,type,text], answers) {
    const options=choices(text), value=answers[key], id='sq-'+key;
    if (type==='radio' || type==='check') return '<fieldset class="sport-question" data-sq="'+key+'"><legend>'+title+'</legend>'+options.map(([v,t],i)=>'<label class="chk"><input type="'+(type==='check'?'checkbox':'radio')+'" name="'+id+'" id="'+id+'-'+i+'" data-sq-key="'+key+'" value="'+v+'" '+((type==='check'?Array.isArray(value)&&value.includes(v):value===v)?'checked':'')+'>'+t+'</label>').join('')+'</fieldset>';
    const control=type==='select'?'<select id="'+id+'"><option value="">Пока пропустить</option>'+options.map(([v,t])=>'<option value="'+v+'" '+(value===v?'selected':'')+'>'+t+'</option>').join('')+'</select>':'<input id="'+id+'" type="'+type+'" '+(type==='text'?'maxlength="300"':'')+' value="'+escape(value||'')+'">';
    return '<div class="sport-question" data-sq="'+key+'"><label for="'+id+'">'+title+'</label>'+control+'</div>';
  }
  function link(section,label) { return '<button type="button" class="btn s" data-sq-jump="'+section+'">'+label+'</button>'; }
  function move(root,id,target) {
    const input=root.querySelector('#'+id);
    if(!input)return;
    const label=root.querySelector('label[for="'+id+'"]');
    if(label)target.appendChild(label);
    if(input.parentElement?.tagName==='LABEL')target.appendChild(input.parentElement);else target.appendChild(input);
  }
  function conditional(root) {
    const selected=key=>root.querySelector('[data-sq-key="'+key+'"]:checked')?.value;
    for(const [key,show] of Object.entries({eventDate:selected('event')==='yes',eventName:selected('event')==='yes',previousDetails:selected('previous')==='yes',injuryDetails:selected('injury')==='yes',limitationsOther:!!root.querySelector('[data-sq-key="limitations"][value="other"]:checked'),avoidOther:!!root.querySelector('[data-sq-key="avoid"][value="other"]:checked')})) {
      const node=root.querySelector('[data-sq="'+key+'"]');if(node)node.hidden=!show;
    }
  }
  const previousForm=formView;
  formView=function(){
    const template=document.createElement('template');template.innerHTML=previousForm();
    const root=template.content,block=root.querySelector('#goals-questionnaire-sport');if(!block)return template.innerHTML;
    const stored=S.profile?.sportQuestionnaire?.answers || {};
    const answers={...stored};
    if(!answers.experience)answers.experience=({beginner:'novice',regular:'intermediate',experienced:'advanced'})[S.sports?.profile?.level];
    const old=document.createElement('div');old.hidden=true;old.id='sports-legacy-fields';
    while(block.firstChild)old.appendChild(block.firstChild);
    old.querySelector('#goals-questionnaire-sport-title')?.remove();block.appendChild(old);
    block.insertAdjacentHTML('beforeend','<div class="eyebrow">Блок 3 из 4</div><h2 id="goals-questionnaire-sport-title">Спорт</h2><p class="mu">Откройте нужную карточку. Общие данные не нужно заполнять повторно.</p><div class="sport-categories">'+cards.map(([key,image,title])=>'<details class="sport-category"><summary><span aria-hidden="true">'+image+'</span><span>'+title+'</span><span aria-hidden="true">⌄</span></summary><div data-sq-card="'+key+'">'+fields.filter(f=>f[0]===key).map(f=>question(f,answers)).join('')+'</div></details>').join('')+'</div><p class="subtle">Новые пожелания пока сохраняются, но не все передаются генератору. Реабилитация, HIIT, бассейн и связь с тренером не добавляются автоматически. Напоминания и каналы связи — пока предпочтения, не подключённые услуги.</p>');
    const target=key=>block.querySelector('[data-sq-card="'+key+'"]');
    target('goal').insertAdjacentHTML('afterbegin','<p class="subtle">Вес и общий ориентир задаются в «О вас». Здесь выберите направление тренировок.</p>');
    move(root,'sp-goal',target('goal'));
    move(root,'sp-restrictions',target('health'));
    target('health').insertAdjacentHTML('afterbegin','<p class="subtle">Общие сведения о здоровье находятся в «О вас». Этот блок уточняет ограничения нагрузки, а не ставит диагноз.</p>'+link('about','Изменить общие ограничения'));
    for(const id of ['sp-minutes','sp-place','gqp-sportTime'])move(root,id,target('rhythm'));
    old.querySelectorAll('.sp-day').forEach(input=>{const label=input.closest('label');if(label)target('rhythm').appendChild(label);});
    target('energy').insertAdjacentHTML('beforeend','<p class="subtle">Выберите один вариант. Ответ учитывается в ИИ-анализе при рекомендациях по интенсивности. Автоматический подбор интенсивности программы по этому ответу пока не подключён.</p>');
    for(const id of ['gqp-activities','gqp-company']){
      const node=old.querySelector('[data-gqp="'+id.slice(4)+'"]');if(node)target('format').appendChild(node);
    }
    const enable=old.querySelector('#sp-enabled');if(enable)block.querySelector('.sport-categories').before(enable.closest('label')||enable);
    conditional(root);return template.innerHTML;
  };
  document.addEventListener('change',event=>{if(event.target.closest('[data-sq]'))conditional(document);});
  document.addEventListener('click',event=>{const button=event.target.closest('[data-sq-jump]');if(!button)return;const target=document.getElementById('goals-questionnaire-'+button.dataset.sqJump);target?.scrollIntoView({behavior:'smooth',block:'start'});});
  window.foodCollectSport=function(profile,sportsProfile){
    const answers={...(profile?.sportQuestionnaire?.answers || {})};
    for(const [,key,,type,text] of fields){
      const options=choices(text);
      const value=type==='check'?[...document.querySelectorAll('[data-sq-key="'+key+'"]:checked')].map(n=>n.value):type==='radio'?document.querySelector('[data-sq-key="'+key+'"]:checked')?.value||'':document.getElementById('sq-'+key)?.value||'';
      if(type==='check' && value.some(v=>!options.some(o=>o[0]===v)))throw Error('Проверьте варианты спортивной анкеты');
      if(['radio','select'].includes(type)&&value&&!options.some(o=>o[0]===value))throw Error('Проверьте варианты спортивной анкеты');
      if(typeof value==='string'&&value.length>300)throw Error('Сократите пояснения до 300 символов');
      answers[key]=typeof value==='string'?value.trim():value;
    }
    if(answers.event!=='yes'){answers.eventDate='';answers.eventName='';}
    if(answers.previous!=='yes')answers.previousDetails='';
    if(answers.injury!=='yes')answers.injuryDetails='';
    if(!answers.limitations.includes('other'))answers.limitationsOther='';
    if(!answers.avoid.includes('other'))answers.avoidOther='';
    if(answers.event==='yes'&&(!/^\d{4}-\d{2}-\d{2}$/.test(answers.eventDate)||dk(dt(answers.eventDate))!==answers.eventDate||answers.eventDate<today()))throw Error('Укажите корректную дату будущего события');
    if(answers.daysCount && sportsProfile.enabled && Number(answers.daysCount)!==sportsProfile.days.length)throw Error('Количество занятий должно совпадать с выбранными днями');
    if(answers.experience)sportsProfile.level=({novice:'beginner',starter:'beginner',intermediate:'regular',advanced:'experienced'})[answers.experience];
    if(answers.limitations.length||answers.injury==='yes'||answers.cardio==='yes')sportsProfile.restrictions='yes';
    else if(answers.injury==='unknown'||answers.cardio==='unknown')sportsProfile.restrictions=sportsProfile.restrictions==='yes'?'yes':'unsure';
    sportsProfile.questionnaireAnswers=answers;
    return {version:1,answers};
  };
  const previousGenerate=window.sportsGenerate;
  if(typeof previousGenerate==='function')window.sportsGenerate=function(...args){
    const answers=S.profile?.sportQuestionnaire?.answers;
    if(!answers || !answers.injury || !answers.cardio){toast('Перед генерацией заполните вопросы о травмах и противопоказаниях в «Моих целях»');return;}
    return previousGenerate.apply(this,args);
  };
  const style=document.createElement('style');
  style.textContent='#goals-questionnaire-sport [hidden]{display:none!important}.sport-categories{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.sport-category{margin:0!important;padding:0!important;border:1px solid var(--ln)!important;border-radius:18px;align-self:start}.sport-category>summary{display:flex;align-items:center;gap:12px;padding:16px;list-style:none}.sport-category>summary>span:first-child{font-size:30px;display:grid;place-items:center;min-width:52px;height:52px;border-radius:16px;background:var(--ac2)}.sport-category>summary>span:nth-child(2){flex:1}.sport-category>summary::-webkit-details-marker{display:none}.sport-category>[data-sq-card]{padding:0 16px 16px}.sport-question{border:0;margin:14px 0;padding:0}.sport-question .chk{display:flex;align-items:flex-start;padding:8px 0}.sport-question input[type=radio],.sport-question input[type=checkbox]{width:auto;flex:none;margin-top:5px}@media(max-width:700px){.sport-categories{grid-template-columns:1fr}}';document.head.appendChild(style);
  render();
})();
