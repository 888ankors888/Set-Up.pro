
/* Set-Up — GigaChat text input */
const FOOD_API='https://food-pro-api.onrender.com';
let aiAccess='',aiDraft='',aiRows=[],aiQuestions=[],aiRunning=false,aiError='',aiDate='',aiMeal='';
function aiLauncher(){return `<section class="card" id="ai-input"><div class="eyebrow">GigaChat · текстовый ввод</div><h2>Что вы ели?</h2><p class="mu">Опишите продукты и порции. Перед записью проверьте вес и выберите соответствующие продукты из каталога.</p><label for="ai-description">Описание еды</label><textarea id="ai-description" rows="3" maxlength="2000" placeholder="Рис 150 г после варки и два варёных яйца" oninput="aiDraft=this.value">${esc(aiDraft)}</textarea><div class="row" style="margin-top:12px"><button class="btn" onclick="aiOpen()">Разобрать через ИИ</button><button class="btn s" onclick="aiOpenSettings()">Доступ к ИИ</button></div><p class="subtle">На сервер отправляется только описание еды, без анкеты и истории дневника.</p></section>`}
const todayBeforeTextAI=todayView;
todayView=function(){return todayBeforeTextAI().replace('<div class="quick">',aiLauncher()+'<div class="quick">')};
function aiDialog(){let d=document.getElementById('ai-dialog');if(!d){d=document.createElement('dialog');d.id='ai-dialog';d.style.width='min(760px,94vw)';d.style.maxHeight='90vh';d.style.overflowY='auto';document.body.appendChild(d)}return d}
function aiOpenSettings(){aiOpen(true)}
function aiOpen(settings=false){
 const input=document.getElementById('ai-description');if(input)aiDraft=input.value;
 if(!aiDate)aiDate=tab==='diary'?day:today();if(!aiMeal)aiMeal=mealNow();
 const d=aiDialog();aiDraw();if(!d.open)d.showModal();
 if(settings||!aiAccess){document.getElementById('ai-password').focus();return}
 if(aiDraft.trim()&&!aiRows.length&&!aiRunning)aiParse();
}
function aiCandidates(row){
 const norm=t=>String(t||'').toLowerCase().replace(/ё/g,'е');
 const words=norm(row.name+' '+(row.preparation||'')).split(/[^а-яa-z0-9]+/).filter(w=>w.length>2);
 return FD.map((food,i)=>({food,i,score:words.reduce((v,w)=>v+(norm(food.n).includes(w.slice(0,Math.min(w.length,5)))?1:0),0)})).sort((a,b)=>b.score-a.score||a.food.n.localeCompare(b.food.n,'ru'));
}
function aiDraw(){
 const d=aiDialog();
 d.innerHTML=`<div class="topline"><div><div class="eyebrow">food.pro / GigaChat</div><h2>Добавить еду текстом</h2></div><button type="button" class="x" onclick="document.getElementById('ai-dialog').close()" aria-label="Закрыть">×</button></div>
 <details ${!aiAccess?'open':''}><summary>Пароль доступа к серверу ${aiAccess?'· задан':''}</summary><p class="subtle">Введите APP_ACCESS_TOKEN из Render. Не ключ GigaChat. Пароль хранится только в памяти этой вкладки до перезагрузки.</p><label for="ai-password">Пароль сервера</label><input id="ai-password" type="password" autocomplete="off" placeholder="APP_ACCESS_TOKEN" value="${esc(aiAccess)}" oninput="aiAccess=this.value"><button class="btn s" style="margin-top:8px" onclick="aiAccess='';aiDraw()">Забыть пароль</button></details>
 <label for="ai-text">Описание еды</label><textarea id="ai-text" rows="3" maxlength="2000" ${aiRunning?'disabled':''} oninput="aiDraft=this.value">${esc(aiDraft)}</textarea>
 <div class="row"><div><label for="ai-date">Дата записи</label><input id="ai-date" type="date" max="${today()}" value="${esc(aiDate)}" onchange="aiDate=this.value"></div><div><label for="ai-meal">Приём пищи</label><select id="ai-meal" onchange="aiMeal=this.value">${['Завтрак','Обед','Ужин','Перекус'].map(m=>`<option ${m===aiMeal?'selected':''}>${m}</option>`).join('')}</select></div></div>
 <p class="subtle">Описание отправляется в GigaChat через сервер food.pro. Медицинские сведения добавлять не нужно.</p>
 <button class="btn" style="margin-top:12px" ${aiRunning?'disabled':''} onclick="aiParse()">${aiRunning?'Разбираю описание…':aiRows.length?'Разобрать заново':'Разобрать'}</button>
 <div role="status" aria-live="polite">${aiError?`<div class="tip w2">${esc(aiError)}</div>`:''}</div>
 ${aiQuestions.length?`<div class="tip"><b>Уточнения модели</b><ul>${aiQuestions.map(q=>`<li>${esc(q)}</li>`).join('')}</ul><span class="subtle">Если уточнение меняет состав, исправьте описание и нажмите «Разобрать заново». Это удалит текущие правки карточек.</span></div>`:''}
 ${aiRows.length?`<h3>Проверьте продукты</h3><p class="subtle">Список каталога отсортирован по сходству слов, это не подтверждённое совпадение. Выберите вариант сами. КБЖУ берутся из существующего усреднённого каталога на 100 г, а не из ответа ИИ.</p>${aiRows.map((r,i)=>aiRowHtml(r,i)).join('')}<div id="ai-total" class="tip"></div><label class="chk"><input id="ai-confirm" type="checkbox">Я проверил состав, приготовление, вес и значения каталога</label><button class="btn" id="ai-save" onclick="aiSave()">Сохранить в дневник</button>`:''}`;
 aiTotals();
}
function aiRowHtml(r,i){
 return `<section class="card" style="padding:14px"><div class="topline"><b>${esc(r.name)}</b><button class="x" aria-label="Удалить продукт" onclick="aiRows.splice(${i},1);aiDraw()">×</button></div><p class="subtle">Распознано: ${r.quantity!=null?esc(r.quantity)+' '+esc(r.unit||'шт.')+'; ':''}${r.weight_g!=null?esc(r.weight_g)+' г; ':''}${esc(r.preparation||'приготовление не указано')}</p><label for="ai-food-${i}">Соответствующий продукт из каталога</label><select id="ai-food-${i}" onchange="aiRows[${i}].food=this.value===''?null:Number(this.value);aiTotals()"><option value="">Выберите продукт — автоматически не подставляется</option>${aiCandidates(r).map(x=>`<option value="${x.i}" ${r.food===x.i?'selected':''}>${esc(x.food.n)} · ${x.food.k} ккал/100 г</option>`).join('')}</select><label for="ai-weight-${i}">Вес съедобной части, г ${r.quantity!=null?'(общий вес всей порции)':''}</label><input id="ai-weight-${i}" type="number" min="0.1" max="100000" step="0.1" value="${r.grams??''}" placeholder="Взвесьте без скорлупы, костей и упаковки" oninput="aiRows[${i}].grams=this.value===''?null:Number(this.value);aiTotals()"><div class="subtle" id="ai-numbers-${i}" style="margin-top:8px"></div></section>`;
}
function aiTotals(){
 let total={g:0,k:0,p:0,f:0,c:0},ready=aiRows.length>0;
 aiRows.forEach((r,i)=>{
  const food=r.food==null?null:FD[r.food],valid=food&&Number.isFinite(r.grams)&&r.grams>0&&r.grams<=100000;
  if(!valid)ready=false;
  const line=document.getElementById('ai-numbers-'+i);
  if(!valid){if(line)line.textContent='Выберите продукт и укажите вес. КБЖУ пока не рассчитаны.';return}
  const m=r.grams/100;total.g+=r.grams;total.k+=food.k*m;total.p+=food.p*m;total.f+=food.f*m;total.c+=food.u*m;
  if(line)line.textContent=`${Math.round(food.k*m)} ккал · Б ${(food.p*m).toFixed(1)} · Ж ${(food.f*m).toFixed(1)} · У ${(food.u*m).toFixed(1)} г`;
 });
 const summary=document.getElementById('ai-total');if(summary)summary.textContent=(ready?'Итого: ':'Частичный итог (не все продукты заполнены): ')+`${Math.round(total.k)} ккал · Б ${total.p.toFixed(1)} · Ж ${total.f.toFixed(1)} · У ${total.c.toFixed(1)} г`;
 const button=document.getElementById('ai-save');if(button)button.disabled=!ready;
 const confirm=document.getElementById('ai-confirm');if(confirm)confirm.checked=false;
 return ready;
}
async function aiParse(){
 if(aiRunning)return;
 const text=document.getElementById('ai-text');if(text)aiDraft=text.value;
 if(!aiAccess){aiError='Введите пароль APP_ACCESS_TOKEN. Ключ GigaChat сюда не вводится.';aiDraw();return}
 if(aiDraft.trim().length<2){aiError='Опишите еду: минимум два символа.';aiDraw();return}
 if(aiRows.length&&!confirm('Повторный разбор заменит текущие карточки и правки. Продолжить?'))return;
 aiRunning=true;aiError='';aiDraw();
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),90000);
 try{
  const response=await fetch(FOOD_API+'/api/food/parse',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+aiAccess},body:JSON.stringify({text:aiDraft.trim()}),signal:controller.signal,credentials:'omit',cache:'no-store'});
  const result=await response.json().catch(()=>null);
  if(!response.ok){const messages={401:'Пароль доступа неверен. Проверьте APP_ACCESS_TOKEN.',503:'Сервер ещё не настроен.',422:'Сервер отклонил описание. Проверьте длину текста.',502:'GigaChat не смог разобрать описание. Попробуйте позже или уточните текст.'};throw new Error(messages[response.status]||('Ошибка сервера '+response.status))}
  if(!result||!Array.isArray(result.items)||!Array.isArray(result.questions))throw new Error('Сервер вернул неизвестный формат ответа.');
  aiRows=result.items.map(r=>({...r,food:null,grams:typeof r.weight_g==='number'&&r.weight_g>0?r.weight_g:null}));aiQuestions=result.questions;
  if(!aiRows.length)aiError='Продукты не найдены. Уточните описание.';
 }catch(error){aiError=error.name==='AbortError'?'Сервер не ответил за 90 секунд. Повторите запрос.':error instanceof TypeError?'Нет соединения с API. Проверьте интернет, запуск Render и настройку CORS сервера. При открытии файла напрямую используйте опубликованный сайт или localhost.':error.message}
 finally{clearTimeout(timer);aiRunning=false;aiDraw()}
}
function aiSave(){
 if(!aiRows.length)return;
 if(!document.getElementById('ai-confirm')?.checked){toast('Подтвердите проверку продуктов и веса');return}
 const valid=aiRows.every(r=>r.food!=null&&FD[r.food]&&Number.isFinite(r.grams)&&r.grams>0&&r.grams<=100000);
 if(!valid||!/^\d{4}-\d{2}-\d{2}$/.test(aiDate)||aiDate>today()||!['Завтрак','Обед','Ужин','Перекус'].includes(aiMeal)){toast('Проверьте дату, продукты и вес');return}
 const time=new Date().toTimeString().slice(0,5),round=n=>Math.round(n*10)/10;
 const added=aiRows.map(r=>{const f=FD[r.food],m=r.grams/100;return {id:crypto.randomUUID(),date:aiDate,time,meal:aiMeal,name:f.n,g:round(r.grams),k:round(f.k*m),p:round(f.p*m),f:round(f.f*m),c:round(f.u*m),thumb:''}});
 const next={...S,entries:[...S.entries,...added]};
 try{localStorage.setItem('nt1',JSON.stringify(next))}catch(error){toast('Не удалось сохранить. Освободите память браузера; записи не добавлены.');return}
 S=next;const savedDate=aiDate;aiRows=[];aiQuestions=[];aiDraft='';aiError='';document.getElementById('ai-dialog').close();day=savedDate;tab='diary';render();toast('Продукты записаны в дневник');
}
const profileBeforeTextAI=profileView;
profileView=function(){return profileBeforeTextAI()+`<div class="card"><h2>GigaChat: текстовый ввод</h2><p class="mu">Подключён адрес сервера food.pro. Перед первым запросом введите отдельный пароль APP_ACCESS_TOKEN. Ключ GigaChat хранится только на сервере.</p><button class="btn s" onclick="aiOpenSettings()">Настроить доступ</button><p class="subtle">Фотоанализ и ИИ-отчёты не перенесены на GigaChat.</p></div>`};
