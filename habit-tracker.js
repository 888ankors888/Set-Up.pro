(() => {
  if(window.foodHabitTrackerInstalled)return;
  window.foodHabitTrackerInstalled=true;
  let selected=today(),activeGroup=null,addTab='list',dlg=null;
  const cardDate={};
  const openGroups=new Set();
  const schedules={daily:'Каждый день',weekdays:'По будням',weekends:'По выходным',flexible:'По возможности'};
  const SCHEDULE_OPTIONS=[['daily','Каждый день'],['weekdays','По будням'],['weekends','По выходным'],['flexible','По возможности']];

  /* Habits = canonical habits from "Мои данные" + custom habits created in the tracker (S.customHabits) */
  const baseDefs=()=>window.foodHabitDefinitions?.()||[];
  const baseConfig=()=>window.foodHabitSettings?.()||{};
  const customList=()=>Array.isArray(S.customHabits)?S.customHabits.filter(h=>h&&typeof h.id==='string'&&typeof h.title==='string'&&Number.isInteger(h.group)):[];
  const customDefs=()=>customList().map(h=>{const base=baseDefs().find(d=>d.group===h.group)||{};return {id:h.id,title:h.title,category:base.category||'Своя привычка',image:base.image||'✨',group:h.group,canonical:true,custom:true}});
  const definitions=()=>[...baseDefs(),...customDefs()];
  const config=()=>{const out={...baseConfig()};for(const h of customList())out[h.id]={enabled:true,target:'',schedule:h.schedule||'daily',time:''};return out};
  const validDate=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&dk(dt(d))===d&&d<=today();
  const active=()=>definitions().filter(d=>config()[d.id]?.enabled===true);
  const due=(c,date)=>{const day=dt(date).getDay();return c.schedule==='daily'||c.schedule==='weekdays'&&day>=1&&day<=5||c.schedule==='weekends'&&(day===0||day===6)};
  const done=(id,date)=>S.habitTracker?.records?.[date]?.[id]?.done===true;
  const title=(d,c)=>d.id==='13:4'?(c.target||'Своя привычка'):d.title;
  const gkey=d=>Number.isInteger(d.group)?d.group:Number(d.id.split(':')[0]);
  const minDate=()=>{const d=dt(today());d.setDate(d.getDate()-6);return dk(d)};
  const cardSel=id=>{const v=cardDate[id];return validDate(v)&&v>=minDate()?v:today()};
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
  window.foodHabitsGo=function(){editing=false;tab='habits';selected=today();for(const k of Object.keys(cardDate))delete cardDate[k];render();scrollTo(0,0)};
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
  function onDateChange(date,habitId){
    const hook=window.hbOnDateChange;
    if(typeof hook==='function'&&hook(date,habitId)===false)return;
    cardDate[habitId]=date;
    render();
  }
  function onFilterChange(groupId){
    const next=groupId!==null&&activeGroup===groupId?null:groupId;
    const hook=window.hbOnFilterChange;
    if(typeof hook==='function'&&hook(next)===false)return;
    activeGroup=next;
    render();
  }

  /* Group meta: one emoji and one scale colour per habit group (shared by the summary, the cards and the add module).
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
  const iconPlus=n=>'<svg viewBox="0 0 24 24" width="'+n+'" height="'+n+'" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
  const rgba=(hex,a)=>{const n=parseInt(hex.slice(1),16);return 'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+a+')'};
  function groupMeta(d){
    const key=gkey(d),name=d.category||'Группа',n=name.toLowerCase();
    let item=GROUPS.find(g=>n.includes(g[0]));
    if(!item&&n.includes('эмоцион'))item=GROUPS[1];
    if(!item&&n.includes('активн'))item=GROUPS[3];
    if(!item)item=GROUPS[key]||['','#B4F74A','✨'];
    return {key,name,color:item[1],emoji:d.image||item[2]};
  }
  const weekKeys=()=>Array.from({length:7},(_,i)=>{const date=dt(today());date.setDate(date.getDate()+i-6);return dk(date)});
  const shortDate=k=>k.slice(8)+'.'+k.slice(5,7);

  function habitCard(d,c){
    const id=d.id,keys=weekKeys(),sel=cardSel(id),isToday=sel===today(),marked=done(id,sel),scheduled=due(c,sel),count=keys.filter(k=>done(id,k)).length,meta=groupMeta(d);
    const uid=id.replace(':','-'),R=34,C=Math.round(2*Math.PI*R*100)/100,off=Math.round(C*(1-count/7)*100)/100;
    const chips=[schedules[c.schedule]||'Расписание не указано'];
    if(d.custom)chips.push('Своя привычка');
    if(c.time)chips.push('В '+c.time);
    if(id==='0:0')chips.push('Цель: '+(c.target||S.profile?.nutritionGoalSettings?.waterMl||S.waterGoal||'—')+' мл');
    else if(id!=='13:4'&&c.target)chips.push('Ориентир: '+c.target);
    const when=isToday?'сегодня':shortDate(sel);
    const status=marked?'Выполнено: '+when:scheduled?'Запланировано: '+when:c.schedule==='flexible'?'Необязательная отметка — по возможности':'Вне расписания — можно отметить дополнительно';
    const info=id==='0:0'?'Это ручная отметка привычки: она не добавляет воду в дневник и не проверяет выпитый объём.':'Это ручная отметка привычки: она отражает ваш самоотчёт и ничего не проверяет автоматически.';
    const cells=keys.map(k=>{const m=done(id,k),on=k===sel;return '<button type="button" class="hb-day'+(m?' is-done':'')+(on?' is-selected':'')+'" data-hb-day data-habit="'+esc(id)+'" data-date="'+k+'" aria-pressed="'+on+'" aria-label="'+esc(fmt(k))+': '+(m?'выполнено':'нет отметки')+(on?', выбранный день':', нажмите, чтобы выбрать этот день')+'"><span class="hb-day-date">'+shortDate(k)+'</span><span class="hb-day-mark" aria-hidden="true">'+(m?iconCheck(14):'—')+'</span></button>'}).join('');
    const ring='<div class="hb-ring" role="img" aria-label="Выполнено '+count+' из 7 дней"><svg viewBox="0 0 80 80" width="80" height="80" aria-hidden="true"><defs><linearGradient id="hb-g-'+uid+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B4F74A"/><stop offset="1" stop-color="#92E619"/></linearGradient></defs><circle class="hb-ring-track" cx="40" cy="40" r="'+R+'" fill="none" stroke-width="7"/>'+(count?'<circle class="hb-ring-arc" cx="40" cy="40" r="'+R+'" fill="none" stroke="url(#hb-g-'+uid+')" stroke-width="7" stroke-linecap="round" stroke-dasharray="'+C+'" stroke-dashoffset="'+off+'" style="--hb-c:'+C+'"/>':'')+'</svg><div class="hb-ring-c"><b>'+count+'/7</b><small>за 7 дн.</small></div></div>';
    const ctaText=marked?'Выполнено'+(isToday?'':' · '+shortDate(sel)):'Отметить выполнение'+(isToday?'':' · '+shortDate(sel));
    return '<section class="hb-card" data-hb-habit="'+esc(id)+'" data-hb-group="'+meta.key+'" style="--hb-g:'+meta.color+';--hb-g-a:'+rgba(meta.color,.1)+';--hb-g-b:'+rgba(meta.color,.35)+'">'
      +'<div class="hb-top"><span class="hb-badge"><span class="hb-badge-emoji" aria-hidden="true">'+esc(meta.emoji)+'</span><span class="hb-badge-text">'+esc(meta.name)+'</span></span><button type="button" class="hb-info" data-hb-info aria-expanded="false" aria-controls="hb-pop-'+uid+'" aria-label="Ручная отметка: пояснение">i</button></div>'
      +'<div class="hb-pop" id="hb-pop-'+uid+'" role="note" hidden>'+esc(info)+'</div>'
      +'<div class="hb-head"><div class="hb-head-main"><h2 class="hb-title">'+esc(title(d,c))+'</h2><div class="hb-chips">'+chips.map(x=>'<span class="hb-chip">'+esc(x)+'</span>').join('')+'</div><p class="hb-status'+(marked?' is-done':'')+'"><span class="hb-status-dot" aria-hidden="true"></span>'+esc(status)+'</p></div>'+ring+'</div>'
      +'<button type="button" class="hb-cta'+(marked?' is-done':'')+'" data-hb-cta data-habit="'+esc(id)+'" data-date="'+sel+'" aria-pressed="'+marked+'"><span class="hb-cta-box" aria-hidden="true">'+iconCheck(16)+'</span><span>'+ctaText+'</span></button>'
      +'<div class="hb-days" role="group" aria-label="Выбор дня для отметки, последние семь дней">'+cells+'</div></section>';
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
    const complete=s.total>0&&s.completed===s.total;
    const rem=s.total-s.completed;
    const badge='<div class="hd-badge'+(complete?' is-complete':'')+'">'+(!s.total?'Нет привычек на сегодня':complete?'Все привычки выполнены':'Осталось отметить:&nbsp;<b>'+rem+'</b>')+'</div>';
    const addBtn='<button type="button" class="hd-addround" data-hb-add aria-label="Добавить привычку"><span class="hd-addround-c"><svg viewBox="0 0 116 116" aria-hidden="true"><circle cx="58" cy="58" r="42" fill="none" stroke="rgba(176,247,65,.14)" stroke-width="1.35"/><path d="M43 22.8A38 38 0 0 1 73 22.8M43 93.2A38 38 0 0 0 73 93.2" fill="none" stroke="rgba(176,247,65,.24)" stroke-width="1.6" stroke-linecap="round"/><g fill="none" stroke="rgba(175,230,100,.36)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="20.5" y="42" width="16" height="16" rx="4.5"/><path d="M24.8 50.2L27.6 53L32.6 47.4"/><line x1="28.5" y1="62.5" x2="28.5" y2="75"/><circle cx="28.5" cy="75" r="1.4"/><circle cx="81.5" cy="46.5" r="2"/><line x1="86.5" y1="46.5" x2="95.5" y2="46.5"/><circle cx="81.5" cy="58" r="2"/><line x1="86.5" y1="58" x2="95.5" y2="58"/><circle cx="81.5" cy="69.5" r="2"/><line x1="86.5" y1="69.5" x2="93.5" y2="69.5"/></g><g stroke="#d4ff70" stroke-width="4.2" stroke-linecap="round" style="filter:drop-shadow(0 0 3px #b4f747)"><line x1="58" y1="45.5" x2="58" y2="70.5"/><line x1="45.5" y1="58" x2="70.5" y2="58"/></g></svg></span><span class="hd-addround-l">Добавить<br>привычку</span></button>';
    const mid='<div class="hd-mid"><span class="hd-mid-l">Выполнение</span><div class="hd-percent">'+s.percent+'<span>%</span></div><span class="hd-mid-l">сегодня</span>'+(s.extra?'<p class="hd-extra">Отметок вне расписания: '+s.extra+'</p>':'')+'</div>';
    const reset=activeGroup!==null?'<button type="button" class="hd-reset" data-hd-reset>Показать все группы</button>':'';
    return '<section class="hd-module" aria-labelledby="hd-title"><header class="hd-head"><h2 class="hd-title" id="hd-title">Привычки дня</h2>'+badge+'</header><div class="hd-body3">'+hdRing(s)+mid+addBtn+'</div>'+reset+'</section>';
  }

  function groupList(){
    const map=new Map();
    for(const d of baseDefs()){
      if(d.id==='13:4')continue;
      const meta=groupMeta(d);
      if(!map.has(meta.key))map.set(meta.key,{...meta,defs:[]});
      map.get(meta.key).defs.push(d);
    }
    return [...map.values()].sort((a,b)=>a.key-b.key);
  }
  function dialogEl(){
    if(dlg)return dlg;
    dlg=document.createElement('dialog');
    dlg.className='hb-dlg';
    dlg.setAttribute('aria-labelledby','hb-dlg-title');
    dlg.addEventListener('click',onDialogClick);
    dlg.addEventListener('change',onDialogChange);
    dlg.addEventListener('submit',onDialogSubmit);
    dlg.addEventListener('toggle',event=>{const node=event.target;if(node.matches?.('details[data-group]')){const key=Number(node.dataset.group);if(node.open)openGroups.add(key);else openGroups.delete(key);}},true);
    document.body.appendChild(dlg);
    return dlg;
  }
  function renderDialog(){
    const d=dialogEl(),cfg=config(),groups=groupList();
    const scroll=d.scrollTop;
    const tabs=[['list','Из списка'],['custom','Своя привычка']];
    let body;
    if(addTab==='list'){
      body='<p class="hb-dlg-note">Отметьте привычки, которые хотите отслеживать. Они сразу появятся в трекере.</p>'+groups.map(g=>{
        const added=g.defs.filter(x=>cfg[x.id]?.enabled===true).length;
        return '<details class="hb-dg" data-group="'+g.key+'"'+(openGroups.has(g.key)?' open':'')+' style="--hg:'+g.color+';--hg-a:'+rgba(g.color,.12)+';--hg-b:'+rgba(g.color,.4)+'"><summary><span class="hb-dg-ico" aria-hidden="true">'+esc(g.emoji)+'</span><span class="hb-dg-name">'+esc(g.name)+'</span><span class="hb-dg-count">'+(added?'Добавлено: '+added:'Выбрать')+'</span></summary><div class="hb-dg-list">'+g.defs.map(x=>{
          const c=cfg[x.id]||{},on=c.enabled===true;
          return '<div class="hb-dh"><label class="hb-dh-main"><input type="checkbox" data-dlg-habit="'+esc(x.id)+'" '+(on?'checked':'')+'><span>'+esc(x.title)+'</span></label>'+(on?'<select class="hb-dh-sched" data-dlg-schedule="'+esc(x.id)+'" aria-label="Как часто: '+esc(x.title)+'">'+SCHEDULE_OPTIONS.map(([v,t])=>'<option value="'+v+'"'+((c.schedule||'daily')===v?' selected':'')+'>'+t+'</option>').join('')+'</select>':'')+'</div>';
        }).join('')+'</div></details>';
      }).join('');
    }else{
      const mine=customList();
      body='<form class="hb-dlg-form" data-dlg-form novalidate><label for="hb-new-name">Название привычки</label><input id="hb-new-name" name="name" type="text" maxlength="80" placeholder="Например: Читать 20 минут перед сном" autocomplete="off" required><label for="hb-new-group">Группа</label><select id="hb-new-group" name="group">'+groups.map(g=>'<option value="'+g.key+'">'+esc(g.emoji+' '+g.name)+'</option>').join('')+'</select><label for="hb-new-schedule">Как часто</label><select id="hb-new-schedule" name="schedule">'+SCHEDULE_OPTIONS.map(([v,t])=>'<option value="'+v+'">'+t+'</option>').join('')+'</select><p class="hb-dlg-error" data-dlg-error role="alert" hidden></p><button type="submit" class="hb-dlg-submit">'+iconPlus(16)+'<span>Добавить и отслеживать</span></button></form>'
        +(mine.length?'<h3 class="hb-dlg-sub">Мои привычки</h3><ul class="hb-dlg-mine">'+mine.map(h=>{const base=baseDefs().find(x=>x.group===h.group)||{},meta=groupMeta({...h,category:base.category,image:base.image});return '<li style="--hg:'+meta.color+'"><span class="hb-dlg-mine-ico" aria-hidden="true">'+esc(meta.emoji)+'</span><span class="hb-dlg-mine-name">'+esc(h.title)+'<small>'+esc(meta.name+' · '+(schedules[h.schedule]||schedules.daily))+'</small></span><button type="button" class="hb-dlg-del" data-dlg-del="'+esc(h.id)+'" aria-label="Удалить привычку: '+esc(h.title)+'">Удалить</button></li>'}).join('')+'</ul>':'<p class="hb-dlg-note">Своя привычка появится в трекере как обычная карточка: можно отмечать дни и видеть прогресс.</p>');
    }
    d.innerHTML='<div class="hb-dlg-head"><h2 id="hb-dlg-title">Добавить привычку</h2><button type="button" class="hb-dlg-x" data-dlg-close aria-label="Закрыть">×</button></div><div class="hb-dlg-tabs" role="tablist">'+tabs.map(([id,label])=>'<button type="button" role="tab" data-dlg-tab="'+id+'" aria-selected="'+(addTab===id)+'">'+label+'</button>').join('')+'</div><div class="hb-dlg-body">'+body+'</div>';
    d.scrollTop=scroll;
  }
  function openAddDialog(tabName){
    addTab=tabName==='custom'?'custom':'list';
    renderDialog();
    const d=dialogEl();
    if(!d.open)d.showModal();
    d.scrollTop=0;
  }
  function setBaseHabit(id,patch){
    try{
      if(!S.profile)throw Error('Сначала заполните анкету');
      const profile=JSON.parse(JSON.stringify(S.profile)),items={...baseConfig()};
      const current=items[id]||{enabled:false,target:'',schedule:'daily',time:''};
      const next={...current,...patch};
      if(patch.enabled&&id==='0:0'&&!next.target)next.target=String(profile.nutritionGoalSettings?.waterMl||S.waterGoal||2000);
      items[id]=next;
      profile.habitsV2={version:1,items};
      write({...S,profile});
    }catch(e){toast(e.message||'Не удалось сохранить привычку');}
    render();
    renderDialog();
  }
  function addCustom(form){
    const error=form.querySelector('[data-dlg-error]'),name=form.elements.name.value.trim().replace(/\s+/g,' '),group=Number(form.elements.group.value),schedule=form.elements.schedule.value;
    const fail=text=>{error.textContent=text;error.hidden=false;form.elements.name.focus();};
    if(!name)return fail('Введите название привычки');
    if(name.length>80)return fail('Название не длиннее 80 символов');
    if(!Number.isInteger(group)||!SCHEDULE_OPTIONS.some(o=>o[0]===schedule))return fail('Проверьте группу и расписание');
    const list=customList();
    if(list.length>=30)return fail('Можно добавить не больше 30 своих привычек');
    if(list.some(h=>h.group===group&&h.title.toLowerCase()===name.toLowerCase()))return fail('Такая привычка уже есть в этой группе');
    const id='c:'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
    try{
      write({...S,customHabits:[...list,{id,title:name,group,schedule,createdAt:new Date().toISOString()}]});
    }catch(e){return fail('Не удалось сохранить привычку');}
    toast('Привычка добавлена: '+name);
    render();
    renderDialog();
    dialogEl().close();
  }
  function removeCustom(id){
    const habit=customList().find(h=>h.id===id);
    if(!habit||!confirm('Удалить привычку «'+habit.title+'»? История отметок сохранится.'))return;
    write({...S,customHabits:customList().filter(h=>h.id!==id)});
    render();
    renderDialog();
  }
  function onDialogClick(event){
    const target=event.target;
    if(target===dlg){dlg.close();return;}
    if(target.closest('[data-dlg-close]')){dlg.close();return;}
    const tabButton=target.closest('[data-dlg-tab]');
    if(tabButton){addTab=tabButton.dataset.dlgTab;renderDialog();dlg.querySelector('[data-dlg-tab="'+addTab+'"]')?.focus();return;}
    const del=target.closest('[data-dlg-del]');
    if(del)removeCustom(del.dataset.dlgDel);
  }
  function onDialogChange(event){
    const input=event.target;
    if(input.matches('[data-dlg-habit]')){
      const id=input.dataset.dlgHabit;
      setBaseHabit(id,{enabled:input.checked});
      dlg.querySelector('[data-dlg-habit="'+id+'"]')?.focus();
    }else if(input.matches('[data-dlg-schedule]')){
      const id=input.dataset.dlgSchedule;
      setBaseHabit(id,{schedule:input.value});
      dlg.querySelector('[data-dlg-schedule="'+id+'"]')?.focus();
    }
  }
  function onDialogSubmit(event){
    const form=event.target.closest?.('[data-dlg-form]');
    if(!form)return;
    event.preventDefault();
    addCustom(form);
  }

  window.foodHabitsView=function(){
    if(!validDate(selected))selected=today();
    const list=active(),settings=config(),stats=hdStats(list,settings,today());
    if(activeGroup!==null&&!stats.groups.some(g=>g.key===activeGroup))activeGroup=null;
    const shown=activeGroup===null?list:list.filter(d=>gkey(d)===activeGroup);
    return '<h1>Привычки</h1>'+(list.length?'<div class="hd-shell">'+hdSummary(stats)+'<div class="hb-grid">'+shown.map(d=>habitCard(d,settings[d.id])).join('')+'</div></div>':'<section class="card"><h2>Пока нет выбранных привычек</h2><p>Добавьте первую привычку прямо здесь — выберите из готовых групп или создайте свою.</p><button type="button" class="btn" data-hb-add>Добавить привычку</button></section>')+'<div class="habit-settings-footer"><button type="button" class="btn s" data-habit-settings>Настроить привычки</button></div>';
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
    if(input.closest?.('.hb-dlg'))return;
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
    if(target.closest('[data-hb-add]')){openAddDialog('list');return;}
    const info=target.closest('[data-hb-info]');
    if(info){
      const pop=document.getElementById(info.getAttribute('aria-controls'));
      if(pop){const open=pop.hidden;closePops(pop);pop.hidden=!open;info.setAttribute('aria-expanded',String(open));}
      return;
    }
    if(!target.closest('.hb-pop'))closePops();
    const group=target.closest('[data-hd-group]');
    if(group){
      const key=Number(group.dataset.hdGroup);
      onFilterChange(key);
      document.querySelector('[data-hd-group="'+key+'"]')?.focus({preventScroll:true});
      return;
    }
    if(target.closest('[data-hd-reset]')){onFilterChange(null);return;}
    /* A tap on a date in the card only SELECTS the day for that habit; the mark is set by the "Отметить выполнение" button (today or past days only) */
    const day=target.closest('[data-hb-day]');
    if(day){
      const id=day.dataset.habit,date=day.dataset.date;
      if(!validDate(date)||date<minDate())return;
      onDateChange(date,id);
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

  /* Habit cards (.hb-), summary module (.hd-) and add-habit dialog (.hb-dlg): shared tokens in :root */
  if(!document.getElementById('hb-fonts')){const link=document.createElement('link');link.id='hb-fonts';link.rel='stylesheet';link.href='https://fonts.googleapis.com/css2?family=Exo+2:wght@600;700;800&family=Inter:wght@400;500;600&display=swap';document.head.appendChild(link);}
  const hb=document.createElement('style');hb.id='hb-style';hb.textContent=`
:root{--hb-bg:#041410;--hb-glow:#0A2B22;--hb-surface:rgba(11,34,28,.62);--hb-line:rgba(180,247,74,.16);--hb-acc:#B4F74A;--hb-acc2:#92E619;--hb-acc-glow:rgba(180,247,74,.32);--hb-tx:#F2FBF7;--hb-tx2:#8FAEA3;--hb-tx3:#5D7D72;--hb-head:'Exo 2',system-ui,sans-serif;--hb-ui:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif;--hd-tx2:#93B4A8;--hd-tx3:#5F8074}
.hd-shell{display:flex;flex-direction:column;gap:16px;max-width:1160px;margin:0 auto 16px;padding:14px;border-radius:30px;background:radial-gradient(120% 80% at 50% 0%,var(--hb-glow) 0%,var(--hb-bg) 72%)}
.hd-module{padding:22px 24px;border-radius:26px;background:rgba(11,34,28,.68);-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);border:1px solid var(--hb-line);box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 18px 40px -26px rgba(0,0,0,.8);color:var(--hb-tx);font-family:var(--hb-ui);box-sizing:border-box;min-width:0}
.hd-module *{box-sizing:border-box}
.hd-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px 16px;margin-bottom:22px}
.hd-module .hd-title{margin:0 auto 0 0;color:var(--hb-tx);font:700 24px/1.2 var(--hb-head)}
.hd-module .hd-add{display:inline-flex;align-items:center;gap:8px;margin:0;padding:10px 16px;border-radius:999px;background:rgba(180,247,74,.12);border:1px solid var(--hb-line);color:var(--hb-acc);font:600 14px/1.2 var(--hb-ui);cursor:pointer;box-shadow:0 0 18px -8px var(--hb-acc-glow);transition:background .2s,border-color .2s,transform .15s}
.hd-module .hd-add:hover{background:rgba(180,247,74,.2);border-color:var(--hb-acc)}
.hd-module .hd-add:active{transform:scale(.97)}
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
@media(max-width:400px){.hd-percent{font-size:40px}}
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
.hb-card .hb-day{display:flex;flex-direction:column;align-items:center;gap:6px;min-width:0;margin:0;padding:8px 0 7px;border-radius:12px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);color:var(--hb-tx2);font-family:var(--hb-ui);cursor:pointer;-webkit-tap-highlight-color:transparent;transition:background .2s,border-color .2s,color .2s,transform .15s}
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
/* Add-habit dialog: the dialog itself scrolls (block layout, no flex-sized body) so iOS Safari cannot collapse it */
html body dialog.hb-dlg{box-sizing:border-box;width:min(560px,calc(100vw - 20px))!important;max-width:calc(100vw - 20px)!important;height:auto!important;max-height:calc(100vh - 32px)!important;max-height:calc(100dvh - 32px)!important;margin:auto!important;padding:0!important;overflow-x:hidden!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;border-radius:26px;background:rgba(8,26,21,.97);-webkit-backdrop-filter:blur(22px);backdrop-filter:blur(22px);border:1px solid var(--hb-line);box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 28px 80px -12px rgba(0,0,0,.9);color:var(--hb-tx);font-family:var(--hb-ui)}
html body dialog.hb-dlg[open]{display:block!important}
html body dialog.hb-dlg::backdrop{background:rgba(2,10,7,.6);backdrop-filter:blur(4px)}
.hb-dlg *{box-sizing:border-box}
.hb-dlg .hb-dlg-head{position:sticky;top:0;z-index:3;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 20px 12px;background:rgba(8,26,21,.98)}
.hb-dlg .hb-dlg-head h2{margin:0;color:var(--hb-tx);font:700 22px/1.2 var(--hb-head)}
.hb-dlg .hb-dlg-x{display:grid;place-items:center;width:36px;height:36px;margin:0;padding:0;border-radius:50%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:var(--hb-tx2);font:400 22px/1 var(--hb-ui);cursor:pointer}
.hb-dlg .hb-dlg-x:hover{color:var(--hb-acc);border-color:var(--hb-acc)}
.hb-dlg .hb-dlg-tabs{display:flex;gap:6px;margin:0 20px 12px;padding:4px;border-radius:999px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08)}
.hb-dlg .hb-dlg-tabs button{flex:1;margin:0;padding:9px 10px;border-radius:999px;background:transparent;border:0;color:var(--hb-tx2);font:600 14px/1.2 var(--hb-ui);cursor:pointer;transition:background .2s,color .2s}
.hb-dlg .hb-dlg-tabs button[aria-selected=true]{background:rgba(180,247,74,.16);color:var(--hb-acc)}
html body dialog.hb-dlg .hb-dlg-body{display:block!important;flex:none!important;height:auto!important;max-height:none!important;overflow:visible!important;padding:4px 20px 22px}
.hb-dlg .hb-dlg-note{margin:4px 0 12px;color:var(--hb-tx2);font:400 13px/1.5 var(--hb-ui)}
.hb-dg{margin:0 0 8px;border-radius:16px;background:linear-gradient(135deg,var(--hg-a),rgba(255,255,255,.02));border:1px solid var(--hg-b);overflow:hidden}
.hb-dg>summary{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:10px;padding:12px 14px;list-style:none;cursor:pointer}
.hb-dg>summary::-webkit-details-marker{display:none}
.hb-dg[open]{border-color:var(--hg)}
.hb-dg-ico{display:grid;place-items:center;width:30px;height:30px;border-radius:10px;background:var(--hg-a);box-shadow:inset 0 0 0 1px var(--hg-b);font:400 16px/1 'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif}
.hb-dg-name{min-width:0;color:var(--hb-tx);font:600 14px/1.3 var(--hb-ui);overflow-wrap:anywhere}
.hb-dg-count{color:var(--hg);font:600 12px/1.2 var(--hb-ui);white-space:nowrap}
.hb-dg-list{padding:0 14px 8px}
.hb-dh{display:flex;flex-direction:column;gap:8px;padding:10px 0;border-top:1px solid rgba(255,255,255,.08)}
.hb-dlg .hb-dh-main{display:flex;align-items:flex-start;gap:10px;margin:0;color:var(--hb-tx);font:500 14px/1.4 var(--hb-ui);cursor:pointer}
.hb-dlg .hb-dh-main input{flex:none;width:20px;height:20px;margin:1px 0 0;padding:0;accent-color:var(--hg)}
.hb-dlg select,.hb-dlg input[type=text]{width:100%;margin:0;padding:11px 12px;border-radius:12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);color:var(--hb-tx);font:400 16px/1.3 var(--hb-ui)}
.hb-dlg select option{background:#0B221C;color:#F2FBF7}
.hb-dlg .hb-dh-sched{margin-left:30px;width:calc(100% - 30px);padding:8px 10px;font-size:14px}
.hb-dlg-form{display:flex;flex-direction:column;gap:6px}
.hb-dlg-form label{margin:8px 0 0;color:var(--hb-tx2);font:500 13px/1.3 var(--hb-ui)}
.hb-dlg-error{margin:6px 0 0;color:#FF8A8A;font:500 13px/1.4 var(--hb-ui)}
.hb-dlg-error[hidden]{display:none}
.hb-dlg .hb-dlg-submit{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;height:52px;margin:14px 0 0;border-radius:16px;background:linear-gradient(135deg,var(--hb-acc),var(--hb-acc2));border:0;color:#041410;font:700 15px/1 var(--hb-ui);cursor:pointer;box-shadow:0 10px 26px -10px var(--hb-acc-glow)}
.hb-dlg .hb-dlg-sub{margin:22px 0 8px;color:var(--hd-tx2);font:600 12px/1.3 var(--hb-ui);letter-spacing:.08em;text-transform:uppercase}
.hb-dlg-mine{display:flex;flex-direction:column;gap:8px;margin:0;padding:0;list-style:none}
.hb-dlg-mine li{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)}
.hb-dlg-mine-ico{font:400 18px/1 'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif}
.hb-dlg-mine-name{min-width:0;color:var(--hb-tx);font:600 14px/1.3 var(--hb-ui);overflow-wrap:anywhere}
.hb-dlg-mine-name small{display:block;margin-top:2px;color:var(--hb-tx2);font:400 12px/1.3 var(--hb-ui)}
.hb-dlg .hb-dlg-del{margin:0;padding:6px 10px;border-radius:999px;background:rgba(255,138,138,.1);border:1px solid rgba(255,138,138,.35);color:#FF8A8A;font:600 12px/1.2 var(--hb-ui);cursor:pointer}
.hb-dlg button:focus-visible,.hb-dlg input:focus-visible,.hb-dlg select:focus-visible,.hb-dlg summary:focus-visible{outline:2px solid var(--hb-acc);outline-offset:2px}
@media(max-width:520px){html body dialog.hb-dlg{width:calc(100vw - 16px)!important;border-radius:22px}.hb-dlg .hb-dlg-head{padding:16px 16px 10px}.hb-dlg .hb-dlg-tabs{margin:0 16px 10px}html body dialog.hb-dlg .hb-dlg-body{padding:4px 16px 18px}}
.hd-head{flex-wrap:nowrap}.hd-badge{display:inline-flex;align-items:center;padding:8px 16px;border-radius:999px;background:rgba(255,255,255,.03);border:1px solid rgba(155,185,165,.24);color:#c4d4cb;font:500 14px/1.2 var(--hb-ui);white-space:nowrap;font-variant-numeric:tabular-nums}.hd-badge b{color:#dceae2;font-weight:600}.hd-badge.is-complete{border-color:rgba(180,247,74,.45);background:rgba(180,247,74,.08);color:#dff899}.hd-body3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));align-items:center;justify-items:center;gap:12px}.hd-mid{display:flex;flex-direction:column;align-items:center;text-align:center}.hd-mid-l{color:var(--hd-tx2);font:400 15px/1.2 var(--hb-ui)}.hd-mid .hd-percent{margin:6px 0 8px}.hd-module .hd-addround{display:flex;flex-direction:column;align-items:center;margin:0;padding:4px;background:none;border:0;cursor:pointer;color:#dff899;font-family:var(--hb-ui)}.hd-addround-c{display:block;width:116px;height:116px;border-radius:50%;border:2.5px solid #b4f747;background:radial-gradient(circle at center,#142b1c 0,#0b1913 72%);box-shadow:0 0 18px rgba(176,247,65,.48),0 0 38px rgba(176,247,65,.22),inset 0 0 18px rgba(176,247,65,.14);transition:transform .2s,box-shadow .2s}.hd-addround-c svg{display:block;width:100%;height:100%}.hd-addround:hover .hd-addround-c{transform:scale(1.03)}.hd-addround:active .hd-addround-c{transform:scale(.97)}.hd-addround-l{margin-top:12px;font:600 15px/1.22 var(--hb-ui);text-align:center}.hd-module .hd-reset{margin-top:14px}
@media(max-width:560px){.hd-module .hd-title{font-size:19px}.hd-badge{padding:6px 10px;font-size:11px}.hd-body3{gap:4px}.hd-percent{font-size:34px}.hd-mid-l{font-size:11.5px}.hd-addround-c{width:86px;height:86px;border-width:2px}.hd-addround-l{font-size:11.5px;margin-top:8px}.hd-ring{zoom:.72}}
@media(prefers-reduced-motion:reduce){.hb-ring-arc,.hd-seg,.hd-bar i{animation:none}.hb-card .hb-cta,.hb-card .hb-day,.hb-card .hb-info,.hd-module .hd-group,.hd-bar i,.hd-module .hd-add{transition:none}}
`;document.head.appendChild(hb);
  render();
})();
