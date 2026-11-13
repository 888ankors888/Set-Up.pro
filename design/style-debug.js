(() => {
'use strict';
if(new URLSearchParams(location.search).get('debugStyles')!=='1')return;
const ids=['about','nutrition','sport','habits'].map(x=>'goals-questionnaire-'+x);
const props=['background-color','background-image','opacity','backdrop-filter','border-top-color','box-shadow','color'];
const panel=document.createElement('aside');panel.setAttribute('aria-label','Отладка стилей');
Object.assign(panel.style,{position:'fixed',right:'8px',bottom:'100px',width:'min(640px,95vw)',maxHeight:'65vh',overflow:'auto',zIndex:'2147483646',background:'#071c18',color:'#effff5',border:'1px solid #43c99a',borderRadius:'12px',padding:'12px',font:'12px/1.5 monospace',boxSizing:'border-box'});
const title=document.createElement('strong');title.textContent='Отладка стилей — только локально';
const refresh=document.createElement('button');refresh.type='button';refresh.textContent='Обновить отчёт';
const close=document.createElement('button');close.type='button';close.textContent='Закрыть';
const output=document.createElement('pre');Object.assign(output.style,{whiteSpace:'pre-wrap',overflowWrap:'anywhere',margin:'12px 0 0'});
panel.append(title,document.createElement('br'),refresh,close,output);
function read(node){const css=getComputedStyle(node);return Object.fromEntries(props.map(p=>[p,css.getPropertyValue(p)]));}
function rulesFor(node){const found=[],unreadable=[];
function walk(rules,source,context=[]){for(const rule of rules){if(rule.type===CSSRule.MEDIA_RULE&&!matchMedia(rule.conditionText).matches)continue;if(rule.type===CSSRule.SUPPORTS_RULE&&!CSS.supports(rule.conditionText))continue;if(rule.selectorText){let matches=false;try{matches=node.matches(rule.selectorText);}catch(error){}if(matches){const declarations={};for(const p of ['background',...props]){const value=rule.style.getPropertyValue(p);if(value)declarations[p]=value+(rule.style.getPropertyPriority(p)?' !important':'');}if(Object.keys(declarations).length)found.push({source,selector:rule.selectorText,context,declarations});}}if(rule.cssRules)walk(rule.cssRules,source,[...context,rule.conditionText||rule.name||'group']);}}
for(const sheet of document.styleSheets){if(sheet.disabled)continue;if(sheet.media?.mediaText&&!matchMedia(sheet.media.mediaText).matches)continue;const source=sheet.href||('inline#'+(sheet.ownerNode?.id||'unnamed'));try{walk(sheet.cssRules,source);}catch(error){unreadable.push(source);}}
return {matchingRules:found,unreadableStylesheets:unreadable};}
function report(){const blocks=ids.map(id=>{const node=document.getElementById(id);if(!node)return {id,present:false};return {id,classes:node.className,computed:read(node),...rulesFor(node),nested:[...node.querySelectorAll('.nutrition-category,.sport-category,.habit-category')].map((child,index)=>({index,classes:child.className,computed:read(child),...rulesFor(child)}))};});const data={note:'Совпадающие правила, не вычисленный список победителей каскада. Итоговые значения находятся в computed. Поля анкеты не читаются.',blocks};output.textContent=JSON.stringify(data,null,2);window.setupStyleDebugReport=data;console.table(blocks.filter(x=>x.computed).map(x=>({id:x.id,...x.computed})));return data;}
const outline=document.createElement('style');outline.textContent=ids.map(id=>'#'+id).join(',')+'{outline:1px dashed #d9f45b!important;outline-offset:3px!important}';
function start(){document.head.append(outline);document.body.append(panel);report();}
refresh.addEventListener('click',report);close.addEventListener('click',()=>{panel.remove();outline.remove();delete window.setupStyleDebugReport;});
if(document.readyState==='complete')start();else window.addEventListener('load',start,{once:true});
})();
