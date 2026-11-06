(() => {
'use strict';
const paths={sport:'<path d="m6 6 12 12M3 8l5-5M16 21l5-5M2 5l3-3M19 22l3-3M3 10l7-7M14 21l7-7"/>',eat:'<path d="M4 3v6a3 3 0 0 0 6 0V3M7 3v18M20 21V3c-4 2-5 8 0 9"/>',tracker:'<rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2v4M16 2v4M3 10h18m-13 5 3 3 5-5"/>',questionnaire:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',report:'<path d="M4 3v18h17M8 16v-5M13 16V7M18 16V4"/>',settings:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',up:'<path d="M12 4v16M4 12h16"/>'};
function decorate(){document.querySelectorAll('#nav .setup-wordnav button').forEach(button=>{if(button.querySelector('.setup-brand-label'))return;const key=button.dataset.setupDestination||'up';const copy=button.cloneNode(true);copy.querySelectorAll('svg').forEach(n=>n.remove());const label=copy.textContent.trim();if(!label)return;const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.8');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');svg.classList.add('setup-brand-icon');svg.innerHTML=paths[key]||paths.up;const span=document.createElement('span');span.className='setup-brand-label';const initial=document.createElement('span');initial.className='setup-brand-initial';const chars=Array.from(label);initial.textContent=chars.shift();span.append(initial,document.createTextNode(chars.join('')));button.replaceChildren(svg,span);});}
const dateFormat=new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long'});
const fullDateFormat=new Intl.DateTimeFormat('ru-RU',{dateStyle:'full'});
function updateHeaderDate(){
  if(!document.getElementById('nav'))return;
  const now=new Date();
  const label=dateFormat.format(now);
  const localDate=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
  document.querySelectorAll('.brand:not(.big),main>.setup-home').forEach(brand=>{
    let date=brand.querySelector('time.setup-header-date');
    if(!date){date=document.createElement('time');date.className='setup-header-date';brand.append(date);}
    if(date.textContent!==label)date.textContent=label;
    if(date.dateTime!==localDate){date.dateTime=localDate;date.setAttribute('aria-label',fullDateFormat.format(now));}
  });
}
function start(){
  const style=document.createElement('style');
  style.id='setup-header-date-style';
  style.textContent=`
html:root:root:root body time.setup-header-date{display:none!important}
@media(max-width:999px){html:root:root:root body:has(#nav) time.setup-header-date{display:block!important;flex:0 0 auto!important;margin-left:auto!important;color:#edf8f2!important;font:600 14px/1.3 system-ui,sans-serif!important;letter-spacing:0!important;white-space:nowrap!important;text-align:right!important}}
@media(min-width:1000px){
html:root:root:root body #nav{padding-left:220px!important;padding-right:220px!important;justify-content:center!important}
html:root:root:root body #nav .setup-wordnav{flex:1 1 0!important;width:100%!important;max-width:none!important;min-width:0!important;gap:10px!important}
html:root:root:root body #nav .setup-wordnav>button{min-height:44px!important;height:44px!important;padding:10px 12px!important;font-size:15px!important;gap:6px!important}
html:root:root:root body:has(#nav) time.setup-header-date{position:fixed!important;top:calc(12px + env(safe-area-inset-top,0px))!important;right:24px!important;left:auto!important;bottom:auto!important;z-index:75!important;display:flex!important;align-items:center!important;justify-content:flex-end!important;width:180px!important;height:48px!important;margin:0!important;padding:0!important;box-sizing:border-box!important;color:#edf8f2!important;font:600 18px/1.2 system-ui,sans-serif!important;letter-spacing:0!important;white-space:nowrap!important;text-align:right!important;cursor:default!important;pointer-events:none!important}
}
`;
  document.getElementById(style.id)?.remove();document.head.append(style);
  decorate();updateHeaderDate();
  const observer=new MutationObserver(()=>{decorate();updateHeaderDate();});
  observer.observe(document.body,{childList:true,subtree:true});
  window.setInterval(updateHeaderDate,60000);
  window.addEventListener('pageshow',updateHeaderDate);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateHeaderDate();});
  window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

/* Enhance the original energy ring without replacing its data or labels. */
(() => {
'use strict';
let serial=0,queued=false;
const selector='#app .energy .ring';
function enhance(){
 queued=false;
 document.querySelectorAll(selector).forEach(ring=>{
  const raw=ring.style.getPropertyValue('--progress').trim()||getComputedStyle(ring).getPropertyValue('--progress').trim();
  const value=parseFloat(raw);if(!Number.isFinite(value))return;
  const progress=Math.max(0,Math.min(100,value));
  if(ring.dataset.setupOrbitProgress===String(progress)&&ring.querySelector('.setup-energy-svg'))return;
  ring.dataset.setupOrbitProgress=String(progress);ring.classList.add('setup-energy-ring');
  ring.querySelector('.setup-energy-svg')?.remove();
  const id='setup-energy-'+(++serial),svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.classList.add('setup-energy-svg');svg.setAttribute('viewBox','0 0 260 260');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
  svg.innerHTML=`<defs><pattern id="${id}-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-40)"><path d="M0 0V7" stroke="#9cb9ae" stroke-width="2.5"/></pattern><linearGradient id="${id}-lime" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e5ff9b"/><stop offset="1" stop-color="#c6f66b"/></linearGradient><radialGradient id="${id}-core" cx="35%" cy="20%" r="85%"><stop stop-color="#3b5653"/><stop offset="1" stop-color="#173a34"/></radialGradient></defs><circle cx="130" cy="130" r="110" fill="none" stroke="#163d34" stroke-width="22"/><circle cx="130" cy="130" r="110" fill="none" stroke="url(#${id}-hatch)" stroke-width="22"/>${progress>0?`<circle cx="130" cy="130" r="110" fill="none" stroke="url(#${id}-lime)" stroke-width="22" stroke-linecap="round" pathLength="100" stroke-dasharray="${progress} 100" transform="rotate(-90 130 130)"/>`:''}<circle cx="130" cy="130" r="86" fill="url(#${id}-core)"/>`;
  ring.prepend(svg);
 });
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(enhance);}}
function start(){
 const style=document.createElement('style');style.id='setup-original-energy-orbit';
 style.textContent='html:root:root:root body #app .energy .ring.setup-energy-ring{position:relative!important;width:220px!important;height:220px!important;max-width:100%!important;background:none!important;filter:none!important;isolation:isolate}html:root:root:root body #app .energy .ring.setup-energy-ring::before{content:none!important;display:none!important}html:root:root:root body #app .energy .ring.setup-energy-ring>.setup-energy-svg{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;display:block!important;pointer-events:none!important;z-index:0}html:root:root:root body #app .energy .ring.setup-energy-ring>div{position:relative!important;z-index:1;max-width:68%;text-align:center;color:#f4faf4!important}html:root:root:root body #app .energy .ring.setup-energy-ring b{font-size:27px!important;line-height:1.2}html:root:root:root body #app .energy .ring.setup-energy-ring small{font-size:12px!important;color:#b2c9bd!important}@media(max-width:700px){html:root:root:root body #app .energy .ring.setup-energy-ring{width:180px!important;height:180px!important}html:root:root:root body #app .energy .ring.setup-energy-ring b{font-size:24px!important}}';
 document.getElementById(style.id)?.remove();document.head.append(style);enhance();
 new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['style']});
 window.addEventListener('pageshow',schedule);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

/* Macro glasses use the existing displayed gram totals; stored nutrition data is untouched. */
(() => {
'use strict';
let queued=false;
const palette=[['Белки','#75c9f1','#387fa8'],['Жиры','#efd078','#b28635'],['Углеводы','#c7a4ee','#8662ad']];
function enhance(){
 queued=false;
 document.querySelectorAll('#app .card').forEach(card=>{
  if(!card.querySelector('.energy .ring,.energy .energy-orbit'))return;
  const grid=card.querySelector('.m3');if(!grid)return;
  [...grid.children].forEach(cell=>{
   const item=palette.find(([label])=>cell.textContent.includes(label));if(!item)return;
   const match=cell.textContent.replace(/[\s\u00a0\u202f]/g,'').match(/(\d+(?:[.,]\d+)?)\/(\d+(?:[.,]\d+)?)/);
   const bar=cell.querySelector('.bar');if(!match||!bar||!bar.querySelector('i'))return;
   const current=Number(match[1].replace(',','.')),target=Number(match[2].replace(',','.'));
   if(!Number.isFinite(current)||!Number.isFinite(target))return;
   const key=[item[0],current,target].join(':');
   if(cell.dataset.setupMacroGlass===key&&bar.classList.contains('setup-macro-glass'))return;
   cell.dataset.setupMacroGlass=key;cell.classList.add('setup-macro-cell');grid.classList.add('setup-macro-grid');
   bar.classList.add('setup-macro-glass');
   bar.style.setProperty('--macro-fill',(target>0?Math.min(100,Math.max(0,current/target*100)):0)+'%');
   bar.style.setProperty('--macro-top',item[1]);bar.style.setProperty('--macro-bottom',item[2]);
   bar.setAttribute('role','img');bar.setAttribute('aria-label',`${item[0]}: ${current} из ${target} граммов`);
   let over=cell.querySelector('.setup-macro-over');
   if(target>0&&current>target){if(!over){over=document.createElement('small');over.className='setup-macro-over';cell.append(over);}over.textContent='+'+new Intl.NumberFormat('ru-RU',{maximumFractionDigits:1}).format(current-target)+' г сверх ориентира';}else over?.remove();
  });
 });
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(enhance);}}
function start(){
 const style=document.createElement('style');style.id='setup-macro-glasses-style';
 style.textContent='html:root:root:root body #app .setup-macro-grid{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:12px!important;margin-top:24px!important}html:root:root:root body #app .setup-macro-cell{display:flex!important;flex-direction:column!important;align-items:center!important;gap:6px!important;min-width:0!important;text-align:center!important}html:root:root:root body #app .setup-macro-cell>.setup-macro-glass{order:-1!important;position:relative!important;display:block!important;width:clamp(46px,10vw,68px)!important;height:100px!important;min-height:100px!important;margin:0 0 8px!important;border:2px solid #adcabb80!important;border-top:3px solid #dcece6b3!important;border-radius:8px 8px 18px 18px!important;box-sizing:border-box!important;background:linear-gradient(110deg,#effff30d,#ffffff03)!important;overflow:hidden!important;box-shadow:inset 3px 0 8px #ffffff0f,0 6px 16px #001c1826!important}html:root:root:root body #app .setup-macro-glass>i{position:absolute!important;left:0!important;right:0!important;bottom:0!important;width:100%!important;height:var(--macro-fill)!important;min-height:0!important;display:block!important;background:linear-gradient(160deg,var(--macro-top),var(--macro-bottom))!important;border-radius:5px 5px 12px 12px!important}html:root:root:root body #app .setup-macro-glass::after{content:"";position:absolute;top:8px;bottom:10px;left:7px;width:4px;border-radius:8px;background:#ffffff40;pointer-events:none}html:root:root:root body #app .setup-macro-cell>b{font-size:clamp(12px,2.8vw,16px)!important;line-height:1.35;white-space:normal!important}html:root:root:root body #app .setup-macro-over{font-size:11px!important;color:#ffe49b!important;line-height:1.3}';
 document.getElementById(style.id)?.remove();document.head.append(style);enhance();
 new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['style']});
 window.addEventListener('pageshow',schedule);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
