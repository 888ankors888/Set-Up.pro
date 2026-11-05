(() => {
 const opened=new Map();
 window.foodValidateWaterGoals=function(raw){if(raw==null)return {};if(typeof raw!=='object'||Array.isArray(raw)||Object.keys(raw).length>10000)throw Error('Некорректные цели воды');const out={};for(const [date,value] of Object.entries(raw)){if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(dt(date).getTime())||dk(dt(date))!==date||!Number.isInteger(value)||value<250||value>10000)throw Error('Некорректная цель воды');out[date]=value}return out};
 window.foodIncreaseWaterGoal=function(){const date=today(),current=Number((S.waterGoalsByDate||{})[date]||S.waterGoal||2000);if(!Number.isInteger(current)||current<250||current+250>10000){toast('Нельзя увеличить цель: допустимый диапазон настроек 250–10000 мл');return}try{const goals=foodValidateWaterGoals({...S.waterGoalsByDate,[date]:current+250}),next={...S,waterGoalsByDate:goals};localStorage.setItem('nt1',JSON.stringify(next));S=next}catch(e){toast('Не удалось сохранить цель воды');return}render()};
 const previousProfile=profileView;profileView=function(){const template=document.createElement('template');template.innerHTML=previousProfile();template.content.querySelectorAll('h2').forEach(h=>{if(h.textContent.trim()==='Оформление и привычки')h.closest('.card')?.remove()});template.content.querySelectorAll('button').forEach(b=>{if(['Изменить анкету','Удалить все данные'].includes(b.textContent.trim()))b.remove()});const unwanted='Оценка порции по фото приблизительна и не заменяет рекомендаций врача. Данные хранятся только в этом браузере.';template.content.querySelectorAll('p').forEach(p=>{if(p.textContent.trim()===unwanted)p.remove()});return template.innerHTML};
 function accordion(card,stateKey,title,initialOpen=false){const details=document.createElement('details'),summary=document.createElement('summary'),heading=card.querySelector('h2');details.className=card.className;summary.textContent=title;summary.style.cursor='pointer';summary.style.fontSize='18px';summary.style.fontWeight='600';details.appendChild(summary);for(const node of [...card.childNodes])if(node!==heading)details.appendChild(node);details.open=opened.has(stateKey)?opened.get(stateKey):initialOpen;details.addEventListener('toggle',()=>opened.set(stateKey,details.open));card.replaceWith(details);return details}
 function polishProgram(){if(tab!=='training')return;const root=document.getElementById('training-sport-program'),plan=S.sports?.plan;if(!root||!plan||root.querySelector('#sports-week-fold'))return;const cards=[...root.children].filter(n=>n.classList.contains('card'));if(cards.length<2)return;const card=cards[1],heading=card.querySelector('h2');if(!heading)return;const oldTitle=heading.textContent.trim(),title=oldTitle==='Программа принята'?'Моя программа тренировок на эту неделю':oldTitle,stateKey=JSON.stringify([plan.start,plan.accepted,plan.sessions.map(s=>s.id)]),week=accordion(card,stateKey,title,!plan.accepted||oldTitle.startsWith('Анкета изменилась'));week.id='sports-week-fold';cards.slice(2).forEach((day,i)=>{const h=day.querySelector('h2');if(h)week.appendChild(accordion(day,stateKey+':day:'+i,h.textContent.trim()))})}
 function linkWorkouts(){const nav=document.getElementById('nav');if(!nav||nav.querySelector('[data-workout-journal]'))return;const button=document.createElement('button');button.type='button';button.dataset.workoutJournal='true';button.setAttribute('aria-label','Тренировки — журнал упражнений');const icon=document.createElement('span');icon.setAttribute('aria-hidden','true');icon.textContent='🏋';const label=document.createElement('span');label.textContent='Тренировки';button.append(icon,label);button.addEventListener('click',()=>{window.location.href='workouts.html'});nav.appendChild(button)}
 const previousRender=render;render=function(){previousRender();polishProgram();linkWorkouts()};render();
})();

/* Brand navigation: scoped to the main menu only. */
(() => {
 const style=document.createElement('style');
 style.id='setup-brand-navigation';
 style.textContent=`
 body #nav{background:#042e27;border-color:#16483d;gap:6px;padding:8px 8px calc(8px + env(safe-area-inset-bottom,0px));}
 body #nav button{flex:1 1 0;min-width:0;min-height:66px;box-sizing:border-box;background:#fff;color:#07372d;border:1px solid #dce7e1;border-radius:14px;padding:8px 3px;gap:5px;font-size:11.5px;font-weight:600;line-height:1.25;box-shadow:0 2px 6px #00000014;transition:background .18s,border-color .18s;}
 body #nav button.on,body #nav button.on:hover{background:#c7ff60;color:#042e27;border-color:#c7ff60;box-shadow:inset 0 0 0 1px #042e2720;}
 body #nav button:not(.on):hover{background:#f1ffdc;color:#07372d;border-color:#a4ce59;}
 body #nav button:focus-visible{outline:3px solid #c7ff60;outline-offset:3px;}
 body #nav .setup-nav-icon{display:block;width:22px;height:22px;flex:none;stroke:currentColor;}
 body #nav .setup-nav-label{display:block;overflow-wrap:anywhere;text-align:center;}
 body #nav .setup-nav-initial{font-weight:900;text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:3px;}
 @media(max-width:380px){body #nav{gap:4px;padding-left:4px;padding-right:4px;}body #nav button{font-size:10px;border-radius:11px;}}
 @media(prefers-reduced-motion:reduce){body #nav button{transition:none;}}
 `;
 document.head.appendChild(style);
 const icons={home:'<path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/>',food:'<path d="M4 3v6a3 3 0 0 0 6 0V3M7 3v18M20 21V3c-4 2-5 8 0 9"/>',goals:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',report:'<path d="M4 3v18h17M8 16v-5M13 16V7M18 16V4"/>',profile:'<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',training:'<path d="m6 6 12 12M3 8l5-5M16 21l5-5M2 5l3-3M19 22l3-3M3 10l7-7M14 21l7-7"/>',diary:'<path d="M4 3h13a3 3 0 0 1 3 3v15H7a3 3 0 0 1-3-3Zm0 14h16M8 7h8M8 11h6"/>'};
 function decorate(){
 const nav=document.getElementById('nav');if(!nav)return;
 nav.querySelectorAll('button').forEach(button=>{
 if(button.querySelector('.setup-nav-label'))return;
 const copy=button.cloneNode(true);copy.querySelectorAll('svg,[aria-hidden="true"]').forEach(node=>node.remove());
 const label=copy.textContent.replace(/^[^\p{L}\p{N}]+/u,'').trim();if(!label)return;
 const key=/трен|спорт/i.test(label)?'training':/цел/i.test(label)?'goals':/отч|анал|стат/i.test(label)?'report':/проф|настр/i.test(label)?'profile':/питан|еда|рацион/i.test(label)?'food':/днев|журнал/i.test(label)?'diary':'home';
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('stroke-width','1.8');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');svg.classList.add('setup-nav-icon');svg.innerHTML=icons[key];
 const text=document.createElement('span');text.className='setup-nav-label';const initial=document.createElement('span');initial.className='setup-nav-initial';const chars=Array.from(label);initial.textContent=chars.shift();text.append(initial,document.createTextNode(chars.join('')));button.replaceChildren(svg,text);
 });
 }
 const previousRender=render;render=function(){const result=previousRender.apply(this,arguments);decorate();return result};decorate();
})();
