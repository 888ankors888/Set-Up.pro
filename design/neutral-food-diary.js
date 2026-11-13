(() => {
'use strict';
if(window.setupNeutralFoodDiary)return;
window.setupNeutralFoodDiary=true;
const style=document.createElement('style');style.id='setup-neutral-food-diary';
style.textContent='html:root:root:root body #app :is(.food-fit-key,.food-fit-note,.food-fit-label){display:none!important}html:root:root:root body #app .ent.food-fit{background:rgba(6,31,26,.45)!important;border:1px solid rgba(67,201,154,.6)!important;--fit:#43c99a!important;--nd-tint:transparent!important;--nd-tone:#a9cbc0!important}';
style.textContent+='html:root:root:root body #meal-picker .meal-group{min-width:0;border:2px solid #d5f65a;border-radius:36px;overflow:hidden;background:rgba(6,31,26,.45);box-shadow:0 0 22px #c9fa4920}html:root:root:root body #meal-picker .meal-group>.meal-pick{border:0!important;border-radius:0!important;box-shadow:none!important}html:root:root:root body #meal-picker .meal-eaten{box-sizing:border-box;width:66.666667%;margin-left:33.333333%;padding:16px 16px 18px 0;min-width:0}html:root:root:root body #meal-picker .meal-eaten[hidden]{display:none!important}html:root:root:root body #meal-picker .meal-eaten>.meal-record-list{width:100%!important;margin-left:0!important}html:root:root:root body #meal-picker .meal-eaten-heading{font-size:14px!important;line-height:1.4;margin:0 0 10px!important;color:#f4faf4!important}html:root:root:root body #meal-picker .meal-group:has(.meal-eaten:not([hidden]))>.meal-pick{border-bottom:1px solid rgba(67,201,154,.25)!important}@media(max-width:650px){html:root:root:root body #meal-picker .meal-group{border-radius:28px}html:root:root:root body #meal-picker .meal-eaten{padding-right:10px}}';
document.head.append(style);
const unwanted='.food-fit-key,.food-fit-note,.food-fit-label';
let queued=false,observer;
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
 app.querySelectorAll('p').forEach(node=>{if(node.closest('#diary-day-ai')||node.querySelector('button,input,select,textarea'))return;const text=node.textContent.replace(/\s+/g,' ').trim();if(text==='Оценка приблизительная, не медицинская рекомендация. Дневник может быть неполным.'||text.startsWith('В GigaChat отправляются блюда, порции, КБЖУ, время записей')||text.includes('до 1000 символов на обе части вместе с заголовками. Текущий приём пищи'))node.remove();});
 groupMeals(app);
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(clean);}}
function start(){clean();observer=new MutationObserver(schedule);observer.observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.addEventListener('pageshow',schedule);
window.addEventListener('pagehide',event=>{if(!event.persisted)observer?.disconnect();});
})();
