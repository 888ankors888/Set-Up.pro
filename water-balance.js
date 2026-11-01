(() => {
 let lastTab=null;
 const liters=value=>(value/1000).toLocaleString('ru-RU',{maximumFractionDigits:2});
 const ice='<img class="wb-ice" src="assets/water-ice.webp?v=1" alt="" style="object-fit:contain" decoding="async">';
 function glass(full,plus){const fill=full||plus?'#94c9b7':'#c5e5f3',stroke=full||plus?'#6aa58f':'#8aaebd';return '<svg viewBox="0 0 60 90" fill="none" aria-hidden="true"><path d="M8 12h44l-5 66c-1 6-33 6-34 0Z" fill="'+fill+'" fill-opacity="'+(full?'.85':'.35')+'" stroke="'+stroke+'" stroke-width="2"/><path d="m12 28 4 47c1 3 27 3 28 0l4-47Z" fill="'+fill+'" fill-opacity=".65"/><ellipse cx="30" cy="12" rx="22" ry="4" fill="white" fill-opacity=".6" stroke="'+stroke+'" stroke-width="2"/><ellipse cx="30" cy="28" rx="18" ry="3" stroke="'+stroke+'"/><path d="m16 19 4 49" stroke="white" stroke-width="3" stroke-linecap="round"/>'+(plus?'<path d="M30 40v18m-9-9h18" stroke="#52987d" stroke-width="3" stroke-linecap="round"/>':'')+'</svg>'}
 function draw(){
  if(tab!=='diary'||!S.profile||editing)return;
  const app=document.getElementById('app');
  const heading=[...app.querySelectorAll('.dashboard h2')].find(node=>['Вода','Водный баланс'].includes(node.textContent.trim()));
  const card=heading?.closest('.card');if(!card)return;
  const water=Number((S.water||{})[day]||0),goal=Number(S.profile?.nutritionGoalSettings?.waterMl||S.waterGoal||2000);
  card.classList.add('water-balance-card');
  card.innerHTML='<h2>Водный баланс</h2><div class="wb-panel"><div class="wb-top"><div><div class="wb-value" aria-live="polite">'+liters(water)+' л</div><div class="wb-goal">Цель '+liters(goal)+' л</div></div>'+ice+'</div><div class="wb-glasses" aria-label="Добавление воды: каждый стакан добавляет 250 мл">'+Array.from({length:Math.max(7,Math.ceil(water/250))},(_,i)=>'<button type="button" class="wb-glass" data-wb-add aria-label="Добавить 250 мл воды" title="Добавить 250 мл">'+glass(water>=250*(i+1),i===0)+'</button>').join('')+'</div></div><div class="wb-actions"><button type="button" class="btn s" data-wb-minus '+(water<=0?'disabled':'')+'>− 250 мл</button><button type="button" class="btn s" data-wb-plus>+250 мл</button></div><p class="subtle">Один стакан — 250 мл. Нажатие добавляет 250 мл. Дополнительные стаканы появляются по мере заполнения; цель берётся из анкеты. Личная цель, не медицинская норма.</p>';
  card.querySelectorAll('[data-wb-add]').forEach(button=>button.onclick=()=>foodDiaryWaterAdd(250));
  card.querySelector('[data-wb-minus]').onclick=()=>foodDiaryWaterAdd(-250);
  card.querySelector('[data-wb-plus]').onclick=()=>foodDiaryWaterAdd(250);
 }
 function top(){if(tab==='diary')window.scrollTo({top:0,left:0,behavior:'instant'})}
 const previousRender=render;
 render=function(){const entering=tab==='diary'&&lastTab!=='diary';lastTab=tab;previousRender();draw();if(entering)requestAnimationFrame(()=>requestAnimationFrame(top))};
 window.addEventListener('pageshow',()=>{if(tab==='diary')requestAnimationFrame(top)});
 render();
})();
