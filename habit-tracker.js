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
  const groupColors=['#EAF7EE','#F2EDFC','#F2F7E5','#FFF0E2','#ECEEFC','#E8F3FC','#EAF0FF','#E5F5F1','#FCEBF2','#F7F0E6','#EDF2F6','#F7EAFB','#FFF0EB','#EFF3E5'];
  const groupAccents=['#2E7D46','#7952B3','#637D25','#B85C16','#505BA6','#286DA8','#385CC4','#217A67','#B34373','#8C693D','#526C80','#9746AE','#AD6047','#677D3D'];
  function progressStats(list,settings,date){
    const groups=new Map(),seen=new Set();let total=0,completed=0,extra=0;
    for(const d of list){
      if(seen.has(d.id))continue;seen.add(d.id);
      const c=settings[d.id];if(!c?.enabled)continue;
      const key=Number(d.id.split(':')[0]),color=groupColors[key]||'#EDF2F6',accent=groupAccents[key]||'#526C80';
      if(!groups.has(key))groups.set(key,{key,name:d.category,image:d.image,color,accent,added:0,doneCount:0,total:0,completed:0});
      const group=groups.get(key);group.added++;
      const marked=done(d.id,date);if(marked)group.doneCount++;
      if(!due(c,date)){if(marked)extra++;continue;}
      group.total++;total++;if(marked){group.completed++;completed++;}
    }
    return {groups:[...groups.values()].sort((a,b)=>a.key-b.key),total,completed,extra,percent:total?Math.round(completed/total*100):0};
  }
  function progressCard(list,settings){
    const s=progressStats(list,settings,selected),stops=[];let cursor=0;
    for(const g of s.groups){if(!g.total)continue;const start=cursor,end=start+g.total/s.total*100,filled=start+g.completed/s.total*100;if(g.completed)stops.push(g.color+' '+start+'% '+filled+'%');if(g.completed<g.total)stops.push('var(--ln) '+filled+'% '+end+'%');cursor=end;}
    const background=stops.length?'conic-gradient('+stops.join(',')+')':'var(--ln)';
    const calendar='<div class="habit-progress-date"><div class="nv"><button type="button" data-habit-shift="-1" aria-label="Предыдущий день">←</button><b>'+esc(fmt(selected))+'</b><button type="button" data-habit-shift="1" aria-label="Следующий день" '+(selected>=today()?'disabled':'')+'>→</button></div><label for="habit-tracker-date">Дата отметок</label><input id="habit-tracker-date" type="date" max="'+today()+'" value="'+selected+'"></div>';
    const legend=s.groups.length?'<h3 class="habit-progress-legend-title">Группы привычек в трекере</h3><ul class="habit-progress-legend" aria-label="Выполнение привычек по группам за выбранную дату">'+s.groups.map(g=>'<li><span class="habit-progress-dot" style="background:'+g.color+';border-color:'+g.accent+'" aria-hidden="true"></span><span class="habit-progress-label">'+esc(g.image+' '+g.name)+'</span><span class="habit-progress-count">Выполнено: '+g.doneCount+'/'+g.added+'</span></li>').join('')+'</ul>':'<p class="subtle">В трекер пока не добавлены привычки.</p>';
    return '<section class="card habit-progress" aria-labelledby="habit-progress-title">'+calendar+'<div class="topline"><h2 id="habit-progress-title">Привычки дня</h2><span class="tag">По расписанию: '+s.total+'</span></div><div class="energy habit-progress-energy"><div class="ring habit-progress-ring" style="background:'+background+'" role="img" aria-label="Выполнено '+s.completed+' из '+s.total+' привычек по текущему расписанию, '+s.percent+' процентов"><div><b>'+s.completed+' / '+s.total+'</b><small>выполнено</small></div></div><div><div class="mu">Выполнение за выбранный день</div><div class="big">'+s.percent+'<span class="habit-progress-unit">%</span></div><p class="subtle">'+(s.total?'Осталось отметить: '+(s.total-s.completed):'На этот день нет привычек по расписанию')+'</p>'+(s.extra?'<p class="subtle">Дополнительных отметок вне расписания: '+s.extra+'</p>':'')+'</div></div>'+legend+'</section>';
  }
  window.foodHabitsView=function(){
    if(!validDate(selected))selected=today();
    const list=active(),settings=config();
    return '<h1>Привычки</h1>'+progressCard(list,settings)+'<p class="mu">Выбор и параметры берутся из раздела «Мои цели → Привычки».</p>'+(list.length?'<div class="habit-tracker-grid">'+list.map(d=>{
      const c=settings[d.id],marked=done(d.id,selected),scheduled=due(c,selected),uid='habit-done-'+d.id.replace(':','-'),group=Number(d.id.split(':')[0]);
      const target=d.id==='0:0'?'Личная цель: '+(c.target||S.profile?.nutritionGoalSettings?.waterMl||S.waterGoal||'—')+' мл':d.id!=='13:4'&&c.target?'Сохранённый ориентир: '+c.target:'';
      return '<section class="card habit-tracker-card" style="--habit-bg:'+(groupColors[group]||'#EDF2F6')+';--habit-accent:'+(groupAccents[group]||'#526C80')+'"><div class="eyebrow">'+esc(d.image+' '+d.category)+'</div><h2>'+esc(title(d,c))+'</h2><p class="subtle">'+esc(schedules[c.schedule]||'Расписание не указано')+(c.time?' · Удобное время: '+esc(c.time):'')+'</p>'+(target?'<p>'+esc(target)+'</p>':'')+'<p class="subtle">'+(scheduled?'Запланировано на выбранный день':c.schedule==='flexible'?'Необязательная отметка — по возможности':'Вне текущего расписания — можно отметить дополнительно')+'</p><label class="habit-tracker-check" for="'+uid+'"><input type="checkbox" id="'+uid+'" data-habit-done="'+d.id+'" data-date="'+selected+'" '+(marked?'checked':'')+'><span>'+(marked?'Выполнено':'Отметить выполнение')+'</span></label><div class="habit-track-history" aria-label="Отметки за семь дней">'+history(d.id)+'</div>'+(d.id==='0:0'?'<p class="subtle">Это ручная отметка привычки: она не добавляет воду в дневник и не проверяет выпитый объём.</p>':'')+'</section>';
    }).join('')+'</div>':'<section class="card"><h2>Пока нет выбранных привычек</h2><p>Поставьте галочки в «Мои цели → Привычки». После успешного сохранения здесь появятся трекеры.</p></section>')+'<p class="subtle">Отметки — ваш самоотчёт. Отсутствие отметки не означает невыполнение. История хранится в этом браузере; снятие галочки в анкете не удаляет прошлые отметки. Время не включает отправку уведомлений.</p><div class="habit-settings-footer"><button type="button" class="btn s" data-habit-settings>Настроить привычки</button></div>';
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
  const style=document.createElement('style');style.textContent='.habit-tracker-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.habit-tracker-grid>.card{margin:0}.habit-tracker-check{display:flex;align-items:center;gap:12px;min-height:48px;padding:12px;border:1px solid var(--ln);border-radius:12px;color:var(--tx);cursor:pointer}.habit-tracker-check input{width:auto;flex:none}.habit-track-history{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px;margin-top:18px}.habit-track-day{text-align:center;background:var(--bg);border:1px solid var(--ln);border-radius:10px;padding:6px 2px}.habit-track-day small,.habit-track-day b{display:block}.habit-track-day small{font-size:11px}.habit-track-day.is-done{background:var(--ac2);color:var(--ac);border-color:var(--ac)}.habit-progress-date{margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--ln)}.habit-progress-date input[type=date]{max-width:280px}.habit-settings-footer{margin-top:24px}.habit-progress-energy{margin-top:18px;flex-wrap:wrap}.habit-progress-ring b{font-size:28px}.habit-progress-unit{font-size:16px;font-weight:400;margin-left:4px}.habit-progress-legend-title{font-size:16px;margin:16px 0 0}.habit-progress-legend{display:flex;flex-direction:column;align-items:flex-start;gap:4px;list-style:none;padding:0;margin:8px 0 0}.habit-progress-legend li{display:flex;align-items:flex-start;gap:8px;width:fit-content;max-width:100%;min-width:0;padding:2px 0;line-height:1.4}.habit-progress-dot{width:12px;height:12px;flex:none;margin-top:3px;border:1px solid var(--ln);border-radius:50%}.habit-progress-label{flex:0 1 auto;min-width:0;font-size:13px;overflow-wrap:anywhere}.habit-progress-count{flex:none;font-size:13px;font-weight:600;white-space:nowrap;font-variant-numeric:tabular-nums}.habit-tracker-card{--tx:#1F2937;--mu:#4B5563;--ac:var(--habit-accent);--ac2:var(--habit-bg);background:var(--habit-bg)!important;border:1px solid var(--habit-accent)!important;color:#1F2937}.habit-tracker-card h2,.habit-tracker-card .eyebrow{color:#1F2937}.habit-tracker-card p{color:#4B5563}.habit-tracker-card .habit-tracker-check{border-color:var(--habit-accent);background:rgba(255,255,255,.4)}.habit-tracker-card input[type=checkbox]{accent-color:var(--habit-accent)}.habit-tracker-card .habit-track-day:not(.is-done){background:rgba(255,255,255,.55);color:#4B5563}.habit-tracker-card .habit-track-day.is-done{background:var(--habit-accent);color:#fff;border-color:var(--habit-accent)}@media(max-width:700px){.habit-tracker-grid{grid-template-columns:1fr}}';document.head.appendChild(style);
  render();
})();
