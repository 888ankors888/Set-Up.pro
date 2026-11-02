(() => {
  let busy=false;
  const titles=['🔎 Оценка','🥗 Рекомендации','💚 Мотивация'];
  const val=id=>(document.getElementById(id)?.value||'').trim();
  function collect(){
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
    return {about,nutrition};
  }
  function show(node,text,error=false){node.hidden=false;node.setAttribute('aria-live','polite');node.replaceChildren();const p=document.createElement('p');p.textContent=text;p.style.color=error?'var(--danger, #b42318)':'';node.appendChild(p);}
  document.addEventListener('click',async event=>{
    const button=event.target.closest?.('#nutrition-ai-button');if(!button)return;
    event.preventDefault();event.stopImmediatePropagation();if(busy)return;
    const node=document.getElementById('nutrition-ai-result');if(!node)return;
    let data;try{data=collect()}catch(e){show(node,e.message,true);return}
    if(!confirm('Отправить заполненные ответы «О вас» и «Питание», в том числе введённые сведения о здоровье, в GigaChat? Пустые пункты будут пропущены; без данных ответ будет общим. Анкета не сохраняется автоматически.'))return;
    const signature=JSON.stringify(data),controller=new AbortController(),timer=setTimeout(()=>controller.abort(),110000);
    const label=button.textContent;busy=true;button.disabled=true;button.textContent='✨ Анализирую питание…';show(node,'Готовим разбор по доступным данным…');
    try{
      const response=await fetch('https://food-pro-api.onrender.com/api/goals/nutrition-analysis',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',body:signature,signal:controller.signal});
      const r=await response.json().catch(()=>null);
      if(!response.ok)throw Error(({404:'Маршрут анализа ещё не опубликован на сервере.',422:'Проверьте корректность введённых значений. Пустые поля допустимы.',429:'Сервер занят или достигнут лимит. Повторите позже.',502:'ИИ не сформировал корректный ответ до 1000 символов. Повторите позже.',503:'ИИ временно недоступен.'})[response.status]||'Ошибка сервера. Попробуйте позже.');
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
  const update=()=>{const button=document.getElementById('nutrition-ai-button'),hint=button?.nextElementSibling;if(button){button.disabled=busy;button.title='Анализ доступных ответов через GigaChat'}if(hint?.classList.contains('subtle'))hint.textContent='Можно заполнить анкету частично. По нажатию и с вашего подтверждения введённые ответы передаются GigaChat, пустые пункты пропускаются. Без данных — общие рекомендации. Анализ не заменяет консультацию специалиста.';};
  const previous=render;render=function(){previous();update()};update();
})();
