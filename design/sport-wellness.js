(() => {
'use strict';
if(window.setupSportWellnessInstalled)return;
window.setupSportWellnessInstalled=true;
const source=document.currentScript?.src;
if(source&&!document.getElementById('sport-wellness-css')){const url=new URL('sport-wellness.css',source);url.search=new URL(source).search;const link=document.createElement('link');link.id='sport-wellness-css';link.rel='stylesheet';link.href=url.href;document.head.append(link);}
const descriptions={goal:'Направление и личные ориентиры',experience:'Опыт, техника и знакомые нагрузки',health:'Ограничения и безопасная нагрузка',rhythm:'Дни, время и место тренировок',energy:'Самочувствие и запас сил',format:'Предпочтения и поддержка тренера',expectations:'Прогресс, мотивация и напоминания'};
let queued=false;
function text(node,value){if(node.textContent!==value)node.textContent=value;}
function refresh(){
queued=false;
const block=document.getElementById('goals-questionnaire-sport');if(!block)return;
if(!block.classList.contains('sport-wellness'))block.classList.add('sport-wellness');
let total=0;
for(const card of block.querySelectorAll('.sport-category')){
const summary=card.querySelector(':scope > summary'),content=card.querySelector(':scope > [data-sq-card]');if(!summary||!content)continue;
if(!summary.querySelector('.sw-heading')){
const title=summary.children[1];if(!title)continue;
title.classList.add('sw-heading');
const label=document.createElement('span');label.className='sw-title';label.textContent=title.textContent;
const description=document.createElement('span');description.className='sw-description';description.textContent=descriptions[content.dataset.sqCard]||'';
title.replaceChildren(label,description);
const count=document.createElement('span');count.className='sw-count';count.setAttribute('aria-label','Количество выбранных вариантов');summary.insertBefore(count,summary.lastElementChild);
summary.firstElementChild.classList.add('sw-icon');summary.lastElementChild.classList.add('sw-chevron');
}
const count=[...content.querySelectorAll('input:checked')].filter(input=>!input.closest('[hidden]')).length;total+=count;
text(summary.querySelector('.sw-count'),String(count));
if(card.classList.contains('sw-selected')!==(count>0))card.classList.toggle('sw-selected',count>0);
}
let overview=block.querySelector(':scope > .sw-overview');
if(!overview){overview=document.createElement('p');overview.className='sw-overview';overview.setAttribute('role','status');overview.setAttribute('aria-live','polite');block.querySelector('.sport-categories')?.before(overview);}
text(overview,'Выбрано вариантов: '+total+' · 7 категорий');
const save=block.querySelector('[data-save-block="sport"]');if(save){text(save,'Сохранить привычки');if(save.getAttribute('aria-label')!=='Сохранить спортивную анкету')save.setAttribute('aria-label','Сохранить спортивную анкету');}
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(refresh);}}
function start(){refresh();const observer=new MutationObserver(records=>{if(records.some(record=>record.type==='childList'||record.target.closest?.('#goals-questionnaire-sport')))schedule();});observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['checked','hidden']});document.addEventListener('change',event=>{if(event.target instanceof Element&&event.target.closest('#goals-questionnaire-sport'))schedule();});window.addEventListener('pageshow',schedule);window.addEventListener('pagehide',event=>{if(!event.persisted)observer.disconnect();});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
