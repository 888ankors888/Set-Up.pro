(() => {
'use strict';
if(window.setupNeutralFoodDiary)return;
window.setupNeutralFoodDiary=true;
const style=document.createElement('style');style.id='setup-neutral-food-diary';
style.textContent='html:root:root:root body #app :is(.food-fit-key,.food-fit-note,.food-fit-label){display:none!important}html:root:root:root body #app .ent.food-fit{background:rgba(6,31,26,.45)!important;border:1px solid rgba(67,201,154,.6)!important;--fit:#43c99a!important;--nd-tint:transparent!important;--nd-tone:#a9cbc0!important}';
document.head.append(style);
const unwanted='.food-fit-key,.food-fit-note,.food-fit-label';
let queued=false,observer;
function clean(){
 queued=false;const app=document.getElementById('app');if(!app)return;
 app.querySelectorAll(unwanted).forEach(node=>node.remove());
 app.querySelectorAll('.ent.food-fit').forEach(row=>{for(const cls of ['food-fit-good','food-fit-neutral','food-fit-bad'])if(row.classList.contains(cls))row.classList.remove(cls);});
 app.querySelectorAll('h1,h2,h3,h4').forEach(node=>{if(['Скушали сегодня','Как определяется цвет','Разбор через ИИ'].includes(node.textContent.trim())&&!node.querySelector('button'))node.remove();});
 app.querySelectorAll('p').forEach(node=>{if(node.closest('#diary-day-ai')||node.querySelector('button,input,select,textarea'))return;const text=node.textContent.replace(/\s+/g,' ').trim();if(text==='Оценка приблизительная, не медицинская рекомендация. Дневник может быть неполным.'||text.startsWith('В GigaChat отправляются блюда, порции, КБЖУ, время записей')||text.includes('до 1000 символов на обе части вместе с заголовками. Текущий приём пищи'))node.remove();});
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(clean);}}
function start(){clean();observer=new MutationObserver(schedule);observer.observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.addEventListener('pageshow',schedule);
window.addEventListener('pagehide',event=>{if(!event.persisted)observer?.disconnect();});
})();
