(() => {
'use strict';
if(window.setupNeutralFoodDiary)return;
window.setupNeutralFoodDiary=true;
const style=document.createElement('style');style.id='setup-neutral-food-diary';
style.textContent='html:root:root:root body #app :is(.food-fit-key,.food-fit-note,.food-fit-label){display:none!important}html:root:root:root body #app .ent.food-fit{background:rgba(6,31,26,.45)!important;border:1px solid rgba(67,201,154,.6)!important;--fit:#43c99a!important;--nd-tint:transparent!important;--nd-tone:#a9cbc0!important}';
style.textContent+='html:root:root:root body #meal-picker .meal-group{min-width:0;border:2px solid #d5f65a;border-radius:36px;overflow:hidden;background:rgba(6,31,26,.45)!important;box-shadow:0 0 22px #c9fa4920}html:root:root:root body #meal-picker .meal-group>.meal-pick{background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important}html:root:root:root body #meal-picker .meal-eaten{background:transparent!important;box-sizing:border-box;width:66.666667%;margin-left:33.333333%;padding:16px 16px 18px 0;min-width:0}html:root:root:root body #meal-picker .meal-eaten[hidden]{display:none!important}html:root:root:root body #meal-picker .meal-eaten>.meal-record-list{background:transparent!important;width:100%!important;margin-left:0!important}html:root:root:root body #meal-picker .meal-eaten-heading{font-size:14px!important;line-height:1.4;margin:0 0 10px!important;color:#f4faf4!important;text-align:center!important}html:root:root:root body #meal-picker .meal-eaten-heading::before{content:"";display:block;width:100%;height:1px;margin:0 0 14px;background:rgba(67,201,154,.35)}html:root:root:root body #meal-picker .meal-group:has(.meal-eaten:not([hidden]))>.meal-pick{border-bottom:0!important}@media(max-width:650px){html:root:root:root body #meal-picker .meal-group{border-radius:28px}html:root:root:root body #meal-picker .meal-eaten{padding-right:10px}}';
style.textContent+='html:root:root:root body #app .ent :is(.food-original-name,.food-original-meta){display:none!important}html:root:root:root body #app .food-entry-line{display:flex;align-items:baseline;flex-wrap:wrap;gap:6px 14px;min-width:0;line-height:1.45}html:root:root:root body #app .food-entry-time{font-size:14px!important;font-weight:750!important;color:#43c99a!important;-webkit-text-fill-color:#43c99a!important;white-space:nowrap;font-variant-numeric:tabular-nums}html:root:root:root body #app .food-entry-details{font-size:14px;color:#f4faf4;overflow-wrap:anywhere;min-width:0}';
style.textContent+=`@media(max-width:650px){
html:root:root:root:root body #app #meal-picker .meal-eaten{width:100%!important;margin-left:0!important;padding:12px 12px 16px!important}
html:root:root:root:root body #app #meal-picker .meal-record-list .ent{display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;align-items:center!important;gap:8px!important;padding:10px!important;min-width:0!important;width:100%!important;box-sizing:border-box!important}
html:root:root:root:root body #app #meal-picker .ent .nd-entry-main,html:root:root:root:root body #app #meal-picker .ent>div:has(>.food-entry-line){flex:1 1 0!important;min-width:0!important;width:auto!important;grid-column:auto!important;grid-row:auto!important}
html:root:root:root:root body #app #meal-picker .ent .food-entry-line{display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;align-items:center!important;gap:7px!important;min-width:0!important;width:100%!important}
html:root:root:root:root body #app #meal-picker .ent .food-entry-time{flex:0 0 auto!important;font-size:12px!important}
html:root:root:root:root body #app #meal-picker .ent .food-entry-details{display:flex!important;align-items:baseline!important;gap:4px!important;flex:1 1 0!important;min-width:0!important;white-space:nowrap!important;font-size:12px!important;overflow:hidden!important}
html:root:root:root:root body #app #meal-picker .ent .food-entry-name{display:block!important;flex:1 1 auto!important;min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
html:root:root:root:root body #app #meal-picker .ent .food-entry-grams{flex:0 0 auto!important;white-space:nowrap!important}
html:root:root:root:root body #app #meal-picker .ent .nd-kcal,html:root:root:root:root body #app #meal-picker .ent>div:has(>.food-entry-line)+div{display:flex!important;align-items:baseline!important;gap:2px!important;flex:0 0 auto!important;width:auto!important;min-width:0!important;white-space:nowrap!important;grid-column:auto!important;grid-row:auto!important}
html:root:root:root:root body #app #meal-picker .ent .nd-kcal b,html:root:root:root:root body #app #meal-picker .ent>div:has(>.food-entry-line)+div b{font-size:15px!important;line-height:1.3!important}
html:root:root:root:root body #app #meal-picker .ent .nd-kcal small,html:root:root:root:root body #app #meal-picker .ent>div:has(>.food-entry-line)+div small{font-size:10px!important;white-space:nowrap!important}
html:root:root:root:root body #app #meal-picker .ent .nd-entry-main>br,html:root:root:root:root body #app #meal-picker .ent .nd-kcal>br,html:root:root:root:root body #app #meal-picker .ent>div:has(>.food-entry-line)>br,html:root:root:root:root body #app #meal-picker .ent>div:has(>.food-entry-line)+div>br{display:none!important}
html:root:root:root:root body #app #meal-picker .ent>button:is(.x,.nd-delete){position:static!important;transform:none!important;display:flex!important;align-items:center!important;justify-content:center!important;flex:0 0 28px!important;width:28px!important;height:36px!important;min-width:28px!important;padding:2px!important;margin:0!important;grid-column:auto!important;grid-row:auto!important}
}`;
document.head.append(style);
const unwanted='.food-fit-key,.food-fit-note,.food-fit-label';
let queued=false,observer;
function formatEntries(app){
 app.querySelectorAll('.ent.food-fit').forEach(row=>{
  if(row.querySelector('.food-entry-line'))return;
  const main=row.querySelector('.nd-entry-main')||[...row.children].find(node=>node.tagName==='DIV');if(!main)return;
  const name=main.querySelector('b'),meta=main.querySelector('.nd-entry-meta')||[...main.querySelectorAll('small')].find(node=>!node.classList.contains('food-fit-label'));if(!name||!meta)return;
  const parts=meta.textContent.split(/[·•]/).map(value=>value.trim()),time=meta.textContent.match(/\b\d{1,2}:\d{2}\b/),grams=parts.find(value=>/\d\s*г\s*$/.test(value));if(!time)return;
  const line=document.createElement('div');line.className='food-entry-line';
  const clock=document.createElement('time');clock.className='food-entry-time';clock.dateTime=time[0];clock.textContent=time[0];
  const details=document.createElement('span');details.className='food-entry-details';
  const food=document.createElement('span');food.className='food-entry-name';food.textContent=name.textContent.trim();food.title=food.textContent;details.append(food);
  if(grams){const weight=document.createElement('span');weight.className='food-entry-grams';weight.textContent=' · '+grams;details.append(weight);}
  line.append(clock,details);
  name.classList.add('food-original-name');meta.classList.add('food-original-meta');main.prepend(line);
 });
}
function groupMeals(app){
 const picker=app.querySelector('#meal-picker');if(!picker)return;
 picker.querySelectorAll('.meal-pick[data-meal-index]').forEach(button=>{
  const index=button.dataset.mealIndex,list=picker.querySelector('[data-record-meal="'+index+'"]');if(!list)return;
  let group=button.parentElement;
  if(!group.classList.contains('meal-group')){group=document.createElement('section');group.className='meal-group';group.setAttribute('aria-label',button.querySelector('.meal-pick-title')?.textContent||'Приём пищи');button.before(group);group.append(button);}
  let eaten=group.querySelector(':scope > .meal-eaten');
  if(!eaten){eaten=document.createElement('div');eaten.className='meal-eaten';const heading=document.createElement('h3');heading.className='meal-eaten-heading';heading.textContent='Скушали сегодня';eaten.append(heading);group.append(eaten);}
  if(list.parentElement!==eaten)eaten.append(list);
  const empty=!list.querySelector('.ent');if(eaten.hidden!==empty)eaten.hidden=empty;
 });
}
function clean(){
 queued=false;const app=document.getElementById('app');if(!app)return;
 app.querySelectorAll(unwanted).forEach(node=>node.remove());
 app.querySelectorAll('.ent.food-fit').forEach(row=>{for(const cls of ['food-fit-good','food-fit-neutral','food-fit-bad'])if(row.classList.contains(cls))row.classList.remove(cls);});
 app.querySelectorAll('h1,h2,h3,h4').forEach(node=>{if(node.closest('.meal-eaten'))return;if(['Скушали сегодня','Как определяется цвет','Разбор через ИИ'].includes(node.textContent.trim())&&!node.querySelector('button'))node.remove();});
 app.querySelectorAll('p').forEach(node=>{if(node.querySelector('button,input,select,textarea'))return;const text=node.textContent.replace(/\s+/g,' ').trim();if(text==='Условное распределение дневного ориентира, не обязательная норма и не медицинская рекомендация. Тарелки — иллюстрации, не персональное меню. Учитывайте ограничения из анкеты.'||text==='Оценка приблизительная, не медицинская рекомендация. Дневник может быть неполным.'||text.startsWith('В GigaChat отправляются блюда, порции, КБЖУ, время записей')||text.includes('до 1000 символов на обе части вместе с заголовками. Текущий приём пищи'))node.remove();});
 groupMeals(app);formatEntries(app);
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(clean);}}
function start(){clean();observer=new MutationObserver(schedule);observer.observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.addEventListener('pageshow',schedule);
window.addEventListener('pagehide',event=>{if(!event.persisted)observer?.disconnect();});
})();
