(() => {
  if(window.foodHabitTrackerInstalled)return;
  window.foodHabitTrackerInstalled=true;
  let selected=today();
  const schedules={daily:'Каждый день',weekdays:'По будням',weekends:'По выходным',flexible:'По возможности'};
  const definitions=()=>window.foodHabitDefinitions?.()||[];
  const config=()=>window.foodHabitSettings?.()||{};
  const validDate=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&dk(dt(d))===d&&d<=today();
  const active=()=>definitions().filter(d=>config()[d.id]?.enabled===true);
  const due=(c,date)=>{const day=dt(date).getDay();return c.schedule==='daily'||c.schedule==='weekdays'&&day>=1&&day<=5||c.schedule==='weekends'&&(day===0||day===6)};
  const done=(id,date)=>S.habitTracker?.records?.[date]?.[id]?.done===true;
  const title=(d,c)=>d.id==='13:4'?(c.target||'Своя привычка'):d.title;
  function write(next){localStorage.setItem('nt1',JSON.stringify(next));S=next;}
  window.foodHabitToggle=function(id,date){
    try{
      const d=active().find(x=>x.id===id),c=config()[id];
      if(!d||!validDate(date))throw Error('Проверьте привычку и дату: будущие отметки недоступны');
      const previous=S.habitTracker;
      if(previous&&previous.version!==1)throw Error('Неизвестная версия истории привычек');
      const records=previous?.records||{};
      if(typeof records!=='object'||Array.isArray(records))throw Error('Некорректная история привычек');
      const record={done:!done(id,date),updatedAt:new Date().toISOString(),title:title(d,c),schedule:c.schedule,time:c.time||'',target:c.target||''};
      write({...S,habitTracker:{...previous,version:1,records:{...records,[date]:{...records[date],[id]:record}}}});
      render();
    }catch(e){toast(e.message||'Не удалось сохранить отметку');render();}
  };
  window.foodHabitsGo=function(){editing=false;tab='habits';selected=today();render();scrollTo(0,0)};
  window.foodHabitsDate=function(date){if(!validDate(date)){toast('Выберите дату не позднее сегодняшней');return;}selected=date;render()};
  window.foodHabitsShift=function(n){if(![-1,1].includes(n))return;const date=dt(selected);date.setDate(date.getDate()+n);foodHabitsDate(dk(date))};
  window.foodHabitsSettings=function(){editing=false;tab='goals';render();document.getElementById('goals-questionnaire-habits')?.scrollIntoView({behavior:'smooth',block:'start'})};
  function history(id){return Array.from({length:7},(_,i)=>{const date=dt(selected);date.setDate(date.getDate()+i-6);const key=dk(date),marked=done(id,key);return '<span class="habit-track-day '+(marked?'is-done':'')+'" aria-label="'+esc(fmt(key))+': '+(marked?'выполнено':'нет отметки')+'"><small>'+esc(key.slice(8)+'.'+key.slice(5,7))+'</small><b>'+(marked?'✓':'—')+'</b></span>';}).join('')}
  window.foodHabitsView=function(){
    if(!validDate(selected))selected=today();
    const list=active(),settings=config(),planned=list.filter(d=>due(settings[d.id],selected)),completed=planned.filter(d=>done(d.id,selected)).length;
    return '<h1>Привычки</h1><p class="mu">Выбор и параметры берутся из раздела «Мои цели → Привычки».</p><section class="card"><div class="nv"><button type="button" data-habit-shift="-1" aria-label="Предыдущий день">←</button><b>'+esc(fmt(selected))+'</b><button type="button" data-habit-shift="1" aria-label="Следующий день" '+(selected>=today()?'disabled':'')+'>→</button></div><label for="habit-tracker-date">Дата отметок</label><input id="habit-tracker-date" type="date" max="'+today()+'" value="'+selected+'"><p>По текущему расписанию: '+completed+' из '+planned.length+' привычек отмечено выполненными.</p><button type="button" class="btn s" data-habit-settings>Настроить привычки</button></section>'+(list.length?'<div class="habit-tracker-grid">'+list.map(d=>{
      const c=settings[d.id],marked=done(d.id,selected),scheduled=due(c,selected),uid='habit-done-'+d.id.replace(':','-');
      const target=d.id==='0:0'?'Личная цель: '+(c.target||S.profile?.nutritionGoalSettings?.waterMl||S.waterGoal||'—')+' мл':d.id!=='13:4'&&c.target?'Сохранённый ориентир: '+c.target:'';
      return '<section class="card habit-tracker-card"><div class="eyebrow">'+esc(d.image+' '+d.category)+'</div><h2>'+esc(title(d,c))+'</h2><p class="subtle">'+esc(schedules[c.schedule]||'Расписание не указано')+(c.time?' · Удобное время: '+esc(c.time):'')+'</p>'+(target?'<p>'+esc(target)+'</p>':'')+'<p class="subtle">'+(scheduled?'Запланировано на выбранный день':c.schedule==='flexible'?'Необязательная отметка — по возможности':'Вне текущего расписания — можно отметить дополнительно')+'</p><label class="habit-tracker-check" for="'+uid+'"><input type="checkbox" id="'+uid+'" data-habit-done="'+d.id+'" data-date="'+selected+'" '+(marked?'checked':'')+'><span>'+(marked?'Выполнено':'Отметить выполнение')+'</span></label><div class="habit-track-history" aria-label="Отметки за семь дней">'+history(d.id)+'</div>'+(d.id==='0:0'?'<p class="subtle">Это ручная отметка привычки: она не добавляет воду в дневник и не проверяет выпитый объём.</p>':'')+'</section>';
    }).join('')+'</div>':'<section class="card"><h2>Пока нет выбранных привычек</h2><p>Поставьте галочки в «Мои цели → Привычки». После успешного сохранения здесь появятся трекеры.</p></section>')+'<p class="subtle">Отметки — ваш самоотчёт. Отсутствие отметки не означает невыполнение. История хранится в этом браузере; снятие галочки в анкете не удаляет прошлые отметки. Время не включает отправку уведомлений.</p>';
  };
  function nav(){
    if(!S.profile||editing)return;
    const root=document.getElementById('nav');if(!root)return;
    let button=root.querySelector('[data-section="habits"]');
    if(!button){button=document.createElement('button');button.type='button';button.dataset.section='habits';button.innerHTML='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="3"/><path d="m8 12 3 3 5-6"/></svg><span>Привычки</span>';button.onclick=foodHabitsGo;root.appendChild(button);}
    const buttons=[...root.querySelectorAll('button')];
    const nutrition=buttons.find(b=>b!==button&&b.textContent.trim()==='Питание')||root.querySelector('[data-section="food-diary"]')||buttons.find(b=>b!==button&&b.textContent.trim()==='Дневник питания');
    if(nutrition&&button.nextElementSibling!==nutrition)nutrition.before(button);
    if(tab==='habits')root.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===button));else button.classList.remove('on');
  }
  document.addEventListener('change',event=>{
    const input=event.target;
    if(input.matches?.('[data-habit-done]')){foodHabitToggle(input.dataset.habitDone,input.dataset.date);return;}
    if(input.id==='habit-tracker-date'){foodHabitsDate(input.value);return;}
    if(!input.closest?.('#goals-questionnaire-habits [data-habit]'))return;
    try{
      if(!S.profile)throw Error('Сначала сохраните основную анкету');
      const profile=JSON.parse(JSON.stringify(S.profile));
      profile.nutritionGoalSettings={...profile.nutritionGoalSettings};profile.nutritionGoals=[...(profile.nutritionGoals||[])];profile.questionnairePreferences={...profile.questionnairePreferences,answers:{...profile.questionnairePreferences?.answers}};
      profile.habitsV2=foodCollectHabits(profile);
      write({...S,profile,waterGoal:profile.nutritionGoalSettings.waterMl??S.waterGoal});
      const status=document.querySelector('#goals-questionnaire-habits [data-block-save-status]');if(status)status.textContent='Привычки сохранены, трекеры обновлены';
      toast('Привычки сохранены, трекеры обновлены');
    }catch(e){toast(e.message||'Не удалось сохранить привычки');}
  });
  document.addEventListener('click',event=>{const shift=event.target.closest?.('[data-habit-shift]');if(shift)foodHabitsShift(Number(shift.dataset.habitShift));if(event.target.closest?.('[data-habit-settings]'))foodHabitsSettings();});
  const previous=render;
  render=function(){
    if(tab==='habits'&&S.profile&&!editing){tab='profile';try{previous();}finally{tab='habits';}const app=document.getElementById('app');if(app)app.innerHTML=brand()+foodHabitsView();}
    else previous();
    nav();
  };
  const style=document.createElement('style');style.textContent='.habit-tracker-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.habit-tracker-grid>.card{margin:0}.habit-tracker-check{display:flex;align-items:center;gap:12px;min-height:48px;padding:12px;border:1px solid var(--ln);border-radius:12px;color:var(--tx);cursor:pointer}.habit-tracker-check input{width:auto;flex:none}.habit-track-history{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px;margin-top:18px}.habit-track-day{text-align:center;background:var(--bg);border:1px solid var(--ln);border-radius:10px;padding:6px 2px}.habit-track-day small,.habit-track-day b{display:block}.habit-track-day small{font-size:11px}.habit-track-day.is-done{background:var(--ac2);color:var(--ac);border-color:var(--ac)}@media(max-width:700px){.habit-tracker-grid{grid-template-columns:1fr}}';document.head.appendChild(style);
  render();
})();
