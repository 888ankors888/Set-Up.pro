(() => {
'use strict';
if(window.setupSportWellnessInstalled)return;
window.setupSportWellnessInstalled=true;
const source=document.currentScript?.src;
if(source&&!document.getElementById('sport-wellness-css')){const url=new URL('sport-wellness.css',source);url.search=new URL(source).search;const link=document.createElement('link');link.id='sport-wellness-css';link.rel='stylesheet';link.href=url.href;document.head.append(link);}
const descriptions={sport:{goal:'Направление и личные ориентиры',experience:'Опыт, техника и знакомые нагрузки',health:'Ограничения и безопасная нагрузка',rhythm:'Дни, время и место тренировок',energy:'Самочувствие и запас сил',format:'Предпочтения и поддержка тренера',expectations:'Прогресс, мотивация и напоминания'},nutrition:{routine:'Режим и время приёмов пищи',diet:'Продукты и разнообразие рациона',behaviour:'Повседневные пищевые привычки',limits:'Аллергии и личные ограничения',goal:'Ориентиры и удобный формат питания',numbers:'Калории, БЖУ и привычный объём воды',life:'Готовка, бюджет и бытовой ритм',support:'Поддержка и ожидания'},habits:['Вода, забота о теле и ежедневный ритм','Спокойствие, внимание и эмоциональный баланс','Небольшие шаги к регулярному питанию','Движение в течение обычного дня','Вечерние ритуалы и восстановление','Чтение, знания и новые навыки','Фокус, планирование и рабочий ритм','Расходы, накопления и осознанные покупки','Внимание и время для близких','Простые действия для уютного дома','Меньше отвлечений, больше свободного времени','Время для идей и любимых занятий','Дневник, настроение и личные ориентиры','Бережное отношение к ресурсам']};
const sections=[['sport','.sport-category','.sport-categories','[data-sq-card]','Сохранить привычки'],['nutrition','.nutrition-category','.nutrition-categories','[data-nq-card]','Сохранить питание'],['habits','.habit-category','.habit-categories','.habit-list','Сохранить привычки']];
let queued=false;
function text(node,value){if(node&&node.textContent!==value)node.textContent=value;}
function refresh(){
queued=false;
for(const [kind,cardSelector,gridSelector,contentSelector,saveText] of sections){
const block=document.getElementById('goals-questionnaire-'+kind);if(!block)continue;
if(!block.classList.contains('sport-wellness'))block.classList.add('sport-wellness');
let total=0;const cards=[...block.querySelectorAll(cardSelector)];
for(const [index,card] of cards.entries()){
const summary=card.querySelector(':scope > summary'),content=card.querySelector(':scope > '+contentSelector);if(!summary||!content)continue;
if(!summary.querySelector('.sw-heading')){
const title=summary.children[1];if(!title)continue;
const legacyCount=title.querySelector('[data-habit-count]');
const titleText=[...title.childNodes].filter(node=>node!==legacyCount).map(node=>node.textContent).join('').trim();
title.classList.add('sw-heading');
const label=document.createElement('span');label.className='sw-title';label.textContent=titleText;
const description=document.createElement('span');description.className='sw-description';description.textContent=kind==='habits'?descriptions.habits[index]||'Настройте привычки под свой ритм':descriptions[kind][content.dataset.sqCard||content.dataset.nqCard]||'';
title.replaceChildren(label,description);if(legacyCount)title.append(legacyCount);
const count=document.createElement('span');count.className='sw-count';summary.insertBefore(count,summary.lastElementChild);
summary.firstElementChild.classList.add('sw-icon');summary.lastElementChild.classList.add('sw-chevron');
}
const selector=kind==='habits'?'[data-habit-enabled]:checked':'input:checked';
const count=[...content.querySelectorAll(selector)].filter(input=>!input.closest('[hidden]')).length;total+=count;
const badge=summary.querySelector('.sw-count');text(badge,String(count));
const accessible=(kind==='habits'?'Выбрано привычек: ':'Выбрано вариантов: ')+count;if(badge.getAttribute('aria-label')!==accessible)badge.setAttribute('aria-label',accessible);
if(card.classList.contains('sw-selected')!==(count>0))card.classList.toggle('sw-selected',count>0);
}
let overview=block.querySelector(':scope > .sw-overview');
if(!overview){const grid=block.querySelector(gridSelector);if(grid){overview=document.createElement('p');overview.className='sw-overview';overview.setAttribute('role','status');overview.setAttribute('aria-live','polite');grid.before(overview);}}
text(overview,(kind==='habits'?'Выбрано привычек: ':'Выбрано вариантов: ')+total+' · Категорий: '+cards.length);
const save=block.querySelector('[data-save-block="'+kind+'"]');if(save){text(save,saveText);const label=kind==='sport'?'Сохранить спортивную анкету':saveText;if(save.getAttribute('aria-label')!==label)save.setAttribute('aria-label',label);}
}
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(refresh);}}
function start(){refresh();const observer=new MutationObserver(schedule);observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['checked','hidden']});document.addEventListener('change',event=>{if(event.target instanceof Element&&event.target.closest('.sport-wellness'))schedule();});document.addEventListener('input',event=>{if(event.target instanceof Element&&event.target.matches('[data-habit-enabled]'))schedule();});window.addEventListener('pageshow',schedule);window.addEventListener('pagehide',event=>{if(!event.persisted)observer.disconnect();});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
