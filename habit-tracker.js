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

  /* Single callback for every completion change (CTA button and day cells).
     To connect an API: set window.hbOnToggleDay=(habitId,date,completed)=>{...}; return false to skip the local save. */
  function onToggleDay(habitId,date,completed){
    const hook=window.hbOnToggleDay;
    if(typeof hook==='function'&&hook(habitId,date,completed)===false)return;
    window.foodHabitToggle(habitId,date);
  }
  const weekKeys=()=>Array.from({length:7},(_,i)=>{const date=dt(selected);date.setDate(date.getDate()+i-6);return dk(date)});
  const ICON_HEART='<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-7.5-10.2a4.3 4.3 0 0 1 7.5-2.6 4.3 4.3 0 0 1 7.5 2.6c0 5.6-7.5 10.2-7.5 10.2z"/></svg>';
  const iconCheck=n=>'<svg viewBox="0 0 24 24" width="'+n+'" height="'+n+'" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
  function habitCard(d,c){
    const id=d.id,keys=weekKeys(),marked=done(id,selected),scheduled=due(c,selected),count=keys.filter(k=>done(id,k)).length;
    const uid=id.replace(':','-'),R=34,C=Math.round(2*Math.PI*R*100)/100,off=Math.round(C*(1-count/7)*100)/100;
    const chips=[schedules[c.schedule]||'Расписание не указано'];
    if(c.time)chips.push('В '+c.time);
    if(id==='0:0')chips.push('Цель: '+(c.target||S.profile?.nutritionGoalSettings?.waterMl||S.waterGoal||'—')+' мл');
    else if(id!=='13:4'&&c.target)chips.push('Ориентир: '+c.target);
    const status=marked?'Выполнено на выбранный день':scheduled?'Запланировано на выбранный день':c.schedule==='flexible'?'Необязательная отметка — по возможности':'Вне текущего расписания — можно отметить дополнительно';
    const info=id==='0:0'?'Это ручная отметка привычки: она не добавляет воду в дневник и не проверяет выпитый объём.':'Это ручная отметка привычки: она отражает ваш самоотчёт и ничего не проверяет автоматически.';
    const cells=keys.map(k=>{const m=done(id,k),label=k.slice(8)+'.'+k.slice(5,7);return '<button type="button" class="hb-day'+(m?' is-done':'')+(k===selected?' is-selected':'')+'" data-hb-day data-habit="'+esc(id)+'" data-date="'+k+'" aria-pressed="'+m+'" aria-label="'+esc(fmt(k))+': '+(m?'выполнено, нажмите, чтобы снять отметку':'нет отметки, нажмите, чтобы отметить')+'"><span class="hb-day-date">'+label+'</span><span class="hb-day-mark" aria-hidden="true">'+(m?iconCheck(14):'—')+'</span></button>'}).join('');
    const ring='<div class="hb-ring" role="img" aria-label="Выполнено '+count+' из 7 дней"><svg viewBox="0 0 80 80" width="80" height="80" aria-hidden="true"><defs><linearGradient id="hb-g-'+uid+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B4F74A"/><stop offset="1" stop-color="#92E619"/></linearGradient></defs><circle class="hb-ring-track" cx="40" cy="40" r="'+R+'" fill="none" stroke-width="7"/>'+(count?'<circle class="hb-ring-arc" cx="40" cy="40" r="'+R+'" fill="none" stroke="url(#hb-g-'+uid+')" stroke-width="7" stroke-linecap="round" stroke-dasharray="'+C+'" stroke-dashoffset="'+off+'" style="--hb-c:'+C+'"/>':'')+'</svg><div class="hb-ring-c"><b>'+count+'/7</b><small>за 7 дн.</small></div></div>';
    return '<section class="hb-card" data-hb-habit="'+esc(id)+'">'
      +'<div class="hb-top"><span class="hb-badge">'+ICON_HEART+'<span class="hb-badge-text">'+esc(d.category)+'</span></span><button type="button" class="hb-info" data-hb-info aria-expanded="false" aria-controls="hb-pop-'+uid+'" aria-label="Ручная отметка: пояснение">i</button></div>'
      +'<div class="hb-pop" id="hb-pop-'+uid+'" role="note" hidden>'+esc(info)+'</div>'
      +'<div class="hb-head"><div class="hb-head-main"><h2 class="hb-title">'+esc(title(d,c))+'</h2><div class="hb-chips">'+chips.map(x=>'<span class="hb-chip">'+esc(x)+'</span>').join('')+'</div><p class="hb-status'+(marked?' is-done':'')+'"><span class="hb-status-dot" aria-hidden="true"></span>'+esc(status)+'</p></div>'+ring+'</div>'
      +'<button type="button" class="hb-cta'+(marked?' is-done':'')+'" data-hb-cta data-habit="'+esc(id)+'" data-date="'+selected+'" aria-pressed="'+marked+'"><span class="hb-cta-box" aria-hidden="true">'+iconCheck(16)+'</span><span>'+(marked?'Выполнено':'Отметить выполнение')+'</span></button>'
      +'<div class="hb-days" role="group" aria-label="Отметки за семь дней">'+cells+'</div></section>';
  }

  const groupColors=['#EAF7EE','#F2EDFC','#F2F7E5','#FFF0E2','#ECEEFC','#E8F3FC','#EAF0FF','#E5F5F1','#FCEBF2','#F7F0E6','#EDF2F6','#F7EAFB','#FFF0EB','#EFF3E5'];
  const groupAccents=['#2E7D46','#7952B3','#637D25','#B85C16','#505BA6','#286DA8','#385CC4','#217A67','#B34373','#8C693D','#526C80','#9746AE','#AD6047','#677D3D'];
  function progressStats(list,settings,date){
    const groups=new Map(),seen=new Set();let total=0,completed=0,extra=0;
    for(const d of list){
      if(seen.has(d.id))continue;seen.add(d.id);
      const c=settings[d.id];if(!c?.enabled)continue;
      const key=Number.isInteger(d.group)?d.group:Number(d.id.split(':')[0]),color=groupColors[key]||'#EDF2F6',accent=groupAccents[key]||'#526C80';
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
    return '<section class="card habit-progress" aria-labelledby="habit-progress-title">'+calendar+'<div class="topline"><h2 id="habit-progress-title">Привычки дня</h2><span class="tag">По расписанию: '+s.total+'</span></div><div class="habit-progress-layout"><div class="energy habit-progress-energy"><div class="ring habit-progress-ring" style="background:'+background+'" role="img" aria-label="Выполнено '+s.completed+' из '+s.total+' привычек по текущему расписанию, '+s.percent+' процентов"><div><b>'+s.completed+' / '+s.total+'</b><small>выполнено</small></div></div><div class="habit-progress-metrics"><div class="mu">Выполнение за выбранный день</div><div class="big">'+s.percent+'<span class="habit-progress-unit">%</span></div><p class="subtle">'+(s.total?'Осталось отметить: '+(s.total-s.completed):'На этот день нет привычек по расписанию')+'</p>'+(s.extra?'<p class="subtle">Дополнительных отметок вне расписания: '+s.extra+'</p>':'')+'</div></div><div class="habit-progress-groups">'+legend+'</div></div></section>';
  }
  window.foodHabitsView=function(){
    if(!validDate(selected))selected=today();
    const list=active(),settings=config();
    return '<h1>Привычки</h1>'+progressCard(list,settings)+'<p class="mu">Выбор и параметры берутся из раздела «Мои цели → Привычки».</p>'+(list.length?'<div class="hb-grid">'+list.map(d=>habitCard(d,settings[d.id])).join('')+'</div>':'<section class="card"><h2>Пока нет выбранных привычек</h2><p>Поставьте галочки в «Мои цели → Привычки». После успешного сохранения здесь появятся трекеры.</p></section>')+'<p class="subtle">Отметки — ваш самоотчёт. Отсутствие отметки не означает невыполнение. История хранится в этом браузере; снятие галочки в анкете не удаляет прошлые отметки. Время не включает отправку уведомлений.</p><div class="habit-settings-footer"><button type="button" class="btn s" data-habit-settings>Настроить привычки</button></div>';
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
  function closePops(except){
    document.querySelectorAll('.hb-pop:not([hidden])').forEach(pop=>{
      if(pop===except)return;
      pop.hidden=true;
      document.querySelector('[aria-controls="'+pop.id+'"]')?.setAttribute('aria-expanded','false');
    });
  }
  document.addEventListener('click',event=>{
    const shift=event.target.closest?.('[data-habit-shift]');if(shift)foodHabitsShift(Number(shift.dataset.habitShift));
    if(event.target.closest?.('[data-habit-settings]'))foodHabitsSettings();
    const info=event.target.closest?.('[data-hb-info]');
    if(info){
      const pop=document.getElementById(info.getAttribute('aria-controls'));
      if(pop){const open=pop.hidden;closePops(pop);pop.hidden=!open;info.setAttribute('aria-expanded',String(open));}
      return;
    }
    if(!event.target.closest?.('.hb-pop'))closePops();
    const day=event.target.closest?.('[data-hb-day]');
    if(day){
      const id=day.dataset.habit,date=day.dataset.date;
      onToggleDay(id,date,day.getAttribute('aria-pressed')!=='true');
      document.querySelector('[data-hb-day][data-habit="'+id+'"][data-date="'+date+'"]')?.focus({preventScroll:true});
      return;
    }
    const cta=event.target.closest?.('[data-hb-cta]');
    if(cta){
      const id=cta.dataset.habit,date=cta.dataset.date;
      onToggleDay(id,date,cta.getAttribute('aria-pressed')!=='true');
      document.querySelector('[data-hb-cta][data-habit="'+id+'"]')?.focus({preventScroll:true});
    }
  });
  document.addEventListener('keydown',event=>{
    if(event.key!=='Escape')return;
    const open=document.querySelector('.hb-pop:not([hidden])');
    if(!open)return;
    closePops();
    document.querySelector('[aria-controls="'+open.id+'"]')?.focus();
  });
  const previous=render;
  render=function(){
    if(tab==='habits'&&S.profile&&!editing){tab='profile';try{previous();}finally{tab='habits';}const app=document.getElementById('app');if(app)app.innerHTML=brand()+foodHabitsView();}
    else previous();
    nav();
  };
  const style=document.createElement('style');style.textContent='.habit-tracker-check{display:flex;align-items:center;gap:12px;min-height:48px;padding:12px;border:1px solid var(--ln);border-radius:12px;color:var(--tx);cursor:pointer}.habit-progress-date{margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--ln)}.habit-progress-date input[type=date]{max-width:280px}.habit-settings-footer{margin-top:24px}.habit-progress-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:center;gap:28px;margin-top:18px}.habit-progress .habit-progress-energy{margin:0;min-width:0;gap:16px;flex-wrap:wrap;justify-content:center;align-items:center;align-content:center;align-self:stretch}.habit-progress-metrics{min-width:0;flex:1 1 130px;overflow-wrap:anywhere}.habit-progress-groups{min-width:0;width:100%;max-width:520px}.habit-progress-ring b{font-size:28px}.habit-progress-unit{font-size:16px;font-weight:400;margin-left:4px}.habit-progress-legend-title{font-size:16px;margin:0}.habit-progress-legend{display:grid;grid-template-columns:minmax(0,1fr);gap:8px;list-style:none;padding:0;margin:12px 0 0}.habit-progress-legend li{display:grid;grid-template-columns:12px minmax(0,1fr) 116px;align-items:start;gap:10px;width:100%;min-width:0;padding:2px 0;line-height:1.4}.habit-progress-dot{width:12px;height:12px;margin-top:3px;border:1px solid var(--ln);border-radius:50%}.habit-progress-label{min-width:0;font-size:13px;overflow-wrap:anywhere}.habit-progress-count{justify-self:start;font-size:13px;font-weight:600;white-space:nowrap;font-variant-numeric:tabular-nums}@media(max-width:760px){.habit-progress-layout{grid-template-columns:minmax(0,1fr);gap:24px}.habit-progress-groups{max-width:none}}';document.head.appendChild(style);

  /* Habit card "Dashboard + Ring": all classes are prefixed with .hb- */
  if(!document.getElementById('hb-fonts')){const link=document.createElement('link');link.id='hb-fonts';link.rel='stylesheet';link.href='https://fonts.googleapis.com/css2?family=Exo+2:wght@600;700;800&family=Inter:wght@400;500;600&display=swap';document.head.appendChild(link);}
  const hb=document.createElement('style');hb.id='hb-style';hb.textContent=`
:root{--hb-bg:#041410;--hb-glow:#0A2B22;--hb-surface:rgba(11,34,28,.62);--hb-line:rgba(180,247,74,.16);--hb-acc:#B4F74A;--hb-acc2:#92E619;--hb-acc-glow:rgba(180,247,74,.32);--hb-tx:#F2FBF7;--hb-tx2:#8FAEA3;--hb-tx3:#5D7D72;--hb-head:'Exo 2',system-ui,sans-serif;--hb-ui:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif}
.hb-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(360px,100%),1fr));gap:16px;padding:14px;margin:0 0 16px;border-radius:30px;background:radial-gradient(120% 80% at 50% 0%,var(--hb-glow) 0%,var(--hb-bg) 72%)}
.hb-card{position:relative;display:flex;flex-direction:column;gap:16px;min-width:0;padding:18px;border-radius:26px;background:var(--hb-surface);-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);border:1px solid var(--hb-line);box-shadow:inset 0 1px 0 rgba(255,255,255,.06),0 18px 40px -26px rgba(0,0,0,.8);color:var(--hb-tx);font-family:var(--hb-ui);box-sizing:border-box}
.hb-card *{box-sizing:border-box}
.hb-top{display:flex;align-items:center;justify-content:space-between;gap:12px}
.hb-badge{display:inline-flex;align-items:center;gap:6px;min-width:0;padding:6px 11px;border-radius:999px;background:rgba(180,247,74,.08);border:1px solid var(--hb-line);color:var(--hb-acc)}
.hb-badge svg{flex:none}
.hb-badge-text{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:600 11px/1.2 var(--hb-ui);letter-spacing:.08em;text-transform:uppercase}
.hb-card .hb-info{flex:none;display:grid;place-items:center;width:34px;height:34px;padding:0;border-radius:50%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);color:var(--hb-tx2);font:italic 700 15px/1 var(--hb-head);cursor:pointer;transition:border-color .2s,color .2s,background .2s}
.hb-card .hb-info:hover,.hb-card .hb-info[aria-expanded=true]{color:var(--hb-acc);border-color:var(--hb-acc);background:rgba(180,247,74,.1)}
.hb-pop{position:absolute;z-index:5;top:60px;right:18px;width:min(280px,calc(100% - 36px));padding:12px 14px;border-radius:16px;background:rgba(8,28,23,.86);-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);border:1px solid var(--hb-line);box-shadow:inset 0 1px 0 rgba(255,255,255,.06),0 18px 40px -12px rgba(0,0,0,.8);color:var(--hb-tx);font:400 13px/1.5 var(--hb-ui)}
.hb-pop[hidden]{display:none}
.hb-head{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:14px}
.hb-head-main{min-width:0}
.hb-card .hb-title{margin:0;color:var(--hb-tx);font:700 20px/1.25 var(--hb-head);font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
.hb-chips{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}
.hb-chip{padding:4px 10px;border-radius:999px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);color:var(--hb-tx2);font:500 12px/1.3 var(--hb-ui)}
.hb-card .hb-status{display:flex;align-items:center;gap:8px;margin:0;color:var(--hb-tx2);font:500 13px/1.4 var(--hb-ui)}
.hb-status-dot{flex:none;width:8px;height:8px;border-radius:50%;background:var(--hb-tx3)}
.hb-card .hb-status.is-done{color:var(--hb-acc)}
.hb-status.is-done .hb-status-dot{background:var(--hb-acc);box-shadow:0 0 8px var(--hb-acc-glow)}
.hb-ring{position:relative;flex:none;width:80px;height:80px}
.hb-ring svg{display:block;width:80px;height:80px;transform:rotate(-90deg);overflow:visible}
.hb-ring-track{stroke:rgba(255,255,255,.08)}
.hb-ring-arc{filter:drop-shadow(0 0 5px var(--hb-acc-glow));animation:hb-ring-in .8s cubic-bezier(.2,.8,.2,1) both}
@keyframes hb-ring-in{from{stroke-dashoffset:var(--hb-c)}}
.hb-ring-c{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1}
.hb-ring-c b{color:var(--hb-tx);font:800 19px/1 var(--hb-head);font-variant-numeric:tabular-nums}
.hb-ring-c small{margin-top:3px;color:var(--hb-tx3);font:500 10px/1 var(--hb-ui)}
.hb-card .hb-cta{display:flex;align-items:center;gap:12px;width:100%;height:52px;margin:0;padding:0 16px;border-radius:16px;background:rgba(4,20,16,.55);border:1px solid rgba(255,255,255,.1);box-shadow:inset 0 1px 0 rgba(255,255,255,.05);color:var(--hb-tx);font:600 15px/1 var(--hb-ui);text-align:left;cursor:pointer;transition:transform .15s,box-shadow .25s,border-color .25s,background .25s,color .25s}
.hb-card .hb-cta:hover{border-color:var(--hb-line);transform:translateY(-1px)}
.hb-card .hb-cta:active{transform:scale(.985)}
.hb-cta-box{flex:none;display:grid;place-items:center;width:24px;height:24px;border-radius:50%;border:2px solid var(--hb-tx3);color:transparent;transition:border-color .2s,color .2s}
.hb-card .hb-cta.is-done{background:linear-gradient(135deg,var(--hb-acc),var(--hb-acc2));border-color:transparent;color:#041410;box-shadow:0 10px 26px -10px var(--hb-acc-glow),inset 0 1px 0 rgba(255,255,255,.35)}
.hb-cta.is-done .hb-cta-box{border-color:rgba(4,20,16,.55);color:#041410}
.hb-days{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px}
.hb-card .hb-day{display:flex;flex-direction:column;align-items:center;gap:6px;min-width:0;padding:8px 0 7px;border-radius:12px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);color:var(--hb-tx2);font-family:var(--hb-ui);cursor:pointer;transition:background .2s,border-color .2s,color .2s,transform .15s}
.hb-card .hb-day:hover{border-color:var(--hb-line);background:rgba(180,247,74,.06)}
.hb-card .hb-day:active{transform:scale(.95)}
.hb-day-date{font:500 10.5px/1 var(--hb-ui);font-variant-numeric:tabular-nums;letter-spacing:-.01em}
.hb-day-mark{display:grid;place-items:center;height:16px;font:600 14px/1 var(--hb-ui);color:var(--hb-tx3)}
.hb-card .hb-day.is-done{background:rgba(180,247,74,.1);color:var(--hb-acc)}
.hb-day.is-done .hb-day-mark{color:var(--hb-acc)}
.hb-card .hb-day.is-selected{border-color:var(--hb-acc);box-shadow:0 0 0 1px rgba(180,247,74,.18)}
.hb-card button:focus-visible{outline:2px solid var(--hb-acc);outline-offset:2px}
@media(min-width:640px){.hb-days{gap:8px}.hb-day-date{font-size:11.5px}}
@media(max-width:380px){.hb-card{padding:16px}.hb-card .hb-title{font-size:18px}.hb-ring,.hb-ring svg{width:72px;height:72px}}
@media(prefers-reduced-motion:reduce){.hb-ring-arc{animation:none}.hb-card .hb-cta,.hb-card .hb-day,.hb-card .hb-info{transition:none}}
`;document.head.appendChild(hb);
  render();
})();
