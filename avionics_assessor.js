"use strict";
/* Transparent offline formative assessor. No AI claims, no network, no hidden
   semantic inference: checks evidence against a source-aligned concept rubric.
   Conservative when prose is ambiguous. */
(function(){
const stop=new Set("a an the it is are of to in at from as by that this with for on into be how why each their if will should has have had was were same some when which what one two so or and can must about through after before under over than then not no only other where its use used using do does".split(" "));
const words=s=>String(s||"").toLowerCase().replace(/i²c|i2c/g,"i2c").replace(/µ/g,"u").replace(/[’']/g,"").replace(/[^a-z0-9]+/g," ").trim().split(/\s+/).filter(Boolean);
function stem(w){
 if(w.length>6&&w.endsWith("ations"))return w.slice(0,-6);
 if(w.length>5&&w.endsWith("ing"))return w.slice(0,-3);
 if(w.length>5&&w.endsWith("tion"))return w.slice(0,-3);
 if(w.length>5&&w.endsWith("ers"))return w.slice(0,-1);
 if(w.length>5&&w.endsWith("ed"))return w.slice(0,-2);
 if(w.length>4&&w.endsWith("s"))return w.slice(0,-1);
 return w;
}
const norm=s=>words(s).map(stem);
const matching=(txt,variants)=>variants.some(v=>{const r=norm(v);return r.every(t=>txt.includes(t))});
const item=(label,hint,sets)=>({label,hint,sets});
const definitions={
 "units:0":[
  item("Define what SI base unit means","A base unit is one of seven fundamental SI units, not simply any electrical measurement unit.",[["base","fundamental"],["seven","7","fundamental"]]),
  item("Identify the electrical SI base unit","The ampere (A) is the SI base unit for electric current.",[["ampere","amp","amps"],["current","electric current","charge flow"]]),
  item("Distinguish derived units","The volt (V) is a derived SI unit for potential difference; it is not an eighth base unit.",[["volt","voltage"],["derived"]])
 ],
 "units:1":[item("Define milli","Milli means one thousandth (10^-3).",[["milli","ma","milliamps"],["thousandth","0.001","1000","10 3"]]),
  item("Explain a conversion","Convert mA to A by dividing by 1000.",[["convert","divide","change","scale","ma"],["1000","0.001","ampere","amp"]]),
  item("Describe the consequence of a prefix error","Confusing mA with A creates a thousandfold current mistake.",[["current","reading","amp","unit","mistake","error"],["1000","thousand","factor","wrong","large"]])],
 "units:2":[item("Define micro","Micro means one millionth, 10^-6.",[["micro","uf","microfarad"],["millionth","0.000001","1000000","10 6"]]),
  item("Give a capacitor conversion","Convert µF to F by dividing by 1,000,000.",[["capacitor","capacitance","farad","uf","microfarad"],["convert","1000000","million","0.000001"]]),
  item("Connect to measurement","Capacitance must be reported using the correct units.",[["capacitor","capacitance","value","reading"],["unit","farad","label","measure","convert"]])],
 "units:3":[item("Define mega","Mega means a factor of one million, 10^6.",[["mega","megohm","mohm"],["million","1000000","10 6"]]),
  item("Use resistance units","An MΩ label describes millions of ohms.",[["resistance","resistor","ohm","mohm"],["million","1000000","mega"]]),
  item("Avoid scale errors","Distinguish large prefixes when entering calculations.",[["unit","prefix","convert","measurement"],["wrong","factor","calculation","error","scale","large"]])],
 "units:4":[item("Explain measurement uncertainty","Readings have limited accuracy and resolution.",[["reading","measurement","meter","instrument"],["accuracy","uncertainty","resolution","tolerance","precision"]]),
  item("Recognize a boundary result","Close-to-limit results need uncertainty consideration.",[["limit","threshold","boundary","pass","fail"],["uncertainty","calibration","margin","error"]]),
  item("Describe a confidence check","Use calibration or repeated reference measurements.",[["calibration","calibrate","repeat","reference","check"],["instrument","reading","meter","measure","known"]])],
 "ohm:0":[item("Define voltage","Voltage measures difference in electric potential between points.",[["voltage","volt","potential","electrical"],["difference","potential","between","relative","compare"]]),
  item("Name two points","A voltage measurement compares two nodes, often supply to ground.",[["node","point","rail","supply","wire","probe"],["ground","reference","return","two","between","black","red"]]),
  item("Explain how to measure","Use a voltmeter or DMM across the points.",[["dmm","voltmeter","meter","probe","measure"],["ground","red","black","point","node","rail"]])],
 "ohm:1":[item("Define current","Current is a rate of electric-charge flow.",[["current","amper","amp","charge"],["charge","flow","per second","rate","time"]]),
  item("Give the unit","Electric current is measured in amperes (A).",[["ampere","amp","amps","a"],["current","charge","flow"]]),
  item("Connect to a measurement","Measure or limit current to find excessive load or shorts.",[["measure","ammeter","shunt","limit","supply","monitor"],["current","load","short","rail","flow"]])],
 "ohm:2":[item("Define resistance","Resistance opposes current flow and is measured in ohms.",[["resistance","resistor","ohm"],["opposes","limit","restrict","reduce","current","flow"]]),
  item("Explain the effect","For fixed voltage, greater resistance gives less current.",[["resistance","resistor","ohm"],["current","flow","less","reduce","decrease","limit"]]),
  item("Describe safe measurement","Resistance is normally measured with the circuit unpowered.",[["measure","meter","dmm","resistance"],["power off","unpowered","deenergized","off","disconnect"]])],
 "ohm:3":[item("State Ohm's law","V = I × R; equivalently I = V/R.",[["voltage","volt","v"],["current","amp","i"],["resistance","ohm","r"]]),
  item("Explain the relationship","At constant resistance, increasing voltage increases current.",[["voltage","volt","v"],["current","amp","i"],["increase","change","proportion","depend","ratio"]]),
  item("Give a circuit application","Calculate current, voltage or resistance of one component.",[["calculate","find","measure","predict","compute"],["resistor","circuit","current","voltage","resistance"]])],
 "ohm:4":[item("Explain polarity","A reading depends on which probe or node is the positive reference.",[["polarity","positive","negative","probe"],["reference","red","black","reversed","direction"]]),
  item("Describe a signed reading","Swapping red and black probes changes the sign.",[["red","black","probe","lead"],["negative","positive","swap","reverse","minus","sign"]]),
  item("Give a measurement example","Compare a positive power rail against ground.",[["ground","return","reference","zero"],["volt","rail","probe","measure","red","black"]])]
};
const contradiction=[
 {test:/\bvolt(?:age)?\s+(?:is|are)\s+(?:an?\s+)?(?:si\s+)?base\s+unit\b/i,msg:"Correction: the volt is an SI derived unit; the ampere is an SI base unit."},
 {test:/\b(?:voltage|potential difference)\s+(?:is|means|equals)\s+(?:the\s+)?(?:flow|rate)\s+of\s+(?:electric\s+)?(?:charge|current)\b/i,msg:"Correction: voltage is potential difference, while current is charge flow per unit time."},
 {test:/\b(?:current|electric current)\s+(?:is|means|equals)\s+(?:electric\s+)?(?:potential difference|voltage)\b/i,msg:"Correction: current is charge flow per unit time, not potential difference."},
 {test:/\b(?:resistance)\s+(?:is|means|equals)\s+(?:electric\s+)?(?:potential difference|voltage)\b/i,msg:"Correction: resistance is not voltage; it relates voltage across a resistor to its current."}
];
function defaultCriteria(q,topic,skillIndex){
 const s=topic.skills[skillIndex]||topic.skills[0],definition=s[1]||"",reason=s[2]||"",test=s[3]||"";
 const anchored=[definition,reason,test];
 const hints=["Explain the underlying meaning: "+definition,"Explain why engineers care: "+reason,"Describe a concrete measurement or check: "+test];
 const title=["Core definition","Engineering consequence","Practical test or example"];
 return anchored.map((a,i)=>{
  const unique=[...new Set(norm(a).filter(w=>w.length>3&&!stop.has(w)&&!/^\d+$/.test(w)))];
  const anchors=unique.slice(0,Math.min(9,unique.length));
  return {label:title[i],hint:hints[i],sets:[anchors.length?anchors:["concept"]],requiredHits:Math.min(2,anchors.length)};
 });
}
function skillIndex(q,topic){
 const m=q.id.match(/-([FADC])(\d+)$/);
 if(!m)return 0;let i=Number(m[2])-1;
 if(m[1]==="D")return Math.floor(i/2);
 if(m[1]==="F"||m[1]==="A")return i;
 if(topic.id==="ohm")return 3;
 return Math.min(4,1+Math.floor(i/5));
}
function rubric(q,topic){
 const idx=skillIndex(q,topic),key=topic.id+":"+idx;
 const selected=definitions[key];
 if(q.level==="Troubleshooting"){
  const st=q.steps||[];
  return [
   item("Identify the reported problem","Start by describing the symptom rather than assuming the DUT failed.",[[...new Set(norm(q.question).filter(w=>w.length>5&&!stop.has(w)).slice(-10))]]),
   item("Describe a safe first check","Suggested check: "+(st[1]||"Inspect power and test setup."),[[...new Set(norm(st[1]||"inspect test setup").filter(w=>w.length>4&&!stop.has(w)).slice(0,9))]]),
   item("Propose confirming evidence","Verify using: "+(st[3]||st[2]||"a repeatable measurement."),[[...new Set(norm(st[3]||st[2]||"repeat measurement").filter(w=>w.length>4&&!stop.has(w)).slice(0,9))]])
  ].map(x=>({...x,requiredHits:2}));
 }
 if(q.level==="Application"&&q.lesson){
  const tokens=s=>[...new Set(norm(s).filter(w=>w.length>=4&&!stop.has(w)))].slice(0,11);
  return [
   item("State the expected physical result",q.steps[2], [tokens(q.steps[2])]),
   item("Explain the measurement or circuit method",q.steps[1],[tokens(q.steps[1])]),
   item("Describe independent verification / safety",q.steps[3],[tokens(q.steps[3])])
  ].map(x=>({...x,requiredHits:2}));
 }
 if(q.level==="Application"){
  const base=selected?selected.map(x=>({...x})):defaultCriteria(q,topic,idx);
  // Application questions require a way to demonstrate the idea.
  return base;
 }
 return selected?selected.map(x=>({...x})):defaultCriteria(q,topic,idx);
}
function checkCriterion(txt,c){
 if(c.requiredHits){
  const tokens=c.sets[0];return tokens.filter(t=>txt.includes(t)).length>=Math.min(c.requiredHits,tokens.length);
 }
 return c.sets.every(group=>group.some(term=>matching(txt,[term])));
}
function gradeText(q,topic,raw){
 const answer=String(raw||"").trim(),txt=norm(answer);
 const criteria=rubric(q,topic);
 const contradictionHits=contradiction.filter(x=>x.test.test(answer)).map(x=>x.msg);
 if(!answer||txt.length<2)return {band:"insufficient",title:"Not enough to assess",score:0,max:criteria.length,met:[],missing:criteria.map(c=>({label:c.label,hint:c.hint})),corrections:[],note:"Write at least one complete thought. You can use your own words."};
 const met=[],missing=[];
 criteria.forEach(c=>{(checkCriterion(txt,c)?met:missing).push({label:c.label,hint:c.hint})});
 let band;
 if(contradictionHits.length)band="needs-correction";
 else if(met.length===criteria.length&&txt.length>=10)band="likely-correct";
 else if(met.length>=1)band="partial";
 else band="needs-correction";
 return {band,title:band==="likely-correct"?"Likely correct":band==="partial"?"Partially correct":"Needs correction",score:met.length,max:criteria.length,met,missing,corrections:contradictionHits,note:"Rubric-based keyword feedback; it may miss good paraphrases or misunderstand meaning. Compare with the reference and check against your lesson. It is not an AI examiner."};
}
const numericUnits={
 A: {A:1,mA:0.001,uA:0.000001},
 mA:{A:1000,mA:1,uA:0.001},
 V:{V:1,mV:0.001},
 mV:{V:1000,mV:1},
 Ω:{"Ω":1,"kΩ":1000,"MΩ":1000000},
 "µC":{"µC":1,C:1000000},
 "µJ":{"µJ":1,J:1000000},
 ms:{ms:1,s:1000,us:0.001},
 ns:{ns:1,us:1000,ms:1000000},
 Hz:{Hz:1,kHz:1000,MHz:1000000},
 W:{W:1,mW:0.001},
 kW:{kW:1,W:0.001}
};
function gradeNumber(q,raw){
 const s=String(raw||"").trim().replace(/,/g,"").replace(/μ/g,"µ");
 const match=s.match(/^([-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)\s*([a-zA-ZµΩ%/]+)?$/i);
 if(!match)return {band:"insufficient",title:"Enter a number",note:"Example: 0.025 or 25 mA. Scientific notation such as 2.5e-2 is accepted."};
 const n=Number(match[1]),typedUnit=match[2]||q.unit, conversions=numericUnits[q.unit];
 if(!Number.isFinite(n))return {band:"insufficient",title:"Invalid number",note:"The number must be finite."};
 if(typedUnit!==q.unit&&(!conversions||conversions[typedUnit]===undefined))return {band:"needs-correction",title:"Unit mismatch",note:"The requested answer uses "+q.unit+". Convert your measurement to that unit first."};
 const measured=typedUnit===q.unit?n:n*conversions[typedUnit];
 const tolerance=Math.max(Math.abs(q.expected)*0.012,1e-10);
 const correct=Math.abs(measured-q.expected)<=tolerance;
 if(correct)return {band:"likely-correct",title:"Correct result",note:"The value and units match the worked calculation within rounding tolerance."};
 if(Math.abs(measured-q.expected)<=Math.abs(q.expected)*0.1)return {band:"partial",title:"Close — check your calculation",note:"You are within 10% of the expected result, but not within the rounding tolerance. Review significant digits, units, and arithmetic before retrying."};
 const ratio=Math.abs(measured)/Math.max(Math.abs(q.expected),1e-50);
 let hint="Recheck the given values, equation and numerical substitution, then try again.";
 if(ratio>950&&ratio<1050)hint="Your magnitude is about 1000 times too high. Check milli (10⁻³) versus the base unit.";
 if(ratio>0.00095&&ratio<0.00105)hint="Your magnitude is about 1000 times too low. Check milli (10⁻³) versus the base unit.";
 if(n===-q.expected)hint="The magnitude matches, but the polarity/sign differs. Recheck the sign convention.";
 return {band:"needs-correction",title:"Not yet",note:hint};
}
window.avionicsAnswerCheck={gradeText,gradeNumber,rubric,skillIndex};
})();