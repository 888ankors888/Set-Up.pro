(() => {
  if(window.foodDayPlanAIInstalled)return;
  window.foodDayPlanAIInstalled=true;
  let busy=false;
  const TYPES={walk:'Ходьба',run:'Бег',bike:'Велосипед',strength:'Силовая',mobility:'Подвижность',other:'Другое'};
  const GROUPS={chest:'Грудь',back:'Спина',shoulders:'Плечи',biceps:'Бицепс',triceps:'Трицепс',legs:'Ноги',glutes:'Ягодицы',core:'Корпус',other:'Другое'};
  const P=()=>window.foodDailyPlanner;
  function context(date){
    const dates=P().week(date),start=dt(dates[0]),end=dt(dates[6]);start.setDate(start.getDate()-1);end.setDate(end.getDate()+1);
    const lo=dk(start),hi=dk(end),active=new Set(),strength=new Set(),facts=S.sports?.entries||[];
    let minutes=0;
    const add=(day,kind)=>{if(day>=lo&&day<=hi){active.add(day);if(kind==='strength')strength.add(day);}};
    for(const e of facts){add(e.date,e.kind);if(e.date===date)minutes+=e.minutes;}
    for(const [day,plan] of Object.entries(P().plans().days))for(const e of plan.items){add(day,e.kind);if(day===date&&!facts.some(f=>f.id==='dp-'+e.id||f.plannedItemId===e.id))minutes+=e.minutes;}
    const old=S.sports?.plan,sig=JSON.stringify([S.profile?.age,S.profile?.bodyGoal||S.profile?.goal,S.profile?.health,S.sports?.profile]);
    if(old?.accepted&&old.signature===sig)for(const s of old.sessions){const d=dt(old.start);d.setDate(d.getDate()+(s.weekday-(d.getDay()+6)%7+7)%7);const day=dk(d);add(day,s.kind);if(day===date&&!facts.some(f=>f.sessionId===s.id))minutes+=s.minutes;}
    return {active_dates:[...active].filter(d=>d>=dates[0]&&d<=dates[6]).sort(),strength_dates:[...strength].sort(),existing_minutes:Math.round(minutes*10)/10};
  }
  function payload(date,preferences){
    const b=S.profile||{},p=S.sports?.profile,q=b.sportQuestionnaire?.answers||{},medical=b.nutritionQuestionnaire?.answers?.medicalDiet||[];
    if(!p?.enabled||!Number.isInteger(b.age)||b.age<18||b.age>85||!['beginner','regular','experienced'].includes(p.level)||!Number.isInteger(p.minutes))throw Error('Заполните и сохраните спортивную анкету взрослого пользователя');
    const health=(b.health||[]).some(v=>['Диабет','Давление','Беременность/ГВ'].includes(v))||medical.some(v=>v!=='none');
    const limitations=!!q.limitations?.length||!!q.limitationsOther,goal=q.primaryGoal||p.goal;
    if(p.restrictions!=='none'||health||limitations||q.injury!=='no'||q.cardio!=='no'||goal==='recovery'||['pain','unwell'].includes(preferences.wellbeing))throw Error('При ограничениях или неизвестных ответах сначала согласуйте нагрузку со специалистом. Ручное планирование доступно.');
    const minutes=Number(preferences.minutes);
    if(!Number.isInteger(minutes)||minutes<10||minutes>90||minutes>p.minutes)throw Error('Время должно быть 10–90 минут и не больше ограничения в «Моих целях»');
    return {date,age:b.age,level:p.level,goal,body_goal:b.bodyGoal||b.goal,restrictions:p.restrictions,health_flag:!!health,injury:q.injury,cardio:q.cardio,limitations,minutes,profile_minutes:p.minutes,place:preferences.place,equipment:preferences.equipment.trim(),kinds:preferences.kinds,groups:preferences.groups,intensity:preferences.intensity,wellbeing:preferences.wellbeing,notes:preferences.notes.trim(),...context(date)};
  }
  window.foodDayPlanPreferences=function(date){
    if(busy){toast('Дождитесь завершения текущего запроса');return;}
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||dk(dt(date))!==date){toast('Некорректная дата');return;}
    const p=S.sports?.profile||{},choices=(name,items)=>Object.entries(items).map(([v,t])=>'<label class="chk"><input type="checkbox" name="'+name+'" value="'+v+'">'+t+'</label>').join('');
    const d=P().dialog('<form><h2>Предпочтения на '+esc(fmt(date))+'</h2><ol><li><label>Доступное время, минут<input name="minutes" type="number" min="10" max="90" value="'+esc(p.minutes||25)+'" required></label></li><li><fieldset><legend>Какие нагрузки предпочитаете? Можно несколько; без выбора — по целям.</legend>'+choices('kinds',TYPES)+'</fieldset></li><li><fieldset><legend>Группы мышц (необязательно)</legend>'+choices('groups',GROUPS)+'</fieldset></li><li><label>Где занимаетесь?<select name="place"><option value="home">Дом</option><option value="gym">Зал</option><option value="outdoor">Улица</option></select></label><label>Доступный инвентарь<input name="equipment" maxlength="200" value="'+esc(p.equipment||'')+'"></label></li><li><label>Желаемая интенсивность<select name="intensity"><option value="light">Лёгкая</option><option value="moderate">Умеренная</option></select></label></li><li><label>Какое самочувствие учитывать?<select name="wellbeing" required><option value="">Выберите</option><option value="ready">Готов(а) к занятию</option><option value="tired">Устал(а)</option><option value="pain">Есть боль</option><option value="unwell">Плохо себя чувствую</option></select></label></li><li><label>Другие пожелания<textarea name="notes" maxlength="500"></textarea></label></li></ol><p class="subtle">Для будущей даты это предварительные пожелания. В день занятия оцените самочувствие заново. Черновик не записывает выполнение и не заменяет назначения специалиста.</p><p role="status" data-dp-error></p><div class="row"><button type="button" class="btn s" data-dp-close>Отмена</button><button type="submit" class="btn">Разработать с ИИ только этот день</button></div></form>');
    d.querySelector('[name="place"]').value=p.place||'home';
    const form=d.querySelector('form');
    form.onsubmit=async event=>{
      event.preventDefault();if(busy)return;
      const button=form.querySelector('[type="submit"]'),status=form.querySelector('[data-dp-error]');
      let data;try{const prefs=Object.fromEntries(new FormData(form));prefs.kinds=[...form.querySelectorAll('[name="kinds"]:checked')].map(n=>n.value);prefs.groups=[...form.querySelectorAll('[name="groups"]:checked')].map(n=>n.value);data=payload(date,prefs);}catch(e){status.textContent=e.message;return;}
      if(!confirm('Отправить в GigaChat возраст, опыт, цели из «Моих целей», признаки ограничений, предпочтения, инвентарь, пояснения и даты нагрузки для черновика только на '+date+'? Другие дни и фактический дневник не изменяются.'))return;
      const signature=P().signature(),ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),110000),abort=()=>ctrl.abort();
      busy=true;button.disabled=true;status.textContent='Составляем черновик одного дня…';d.addEventListener('close',abort,{once:true});
      try{
        const endpoint=location.hostname.endsWith('.onrender.com')?location.origin+'/api/sports/day-plan':'https://food-pro-api.onrender.com/api/sports/day-plan';
        const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',body:JSON.stringify(data),signal:ctrl.signal});
        const r=await response.json().catch(()=>null);
        if(!response.ok)throw Error(response.status===409&&typeof r?.detail==='string'?r.detail:({404:'Дневной ИИ-маршрут ещё не опубликован на этом сервере.',422:'Проверьте сохранённую анкету и предпочтения дня.',429:'Достигнут лимит запросов или сервер занят.',502:'Ответ ИИ не прошёл проверку. Повторите запрос.',503:'ИИ временно недоступен.'})[response.status]||'Ошибка дневного ИИ');
        if(!d.open||!d.contains(form)||P().signature()!==signature)throw Error('Анкета или программа изменилась либо окно закрыто. Повторите запрос.');
        if(r?.source!=='gigachat'||r.date!==date||typeof r.summary!=='string'||r.summary.length>600||!['light','moderate'].includes(r.intensity)||!Array.isArray(r.warnings)||r.warnings.length>8||r.warnings.some(w=>typeof w!=='string'||w.length>500)||!Array.isArray(r.activities)||r.activities.length>12)throw Error('Некорректный формат дневного ответа');
        if(r.activities.some(a=>a.weight!=null))throw Error('ИИ не должен назначать рабочие веса');
        const rows=r.activities.map(a=>P().activity(a,date));
        const limit=Math.min(data.minutes,data.profile_minutes,data.level==='beginner'?30:90,data.wellbeing==='tired'?20:90)-data.existing_minutes;
        if(rows.reduce((sum,a)=>sum+a.minutes,0)>limit+0.000001)throw Error('Превышено доступное время дня');
        d.innerHTML='<form><h2>Черновик · '+esc(fmt(date))+'</h2><p>'+esc(r.summary)+'</p><p>Интенсивность: '+(r.intensity==='light'?'лёгкая':'умеренная')+'</p>'+r.warnings.map(w=>'<p class="subtle">'+esc(w)+'</p>').join('')+rows.map(a=>'<section class="card"><h3>'+esc(a.name)+'</h3><p>'+esc(TYPES[a.kind])+' · '+a.minutes+' мин'+(a.muscleGroup?' · '+esc(GROUPS[a.muscleGroup]):'')+(a.sets!=null?' · '+a.sets+' подходов':'')+(a.reps!=null?' · '+a.reps+' повторений':'')+(a.distance!=null?' · '+a.distance+' км':'')+'</p><p>'+esc(a.notes)+'</p></section>').join('')+'<p>Пункты добавятся только в этот день, не заменяя существующие активности. Выполнение не записывается.</p><label class="chk"><input type="checkbox" required>Я просмотрел(а) черновик</label><p role="status" data-dp-error></p><div class="row"><button type="button" class="btn s" data-dp-close>Отмена</button><button type="submit" class="btn">Добавить в план этого дня</button></div></form>';
        d.querySelector('form').onsubmit=e=>{e.preventDefault();try{if(!d.querySelector('input[type="checkbox"]').checked)throw Error('Подтвердите просмотр');P().append(date,rows,{summary:r.summary,warnings:r.warnings},signature);d.close();}catch(error){d.querySelector('[data-dp-error]').textContent=error.message;}};
      }catch(e){if(d.contains(status))status.textContent=e.name==='AbortError'?'Запрос отменён или время ожидания истекло.':e.message;else toast(e.message);}
      finally{clearTimeout(timer);d.removeEventListener('close',abort);busy=false;if(document.contains(button))button.disabled=false;}
    };
  };
})();
