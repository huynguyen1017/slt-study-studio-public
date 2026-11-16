"use strict";
/* Educational SVG visuals driven by each of the 690 original question records.
   No external images, drawings, network requests or copied textbook figures.
   Bench and breadboard diagrams are illustrative, not verified hardware pinouts. */
(function(){
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const P={ink:"#263c50",blue:"#1799d0",red:"#df416e",green:"#209774",gold:"#ca9235",faint:"#eff6f9",muted:"#5a7185"};
const text=(x,y,s,size=15,color=P.ink,anchor="start",weight="500")=>'<text x="'+x+'" y="'+y+'" fill="'+color+'" font-family="Arial,sans-serif" font-size="'+size+'" text-anchor="'+anchor+'" font-weight="'+weight+'">'+esc(s)+'</text>';
const path=(d,color=P.ink,w=3,fill="none")=>'<path d="'+d+'" stroke="'+color+'" stroke-width="'+w+'" fill="'+fill+'" stroke-linecap="round" stroke-linejoin="round"/>';
const line=(x,y,a,b,c=P.ink,w=3)=>path("M"+x+" "+y+" L"+a+" "+b,c,w);
const rect=(x,y,w,h,fill="#fff",stroke="#b7cbd8",rad=7)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+rad+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="1.5"/>';
const dot=(x,y,c=P.blue,r=5)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+c+'"/>';
const arrow=(x1,y1,x2,y2,color=P.red)=>line(x1,y1,x2,y2,color,2.6)+'<polygon points="'+x2+','+y2+' '+(x2-10)+','+(y2-5)+' '+(x2-10)+','+(y2+5)+'" transform="rotate('+Math.atan2(y2-y1,x2-x1)*180/Math.PI+' '+x2+' '+y2+')" fill="'+color+'"/>';
function boxLabel(x,y,label,val){
 return rect(x,y,165,51,"#fff","#bcd1df",8)+text(x+11,y+18,label,11,P.muted)+text(x+11,y+38,val,16,P.ink,"start","700");
}
function svg(inner,desc){return '<svg class="av-visual-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 740 322" role="img" aria-label="'+esc(desc)+'">'+rect(1,1,738,320,"#fff","#d7e5ed",11)+inner+'</svg>';}
function zigH(x1,x2,y,label,c=P.ink){
 const n=8, dx=(x2-x1)/n;let d="M"+(x1-16)+" "+y+" L"+x1+" "+y;
 for(let i=0;i<n;i++)d+=" L"+(x1+(i+.5)*dx)+" "+(y+(i%2?-13:13));
 d+=" L"+x2+" "+y+" L"+(x2+16)+" "+y;
 return path(d,c,3)+text((x1+x2)/2,y-23,label,15,c,"middle","700");
}
function zigV(x,y1,y2,label,c=P.ink){
 const n=8,dy=(y2-y1)/n;let d="M"+x+" "+(y1-10)+" L"+x+" "+y1;
 for(let i=0;i<n;i++)d+=" L"+(x+(i%2?12:-12))+" "+(y1+(i+.5)*dy);
 d+=" L"+x+" "+y2+" L"+x+" "+(y2+10);
 return path(d,c,3)+text(x+28,(y1+y2)/2+4,label,15,c);
}
function capacitor(x,y,lab){
 return line(x,y-55,x,y-8)+line(x-19,y-8,x+19,y-8,P.ink,4)+line(x-19,y+8,x+19,y+8,P.ink,4)+line(x,y+8,x,y+55)+text(x+27,y+5,lab,15);
}
function inductor(x,y,label){
 let d="M"+x+" "+(y-55)+" L"+x+" "+(y-38);
 for(let i=0;i<4;i++)d+=" C "+(x+21)+" "+(y-42+i*18)+" "+(x+21)+" "+(y-28+i*18)+" "+x+" "+(y-20+i*18);
 d+=" L"+x+" "+(y+55);
 return path(d)+text(x+33,y+5,label,15);
}
function battery(x,top,bottom,label){
 const mid=(top+bottom)/2;
 return line(x,top,x,mid-31)+line(x-20,mid-31,x+20,mid-31,P.ink,4)+line(x-11,mid-18,x+11,mid-18,P.ink,4)+line(x,mid-18,x,mid+4)+line(x-20,mid+4,x+20,mid+4,P.ink,4)+line(x-11,mid+16,x+11,mid+16,P.ink,4)+line(x,mid+16,x,bottom)+text(x-36,mid-28,"+",23,P.red)+text(x-33,mid+27,"−",23,P.muted)+text(x-25,mid+47,label,14,P.ink,"end","700");
}
function ground(x,y){return line(x,y,x,y+11)+line(x-17,y+11,x+17,y+11)+line(x-11,y+17,x+11,y+17)+line(x-5,y+23,x+5,y+23);}
function source(q){return (q.question.match(/(?:\d+(?:\.\d+)?)\s*(?:V|mV)\b/g)||[])[0]||"Vₛ";}
function vals(q){return [...new Set(q.question.match(/(?:\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*(?:MΩ|kΩ|mΩ|Ω|GHz|MHz|kHz|Hz|mH|µH|µF|mA|mV|ms|ns|µs|V|A|W|dB|%)/gi)||[])].slice(0,7);}
function resistance(q){return vals(q).filter(x=>/Ω/.test(x));}
const units={
 units:"Meter range / unit conversion",
 ohm:"DC source and resistive load",
 power:"Power delivery and load",
 series:"Single current path",
 parallel:"Shared supply and branch loads",
 "kcl-kvl":"Nodes, current and loop voltage",
 thevenin:"Equivalent circuit seen by load",
 ac:"Alternating source and load",
 capacitors:"Capacitor energy storage",
 rc:"Resistor-capacitor timing",
 inductors:"Inductor and RL behavior",
 filters:"Frequency-selective network",
 magnetics:"Transformer and energy coupling",
 components:"Semiconductor switching / biasing",
 "power-rails":"PCBA power distribution",
 schematics:"Power-up and board bring-up",
 instruments:"Measurement circuit and probes",
 timing:"Digital clock and reset",
 buses:"Embedded interface wiring",
 "python-scpi":"Automated test instruments",
 linux:"Embedded logs and Linux host",
 rf:"RF path and measurement",
 qualification:"Flight-hardware verification process"
};
const boards=new Set(["ohm","power","series","parallel","kcl-kvl","thevenin","capacitors","rc","inductors","filters"]);
function describe(q,t){
 const id=t.id, v=vals(q);
 return {topic:id,question:q.id,kind:q.level,values:v,schematic:"Circuit diagram",concept: /ac|rc|inductors|filters|timing|rf|capacitors|power-rails|instruments|buses/.test(id)?"Graph / waveform":"Visual explanation",wiring:boards.has(id)?"Breadboard wiring":"Test / system setup",board:boards.has(id)};
}
function head(q,t){return text(23,32,"CIRCUIT · "+q.id.toUpperCase(),12,P.blue,"start","800")+text(23,56,units[t.id]||"Electrical measurement",17,P.ink,"start","700");}
function known(q){
 const a=vals(q);let out="";
 if(a.length){out+=text(510,31,"KNOWN VALUES IN THIS QUESTION",10,P.muted,"start","700");a.slice(0,3).forEach((v,i)=>{out+=rect(509+i*71,37,68,26,"#e8f4fa","#bbd8e8",5)+text(543+i*71,55,v,11,P.ink,"middle","700");});}
 return out;
}
function loop(q,t){
 const r=resistance(q), lab=(r[0]||(t.id==="power"||t.id==="units"?"LOAD":q.level==="Calculation"?"R = ?":"R")),v=source(q);
 return head(q,t)+known(q)+line(126,85,504,85)+line(504,85,504,128)+zigV(504,140,212,lab)+line(504,222,504,257)+line(126,257,504,257)+battery(126,85,257,v)+
 arrow(222,72,344,72)+text(277,65,"I →",16,P.red,"middle","700")+dot(126,85,P.blue)+dot(126,257,P.green)+
 text(535,120,"R / LOAD",11,P.muted)+text(510,291,q.level==="Calculation"?"Calculate the requested unknown.":"Current has a closed return path.",12,P.muted,"end")+
 (t.id==="ohm"?(line(504,85,639,85,P.red,2)+line(639,85,639,135,P.red,2)+line(504,257,639,257,P.blue,2)+line(639,213,639,257,P.blue,2)+
 rect(572,133,128,82,"#fff","#72a9c4",10)+text(637,158,"DMM",14,P.ink,"middle","700")+
 rect(589,170,95,29,"#e2f3eb","#9ac7b1",4)+text(636,189,"V (measured)",12,P.green,"middle","700")+
 text(650,115,"red +",11,P.red)+text(651,243,"black −",11,P.blue)):"");
}
function series(q,t){
 const r=resistance(q),v=source(q);
 let out=head(q,t)+known(q)+battery(95,94,264,v)+line(95,94,181,94)+zigH(204,304,94,r[0]||"R₁")+line(320,94,362,94)+zigH(385,487,94,r[1]||"R₂")+line(503,94,592,94)+line(592,94,592,264)+line(95,264,592,264)+
 arrow(188,66,302,66)+text(245,56,"I (same everywhere)",13,P.red,"middle","700")+dot(362,94,P.blue)+text(362,118,"Node A",12,P.blue,"middle")+
 text(331,295,"ONE PATH → same current through both resistors",13,P.muted,"middle");
 return out;
}
function parallel(q,t){
 const r=resistance(q);const count=/four|R4|I4|I₄/i.test(q.question)?4:Math.max(2,Math.min(4,r.length||3));
 let out=head(q,t)+known(q)+battery(86,86,266,source(q))+line(86,86,630,86)+line(86,266,630,266);
 for(let i=0;i<count;i++){const x=240+i*(count===4?117:count===3?155:265);out+=line(x,86,x,127)+zigV(x,139,208,r[i]||"R"+(i+1))+line(x,218,x,266)+dot(x,86,P.blue)+dot(x,266,P.green)+arrow(x+38,123,x+38,164)+text(x+43,179,"I"+(i+1),13,P.red);}
 out+=text(148,77,"A (+)",14,P.blue,"middle")+text(148,284,"B (return)",13,P.green,"middle")+text(376,310,"Every branch connects between nodes A and B",12,P.muted,"middle");
 return out;
}
function node(q,t){
 return head(q,t)+known(q)+line(85,171,357,171)+dot(357,171,P.blue,9)+line(357,171,575,78)+line(357,171,575,171)+line(357,171,575,267)+
 arrow(145,154,245,154)+arrow(460,117,529,89)+arrow(465,154,535,154)+arrow(456,215,527,245)+
 text(175,139,"I total",14,P.red)+text(364,148,"NODE A",14,P.blue,"start","700")+
 text(584,87,"I₁",16,P.red)+text(584,178,"I₂",16,P.red)+text(584,267,"I₃",16,P.red)+
 text(134,250,t.id==="kcl-kvl"?"I entering = I leaving":"Unknown branch current",15,P.ink);
}
function equivalent(q,t){
 return head(q,t)+known(q)+battery(110,90,255,source(q))+line(110,90,225,90)+zigH(246,357,90,resistance(q)[0]||"Rₜₕ")+line(373,90,557,90)+line(557,90,557,123)+zigV(557,134,206,"R Load")+line(557,216,557,255)+line(110,255,557,255)+
 arrow(377,69,471,69)+text(420,54,"I load",12,P.red,"middle")+dot(557,90,P.blue)+dot(557,255,P.green)+text(573,113,"Vout",13,P.blue);
}
function reactive(q,t){
 let component=t.id==="inductors"?"L":t.id==="capacitors"?"C":t.id==="filters"?"C":"C";
 let out=head(q,t)+known(q)+battery(122,90,256,source(q))+line(122,90,210,90)+zigH(230,346,90,resistance(q)[0]||"R")+line(362,90,520,90)+line(520,90,520,123);
 if(component==="L")out+=inductor(520,170,"L");
 else out+=capacitor(520,170,"C");
 out+=line(520,218,520,256)+line(122,256,520,256)+arrow(370,72,454,72)+text(400,63,"I(t)",13,P.red,"middle")+dot(520,90,P.blue)+dot(520,256,P.green)+text(536,130,"V(t)",13,P.blue);
 return out;
}
function ac(q,t){
 return head(q,t)+known(q)+line(125,98,550,98)+line(550,98,550,127)+zigV(550,139,207,resistance(q)[0]||"Z / load")+line(550,218,550,264)+line(125,264,550,264)+
 path("M125 98 L125 134 M125 224 L125 264")+path("M125 134 C 155 134 155 224 125 224 C 95 224 95 134 125 134",P.ink,3)+
 path("M105 178 C112 148 120 148 125 178 C130 208 138 208 145 178",P.red,2.3)+
 text(64,191,"AC",17,P.ink)+arrow(283,78,386,78)+text(340,66,"i(t)",15,P.red,"middle")+text(567,184,"V(t)",13,P.blue);
}
function transformer(q,t){
 return head(q,t)+known(q)+
 line(140,94,253,94)+line(140,258,253,258)+battery(140,94,258,source(q))+
 line(253,94,253,127)+inductor(253,181,"Nₚ")+line(253,230,253,258)+
 line(465,94,585,94)+line(465,258,585,258)+line(465,94,465,127)+inductor(465,181,"Nₛ")+line(465,230,465,258)+
 line(585,94,585,127)+zigV(585,138,207,"Load")+line(585,219,585,258)+
 line(347,128,347,232,P.blue,3)+line(362,128,362,232,P.blue,3)+
 text(356,113,"Magnetic core",12,P.blue,"middle")+arrow(301,76,395,76)+text(343,63,"Coupling",13,P.red,"middle");
}
function digital(q,t){
 const type=t.id, names=type==="buses"?["MCU","SCLK / TX","Peripheral","GND return"]:type==="timing"?["Clock","Reset logic","CPU / FPGA","Test point"]:type==="components"?["Source","Drive / bias","MOSFET / LED","Load"]:type==="linux"?["Linux host","USB ↔ UART","Board console","Raw logs"]:type==="python-scpi"?["Python test","VISA / SCPI","Instrument","Board DUT"]:type==="rf"?["RF source","Coax / matching","RF DUT","Analyzer"]:type==="qualification"?["Test plan","Flight unit","Environment","Report"]:["Supply","Regulator","PCBA / MCU","DMM / scope"];
 let out=head(q,t)+known(q);
 for(let i=0;i<4;i++){const x=21+i*181;out+=rect(x,107,155,106,i%2?"#f3f9fc":"#e9f5fa","#99c7da",12)+text(x+77,142,names[i],15,P.ink,"middle","700")+text(x+77,170,i===0?"INPUT":i===1?"INTERFACE":i===2?"DEVICE":"MEASURE",11,P.muted,"middle");if(i<3)out+=arrow(x+155,160,x+175,160,P.red);}
 out+=line(100,245,645,245,P.green,3)+text(373,268,type==="rf"?"Reference plane / controlled impedance":type==="qualification"?"Controlled configuration + test evidence":"Ground / return / traceable reference",13,P.green,"middle");
 return out;
}
function schematic(q,t){
 const id=t.id;
 if(id==="series")return svg(series(q,t),"Single-path series schematic with question-specific resistor values and current direction");
 if(id==="parallel")return svg(parallel(q,t),"Parallel resistor circuit with branches and question values");
 if(id==="kcl-kvl")return svg(node(q,t),"Electrical node with total and branch currents");
 if(id==="thevenin")return svg(equivalent(q,t),"Thevenin source with output resistance and load");
 if(["rc","capacitors","inductors","filters"].includes(id))return svg(reactive(q,t),"Reactive circuit schematic with resistor and capacitor or inductor");
 if(id==="ac")return svg(ac(q,t),"Alternating voltage source and load");
 if(id==="magnetics")return svg(transformer(q,t),"Primary and secondary windings and transformer load");
 if(["buses","timing","components","linux","python-scpi","rf","qualification","schematics","power-rails","instruments"].includes(id))return svg(digital(q,t),"Electrical subsystem connection diagram and signal direction");
 return svg(loop(q,t),"Electrical source and resistor circuit with indicated current flow");
}
function axes(xmin=73,ymin=247,xmax=689,ytop=90){
 return line(xmin,ytop,xmin,ymin,P.muted,2)+line(xmin,ymin,xmax,ymin,P.muted,2)+
 text(xmin-12,ytop-11,"Y",12,P.muted)+text(xmax+9,ymin+7,"time / input",11,P.muted,"end");
}
function curve(q,t){
 const id=t.id;let out=head(q,t)+known(q);
 const x0=75,x1=688,y0=248,y1=94;
 out+=axes();
 if(["ac","timing","buses"].includes(id)){
  const digitalSig=id!=="ac";let d="";
  for(let i=0;i<=48;i++){const x=x0+13*i;
    const v=digitalSig?((Math.floor(i/6)%2)===0?y1+23:y0-24):(y0+y1)/2-61*Math.sin(i/48*Math.PI*6);
    d+=(i===0?"M":" L")+x+" "+v;
  }
  out+=path(d,P.blue,3);
  if(digitalSig)out+=line(x0,y0-67,x1,y0-67,P.red,2)+text(612,y0-78,id==="buses"?"sample / transaction": "reset reference",12,P.red);
  out+=text(88,282,digitalSig?"Time-aligned logic levels (illustrative)":"Sinusoidal waveform (illustrative)",14,P.ink);
 }else if(["rc","capacitors","inductors","power-rails","schematics"].includes(id)){
  const drop=(id==="power-rails"||id==="schematics");
  const d=[];for(let i=0;i<=60;i++){
   const x=x0+10*i,v=drop?(i<19?129:i<32?172+(i-19)*.4:125+50*Math.exp(-(i-32)/7)):y0-(y0-y1)*(1-Math.exp(-i/14));
   d.push((i===0?"M":"L")+x+" "+v);
  }
  out+=path(d.join(" "),P.blue,4);
  if(!drop){const tauX=x0+140;out+=line(tauX,99,tauX,y0,P.red,2)+text(tauX+8,112,"τ (1 time constant)",12,P.red);}
  out+=text(93,281,drop?"Voltage droop during a load step (illustrative)":"First-order transient (normalized, not measured)",13,P.ink);
 }else if(["filters","rf"].includes(id)){
  const pts=[];for(let i=0;i<=70;i++){const x=x0+i*8.5;const v=id==="rf"?y0-92*Math.exp(-Math.pow((i-30)/7,2))-35*Math.exp(-Math.pow((i-52)/4,2)):y1+20+125/(1+Math.exp(-(i-36)/7));pts.push((i?"L":"M")+x+" "+v);}
  out+=path(pts.join(" "),P.blue,4)+text(90,280,id==="rf"?"Signal power vs frequency (illustrative)":"Relative gain vs frequency (illustrative)",13,P.ink);
 }else if(["parallel","kcl-kvl","power","units","components","magnetics"].includes(id)){
  for(let i=0;i<4;i++){const x=132+i*128,h=[125,85,109,63][i];out+=rect(x,y0-h,65,h,["#2988b4","#35a189","#f0b34c","#c082b1"][i],"none",2)+text(x+32,y0+23,["A","B","C","D"][i],12,P.muted,"middle");}
  out+=text(88,285,"Comparison chart — illustrative categories, not measured data",13,P.muted);
 }else{
  out+=path("M75 219 L193 193 L311 173 L430 142 L551 118 L685 105",P.blue,4)+
  text(100,280,"Conceptual input-to-output relationship (not calibrated data)",13,P.muted);
 }
 return svg(out,"Question "+q.id+" concept graph showing "+units[id]+". Illustrative graph not measured hardware data.");
}
function breadboard(q,t){
 const id=t.id, isPar=id==="parallel", isSeries=id==="series"||id==="thevenin", isRC=["rc","capacitors","inductors","filters"].includes(id);
 const rs=resistance(q);
 const questionVoltage=source(q), match=(parseFloat(questionVoltage)<=5);
 const v=match&&questionVoltage!=="Vₛ"?questionVoltage:"3.3 V DEMO";
 let s=head(q,t)+text(533,56,"GENERIC BREADBOARD · NOT A PINOUT",10,P.muted,"start","700");
 s+=rect(82,79,397,212,"#f5f5ef","#d4dbdb",13);
 const cols=["a","b","c","d","e"],xs=[135,199,263,327,391];let ys={};
 cols.forEach((col,i)=>{s+=text(xs[i],103,col,14,P.muted,"middle","700");});
 for(let row=10;row<=17;row++){const y=112+(row-10)*24;ys[row]=y;s+=rect(116,y-10,296,19,row%2===0?"#e3edf4":"#e8eff4","none",10)+text(96,y+4,row,11,P.muted,"middle");
  xs.forEach(x=>{s+=dot(x,y,"#637b8e",3.7);});
 }
 const rtop=ys[10],rbot=ys[15],rmid=ys[13],r16=ys[16];
 function resistor(x,top,bottom,label){
  const mid=(top+bottom)/2;
  s+=line(x,top,x,mid-17,"#9a7756",2)+rect(x-9,mid-18,18,36,"#e9c993","#a4773a",7)+line(x-9,mid-6,x+9,mid-6,"#af333d",3)+line(x-9,mid+5,x+9,mid+5,"#35342d",3)+line(x,mid+18,x,bottom,"#9a7756",2);
  s+=text(x+16,mid-23,label,11,P.ink);
 }
 if(isSeries){resistor(xs[0],rtop,rmid,rs[0]||"R₁");resistor(xs[0],rmid,r16,rs[1]||"R₂");}
 else if(isRC){
  resistor(xs[0],rtop,rmid,rs[0]||"R");
  const symbol=id==="inductors"?"L":"C";
  s+=line(xs[0],rmid,xs[0],rmid+13,"#9a7756",2)+rect(xs[0]-13,rmid+13,26,18,"#e0eef7","#6e9db9",3)+
   text(xs[0],rmid+26,symbol,12,P.blue,"middle","700")+line(xs[0],rmid+31,xs[0],r16,"#9a7756",2);
 }else{
  resistor(xs[0],rtop,rbot,rs[0]||"R₁");if(isPar)resistor(xs[3],rtop,rbot,rs[1]||"R₂");
 }
 s+=path("M594 116 H"+xs[1]+" V"+rtop,P.red,3)+path("M594 231 H"+xs[1]+" V"+(isSeries||isRC?r16:rbot),P.blue,3);
 s+=rect(510,97,178,151,"#fff","#b6cbd7",12)+text(599,123,"CURRENT-LIMITED",12,P.ink,"middle","700")+text(599,141,"DC supply",12,P.ink,"middle")+
 rect(532,149,134,39,"#eaf5eb","#a2c9ad",6)+text(599,175,v,19,P.green,"middle","700")+
 text(599,207,"+ (red)      − (blue)",13,P.ink,"middle");
 if(isSeries||isRC){s+=path("M"+xs[1]+" "+rmid+" H480 V274 H533",P.gold,2.5)+text(540,280,"Midpoint / signal",12,P.gold);}
 if(isRC){s+=text(123,300,"Reactive parts require correct polarity/ratings and a verified wiring diagram.",12,P.muted);}
 else s+=text(108,309,"Rows are connected across a–e. Adjacent numbered rows are separate.",13,P.muted);
 return svg(s,"Breadboard close-up showing exact row and column hole positions for a "+(isPar?"parallel":isSeries?"series":"single resistor")+" conceptual circuit");
}
function bench(q,t){
 const id=t.id;
 const roles={
 ac:["Signal generator","AC stimulus","DUT / load","Oscilloscope"],
 timing:["Clock source","CLK / RESET","Digital DUT","Logic analyzer"],
 buses:["MCU / debugger","UART / SPI / I²C / CAN","Peripheral device","Scope / decoder"],
 "python-scpi":["Python/Linux PC","SCPI over USB/LAN","Lab instrument","DUT"],
 linux:["Linux test host","USB-to-UART","Embedded board","Timestamped logs"],
 rf:["RF signal source","Coax + attenuator","RF DUT","Spectrum analyzer / VNA"],
 qualification:["Test procedure","Controlled harness","Flight PCBA","Telemetry / limits"],
 magnetics:["AC source (rated)","Primary winding","Isolated secondary","DMM / scope"]
 };
 const names=roles[id]||["Supply","Harness","PCBA","Instrument"];
 let s=head(q,t)+known(q);
 names.forEach((name,i)=>{
  const x=15+i*184;
  s+=rect(x,104,163,110,i%2?"#f4f9fc":"#e9f5fb","#9dc5d8",11)+text(x+81,139,name.length>20?name.slice(0,19)+"…":name,14,P.ink,"middle","700")+
  text(x+81,166,i===0?"SOURCE":i===1?"INTERCONNECT":i===2?"UNDER TEST":"READ / LOG",11,P.muted,"middle");
  if(i<3)s+=arrow(x+165,162,x+181,162,P.red);
 });
 s+=line(54,241,681,241,P.green,2)+text(368,268,"Shared reference / isolation / interface rules must match the actual hardware",12,P.green,"middle")+
 text(368,295,"Representative testbench. Validate voltages, pinout and equipment ratings before real wiring.",12,P.muted,"middle");
 return svg(s,"Instrument-to-device block wiring diagram describing "+names.join(", "));
}
function render(q,t,mode){
 const m=describe(q,t);
 const views={schematic:schematic,concept:curve,wiring:m.board?breadboard:bench};
 if(!views[mode])return "";
 const figure=views[mode](q,t);
 const label=mode==="schematic"?"Full schematic / signal path":mode==="concept"?"Graph / current-flow explanation":m.wiring;
 const detail=m.values.length?"Given in question: "+m.values.join(" · "):"Conceptual example; labels represent the question's engineering topic.";
 const warning=mode==="wiring"?"Generic teaching illustration, NOT a manufacturer-approved pinout or a complete wiring procedure. For real hardware, verify power-off connections, rail voltage, ratings and common-ground requirements.":mode==="concept"?"Illustrative model / normalized graph; not measured waveform or qualification data.":"Circuit symbols and current arrows are educational diagrams. Any unspecified values are examples, not part of the question.";
 return '<figure class="av-visual-figure" data-visual-question="'+esc(q.id)+'" data-visual-mode="'+esc(mode)+'">'+
 '<div class="av-visual-top"><strong>'+esc(label)+'</strong><span>Question '+esc(q.id)+' · '+esc(q.level)+'</span></div>'+
 figure+'<div class="av-visual-question-line"><strong>Question:</strong> '+esc(q.question)+'</div><figcaption>'+esc(detail)+'. '+esc(warning)+'</figcaption></figure>';
}
window.avionicsVisuals={render,describe,hasBreadboard:(q,t)=>describe(q,t).board,viewTypes:()=>["schematic","concept","wiring"]};
})();