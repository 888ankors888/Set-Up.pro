(() => {
 const meals=[['Завтрак',.25],['Обед',.35],['Ужин',.30],['Перекус',.10]];
 let queued=false,observedApp=null,observer=null,aiRequested=false;
 const style=document.createElement('style');style.id='meal-block-layout';style.textContent='#unified-meals{min-width:0}#unified-meals>.unified-meals-header{display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:18px}#unified-meals>.unified-meals-header h2{margin:0}#unified-meals .unified-meals-date{font-size:14px;color:var(--mu)}#unified-meals>#meal-picker{margin:0}#unified-meals>.um-records,#unified-meals>#diary-day-ai{margin:22px 0 0!important;padding:20px 0 0!important;border:0!important;border-top:1px solid var(--ln)!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}#unified-meals>#diary-day-ai[hidden]{display:none!important}';document.head.append(style);
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
  if(!diary){diary=document.createElement('section');diary.id='food-diary-surface';diary.className='card um-records';diary.dataset.umFallback='true';diary.innerHTML='<h3>Скушали сегодня</h3>'+(typeof entries==='function'?entries(day):'<p class="subtle">Записи за выбранную дату</p>');}
  for(const stale of block.querySelectorAll('[data-um-fallback]'))if(stale!==diary)stale.remove();
  if(diary.id!=='food-diary-surface')diary.id='food-diary-surface';if(!diary.classList.contains('um-records'))diary.classList.add('um-records');
  if(diary.getAttribute('aria-label')!=='Скушали сегодня')diary.setAttribute('aria-label','Скушали сегодня');
  let title=[...diary.children].find(n=>/^H[1-6]$/.test(n.tagName));if(!title){title=document.createElement('h3');diary.prepend(title);}if(title.textContent!=='Скушали сегодня')title.textContent='Скушали сегодня';
  if(picker.nextElementSibling!==diary)picker.after(diary);
  const ai=app.querySelector('#diary-day-ai');if(ai&&block.lastElementChild!==ai)block.append(ai);
 }
 function schedule(){if(!queued){queued=true;requestAnimationFrame(arrange);}}
 function watch(app){if(observedApp===app)return;observer?.disconnect();observedApp=app;observer=new MutationObserver(schedule);observer.observe(app,{childList:true,subtree:true});}
 function ensureAI(){if(document.readyState==='loading'||typeof window.foodDiaryDayAnalyze==='function'||aiRequested)return;aiRequested=true;const existing=[...document.scripts].find(s=>/\/diary-day-ai\.js$/.test(new URL(s.src||location.href,location.href).pathname));if(existing){existing.addEventListener('load',schedule,{once:true});return;}const script=document.createElement('script');script.src=new URL('diary-day-ai.js?v=unified-block2',document.baseURI).href;script.onload=schedule;script.onerror=()=>console.warn('Не удалось загрузить ИИ-разбор питания');document.head.append(script);}
 function mount(){
  if(tab!=='diary'||!S.profile||editing)return;
  const app=document.getElementById('app');if(!app)return;
  const estimate=app.querySelector('#meal-entry-anchor')||app.querySelector('#meal-estimate');
  app.querySelector('#meal-picker')?.remove();
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
