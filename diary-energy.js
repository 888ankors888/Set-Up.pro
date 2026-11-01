(() => {
 const previousDiary=diaryView;
 const number=n=>Math.round(n).toLocaleString('ru-RU');
 diaryView=function(){
  const markup=previousDiary();if(!S.profile)return markup;
  const target=targets(S.profile),logged=tot(day),count=S.entries.filter(e=>e.date===day).length;
  if(!['k','p','f','c'].every(k=>Number.isFinite(target[k])&&target[k]>=0&&Number.isFinite(logged[k])&&logged[k]>=0)||target.k<=0)return markup;
  const left=target.k-logged.k,percent=logged.k/target.k*100,progress=Math.max(0,Math.min(100,percent));
  const card=`<section class="card" id="diary-daily-energy" aria-labelledby="diary-energy-title"><div class="topline"><div><div class="eyebrow">${esc(fmt(day))}</div><h2 id="diary-energy-title">Энергия дня</h2></div><span class="tag">Записей: ${count}</span></div><div class="energy" style="margin-top:18px;flex-wrap:wrap"><div class="ring" style="--progress:${progress}%" role="img" aria-label="Записано ${number(logged.k)} из ${number(target.k)} килокалорий, ${number(percent)} процентов ориентира"><div><b>${number(logged.k)}</b><small>записано, ккал</small></div></div><div><div class="mu">${left>=0?'Осталось до ориентира':'Выше ориентира'}</div><div class="big">${number(Math.abs(left))}<span style="font-size:16px;font-weight:400"> ккал</span></div><p class="subtle">Дневной ориентир: ${number(target.k)} ккал<br>Записано: ${number(percent)}% · ${count} записей</p></div></div><div class="m3">${[['Белки','p','var(--p)'],['Жиры','f','var(--f)'],['Углеводы','c','var(--c)']].map(([name,key,color])=>`<div><b>${number(logged[key])} / ${number(target[key])} г</b><span>${name}</span>${bar(logged[key],target[key],color)}</div>`).join('')}</div><p class="subtle">${count?'Итог только по внесённым записям; дневник может быть неполным.':'Записей нет — питание за день неизвестно.'} Ориентиры рассчитаны по текущей анкете, в том числе для прошлых дат.</p></section>`;
  const template=document.createElement('template');template.innerHTML=markup;const summary=template.content.querySelector('.card');if(!summary)return markup;const replacement=document.createElement('template');replacement.innerHTML=card;summary.replaceWith(replacement.content);return template.innerHTML;
 };
 render();
})();