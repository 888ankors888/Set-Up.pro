(() => {
 const meals=[['Завтрак',.25],['Обед',.35],['Ужин',.30],['Перекус',.10]];
 const food=[
 '<rect x="28" y="36" width="36" height="46" rx="8" fill="#c99155" transform="rotate(-12 46 59)"/><rect x="32" y="40" width="28" height="36" rx="5" fill="#e7c088"/><path d="M68 35c17-10 33 5 27 20 8 17-11 32-25 23-20 0-24-25-12-32Z" fill="#fffdf0"/><circle cx="76" cy="57" r="12" fill="#f0bd43"/><circle cx="38" cy="88" r="6" fill="#a94f64"/><circle cx="51" cy="90" r="5" fill="#665887"/>',
 '<ellipse cx="44" cy="59" rx="19" ry="28" fill="#eee3c3"/><path d="M66 39q30-15 32 20-3 30-29 23-11-19-3-43Z" fill="#c58c58"/><path d="m72 47 18 8m-18 4 18 8m-16 4 13 5" stroke="#9a643e" stroke-width="3"/><g fill="#69a878"><circle cx="39" cy="34" r="10"/><circle cx="29" cy="41" r="9"/><circle cx="54" cy="31" r="9"/></g><circle cx="45" cy="89" r="8" fill="#c96b60"/>',
 '<path d="M29 58q25-31 51 0-25 29-51 0Z" fill="#e5ab8e"/><path d="m80 58 16-14v28Z" fill="#cf947b"/><path d="m44 45 8 24m5-29 9 25" stroke="#bf826d" stroke-width="3"/><g fill="#72a77b"><circle cx="42" cy="84" r="10"/><circle cx="59" cy="88" r="11"/><circle cx="80" cy="84" r="10"/></g><path d="M62 27h25v9H62Z" fill="#e5ce64"/>',
 '<path d="M25 45q13-13 25-1 16-6 20 10 4 24-18 34-25 1-28-24Z" fill="#cb7368"/><path d="m46 44 2-14" stroke="#795d46" stroke-width="4"/><path d="M49 34q9-15 19-5-7 12-19 5Z" fill="#6e9f72"/><path d="m73 45 4 40h19l4-40Z" fill="#e7edf1" stroke="#a9c1cb"/><ellipse cx="86" cy="45" rx="14" ry="5" fill="#fffaf0"/>'
 ];
 function plate(index){return '<svg viewBox="0 0 120 120" fill="none" aria-hidden="true"><circle cx="60" cy="60" r="55" fill="#fff" stroke="#dce8e2" stroke-width="3"/><circle cx="60" cy="60" r="45" fill="#f3f6f1"/>'+food[index]+'</svg>'}
 function mount(){
  if(tab!=='diary'||!S.profile||editing)return;
  const estimate=document.getElementById('meal-entry-anchor')||document.getElementById('meal-estimate');if(!estimate)return;
  document.getElementById('meal-picker')?.remove();
  const t=targets(S.profile),valid=Number.isFinite(t.k)&&t.k>0&&Number.isFinite(t.p);
  const section=document.createElement('section');section.id='meal-picker';section.className='meal-picker';section.setAttribute('aria-label','Выберите приём пищи');
  section.innerHTML='<div class="meal-picker-grid">'+meals.map(([name,share],i)=>'<button type="button" class="meal-pick" data-meal-index="'+i+'" aria-pressed="'+(ME.meal===name)+'" '+(ME.busy?'disabled':'')+'><span class="meal-pick-copy"><span class="meal-pick-title">'+name.toLocaleUpperCase('ru-RU')+'</span><span class="meal-pick-hint">'+(valid?'Ориентир: ≈ '+Math.round(t.k*share)+' ккал · белок ≈ '+Math.round(t.p*share)+' г. '+Math.round(share*100)+'% дневного ориентира из анкеты.':'Заполните анкету в «Мои цели», чтобы увидеть ориентир.')+'</span></span>'+plate(i)+'</button>').join('')+'</div><p class="subtle">Условное распределение дневного ориентира, не обязательная норма и не медицинская рекомендация. Тарелки — иллюстрации, не персональное меню. Учитывайте ограничения из анкеты.</p>';
  section.querySelectorAll('[data-meal-index]').forEach(button=>button.onclick=()=>{
   if(ME.busy)return;
   window.foodOpenMealWindow(meals[Number(button.dataset.mealIndex)][0]);
  });
  estimate.before(section);
 }
 const previousRender=render;render=function(){previousRender();mount()};
 const previousRefresh=meRefresh;meRefresh=function(){previousRefresh();mount()};
 mount();
})();
