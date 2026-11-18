"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const src=fs.readFileSync(path.join(__dirname,"..","avionics_tutor.js"),"utf8");
const start=src.indexOf("function syncScopedDraft(){"),end=src.indexOf("function moveQuestion(",start);
assert(start>=0&&end>start,"Current-question draft sync must be implemented in the existing workbook");
const extract=src.slice(start,end);
const state={responses:{"ohm-F2":"correct answer from Q2","ohm-F3":"saved response for Q3","ohm-F3::dice":"different dice response"},lastTopic:"ohm",lastIndex:0,ratings:{"ohm-F2":"know"}};
let selectedQ={id:"ohm-F3"},topic="ohm";
const all=[{id:"ohm-F1"},{id:"ohm-F2"},{id:"ohm-F3"},{id:"ohm-F4"}];
const env={state,selected:()=>selectedQ,allTopicQuestions:()=>all,progressKey:q=>q.isCustomVariant?q.id+"::dice":q.id,
topic,draftText:"WRONG PREVIOUS QUESTION",currentAnswer:"WRONG PREVIOUS QUESTION",answerDirty:true,feedback:"stale grade",expanded:true};
vm.createContext(env);vm.runInContext(extract,env,{filename:"avionics_tutor.js/syncScopedDraft"});
env.syncScopedDraft();
assert.equal(env.currentAnswer,"saved response for Q3","A new question may only display its own persisted answer");
assert.equal(env.draftText,"saved response for Q3");
assert.equal(env.state.lastIndex,2,"Last index must use full topic, not the active filtered index");
assert.equal(env.feedback,"");
assert.equal(env.answerDirty,false);
assert.equal(env.expanded,false);
selectedQ={id:"ohm-F3",isCustomVariant:true};
env.syncScopedDraft();
assert.equal(env.currentAnswer,"different dice response","Dice and canonical response stores must remain isolated");
selectedQ=null;env.syncScopedDraft();
assert.equal(env.currentAnswer,"","An empty filter result must not leak another answer");
assert.equal(env.state.ratings["ohm-F2"],"know","Unrelated mastery must be preserved");
for(const marker of ["if(el)el.onchange=e=>{topic=", "if(lev)lev.onchange=e=>{filter=", "if(search)search.onchange=e=>{query="]){
 const line=src.split("\n").find(s=>s.includes(marker));
 assert(line&&line.includes("syncScopedDraft();"),"Every scope change must reset and rehydrate current answer: "+marker);
}
assert(src.includes("state.lastIndex=fullIndex>=0?fullIndex:currentIndex"),"Filtered navigation must persist canonical index");
assert(src.includes('delete customVariants[q.id];draftText=state.responses[q.id]||"";currentAnswer=draftText'),"Restore Canonical must hydrate both input representations");
console.log("PASS: topic/filter/search answer sync, empty filters, canonical index, dice score separation, canonical restore");