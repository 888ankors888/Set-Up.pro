(() => {
'use strict';
const root=document.documentElement;
function dark(){if(root.dataset.theme!=='dark')root.dataset.theme='dark';if(root.dataset.setupTheme!=='dark')root.dataset.setupTheme='dark';if(root.style.colorScheme!=='dark')root.style.colorScheme='dark';try{if(localStorage.getItem('setup.theme.v1')!=='dark')localStorage.setItem('setup.theme.v1','dark');}catch(error){}}
dark();
new MutationObserver(dark).observe(root,{attributes:true,attributeFilter:['data-theme','data-setup-theme','style']});
window.addEventListener('storage',event=>{if(event.key==='setup.theme.v1'||event.key===null)dark();});
const css=document.createElement('style');css.id='setup-dark-only';css.textContent='html:root body #setup-theme-toggle,html:root body .setup-theme-toggle,html:root body [data-theme-toggle]{display:none!important}html{color-scheme:dark}html:root:root:root body{background:linear-gradient(155deg,#1b5040 0%,#103b30 48%,#05241f 100%)!important;background-attachment:scroll!important;min-height:100vh}';document.head.append(css);
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
