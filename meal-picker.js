(() => {
 const meals=[['Завтрак',.25],['Обед',.35],['Ужин',.30],['Перекус',.10]];
 let queued=false,observedApp=null,observer=null,aiRequested=false;
 const style=document.createElement('style');style.id='meal-block-layout';style.textContent='#unified-meals{min-width:0}#unified-meals>.unified-meals-header{display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:18px}#unified-meals>.unified-meals-header h2{margin:0}#unified-meals .unified-meals-date{font-size:14px;color:var(--mu)}#unified-meals>#meal-picker{margin:0}#unified-meals>.um-records,#unified-meals>#diary-day-ai{margin:22px 0 0!important;padding:20px 0 0!important;border:0!important;border-top:1px solid var(--ln)!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}#unified-meals>#diary-day-ai[hidden]{display:none!important}';
 style.textContent+='html:root:root:root body #meal-picker .meal-record-list{width:66.666667%;margin-left:33.333333%;min-width:0;box-sizing:border-box;display:grid;gap:8px}html:root:root:root body #meal-picker .meal-record-list:empty{display:none}html:root:root:root body #meal-picker .meal-record-list>.ent{display:grid!important;grid-template-columns:minmax(0,1fr) auto 32px!important;gap:10px!important;width:100%!important;min-width:0;margin:0!important;padding:12px!important;border-radius:16px!important;box-sizing:border-box;font-size:13px}html:root:root:root body #meal-picker .meal-record-list>.ent.nd-has-photo{grid-template-columns:34px minmax(0,1fr) auto 32px!important}html:root:root:root body #meal-picker .meal-record-list .nd-entry-main>b{font-size:15px!important;line-height:1.3}html:root:root:root body #meal-picker .meal-record-list .nd-kcal>b{font-size:22px!important}html:root:root:root body #meal-picker .meal-record-list small{font-size:11px!important}html:root:root:root body #meal-picker .meal-record-list img{width:34px!important;height:34px!important;border-radius:9px}html:root:root:root body #meal-picker .meal-record-list .nd-delete{width:32px!important;height:32px!important}html:root:root:root body #meal-picker .meal-record-list :is(.nd-entry-main,.nd-kcal){min-width:0;overflow-wrap:anywhere}@media(max-width:480px){html:root:root:root body #meal-picker .meal-record-list>.ent{grid-template-columns:minmax(0,1fr) 28px!important;gap:6px!important;padding:10px!important}html:root:root:root body #meal-picker .meal-record-list .nd-entry-main{grid-column:1;grid-row:1}html:root:root:root body #meal-picker .meal-record-list .nd-kcal{grid-column:1;grid-row:2;text-align:left!important}html:root:root:root body #meal-picker .meal-record-list .nd-delete{grid-column:2;grid-row:1 / span 2;width:28px!important;height:28px!important}html:root:root:root body #meal-picker .meal-record-list>.ent.nd-has-photo{grid-template-columns:34px minmax(0,1fr) 28px!important}html:root:root:root body #meal-picker .meal-record-list>.ent.nd-has-photo img{grid-column:1;grid-row:1}html:root:root:root body #meal-picker .meal-record-list>.ent.nd-has-photo .nd-entry-main{grid-column:2}html:root:root:root body #meal-picker .meal-record-list>.ent.nd-has-photo .nd-kcal{grid-column:1 / span 2}html:root:root:root body #meal-picker .meal-record-list>.ent.nd-has-photo .nd-delete{grid-column:3}}';document.head.append(style);
 function placeRecords(app,picker){
  const lists=meals.map(([name],index)=>{let list=picker.querySelector('[data-record-meal="'+index+'"]');if(!list){const button=picker.querySelector('[data-meal-index="'+index+'"]');if(!button)return null;list=document.createElement('div');list.className='meal-record-list';list.dataset.recordMeal=String(index);list.setAttribute('role','group');list.setAttribute('aria-label','Записано: '+name);button.after(list);}return list;});
  app.querySelectorAll('.ent.food-fit').forEach(row=>{const meta=row.querySelector('.nd-entry-meta')||[...row.querySelectorAll('small')].find(node=>!node.classList.contains('food-fit-label'));const text=meta?.textContent.trim()||'';const index=meals.findIndex(([name])=>text===name||text.startsWith(name+' ·')||text.startsWith(name+' •'));if(index>=0&&lists[index]&&row.parentNode!==lists[index])lists[index].append(row);});
 }
 function arrange(){
  queued=false;if(tab!=='diary'||!S.profile||editing)return;
  const app=document.getElementById('app'),picker=app?.querySelector('#meal-picker');if(!app||!picker)return;
  const candidates=[...app.querySelectorAll('#food-diary-surface,.food-fit-key,.food-fit-help,.ent.food-fit')].map(n=>n.id==='food-diary-surface'?n:n.closest('.card')).filter(n=>n&&n.id!=='unified-meals'&&!picker.contains(n));
  let diary=candidates.find(n=>!n.dataset.umFallback)||candidates[0]||null;
  let block=app.querySelector('#unified-meals');
  if(!block){block=document.createElement('section');block.id='unified-meals';block.className='card';block.setAttribute('aria-labelledby','unified-meals-heading');block.innerHTML='<header class="unified-meals-header"><h2 id="unified-meals-heading">Приём пищи</h2><time class="unified-meals-date"></time></header>';const anchor=diary?.contains(picker)?diary:picker;anchor.before(block);}
  if(diary?.contains(block))diary.before(block);
  const header=block.querySelector('.unified-meals-header'),date=header.querySelector('time');if(date.dateTime!==day)date.dateTime=day;const label=fmt(day);if(date.textContent!==label)date.textContent=label;
  if(header.nextElementSibling!==picker)header.after(picker);
  if(!diary){diary=document.createElement('section');diary.id='food-diary-surface';diary.className='card um-records';diary.dataset.umFallback='true';diary.innerHTML=typeof entries==='function'?entries(day):'';}
  for(const stale of block.querySelectorAll('[data-um-fallback]'))if(stale!==diary)stale.remove();
  if(diary.id!=='food-diary-surface')diary.id='food-diary-surface';if(!diary.classList.contains('um-records'))diary.classList.add('um-records');
  if(diary.getAttribute('aria-label')!=='Записи питания')diary.setAttribute('aria-label','Записи питания');
  if(picker.nextElementSibling!==diary)picker.after(diary);
  placeRecords(app,picker);
  const ai=app.querySelector('#diary-day-ai');if(ai&&block.lastElementChild!==ai)block.append(ai);
 }
 function schedule(){if(!queued){queued=true;requestAnimationFrame(arrange);}}
 function watch(app){if(observedApp===app)return;observer?.disconnect();observedApp=app;observer=new MutationObserver(schedule);observer.observe(app,{childList:true,subtree:true});}
 function ensureAI(){if(document.readyState==='loading'||typeof window.foodDiaryDayAnalyze==='function'||aiRequested)return;aiRequested=true;const existing=[...document.scripts].find(s=>/\/diary-day-ai\.js$/.test(new URL(s.src||location.href,location.href).pathname));if(existing){existing.addEventListener('load',schedule,{once:true});return;}const script=document.createElement('script');script.src=new URL('diary-day-ai.js?v=unified-block2',document.baseURI).href;script.onload=schedule;script.onerror=()=>console.warn('Не удалось загрузить ИИ-разбор питания');document.head.append(script);}
 function mount(){
  if(tab!=='diary'||!S.profile||editing)return;
  const app=document.getElementById('app');if(!app)return;
  const estimate=app.querySelector('#meal-entry-anchor')||app.querySelector('#meal-estimate');
  const oldPicker=app.querySelector('#meal-picker'),source=app.querySelector('#food-diary-surface');if(oldPicker&&source)oldPicker.querySelectorAll('.meal-record-list>.ent').forEach(row=>source.append(row));oldPicker?.remove();
  const t=targets(S.profile),valid=Number.isFinite(t.k)&&t.k>0&&Number.isFinite(t.p);
  const section=document.createElement('section');section.id='meal-picker';section.className='meal-picker';section.setAttribute('aria-label','Выберите приём пищи');
  section.innerHTML='<div class="meal-picker-grid">'+meals.map(([name,share],i)=>'<button type="button" class="meal-pick" data-meal-index="'+i+'" aria-pressed="'+(ME.meal===name)+'" '+(ME.busy?'disabled':'')+'><span class="meal-pick-copy"><span class="meal-pick-title">'+name+'</span><span class="meal-pick-hint">'+(valid?'Ориентир: ≈ '+Math.round(t.k*share)+' ккал · белок ≈ '+Math.round(t.p*share)+' г. '+Math.round(share*100)+'% дневного ориентира из анкеты.':'Заполните анкету в «Мои цели», чтобы увидеть ориентир.')+'</span></span><span class="meal-pick-action" aria-hidden="true">'+name+'</span></button>').join('')+'</div><p class="subtle">Условное распределение дневного ориентира, не обязательная норма и не медицинская рекомендация. Тарелки — иллюстрации, не персональное меню. Учитывайте ограничения из анкеты.</p>';
  section.querySelectorAll('[data-meal-index]').forEach(button=>{button.setAttribute('aria-label','Добавить запись: '+meals[Number(button.dataset.mealIndex)][0]);button.onclick=()=>{if(ME.busy)return;window.foodOpenMealWindow(meals[Number(button.dataset.mealIndex)][0]);}});
  const block=app.querySelector('#unified-meals');if(block)block.querySelector('.unified-meals-header').after(section);else if(estimate)estimate.before(section);else app.append(section);
  watch(app);schedule();ensureAI();
 }
 const previousRender=render;render=function(){previousRender();mount()};
 const previousRefresh=meRefresh;meRefresh=function(){previousRefresh();mount()};
 document.addEventListener('DOMContentLoaded',()=>{schedule();ensureAI();},{once:true});
 window.addEventListener('pageshow',schedule);
 mount();
})();
