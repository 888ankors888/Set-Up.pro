(function(root,factory){const node=typeof module==='object'&&module.exports;const shared=node?require('../data-store.js'):root.SetUpDataStore;const api=factory(shared);if(node)module.exports=api;else root.FoodWorkoutsStore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(shared){
'use strict';
if(!shared||typeof shared.createStore!=='function')throw Error('Не загружен общий модуль хранения данных');
const KEY=shared.KEY,VERSION=1;
const copy=x=>JSON.parse(JSON.stringify(x));
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
function dateOK(s){if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+'T12:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===s;}
function empty(){return {schemaVersion:VERSION,plansByDate:{},entries:[],legacyResetVersion:0};}
function validate(w){
 if(!object(w)||w.schemaVersion!==VERSION||!object(w.plansByDate)||!Array.isArray(w.entries)||![0,1].includes(w.legacyResetVersion))throw Error('Некорректная версия тренировок');
 const kinds=['walk','run','bike','strength','mobility','other'];
 function activity(a){if(!object(a)||typeof a.id!=='string'||!a.id||a.id.length>100||!kinds.includes(a.kind)||typeof a.name!=='string'||!a.name.trim()||a.name.length>160||!Number.isFinite(a.minutes)||a.minutes<=0||a.minutes>1440)throw Error('Некорректная активность');for(const k of ['distance','sets','reps','weight'])if(a[k]!=null&&(!Number.isFinite(a[k])||a[k]<0||a[k]>10000||(['sets','reps'].includes(k)&&!Number.isInteger(a[k]))))throw Error('Некорректные параметры активности');if(a.notes!=null&&(typeof a.notes!=='string'||a.notes.length>2000))throw Error('Некорректное примечание');}
 const ids=new Set();let total=0;
 for(const [date,day] of Object.entries(w.plansByDate)){if(!dateOK(date)||!object(day)||!Array.isArray(day.items)||day.items.length>30)throw Error('Некорректный план дня');for(const a of day.items){activity(a);if(ids.has(a.id))throw Error('Повтор идентификатора плана');ids.add(a.id);total++;}}
 if(total>2000||w.entries.length>20000)throw Error('Превышен лимит записей');
 const entryIds=new Set(),plannedIds=new Set();for(const e of w.entries){activity(e);if(!dateOK(e.date)||entryIds.has(e.id))throw Error('Некорректная фактическая запись');entryIds.add(e.id);if(e.plannedItemId!=null){if(typeof e.plannedItemId!=='string'||!e.plannedItemId||plannedIds.has(e.plannedItemId))throw Error('Повтор фактического выполнения');plannedIds.add(e.plannedItemId);}}
 return w;
}
function sharedStore(storage){return shared.createStore({storage,validate:s=>{if(!object(s))throw Error('Некорректное состояние приложения');if(s.workouts!==undefined)validate(s.workouts);}});}
function storageAction(action){try{return action();}catch(error){const messages={READ_FAILED:'Не удалось прочитать данные браузера',CORRUPT_JSON:'Повреждены сохранённые данные. Сохранение отменено',INVALID_STATE:'Некорректное состояние приложения',VALIDATION_FAILED:'Некорректные данные или версия тренировок',INVALID_JSON:'Данные содержат неподдерживаемые значения',CONFLICT:'Данные изменились в другой вкладке. Повторите действие',WRITE_FAILED:'Не удалось сохранить данные в браузере'};if(messages[error.code]){const translated=new Error(messages[error.code]);translated.code=error.code;throw translated;}throw error;}}
function snapshot(store){const value=store.read();if(value.state===null)throw Error('Сначала сохраните профиль в основном приложении');return value;}
function read(storage){return storageAction(()=>snapshot(sharedStore(storage)).state);}
function settings(state){return copy({profile:state.profile||{},sportsProfile:state.sports?.profile||null,answers:state.profile?.sportQuestionnaire?.answers||{}});}
function write(storage,change){return storageAction(()=>{const store=sharedStore(storage),before=snapshot(store),next=before.state;change(next);validate(next.workouts);return store.commit(next,before).state;});}
function prepareLegacyReset(state){
 if(!object(state))throw Error('Некорректное состояние приложения');const next=copy(state);
 if(next.workouts!==undefined){validate(next.workouts);if(next.workouts.legacyResetVersion===1)return next;if(next.workouts.entries.length||Object.keys(next.workouts.plansByDate).length)throw Error('Новые тренировки уже существуют; автоматическая очистка остановлена');}
 if(next.sports!==undefined){if(!object(next.sports))throw Error('Некорректные старые спортивные данные');next.sports.entries=[];next.sports.plan=null;}
 delete next.sportsDayPlans;
 next.workouts={...empty(),legacyResetVersion:1};return next;
}
function activateLegacyReset(storage){return storageAction(()=>{const store=sharedStore(storage),before=snapshot(store),next=prepareLegacyReset(before.state);const saved=store.commit(next,before).state;storage.removeItem('food.pro.workouts.v1');return saved;});}
function commitDay(storage,date,selectedIds,actualValues,today){
 if(!dateOK(date)||!dateOK(today)||date>today)throw Error('Будущую тренировку нельзя записать выполненной');
 if(!Array.isArray(selectedIds)||!selectedIds.length||new Set(selectedIds).size!==selectedIds.length||!Array.isArray(actualValues)||actualValues.length!==selectedIds.length)throw Error('Выберите выполненные активности');
 return write(storage,s=>{if(!s.workouts)throw Error('Хранилище тренировок ещё не подключено');const w=s.workouts,items=w.plansByDate[date]?.items||[];for(let i=0;i<selectedIds.length;i++){const id=selectedIds[i],plan=items.find(a=>a.id===id);if(!plan)throw Error('Пункт плана не найден');if(w.entries.some(e=>e.plannedItemId===id))throw Error('Активность уже записана');const values=actualValues[i];if(!object(values))throw Error('Укажите фактические значения');const entry={...copy(plan),id:'fact-'+id,date,plannedItemId:id};for(const k of ['minutes','distance','sets','reps','weight'])if(Object.prototype.hasOwnProperty.call(values,k))entry[k]=values[k];w.entries.push(entry);}});
}
return {KEY,VERSION,empty,validate,read,settings,write,prepareLegacyReset,activateLegacyReset,commitDay,dateOK};
});
