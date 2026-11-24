(() => {
'use strict';
const script=document.currentScript;
const source=new URL('../assets/logo-transparent.png',script.src).href;
const selector='.brand,main>.setup-home';
let loaded=false,queued=false;
const style=document.createElement('style');
style.id='setup-wordmark-repair';
style.textContent=`
html:root:root:root:root:root body .setup-header-art{display:flex!important;align-items:center!important;justify-content:center!important;gap:0!important;min-width:0!important;overflow:visible!important;font-size:0!important;line-height:normal!important;}
html:root:root:root:root:root body .setup-header-art::before,html:root:root:root:root:root body .setup-header-art::after{content:none!important;display:none!important;}
html:root:root:root:root:root body .setup-header-art>img.setup-header-art-image{display:block!important;position:static!important;flex:0 1 auto!important;width:100%!important;max-width:640px!important;min-width:0!important;height:auto!important;max-height:120px!important;object-fit:contain!important;object-position:center!important;aspect-ratio:2460/593!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;opacity:1!important;visibility:visible!important;}
@media(max-width:999px){
html:root:root:root:root:root body:has(#nav):has(.setup-header-art:not(.big)){padding-top:calc(140px + env(safe-area-inset-top,0px))!important;}
html:root:root:root:root:root body:has(#nav) .setup-header-art:not(.big){position:fixed!important;top:0!important;left:0!important;right:0!important;bottom:auto!important;width:100%!important;max-width:none!important;height:calc(132px + env(safe-area-inset-top,0px))!important;padding:calc(10px + env(safe-area-inset-top,0px)) 16px 28px!important;margin:0!important;box-sizing:border-box!important;}
html:root:root:root:root:root body:has(#nav) .setup-header-art>img.setup-header-art-image{max-height:94px!important;}
html:root:root:root:root:root body:has(#nav) .setup-header-art>time.setup-header-date{position:absolute!important;top:auto!important;right:16px!important;bottom:8px!important;left:auto!important;display:block!important;width:auto!important;height:auto!important;margin:0!important;padding:0!important;font-size:13px!important;}
}
@media(min-width:1000px){
html:root:root:root:root:root body .setup-header-art{position:relative!important;inset:auto!important;flex:0 1 640px!important;width:100%!important;max-width:640px!important;height:auto!important;min-height:80px!important;margin:12px auto 24px!important;padding:0!important;background:transparent!important;border:0!important;box-shadow:none!important;}
}
`;
document.head.append(style);
function apply(){
 queued=false;if(!loaded)return;
 document.querySelectorAll(selector).forEach(header=>{
 if(header.querySelector(':scope > img.setup-header-art-image'))return;
 const image=new Image();image.src=source;image.alt='Sport Eat Tracker UP';
 image.width=2460;image.height=593;image.className='setup-header-art-image';
 const date=header.querySelector('time.setup-header-date');
 header.replaceChildren(image);if(date)header.append(date);
 header.classList.add('setup-header-art');
 });
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(apply);}}
function start(){
 const probe=new Image();
 probe.onload=()=>{loaded=true;apply();};
 probe.onerror=()=>console.warn('Set-Up: wordmark could not be loaded',source);
 probe.src=source;
 new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
 window.addEventListener('pageshow',schedule);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
