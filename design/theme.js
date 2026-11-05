(() => {
'use strict';
const KEY='setup.theme.v1',root=document.documentElement;
const valid=value=>value==='light'||value==='dark';
const system=window.matchMedia('(prefers-color-scheme: dark)');
let toggle,queued=false;
function saved(){try{return localStorage.getItem(KEY);}catch(error){return null;}}
function persist(mode){try{if(localStorage.getItem(KEY)!==mode)localStorage.setItem(KEY,mode);}catch(error){}}
function sync(){
 const mode=valid(root.dataset.theme)?root.dataset.theme:(system.matches?'dark':'light');
 if(root.dataset.setupTheme!==mode)root.dataset.setupTheme=mode;
 root.style.colorScheme=mode;persist(mode);
 if(toggle){const title=mode==='dark'?'Включить светлую тему':'Включить тёмную тему';toggle.setAttribute('aria-pressed',String(mode==='dark'));toggle.setAttribute('aria-label','Тёмная тема');toggle.title=title;}
}
root.dataset.theme=valid(root.dataset.theme)?root.dataset.theme:(valid(saved())?saved():'dark');
sync();
new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['data-theme']});
function mount(){
 queued=false;if(!document.body)return;
 if(!document.getElementById('setup-native-theme-compat')){
 const style=document.createElement('style');style.id='setup-native-theme-compat';
 style.textContent='html:root body #setup-theme-toggle{position:fixed!important;right:16px!important;top:calc(12px + env(safe-area-inset-top,0px))!important;z-index:80!important;display:inline-flex!important;visibility:visible!important;opacity:1!important;align-items:center;justify-content:center;gap:7px;width:auto!important;height:auto!important;min-height:44px;padding:9px 14px;border:1px solid var(--ln);border-radius:999px;background:var(--card);color:var(--tx);font:600 14px/1.3 system-ui,sans-serif;box-shadow:0 4px 16px #001b1620;cursor:pointer}#setup-theme-toggle:focus-visible{outline:3px solid var(--ac);outline-offset:3px}html:root body .topline{padding-right:110px}html:root body main>h1{padding-right:110px}html:root body #app{padding-top:60px}html:root body main{padding-top:72px}@media(min-width:1000px){html:root:root body:has(#nav){padding-left:0!important;padding-bottom:calc(110px + env(safe-area-inset-bottom,0px))!important}html:root:root body #nav{position:fixed!important;top:auto!important;bottom:0!important;left:0!important;right:0!important;width:100%!important;height:auto!important;display:flex!important;flex-direction:row!important;justify-content:center!important;padding:12px 16px calc(16px + env(safe-area-inset-bottom,0px))!important;gap:0!important;border:0!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;overflow:visible!important;z-index:60}}';
 document.head.append(style);
 }
 if(!toggle){toggle=document.createElement('button');toggle.id='setup-theme-toggle';toggle.className='setup-theme-toggle';toggle.type='button';toggle.textContent='◐ Тема';toggle.addEventListener('click',()=>{root.dataset.theme=root.dataset.setupTheme==='dark'?'light':'dark';sync();});}
 document.querySelectorAll('#setup-theme-toggle').forEach(node=>{if(node!==toggle)node.remove();});
 if(toggle.parentNode!==document.body)document.body.append(toggle);
 sync();
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(mount);}}
function start(){mount();new MutationObserver(records=>{if(records.some(record=>record.type==='childList'))schedule();}).observe(document.documentElement,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.addEventListener('pageshow',schedule);
window.addEventListener('storage',event=>{if(event.key!==KEY&&event.key!==null)return;const mode=event.key===null?null:event.newValue;root.dataset.theme=valid(mode)?mode:(system.matches?'dark':'light');sync();});
system.addEventListener('change',()=>{if(!valid(root.dataset.theme))sync();});
})();
