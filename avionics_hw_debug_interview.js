"use strict";
/* Interactive 5 V, 100 x 1 Ohm Parallel Resistor Array Open/Short Hardware Debug Interview Lab
   & 12-Problem Baby-Step Practice Suite for Avionics EE Practice.
   Public-safe educational simulator; paper-math first -> schematic lookup -> IR camera -> 4-wire DMM -> pad lift. */
(function(){
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const roundN=(v,p=6)=>Number.isFinite(v)?Number(v.toPrecision(p)):v;
const fmt=(v,d=3)=>Number.isFinite(v)?Number(v).toFixed(d):"—";
const mathBox=(expr,label)=>{
 const mml=window.studyMath?window.studyMath(expr,true):'<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mtext>'+esc(expr)+'</mtext></math>';
 return '<div class="av-hwd-eqcard"><small>'+esc(label)+'</small>'+mml+'</div>';
};

const PRESETS={
 interview_mixed:{
  id:"interview_mixed",
  title:"Interview Fault: 5 V, 100 × 1 Ω · 2 Shorts (0 Ω) + 3 Opens (∞ Ω)",
  vs:5.0,rNom:1.0,n:100,shorts:[14,62],opens:[27,53,88],
  note:"Classic interview board: R14 & R62 are shorted (0 Ω ideal / ~1 mΩ bridge), masking R27, R53 & R88 open (∞ Ω) faults."
 },
 pure_opens:{
  id:"pure_opens",
  title:"Phase B After Short Removal: 4 Opens (∞ Ω · R12, R39, R71, R95)",
  vs:5.0,rNom:1.0,n:100,shorts:[],opens:[12,39,71,95],
  note:"All 0 Ω shorts are cleared. Now 4-wire Kelvin R_eq = 10.417 mΩ & IR camera cold spots expose all 4 open resistors."
 },
 single_short:{
  id:"single_short",
  title:"Single Dead Short at R42 (0 Ω) on +5V_MAIN",
  vs:5.0,rNom:1.0,n:100,shorts:[42],opens:[],
  note:"One shorted branch drags R_eq ≈ 0 Ω (~1 mΩ bridge) and starves all 99 healthy 1 Ω branches until R42 is isolated."
 },
 healthy_100:{
  id:"healthy_100",
  title:"Healthy Baseline: All 100 × 1 Ω Nominal (R_eq = 10.00 mΩ, I_T = 500 A)",
  vs:5.0,rNom:1.0,n:100,shorts:[],opens:[],
  note:"Healthy reference state: every branch reads 1.000 Ω isolated, R_eq = 1.0/100 = 10.00 mΩ, and all 100 resistors warm evenly."
 },
 avionics_28v_bank:{
  id:"avionics_28v_bank",
  title:"28 V Spacecraft Heater Bank Fault (100 × 1 Ω Scale · R8 Short, R19/R44/R81 Open)",
  vs:28.0,rNom:1.0,n:100,shorts:[8],opens:[19,44,81],
  note:"High-power avionics parallel bank demonstration: apply current-limited 1 V / 2.5 A supply before touching high-voltage bus."
 }
};

function makeArrayFromPreset(presetId){
 const p=PRESETS[presetId]||PRESETS.interview_mixed;
 const arr=Array.from({length:p.n},()=>"ok");
 for(const idx of p.shorts)if(idx>=1&&idx<=p.n)arr[idx-1]="short";
 for(const idx of p.opens)if(idx>=1&&idx<=p.n)arr[idx-1]="open";
 return arr;
}

/* Paper-math & lumped PCB physics solver for N parallel resistors.
 * Calculates ideal parallel array Req, physical bench current-limited response,
 * per-resistor power & IR temperature under both Fault-Hunt (1V / 2.5A) and Open-Hunt (1V bias),
 * copper bus mV gradient (rSeg = 0.25 mOhm/tap), 2-wire vs 4-wire Kelvin DMM, and lifted-pad value. */
function calcArrayState(states,opts={}){
 const n=states.length||100;
 const vs=Number.isFinite(opts.vs)?opts.vs:5.0;
 const rNom=Number.isFinite(opts.rNom)?opts.rNom:1.0;
 const rShortPhys=Number.isFinite(opts.rShortPhys)?opts.rShortPhys:0.002; // 2 mOhm physical solder/bridge
 const rLead2W=Number.isFinite(opts.rLead2W)?opts.rLead2W:0.24; // 0.12 Ohm per DMM lead
 const rSeg=Number.isFinite(opts.rSeg)?opts.rSeg:0.00025; // 0.25 mOhm copper segment per position
 const iLimit=Number.isFinite(opts.iLimit)?opts.iLimit:2.5; // Safe current-limited short-hunt bench limit (A)
 const vTest=Number.isFinite(opts.vTest)?opts.vTest:1.0; // Safe 1.0 V IR test bias after shorts cleared
 const tAmb=25.0, rTheta=35.0; // Illustrative thermal coefficient only; not verified surface temperature.
 const jumpers=Array.isArray(opts.jumpers)&&opts.jumpers.length===10?opts.jumpers:Array(10).fill(true);
 const lifted=new Set(opts.lifted||[]);
 const irPhase=opts.irPhase==="open_bias"?"open_bias":"short_limit";

 let activeHealthy=0,activeShorts=0,activeOpens=0,disconnected=0;
 let allShorts=0,allOpens=0;
 let gIdeal=0,gPhys=0;
 const branches=[];

 for(let i=0;i<n;i++){
  const id=i+1, bank=Math.floor(i/10);
  const st=states[i]||"ok";
  if(st==="short")allShorts++;
  if(st==="open")allOpens++;
  const inCircuit=Boolean(jumpers[bank])&&!lifted.has(id);
  if(!inCircuit){
   disconnected++;
  }else if(st==="ok"){
   activeHealthy++;
   gIdeal+=1/rNom;
   gPhys+=1/rNom;
  }else if(st==="short"){
   activeShorts++;
   gIdeal=Infinity;
   gPhys+=1/rShortPhys;
  }else{
   activeOpens++;
  }
  branches.push({id,bank,st,inCircuit});
 }

 const rEqIdeal=activeShorts>0?0:(gIdeal>0?1/gIdeal:Infinity);
 const rEqPhys=gPhys>0?1/gPhys:Infinity;
 const r2Wire=Number.isFinite(rEqPhys)?rEqPhys+rLead2W:Infinity;
 const r4Wire=rEqPhys;

 const rEqHealthy=rNom/n;
 const iBranchHealthyNom=vs/rNom;
 const iTotalHealthyNom=n*iBranchHealthyNom;
 const pBranchHealthyNom=vs*vs/rNom;
 const pTotalHealthyNom=n*pBranchHealthyNom;

 // Ideal paper-math prediction when no shorts remain & all 100 in-circuit:
 const openEstimatedFromReq=(activeShorts===0&&Number.isFinite(rEqIdeal)&&inCircuitCount(branches)===n)?Math.round(n-rNom/rEqIdeal):null;
 const iTotalNominalIdeal=activeShorts>0?Infinity:(Number.isFinite(rEqIdeal)?vs/rEqIdeal:0);

 // BOTH thermal phases honor the same actual supply current limit.
 // An intact 10 mΩ array cannot sustain 1 V under a 2.5 A limit (needs ~100 A).
 const benchV=Number.isFinite(rEqPhys) ? Math.min(vTest, iLimit*rEqPhys) : vTest;
 const benchI=Number.isFinite(rEqPhys)&&rEqPhys>0?benchV/rEqPhys:0;

 // Compute per-branch voltage, current, power, copper bus mV drop, and IR temp
 let downstreamI=benchI;
 let cumDropMv=0;
 const rows=branches.map((b,idx)=>{
  let rBranch=Infinity;
  if(b.inCircuit){
   rBranch=b.st==="ok"?rNom:(b.st==="short"?rShortPhys:Infinity);
  }
  const iB=(b.inCircuit&&Number.isFinite(rBranch))?(benchV/rBranch):0;
  // Physical resistor/bridge heat P=I²R. Do NOT invent a 0.18 Ω heater for a 2 mΩ short.
  // Kelvin, jumper and IR drawings are synthetic; trace or pad heating beyond bridge R is not solved here.
  const pB=iB*iB*(Number.isFinite(rBranch)?rBranch:0);
  const tempC=tAmb+pB*rTheta;
  // Trace mV gradient along +5V bus from J1 feed at left edge (idx 0 -> 99)
  cumDropMv+=(downstreamI*rSeg)*1000;
  downstreamI=Math.max(0,downstreamI-iB);
  const isolatedDmm=b.st==="ok"?`${rNom.toFixed(3)} Ω (OK)`:(b.st==="short"?"0.000 Ω (SHORT)":"OL / ∞ Ω (OPEN)");
  return {
   ...b,
   rIdeal:b.st==="ok"?rNom:(b.st==="short"?0:Infinity),
   rPhys:rBranch,
   iBench:iB,
   pBench:pB,
   tempC,
   busDropMv:cumDropMv,
   isolatedDmm
  };
 });

 const bankSummary=Array.from({length:10},(_,b)=>{
  const sub=rows.filter(r=>r.bank===b);
  const sh=sub.filter(r=>r.st==="short"&&r.inCircuit).length;
  const op=sub.filter(r=>r.st==="open"&&r.inCircuit).length;
  let gB=0;
  for(const r of sub){
   if(!r.inCircuit||r.st==="open")continue;
   gB+=1/r.rPhys;
  }
  const rBankPhys=gB>0?1/gB:Infinity;
  return {bank:b,label:`B${b+1} (R${b*10+1}–R${(b+1)*10})`,jumperClosed:Boolean(jumpers[b]),shortsInCircuit:sh,opensInCircuit:op,rBankPhys};
 });

 return {
  n,vs,rNom,rLead2W,rSeg,iLimit,vTest,irPhase,
  activeHealthy,activeShorts,activeOpens,disconnected,allShorts,allOpens,
  rEqIdeal,rEqPhys,r2Wire,r4Wire,rEqHealthy,
  iBranchHealthyNom,iTotalHealthyNom,pBranchHealthyNom,pTotalHealthyNom,
  iTotalNominalIdeal,openEstimatedFromReq,benchV,benchI,
  rows,bankSummary
 };
}

function inCircuitCount(branches){return branches.filter(b=>b.inCircuit).length;}

/* 12 Hardware Debug Practice Problems (Paper math -> DMM -> IR -> Schematic -> Board Debug) */
const PROBLEMS=[
 {
  id:"HWD-01",kind:"number",unit:"mΩ",
  title:"Paper Math Step 1: Healthy 100 × 1 Ω Parallel Baseline",
  prompt:"Before probing an avionics power board, do the paper math first: 100 identical 1.0 Ω resistors are wired in parallel across a 5.0 V rail. Calculate the healthy equivalent resistance R_eq in milliohms (mΩ). (Also note healthy total current I = 500 A.)",
  formula:"R_eq = R_nom / N",
  sub:"R_eq_mOhm = (1.0 / 100) * 1000 = 10 mΩ",
  expected:10,
  steps:[
   "Identify circuit topology from the schematic: all 100 resistors connect between the exact same +5V_MAIN node and GND node, so they are 100 equal resistors in parallel.",
   "Write the conductance form of parallel resistance: 1/R_eq = Σ(1/R_i) = N / R_nom.",
   "Invert to solve for healthy R_eq: R_eq = R_nom / N.",
   "Substitute R_nom = 1.0 Ω and N = 100: R_eq = 1.0 / 100 = 0.01 Ω.",
   "Convert ohms to milliohms: 0.01 Ω × 1000 = 10 mΩ.",
   "Predict healthy 5 V current & power on paper: I_branch = 5 V / 1 Ω = 5 A, so I_total = 100 × 5 A = 500 A and P_total = 5 V × 500 A = 2500 W!",
   "Bench safety conclusion: a normal 2-wire DMM (leads ~0.24 Ω) cannot resolve 10 mΩ accurately, and powering a faulty 10 mΩ rail unconstrained at 5 V is unsafe.",
   "Always compute R_eq,healthy = 10 mΩ on paper BEFORE opening the board schematic or turning on any supply."
  ],
  reroll:(rnd)=>{
   const r=rnd([1,2,4,5,10]), n=rnd([50,100,200]);
   const ans=(r/n)*1000;
   return {
    prompt:`Paper Math Baseline (Custom #): ${n} identical ${r}.0 Ω resistors are wired in parallel across a 5.0 V rail. Compute the healthy equivalent resistance R_eq in milliohms (mΩ).`,
    sub:`R_eq_mOhm = (${r}.0 / ${n}) * 1000 = ${roundN(ans)} mΩ`,
    expected:roundN(ans)
   };
  }
 },
 {
  id:"HWD-02",kind:"number",unit:"resistors",
  title:"Paper Math Step 2: Count Open Resistors from Total Current (No Shorts Left)",
  prompt:"On a 5.0 V parallel array of 100 nominal 1.0 Ω resistors, all 0 Ω shorts have been cleared and isolated. A high-current pulsed supply at 5.0 V measures total current I_total = 465 A instead of 500 A. Using paper math, how many resistors are OPEN (∞ Ω)?",
  formula:"N_open = N - (I_total / (V_s / R_nom))",
  sub:"N_open = 100 - (465 / (5 / 1)) = 7 resistors",
  expected:7,
  steps:[
   "Define the electrical state of an open resistor: R_open = ∞ Ω, so conductance G_open = 1/∞ = 0 S and branch current I_open = 0 A.",
   "Calculate the current carried by each healthy 1.0 Ω branch at 5.0 V: I_branch = V_s / R_nom = 5.0 V / 1.0 Ω = 5.0 A.",
   "Calculate healthy total current: I_healthy = 100 × 5.0 A = 500 A.",
   "Use KCL (I_total = m × I_branch) to find how many healthy resistors remain active: m = I_total / I_branch = 465 A / 5.0 A = 93 active resistors.",
   "Subtract active resistors from N = 100: N_open = 100 − 93 = 7 open resistors.",
   "Cross-check with R_eq: R_eq = 5 V / 465 A = 10.753 mΩ > 10.00 mΩ. Anytime all shorts are gone and opens exist, R_eq increases above 10 mΩ.",
   "Know when NOT to trust this count: if even ONE 0 Ω short remains in parallel, I_total spikes toward current limit and masks open branches!",
   "Now open the schematic + IR camera with a target count of 7 cold spots (0 W dissipation) to confirm every open unit."
  ],
  reroll:(rnd)=>{
   const k=rnd([3,4,6,8,9,11,14]), iTot=(100-k)*5;
   return {
    prompt:`Open Count via KCL (Custom #): All 0 Ω shorts are cleared on the 5.0 V, 100 × 1.0 Ω array. Total current at 5.0 V measures ${iTot} A. How many resistors are OPEN (∞ Ω)?`,
    sub:`N_open = 100 - (${iTot} / (5 / 1)) = ${k} resistors`,
    expected:k
   };
  }
 },
 {
  id:"HWD-03",kind:"number",unit:"resistors",
  title:"Paper Math Step 3: Solve Open Count from 4-Wire Kelvin R_eq",
  prompt:"With power OFF and all 0 Ω shorts removed from the 100 × 1.0 Ω parallel array, a 4-wire Kelvin milliohmmeter measures R_eq = 10.526316 mΩ (0.010526316 Ω). How many resistors are OPEN (∞ Ω)?",
  formula:"N_open = N - (R_nom / R_eq)",
  sub:"N_open = 100 - (1.0 / 0.010526316) = 5 resistors",
  expected:5,
  steps:[
   "Recognize why R_eq rose above 10 mΩ: removing parallel branches decreases total conductance G_total, which INCREASES equivalent resistance R_eq.",
   "Convert milliohms back to ohms: R_eq = 10.526316 mΩ = 0.010526316 Ω.",
   "Compute total parallel conductance: G_total = 1 / R_eq = 1 / 0.010526316 Ω ≈ 95.000 S.",
   "Since each healthy 1.0 Ω branch contributes 1 / 1.0 Ω = 1.0 S and each open contributes 0 S, active healthy count m = R_nom / R_eq = 95 resistors.",
   "Subtract from 100: N_open = 100 − 95 = 5 open (∞ Ω) resistors.",
   "Why 4-wire Kelvin is mandatory here: each 1-resistor open only increases R_eq by ~0.10 mΩ (10.00 → 10.101 mΩ), which a 2-wire meter's 0.24 Ω lead error completely buries!",
   "Before declaring completion after finding 5 cold spots on IR / lifted pads, re-measure with 4-wire Kelvin until R_eq = 10.00 mΩ.",
   "Document both calculated conductance (95 S) and physical root cause (e.g., cracked solder joints or blown thin-film element) on the schematic."
  ],
  reroll:(rnd)=>{
   const k=rnd([2,4,5,6,8,10,12]), reqOhm=1/(100-k), reqMohm=reqOhm*1000;
   return {
    prompt:`Open Count via Kelvin R_eq (Custom #): Power-OFF 4-wire Kelvin meter measures R_eq = ${reqMohm.toFixed(6)} mΩ (${reqOhm.toFixed(9)} Ω) across the 100 × 1.0 Ω array (0 shorts). How many resistors are OPEN?`,
    sub:`N_open = 100 - (1.0 / ${reqOhm.toFixed(9)}) = ${k} resistors`,
    expected:k
   };
  }
 },
 {
  id:"HWD-04",kind:"number",unit:"Ω",
  title:"DMM Limitation: Why a 2-Wire Multimeter Misleads on 10 mΩ Parallel Rails",
  prompt:"Each DMM test lead has 0.12 Ω resistance (0.24 Ω total for red + black leads). If you probe the healthy 100 × 1.0 Ω array (R_eq = 0.01 Ω) in 2-wire Ω mode, what misleading total resistance in Ω appears on the DMM display?",
  formula:"R_2wire = R_eq + 2 * R_lead",
  sub:"R_2wire = 0.01 + 2 * 0.12 = 0.25 Ω",
  expected:0.25,
  steps:[
   "Draw the 2-wire measurement loop: the DMM injects test current I_test through Red Lead → +5V_MAIN Node → Parallel Array → GND → Black Lead, and measures voltage AT ITS OWN JACKS.",
   "Add the two lead resistances: R_leads = 2 × 0.12 Ω = 0.24 Ω.",
   "Combine in series with the array: R_2wire = 0.01 Ω + 0.24 Ω = 0.25 Ω.",
   "Notice the massive measurement error: 0.25 Ω vs true 0.01 Ω is a +2400% error!",
   "Even worse: whether the board has 0 shorts (0.010 Ω), 1 short (~0.001 Ω), or 10 opens (0.0111 Ω), the 2-wire display still reads ~0.24–0.25 Ω, hiding ALL fault differences!",
   "Always verify 2-wire lead zero by shorting probe tips together, OR switch to a 4-wire Kelvin milliohmmeter.",
   "In 4-wire Kelvin, Force leads carry I_test while high-impedance Sense leads (~10 GΩ) draw ~0 A across the board pads directly, cancelling R_leads completely.",
   "Always check probe method on low-impedance (< 1 Ω) power rails before diagnosing opens or shorts."
  ],
  reroll:(rnd)=>{
   const rL=rnd([0.08,0.10,0.14,0.18]), ans=0.01+2*rL;
   return {
    prompt:`2-Wire Lead Error (Custom #): Each test lead measures ${rL.toFixed(2)} Ω. You measure the healthy 0.01 Ω array in 2-wire Ω mode. What resistance in Ω does the DMM display?`,
    sub:`R_2wire = 0.01 + 2 * ${rL.toFixed(2)} = ${roundN(ans)} Ω`,
    expected:roundN(ans)
   };
  }
 },
 {
  id:"HWD-05",kind:"number",unit:"A",
  title:"Phase A Short Hunt: Current-Divider Hogging into a 0 Ω Short",
  prompt:"Because one shorted resistor R14 shows ~0 Ω (physical solder bridge = 2.0 mΩ = 0.002 Ω) in parallel with 99 healthy 1.0 Ω resistors, you safely connect a current-limited bench PSU set to 1.0 V max and I_limit = 2.50 A. How much current (in A) flows into the shorted R14 branch?",
  formula:"I_short = I_limit * (G_short / (G_short + 99 / R_nom))",
  sub:"I_short = 2.50 * ((1 / 0.002) / (1 / 0.002 + 99 / 1.0)) = 2.08681135 A",
  expected:2.50*(500/599),
  steps:[
   "Never apply an un-limited 5 V / 500 A source to a shorted board! Set V_limit = 0.5–1.0 V and I_limit = 1.0–2.5 A.",
   "Compute the conductance of the shorted branch: G_short = 1 / 0.002 Ω = 500 S.",
   "Compute the combined conductance of the 99 healthy 1.0 Ω branches: G_healthy = 99 / 1.0 Ω = 99 S.",
   "Find total array conductance: G_total = 500 + 99 = 599 S (R_eq,phys = 1.669 mΩ).",
   "Compute actual PSU voltage under 2.50 A CC mode: V_rail = 2.50 A × 0.001669 Ω = 4.17 mV (safe for 5 V components!).",
   "Compute current through R14 via current division: I_short = 2.50 A × (500 / 599) = 2.087 A, whereas each healthy 1 Ω resistor gets only 4.17 mV / 1 Ω = 4.17 mA!",
   "Power ratio: P_short / P_healthy ≈ (2.087²×0.002) / (0.00417²×1) ≈ 500× more localized heating at the defect point & trace!",
   "Point the FLIR IR camera at the PCB under CC current injection: the shorted trace/pad lights up immediately while all 99 healthy branches remain cool at ambient!"
  ],
  reroll:(rnd)=>{
   const rSh=rnd([0.001,0.002,0.004,0.005]), iLim=rnd([2.0,3.0,4.0]);
   const gS=1/rSh, ans=iLim*(gS/(gS+99));
   return {
    prompt:`Current Hogging (Custom #): Shorted branch has physical R_bridge = ${(rSh*1000).toFixed(1)} mΩ (${rSh} Ω) alongside 99 healthy 1.0 Ω resistors under I_limit = ${iLim.toFixed(1)} A CC mode. What current in A flows through the short?`,
    sub:`I_short = ${iLim.toFixed(1)} * ((1 / ${rSh}) / (1 / ${rSh} + 99 / 1.0)) = ${roundN(ans)} A`,
    expected:roundN(ans)
   };
  }
 },
 {
  id:"HWD-06",kind:"number",unit:"resistors",
  title:"Pinpoint the Exact Shorted Resistor Index via Millivolt Bus Gradient",
  prompt:"Your schematic shows R1..R100 arranged linearly along a copper +5V_MAIN bus bar (segment resistance R_seg = 0.25 mΩ per resistor tap from J1). You inject 2.0 A constant current into J1 (R1 end) to GND, and probe the copper bus drop from J1 to the node where ΔV stops increasing cleanly: ΔV_bus = 7.0 mV. At which resistor index k (1..100) is the short located?",
  formula:"k = deltaV_mV / (I_test_A * R_seg_mOhm)",
  sub:"k = 7.0 / (2.0 * 0.25) = 14 resistors",
  expected:14,
  steps:[
   "Check the PCB layout & schematic first: when 100 resistors tap off a bus copper pour from J1 (tap 1 → tap 100), current flows along the copper bus ONLY UP TO the dead short!",
   "Downstream of the short (from R_{k+1} to R100), almost zero current flows down the bus bar, so copper voltage flattens out (ΔV ≈ 0 between adjacent taps!).",
   "Set the DMM to DC mV (millivolts) or μV range, reference black probe at J1 +5V entry pad, and walk red probe along the +5V bus pads.",
   "Wait until the mV reading stops climbing — here it plateaus at ΔV_bus = 7.0 mV.",
   "Compute voltage drop per resistor tap: V_tap = I_test × R_seg = 2.0 A × 0.25 mΩ = 0.50 mV per tap.",
   "Divide total drop by drop per tap: k = 7.0 mV / 0.50 mV = 14 (meaning resistor R14!).",
   "Cross-verify by lifting one pad of R14 (power OFF!) and ohming R14 out-of-circuit: DMM reads 0.000 Ω (CONFIRMED SHORT).",
   "Re-check the bus with 4-wire Kelvin afterward: if R_eq is STILL < 10 mΩ (e.g., ~1 mΩ), a SECOND short (like R62) exists downstream — keep hunting before checking opens!"
  ],
  reroll:(rnd)=>{
   const idx=rnd([14,22,38,42,62,75]), iT=rnd([2.0,4.0]), rTap=0.25;
   const dv=idx*iT*rTap;
   return {
    prompt:`Copper Bus mV Gradient (Custom #): With R_seg = 0.25 mΩ/tap and I_test = ${iT.toFixed(1)} A injected at J1, ΔV_bus plateaus at ${dv.toFixed(2)} mV. Which resistor index k is shorted?`,
    sub:`k = ${dv.toFixed(2)} / (${iT.toFixed(1)} * 0.25) = ${idx} resistors`,
    expected:idx
   };
  }
 },
 {
  id:"HWD-07",kind:"number",unit:"°C",
  title:"Phase B Open Hunt: IR Camera Temperature of Healthy vs Open Resistors",
  prompt:"Once all 0 Ω shorts are removed, you apply a safe regulated 1.0 V DC bias to the 100 × 1.0 Ω array (ambient T_amb = 25 °C, each resistor R_θJA = 35 °C/W). What steady-state surface temperature in °C does an IR camera read on a HEALTHY 1.0 Ω resistor (while OPEN ∞ Ω resistors remain cold at 25 °C)?",
  formula:"T_healthy = T_amb + ((V_test^2 / R_nom) * R_theta)",
  sub:"T_healthy = 25 + (((1.0^2) / 1.0) * 35) = 60 °C",
  expected:60,
  steps:[
   "Why wait until all 0 Ω shorts are cleared first? Because a dead short collapses V_rail ≈ 0 V, keeping BOTH healthy and open resistors cold at 25 °C!",
   "Once all shorts are removed, every remaining parallel resistor sees the exact same test voltage V_test = 1.0 V (or full 5 V if rated/pulsed).",
   "Compute power dissipated by ONE healthy 1.0 Ω resistor: P_healthy = V_test² / R_nom = (1.0 V)² / 1.0 Ω = 1.0 W.",
   "Compute temperature rise above ambient: ΔT = P_healthy × R_θJA = 1.0 W × 35 °C/W = 35 °C.",
   "Add ambient temperature: T_healthy = 25 °C + 35 °C = 60 °C.",
   "Compute open resistor (R = ∞ Ω) temperature: P_open = V_test² / ∞ = 0 W → T_open = 25 °C + 0 = 25 °C!",
   "Look at the FLIR IR image: 97 resistors glow uniformly warm at ~60 °C, and the 3 OPEN resistors (R27, R53, R88) jump out immediately as dark/blue 25 °C COLD SPOTS!",
   "Tip: apply matte Kapton tape or high-emissivity check if bare metal/ceramic glossy pads distort IR emissivity, then power OFF and lift one pad on each cold resistor to confirm OL (∞ Ω)."
  ],
  reroll:(rnd)=>{
   const v=rnd([0.8,1.0,1.2,1.5]), tA=rnd([22,25]), rTh=rnd([30,35,40]);
   const ans=tA+((v*v)/1.0)*rTh;
   return {
    prompt:`IR Open-Hunt Contrast (Custom #): Shorts are cleared. Bias = ${v.toFixed(1)} V across 1.0 Ω resistors, T_amb = ${tA} °C, R_θJA = ${rTh} °C/W. Find healthy resistor surface temperature in °C (open = ${tA} °C).`,
    sub:`T_healthy = ${tA} + (((${v.toFixed(1)}^2) / 1.0) * ${rTh}) = ${roundN(ans)} °C`,
    expected:roundN(ans)
   };
  }
 },
 {
  id:"HWD-08",kind:"number",unit:"steps",
  title:"Binary Half-Split Search Worst-Case Splits Across 100 Parallel Resistors",
  prompt:"When isolating a stubborn 0 Ω short by cutting/opening PCB bank jumpers or trace bridges in binary half-splits across N = 100 parallel resistors, what is the minimum number of binary split steps required in the worst case to guarantee pinpointing any single branch (round up ceil(log2(100)))?",
  formula:"N_splits = ceil(log2(N))",
  sub:"N_splits = 7 steps",
  expected:7,
  steps:[
   "Notice the exponential speed of half-split isolation vs lifting 100 resistors one by one (which averages 50 desolders and risks damaging 50 PCB pads!).",
   "Compute powers of 2 bounding N = 100: 2⁶ = 64 < 100 ≤ 128 = 2⁷.",
   "Take log2(100) ≈ 6.644 steps, and round up to integer hardware cuts/jumper opens: 7 splits!",
   "Walk through the cuts: Step 1 splits 100 → 50 vs 50 (measure each 50-branch half with 4-wire Kelvin to see which half holds the 0 Ω short).",
   "Step 2 splits 50 → 25; Step 3 splits 25 → 13; Step 4 → 7; Step 5 → 4; Step 6 → 2; Step 7 isolates the single shorted resistor out of 100!",
   "Combine with schematic: if the schematic already groups R1–R100 into 10 banks via test jumpers JP1–JP10 (10 resistors per bank), lifting only a few jumpers finds the bad bank immediately.",
   "If an IR camera + mV probe are available on the bench, you don't even have to cut traces — you go straight to the hotspot first and only lift ONE pad to verify!",
   "In an avionics hardware interview, contrast linear O(N) unsoldering vs binary O(log₂ N) half-splitting + non-destructive IR/Kelvin localization."
  ]
 },
 {
  id:"HWD-09",kind:"text",
  title:"Complete Master Interview Walkthrough: 5 V, 100 × 1 Ω Parallel Opens & Shorts",
  prompt:"Interview Simulation: A 5 V rail feeds 100 × 1 Ω resistors in parallel. Some resistors are OPEN and some are SHORTED (reading 0 Ω instead of 1 Ω). Walk through EVERY step cleanly: (1) Paper math & broken values first, (2) Schematic lookup, (3) Bench tools (IR camera, 4-wire DMM vs 2-wire), and (4) Step-by-step isolation of shorts first, then opens.",
  expected:undefined,
  rubric:[
   {label:"Paper math & broken values (10 mΩ, 500 A, 0 Ω & ∞ Ω)",hint:"State healthy R_eq = 1/100 = 0.01 Ω (10 mΩ), I = 500 A, shorted R = 0 Ω drags bus to ~0 Ω and masks opens (∞ Ω).",tokens:["10","0.01","500","0","open","infinite","parallel"]},
   {label:"Schematic + DMM limitation (4-wire Kelvin / mV / lift pad)",hint:"Explain reading schematic for net/designators/jumpers, why 2-wire leads (0.24 Ω) swamp 10 mΩ, using 4-wire Kelvin & lifting one pad for out-of-circuit DMM check.",tokens:["schematic","kelvin","4-wire","lead","lift","isolate","dmm","multimeter"]},
   {label:"Shorts first with current limit + IR hotspots, then opens via cold spots & KCL",hint:"Explain current-limiting PSU so 0 Ω short lights up as IR hotspot, removing shorts, then biasing safely to spot ∞ Ω opens as cold spots and verifying count N - 1/R_eq.",tokens:["ir","infrared","thermal","current limit","hot","cold","short","open"]}
  ],
  steps:[
   "1) PAPER MATH FIRST (ZERO TOOLS YET): Compute healthy R_eq = R/N = 1 Ω / 100 = 0.01 Ω (10 mΩ). At V = 5 V, each healthy branch carries 5 V / 1 Ω = 5 A (P = 25 W), giving healthy I_total = 500 A and P_total = 2500 W.",
   "2) DEFINE BROKEN RESISTOR VALUES: A shorted resistor drops from 1 Ω → 0 Ω (bridge ~1–5 mΩ). An open resistor rises from 1 Ω → ∞ Ω (OL, 0 A, 0 W). Critically: 1/R_eq = Σ(1/R_i), so even ONE 0 Ω short makes overall R_eq ≈ 0 Ω (~1 mΩ), drawing massive current and MASKING all ∞ Ω opens!",
   "3) READ THE SCHEMATIC NEXT: Before probing, open the schematic & BOM to locate reference designators R1..R100, net names (+5V_MAIN, GND), copper feed entry (J1), and any bank isolation jumpers (JP1..JP10) or Kelvin test points.",
   "4) WHY 2-WIRE IN-CIRCUIT DMM FAILS: Probing across any single resistor in-circuit measures the entire parallel bank in parallel with R_x, plus ~0.24 Ω of probe leads — completely hiding 10 mΩ vs 1 mΩ! Therefore we use a 4-wire Kelvin milliohmmeter AND never accept an in-circuit measurement as proof of one component.",
   "5) HUNT 0 Ω SHORTS FIRST (POWER-LIMITED + IR CAMERA + mV GRADIENT): Set a bench PSU safely to V_clamp ≤ 1.0 V, I_limit = 1–3 A (CC mode). Most of the limited current may follow a low-resistance path, but its dissipated power can be only milliwatts, so a visible IR hotspot is NOT guaranteed. Confirm by walking a DC mV DMM along the copper bus (voltage drop flattens right at the shorted tap).",
   "6) ISOLATE & CONFIRM SHORTS OUT-OF-CIRCUIT: Power OFF. Desolder/lift one pad of the suspect resistor (or open bank jumper). Measure the lifted resistor directly with DMM: 0.000 Ω confirms SHORT! Re-check array with 4-wire Kelvin — if R_eq is still < 10.00 mΩ, another 0 Ω short exists (repeat hotspot hunt until R_eq ≥ 10.00 mΩ).",
   "7) HUNT ∞ Ω OPENS NEXT (IR COLD SPOTS + PAPER MATH CHECK): Once 0 shorts remain, re-compute how many opens remain from 4-wire R_eq: N_open = 100 − (1.0 Ω / R_eq). Apply safe low bias (e.g., 1 V would require ~100 A total and is NOT a 2.5 A bench test). An OPEN resistor dissipates zero, but a current-limited 10 mΩ bank may heat every healthy branch by less than 1 mW; camera contrast is NOT guaranteed!",
   "8) REWORK & FINAL PASS VERIFICATION: Power OFF, lift/inspect cracked solder fillets or open cold resistors (DMM reads OL / ∞ Ω), replace defective 0 Ω and ∞ Ω parts with verified 1.00 Ω resistors, and confirm final 4-wire R_eq = 10.00 mΩ ± tolerance and nominal bus current."
  ]
 },
 {
  id:"HWD-10",kind:"text",
  title:"Transfer Skill: Hunting 1 Shorted MLCC Among 50 Parallel Decoupling Capacitors",
  prompt:"Avionics Extension: A +3.3V_CORE rail has 50 identical 10 µF ceramic capacitors (C1–C50) in parallel. A DMM reads 0.08 Ω to ground instead of high-Z / kilo-ohms, so the supply enters overcurrent protection. Using the exact same paper-math + schematic + IR camera + Kelvin microvolt methodology, explain how you find the single cracked/shorted MLCC without lifting all 50 capacitors.",
  expected:undefined,
  rubric:[
   {label:"Compare expected rail R vs measured 0.08 Ω on schematic",hint:"Explain why all 50 parallel caps share +3.3V_CORE and GND so in-circuit DMM reads 0.08 Ω everywhere.",tokens:["parallel","schematic","50","0.08","short","mask"]},
   {label:"Use safe current-limited CC injection (≤1 V / ≤2 A) + IR camera",hint:"Clamp voltage below silicon/rail max (≤1 V) in CC mode so I²R heats ONLY the shorted MLCC for the IR camera.",tokens:["ir","infrared","camera","current limit","hot","volt"]},
   {label:"Use 4-wire microvolt gradient & lift pad to confirm",hint:"Walk mV/μV probe along +3.3V plane toward minimum voltage / max drop, then lift one side of suspect Ck to verify.",tokens:["kelvin","microvolt","mv","lift","isolate","confirm"]}
  ],
  steps:[
   "Compute expectation first: healthy 3.3 V digital core rails show several ohms to kilo-ohms (never 0.08 Ω steady DC). A 0.08 Ω reading indicates a low-resistance short anywhere on the shared net.",
   "Open schematic & layout: highlight all 50 bypass caps C1–C50 across +3.3V_CORE and GND, noting trace widths and power entry connector.",
   "Apply current-limited CC injection safely: set PSU to V_max = 0.8 V (well below 3.3 V abs max and ESD diode turn-on!) and I_limit = 2.0 A.",
   "Calculate heat generated at the 0.08 Ω short: P = I²R = (2 A)² × 0.08 Ω = 0.32 W concentrated in one tiny 0402/0603 MLCC → distinct thermal hotspot on IR camera!",
   "Sweep with FLIR IR camera (or isopropyl alcohol evaporation if IR unavailable); use matte Kapton over shiny solder pads so emissivity is consistent.",
   "Cross-verify with 4-wire DMM / μV probe: trace current flow across the copper power plane by measuring mV drops from injection point toward the lowest-potential sink node.",
   "Power OFF, desolder ONLY the single suspect MLCC (e.g., C23), and measure both the lifted part (reads 0.08 Ω shorted) and the remaining PCB rail (jumps back to healthy high-Z!).",
   "Replace cracked capacitor with inspected flight lot, log serial/stress cause (board flex near mounting hole), and perform clean current-limited re-power."
  ]
 },
 {
  id:"HWD-11",kind:"text",
  title:"Series Sense Resistor + 20 Parallel Loads: Distinguishing Series Open vs Parallel Short",
  prompt:"Hardware Triage: A 5 V bus passes through ONE series 0.05 Ω current-sense shunt R_shunt into 20 parallel 1.0 Ω load branches (healthy R_eq = 0.05 + 1/20 = 0.10 Ω, V_node = 2.5 V). Compare the unmistakable downstream voltage and current fingerprints if (a) R_shunt opens, vs (b) ONE parallel branch shorts to 0 Ω.",
  expected:undefined,
  rubric:[
   {label:"Baseline paper math (R_eq = 0.10 Ω, V_node = 2.5 V, I = 50 A)",hint:"State series 0.05 Ω + parallel 0.05 Ω = 0.10 Ω total before diagnosing faults.",tokens:["0.05","0.10","2.5","parallel","series"]},
   {label:"Series shunt open drops downstream V to 0 V & I to 0 A",hint:"When series R_shunt opens, upstream stays at 5 V while downstream node = 0 V and current = 0 A.",tokens:["series","open","0 v","0 a","zero"]},
   {label:"Parallel branch short spikes current & collapses downstream node to ~0 V",hint:"When one parallel branch shorts to 0 Ω, R_eq drops to 0.05 Ω, current doubles toward 100 A/OCP, and V_node collapses.",tokens:["short","spike","collapse","current","0","parallel"]}
  ],
  steps:[
   "Calculate healthy bank equivalence on paper: 20 parallel 1.0 Ω loads = 1/20 = 0.05 Ω. Plus series R_shunt = 0.05 Ω gives R_total = 0.10 Ω.",
   "Calculate healthy divider voltage at the downstream node: V_node = 5 V × (0.05 / 0.10) = 2.50 V, and total current I = 50 A.",
   "Predict Case A (Series R_shunt OPEN): R_shunt = ∞ Ω breaks the single stem feeding all 20 loads. Result: upstream reads 5.0 V, downstream V_node collapses to 0 V, AND total current drops to 0 A!",
   "Predict Case B (ONE Parallel Load SHORTED to 0 Ω): Parallel bank drops 0.05 Ω → 0 Ω. Only R_shunt = 0.05 Ω limits current, so current SPIKES (toward 5 V / 0.05 Ω = 100 A or PSU OCP!), R_shunt heats up intensely, AND V_node collapses toward 0 V!",
   "Notice the critical diagnostic contrast: both faults make downstream V_node ≈ 0 V, EXCEPT Series Open gives I_total = 0 A (board cold) while Parallel Short gives I_total = MAX/OCP (R_shunt + shorted branch blazing hot on IR!).",
   "Measure V_upstream vs V_downstream on the schematic first before lifting parts.",
   "Never inspect only downstream V_node — always pair voltage with supply current I_total!",
   "If Case B (parallel short), switch to CC injection downstream of R_shunt and use IR camera + 4-wire Kelvin to pinpoint which of the 20 loads shorted."
  ]
 },
 {
  id:"HWD-12",kind:"number",unit:"heaters",
  title:"Avionics Application: 28 V Spacecraft Heater Bank Open-Element Detection",
  prompt:"Spacecraft Application: A 28.0 V bus powers N = 25 parallel thin-film 28.0 Ω survival heater elements (healthy: 1.0 A per heater, 25.0 A total, R_eq = 1.12 Ω). During TVAC cold checkout, telemetry shows V_bus = 28.0 V and I_total = 22.0 A (no short circuit). How many parallel heater elements have failed OPEN (∞ Ω)?",
  formula:"N_open = N - (I_total / (V_bus / R_heater))",
  sub:"N_open = 25 - (22.0 / (28.0 / 28.0)) = 3 heaters",
  expected:3,
  steps:[
   "Verify safety first: I_total = 22.0 A < 25.0 A nominal, which immediately rules out a short circuit and points directly to open branches!",
   "Compute nominal current per single 28.0 Ω heater branch: I_single = 28.0 V / 28.0 Ω = 1.00 A.",
   "Compute expected healthy array resistance: R_eq,healthy = 28.0 Ω / 25 = 1.120 Ω, expected I_healthy = 25.0 A.",
   "Divide actual bus current by single-branch current: m = I_total / I_single = 22.0 A / 1.00 A = 22 functioning heaters.",
   "Subtract from N = 25 total heaters: N_open = 25 − 22 = 3 open heater elements.",
   "Predict TVAC IR thermography & resistance verification: 3 heaters stay cold at ambient (0 W instead of 28 W each!), and power-OFF R_eq rises to 28.0 / 22 = 1.273 Ω.",
   "Check harness connectors & Kapton heater flex tails on the schematic before condemning the bus PCBA.",
   "Write an explicit NO-GO disposition until all 3 open heater channels are isolated, verified OL (∞ Ω), repaired, and re-measured at 25.0 A."
  ],
  reroll:(rnd)=>{
   const k=rnd([2,3,4,5,6,7]), iTot=25-k;
   return {
    prompt:`28 V Heater Open Count (Custom #): Same 28 V, 25 × 28.0 Ω parallel heater bank draws I_total = ${iTot.toFixed(1)} A instead of 25.0 A. How many heaters are OPEN?`,
    sub:`N_open = 25 - (${iTot.toFixed(1)} / (28.0 / 28.0)) = ${k} heaters`,
    expected:k
   };
  }
 }
];

function gradeProblem(prob,raw){
 if(prob.kind==="text"){
  const txt=String(raw||"").toLowerCase();
  if(txt.trim().length<12)return {band:"insufficient",good:false,msg:"Write a fuller explanation (mention paper math values, schematic check, IR camera, and DMM 4-wire / pad isolation)."};
  const met=[],missing=[];
  for(const item of prob.rubric){
   const ok=item.tokens.some(tk=>txt.includes(tk));
   (ok?met:missing).push(item);
  }
  if(met.length===prob.rubric.length)return {band:"likely-correct",good:true,msg:`Likely correct (${met.length}/${prob.rubric.length} engineering pillars covered): ${met.map(m=>m.label).join(" · ")}`};
  return {band:"partial",good:false,msg:`Covered ${met.length}/${prob.rubric.length}. Missing: ${missing.map(m=>m.label+" ("+m.hint+")").join(" | ")}`};
 }
 const s=String(raw||"").trim().replace(/,/g,"").replace(/μ/g,"µ");
 const m=s.match(/^([-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)\s*([a-zA-ZµΩ°/]+)?$/i);
 if(!m)return {band:"insufficient",good:false,msg:`Enter a number (e.g., ${roundN(prob.expected,4)} ${prob.unit}).`};
 let val=Number(m[1]), u=(m[2]||"").toLowerCase();
 // Normalize common units safely
 if(prob.unit==="mΩ"&&(u==="ω"||u==="ohm"||u==="ohms"))val*=1000;
 else if(prob.unit==="Ω"&&(u==="mω"||u==="mohm"||u==="mohms"))val/=1000;
 else if(prob.unit==="A"&&(u==="ma"))val/=1000;
 else if(prob.unit==="mA"&&(u==="a"))val*=1000;
 const tol=Math.max(Math.abs(prob.expected)*0.015,1e-4);
 if(Math.abs(val-prob.expected)<=tol){
  return {band:"likely-correct",good:true,msg:`Correct! ${roundN(prob.expected,5)} ${prob.unit} verified against paper-math formula.`};
 }
 return {band:"needs-correction",good:false,msg:`Not quite — got ${m[1]}${m[2]?" "+m[2]:""}, expected ${roundN(prob.expected,5)} ${prob.unit}. Check steps 2–5 & unit conversions.`};
}

function heatColor(tempC,irPhase,st){
 // False-color Ironbow/FLIR palette calibrated for clear teaching contrast
 if(st==="open"&&irPhase==="open_bias"&&tempC<28)return {fill:"#133878",stroke:"#63a4ff",txt:"#dbeafe"}; // Cold spot (blue)
 if(tempC>=95)return {fill:"#fff6b3",stroke:"#ff3b30",txt:"#7f1d1d"}; // Blazing white-yellow IR hotspot (0 Ohm short)
 if(tempC>=68)return {fill:"#ff9b26",stroke:"#ffd000",txt:"#431407"};
 if(tempC>=48)return {fill:"#d94e34",stroke:"#ff9b7a",txt:"#fff"}; // Warm healthy resistor (~60 C)
 if(tempC>=30)return {fill:"#6b2b6e",stroke:"#ba68c8",txt:"#f3e5f5"};
 return {fill:"#1b2a4a",stroke:"#4b6b94",txt:"#b8cde6"}; // Cool ambient (~25 C)
}

function renderMatrixSvg(calc,viewMode,selectedId){
 const cols=10,rows=10,cellW=66,cellH=40,padX=64,padY=52;
 const W=padX+cols*cellW+22,H=padY+rows*cellH+46;
 const isIr=viewMode==="ir";
 let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="100 parallel 1 ohm resistor PCB array and IR thermal view">`;
 s+=`<rect width="${W}" height="${H}" rx="8" fill="${isIr?"#07101f":"#f8fbff"}"/>`;
 s+=`<text x="16" y="23" font-size="13" font-weight="800" fill="${isIr?"#ffe38a":"#154866"}">${isIr?(calc.irPhase==="short_limit"?"IR CAMERA · CURRENT-LIMITED 1 V / 2.5 A SHORT HUNT (HOTSPOTS = 0 Ω SHORTS)":"IR CAMERA · SAFE 1.0 V BIAS OPEN HUNT (DARK BLUE COLD SPOTS = ∞ Ω OPENS)"):"PCB SCHEMATIC &amp; BANK MAP · +5V_MAIN (TOP BUS) TO GND (BOTTOM BUS) · R1..R100 PARALLEL"}</text>`;
 s+=`<text x="16" y="40" font-size="10.5" fill="${isIr?"#9ac1df":"#4b6b80"}">Click any resistor R1–R100 to probe it, cycle Healthy (1 Ω) / Short (0 Ω) / Open (∞ Ω), or lift 1 pad out-of-circuit.</text>`;

 // Top copper +5V bus bar (shows J1 injection + mV drop direction)
 s+=`<rect x="${padX}" y="44" width="${cols*cellW-6}" height="6" rx="2" fill="${calc.activeShorts>0?"#e25241":"#1b8270"}"/>`;
 s+=`<text x="10" y="51" font-size="10" font-weight="800" fill="${isIr?"#ff9f87":"#0e5f6b"}">J1 +${calc.vs}V →</text>`;

 for(let rIdx=0;rIdx<calc.n;rIdx++){
  const r=calc.rows[rIdx];
  const row=Math.floor(rIdx/cols), col=rIdx%cols;
  const x=padX+col*cellW, y=padY+row*cellH;
  const isSel=r.id===selectedId;

  let fill="#eaf7f0",stroke="#27926b",tColor="#0c553b",badge="1.0Ω";
  if(!r.inCircuit){
   fill="#eef2f6";stroke="#8ea1b2";tColor="#55687a";badge="LIFT";
  }else if(isIr){
   const hc=heatColor(r.tempC,calc.irPhase,r.st);
   fill=hc.fill;stroke=hc.stroke;tColor=hc.txt;
   badge=r.tempC.toFixed(0)+"°C";
  }else if(r.st==="short"){
   fill="#ffe1df";stroke="#d32f2f";tColor="#9b1c1c";badge="0 Ω !";
  }else if(r.st==="open"){
   fill="#e8f0fe";stroke="#3b6fd8";tColor="#1d449b";badge="∞ OL";
  }

  if(row%1===0 && col===0){
   s+=`<text x="10" y="${y+22}" font-size="10" font-weight="750" fill="${isIr?"#8db7d8":"#27526d"}">B${row+1}${calc.bankSummary[row].jumperClosed?"":" (OPEN)"}</text>`;
  }
  s+=`<g class="av-hwd-rnode" data-hwd-rid="${r.id}" tabindex="0" role="button" aria-label="Resistor R${r.id} ${r.st}">`;
  s+=`<rect x="${x+2}" y="${y+3}" width="${cellW-8}" height="${cellH-7}" rx="5" fill="${fill}" stroke="${isSel?"#8b2cf5":stroke}" stroke-width="${isSel?3:1.5}" ${r.inCircuit?"":'stroke-dasharray="3 2"'}/>`;
  s+=`<text x="${x+(cellW-4)/2}" y="${y+16}" text-anchor="middle" font-size="10.5" font-weight="800" fill="${tColor}">R${r.id}</text>`;
  s+=`<text x="${x+(cellW-4)/2}" y="${y+30}" text-anchor="middle" font-size="9.5" font-weight="700" fill="${tColor}">${badge}</text>`;
  s+=`</g>`;
 }
 s+=`<text x="${padX}" y="${H-14}" font-size="10.5" font-weight="750" fill="${isIr?"#93bcd8":"#264c66"}">Legend: Ideal short = 0 Ω (IR NOT guaranteed) | Open = OL (contrast depends on power) | Selected = R${selectedId}</text>`;
 s+=`</svg>`;
 return s;
}

const uiState={
 presetId:"interview_mixed",
 array:makeArrayFromPreset("interview_mixed"),
 jumpers:Array(10).fill(true),
 lifted:new Set(),
 selectedId:14,
 viewMode:"ir", // "schematic" | "ir" | "dmm" | "jumpers"
 irPhase:"short_limit", // "short_limit" | "open_bias"
 probIdx:0,
 customVariants:{},
 drafts:{},
 feedback:{},
 solved:{}
};

function currentProblem(){
 const base=PROBLEMS[uiState.probIdx]||PROBLEMS[0];
 return uiState.customVariants[base.id]||base;
}

function renderLabHtml(topic,q){
 const preset=PRESETS[uiState.presetId]||PRESETS.interview_mixed;
 const calc=calcArrayState(uiState.array,{
  vs:preset.vs,rNom:preset.rNom,jumpers:uiState.jumpers,lifted:uiState.lifted,irPhase:uiState.irPhase
 });
 const sel=calc.rows[uiState.selectedId-1]||calc.rows[0];
 const prob=currentProblem();
 const fb=uiState.feedback[prob.id]||null;

 const rEqText=calc.activeShorts>0
  ?`~${(calc.rEqPhys*1000).toFixed(2)} mΩ (0 Ω SHORT MASK!)`
  :(Number.isFinite(calc.rEqIdeal)?`${(calc.rEqIdeal*1000).toFixed(3)} mΩ`:"OL / ∞ Ω");
 const iTotText=calc.activeShorts>0
  ?`TRIP / OCP (Bridge I=${calc.benchI.toFixed(2)} A @ ${(calc.benchV*1000).toFixed(1)} mV CC)`
  :`${calc.iTotalNominalIdeal.toFixed(1)} A @ ${calc.vs} V`;

 const solvedCount=Object.values(uiState.solved).filter(Boolean).length;

 // Open whenever user is on relevant topic OR question, and always easy to toggle
 const autoOpen=Boolean(
  (topic&&["parallel","schematics","instruments","kcl-kvl","power"].includes(topic.id))||
  (q&&/(parallel|100|short|open|kelvin|infrared|milliohm)/i.test(String(q.question||"")))
 );

 return `<details class="av-course-bridge av-hwd-wrap" id="avHwdDetails" ${autoOpen?"open":""}>
  <summary>
   <span>🛠️ Interview Hardware Debug Studio · 5 V, 100 × 1 Ω Parallel Array (Open &amp; Short Faults + IR Camera + 4-Wire DMM)</span>
   <span class="av-hwd-badge">12 Baby-Step Practice Problems (${solvedCount}/12 Solved)</span>
  </summary>
  <div class="av-hwd-studio" id="hwdStudio">
   <div class="av-hwd-banner">
    <h4>Interview Problem: 5.0 V Rail Feeding 100 Parallel 1.0 Ω Resistors (Mixed 0 Ω Shorts + ∞ Ω Opens)</h4>
    <p><strong>Model warning:</strong> 500 A / 2500 W is theoretical ONLY; supply current compliance applies in BOTH phases. A 2 mΩ bridge at a 2.5 A total limit may dissipate only milliwatts, so IR localization is NOT guaranteed. Temperatures are synthetic estimates, not camera measurements. <strong>Workflow Order:</strong> (1) <strong>Paper Math First</strong> (R<sub>eq,healthy</sub> = 1 Ω / 100 = <strong>10.00 mΩ</strong>, I<sub>total</sub> = <strong>500 A</strong>, 2500 W; broken: Short = <strong>0 Ω</strong>, Open = <strong>∞ Ω</strong>) → (2) <strong>Read Schematic</strong> (check net +5V_MAIN, R1..R100, jumpers) → (3) <strong>Hunt Shorts FIRST</strong> under safe CC limit via <strong>IR Camera Hotspot + mV Trace Gradient + Lift 1 Pad</strong> → (4) <strong>Hunt Opens SECOND</strong> via 4-Wire Kelvin (N<sub>open</sub> = 100 − 1/R<sub>eq</sub>) + <strong>IR Cold Spots</strong>.</p>
   </div>

   <div class="av-hwd-controls">
    <label class="av-hwd-ctl">Fault Scenario Preset
     <select id="hwdPreset">
      ${Object.values(PRESETS).map(pr=>`<option value="${esc(pr.id)}" ${pr.id===uiState.presetId?"selected":""}>${esc(pr.title)}</option>`).join("")}
     </select>
    </label>
    <label class="av-hwd-ctl">IR Camera / Supply Excitation Mode
     <select id="hwdIrPhase">
      <option value="short_limit" ${uiState.irPhase==="short_limit"?"selected":""}>Phase A: Current-Limited CC (≤1 V / ≤2.5 A · hotspot NOT guaranteed)</option>
      <option value="open_bias" ${uiState.irPhase==="open_bias"?"selected":""}>Phase B: 1.0 V setting with ≤2.5 A compliance · weak IR contrast possible</option>
     </select>
    </label>
    <div class="av-hwd-ctl">Selected R${sel.id} Bench Action
     <div class="av-hwd-btnrow">
      <button type="button" class="av-hwd-btn ${sel.st==="ok"?"active":""}" data-hwd-set="ok">Set 1.0 Ω OK</button>
      <button type="button" class="av-hwd-btn ${sel.st==="short"?"active":""}" data-hwd-set="short">Fault 0 Ω Short</button>
      <button type="button" class="av-hwd-btn ${sel.st==="open"?"active":""}" data-hwd-set="open">Fault ∞ Ω Open</button>
      <button type="button" class="av-hwd-btn warn" id="hwdLiftBtn">${sel.inCircuit?"✂️ Lift 1 Pad (Isolate R"+sel.id+")":"🔌 Re-solder Pad R"+sel.id}</button>
     </div>
    </div>
   </div>

   <div class="av-hwd-kpis">
    <div class="av-hwd-kpi ${calc.activeShorts>0?"fault":calc.activeOpens>0?"":"ok"}">
     <small>4-Wire Kelvin R_eq</small>
     <strong id="hwdKpiReq">${esc(rEqText)}</strong>
    </div>
    <div class="av-hwd-kpi">
     <small>2-Wire DMM (w/ 0.24 Ω Leads)</small>
     <strong id="hwdKpi2W">${Number.isFinite(calc.r2Wire)?calc.r2Wire.toFixed(3)+" Ω (Error!)":"OL"}</strong>
    </div>
    <div class="av-hwd-kpi ${calc.activeShorts>0?"fault":""}">
     <small>Nominal 5 V Current</small>
     <strong id="hwdKpiItot">${esc(iTotText)}</strong>
    </div>
    <div class="av-hwd-kpi">
     <small>In-Circuit Fault Count</small>
     <strong id="hwdKpiFaults">${calc.activeShorts} Short (0 Ω) · ${calc.activeOpens} Open (∞ Ω)</strong>
    </div>
    <div class="av-hwd-kpi ${sel.inCircuit?"":"ok"}">
     <small>R${sel.id} Out-of-Circuit (Lifted)</small>
     <strong id="hwdKpiSel">${esc(sel.isolatedDmm)}</strong>
    </div>
   </div>

   <div class="av-hwd-tabs" role="tablist">
    <button type="button" class="av-hwd-btn ${uiState.viewMode==="ir"?"active":""}" data-hwd-view="ir">🌡️ IR Camera + 100-Resistor Matrix</button>
    <button type="button" class="av-hwd-btn ${uiState.viewMode==="schematic"?"active":""}" data-hwd-view="schematic">📐 PCB Schematic &amp; Bank Status</button>
    <button type="button" class="av-hwd-btn ${uiState.viewMode==="dmm"?"active":""}" data-hwd-view="dmm">📟 DMM Probe Table (2W vs 4W Kelvin vs mV Trace)</button>
    <button type="button" class="av-hwd-btn ${uiState.viewMode==="jumpers"?"active":""}" data-hwd-view="jumpers">🔀 Half-Split Sub-Bank Jumpers (JP1–JP10)</button>
   </div>

   <div class="av-hwd-main">
    <div class="av-hwd-board">
     <h5>${uiState.viewMode==="ir"?"Synthetic IR Model (Not a Real Camera) · 100 Parallel Resistors":uiState.viewMode==="dmm"?"Bus Copper mV Drop + Kelvin Node Probing":uiState.viewMode==="jumpers"?"Sub-Bank Half-Split Jumper Array (10 Resistors per Bank)":"Schematic Layout Map (R1–R100 across +5V_MAIN & GND)"}</h5>
     <div class="av-hwd-svgbox ${uiState.viewMode==="ir"?"":"light"}" id="hwdMatrixSvg">
      ${renderMatrixSvg(calc,uiState.viewMode==="dmm"?"schematic":uiState.viewMode,uiState.selectedId)}
     </div>
     <div class="av-hwd-jumpers" aria-label="Bank isolation jumpers">
      ${calc.bankSummary.map(b=>`<button type="button" class="av-hwd-jmp ${b.jumperClosed?"":"open"} ${b.shortsInCircuit>0?"has-short":""}" data-hwd-jmp="${b.bank}">
       JP${b.bank+1}: ${b.jumperClosed?"CLOSED":"OPEN"}<br><small>R${b.bank*10+1}–R${(b.bank+1)*10} · ${Number.isFinite(b.rBankPhys)?(b.rBankPhys*1000).toFixed(1)+" mΩ":"OL"}</small>
      </button>`).join("")}
     </div>
    </div>

    <div class="av-hwd-inspector">
     <h5>Active Probe Inspector · Resistor R${sel.id} (Bank B${sel.bank+1})</h5>
     <table class="av-hwd-table">
      <tbody>
       <tr><th>Schematic Net</th><td><code>+5V_MAIN</code> (Pin 1) to <code>GND</code> (Pin 2) · Designator <code>R${sel.id}</code></td></tr>
       <tr><th>Pad Connection</th><td>${sel.inCircuit?"<strong>In-Circuit</strong> (wired in parallel with active array)":"<strong>LIFTED / ISOLATED</strong> (1 pad unsoldered — safe true DMM check!)"}</td></tr>
       <tr><th>In-Circuit DMM (4-Wire)</th><td><code>${Number.isFinite(calc.r4Wire)?(calc.r4Wire*1000).toFixed(3)+" mΩ":"OL"}</code> ${calc.activeShorts>0?"(Masked by 0 Ω short!)":""}</td></tr>
       <tr><th>Out-of-Circuit DMM (1-Pad Lift)</th><td><strong><code>${esc(sel.isolatedDmm)}</code></strong></td></tr>
       <tr><th>DC Bus Drop @ Tap ${sel.id} (from J1)</th><td><code>${sel.busDropMv.toFixed(2)} mV</code> under ${calc.benchI.toFixed(2)} A bench test</td></tr>
       <tr><th>IR Surface Temp (${esc(uiState.irPhase)})</th><td><strong>${sel.tempC.toFixed(1)} °C</strong> (P = ${(sel.pBench*1000).toFixed(1)} mW, I<sub>branch</sub> = ${(sel.iBench*1000).toFixed(1)} mA)</td></tr>
       <tr><th>Diagnosis Rule</th><td>${calc.activeShorts>0?"Find &amp; isolate ALL 0 Ω hotspots first ("+calc.activeShorts+" remaining), then re-test for ∞ Ω opens.":calc.activeOpens>0?"0 shorts remain! Check "+calc.activeOpens+" IR cold spot(s) matching N_open = 100 − 1/R_eq.":"All in-circuit branches healthy: R_eq = 10.00 mΩ!"}</td></tr>
      </tbody>
     </table>
     <div class="av-hwd-btnrow" style="margin-top:10px">
      <button type="button" class="av-hwd-btn" id="hwdLiftAllClear">Reset Lifted Pads &amp; Close Jumpers</button>
      <button type="button" class="av-hwd-btn" id="hwdJumpToPhaseB">Simulate Shorts Fixed → Go Phase B (Opens Only)</button>
     </div>
     ${uiState.viewMode==="dmm"?`<table class="av-hwd-table" style="margin-top:10px"><thead><tr><th>Bank</th><th>4-Wire Bank Ω</th><th>Shorts in Bank</th><th>Opens in Bank</th></tr></thead><tbody>${calc.bankSummary.map(b=>`<tr><td>${esc(b.label)}</td><td>${b.jumperClosed?(Number.isFinite(b.rBankPhys)?(b.rBankPhys*1000).toFixed(2)+" mΩ":"OL"):"Jumper OPEN"}</td><td>${b.shortsInCircuit}</td><td>${b.opensInCircuit}</td></tr>`).join("")}</tbody></table>`:""}
    </div>
   </div>

   <div class="av-hwd-math">
    <h5>Paper-Math Formulas First (Stacked MathML) · Must Compute Before Touching Board</h5>
    ${window.AVIONICS_ARRAY_MATH_V40?.render("studio",q)||""}
    <div class="av-hwd-math-grid">
     ${mathBox("R_eq_healthy = (1 Ω) / 100 = 0.010 Ω = 10 mΩ","1. Healthy Parallel Resistance")}
     ${mathBox("I_total = 100 * ((5 V) / (1 Ω)) = 500 A","2. Hypothetical 5 V Draw (Do Not Apply Full Power)")}
     ${mathBox("G_no_short = N_healthy / R_nom","3. No-Short Case (an ideal 0 Ω short must be treated separately)")}
     ${mathBox("N_open = 100 - (1 Ω) / (0.010309278 Ω) = 3","4. Example: Count Opens ONLY After Shorts Cleared")}
    </div>
   </div>

   <div class="av-hwd-prob-deck" id="hwdProbDeck">
    <h5>Hardware Debug Practice Problems (12 Baby-Step Exercises) · Select Q1–Q12</h5>
    <div class="av-hwd-prob-pills">
     ${PROBLEMS.map((p,i)=>`<button type="button" class="av-hwd-prob-pill ${i===uiState.probIdx?"active":""} ${uiState.solved[p.id]?"done":""}" data-hwd-pidx="${i}">${p.id}: ${p.kind==="text"?"Interview":"Math"}</button>`).join("")}
    </div>
    <div class="av-hwd-banner" style="border-left-color:#6f36d1;margin-bottom:10px">
     <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px">
      <strong>${esc(prob.id)} · ${esc(prob.title)}</strong>
      ${prob.reroll?`<button type="button" class="av-hwd-btn" id="hwdRerollBtn">🎲 Practice New Numbers</button>`:""}
     </div>
     <p id="hwdProbPrompt">${esc(prob.prompt)}</p>
    </div>
    ${prob.formula?`<div class="av-hwd-math-grid">${mathBox(prob.formula,"GOVERNING EQUATION (MATHML)")}${prob.sub?mathBox(prob.sub,"WORKED PAPER SUBSTITUTION (MATHML)"):""}</div>`:""}
    <details open style="margin-top:10px">
     <summary style="cursor:pointer;font-weight:800;font-size:13px;color:#164a68">Baby-Step Completed Solution Walkthrough (All 8 Steps)</summary>
     <div class="av-hwd-steps">
      ${prob.steps.map((st,k)=>`<div class="av-hwd-step"><b>Step ${k+1}:</b> ${prob.id==="HWD-09"?"Corrected circuit analysis: "+esc(window.AVIONICS_ARRAY_MATH_V40?.steps[k]?.title||st):esc(st)}${prob.id==="HWD-09"?(window.AVIONICS_ARRAY_MATH_V40?.renderStep({id:"parallel-X8"},k)||""):""}</div>`).join("")}
     </div>
    </details>
    <div class="av-hwd-grade-box">
     ${prob.kind==="text"
      ?`<textarea id="hwdAnsInput" placeholder="Write your step-by-step engineer debug answer (paper math -> 0 Ω & ∞ Ω values -> schematic -> IR camera -> 4-wire DMM & lifted pad)...">${esc(uiState.drafts[prob.id]||"")}</textarea>`
      :`<input id="hwdAnsInput" type="text" placeholder="Type numeric answer (unit: ${esc(prob.unit)})" value="${esc(uiState.drafts[prob.id]||"")}"><span><strong>${esc(prob.unit)}</strong></span>`}
     <button type="button" class="av-hwd-btn primary" id="hwdCheckBtn">Check My Answer</button>
    </div>
    ${fb?`<div class="av-hwd-fb ${fb.good?"good":""}" id="hwdFeedback" role="status">${esc(fb.msg)}</div>`:'<div id="hwdFeedback" role="status"></div>'}
   </div>
  </div>
 </details>`;
}

function rerenderInHost(host){
 const target=host.querySelector("#avHwdContainer");
 if(!target)return;
 target.innerHTML=renderLabHtml(target._topic||null,target._question||null);
 // Keep <details> open once user interacted inside it
 const det=target.querySelector("#avHwdDetails");
 if(det)det.open=true;
 bind(host,target._topic,target._question);
}

function bind(host,topic,q){
 const container=host.querySelector("#avHwdContainer");
 if(container){
  container._topic=topic||null;
  container._question=q||null;
 }
 const root=host.querySelector("#hwdStudio");
 if(!root)return;

 const presetSel=root.querySelector("#hwdPreset");
 if(presetSel)presetSel.onchange=e=>{
  uiState.presetId=e.target.value;
  uiState.array=makeArrayFromPreset(uiState.presetId);
  uiState.jumpers=Array(10).fill(true);
  uiState.lifted=new Set();
  const p=PRESETS[uiState.presetId];
  uiState.selectedId=(p.shorts[0]||p.opens[0]||1);
  if(p.shorts.length===0&&p.opens.length>0)uiState.irPhase="open_bias";
  else uiState.irPhase="short_limit";
  rerenderInHost(host);
 };

 const irSel=root.querySelector("#hwdIrPhase");
 if(irSel)irSel.onchange=e=>{uiState.irPhase=e.target.value;rerenderInHost(host);};

 root.querySelectorAll("[data-hwd-rid]").forEach(el=>{
  el.onclick=()=>{uiState.selectedId=Number(el.dataset.hwdRid);rerenderInHost(host);};
  el.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();uiState.selectedId=Number(el.dataset.hwdRid);rerenderInHost(host);}};
 });

 root.querySelectorAll("[data-hwd-set]").forEach(btn=>{
  btn.onclick=()=>{
   uiState.array[uiState.selectedId-1]=btn.dataset.hwdSet;
   rerenderInHost(host);
  };
 });

 const liftBtn=root.querySelector("#hwdLiftBtn");
 if(liftBtn)liftBtn.onclick=()=>{
  if(uiState.lifted.has(uiState.selectedId))uiState.lifted.delete(uiState.selectedId);
  else uiState.lifted.add(uiState.selectedId);
  rerenderInHost(host);
 };

 const clrBtn=root.querySelector("#hwdLiftAllClear");
 if(clrBtn)clrBtn.onclick=()=>{
  uiState.lifted=new Set();
  uiState.jumpers=Array(10).fill(true);
  rerenderInHost(host);
 };

 const phaseBBtn=root.querySelector("#hwdJumpToPhaseB");
 if(phaseBBtn)phaseBBtn.onclick=()=>{
  // Lift all current shorts to simulate clearing them and enter Phase B open hunt
  uiState.array.forEach((st,idx)=>{if(st==="short")uiState.lifted.add(idx+1);});
  uiState.irPhase="open_bias";
  uiState.viewMode="ir";
  rerenderInHost(host);
 };

 root.querySelectorAll("[data-hwd-view]").forEach(btn=>{
  btn.onclick=()=>{uiState.viewMode=btn.dataset.hwdView;rerenderInHost(host);};
 });

 root.querySelectorAll("[data-hwd-jmp]").forEach(btn=>{
  btn.onclick=()=>{
   const b=Number(btn.dataset.hwdJmp);
   uiState.jumpers[b]=!uiState.jumpers[b];
   rerenderInHost(host);
  };
 });

 root.querySelectorAll("[data-hwd-pidx]").forEach(btn=>{
  btn.onclick=()=>{uiState.probIdx=Number(btn.dataset.hwdPidx);rerenderInHost(host);};
 });

 const rerollBtn=root.querySelector("#hwdRerollBtn");
 if(rerollBtn)rerollBtn.onclick=()=>{
  const base=PROBLEMS[uiState.probIdx];
  if(!base||!base.reroll)return;
  const pick=arr=>arr[Math.floor(Math.random()*arr.length)];
  const v=base.reroll(pick);
  uiState.customVariants[base.id]={...base,...v};
  delete uiState.feedback[base.id];
  rerenderInHost(host);
 };

 const ansIn=root.querySelector("#hwdAnsInput");
 if(ansIn)ansIn.oninput=e=>{uiState.drafts[currentProblem().id]=e.target.value;};

 const chkBtn=root.querySelector("#hwdCheckBtn");
 if(chkBtn)chkBtn.onclick=()=>{
  const p=currentProblem();
  const val=root.querySelector("#hwdAnsInput")?.value||"";
  uiState.drafts[p.id]=val;
  const res=gradeProblem(p,val);
  uiState.feedback[p.id]=res;
  if(res.good)uiState.solved[p.id]=true;
  rerenderInHost(host);
 };
}

function renderContainer(topic,q){
 return '<div id="avHwdContainer">'+renderLabHtml(topic,q)+'</div>';
}

window.avionicsHardwareDebugLab={
 PRESETS,
 PROBLEMS,
 makeArrayFromPreset,
 calcArrayState,
 gradeProblem,
 render:renderContainer,
 bind
};
})();
