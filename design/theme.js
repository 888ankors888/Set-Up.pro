(() => {
'use strict';
const KEY='setup.theme.v1',root=document.documentElement;
let mode='dark',button;
try{const value=localStorage.getItem(KEY);if(value==='light'||value==='dark')mode=value;}catch(error){}
const sun='<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',moon='<path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z"/>';
function apply(){root.dataset.setupTheme=mode;root.dataset.theme=mode;root.style.colorScheme=mode;if(button){button.setAttribute('aria-label',mode==='dark'?'Включить светлую тему':'Включить тёмную тему');button.setAttribute('aria-pressed',String(mode==='light'));button.title=button.getAttribute('aria-label');button.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(mode==='dark'?sun:moon)+'</svg>';}}
apply();
function start(){if(document.getElementById('setup-theme-toggle'))return;button=document.createElement('button');button.id='setup-theme-toggle';button.type='button';button.className='setup-theme-toggle';button.onclick=()=>{mode=mode==='dark'?'light':'dark';apply();try{localStorage.setItem(KEY,mode);}catch(error){button.title+=' · выбор не сохранён: хранилище недоступно';}};document.body.append(button);apply();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.addEventListener('storage',event=>{if(event.key!==KEY)return;mode=event.newValue==='light'?'light':'dark';apply();});
})();
