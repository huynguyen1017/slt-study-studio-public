"use strict";
/* Original SVG lab illustrations and browser-only mini-quiz for all 23 topics. */
(function(){
const cases=window.AVIONICS_NOTEBOOK_CASES||{};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const blue="#1488bd",navy="#21405c",pink="#de2a8b",green="#12886b",muted="#526c81";
const l=(x,y,X,Y,c=blue,w=3)=>'<line x1="'+x+'" y1="'+y+'" x2="'+X+'" y2="'+Y+'" stroke="'+c+'" stroke-width="'+w+'" stroke-linecap="round"/>';
const txt=(x,y,t,size=15,c=navy,weight=600,anchor="start")=>'<text x="'+x+'" y="'+y+'" text-anchor="'+anchor+'" fill="'+c+'" font-size="'+size+'" font-family="Inter,Arial,sans-serif" font-weight="'+weight+'">'+esc(t)+'</text>';
const circ=(x,y,r=5,c=blue)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+c+'"/>';
const arrow=(x,y,X,Y,c=pink)=>'<path d="M '+x+' '+y+' L '+X+' '+Y+'" fill="none" stroke="'+c+'" stroke-width="3" marker-end="url(#nn-arrow)"/>';
function rh(x,y,t){return l(x-75,y,x-47,y)+
 '<path d="M'+(x-47)+','+y+' l10,-15 14,30 14,-30 14,30 14,-30 14,30 10,-15" fill="none" stroke="'+navy+'" stroke-width="3" stroke-linejoin="round"/>'+
 l(x+44,y,x+75,y)+txt(x,y-29,t,14,navy,700,"middle");}
function rv(x,y,t){return l(x,y-67,x,y-48)+
 '<path d="M'+x+','+(y-48)+' l-13,10 26,14 -26,14 26,14 -26,14 13,10" fill="none" stroke="'+navy+'" stroke-width="3" stroke-linejoin="round"/>'+
 l(x,y+46,x,y+67)+txt(x+28,y+5,t,14,navy,700);}
function battery(x,y,label){return l(x,y-72,x,y-21)+l(x-25,y-21,x+25,y-21,navy,4)+l(x-15,y-7,x+15,y-7,navy,4)+l(x,y-7,x,y+72)+txt(x-44,y-24,"+",17,pink,700)+txt(x-44,y+12,"−",17,muted,700)+txt(x-40,y+94,label,15,navy);}
function board(title){return '<rect x="12" y="14" width="716" height="300" rx="15" fill="#fbfdff" stroke="#c9dfec"/>'+
 txt(27,40,title,18,navy,800)+txt(27,61,"Conceptual practice diagram · not a pinout or wiring approval",11,muted,500);}
function svg(model,topic){
 let p=board(cases[topic].title);
 if(model==="mixed"){
  p+=battery(82,195,"9 V")+l(82,123,134,123)+rh(210,123,"R1 330 Ω")+l(285,123,380,123)+l(380,123,550,123)+
  rv(380,198,"R2 1 kΩ")+rv(550,198,"R3 470 Ω")+l(380,265,550,265)+l(380,265,285,265)+rh(210,265,"R4 220 Ω")+l(135,265,82,265)+l(82,265,82,267)+
  circ(380,123)+circ(550,123)+circ(380,265)+circ(550,265)+arrow(294,100,345,100)+txt(396,106,"Node A",12,pink)+txt(395,289,"Node B",12,green)+
  txt(609,153,"R2 and R3",12,navy)+txt(609,173,"share A and B",12,navy)+txt(609,208,"V2 = V3",15,green,700);
 }else if(model==="single"||model==="series"||model==="meter"){
  p+=battery(115,195,model==="series"?"12 V":"5 V")+l(115,123,250,123)+rh(325,123,model==="series"?"330 Ω":"1 kΩ")+l(400,123,model==="series"?455:580,123);
  if(model==="series")p+=rh(530,123,"470 Ω")+l(605,123,605,265);
  else p+=l(580,123,580,265);
  p+=l(model==="series"?605:580,265,115,265)+arrow(196,100,242,100)+txt(307,195,model==="meter"?"Ammeter goes in SERIES":"I = V / R",17,pink,700);
 }else if(model==="parallel"){
  p+=battery(106,193,"9 V")+l(106,121,550,121)+l(106,265,550,265)+rv(300,194,"1 kΩ")+rv(470,194,"470 Ω")+circ(300,121)+circ(470,121)+circ(300,265)+circ(470,265)+arrow(170,98,235,98)+txt(520,296,"Equal branch voltage",14,green,700);
 }else if(model==="source"){
  p+='<rect x="45" y="83" width="285" height="192" rx="12" fill="#f2f8fc" stroke="#b3d6e7"/>'+
    '<rect x="400" y="83" width="278" height="192" rx="12" fill="#f3fcf8" stroke="#b3d9cc"/>';
  p+=battery(105,175,"5 V")+l(105,103,150,103)+rh(219,103,"100 Ω")+l(294,103,306,103)+l(105,245,306,245)+
  '<circle cx="464" cy="185" r="27" fill="#fff" stroke="'+navy+'" stroke-width="3"/>'+
  arrow(464,205,464,167)+l(464,158,464,120)+l(464,212,464,245)+l(464,120,640,120)+l(464,245,640,245)+rv(610,184,"100 Ω")+
  txt(183,294,"Thévenin: series",13,navy,700,"middle")+txt(550,294,"Norton: parallel",13,navy,700,"middle")+txt(464,98,"Iₙ = 50 mA",13,pink,700,"middle");
 }else if(model==="wave"){
  const graphY=105,low=235,high=144;let width=126;
  p+=l(90,266,650,266,muted,1.5)+l(90,93,90,266,muted,1.5)+txt(45,145,"HIGH",13,green,700)+txt(45,240,"LOW",13,muted);
  let path="M 90 "+low+" L 90 "+high;
  for(let i=0;i<4;i++){const x=90+i*width;path+=' L '+(x+width*.2)+' '+high+' L '+(x+width*.2)+' '+low+' L '+(x+width)+' '+low;if(i<3)path+=' L '+(x+width)+' '+high;}
  p+='<path d="'+path+'" fill="none" stroke="'+pink+'" stroke-width="3.5" stroke-linejoin="round"/>'+
  l(90,291,216,291,blue,2)+txt(153,305,topic==="timing"?"T = 10 ms":topic==="ac"?"T = 1 ms":"bit interval",13,navy,700,"middle")+
  txt(485,116,topic==="timing"?"HIGH time = 2 ms":topic==="buses"?"UART = 115200 baud":"frequency = 1/T",13,navy);
 }else if(model==="rc"){
  p+=battery(95,195,"Step input")+l(95,122,194,122)+rh(265,122,topic==="filters"?"R = 1 kΩ":topic==="rc"?"R = 10 kΩ":"R")+l(340,122,465,122)+rv(465,194,topic==="capacitors"?"C = 10 µF":topic==="filters"?"C = 0.1 µF":"C = 2.2 µF")+l(465,265,95,265)+
  circ(465,122)+txt(510,137,"Vout",15,green,700)+
  '<path d="M 520,265 C 559,252 580,199 604,158 S 660,125 683,122" stroke="'+pink+'" stroke-width="3.5" fill="none"/>'+
  l(520,266,687,266,muted,1)+txt(610,290,"RC response",13,pink,700,"middle");
 }else if(model==="coil"){
  p+=battery(105,194,"DC source")+l(105,122,175,122)+rh(252,122,"R = 5 Ω")+l(327,122,376,122);
  let coils="M376 122";for(let i=0;i<5;i++){coils+=" C "+(384+i*27)+" 92 "+(395+i*27)+" 92 "+(403+i*27)+" 122";}
  p+='<path d="'+coils+'" stroke="'+navy+'" stroke-width="3" fill="none"/>'+l(512,122,595,122)+l(595,122,595,265)+l(595,265,105,265)+txt(441,83,"L = 10 mH",15,navy,700,"middle")+txt(429,218,"τ = L/R",21,pink,700,"middle");
 }else if(model==="transformer"){
  p+=l(110,120,220,120)+l(110,265,220,265)+txt(155,108,"24 V AC",15,navy,700);
  for(let side of [255,455]){for(let i=0;i<5;i++)p+='<path d="M '+side+' '+(135+i*22)+' q -21 10 0 20" fill="none" stroke="'+navy+'" stroke-width="3"/>';}
  p+=l(455,120,590,120)+l(455,265,590,265)+txt(560,107,"12 V ideal",15,green,700)+
  l(320,130,320,255,muted,2)+l(335,130,335,255,muted,2)+
  txt(200,298,"Np = 100",14,navy,700)+txt(450,298,"Ns = 50",14,navy,700)+txt(353,198,"magnetic",12,pink);
 }else if(model==="logic"){
  const b=(x,y,w,h,label,color="#eff8fe")=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="8" fill="'+color+'" stroke="#8db9d0"/>'+txt(x+w/2,y+h/2+6,label,16,navy,750,"middle");
  p+=txt(57,122,"A",16,pink)+txt(57,168,"B",16,pink)+txt(57,214,"Cin",16,pink)+
  l(83,117,173,117)+l(83,163,173,163)+b(173,104,102,73,"XOR 1")+l(275,140,355,140)+l(83,208,355,208)+b(355,133,114,82,"XOR 2","#eaf8ee")+l(469,174,635,174)+txt(645,178,"SUM",16,green,750)+
  b(355,240,114,44,"Carry logic","#fff4eb")+l(469,260,635,260)+txt(645,265,"Cout",16,green,750)+
  txt(183,91,"A ⊕ B",12,pink,700)+txt(348,298,"AB + Cin(A ⊕ B)",13,navy,650);
 }else if(model==="rf"){
  p+=l(90,155,600,155,blue,7)+rv(600,216,"ZL = 75 Ω")+l(600,155,600,149)+l(600,283,90,283)+
  txt(180,132,"Z0 = 50 Ω line",17,navy,700)+
  arrow(155,170,440,170,pink)+arrow(560,127,330,127,green)+
  txt(279,211,"Incident signal →",14,pink,700)+txt(448,102,"← Reflected",14,green,700)+
  txt(95,271,"Reference source",13,navy);
 }else{
  const block=(x,label,sub)=>'<rect x="'+x+'" y="113" width="168" height="119" rx="10" fill="#eff8fc" stroke="#8ebbd0"/>'+txt(x+84,154,label,17,navy,800,"middle")+txt(x+84,183,sub,12,muted,600,"middle");
  p+=block(38,"Input / stimulus","known settings")+block(277,"DUT / circuit","measured response")+block(516,"Readout / log","pass/fail evidence")+
  arrow(207,172,267,172)+arrow(445,172,507,172)+txt(372,270,"Confirm limits, units and source",14,green,700,"middle");
 }
 const defs='<defs><marker id="nn-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="'+pink+'"/></marker></defs>';
 return '<svg viewBox="0 0 740 328" role="img" aria-label="'+esc(cases[topic].title+" circuit schematic illustration")+'" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">'+defs+p+'</svg>';
}
function math(src){return typeof window.studyMath==="function"?window.studyMath(src,true):'<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mtext>'+esc(src)+'</mtext></math>';}
function render(topic){
 const x=cases[topic];if(!x)return "";
 const id=esc(topic);
 return '<details class="av-notebook-lab" data-nb-topic="'+id+'"><summary><span class="av-nb-book">✎</span> Notebook circuit lab · '+esc(x.title)+' <small>'+esc(x.provenance)+'</small></summary>'+
 '<div class="av-nb-content"><p class="av-nb-note">Original training exercise informed by your uploaded Tech 60/63 coursework. Circuit is redrawn as an educational schematic, not a copy of a textbook image or an approved physical pinout.</p>'+
 '<div class="av-nb-image">'+svg(x.model,topic)+'</div>'+
 '<div class="av-nb-question"><strong>Try this problem</strong><p>'+esc(x.question)+'</p></div>'+
 '<div class="av-nb-given"><div><b>Governing equation</b><div class="av-nb-math">'+math(x.formula)+'</div></div>'+
 '<div><b>Substitute numerical values</b><div class="av-nb-math">'+math(x.sub)+'</div></div></div>'+
 '<form class="av-nb-form" data-nb-form="'+id+'"><label for="avNbInput-'+id+'">Your numerical answer (in '+esc(x.unit)+')</label>'+
 '<div class="av-nb-controls"><input id="avNbInput-'+id+'" type="text" inputmode="decimal" autocomplete="off" placeholder="Enter numeric value"><button type="submit">Check my result</button></div></form>'+
 '<p class="av-nb-result" data-nb-result="'+id+'" role="status" aria-live="polite">Work it out yourself, or open one baby step at a time below.</p>'+
 '<div class="av-nb-steps"><h4>Baby-step solution · show one step at a time</h4>'+
 x.steps.map((t,i)=>'<details><summary>Step '+(i+1)+' of '+x.steps.length+'</summary><p>'+esc(t)+'</p></details>').join('')+
 '<details class="av-nb-final"><summary>Show verified final answer</summary><div class="av-nb-final-number">'+esc(Number(x.answer.toFixed(5)))+' '+esc(x.unit)+'</div><p>'+esc(x.notes)+'</p></details></div>'+
 '<div class="av-nb-trap"><strong>Watch for this mistake</strong><p>'+esc(x.pitfall)+'</p></div>'+
 '<p class="av-nb-privacy">Source classification: '+esc(x.provenance)+'. Learning illustration only. No original homework images or names are published.</p></div></details>';
}
function grade(topic,input){
 const x=cases[topic];if(!x)return {band:"missing",message:"Topic not found."};
 const v=Number(String(input).trim().replace(/,/g,""));
 if(!String(input).trim()||!Number.isFinite(v))return {band:"invalid",message:"Please enter a number in "+x.unit+" (without the unit letters)."};
 const diff=Math.abs(v-x.answer),tol=Math.max(Math.abs(x.answer)*0.012,0.00001);
 if(diff<=tol)return {band:"correct",message:"Correct. Your result agrees with the independent reference value within 1.2% rounding tolerance."};
 if(diff<=Math.max(Math.abs(x.answer)*0.055,0.01))return {band:"close",message:"Almost correct. Check your rounding, conversion of prefixes, and whether the result is in "+x.unit+"."};
 return {band:"review",message:"Not yet. Recheck the governing equation, numerical substitution, and unit conversion using the baby steps."};
}
function bind(host){
 host.querySelectorAll("[data-nb-form]").forEach(form=>{
  form.onsubmit=e=>{
   e.preventDefault();
   const key=form.dataset.nbForm,x=cases[key],field=form.querySelector("input"),feedback=host.querySelector('[data-nb-result="'+key+'"]');if(!x||!feedback)return;
   const g=grade(key,field.value);
   feedback.dataset.status=g.band;
   feedback.textContent=g.message+(g.band==="correct"?" Answer: "+Number(x.answer.toFixed(5))+" "+x.unit:"");
   if(g.band==="correct"){try{const state=JSON.parse(localStorage.getItem("slt-notebook-mini-labs-v1")||"{}");state[key]="correct";localStorage.setItem("slt-notebook-mini-labs-v1",JSON.stringify(state))}catch{}}
  };
 });
}
window.avionicsNotebookLabs={cases,render,grade,bind,svg};
})();