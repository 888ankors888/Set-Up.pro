(() => {
  if(window.foodQuestionnaireBlocksInstalled)return;
  window.foodQuestionnaireBlocksInstalled=true;
  const ids=['about','nutrition','sport','habits'];
  const titles={about:'О вас',nutrition:'Питание',sport:'Спорт',habits:'Привычки'};
  const value=id=>document.getElementById(id)?.value??'';
  const number=id=>value(id)===''?null:Number(value(id));
  function bounded(n,lo,hi,label,integer=false){if(!Number.isFinite(n)||n<lo||n>hi||(integer&&!Number.isInteger(n)))throw Error('Проверьте поле «'+label+'»');return n;}
  function preferenceAnswers(root,previous){
    const answers={...previous};
    root.querySelectorAll('[data-gqp]').forEach(group=>{
      if(group.dataset.q2)return;
      const key=group.dataset.gqp,choices=group.querySelectorAll('[data-gqp-key="'+key+'"]');
      if(choices.length)answers[key]=[...choices].filter(n=>n.checked).map(n=>n.value);
      else{const input=group.querySelector('#gqp-'+CSS.escape(key));if(input){if(input.value.length>300)throw Error('Сократите пояснения до 300 символов');answers[key]=input.value.trim();}}
    });
    return answers;
  }
  function nutrition(profile,root){
    profile.questionnairePreferences={...profile.questionnairePreferences,version:1,answers:preferenceAnswers(root,profile.questionnairePreferences?.answers)};
    const a=profile.questionnairePreferences.answers;
    if(a.allergyStatus!=='listed'){a.allergens=[];a.allergyOther='';}
    if(!(a.allergens||[]).includes('other'))a.allergyOther='';
    if(a.allergyStatus==='listed'&&!(a.allergens||[]).length)throw Error('Укажите аллерген или выберите «Другие»');
    if((a.allergens||[]).includes('other')&&!a.allergyOther)throw Error('Укажите другие аллергены');
    const settings={...profile.nutritionGoalSettings};
    for(const [key,id,lo,hi] of [['proteinFactor','food-protein-factor',0.5,3],['eatingWindowHours','food-eating-window',1,23],['newFoodsPerWeek','food-new-week',1,21],['trackingDays','food-tracking-days',1,365]])if(root.querySelector('#'+id))settings[key]=bounded(number(id),lo,hi,id);
    if(root.querySelector('#food-sugar-limit')){const n=number('food-sugar-limit');settings.addedSugarGrams=n===null?null:bounded(n,0,200,'Добавленный сахар');}
    profile.nutritionGoalSettings=settings;
    const habitGoals=['water','tracking','new_food'];
    profile.nutritionGoals=[...(profile.nutritionGoals||[]).filter(v=>habitGoals.includes(v)),...[...root.querySelectorAll('.food-nutrition-goal:checked')].map(n=>n.value).filter(v=>['calories','protein','sugar','fasting','quality'].includes(v))];
    for(const [id,lo,hi] of [['pw',3.1,20],['pl',8.1,35]])if(root.querySelector('#'+id))profile[id]=bounded(number(id),lo,hi,'Размер ладони');
    profile.nutritionQuestionnaire=window.foodCollectNutrition(profile);
  }
  window.foodSaveQuestionnaireBlock=function(id){
    if(!ids.includes(id))return;
    const root=document.getElementById('goals-questionnaire-'+id);if(!root)return;
    try{
      if(!S.profile)throw Error('Сначала сохраните основную анкету, затем можно сохранять блоки отдельно');
      const next=JSON.parse(JSON.stringify(S)),profile=next.profile;
      profile.questionnairePreferences={...profile.questionnairePreferences,version:1,answers:{...profile.questionnairePreferences?.answers}};
      profile.nutritionGoalSettings={...profile.nutritionGoalSettings};profile.nutritionGoals=[...(profile.nutritionGoals||[])];
      if(id==='about'){
        const sex=value('sex'),goal=value('goal'),bodyGoal=value('food-body-goal');
        if(!['f','m'].includes(sex)||!['lose','gain','maintain'].includes(goal)||!['lose','gain','recomp','maintain','reverse','cut'].includes(bodyGoal))throw Error('Проверьте пол и основную цель');
        const w=bounded(number('w'),25.1,399.9,'Вес'),act=number('act');
        if(![1.2,1.375,1.55,1.725].includes(act))throw Error('Проверьте уровень активности');
        Object.assign(profile,{sex,goal,bodyGoal,age:bounded(number('age'),10,120,'Возраст',true),h:bounded(number('h'),100.1,250,'Рост'),w,tw:bounded(number('tw'),25.1,399.9,'Целевой вес'),act});
        if(S.profile.w!==w)next.weights={...next.weights,[today()]:w};
      }else if(id==='nutrition')nutrition(profile,root);
      else if(id==='sport'){
        const sport={...next.sports?.profile,enabled:true,level:value('sp-level'),goal:value('sp-goal'),place:value('sp-place'),equipment:value('sp-equipment').trim(),minutes:bounded(number('sp-minutes'),10,90,'Минут на занятие',true),days:[...root.querySelectorAll('.sp-day:checked')].map(n=>Number(n.value)),restrictions:value('sp-restrictions')};
        profile.sportQuestionnaire=window.foodCollectSport(profile,sport);
        const data={version:1,profile:null,entries:[],plan:null,...next.sports,profile:sport};
        try{window.sportsValidateImport(data);}catch(e){throw Error('Проверьте спортивную анкету: доступные дни, место и ограничения. Генератор поддерживает 1–5 дней.');}
        next.sports=data;
        const answers=preferenceAnswers(root,profile.questionnairePreferences.answers);
        for(const key of ['activities','company','sportTime'])if(key in answers)profile.questionnairePreferences.answers[key]=answers[key];
      }else{
        profile.habitsV2=window.foodCollectHabits(profile);
        next.waterGoal=profile.nutritionGoalSettings.waterMl??next.waterGoal;
      }
      localStorage.setItem('nt1',JSON.stringify(next));S=next;
      const status=root.querySelector('[data-block-save-status]');if(status)status.textContent='Блок «'+titles[id]+'» сохранён';
      toast('Блок «'+titles[id]+'» сохранён');
    }catch(error){const message=error instanceof Error?error.message:'Не удалось сохранить блок';const status=root.querySelector('[data-block-save-status]');if(status)status.textContent=message;toast(message);}
  };
  function update(){
    const about=document.getElementById('goals-questionnaire-about');
    if(about){
      const delta=about.querySelector('#food-weight-change');if(delta){delta.hidden=true;const label=about.querySelector('label[for="food-weight-change"]');if(label)label.hidden=true;const parent=delta.parentElement;if(parent?.parentElement?.classList.contains('row'))parent.hidden=true;}
      for(const key of ['routine','guidance']){const group=about.querySelector('[data-gqp="'+key+'"]');if(group)group.hidden=true;}
      about.querySelectorAll('summary,h2,h3').forEach(h=>{if(h.textContent.trim()==='Здоровье'){const container=h.closest('details')||h.closest('.goals-questionnaire-fields');if(container)container.hidden=true;}});
    }
    const sport=document.getElementById('goals-questionnaire-sport');
    if(sport){
      sport.querySelectorAll('p').forEach(p=>{if(p.textContent.trim()==='Откройте нужную карточку. Общие данные не нужно заполнять повторно.')p.hidden=true;});
      const enabled=sport.querySelector('#sp-enabled');if(enabled){enabled.checked=true;const label=enabled.closest('label');if(label)label.hidden=true;else enabled.hidden=true;}
    }
    for(const id of ids){
      const block=document.getElementById('goals-questionnaire-'+id);if(!block||block.querySelector('[data-save-block]'))continue;
      const button=document.createElement('button');button.type='button';button.className='btn s';button.style.marginTop='20px';button.dataset.saveBlock=id;button.textContent='Сохранить блок анкеты';button.setAttribute('aria-label','Сохранить блок анкеты «'+titles[id]+'»');button.onclick=()=>foodSaveQuestionnaireBlock(id);
      const status=document.createElement('p');status.className='subtle';status.dataset.blockSaveStatus='';status.setAttribute('role','status');status.setAttribute('aria-live','polite');block.append(button,status);
    }
  }
  const style=document.createElement('style');style.textContent='#goals-questionnaire-about [hidden]{display:none!important}';document.head.appendChild(style);
  const previous=render;render=function(){previous();update()};update();
})();
