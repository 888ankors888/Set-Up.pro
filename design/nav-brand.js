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
