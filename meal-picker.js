(() => {
 const meals=[['Завтрак',.25],['Обед',.35],['Ужин',.30],['Перекус',.10]];
 function mount(){
  if(tab!=='diary'||!S.profile||editing)return;
  const estimate=document.getElementById('meal-entry-anchor')||document.getElementById('meal-estimate');if(!estimate)return;
  document.getElementById('meal-picker')?.remove();
  const t=targets(S.profile),valid=Number.isFinite(t.k)&&t.k>0&&Number.isFinite(t.p);
  const section=document.createElement('section');section.id='meal-picker';section.className='meal-picker';section.setAttribute('aria-label','Выберите приём пищи');
  section.innerHTML='<div class="meal-picker-grid">'+meals.map(([name,share],i)=>'<button type="button" class="meal-pick" data-meal-index="'+i+'" aria-pressed="'+(ME.meal===name)+'" '+(ME.busy?'disabled':'')+'><span class="meal-pick-copy"><span class="meal-pick-title">'+name+'</span><span class="meal-pick-hint">'+(valid?'Ориентир: ≈ '+Math.round(t.k*share)+' ккал · белок ≈ '+Math.round(t.p*share)+' г. '+Math.round(share*100)+'% дневного ориентира из анкеты.':'Заполните анкету в «Мои цели», чтобы увидеть ориентир.')+'</span></span><span class="meal-pick-action" aria-hidden="true">'+name+'</span></button>').join('')+'</div><p class="subtle">Условное распределение дневного ориентира, не обязательная норма и не медицинская рекомендация. Тарелки — иллюстрации, не персональное меню. Учитывайте ограничения из анкеты.</p>';
  section.querySelectorAll('[data-meal-index]').forEach(button=>{button.setAttribute('aria-label','Добавить запись: '+meals[Number(button.dataset.mealIndex)][0]);button.onclick=()=>{
   if(ME.busy)return;
   window.foodOpenMealWindow(meals[Number(button.dataset.mealIndex)][0]);
  }});
  estimate.before(section);
 }
 const previousRender=render;render=function(){previousRender();mount()};
 const previousRefresh=meRefresh;meRefresh=function(){previousRefresh();mount()};
 mount();
})();
