(() => {
 let lastTab=null;
 const liters=value=>(value/1000).toLocaleString('ru-RU',{maximumFractionDigits:2});
 const ice='<svg class="wb-ice" viewBox="0 0 140 130" fill="none" aria-hidden="true"><g stroke="#89a8b7" stroke-width="2"><g transform="translate(52 6) rotate(16 30 30)"><rect width="58" height="58" rx="12" fill="#e4f3f9"/><rect x="7" y="7" width="44" height="44" rx="8" stroke="white" stroke-width="4"/></g><g transform="translate(10 56) rotate(-22 30 30)"><rect width="58" height="58" rx="12" fill="#d6eaf3"/><rect x="7" y="7" width="44" height="44" rx="8" stroke="white" stroke-width="4"/></g><g transform="translate(74 66) rotate(8 28 28)"><rect width="55" height="55" rx="12" fill="#e4f3f9"/><rect x="7" y="7" width="41" height="41" rx="8" stroke="white" stroke-width="4"/></g></g><path d="M24 14v14m-7-7h14M117 38v12m-6-6h12" stroke="white" stroke-width="2"/></svg>';
 function glass(full,plus){const fill=full||plus?'#94c9b7':'#c5e5f3',stroke=full||plus?'#6aa58f':'#8aaebd';return '<svg viewBox="0 0 60 90" fill="none" aria-hidden="true"><path d="M8 12h44l-5 66c-1 6-33 6-34 0Z" fill="'+fill+'" fill-opacity="'+(full?'.85':'.35')+'" stroke="'+stroke+'" stroke-width="2"/><path d="m12 28 4 47c1 3 27 3 28 0l4-47Z" fill="'+fill+'" fill-opacity=".65"/><ellipse cx="30" cy="12" rx="22" ry="4" fill="white" fill-opacity=".6" stroke="'+stroke+'" stroke-width="2"/><ellipse cx="30" cy="28" rx="18" ry="3" stroke="'+stroke+'"/><path d="m16 19 4 49" stroke="white" stroke-width="3" stroke-linecap="round"/>'+(plus?'<path d="M30 40v18m-9-9h18" stroke="#52987d" stroke-width="3" stroke-linecap="round"/>':'')+'</svg>'}
 function draw(){
  if(tab!=='diary'||!S.profile||editing)return;
  const app=document.getElementById('app');
  const heading=[...app.querySelectorAll('.dashboard h2')].find(node=>['Вода','Водный баланс'].includes(node.textContent.trim()));
  const card=heading?.closest('.card');if(!card)return;
  const water=Number((S.water||{})[day]||0),goal=Number((S.waterGoalsByDate||{})[day]||S.waterGoal||2000);
  card.classList.add('water-balance-card');
  card.innerHTML='<h2>Водный баланс</h2><div class="wb-panel"><div class="wb-top"><div><div class="wb-value" aria-live="polite">'+liters(water)+' л</div><div class="wb-goal">Цель '+liters(goal)+' л</div></div>'+ice+'</div><div class="wb-glasses" aria-label="Добавление воды: каждый стакан добавляет 250 мл">'+Array.from({length:7},(_,i)=>'<button type="button" class="wb-glass" data-wb-add aria-label="Добавить 250 мл воды" title="Добавить 250 мл">'+glass(water>=goal*(i+1)/7,i===0)+'</button>').join('')+'</div></div><div class="wb-actions"><button type="button" class="btn s" data-wb-minus '+(water<=0?'disabled':'')+'>− 250 мл</button><button type="button" class="btn s" data-wb-goal '+(goal+250>10000?'disabled':'')+'>Цель +250 мл</button></div><p class="subtle">Каждый стакан добавляет 250 мл. Заполнение показывает долю личной цели за выбранный день. Личная цель, не медицинская норма.</p>';
  card.querySelectorAll('[data-wb-add]').forEach(button=>button.onclick=()=>foodDiaryWaterAdd(250));
  card.querySelector('[data-wb-minus]').onclick=()=>foodDiaryWaterAdd(-250);
  card.querySelector('[data-wb-goal]').onclick=()=>foodDiaryWaterGoal();
 }
 function top(){if(tab==='diary')window.scrollTo({top:0,left:0,behavior:'instant'})}
 const previousRender=render;
 render=function(){const entering=tab==='diary'&&lastTab!=='diary';lastTab=tab;previousRender();draw();if(entering)requestAnimationFrame(()=>requestAnimationFrame(top))};
 window.addEventListener('pageshow',()=>{if(tab==='diary')requestAnimationFrame(top)});
 render();
})();
