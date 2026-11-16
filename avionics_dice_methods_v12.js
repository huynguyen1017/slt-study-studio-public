"use strict";
/* Method-safe numerical dice rotation for the 21 general EE topics.
 * Keeps older same-family drills at their anchor slots and prevents reusing
 * a different solving operation under a newly-authored calculation question.
 * Source data is original education content; no private Drive text is embedded. */
(function(){
 const Q=window.AVIONICS_QUESTIONS||[];
 const num=x=>Number(Number(x).toPrecision(10));
 const s=x=>String(Number(Number(x).toPrecision(10)));
 const baseByFamily=new Map();
 for(const q of Q.filter(q=>q.level==="Calculation"&&q.calcFamily)){
  const key=q.topic+"::"+q.calcFamily, originals=baseByFamily.get(key)||new Set();
  originals.add(q.originalNumeric?.question||q.question);
  baseByFamily.set(key,originals);
 }
 const configs={
  "ohm-C3":[[9,3.3],[15,4.7]],
  "parallel-C2":[[120,240,480],[220,330,660]],
  "parallel-C7":[[9,300,450,900],[5,200,400,800]],
  "kcl-kvl-C2":[[50,20,30,15],[60,25,40,18]],
  "kcl-kvl-C7":[[24,6,3,6],[30,5,5,5]],
  "thevenin-C2":[[2000,1000],[3300,2200]],
  "thevenin-C9":[[10,5,200,400],[8,16,330,660]],
  "ac-C2":[[12],[24]],
  "ac-C7":[[4],[1.25]],
  "capacitors-C2":[[4.7,10,22],[1,3.3,6.8]],
  "capacitors-C7":[[0.15,20,0.3],[0.25,12,0.2]],
  "rc-C2":[[2.2,22],[3.3,47]],
  "inductors-C2":[[10,6,12],[15,10,10]],
  "inductors-C7":[[3.3,1.5,12],[5,2.5,20]],
  "filters-C2":[[150,5],[220,10]],
  "filters-C7":[[2,0.2,40],[10,0.1,25]],
  "magnetics-C2":[[5,0.8],[12,0.25]],
  "magnetics-C7":[[400],[240]],
  "components-C2":[[9,0.65],[15,0.75]],
  "power-rails-C2":[[3.3,0.2,1.8,0.6,1,1.5],[5,0.3,3.3,0.2,1.2,1]],
  "power-rails-C7":[[5,25,20],[7,40,5]],
  "schematics-C1":[[120,180,220],[68,150,330]],
  "schematics-C2":[[0.22,0.91],[0.31,1.04]],
  "schematics-C6":[[5,2200,3300],[3.3,4700,10000]],
  "instruments-C2":[[8],[40]],
  "instruments-C7":[[80,1.5],[250,0.8]],
  "timing-C7":[[3.3,40],[5,15]],
  "buses-C2":[[1.8,1.2],[2.5,0.7]],
  "buses-C7":[[250,20],[500,16]],
  "python-scpi-C2":[[100,25,2],[400,8,1.2]],
  "python-scpi-C7":[[3.6,3.4,0.05],[5.2,5.0,0.04]],
  "linux-C2":[[9600,1200],[19200,2400]],
  "linux-C7":[[8,100,2.5],[10,25,1.25]],
  "rf-C2":[[1500],[4000]],
  "rf-C7":[[800,3200],[600,1800]],
  "qualification-C2":[[0.12,20,80],[0.25,-10,70]],
  "qualification-C7":[[0.90,0.95,0.98],[0.92,0.94,0.97]]
 };
 function build(id,v){
  const [a,b,c,d,e,f]=v;
  // Each formula is evaluated from the new values and is the same operation
  // as that slot's canonical worked problem. Constants are not randomized.
  switch(id){
   case "ohm-C3":return ["A "+b+" kΩ pull-down sees "+a+" V. Convert kΩ to Ω and find current in mA.","1000 * "+a+" / ("+b+" * 1000)",1000*a/(b*1000),"mA","Convert "+b+" kΩ to "+s(b*1000)+" Ω; calculate I=V/R; convert A to mA."];
   case "parallel-C2":return ["Three "+a+" Ω, "+b+" Ω and "+c+" Ω terminations share BOTH nodes of a three-branch network. Find Req in Ω.","1 / (1/"+a+" + 1/"+b+" + 1/"+c+")",1/(1/a+1/b+1/c),"Ω","Add all three conductances and invert. Req must be below the smallest branch."];
   case "parallel-C7":return ["A "+a+" V rail supplies three parallel branches of "+b+" Ω, "+c+" Ω and "+d+" Ω. Find TOTAL source current in mA.","1000 * "+a+" * (1/"+b+" + 1/"+c+" + 1/"+d+")",1000*a*(1/b+1/c+1/d),"mA","Find each Ibranch=V/R, sum the currents by KCL, and convert A to mA."];
   case "kcl-kvl-C2":return ["At a current junction, "+a+" mA and "+b+" mA enter; "+c+" mA and "+d+" mA leave through known branches. Find the additional leaving current in mA.","("+a+" + "+b+") - ("+c+" + "+d+")",(a+b)-(c+d),"mA","Sum incoming current and known outgoing current separately; subtract using consistent arrows."];
   case "kcl-kvl-C7":return ["A "+a+" V DC source opposes a "+b+" V motor back-EMF in a loop with "+c+" Ω harness and "+d+" Ω motor winding. Find loop current in A.","("+a+" - "+b+") / ("+c+" + "+d+")",(a-b)/(c+d),"A","Subtract the opposing source before dividing by BOTH series resistances."];
   case "thevenin-C2":return ["With its independent voltage source turned off (replaced by a short), a divider has "+a+" Ω and "+b+" Ω from output to common. Determine Rth in Ω.","("+a+" * "+b+") / ("+a+" + "+b+")",a*b/(a+b),"Ω","After shorting the ideal voltage source, both resistors connect across the same port; combine in parallel."];
   case "thevenin-C9":return ["Two Norton sources of "+a+" mA parallel "+c+" Ω and "+b+" mA parallel "+d+" Ω join the same A–B port. Find open-circuit Vth in V.","(("+a+" + "+b+") / 1000) * (("+c+" * "+d+") / ("+c+" + "+d+"))",((a+b)/1000)*(c*d/(c+d)),"V","Add source currents, find parallel Norton resistance, then multiply A by Ω."];
   case "ac-C2":return ["An oscilloscope displays "+a+" V peak-to-peak for a pure, zero-offset sine wave. Find RMS amplitude in V.","("+a+" / 2) / Math.sqrt(2)",a/(2*Math.sqrt(2)),"V","Divide peak-to-peak by two to find Vpeak; for a sine divide Vpeak by √2."];
   case "ac-C7":return ["Cursor marks show an AC waveform repeats after "+a+" ms. Find frequency in Hz.","1 / ("+a+" / 1000)",1000/a,"Hz","Convert milliseconds to seconds, then invert T to get f."];
   case "capacitors-C2":return ["Three capacitors "+a+" µF, "+b+" µF and "+c+" µF connect in parallel to an avionics rail. Find total capacitance in µF.",""+a+" + "+b+" + "+c,a+b+c,"µF","Parallel capacitances sum directly; account for each of the three paths."];
   case "capacitors-C7":return ["An electronics rail draws "+a+" A for "+b+" ms during hold-up and may droop at most "+c+" V. Find the minimum ideal capacitor bank in mF.","1000 * ("+a+" * ("+b+" / 1000)) / "+c,1000*(a*b/1000)/c,"mF","Convert ms to s; apply C=I·Δt/ΔV; convert F to mF."];
   case "rc-C2":return ["A power-good RC timer uses "+a+" kΩ and "+b+" µF. Find the practical 5τ settling time in ms.","5 * ("+a+" * 1000) * ("+b+" / 1000000) * 1000",5*a*b,"ms","Convert kΩ to Ω and µF to F; find τ=R·C; multiply by five and report ms."];
   case "inductors-C2":return ["An uncoupled "+a+" mH inductor is series with the parallel pair "+b+" mH || "+c+" mH. Find equivalent inductance in mH.",""+a+" + ("+b+" * "+c+") / ("+b+" + "+c+")",a+b*c/(b+c),"mH","First reduce the uncoupled parallel inductors reciprocally; then add the series inductance."];
   case "inductors-C7":return ["A constant "+a+" V appears across a "+b+" mH inductor for "+c+" µs. Calculate ideal ΔI in mA.","1000 * ("+a+" * ("+c+" / 1000000)) / ("+b+" / 1000)",1000*(a*c/1e6)/(b/1000),"mA","Use V=L·ΔI/Δt; convert µs to s and mH to H; calculate current, then A to mA."];
   case "filters-C2":return ["An RL filter uses R="+a+" Ω and L="+b+" mH. Find its −3 dB corner f=R/(2πL) in Hz.",""+a+" / (2 * Math.PI * ("+b+" / 1000))",a/(2*Math.PI*b/1000),"Hz","Convert inductance from mH to H; evaluate 2πL; divide resistance by that term."];
   case "filters-C7":return ["A series RLC circuit has L="+a+" mH, C="+b+" µF and damping R="+c+" Ω. Find dimensionless Q.","Math.sqrt(("+a+" / 1000) / ("+b+" / 1000000)) / "+c,Math.sqrt((a/1000)/(b/1e6))/c," ","Convert L to H and C to F; evaluate √(L/C), then divide by R."];
   case "magnetics-C2":return ["An ideal "+a+":1 step-down transformer draws "+b+" A RMS on its primary. Determine secondary RMS current in A.",""+a+" * "+b,a*b,"A","For an ideal transformer the secondary current scales inversely with voltage, by Np/Ns."];
   case "magnetics-C7":return ["A balanced Y-connected three-phase rack measures "+a+" V line-to-line. Determine line-to-neutral V in V.",""+a+" / Math.sqrt(3)",a/Math.sqrt(3),"V","For balanced Y, VL-L=√3·Vphase; divide by √3."];
   case "components-C2":return ["A full-wave silicon bridge is fed by "+a+" V RMS and has two conducting diode drops of "+b+" V each. Find ideal unloaded peak DC capacitor voltage in V.",""+a+" * Math.sqrt(2) - 2 * "+b,a*Math.sqrt(2)-2*b,"V","Convert RMS sine voltage to peak by √2, then subtract two forward diode drops."];
   case "power-rails-C2":return ["Three PCBA rails load at "+a+" V/"+b+" A, "+c+" V/"+d+" A, and "+e+" V/"+f+" A. Sum regulated load power in W.",""+a+" * "+b+" + "+c+" * "+d+" + "+e+" * "+f,a*b+c*d+e*f,"W","Calculate power on EACH rail using V·I, then sum the three watt values."];
   case "power-rails-C7":return ["A "+b+" mΩ Kelvin shunt carries "+a+" A; the sense amplifier has gain "+c+" V/V. Find ideal amplifier output in V.",""+a+" * ("+b+" / 1000) * "+c,a*b/1000*c,"V","Convert mΩ to Ω; multiply shunt current by resistance to get mV; multiply by gain."];
   case "schematics-C1":return ["An unpowered harness schematic has three resistive test paths "+a+" Ω, "+b+" Ω and "+c+" Ω connected purely in series. Find cold equivalent resistance in Ω.",""+a+" + "+b+" + "+c,a+b+c,"Ω","Check that there is no alternate branch, then add all three series resistances."];
   case "schematics-C2":return ["Shorted DMM leads show "+a+" Ω; measuring an unpowered strap gives "+b+" Ω including lead resistance. Find actual strap resistance in Ω.",""+b+" - "+a,b-a,"Ω","Subtract the lead offset from the measured 2-wire resistance, not vice versa."];
   case "schematics-C6":return ["An unloaded comparator divider uses Vin="+a+" V, Rtop="+b+" Ω and Rbottom="+c+" Ω. Find midpoint voltage relative to GND in V.",""+a+" * "+c+" / ("+b+" + "+c+")",a*c/(b+c),"V","Add the two divider resistances; multiply the source by bottom/total."];
   case "instruments-C2":return ["A waveform's highest frequency is "+a+" MHz. Calculate the absolute Nyquist minimum in MS/s (not a practical scope recommendation).","2 * "+a,2*a,"MS/s","Nyquist minimum is exactly twice the highest frequency; practical scopes need margin."];
   case "instruments-C7":return ["An in-series ammeter uses "+b+" Ω burden resistance while measuring "+a+" mA. Find voltage lost across the meter in V.","("+a+" / 1000) * "+b,a/1000*b,"V","Convert mA to A; meter burden is an added series resistor; calculate V=I·R."];
   case "timing-C7":return ["A PWM generator switches 0 to "+a+" V at "+b+"% duty and feeds an ideal averaging low-pass. Find mean output voltage in V.",""+a+" * ("+b+" / 100)",a*b/100,"V","Convert duty % to fraction; multiply the high-level voltage by the active fraction."];
   case "buses-C2":return ["UART TX clock is "+a+"% fast while RX clock is "+b+"% slow. Find combined magnitude of opposite baud drifts in %.",""+a+" + "+b,a+b,"%","For opposing errors add their absolute percentage magnitudes."];
   case "buses-C7":return ["A CAN bus runs "+a+" kbit/s with "+b+" time quanta per bit. Determine one quantum duration in ns.","1000000 / ("+a+" * "+b+")",1e6/(a*b),"ns","Bit time in ns is 1,000,000/kbit/s; divide by the number of quanta."];
   case "python-scpi-C2":return ["A Python SCPI sweep sends "+a+" sequential queries at "+b+" ms each and incurs "+c+" s initialization. Calculate total execution time in s.",""+a+" * ("+b+" / 1000) + "+c,a*b/1000+c,"s","Convert command milliseconds to seconds; multiply by query count; add fixed startup overhead."];
   case "python-scpi-C7":return ["An automated acceptance station observes mean "+b+" V, upper specification "+a+" V, σ="+c+" V. Find upper one-sided process capability Cpu.","("+a+" - "+b+") / (3 * "+c+")",(a-b)/(3*c)," ","Subtract mean from USL, divide by three times the measured standard deviation."];
   case "linux-C2":return ["UART capture logs "+a+" bytes/s for "+b+" seconds. Find raw data volume in decimal MB (10^6 B).",""+a+" * "+b+" / 1000000",a*b/1e6,"MB","Multiply byte rate by run time, then divide by 10^6 bytes per decimal MB."];
   case "linux-C7":return ["Logrotate stores "+a+" files of "+b+" MB each while writing "+c+" MB/min. Find total retention duration in hours.","("+a+" * "+b+") / ("+c+" * 60)",a*b/(c*60),"hours","Multiply file count by per-file capacity, divide by MB/min, then convert minutes to hours."];
   case "rf-C2":return ["Calculate ideal quarter-wave vacuum monopole length in cm at "+a+" MHz (ignore dielectric shortening).","(30000 / "+a+") / 4",30000/a/4,"cm","Use λ(cm)=30000/f(MHz); divide λ by four. Treat this as theory, not RF lab experience."];
   case "rf-C7":return ["A downlink range grows from "+a+" km to "+b+" km at constant frequency. Find additional free-space path loss in dB.","20 * log10("+b+" / "+a+")",20*Math.log10(b/a),"dB","Form the final/initial distance ratio, then calculate 20 log10(ratio)."];
   case "qualification-C2":return ["A precision voltage reference drifts "+a+" mV/°C from "+b+" °C to "+c+" °C. Find total signed drift in mV.",""+a+" * ("+c+" - ("+b+"))",a*(c-b),"mV","Find the signed temperature difference, multiply by temperature coefficient."];
   case "qualification-C7":return ["Serial production-test stations pass at "+s(100*a)+"%, "+s(100*b)+"% and "+s(100*c)+"%. Find rolled throughput yield RTY in %.","100 * "+a+" * "+b+" * "+c,100*a*b*c,"%","Convert percentages to fractions, multiply all stage yields, then scale to percent."];
   default:throw Error("Missing curated same-method numerical generator: "+id);
  }
 }
 let safe=0, generated=0, removed=0;
 for(const q of Q.filter(q=>q.level==="Calculation"&&q.originalNumeric)){
  const key=q.topic+"::"+q.calcFamily, disallowed=baseByFamily.get(key)||new Set();
  const before=q.variantPool||[];
  q.variantPool=before.filter(v=>v.question&&!disallowed.has(v.question)).map(v=>({...v}));
  removed+=before.length-q.variantPool.length;
  const cfg=configs[q.id];
  if(cfg){
   for(const inputs of cfg){
    const [question,expr,answer,unit,unitCheck]=build(q.id,inputs);
    if(!Number.isFinite(answer))throw Error(q.id+" bad generated answer");
    const rounded=num(answer),sub="Result = "+expr+" = "+s(rounded)+" "+unit;
    const steps=["Identify the given component values and the specific electrical quantity requested.",
     unitCheck,
     "Write the governing relationship: "+q.formula,
     "Substitute into the formula: "+expr+" = "+s(rounded)+" "+unit,
     "Check the final unit, physical direction, magnitude, and applicable safety limits."];
    q.variantPool.push({question,expected:rounded,unit,formula:q.formula,sub,steps,numericOperation:q.numericOperation,sourceMethod:q.numericOperation});
    generated++;
   }
  }
  if(!q.variantPool.length&&typeof q.variantGenerator!=="function")throw Error("No verified dice variant for "+q.id);
  for(const v of q.variantPool){
   v.sourceMethod=q.numericOperation;
   if(v.expected===undefined||!Number.isFinite(Number(v.expected)))throw Error("Nonfinite dice answer "+q.id);
  }
  safe++;
 }
 window.AVIONICS_DICE_METHODS_V12={slots:safe,generated,removed};
})();
