(() => {
'use strict';
const STYLE=`
#nav .setup-native-nav-item{display:none!important}
#nav .setup-wordnav{--menu-lime:#c8f568;display:flex;flex-direction:column;gap:4px;width:100%;position:relative;padding:8px;border:1px solid var(--ln);border-radius:20px;background:var(--site-pane,var(--card));box-shadow:none;isolation:isolate}
#nav .setup-wordnav button{appearance:none;position:relative;display:flex;flex:0 0 auto;flex-direction:row;align-items:center;justify-content:flex-start;gap:0;width:100%;min-width:0;min-height:50px;margin:0;padding:13px 16px;border:0;border-radius:12px;background:transparent;color:var(--tx);font:600 20px/1.2 system-ui,sans-serif;letter-spacing:-.035em;cursor:pointer;box-shadow:none;text-shadow:none;transform:none;transition:background .18s}
#nav .setup-wordnav button.on{background:color-mix(in srgb,var(--menu-lime) 12%,transparent);color:var(--tx);box-shadow:none}
#nav .setup-wordnav>button:after{content:'';position:absolute;left:0;top:13px;bottom:13px;width:3px;border-radius:3px;background:var(--menu-lime);opacity:0}
#nav .setup-wordnav>button.on:after{opacity:1}
#nav .setup-wordnav .setup-initial{color:var(--menu-lime);font:inherit;font-weight:800;text-shadow:none;-webkit-text-stroke:0}
html[data-setup-theme=light] #nav .setup-wordnav .setup-initial{background:#20594c;border-radius:5px;padding:1px 3px;margin-right:1px}
#nav .setup-wordnav .setup-plus{margin-left:5px;font:400 22px/1 system-ui,sans-serif;color:var(--mu);transition:transform .18s}
#nav .setup-wordnav .setup-up[aria-expanded=true]{background:color-mix(in srgb,var(--menu-lime) 12%,transparent)}
#nav .setup-wordnav .setup-up[aria-expanded=true] .setup-plus{transform:rotate(45deg);color:var(--tx)}
#nav .setup-wordnav button:focus-visible{outline:2px solid #91b94d;outline-offset:2px}
#nav .setup-up-panel{position:absolute;left:calc(100% + 12px);bottom:0;width:250px;padding:10px;border:1px solid var(--ln);border-radius:18px;background:var(--card);box-shadow:0 12px 32px #001b161a;z-index:60}
#nav .setup-up-panel[hidden]{display:none!important}
#nav .setup-wordnav .setup-up-panel button{min-height:46px;padding:12px;border-radius:10px;font:600 14px/1.4 system-ui,sans-serif;letter-spacing:-.01em}
#nav .setup-up-panel .setup-panel-title{margin:4px 12px 8px;color:var(--mu);font:700 10px/1.5 system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase}
@media(hover:hover){#nav .setup-wordnav button:not(.on):not(:disabled):hover{background:color-mix(in srgb,var(--menu-lime) 8%,transparent)}}
@media(max-width:999px){#nav .setup-wordnav{flex-direction:row;gap:2px;padding:5px;border-radius:18px;align-items:stretch}#nav .setup-wordnav>button{flex:1 1 0;justify-content:center;min-height:48px;padding:10px 3px;font-size:clamp(15px,4.2vw,19px);border-radius:12px}#nav .setup-wordnav>button:after{left:24%;right:24%;top:auto;bottom:3px;height:2px;width:auto}#nav .setup-wordnav .setup-plus{font-size:20px;margin-left:3px}#nav .setup-up-panel{left:auto;right:0;bottom:calc(100% + 12px);width:min(270px,calc(100vw - 32px))}}
@media(prefers-reduced-motion:reduce){#nav .setup-wordnav button,#nav .setup-wordnav .setup-plus{transition:none}}
`;
let nav,bar,panel,up,signature='',queued=false,opened=false;
const targets=new Map();
function kind(button){
  if(button.dataset.setupNavKind)return button.dataset.setupNavKind;
  const label=button.textContent.trim();
  if(button.dataset.workoutJournal!==undefined||/Трениров|Спорт|^Sport$/.test(label))return 'sport';
  if(/Привыч|^Tracker$/.test(label))return 'tracker';
  if(/Питан|Дневник|^Eat$/.test(label))return 'eat';
  if(/Отч|Прогресс/.test(label))return 'report';
  if(/Настро|Профиль/.test(label))return 'settings';
  if(/Цел|цели|[Аа]нкета/.test(label))return 'questionnaire';
  return null;
}
function active(button){return !!button&&(button.classList.contains('on')||button.classList.contains('active')||button.getAttribute('aria-current')==='page');}
function close(restore=false){opened=false;if(panel)panel.hidden=true;if(up)up.setAttribute('aria-expanded','false');if(restore&&up)up.focus();}
function open(){opened=true;panel.hidden=false;up.setAttribute('aria-expanded','true');panel.querySelector('button')?.focus();}
function choose(name){const target=targets.get(name);close();if(target?.isConnected){target.click();schedule();}}
function proxy(name,label,initial){
  const b=document.createElement('button');b.type='button';b.dataset.setupDestination=name;b.setAttribute('aria-label',label);
  if(initial){const accent=document.createElement('span');accent.className='setup-initial';accent.textContent=initial;b.append(accent,document.createTextNode(label.slice(initial.length)));}
  else b.textContent=label;
  b.addEventListener('click',()=>choose(name));return b;
}
function mount(){
  bar=document.createElement('div');bar.className='setup-wordnav';bar.dataset.setupWordnav='true';
  bar.append(proxy('sport','Sport','S'),proxy('eat','Eat','E'),proxy('tracker','Tracker','T'));
  up=document.createElement('button');up.type='button';up.className='setup-up';up.setAttribute('aria-expanded','false');up.setAttribute('aria-controls','setup-up-panel');up.setAttribute('aria-label','Up+: Моя анкета, Отчёты, Настройки');
  const title=document.createElement('span');title.className='setup-initial';title.textContent='Up';
  const plus=document.createElement('span');plus.className='setup-plus';plus.textContent='+';plus.setAttribute('aria-hidden','true');up.append(title,plus);
  panel=document.createElement('div');panel.id='setup-up-panel';panel.className='setup-up-panel';panel.hidden=true;panel.setAttribute('role','group');panel.setAttribute('aria-label','Дополнительные страницы');
  const heading=document.createElement('div');heading.className='setup-panel-title';heading.textContent='Up+ / Личное';panel.append(heading,proxy('questionnaire','Моя анкета'),proxy('report','Отчёты'),proxy('settings','Настройки'));
  up.addEventListener('click',()=>opened?close():open());bar.append(up,panel);nav.append(bar);signature='';opened=false;
}
function renameHeading(){for(const h of document.querySelectorAll('h1,h2,h3')){if(h.textContent.trim()==='Мои цели')h.textContent='Моя анкета';}}
function render(){
  queued=false;
  renameHeading();
  const current=document.getElementById('nav');if(!current)return;
  if(nav!==current||!bar?.isConnected){nav=current;targets.clear();mount();}
  nav.setAttribute('aria-label','SETUP+ — главная навигация');
  for(const b of nav.querySelectorAll('button')){
    if(bar.contains(b))continue;
    const name=kind(b);if(!name)continue;
    b.dataset.setupNavKind=name;b.classList.add('setup-native-nav-item');targets.set(name,b);
  }
  const state=[...targets].map(([name,b])=>name+':'+Number(b.isConnected)+':'+Number(active(b))+':'+Number(b.disabled)).join('|');
  if(state===signature)return;signature=state;
  for(const b of bar.querySelectorAll('[data-setup-destination]')){
    const target=targets.get(b.dataset.setupDestination),selected=active(target);
    b.disabled=!target?.isConnected||!!target.disabled;b.classList.toggle('on',selected);
    if(selected)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
  }
  up.classList.toggle('on',['questionnaire','report','settings'].some(name=>active(targets.get(name))));
}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(render);}
function start(){
  if(!document.getElementById('setup-wordnav-style')){const s=document.createElement('style');s.id='setup-wordnav-style';s.textContent=STYLE;document.head.append(s);}
  render();
  const observer=new MutationObserver(records=>{if(records.some(r=>!bar?.contains(r.target)))schedule();});
  observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','disabled','aria-current']});
  document.addEventListener('pointerdown',event=>{if(opened&&!bar?.contains(event.target))close();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&opened){event.preventDefault();close(true);}});
  document.addEventListener('focusin',event=>{if(opened&&!bar?.contains(event.target))close();});
  window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
