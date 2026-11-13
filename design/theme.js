(() => {
'use strict';
const root=document.documentElement;
function dark(){if(root.dataset.theme!=='dark')root.dataset.theme='dark';if(root.dataset.setupTheme!=='dark')root.dataset.setupTheme='dark';if(root.style.colorScheme!=='dark')root.style.colorScheme='dark';try{if(localStorage.getItem('setup.theme.v1')!=='dark')localStorage.setItem('setup.theme.v1','dark');}catch(error){}}
dark();
new MutationObserver(dark).observe(root,{attributes:true,attributeFilter:['data-theme','data-setup-theme','style']});
window.addEventListener('storage',event=>{if(event.key==='setup.theme.v1'||event.key===null)dark();});
const css=document.createElement('style');css.id='setup-dark-only';
const background=new URL('../wellness-background.jpg',document.currentScript.src).href;
css.textContent='html:root body #setup-theme-toggle,html:root body .setup-theme-toggle,html:root body [data-theme-toggle]{display:none!important}html{color-scheme:dark}html:root:root:root body{background:#061F1A url('+JSON.stringify(background)+') center center / cover no-repeat fixed!important;min-height:100vh;min-height:100svh}@media(max-width:700px){html:root:root:root body{background-attachment:scroll!important;background-size:100% auto!important;background-repeat:repeat-y!important}}';document.head.append(css);
const glass=document.createElement('style');glass.id='setup-glass-cards';
const fill='background:rgba(6,31,26,.45)!important;';
const edge='border:1px solid rgba(67,201,154,.6)!important;box-shadow:inset 0 1px 0 rgba(220,255,240,.2),inset 0 -1px 0 rgba(8,124,101,.18),0 0 0 1px rgba(67,201,154,.08),0 0 20px rgba(67,201,154,.07),0 12px 32px rgba(0,20,16,.2)!important;';
glass.textContent='html:root:root:root body :is(.card,.welcome,.goals-questionnaire-block,.habit-category,.sport-category,.nutrition-category,.nutrition-diary-premium,.tip,.ent,.food-fit,.me-summary,.nutrition-ai-result){'+fill+edge+'backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}';
const sections='html:root:root:root body :is(#goals-questionnaire-about,#goals-questionnaire-nutrition,#goals-questionnaire-sport,#goals-questionnaire-habits):is(.goals-questionnaire-block,.sport-wellness)';
glass.textContent+=sections+'{'+fill+edge+'}';
const nested=sections+' :is(.card,.goals-questionnaire-fields,.nutrition-category,.sport-category,.habit-category,.nutrition-ai-result)';
glass.textContent+=nested+'{background:transparent!important;'+edge+'backdrop-filter:none!important;-webkit-backdrop-filter:none!important;--tx:#f4faf4!important;--mu:#a9cbc0!important;--ac:#d0ff68!important;--ac2:#19483b!important;--site-field:#072d27!important;--ln:#31584b!important;color:#f4faf4!important;color-scheme:dark}';
glass.textContent+=nested+' :is(summary,h2,h3,h4,p,legend,label,small,span,.chk,.subtle,.habit-check){color:#f4faf4!important;-webkit-text-fill-color:#f4faf4!important}';
glass.textContent+=nested+' :is(input,select,textarea){background:#072d27!important;color:#f4faf4!important;-webkit-text-fill-color:#f4faf4!important;border-color:#31584b!important}';
const selected=sections+' :is(label.chk,label.habit-check):has(input:checked)';
glass.textContent+=selected+','+selected+' *{color:#000!important;-webkit-text-fill-color:#000!important}';
glass.textContent+=sections+' .sw-selected .sw-count,'+sections+' .sw-selected .sw-count *{color:#000!important;-webkit-text-fill-color:#000!important}';
glass.textContent+='html:root:root:root body #goals-questionnaire-about.goals-questionnaire-block>.goals-questionnaire-fields{border:0!important;box-shadow:none!important;outline:none!important;}';
document.head.append(glass);
const labels=new Set(['Тема','◐ Тема','Сменить тему','Изменить тему','Переключить тему','Переключить тему оформления','Светлая тема','Тёмная тема','Темная тема','Светлая','Тёмная','Темная','Системная тема']);
let queued=false;
function clean(){queued=false;document.querySelectorAll('button,input[type=button],select,[role=button]').forEach(control=>{const text=(control.textContent||control.value||'').replace(/\s+/g,' ').trim(),handler=(control.getAttribute('onclick')||'')+' '+(control.getAttribute('onchange')||'');const themeHandler=/\b(?:toggleTheme|changeTheme|setTheme)\s*\(/.test(handler);if(control.id==='setup-theme-toggle'||control.classList.contains('setup-theme-toggle')||control.hasAttribute('data-theme-toggle')||labels.has(text)||themeHandler)control.remove();});document.getElementById('setup-native-theme-compat')?.remove();dark();}
function schedule(){if(!queued){queued=true;requestAnimationFrame(clean);}}
function start(){clean();new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.addEventListener('pageshow',schedule);
})();

(() => {
'use strict';
if(/\/workouts\.html$/.test(location.pathname))return;
const root=document.documentElement;
const style=document.createElement('style');
style.id='setup-initial-loading-style';
style.textContent='html[data-setup-loading]::before{content:"Загрузка…";position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;background:var(--bg,#042923);color:var(--tx,#f4faf4);font:500 16px/1.5 system-ui,sans-serif;cursor:progress}html[data-setup-loading] body{visibility:hidden!important}';
document.head.append(style);
root.setAttribute('data-setup-loading','');
const previousBusy=root.getAttribute('aria-busy');root.setAttribute('aria-busy','true');
let done=false,previousInert=false,inertBody=null;
function lock(){if(done||!document.body)return;inertBody=document.body;previousInert=inertBody.inert;inertBody.inert=true;}
function reveal(){if(done)return;done=true;clearTimeout(fallback);root.removeAttribute('data-setup-loading');if(previousBusy===null)root.removeAttribute('aria-busy');else root.setAttribute('aria-busy',previousBusy);if(inertBody)inertBody.inert=previousInert;window.removeEventListener('load',ready);}
function ready(){requestAnimationFrame(()=>requestAnimationFrame(reveal));}
const fallback=setTimeout(reveal,15000);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',lock,{once:true});else lock();
if(document.readyState==='complete')ready();else window.addEventListener('load',ready,{once:true});
window.addEventListener('pageshow',event=>{if(event.persisted)reveal();});
})();

(() => {
const source=document.currentScript?.src;
if(!source||document.getElementById('sport-wellness-module'))return;
const url=new URL('sport-wellness.js',source);url.search=new URL(source).search;
const script=document.createElement('script');script.id='sport-wellness-module';script.src=url.href;script.defer=true;document.head.append(script);
})();
