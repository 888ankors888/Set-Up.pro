(() => {
'use strict';
const number=n=>Math.round(n).toLocaleString('ru-RU');
const icons=[['k','ккал','#f5e641','<path d="M13 2c1 6-5 6-3 11-3-1-3-4-3-4S2 14 5 19c3 5 12 4 14-1 2-5-2-9-2-9s1 5-2 6c2-6-3-7-2-13Z" fill="currentColor" stroke="none"/>'],['p','белки','#d5f65a','<path d="M5 14 8 5l4-2 3 2-1 3-4-1-1 6c3-3 5-2 6 0 4-3 7 0 6 4-1 5-9 5-15 3L3 18l2-4Z"/><path d="M9 14c2 1 3 3 3 5"/>'],['f','жиры','#53d5e2','<path d="M12 2S3 12 3 17a9 9 0 0 0 18 0C21 12 12 2 12 2Z"/>'],['c','углеводы','#d5f65a','<path d="m5 23 14-21M9 17C3 17 3 12 3 12c5 0 7 2 6 5Zm3-5C6 12 7 7 7 7c5 1 6 3 5 5Zm3-5c-4-2-2-6-2-6s4 2 2 6Zm-5 10c5 2 8-2 8-2s-5-2-8 2Zm3-5c5 2 8-2 8-2s-5-2-8 2Z"/>']];
function energyCard(root){return [...root.querySelectorAll('h2,h3')].find(h=>h.textContent.trim()==='Энергия дня')?.closest('.card')||root.querySelector('#diary-daily-energy')}
const style=document.createElement('style');style.id='energy-nutrient-icons-v2';style.textContent=`
[data-energy-icons] .energy-nutrients{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr));gap:0;margin-top:22px;padding:18px 8px;border:1px solid #6c8e5366;border-radius:999px;background:linear-gradient(120deg,#21482f,#092b20);color:#fff;box-sizing:border-box}
[data-energy-icons] .energy-nutrient{display:flex;align-items:center;justify-content:center;gap:10px;min-width:0;padding:0 8px}
[data-energy-icons] .energy-nutrient+.energy-nutrient{border-left:1px solid #a5c0ad88}
[data-energy-icons] .energy-nutrient svg{width:30px;height:36px;flex:none;overflow:visible}
[data-energy-icons] .energy-nutrient b{display:block;color:#fff;font-size:22px;line-height:1.2;white-space:nowrap}
[data-energy-icons] .energy-nutrient span{display:block;color:#b6c8ba;font-size:15px;line-height:1.4}
@media(max-width:650px){[data-energy-icons] .energy-nutrients{padding:14px 3px;border-radius:24px}[data-energy-icons] .energy-nutrient{gap:5px;padding:0 4px}[data-energy-icons] .energy-nutrient svg{width:20px;height:27px}[data-energy-icons] .energy-nutrient b{font-size:14px}[data-energy-icons] .energy-nutrient span{font-size:10px}}
`;document.head.append(style);
const previousDiary=diaryView;
diaryView=function(){const markup=previousDiary.apply(this,arguments);if(!S.profile)return markup;const t=document.createElement('template');t.innerHTML=markup;const card=energyCard(t.content);if(card&&!t.content.querySelector('#diary-daily-energy'))card.id='diary-daily-energy';return t.innerHTML};
let queued=false,observer;
function apply(){
queued=false;if(typeof tab==='undefined'||tab!=='diary'||!S.profile)return;const app=document.getElementById('app'),card=app&&energyCard(app);if(!card||card.classList.contains('water-balance-card'))return;
const values=tot(day);if(!icons.every(([key])=>Number.isFinite(values[key])&&values[key]>=0))return;
observer?.disconnect();try{
card.setAttribute('data-energy-icons','true');
let row=card.querySelector('.energy-nutrients');
const legacy=[...card.querySelectorAll('div,section')].reverse().find(n=>!n.closest('.energy-nutrients,.water-balance-card')&&!n.querySelector('h2,h3,.energy,.ring,.energy-orbit,.energy-nutrients')&&['белки','жиры','углеводы'].every(label=>n.textContent.toLowerCase().includes(label)));
if(!row){row=document.createElement('div');row.className='energy-nutrients';row.setAttribute('aria-label','Записанные калории, белки, жиры и углеводы');if(legacy)legacy.replaceWith(row);else{const diagram=card.querySelector('.energy');if(diagram)diagram.after(row);else card.append(row)}}else if(legacy)legacy.remove();
card.querySelectorAll('.m3').forEach(n=>{if(!n.contains(row)&&!n.closest('.water-balance-card'))n.remove()});
const signature=JSON.stringify([day,...icons.map(([key])=>values[key])]);
if(row.dataset.values!==signature||row.children.length!==4){row.innerHTML=icons.map(([key,label,color,path])=>'<div class="energy-nutrient"><svg viewBox="0 0 24 26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="color:'+color+'" aria-hidden="true">'+path+'</svg><div><b>'+number(values[key])+(key==='k'?'':' г')+'</b><span>'+label+'</span></div></div>').join('');row.dataset.values=signature}
}finally{if(app)observer?.observe(app,{childList:true,subtree:true,characterData:true})}
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(apply)}}
function start(){const app=document.getElementById('app');if(app){observer=new MutationObserver(schedule);observer.observe(app,{childList:true,subtree:true,characterData:true})}schedule()}
const previousRender=render;render=function(){const result=previousRender.apply(this,arguments);schedule();return result};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();window.addEventListener('pageshow',schedule);render();
})();
