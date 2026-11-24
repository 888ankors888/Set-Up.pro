(() => {
 const plus='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
 const close='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
 const style=document.createElement('style');style.id='neutral-food-diary-style';
 style.textContent='html:root:root:root body #food-diary-surface .ent{background:transparent!important;border-inline-start:1px solid rgba(67,201,154,.6)!important;--fit:#43c99a!important;--nd-tint:transparent!important;--nd-tone:#a9cbc0!important}';document.head.append(style);
 function clean(){
  if(tab!=='diary'||!S.profile||editing)return;
  const card=document.getElementById('food-diary-surface');if(!card)return;
  card.querySelectorAll('.food-fit-key,.food-fit-note,.food-fit-label').forEach(node=>node.remove());
  [...card.children].filter(node=>/^H[1-6]$/.test(node.tagName)&&node.textContent.trim()==='Скушали сегодня').forEach(node=>node.remove());
  card.querySelectorAll('.ent').forEach(row=>{row.classList.remove('food-fit-good','food-fit-neutral','food-fit-bad');});
 }
 function enhance(){
  if(tab!=='diary'||!S.profile||editing)return;
  const app=document.getElementById('app'),card=app?.querySelector('#food-diary-surface')||app?.querySelector('.food-fit-key')?.closest('.card');if(!card)return;
  card.classList.add('nutrition-diary-premium');card.id='food-diary-surface';card.setAttribute('role','region');card.setAttribute('aria-label','Записи дневника питания');
  card.querySelectorAll('.ent.food-fit').forEach(row=>{
   if(row.dataset.ndStyled)return;row.dataset.ndStyled='true';row.querySelector('.ph')?.remove();if(row.querySelector('img'))row.classList.add('nd-has-photo');
   const cols=[...row.children].filter(n=>n.tagName==='DIV'),main=cols[0],calories=cols[1];if(!main||!calories)return;
   main.classList.add('nd-entry-main');calories.classList.add('nd-kcal');
   for(const col of [main,calories])[...col.children].filter(n=>n.tagName==='BR').forEach(n=>n.remove());
   const meta=[...main.children].find(n=>n.tagName==='SMALL'&&!n.classList.contains('food-fit-label'));meta?.classList.add('nd-entry-meta');
   const action=row.querySelector('button[onclick^="delEntry("]');if(action){action.type='button';action.classList.add('nd-delete');action.setAttribute('aria-label','Удалить запись: '+(main.querySelector('b')?.textContent||''));action.title='Удалить запись';action.innerHTML=close;}
  });
  const add=app.querySelector('button[aria-controls="diary-entry-actions"]');if(add){add.classList.add('nd-add');add.innerHTML=plus+'<span>Добавить запись за выбранный день</span>';card.appendChild(add);const panel=app.querySelector('#diary-entry-actions');if(panel)card.appendChild(panel);}
  clean();
 }
 const previousRender=render;render=function(){previousRender();enhance();};enhance();
 let queued=false;
 const observer=new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;clean();});});
 const app=document.getElementById('app');if(app)observer.observe(app,{childList:true,subtree:true});
 window.addEventListener('pagehide',event=>{if(!event.persisted)observer.disconnect();});
})();
