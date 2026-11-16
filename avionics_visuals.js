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

/* ---------- 3. 3-PANEL BOARD + SOLDERLESS BREADBOARD + CIRCUIT SYMBOLS (User Attachments Style) ---------- */
function bandColorsFor(resText){
 if(/4\.7\s*M/i.test(resText))return ["#d4af37","#7c3aed","#16a34a"];
 if(/330/.test(resText))return ["#ea580c","#ea580c","#78350f"];
 if(/2\.2\s*k|2200/.test(resText))return ["#dc2626","#dc2626","#dc2626"];
 if(/4\.7\s*k|4700/.test(resText))return ["#ca8a04","#7c3aed","#dc2626"];
 return ["#78350f","#111827","#dc2626"]; // 1 kΩ brown-black-red
}

function threePanelBoardAndBreadboard(q,t){
 const id=t.id,rs=resistance(q),vSrc=source(q);
 const isPar=id==="parallel",isSeries=id==="series"||id==="thevenin",isReactive=["rc","capacitors","inductors","filters"].includes(id);
 const isBusOrInst=["buses","instruments","schematics","power-rails","timing","components","linux","python-scpi","rf","qualification","ac","magnetics"].includes(id);
 const vNum=parseFloat(vSrc);
 const vLabel=(Number.isFinite(vNum)&&vNum>0&&vNum<=12)?vSrc:"3.3 V";
 const r1Lab=rs[0]||(id==="ohm"?"330 Ω":"1 kΩ"),r2Lab=rs[1]||"1 kΩ";

 let s="";
 // Title bar matching user attachment
 s+=text(22,28,"BENCH & BREADBOARD WIRING ("+q.id.toUpperCase()+"): "+units[id],15,P.ink,"start","800");
 s+=text(22,46,"Verify power-off connections and voltage limits before connecting USB/bench supply.",12,"#a84619","start","600");

 // PANEL 1 (Left): 1 NUCLEO / AVIONICS DUT BOARD
 s+=rect(20,58,282,250,"#ffffff","#d0dfe9",10,1.4);
 s+=text(34,79,"1 AVIONICS / NUCLEO DUT BOARD",13,P.ink,"start","800");
 s+=text(34,94,"Illustrated top view · Pin names depend on board",10,P.muted);
 // PCB outline
 s+=rect(38,108,215,186,"#f6f8fa","#c7d3dc",8,1.5);
 // USB port at top
 s+=rect(128,100,28,18,"#c5d2de","#7c91a3",3)+text(162,113,"USB / Host",9,"#a84619","start","700");
 s+=text(168,132,"ST-LINK / DBG",10,P.navy,"start","700")+rect(175,137,26,22,"#222c36","#111",3);
 // Buttons
 s+=dot(178,182,"#1d63eb",8)+text(178,198,"USER",8,P.muted,"middle");
 s+=dot(214,182,"#111827",6)+text(214,198,"RST",8,P.muted,"middle");
 // MCU chip
 s+=rect(164,218,52,44,"#222b33","#111",4)+text(190,238,"STM32",9,"#fff","middle","700")+text(190,251,"FLIGHT",8,"#cfe4f2","middle");

 // CN6 Power Header + CN8 Signal Header
 const pwrPins=["NC","3V3","5V","GND","VIN"];
 const sigPins=id==="buses"?(/SPI/i.test(q.question)?["MOSI","MISO","SCLK","CS_N"]:/CAN/i.test(q.question)?["CAN_H","CAN_L","GND","5V"]:/I2C/i.test(q.question)?["SDA","SCL","3V3","GND"]:["TX","RX","GND","3V3"]):["A0","A1","TP_V","CLK"];
 s+=text(48,125,"CN6 power",9,P.ink,"start","700");
 s+=rect(78,130,18,74,"#1c252d","#111",3);
 pwrPins.forEach((p,i)=>{
  const py=140+i*13;
  s+=text(74,py+3,p,9,P.muted,"end")+dot(87,py,"#4a5b6a",3.5);
 });
 s+=text(48,220,id==="buses"?"Bus Header":"CN8 signal",9,P.ink,"start","700");
 s+=rect(78,225,18,62,"#1c252d","#111",3);
 sigPins.forEach((p,i)=>{
  const py=235+i*13;
  s+=text(74,py+3,p,9,P.muted,"end")+dot(87,py,"#4a5b6a",3.5);
 });

 // PANEL 2 (Right): 2 SOLDERLESS BREADBOARD (Exact a-e | f-j, rows 9-17)
 s+=rect(322,58,478,250,"#ffffff","#d0dfe9",10,1.4);
 s+=text(336,79,"2 Solderless breadboard (a–e | f–j · rows 9–17)",13,P.ink,"start","800");
 s+=text(336,94,isSeries?"Series path: a10↔a13, a13↔a16":isPar?"Parallel branches: a10↔a15 & d10↔d15":"Resistor: a10 ↔ a15 · Jumpers: b10 and b15",10,P.muted);

 s+=rect(336,104,450,174,"#efefe6","#d4d8cc",10,1.2);
 const colsL=["a","b","c","d","e"],colsR=["f","g","h","i","j"];
 const xsL=[376,412,448,484,520],xsR=[592,628,664,700,736];
 colsL.forEach((c,i)=>s+=text(xsL[i],120,c,11,P.ink,"middle","700"));
 colsR.forEach((c,i)=>s+=text(xsR[i],120,c,11,P.ink,"middle","700"));
 s+=rect(546,124,20,145,"#deded4","none",4); // center trench

 const ys={};
 for(let r=9;r<=17;r++){
  const y=134+(r-9)*16.5;
  ys[r]=y;
  const hi=(r===10||r===15||(isSeries&&r===13)||(isReactive&&r===13));
  s+=rect(362,y-6,172,13,hi?"#d9ebfc":"#f7f7f2",hi?"#9ec6eb":"none",6,1);
  s+=rect(578,y-6,172,13,"#f7f7f2","none",6,1);
  s+=text(350,y+4,String(r),10,hi?P.navy:P.muted,"middle",hi?"700":"500");
  xsL.forEach(x=>s+=dot(x,y,"#475b6d",2.7));
  xsR.forEach(x=>s+=dot(x,y,"#475b6d",2.7));
 }

 // Draw realistic axial resistor(s) on breadboard
 function drawBBResistor(x,yTop,yBot,rTxt){
  const mid=(yTop+yBot)/2,bc=bandColorsFor(rTxt);
  s+=path("M"+x+" "+yTop+" Q"+(x+9)+" "+(yTop+10)+" "+x+" "+(mid-15), "#7a828c",2);
  s+=path("M"+x+" "+(mid+15)+" Q"+(x+9)+" "+(yBot-10)+" "+x+" "+yBot, "#7a828c",2);
  s+=rect(x-7,mid-15,14,30,"#dfc08b","#9e7238",5,1.2);
  s+=line(x-7,mid-7,x+7,mid-7,bc[0],3)+line(x-7,mid-1,x+7,mid-1,bc[1],3)+line(x-7,mid+5,x+7,mid+5,bc[2],3);
 }

 const y10=ys[10],y13=ys[13],y15=ys[15],y16=ys[16];
 if(isSeries){
  drawBBResistor(xsL[0],y10,y13,r1Lab);
  drawBBResistor(xsL[0],y13,y16,r2Lab);
 }else if(isReactive){
  drawBBResistor(xsL[0],y10,y13,r1Lab);
  s+=line(xsL[0],y13,xsL[0],y13+10,"#7a828c",2)+rect(xsL[0]-10,y13+10,20,16,"#d7ecf7","#4e89a8",3)+text(xsL[0],y13+22,id==="inductors"?"L":"C",10,P.navy,"middle","700")+line(xsL[0],y13+26,xsL[0],y16,"#7a828c",2);
 }else{
  drawBBResistor(xsL[0],y10,y15,r1Lab);
  if(isPar)drawBBResistor(xsL[3],y10,y15,r2Lab);
 }

 // Jumper wires connecting Panel 1 -> Panel 2 exact holes!
 // Black wire: GND (CN6 pin 4, y=179) -> b10 (xsL[1], y10)
 s+=dot(87,179,"#111827",4.5)+path("M87 179 C170 179, 260 198, 295 162 C318 138, 370 150, "+xsL[1]+" "+y10, "#1c2630",3.2)+dot(xsL[1],y10,"#1c2630",4);
 // Active wire (Blue/Red): CN8 A0/Sig (y=235) or 3V3 -> b15 (or b16 for series/RC)
 const targetBottomY=(isSeries||isReactive)?y16:y15;
 const activePinY=isBusOrInst?235:153; // 3V3 or A0
 s+=dot(87,activePinY,"#1e63e9",4.5)+path("M87 "+activePinY+" C180 "+activePinY+", 245 258, 315 245 C365 236, 385 "+targetBottomY+", "+xsL[1]+" "+targetBottomY, "#1e63e9",3.2)+dot(xsL[1],targetBottomY,"#1e63e9",4);

 // Floating callout card inside f-j area (exactly like user's attachment!)
 s+=rect(584,140,186,92,"#ffffff","#d5e2eb",8,1.2);
 s+=text(596,162,r1Lab+(isPar?" & "+r2Lab:""),14,P.ink,"start","800");
 s+=text(596,179,isSeries?"R₁: a10↔a13 · R₂: a13↔a16":isPar?"R₁: a10↔a15 · R₂: d10↔d15":"Component: a10 → a15",11,P.ink);
 s+=text(596,197,"Black jumper: GND → b10",11,"#1c2630","start","700");
 s+=text(596,214,"Blue jumper: "+(isBusOrInst?sigPins[0]:vLabel)+" → b"+((isSeries||isReactive)?"16":"15"),11,"#1e63e9","start","700");
 s+=text(336,295,"Row 10 and row 15 are separate. Holes a–e connect horizontally; center gap breaks f–j.",10,P.muted);

 // Wire labels between panels
 s+=rect(248,142,84,32,"#ffffffe8","#d5e2eb",5)+text(290,156,"Black wire",10,"#1c2630","middle","700")+text(290,169,"GND → b10",9,P.muted,"middle");
 s+=rect(248,252,84,32,"#ffffffe8","#d5e2eb",5)+text(290,266,"Blue wire",10,"#1e63e9","middle","700")+text(290,279,"Sig → b"+((isSeries||isReactive)?"16":"15"),9,P.muted,"middle");

 // PANEL 3 (Bottom Full-Width): 3 SAME CONNECTION, SHOWN WITH CIRCUIT SYMBOLS
 s+=rect(20,320,780,108,"#ffffff","#d0dfe9",10,1.4);
 s+=text(36,342,"3 Same connection, shown with circuit symbols",13,P.ink,"start","800");
 s+=text(95,368,"Board GND",11,P.ink,"middle","700")+groundSym(95,375);
 s+=line(95,380,320,380,P.ink,2.4);
 if(isSeries){
  s+=zigH(335,415,380,r1Lab)+line(429,380,455,380,P.ink,2.4)+zigH(469,549,380,r2Lab)+line(563,380,685,380,P.ink,2.4);
 }else if(isReactive){
  s+=zigH(335,415,380,r1Lab)+line(429,380,505,380,P.ink,2.4)+line(505,365,505,395,P.ink,3.5)+line(518,365,518,395,P.ink,3.5)+line(518,380,685,380,P.ink,2.4);
 }else{
  s+=zigH(335,445,380,r1Lab)+line(459,380,685,380,P.ink,2.4);
 }
 s+=dot(685,380,"#1e63e9",5.5)+text(685,365,"Board "+(isBusOrInst?sigPins[0]:vLabel)+" / Probe",11,"#1e63e9","middle","700");
 s+=text(390,414,"Physical holes a10–e10 (GND) and a15–e15 (Active node) match the exact circuit nodes above.",10,"#a84619","middle","600");

 return svg(s,"Three-panel board, solderless breadboard, and circuit symbol diagram for "+q.id,820,440);
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
 const warning=mode==="wiring"?"Generic teaching illustration showing physical breadboard rows, board header wiring, and circuit symbols side by side — NOT a manufacturer-approved flight pinout. Always verify power-off connections and voltage ratings.":mode==="concept"?"Illustrative graph centered on this question's parameters; not measured telemetry.":"Circuit symbols and magenta current loops follow standard textbook conventions.";
 return '<figure class="av-visual-figure" data-visual-question="'+esc(q.id)+'" data-visual-mode="'+esc(mode)+'">'+
 '<div class="av-visual-top"><strong>'+esc(label)+'</strong><span>Question '+esc(q.id)+' · '+esc(q.level)+'</span></div>'+
 figure+'<div class="av-visual-question-line"><strong>Question:</strong> '+esc(q.question)+'</div><div class="av-visual-focus"><strong>Focus: '+esc(focus[0])+'.</strong> '+esc(focus[1]||'')+' <em>'+esc(check)+'</em></div><figcaption>'+esc(detail)+'. '+esc(warning)+'</figcaption></figure>';
}
window.avionicsVisuals={render,describe,hasBreadboard:(q,t)=>describe(q,t).board,viewTypes:()=>["schematic","concept","wiring"]};
})();
