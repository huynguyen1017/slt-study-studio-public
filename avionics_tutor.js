"use strict";
/* Beginner-first 4-page visual workbook UI for the 690-question avionics curriculum.
   Features 1-30 quick-jump + 30-card gallery, native MathML engineering notation,
   6-step beginner guides, 3-panel board/breadboard visuals, and rubric/numeric grading. */
(function(){
const TOPICS=window.AVIONICS_TOPICS||[];
const QUESTIONS=window.AVIONICS_QUESTIONS||[];
const LESSONS=window.AVIONICS_BEGINNER_LESSONS||{};
const DEEP=window.AVIONICS_CONCEPT_DEEP_DIVE||{};
const SI=window.AVIONICS_SI_LESSON||null;
const BOOK=window.AVIONICS_TEXTBOOK_TOC||null;
const COURSE=window.AVIONICS_COURSEWORK_BRIDGES||{};
const NOTEBOOK=window.avionicsNotebookLabs||null;
const VIS=window.avionicsVisuals;
const CIRCUITSIM=window.avionicsCircuitSimulator||null;
const VIDEO=window.avionicsVideoLessons||null;
const NUCLEO=window.avionicsNucleoWorkbench||null;
const MIXED=window.avionicsMixedCircuitCurriculum||null;
const ASSESS=window.avionicsAnswerCheck;
const STORE="slt-avionics-ee-practice-v1";
const TOPIC_TOTAL=window.AVIONICS_EXPECTED_PER_TOPIC||30;
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const find=(s,r=document)=>r.querySelector(s);
const fmt=x=>Math.abs(x)>0&&Math.abs(x)<0.0001?Number(x).toExponential(3):Number(x.toPrecision(5)).toString();
const eq=x=>window.studyMath?window.studyMath(x,true):'<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mtext>'+esc(x)+'</mtext></math>';
const rich=x=>window.studyMathText?window.studyMathText(String(x??"")):esc(x);
const engVal=(x,u)=>window.formatEngineeringMath?window.formatEngineeringMath(x,u):esc(fmt(x)+" "+u);

let remembered={};try{remembered=JSON.parse(localStorage.getItem(STORE)||"{}")||{}}catch{}
const state={ratings:{},attempts:{},assessments:{},responses:{},...remembered};
if(!state.ratings||typeof state.ratings!=="object")state.ratings={};
if(!state.attempts||typeof state.attempts!=="object")state.attempts={};
if(!state.assessments||typeof state.assessments!=="object")state.assessments={};
if(!state.responses||typeof state.responses!=="object")state.responses={};
/* Question meanings changed in v10. Archive previous mastery and explanations
   before resetting only their status, so a correct old answer is not displayed
   as already mastered for a new problem with the same stable ID. */
const ACTIVE_CURRICULUM=window.AVIONICS_DISTINCT_CURRICULUM_VERSION||10;
if(ACTIVE_CURRICULUM>=10&&state.curriculumVersion!==ACTIVE_CURRICULUM){
 const old={ratings:state.ratings,assessments:state.assessments,responses:state.responses,attempts:state.attempts,version:state.curriculumVersion||9};
 const had=Object.keys(old.ratings).length+Object.keys(old.responses).length+Object.keys(old.assessments).length>0;
 if(had)state["priorProgressV"+(state.curriculumVersion||9)]=old;
 state.ratings={};state.assessments={};state.responses={};state.attempts={};state.curriculumVersion=ACTIVE_CURRICULUM;
 try{localStorage.setItem(STORE,JSON.stringify(state))}catch(e){console.warn("Could not persist curriculum migration",e);}
}


let host=null,topic=TOPICS.some(t=>t.id===state.lastTopic)?state.lastTopic:"ohm";
let currentIndex=Number.isInteger(state.lastIndex)?state.lastIndex:0;
let filter="All",query="",page="learn",stepIndex=0,expanded=false,feedback="",draftText="",currentAnswer="",answerDirty=false;
let inlineVisualMode="schematic",customVariants={},variantRollCount={};

const save=()=>{try{localStorage.setItem(STORE,JSON.stringify(state))}catch{}};
const progressKey=q=>q&&q.isCustomVariant?q.id+"::dice":q.id;
const topicOf=()=>TOPICS.find(t=>t.id===topic)||TOPICS[0];
const qset=()=>QUESTIONS.filter(x=>x.topic===topic&&(filter==="All"||x.level===filter)&&(!query||(x.question+" "+x.steps.join(" ")).toLowerCase().includes(query)));
const activeQuestion=()=>{const a=qset();currentIndex=Math.max(0,Math.min(a.length-1,currentIndex));const base=a[currentIndex];return base?(customVariants[base.id]||base):null;};
const selected=activeQuestion;
const cnt=id=>QUESTIONS.filter(x=>x.topic===id&&state.ratings[x.id]==="know").length;
const allTopicQuestions=()=>QUESTIONS.filter(x=>x.topic===topic);

function matchingSkill(q,t){
 if(!q||!t)return 0;
 if(Number.isInteger(q.skillIndex))return q.skillIndex;
 const m=q.id.match(/-([FADC])(\d+)$/);
 if(!m)return 0;
 const n=Number(m[2])-1;
 if(m[1]==="F"||m[1]==="A")return n;
 if(m[1]==="D")return Math.floor(n/2);
 if(t.id==="ohm")return 3;
 if(m[1]==="C")return Math.min(4,1+Math.floor(n/5));
 return 0;
}
function focus(q,t){
 if(q.lesson)return {label:q.lesson.title,definition:q.lesson.summary,why:q.lesson.why,test:q.lesson.example,deep:null};
 const s=t.skills[matchingSkill(q,t)]||t.skills[0];
 const deep=DEEP[t.id+":"+s[0]]||DEEP[s[0]]||null;
 return {label:s[0],definition:s[1],why:s[2],test:s[3],deep};
}
function equation(source,label){
 return '<div class="av-math"><div class="av-math-label">'+esc(label)+'</div>'+eq(source)+'</div>';
}
function knownValues(text){
 const pairs=String(text).match(/(?:\d+(?:\.\d+)?(?:e[+-]?\d+)?\s*(?:µF|µH|µs|MHz|GHz|kHz|mH|mA|mV|mΩ|MΩ|kΩ|Ω|V|A|W|Hz|ms|ns|µJ|µC|J|s|kW|dB|bytes|seconds|turns|%))/gi)||[];
 return [...new Set(pairs)].slice(0,8);
}

/* Dynamic fresh-number variant generator for Calculation questions */
function makeRandomVariant(q){
 if(MIXED&&q.roll)return MIXED.reroll(q);
 const fam=q.calcFamily;
 if(!fam&&!q.variantPool?.length&&typeof q.variantGenerator!=="function")return null;
 const roll=(variantRollCount[q.id]=(variantRollCount[q.id]||0)+1);
 const pick=(arr)=>arr[Math.floor(Math.random()*arr.length)];
 const randInt=(lo,hi)=>lo+Math.floor(Math.random()*(hi-lo+1));
 const m=(prompt,answer,unit,formula,sub,steps,extra={})=>({
 ...q,...extra,question:prompt,expected:Number(answer.toPrecision(10)),unit,formula,sub,
 steps:(Array.isArray(steps)&&steps.length)?steps:[
  "Identify the NEW numerical inputs and the desired output in "+unit+".",
  "Write the governing relationship for this same solving method: "+formula+".",
  "Substitute the variant values: "+sub+".",
  "Evaluate the shown expression carefully: "+sub+".",
  "Check engineering units, sign, magnitude and physical plausibility."
 ],
 numericOperation:q.numericOperation||"Fresh-number calculation",learningObjective:"🎲 "+(q.numericOperation||q.learningObjective),
 lesson:{title:q.numericOperation||"Fresh-number calculation",
 summary:"Optional same-method new-numbers drill (#"+roll+"), scored separately. "+prompt,
 example:"New substitution: "+sub+". Expected answer: "+answer+" "+unit+".",
 why:"Repeat the current skill with new numerical inputs, never an unrelated older calculation family.",
 vocab:[["Target",prompt],["Engineering units",unit],["Validation","Check the answer against the governing physical model."]]},
 isCustomVariant:true,
 variantPool:q.variantPool,
 variantGenerator:q.variantGenerator,
 topology:extra.topology!==undefined?extra.topology:q.topology
});
 const pool=Array.isArray(q.variantPool)?q.variantPool:[];
 if(typeof q.variantGenerator==="function"&&(roll%2===1||!pool.length)){
  const v=q.variantGenerator(roll);
  if(v&&v.question!==q.question){
   return m(v.question,v.expected,v.unit,v.formula,v.sub,v.steps,{topology:v.topology||q.topology});
  }
 }
 if(pool.length){
  const v=pool[(roll-1)%pool.length];
  if(v&&v.question){
   return m(v.question,v.expected,v.unit,v.formula,v.sub,v.steps,{topology:v.topology||q.topology});
  }
 }
 if(fam==="milli"){const x=randInt(3,850);return m(`Convert ${x} mA into amperes (A).`,x*1e-3,"A","I_A = I_mA * 10^(-3)",`I_A = ${x} * 10^(-3) = ${fmt(x*1e-3)}`,["Milli means 10^(-3).","Multiply "+x+" by 10^(-3) (move decimal 3 places left).","Report in amperes (A)."]);}
 if(fam==="micro"){const x=pick([1.5,3.3,6.8,15,22,33,68,220]);return m(`Express a ${x} µF capacitor in farads (F).`,x*1e-6,"F","C_F = C_uF * 10^(-6)",`C_F = ${x} * 10^(-6) = ${fmt(x*1e-6)}`,["Micro means 10^(-6).","Multiply "+x+" by 10^(-6) (shift decimal 6 places left).","Report in farads (F)."]);}
 if(fam==="ohmI"){const v=pick([1.8,3.3,5,9,12,15,24,28]);const r=pick([120,220,330,470,680,1000,1500,2200,4700]);const ia=v/r,ima=1000*ia;return m(`A ${r} Ω resistor has ${v} V across it. Find current in mA.`,ima,"mA","I = V / R",`I = ${v} / ${r} = ${fmt(ia)} = ${fmt(ima)} * 10^(-3)`,["Read V and R in base units.","Compute I = V / R in amperes.","Multiply by 10^(3) to report milliamps (mA)."]);}
 if(fam==="ohmR"){const v=pick([3.3,5,9,12,24]);const i=pick([4,5,8,12,15,25,30]);return m(`A branch has ${v} V and should draw ${i} mA. What resistance in Ω gives that current?`,v/(i*1e-3),"Ω","R = V / I",`R = ${v} / (${i} * 10^(-3)) = ${fmt(v/(i*1e-3))}`,["Convert mA to A using 10^(-3).","Divide V by I: R = V / I.","Verify standard resistor sizing."]);}
 if(fam==="powerDC"){const v=pick([1.2,1.8,3.3,5,12,28]);const i=pick([0.5,1.2,1.5,2.5,3.0,4.0]);return m(`A DC board rail is ${v} V at ${i} A. Find consumed power in W.`,v*i,"W","P = V * I",`P = ${v} * ${i} = ${fmt(v*i)}`,["Read rail V and I.","Multiply P = V * I.","Report in watts (W)."]);}
 if(fam==="seriesR"){const a=pick([100,150,220,330]),b=pick([470,680,1000]),c=pick([100,220,330,470]);return m(`Three series resistors are ${a} Ω, ${b} Ω and ${c} Ω. Find total resistance in Ω.`,a+b+c,"Ω","R_T = R_1 + R_2 + R_3",`R_T = ${a} + ${b} + ${c} = ${a+b+c}`,["Confirm single series loop.","Add all three resistor values.","Report R_T in ohms."]);}
 if(fam==="divider"){const v=pick([3.3,5,9,12,24,28]),r1=pick([1000,2200,3300,4700]),r2=pick([1000,2000,3300,4700]);return m(`Unloaded divider: ${v} V input, top ${r1} Ω, bottom ${r2} Ω. Find voltage at midpoint in V.`,v*r2/(r1+r2),"V","V_out = V_in * (R_2 / (R_1 + R_2))",`V_out = ${v} * (${r2} / (${r1} + ${r2})) = ${fmt(v*r2/(r1+r2))}`,["Sum R_1 + R_2.","Divide R_2 by total R.","Multiply by V_in."]);}
 if(fam==="parallelR"){const a=pick([150,220,330,470,1000]),b=pick([220,330,470,680,1000]);return m(`Calculate the equivalent resistance of ${a} Ω and ${b} Ω in parallel, in Ω.`,a*b/(a+b),"Ω","R_eq = (R_1 * R_2) / (R_1 + R_2)",`R_eq = (${a} * ${b}) / (${a} + ${b}) = ${fmt(a*b/(a+b))}`,["Parallel paths share Node A & B.","Compute (R_1 * R_2) / (R_1 + R_2).","Verify R_eq is smaller than both resistors."]);}
 if(fam==="rcTau"){const r=pick([1.5,2.2,3.3,4.7,10,15]),c=pick([1,2.2,4.7,10,22]);return m(`A first-order RC circuit uses R=${r} kΩ and C=${c} µF. Find τ in ms.`,r*c,"ms","tau = R * C",`tau = (${r} * 10^(3)) * (${c} * 10^(-6)) = ${fmt(r*c)} * 10^(-3)`,["Convert kΩ (10^3) and µF (10^(-6)).","Multiply R * C: 10^3 × 10^(-6) = 10^(-3) s = ms.","Report τ in ms."]);}
 if(fam==="shunt"){const r=pick([2,4,5,10]),v=pick([12,20,35,50,65,80]);return m(`A current-sense shunt of ${r} mΩ has a measured differential voltage of ${v} mV. Find current in A.`,v/r,"A","I = V_sense / R_shunt",`I = (${v} * 10^(-3)) / (${r} * 10^(-3)) = ${fmt(v/r)}`,["Convert mV and mΩ with 10^(-3).","Divide V_sense by R_shunt (10^(-3) cancels!).","Report current in amperes (A)."]);}
 if(fam==="clockPeriod"){const f=pick([4,8,12,20,40,80,125]);const ts=1/(f*1e6),tns=ts*1e9;return m(`A digital clock runs at ${f} MHz. Find full clock period in ns.`,tns,"ns","T = 1 / f",`T = 1 / (${f} * 10^(6)) = ${fmt(ts)} = ${fmt(tns)} * 10^(-9)`,["Convert MHz using 10^(6) Hz.","Compute T = 1 / f in seconds.","Multiply by 10^(9) for nanoseconds (ns)."]);}
 const nextIdx=((q.variantIndex||0)+1+Math.floor(Math.random()*4))%5;
 if(window.AVIONICS_CALC_FAMILIES?.[fam]){
  const n=window.AVIONICS_CALC_FAMILIES[fam](nextIdx);
  return m(n.prompt,n.answer,n.unit,n.formula,n.sub,n.steps);
 }
 return null;
}

function stepsFor(q,t,f){
 const st=q.steps||[];
 const beginner=f.deep;
 const guided=q.lesson||null;
 const out=[];
 const formulaStr=q.formula||(beginner&&beginner.formula)||null;
 const subStr=q.sub||(beginner&&beginner.sub)||null;
 // Q31–50 have their own eight-step worked answer rather than a generic diagnostic template.
 if(q.advancedStage>=31){
  const titles=["Name the concept and its units","Separate evidence from diagnosis","Predict healthy operation","Make a safe independent check","Do the arithmetic or interpret physical proof","Challenge alternative root causes","Corroborate using another observation","Record the disposition and next evidence"];
  return (q.steps||[]).map((body,i)=>({
   title:titles[i]||"Explain and verify",body,
   kind:q.expected!==undefined&&i===4?"answer":q.expected!==undefined&&(i===2||i===3)?"formula":"text",
   formula:q.expected!==undefined&&i===2?q.formula:q.expected!==undefined&&i===3?q.sub:null,
   answer:q.expected!==undefined&&i===4?fmt(q.expected)+" "+q.unit:null,
   engHtml:q.expected!==undefined&&i===4?engVal(q.expected,q.unit):null
  }));
 }
 if(q.level==="Foundations"||q.level==="Application"){
  out.push({
   title:"Understand the question in everyday words",
   body:`This question specifically asks about "${f.label}". In simple words: ${guided?guided.summary:beginner?beginner.plain:f.definition}`,
   kind:"text"
  });
  out.push({
   title:"Connect it to a real-world picture",
   body:`Picture it like this: ${guided?(LESSONS[t.id]?.analogy||guided.why):beginner?beginner.analogy:LESSONS[t.id].analogy}`,
   kind:"text"
  });
  out.push({
   title:formulaStr?"The governing equation and its symbols":"Distinguish a principle from a numerical equation",
   body:formulaStr?"We will define every symbol in this equation before using it.":"This is a concept question. Not every definition needs a calculation, and using an unrelated equation would be misleading. Describe the physical meaning first: "+f.definition,
   kind:formulaStr?"formula":"text",
   formula:formulaStr
  });
  out.push({
   title:subStr?"Work through the given numbers":"Use a concrete example without assuming numbers",
   body:subStr?((guided?guided.example:beginner?beginner.example:LESSONS[t.id].example)+" Substitute the stated values in the equation."):((guided?guided.example:beginner?beginner.example:LESSONS[t.id].example)+" This is a qualitative example, not a measured dataset or a calculation."),
   kind:subStr?"formula":"text",
   formula:subStr
  });
  out.push({
   title:"Why Muon Space avionics engineers care on the bench",
   body:`${guided?guided.why:beginner?beginner.why:f.why} On a real test station: ${f.test}`,
   kind:"text"
  });
  if(f.label==="SI base unit"&&SI){
   out.push({
    title:"Name the seven base units and separate derived units",
    body:"The seven SI base units are meter (m), kilogram (kg), second (s), ampere (A), kelvin (K), mole (mol) and candela (cd). The volt (V) and ohm (Ω) are derived units. Radian and steradian were called supplementary units in the older textbook; their separate SI class was eliminated in 1995.",
    kind:"text"
   });
  }
  out.push({
   title:"Speak this answer in an interview",
   body:`${st[0]||f.definition} ${st[1]||""} ${st[2]||""} Takeaway: ${guided?(st[3]||guided.why):beginner?beginner.recap:LESSONS[t.id].lead}`,
   kind:"answer"
  });
 }else if(q.expected!==undefined){
  const vals=knownValues(q.question);
  out.push({
   title:"Read slowly: what is known vs. what are we solving for?",
   body:`Goal: compute a numerical value in "${q.unit}". First look at the circuit diagram above and trace what each component represents before touching a calculator.`,
   kind:"text"
  });
  out.push({
   title:"List the GIVEN values and convert engineering prefixes (10^(3n))",
   body:vals.length?`Given in question: ${vals.join(" · ")}. Always rewrite milli (10^(-3)), micro (10^(-6)), kilo (10^(3)), and mega (10^(6)) into powers of 10 before calculating.`:q.question,
   kind:"given",
   formula:q.unitConv||null
  });
  out.push({
   title:"Select the physical equation (MathML)",
   body:st[0]||"Write the governing electrical law before plugging in numbers.",
   kind:"formula",
   formula:q.formula
  });
  out.push({
   title:"Substitute the converted numbers step by step",
   body:st[1]||"Plug your base SI values (V, A, Ω, F, H, Hz) into the formula carefully.",
   kind:"formula",
   formula:q.sub
  });
  out.push({
   title:"Final engineering result & unit check",
   body:`Compare both the decimal/unit answer and its engineering-notation form (${q.unit}). Type only the numeric value (scientific notation like 2.5e-3 is accepted) on Page 4.`,
   kind:"answer",
   answer:fmt(q.expected)+" "+q.unit,
   engHtml:engVal(q.expected,q.unit)
  });
  out.push({
   title:"Sanity check & physical plausibility",
   body:st[2]||"Pause and verify order of magnitude: does the current, voltage, or frequency make physical sense on a real avionics board?",
   kind:"text"
  });
 }else{
  out.push({
   title:"Separate symptom from assumption (Never blame the PCBA first!)",
   body:`Reported observation: ${q.question} First verify whether the fault lies in the test rack, cable harness, Linux host, probe setup, or flight DUT.`,
   kind:"text"
  });
  out.push({
   title:"Safety check before touching live hardware",
   body:`Check bench power-supply current limits and voltage ratings first. Never measure resistance with power ON, and never attach a grounded scope clip across a live high-side shunt.`,
   kind:"text"
  });
  out.push({
   title:formulaStr?"Engineering check and governing equation":"Engineering check without an assumed formula",
   body:formulaStr?"Safest first action: "+(st[1]||st[0])+". Use the actual governing relationship to predict a healthy reading.":"Safest first action: "+(st[1]||st[0])+". Compare the expected healthy observations with the reported fault.",
   kind:formulaStr?"formula":"text",
   formula:formulaStr
  });
  out.push({
   title:"Expected healthy behavior versus observed fault",
   body:"Why this isolates the root cause: "+(st[2]||f.why)+". "+(subStr?"Evaluate the given numeric example.":"No numerical values were provided, so do not invent a substitution."),
   kind:subStr?"formula":"text",
   formula:subStr
  });
  out.push({
   title:"Collect independent confirming evidence (A-B-A / KGB swap)",
   body:`Verify with independent measurement: ${st[3]||f.test}`,
   kind:"text"
  });
  out.push({
   title:"Go / No-Go diagnosis summary",
   body:`State: (1) exact symptom observed, (2) controlled isolation test performed, and (3) root-cause proof. Never declare PASS on unconfirmed or intermittent evidence.`,
   kind:"answer"
  });
 }
 return out;
}

function visualSwitcherBar(activeMode){
 const modes=[["schematic","1. Circuit Schematic"],["concept","2. Graph / Waveform"],["wiring","3. Board & Breadboard (3-Panel)"]];
 return '<div class="av-vis-switch" role="group" aria-label="Switch diagram view">'+
  modes.map(m=>`<button type="button" class="av-vis-pill ${activeMode===m[0]?"active":""}" data-vismode="${m[0]}">${esc(m[1])}</button>`).join("")+
  `<button type="button" class="av-vis-pill av-vis-zoom-btn" data-zoom="${activeMode}">↗ Enlarge</button>`+
 '</div>';
}

function activeBanner(q,t){
 const idx=qset().findIndex(x=>x.id===q.id);
 const total=qset().length||1;
 const variantBtn=(q.level==="Calculation"||!!q.roll)?`<div class="av-variant-bar">
   <button type="button" id="avRandomize" class="av-light">🎲 Practice New Numbers</button>
   ${q.isCustomVariant?`<button type="button" id="avResetVariant" class="av-light">↺ Restore Canonical Question</button>`:""}
  </div>`:"";
 return `<div class="av-question av-active-banner">
  <div class="av-q-head"><span>ACTIVE QUESTION ${(idx>=0?idx+1:currentIndex+1)} / ${total} · ${esc(q.id.toUpperCase())} · ${esc(q.level.toUpperCase())}${q.isCustomVariant?" · CUSTOM NUMBERS":""}</span>${variantBtn}</div>
  <p>${esc(q.question)}</p>
 </div>`;
}

function unitTable(title,rows,showQtySymbol){
 const symCell=s=>{
  const str=String(s||"");
  const idx=str.indexOf("_");
  if(idx>0){
   return '<i class="av-qty-sym">'+esc(str.slice(0,idx))+'<sub>'+esc(str.slice(idx+1))+'</sub></i>';
  }
  return '<i class="av-qty-sym">'+esc(str)+'</i>';
 };
 if(showQtySymbol){
  return '<section class="av-si-table"><h4>'+esc(title)+'</h4><div class="av-table-scroll"><table class="av-vocab"><thead><tr><th>Quantity</th><th>Symbol (Italic)</th><th>SI Unit</th><th>Unit Symbol (Upright)</th></tr></thead><tbody>'+
  rows.map(r=>'<tr><td>'+esc(r[0])+'</td><td>'+symCell(r[3]||"")+'</td><td>'+esc(r[1])+'</td><td><strong class="av-unit-sym">'+esc(r[2])+'</strong></td></tr>').join("")+
  '</tbody></table></div></section>';
 }
 return '<section class="av-si-table"><h4>'+esc(title)+'</h4><div class="av-table-scroll"><table class="av-vocab"><thead><tr><th>Quantity</th><th>SI Unit</th><th>Unit Symbol</th></tr></thead><tbody>'+
 rows.map(r=>'<tr><td>'+esc(r[0])+'</td><td>'+esc(r[1])+'</td><td><strong class="av-unit-sym">'+esc(r[2])+'</strong></td></tr>').join("")+
 '</tbody></table></div></section>';
}
function siChapterPanel(){
 if(!SI)return "";
 return '<section class="av-si-chapter" aria-label="SI base units and derived units from Chapter 1">'+
 '<div class="av-chapter-tag">TEXTBOOK-ALIGNED · CHAPTER 1 · BASE AND DERIVED UNITS</div>'+
 '<h3>Base and Derived Units (Floyd &amp; Buchla, Tables 1–1 to 1–4)</h3>'+
 '<p>The SI system is based on <strong>seven base units</strong> (fundamental units, Table 1–1) and <strong>two supplementary units</strong> (Table 1–2). The base electrical unit, the <strong>ampere (A)</strong>, is the unit for electrical current (<i>I</i>, for intensity) and is unique in that it uses the base unit of time (<strong>second, s</strong>) in its definition. All other electrical and magnetic units use combinations of base units and are called <strong>derived units</strong>.</p>'+
 unitTable("Table 1–1 · SI base units",SI.base,false)+
 '<div class="av-si-highlight"><strong>Only one SI base unit is an electrical unit:</strong> the ampere (<strong class="av-unit-sym">A</strong>) for electric current (<i>I</i>). All other electrical and magnetic units—such as the volt (<strong class="av-unit-sym">V</strong>), ohm (<strong class="av-unit-sym">Ω</strong>), watt (<strong class="av-unit-sym">W</strong>), coulomb (<strong class="av-unit-sym">C</strong>), and farad (<strong class="av-unit-sym">F</strong>)—are <strong>derived units</strong> built from combinations of base units.</div>'+
 unitTable("Table 1–3 · Electrical quantities and derived units with SI symbols",SI.derived,true)+
 unitTable("Table 1–4 · Magnetic quantities and derived units with SI symbols",SI.magnetic,true)+
 '<p class="av-si-note">'+esc(SI.gaussNote)+'</p>'+
 '<div class="av-math"><div class="av-math-label">EXAMPLE · VOLT EXPRESSED IN SI UNITS</div><div class="av-math-scroll">'+SI.formulaMathml+'</div><div class="av-math-scroll">'+SI.baseFormulaMathml+'</div><p class="av-meaning">Two equivalent equations are separated to avoid an overly wide mathematical expression.</p></div>'+
 '<h4>How this textbook labels supplementary units</h4>'+
 unitTable("Table 1–2 · Historical SI supplementary units",SI.historical,false)+
 '<p class="av-si-note">'+esc(SI.note)+'</p>'+
 '<p class="av-si-note">'+esc(SI.mksNote)+'</p>'+
 '<h4>Quantity symbols versus unit symbols (Italic vs. Upright Roman)</h4>'+
 '<p>'+esc(SI.styleNote)+'</p>'+
 '<div class="av-math"><div class="av-math-label">ITALIC QUANTITY VS UPRIGHT UNIT SYMBOL</div><div class="av-math-scroll">'+SI.symbolMathml+'</div><p class="av-symbol-example">'+esc(SI.symbolNote)+'</p></div>'+
 '<div class="av-si-sources"><strong>Reference scope</strong><p>'+esc(SI.sourceScope)+'</p>'+
 '<p>'+SI.links.map(a=>'<a target="_blank" rel="noopener noreferrer" href="'+esc(a[1])+'">'+esc(a[0])+'</a>').join(" · ")+'</p></div></section>';
}

function textbookPanel(t){
 if(!BOOK)return "";
 const matched=BOOK.chapters.filter(c=>c.topics.includes(t.id));
 return '<details class="av-chapter-map"><summary>Floyd &amp; Buchla chapter cross-reference ('+matched.length+' matching headings)</summary>'+
 '<p><strong>'+esc(BOOK.title)+'</strong> — '+esc(BOOK.authors)+'</p>'+
 '<p>'+esc(BOOK.evidence)+'</p>'+
 '<p><a class="av-book-source-link" href="'+esc(BOOK.bookUrl)+'" target="_blank" rel="noopener noreferrer">Open this book in VitalSource ↗</a></p>'+
 (matched.length?'<p><strong>Related sections by chapter title:</strong> '+matched.map(c=>'Ch. '+c.number+' '+esc(c.title)).join(' · ')+'</p>':
 '<p>Applied avionics skills not explicitly titled as a chapter of this foundational circuit textbook.</p>')+
 '<details><summary>View all 21 chapter names and starting pages</summary><ol>'+
 BOOK.chapters.map(c=>'<li>Ch. '+c.number+': '+esc(c.title)+' (p. '+c.startPage+')</li>').join('')+
 '</ol></details></details>';
}

function courseworkBridge(t){
 const item=COURSE[t.id];
 if(!item)return "";
 return '<details class="av-course-bridge"><summary>Connect this topic to your coursework <span class="av-course-scope">'+esc(item.scope)+'</span></summary>'+
  '<div class="av-course-grid"><section><h4>Coursework connection</h4><p>'+esc(item.source)+'</p><p>'+esc(item.bridge)+'</p></section>'+
  '<section class="av-course-lab"><h4>Carry it into the lab</h4><p>'+esc(item.lab)+'</p></section></div>'+
  '<p class="av-course-note">This is a fresh concept summary based on your notes and lab work. It does not reproduce the assignment pages or their figures.</p></details>';
}

function digitalLogicPanel(t){
 if(t.id!=="components")return "";
 return '<details class="av-course-bridge av-digital-logic"><summary>Digital logic: truth table to verified gate circuit <span class="av-course-scope">Tech 63 bridge</span></summary>'+
  '<p class="av-digital-lede">For <i>n</i> binary inputs, enumerate all <code>2<sup>n</sup></code> combinations before simplifying. The truth table is the reference for both the Boolean expression and the simulated or physical circuit.</p>'+
  '<ol class="av-logic-flow"><li>List every input pattern in binary order.</li><li>Mark the output rows that must be HIGH (SOP) or LOW (POS).</li><li>Simplify with Karnaugh-map groups of adjacent 1s or 0s sized as powers of two; edge cells wrap, diagonal cells do not touch.</li><li>Draw the required gates and verify all rows, including boundary and polarity cases.</li></ol>'+
  '<div class="av-course-grid"><section><h4>Small combinational building blocks</h4><p>Half adder: <code>SUM = A XOR B</code>, <code>CARRY = A AND B</code>. A full adder adds <code>C_in</code>; a decoder selects an output line; a comparator reports less/equal/greater; a multiplexer routes the selected data input.</p></section><section class="av-course-lab"><h4>Bench check</h4><p>Use current-limited logic levels, keep every input defined, probe the output relative to the correct ground, and compare measured HIGH/LOW voltages with the receiving device’s VIH/VIL limits.</p></section></div></details>';
}

function lessonPage(q,t,f){
 const item=f.deep,guide=LESSONS[t.id]||{lead:t.goal,analogy:"",example:"",terms:[]};
 const lesson=q.lesson||null;
 const glossary=lesson&&lesson.vocab?lesson.vocab:item?item.words:guide.terms;
 const summary=lesson?lesson.summary:item?item.plain:f.definition;
 const illustration=VIS?VIS.render(q,t,inlineVisualMode):"";
 const formulaSrc=q.formula||(item&&item.formula)||null;
 const subSrc=q.sub||(item&&item.sub)||"";
 return '<section class="av-page" aria-label="Understand the concept">'+
 '<div class="av-eyebrow">PAGE 1 / 4 · UNDERSTAND THE QUESTION &amp; CIRCUIT</div>'+
 '<h3>Start here: '+esc(f.label)+'</h3>'+
 activeBanner(q,t)+
 '<div class="av-learning-stage">Learning step '+esc(String(q.difficulty||1))+' / '+TOPIC_TOTAL+' · '+esc(q.learningObjective||q.level)+' <small>Foundations → Lab applications → Calculations → Fault diagnosis</small></div>'+ 
 '<div class="av-lede"><strong>In very simple words (Zero prior EE assumed)</strong><p>'+rich(summary)+'</p></div>'+
 '<div class="av-two-up"><section><h4>Words you need first</h4><table class="av-vocab"><thead><tr><th>Word</th><th>Meaning</th></tr></thead><tbody>'+
 glossary.map(p=>'<tr><th scope="row">'+esc(p[0])+'</th><td>'+rich(p[1])+'</td></tr>').join("")+
 '</tbody></table></section><section class="av-analogy"><h4>Picture it in everyday life</h4><p>'+rich(lesson?(guide.analogy||lesson.why):item?item.analogy:guide.analogy)+'</p><h4>Why Muon Space engineers care</h4><p>'+rich(lesson?lesson.why:item?item.why:f.why)+'</p></section></div>'+
 (f.label==="SI base unit"?siChapterPanel():"")+
 textbookPanel(t)+
 courseworkBridge(t)+
 digitalLogicPanel(t)+
 (NOTEBOOK?NOTEBOOK.render(t.id):"")+
 (VIDEO?VIDEO.render(q,t):"")+
 '<h4 class="av-figure-heading">Interactive circuit, graph &amp; '+(VIS&&VIS.describe(q,t).board?'breadboard':'test fixture')+' wiring for '+esc(q.id.toUpperCase())+'</h4>'+
 visualSwitcherBar(inlineVisualMode)+illustration+
 (inlineVisualMode==="wiring"
  ?'<div class="av-sim-host" data-sim-page="learn"></div>'
  :'<div class="av-sim-compact-strip"><span>Open <strong>3. Board &amp; Breadboard</strong> to run the interactive multimeter bench, live scope &amp; Online CircuitJS1 for <strong>'+esc(q.id.toUpperCase())+'</strong>.</span><button type="button" class="av-vis-pill" data-vismode="wiring">⚡ Open Live Simulator</button></div>')+
 '<div class="av-actions-bottom"><button id="avGoVisual" class="av-light">See all 3 large visuals stacked →</button><button id="avGoWork" class="av-primary">See all 6 baby steps + worked MathML →</button></div>'+
 (formulaSrc?equation(formulaSrc,"1. ENGINEERING EQUATION (MATHML)"):"")+
 (subSrc?equation(subSrc,"2. WORKED EXAMPLE / SUBSTITUTION (ENGINEERING NOTATION)"):"")+
 '<div class="av-worked-mini"><strong>Worked evidence / expected result</strong><p>'+rich(lesson?lesson.example:item?item.example:guide.example)+'</p></div>'+
 '<div class="av-takeaway"><strong>Remember this:</strong> '+rich(lesson?(q.steps[q.steps.length-1]||lesson.why):item?item.recap:guide.lead)+'</div>'+
 '</section>';
}

function visualPage(q,t,f){
 const info=VIS?VIS.describe(q,t):null;
 const pics=[
  ["schematic","01 · Full Circuit Schematic (Textbook & Current Loop)","Trace conventional current from (+) through every component back to (−) and locate the unknown quantity."],
  ["concept","02 · Question-Specific Graph / Waveform","Inspect the I-V operating point, transient exponential curve, frequency cutoff, or 4-channel oscilloscope trace."],
  ["wiring","03 · "+(info?info.wiring:"3-Panel Board, Solderless Breadboard & Circuit Symbols"),"Compare the active question’s source and probe ports, revised breadboard rows and component connections, and matched equivalent schematic. Advanced systems use conceptual benches, not verified physical pinouts."]
 ];
 return '<section class="av-page av-visual-page" aria-label="Question-specific visual laboratory">'+
 '<div class="av-eyebrow">PAGE 2 / 4 · SEE THE FULL CIRCUIT, GRAPH &amp; BOARD WIRING</div>'+
 '<h3>Draw it first. Then connect it safely.</h3>'+
 activeBanner(q,t)+
 '<p class="av-explain">Every diagram below is tailored specifically to <strong>'+esc(q.id.toUpperCase())+'</strong>. The selected board pins, component mix, breadboard holes, and schematic topology follow this question’s circuit setup.</p>'+
 '<div class="av-visual-nav">'+pics.map(x=>'<a href="#avVisual-'+x[0]+'">'+esc(x[1])+'</a>').join("")+'</div>'+
 pics.map(x=>'<section class="av-visual-panel" id="avVisual-'+x[0]+'"><div class="av-visual-panel-head"><div><h4>'+esc(x[1])+'</h4><p>'+esc(x[2])+'</p></div><button class="av-light" data-zoom="'+x[0]+'" aria-label="Enlarge '+esc(x[1])+'">↗ Enlarge</button></div>'+
 (VIS?VIS.render(q,t,x[0]):'<p>Visuals are unavailable.</p>')+
 (x[0]==="wiring"&&CIRCUITSIM?CIRCUITSIM.render(q,t):"")+'</section>').join("")+
 '<section class="av-sim-section" id="avVisual-sim"><div class="av-sim-host" data-sim-page="visual"></div></section>'+
 '<div class="av-takeaway"><strong>Before continuing:</strong> '+((info&&info.board)?'Trace the source and return path, which breadboard row holes share a net, and exactly where the selected probe belongs.':'Trace the test signal, reference and return paths. Fixture grid labels are logical signal references, NOT electrically connected breadboard holes or verified device pins.')+'</div>'+
 '<div class="av-actions-bottom"><button id="avVisualBack" class="av-light">← Review the idea</button><button id="avVisualForward" class="av-primary">Now solve it in 6 baby steps →</button></div></section>';
}

function inlineStepVisual(q,t,step){
 if(!VIS)return "";
 const topicGraph=/^(ac|rc|capacitors|inductors|filters|timing|rf|power-rails)$/.test(t.id);
 let secondary=null;
 if(q.level==="Troubleshooting" && step>=2)secondary="wiring";
 else if(topicGraph && step>=3)secondary="concept";
 const activeMode=(inlineVisualMode==="wiring"||inlineVisualMode==="concept")?inlineVisualMode:"schematic";
 return '<div class="av-solution-circuit"><h4>Follow the circuit, graph &amp; breadboard connection while reading this step</h4>'+
 visualSwitcherBar(activeMode)+
 VIS.render(q,t,activeMode)+
 (secondary?'<details class="av-step-extra"><summary>'+(secondary==="concept"?"Show the response graph":"Show the 3-panel board &amp; breadboard setup")+'</summary>'+VIS.render(q,t,secondary)+'</details>':"")+
 '<button id="avStepVisual" class="av-light" type="button">Open all three large visual views ↗</button></div>'+
 (activeMode==="wiring"
  ?'<div class="av-sim-host" data-sim-page="work"></div>'
  :'<div class="av-sim-compact-strip"><span>Switch to <strong>3. Board &amp; Breadboard</strong> to interact with the live DMM, scope &amp; Online CircuitJS1 for <strong>'+esc(q.id.toUpperCase())+'</strong>.</span><button type="button" class="av-vis-pill" data-vismode="wiring">⚡ Open Live Simulator</button></div>');
}

function solvePage(q,t,f){
 const steps=stepsFor(q,t,f),step=steps[stepIndex]||steps[0];
 return '<section class="av-page" aria-label="Guided worked answer">'+
 '<div class="av-eyebrow">PAGE 3 / 4 · BABY-STEP WORKED SOLUTION (MATHML ENGINEERING NOTATION)</div>'+
 '<h3>Every step explained from zero — with equations &amp; visuals</h3>'+
 '<p class="av-explain">Step through one card at a time above, or read the complete 6-step walkthrough already expanded directly below.</p>'+
 activeBanner(q,t)+
 inlineStepVisual(q,t,stepIndex)+
 '<div class="av-step-counter"><strong>Step '+(stepIndex+1)+' of '+steps.length+'</strong><span>'+esc(step.title)+'</span></div>'+
 '<div class="av-steps-rail">'+steps.map((s,i)=>'<span class="'+(i===stepIndex?"here":i<stepIndex?"passed":"")+'" title="'+esc(s.title)+'"></span>').join("")+'</div>'+
 '<article class="av-baby-step"><span class="av-step-icon">'+(stepIndex+1)+'</span>'+
 '<div><h4>'+esc(step.title)+'</h4><p>'+rich(step.body)+'</p>'+
 (step.kind==="given"?'<div class="av-given"><strong>Problem statement:</strong> '+esc(q.question)+'</div>':"")+
 (step.formula?equation(step.formula,step.kind==="given"?"UNIT PREFIX CONVERSION":stepIndex===2?"ENGINEERING EQUATION (MATHML)":"NUMBER SUBSTITUTION (MATHML)"):"")+
 (step.answer?'<div class="av-final-value">Final Answer: '+esc(step.answer)+(step.engHtml?' <span class="av-eng-badge">Engineering Notation: '+step.engHtml+'</span>':"")+'</div>':"")+
 '</div></article>'+
 '<div class="av-control-row"><button id="avStepBack" class="av-light" '+(stepIndex===0?"disabled":"")+'>← Previous step</button>'+
 (stepIndex<steps.length-1?'<button id="avStepNext" class="av-primary">Next baby step →</button>':'<button id="avGoTry" class="av-primary">I have read the steps — try it yourself →</button>')+'</div>'+
 '<details class="av-all-steps" open><summary>Complete '+steps.length+'-Step Guided Walkthrough (All steps &amp; MathML equations)</summary><div class="av-all-list">'+
 steps.map((s,i)=>'<div class="'+(i===stepIndex?"av-step-highlight":"")+'"><b>Step '+(i+1)+': '+esc(s.title)+'</b><p>'+rich(s.body)+'</p>'+(s.formula?equation(s.formula,"EQUATION (MATHML)"):"")+(s.answer?'<div class="av-final-value">Final Answer: '+esc(s.answer)+(s.engHtml?' · Engineering Notation: '+s.engHtml:"")+'</div>':"")+'</div>').join("")+
 '</div></details>'+
 '<div class="av-takeaway"><strong>How to say this in your Muon Space interview:</strong> First state the physical law, describe how you set up the DMM/scope/breadboard, then explain the safety check and Go/No-Go limit.</div>'+
 '</section>';
}

function gradeView(assessment){
 if(!assessment)return "";
 const status=assessment.band==="likely-correct"?"good":assessment.band==="partial"?"partial":"review";
 const score=Number.isFinite(assessment.score)?'<span class="av-score">'+assessment.score+" / "+assessment.max+" key ideas</span>":"";
 return '<section class="av-assessment av-assessment-'+status+'" aria-label="Your answer feedback">'+
 '<div class="av-assessment-heading"><strong>'+esc(assessment.title||"Answer feedback")+'</strong>'+score+'</div>'+
 (assessment.note?'<p>'+rich(assessment.note)+'</p>':"")+
 ((assessment.met||[]).length?'<div class="av-assess-list"><strong>Ideas recognized</strong><ul>'+assessment.met.map(x=>'<li>'+esc(x.label)+'</li>').join("")+'</ul></div>':"")+
 ((assessment.missing||[]).length?'<div class="av-assess-list"><strong>How to improve your answer</strong><ul>'+assessment.missing.map(x=>'<li><b>'+esc(x.label)+':</b> '+rich(x.hint)+'</li>').join("")+'</ul></div>':"")+
 ((assessment.corrections||[]).length?'<div class="av-assess-list"><strong>Specific correction</strong><ul>'+assessment.corrections.map(x=>'<li>'+rich(x)+'</li>').join("")+'</ul></div>':"")+
 '<p class="av-assess-warning">Automated rubric feedback checks your answer against key engineering concepts. Review the worked reference and retry anytime.</p></section>';
}

function practicePage(q,t,f){
 const result=(q.expected!==undefined)?'The exact result is '+fmt(q.expected)+' '+q.unit+'.':(f.deep?f.deep.recap:q.steps.join(" "));
 return '<section class="av-page" aria-label="Practice without the answer">'+
 '<div class="av-eyebrow">PAGE 4 / 4 · TRY IT YOURSELF</div>'+
 '<h3>Your turn — test yourself without peeking</h3>'+
 '<p class="av-explain">Type a calculated number (scientific notation like 2.5e-3 or unit conversion like 0.01 A is accepted!) or explain the concept in your own words.</p>'+
 activeBanner(q,t)+
 (q.expected!==undefined?'<form id="avTryNumber" class="av-try-form"><label for="avValue">Enter your calculated answer</label><div class="av-input-row"><input id="avValue" type="text" inputmode="decimal" autocomplete="off" placeholder="Example: 10 or 0.01 A or 2.5e-3" value="'+esc(currentAnswer)+'" aria-describedby="avRequestedUnit"><span id="avRequestedUnit">'+esc(q.unit)+'</span><button class="av-primary" type="submit">Check answer</button></div></form>':
 '<label class="av-try-label" for="avExplain">Write your explanation in your own words</label><textarea id="avExplain" rows="4" placeholder="I think this means... because... On a Muon Space test bench I would verify it by...">'+esc(draftText)+'</textarea>'+
 '<div class="av-actions-bottom"><button id="avCheckExplanation" class="av-primary" type="button">Check my written answer</button><button id="avCompare" class="av-light">Show reference example</button></div>')+
 '<div id="avFeedback" role="status" aria-live="polite">'+(feedback?feedback:gradeView(state.assessments[progressKey(q)]))+'</div>'+
 '<details id="avReference" class="av-reference" '+(expanded?"open":"")+'><summary>Show the worked reference answer (MathML)</summary><p>'+rich(result)+'</p>'+
 (q.expected!==undefined?'<p class="av-ref-eng">Engineering notation: '+engVal(q.expected,q.unit)+'</p>':"")+
 (q.formula?equation(q.formula,"FORMULA (MATHML)")+(q.sub?equation(q.sub,"SUBSTITUTION (MATHML)"):""):"")+
 '</details>'+
 '<div class="av-self-check"><h4>Learning progress</h4><p>First check your answer. A correct check unlocks the “I can explain it ✓” mastery badge saved on your device.</p>'+
 '<div class="av-control-row"><button id="avNeedReview" class="av-light">I need more practice</button><button id="avUnderstand" class="av-good" '+((state.assessments[progressKey(q)]||{}).band!=="likely-correct"||answerDirty?'disabled title="Check and correct your answer first"':'')+'>I can explain it ✓</button></div></div>'+
 '<div class="av-actions-bottom"><button id="avBackLesson" class="av-light">← Review Page 1 (Understand)</button><button id="avNextQuestion" class="av-primary">Next question →</button></div>'+
 '</section>';
}

function show(){
 if(!host)return;
 const t=topicOf(),all=qset();if(currentIndex>=all.length)currentIndex=0;
 const q=activeQuestion(),f=q?focus(q,t):null;
 const allKnown=QUESTIONS.filter(p=>state.ratings[p.id]==="know").length;
 const count=cnt(t.id);
 const full30=allTopicQuestions();

 host.innerHTML='<div class="av-tutor">'+
 '<header class="av-hero"><div><span class="av-eyebrow">MUON SPACE AVIONICS TEST READINESS · ZERO TO BENCH FLUENCY</span><h2>Understand it. See it. Solve it in baby steps.</h2>'+
 '<p>23 electrical engineering topics × 50 progressively harder questions = 1,150 guided exercises. Practice foundational concepts, circuit building, calculations and fault diagnosis with verified STM32 connector references and two independent video-learning sources.</p></div>'+
 '<div class="av-hero-stats"><strong>'+allKnown+' / '+QUESTIONS.length+'</strong><small>questions mastered</small></div></header>'+
 '<div class="av-tutor-layout"><aside class="av-guide-menu"><div class="av-guide-label">YOUR LEARNING PATH</div>'+
 '<label class="av-selector-label" for="avTopicList">Select a topic (23 topics)</label><select id="avTopicList">'+TOPICS.map((x,i)=>'<option value="'+esc(x.id)+'" '+(x.id===topic?"selected":"")+'>Topic '+(i+1)+': '+esc(x.title)+'</option>').join("")+'</select>'+
 '<div class="av-topic-progress"><strong>'+count+' / '+TOPIC_TOTAL+'</strong> mastered in this topic<div><span style="width:'+(100*count/TOPIC_TOTAL)+'%"></span></div></div>'+
 '<div class="av-guide-label">QUESTION TYPE</div><select id="avLevelList">'+["All","Foundations","Application","Calculation","Troubleshooting"].map(x=>'<option value="'+x+'" '+(x===filter?"selected":"")+'>'+x+'</option>').join("")+'</select>'+
 '<label class="av-selector-label" for="avQuestionSearch">Search questions</label><input id="avQuestionSearch" type="search" placeholder="Voltage, ripple, UART..." value="'+esc(query)+'">'+
 '<div class="av-how"><strong>How this workbook works</strong><ol><li>Study questions 1 through 50 in increasing difficulty, starting from zero EE knowledge.</li><li>Inspect its custom circuit, complete Nucleo/breadboard or virtual test fixture.</li><li>Follow every baby step, full substitutions and independent engineering checks.</li><li>Check your own answer.</li></ol></div>'+
 '<button class="av-light av-export" id="avExportLearning">Export my saved progress</button></aside>'+
 '<div class="av-workbook"><div class="av-workbook-heading"><div><span class="av-eyebrow">'+esc(t.group.toUpperCase())+' · TOPIC '+(TOPICS.indexOf(t)+1)+' OF '+TOPICS.length+'</span>'+
 '<h2>'+esc(t.title)+'</h2><p>'+rich(LESSONS[t.id]?.lead||t.goal)+'</p></div></div>'+
 '<div class="av-question-controls"><strong>QUESTION '+(all.length?currentIndex+1:0)+' / '+all.length+'</strong>'+
 '<div><button id="avQuestionPrevious" class="av-light" '+(currentIndex<=0?"disabled":"")+'>← Previous</button><button id="avQuestionNext" class="av-light" '+(currentIndex>=all.length-1?"disabled":"")+'>Next →</button></div></div>'+
 '<div class="av-quick-strip" aria-label="Quick question switcher 1 to 50">'+
  '<div class="av-quick-head"><span>Build your skills in order (1–50):</span><small>1–5 Basics · 6–10 Lab · 11–20 Math · 21–30 Debug · 31–50 Advanced avionics</small></div>'+
  '<div class="av-number-grid">'+full30.map((p,i)=>'<button type="button" data-quick-qid="'+esc(p.id)+'" class="'+(q&&q.id===p.id?"active ":"")+(state.ratings[p.id]==="know"?"done":state.ratings[p.id]==="again"?"retry":"")+'" title="Q'+(i+1)+' ('+esc(p.level)+'): '+esc(p.question)+'">'+(i+1)+'</button>').join("")+'</div>'+
 '</div>'+
 (q?'<div class="av-page-tabs" role="tablist" aria-label="Four-page visual guided workbook">'+
 [["learn","1 · Understand"],["visual","2 · Visuals"],["work","3 · Baby steps"],["try","4 · Try it"]].map(x=>'<button role="tab" aria-selected="'+(page===x[0]?"true":"false")+'" data-page="'+x[0]+'" class="'+(page===x[0]?"active":"")+'">'+x[1]+'</button>').join("")+'</div>'+
 (page==="learn"?lessonPage(q,t,f):page==="visual"?visualPage(q,t,f):page==="work"?solvePage(q,t,f):practicePage(q,t,f)):
 '<div class="av-no-result"><h3>No questions match this filter</h3><p>Clear the search or select another question type.</p></div>')+
 '<details class="av-browse-questions" open><summary>Browse all '+full30.length+' actual questions in this topic — click any card to load it above</summary>'+
 '<p class="av-browse-help">Every card below loads a unique question with its own MathML engineering equations, fully worked baby steps, schematic, graph, and 3-panel board/breadboard wiring.</p>'+
 '<div class="av-question-gallery" role="group" aria-label="All 50 practice question titles">'+
 full30.map((p,i)=>'<button data-qid="'+esc(p.id)+'" class="av-browse-card '+(q&&q.id===p.id?"active ":"")+(state.ratings[p.id]==="know"?"done":state.ratings[p.id]==="again"?"retry":"")+'" aria-current="'+(q&&q.id===p.id?"true":"false")+'" aria-label="Open question '+(i+1)+': '+esc(p.question)+'">'+
 '<span class="av-browse-meta"><b>Q'+(i+1)+'</b><em>'+esc(p.level)+'</em></span><span class="av-browse-title">'+esc(p.question)+'</span>'+
 '<small>'+(state.ratings[p.id]==="know"?"✓ Mastered":state.ratings[p.id]==="again"?"↻ Review needed":state.assessments[p.id]?"◈ Checked":"○ Open question")+'</small></button>').join("")+'</div>'+
 '<small class="av-browse-legend">Blue = selected · Green = mastered · Amber = review needed. Progress for the revised curriculum is saved locally; older mastery is archived in your exported progress record.</small></details>'+
 '<p class="av-footnote">All problems and visual schematics are original educational exercises aligned to Floyd &amp; Buchla and Muon Space avionics test engineering requirements.</p>'+
 '</div></div><dialog class="av-zoom-dialog" id="avVisualZoom" aria-label="Expanded circuit figure"><div class="av-zoom-top"><strong>Expanded engineering diagram</strong><button class="av-light" type="button" id="avZoomClose">Close ×</button></div><div id="avZoomBody"></div></dialog></div>';
 wire();
}

function switchPage(p){page=p;stepIndex=0;feedback="";expanded=false;show();find(".av-workbook",host)?.scrollIntoView({block:"start",behavior:"smooth"});}
function moveQuestion(n,keepPage=false){
 currentIndex=Math.max(0,Math.min(qset().length-1,n));
 if(!keepPage)page="learn";
 else if(page==="try")page="work";
 stepIndex=0;expanded=false;feedback="";
 const q=selected();
 draftText=q?(state.responses[progressKey(q)]||""):"";
 currentAnswer=draftText;answerDirty=false;
 state.lastTopic=topic;state.lastIndex=currentIndex;save();show();
 const heading=find(".av-workbook-heading h2",host);
 if(heading){heading.setAttribute("tabindex","-1");heading.focus({preventScroll:true});}
 find(".av-workbook",host)?.scrollIntoView({block:"start",behavior:"smooth"});
}
function rating(x){const q=selected();if(!q)return;if(x==="know"&&(answerDirty||!state.assessments[progressKey(q)]||state.assessments[progressKey(q)].band!=="likely-correct"))return;state.ratings[progressKey(q)]=x;save();if(currentIndex<qset().length-1)moveQuestion(currentIndex+1);else show();}

function wire(){
 if(CIRCUITSIM)CIRCUITSIM.bind(host,requestedTopic=>requestedTopic?topicOf():activeQuestion());
 if(NUCLEO)NUCLEO.bind(host,()=>activeQuestion());
 if(NOTEBOOK)NOTEBOOK.bind(host);
 const el=find("#avTopicList",host);
 if(el)el.onchange=e=>{topic=e.target.value;currentIndex=0;page="learn";stepIndex=0;filter="All";query="";state.lastTopic=topic;state.lastIndex=0;save();show()};
 const lev=find("#avLevelList",host);
 if(lev)lev.onchange=e=>{filter=e.target.value;currentIndex=0;page="learn";stepIndex=0;show()};
 const search=find("#avQuestionSearch",host);
 if(search)search.onchange=e=>{query=e.target.value.toLowerCase().trim();currentIndex=0;page="learn";stepIndex=0;show()};
 const ex=find("#avExportLearning",host);
 if(ex)ex.onclick=()=>{
  const b=new Blob([JSON.stringify({version:3,exportedAt:new Date().toISOString(),...state},null,2)],{type:"application/json"});
  const url=URL.createObjectURL(b),a=document.createElement("a");a.href=url;a.download="avionics-ee-progress.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
 };
 host.querySelectorAll("[data-page]").forEach(b=>b.onclick=()=>switchPage(b.dataset.page));
 host.querySelectorAll("[data-qid]").forEach(b=>b.onclick=()=>{
  const id=b.dataset.qid;filter="All";query="";
  const idx=allTopicQuestions().findIndex(x=>x.id===id);
  if(idx>=0)moveQuestion(idx,page==="visual"||page==="work");
 });
 host.querySelectorAll("[data-quick-qid]").forEach(b=>b.onclick=()=>{
  const id=b.dataset.quickQid;filter="All";query="";
  const idx=allTopicQuestions().findIndex(x=>x.id===id);
  if(idx>=0)moveQuestion(idx,page==="visual"||page==="work");
 });
 host.querySelectorAll("[data-vismode]").forEach(b=>b.onclick=()=>{
  inlineVisualMode=b.dataset.vismode;show();
 });
 const randBtn=find("#avRandomize",host);
 if(randBtn)randBtn.onclick=()=>{
  const q=selected();if(!q)return;
  const v=makeRandomVariant(q);
  if(v){customVariants[q.id]=v;currentAnswer="";draftText="";answerDirty=false;feedback="";delete state.assessments[progressKey(v)];delete state.ratings[progressKey(v)];delete state.responses[progressKey(v)];save();show();}
 };
 const resetVarBtn=find("#avResetVariant",host);
 if(resetVarBtn)resetVarBtn.onclick=()=>{
  const q=selected();if(!q)return;
  delete customVariants[q.id];currentAnswer="";draftText=state.responses[q.id]||"";answerDirty=false;feedback="";show();
 };
 const prev=find("#avQuestionPrevious",host),next=find("#avQuestionNext",host);
 if(prev)prev.onclick=()=>moveQuestion(currentIndex-1,page==="visual"||page==="work");
 if(next)next.onclick=()=>moveQuestion(currentIndex+1,page==="visual"||page==="work");
 const work=find("#avGoWork",host);if(work)work.onclick=()=>switchPage("work");
 const visual=find("#avGoVisual",host);if(visual)visual.onclick=()=>switchPage("visual");
 const visBack=find("#avVisualBack",host);if(visBack)visBack.onclick=()=>switchPage("learn");
 const visNext=find("#avVisualForward",host);if(visNext)visNext.onclick=()=>switchPage("work");
 host.querySelectorAll("[data-zoom]").forEach(b=>b.onclick=()=>{
  const q=selected(),t=topicOf(),dialog=find("#avVisualZoom",host),body=find("#avZoomBody",host);
  if(!q||!VIS||!dialog||!body)return;
  body.innerHTML=VIS.render(q,t,b.dataset.zoom)+(b.dataset.zoom==="wiring"?'<div class="av-sim-host" data-sim-page="zoom"></div>':"");
  if(b.dataset.zoom==="wiring"&&window.mountAvionicsSimulator)window.mountAvionicsSimulator(body,q,t);
  if(typeof dialog.showModal==="function")dialog.showModal();
 });
 const zoomClose=find("#avZoomClose",host);if(zoomClose)zoomClose.onclick=()=>find("#avVisualZoom",host)?.close();
 const zoomDialog=find("#avVisualZoom",host);if(zoomDialog)zoomDialog.onclick=e=>{if(e.target===zoomDialog)zoomDialog.close()};
 const stepBack=find("#avStepBack",host);if(stepBack)stepBack.onclick=()=>{stepIndex=Math.max(0,stepIndex-1);show()};
 const stepNext=find("#avStepNext",host);if(stepNext)stepNext.onclick=()=>{stepIndex++;show()};
 const goTry=find("#avGoTry",host);if(goTry)goTry.onclick=()=>switchPage("try");
 const stepVis=find("#avStepVisual",host);if(stepVis)stepVis.onclick=()=>switchPage("visual");
 const numberInput=find("#avValue",host);if(numberInput)numberInput.oninput=e=>{currentAnswer=e.target.value;answerDirty=true;const btn=find("#avUnderstand",host);if(btn)btn.disabled=true;const fb=find("#avFeedback",host);if(fb)fb.innerHTML='<p class="av-message">Answer changed. Recheck the calculation to update your result.</p>';};
 const tryNumber=find("#avTryNumber",host);
 if(tryNumber)tryNumber.onsubmit=e=>{
  e.preventDefault();const q=selected(),input=find("#avValue",host);
  currentAnswer=input.value.trim();state.responses[progressKey(q)]=currentAnswer;
  state.attempts[progressKey(q)]=(state.attempts[progressKey(q)]||0)+1;
  const result=ASSESS.gradeNumber(q,currentAnswer);
  state.assessments[progressKey(q)]=result;
  if(result.band!=="likely-correct"&&state.ratings[progressKey(q)]==="know")state.ratings[progressKey(q)]="again";
  save();answerDirty=false;feedback=gradeView(result);show();
 };
 const explain=find("#avExplain",host);
 if(explain)explain.oninput=e=>{draftText=e.target.value;answerDirty=true;const btn=find("#avUnderstand",host);if(btn)btn.disabled=true;const fb=find("#avFeedback",host);if(fb)fb.innerHTML='<p class="av-message">Answer changed. Check this revised answer to receive updated feedback.</p>';};
 const checkText=find("#avCheckExplanation",host);
 if(checkText)checkText.onclick=()=>{
  const q=selected(),t=topicOf();
  draftText=(find("#avExplain",host)?.value||"").trim();
  state.responses[progressKey(q)]=draftText;
  state.attempts[progressKey(q)]=(state.attempts[progressKey(q)]||0)+1;
  const result=ASSESS.gradeText(q,t,draftText);
  state.assessments[progressKey(q)]=result;
  if(result.band!=="likely-correct"&&state.ratings[progressKey(q)]==="know")state.ratings[progressKey(q)]="again";
  save();answerDirty=false;feedback=gradeView(result);show();
 };
 const compare=find("#avCompare",host);
 if(compare)compare.onclick=()=>{
  draftText=find("#avExplain",host)?.value||draftText;expanded=true;
  const ref=find("#avReference",host);if(ref)ref.open=true;
  const f=find("#avFeedback",host);
  if(f&&!state.assessments[selected().id])f.innerHTML='<div class="av-message">The reference is for comparison. Use Check my written answer to see your rubric feedback and missing ideas.</div>';
 };
 const under=find("#avUnderstand",host);if(under)under.onclick=()=>rating("know");
 const retry=find("#avNeedReview",host);if(retry)retry.onclick=()=>rating("again");
 const back=find("#avBackLesson",host);if(back)back.onclick=()=>switchPage("learn");
 const nxt=find("#avNextQuestion",host);if(nxt)nxt.onclick=()=>moveQuestion(currentIndex+1);
 if(window.mountAvionicsSimulator){
  const qNow=selected(),tNow=topicOf();
  if(qNow&&tNow)window.mountAvionicsSimulator(host,qNow,tNow);
 }
}

window.mountAvionicsPractice=function(el){
 if(!el||!ASSESS||TOPICS.length!==23||QUESTIONS.length!==690){if(el)el.textContent="The Avionics question bank did not load correctly.";return}
 host=el;el.dataset.avMounted="yes";const q=selected();if(q){draftText=state.responses[progressKey(q)]||"";currentAnswer=draftText;}show();
};
window.avionicsWorkbookV2={
 getQuestionCount:()=>QUESTIONS.length,
 getTopics:()=>TOPICS.length,
 stepsForQuestion:id=>{
  const q=QUESTIONS.find(x=>x.id===id);if(!q)return null;
  const t=TOPICS.find(x=>x.id===q.topic);return stepsFor(q,t,focus(q,t));
 }
};

/* Clean single-owner #avionics activation & legacy-mount override */
if(typeof window.location!=="undefined"&&window.location.hash==="#avionics"){
 const activate=()=>{
  const btn=document.querySelector('[data-mode="avionics"]');
  if(btn)btn.click();
  const root=document.getElementById("avionicsRoot");
  if(root&&!root.querySelector(".av-tutor"))window.mountAvionicsPractice(root);
 };
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",activate,{once:true});else activate();
}
})();
