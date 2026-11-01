(() => {
 let menuDate=null,context=null;
 function validDate(date){return /^\d{4}-\d{2}-\d{2}$/.test(date)&&Number.isFinite(dt(date).getTime())&&dk(dt(date))===date&&date<=today()}
 function contextLabel(){const card=document.getElementById('meal-estimate');if(!card||!context||context.mode!=='estimate')return;if(!card.querySelector('#diary-estimate-context'))card.insertAdjacentHTML('afterbegin',`<div class="tip" id="diary-estimate-context">Запись за выбранный день: ${esc(fmt(context.date))}. Перед сохранением можно изменить дату в форме.</div>`)}
 function drawDiaryActions(){
  document.querySelectorAll('#nav button').forEach(button=>{if(button.textContent.trim()==='Журнал')button.remove()});
  if(context&&((context.mode==='catalog'&&tab!=='journal')||(context.mode==='estimate'&&tab!=='today')))context=null;
  contextLabel();
  if(tab!=='diary'||!S.profile||editing)return;
  const button=document.querySelector('#app button[onclick="manualOpen()"]');if(!button)return;
  button.removeAttribute('onclick');button.setAttribute('aria-expanded',String(menuDate===day));button.setAttribute('aria-controls','diary-entry-actions');
  button.onclick=()=>{menuDate=menuDate===day?null:day;render()};
  if(menuDate!==day)return;
  button.insertAdjacentHTML('afterend',`<section class="card" id="diary-entry-actions"><h2>Добавить запись · ${esc(fmt(day))}</h2><div class="food-action-title">С помощью ИИ</div><div class="food-action-grid"><button class="btn food-action-primary" onclick="foodDiaryEntry('text')">Рассчитать через ИИ</button><button class="btn food-action-primary" onclick="foodDiaryEntry('photo')">Рассчитать по фото</button></div><section class="food-manual-actions"><div class="food-action-title">Вручную</div><div class="food-action-grid"><button class="btn food-action-secondary" onclick="foodDiaryEntry('product')">＋ Добавить продукт</button><button class="btn food-action-secondary" onclick="foodDiaryEntry('manual')">Ввести блюдо</button></div></section></section>`);
 }
 window.foodDiaryEntry=function(mode){
  const date=day;if(!validDate(date)){toast('Проверьте выбранную дату');return}
  if(mode==='manual'){context=null;manualOpen();return}
  if(mode==='product'){context={date,mode:'catalog'};menuDate=null;tab='journal';render();scrollTo(0,0);return}
  if(!['text','photo'].includes(mode))return;
  if(ME.busy){toast('Дождитесь завершения текущего расчёта');return}
  if(ME.dishes.length&&!confirm('Начать новую запись? Текущий несохранённый разбор будет заменён.'))return;
  Object.assign(ME,{date,meal:mealNow(),text:'',sourceText:'',dishes:[],questions:[],error:'',demo:false,confirmed:false});
  context={date,mode:'estimate'};menuDate=null;tab='today';render();
  document.getElementById('meal-estimate')?.scrollIntoView({behavior:'smooth'});
  if(mode==='text'){document.getElementById('me-text')?.focus();return}
  const input=document.createElement('input');input.type='file';input.accept='image/*';input.setAttribute('capture','environment');input.hidden=true;document.body.appendChild(input);
  input.onchange=async()=>{try{await onPhoto(input)}finally{input.remove()}};input.oncancel=()=>input.remove();input.click();
 };
 const previousPut=jPut;jPut=function(o){
  if(!context||context.mode!=='catalog')return previousPut(o);
  const date=context.date;if(!validDate(date)||!['g','k','p','f','c'].every(k=>Number.isFinite(o[k])&&o[k]>=0)){toast('Проверьте дату и значения продукта');return}
  const entry={id:crypto.randomUUID(),date,time:new Date().toTimeString().slice(0,5),meal:mealNow(),name:o.n,g:r0(o.g),k:r0(o.k),p:Math.round(o.p*10)/10,f:Math.round(o.f*10)/10,c:Math.round(o.c*10)/10,thumb:''};
  const next={...S,entries:[...S.entries,entry]};try{localStorage.setItem('nt1',JSON.stringify(next))}catch(e){toast('Не удалось сохранить; запись не добавлена');return}
  S=next;context=null;day=date;tab='diary';render();toast('Продукт записан за выбранный день');
 };
 const previousRender=render;render=function(){previousRender();drawDiaryActions()};
 const previousRefresh=meRefresh;meRefresh=function(){previousRefresh();contextLabel()};
 drawDiaryActions();
})();