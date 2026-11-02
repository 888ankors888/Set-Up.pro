(() => {
  let busy=false;
  const titles=['🔎 Оценка','🥗 Рекомендации','💚 Мотивация'];
  const val=id=>document.getElementById(id)?.value||'';
  function collect(){
    const about={sex:val('sex'),age:Number(val('age')),height:Number(val('h')),weight:Number(val('w')),target_weight:Number(val('tw')),goal:val('goal'),activity:Number(val('act')),body_goal:val('food-body-goal'),health:[...document.querySelectorAll('.hl:checked')].map(n=>n.value)};
    if(!['f','m'].includes(about.sex)||!Number.isInteger(about.age)||about.age<10||about.age>120||about.height<=100||about.height>250||about.weight<=25||about.weight>=400||about.target_weight<=25||about.target_weight>=400||!['lose','gain','maintain'].includes(about.goal))throw Error('Заполните корректно возраст, пол, рост, текущий и целевой вес, цель в «О вас».');
    const root=document.getElementById('goals-questionnaire-nutrition'),nutrition={};
    root?.querySelectorAll('[data-nq],[data-gqp]').forEach(group=>{
      if(group.closest('[hidden]'))return;
      const title=group.querySelector('legend,label')?.textContent.trim();
      if(!title)return;
      const select=group.querySelector('select');
      let answer;
      if(select)answer=select.value?select.selectedOptions[0].textContent.trim():'';
      else if(group.querySelector('input[type=checkbox],input[type=radio]'))answer=[...group.querySelectorAll('input:checked')].map(n=>n.closest('label')?.textContent.trim()||n.value);
      else answer=group.querySelector('input,textarea')?.value.trim()||'';
      if(Array.isArray(answer)?answer.length:answer)nutrition[title]=answer;
    });
    if(!val('gqp-meals')||!root?.querySelector('[data-nq-key="protein"]:checked')||!root?.querySelector('[data-nq-key="produce"]:checked'))throw Error('В «Питании» укажите режим приёмов пищи, источники белка и количество овощей/фруктов. Остальные ответы уточнят анализ.');
    if(!val('gqp-allergyStatus')||!val('gqp-diet'))throw Error('Укажите стиль питания и статус аллергии, включая «Не знаю», если он неизвестен.');
    if(val('gqp-allergyStatus')==='listed'&&!root.querySelector('[data-gqp-key="allergens"]:checked'))throw Error('Укажите аллергены.');
    root.querySelectorAll('[data-nq]').forEach(group=>{const a=[...group.querySelectorAll('input:checked')].map(n=>n.value);if(a.includes('none')&&a.length>1)throw Error('Выберите «Нет» отдельно от других вариантов.');});
    if(window.foodCollectNutrition)window.foodCollectNutrition({});
    return {about,nutrition};
  }
  function show(node,text,error=false){node.hidden=false;node.setAttribute('aria-live','polite');node.replaceChildren();const p=document.createElement('p');p.textContent=text;p.style.color=error?'var(--danger, #b42318)':'';node.appendChild(p);}
  document.addEventListener('click',async event=>{
    const button=event.target.closest?.('#nutrition-ai-button');if(!button)return;
    event.preventDefault();event.stopImmediatePropagation();if(busy)return;
    const node=document.getElementById('nutrition-ai-result');if(!node)return;
    let data;try{data=collect()}catch(e){show(node,e.message,true);return}
    if(!confirm('Отправить текущие ответы «О вас» и «Питание», включая возраст, рост, вес, цель и ограничения здоровья, в GigaChat для анализа? Анкета не сохраняется автоматически.'))return;
    const signature=JSON.stringify(data),controller=new AbortController(),timer=setTimeout(()=>controller.abort(),110000);
    const label=button.textContent;busy=true;button.disabled=true;button.textContent='✨ Анализирую питание…';show(node,'Готовим персональный разбор…');
    try{
      const response=await fetch('https://food-pro-api.onrender.com/api/goals/nutrition-analysis',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',body:signature,signal:controller.signal});
      const r=await response.json().catch(()=>null);
      if(!response.ok)throw Error(({404:'Маршрут анализа ещё не опубликован на сервере.',422:'Проверьте заполнение анкеты.',429:'Сервер занят или достигнут лимит. Повторите позже.',502:'ИИ не сформировал корректный ответ до 1000 символов. Повторите позже.',503:'ИИ временно недоступен.'})[response.status]||'Ошибка сервера. Попробуйте позже.');
      const parts=['assessment','recommendations','motivation'].map(k=>r?.[k]);
      if(parts.some(v=>typeof v!=='string'||!v.trim()))throw Error('Некорректный ответ ИИ.');
      const text=titles.map((t,i)=>t+'\n'+parts[i]).join('\n\n');
      if(r.source!=='gigachat'||r.text!==text||Array.from(text).length>1000)throw Error('Ответ ИИ не соответствует формату или лимиту.');
      if(!document.contains(node)||JSON.stringify(collect())!==signature)throw Error('Анкета изменилась. Повторите анализ по новым ответам.');
      node.replaceChildren();parts.forEach((part,i)=>{const h=document.createElement('h3'),p=document.createElement('p');h.textContent=titles[i];p.textContent=part;p.style.whiteSpace='pre-wrap';node.append(h,p)});
      const note=document.createElement('small');note.textContent=Array.from(text).length+'/1000 символов · GigaChat · Общий ориентир, не медицинская консультация.';node.appendChild(note);node.scrollIntoView({behavior:'smooth',block:'nearest'});
    }catch(e){show(node,e.name==='AbortError'?'Время ожидания истекло. Повторите позже.':e instanceof TypeError?'Не удалось связаться с сервером. Повторите позже.':e.message,true)}
    finally{clearTimeout(timer);busy=false;button.disabled=false;button.textContent=label}
  },true);
  const update=()=>{const button=document.getElementById('nutrition-ai-button'),hint=button?.nextElementSibling;if(button){button.disabled=busy;button.title='Анализ текущих ответов через GigaChat'}if(hint?.classList.contains('subtle'))hint.textContent='По нажатию и с вашего подтверждения текущие ответы «О вас» и «Питание» передаются GigaChat. Анализ не заменяет консультацию специалиста.';};
  const previous=render;render=function(){previous();update()};update();
})();
