"use strict";
/* Replace numeric-only repeats with numerical skills: baseline physics,
   two-condition analysis, error, sample mean, repeatability spread,
   prediction comparison, limits, relative error, and signed margin. */
(function(){
const topics=window.AVIONICS_TOPICS||[],bank=window.AVIONICS_QUESTIONS||[],families=window.AVIONICS_CALC_FAMILIES||{};
const fix=x=>Number(Number(x).toPrecision(9));
const display=x=>Number(Number(x).toPrecision(6)).toString();
function lesson(q,title,summary,example){
 q.skillName=title;
 q.learningObjective=title;
 q.lesson={title,summary,example,why:"Use the stated circuit conditions, units, measurement reference and acceptance rules to defend the result.",
  vocab:[["Reference", "The predicted value under the stated electrical model."],["Measurement", "A reading associated with a defined instrument and test condition."],["Evidence", "A numerical comparison that can be independently checked."]]};
}
for(const [ti,t] of topics.entries()){
 const qs=bank.filter(q=>q.topic===t.id&&q.level==="Calculation").sort((a,b)=>a.variantIndex-b.variantIndex);
 const one=bank.filter(q=>q.topic===t.id&&q.calcFamily===t.calc[0]).sort((a,b)=>a.variantIndex-b.variantIndex);
 const two=bank.filter(q=>q.topic===t.id&&q.calcFamily===t.calc[1]).sort((a,b)=>a.variantIndex-b.variantIndex);
 if(one.length!==5||two.length!==5)throw Error("Missing numeric family for "+t.id);
 const old=[...one,...two].map(q=>({question:q.question,expected:q.expected,unit:q.unit,formula:q.formula,sub:q.sub}));
 function update(i,title,question,expected,unit,formula,sub,steps){
  const q=[...one,...two][i];
  if(!Number.isFinite(expected))throw Error("Nonfinite result "+q.id);
  q.originalNumeric={expected:q.expected,unit:q.unit,formula:q.formula,question:q.question};
  q.question=question;q.expected=fix(expected);q.unit=unit;q.formula=formula;q.sub=sub;q.steps=steps;
  q.numericOperation=title;q.hint="Identify the two test conditions and their physical units. Calculate the requested comparison, not merely the first scenario.";
  lesson(q,title,"This question develops a NEW numerical analysis operation: "+title+". Start by identifying the predicted physical quantity and then the added measurement or verification condition.","Check the reported unit, reference and model assumptions; independent measurement is not the same as a calculated prediction.");
 }
 // C1: fundamental family 1 formula; C6: fundamental family 2 formula
 for(const j of [0,5]){
  const q=[...one,...two][j];
  q.numericOperation=j===0?"First-principles calculation":"Second physical principle";
  const summary=j===0
   ?"Apply the primary governing law ("+(q.formula||"core relationship")+") directly to solve for the target quantity in "+q.unit+" from "+t.title+"."
   :"Solve this second independent "+t.title+" relationship ("+(q.formula||"physical model")+") cleanly into base SI powers before reporting in "+q.unit+".";
  const example=j===0
   ?"Substitute the problem inputs into "+(q.sub||q.formula)+" and confirm magnitude in "+q.unit+"."
   :"Convert any scaling prefixes before substituting into "+(q.sub||q.formula)+" so the final unit matches "+q.unit+".";
  lesson(q,q.numericOperation,summary,example);
 }
 {
  const a=old[0],b=old.slice(1,5).find(x=>Math.abs(x.expected-a.expected)>1e-12)||null;
  const actual=b||old[1],showB=b?b.question:"A repeat instrument reading is 10% above the first model value.";
  const valB=b?b.expected:fix(a.expected*1.10);
  const v=Math.abs(valB-a.expected);
  update(1,"Compare two circuit conditions",
    "Condition A: "+a.question+" Condition B: "+showB+" Compute the absolute change between the two results in "+actual.unit+". If B is a reading, compare it to the model rather than treating it as a second circuit law.",
    v,actual.unit,"Delta_x = |x_B - x_A|",
    "Delta_x = |"+display(valB)+" - "+display(a.expected)+"| = "+display(v),
    ["Solve case A using "+a.formula+": "+display(a.expected)+" "+a.unit+".",
     "Work out case B or the given independent reading: "+display(valB)+" "+actual.unit+".",
     "Take the magnitude of their difference; do not confuse it with the result for case B alone.",
     "Final absolute change: "+display(v)+" "+actual.unit+"."]);
 }
 {
  const b=old[2],ref=Math.abs(b.expected),measured=fix(ref*0.92),error=fix(ref-measured);
  update(2,"Compare predicted versus measured result",
    "Model case: "+b.question+" The predicted magnitude is "+display(ref)+" "+b.unit+" but the instrument reports "+display(measured)+" "+b.unit+". What absolute discrepancy must be investigated, in "+b.unit+"?",
    error,b.unit,"E_abs = |x_pred - x_meas|",
    "E_abs = "+display(ref)+" - "+display(measured)+" = "+display(error),
    ["The physical model predicts "+display(ref)+" "+b.unit+".","The actual instrument reports "+display(measured)+" "+b.unit+".",
     "Subtract the two values using the same unit; the absolute discrepancy does not establish root cause.",
     "Report error magnitude "+display(error)+" "+b.unit+" and investigate test setup, model and uncertainty."]);
 }
 {
  const b=old[3],ref=Math.abs(b.expected),a=fix(ref*0.97),z=fix(ref*1.04),mean=fix((a+ref+z)/3);
  update(3,"Average repeated engineering readings",
    "For "+t.title+", three repeated readings under the same conditions are "+display(a)+", "+display(ref)+" and "+display(z)+" "+b.unit+". Compute their arithmetic mean in "+b.unit+". Do not substitute the model prediction for a measured average.",
    mean,b.unit,"x_mean = (x_1 + x_2 + x_3) / 3",
    "x_mean = ("+display(a)+" + "+display(ref)+" + "+display(z)+") / 3 = "+display(mean),
    ["Write the three captured readings and their common unit.","Add readings rather than recomputing a circuit with new component values.",
     "Divide the sum by three to estimate the sample mean.",
     "Mean = "+display(mean)+" "+b.unit+"; investigate the spread separately."]);
 }
 {
  const b=old[4],ref=Math.abs(b.expected),low=fix(ref*0.945),high=fix(ref*1.065),range=fix(high-low);
  update(4,"Quantify repeatability spread",
    "In a repeatability study of "+t.title+", smallest reading is "+display(low)+" "+b.unit+" and largest is "+display(high)+" "+b.unit+". What is the peak-to-peak spread, in "+b.unit+"?",
    range,b.unit,"Range = x_max - x_min","Range = "+display(high)+" - "+display(low)+" = "+display(range),
    ["Identify the minimum and maximum observations, not the circuit's ideal current or voltage.",
     "Subtract the minimum from the maximum with a consistent unit.",
     "Do not confuse range with tolerance, accuracy or standard deviation.",
     "Observed spread = "+display(range)+" "+b.unit+"."]);
 }
 {
  const a=old[5],b=old.slice(6,10).find(x=>Math.abs(x.expected-a.expected)>1e-12)||null;
  const actual=b||old[6],showB=b?b.question:"An independent meter reading is 10% larger than the first calculated result.";
  const valB=b?b.expected:fix(a.expected*1.10);
  const diff=Math.abs(valB-a.expected);
  update(6,"Compare two independent calculated cases",
    "Two "+t.title+" observations are compared: Case A: "+a.question+" Case B: "+showB+" What is their absolute difference in "+actual.unit+"?",
    diff,actual.unit,"Delta_y = |y_B - y_A|","Delta_y = |"+display(valB)+" - "+display(a.expected)+"| = "+display(diff),
    ["Calculate the first physical case: "+display(a.expected)+" "+a.unit+".",
     "Calculate or read the second result: "+display(valB)+" "+actual.unit+".",
     "Compare outputs after confirming they use identical units and the same kind of quantity.",
     "Absolute difference = "+display(diff)+" "+actual.unit+"."]);
 }
 {
  const b=old[7],v=Math.abs(b.expected),limit=fix(v*0.97);
  update(7,"Calculate a lower acceptance bound",
    "A "+t.title+" measurement is predicted to have magnitude "+display(v)+" "+b.unit+". A stated lab rule allows ±3% variation about that nonnegative reference. Find the minimum acceptable magnitude in "+b.unit+".",
    limit,b.unit,"x_min = x_ref * (1 - 0.03)","x_min = "+display(v)+" * 0.97 = "+display(limit),
    ["Identify the predicted magnitude and stated ±3% band; this band is an educational assumption.",
     "Compute the lower factor: 1 − 0.03 = 0.97.",
     "Multiply reference by 0.97, preserving the original unit.",
     "Lower acceptance magnitude = "+display(limit)+" "+b.unit+"; check actual device specifications separately."]);
 }
 {
  const b=old[8],v=Math.abs(b.expected),factor=0.055+ti%5*0.01,meas=fix(v*(1+factor)),err=fix(100*(meas-v)/Math.max(v,1e-20));
  update(8,"Compute relative measurement error",
    "A "+t.title+" reference model predicts a magnitude of "+display(v)+" "+b.unit+". The instrument reports "+display(meas)+" "+b.unit+". What is the signed percentage deviation relative to the model (in %)?",
    err,"%","Error_pct = 100 * (x_meas - x_ref) / x_ref",
    "Error_pct = 100 * ("+display(meas)+" - "+display(v)+") / "+display(v)+" = "+display(err),
    ["The model reference is "+display(v)+" "+b.unit+".",
     "The observed value is "+display(meas)+" "+b.unit+".",
     "Subtract reading minus reference, then divide by reference and multiply by 100.",
     "Signed relative error = "+display(err)+"%. Check calibration before assigning cause."]);
 }
 {
  const b=old[9],v=Math.abs(b.expected),limit=fix(v*1.05),meas=fix(v*(1.015+ti%3*0.012)),margin=fix(limit-meas);
  update(9,"Determine signed margin to a limit",
    "A "+t.title+" test has an assumed upper limit of "+display(limit)+" "+b.unit+". The observed reading is "+display(meas)+" "+b.unit+". Compute signed margin (limit minus measured) in "+b.unit+"; what does its sign indicate?",
    margin,b.unit,"Margin = Limit - Measured",
    "Margin = "+display(limit)+" - "+display(meas)+" = "+display(margin),
    ["Record the limit and observed value under identical test conditions.",
     "Subtract measured from upper limit; preserve the sign, including negative results.",
     "Positive margin is below the upper limit; negative margin is above it.",
     "Signed margin = "+display(margin)+" "+b.unit+" before considering instrument uncertainty."]);
 }
 for(let i=0;i<10;i++){
  const q=[...one,...two][i];
  q.difficulty=11+i;
 }
}
window.AVIONICS_MATH_DIVERSITY_V10=true;
})();