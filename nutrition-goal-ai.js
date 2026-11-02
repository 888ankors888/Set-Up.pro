(() => {
  const busy={nutrition:false,sport:false};
  const titles={nutrition:['🔎 Оценка','🥗 Рекомендации','💚 Мотивация'],sport:['🔎 Оценка','🏋️ Рекомендации','💚 Мотивация']};
  const val=id=>(document.getElementById(id)?.value||'').trim();
  function collectAbout(){
    const about={};
    for(const [key,id,lo,hi,integer] of [['age','age',10,120,true],['height','h',100.1,250],['weight','w',25.1,399.9],['target_weight','tw',25.1,399.9],['activity','act',1,2]]){
      const raw=val(id);if(!raw)continue;
      const n=Number(raw);
      if(!Number.isFinite(n)||n<lo||n>hi||(integer&&!Number.isInteger(n)))throw Error('Проверьте введённые числовые данные «О вас». Пустые поля можно пропустить.');
      about[key]=n;
    }
    for(const [key,id,allowed] of [['sex','sex',['f','m']],['goal','goal',['lose','gain','maintain']],['body_goal','food-body-goal',['lose','gain','recomp','maintain','reverse','cut']]]){
      const v=val(id);if(!v)continue;
      if(!allowed.includes(v))throw Error('Проверьте выбранные данные «О вас».');
      about[key]=v;
    }
    const health=[...document.querySelectorAll('.hl:checked')].map(n=>n.value);if(health.length)about.health=health;
    return about;
  }
  function collectNutrition(){
    const root=document.getElementById('goals-questionnaire-nutrition'),nutrition={};
    root?.querySelectorAll('[data-nq],[data-gqp]').forEach(group=>{
      if(group.closest('[hidden]'))return;
      const title=group.querySelector('legend,label')?.textContent.trim();if(!title)return;
      const select=group.querySelector('select');let answer;
      if(select)answer=select.value?select.selectedOptions[0].textContent.trim():'';
      else if(group.querySelector('input[type=checkbox],input[type=radio]')){
        const inputs=[...group.querySelectorAll('input:checked')];
        if(inputs.some(n=>n.value==='none')&&inputs.length>1)throw Error('Выберите «Нет» отдельно от других вариантов.');
        answer=inputs.map(n=>n.closest('label')?.textContent.trim()||n.value);
      }else answer=group.querySelector('input,textarea')?.value.trim()||'';
      if(Array.isArray(answer)?answer.length:answer)nutrition[title]=answer;
    });
    return nutrition;
  }
  function collectSport(){
    const root=document.getElementById('goals-questionnaire-sport'),sport={},seen=new Set();
    if(!root)throw Error('Спортивная анкета не найдена.');
    root.querySelectorAll('input,select,textarea').forEach(input=>{
      if(input.disabled||input.type==='hidden'||input.closest('[hidden]'))return;
      const group=input.closest('[data-sq],[data-gqp]');
      if(group){
        if(seen.has(group))return;seen.add(group);
        const title=group.querySelector('legend,label')?.textContent.trim();if(!title)return;
        const select=group.querySelector('select');let answer;
        if(select)answer=select.value?select.selectedOptions[0].textContent.trim():'';
        else if(group.querySelector('input[type=checkbox],input[type=radio]'))answer=[...group.querySelectorAll('input:checked')].map(n=>n.closest('label')?.textContent.trim()||n.value);
        else answer=group.querySelector('input,textarea')?.value.trim()||'';
        if(Array.isArray(answer)?answer.length:answer)sport[title]=answer;
        return;
      }
      if(input.type==='checkbox'){
        if(input.id==='sp-enabled')sport['Спортивная программа включена']=input.checked?'Да':'Нет';
        else if(input.checked&&input.classList.contains('sp-day'))(sport['Доступные дни']??=[]).push(input.closest('label')?.textContent.trim()||input.value);
        return;
      }
      if(input.type==='radio'&&!input.checked)return;
      const answer=input.tagName==='SELECT'?(input.value?input.selectedOptions[0].textContent.trim():''):input.value.trim();
      if(!answer)return;
      const label=input.id?root.querySelector('label[for="'+CSS.escape(input.id)+'"]'):null;
      const title=label?.textContent.trim()||input.closest('label')?.textContent.trim()||input.id;
      if(title)sport[title]=answer;
    });
    return sport;
  }
  const collect=kind=>({about:collectAbout(),[kind]:kind==='sport'?collectSport():collectNutrition()});
  function show(node,text,error=false){node.hidden=false;node.setAttribute('aria-live','polite');node.replaceChildren();const p=document.createElement('p');p.textContent=text;p.style.color=error?'var(--danger, #b42318)':'';node.appendChild(p);}
  document.addEventListener('click',async event=>{
    const button=event.target.closest?.('#nutrition-ai-button,#sport-ai-button');if(!button)return;
    const kind=button.id==='sport-ai-button'?'sport':'nutrition';
    event.preventDefault();event.stopImmediatePropagation();if(busy[kind])return;
    const node=document.getElementById(kind+'-ai-result');if(!node)return;
    let data;try{data=collect(kind)}catch(e){show(node,e.message,true);return}
    const consent=kind==='sport'?'Отправить текущие ответы «О вас» и спортивной анкеты, включая введённые ограничения и сведения о здоровье, в GigaChat для анализа? Пустые пункты пропускаются. Анкета не сохраняется, программа тренировок не создаётся и не изменяется.':'Отправить заполненные ответы «О вас» и «Питание», в том числе введённые сведения о здоровье, в GigaChat? Пустые пункты будут пропущены; без данных ответ будет общим. Анкета не сохраняется автоматически.';
    if(!confirm(consent))return;
    const signature=JSON.stringify(data),controller=new AbortController(),timer=setTimeout(()=>controller.abort(),110000);
    const label=button.textContent;busy[kind]=true;button.disabled=true;button.textContent=kind==='sport'?'✨ Анализирую спортивную анкету…':'✨ Анализирую питание…';show(node,'Готовим разбор по доступным данным…');
    try{
      const response=await fetch('https://food-pro-api.onrender.com/api/goals/'+kind+'-analysis',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',body:signature,signal:controller.signal});
      const r=await response.json().catch(()=>null);
      if(!response.ok)throw Error(({404:'Маршрут анализа ещё не опубликован на сервере.',422:'Проверьте корректность введённых значений. Пустые поля допустимы.',429:'Сервер занят или достигнут лимит. Повторите позже.',502:'ИИ не сформировал корректный ответ до 1000 символов. Повторите позже.',503:'ИИ временно недоступен.'})[response.status]||'Ошибка сервера. Попробуйте позже.');
      const parts=['assessment','recommendations','motivation'].map(k=>r?.[k]);
      if(parts.some(v=>typeof v!=='string'||!v.trim()))throw Error('Некорректный ответ ИИ.');
      const text=titles[kind].map((t,i)=>t+'\n'+parts[i]).join('\n\n');
      if(r.source!=='gigachat'||r.text!==text||Array.from(text).length>1000)throw Error('Ответ ИИ не соответствует формату или лимиту.');
      if(!document.contains(node)||JSON.stringify(collect(kind))!==signature)throw Error('Анкета изменилась. Повторите анализ по новым ответам.');
      node.replaceChildren();parts.forEach((part,i)=>{const h=document.createElement('h3'),p=document.createElement('p');h.textContent=titles[kind][i];p.textContent=part;p.style.whiteSpace='pre-wrap';node.append(h,p)});
      const note=document.createElement('small');note.textContent=Array.from(text).length+'/1000 символов · GigaChat · Общий ориентир, не медицинская консультация.'+(kind==='sport'?' Программа тренировок не изменена.':'');node.appendChild(note);node.scrollIntoView({behavior:'smooth',block:'nearest'});
    }catch(e){show(node,e.name==='AbortError'?'Время ожидания истекло. Повторите позже.':e instanceof TypeError?'Не удалось связаться с сервером. Повторите позже.':e.message,true)}
    finally{clearTimeout(timer);busy[kind]=false;button.disabled=false;button.textContent=label}
  },true);
  function update(){
    const root=document.getElementById('goals-questionnaire-sport');
    if(root&&!root.querySelector('#sport-ai-button')){
      const actions=document.createElement('div');actions.style.marginTop='20px';
      actions.innerHTML='<button type="button" class="btn s" id="sport-ai-button">Анализ спортивной анкеты через ИИ</button><p class="subtle">Анализ цели, опыта, доступного времени и ограничений по текущим ответам. Можно заполнить частично. Ответы передаются GigaChat только с подтверждения. Анкета не сохраняется автоматически, программа тренировок не создаётся и не изменяется.</p><div id="sport-ai-result" role="status" aria-live="polite" hidden></div>';
      root.appendChild(actions);
    }
    for(const kind of ['nutrition','sport']){
      const button=document.getElementById(kind+'-ai-button'),hint=button?.nextElementSibling;
      if(button){button.disabled=busy[kind];button.title='Анализ доступных ответов через GigaChat'}
      if(kind==='nutrition'&&hint?.classList.contains('subtle'))hint.textContent='Можно заполнить анкету частично. По нажатию и с вашего подтверждения введённые ответы передаются GigaChat, пустые пункты пропускаются. Без данных — общие рекомендации. Анализ не заменяет консультацию специалиста.';
    }
  }
  const previous=render;render=function(){previous();update()};update();
})();
