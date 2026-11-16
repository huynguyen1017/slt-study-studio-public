"use strict";
/* Question-driven textbook schematics, operating-point graphs, and 3-panel board +
   solderless breadboard + circuit-symbol diagrams for all 690 avionics exercises.
   Pure inline SVG; zero external images or scripts. */
(function(){
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const P={
 ink:"#1e3448",
 blue:"#0099dd",
 navy:"#174a74",
 pink:"#e61980",
 red:"#d93848",
 green:"#199e4b",
 teal:"#0d8573",
 gold:"#c98718",
 faint:"#f2f7fb",
 muted:"#586f82",
 cyan:"#00a3e0"
};
const text=(x,y,s,size=14,color=P.ink,anchor="start",weight="500",style="")=>'<text x="'+x+'" y="'+y+'" fill="'+color+'" font-family="Arial,sans-serif" font-size="'+size+'" text-anchor="'+anchor+'" font-weight="'+weight+'"'+(style?' font-style="'+style+'"':'')+'>'+esc(s)+'</text>';
const path=(d,color=P.ink,w=2.8,fill="none",dash="")=>'<path d="'+d+'" stroke="'+color+'" stroke-width="'+w+'" fill="'+fill+'" stroke-linecap="round" stroke-linejoin="round"'+(dash?' stroke-dasharray="'+dash+'"':'')+'/>';
const line=(x,y,a,b,c=P.ink,w=2.8)=>path("M"+x+" "+y+" L"+a+" "+b,c,w);
const rect=(x,y,w,h,fill="#fff",stroke="#b7cbd8",rad=7,sw=1.5)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+rad+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>';
const dot=(x,y,c=P.blue,r=5.5)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+c+'"/>';
const arrow=(x1,y1,x2,y2,color=P.pink,w=2.6)=>line(x1,y1,x2,y2,color,w)+'<polygon points="'+x2+','+y2+' '+(x2-10)+','+(y2-5)+' '+(x2-10)+','+(y2+5)+'" transform="rotate('+Math.atan2(y2-y1,x2-x1)*180/Math.PI+' '+x2+' '+y2+')" fill="'+color+'"/>';

function svg(inner,desc,w=780,h=360){
 return '<svg class="av-visual-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+esc(desc)+'">'+rect(1,1,w-2,h-2,"#ffffff","#d6e4ee",12,1.5)+inner+'</svg>';
}

function zigH(x1,x2,y,label,c=P.ink,sub=""){
 const n=8,dx=(x2-x1)/n;let d="M"+(x1-14)+" "+y+" L"+x1+" "+y;
 for(let i=0;i<n;i++)d+=" L"+(x1+(i+.5)*dx)+" "+(y+(i%2?-12:12));
 d+=" L"+x2+" "+y+" L"+(x2+14)+" "+y;
 return path(d,c,2.8)+text((x1+x2)/2,y-22,label,15,c,"middle","700")+(sub?text((x1+x2)/2,y+28,sub,12,P.muted,"middle"):"");
}
function zigV(x,y1,y2,label,c=P.ink,sym="R"){
 const n=7,dy=(y2-y1)/n;let d="M"+x+" "+(y1-10)+" L"+x+" "+y1;
 for(let i=0;i<n;i++)d+=" L"+(x+(i%2?12:-12))+" "+(y1+(i+.5)*dy);
 d+=" L"+x+" "+y2+" L"+x+" "+(y2+10);
 const mid=(y1+y2)/2;
 return path(d,c,2.8)+text(x+24,mid-5,sym,15,c,"start","700","italic")+text(x+24,mid+16,label,15,c,"start","700");
}
function capacitor(x,y,lab){
 return line(x,y-50,x,y-8,P.ink,2.8)+line(x-19,y-8,x+19,y-8,P.ink,4)+line(x-19,y+8,x+19,y+8,P.ink,4)+line(x,y+8,x,y+50,P.ink,2.8)+text(x+26,y+5,lab,15,P.ink,"start","700");
}
function inductor(x,y,label){
 let d="M"+x+" "+(y-50)+" L"+x+" "+(y-36);
 for(let i=0;i<4;i++)d+=" C "+(x+20)+" "+(y-40+i*18)+" "+(x+20)+" "+(y-26+i*18)+" "+x+" "+(y-18+i*18);
 d+=" L"+x+" "+(y+50);
 return path(d,P.ink,2.8)+text(x+28,y+5,label,15,P.ink,"start","700");
}
function battery(x,top,bottom,label,sym="V"){
 const mid=(top+bottom)/2;
 return line(x,top,x,mid-28,P.ink,2.8)+
  line(x-22,mid-28,x+22,mid-28,P.ink,3.5)+line(x-11,mid-17,x+11,mid-17,P.ink,2.8)+
  line(x-22,mid-5,x+22,mid-5,P.ink,3.5)+line(x-11,mid+6,x+11,mid+6,P.ink,2.8)+
  line(x-22,mid+18,x+22,mid+18,P.ink,3.5)+line(x-11,mid+29,x+11,mid+29,P.ink,2.8)+
  line(x,mid+29,x,bottom,P.ink,2.8)+
  text(x-26,mid-32,"+",22,P.ink,"end","700")+
  text(x-26,mid+46,"−",22,P.ink,"end","700")+
  text(x-38,mid-4,sym,16,P.ink,"end","700","italic")+
  text(x-38,mid+18,label,15,P.ink,"end","700");
}
function groundSym(x,y){
 return line(x,y,x,y+12,P.ink,2.6)+line(x-16,y+12,x+16,y+12,P.ink,2.6)+line(x-10,y+18,x+10,y+18,P.ink,2.4)+line(x-4,y+24,x+4,y+24,P.ink,2.2);
}

function vals(q){return [...new Set(q.question.match(/(?:\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*(?:MΩ|kΩ|mΩ|Ω|GHz|MHz|kHz|Hz|mH|µH|µF|mA|mV|ms|ns|µs|V|A|W|dB|%|turns)/gi)||[])].slice(0,7);}
function source(q){return (q.question.match(/(?:\d+(?:\.\d+)?)\s*(?:V|mV)\b/g)||[])[0]||"Vₛ";}
function resistance(q){return vals(q).filter(x=>/Ω/.test(x));}
function currents(q){return vals(q).filter(x=>/(?:mA|A)\b/.test(x));}
function freqVals(q){return vals(q).filter(x=>/Hz/.test(x));}

const units={
 units:"SI Prefixes, Meter Scale & Unit Conversion",
 ohm:"Floyd & Buchla Loop: Source, Current I & Resistor R",
 power:"Electrical Power, Energy & Safe Dissipation",
 series:"Single-Path Series Chain & Voltage Divider",
 parallel:"Floyd & Buchla Parallel Nodes A & B",
 "kcl-kvl":"Kirchhoff Node Current & Loop Voltage",
 thevenin:"Thevenin / Norton Two-Terminal Equivalent",
 ac:"Alternating Current, Period, Frequency & RMS",
 capacitors:"Capacitor Charge Storage & Decoupling",
 rc:"First-Order RC Charging & Time Constant τ",
 inductors:"Inductive Voltage V = L·(dI/dt) & RL Timing",
 filters:"Frequency-Selective Filter & Resonance",
 magnetics:"Transformer Turns Coupling & 3-Phase Power",
 components:"Diode, MOSFET Switch & Pull-Up Thresholds",
 "power-rails":"PCBA Power Tree, Sequencing & Shunt Sensing",
 schematics:"PCBA Bring-Up, Shorts Check & Fault Isolation",
 instruments:"DMM, 4-Channel Scope & Low-Inductance Probing",
 timing:"Clock Period, Setup/Hold & Reset Release",
 buses:"UART, SPI, I²C & CAN Physical Bus Wiring",
 "python-scpi":"Python + PyVISA / SCPI Automated Test Station",
 linux:"Linux Host, Persistent Serial & Raw Log Audit",
 rf:"RF Spectrum Analyzer, VNA (S11/S21) & Wavelength",
 qualification:"Spacecraft TVAC, Verification & Go/No-Go"
};
const boards=new Set(["units","ohm","power","series","parallel","kcl-kvl","thevenin","capacitors","rc","inductors","filters","components"]);
function describe(q,t){
 const id=t.id,v=vals(q);
 return {
  topic:id,
  question:q.id,
  kind:q.level,
  values:v,
  schematic:"Textbook circuit schematic",
  concept:/ac|rc|capacitors|inductors|filters|timing|rf|power-rails|instruments|buses|ohm|power/.test(id)?"Operating-point graph / waveform":"Comparison & engineering chart",
  wiring:boards.has(id)?"3-Panel Board, Solderless Breadboard & Symbols":"3-Panel Avionics Board, Test Harness & Symbols",
  board:boards.has(id)
 };
}
function head(q,t,w=780){
 return text(22,30,"CIRCUIT · "+q.id.toUpperCase()+" · "+q.level.toUpperCase(),12,P.blue,"start","800")+
        text(22,52,units[t.id]||"Electrical measurement",16,P.ink,"start","700");
}
function known(q,w=780){
 const a=vals(q);let out="";
 if(a.length){
  out+=text(w-22,26,"GIVEN IN QUESTION",10,P.muted,"end","700");
  a.slice(0,3).forEach((v,i)=>{
   const bx=w-235+i*73;
   out+=rect(bx,33,69,25,"#eaf5fb","#b7d8e8",5)+text(bx+34,50,v,11,P.ink,"middle","700");
  });
 }
 return out;
}

/* ---------- 1. TEXTBOOK CIRCUIT SCHEMATICS (Floyd & Buchla Style) ---------- */
function loopSchematic(q,t){
 const r=resistance(q),v=source(q),cur=currents(q);
 const rLab=r[0]||(t.id==="power"?"Load R":q.level==="Calculation"?"R = ?":"4.7 MΩ");
 const iLab=cur[0]||(q.expected!==undefined&&/m?A$/.test(q.unit)?"I = "+Number(q.expected.toPrecision(4))+" "+q.unit:"I");
 let s=head(q,t)+known(q);
 // Outer textbook circuit loop (Fig 3-9 style)
 s+=line(155,95,480,95,P.ink,2.8)+line(480,95,480,145,P.ink,2.8)+zigV(480,155,235,rLab,P.ink,"R")+line(480,245,480,285,P.ink,2.8)+line(155,285,480,285,P.ink,2.8);
 s+=battery(155,95,285,v==="Vₛ"?"5 V (ex.)":v,"V");
 // Floyd & Buchla bright magenta/pink closed current loop inside!
 s+=path("M188 158 V126 Q188 114 202 114 H432 Q446 114 446 128 V252 Q446 266 432 266 H202 Q188 266 188 252 V202",P.pink,2.5);
 s+='<polygon points="188,196 182,211 194,211" fill="'+P.pink+'"/>';
 s+=text(317,138,iLab,17,P.pink,"middle","700","italic");
 // Ground symbol at bottom left
 s+=groundSym(155,285);
 // DMM probe readout on right
 s+=dot(480,95,P.red,6)+dot(480,285,P.navy,6);
 s+=path("M480 95 H595 V145",P.red,2.2)+path("M480 285 H630 V225",P.navy,2.2);
 s+=rect(570,145,165,80,"#ffffff","#6da4bf",10,2)+text(652,171,"DMM (Volts)",13,P.ink,"middle","700")+
    rect(590,183,124,30,"#e5f5ec","#8fc3a7",5)+text(652,203,v==="Vₛ"?"V_AB = V+ − V−":v,13,P.green,"middle","700");
 s+=text(598,112,"Red (+)",11,P.red,"start","700")+text(634,274,"Black (COM 0 V)",11,P.navy,"start","700");
 s+=text(317,328,"Closed conventional current path I from (+) through R back to (−)",12,P.muted,"middle");
 return s;
}

function seriesSchematic(q,t){
 const r=resistance(q),v=source(q);
 const r1=r[0]||"R₁",r2=r[1]||"R₂",r3=r[2]||"";
 let s=head(q,t)+known(q);
 s+=battery(105,105,275,v,"Vₛ");
 if(r3){
  s+=line(105,105,160,105,P.ink,2.8)+zigH(174,254,105,r1)+line(268,105,305,105,P.ink,2.8)+zigH(319,399,105,r2)+line(413,105,450,105,P.ink,2.8)+zigH(464,544,105,r3)+line(558,105,645,105,P.ink,2.8);
 }else{
  s+=line(105,105,190,105,P.ink,2.8)+zigH(206,316,105,r1)+line(332,105,388,105,P.ink,2.8)+zigH(404,514,105,r2)+line(530,105,645,105,P.ink,2.8);
  s+=dot(360,105,P.blue,6)+text(360,136,"V_out (Midpoint)",12,P.blue,"middle","700");
 }
 s+=line(645,105,645,275,P.ink,2.8)+line(105,275,645,275,P.ink,2.8)+groundSym(105,275);
 s+=path("M142 152 V132 H615 V248 H142 V195",P.pink,2.3)+'<polygon points="142,188 137,201 147,201" fill="'+P.pink+'"/>';
 s+=text(375,166,"Same current I flows through every series element",13,P.pink,"middle","700");
 s+=text(375,326,"KVL: V_s = V₁ + V₂" + (r3?" + V₃":"") + " · Total R_T = sum of series resistors",12,P.muted,"middle");
 return s;
}

function parallelSchematic(q,t){
 const r=resistance(q);
 const count=/four|R4|I4|I₄|F1/i.test(q.id+q.question)?4:Math.max(2,Math.min(4,r.length||3));
 let s=head(q,t)+known(q);
 const xEnd=675;
 // Floyd & Buchla Fig 6.1-2 style: Cyan top bus A, Green bottom bus B, Pink IT & I1..I4
 s+=battery(105,100,276,source(q),"Vₛ");
 s+=line(105,100,xEnd,100,P.cyan,3.4);
 s+=line(105,276,xEnd,276,P.green,3.4);
 s+=text(230,85,"A",18,P.pink,"middle","700","italic");
 s+=text(230,305,"B",18,P.pink,"middle","700","italic");
 // Pink curved IT arrows
 s+=path("M126 144 V120 Q126 112 136 112 H185",P.pink,2.4)+'<polygon points="194,112 182,107 182,117" fill="'+P.pink+'"/>'+text(158,136,"I_T",15,P.pink,"middle","700","italic");
 s+=path("M192 263 H136 Q126 263 126 254 V232",P.pink,2.4)+'<polygon points="126,223 121,235 131,235" fill="'+P.pink+'"/>'+text(158,254,"I_T",15,P.pink,"middle","700","italic");
 for(let i=0;i<count;i++){
  const x=230+i*(count===4?140:count===3?195:320);
  s+=line(x,100,x,145,P.cyan,2.8)+zigV(x,155,222,r[i]||("R"+(i+1)),P.ink,"")+line(x,232,x,276,P.green,2.8);
  if(i<count-1){s+=dot(x,100,P.cyan,6)+dot(x,276,P.green,6);}
  const subNum=["₁","₂","₃","₄"][i]||(i+1);
  s+=arrow(x-30,145,x-30,228,P.pink,2.3)+text(x-44,193,"I"+subNum,15,P.pink,"end","700","italic");
 }
 s+=text(390,336,"Every branch connects directly between Node A (+) and Node B (return): same V_S across each",12,P.muted,"middle");
 return s;
}

function nodeSchematic(q,t){
 if(/KVL|loop|voltage/i.test(q.question)&&!/KCL|node|current/i.test(q.question))return seriesSchematic(q,t);
 const c=currents(q);
 let s=head(q,t)+known(q);
 s+=line(95,180,340,180,P.cyan,4)+dot(340,180,P.blue,10);
 s+=line(340,180,585,95,P.green,3)+line(340,180,585,180,P.green,3)+line(340,180,585,265,P.green,3);
 s+=arrow(140,160,260,160,P.pink,3)+text(195,146,"I_in = "+(c[0]||"I_total"),14,P.pink,"middle","700");
 s+=arrow(435,126,535,92,P.pink,2.6)+text(600,100,"I₁ = "+(c[1]||"?"),14,P.pink,"start","700");
 s+=arrow(435,163,535,163,P.pink,2.6)+text(600,185,"I₂ = "+(c[2]||"?"),14,P.pink,"start","700");
 s+=arrow(435,233,535,267,P.pink,2.6)+text(600,270,"I₃ = ?",14,P.pink,"start","700");
 s+=text(340,152,"NODE A",14,P.blue,"middle","800");
 s+=text(390,326,"Kirchhoff's Current Law (KCL): Σ I_entering = Σ I_leaving",13,P.ink,"middle","700");
 return s;
}

function theveninSchematic(q,t){
 const r=resistance(q),v=source(q);
 let s=head(q,t)+known(q);
 s+=rect(70,80,365,220,"#f6fbfe","#96bfd6",12,1.8)+text(92,106,"THEVENIN EQUIVALENT NETWORK",11,P.blue,"start","800");
 s+=battery(145,125,275,v==="Vₛ"?"V_th":v,"V_th");
 s+=line(145,125,225,125,P.ink,2.8)+zigH(240,340,125,r[0]||"R_th")+line(354,125,565,125,P.ink,2.8);
 s+=dot(435,125,P.blue,6)+dot(435,275,P.green,6)+text(435,112,"Out+",12,P.blue,"middle","700");
 s+=line(565,125,565,155,P.ink,2.8)+zigV(565,165,230,"R_load",P.ink,"")+line(565,240,565,275,P.ink,2.8)+line(145,275,565,275,P.ink,2.8);
 s+=arrow(455,108,540,108,P.pink,2.5)+text(498,97,"I_load",13,P.pink,"middle","700","italic");
 s+=text(390,328,"Open-circuit output = V_th · Loaded output sags by I_load × R_th",12,P.muted,"middle");
 return s;
}

function reactiveSchematic(q,t){
 const id=t.id,r=resistance(q),v=source(q);
 const cVal=(q.question.match(/\d+(?:\.\d+)?\s*(?:µF|pF|nF)/i)||[])[0]||"C";
 const lVal=(q.question.match(/\d+(?:\.\d+)?\s*(?:mH|µH|H)\b/i)||[])[0]||"L";
 let s=head(q,t)+known(q);
 s+=battery(130,98,270,v,"V_step");
 s+=line(130,98,225,98,P.ink,2.8)+zigH(240,360,98,r[0]||"R")+line(374,98,535,98,P.ink,2.8)+line(535,98,535,134,P.ink,2.8);
 if(id==="inductors")s+=inductor(535,184,lVal);
 else s+=capacitor(535,184,cVal);
 s+=line(535,234,535,270,P.ink,2.8)+line(130,270,535,270,P.ink,2.8)+groundSym(130,270);
 s+=arrow(405,78,495,78,P.pink,2.6)+text(450,68,"I(t)",14,P.pink,"middle","700","italic");
 s+=dot(535,98,P.blue,6)+dot(535,270,P.green,6)+text(552,115,"V_node(t)",13,P.blue,"start","700");
 s+=text(390,326,id==="inductors"?"Inductor current lags step via τ = L/R · V_L = L(dI/dt)":"Capacitor voltage charges smoothly via τ = R·C",12,P.muted,"middle");
 return s;
}

function acSchematic(q,t){
 const f=freqVals(q)[0]||"f";
 let s=head(q,t)+known(q);
 s+=line(145,105,540,105,P.ink,2.8)+line(540,105,540,145,P.ink,2.8)+zigV(540,155,230,resistance(q)[0]||"Z_load")+line(540,240,540,280,P.ink,2.8)+line(145,280,540,280,P.ink,2.8);
 s+=line(145,105,145,152,P.ink,2.8)+line(145,232,145,280,P.ink,2.8)+'<circle cx="145" cy="192" r="40" fill="#f7fbff" stroke="'+P.ink+'" stroke-width="2.8"/>';
 s+=path("M121 192 C129 162, 137 162, 145 192 C153 222, 161 222, 169 192",P.pink,2.8);
 s+=text(88,186,"AC",16,P.ink,"end","800")+text(88,208,source(q)+" @ "+f,13,P.blue,"end","700");
 s+=arrow(270,86,390,86,P.pink,2.6)+text(330,76,"i(t)  AC",14,P.pink,"middle","700","italic");
 s+=text(390,328,"V_rms = V_peak / √2 · Period T = 1 / f",12,P.muted,"middle");
 return s;
}

function transformerSchematic(q,t){
 let s=head(q,t)+known(q);
 s+=line(140,100,265,100,P.ink,2.8)+line(140,268,265,268,P.ink,2.8);
 s+='<circle cx="140" cy="184" r="34" fill="#f7fbff" stroke="'+P.ink+'" stroke-width="2.6"/>'+path("M122 184 C128 160, 134 160, 140 184 C146 208, 152 208, 158 184",P.pink,2.4);
 s+=text(95,188,source(q),14,P.ink,"end","700");
 s+=line(265,100,265,134,P.ink,2.8)+inductor(265,184,"N_p")+line(265,234,265,268,P.ink,2.8);
 s+=line(348,118,348,250,P.blue,3.2)+line(362,118,362,250,P.blue,3.2)+text(355,104,"Isolated Core",12,P.blue,"middle","700");
 s+=line(445,100,445,134,P.ink,2.8)+inductor(445,184,"N_s")+line(445,234,445,268,P.ink,2.8);
 s+=line(445,100,595,100,P.ink,2.8)+line(445,268,595,268,P.ink,2.8)+line(595,100,595,140,P.ink,2.8)+zigV(595,150,220,"Load")+line(595,230,595,268,P.ink,2.8);
 s+=arrow(290,78,415,78,P.pink,2.4)+text(355,68,"Magnetic Flux Φ(t)",12,P.pink,"middle","700");
 s+=text(390,328,"Galvanic isolation: V_s / V_p = N_s / N_p · 3-Phase P = √3 · V_LL · I_L · PF",12,P.muted,"middle");
 return s;
}

function systemBlockSchematic(q,t){
 const id=t.id;
 const blocks={
  components:["3.3 V / 5 V Source","Gate / Pull-Up R","MOSFET / Diode","Digital Receiver"],
  "power-rails":["28 V / 12 V Bus","Buck + Sequencer","Shunt (5 mΩ)","Flight CPU / Payload"],
  schematics:["Bench Supply (CC)","PCBA Power Tree","MCU Clock + Reset","Test Points + UART"],
  instruments:["DUT Test Node","Low-L Ground Spring","4-Ch Keysight Scope","Waveform / DMM Log"],
  timing:["Crystal / PLL Clock","Combinational Logic","D Flip-Flop Capture","SYS_RESET_N"],
  buses:["Host / Flight MCU","TX/RX · SPI · I²C · CAN","Pull-Ups / 120 Ω Term","Target Sensor / Scope"],
  "python-scpi":["Python (pytest)","PyVISA / SCPI (LAN)","DMM / Supply / Scope","Pass/Fail + CSV Log"],
  linux:["Linux Test Host","/dev/serial/by-id/","Bootloader + Kernel","Raw Log grep / sha256"],
  rf:["RF Synthesizer","50 Ω Coax + Atten","RF Payload / Ant","Spectrum / VNA (S11)"],
  qualification:["Approved FW + Script","Flight Avionics PCBA","TVAC / Thermal Chamber","Go / No-Go Release"]
 };
 const names=blocks[id]||["Source","Interconnect","DUT","Instrument"];
 let s=head(q,t)+known(q);
 names.forEach((nm,i)=>{
  const x=26+i*188;
  s+=rect(x,106,158,118,i%2?"#f5fafd":"#eaf5fb","#8ebed4",12,1.8);
  s+=text(x+79,134,"STAGE 0"+(i+1),10,P.blue,"middle","800");
  s+=text(x+79,166,nm,13,P.ink,"middle","700");
  s+=text(x+79,198,i===0?"INPUT / DRIVE":i===1?"SIGNAL PATH":i===2?"DEVICE / TEST":"VERIFY / LOG",10,P.muted,"middle","600");
  if(i<3)s+=arrow(x+160,165,x+184,165,P.pink,2.8);
 });
 s+=line(95,256,685,256,P.green,2.8)+dot(95,256,P.green,5)+dot(685,256,P.green,5);
 s+=text(390,282,"Shared 0 V Reference / Isolation / Configuration Traceability",13,P.green,"middle","700");
 s+=text(390,324,"Muon Space Avionics Path: isolate each stage sequentially before declaring DUT failure",12,P.muted,"middle");
 return s;
}

function logicGateForQuestion(q){
 const names=["AND","OR","NAND","NOR","XOR","XNOR"];
 const n=Number((q.id.match(/(\d+)$/)||[])[1])||1,offset={Foundations:0,Application:1,Troubleshooting:2}[q.level]||0;
 return names[(n-1+offset)%names.length];
}

function booleanGateSchematic(q,t){
 const gate=logicGateForQuestion(q),inv=/NAND|NOR|XNOR/.test(gate),isOr=/OR|XOR/.test(gate);
 const fn=(a,b)=>gate==="AND"?a&b:gate==="OR"?a|b:gate==="NAND"?1-(a&b):gate==="NOR"?1-(a|b):gate==="XOR"?a^b:1-(a^b);
 const expr=gate==="AND"?"X = A · B":gate==="OR"?"X = A + B":gate==="NAND"?"X = ¬(A · B)":gate==="NOR"?"X = ¬(A + B)":gate==="XOR"?"X = A ⊕ B":"X = ¬(A ⊕ B)";
 let s=head(q,t)+known(q)+text(28,82,"BOOLEAN FUNCTION · "+gate,13,P.navy,"start","800");
 if(!isOr)s+='<path d="M245 134 H292 A45 48 0 0 1 292 230 H245 Z" fill="#f7fbff" stroke="'+P.ink+'" stroke-width="2.8"/>';
 else s+='<path d="M242 134 Q278 182 242 230 Q287 219 329 182 Q287 145 242 134 Z" fill="#f7fbff" stroke="'+P.ink+'" stroke-width="2.8"/>'+(gate==="XOR"||gate==="XNOR"?'<path d="M230 134 Q266 182 230 230" fill="none" stroke="'+P.ink+'" stroke-width="2.8"/>':"");
 s+=line(145,157,245,157,P.ink,2.8)+line(145,207,245,207,P.ink,2.8)+text(132,162,"A",14,P.blue,"end","700","italic")+text(132,212,"B",14,P.teal,"end","700","italic");
 const outX=inv?344:329;s+=line(outX,182,416,182,P.ink,2.8)+(inv?'<circle cx="'+outX+'" cy="182" r="6" fill="#fff" stroke="'+P.ink+'" stroke-width="2.5"/>':"")+line(416,182,445,182,P.ink,2.8)+text(453,187,"X",14,P.pink,"start","800","italic");
 s+=text(290,263,expr,17,P.ink,"middle","700")+text(517,92,"TRUTH TABLE",11,P.navy,"middle","800");
 s+=rect(447,105,224,146,"#f7fbfd","#cbdce7",8,1.2);
 [["A","B","X"],["0","0",String(fn(0,0))],["0","1",String(fn(0,1))],["1","0",String(fn(1,0))],["1","1",String(fn(1,1))]].forEach((row,ri)=>row.forEach((v,ci)=>s+=text(485+ci*66,130+ri*23,v,12,ri===0?P.navy:P.ink,"middle",ri===0?"800":"600")));
 s+=text(389,318,"A valid logic design preserves every truth-table row after gate mapping.",12,P.muted,"middle")+
  text(389,338,"Check VOH / VOL against the next device’s VIH / VIL limits.",11,P.green,"middle","700");
 return svg(s,"Two-input "+gate+" logic gate, Boolean expression, and complete truth table for "+q.id);
}

function siUnitVisual(q,t,mode){
 let out=head(q,t)+text(22,76,"Chapter 1 · Base and Derived Units (BIPM / Floyd & Buchla)",12,P.muted);
 if(mode==="schematic"){
  out+=rect(22,92,736,120,"#f1f8fc","#bddbe7",9)+text(40,116,"SEVEN SI BASE UNITS",14,P.ink,"start","800");
  const a=[["meter","m"],["kilogram","kg"],["second","s"],["ampere","A"],["kelvin","K"],["mole","mol"],["candela","cd"]];
  a.forEach((v,i)=>{const x=34+i*103;out+=rect(x,130,95,62,i===3?"#d3f3e9":"#fff",i===3?P.green:"#cbd9e2",7)+text(x+47,151,v[0],11,P.ink,"middle")+text(x+47,177,v[1],18,i===3?P.green:P.ink,"middle","700");});
  out+=rect(22,226,736,88,"#fff9e9","#ead29c",8)+text(40,248,"DERIVED UNIT EXAMPLE",13,P.ink,"start","800")+
   text(54,282,"Volt (V)",20,P.blue,"start","700")+text(185,283,"= Watt (W) / Ampere (A)",18,P.ink)+
   text(54,302,"Not an eighth base unit (1 V = 1 J/C = 1 W/A)",11,P.muted);
 }else{
  const blocks=[["BASE UNIT","ampere (A)","electric current"],["DERIVED UNIT","volt (V)","potential difference"],["PREFIX milli (m)","× 10⁻³","0.001 × base"],["PREFIX micro (µ)","× 10⁻⁶","0.000001 × base"]];
  blocks.forEach((v,i)=>{const x=26+(i%2)*372,y=96+Math.floor(i/2)*114;out+=rect(x,y,354,96,i===0?"#e4f7ed":i===1?"#e9f5fc":"#fff8e9","#bbd3df",10)+text(x+18,y+24,v[0],11,P.muted,"start","700")+text(x+18,y+56,v[1],20,P.ink,"start","700")+text(x+18,y+80,v[2],12,P.muted);});
 }
 return svg(out,"SI base and derived units conceptual diagram for question "+q.id+"; ampere is base and volt is derived");
}

function schematic(q,t){
 const id=t.id;
 if(id==="units")return siUnitVisual(q,t,"schematic");
 if(id==="series")return svg(seriesSchematic(q,t),"Series circuit schematic with current loop and resistor values");
 if(id==="parallel")return svg(parallelSchematic(q,t),"Parallel circuit schematic with Nodes A and B and branch currents");
 if(id==="kcl-kvl")return svg(nodeSchematic(q,t),"Kirchhoff node current and loop schematic");
 if(id==="thevenin")return svg(theveninSchematic(q,t),"Thevenin equivalent source and load schematic");
 if(["rc","capacitors","inductors","filters"].includes(id))return svg(reactiveSchematic(q,t),"Reactive RC/RL/LC circuit schematic");
 if(id==="ac")return svg(acSchematic(q,t),"AC sinusoidal source and impedance load schematic");
 if(id==="magnetics")return svg(transformerSchematic(q,t),"Transformer magnetic coupling schematic");
 if(id==="components"&&(q.skillIndex===3||/truth table|boolean|logic gate|karnaugh|SOP|POS/i.test(q.question)))return booleanGateSchematic(q,t);
 if(["components","power-rails","schematics","instruments","timing","buses","python-scpi","linux","rf","qualification"].includes(id))return svg(systemBlockSchematic(q,t),"Avionics subsystem signal path schematic");
 return svg(loopSchematic(q,t),"DC source, current loop and resistor schematic with DMM probe");
}

/* ---------- 2. QUESTION-TAILORED GRAPHS & WAVEFORMS ---------- */
function curve(q,t){
 const id=t.id;
 if(id==="units")return siUnitVisual(q,t,"concept");
 let s=head(q,t)+known(q);
 const x0=84,x1=695,y0=262,y1=92;
 s+=line(x0,y1,x0,y0,P.muted,2)+line(x0,y0,x1,y0,P.muted,2);
 if(["ohm","units","power"].includes(id)){
  // Plot linear Ohm's Law I vs V or P vs V with highlighted operating dot
  const vNum=parseFloat(source(q))||5;
  const rMatch=q.question.match(/(\d+(?:\.\d+)?)\s*(MΩ|kΩ|Ω)/i);
  let labelPt="Operating Point";
  if(rMatch)labelPt=vNum+" V across "+rMatch[0];
  else if(q.expected!==undefined)labelPt="Answer: "+Number(q.expected.toPrecision(4))+" "+q.unit;
  s+=line(x0,y0,x1-40,y1+18,P.blue,3.5);
  const px=x0+0.55*(x1-x0),py=y0-0.52*(y0-y1);
  s+=path("M"+px+" "+y0+" V"+py+" H"+x0,P.pink,1.8,"none","5 4");
  s+=dot(px,py,P.pink,7)+text(px+12,py-8,labelPt,13,P.pink,"start","700");
  s+=text(x0-10,y1+8,"I / P",12,P.muted,"end","700")+text(x1,y0+20,"Applied Voltage V",12,P.muted,"end","700");
  s+=text(390,324,"Linear ohmic behavior: doubling V doubles current I = V/R (power P = V²/R grows 4×)",12,P.muted,"middle");
 }else if(["ac","timing","buses"].includes(id)){
  const isAC=id==="ac";
  let d="";
  for(let i=0;i<=60;i++){
   const x=x0+i*10;
   const y=isAC?(y0+y1)/2-64*Math.sin(i/60*Math.PI*4):((Math.floor(i/6)%2===0)?y1+26:y0-28);
   d+=(i===0?"M":"L")+x+" "+y;
  }
  s+=path(d,P.blue,3.2);
  if(isAC){
   s+=line(x0,y1+21,x1,y1+21,P.pink,1.6,"none","4 4")+text(x1-5,y1+14,"V_peak",12,P.pink,"end","700");
   s+=line(x0,y1+45,x1,y1+45,P.green,1.8,"none","6 3")+text(x1-5,y1+39,"V_rms = 0.707 V_peak",12,P.green,"end","700");
  }else{
   const tx=x0+180;
   s+=line(tx,y1,tx,y0,P.pink,2)+text(tx+8,y1+16,id==="buses"?"Sample / Baud edge":"Setup/Hold window",12,P.pink,"start","700");
  }
  s+=text(390,324,isAC?"Period T = 1/f · RMS equals equivalent DC heating":"Clock & serial bit timing aligned to rising sample edge",12,P.muted,"middle");
 }else if(["rc","capacitors","inductors"].includes(id)){
  let d="";
  for(let i=0;i<=60;i++){
   const x=x0+i*10,y=y0-(y0-y1)*(1-Math.exp(-i/12));
   d+=(i===0?"M":"L")+x+" "+y;
  }
  s+=path(d,P.blue,3.5);
  const t1=x0+120,y1tau=y0-(y0-y1)*0.632;
  s+=path("M"+t1+" "+y0+" V"+y1tau+" H"+x0,P.pink,2,"none","5 4")+dot(t1,y1tau,P.pink,6.5);
  s+=text(t1+10,y1tau+14,"1τ (63.2%)",13,P.pink,"start","700");
  const t5=x0+500;
  s+=line(t5,y1,t5,y0,P.green,1.8)+text(t5-6,y1+16,"5τ (99.3% settled)",12,P.green,"end","700");
  s+=text(390,324,"Exponential transient: reaches 63.2% at 1τ and settles >99% at 5τ",12,P.muted,"middle");
 }else if(["power-rails","schematics","instruments"].includes(id)){
  // 4-Channel Keysight-style Power Rail Droop + Current Sense Capture
  let vRail="",iStep="";
  for(let i=0;i<=60;i++){
   const x=x0+i*10;
   const vr=(i<18)?122:(i<32)?178+(i-18)*0.6:122+55*Math.exp(-(i-32)/6);
   const is=(i<18)?238:(i<36)?198:238;
   vRail+=(i===0?"M":"L")+x+" "+vr;
   iStep+=(i===0?"M":"L")+x+" "+is;
  }
  s+=path(vRail,P.blue,3.2)+path(iStep,P.pink,2.8);
  s+=text(x0+14,114,"CH2: Rail V(t) (droop ΔV)",12,P.blue,"start","700");
  s+=text(x0+14,190,"CH3: Shunt I(t) = V_sense / R_shunt",12,P.pink,"start","700");
  s+=text(390,324,"Synchronized scope capture: rising current step triggers temporary rail droop",12,P.muted,"middle");
 }else if(["filters","rf"].includes(id)){
  let d="";
  for(let i=0;i<=60;i++){
   const x=x0+i*10;
   const y=id==="rf"?(y0-135*Math.exp(-Math.pow((i-26)/6,2))-45*Math.exp(-Math.pow((i-46)/3.5,2))):(y1+20+135/(1+Math.exp(-(i-30)/5.5)));
   d+=(i===0?"M":"L")+x+" "+y;
  }
  s+=path(d,P.blue,3.4);
  const fcX=x0+(id==="rf"?260:300),fcY=id==="rf"?y0-135:y1+88;
  s+=dot(fcX,fcY,P.pink,6.5)+text(fcX+10,fcY-8,id==="rf"?"Carrier Peak (f₀)":"−3 dB Cutoff (f_c)",13,P.pink,"start","700");
  s+=text(390,324,id==="rf"?"Spectrum power (dBm) vs Frequency (GHz)":"Filter gain (dB) vs Frequency (Hz)",12,P.muted,"middle");
 }else{
  const valsArr=["R₁ / V₁","R₂ / V₂","R₃ / V₃","Total / Limit"];
  [125,88,108,150].forEach((h,i)=>{
   const bx=135+i*142;
   s+=rect(bx,y0-h,74,h,[P.blue,P.teal,P.gold,P.pink][i],"none",4)+text(bx+37,y0+20,valsArr[i],12,P.ink,"middle","700");
  });
  s+=text(390,324,"Relative branch / limit comparison chart for "+q.id.toUpperCase(),12,P.muted,"middle");
 }
 return svg(s,"Question "+q.id+" graph showing "+units[id]);
}

/* ---------- 3. 3-PANEL BOARD + SOLDERLESS BREADBOARD + CIRCUIT SYMBOLS (28 Question-Tailored Topologies) ---------- */
function parseOhms(resText){
 if(typeof resText!=="string")return 1000;
 const m=resText.match(/([\d.]+)\s*(G|M|k|m|µ|u)?\s*Ω/i);
 if(!m)return 1000;
 const n=Number(m[1]);
 if(!Number.isFinite(n)||n<=0)return 1000;
 const mult={G:1e9,M:1e6,k:1e3,m:1e-3,"µ":1e-6,u:1e-6}[m[2]||""]||1;
 return n*mult;
}

function bandColorsFor(resText){
 const EIA=["#111827","#78350f","#dc2626","#ea580c","#ca8a04","#16a34a","#2563eb","#7c3aed","#6b7280","#f8fafc"];
 const ohms=parseOhms(String(resText||"1 kΩ"));
 if(ohms<=0)return [EIA[1],EIA[0],EIA[2]];
 let exp=Math.floor(Math.log10(ohms))-1;
 let sig=Math.round(ohms/Math.pow(10,exp));
 if(sig>=100){sig=Math.round(sig/10);exp+=1;}
 if(sig<10){sig=Math.max(10,sig*10);exp-=1;}
 const d1=Math.min(9,Math.max(0,Math.floor(sig/10)));
 const d2=Math.min(9,Math.max(0,sig%10));
 const mColor=exp===-1?"#d4af37":exp<=-2?"#94a3b8":EIA[Math.min(7,Math.max(0,exp))];
 return [EIA[d1],EIA[d2],mColor];
}

function clipLabel(s,max=25){
 const str=String(s||"").replace(/\s+/g," ").trim();
 return str.length>max?str.slice(0,max-1)+"…":str;
}

function wrapTwo(s,max=25){
 const str=String(s||"").replace(/\s+/g," ").trim();
 if(str.length<=max)return [str,""];
 let cut=str.lastIndexOf(" ",max);
 if(cut<8)cut=max;
 return [str.slice(0,cut).trim(),clipLabel(str.slice(cut).trim(),max)];
}

function classifyWiring(q,t){
 const id=t.id,cf=q.calcFamily||"",txt=(q.question+" "+cf+" "+q.id).toLowerCase();
 if(id==="units"){
  if(/milli|micro|amp|\bcurrent\b|\bmA\b|\bµA\b/i.test(txt)||cf==="milli"||cf==="micro")return "ammeter-series";
  if(/watt|power|joule|energy/i.test(txt))return "dc-power";
  if(/ohm|resist/i.test(txt))return "dmm-ohm";
  return "voltmeter-parallel";
 }
 if(id==="ohm"){
  if(/continuity|broken|open circuit|power-off|ohmmeter/i.test(txt))return "continuity";
  if(/\bcurrent\b|ammeter|series.*meter|\bmA\b|\bµA\b|ohmI/i.test(txt)||cf==="ohmI")return "ammeter-series";
  if(/resistor|color|code|ohmR|330|limit/i.test(txt)||cf==="ohmR")return "dmm-ohm";
  return "voltmeter-parallel";
 }
 if(id==="power"){
  if(/joule|energy|wh|watt-hour|time/i.test(txt)||cf==="joule")return "energy-log";
  if(/thermal|temp|dissipat|derat|heatsink/i.test(txt))return "thermal-load";
  return "dc-power";
 }
 if(id==="series"){
  if(/divider|vout|v_out|tap|midpoint|ratio/i.test(txt)||cf==="divider"){
   const isLoaded=!/\bunloaded\b/i.test(txt)&&/\b(?:loaded|loading|parallel load|external load|with load|rl)\b/i.test(txt);
   return isLoaded?"loaded-divider":"voltage-divider";
  }
  return "series-chain";
 }
 if(id==="parallel")return "parallel-network";
 if(id==="kcl-kvl"){
  if(/kcl|node|junction|branch.*sum|enter|leav/i.test(txt)||cf==="kcl")return "kcl-junction";
  return "kvl-mesh";
 }
 if(id==="thevenin")return /norton/i.test(txt)||cf==="norton"?"norton-source":"thevenin-port";
 if(id==="ac")return /phase|lead|lag/i.test(txt)?"ac-phase":"ac-bench";
 if(id==="capacitors"){
  if(/decoupl|bypass|100\s*nf|0\.1|esr|ripple/i.test(txt))return "cap-decoupling";
  if(/parallel.*cap|combine.*cap|add.*cap/i.test(txt))return "cap-parallel";
  return "cap-charge";
 }
 if(id==="rc"){
  if(/probe|loading|10\s*mω|scope/i.test(txt))return "rc-probe-load";
  if(/discharg/i.test(txt))return "rc-discharge";
  return "rc-charge";
 }
 if(id==="inductors")return /flyback|clamp|diode|kickback|solenoid|relay/i.test(txt)?"inductor-flyback":"rl-transient";
 if(id==="filters"){
  if(/high-pass|high pass|hpf|dc block/i.test(txt))return "filter-hpf";
  if(/rlc|reson|tank|band-pass|notch|q\s*factor/i.test(txt)||cf==="lcF0")return "filter-rlc";
  return "filter-lpf";
 }
 if(id==="magnetics")return /3-phase|three-phase|three phase|wye|delta|line-to-line/i.test(txt)||cf==="threephase"?"three-phase":"transformer-iso";
 if(id==="components"){
  if(q.skillIndex===3||/truth table|boolean gate|karnaugh|\bSOP\b|\bPOS\b/i.test(txt))return "logic-gates";
  if(/mosfet|fet|vgs|rds|gate|drain|low-side/i.test(txt))return "mosfet-load";
  if(/open-drain|pull-up|pullup|comparator|logic|threshold/i.test(txt))return "open-drain-pullup";
  return "led-diode";
 }
 if(id==="power-rails"){
  if(/shunt|kelvin|milliohm|mω|sense resistor|ina/i.test(txt)||cf==="shunt")return "kelvin-shunt";
  if(/sequenc|pgood|power-good|enable|soft-start/i.test(txt))return "rail-sequence";
  if(/ripple|droop|load step|transient|overshoot/i.test(txt))return "rail-ripple";
  return "power-tree";
 }
 if(id==="schematics"){
  if(/a-b-a|swap|known good|kgb/i.test(txt))return "aba-swap";
  if(/ground|star|return|offset|bounce/i.test(txt))return "ground-star";
  return "continuity";
 }
 if(id==="instruments")return /nyquist|sample|alias|trigger|timebase|dmm.*scope/i.test(txt)?"scope-trigger":"probe-comp";
 if(id==="timing"){
  if(/reset|por|supervisor|watchdog/i.test(txt))return "reset-supervisor";
  if(/setup|hold|flip-flop|latch|skew/i.test(txt))return "dff-timing";
  return "clock-damping";
 }
 if(id==="buses"){
  if(/i2c|i²c|sda|scl|pull-up|pullup/i.test(txt))return "i2c-bus";
  if(/spi|mosi|miso|sclk|cs\b/i.test(txt)||cf==="spiTime")return "spi-bus";
  if(/can|120|60|differential/i.test(txt))return "can-bus";
  if(/physical|protocol|logic analy/i.test(txt))return "bus-protocol";
  return "uart-bus";
 }
 if(id==="python-scpi"){
  if(/exception|safe|outp off|abort|fault|recovery/i.test(txt))return "scpi-safestate";
  if(/retry|flake|stale|throughput|buffer/i.test(txt))return "scpi-retry";
  if(/assert|limit|margin|nan|range|guard/i.test(txt)||cf==="assertMargin")return "scpi-limit";
  if(/visa|transport|timeout|gpib|usbtmc|lan/i.test(txt))return "scpi-transport";
  return "scpi-automation";
 }
 if(id==="linux"){
  if(/exit code|ci\b|status|return code/i.test(txt))return "hil-exitcode";
  if(/version|git|hash|sha|config|immutable/i.test(txt))return "hil-ver";
  if(/raw|summary|rate|failing|pass rate|yield/i.test(txt)||cf==="logRate"||cf==="yieldPct")return "hil-raw";
  if(/grep|filter|timestamp|regex|parse/i.test(txt))return "hil-filter";
  return "hil-console";
 }
 if(id==="rf"){
  if(/spectrum|rbw|harmoni|spurious|noise floor|spur/i.test(txt))return "rf-specan";
  if(/s21|insertion|vna|vector network|cable loss/i.test(txt))return "rf-vna-s21";
  if(/s11|return loss|vswr|mismatch|reflection/i.test(txt))return "rf-s11";
  if(/wavelength|antenna|lambda|quarter|ghz|mhz/i.test(txt)||cf==="wavelength")return "rf-lambda";
  return "rf-50ohm";
 }
 if(id==="qualification"){
  if(/tvac|thermal|cold|vacuum|cryo/i.test(txt))return "tvac-env";
  if(/validation|mission|flight-like|scenario/i.test(txt))return "qual-mission";
  if(/configuration|harness|serial number|freeze/i.test(txt))return "qual-cfg";
  if(/go or no-go|release|gate|yield|trr|mrr/i.test(txt)||cf==="yieldPct")return "qual-gate";
  return "qual-verify";
 }
 return "dmm-ohm";
}

function boardSetup(q,t){
 const key=classifyWiring(q,t);
 const gateName=logicGateForQuestion(q);
 const gateChip={AND:"74HC08",OR:"74HC32",NAND:"74HC00",NOR:"74HC02",XOR:"74HC86",XNOR:"74HC266"}[gateName];
 const v=vals(q),src=source(q),is=currents(q),fs=freqVals(q);
 const rawRs=(q.question.match(/\d+(?:\.\d+)?(?:e[+-]?\d+)?\s*(?:MΩ|kΩ|mΩ|Ω)/gi)||[]);
 const rs=rawRs.length?rawRs:resistance(q);
 const qCaps=(q.question.match(/\d+(?:\.\d+)?\s*(?:µF|uF|nF|pF|mF)/g)||[]);
 const qInds=(q.question.match(/\d+(?:\.\d+)?\s*(?:mH|µH|uH|nH)/g)||[]);
 const R0=String(rs[0]||v.find(x=>/Ω/.test(x))||"330 Ω");
 const R1=String(rs[1]||(rs[0]?"2.2 kΩ":"1 kΩ"));
 const R2=String(rs[2]||"470 Ω");
 const V0=String((src&&src!=="Vₛ")?src:(v.find(x=>/\b(V|mV)\b/.test(x))||"5 V"));
 const I0=String(is[0]||"MEAS mA");
 const C0=String(qCaps[0]||v.find(x=>/(µF|uF)/.test(x))||"10 µF");
 const C1=String(qCaps[1]||"100 nF");
 const L0=String(qInds[0]||v.find(x=>/(mH|µH)/.test(x))||"10 mH");
 const F0=String(fs[0]||"1 kHz");

 const defs={
  "dmm-ohm":{
   hw:"dmm",hwTitle:"BENCH DMM (Ω)",hwBadge:"Ω MODE",hwRead:R0,
   title:"2-Wire Resistance Check ("+R0+")",
   safety:"Disconnect all power before measuring resistance; remove parallel paths.",
   pins:[{p:"V / Ω",c:P.red},{p:"COM",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.red,tag:"Red V/Ω",dst:"a10"},{pi:1,col:0,row:15,c:"#1e293b",tag:"Blk COM",dst:"a15"}],
   comps:[{kind:"R",label:"R1",val:R0,col:2,r1:10,r2:15}],
   jumps:[{c1:0,r1:10,c2:1,r2:10,c:P.red},{c1:0,r1:15,c2:1,r2:15,c:"#1e293b"}],
   target:"DMM reads ~"+R0+" across row 10 ↔ row 15",sch:"ohmmeter"
  },
  "continuity":{
   hw:"dmm",hwTitle:"CONTINUITY / TRACE CHECK",hwBadge:"BEEP Ω",hwRead:"0.2 Ω",
   title:"Power-Off Trace & Trench Isolation Test",
   safety:"Power OFF first. Left bank a–e & right bank f–j are isolated until bridged.",
   pins:[{p:"PROBE+",c:P.red},{p:"COM",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:11,c:P.red,tag:"Red +",dst:"a11"},{pi:1,col:9,row:15,c:"#1e293b",tag:"Blk COM",dst:"j15"}],
   comps:[{kind:"WIRE",label:"FUSE/LINK",val:"0 Ω",c1:4,r1:11,c2:5,r2:11,c:P.gold},{kind:"R",label:"R_trace",val:R0,col:7,r1:11,r2:15}],
   jumps:[],
   target:"Beep / "+R0+" via bridge e11↔f11; silent if open",sch:"continuity"
  },
  "ammeter-series":{
   hw:"dmm",hwTitle:"PSU + SERIES AMMETER",hwBadge:"mA DC",hwRead:I0,
   title:"Series Ammeter Break-the-Loop Setup",
   safety:"NEVER wire an ammeter in parallel across a rail—insert IN SERIES across gap.",
   pins:[{p:"+V ("+V0+")",c:P.red},{p:"mA IN",c:P.gold},{p:"mA COM",c:P.blue},{p:"PSU GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.red,tag:"Red +V",dst:"a10"},{pi:1,col:3,row:10,c:P.gold,tag:"Yel mA+",dst:"d10"},{pi:2,col:5,row:10,c:P.blue,tag:"Blu mA−",dst:"f10"},{pi:3,col:9,row:15,c:"#1e293b",tag:"Blk GND",dst:"j15"}],
   comps:[{kind:"R",label:"R_load",val:R0,col:7,r1:10,r2:15}],
   jumps:[],
   target:"Meter bridges e10↔f10 trench in series ("+I0+")",sch:"ammeter"
  },
  "voltmeter-parallel":{
   hw:"dmm",hwTitle:"PSU + VOLTMETER PROBE",hwBadge:"V DC",hwRead:V0,
   title:"Parallel Voltmeter Node-Drop Check",
   safety:"Measure voltage across two distinct nodes (high-Z input in parallel with DUT).",
   pins:[{p:"+V ("+V0+")",c:P.red},{p:"V+ (DMM)",c:P.blue},{p:"COM / GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.red,tag:"Red +V",dst:"a10"},{pi:1,col:4,row:10,c:P.blue,tag:"Blu V+",dst:"e10"},{pi:2,col:0,row:15,c:"#1e293b",tag:"Blk COM",dst:"a15"}],
   comps:[{kind:"R",label:"R_dut",val:R0,col:2,r1:10,r2:15}],
   jumps:[],
   target:"DMM V+ on e10 vs COM on row 15 = "+V0,sch:"voltmeter"
  },
  "dc-power":{
   hw:"psu",hwTitle:"BENCH DC SUPPLY (CV/CC)",hwBadge:"CV MODE",hwRead:V0,
   title:"DC Power Dissipation & Shunt Check ("+R0+")",
   safety:"Verify resistor wattage rating (P = V²/R) and set PSU current limit first.",
   pins:[{p:"+V ("+V0+")",c:P.red},{p:"VSENSE",c:P.teal},{p:"COM",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.red,tag:"Red +V",dst:"a10"},{pi:1,col:5,row:10,c:P.teal,tag:"Sense +",dst:"f10"},{pi:2,col:0,row:16,c:"#1e293b",tag:"Blk COM",dst:"a16"}],
   comps:[{kind:"R",label:"R_pwr",val:R0,col:2,r1:10,r2:16},{kind:"R",label:"Rshnt",val:"0.1 Ω",c1:4,r1:10,c2:5,r2:10}],
   jumps:[{c1:0,r1:16,c2:5,r2:16,c:"#1e293b"}],
   target:"Check P = V²/R and ΔV across shunt e10↔f10",sch:"series-2"
  },
  "energy-log":{
   hw:"psu",hwTitle:"POWER LOGGER + LOAD",hwBadge:"W · J",hwRead:V0,
   title:"Integrated Energy & Load-Step Setup",
   safety:"Sample V(t) and I(t) across the load cycle to compute E = P × t.",
   pins:[{p:"VIN ("+V0+")",c:P.red},{p:"ADC_I",c:P.gold},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.red,tag:"Red VIN",dst:"a10"},{pi:1,col:4,row:12,c:P.gold,tag:"Yel I+",dst:"e12"},{pi:2,col:0,row:16,c:"#1e293b",tag:"Blk GND",dst:"a16"}],
   comps:[{kind:"R",label:"Rsns",val:"0.1 Ω",col:2,r1:10,r2:12},{kind:"R",label:"Load",val:R0,col:3,r1:12,r2:16}],
   jumps:[],
   target:"Integrate P(t) = V_load × I_sns over run time",sch:"series-2"
  },
  "thermal-load":{
   hw:"psu",hwTitle:"PSU + THERMAL DERATING",hwBadge:"T_RISE",hwRead:V0,
   title:"Power Resistor Thermal Dissipation Check",
   safety:"Check IR/thermocouple temperature; power resistors run hot under load.",
   pins:[{p:"+V ("+V0+")",c:P.red},{p:"TEMP_TC",c:P.gold},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.red,tag:"Red +V",dst:"a10"},{pi:1,col:5,row:13,c:P.gold,tag:"TC Probe",dst:"f13"},{pi:2,col:0,row:16,c:"#1e293b",tag:"Blk GND",dst:"a16"}],
   comps:[{kind:"R",label:"R_pwr",val:R0,col:2,r1:10,r2:16},{kind:"IC",label:"TC",val:"K-TYPE",r1:11,r2:14}],
   jumps:[],
   target:"Keep P_actual ≤ 50% derated component rating",sch:"series-2"
  },
  "series-chain":{
   hw:"psu",hwTitle:"BENCH PSU ("+V0+")",hwBadge:"SERIES",hwRead:V0,
   title:"3-Element Series Chain (Sequential Rows 10→12→14→16)",
   safety:"Single current path: row 10 → row 12 → row 14 → row 16.",
   pins:[{p:"+V ("+V0+")",c:P.red},{p:"TP_V12",c:P.blue},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.red,tag:"Red +V",dst:"a10"},{pi:1,col:4,row:12,c:P.blue,tag:"Blu TP1",dst:"e12"},{pi:2,col:0,row:16,c:"#1e293b",tag:"Blk GND",dst:"a16"}],
   comps:[{kind:"R",label:"R1",val:R0,col:1,r1:10,r2:12},{kind:"R",label:"R2",val:R1,col:2,r1:12,r2:14},{kind:"R",label:"R3",val:R2,col:3,r1:14,r2:16}],
   jumps:[],
   target:"Req = R1+R2+R3; single current I through all 3",sch:"series-3"
  },
  "voltage-divider":{
   hw:"nucleo",hwTitle:"NUCLEO / ADC DIVIDER",hwBadge:"V_OUT",hwRead:V0,
   title:"Unloaded Voltage Divider (Vout Tap at Row 13)",
   safety:"Verify Vout stays within MCU ADC max (3.3 V) before connecting A0.",
   pins:[{p:"VIN ("+V0+")",c:P.red},{p:"A0 (Vout)",c:P.blue},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.red,tag:"Red VIN",dst:"a10"},{pi:1,col:4,row:13,c:P.blue,tag:"Blu A0",dst:"e13"},{pi:2,col:0,row:16,c:"#1e293b",tag:"Blk GND",dst:"a16"}],
   comps:[{kind:"R",label:"R1",val:R0,col:2,r1:10,r2:13},{kind:"R",label:"R2",val:R1,col:2,r1:13,r2:16}],
   jumps:[],
   target:"Vout (row 13) = Vin × R2 / (R1 + R2)",sch:"divider"
  },
  "loaded-divider":{
   hw:"nucleo",hwTitle:"NUCLEO + LOADED DIVIDER",hwBadge:"R2 || RL",hwRead:V0,
   title:"Loaded Voltage Divider (RL Bridges Trench to f–j)",
   safety:"External load RL on right bank drops Vout by lowering R2 || RL.",
   pins:[{p:"VIN ("+V0+")",c:P.red},{p:"A0 (Vout)",c:P.blue},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.red,tag:"Red VIN",dst:"a10"},{pi:1,col:3,row:13,c:P.blue,tag:"Blu A0",dst:"d13"},{pi:2,col:0,row:16,c:"#1e293b",tag:"Blk GND",dst:"a16"}],
   comps:[{kind:"R",label:"R1",val:R0,col:1,r1:10,r2:13},{kind:"R",label:"R2",val:R1,col:1,r1:13,r2:16},{kind:"R",label:"RL",val:R2,col:7,r1:13,r2:16}],
   jumps:[{c1:4,r1:13,c2:5,r2:13,c:P.blue},{c1:4,r1:16,c2:5,r2:16,c:"#1e293b"}],
   target:"Lower leg = R2 || RL bridged across e13↔f13",sch:"loaded-divider"
  },
  "parallel-network":{
   hw:"psu",hwTitle:"BENCH PSU (PARALLEL BUS)",hwBadge:"A || B",hwRead:V0,
   title:"Parallel Branches (Shared Cyan Node A & Green Node B)",
   safety:"All parallel branches share exact V_A−V_B; total current splits.",
   pins:[{p:"+V Node A",c:P.blue},{p:"GND Node B",c:P.teal}],
   wires:[{pi:0,col:0,row:10,c:P.blue,tag:"Cyn NodeA",dst:"a10"},{pi:1,col:0,row:16,c:P.teal,tag:"Grn NodeB",dst:"a16"}],
   comps:[{kind:"R",label:"R1",val:R0,col:1,r1:10,r2:16},{kind:"R",label:"R2",val:R1,col:3,r1:10,r2:16},{kind:"R",label:"R3",val:R2,col:7,r1:10,r2:16}],
   jumps:[{c1:4,r1:10,c2:5,r2:10,c:P.blue},{c1:4,r1:16,c2:5,r2:16,c:P.teal}],
   target:"Same V across row 10↔16; Req < smallest R",sch:"parallel"
  },
  "kcl-junction":{
   hw:"psu",hwTitle:"KCL NODE CURRENT TEST",hwBadge:"ΣI = 0",hwRead:I0,
   title:"KCL Junction at Row 13 (Incoming = Outgoing Sum)",
   safety:"All current entering row 13 divides between left (c13) & right (h13) legs.",
   pins:[{p:"I_IN",c:P.red},{p:"TP_NODE",c:P.blue},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.red,tag:"Red I_IN",dst:"a10"},{pi:1,col:3,row:13,c:P.blue,tag:"Blu NodeX",dst:"d13"},{pi:2,col:0,row:16,c:"#1e293b",tag:"Blk GND",dst:"a16"}],
   comps:[{kind:"R",label:"Rin",val:R0,col:1,r1:10,r2:13},{kind:"R",label:"R1",val:R1,col:2,r1:13,r2:16},{kind:"R",label:"R2",val:R2,col:7,r1:13,r2:16}],
   jumps:[{c1:4,r1:13,c2:5,r2:13,c:P.gold},{c1:4,r1:16,c2:5,r2:16,c:"#1e293b"}],
   target:"I_in (b10→b13) = I_R1 (c13→c16) + I_R2 (h13→h16)",sch:"kcl"
  },
  "kvl-mesh":{
   hw:"psu",hwTitle:"DUAL-LOOP KVL BENCH",hwBadge:"ΣV = 0",hwRead:V0,
   title:"2-Loop Mesh Network (Shared Bridge Across Trench)",
   safety:"Sum voltage rises & drops around each closed loop back to starting node.",
   pins:[{p:"+V1 ("+V0+")",c:P.red},{p:"TP_MESH",c:P.gold},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.red,tag:"Red +V1",dst:"a10"},{pi:1,col:6,row:13,c:P.gold,tag:"Yel Mesh",dst:"g13"},{pi:2,col:0,row:16,c:"#1e293b",tag:"Blk GND",dst:"a16"}],
   comps:[{kind:"R",label:"R1",val:R0,col:1,r1:10,r2:13},{kind:"R",label:"R2",val:R1,col:3,r1:13,r2:16},{kind:"R",label:"Rm",val:"1 kΩ",c1:4,r1:13,c2:5,r2:13},{kind:"R",label:"R3",val:R2,col:8,r1:13,r2:16}],
   jumps:[{c1:3,r1:16,c2:8,r2:16,c:"#1e293b"}],
   target:"Loop 1: V1−VR1−VR2=0 · Loop 2 crosses e13↔f13",sch:"kvl-mesh"
  },
  "thevenin-port":{
   hw:"dmm",hwTitle:"THEVENIN PORT TESTER",hwBadge:"Vth / Rth",hwRead:V0,
   title:"Thevenin Equivalent Port (Open Voc vs Plug-In RL)",
   safety:"Disconnect supply before measuring Rth; lift right-bank RL for Voc.",
   pins:[{p:"VS ("+V0+")",c:P.red},{p:"PORT_A",c:P.blue},{p:"GND (B)",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.red,tag:"Red VS",dst:"a10"},{pi:1,col:6,row:12,c:P.blue,tag:"Blu PortA",dst:"g12"},{pi:2,col:0,row:16,c:"#1e293b",tag:"Blk PortB",dst:"a16"}],
   comps:[{kind:"R",label:"R_a",val:R0,col:1,r1:10,r2:12},{kind:"R",label:"R_b",val:R1,col:2,r1:12,r2:16},{kind:"R",label:"Rth",val:"series",c1:4,r1:12,c2:5,r2:12},{kind:"R",label:"RL",val:R2,col:8,r1:12,r2:16}],
   jumps:[{c1:2,r1:16,c2:8,r2:16,c:"#1e293b"}],
   target:"Lift RL on right bank for Voc; plug i12↔i16 for VL",sch:"thevenin"
  },
  "norton-source":{
   hw:"psu",hwTitle:"NORTON Isc / RN BENCH",hwBadge:"Isc || Rn",hwRead:I0,
   title:"Norton Equivalent Network (Parallel Rn || RL)",
   safety:"Current source drives parallel Rn || RL across common buses row 10 & 16.",
   pins:[{p:"I_NORT",c:P.pink},{p:"PORT_A",c:P.blue},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.pink,tag:"Mag I_N",dst:"a10"},{pi:1,col:6,row:10,c:P.blue,tag:"Blu NodeA",dst:"g10"},{pi:2,col:0,row:16,c:"#1e293b",tag:"Blk GND",dst:"a16"}],
   comps:[{kind:"R",label:"Rn",val:R0,col:2,r1:10,r2:16},{kind:"R",label:"RL",val:R1,col:8,r1:10,r2:16}],
   jumps:[{c1:4,r1:10,c2:5,r2:10,c:P.blue},{c1:4,r1:16,c2:5,r2:16,c:"#1e293b"}],
   target:"I_N = Vth/Rth splits across parallel Rn || RL",sch:"norton"
  },
  "ac-bench":{
   hw:"scope",hwTitle:"FUNC GEN + SCOPE ("+F0+")",hwBadge:"AC SINE",hwRead:F0,
   title:"AC Signal Frequency, Period & RMS Capture",
   safety:"Match FuncGen output impedance (50 Ω vs High-Z) so Vpk reads true on CH1.",
   pins:[{p:"GEN ("+F0+")",c:P.pink},{p:"CH1_TP",c:P.blue},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.pink,tag:"Mag GEN",dst:"a10"},{pi:1,col:4,row:10,c:P.blue,tag:"Blu CH1",dst:"e10"},{pi:2,col:0,row:15,c:"#1e293b",tag:"Blk GND",dst:"a15"}],
   comps:[{kind:"R",label:"R_term",val:R0,col:2,r1:10,r2:15}],
   jumps:[],
   target:"T = 1/f · Vrms = 0.707 × Vpk on CH1",sch:"ac-sine"
  },
  "ac-phase":{
   hw:"scope",hwTitle:"DUAL-CH PHASE BENCH",hwBadge:"Δθ DEG",hwRead:F0,
   title:"2-Channel Phase Lead/Lag Comparison",
   safety:"Trigger on CH1 (input) and compare CH2 zero crossing after RC shift.",
   pins:[{p:"GEN ("+F0+")",c:P.pink},{p:"CH1 (IN)",c:P.blue},{p:"CH2 (OUT)",c:P.gold},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.pink,tag:"Mag GEN",dst:"a10"},{pi:1,col:3,row:10,c:P.blue,tag:"Blu CH1",dst:"d10"},{pi:2,col:7,row:10,c:P.gold,tag:"Yel CH2",dst:"h10"},{pi:3,col:0,row:15,c:"#1e293b",tag:"Blk GND",dst:"a15"}],
   comps:[{kind:"R",label:"R",val:R0,c1:4,r1:10,c2:5,r2:10},{kind:"C",label:"C",val:C0,col:6,r1:10,r2:15}],
   jumps:[{c1:0,r1:15,c2:6,r2:15,c:"#1e293b"}],
   target:"Δθ = 360° × Δt / T between CH1 (d10) & CH2 (h10)",sch:"rc-lpf"
  },
  "cap-charge":{
   hw:"psu",hwTitle:"CAP CHARGE / ENERGY TEST",hwBadge:"Q = C·V",hwRead:C0,
   title:"Capacitor Charge & Energy Storage ("+C0+")",
   safety:"Verify electrolytic polarity (+ on high rail, − on GND) before applying "+V0+".",
   pins:[{p:"+V ("+V0+")",c:P.red},{p:"A0_VC",c:P.blue},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.red,tag:"Red +V",dst:"a10"},{pi:1,col:5,row:10,c:P.blue,tag:"Blu Vc",dst:"f10"},{pi:2,col:9,row:15,c:"#1e293b",tag:"Blk GND",dst:"j15"}],
   comps:[{kind:"R",label:"Rlim",val:R0,c1:4,r1:10,c2:5,r2:10},{kind:"C",label:"C1",val:C0,col:7,r1:10,r2:15}],
   jumps:[],
   target:"Q = C·V · E = ½·C·V² · Rlim caps inrush current",sch:"rc-lpf"
  },
  "cap-parallel":{
   hw:"psu",hwTitle:"PARALLEL CAPACITOR BANK",hwBadge:"C1 + C2",hwRead:C0,
   title:"Parallel Capacitors Add Capacitance (Ceq = C1 + C2)",
   safety:"Discharge capacitors through a bleed resistor before reconfiguring rows.",
   pins:[{p:"+V ("+V0+")",c:P.red},{p:"CAP_MTR",c:P.teal},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.red,tag:"Red +V",dst:"a10"},{pi:1,col:6,row:10,c:P.teal,tag:"C Probe",dst:"g10"},{pi:2,col:0,row:16,c:"#1e293b",tag:"Blk GND",dst:"a16"}],
   comps:[{kind:"C",label:"C1",val:C0,col:2,r1:10,r2:16},{kind:"C",label:"C2",val:C1,col:4,r1:10,r2:16}],
   jumps:[{c1:4,r1:10,c2:5,r2:10,c:P.red},{c1:4,r1:16,c2:5,r2:16,c:"#1e293b"}],
   target:"Both caps span row 10 ↔ row 16 → C_eq = C1 + C2",sch:"cap-parallel"
  },
  "cap-decoupling":{
   hw:"nucleo",hwTitle:"IC POWER DECOUPLING BENCH",hwBadge:"0.1 µF",hwRead:"100 nF",
   title:"Bulk + Ceramic Bypass Capacitors Close to IC VCC/GND",
   safety:"Place 100 nF ceramic cap right next to IC pins (row 11..15) to minimize loop L.",
   pins:[{p:"3V3_RAIL",c:P.red},{p:"CH1_RIP",c:P.blue},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:11,c:P.red,tag:"Red 3V3",dst:"a11"},{pi:1,col:9,row:11,c:P.blue,tag:"Blu CH1",dst:"j11"},{pi:2,col:0,row:15,c:"#1e293b",tag:"Blk GND",dst:"a15"}],
   comps:[{kind:"C",label:"Cblk",val:C0,col:0,r1:11,r2:15,side:"R",yOff:-8},{kind:"C",label:"Cbp",val:C1,col:3,r1:11,r2:15,side:"L",yOff:10},{kind:"IC",label:"DUT",val:"IC U1",r1:11,r2:15}],
   jumps:[{c1:3,r1:11,c2:6,r2:11,c:P.red},{c1:3,r1:15,c2:6,r2:15,c:"#1e293b"}],
   target:"C_bp at d11↔d15 shunts fast edges; C_blk holds charge",sch:"power-tree"
  },
  "rc-charge":{
   hw:"scope",hwTitle:"STEP GEN + SCOPE (τ=RC)",hwBadge:"τ = R·C",hwRead:F0,
   title:"RC Step Charge Transient (63.2% at 1τ, 99.3% at 5τ)",
   safety:"Drive low-freq square wave; use 10× probe to avoid loading high-R nodes.",
   pins:[{p:"STEP_IN",c:P.pink},{p:"CH1 (VIN)",c:P.blue},{p:"CH2 (VC)",c:P.gold},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.pink,tag:"Mag STEP",dst:"a10"},{pi:1,col:3,row:10,c:P.blue,tag:"Blu CH1",dst:"d10"},{pi:2,col:8,row:10,c:P.gold,tag:"Yel CH2",dst:"i10"},{pi:3,col:9,row:16,c:"#1e293b",tag:"Blk GND",dst:"j16"}],
   comps:[{kind:"R",label:"R",val:R0,c1:4,r1:10,c2:5,r2:10},{kind:"C",label:"C",val:C0,col:6,r1:10,r2:16}],
   jumps:[],
   target:"Measure CH2 (i10) = 63.2% of step at t = R × C",sch:"rc-lpf"
  },
  "rc-discharge":{
   hw:"scope",hwTitle:"RC DISCHARGE TRANSIENT",hwBadge:"36.8% @ 1τ",hwRead:F0,
   title:"RC Discharge Network (Pre-Charged Cap Decay)",
   safety:"Trigger falling edge on CH1 while CH2 captures exponential decay.",
   pins:[{p:"PULSE_IN",c:P.pink},{p:"CH2 (VC)",c:P.gold},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.pink,tag:"Mag PLS",dst:"a10"},{pi:1,col:8,row:10,c:P.gold,tag:"Yel CH2",dst:"i10"},{pi:2,col:9,row:16,c:"#1e293b",tag:"Blk GND",dst:"j16"}],
   comps:[{kind:"R",label:"Rdis",val:R0,c1:4,r1:10,c2:5,r2:10},{kind:"C",label:"C",val:C0,col:6,r1:10,r2:16}],
   jumps:[],
   target:"Cap falls to 36.8% at 1τ, <1% after 5τ",sch:"rc-lpf"
  },
  "rc-probe-load":{
   hw:"scope",hwTitle:"HIGH-Z NODE + 10× PROBE",hwBadge:"10 MΩ || pF",hwRead:"10× PROBE",
   title:"Probe Loading Effect on High-Impedance RC Node",
   safety:"1× (1 MΩ) probes severely load MΩ nodes; always switch probe to 10× (10 MΩ).",
   pins:[{p:"SIG_IN",c:P.pink},{p:"CH1 (10x)",c:P.gold},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.pink,tag:"Mag SIG",dst:"a10"},{pi:1,col:8,row:10,c:P.gold,tag:"Yel 10x",dst:"i10"},{pi:2,col:0,row:16,c:"#1e293b",tag:"Blk GND",dst:"a16"}],
   comps:[{kind:"R",label:"Rsrc",val:R0,c1:4,r1:10,c2:5,r2:10},{kind:"C",label:"Cnode",val:C0,col:6,r1:10,r2:16},{kind:"R",label:"Rprb",val:"10 MΩ",col:8,r1:10,r2:16}],
   jumps:[{c1:0,r1:16,c2:8,r2:16,c:"#1e293b"}],
   target:"R_probe sits in parallel on right bank row 10↔16",sch:"probe-load"
  },
  "rl-transient":{
   hw:"scope",hwTitle:"RL CURRENT RAMP BENCH",hwBadge:"τ = L/R",hwRead:L0,
   title:"Inductor Current Step (τ = L/R & Back-EMF V = L·di/dt)",
   safety:"Watch current limit; inductor resists sudden current change (t=0 acts open).",
   pins:[{p:"STEP_V",c:P.pink},{p:"CH1_VL",c:P.blue},{p:"CH2_VR",c:P.gold},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.pink,tag:"Mag VIN",dst:"a10"},{pi:1,col:3,row:10,c:P.blue,tag:"Blu VL",dst:"d10"},{pi:2,col:7,row:10,c:P.gold,tag:"Yel VR",dst:"h10"},{pi:3,col:9,row:16,c:"#1e293b",tag:"Blk GND",dst:"j16"}],
   comps:[{kind:"L",label:"L1",val:L0,c1:4,r1:10,c2:5,r2:10},{kind:"R",label:"Rsns",val:R0,col:6,r1:10,r2:16}],
   jumps:[],
   target:"I(t) climbs to 63.2% at τ = L/R; monitor across Rsns",sch:"rl-series"
  },
  "inductor-flyback":{
   hw:"psu",hwTitle:"INDUCTIVE FLYBACK CLAMP",hwBadge:"DIODE CLMP",hwRead:L0,
   title:"Inductor + Reverse Flyback Diode Across Coil",
   safety:"NEVER switch an inductor without D1 flyback clamp—di/dt spikes destroy FETs.",
   pins:[{p:"VIN ("+V0+")",c:P.red},{p:"CH1_SW",c:P.blue},{p:"SW_EN",c:P.gold},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.red,tag:"Red VIN",dst:"a10"},{pi:1,col:5,row:13,c:P.blue,tag:"Blu Drain",dst:"f13"},{pi:2,col:6,row:15,c:P.gold,tag:"Yel Gate",dst:"g15"},{pi:3,col:0,row:16,c:"#1e293b",tag:"Blk GND",dst:"a16"}],
   comps:[{kind:"L",label:"L1",val:L0,col:1,r1:10,r2:13},{kind:"D",label:"D_fly",val:"Clamp",col:3,r1:10,r2:13},{kind:"Q",label:"Q1",val:"SW",col:4,r1:13,r2:16}],
   jumps:[{c1:4,r1:16,c2:0,r2:16,c:"#1e293b"}],
   target:"D_fly cathode at row 10 clamps positive inductive kick",sch:"flyback"
  },
  "filter-lpf":{
   hw:"scope",hwTitle:"SWEEP GEN + FILTER SCOPE",hwBadge:"fc = -3 dB",hwRead:F0,
   title:"First-Order RC Low-Pass Filter (Passes DC, Cuts HF)",
   safety:"Measure -3 dB (0.707 × Vin) corner frequency and -20 dB/dec rolloff.",
   pins:[{p:"GEN_SWP",c:P.pink},{p:"CH1_IN",c:P.blue},{p:"CH2_OUT",c:P.gold},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.pink,tag:"Mag IN",dst:"a10"},{pi:1,col:3,row:10,c:P.blue,tag:"Blu CH1",dst:"d10"},{pi:2,col:8,row:10,c:P.gold,tag:"Yel OUT",dst:"i10"},{pi:3,col:9,row:16,c:"#1e293b",tag:"Blk GND",dst:"j16"}],
   comps:[{kind:"R",label:"R",val:R0,c1:4,r1:10,c2:5,r2:10},{kind:"C",label:"C",val:C0,col:6,r1:10,r2:16}],
   jumps:[],
   target:"f_c = 1/(2πRC) · C shunts HF on right bank",sch:"rc-lpf"
  },
  "filter-hpf":{
   hw:"scope",hwTitle:"AC SWEEP + HPF SCOPE",hwBadge:"DC BLOCK",hwRead:F0,
   title:"RC High-Pass Filter (Blocks DC, Passes HF)",
   safety:"C blocks DC across trench e10↔f10; R sets DC bias/return to GND.",
   pins:[{p:"GEN_AC",c:P.pink},{p:"CH1_IN",c:P.blue},{p:"CH2_OUT",c:P.gold},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.pink,tag:"Mag IN",dst:"a10"},{pi:1,col:3,row:10,c:P.blue,tag:"Blu CH1",dst:"d10"},{pi:2,col:8,row:10,c:P.gold,tag:"Yel OUT",dst:"i10"},{pi:3,col:9,row:16,c:"#1e293b",tag:"Blk GND",dst:"j16"}],
   comps:[{kind:"C",label:"C",val:C0,c1:4,r1:10,c2:5,r2:10},{kind:"R",label:"R",val:R0,col:6,r1:10,r2:16}],
   jumps:[],
   target:"Series C bridges e10↔f10; shunt R on g10↔g16",sch:"rc-hpf"
  },
  "filter-rlc":{
   hw:"scope",hwTitle:"RLC RESONANCE BENCH",hwBadge:"f0 PEAK",hwRead:F0,
   title:"Series/Tank RLC Resonant Network (XL = XC at f0)",
   safety:"At resonance XL cancels XC leaving R; check Q-factor voltage peaking!",
   pins:[{p:"GEN ("+F0+")",c:P.pink},{p:"CH2_MID",c:P.gold},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.pink,tag:"Mag IN",dst:"a10"},{pi:1,col:8,row:12,c:P.gold,tag:"Yel OUT",dst:"i12"},{pi:2,col:9,row:16,c:"#1e293b",tag:"Blk GND",dst:"j16"}],
   comps:[{kind:"R",label:"R",val:R0,col:1,r1:10,r2:12},{kind:"L",label:"L",val:L0,c1:4,r1:12,c2:5,r2:12},{kind:"C",label:"C",val:C0,col:6,r1:12,r2:16}],
   jumps:[],
   target:"f0 = 1 / (2π√(LC)) · L bridges row 12",sch:"rlc"
  },
  "transformer-iso":{
   hw:"scope",hwTitle:"AC PRIMARY / ISOLATED SEC",hwBadge:"Np : Ns",hwRead:F0,
   title:"Galvanically Isolated Transformer Across Center Trench",
   safety:"AC only! Left bank = Primary GND; Right bank = Isolated Secondary Return.",
   pins:[{p:"PRI_AC+",c:P.red},{p:"SEC_TP",c:P.teal},{p:"PRI_RTN",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.red,tag:"Red PRI+",dst:"a10"},{pi:1,col:9,row:10,c:P.teal,tag:"Tea SEC",dst:"j10"},{pi:2,col:0,row:15,c:"#1e293b",tag:"Blk PRI−",dst:"a15"}],
   comps:[{kind:"L",label:"Np",val:"Primary",col:3,r1:10,r2:15},{kind:"L",label:"Ns",val:"Second.",col:5,r1:10,r2:15},{kind:"R",label:"R_sec",val:R0,col:7,r1:10,r2:15}],
   jumps:[],
   target:"Center trench marks galvanic isolation Np || Ns",sch:"transformer"
  },
  "three-phase":{
   hw:"rack",hwTitle:"3-PHASE POWER ANALYZER",hwBadge:"120° WYE",hwRead:V0,
   title:"Balanced 3-Phase Star / Wye Load (120° Phase Offset)",
   safety:"Verify phase rotation A-B-C and neutral return current balance.",
   pins:[{p:"PHASE A",c:P.red},{p:"PHASE B",c:P.gold},{p:"PHASE C",c:P.blue},{p:"NEUTRAL",c:"#1e293b"}],
   wires:[{pi:0,col:1,row:10,c:P.red,tag:"Red ØA",dst:"b10"},{pi:1,col:3,row:11,c:P.gold,tag:"Yel ØB",dst:"d11"},{pi:2,col:7,row:10,c:P.blue,tag:"Blu ØC",dst:"h10"},{pi:3,col:9,row:15,c:"#1e293b",tag:"Blk N",dst:"j15"}],
   comps:[{kind:"R",label:"Ra",val:R0,col:1,r1:10,r2:15},{kind:"R",label:"Rb",val:R0,col:3,r1:11,r2:15},{kind:"R",label:"Rc",val:R0,col:7,r1:10,r2:15}],
   jumps:[{c1:4,r1:15,c2:5,r2:15,c:"#1e293b"}],
   target:"V_LL = √3 × V_LN; Balanced Neutral row 15 = 0 A",sch:"three-phase"
  },
  "led-diode":{
   hw:"psu",hwTitle:"5V / 3V3 DIODE TEST BENCH",hwBadge:"Vf ≈ 0.7/2V",hwRead:V0,
   title:"Forward-Biased Diode / LED with Series Current Limiter",
   safety:"Always wire series Rlim before applying "+V0+"; check anode vs cathode bar.",
   pins:[{p:"+V ("+V0+")",c:P.red},{p:"TP_VF",c:P.blue},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.red,tag:"Red +V",dst:"a10"},{pi:1,col:8,row:10,c:P.blue,tag:"Blu TP_Vf",dst:"i10"},{pi:2,col:9,row:15,c:"#1e293b",tag:"Blk GND",dst:"j15"}],
   comps:[{kind:"R",label:"Rlim",val:R0,c1:4,r1:10,c2:5,r2:10},{kind:"D",label:"LED/D1",val:"An→Kt",col:6,r1:10,r2:15}],
   jumps:[],
   target:"I_D = (Vs − Vf) / Rlim · D1 on g10(A)↔g15(K)",sch:"led-diode"
  },
  "mosfet-load":{
   hw:"nucleo",hwTitle:"MCU PWM → LOW-SIDE FET",hwBadge:"N-MOS",hwRead:"Vgs > Vth",
   title:"Low-Side N-MOSFET Load Switch + Gate Pulldown",
   safety:"Fit R_pd (10 kΩ) on Gate so FET stays OFF if MCU pin floats at boot.",
   pins:[{p:"+12V_LOAD",c:P.red},{p:"PWM_GATE",c:P.blue},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:6,row:9,c:P.red,tag:"Red +V",dst:"g9"},{pi:1,col:0,row:11,c:P.blue,tag:"Blu PWM",dst:"a11"},{pi:2,col:0,row:16,c:"#1e293b",tag:"Blk GND",dst:"a16"}],
   comps:[{kind:"R",label:"R_pd",val:"10 kΩ",col:1,r1:11,r2:16},{kind:"R",label:"Rg",val:"100 Ω",c1:4,r1:11,c2:5,r2:11},{kind:"Q",label:"Q1",val:"G·D·S",col:5,r1:11,r2:16},{kind:"R",label:"RL",val:R0,col:8,r1:9,r2:13}],
   jumps:[{c1:0,r1:16,c2:5,r2:16,c:"#1e293b"},{c1:5,r1:13,c2:8,r2:13,c:P.gold}],
   target:"Gate=row11, Drain=row13(load), Source=row16(GND)",sch:"mosfet"
  },
  "open-drain-pullup":{
   hw:"nucleo",hwTitle:"LOGIC / OPEN-DRAIN TEST",hwBadge:"PULL-UP",hwRead:"3.3 V",
   title:"Open-Drain Output with External Pull-Up Resistor",
   safety:"Open-drain can only pull LOW; R_pull sets logic HIGH & rise speed.",
   pins:[{p:"3V3_PU",c:P.red},{p:"SIG_OUT",c:P.blue},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.red,tag:"Red 3V3",dst:"a10"},{pi:1,col:8,row:13,c:P.blue,tag:"Blu OUT",dst:"i13"},{pi:2,col:0,row:16,c:"#1e293b",tag:"Blk GND",dst:"a16"}],
   comps:[{kind:"IC",label:"DUT",val:"OD/CMP",r1:11,r2:15},{kind:"R",label:"Rpull",val:R0,col:7,r1:10,r2:13}],
   jumps:[{c1:0,r1:10,c2:7,r2:10,c:P.red},{c1:0,r1:16,c2:6,r2:16,c:"#1e293b"}],
   target:"R_pull on h10↔h13 pulls output pin (f13) up to 3V3",sch:"open-drain"
  },
  "logic-gates":{
   hw:"nucleo",hwTitle:gateChip+" LOGIC GATE BENCH",hwBadge:gateName+" · 5V",hwRead:"Y = "+gateName,
   title:"Two-Input "+gateName+" Gate Truth-Table Check",
   safety:"Use one logic family and a common ground; verify IC pinout before applying 5 V.",
   pins:[{p:"+5V / VCC",c:P.red},{p:"INPUT A",c:P.blue},{p:"INPUT B",c:P.gold},{p:"OUTPUT Y",c:P.teal},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.red,tag:"Red +5V",dst:"a10"},{pi:1,col:0,row:11,c:P.blue,tag:"Blu A",dst:"a11"},{pi:2,col:0,row:13,c:P.gold,tag:"Yel B",dst:"a13"},{pi:3,col:9,row:15,c:P.teal,tag:"Tea Y",dst:"j15"},{pi:4,col:0,row:16,c:"#1e293b",tag:"Blk GND",dst:"a16"}],
   comps:[{kind:"IC",label:"U1",val:gateChip,r1:10,r2:14},{kind:"R",label:"Rlim",val:"1 kΩ",col:7,r1:15,r2:16},{kind:"D",label:"LED",val:"OUT",col:8,r1:15,r2:16}],
   jumps:[{c1:5,r1:12,c2:9,r2:15,c:P.teal},{c1:5,r1:14,c2:9,r2:16,c:"#1e293b"},{c1:0,r1:16,c2:6,r2:16,c:"#1e293b"}],
   target:"Toggle A/B through 00, 01, 10, 11 and verify the "+gateName+" truth table",sch:"logic-gates"
  },
  "power-tree":{
   hw:"psu",hwTitle:"AVIONICS POWER TREE",hwBadge:"BUCK / LDO",hwRead:"12V→3V3",
   title:"PCBA Power Tree: Supply → Reg IC → Decoupling & Load",
   safety:"Verify Cin/Cout polarity & VIN limit before powering converter IC.",
   pins:[{p:"VIN ("+V0+")",c:P.red},{p:"TP_VOUT",c:P.blue},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.red,tag:"Red VIN",dst:"a10"},{pi:1,col:9,row:13,c:P.blue,tag:"Blu VOUT",dst:"j13"},{pi:2,col:0,row:16,c:"#1e293b",tag:"Blk GND",dst:"a16"}],
   comps:[{kind:"C",label:"Cin",val:C0,col:1,r1:10,r2:16},{kind:"IC",label:"REG",val:"DC/DC",r1:10,r2:15},{kind:"C",label:"Cout",val:C1,col:6,r1:13,r2:16,side:"R",yOff:-11},{kind:"R",label:"Load",val:R0,col:9,r1:13,r2:16,side:"L",yOff:12}],
   jumps:[{c1:0,r1:16,c2:9,r2:16,c:"#1e293b"}],
   target:"Left: VIN+Cin (row10) → REG IC → Right: Cout+Load",sch:"power-tree"
  },
  "rail-sequence":{
   hw:"scope",hwTitle:"MULTI-RAIL SEQUENCER",hwBadge:"EN → PGOOD",hwRead:"t_seq",
   title:"Power-Good Sequencing & Enable Handshake",
   safety:"Scope CH1 triggers on VIN_EN rising edge; CH2 captures rail ramp.",
   pins:[{p:"RAIL_1",c:P.red},{p:"CH1 (EN)",c:P.blue},{p:"CH2 (PG)",c:P.gold},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.red,tag:"Red 5V",dst:"a10"},{pi:1,col:3,row:12,c:P.blue,tag:"Blu CH1",dst:"d12"},{pi:2,col:8,row:13,c:P.gold,tag:"Yel CH2",dst:"i13"},{pi:3,col:0,row:16,c:"#1e293b",tag:"Blk GND",dst:"a16"}],
   comps:[{kind:"R",label:"R_en",val:"10 kΩ",col:1,r1:10,r2:12},{kind:"IC",label:"SEQ",val:"LDO+PG",r1:11,r2:15},{kind:"R",label:"R_pg",val:"4.7 kΩ",col:7,r1:10,r2:13}],
   jumps:[{c1:0,r1:10,c2:7,r2:10,c:P.red},{c1:0,r1:16,c2:6,r2:16,c:"#1e293b"}],
   target:"CH1 probes EN (d12) before CH2 PGOOD releases (i13)",sch:"rail-seq"
  },
  "rail-ripple":{
   hw:"scope",hwTitle:"AC-COUPLED RIPPLE / STEP",hwBadge:"mVpp AC",hwRead:"20 MHz",
   title:"Output Rail Ripple & Load-Step Droop Measurement",
   safety:"Use 20 MHz BW limit + short ground spring directly at Cout pins.",
   pins:[{p:"RAIL_V",c:P.red},{p:"CH1_AC",c:P.gold},{p:"LOAD_EN",c:P.blue},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.red,tag:"Red RAIL",dst:"a10"},{pi:1,col:8,row:10,c:P.gold,tag:"Yel CH1",dst:"i10"},{pi:2,col:2,row:14,c:P.blue,tag:"Blu STEP",dst:"c14"},{pi:3,col:9,row:16,c:"#1e293b",tag:"Gnd Sprg",dst:"j16"}],
   comps:[{kind:"C",label:"Cout",val:C0,col:6,r1:10,r2:16},{kind:"Q",label:"FET",val:"STEP",col:3,r1:12,r2:16},{kind:"R",label:"Rstp",val:R0,col:4,r1:10,r2:12}],
   jumps:[{c1:0,r1:10,c2:6,r2:10,c:P.red},{c1:0,r1:16,c2:6,r2:16,c:"#1e293b"}],
   target:"Step FET pulses Rstp load; measure droop at Cout (i10)",sch:"ripple"
  },
  "kelvin-shunt":{
   hw:"dmm",hwTitle:"KELVIN 4-WIRE CURRENT SENSE",hwBadge:"S+ / S−",hwRead:R0,
   title:"4-Wire Kelvin Shunt Resistor + Differential Sense Tap",
   safety:"Inner Kelvin leads (d10/d13) carry zero load current so trace R drops nothing.",
   pins:[{p:"I_BUS+",c:P.red},{p:"SENSE+",c:P.blue},{p:"SENSE−",c:P.teal},{p:"LOAD−",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.red,tag:"Red FRC",dst:"a10"},{pi:1,col:3,row:10,c:P.blue,tag:"Blu SNS+",dst:"d10"},{pi:2,col:3,row:13,c:P.teal,tag:"Tea SNS−",dst:"d13"},{pi:3,col:9,row:16,c:"#1e293b",tag:"Blk RTN",dst:"j16"}],
   comps:[{kind:"R",label:"Rshnt",val:R0,col:1,r1:10,r2:13},{kind:"IC",label:"INA",val:"DIFF",r1:10,r2:15},{kind:"R",label:"R_load",val:R1,col:7,r1:13,r2:16}],
   jumps:[{c1:4,r1:13,c2:5,r2:13,c:P.gold}],
   target:"I = ΔV(SNS+−SNS−) / Rshunt · zero trace error",sch:"kelvin"
  },
  "aba-swap":{
   hw:"dmm",hwTitle:"A-B-A FAULT ISOLATION",hwBadge:"SWAP REF",hwRead:"KGB TEST",
   title:"A-B-A Troubleshooting: Suspect Board vs Known-Good",
   safety:"Change only ONE part/slot at a time; fault must follow the suspect unit.",
   pins:[{p:"TEST_V",c:P.red},{p:"SENSE_A",c:P.blue},{p:"SENSE_B",c:P.teal},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.red,tag:"Red VIN",dst:"a10"},{pi:1,col:3,row:14,c:P.blue,tag:"Blu DUT",dst:"d14"},{pi:2,col:8,row:14,c:P.teal,tag:"Tea KGB",dst:"i14"},{pi:3,col:0,row:16,c:"#1e293b",tag:"Blk GND",dst:"a16"}],
   comps:[{kind:"Q",label:"DUT",val:"SUSPECT",col:1,r1:11,r2:15},{kind:"R",label:"KGB",val:"REF",col:7,r1:10,r2:14}],
   jumps:[{c1:0,r1:10,c2:7,r2:10,c:P.red},{c1:0,r1:16,c2:8,r2:16,c:"#1e293b"}],
   target:"Compare row14 DUT (left) vs KGB reference (right)",sch:"block"
  },
  "ground-star":{
   hw:"dmm",hwTitle:"GROUND OFFSET / STAR BENCH",hwBadge:"ΔV_GND",hwRead:"0.0 mV",
   title:"Star Ground vs Daisy-Chain Ground Offset Test",
   safety:"Keep high-current return separate from analog sense ground back to star point.",
   pins:[{p:"AGND_S",c:P.blue},{p:"DGND_N",c:P.gold},{p:"STAR_0V",c:"#1e293b"}],
   wires:[{pi:0,col:1,row:11,c:P.blue,tag:"Blu AGND",dst:"b11"},{pi:1,col:8,row:11,c:P.gold,tag:"Yel DGND",dst:"i11"},{pi:2,col:0,row:16,c:"#1e293b",tag:"Blk STAR",dst:"a16"}],
   comps:[{kind:"R",label:"R_trc",val:"50 mΩ",c1:4,r1:11,c2:5,r2:11},{kind:"R",label:"I_dig",val:R0,col:7,r1:11,r2:16},{kind:"R",label:"Sens",val:R1,col:2,r1:11,r2:16}],
   jumps:[{c1:0,r1:16,c2:7,r2:16,c:"#1e293b"}],
   target:"DMM across e11↔f11 shows ΔV = I_dig × R_trace bounce",sch:"series-2"
  },
  "probe-comp":{
   hw:"scope",hwTitle:"SCOPE PROBE + CAL SQUARE",hwBadge:"1kHz CAL",hwRead:"10× CAL",
   title:"Probe Compensation & Short Ground-Spring Loop",
   safety:"Long 15 cm alligator clip adds ~145 nH inductance & rings above 20 MHz.",
   pins:[{p:"CAL_1k",c:P.pink},{p:"CH1_TIP",c:P.gold},{p:"SPRING",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.pink,tag:"Mag CAL",dst:"a10"},{pi:1,col:7,row:10,c:P.gold,tag:"Yel TIP",dst:"h10"},{pi:2,col:7,row:15,c:"#1e293b",tag:"Gnd Sprg",dst:"h15"}],
   comps:[{kind:"R",label:"R_s",val:"50 Ω",c1:4,r1:10,c2:5,r2:10},{kind:"C",label:"C_in",val:"15 pF",col:6,r1:10,r2:15}],
   jumps:[],
   target:"Trim 10× probe until square edges at h10 are flat",sch:"rc-lpf"
  },
  "scope-trigger":{
   hw:"scope",hwTitle:"SCOPE SAMPLING & TRIGGER",hwBadge:"MS/s + TRIG",hwRead:F0,
   title:"Edge Trigger & Sample-Rate / Aliasing Prevention",
   safety:"Sample at ≥ 5× signal bandwidth and lock trigger level inside 20–80% swing.",
   pins:[{p:"SIG_SRC",c:P.pink},{p:"CH1_IN",c:P.blue},{p:"EXT_TRG",c:P.gold},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.pink,tag:"Mag SIG",dst:"a10"},{pi:1,col:6,row:10,c:P.blue,tag:"Blu CH1",dst:"g10"},{pi:2,col:6,row:13,c:P.gold,tag:"Yel TRIG",dst:"g13"},{pi:3,col:9,row:16,c:"#1e293b",tag:"Blk GND",dst:"j16"}],
   comps:[{kind:"R",label:"R_50",val:"50 Ω",col:8,r1:10,r2:16},{kind:"IC",label:"DUT",val:"SYNTH",r1:10,r2:14}],
   jumps:[],
   target:"fs ≥ 5× f_signal avoids aliasing on CH1 (g10)",sch:"block"
  },
  "clock-damping":{
   hw:"scope",hwTitle:"CLK GEN + SERIES DAMPING",hwBadge:"T = 1/f",hwRead:F0,
   title:"Digital Clock Termination & Duty-Cycle Capture",
   safety:"Measure rise/fall at 10–90% and duty cycle at 50% threshold.",
   pins:[{p:"3V3",c:P.red},{p:"CH1_CLK",c:P.gold},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:11,c:P.red,tag:"Red 3V3",dst:"a11"},{pi:1,col:8,row:12,c:P.gold,tag:"Yel CLK",dst:"i12"},{pi:2,col:0,row:15,c:"#1e293b",tag:"Blk GND",dst:"a15"}],
   comps:[{kind:"IC",label:"OSC",val:F0,r1:11,r2:15},{kind:"R",label:"R_dmp",val:"33 Ω",c1:5,r1:12,c2:7,r2:12}],
   jumps:[],
   target:"Series 33 Ω damps ringing; measure T & duty at i12",sch:"block"
  },
  "dff-timing":{
   hw:"scope",hwTitle:"SETUP / HOLD LOGIC BENCH",hwBadge:"t_SU / t_H",hwRead:"D → CLK",
   title:"Flip-Flop Setup & Hold Margin Capture (CH1=CLK, CH2=D)",
   safety:"Data must stay stable across setup window before and hold after CLK ↑.",
   pins:[{p:"CLK_IN",c:P.blue},{p:"DATA_IN",c:P.gold},{p:"Q_OUT",c:P.teal},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:11,c:P.blue,tag:"Blu CLK",dst:"a11"},{pi:1,col:0,row:13,c:P.gold,tag:"Yel DATA",dst:"a13"},{pi:2,col:9,row:11,c:P.teal,tag:"Tea QOUT",dst:"j11"},{pi:3,col:0,row:15,c:"#1e293b",tag:"Blk GND",dst:"a15"}],
   comps:[{kind:"IC",label:"DFF",val:"74LVC",r1:11,r2:15},{kind:"R",label:"R_term",val:"10 kΩ",col:7,r1:11,r2:15}],
   jumps:[{c1:0,r1:15,c2:7,r2:15,c:"#1e293b"}],
   target:"Verify Data (row13) stable before/after CLK ↑ (row11)",sch:"block"
  },
  "reset-supervisor":{
   hw:"nucleo",hwTitle:"POR / RESET SUPERVISOR",hwBadge:"RESET_N",hwRead:"RC POR",
   title:"Power-On Reset (RC Delay + Supervisor IC)",
   safety:"Ensure RESET_N stays LOW until rail & oscillator stabilize.",
   pins:[{p:"3V3_RAIL",c:P.red},{p:"RESET_N",c:P.blue},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.red,tag:"Red 3V3",dst:"a10"},{pi:1,col:9,row:13,c:P.blue,tag:"Blu RST_N",dst:"j13"},{pi:2,col:0,row:16,c:"#1e293b",tag:"Blk GND",dst:"a16"}],
   comps:[{kind:"R",label:"Rpu",val:"10 kΩ",col:1,r1:10,r2:12},{kind:"C",label:"Cdly",val:C0,col:2,r1:12,r2:16},{kind:"IC",label:"SUP",val:"POR",r1:11,r2:15}],
   jumps:[{c1:0,r1:16,c2:5,r2:16,c:"#1e293b"}],
   target:"RC delay on row 12 holds RESET_N (j13) active LOW",sch:"power-tree"
  },
  "i2c-bus":{
   hw:"nucleo",hwTitle:"MCU I²C OPEN-DRAIN BUS",hwBadge:"SDA / SCL",hwRead:"4.7 kΩ PU",
   title:"I²C Open-Drain Bus (Twin Pull-Ups on Separate Rows!)",
   safety:"SDA (row 12) and SCL (row 14) MUST be separate rows, pulled up to 3V3.",
   pins:[{p:"3V3",c:P.red},{p:"SDA (R12)",c:P.blue},{p:"SCL (R14)",c:P.gold},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.red,tag:"Red 3V3",dst:"a10"},{pi:1,col:0,row:12,c:P.blue,tag:"Blu SDA",dst:"a12"},{pi:2,col:0,row:14,c:P.gold,tag:"Yel SCL",dst:"a14"},{pi:3,col:0,row:16,c:"#1e293b",tag:"Blk GND",dst:"a16"}],
   comps:[{kind:"R",label:"Rpu1",val:R0==="330 Ω"?"4.7 kΩ":R0,col:1,r1:10,r2:12,side:"R",yOff:-4},{kind:"R",label:"Rpu2",val:"4.7 kΩ",col:3,r1:10,r2:14,side:"L",yOff:12},{kind:"IC",label:"SENS",val:"I²C",r1:11,r2:15}],
   jumps:[{c1:0,r1:16,c2:5,r2:16,c:"#1e293b"}],
   target:"SDA=row12, SCL=row14; lower Rpu speeds RC rise edge",sch:"i2c"
  },
  "spi-bus":{
   hw:"nucleo",hwTitle:"4-WIRE MCU SPI MASTER",hwBadge:"SPI BUS",hwRead:"Push-Pull",
   title:"Full-Duplex 4-Wire SPI Bus Across Center Trench",
   safety:"Keep 4 separate rows: MOSI (11), MISO (12), SCLK (13), CS_N (14).",
   pins:[{p:"MOSI",c:P.blue},{p:"MISO",c:P.teal},{p:"SCLK",c:P.gold},{p:"CS_N",c:"#7c3aed"}],
   wires:[{pi:0,col:0,row:11,c:P.blue,tag:"Blu MOSI",dst:"a11"},{pi:1,col:0,row:12,c:P.teal,tag:"Grn MISO",dst:"a12"},{pi:2,col:0,row:13,c:P.gold,tag:"Yel SCLK",dst:"a13"},{pi:3,col:0,row:14,c:"#7c3aed",tag:"Pur CS_N",dst:"a14"}],
   comps:[{kind:"IC",label:"FLASH",val:"SPI DUT",r1:11,r2:15},{kind:"R",label:"Rs_clk",val:"33 Ω",col:7,r1:13,r2:15}],
   jumps:[],
   target:"Capture CS_N ↓ edge before SCLK bursts on scope",sch:"spi"
  },
  "uart-bus":{
   hw:"nucleo",hwTitle:"UART TX ↔ RX BRIDGE",hwBadge:"8N1 SERIAL",hwRead:"115200",
   title:"UART TX→RX Crossover / Loopback Verification",
   safety:"Never wire TX→TX; TX always feeds RX, with shared GND reference.",
   pins:[{p:"TX_OUT",c:P.blue},{p:"RX_IN",c:P.teal},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:11,c:P.blue,tag:"Blu TX",dst:"a11"},{pi:1,col:0,row:13,c:P.teal,tag:"Grn RX",dst:"a13"},{pi:2,col:0,row:16,c:"#1e293b",tag:"Blk GND",dst:"a16"}],
   comps:[{kind:"WIRE",label:"LOOP/X",val:"TX↔RX",c1:2,r1:11,c2:3,r2:13,c:P.gold},{kind:"IC",label:"XCVR",val:"UART",r1:11,r2:15}],
   jumps:[],
   target:"Bit time = 1/baud (8.68 µs @ 115200); idle is HIGH",sch:"uart"
  },
  "can-bus":{
   hw:"nucleo",hwTitle:"DIFF CAN BUS TERMINATION",hwBadge:"120∥120=60Ω",hwRead:"60 Ω BUS",
   title:"CAN Differential Pair (Twisted CAN_H & CAN_L + 120 Ω Ends)",
   safety:"Measure ~60 Ω (two 120 Ω end terminators in parallel) with bus power OFF.",
   pins:[{p:"CAN_H",c:P.blue},{p:"CAN_L",c:P.gold},{p:"GND_REF",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:11,c:P.blue,tag:"Blu CANH",dst:"a11"},{pi:1,col:0,row:15,c:P.gold,tag:"Yel CANL",dst:"a15"},{pi:2,col:0,row:16,c:"#1e293b",tag:"Blk GND",dst:"a16"}],
   comps:[{kind:"R",label:"TermA",val:"120 Ω",col:2,r1:11,r2:15},{kind:"R",label:"TermB",val:"120 Ω",col:7,r1:11,r2:15}],
   jumps:[{c1:4,r1:11,c2:5,r2:11,c:P.blue},{c1:4,r1:15,c2:5,r2:15,c:P.gold}],
   target:"120 Ω (left) || 120 Ω (right) across row 11↔15 = 60 Ω",sch:"can"
  },
  "bus-protocol":{
   hw:"scope",hwTitle:"LOGIC ANALYZER + SCOPE BUS",hwBadge:"PHY vs PROTO",hwRead:"ANALOG+BIT",
   title:"Physical Signal Integrity vs Decoded Protocol Capture",
   safety:"Check voltage levels & clean edges on CH1 before decoding protocol frames.",
   pins:[{p:"CH1_ANLG",c:P.gold},{p:"LA_D0",c:P.blue},{p:"LA_CLK",c:P.teal},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.gold,tag:"Yel ANLG",dst:"a10"},{pi:1,col:2,row:12,c:P.blue,tag:"Blu D0",dst:"c12"},{pi:2,col:7,row:12,c:P.teal,tag:"Tea CLK",dst:"h12"},{pi:3,col:0,row:16,c:"#1e293b",tag:"Blk GND",dst:"a16"}],
   comps:[{kind:"IC",label:"BUS",val:"PHY DUT",r1:10,r2:15},{kind:"R",label:"R_term",val:"100 Ω",col:8,r1:12,r2:16}],
   jumps:[{c1:0,r1:16,c2:8,r2:16,c:"#1e293b"}],
   target:"Verify V_IH / V_IL & clean edges on row 10 before decode",sch:"spi"
  },
  "scpi-automation":{
   hw:"rack",hwTitle:"PYVISA / SCPI TEST RACK",hwBadge:"USBTMC",hwRead:"*IDN? OK",
   title:"Automated SCPI Instrument Sweep & Guard-Band Fixture",
   safety:"Wrap SCPI tests in try/finally to force output OFF (OUTP OFF) on errors.",
   pins:[{p:"SCPI_OUT",c:P.red},{p:"DMM_SNS",c:P.blue},{p:"TRIG_SYNC",c:P.gold},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.red,tag:"Red STIM",dst:"a10"},{pi:1,col:8,row:12,c:P.blue,tag:"Blu MEAS",dst:"i12"},{pi:2,col:2,row:14,c:P.gold,tag:"Yel TRIG",dst:"c14"},{pi:3,col:0,row:16,c:"#1e293b",tag:"Blk GND",dst:"a16"}],
   comps:[{kind:"IC",label:"MUX",val:"RELAY",r1:10,r2:15},{kind:"R",label:"R_cal",val:R0,col:7,r1:12,r2:16}],
   jumps:[{c1:0,r1:16,c2:7,r2:16,c:"#1e293b"}],
   target:"Readback settles before *OPC? assertion checks limit",sch:"block"
  },
  "scpi-transport":{
   hw:"rack",hwTitle:"VISA / USBTMC / LAN BRIDGE",hwBadge:"TIMEOUT?",hwRead:"EOI / \\n",
   title:"VISA Transport Link, Termination & Query Settling",
   safety:"Match VISA termination (\\n) and timeout > slow DMM integration aperture.",
   pins:[{p:"VISA_TX",c:P.blue},{p:"SRQ_INT",c:P.gold},{p:"SENSE_V",c:P.teal},{p:"SHIELD",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:11,c:P.blue,tag:"Blu VISA",dst:"a11"},{pi:1,col:0,row:13,c:P.gold,tag:"Yel SRQ",dst:"a13"},{pi:2,col:8,row:11,c:P.teal,tag:"Tea SNS",dst:"i11"},{pi:3,col:0,row:16,c:"#1e293b",tag:"Blk SHD",dst:"a16"}],
   comps:[{kind:"IC",label:"VISA",val:"BRIDGE",r1:11,r2:15},{kind:"R",label:"R_bias",val:"1 kΩ",col:7,r1:11,r2:16}],
   jumps:[{c1:0,r1:16,c2:7,r2:16,c:"#1e293b"}],
   target:"Query SYST:ERR? + *OPC? to prevent stale buffers",sch:"uart"
  },
  "scpi-limit":{
   hw:"dmm",hwTitle:"LIMIT & GUARD-BAND ASSERT",hwBadge:"PASS/FAIL",hwRead:V0,
   title:"Automated Limit Check, Guard-Band & NaN Rejection",
   safety:"Treat NaN, Inf, or out-of-range readings as hard FAIL — never pass.",
   pins:[{p:"V_DUT",c:P.red},{p:"V_LIMIT",c:P.blue},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.red,tag:"Red DUT",dst:"a10"},{pi:1,col:4,row:13,c:P.blue,tag:"Blu LIM",dst:"e13"},{pi:2,col:0,row:16,c:"#1e293b",tag:"Blk GND",dst:"a16"}],
   comps:[{kind:"R",label:"R_hi",val:R0,col:2,r1:10,r2:13},{kind:"R",label:"R_lo",val:R1,col:2,r1:13,r2:16}],
   jumps:[],
   target:"Require isFinite(x) && Vmin ≤ x ≤ Vmax after guard band",sch:"divider"
  },
  "scpi-retry":{
   hw:"scope",hwTitle:"RETRY & SYNC TRIGGER BENCH",hwBadge:"NO FLAKE",hwRead:"1-SHOT",
   title:"Deterministic Trigger / Explicit Retry Diagnostics",
   safety:"Log every retry separately; masked retries hide intermittent harness faults.",
   pins:[{p:"TRIG_OUT",c:P.pink},{p:"BUSY_N",c:P.gold},{p:"DATA_OK",c:P.teal},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.pink,tag:"Mag TRIG",dst:"a10"},{pi:1,col:8,row:12,c:P.gold,tag:"Yel BUSY",dst:"i12"},{pi:2,col:8,row:14,c:P.teal,tag:"Tea DOK",dst:"i14"},{pi:3,col:0,row:16,c:"#1e293b",tag:"Blk GND",dst:"a16"}],
   comps:[{kind:"R",label:"Rpu",val:"4.7 kΩ",col:1,r1:10,r2:13},{kind:"IC",label:"SYNC",val:"HANDSHK",r1:10,r2:15}],
   jumps:[{c1:0,r1:16,c2:8,r2:16,c:"#1e293b"}],
   target:"Measure settle latency between TRIG (a10) & BUSY (i12)",sch:"block"
  },
  "scpi-safestate":{
   hw:"psu",hwTitle:"FAULT-SAFE OUTP OFF + BLEED",hwBadge:"SAFE TRIP",hwRead:"0.0 V SAFE",
   title:"Exception Safe-State Relay & Active Rail Discharge",
   safety:"finally: block cuts PSU output & drains Cout through bleed resistor.",
   pins:[{p:"PSU_OUT",c:P.red},{p:"DIS_CMD",c:P.blue},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.red,tag:"Red PSU",dst:"a10"},{pi:1,col:0,row:13,c:P.blue,tag:"Blu SAFE",dst:"a13"},{pi:2,col:0,row:16,c:"#1e293b",tag:"Blk GND",dst:"a16"}],
   comps:[{kind:"C",label:"Cout",val:C0,col:1,r1:10,r2:16},{kind:"Q",label:"RELAY",val:"SAFE-OFF",col:4,r1:10,r2:13},{kind:"R",label:"R_bld",val:R0,col:7,r1:10,r2:16}],
   jumps:[{c1:4,r1:10,c2:7,r2:10,c:P.red},{c1:0,r1:16,c2:7,r2:16,c:"#1e293b"}],
   target:"On fault exception: open PSU, engage bleed R_bld",sch:"power-tree"
  },
  "hil-console":{
   hw:"rack",hwTitle:"LINUX HIL / TTYUSB0 BENCH",hwBadge:"EXIT 0/1",hwRead:"LOG + CRC",
   title:"Linux Test Runner ↔ Flight Console Serial Fixture",
   safety:"Capture exit code, timestamps, and UART logs to persistent storage.",
   pins:[{p:"TTY_TX",c:P.blue},{p:"TTY_RX",c:P.teal},{p:"GPIO_RST",c:P.gold},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:11,c:P.blue,tag:"Blu TX",dst:"a11"},{pi:1,col:0,row:12,c:P.teal,tag:"Grn RX",dst:"a12"},{pi:2,col:8,row:14,c:P.gold,tag:"Yel RST",dst:"i14"},{pi:3,col:0,row:16,c:"#1e293b",tag:"Blk GND",dst:"a16"}],
   comps:[{kind:"IC",label:"UART",val:"FTDI",r1:11,r2:15},{kind:"R",label:"R_hb",val:"330 Ω",col:7,r1:11,r2:14}],
   jumps:[{c1:0,r1:16,c2:7,r2:16,c:"#1e293b"}],
   target:"Parse UART stream; non-zero exit fails CI / release gate",sch:"uart"
  },
  "hil-filter":{
   hw:"nucleo",hwTitle:"STREAM PARSER + ERR LATCH",hwBadge:"GREP / REGEX",hwRead:"LOG TAPE",
   title:"Live Serial Stream Filtering & Hardware Error Tap",
   safety:"Always tee raw full log before grep filtering so context stays intact.",
   pins:[{p:"UART_RX",c:P.teal},{p:"ERR_FLAG",c:P.red},{p:"SYNC_TS",c:P.gold},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:11,c:P.teal,tag:"Grn RX",dst:"a11"},{pi:1,col:8,row:11,c:P.red,tag:"Red ERR",dst:"i11"},{pi:2,col:0,row:13,c:P.gold,tag:"Yel SYNC",dst:"a13"},{pi:3,col:0,row:16,c:"#1e293b",tag:"Blk GND",dst:"a16"}],
   comps:[{kind:"IC",label:"LOG",val:"FIFO",r1:11,r2:15},{kind:"R",label:"R_pu",val:"4.7 kΩ",col:7,r1:11,r2:16}],
   jumps:[{c1:0,r1:16,c2:7,r2:16,c:"#1e293b"}],
   target:"Preserve raw timestamps alongside ERR_FLAG transitions",sch:"block"
  },
  "hil-exitcode":{
   hw:"rack",hwTitle:"EXIT CODE STATUS FIXTURE",hwBadge:"0=PASS",hwRead:"EXIT != 0",
   title:"Script Exit Code Mapped to Hardware Pass/Fail Indicators",
   safety:"Any assertion failure returns non-zero exit code to halt automated build.",
   pins:[{p:"GPIO_PASS",c:P.teal},{p:"GPIO_FAIL",c:P.red},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.teal,tag:"Grn PASS",dst:"a10"},{pi:1,col:5,row:10,c:P.red,tag:"Red FAIL",dst:"f10"},{pi:2,col:0,row:16,c:"#1e293b",tag:"Blk GND",dst:"a16"}],
   comps:[{kind:"R",label:"R_p",val:"330 Ω",col:1,r1:10,r2:13},{kind:"D",label:"LED_OK",val:"GREEN",col:1,r1:13,r2:16},{kind:"R",label:"R_f",val:"330 Ω",col:6,r1:10,r2:13},{kind:"D",label:"LED_NG",val:"RED",col:6,r1:13,r2:16}],
   jumps:[{c1:0,r1:16,c2:6,r2:16,c:"#1e293b"}],
   target:"Exit 0 lights PASS (left); exit ≠ 0 latches FAIL (right)",sch:"led-diode"
  },
  "hil-ver":{
   hw:"nucleo",hwTitle:"EEPROM / CONFIG LOCK",hwBadge:"SHA-256",hwRead:"REV TAG",
   title:"Immutable Version Control & Board ID Strap Readback",
   safety:"Record Git SHA + EEPROM serial hash inside every qualification test artifact.",
   pins:[{p:"3V3",c:P.red},{p:"WP_LOCK",c:P.blue},{p:"SDA_ID",c:P.teal},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.red,tag:"Red 3V3",dst:"a10"},{pi:1,col:0,row:12,c:P.blue,tag:"Blu WP",dst:"a12"},{pi:2,col:8,row:12,c:P.teal,tag:"Tea SDA",dst:"i12"},{pi:3,col:0,row:16,c:"#1e293b",tag:"Blk GND",dst:"a16"}],
   comps:[{kind:"IC",label:"PROM",val:"ID+SHA",r1:11,r2:15},{kind:"R",label:"R_id",val:R0,col:7,r1:12,r2:16}],
   jumps:[{c1:0,r1:16,c2:7,r2:16,c:"#1e293b"}],
   target:"Read board SN & script SHA before logging artifacts",sch:"i2c"
  },
  "hil-raw":{
   hw:"scope",hwTitle:"RAW TELEMETRY VS SUMMARY",hwBadge:"RAW DUMP",hwRead:"N=ALL",
   title:"Raw Sample Archive vs Pass/Fail Summary Audit",
   safety:"Store full raw CSV/waveform dumps so anomalies cannot hide behind averages.",
   pins:[{p:"RAW_CH1",c:P.blue},{p:"RAW_CH2",c:P.gold},{p:"GATE_FLG",c:P.teal},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.blue,tag:"Blu CH1",dst:"a10"},{pi:1,col:0,row:13,c:P.gold,tag:"Yel CH2",dst:"a13"},{pi:2,col:8,row:12,c:P.teal,tag:"Tea FLG",dst:"i12"},{pi:3,col:0,row:16,c:"#1e293b",tag:"Blk GND",dst:"a16"}],
   comps:[{kind:"R",label:"R_sns",val:R0,col:2,r1:10,r2:13},{kind:"C",label:"C_flt",val:C0,col:7,r1:12,r2:16}],
   jumps:[{c1:0,r1:16,c2:7,r2:16,c:"#1e293b"}],
   target:"Inspect raw CH1 bursts (row10) before smoothed summary",sch:"rc-lpf"
  },
  "rf-specan":{
   hw:"rack",hwTitle:"SPECTRUM ANALYZER + 30 dB PAD",hwBadge:"RBW / dBm",hwRead:"-30 dB PAD",
   title:"Spectrum Analyzer Input Chain + Protective Attenuator",
   safety:"NEVER exceed +20/+30 dBm SA mixer limit — always fit external pad first.",
   pins:[{p:"TX_RF",c:P.red},{p:"SA_IN",c:P.blue},{p:"GND_SHD",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:11,c:P.red,tag:"Coax TX",dst:"a11"},{pi:1,col:9,row:11,c:P.blue,tag:"Coax SA",dst:"j11"},{pi:2,col:0,row:16,c:"#1e293b",tag:"Shield",dst:"a16"}],
   comps:[{kind:"R",label:"Pad30",val:"50 Ω",c1:4,r1:11,c2:5,r2:11},{kind:"R",label:"Rsh1",val:"50 Ω",col:2,r1:11,r2:16},{kind:"R",label:"Rsh2",val:"50 Ω",col:7,r1:11,r2:16}],
   jumps:[{c1:0,r1:16,c2:7,r2:16,c:"#1e293b"}],
   target:"Lower RBW reduces noise floor; subtract external pad dB",sch:"block"
  },
  "rf-vna-s21":{
   hw:"rack",hwTitle:"VNA 2-PORT S21 BENCH",hwBadge:"S21 dB",hwRead:"THRU CAL",
   title:"2-Port VNA Transmission / Insertion Loss (S21) Stage",
   safety:"Perform full SOLT 2-port VNA calibration at coax tips before measuring DUT.",
   pins:[{p:"VNA_P1",c:P.red},{p:"VNA_P2",c:P.blue},{p:"RF_GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:11,c:P.red,tag:"Port 1",dst:"a11"},{pi:1,col:9,row:11,c:P.blue,tag:"Port 2",dst:"j11"},{pi:2,col:0,row:16,c:"#1e293b",tag:"Shield",dst:"a16"}],
   comps:[{kind:"L",label:"L_rf",val:L0,c1:4,r1:11,c2:5,r2:11},{kind:"C",label:"C_sh",val:"10 pF",col:7,r1:11,r2:16}],
   jumps:[{c1:0,r1:16,c2:7,r2:16,c:"#1e293b"}],
   target:"S21 measures transmitted wave Port 1 → DUT → Port 2",sch:"rc-lpf"
  },
  "rf-s11":{
   hw:"rack",hwTitle:"VNA 1-PORT S11 RETURN LOSS",hwBadge:"S11 / VSWR",hwRead:"50 Ω LOAD",
   title:"1-Port Reflection / S11 Impedance Match Verification",
   safety:"50 Ω termination minimizes reflected wave (S11 < -15 dB, VSWR < 1.5).",
   pins:[{p:"VNA_P1",c:P.red},{p:"CAL_REF",c:P.teal},{p:"RF_GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:11,c:P.red,tag:"Port 1",dst:"a11"},{pi:1,col:8,row:11,c:P.teal,tag:"Cal Ref",dst:"i11"},{pi:2,col:0,row:16,c:"#1e293b",tag:"Shield",dst:"a16"}],
   comps:[{kind:"R",label:"Z_dut",val:"50 Ω",col:2,r1:11,r2:16},{kind:"R",label:"Z_cal",val:"50 Ω",col:7,r1:11,r2:16}],
   jumps:[{c1:0,r1:16,c2:7,r2:16,c:"#1e293b"}],
   target:"Compare S11 reflection of DUT (left) vs 50 Ω cal (right)",sch:"parallel"
  },
  "rf-50ohm":{
   hw:"rack",hwTitle:"VNA / 50 Ω RF TEST PORT",hwBadge:"S11 / S21",hwRead:"50 Ω Z0",
   title:"Matched 50 Ω RF Chain / Pi-Attenuator Stage",
   safety:"Always attach attenuator/50 Ω load before RF TX; torque SMA connectors.",
   pins:[{p:"PORT1_50",c:P.red},{p:"PORT2_S21",c:P.blue},{p:"RF_GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:11,c:P.red,tag:"Coax P1",dst:"a11"},{pi:1,col:9,row:11,c:P.blue,tag:"Coax P2",dst:"j11"},{pi:2,col:0,row:16,c:"#1e293b",tag:"Shield",dst:"a16"}],
   comps:[{kind:"R",label:"Rsh1",val:"50 Ω",col:2,r1:11,r2:16},{kind:"R",label:"Rser",val:"33 Ω",c1:4,r1:11,c2:5,r2:11},{kind:"R",label:"Rsh2",val:"50 Ω",col:7,r1:11,r2:16}],
   jumps:[{c1:0,r1:16,c2:7,r2:16,c:"#1e293b"}],
   target:"Pi pad bridges row 11 across trench; S11 < -15 dB match",sch:"block"
  },
  "rf-lambda":{
   hw:"scope",hwTitle:"RF CARRIER WAVELENGTH λ",hwBadge:"λ = c / f",hwRead:F0,
   title:"Free-Space & Quarter-Wave Coax Line Resonance ("+F0+")",
   safety:"Match trace/antenna length to λ/4 or λ/2 at operating carrier frequency.",
   pins:[{p:"RF_CARR",c:P.pink},{p:"ANT_FEED",c:P.blue},{p:"COAX_SHD",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:11,c:P.pink,tag:"Mag RF",dst:"a11"},{pi:1,col:8,row:11,c:P.blue,tag:"Blu ANT",dst:"i11"},{pi:2,col:0,row:16,c:"#1e293b",tag:"Shield",dst:"a16"}],
   comps:[{kind:"L",label:"λ/4_L",val:L0,c1:4,r1:11,c2:5,r2:11},{kind:"C",label:"C_match",val:"4.7 pF",col:7,r1:11,r2:16}],
   jumps:[{c1:0,r1:16,c2:7,r2:16,c:"#1e293b"}],
   target:"λ = 3×10⁸ / f (m) · Match L-network onto 50 Ω feed",sch:"rlc"
  },
  "qual-verify":{
   hw:"dmm",hwTitle:"VERIFICATION / MARGIN SPEC",hwBadge:"SPEC GATE",hwRead:V0,
   title:"Requirement Verification Against Upper/Lower Acceptance Limits",
   safety:"Log calibrated instrument serial, measured value, and pass margin.",
   pins:[{p:"STIM_BUS",c:P.red},{p:"CAL_DMM",c:P.blue},{p:"RTN_0V",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.red,tag:"Red STIM",dst:"a10"},{pi:1,col:4,row:13,c:P.blue,tag:"Blu DMM",dst:"e13"},{pi:2,col:0,row:16,c:"#1e293b",tag:"Blk RTN",dst:"a16"}],
   comps:[{kind:"R",label:"R_cal1",val:R0,col:2,r1:10,r2:13},{kind:"R",label:"R_cal2",val:R1,col:2,r1:13,r2:16}],
   jumps:[],
   target:"Does board meet written spec? Record exact margin %",sch:"divider"
  },
  "qual-mission":{
   hw:"nucleo",hwTitle:"VALIDATION / MISSION HARNESS",hwBadge:"FLIGHT SIM",hwRead:"END-TO-END",
   title:"End-to-End Flight-Like Mission Load & Telemetry Validation",
   safety:"Exercise flight states with representative power, thermal, & bus loads.",
   pins:[{p:"BUS_PWR",c:P.red},{p:"CMD_TX",c:P.blue},{p:"TLM_RX",c:P.teal},{p:"CHASSIS",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.red,tag:"Red BUS",dst:"a10"},{pi:1,col:0,row:12,c:P.blue,tag:"Blu CMD",dst:"a12"},{pi:2,col:8,row:12,c:P.teal,tag:"Tea TLM",dst:"i12"},{pi:3,col:0,row:16,c:"#1e293b",tag:"Blk GND",dst:"a16"}],
   comps:[{kind:"IC",label:"FSW",val:"MISSION",r1:10,r2:15},{kind:"R",label:"R_payld",val:R0,col:7,r1:10,r2:16}],
   jumps:[{c1:0,r1:16,c2:7,r2:16,c:"#1e293b"}],
   target:"Confirm mission payload satisfies operational need",sch:"power-tree"
  },
  "tvac-env":{
   hw:"rack",hwTitle:"TVAC / ENVIRONMENTAL HARNESS",hwBadge:"MARGIN + GO",hwRead:"PASS GATE",
   title:"Environmental Chamber Feedthrough & Margin Verification",
   safety:"Verify harness outside chamber wall (left) before sealing flight DUT (right).",
   pins:[{p:"BUS_PWR",c:P.red},{p:"TC_SENS",c:P.gold},{p:"TLM_RX",c:P.blue},{p:"CHASSIS",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.red,tag:"Red BUS",dst:"a10"},{pi:1,col:0,row:13,c:P.gold,tag:"Yel TEMP",dst:"a13"},{pi:2,col:9,row:12,c:P.blue,tag:"Blu TLM",dst:"j12"},{pi:3,col:0,row:16,c:"#1e293b",tag:"Blk RTN",dst:"a16"}],
   comps:[{kind:"IC",label:"WALL",val:"HERM",r1:10,r2:15},{kind:"R",label:"DUT_L",val:R0,col:7,r1:10,r2:16}],
   jumps:[{c1:0,r1:16,c2:7,r2:16,c:"#1e293b"}],
   target:"Trench = Chamber Wall; log min/max margin across temp",sch:"block"
  },
  "qual-cfg":{
   hw:"rack",hwTitle:"CONFIG CONTROL / HARNESS ID",hwBadge:"BASELINE",hwRead:"REV MATCH",
   title:"Flight Harness Pin-Keyed Interlock & ID Strap Check",
   safety:"Never swap flight harness/firmware without formal ECO & re-qualification.",
   pins:[{p:"ID_DRIVE",c:P.blue},{p:"KEY_PIN",c:P.gold},{p:"CHASSIS",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:11,c:P.blue,tag:"Blu ID+",dst:"a11"},{pi:1,col:8,row:11,c:P.gold,tag:"Yel KEY",dst:"i11"},{pi:2,col:0,row:16,c:"#1e293b",tag:"Blk CHAS",dst:"a16"}],
   comps:[{kind:"WIRE",label:"HARN_ID",val:"LOCK",c1:4,r1:11,c2:5,r2:11,c:P.gold},{kind:"R",label:"R_id",val:R0,col:7,r1:11,r2:16}],
   jumps:[{c1:0,r1:16,c2:7,r2:16,c:"#1e293b"}],
   target:"ID strap R_id matches frozen harness baseline BOM",sch:"continuity"
  },
  "qual-gate":{
   hw:"psu",hwTitle:"RELEASE GO / NO-GO GATE",hwBadge:"TRR / MRR",hwRead:"GO GATE",
   title:"Final Release Gate (Pass Criteria vs Defect Hold Latch)",
   safety:"Zero open failures, verified calibration certs, and full traceability required.",
   pins:[{p:"RAIL_EN",c:P.red},{p:"GO_LED",c:P.teal},{p:"HOLD_FLAG",c:P.gold},{p:"GND",c:"#1e293b"}],
   wires:[{pi:0,col:0,row:10,c:P.red,tag:"Red EN",dst:"a10"},{pi:1,col:8,row:12,c:P.teal,tag:"Tea GO",dst:"i12"},{pi:2,col:8,row:14,c:P.gold,tag:"Yel HLD",dst:"i14"},{pi:3,col:0,row:16,c:"#1e293b",tag:"Blk GND",dst:"a16"}],
   comps:[{kind:"IC",label:"GATE",val:"GO/NO-GO",r1:10,r2:15},{kind:"D",label:"GO_LED",val:"PASS",col:7,r1:12,r2:16}],
   jumps:[{c1:0,r1:16,c2:7,r2:16,c:"#1e293b"}],
   target:"Release only when 100% gate items & waivers signed",sch:"rail-seq"
  }
 };

 const cfg=defs[key]||defs["dmm-ohm"];
 return {key,topic:t.id,R0,R1,R2,V0,I0,C0,C1,L0,F0,...cfg};
}

function drawPanel1Body(c){
 let s=rect(14,56,204,256,"#fff","#cbdce7",11,1.4)+
  text(26,77,"1 · "+(c.hw==="dmm"?"MEASUREMENT METER":c.hw==="psu"?"POWER BENCH":c.hw==="scope"?"SCOPE + GENERATOR":c.hw==="rack"?"TEST RACK / HIL":"DUT / CONTROLLER"),11,P.ink,"start","800")+
  text(26,93,clipLabel(c.hwTitle,28),9.2,P.muted,"start","600")+
  rect(22,102,174,196,"#f4f7fa","#bfd0dc",9,1.5);

 if(c.hw==="dmm"||c.hw==="psu"){
  const isDmm=c.hw==="dmm";
  s+=rect(28,107,162,36,"#1c2d3c","#0f1c26",5,1.2)+
   rect(32,111,54,14,isDmm?"#0d8573":P.blue,"none",3)+
   text(59,121,clipLabel(c.hwBadge,9),7.2,"#fff","middle","800")+
   text(184,136,clipLabel(c.hwRead,11),12,"#7ef7c9","end","800");
  if(isDmm){
   s+=dot(62,188,"#34495e",16)+path("M62 188 L73 177","#f59e0b",2.8)+text(62,214,"DIAL: "+clipLabel(c.hwBadge,9),7.5,P.navy,"middle","700");
  }else{
   s+=rect(30,160,54,21,"#dff3e8","#199e4b",4,1)+text(57,174,"OUT ON",7.6,"#156f36","middle","800")+
    rect(30,186,54,21,"#eef3f7","#b0c3d0",4,1)+text(57,200,"CC LIM",7.6,P.muted,"middle","700");
  }
 }else if(c.hw==="scope"){
  s+=rect(28,107,162,42,"#142433","#0c1721",5,1.2)+
   line(32,128,186,128,"#244056",1)+line(109,109,109,147,"#244056",1)+
   path("M34 134 C49 112,64 112,79 128 C94 144,109 144,124 128 C139 112,154 112,184 128",P.blue,1.8)+
   path("M34 139 C54 139,62 117,92 117 C118 117,138 117,184 117",P.gold,1.5)+
   rect(33,111,48,12,P.pink,"none",2)+text(57,120,clipLabel(c.hwBadge,9),6.8,"#fff","middle","800")+
   dot(48,182,"#475b6d",8)+dot(76,182,"#475b6d",8)+text(62,202,clipLabel(c.hwRead,11),7.6,P.navy,"middle","700");
 }else if(c.hw==="rack"){
  s+=rect(28,107,162,36,"#1e2e3d","#101d28",5,1.2)+
   rect(33,111,62,12,P.teal,"none",2)+text(64,120,clipLabel(c.hwBadge,11),6.8,"#fff","middle","800")+
   text(184,136,clipLabel(c.hwRead,11),9.5,"#a5f3fc","end","700")+
   rect(28,158,76,40,"#e6eff6","#b5c9d8",4,1)+
   dot(38,172,P.green,3.8)+text(45,175,"READY",7.2,P.navy,"start","700")+
   dot(38,188,P.blue,3.8)+text(45,191,"DAQ ON",7.2,P.muted,"start","600");
 }else{
  s+=rect(66,97,40,14,"#c5d2de","#7c91a3",3)+text(112,107,"USB",8,"#a84619","start","700")+
   rect(30,115,48,22,"#253340","#14202b",4)+text(54,129,"ST-LINK",7.6,"#e2edf5","middle","700")+
   rect(30,152,50,38,"#202d38","#111c24",4)+text(55,169,"STM32",8.2,"#fff","middle","800")+text(55,182,"DUT MCU",6.5,"#bfe3f7","middle","600")+
   dot(66,204,P.blue,5.5)+text(66,216,"RUN",6.8,P.muted,"middle")+dot(42,204,"#111827",4.2)+text(42,216,"RST",6.8,P.muted,"middle");
 }

 const pinCount=c.pins.length;
 const pinY=i=>166+i*25;
 s+=text(189,151,"PORTS",7.2,P.navy,"end","700")+
  rect(176,154,20,pinCount*25+6,"#1b2631","#0f1720",3);
 c.pins.forEach((pin,i)=>{
  const py=pinY(i);
  s+=text(171,py+3,clipLabel(pin.p,10),7.6,pin.c==="#1e293b"?P.ink:pin.c,"end","700")+
   dot(186,py,pin.c,4.5);
 });
 s+=text(30,275,clipLabel("Mode: "+c.hwBadge,22),8.2,P.navy,"start","700")+
  text(30,289,"Ports map directly to right",7.5,P.muted,"start","500");
 return {svg:s,pinY};
}

function threePanelBoardAndBreadboard(q,t){
 const c=boardSetup(q,t);
 const COL_NAMES=["a","b","c","d","e","f","g","h","i","j"];
 const xs=[342,370,398,426,454,508,536,564,592,620];
 const hole=(col,row)=>COL_NAMES[col]+row;
 const rowY={};for(let r=9;r<=17;r++)rowY[r]=128+(r-9)*18;

 let s=text(18,26,"BENCH & BREADBOARD WIRING ("+q.id.toUpperCase()+"): "+clipLabel(c.title,54),14.2,P.ink,"start","800")+
  text(18,44,c.safety,10.5,"#a84619","start","600");

 const p1=drawPanel1Body(c);
 s+=p1.svg;

 // Panel 2: Unobstructed 10-column Solderless Breadboard (a–e | gap | f–j, rows 9–17)
 s+=rect(294,56,382,256,"#fff","#cbdce7",11,1.4)+
  text(308,77,"2 · SOLDERLESS BREADBOARD (a–e | f–j · rows 9–17)",12,P.ink,"start","800")+
  text(308,93,clipLabel(c.title,54),9.5,P.muted,"start","600")+
  rect(306,101,358,184,"#efefe6","#d4d8cc",9,1.2);
 COL_NAMES.forEach((nm,i)=>s+=text(xs[i],115,nm,9.5,P.ink,"middle","700"));
 s+=rect(472,118,18,162,"#dcdcd2","none",4)+
  text(481,184,"G",7,P.muted,"middle","700")+text(481,197,"A",7,P.muted,"middle","700")+text(481,210,"P",7,P.muted,"middle","700");

 const activeL=new Set(),activeR=new Set();
 c.wires.forEach(w=>(w.col<=4?activeL:activeR).add(w.row));
 c.jumps.forEach(j=>{(j.c1<=4?activeL:activeR).add(j.r1);(j.c2<=4?activeL:activeR).add(j.r2);});
 c.comps.forEach(o=>{
  if(o.kind==="IC"){for(let r=o.r1;r<=o.r2;r++){activeL.add(r);activeR.add(r);}}
  else if(o.c1!==undefined){(o.c1<=4?activeL:activeR).add(o.r1);(o.c2<=4?activeL:activeR).add(o.r2);}
  else{(o.col<=4?activeL:activeR).add(o.r1);(o.col<=4?activeL:activeR).add(o.r2);}
 });

 for(let r=9;r<=17;r++){
  const al=activeL.has(r),ar=activeR.has(r);
  s+=rect(330,rowY[r]-6,136,12,al?"#d9ebfc":"#f7f7f2",al?"#9ec6eb":"none",5,1)+
   rect(496,rowY[r]-6,136,12,ar?"#d9ebfc":"#f7f7f2",ar?"#9ec6eb":"none",5,1);
  xs.forEach(x=>s+=dot(x,rowY[r],"#475b6d",2.4));
 }
 s+=text(308,301,"Rows connect a–e only and f–j only; center gap isolates left from right.",9,P.muted,"start","500");

 // Internal breadboard jumpers
 c.jumps.forEach(j=>{
  const x1=xs[j.c1],y1=rowY[j.r1],x2=xs[j.c2],y2=rowY[j.r2],cx=(x1+x2)/2,cy=Math.min(y1,y2)-10;
  s+=path("M"+x1+" "+y1+" Q"+cx+" "+cy+" "+x2+" "+y2,j.c||P.teal,2.4)+dot(x1,y1,j.c||P.teal,3.2)+dot(x2,y2,j.c||P.teal,3.2);
 });

 // Panel 1 → Breadboard wires routed cleanly outside row digits & holes
 c.wires.forEach((w,wi)=>{
  const sx=186,sy=p1.pinY(w.pi),tx=xs[w.col],ty=rowY[w.row];
  const pillY=116+wi*40;
  let d;
  if(w.col>=5&&w.row<=13){
   d="M"+sx+" "+sy+" C220 "+sy+", 220 "+pillY+", 289 "+pillY+" L302 99 L"+tx+" 99 L"+tx+" "+ty;
  }else if(w.col>=5&&w.row>=14){
   d="M"+sx+" "+sy+" C220 "+sy+", 220 "+pillY+", 289 "+pillY+" L304 282 L"+tx+" 282 L"+tx+" "+ty;
  }else if(w.row===9){
   d="M"+sx+" "+sy+" C220 "+sy+", 220 "+pillY+", 289 "+pillY+" Q312 99 "+tx+" "+ty;
  }else{
   d="M"+sx+" "+sy+" C220 "+sy+", 220 "+pillY+", 289 "+pillY+" C315 "+pillY+", 327 "+(ty-4)+", "+tx+" "+ty;
  }
  s+=path(d,w.c,2.5)+dot(sx,sy,w.c,3.8)+dot(tx,ty,w.c,3.8);
  s+=rect(221,pillY-11,68,22,"#fff",w.c,6,1.2)+
   text(255,pillY-1,clipLabel(w.tag,10),7.3,w.c,"middle","800")+
   text(255,pillY+8,"→ "+w.dst,6.8,P.muted,"middle","600");
 });

 // Re-stamp opaque row-index gutter strip & numbers so wires never strike through row digits
 s+=rect(310,120,16,158,"#efefe6","none",3);
 for(let r=9;r<=17;r++){
  const act=activeL.has(r)||activeR.has(r);
  s+=text(318,rowY[r]+3.5,String(r),9,act?P.navy:P.muted,"middle",act?"700":"500");
 }

 // Two-pass component rendering: bodies first, then label badges on top
 const compLabels=[];
 function drawCompBody(o){
  if(o.kind==="IC"){
   const y1=rowY[o.r1]-4,y2=rowY[o.r2]+4,h=y2-y1,x=450,w=62;
   s+=rect(x,y1,w,h,"#24323f","#0f1720",4,1.2)+
    path("M"+(x+w/2-6)+" "+y1+" A6 6 0 0 0 "+(x+w/2+6)+" "+y1,"#475b6d",1.5,"#111b24");
   for(let r=o.r1;r<=o.r2;r++){
    s+=rect(x-7,rowY[r]-2,7,4,"#94a3b8","none",1)+dot(xs[4],rowY[r],P.ink,2.5)+
     rect(x+w,rowY[r]-2,7,4,"#94a3b8","none",1)+dot(xs[5],rowY[r],P.ink,2.5);
   }
   s+=text(x+w/2,(y1+y2)/2-2,clipLabel(o.label,8),8.2,"#fff","middle","800")+
    text(x+w/2,(y1+y2)/2+9,clipLabel(o.val,9),7,"#bae6fd","middle","600");
   return;
  }
  if(o.c1!==undefined){
   const x1=xs[o.c1],x2=xs[o.c2],y=rowY[o.r1],y2=rowY[o.r2],mx=(x1+x2)/2,my=(y+y2)/2;
   if(o.kind==="WIRE"){
    const ctrlX=x1===x2?x1-14:mx,ctrlY=y===y2?y-12:my;
    s+=path("M"+x1+" "+y+" Q"+ctrlX+" "+ctrlY+" "+x2+" "+y2,o.c||P.gold,2.8)+dot(x1,y,o.c||P.gold,3.2)+dot(x2,y2,o.c||P.gold,3.2);
    compLabels.push({bx:mx-22,by:my-18,bw:44,bh:12,stroke:"#d4a017",tx:mx,ty:my-9.5,anc:"middle",t1:clipLabel(o.label,9),c1:"#854d0e",t2:""});
    return;
   }
   s+=line(x1,y,mx-13,y,"#64748b",2)+line(mx+13,y,x2,y2,"#64748b",2)+dot(x1,y,P.ink,3)+dot(x2,y2,P.ink,3);
   if(o.kind==="R"){
    const bc=bandColorsFor(o.val);
    s+=rect(mx-13,y-7,26,14,"#dfc08b","#9e7238",4,1.2)+
     line(mx-6,y-7,mx-6,y+7,bc[0],2.4)+line(mx,y-7,mx,y+7,bc[1],2.4)+line(mx+6,y-7,mx+6,y+7,bc[2],2.4);
   }else if(o.kind==="C"){
    s+=rect(mx-10,y-8,20,16,"#e0f2fe","#0284c7",4,1.2)+line(mx-3,y-6,mx-3,y+6,P.navy,2.5)+line(mx+3,y-6,mx+3,y+6,P.navy,2.5);
   }else{
    s+=rect(mx-12,y-7,24,14,"#fef3c7","#b45309",5,1.2)+text(mx,y+3,"L",8.5,P.ink,"middle","800");
   }
   compLabels.push({bx:mx-24,by:y-21,bw:48,bh:12,stroke:"#cbd5e1",tx:mx,ty:y-12.5,anc:"middle",t1:clipLabel(o.label+" "+o.val,11),c1:P.navy,t2:""});
   return;
  }
  const x=xs[o.col],y1=rowY[o.r1],y2=rowY[o.r2],mid=(y1+y2)/2+(o.yOff||0);
  const anchorLeft=o.side?o.side==="L":(o.col>=7);
  const lx=anchorLeft?x-11:x+11,anc=anchorLeft?"end":"start";
  const bMid=(y1+y2)/2;
  s+=line(x,y1,x,bMid-12,"#64748b",2)+line(x,bMid+12,x,y2,"#64748b",2)+dot(x,y1,P.ink,2.8)+dot(x,y2,P.ink,2.8);
  if(o.kind==="R"){
   const bc=bandColorsFor(o.val);
   s+=rect(x-7,bMid-12,14,24,"#dfc08b","#9e7238",4,1.2)+
    line(x-7,bMid-5,x+7,bMid-5,bc[0],2.3)+line(x-7,bMid,x+7,bMid,bc[1],2.3)+line(x-7,bMid+5,x+7,bMid+5,bc[2],2.3);
  }else if(o.kind==="C"){
   s+=rect(x-9,bMid-10,18,20,"#e0f2fe","#0284c7",4,1.2)+line(x-7,bMid-2,x+7,bMid-2,P.navy,2.6)+line(x-7,bMid+3,x+7,bMid+3,P.navy,2.6);
  }else if(o.kind==="L"){
   s+=rect(x-8,bMid-12,16,24,"#fef3c7","#b45309",5,1.2)+text(x,bMid+3.5,"L",10,P.ink,"middle","800");
  }else if(o.kind==="D"){
   s+=rect(x-8,bMid-12,16,24,"#fce7f3","#be185d",4,1.2)+text(x,bMid+3.5,"▶|",9,"#9d174d","middle","800");
  }else{
   s+=rect(x-10,bMid-12,20,24,"#253340","#111c24",3,1.2)+text(x,bMid+3.5,"Q",9.5,"#fff","middle","800");
  }
  compLabels.push({bx:anchorLeft?lx-39:lx-1,by:mid-11,bw:40,bh:21,stroke:"#dbe6ee",tx:lx,ty:mid-1.5,anc,t1:clipLabel(o.label,7),c1:P.navy,t2:clipLabel(o.val,8),ty2:mid+7.5});
 }
 c.comps.forEach(drawCompBody);
 compLabels.forEach(lb=>{
  s+=rect(lb.bx,lb.by,lb.bw,lb.bh,"#ffffff",lb.stroke,3,0.9)+text(lb.tx,lb.ty,lb.t1,7.3,lb.c1,lb.anc,"800");
  if(lb.t2)s+=text(lb.tx,lb.ty2,lb.t2,7,P.muted,lb.anc,"600");
 });

 // Panel 2B: Dedicated Right Sidebar Card (no breadboard hole overlap)
 s+=rect(686,56,160,256,"#fff","#cbdce7",11,1.4)+
  text(697,77,"BUILD & CHECK",11.5,P.ink,"start","800")+
  rect(697,85,138,18,"#e8f3fb","#b7d8ee",4,1)+
  text(766,97,clipLabel(c.key.toUpperCase().replace(/-/g," "),21),7.8,P.navy,"middle","800");
 s+=text(697,118,"COMPONENTS",8,P.muted,"start","800");
 c.comps.slice(0,4).forEach((o,i)=>{
  const span=o.kind==="IC"?("e"+o.r1+"↔f"+o.r2):o.c1!==undefined?(hole(o.c1,o.r1)+"↔"+hole(o.c2,o.r2)):(hole(o.col,o.r1)+"↔"+hole(o.col,o.r2));
  s+=text(697,132+i*14,clipLabel(o.label+" "+o.val+": "+span,24),7.7,P.ink,"start","600");
 });
 const jStart=136+Math.min(4,c.comps.length)*14+6;
 s+=text(697,jStart,"BREADBOARD PINS",8,P.muted,"start","800");
 c.wires.slice(0,4).forEach((w,i)=>s+=text(697,jStart+13+i*13,clipLabel(w.tag+" → "+w.dst,24),7.5,w.c==="#1e293b"?P.ink:w.c,"start","700"));
 const [tgt1,tgt2]=wrapTwo(c.target,24);
 s+=rect(695,256,142,46,"#f4faf7","#bfe0cf",6,1)+
  text(702,269,"TARGET / CHECK",7.5,P.teal,"start","800")+
  text(702,281,tgt1,7.5,P.ink,"start","600")+
  text(702,293,tgt2||("Topic: "+c.topic.toUpperCase()),7.2,P.muted,"start","500");

 // Panel 3: Compact ANSI/IEEE Electrical Equivalent Circuit (all inside y=346..426)
 s+=rect(14,320,832,126,"#fff","#cbdce7",11,1.4)+
  text(28,340,"3 · MATCHING ELECTRICAL CONNECTION",12,P.ink,"start","800")+
  text(832,340,"Question "+q.id.toUpperCase()+" · "+c.sch.toUpperCase(),9.5,P.blue,"end","700");

 const zH=(x1,x2,y,lab)=>{
  const n=6,dx=(x2-x1)/n;let d="M"+x1+" "+y;
  for(let i=0;i<n;i++)d+=" L"+(x1+(i+.5)*dx)+" "+(y+(i%2?-7:7));
  return path(d+" L"+x2+" "+y,P.ink,2.2)+text((x1+x2)/2,y-11,lab,8.5,P.navy,"middle","700");
 };
 const zV=(x,y1,y2,lab)=>{
  const n=5,dy=(y2-y1)/n;let d="M"+x+" "+y1;
  for(let i=0;i<n;i++)d+=" L"+(x+(i%2?6:-6))+" "+(y1+(i+.5)*dy);
  return path(d+" L"+x+" "+y2,P.ink,2.2)+text(x+11,(y1+y2)/2+3,lab,8.5,P.navy,"start","700");
 };
 const gnd=(x,y)=>line(x,y,x,y+6,P.ink,2)+line(x-11,y+6,x+11,y+6,P.ink,2)+line(x-7,y+10,x+7,y+10,P.ink,1.8)+line(x-3,y+14,x+3,y+14,P.ink,1.6);
 const miniBat=(x,yT,yB,lab)=>{
  const m=(yT+yB)/2;
  return line(x,yT,x,m-7,P.ink,2.2)+line(x-13,m-7,x+13,m-7,P.ink,2.8)+line(x-7,m-1,x+7,m-1,P.ink,2)+
   line(x-13,m+4,x+13,m+4,P.ink,2.8)+line(x-7,m+10,x+7,m+10,P.ink,2)+line(x,m+10,x,yB,P.ink,2.2)+
   text(x-17,m-7,"+",11,P.ink,"end","700")+text(x-17,m+13,"−",11,P.ink,"end","700")+text(x-20,m+3,lab,8.5,P.red,"end","700");
 };
 const meter=(mx,my,sym,col=P.teal)=>rect(mx-13,my-13,26,26,"#fff",col,13,2)+text(mx,my+4,sym,10.5,col,"middle","800");
 const capH=(x1,x2,y,lab)=>{const m=(x1+x2)/2;return line(x1,y,m-4,y,P.ink,2.2)+line(m-4,y-10,m-4,y+10,P.ink,2.6)+line(m+4,y-10,m+4,y+10,P.ink,2.6)+line(m+4,y,x2,y,P.ink,2.2)+text(m,y-14,lab,8.5,P.navy,"middle","700");};
 const indH=(x1,x2,y,lab)=>{const m=(x1+x2)/2;return line(x1,y,m-18,y,P.ink,2.2)+path("M"+(m-18)+" "+y+" C"+(m-18)+" "+(y-12)+" "+(m-6)+" "+(y-12)+" "+(m-6)+" "+y+" C"+(m-6)+" "+(y-12)+" "+(m+6)+" "+(y-12)+" "+(m+6)+" "+y+" C"+(m+6)+" "+(y-12)+" "+(m+18)+" "+(y-12)+" "+(m+18)+" "+y,P.ink,2.2)+line(m+18,y,x2,y,P.ink,2.2)+text(m,y-15,lab,8.5,P.navy,"middle","700");};
 const diodeH=(x1,x2,y,lab,led=false)=>{
  const m=(x1+x2)/2;
  return line(x1,y,m-8,y,P.ink,2.2)+path("M"+(m-8)+" "+(y-8)+" L"+(m+7)+" "+y+" L"+(m-8)+" "+(y+8)+" Z",P.ink,2,"#fce7f3")+
   line(m+8,y-8,m+8,y+8,P.ink,2.4)+line(m+8,y,x2,y,P.ink,2.2)+
   (led?arrow(m-1,y-10,m+6,y-17,P.pink,1.5)+arrow(m+6,y-9,m+13,y-16,P.pink,1.5):"")+
   text(m,y+18,lab,8.2,P.navy,"middle","700");
 };

 const yM=381,yT=359,yB=405,{R0,R1,R2,V0,I0,C0,L0,F0}=c;
 if(c.sch==="ohmmeter"){
  s+=meter(140,yM,"Ω",P.red)+line(153,yM,340,yM,P.ink,2.2)+zH(340,480,yM,"R1 "+R0)+line(480,yM,650,yM,P.ink,2.2)+
   line(650,yM,650,yB,P.ink,2.2)+line(140,yM+13,140,yB,P.ink,2.2)+line(140,yB,650,yB,P.ink,2.2)+
   text(678,yM+3,"POWER OFF · OHMMETER MODE",8.8,"#a84619","start","800");
 }else if(c.sch==="continuity"){
  s+=meter(120,yM,"Ω",P.red)+line(133,yM,270,yM,P.ink,2.2)+rect(270,yM-11,120,22,"#fef9c3",P.gold,5,1.4)+
   text(330,yM+3,"BRIDGE e11↔f11",8,"#854d0e","middle","800")+line(390,yM,480,yM,P.ink,2.2)+
   zH(480,620,yM,"R_trace "+R0)+line(620,yM,690,yM,P.ink,2.2)+gnd(690,yM);
 }else if(c.sch==="ammeter"){
  s+=miniBat(115,yT,yB,V0)+line(115,yT,250,yT,P.ink,2.2)+meter(263,yT,"A",P.gold)+text(263,yT-15,"SERIES",7.2,P.gold,"middle","800")+
   line(276,yT,440,yT,P.ink,2.2)+zH(440,580,yT,"R_load "+R0)+line(580,yT,670,yT,P.ink,2.2)+
   line(670,yT,670,yB,P.ink,2.2)+line(115,yB,670,yB,P.ink,2.2)+gnd(670,yB)+
   arrow(315,yT-9,385,yT-9,P.pink,1.8)+text(350,yT-14,"I = "+I0,8,P.pink,"middle","700");
 }else if(c.sch==="voltmeter"){
  s+=miniBat(120,yT,yB,V0)+line(120,yT,380,yT,P.ink,2.2)+dot(380,yT,P.blue,4)+
   zV(380,yT+4,yB-4,"R "+R0)+line(120,yB,580,yB,P.ink,2.2)+dot(380,yB,P.ink,4)+
   line(380,yT,540,yT,P.blue,2)+line(380,yB,540,yB,P.ink,2)+line(540,yT,540,yM-13,P.blue,2)+
   meter(540,yM,"V",P.blue)+line(540,yM+13,540,yB,P.ink,2)+text(566,yM+3,"IN PARALLEL",8.5,P.blue,"start","700")+gnd(580,yB);
 }else if(c.sch==="series-2"||c.sch==="series-3"){
  s+=text(78,yM-11,V0,8.8,P.red,"middle","800")+dot(78,yM,P.red,4)+line(78,yM,140,yM,P.ink,2.2)+
   zH(140,260,yM,"R1 "+R0)+line(260,yM,320,yM,P.ink,2.2)+dot(290,yM,P.blue,4)+text(290,yM+14,"TP1",7.8,P.blue,"middle","700")+
   zH(320,440,yM,"R2 "+R1)+line(440,yM,500,yM,P.ink,2.2);
  if(c.sch==="series-3")s+=zH(500,620,yM,"R3 "+R2)+line(620,yM,700,yM,P.ink,2.2)+gnd(700,yM);
  else s+=line(500,yM,660,yM,P.ink,2.2)+gnd(660,yM);
 }else if(c.sch==="divider"||c.sch==="loaded-divider"){
  s+=text(95,yT+4,V0,9,P.red,"middle","800")+dot(120,yT,P.red,4)+line(120,yT,280,yT,P.ink,2.2)+
   zH(280,410,yT,"R1 "+R0)+line(410,yT,460,yT,P.ink,2.2)+dot(460,yT,P.blue,4.5)+text(460,yT-9,"Vout (A0)",8.2,P.blue,"middle","800")+
   zV(460,yT+4,yB-4,"R2 "+R1)+line(460,yB-4,460,yB,P.ink,2.2)+line(120,yB,680,yB,P.ink,2.2)+gnd(680,yB);
  if(c.sch==="loaded-divider")s+=line(460,yT,600,yT,P.blue,2)+dot(600,yT,P.blue,4)+zV(600,yT+4,yB-4,"RL "+R2)+line(600,yB-4,600,yB,P.ink,2)+text(685,yM,"RL PARALLEL",8,P.teal,"start","700");
 }else if(c.sch==="parallel"||c.sch==="cap-parallel"||c.sch==="can"){
  s+=text(105,yT+4,c.sch==="can"?"CAN_H":"Node A",8.8,P.blue,"middle","800")+line(130,yT,680,yT,P.blue,2.6)+
   text(105,yB+5,c.sch==="can"?"CAN_L":"Node B / GND",8.8,P.teal,"middle","800")+line(130,yB,680,yB,P.teal,2.6);
  const bx=c.comps.length>=3?[250,410,570]:[290,510];
  c.comps.forEach((o,i)=>{
   const x=bx[i]||510;
   s+=dot(x,yT,P.blue,4)+dot(x,yB,P.teal,4);
   if(o.kind==="C")s+=line(x,yT,x,yM-4,P.ink,2.2)+line(x-12,yM-4,x+12,yM-4,P.ink,2.8)+line(x-12,yM+4,x+12,yM+4,P.ink,2.8)+line(x,yM+4,x,yB,P.ink,2.2)+text(x+16,yM+3,o.label+" "+o.val,8.2,P.navy,"start","700");
   else s+=zV(x,yT+4,yB-4,o.label+" "+o.val);
  });
  s+=arrow(155,yT-9,220,yT-9,P.pink,1.8)+text(188,yT-13,c.sch==="can"?"60 Ω eq":"Split I",7.8,P.pink,"middle","700");
 }else if(c.sch==="kcl"){
  s+=text(80,yM-11,"I_in",8.8,P.red,"middle","800")+line(80,yM,210,yM,P.ink,2.2)+zH(210,330,yM,"Rin "+R0)+line(330,yM,405,yM,P.ink,2.2)+
   dot(405,yM,P.blue,5)+text(405,yM-11,"NODE X (Row 13)",8.2,P.blue,"middle","800")+
   line(405,yM,465,yT,P.ink,2)+zH(465,585,yT,"R1 "+R1)+line(585,yT,670,yT,P.ink,2)+
   line(405,yM,465,yB,P.ink,2)+zH(465,585,yB,"R2 "+R2)+line(585,yB,670,yB,P.ink,2)+line(670,yT,670,yB,P.ink,2.2)+gnd(670,yB);
 }else if(c.sch==="kvl-mesh"){
  s+=miniBat(100,yT,yB,V0)+line(100,yT,190,yT,P.ink,2.2)+zH(190,320,yT,"R1 "+R0)+line(320,yT,620,yT,P.ink,2.2)+
   zV(380,yT+4,yB-4,"Rm (Shared)")+line(380,yT,380,yT+4,P.ink,2)+line(380,yB-4,380,yB,P.ink,2)+
   zV(620,yT+4,yB-4,"R3 "+R2)+line(100,yB,680,yB,P.ink,2.2)+gnd(680,yB)+
   rect(210,yM-10,74,18,"#fdf2f8",P.pink,8,1.2)+text(247,yM+2,"LOOP 1: ΣV=0",7.2,P.pink,"middle","800")+
   rect(470,yM-10,74,18,"#eff6ff",P.blue,8,1.2)+text(507,yM+2,"LOOP 2: ΣV=0",7.2,P.blue,"middle","800");
 }else if(c.sch==="thevenin"||c.sch==="norton"){
  s+=path("M95 349 L395 349 L395 415 L95 415 Z",P.blue,1.4,"#f8fafc","5 4")+
   text(108,361,c.sch==="norton"?"NORTON SOURCE":"THEVENIN EQUIVALENT",7.8,P.blue,"start","800")+
   miniBat(140,yT+10,yB,"Vth")+line(140,yT+10,210,yT+10,P.ink,2.2)+zH(210,340,yT+10,"Rth / Rn")+line(340,yT+10,490,yT+10,P.ink,2.2)+
   dot(435,yT+10,P.blue,4)+text(435,yT,"Port A",8,P.blue,"middle","700")+
   zV(490,yT+14,yB-4,"RL "+R2)+line(490,yT+10,490,yT+14,P.ink,2)+line(490,yB-4,490,yB,P.ink,2)+
   line(140,yB,580,yB,P.ink,2.2)+dot(435,yB,P.ink,4)+text(435,yB+13,"Port B",8,P.ink,"middle","700")+gnd(580,yB);
 }else if(c.sch==="ac-sine"||c.sch==="rc-lpf"||c.sch==="rc-hpf"||c.sch==="probe-load"){
  s+=rect(80,yM-15,30,30,"#fff",P.pink,15,2)+path("M85 "+yM+" Q90 "+(yM-9)+" 95 "+yM+" T105 "+yM,P.pink,2)+text(95,yM+25,"AC "+F0,7.8,P.pink,"middle","700")+
   line(110,yM,220,yM,P.ink,2.2);
  if(c.sch==="rc-hpf")s+=capH(220,340,yM,"C "+C0)+line(340,yM,460,yM,P.ink,2.2)+dot(460,yM,P.gold,4)+zV(460,yM+4,yB,"R "+R0)+line(460,yB,620,yB,P.ink,2.2)+gnd(620,yB);
  else if(c.sch==="ac-sine")s+=zH(220,380,yM,"R "+R0)+line(380,yM,560,yM,P.ink,2.2)+meter(573,yM,"CH1",P.blue);
  else s+=zH(220,350,yM,"R "+R0)+line(350,yM,460,yM,P.ink,2.2)+dot(460,yM,P.gold,4)+text(460,yM-10,"Vc / Vout",8.2,P.gold,"middle","700")+
   line(460,yM,460,yM+6,P.ink,2.2)+line(447,yM+6,473,yM+6,P.ink,2.6)+line(447,yM+13,473,yM+13,P.ink,2.6)+line(460,yM+13,460,yB,P.ink,2.2)+text(480,yM+12,"C "+C0,8,P.navy,"start","700")+
   (c.sch==="probe-load"?line(460,yM,610,yM,P.gold,1.8)+zV(610,yM+4,yB,"10MΩ Probe")+line(460,yB,690,yB,P.ink,2)+gnd(690,yB):line(460,yB,620,yB,P.ink,2)+gnd(620,yB));
 }else if(c.sch==="rl-series"||c.sch==="flyback"||c.sch==="rlc"){
  s+=text(80,yM-11,V0,8.8,P.red,"middle","800")+line(80,yM,180,yM,P.ink,2.2)+indH(180,310,yM,"L "+L0)+line(310,yM,400,yM,P.ink,2.2);
  if(c.sch==="flyback")s+=diodeH(180,310,yT-3,"D_fly Clamp",false)+line(180,yM,180,yT-3,P.ink,1.6)+line(310,yM,310,yT-3,P.ink,1.6)+zH(400,530,yM,"Q1 SW")+line(530,yM,640,yM,P.ink,2.2)+gnd(640,yM);
  else if(c.sch==="rlc")s+=capH(400,500,yM,"C "+C0)+line(500,yM,550,yM,P.ink,2.2)+zH(550,670,yM,"R "+R0)+line(670,yM,730,yM,P.ink,2.2)+gnd(730,yM);
  else s+=zH(400,540,yM,"R "+R0)+line(540,yM,660,yM,P.ink,2.2)+gnd(660,yM);
 }else if(c.sch==="transformer"){
  s+=text(105,yM-11,"AC PRI",8.8,P.red,"middle","800")+indH(150,310,yM,"Np Primary")+
   line(355,352,355,412,P.teal,2.8)+line(367,352,367,412,P.teal,2.8)+text(361,346,"CORE (TRENCH)",7.2,P.teal,"middle","800")+
   indH(410,560,yM,"Ns Secondary")+line(560,yM,620,yM,P.ink,2.2)+zH(620,730,yM,"Rsec "+R0)+line(730,yM,770,yM,P.ink,2.2)+gnd(770,yM);
 }else if(c.sch==="three-phase"){
  const cx=390,cy=384;
  s+=dot(cx,cy,"#1e293b",4.5)+text(cx+10,cy+13,"Neutral (0V)",8,P.ink,"start","800")+
   line(cx,cy,cx-140,cy-20,P.red,2.4)+text(cx-150,cy-20,"ØA (0°)",8.8,P.red,"end","800")+
   line(cx,cy,cx+130,cy-20,P.gold,2.4)+text(cx+140,cy-20,"ØB (120°)",8.8,P.gold,"start","800")+
   line(cx,cy,cx,cy+25,P.blue,2.4)+text(cx-10,cy+27,"ØC (240°)",8.8,P.blue,"end","800");
 }else if(c.sch==="logic-gates"){
  const gate=logicGateForQuestion(q),inv=/NAND|NOR|XNOR/.test(gate),isOr=/OR|XOR/.test(gate);
  const gatePath=isOr?'M218 355 Q254 381 218 407 Q263 396 304 381 Q263 366 218 355 Z':'M218 355 H258 A36 26 0 0 1 258 407 H218 Z';
  const gatePin=isOr?304:294;
  const extraCurve=(gate==="XOR"||gate==="XNOR")?'<path d="M208 355 Q244 381 208 407" fill="none" stroke="'+P.ink+'" stroke-width="2.4"/>':'';
  const bubble=inv?'<circle cx="'+gatePin+'" cy="381" r="5" fill="#fff" stroke="'+P.ink+'" stroke-width="2"/>':'';
  const ox=inv?gatePin+7:gatePin;
  s+=line(120,yT,218,yT,P.blue,2.5)+line(120,yB,218,yB,P.gold,2.5)+
   text(108,yT-4,"A",8.5,P.blue,"middle","800")+text(108,yB+10,"B",8.5,P.gold,"middle","800")+
   extraCurve+'<path d="'+gatePath+'" fill="#f7fbff" stroke="'+P.ink+'" stroke-width="2.4"/>'+bubble+
   text(262,349,"U1 · "+clipLabel(c.comps.find(o=>o.kind==="IC")?.val||"74HC gate",16)+" · VCC pin 14",7.2,P.red,"middle","700")+
   line(ox,yM,390,yM,P.teal,2.5)+dot(390,yM,P.teal,4.5)+text(390,yM-10,"Y = "+gate,8.3,P.teal,"middle","800")+
   zH(410,505,yM,"1 kΩ")+line(505,yM,548,yM,P.ink,2)+diodeH(548,645,yM,"LED",true)+line(645,yM,690,yM,P.ink,2)+gnd(690,yM)+
   text(462,yT-3,"Rlim",7.5,P.navy,"middle","700")+text(262,419,"GND pin 7",7.2,P.ink,"middle","700")+
   text(390,430,"Walk 00, 01, 10, 11; verify the complete "+gate+" truth table",8.2,P.muted,"middle","600");
 }else if(c.sch==="led-diode"){
  s+=text(95,yM-11,V0,8.8,P.red,"middle","800")+line(95,yM,180,yM,P.ink,2.2)+zH(180,330,yM,"Rlim "+R0)+
   line(330,yM,390,yM,P.ink,2.2)+diodeH(390,540,yM,"LED / D1 (Vf)",true)+line(540,yM,670,yM,P.ink,2.2)+gnd(670,yM);
 }else if(c.sch==="mosfet"){
  s+=text(80,yM+3,"PWM",8.8,P.blue,"middle","800")+line(105,yM,170,yM,P.blue,2.2)+zH(170,290,yM,"Rg 100Ω")+
   dot(320,yM,P.ink,4)+line(320,yM,320,yB,P.ink,1.8)+text(308,yB-6,"Rpd 10k",7.5,P.muted,"end","700")+
   rect(370,yM-15,72,30,"#e8f3fb",P.navy,6,1.6)+text(406,yM+3,"Q1 N-MOS",8.5,P.navy,"middle","800")+
   line(320,yM,370,yM,P.blue,2.2)+line(442,yM,510,yM,P.gold,2.2)+zH(510,640,yM,"RL "+R0)+text(660,yM+3,"+12V",8.8,P.red,"start","800")+gnd(320,yB);
 }else if(c.sch==="power-tree"||c.sch==="rail-seq"||c.sch==="ripple"||c.sch==="open-drain"){
  s+=text(78,yM-11,V0,8.8,P.red,"middle","800")+line(78,yM,190,yM,P.ink,2.2)+
   rect(190,yM-15,134,30,"#e8f3fb",P.navy,6,1.6)+text(257,yM+3,c.sch==="open-drain"?"OPEN-DRAIN DUT":c.sch==="rail-seq"?"EN → SEQ / REG":"BUCK / LDO REG",8.5,P.navy,"middle","800")+
   line(324,yM,440,yM,P.ink,2.2)+dot(440,yM,P.blue,4.5)+text(440,yM-11,"VOUT / TP",8.2,P.blue,"middle","800")+
   zH(440,580,yM,"Load / Rpu "+R0)+line(580,yM,680,yM,P.ink,2.2)+gnd(680,yM);
 }else if(c.sch==="kelvin"){
  s+=text(74,yM-11,"I_BUS",8.8,P.red,"middle","800")+line(74,yM,210,yM,P.ink,2.6)+zH(210,360,yM,"Rshunt "+R0)+line(360,yM,530,yM,P.ink,2.6)+
   dot(230,yM,P.blue,4)+dot(340,yM,P.teal,4)+path("M230 "+yM+" L230 "+(yT-2)+" L420 "+(yT-2)+" L420 "+(yM-13),P.blue,1.7)+
   path("M340 "+yM+" L340 "+(yT+4)+" L450 "+(yT+4)+" L450 "+(yM-13),P.teal,1.7)+meter(435,yM-18,"INA",P.blue)+
   zH(530,660,yM,"Load "+R1)+line(660,yM,710,yM,P.ink,2.2)+gnd(710,yM);
 }else if(c.sch==="i2c"){
  s+=text(95,yT,"3V3",8.8,P.red,"middle","800")+line(95,yT+4,660,yT+4,P.red,2)+
   rect(140,yM-14,105,32,"#f1f5f9",P.ink,5,1.4)+text(192,yM+5,"MCU I²C",8.5,P.navy,"middle","800")+
   line(245,yM-4,560,yM-4,P.blue,2.2)+text(390,yM-9,"SDA (Row 12 + Rpu1)",7.5,P.blue,"middle","700")+
   line(245,yM+11,560,yM+11,P.gold,2.2)+text(390,yM+21,"SCL (Row 14 + Rpu2)",7.5,P.gold,"middle","700")+
   rect(560,yM-14,105,32,"#e8f3fb",P.blue,5,1.4)+text(612,yM+5,"SENSOR DUT",8.5,P.navy,"middle","800");
 }else if(c.sch==="spi"){
  s+=rect(100,yT,110,46,"#f1f5f9",P.ink,5,1.4)+text(155,yM+3,"HOST SPI",8.8,P.navy,"middle","800")+
   rect(560,yT,110,46,"#e8f3fb",P.blue,5,1.4)+text(615,yM+3,"SPI FLASH",8.8,P.navy,"middle","800")+
   line(210,yT+6,560,yT+6,P.blue,2)+text(385,yT+3,"MOSI (Row 11)",7.5,P.blue,"middle","700")+
   line(210,yT+19,560,yT+19,P.teal,2)+text(385,yT+16,"MISO (Row 12)",7.5,P.teal,"middle","700")+
   line(210,yT+32,560,yT+32,P.gold,2)+text(385,yT+29,"SCLK (Row 13)",7.5,P.gold,"middle","700")+
   line(210,yT+44,560,yT+44,"#7c3aed",2)+text(385,yT+54,"CS_N (Row 14)",7.5,"#7c3aed","middle","700");
 }else if(c.sch==="uart"){
  s+=rect(110,yT,120,46,"#f1f5f9",P.ink,5,1.4)+text(170,yM+3,"HOST UART",8.8,P.navy,"middle","800")+
   rect(540,yT,120,46,"#e8f3fb",P.blue,5,1.4)+text(600,yM+3,"TARGET / LOOP",8.8,P.navy,"middle","800")+
   line(230,yT+10,540,yT+10,P.blue,2.2)+text(385,yT+6,"TX → RX (Crossover)",7.8,P.blue,"middle","700")+
   line(230,yT+27,540,yT+27,P.teal,2.2)+text(385,yT+23,"RX ← TX (8N1)",7.8,P.teal,"middle","700")+
   line(230,yT+41,540,yT+41,"#1e293b",2)+text(385,yT+52,"COMMON GND",7.5,P.muted,"middle","700");
 }else{
  const b1=c.hwTitle.split(" ")[0],b2=c.key==="rf-50ohm"?"50 Ω PI-PAD":c.key==="tvac-env"?"HERMETIC WALL":c.key==="aba-swap"?"SLOT A vs KGB":"DUT FIXTURE";
  s+=rect(80,yT+2,150,40,"#f1f5f9",P.navy,6,1.4)+text(155,yM+3,clipLabel(b1,16),8.8,P.navy,"middle","800")+
   arrow(230,yM,345,yM,P.blue,2.2)+text(288,yM-8,clipLabel(c.pins[0].p,12),7.8,P.blue,"middle","700")+
   rect(345,yT+2,175,40,"#e8f3fb",P.blue,6,1.6)+text(432,yM+3,b2,8.8,P.navy,"middle","800")+
   arrow(520,yM,630,yM,P.teal,2.2)+text(575,yM-8,"SENSE / TLM",7.8,P.teal,"middle","700")+
   rect(630,yT+2,150,40,"#f0fdf4",P.teal,6,1.4)+text(705,yM+3,clipLabel(c.hwBadge,16),8.8,P.teal,"middle","800");
 }

 s+=text(430,439,clipLabel(c.title+" · Physical row map & circuit diagram auto-update for every question",92),8.5,P.muted,"middle","500");
 return svg(s,"Question-specific "+c.title+" with matched hardware ports, unobstructed 10-column solderless breadboard, build guide, and ANSI/IEEE schematic for "+q.id,860,460);
}

function focusInfo(q,t){
 const match=q.id.match(/-([FADC])(\d+)$/);
 if(!match)return t.skills[0]||["Basic electrical principle","","",""];
 const n=Number(match[2])-1;
 const idx=match[1]==="D"?Math.floor(n/2):match[1]==="F"||match[1]==="A"?n:Math.min(4,1+Math.floor(n/5));
 return t.skills[idx]||t.skills[0];
}

function render(q,t,mode){
 const m=describe(q,t);
 const views={schematic:schematic,concept:curve,wiring:threePanelBoardAndBreadboard};
 if(!views[mode])return "";
 const figure=views[mode](q,t);
 const label=mode==="schematic"?"Full circuit schematic / signal path":mode==="concept"?"Operating-point graph / waveform":m.wiring;
 const focus=focusInfo(q,t),check=q.level==="Troubleshooting"?"Recommended verification: "+(q.steps[q.steps.length-1]||"Verify the issue before changing the hardware."):(focus[3]||"");
 const detail=m.values.length?"Given in question: "+m.values.join(" · "):"Conceptual example; labels represent this exact question's topic.";
 const warning=mode==="wiring"?"Question-specific conceptual bench layout; board header names and wiring colors are illustrative, not a manufacturer-approved flight pinout. Verify the actual board documentation, power-off connections, and component ratings.":mode==="concept"?"Illustrative graph centered on this question's parameters; not measured telemetry.":"Circuit symbols and magenta current loops follow standard textbook conventions.";
 return '<figure class="av-visual-figure" data-visual-question="'+esc(q.id)+'" data-visual-mode="'+esc(mode)+'">'+
 '<div class="av-visual-top"><strong>'+esc(label)+'</strong><span>Question '+esc(q.id)+' · '+esc(q.level)+'</span></div>'+
 figure+'<div class="av-visual-question-line"><strong>Question:</strong> '+esc(q.question)+'</div><div class="av-visual-focus"><strong>Focus: '+esc(focus[0])+'.</strong> '+esc(focus[1]||'')+' <em>'+esc(check)+'</em></div><figcaption>'+esc(detail)+'. '+esc(warning)+'</figcaption></figure>';
}
window.avionicsVisuals={render,describe,hasBreadboard:(q,t)=>describe(q,t).board,viewTypes:()=>["schematic","concept","wiring"]};
})();
