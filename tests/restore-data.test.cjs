const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {spawnSync} = require('node:child_process');
const html = fs.readFileSync('index.html', 'utf8');
const start = html.indexOf('async function restoreData(input)');
const end = html.indexOf('\nconst originalProfile=', start);
assert.ok(start >= 0 && end > start);
const source = html.slice(start, end);
function fixture() {
  return {profile:{age:30,h:180,w:80,act:1.4,health:[]},entries:[{id:'stable-id',date:'2026-11-01',name:'Рис',g:100,k:130,p:3,f:1,c:28}],workouts:{entries:[{id:'workout1'}]},reports:{saved:true},rem:{enabled:true},extra:{kept:true}};
}
async function run(options = {}) {
  let writes = 0;
  const messages = [], old = {sentinel:true}, data = fixture();
  if (options.duplicate) data.entries.push({...data.entries[0]});
  if (options.badDate) data.entries[0].date = '2026-02-31';
  const c = {S:old,tab:'profile',window:{sportsValidateImport:x=>x??{},foodValidateWaterGoals:x=>x??{}},crypto:require('node:crypto'),dt:x=>new Date(x+'T12:00:00Z'),dk:d=>d.toISOString().slice(0,10),today:()=> '2026-11-22',defRem:()=>({}),confirm:()=>!options.cancel,toast:x=>messages.push(x),render:()=>{if(options.renderFail) throw Error('render');},localStorage:{setItem:(key,value)=>{assert.equal(key,'nt1');JSON.parse(value);if(options.storageFail)throw Error('quota');writes++;}}};
  vm.createContext(c); vm.runInContext(source,c);
  await c.restoreData({files:[{text:async()=>JSON.stringify({version:options.version??2,data})}],value:'selected'});
  return {c,old,messages,writes};
}
test('all inline scripts parse',()=>{
  let count = 0;
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc\s*=/.test(m[1])) continue;
    const r = spawnSync(process.execPath,['--check'],{input:m[2],encoding:'utf8'});
    assert.equal(r.status,0,r.stderr); count++;
  }
  assert.equal(count,23);
});
test('preserves workouts, reports, reminders, extra fields and IDs',async()=>{
  const r=await run(); assert.equal(r.writes,1);assert.equal(r.c.S.entries[0].id,'stable-id');
  assert.ok(r.c.S.workouts.entries.length && r.c.S.reports.saved && r.c.S.rem.enabled && r.c.S.extra.kept);
});
for (const [name,options] of [['storage failure',{storageFail:true}],['unsupported version',{version:999}],['cancel',{cancel:true}],['duplicate ID',{duplicate:true}],['impossible date',{badDate:true}]]) {
  test(name+' leaves old state untouched',async()=>{const r=await run(options);assert.equal(r.writes,0);assert.equal(r.c.S,r.old);assert.ok(!r.messages.includes('Данные восстановлены'));});
}
test('render failure is distinct from storage failure',async()=>{const r=await run({renderFail:true});assert.equal(r.writes,1);assert.notEqual(r.c.S,r.old);assert.ok(!r.messages.includes('Данные восстановлены'));});
