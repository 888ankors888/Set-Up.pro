(() => {
  if(window.foodHabitTrackerInstalled)return;
  window.foodHabitTrackerInstalled=true;
  let selected=today(),activeGroup=null;
  const schedules={daily:'Каждый день',weekdays:'По будням',weekends:'По выходным',flexible:'По возможности'};
  const definitions=()=>window.foodHabitDefinitions?.()||[];
  const config=()=>window.foodHabitSettings?.()||{};
  const validDate=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&dk(dt(d))===d&&d<=today();
  const active=()=>definitions().filter(d=>config()[d.id]?.enabled===true);
  const due=(c,date)=>{const day=dt(date).getDay();return c.schedule==='daily'||c.schedule==='weekdays'&&day>=1&&day<=5||c.schedule==='weekends'&&(day===0||day===6)};
  const done=(id,date)=>S.habitTracker?.records?.[date]?.[id]?.done===true;
  const title=(d,c)=>d.id==='13:4'?(c.target||'Своя привычка'):d.title;
  const gkey=d=>Number.isInteger(d.group)?d.group:Number(d.id.split(':')[0]);
  const minDate=()=>{const d=dt(today());d.setDate(d.getDate()-6);return dk(d)};
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

  /* Callbacks for the existing front end / API.
     window.hbOnToggleDay(habitId,date,completed), window.hbOnDateChange(date), window.hbOnFilterChange(groupId|null):
     return false from a hook to skip the default local behaviour. */
  function onToggleDay(habitId,date,completed){
    const hook=window.hbOnToggleDay;
    if(typeof hook==='function'&&hook(habitId,date,completed)===false)return;
    window.foodHabitToggle(habitId,date);
  }
  function onDateChange(date){
    const hook=window.hbOnDateChange;
    if(typeof hook==='function'&&hook(date)===false)return;
    window.foodHabitsDate(date);
  }
  function onFilterChange(groupId){
    const next=groupId!==null&&activeGroup===groupId?null:groupId;
    const hook=window.hbOnFilterChange;
    if(typeof hook==='function'&&hook(next)===false)return;
    activeGroup=next;
    render();
  }

  /* Group meta: one emoji and one scale colour per habit group (shared by the summary and the cards).
     Matching is by name first, then by group index (the 14 groups keep their order). */
  const GROUPS=[
    ['здоровье и тело','#B4F74A','💧'],
    ['психич','#C084FC','🌿'],
    ['питани','#FF7A6B','🥗'],
    ['физическ','#FFB347','🚶'],
    ['сон и восстан','#7C83FF','🌙'],
    ['обучен','#4DA6FF','📚'],
    ['работа','#2DD4BF','🎯'],
    ['финанс','#EAD84A','💰'],
    ['отношен','#F472B6','🤝'],
    ['дом и порядок','#E2A76F','🏡'],
    ['цифров','#22D3EE','📵'],
    ['творч','#E879F9','🎨'],
    ['саморефл','#CBD5E1','📝'],
    ['эколог','#5BD16F','🌍']
  ];
  const iconCheck=n=>'<svg viewBox="0 0 24 24" width="'+n+'" height="'+n+'" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
  const rgba=(hex,a)=>{const n=parseInt(hex.slice(1),16);return 'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+a+')'};
  function groupMeta(d){
    const key=gkey(d),name=d.category||'Группа',n=name.toLowerCase();
    let item=GROUPS.find(g=>n.includes(g[0]));
    if(!item&&n.includes('эмоцион'))item=GROUPS[1];
    if(!item&&n.includes('активн'))item=GROUPS[3];
    if(!item)item=GROUPS[key]||['','#B4F74A','✨'];
    return {key,name,color:item[1],emoji:d.image||item[2]};
  }
  const weekKeys=()=>{const end=selected<minDate()?selected:today();return Array.from({length:7},(_,i)=>{const date=dt(end);date.setDate(date.getDate()+i-6);return dk(date)})};

  function habitCard(d,c){
    const id=d.id,keys=weekKeys(),marked=done(id,selected),scheduled=due(c,selected),count=keys.filter(k=>done(id,k)).length,meta=groupMeta(d);
    const uid=id.replace(':','-'),R=34,C=Math.round(2*Math.PI*R*100)/100,off=Math.round(C*(1-count/7)*100)/100;
    const chips=[schedules[c.schedule]||'Расписание не указано'];
    if(c.time)chips.push('В '+c.time);
    if(id==='0:0')chips.push('Цель: '+(c.target||S.profile?.nutritionGoalSettings?.waterMl||S.waterGoal||'—')+' мл');
    else if(id!=='13:4'&&c.target)chips.push('Ориентир: '+c.target);
    const status=marked?'Выполнено на выбранный день':scheduled?'Запланировано на выбранный день':c.schedule==='flexible'?'Необязательная отметка — по возможности':'Вне текущего расписания — можно отметить дополнительно';
    const info=id==='0:0'?'Это ручная отметка привычки: она не добавляет воду в дневник и не проверяет выпитый объём.':'Это ручная отметка привычки: она отражает ваш самоотчёт и ничего не проверяет автоматически.';
    const cells=keys.map(k=>{const m=done(id,k),label=k.slice(8)+'.'+k.slice(5,7);return '<button type="button" class="hb-day'+(m?' is-done':'')+(k===selected?' is-selected':'')+'" data-hb-day data-habit="'+esc(id)+'" data-date="'+k+'" aria-pressed="'+m+'" aria-label="'+esc(fmt(k))+': '+(m?'выполнено, нажмите, чтобы снять отметку':'нет отметки, нажмите, чтобы отметить')+'"><span class="hb-day-date">'+label+'</span><span class="hb-day-mark" aria-hidden="true">'+(m?iconCheck(14):'—')+'</span></button>'}).join('');
    const ring='<div class="hb-ring" role="img" aria-label="Выполнено '+count+' из 7 дней"><svg viewBox="0 0 80 80" width="80" height="80" aria-hidden="true"><defs><linearGradient id="hb-g-'+uid+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B4F74A"/><stop offset="1" stop-color="#92E619"/></linearGradient></defs><circle class="hb-ring-track" cx="40" cy="40" r="'+R+'" fill="none" stroke-width="7"/>'+(count?'<circle class="hb-ring-arc" cx="40" cy="40" r="'+R+'" fill="none" stroke="url(#hb-g-'+uid+')" stroke-width="7" stroke-linecap="round" stroke-dasharray="'+C+'" stroke-dashoffset="'+off+'" style="--hb-c:'+C+'"/>':'')+'</svg><div class="hb-ring-c"><b>'+count+'/7</b><small>за 7 дн.</small></div></div>';
    return '<section class="hb-card" data-hb-habit="'+esc(id)+'" data-hb-group="'+meta.key+'" style="--hb-g:'+meta.color+';--hb-g-a:'+rgba(meta.color,.1)+';--hb-g-b:'+rgba(meta.color,.35)+'">'
      +'<div class="hb-top"><span class="hb-badge"><span class="hb-badge-emoji" aria-hidden="true">'+esc(meta.emoji)+'</span><span class="hb-badge-text">'+esc(meta.name)+'</span></span><button type="button" class="hb-info" data-hb-info aria-expanded="false" aria-controls="hb-pop-'+uid+'" aria-label="Ручная отметка: пояснение">i</button></div>'
      +'<div class="hb-pop" id="hb-pop-'+uid+'" role="note" hidden>'+esc(info)+'</div>'
      +'<div class="hb-head"><div class="hb-head-main"><h2 class="hb-title">'+esc(title(d,c))+'</h2><div class="hb-chips">'+chips.map(x=>'<span class="hb-chip">'+esc(x)+'</span>').join('')+'</div><p class="hb-status'+(marked?' is-done':'')+'"><span class="hb-status-dot" aria-hidden="true"></span>'+esc(status)+'</p></div>'+ring+'</div>'
      +'<button type="button" class="hb-cta'+(marked?' is-done':'')+'" data-hb-cta data-habit="'+esc(id)+'" data-date="'+selected+'" aria-pressed="'+marked+'"><span class="hb-cta-box" aria-hidden="true">'+iconCheck(16)+'</span><span>'+(marked?'Выполнено':'Отметить выполнение')+'</span></button>'
      +'<div class="hb-days" role="group" aria-label="Отметки за семь дней">'+cells+'</div></section>';
  }

  /* Summary module "Привычки дня" (Split header) */
  function hdStats(list,settings,date){
    const groups=new Map(),seen=new Set();let total=0,completed=0,extra=0;
    for(const d of list){
      if(seen.has(d.id))continue;seen.add(d.id);
      const c=settings[d.id];if(!c?.enabled)continue;
      const meta=groupMeta(d);
      if(!groups.has(meta.key))groups.set(meta.key,{...meta,total:0,completed:0,added:0});
      const g=groups.get(meta.key);g.added++;
      const marked=done(d.id,date);
      if(!due(c,date)){if(marked)extra++;continue;}
      g.total++;total++;if(marked){g.completed++;completed++;}
    }
    return {groups:[...groups.values()].sort((a,b)=>a.key-b.key),total,completed,extra,percent:total?Math.round(completed/total*100):0};
  }
  function dateTag(date){
    if(date===today())return 'Сегодня';
    const y=dt(today());y.setDate(y.getDate()-1);
    if(date===dk(y))return 'Вчера';
    return ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'][dt(date).getDay()];
  }
  function hdRing(s){
    const R=57,C=Math.round(2*Math.PI*R*100)/100,segs=s.groups.filter(g=>g.completed>0),gap=segs.length>1?14:0;
    let pos=0,arcs='';
    for(const g of segs){
      const len=g.completed/s.total*C,dash=Math.max(.5,len-gap),offset=-(pos+gap/2);pos+=len;
      arcs+='<circle class="hd-seg" cx="68" cy="68" r="'+R+'" fill="none" stroke="'+g.color+'" stroke-width="10" stroke-linecap="round" stroke-dasharray="'+dash.toFixed(2)+' '+(C-dash).toFixed(2)+'" stroke-dashoffset="'+offset.toFixed(2)+'" style="color:'+g.color+';--hd-c:'+C+'"/>';
    }
    return '<div class="hd-ring" role="img" aria-label="Выполнено '+s.completed+' из '+s.total+' привычек, '+s.percent+' процентов"><svg viewBox="0 0 136 136" width="136" height="136" aria-hidden="true"><circle cx="68" cy="68" r="'+R+'" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="10"/><g transform="rotate(-90 68 68)">'+arcs+'</g></svg><div class="hd-ring-c"><b>'+s.completed+' / '+s.total+'</b><small>выполнено</small></div></div>';
  }
  function hdSummary(s){
    const atMin=selected<=minDate(),atMax=selected>=today();
    const chev=d=>'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+d+'"/></svg>';
    const capsule='<div class="hd-date" role="group" aria-label="Выбор даты"><button type="button" data-hd-shift="-1" aria-label="Предыдущий день" '+(atMin?'disabled':'')+'>'+chev('m15 6-6 6 6 6')+'</button><span class="hd-date-label" aria-live="polite" aria-label="'+esc(fmt(selected))+'"><b>'+selected.slice(8)+'.'+selected.slice(5,7)+'</b><span> · '+dateTag(selected)+'</span></span><button type="button" data-hd-shift="1" aria-label="Следующий день" '+(atMax?'disabled':'')+'>'+chev('m9 6 6 6-6 6')+'</button></div>';
    const complete=s.total>0&&s.completed===s.total;
    const chip=!s.total?'<span class="hd-chip">Нет привычек по расписанию</span>':complete?'<span class="hd-chip is-complete">'+iconCheck(14)+'Все привычки выполнены</span>':'<span class="hd-chip">Осталось отметить: '+(s.total-s.completed)+'</span>';
    const left='<div class="hd-col hd-col-left">'+hdRing(s)+'<div class="hd-metrics"><p class="hd-metrics-label">Выполнение за выбранный день</p><div class="hd-percent">'+s.percent+'<span>%</span></div>'+chip+(s.extra?'<p class="hd-extra">Отметок вне расписания: '+s.extra+'</p>':'')+'</div></div>';
    const tiles=s.groups.map(g=>{
      const pct=g.total?Math.round(g.completed/g.total*100):0,on=activeGroup===g.key,dim=activeGroup!==null&&!on;
      return '<button type="button" class="hd-group'+(on?' is-active':'')+(dim?' is-dim':'')+'" data-hd-group="'+g.key+'" aria-pressed="'+on+'" aria-label="'+esc(g.name)+': выполнено '+g.completed+' из '+g.total+'" style="--hd-c:'+g.color+';--hd-c-a:'+rgba(g.color,.13)+';--hd-c-b:'+rgba(g.color,.5)+'"><span class="hd-group-top"><span class="hd-group-ico" aria-hidden="true">'+esc(g.emoji)+'</span><span class="hd-group-name">'+esc(g.name)+'</span><span class="hd-group-count">'+g.completed+'/'+g.total+'</span></span><span class="hd-bar" aria-hidden="true"><i style="width:'+pct+'%"></i></span></button>';
    }).join('');
    const right='<div class="hd-col hd-col-right"><div class="hd-groups-head"><h3>Группы привычек в трекере</h3>'+(activeGroup!==null?'<button type="button" class="hd-reset" data-hd-reset>Показать все</button>':'')+'</div><div class="hd-groups" role="group" aria-label="Фильтр по группам привычек">'+tiles+'</div></div>';
    return '<section class="hd-module" aria-labelledby="hd-title"><header class="hd-head"><h2 class="hd-title" id="hd-title">Привычки дня</h2>'+capsule+'</header><div class="hd-body">'+left+right+'</div></section>';
  }

  window.foodHabitsView=function(){
    if(!validDate(selected))selected=today();
    const list=active(),settings=config(),stats=hdStats(list,settings,selected);
    if(activeGroup!==null&&!stats.groups.some(g=>g.key===activeGroup))activeGroup=null;
    const shown=activeGroup===null?list:list.filter(d=>gkey(d)===activeGroup);
    return '<h1>Привычки</h1>'+(list.length?'<div class="hd-shell">'+hdSummary(stats)+'<div class="hb-grid">'+shown.map(d=>habitCard(d,settings[d.id])).join('')+'</div></div>':'<section class="card"><h2>Пока нет выбранных привычек</h2><p>Поставьте галочки в «Мои цели → Привычки». После успешного сохранения здесь появятся трекеры.</p></section>')+'<p class="mu">Выбор и параметры берутся из раздела «Мои цели → Привычки».</p><p class="subtle">Отметки — ваш самоотчёт. Отсутствие отметки не означает невыполнение. История хранится в этом браузере; снятие галочки в анкете не удаляет прошлые отметки. Время не включает отправку уведомлений.</p><div class="habit-settings-footer"><button type="button" class="btn s" data-habit-settings>Настроить привычки</button></div>';
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
    const target=event.target;if(!target.closest)return;
    if(target.closest('[data-habit-settings]'))foodHabitsSettings();
    const info=target.closest('[data-hb-info]');
    if(info){
      const pop=document.getElementById(info.getAttribute('aria-controls'));
      if(pop){const open=pop.hidden;closePops(pop);pop.hidden=!open;info.setAttribute('aria-expanded',String(open));}
      return;
    }
    if(!target.closest('.hb-pop'))closePops();
    const shift=target.closest('[data-hd-shift]');
    if(shift){
      const n=Number(shift.dataset.hdShift),date=dt(selected);date.setDate(date.getDate()+n);
      const key=dk(date);
      if(key>today()||key<minDate())return;
      onDateChange(key);
      document.querySelector('[data-hd-shift="'+n+'"]:not(:disabled)')?.focus({preventScroll:true});
      return;
    }
    const group=target.closest('[data-hd-group]');
    if(group){
      const key=Number(group.dataset.hdGroup);
      onFilterChange(key);
      document.querySelector('[data-hd-group="'+key+'"]')?.focus({preventScroll:true});
      return;
    }
    if(target.closest('[data-hd-reset]')){onFilterChange(null);return;}
    const day=target.closest('[data-hb-day]');
    if(day){
      const id=day.dataset.habit,date=day.dataset.date;
      onToggleDay(id,date,day.getAttribute('aria-pressed')!=='true');
      document.querySelector('[data-hb-day][data-habit="'+id+'"][data-date="'+date+'"]')?.focus({preventScroll:true});
      return;
    }
    const cta=target.closest('[data-hb-cta]');
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
  const style=document.createElement('style');style.textContent='.habit-settings-footer{margin-top:24px}';document.head.appendChild(style);

  /* Habit cards (.hb-) and summary module (.hd-): shared tokens in :root */
  if(!document.getElementById('hb-fonts')){const link=document.createElement('link');link.id='hb-fonts';link.rel='stylesheet';link.href='https://fonts.googleapis.com/css2?family=Exo+2:wght@600;700;800&family=Inter:wght@400;500;600&display=swap';document.head.appendChild(link);}
  const hb=document.createElement('style');hb.id='hb-style';hb.textContent=`
:root{--hb-bg:#041410;--hb-glow:#0A2B22;--hb-surface:rgba(11,34,28,.62);--hb-line:rgba(180,247,74,.16);--hb-acc:#B4F74A;--hb-acc2:#92E619;--hb-acc-glow:rgba(180,247,74,.32);--hb-tx:#F2FBF7;--hb-tx2:#8FAEA3;--hb-tx3:#5D7D72;--hb-head:'Exo 2',system-ui,sans-serif;--hb-ui:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif;--hd-tx2:#93B4A8;--hd-tx3:#5F8074}
.hd-shell{display:flex;flex-direction:column;gap:16px;max-width:1160px;margin:0 auto 16px;padding:14px;border-radius:30px;background:radial-gradient(120% 80% at 50% 0%,var(--hb-glow) 0%,var(--hb-bg) 72%)}
.hd-module{padding:22px 24px;border-radius:26px;background:rgba(11,34,28,.68);-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);border:1px solid var(--hb-line);box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 18px 40px -26px rgba(0,0,0,.8);color:var(--hb-tx);font-family:var(--hb-ui);box-sizing:border-box;min-width:0}
.hd-module *{box-sizing:border-box}
.hd-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px 16px;margin-bottom:22px}
.hd-module .hd-title{margin:0;color:var(--hb-tx);font:700 24px/1.2 var(--hb-head)}
.hd-date{display:inline-flex;align-items:center;gap:4px;padding:4px;border-radius:999px;background:rgba(255,255,255,.05);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.1);box-shadow:inset 0 1px 0 rgba(255,255,255,.05)}
.hd-module .hd-date button{display:grid;place-items:center;width:32px;height:32px;margin:0;padding:0;border-radius:50%;background:transparent;border:0;color:var(--hb-tx);cursor:pointer;transition:background .2s,color .2s}
.hd-module .hd-date button:hover:not(:disabled){background:rgba(180,247,74,.12);color:var(--hb-acc)}
.hd-module .hd-date button:disabled{color:var(--hd-tx3);cursor:default;opacity:.55}
.hd-date-label{min-width:112px;padding:0 6px;text-align:center;white-space:nowrap;color:var(--hd-tx2);font:500 13px/1 var(--hb-ui)}
.hd-date-label b{color:var(--hb-tx);font:700 15px/1 var(--hb-head);font-variant-numeric:tabular-nums}
.hd-body{display:grid;grid-template-columns:1.1fr 1fr;gap:0}
.hd-col{min-width:0}
.hd-col-left{display:flex;align-items:center;flex-wrap:wrap;gap:20px 24px;padding-right:28px}
.hd-col-right{padding-left:28px;border-left:1px solid rgba(255,255,255,.08)}
.hd-ring{position:relative;flex:none;width:136px;height:136px}
.hd-ring svg{display:block;width:136px;height:136px;overflow:visible}
.hd-seg{filter:drop-shadow(0 0 4px currentColor);animation:hd-seg-in .9s cubic-bezier(.2,.8,.2,1) both}
@keyframes hd-seg-in{from{stroke-dasharray:0 var(--hd-c)}}
.hd-ring-c{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1}
.hd-ring-c b{color:var(--hb-tx);font:800 26px/1 var(--hb-head);font-variant-numeric:tabular-nums;white-space:nowrap}
.hd-ring-c small{margin-top:5px;color:var(--hd-tx2);font:500 11px/1 var(--hb-ui)}
.hd-metrics{flex:1 1 150px;min-width:0}
.hd-module .hd-metrics-label{margin:0 0 6px;color:var(--hd-tx2);font:500 13px/1.35 var(--hb-ui)}
.hd-percent{margin:0 0 12px;color:var(--hb-tx);font:700 44px/1 var(--hb-head);font-variant-numeric:tabular-nums}
.hd-percent span{margin-left:2px;color:var(--hd-tx2);font-size:22px}
.hd-chip{display:inline-flex;align-items:center;gap:6px;max-width:100%;padding:6px 12px;border-radius:999px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:var(--hb-tx);font:600 13px/1.3 var(--hb-ui)}
.hd-chip.is-complete{background:rgba(180,247,74,.14);border-color:rgba(180,247,74,.5);color:var(--hb-acc);box-shadow:0 0 18px -6px var(--hb-acc-glow)}
.hd-module .hd-extra{margin:8px 0 0;color:var(--hd-tx3);font:500 12px/1.3 var(--hb-ui)}
.hd-groups-head{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:30px;margin-bottom:12px}
.hd-module .hd-groups-head h3{margin:0;color:var(--hd-tx2);font:600 12px/1.3 var(--hb-ui);letter-spacing:.08em;text-transform:uppercase}
.hd-module .hd-reset{flex:none;margin:0;padding:5px 11px;border-radius:999px;background:rgba(180,247,74,.1);border:1px solid var(--hb-line);color:var(--hb-acc);font:600 12px/1.2 var(--hb-ui);cursor:pointer}
.hd-module .hd-reset:hover{border-color:var(--hb-acc)}
.hd-groups{display:flex;flex-direction:column;gap:8px}
.hd-module .hd-group{display:block;width:100%;margin:0;padding:12px 14px;border-radius:16px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.06);color:var(--hb-tx);font-family:var(--hb-ui);text-align:left;cursor:pointer;transition:opacity .25s,border-color .25s,background .25s,transform .15s}
.hd-module .hd-group:hover{border-color:var(--hd-c-b)}
.hd-module .hd-group:active{transform:scale(.99)}
.hd-module .hd-group.is-active{border-color:var(--hd-c);background:var(--hd-c-a)}
.hd-module .hd-group.is-dim{opacity:.5}
.hd-group-top{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:10px}
.hd-group-ico{display:grid;place-items:center;width:30px;height:30px;border-radius:10px;background:var(--hd-c-a);box-shadow:inset 0 0 0 1px var(--hd-c-b);font:400 16px/1 'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif}
.hd-group-name{min-width:0;font:600 14px/1.3 var(--hb-ui);overflow-wrap:anywhere}
.hd-group-count{color:var(--hb-tx);font:700 15px/1 var(--hb-head);font-variant-numeric:tabular-nums;white-space:nowrap;text-align:right}
.hd-bar{display:block;height:4px;margin-top:10px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden}
.hd-bar i{display:block;height:100%;border-radius:999px;background:var(--hd-c);box-shadow:0 0 8px var(--hd-c-b);transition:width .6s cubic-bezier(.2,.8,.2,1);animation:hd-bar-in .7s cubic-bezier(.2,.8,.2,1) both}
@keyframes hd-bar-in{from{width:0}}
.hd-module button:focus-visible{outline:2px solid var(--hb-acc);outline-offset:2px}
@media(max-width:859px){.hd-module{padding:18px 16px}.hd-module .hd-title{font-size:22px}.hd-body{grid-template-columns:minmax(0,1fr)}.hd-col-left{padding:0 0 22px;border-bottom:1px solid rgba(255,255,255,.08)}.hd-col-right{padding:22px 0 0;border-left:0}}
@media(max-width:400px){.hd-date-label{min-width:96px}.hd-percent{font-size:40px}}
.hb-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(360px,100%),1fr));gap:16px}
.hb-card{position:relative;display:flex;flex-direction:column;gap:16px;min-width:0;padding:18px;border-radius:26px;background:var(--hb-surface);-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);border:1px solid var(--hb-line);box-shadow:inset 0 1px 0 rgba(255,255,255,.06),0 18px 40px -26px rgba(0,0,0,.8);color:var(--hb-tx);font-family:var(--hb-ui);box-sizing:border-box}
.hb-card *{box-sizing:border-box}
.hb-top{display:flex;align-items:center;justify-content:space-between;gap:12px}
.hb-badge{display:inline-flex;align-items:center;gap:7px;min-width:0;padding:6px 11px;border-radius:999px;background:var(--hb-g-a,rgba(180,247,74,.08));border:1px solid var(--hb-g-b,var(--hb-line));color:var(--hb-g,var(--hb-acc))}
.hb-badge-emoji{flex:none;font:400 14px/1 'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif}
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
@media(prefers-reduced-motion:reduce){.hb-ring-arc,.hd-seg,.hd-bar i{animation:none}.hb-card .hb-cta,.hb-card .hb-day,.hb-card .hb-info,.hd-module .hd-group,.hd-bar i{transition:none}}
`;document.head.appendChild(hb);
  render();
})();
