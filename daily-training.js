(() => {
  if(window.foodDailyPlannerInstalled)return;
  window.foodDailyPlannerInstalled=true;
  const TYPES={walk:'Ходьба',run:'Бег',bike:'Велосипед',strength:'Силовая',mobility:'Подвижность',other:'Другое'};
  const WD=['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'];
  let anchor=today();const selected=new Set();
  const valid=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isFinite(dt(d).getTime())&&dk(dt(d))===d;
  function plans(){const p=S.sportsDayPlans;if(p&&p.version!==1)throw Error('Неизвестная версия дневных планов');return p||{version:1,days:{}};}
  const day=d=>plans().days[d]||{items:[],summary:'',warnings:[]};
  const sports=()=>S.sports||{version:1,profile:null,entries:[],plan:null};
  const fact=i=>sports().entries.find(e=>e.id==='dp-'+i.id||e.plannedItemId===i.id);
  function week(d){const start=dt(d);start.setDate(start.getDate()-(start.getDay()+6)%7);return Array.from({length:7},(_,i)=>{const date=new Date(start);date.setDate(date.getDate()+i);return dk(date)});}
  function write(next){localStorage.setItem('nt1',JSON.stringify(next));S=next;}
  function activity(raw,date,id=crypto.randomUUID()){
    if(!valid(date)||!TYPES[raw.kind])throw Error('Проверьте дату и вид активности');
    const e={id,date,kind:raw.kind,name:String(raw.name||TYPES[raw.kind]).trim(),minutes:raw.minutes,distance:raw.distance??null,sets:raw.sets??null,reps:raw.reps??null,weight:raw.weight??null,muscleGroup:raw.muscleGroup??null,exerciseId:raw.exerciseId??null,effort:null,notes:String(raw.notes||'').trim(),sessionId:null};
    sportsValidateImport({version:1,profile:null,entries:[{...e,date:today()}],plan:null});return e;
  }
  const signature=()=>JSON.stringify([S.profile,S.sports, S.sportsDayPlans]);
  function append(date,rows,meta={},expected){
    if(expected&&expected!==signature())throw Error('Анкета или план изменились. Повторите подготовку');
    if(!valid(date)||!Array.isArray(rows)||rows.length>12)throw Error('Некорректный план дня');
    const p=plans(),old=day(date),items=rows.map(r=>activity(r,date));
    if(old.items.length+items.length>30||Object.values(p.days).reduce((n,d)=>n+d.items.length,0)+items.length>2000)throw Error('Достигнут лимит плановых активностей');
    write({...S,sportsDayPlans:{version:1,days:{...p.days,[date]:{...old,items:[...old.items,...items],summary:String(meta.summary??old.summary).slice(0,1000),warnings:(meta.warnings||old.warnings).map(String).slice(0,8)}}}});render();
  }
  function commit(date,ids,values,expected){
    if(!valid(date)||date>today())throw Error('Будущую тренировку нельзя записать выполненной');
    const items=day(date).items.filter(i=>ids.includes(i.id));
    if(!ids.length||new Set(ids).size!==ids.length||items.length!==ids.length||values.length!==ids.length)throw Error('Выберите активности');
    if(expected&&expected!==JSON.stringify(items))throw Error('План дня изменился');
    if(items.some(fact))throw Error('Активность уже записана. Повторное добавление запрещено');
    const entries=items.map((item,i)=>{const fields={};for(const k of ['minutes','distance','sets','reps','weight'])fields[k]=values[i][k]??null;return {...activity({...item,...fields},date,'dp-'+item.id),plannedItemId:item.id};});
    const data={...sports(),entries:[...sports().entries,...entries]};sportsValidateImport(data);write({...S,sports:data});ids.forEach(id=>selected.delete(id));render();
  }
  function dialog(html){let d=document.getElementById('daily-plan-dialog');if(!d){d=document.createElement('dialog');d.id='daily-plan-dialog';document.body.appendChild(d);}d.innerHTML=html;if(!d.open)d.showModal();return d;}
  const cancel='<button type="button" class="btn s" data-dp-close>Отмена</button>';
  function add(date,id=''){
    try{
      if(!valid(date))throw Error('Некорректная дата');const item=day(date).items.find(i=>i.id===id);if(item&&fact(item))throw Error('Измените фактическую запись через дневник');
      sportsOpen();const d=document.getElementById('sport-entry'),form=d?.querySelector('form');if(!form)throw Error('Форма активности недоступна');
      form.querySelector('h2').textContent='Добавить активность';const n=k=>form.querySelector('#se-'+k);
      n('date').value=date;n('date').removeAttribute('max');n('date').hidden=true;form.querySelector('label[for="se-date"]').hidden=true;
      n('confirm').required=false;n('confirm').closest('label').hidden=true;form.querySelector('label[for="se-minutes"]').textContent='Плановая длительность, минут';form.querySelector('[type="submit"]').textContent='Сохранить в план дня';
      if(item){n('kind').value=item.kind;n('kind').onchange();if(item.kind==='strength'){n('group').value=item.muscleGroup;n('group').onchange();n('exercise').value=item.exerciseId;n('exercise').onchange();}for(const k of ['name','minutes','distance','sets','reps','weight'])n(k).value=item[k]??'';}
      n('error').insertAdjacentHTML('beforebegin','<label for="dp-notes">Примечание / инструкция</label><textarea id="dp-notes" maxlength="2000"></textarea>');form.querySelector('#dp-notes').value=item?.notes||'';
      form.onsubmit=event=>{event.preventDefault();try{
        if(item&&fact(item))throw Error('Эта активность уже записана');
        const kind=n('kind').value,strong=kind==='strength',num=k=>n(k).value===''?null:Number(n(k).value),exercise=n('exercise');
        const raw={kind,name:strong&&exercise.value!=='custom'?exercise.selectedOptions[0].textContent:n('name').value.trim()||TYPES[kind],minutes:num('minutes'),distance:strong?null:num('distance'),sets:strong?num('sets'):null,reps:strong?num('reps'):null,weight:strong?num('weight'):null,muscleGroup:strong?n('group').value:null,exerciseId:strong?exercise.value:null,notes:form.querySelector('#dp-notes').value};
        if(item){const replacement=activity(raw,date,item.id),p=plans(),old=day(date);if(!old.items.some(i=>i.id===item.id))throw Error('Пункт удалён');write({...S,sportsDayPlans:{version:1,days:{...p.days,[date]:{...old,items:old.items.map(i=>i.id===item.id?replacement:i)}}}});render();}else append(date,[raw]);
        d.close();
      }catch(e){n('error').textContent=e.message;}};
    }catch(e){toast(e.message);}
  }
  function review(date){
    try{
      if(!valid(date)||date>today())throw Error('Будущую тренировку нельзя записать выполненной');
      const items=day(date).items.filter(i=>selected.has(i.id)&&!fact(i));if(!items.length)throw Error('Отметьте выполненные активности');
      const snapshot=JSON.stringify(items),field=(i,k,label,v)=>'<label>'+label+'<input type="number" data-dp-value="'+i+':'+k+'" min="'+(k==='minutes'?'0.1':'0')+'" max="'+(k==='minutes'?'1440':'10000')+'" step="'+(['sets','reps'].includes(k)?'1':'0.1')+'" value="'+esc(v??'')+'" '+(k==='minutes'?'required':'')+'></label>';
      const d=dialog('<form><h2>Записать тренировку · '+esc(fmt(date))+'</h2><p>Укажите фактически выполненные значения. Неотмеченные пункты останутся в плане.</p>'+items.map((e,i)=>'<section class="card"><h3>'+esc(e.name)+'</h3>'+field(i,'minutes','Фактически выполнено, минут',e.minutes)+(e.kind==='strength'?field(i,'sets','Подходы',e.sets)+field(i,'reps','Повторения в подходе',e.reps)+field(i,'weight','Рабочий вес, кг',e.weight):field(i,'distance','Дистанция, км (необязательно)',e.distance))+'</section>').join('')+'<label class="chk"><input type="checkbox" required id="dp-fact-confirm">Активности действительно выполнены</label><p role="status" data-dp-error></p><div class="row">'+cancel+'<button type="submit" class="btn">Записать тренировку</button></div></form>');
      d.querySelector('form').onsubmit=event=>{event.preventDefault();try{if(!d.querySelector('#dp-fact-confirm').checked)throw Error('Подтвердите выполнение');const values=items.map((e,i)=>{const v={};for(const k of ['minutes','distance','sets','reps','weight']){const input=d.querySelector('[data-dp-value="'+i+':'+k+'"]');v[k]=input&&input.value!==''?Number(input.value):null;}return v;});commit(date,items.map(e=>e.id),values,snapshot);d.close();}catch(e){d.querySelector('[data-dp-error]').textContent=e.message;}};
    }catch(e){toast(e.message);}
  }
  async function askAI(date){try{await import(new URL('daily-training-ai.js?v=1',document.baseURI).href);window.foodDayPlanPreferences(date);}catch(e){toast('Дневной ИИ-модуль пока не подключён');}}
  function details(e){return esc(TYPES[e.kind])+' · '+esc(e.minutes)+' мин'+(e.muscleGroup?' · группа: '+esc(e.muscleGroup):'')+[['distance',' км'],['sets',' подходов'],['reps',' повторений'],['weight',' кг']].map(([k,u])=>e[k]===null?'':' · '+esc(e[k])+u).join('');}
  function view(){return '<h2>Программа тренировок</h2><div class="nv"><button type="button" data-dp-week="-1">← Неделя</button><b>'+esc(fmt(week(anchor)[0]))+' — '+esc(fmt(week(anchor)[6]))+'</b><button type="button" data-dp-week="1">Неделя →</button></div><p class="subtle">Пункты здесь — план. В дневник попадает только подтверждённое фактическое выполнение.</p><div class="daily-plan-grid">'+week(anchor).map((date,index)=>{const d=day(date);return '<section class="card"><h3>'+WD[index]+' · '+esc(fmt(date))+'</h3><div class="daily-plan-actions"><button type="button" class="btn s" data-dp-add="'+date+'">Добавить активность</button><button type="button" class="btn s" data-dp-ai="'+date+'">Разработать с ИИ</button></div>'+(d.summary?'<p>'+esc(d.summary)+'</p>':'')+(d.warnings||[]).map(w=>'<p class="subtle">'+esc(w)+'</p>').join('')+d.items.map(i=>{const recorded=fact(i),e=recorded||i;return '<div class="daily-plan-item"><label class="chk"><input type="checkbox" data-dp-toggle="'+i.id+'" '+(recorded||selected.has(i.id)?'checked':'')+' '+(date>today()||recorded?'disabled':'')+'><span>'+esc(e.name)+(recorded?' · Записано':'')+'</span></label><p class="subtle">'+(recorded?'Факт: ':'План: ')+details(e)+'</p>'+(e.notes?'<p>'+esc(e.notes)+'</p>':'')+(!recorded?'<button type="button" class="x" data-dp-edit="'+i.id+'" data-date="'+date+'">Изменить</button><button type="button" class="x" data-dp-delete="'+i.id+'" data-date="'+date+'">Удалить</button>':'')+'</div>';}).join('')+(d.items.length?'<button type="button" class="btn" data-dp-record="'+date+'" '+(date>today()?'disabled':'')+'>Записать тренировку</button>':'<p class="mu">Активности не добавлены.</p>')+'</section>';}).join('')+'</div>';}
  function mount(){if(tab!=='training'||editing)return;const root=document.getElementById('training-sport-program');if(!root)return;document.getElementById('daily-training-week')?.remove();const block=document.createElement('section');block.className='card';block.id='daily-training-week';try{block.innerHTML=view();}catch(e){block.textContent=e.message;}root.prepend(block);}
  document.addEventListener('change',event=>{const id=event.target.dataset?.dpToggle;if(id){if(event.target.checked)selected.add(id);else selected.delete(id);}});
  document.addEventListener('click',event=>{const b=event.target.closest?.('button');if(!b)return;try{if(b.hasAttribute('data-dp-close'))b.closest('dialog')?.close();else if(b.dataset.dpAdd)add(b.dataset.dpAdd);else if(b.dataset.dpEdit)add(b.dataset.date,b.dataset.dpEdit);else if(b.dataset.dpAi)askAI(b.dataset.dpAi);else if(b.dataset.dpRecord)review(b.dataset.dpRecord);else if(b.dataset.dpWeek){const date=dt(anchor);date.setDate(date.getDate()+7*Number(b.dataset.dpWeek));anchor=dk(date);render();}else if(b.dataset.dpDelete){const date=b.dataset.date,p=plans(),old=day(date),item=old.items.find(i=>i.id===b.dataset.dpDelete);if(!item||fact(item))throw Error('Записанную активность удаляйте в дневнике');if(confirm('Удалить пункт из плана?')){write({...S,sportsDayPlans:{version:1,days:{...p.days,[date]:{...old,items:old.items.filter(i=>i.id!==item.id)}}}});selected.delete(item.id);render();}}}catch(e){toast(e.message);}});
  window.foodDailyPlanner={week,activity,append,commit,signature,plans,day,dialog};
  const style=document.createElement('style');style.textContent='.daily-plan-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.daily-plan-grid>.card{margin:0}.daily-plan-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.daily-plan-actions>.btn{font-size:13px;padding:10px;min-height:52px}.daily-plan-item{padding:12px 0;border-top:1px solid var(--ln);margin-top:12px}.daily-plan-item .chk{display:flex;color:var(--tx)}.daily-plan-item input[type=checkbox]{width:auto;flex:none}.daily-plan-item p{white-space:pre-wrap}@media(max-width:700px){.daily-plan-grid{grid-template-columns:1fr}}#daily-plan-dialog{width:min(680px,94vw);max-height:90vh;overflow-y:auto}';document.head.appendChild(style);
  const previous=render;render=function(){previous();mount()};render();
})();
