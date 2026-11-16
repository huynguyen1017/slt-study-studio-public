"use strict";
/* 600 original, zero-prerequisite NVIDIA-oriented exercises. 50 per each of
   12 topic tracks. These are educational, not proprietary interview questions. */
(function(){
const T=window.NVIDIA_SLT_TRACKS||[],M=window.NVIDIA_SLT_CALCS;
if(T.length!==12||!M)throw Error("SLT prerequisite scripts not loaded");
const phaseNames=["Basics · concepts","Lab · observe safely","Math · compute and check","Debug · isolate fault","Integrated SLT · decision"];
const N=[],names=new Set();
const speak=(sk,topic)=>"I would begin by identifying "+sk.name.toLowerCase()+". "+sk.meaning+" I would "+sk.observe+" and I would not conclude the SoC itself failed until I separated this from "+sk.risk+".";
const st=(text)=>String(text).trim();
for(const t of T){
 for(let i=0;i<50;i++){
  const k=i%10,sk=t.skills[k],next=t.skills[(k+3)%10],third=t.skills[(k+7)%10],phase=Math.floor(i/10),n=i+1;
  let question,steps=[],numeric=null,formula=null,sub=null,expected,unit;
  let context="SLT setting: "+t.title+". "+t.goal;
  let objective="";
  if(phase===0){
   objective="Define and explain "+sk.name;
   question="Q"+n+". Starting from zero prior EE knowledge, explain "+sk.name+" to a new SoC system tester. What does it physically mean, what would you observe, and how could you distinguish a real hardware problem from the specific trap: "+sk.risk+"?";
   steps=[
    "Read the words slowly. The topic is '"+sk.name+"'. Do not start with a memorized acronym; first state what physical system or software result it describes.",
    "The plain-language meaning is: "+sk.meaning+" If there are units or timing conditions, name them explicitly instead of assuming a reading is valid.",
    "Picture a real host, test rack and device-under-test. To observe this concept, you would "+sk.observe+". Identify where that evidence originates.",
    "Predict one healthy result before collecting data. Use an approved specification or known-good reference, not a made-up NVIDIA production limit.",
    "Identify a common misunderstanding: "+sk.risk+". Explain which independent comparison could test this alternative.",
    "Summarize the concept in one or two beginner-friendly sentences and connect it to repeatable system-level testing.",
    "Interview practice answer (hypothetical): "+speak(sk,t)+" Ask for the target device specification before declaring a PASS."
   ];
  } else if(phase===1){
   objective="Demonstrate a safe and reproducible check of "+sk.name;
   const paths=["draw the setup","select a measurement tool","list the preflight checks","identify test points","establish a healthy reference","capture an event","preserve configuration","measure a second condition","compare one changed variable","report a repeatable observation"];
   question="Q"+n+". Practical lab: "+paths[k]+" for "+sk.name+". Your SLT device has not yet been diagnosed. Define a specific, safe procedure to "+sk.observe+"; explain what evidence would falsify '"+sk.risk+"' and how to log the outcome.";
   steps=[
    "Start with the purpose: "+sk.meaning+" State exactly which variable or status will be checked and whether equipment is powered.",
    "Write the topology or data path: host software → test interface/fixture → DUT → physical signal or hardware counter → saved log. Point out the actual target for "+sk.name+".",
    "Before touching hardware, record board serial/revision, firmware hash, test-station ID, program version, probe/instrument settings and allowed voltage/current/temperature conditions.",
    "Choose a safe observation: "+sk.observe+". Do not measure ohms on a live board or attach an ordinary scope ground clip to a non-grounded high-side node.",
    "Specify what a valid passing observation must contain: expected range/state, readable units, instrument validity, timestamp and raw evidence. Get actual limits from the approved target configuration.",
    "Introduce one negative/control example: "+sk.risk+". Independently check it before blaming the silicon, for example by swapping a known-good board, channel, fixture or software image with one variable changed.",
    "Capture the result plus anything that makes it repeatable: current settings, console output, environment, exact stimulus, and instrument calibration status.",
    "Interview summary (proposed method, not historical claim): "+speak(sk,t)+" I would classify a missing/invalid test separately from a confirmed DUT failure."
   ];
  }else if(phase===2){
   objective="Calculate and independently verify a distinct "+t.title+" quantity";
   numeric=M.generate(t.id,k,0);
   question="Q"+n+". Numerical SLT reasoning — "+numeric.prompt+" Show the units and equation, calculate the answer, state one limit of the model, and explain how it connects to "+sk.name+".";
   formula=numeric.formula;sub=numeric.sub;expected=numeric.expected;unit=numeric.unit;
   steps=[
    "Identify what the problem actually requests: a final numeric answer in "+unit+". Underline each given, and keep its unit next to it; never assume the equipment is calibrated.",
    "Define the related hardware concept first: "+sk.name+" — "+sk.meaning+" This describes the real-world signal or test process behind the numbers.",
    "List the inputs exactly as written: "+numeric.prompt+" Convert milli, micro, MHz, MiB or other engineering prefixes BEFORE substitution.",
    "Write the governing relationship symbolically: "+numeric.formula+". Name which physical quantity belongs in each term instead of memorizing the last example's numbers.",
    "Substitute the actual parameters: "+numeric.sub+". Compute and report "+numeric.expected+" "+unit+". Keep the sign, decimals and requested unit.",
    "Explain why the answer has this magnitude: "+numeric.why+" Reverse the direction of a unit conversion to catch a 1000× error.",
    "Sanity check against a physical or system constraint: "+numeric.check+" Never interpret a teaching threshold as an NVIDIA device specification.",
    "Describe one independent way to verify the result in a test station or raw software log: "+sk.observe+". If reference and test differ, isolate the instrument, host, program and DUT.",
    "State the finished answer out loud: expected "+numeric.expected+" "+unit+"; valid test evidence is necessary before calling a hardware GO or NO-GO."
   ];
  }else if(phase===3){
   objective="Troubleshoot a "+sk.name+" failure with a controlled experiment";
   const qualifiers=["only at cold boot","after one firmware update","under high thermal load","when moving the harness","under sustained memory traffic","after an intermittent power-cycle","only on one fixture","with a new kernel version","while running two workloads","after changing the test threshold"];
   question="Q"+n+". Fault isolation. A synthetic SLT report flags '"+sk.name+"' "+qualifiers[k]+". One symptom suggests "+sk.risk+". Design a hypothesis table and a SAFE A/B/A test to determine whether the failure comes from DUT hardware, firmware, fixture, measurement, or a parser. What would disprove your first hypothesis?";
   steps=[
    "Do not jump to a root cause. Define the observable failure: "+sk.name+" deviated from the stated reference "+qualifiers[k]+". Separate reported symptom from an unverified explanation.",
    "Preserve the earliest raw failing timestamp, physical measurements, test-station and driver version, board/stepping ID, firmware hash and complete test command before resets or swaps.",
    "Hypothesis A (DUT or silicon): "+sk.risk+". Prediction: the failure follows the same DUT across independently verified setups and appropriate valid configuration.",
    "Hypothesis B (instrument/fixture): "+sk.observe+" may be distorted by setup and calibration. Prediction: the failure follows a station, probe, power harness or interface, not the original DUT.",
    "Hypothesis C (firmware/software): a changed image, parser, driver or timeout policy creates apparent failures. Compare raw target evidence to the derived summary and preserve first-failure records.",
    "Perform a controlled A/B/A: record original failing A, change exactly one approved variable for B, restore A and reproduce. Never reseat live high-power hardware.",
    "Use a separate verification for a related signal: "+next.observe+". Explain what outcome would distinguish it from the first measurement.",
    "Classify: confirmed out-of-limit DUT=FAIL; missing/invalid test evidence=INVALID; fully valid within approved conditions=PASS; unresolved=BLOCKED/escalate.",
    "Conclude with reproducible evidence and one next action. A hypothesis is not established merely because frequency or temperature correlates with failures."
   ];
  }else{
   objective="Integrate "+sk.name+", "+next.name+" and "+third.name+" into an evidence-based release";
   const urgency=["first-pass production escape","nonreproducible overnight timeout","three-station yield divergence","single-DUT cold corner failure","driver update followed by memory error","high PCIe replay plus rail droop","intermittent reset and missing logs","firmware stepping mismatch","possible false-clean automated PASS","pre-release urgent test waiver"];
   question="Q"+n+". Senior SLT integrated interview case: During a synthetic "+urgency[k]+", the station reports '"+sk.risk+"'. A second independent signal concerns "+next.name+": "+next.risk+". A third subsystem concerns "+third.name+": "+third.risk+". Design a prioritized fault tree, propose two falsifiable experiments, build an evidence packet and justify PASS / FAIL / INVALID / BLOCKED before release.";
   steps=[
    "Frame the system: "+t.title+". This is a hypothetical scenario; do not claim it occurred at NVIDIA or in your earlier roles. Identify which measured symptom actually violates a written requirement.",
    "Review the first signal: "+sk.name+" means "+sk.meaning+" A direct check is to "+sk.observe+". Preserve the first timestamp and the reading's calibration.",
    "Review the second, DIFFERENT subsystem: "+next.name+" means "+next.meaning+" Test separately with "+next.observe+" rather than assuming a common electrical cause.",
    "Review the third path: "+third.name+" means "+third.meaning+" Look for evidence by "+third.observe+" and compare timestamps to the first two observations.",
    "Prepare three competing root-cause hypotheses: device/silicon; fixture/power/measurement; firmware/driver/test logic. For each, write a predicted outcome and one way to disprove it.",
    "Choose a safe first diagnostic with high information gain and low hardware risk: inspect raw logs and board/firmware revisions, then use approved limits and valid instruments. Never randomly increase voltage or remove required coverage.",
    "Run A/B/A by changing ONE factor at a time, then restore the original failure. Compare known-good reference unit and fixture while holding workload, temperature and power constant.",
    "Cross-check a quantitative or timing prediction from prior questions in this topic. Do not reuse a calculation unrelated to the physical failing signal; specify units and report uncertainty.",
    "Assemble a release packet: DUT serial, stepping, board revision, image/hash, station/instrument calibration, environmental setpoints, exact commands, raw logs, independent measurement and owner.",
    "Decision: PASS requires all required valid checks within spec; confirmed DUT failure=FAIL/NO-GO; invalid measurement or station=INVALID; outstanding coverage/ambiguity=BLOCKED and explicitly escalated. Summarize in a concise cross-functional handoff."
   ];
  }
  const id="nvs-"+t.id+"-"+String(n).padStart(2,"0");
  const lesson={summary:st("Goal: "+objective+". "+sk.meaning+" "+(phase>=3?"Check the reported failure without assigning unsupported causality.":"Master the physics and its observable consequence.")),
   analogy:phase===0?"Think of a complete computer as connected subsystems: one node or log entry cannot explain the whole failure.":phase===2?"Treat the equation like a recipe: convert ingredients to common units, substitute, calculate, sanity-check.":"A detective preserves original evidence and changes one condition at a time.",
   example:phase===2?numeric.sub:sk.observe+"; distinguish from "+sk.risk+".",
   why:"The provided LTTS NVIDIA SLT role emphasizes SoC diagnostics, verification, post-silicon validation, yield, test automation and cross-team root cause. This is an original training scenario.",
   vocabulary:[[sk.name,sk.meaning],["Evidence",sk.observe],["Possible pitfall",sk.risk],["SLT","System Level Test"],["DUT","Device Under Test"]] };
  let q={id,topic:t.id,difficulty:n,phase:phaseNames[phase],level:phase===0?"Basics":phase===1?"Lab":phase===2?"Calculation":phase===3?"Debug":"Integrated",skillName:sk.name,
   objective,question,steps,lesson,questionType:phase===2?"number":"explanation",expected,unit,formula,sub,operation:numeric?.method||null,
   hints:["Explain '"+sk.name+"' using: "+sk.meaning,"Try this independent check: "+sk.observe,"Watch for this false conclusion: "+sk.risk],
   interviewAnswer:speak(sk,t),hypothetical:true};
  if(numeric)q.math=numeric;
  if(names.has(id)||steps.length<7||question.length<110)throw Error("Bad question "+id);
  names.add(id);N.push(q);
 }
}
if(N.length!==600||names.size!==600)throw Error("Expected 12 × 50 separate SLT questions");
window.NVIDIA_SLT_QUESTIONS=N;
window.NVIDIA_SLT_META={topics:12,perTopic:50,questions:600,version:1,source:"User-supplied LTTS NVIDIA JD; private study-guide concepts; public NVIDIA DCGM/Xid and general engineering references",notOfficial:true};
})();
