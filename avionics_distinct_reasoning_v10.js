"use strict";
/* Last stage of distinct learning progression: 5 different foundation concepts,
 * 5 original application labs, 10 numerical operations, and 10 diagnostic tasks
 * with explicit case progression, without inventing a root cause. */
(function(){
const T=window.AVIONICS_TOPICS||[],Q=window.AVIONICS_QUESTIONS||[];
const unitQuestions=[
 ["Explain why the ampere is an SI base unit while the volt is a derived unit. Name the seven base units without treating every electrical unit as fundamental.","SI base unit versus derived unit"],
 ["A current reading is 25 mA. Explain what the lowercase m means, why the measured quantity is still current, and how it compares to 0.025 A.","Milli as a unit scale, not a measured physical variable"],
 ["A capacitor is labeled 47 µF while a capacitance meter uses farads. Explain what the micro prefix means and why both labels can represent one capacitance.","Micro and farad conversion"],
 ["The diagram labels a resistor 2 MΩ, not 2 kΩ or 2 GΩ. Explain the prefix distinction and why this matters when reporting resistance.","Mega versus kilo and giga"],
 ["A rail is measured near a specified upper limit. Explain measurement uncertainty and why a display's number of decimal digits does not guarantee accuracy.","Uncertainty versus display resolution"]
];
for(const t of T){
 for(let i=0;i<5;i++){
  const q=Q.find(q=>q.id===t.id+"-F"+(i+1));if(!q)throw Error("Missing foundation "+t.id);
  const [term,definition,why,example]=t.skills[i];
  q.question=t.id==="units"?unitQuestions[i][0]:[
    "Explain "+term+" accurately to a beginner: what does it mean, and what observable example illustrates it?",
    "Compare "+term+" with the closest alternative in this topic. When would an engineer use each, and what can go wrong if they are confused?",
    "Interpret a schematic, instrument reading or data sheet involving "+term+". Which two details must be identified to understand what is measured or calculated?",
    "Describe a concrete numerical or observed consequence of misapplying "+term+", including units or sign conventions.",
    "Describe one limitation or failure mode of "+term+". Which observation would demonstrate this limit?"
  ][i];
  q.learningObjective=t.id==="units"?unitQuestions[i][1]:["Define "+term,"Distinguish "+term,"Interpret "+term,"Apply "+term,"Test boundaries of "+term][i];
  q.auditSkill=q.learningObjective;
  q.hint="Use this exact source definition, then explain the measurement or physical consequence: "+definition;
  const neighbor=t.skills[(i+1)%5];
  const specificTaskAnswer=t.id==="units"?[
   "Plain check: identify the seven SI base quantities (A is current, the sole electrical base unit) and state why V, Ω, and W are derived from them.",
   "Scale vs physics: 25 mA = 25 × 10^(-3) A = 0.025 A; moving the prefix shifts only the multiplier while the physical electron flow rate stays unchanged.",
   "Micro conversion check: 47 µF = 47 × 10^(-6) F = 0.000047 F; both markings refer to identical capacitance across the part leads.",
   "Case & decade check: uppercase M (10^6, mega) exceeds kilo (10^3) by 1,000× and is 1,000× smaller than giga (10^9), so 2 MΩ = 2,000,000 Ω cleanly.",
   "Accuracy vs resolution check: extra trailing meter digits show finer display resolution, whereas calibration uncertainty defines the real error bar around a limit."
  ][i]:[
   "Plain definition summary: state '"+definition+"' cleanly in your own words and cite this physical example: "+example,
   "Comparison with "+neighbor[0]+": apply "+term+" ("+definition+") when evaluating "+why+" Contrast it directly against "+neighbor[0]+" ("+neighbor[1]+") so setup/units are never mixed.",
   "Schematic & instrument reading check: always verify (1) the physical unit/scale symbol associated with "+term+" and (2) the exact reference nodes or bench limits shown by "+example,
   "Concrete misapplication consequence: failing to account for "+term+" causes this error: "+why+" Double-check sign conventions and SI prefixes when executing "+example,
   "Boundary & falsification test: "+term+" breaks down when underlying assumptions fail ("+why+"). Test this limit directly by measuring: "+example
  ][i];
  q.steps=["Start with the chapter definition: "+definition,
   "Explain its engineering importance: "+why,
   "Ground the explanation in this actual example: "+example,
   specificTaskAnswer];
 }
 for(let i=0;i<5;i++){
  const raw=t.cases[i];
  const first=Q.find(q=>q.id===t.id+"-D"+(2*i+1));
  const second=Q.find(q=>q.id===t.id+"-D"+(2*i+2));
  if(!first||!second)throw Error("Missing diagnostic stages "+t.id+":"+i);
  const [symptom,action,reason,verify]=raw;
  first.question="Initial fault triage: "+symptom+" Identify ONE safe first check, a possible benign test-setup cause, and the observation that would justify proceeding.";
  first.steps=["Write down the observed fault without assuming the device is defective: "+symptom,
    "Before changing hardware, perform this safe initial check: "+action,
    "Explain what this isolates: "+reason,
    "Record this check and expected result before a second hypothesis: "+verify];
  first.learningObjective="Triage scenario "+(i+1);
  first.lesson={title:"First evidence: "+symptom,summary:"This stage tests a safe first-action decision, not just naming a component. "+action,
    example:verify,why:reason,vocab:[["Observation",symptom],["First check",action],["Reason",reason]]};
  second.question="Independent confirmation after triage: the initial inspection has been completed. Plan a CONTROLLED second test that distinguishes an instrumentation or setup explanation from a true hardware fault. Required independent evidence: "+verify;
  second.steps=["Begin from the completed first check; do not repeat the same initial question: "+action,
    "Form at least two hypotheses, including a setup error and physical defect: "+reason,
    "Collect independent evidence under controlled conditions: "+verify,
    "Report the conclusion as confirmed, unconfirmed or ambiguous; preserve "+symptom+" as the historical symptom."];
  second.learningObjective="Confirm scenario "+(i+1);
  second.lesson={title:"Second evidence: "+verify,summary:"The first test is already completed. This task requires a different experiment capable of ruling out a competing explanation. "+reason,
    example:verify,why:action,vocab:[["Completed initial check",action],["Competing explanation",reason],["Independent verification",verify]]};
  // An arbitrary skill formula does not by itself answer a fault-isolation question.
  for(const q of [first,second]){q.formula="";q.sub="";q.hint="Name a controlled measurement and the observation that would discriminate between two possible causes.";q.auditSkill=q.learningObjective+" / "+i;}
 }
}
const ids=new Set(),expectedCounts={Foundations:5,Application:5,Calculation:10,Troubleshooting:10};
for(const t of T){
 const q=Q.filter(x=>x.topic===t.id);
 if(q.length!==30||!q.every((x,i)=>x.difficulty===i+1))throw Error("Bad syllabus order "+t.id);
 for(const p of q){if(ids.has(p.id))throw Error("Repeated ID "+p.id);ids.add(p.id);}
 for(const [type,count] of Object.entries(expectedCounts))if(q.filter(x=>x.level===type).length!==count)throw Error("Bad question level "+t.id+" "+type);
}
window.AVIONICS_DISTINCT_CURRICULUM_VERSION=10;
})();