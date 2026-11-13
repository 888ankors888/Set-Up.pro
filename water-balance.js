(() => {
 let lastTab=null,queued=false;
 const liters=value=>(value/1000).toLocaleString('ru-RU',{maximumFractionDigits:2});
 const style=document.createElement('style');style.textContent=`
 body #app .water-balance-card{box-sizing:border-box;width:100%;margin:20px 0;padding:24px!important;border:2px solid #d5f65a!important;border-radius:36px!important;background:radial-gradient(ellipse at 100% 100%,#395f48aa,transparent 65%),linear-gradient(125deg,#1c4833,#062b20 65%)!important;color:#fff;box-shadow:0 0 22px #c9fa4920;--tx:#fff;--mu:#c2d2c7;--ln:#a3bd8e44;--ac:#d5f65a;--ac2:#234b32}
 body #app .water-balance-card>h2{color:#fff;font-size:28px;font-weight:800;margin:0 0 16px}
 body #app .water-balance-card .wb-panel{background:#062b2055;border:1px solid #a3bd8e44;border-radius:24px}
 body #app .water-balance-card .wb-value{color:#d5f65a}
 body #app .water-balance-card .wb-goal,body #app .water-balance-card .subtle{color:#c2d2c7}
 body #app .water-balance-card .wb-actions .btn{border:1px solid #d5f65a;border-radius:999px;min-height:46px;background:transparent;color:#d5f65a;box-shadow:none}
 body #app .water-balance-card .wb-actions [data-wb-plus]{background:linear-gradient(110deg,#ddff59,#c9f53a);color:#142d12}
 @media(max-width:650px){body #app .water-balance-card{padding:16px!important;border-radius:22px!important;margin:12px 0}body #app .water-balance-card>h2{font-size:22px}body #app .water-balance-card .wb-top{padding:14px 16px;min-height:110px}body #app .water-balance-card .wb-glasses{padding:12px 10px}body #app .water-balance-card .wb-value{font-size:34px}body #app .water-balance-card .wb-goal{font-size:14px;margin-top:6px}body #app .water-balance-card .wb-ice{width:100px;height:90px}}`;document.head.append(style);
 function place(){queued=false;if(tab!=='diary')return;const app=document.getElementById('app'),grid=app?.querySelector('#meal-picker .meal-picker-grid'),card=app?.querySelector('.water-balance-card');if(grid&&card&&grid.nextElementSibling!==card)grid.after(card)}
 function schedule(){if(!queued){queued=true;requestAnimationFrame(place)}}
 function glass(full){return '<svg viewBox="0 0 60 90" fill="none" aria-hidden="true"><path d="M8 12h44l-5 66c-1 6-33 6-34 0Z" fill="'+(full?'#45BCEB':'#b7dbd3')+'" fill-opacity="'+(full?'.9':'.15')+'" stroke="'+(full?'#8AE0F5':'#c2d2c7')+'" stroke-width="2"/><ellipse cx="30" cy="12" rx="22" ry="4" stroke="'+(full?'#8AE0F5':'#c2d2c7')+'"/><path d="M30 38v18m-9-9h18" stroke="'+(full?'#e4faff':'#8AE0F5')+'" stroke-width="3" stroke-linecap="round"/></svg>'}
 function draw(){
 if(tab!=='diary'||!S.profile||editing)return;const app=document.getElementById('app');if(!app)return;const heading=[...app.querySelectorAll('.dashboard h2')].find(n=>['Вода','Водный баланс'].includes(n.textContent.trim()));const card=heading?.closest('.card')||app.querySelector('.water-balance-card');if(!card)return;
 const water=Number((S.water||{})[day]||0),goal=Number(S.profile?.nutritionGoalSettings?.waterMl||S.waterGoal||2000);card.classList.add('water-balance-card');
 card.innerHTML='<h2>Водный баланс</h2><div class="wb-panel"><div class="wb-top"><div><div class="wb-value" aria-live="polite">'+liters(water)+' л</div><div class="wb-goal">Цель '+liters(goal)+' л</div></div></div><div class="wb-glasses" aria-label="Каждый стакан добавляет 250 мл">'+Array.from({length:Math.max(7,Math.ceil(water/250))},(_,i)=>'<button type="button" class="wb-glass" data-wb-add aria-label="Добавить 250 мл воды">'+glass(water>=250*(i+1))+'</button>').join('')+'</div></div><div class="wb-actions"><button type="button" class="btn s" data-wb-minus '+(water<=0?'disabled':'')+'>− 250 мл</button><button type="button" class="btn s" data-wb-plus>+250 мл</button></div><p class="subtle">Один стакан — 250 мл. Нажатие добавляет 250 мл. Дополнительные стаканы появляются по мере заполнения; цель берётся из анкеты. Личная цель, не медицинская норма.</p>';
 card.querySelectorAll('[data-wb-add]').forEach(b=>b.onclick=()=>foodDiaryWaterAdd(250));card.querySelector('[data-wb-minus]').onclick=()=>foodDiaryWaterAdd(-250);card.querySelector('[data-wb-plus]').onclick=()=>foodDiaryWaterAdd(250);place();schedule();
 }
 const app=document.getElementById('app');if(app)new MutationObserver(schedule).observe(app,{childList:true,subtree:true});
 function top(){if(tab==='diary')window.scrollTo({top:0,left:0,behavior:'instant'})}
 const previousRender=render;render=function(){const entering=tab==='diary'&&lastTab!=='diary';lastTab=tab;const result=previousRender.apply(this,arguments);draw();if(entering)requestAnimationFrame(()=>requestAnimationFrame(top));return result};
 window.addEventListener('pageshow',()=>{schedule();if(tab==='diary')requestAnimationFrame(top)});render();
})();
