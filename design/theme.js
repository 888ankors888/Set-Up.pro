(() => {
'use strict';
const KEY='setup.theme.v1',root=document.documentElement;
const valid=value=>value==='light'||value==='dark';
const system=window.matchMedia('(prefers-color-scheme: dark)');
function saved(){try{return localStorage.getItem(KEY);}catch(error){return null;}}
function persist(mode){try{localStorage.setItem(KEY,mode);}catch(error){}}
function sync(){
  const mode=valid(root.dataset.theme)?root.dataset.theme:(system.matches?'dark':'light');
  root.dataset.setupTheme=mode;
  root.style.colorScheme=mode;
  persist(mode);
}
const initial=valid(root.dataset.theme)?root.dataset.theme:(valid(saved())?saved():'dark');
root.dataset.theme=initial;
sync();
new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['data-theme']});
function start(){
  document.getElementById('setup-theme-toggle')?.remove();
  if(!document.getElementById('setup-native-theme-compat')){
    const style=document.createElement('style');
    style.id='setup-native-theme-compat';
    style.textContent='.setup-theme-toggle{display:none!important}body .topline{padding-right:0}body main>h1{padding-right:0}@media(min-width:1000px){html:root:root body:has(#nav){padding-left:0!important;padding-bottom:calc(110px + env(safe-area-inset-bottom,0px))!important}html:root:root body #nav{position:fixed!important;top:auto!important;bottom:0!important;left:0!important;right:0!important;width:100%!important;height:auto!important;display:flex!important;flex-direction:row!important;justify-content:center!important;padding:12px 16px calc(16px + env(safe-area-inset-bottom,0px))!important;gap:0!important;border:0!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;overflow:visible!important;z-index:60}}';
    document.head.append(style);
  }
  sync();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.addEventListener('storage',event=>{
  if(event.key!==KEY&&event.key!==null)return;
  const mode=event.key===null?null:event.newValue;
  root.dataset.theme=valid(mode)?mode:(system.matches?'dark':'light');
  sync();
});
system.addEventListener('change',()=>{if(!valid(root.dataset.theme))sync();});
})();
