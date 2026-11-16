"use strict";
(function(){
/* Progressive integrated-circuit curriculum: question 1 definitions through
 * question 30 real multi-fault release decision. Original problems, not textbook extracts.
 * No direct wiring of the theoretical 9/12-V networks to STM32 GPIO. */
const T=window.AVIONICS_TOPICS||[], Q=window.AVIONICS_QUESTIONS||[];
const n=x=>Number(Number(x).toPrecision(9)), f=x=>String(Number(Number(x).toPrecision(6))), par=(a,b)=>a*b/(a+b);
const defaults={v:12,a:100,b:200,c:300,d:80,top:2000,bot:2000,load:2000,meter:1000000,measured:35,branch2:19,branch3:14,droop:10.8};
const goals={
 series:"Calculate resistance of one series chain",parallel:"Reduce two shared-node branches",parallel3:"Reduce three branch conductances",
 mixed3:"Combine an upstream resistor with two parallel loads",branches:"Combine series resistors within parallel branches",
 mixed4:"Reduce a four-component series-parallel network",sourceCurrent:"Calculate total current through series and parallel",
 parallelVoltage:"Find shared voltage across the parallel pair",branchCurrent:"Calculate one branch current from total network",
 loaded:"Solve a loaded voltage divider",power:"Calculate dissipation in one series component",
 kcl:"Reconcile total and branch meter currents",deviation:"Compare a mixed-network prediction with measured current",
 open:"Recalculate source current with an open branch",short:"Calculate the theoretical current with a shorted branch",
 miswire:"Analyze a wrongly connected resistor network",probe:"Predict voltage-divider meter loading",
 droop:"Trace a supply droop to branch current"};
function evaluate(kind,input){
 const x={...defaults,...input}; const {v,a,b,c,d,top,bot,load,meter,measured,branch2,branch3,droop}=x;
 const rp=par(b,c), rt=a+rp+d, is=v/rt, vp=is*rp;
 let question="",answer=0,unit="Ω",formula="",sub="",layout="mixed4",steps=[],note="";
 const set=(q,ans,u,eq,subs,arr,type,meaning)=>{
  question=q;answer=n(ans);unit=u;formula=eq;sub=subs;steps=arr;layout=type;note=meaning;
 };
 switch(kind){
 case "series":{
  const z=a+b+d;
  set("Three resistors "+a+" Ω, "+b+" Ω and "+d+" Ω share ONE current path. Determine total resistance.",z,"Ω","R_T = R_1 + R_2 + R_3",
  "R_T = "+a+" + "+b+" + "+d+" = "+f(z),
  ["Trace the only path from source to return.","There is no branch or node split.","Add "+a+" + "+b+" + "+d+" = "+f(z)+" Ω.","Check: series equivalent exceeds each part."],"series","Same current passes through all three resistors.");break;}
 case "parallel":{
  set("Resistors "+b+" Ω and "+c+" Ω connect between the SAME nodes A and B. Determine their parallel resistance.",rp,"Ω","R_P = (R_2 * R_3) / (R_2 + R_3)",
  "R_P = ("+b+" * "+c+") / ("+b+" + "+c+") = "+f(rp),
  ["Both branches share both node endpoints.","Multiply "+b+" by "+c+".","Divide by "+b+" + "+c+" to obtain "+f(rp)+" Ω.","Parallel equivalent must be below the smallest branch."],"parallel","Same voltage spans both branches; current splits.");break;}
 case "parallel3":{
  const z=1/(1/a+1/b+1/c);
  set("Three parallel branches of "+a+" Ω, "+b+" Ω and "+c+" Ω span identical nodes. Find equivalent resistance.",z,"Ω",
  "1 / R_P = 1 / R_1 + 1 / R_2 + 1 / R_3","R_P = 1 / (1/"+a+" + 1/"+b+" + 1/"+c+") = "+f(z),
  ["Verify three shared-node branches.","Add reciprocal resistances (conductances).","Invert the sum for "+f(z)+" Ω.","Check this is less than "+Math.min(a,b,c)+" Ω."],"parallel3","A third branch adds conductance.");break;}
 case "mixed3":{
  const z=a+rp;
  set("A "+a+" Ω resistor is IN SERIES with ("+b+" Ω || "+c+" Ω). Find the complete equivalent resistance.",z,"Ω",
  "R_T = R_1 + (R_2 * R_3) / (R_2 + R_3)","R_T = "+a+" + ("+b+" * "+c+") / ("+b+" + "+c+") = "+f(z),
  ["The current splits only at the two parallel branches.","Reduce the branch pair: "+f(rp)+" Ω.","Add series resistor "+a+" Ω: total "+f(z)+" Ω.","Avoid adding all three values."],"mixed3","Reduce nested parallel sections before series addition.");break;}
 case "branches":{
  const ra=a+b,rb=c+d,z=par(ra,rb);
  set("Branch A has "+a+" Ω + "+b+" Ω in SERIES. Branch B has "+c+" Ω + "+d+" Ω in SERIES. The completed branches are PARALLEL. Find Req.",z,"Ω",
  "R_eq = ((R_1 + R_2) * (R_3 + R_4)) / (R_1 + R_2 + R_3 + R_4)",
  "R_eq = ("+ra+" * "+rb+") / ("+ra+" + "+rb+") = "+f(z),
  ["Add within branch A: "+f(ra)+" Ω.","Add within branch B: "+f(rb)+" Ω.","Connect the two branch equivalents in parallel: "+f(z)+" Ω.","Do not add the two branch totals in series."],"parallelSeries","Each branch contains a series subnetwork, while complete branches are in parallel.");break;}
 case "mixed4":{
  set("From + to return: R1="+a+" Ω, then ("+b+" Ω || "+c+" Ω), then R4="+d+" Ω. Find the four-component network Req.",rt,"Ω",
  "R_T = R_1 + (R_2 * R_3) / (R_2 + R_3) + R_4",
  "R_T = "+a+" + "+f(rp)+" + "+d+" = "+f(rt),
  ["Reduce the parallel group to "+f(rp)+" Ω.","The first and last resistors carry total current.","Add "+a+" + "+f(rp)+" + "+d+" = "+f(rt)+" Ω.","Check node connections before choosing an equation."],"mixed4","A multi-stage reduction is needed.");break;}
 case "sourceCurrent":{
  const z=1000*is;
  set("A "+v+" V source feeds R1="+a+" Ω + (R2="+b+" Ω || R3="+c+" Ω) + R4="+d+" Ω. Find the SOURCE current in mA.",z,"mA",
  "I_S = V_S / (R_1 + R_P + R_4)",
  "I_S = "+v+" / "+f(rt)+" = "+f(z)+" * 10^(-3)",
  ["Reduce R2||R3 to "+f(rp)+" Ω.","Equivalent load is "+f(rt)+" Ω.","Apply I=V/R: "+f(z)+" mA.","Supply current is NOT equal to either branch current."],"mixed4","Total current passes the two outer series components.");break;}
 case "parallelVoltage":{
  const z=vp;
  set("A "+v+" V source drives "+a+" Ω + ("+b+" Ω || "+c+" Ω) + "+d+" Ω. Find voltage ACROSS the two parallel branches in V.",z,"V",
  "V_P = (V_S / R_T) * R_P",
  "V_P = ("+v+" / "+f(rt)+") * "+f(rp)+" = "+f(z),
  ["Parallel equivalent = "+f(rp)+" Ω.","Total network equivalent = "+f(rt)+" Ω.","Series current = "+f(1000*is)+" mA.","Both R2 and R3 see the SAME "+f(z)+" V."],"mixed4","Outside series voltage drops mean branches do not see full supply voltage.");break;}
 case "branchCurrent":{
  const z=1000*vp/c;
  set("With "+v+" V across "+a+" Ω + ("+b+" Ω || "+c+" Ω) + "+d+" Ω, calculate ONLY the current through R3="+c+" Ω in mA.",z,"mA",
  "I_3 = ((V_S / R_T) * R_P) / R_3",
  "I_3 = (("+v+" / "+f(rt)+") * "+f(rp)+") / "+c+" = "+f(z)+" * 10^(-3)",
  ["Parallel equivalent = "+f(rp)+" Ω.","Loop current = "+f(1000*is)+" mA.","The pair voltage is "+f(vp)+" V.","R3 current = "+f(z)+" mA; R2+R3 currents recover total."],"mixed4","Find shared parallel voltage before individual branch current.");break;}
 case "loaded":{
  const low=par(bot,load),z=v*low/(top+low),unloaded=v*bot/(top+bot);
  set("A "+v+" V divider has upper "+top+" Ω, lower "+bot+" Ω and an ADC input "+load+" Ω placed IN PARALLEL with the lower resistor. Find loaded midpoint voltage in V.",z,"V",
  "V_O = V_S * (R_B || R_L) / (R_T + (R_B || R_L))",
  "V_O = "+v+" * "+f(low)+" / ("+top+" + "+f(low)+") = "+f(z),
  ["Without the ADC, the midpoint would be "+f(unloaded)+" V.","The lower resistor is parallel with input load: "+f(low)+" Ω.","Compute the loaded divider: "+f(z)+" V.","Do not assume an ADC input is infinite impedance."],"loadedDivider","A measurement input loads its own source.");break;}
 case "power":{
  const z=1000*is*is*a;
  set("A "+v+" V source drives "+a+" Ω + ("+b+" Ω || "+c+" Ω) + "+d+" Ω. Find POWER in R1="+a+" Ω in mW, not total load power.",z,"mW",
  "P_1 = (V_S / R_T)^2 * R_1",
  "P_1 = ("+v+"/"+f(rt)+")^2 * "+a+" = "+f(z)+" * 10^(-3)",
  ["First calculate RT="+f(rt)+" Ω.","Current in R1 is total source current "+f(is)+" A.","P=I²R gives "+f(z)+" mW.","Check part rating and thermal derating separately."],"mixed4","Power rating depends on current in the selected physical resistor.");break;}
 case "kcl":{
  const z=Math.abs(measured-branch2-branch3);
  set("A junction meter reports source current "+measured+" mA; the branch meters read "+branch2+" mA and "+branch3+" mA. Find the ABSOLUTE KCL mismatch in mA.",z,"mA",
  "I_error = |I_S - I_2 - I_3|","I_error = |"+measured+" - "+branch2+" - "+branch3+"| = "+f(z),
  ["Mark current direction at the split.","Sum the two branch readings: "+f(branch2+branch3)+" mA.","Residual = "+f(z)+" mA.","Check simultaneous timing, burden voltage and missing paths."],"mixed4","Use current conservation to audit measurements, not to assume a fault.");break;}
 case "deviation":{
  const z=Math.abs(measured-1000*is);
  set("A "+v+" V source feeds "+a+" Ω + ("+b+" Ω || "+c+" Ω) + "+d+" Ω. The meter reads "+measured+" mA. Find the ABSOLUTE discrepancy from ideal modeled source current in mA.",z,"mA",
  "E_I = |I_meter - V_S / R_T|",
  "E_I = |"+measured+" - "+f(1000*is)+"| = "+f(z),
  ["Compute the parallel equivalent "+f(rp)+" Ω.","Compute RT="+f(rt)+" Ω and modeled current "+f(1000*is)+" mA.","Difference from instrument = "+f(z)+" mA.","Investigate tolerance, setup and calibration before disposition."],"mixed4","Test evidence must be compared with one circuit model.");break;}
 case "open":{
  const resistance=a+b+d,z=1000*v/resistance;
  set("FAULT MODEL: source "+v+" V drives "+a+" Ω + ("+b+" Ω || "+c+" Ω) + "+d+" Ω; the "+c+" Ω branch goes OPEN. Find new source current in mA.",z,"mA",
  "I_open = V_S / (R_1 + R_2 + R_4)",
  "I_open = "+v+" / ("+a+" + "+b+" + "+d+") = "+f(z)+" * 10^(-3)",
  ["Only R3 is open, R2 still conducts.","RT becomes "+f(resistance)+" Ω.","New current "+f(z)+" mA versus healthy "+f(1000*is)+" mA.","Perform safe power-off checks before changing hardware."],"mixed4","An open parallel branch does NOT open an intact second branch.");break;}
 case "short":{
  const resistance=a+d,z=1000*v/resistance;
  set("IDEAL FAULT MODEL, DO NOT BUILD: source "+v+" V drives "+a+" Ω + ("+b+" Ω || "+c+" Ω) + "+d+" Ω; R3 is SHORTED to zero ohms. Find theoretical source current in mA.",z,"mA",
  "I_short = V_S / (R_1 + R_4)","I_short = "+v+" / ("+a+" + "+d+") = "+f(z)+" * 10^(-3)",
  ["A shorted branch bypasses the parallel network.","The outside series resistance still limits current: "+f(resistance)+" Ω.","Current rises to "+f(z)+" mA.","Never intentionally short the physical live rail."],"mixed4","An ideal short makes the parallel section zero ohms.");break;}
 case "miswire":{
  const z=a+b+c+d;
  set("MISWIRE: intended "+a+" Ω + ("+b+" Ω || "+c+" Ω) + "+d+" Ω is accidentally wired ALL SERIES. What equivalent resistance does a powered-OFF DMM show?",z,"Ω",
  "R_bad = R_1 + R_2 + R_3 + R_4",
  "R_bad = "+a+" + "+b+" + "+c+" + "+d+" = "+f(z),
  ["Map the actual breadboard connections first.","The mistaken wiring has no branch split.","All four resistors add to "+f(z)+" Ω (healthy "+f(rt)+" Ω).","Repair only after power-off continuity measurements."],"series","Connectivity controls the formula, not the visual proximity of parts.");break;}
 case "probe":{
  const low=par(bot,meter),z=v*low/(top+low);
  set("A high-impedance "+top+" Ω / "+bot+" Ω voltage divider uses source "+v+" V. A voltmeter of "+meter+" Ω input is attached MIDPOINT to return. Find the new measured output in V.",z,"V",
  "V_meter = V_S * (R_B || R_meter) / (R_T + (R_B || R_meter))",
  "V_meter = "+v+" * "+f(low)+" / ("+top+" + "+f(low)+") = "+f(z),
  ["Original divider voltage = "+f(v*bot/(top+bot))+" V.","The meter loads bottom leg: Req="+f(low)+" Ω.","New reading is "+f(z)+" V.","Compare probe loading to source impedance."],"loadedDivider","An instrument is an electrical component in the measured network.");break;}
 case "droop":{
  const z=1000*(droop/rt)*rp/c;
  set("R1="+a+" Ω + (R2="+b+" Ω || R3="+c+" Ω) + R4="+d+" Ω normally sees "+v+" V, but the rail DROOPS to "+droop+" V. Calculate R3 current DURING droop in mA.",z,"mA",
  "I_3 = (V_droop / R_T) * (R_P / R_3)",
  "I_3 = ("+droop+" / "+f(rt)+") * ("+f(rp)+" / "+c+") = "+f(z)+" * 10^(-3)",
  ["Reduce the same resistor topology: RT="+f(rt)+" Ω.","Use sagged source "+droop+" V, not nominal "+v+" V.","Compute R3 branch current "+f(z)+" mA.","Prove droop and current coincide on a shared timebase."],"mixed4","Source variation and current division act together.");break;}
 default:throw Error("Missing integrated case "+kind);
 }
 return {kind,values:x,question,expected:answer,unit,formula,sub,steps,network:{kind:layout,values:x,focus:kind},
  learningObjective:goals[kind],auditSkill:goals[kind],skillName:goals[kind],
  lesson:{title:goals[kind],summary:note,example:steps[2],why:steps[3],
   vocab:[["Network model",note],["Final unit",unit],["Sanity check",steps[3]]]}};
}
const foundations={
 series:[
 ["Define one current path","A battery, two resistors and return conductor form ONE uninterrupted loop. Define a series circuit and state which quantity is identical through both resistors.","There is only one conducting path. Both resistors carry the same current; an open interrupts that path.","series"],
 ["Distinguish series and parallel","Two components connect end-to-end; two others connect across the same nodes A and B. Explain how to identify SERIES versus PARALLEL based on electrical nodes.","Series components share one unbranched current path. Parallel components share both endpoints and voltage.","parallel"],
 ["Read node voltage versus resistor drop","A divider has a midpoint A and return B. Explain why the voltage at A must be quoted with a reference and why a resistor drop needs two terminals.","Node voltage is relative to B. A voltage drop is the difference between two terminal potentials.","divider"],
 ["Use a signed voltage loop","A source pushes current through two series resistors. Explain KVL using one chosen loop direction and signed voltage rises and drops.","For consistent signs, source rise minus both drops is zero: Vs−V1−V2=0.","series"],
 ["Predict the effect of a loaded divider","An ADC connects from the midpoint of a two-resistor divider to return. Explain why its input resistance makes the circuit SERIES-PARALLEL.","ADC input impedance is in parallel with the bottom resistor and can lower midpoint voltage.","loadedDivider"]
 ],
 parallel:[
 ["Identify parallel from two nodes","Two resistors both connect from node A to B. Explain their voltage relationship using node potentials, not their appearance in a drawing.","Both endpoints are common, so branch voltages match.","parallel"],
 ["Distinguish an open series path from an open branch","Explain why an open resistor interrupts a ONE-path loop while another parallel branch may continue operating.","Parallel networks offer alternative current paths; series loops do not.","mixed3"],
 ["Predict equivalent resistance after adding a branch","Explain why a new positive-resistance path added in parallel decreases the equivalent resistance.","Adding conductance increases total current for the same voltage, so Req decreases.","parallel3"],
 ["Track total and branch currents","At a node, two branches split and later rejoin. State Kirchhoff current law with arrows and units.","Input current is the sum of two leaving currents, with a consistent sign convention.","mixed4"],
 ["Recognize a genuine mixed network","A feed resistor leads into two parallel branches, followed by one return resistor. Why is neither a pure-series nor pure-parallel formula enough?","First reduce the parallel pair, then add both outside series resistors.","mixed4"]
 ]
};
const labs={
 series:[
 ["Verify one-loop continuity","A 3 V teaching source drives 100 Ω followed by 200 Ω in ONE unbranched loop. Describe OFF-state continuity checks and expected current relationship.","Both parts carry identical current; their nominal combined resistance is 300 Ω.","series"],
 ["Identify the parallel subnetwork","100 Ω feeds node A; 200 Ω and 300 Ω both connect A to B. Which are truly parallel and which carries the current BEFORE splitting?","200 Ω and 300 Ω share endpoints A–B; the 100 Ω feed carries their summed current.","mixed3"],
 ["Reduce series branches before parallel","Branch A is 100+200 Ω; branch B is 300+80 Ω. Explain the order of reduction and the meaning of the branch junctions.","Each branch is a series sum; the two completed branches combine in parallel.","parallelSeries"],
 ["Plan four-component measurements","A theoretical 12 V source feeds 100 Ω + (200 Ω || 300 Ω) + 80 Ω. Which scope/DMM test points check both KCL and KVL?","Measure source and series drops for KVL; the two branch currents must sum to source current for KCL.","mixed4"],
 ["Explain ADC divider loading","A 5 V 2 kΩ/2 kΩ divider has a 2 kΩ ADC load to ground. Explain why the loaded output is not the unloaded 2.5 V.","The ADC input parallels the lower 2 kΩ leg: new lower Req=1 kΩ and midpoint=1.667 V.","loadedDivider"]
 ],
 parallel:[
 ["Confirm actual common nodes","Two resistors appear side-by-side on a breadboard. Explain how to verify their TOP and BOTTOM holes actually share node nets.","Both top terminals join A and both bottom terminals join B; row appearance is insufficient.","parallel"],
 ["Separate a feed resistor from two loads","A 100 Ω feed drives 200 Ω || 300 Ω. Which resistor carries TOTAL current and where does it split?","Feed carries total current; the two branches share the remaining voltage.","mixed3"],
 ["Instrument three independent branches","Three resistors share one supply and return. Describe voltmeter points and current shunts that test equal voltage and KCL.","Probe each branch A-to-B and measure branch current in series, keeping common reference.","parallel3"],
 ["Include shared return resistance","A source drives 100 Ω + (200 Ω || 300 Ω) + 80 Ω. Explain why neither branch sees full source voltage.","The 100 Ω feed and 80 Ω return also drop voltage.","mixed4"],
 ["Distinguish an open branch from a short","A two-branch system fails. Describe SAFE OFF-state checks and predict qualitative change in total current for open versus short.","Open removes one current path and generally reduces total current; a short can cause excess current.","mixed4"]
 ]
};
const capstones={
 series:[
 ["Diagnose one open branch with evidence","A 12 V source feeds 100 Ω + (200 Ω || 300 Ω) + 80 Ω. Source current drops from 40 mA near 31.6 mA. Compare an open 300 Ω branch versus a short, then propose two independent tests.","Healthy Req=300 Ω, I=40 mA. R3 open yields Req=380 Ω, I≈31.58 mA. Power down, verify R3 path continuity, then independently check voltage across remaining R2.","mixed4"],
 ["Cross-check ADC and instrument loading","A 5 V divider has 100 kΩ upper and 100 kΩ lower; an ADC input of 200 kΩ AND a DMM input of 1 MΩ connect to the midpoint. Explain why the output drops without a regulator failure, calculate the equivalent lower resistance, and plan a loading comparison.","The three lower paths are parallel: 1/Req=1/100k+1/200k+1/1M giving 62.5 kΩ; Vmid=5×62.5/(100+62.5)≈1.923 V. Compare loaded and unloaded safely.","loadedDivider"],
 ["Satellite avionics integrated fault and NO-GO","A theoretical 12 V fixture has 100 Ω + (200 Ω || 300 Ω) + 80 Ω. A new unit draws 67 mA rather than healthy 40 mA. Model a zero-ohm branch short, check possible series heating, identify two independent verification measurements, and give a justified GO/NO-GO decision.","If either parallel branch shorts, Rp≈0 and Req≈180 Ω, so I≈66.67 mA. This matches but does not prove a short. Power down; inspect fixture, compare a known-good board, independently check branch impedance, use approved current limits, and hold NO-GO pending disposition.","mixed4"]
 ],
 parallel:[
 ["Isolate an open branch versus rail droop","For 12 V across 100 Ω + (200 Ω || 300 Ω) + 80 Ω, supply current drops. Explain how source droop differs from an open 300 Ω path and which measurements separate them.","With R3 open, Req=380 Ω and I≈31.58 mA at 12 V. A drooping source changes voltage; measure source at DUT and branch voltage before assigning fault.","mixed4"],
 ["Diagnose KCL disagreement with return resistance","A two-branch test has a shared 80 Ω return resistor and a 100 Ω feed. Meters disagree on source-versus-branch current. Explain burden voltage, timing mismatch, missing paths and reference errors.","Kirchhoff law still holds. Correct the reference node, confirm simultaneous measurements and any unmeasured branch; do not attribute disagreement to new physics.","mixed4"],
 ["Integrated qualification: fault, load, isolation","A 12 V test fixture has 100 Ω + (200 Ω || 300 Ω) + 80 Ω and reads 67 mA instead of expected 40 mA. Calculate the theoretical shorted-branch current, choose two distinct probe locations and design an A/B/A board-and-fixture check. Is this a GO?","With Rp≈0, Req=180 Ω and I≈66.67 mA. Disable power, check wiring and branch impedance, swap known-good fixture/board under approved limits, preserve failing evidence; no uninvestigated excess-current GO.","mixed4"]
 ]
};
function textCase(q,data,stage){
 let [title,question,answer,kind]=data;
 q.originalMasteryQuestion=q.question;q.question=question;q.learningObjective=title;q.auditSkill=title;q.skillName=title;
 const givenV=question.match(/\b(\d+(?:\.\d+)?)\s*V\b/);
 const values={...defaults};
 if(givenV)values.v=Number(givenV[1]);
 if(title==="Verify one-loop continuity")kind="series2";
 if(title==="Define one current path"||title==="Use a signed voltage loop")kind="series2";
 q.network={kind,values,focus:stage,illustrative:!givenV};q.steps=[
  "Read the real circuit and label its source, reference and nodes: "+question,
  "Separate series paths from parallel branches; never choose an equation by the drawing alone.",
  "Compare your reasoning with the physical reference: "+answer,
  "Check at least one independent observation, measurement limit or sign convention."];
 q.lesson={title,summary:answer,example:answer,why:"Observe the actual nodes, measurement reference and valid circuit model.",
 vocab:[["Series","Single current path"],["Parallel","Two components sharing both endpoints"],["Verification","An independently checked electrical observation"]]};
 q.formula="";q.sub="";q.unitConv=null;delete q.expected;q.calcFamily=null;
}
function numericCase(q,kind,values,topic){
 const m=evaluate(kind,values);
 q.originalMasteryQuestion=q.question;q.originalNumeric={question:q.question,expected:q.expected,unit:q.unit,formula:q.formula};
 Object.assign(q,m);q.calcFamily=null;q.unitConv=null;q.roll={kind,base:{...values},topic};
}
const listSeries=["series","parallel","mixed3","branches","mixed4","sourceCurrent","parallelVoltage","branchCurrent","loaded","power","kcl","deviation","open","short","miswire","probe","droop"];
const listParallel=["parallel","parallel3","mixed3","branches","mixed4","branchCurrent","sourceCurrent","kcl","loaded","power","deviation","open","short","miswire","probe","parallelVoltage","droop"];
for(const id of ["series","parallel"]){
 const topic=T.find(t=>t.id===id),arr=Q.filter(q=>q.topic===id);
 if(!topic||arr.length!==30)throw Error("30 problem slots missing for "+id);
 for(let i=0;i<5;i++)textCase(arr[i],foundations[id][i],"foundation");
 for(let i=0;i<5;i++)textCase(arr[i+5],labs[id][i],"lab");
 for(let i=0;i<17;i++)numericCase(arr[i+10],(id==="series"?listSeries:listParallel)[i],
  { ...defaults,...(id==="parallel"?{v:9,a:120,b:240,c:360,d:60,top:3300,bot:2200,load:4700}:{} )},id);
 for(let i=0;i<3;i++)textCase(arr[i+27],capstones[id][i],"capstone");
}
function reroll(q){
 if(!q||!q.roll||!goals[q.roll.kind])return null;
 const base=q.roll.base,scale=[0.72,0.85,1.15,1.3,1.5,1.8];
 const pick=()=>scale[Math.floor(Math.random()*scale.length)],v={...base};
 for(const key of ["a","b","c","d","top","bot","load"]){
  if(Number.isFinite(v[key]))v[key]=Math.max(10,Math.round(v[key]*pick()/10)*10);
 }
 if(Number.isFinite(v.meter))v.meter=Math.max(100000,Math.round(v.meter*pick()/1000)*1000);
 v.v=n(base.v*pick());v.droop=n(v.v*0.9);v.measured=n(base.measured*pick());
 v.branch2=n(base.branch2*pick());v.branch3=n(base.branch3*pick());
 const x=evaluate(q.roll.kind,v);
 return {...q,...x,roll:q.roll,isCustomVariant:true,skillName:"🎲 "+x.learningObjective,learningObjective:"🎲 New component values: "+x.learningObjective};
}
window.avionicsMixedCircuitCurriculum={evaluate,reroll,goals,seriesKinds:listSeries,parallelKinds:listParallel};
window.AVIONICS_DISTINCT_CURRICULUM_VERSION=11;
})();