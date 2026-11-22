const test = require('node:test');
const assert = require('node:assert/strict');
const {KEY, createStore} = require('../data-store.js');
const base = () => ({profile:null, entries:[], extension:{keep:true}, workouts:{schemaVersion:1}, habitTracker:{version:1}});
const validate = s => {
  if (!Array.isArray(s.entries) || !Object.prototype.hasOwnProperty.call(s,'profile')) throw Error('schema');
  if (s.workouts && s.workouts.schemaVersion !== 1) throw Error('version');
};
function fixture(raw=JSON.stringify(base())) {
  const data=new Map(raw===null?[]:[[KEY,raw]]), calls=[];
  const storage={getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>{calls.push(k);data.set(k,v);}};
  return {data,calls,storage,store:createStore({storage,validate})};
}
const error=code=>e=>e.code===code;
test('requires explicit storage and domain validator',()=>{
  assert.throws(()=>createStore(),error('STORAGE_REQUIRED'));
  assert.throws(()=>createStore({storage:fixture().storage}),error('VALIDATOR_REQUIRED'));
});
test('missing key does not create default data',()=>{
  const f=fixture(null);assert.deepEqual(f.store.read(),{raw:null,state:null});
  assert.throws(()=>f.store.update(()=>{}),error('NOT_INITIALIZED'));assert.equal(f.calls.length,0);
});
test('corrupt JSON remains unchanged',()=>{
  const f=fixture('{broken');assert.throws(()=>f.store.read(),error('CORRUPT_JSON'));
  assert.equal(f.data.get(KEY),'{broken');assert.equal(f.calls.length,0);
});
test('unsupported domain version is not overwritten',()=>{
  const s=base();s.workouts.schemaVersion=999;const raw=JSON.stringify(s),f=fixture(raw);
  assert.throws(()=>f.store.read(),error('VALIDATION_FAILED'));assert.equal(f.data.get(KEY),raw);
});
test('read access failure is explicit',()=>{
  const f=fixture();f.storage.getItem=()=>{throw Error('denied');};
  assert.throws(()=>f.store.read(),error('READ_FAILED'));assert.equal(f.calls.length,0);
});
test('failed write does not notify or change storage',()=>{
  const f=fixture(),old=f.data.get(KEY);let notifications=0;f.store.subscribe(()=>notifications++);
  f.storage.setItem=()=>{throw Error('quota');};
  assert.throws(()=>f.store.update(s=>{s.entries.push({id:'one'});}),error('WRITE_FAILED'));
  assert.equal(f.data.get(KEY),old);assert.equal(notifications,0);
});
test('unknown fields survive and key remains nt1',()=>{
  const f=fixture();f.data.set('setup.theme.v1','dark');f.data.set('food.pro.workouts.v1','legacy');
  const r=f.store.update(s=>{s.entries.push({id:'stable'});});
  assert.equal(r.state.extension.keep,true);assert.equal(r.state.entries[0].id,'stable');
  assert.deepEqual(f.calls,['nt1']);assert.equal(f.data.get('setup.theme.v1'),'dark');assert.equal(f.data.get('food.pro.workouts.v1'),'legacy');
});
test('read snapshot cannot mutate stored state',()=>{
  const f=fixture(),r=f.store.read();r.state.extension.keep=false;assert.equal(f.store.read().state.extension.keep,true);
});
test('stale snapshot refused',()=>{
  const f=fixture(),before=f.store.read();f.store.update(s=>{s.extension.keep=false;});
  assert.throws(()=>f.store.commit(before.state,before),error('CONFLICT'));
  assert.equal(f.store.read().state.extension.keep,false);
});
test('write requires a snapshot',()=>{
  const f=fixture();assert.throws(()=>f.store.commit(base()),error('SNAPSHOT_REQUIRED'));assert.equal(f.calls.length,0);
});
test('invalid proposed state rejected before writing',()=>{
  const f=fixture();assert.throws(()=>f.store.update(s=>{s.entries=null;}),error('VALIDATION_FAILED'));assert.equal(f.calls.length,0);
});
for(const [name,value] of [['NaN',NaN],['Infinity',Infinity],['undefined',undefined],['Date',new Date()],['function',()=>{}]]){
  test('reject lossy JSON: '+name,()=>{
    const f=fixture();assert.throws(()=>f.store.update(s=>{s.extension=value;}),error('INVALID_JSON'));assert.equal(f.calls.length,0);
  });
}
test('reject circular reference',()=>{
  const f=fixture();assert.throws(()=>f.store.update(s=>{s.circular=s;}),error('INVALID_JSON'));assert.equal(f.calls.length,0);
});
test('reject sparse array',()=>{
  const f=fixture();assert.throws(()=>f.store.update(s=>{s.extra=Array(3);}),error('INVALID_JSON'));assert.equal(f.calls.length,0);
});
test('subscriber failures do not report persistence failure',()=>{
  const f=fixture();let later=false;f.store.subscribe(()=>{throw Error('UI');});f.store.subscribe(()=>{later=true;});
  const r=f.store.update(s=>{s.extension.keep=false;});assert.equal(r.listenerErrors,1);assert.equal(later,true);assert.equal(f.store.read().state.extension.keep,false);
});
test('notification happens after persistence and is isolated',()=>{
  const f=fixture();let observed;
  const off=f.store.subscribe(e=>{observed=JSON.parse(f.data.get(KEY)).extension.keep;e.state.extension.keep=true;});
  f.store.update(s=>{s.extension.keep=false;});assert.equal(observed,false);assert.equal(f.store.read().state.extension.keep,false);off();
});
test('subscriber cannot reenter writes',()=>{
  const f=fixture();f.store.subscribe(()=>assert.throws(()=>f.store.update(s=>{s.extension.keep=true;}),error('REENTRANT_WRITE')));
  f.store.update(s=>{s.extension.keep=false;});assert.equal(f.store.read().state.extension.keep,false);
});
test('external event refreshes actual storage, not stale event payload',()=>{
  const f=fixture(),handlers=new Map(),target={addEventListener:(k,h)=>handlers.set(k,h),removeEventListener:k=>handlers.delete(k)};
  let event;f.store.subscribe(e=>{event=e;});const detach=f.store.attachStorageEvents(target);
  const next=base();next.extension.keep=false;f.data.set(KEY,JSON.stringify(next));
  handlers.get('storage')({key:KEY,storageArea:f.storage,newValue:'ignored'});
  assert.equal(event.source,'external');assert.equal(event.state.extension.keep,false);
  handlers.get('storage')({key:'food-theme',storageArea:f.storage});assert.equal(f.calls.length,0);detach();assert.equal(handlers.size,0);
});
test('clear event reports missing key without restoring it',()=>{
  const f=fixture(),target=new EventTarget();let state='unchanged';f.store.subscribe(e=>{state=e.state;});
  const detach=f.store.attachStorageEvents(target);f.data.delete(KEY);
  const event=new Event('storage');Object.defineProperty(event,'key',{value:null});target.dispatchEvent(event);
  assert.equal(state,null);assert.equal(f.calls.length,0);detach();
});
test('mutator must be synchronous and return undefined',()=>{
  const f=fixture();assert.throws(()=>f.store.update(()=>({})),error('SYNC_MUTATOR_REQUIRED'));assert.equal(f.calls.length,0);
});
test('JSON export envelope can preserve a snapshot without data loss',()=>{
  const f=fixture(),s=f.store.read().state,wrapped=JSON.stringify({version:2,exportedAt:'test',data:s});
  assert.deepEqual(JSON.parse(wrapped).data,s);
});

test('reject sparse array disguised by extra property',()=>{
  const f=fixture(),array=Array(2);array[1]=1;array.extra=2;
  assert.throws(()=>f.store.update(s=>{s.extra=array;}),error('INVALID_JSON'));assert.equal(f.calls.length,0);
});
test('reject non-enumerable fields instead of losing them',()=>{
  const f=fixture(),extension={};Object.defineProperty(extension,'hidden',{value:1});
  assert.throws(()=>f.store.update(s=>{s.extension=extension;}),error('INVALID_JSON'));assert.equal(f.calls.length,0);
});
