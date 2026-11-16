"use strict";
/* Original full-board low-voltage training diagrams. Pin labels from ST UM1724
   Table 23 (Arduino) and Table 32 (Morpho), NUCLEO-L476RG only.
   830-point single-module teaching layout; NOT the Makeronics 3220-point footprint. */
(function(){
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const C={red:"#e0444b",blue:"#1683d0",black:"#283747",green:"#0e9264",gold:"#d99a20",pink:"#db389a",violet:"#8a57bf"};
const pin={
 "3V3":["CN6 pin 16","+3V3"],"GND":["CN6 pin 20","GND"],
 "PA0":["CN6 pin 28","A0 / ADC"],"PA5":["CN10 pin 11","D13 / LD2"],
 "PB5":["CN10 pin 29","D4 / GPIO"],"PB4":["CN10 pin 27","D5 / PWM"],
 "PB9":["CN10 pin 5","D14 / SDA"],"PB8":["CN10 pin 3","D15 / SCL"],
 "PA2":["CN10 pin 35","D1 / USART2_TX"],"PA3":["CN10 pin 37","D0 / USART2_RX"],
 "PA7":["CN10 pin 15","D11 / MOSI"],"PA6":["CN10 pin 13","D12 / MISO"],
 "PB6":["CN10 pin 17","D10 / NSS"],"PA5_CLK":["CN10 pin 11","D13 / SCK"]
};
const leftOdd=["PC10","PC12","VDD","BOOT0","NC","NC","PA13","PA14","PA15","GND","PB7","PC13","PC14","PC15","PH0","PH1","VBAT","PC2","PC3"];
const leftEven=["PC11","PD2","E5V","GND","NC","IOREF","RESET","+3V3","+5V","GND","GND","VIN","NC","PA0","PA1","PA4","PB0","PC1","PC0"];
const rightOdd=["PC9","PB8","PB9","AVDD","GND","PA5","PA6","PA7","PB6","PC7","PA9","PA8","PB10","PB4","PB5","PB3","PA10","PA2","PA3"];
const rightEven=["PC8","PC6","PC5","U5V","NC","PA12","PA11","PB12","PB11","GND","PB2","PB1","PB15","PB14","PB13","AGND","PC4","NC","NC"];
const variants={
 "basic":{title:"Measure R with power disconnected",tags:["DMM / Ω","Unpowered circuit"],p:[],parts:[["R1","R","c10","c20","1 kΩ"]],jump:[["a10","d10"],["a20","d20"]],bench:[["RED PROBE","a10"],["BLACK COM","a20"]]},
 "led":{title:"GPIO LED with a series current-limiting resistor",tags:["GPIO output","LED polarity"],p:["PA5","GND"],parts:[["R1","R","c10","c15","330 Ω"],["D1","LED","c15","c24","anode at row 15"]],jump:[],links:[["PA5","a10"],["GND","a24"]]},
 "divider":{title:"PA0 ADC reads a two-resistor voltage divider",tags:["ADC input","3.3 V maximum"],p:["3V3","GND","PA0"],parts:[["R1","R","c10","c17","10 kΩ"],["R2","R","c17","c24","10 kΩ"]],links:[["3V3","a10"],["GND","a24"],["PA0","a17"]],jump:[]},
 "rc":{title:"PA0 RC low-pass filter and oscilloscope probe",tags:["RC step","Input ≤ 3.3 V"],p:["3V3","GND","PA0"],parts:[["R1","R","c10","c17","10 kΩ"],["C1","C","h17","h24","100 nF"]],links:[["3V3","a10"],["PA0","a17"],["GND","a24"]],jump:[["e17","f17"],["e24","f24"]]},
 "parallel":{title:"Three-resistor parallel network, shared nodes A and B",tags:["Parallel branches","Shared voltage"],p:["3V3","GND","PA0"],parts:[["R1","R","c10","c24","1 kΩ"],["R2","R","h10","h24","2.2 kΩ"],["R3","R","j10","j24","4.7 kΩ"]],links:[["3V3","a10"],["GND","a24"],["PA0","b10"]],jump:[["e10","f10"],["e24","f24"]]},
 "button":{title:"External GPIO button with pull-up resistor",tags:["Digital GPIO","Debounce"],p:["3V3","GND","PB5"],parts:[["Rpu","R","c10","c17","10 kΩ"],["SW1","SW","h17","h24","normally open"]],links:[["3V3","a10"],["PB5","a17"],["GND","a24"]],jump:[["e17","f17"],["e24","f24"]]},
 "i2c":{title:"I²C module with separate SDA/SCL pull-ups",tags:["I²C bus","3.3 V logic"],p:["3V3","GND","PB9","PB8"],parts:[["R_SDA","R","b10","b14","4.7 kΩ"],["R_SCL","R","d10","d17","4.7 kΩ"],["U1","MODULE","h10","h24","I²C sensor / OLED"]],links:[["3V3","a10"],["GND","a24"],["PB9","a14"],["PB8","a17"]],jump:[["e10","f10"],["e14","f14"],["e17","f17"],["e24","f24"]],modulePins:[["VCC","f10"],["SDA","f14"],["SCL","f17"],["GND","f24"]]},
 "spi":{title:"3.3 V SPI peripheral with four host signals",tags:["SPI bus","Check CPOL/CPHA"],p:["3V3","GND","PA7","PA6","PB6","PA5_CLK"],parts:[["U1","MODULE","h10","h24","SPI sensor / display"]],links:[["3V3","a10"],["GND","a24"],["PA7","a12"],["PA6","a14"],["PB6","a18"],["PA5_CLK","a20"]],jump:[["e10","f10"],["e12","f12"],["e14","f14"],["e18","f18"],["e20","f20"],["e24","f24"]],modulePins:[["VCC","f10"],["MOSI","f12"],["MISO","f14"],["CS_N","f18"],["SCK","f20"],["GND","f24"]]},
 "uart":{title:"USART2 TX/RX crossover to a 3.3 V peripheral",tags:["UART","Common GND"],p:["3V3","GND","PA2","PA3"],parts:[["U1","MODULE","h10","h24","3.3V UART module"]],links:[["3V3","a10"],["GND","a24"],["PA2","a12"],["PA3","a16"]],jump:[["e10","f10"],["e12","f12"],["e16","f16"],["e24","f24"]],modulePins:[["VCC","f10"],["RX (host TX)","f12"],["TX (host RX)","f16"],["GND","f24"]]},
 "scope":{title:"Observe GPIO waveform with an oscilloscope",tags:["Scope CH1","Short ground"],p:["PA5","GND"],parts:[["R1","R","c10","c24","1 kΩ"]],links:[["PA5","a10"],["GND","a24"]],bench:[["CH1 TIP","b10"],["CH1 GND","b24"]],jump:[]}
};
function choose(q,t){
 // Never imply that an arbitrary numerical 5/9/12/24 V example can be
 // physically driven into a NUCLEO 3.3 V input or power rail.
 if(q.level==="Calculation"){
  const v=String(q.question).match(/\b(\d+(?:\.\d+)?)\s*V\b/g)||[];
  if(v.some(x=>Number.parseFloat(x)>3.3))return null;
 }

 const s=(q.question+" "+(q.skillName||"")).toLowerCase();
 if(["rf","qualification","magnetics","linux","python-scpi","thevenin","ac"].includes(t.id))return null;
 if(t.id==="buses")return /i2c|i²c|sda|scl/.test(s)?"i2c":/spi|mosi|spitime/.test(s)||q.calcFamily==="spiTime"?"spi":"uart";
 if(t.id==="components")return /led|diode|current.limit/.test(s)?"led":/logic|pull|switch|gpio|input/.test(s)?"button":"divider";
 if(t.id==="rc"||t.id==="capacitors"||t.id==="filters")return "rc";
 if(t.id==="parallel"||t.id==="kcl-kvl")return "parallel";
 if(t.id==="timing")return /pwm|pulse|clock|scope/.test(s)?"scope":"button";
 if(t.id==="instruments")return "scope";
 if(t.id==="schematics")return "button";
 if(t.id==="power-rails")return "divider";
 if(t.id==="series"||t.id==="power")return q.calcFamily==="seriesR"?"divider":"divider";
 if(t.id==="units")return "basic";
 if(t.id==="ohm")return q.calcFamily==="ohmI"||q.calcFamily==="ohmR"?"divider":/resist|ohm|dmm|continuity/.test(s)?"basic":"divider";
 return "divider";
}
function setup(q,t){
 const name=choose(q,t);if(!name)return null;
 const src=variants[name],c={...src,parts:src.parts.map(p=>p.slice()),links:(src.links||[]).map(v=>v.slice()),jump:src.jump.map(j=>j.slice()),bench:(src.bench||[]).map(x=>x.slice()),modulePins:(src.modulePins||[]).map(x=>x.slice())};
 const k=(Number((q.id.match(/(\d+)$/)||[])[1])||1);
 // Move entire circuit row groups without altering electrical topology; only
 // routes a complete, connected kit. Never change true board pin assignments.
 const delta=[0,5,9,13][(k-1)%4];const move=hole=>{
   if(!/^[a-j]\d+$/.test(hole))return hole;
   const n=Number(hole.slice(1))+delta;
   return hole[0]+n;
 };

 // Source numbers are used ONLY when the question's circuit family identifies
 // that component. Never confuse a generic sample circuit with a worked value.
 const rs=(q.question.match(/\d+(?:\.\d+)?\s*(?:MΩ|kΩ|Ω)/gi)||[]);
 const cs=(q.question.match(/\d+(?:\.\d+)?\s*(?:µF|uF|nF|pF)/gi)||[]);
 if(q.calcFamily==="seriesR"&&rs.length===3){
   c.title="Three-resistor equivalent resistance · DMM power OFF";
   c.parts=[["R1","R","c10","c15",rs[0]],["R2","R","c15","c20",rs[1]],["R3","R","c20","c24",rs[2]]];
   c.links=[];c.bench=[["DMM +","a10"],["DMM COM","a24"]];c.jump=[];
 }
 if(q.calcFamily==="parallelR"&&rs.length===2){
   c.title="Two resistor branches connected across identical nodes";
   c.parts=[["R1","R","c10","c24",rs[0]],["R2","R","h10","h24",rs[1]]];
   c.links=[];c.bench=[["DMM +","a10"],["DMM COM","a24"]];
   c.jump=[["e10","f10"],["e24","f24"]];
 }
 if(q.calcFamily==="parallelI"&&rs.length){
   c.title="Single branch load across a source (≤3.3 V teaching only)";
   c.parts=[["R1","R","c10","c24",rs[0]]];
   c.jump=[];c.links=[["3V3","a10"],["GND","a24"]];c.bench=[["DMM mA","series gap required"]];
 }
 if(q.calcFamily==="rcTau"&&rs.length&&cs.length){
   c.parts=c.parts.map(p=>p[1]==="R"?[p[0],p[1],p[2],p[3],rs[0]]:p[1]==="C"?[p[0],p[1],p[2],p[3],cs[0]]:p);
 }
 if(q.calcFamily==="divider"&&rs.length>=2){
   c.parts=c.parts.map((p,i)=>p[1]==="R"?[p[0],p[1],p[2],p[3],rs[i]||p[4]]:p);
 }

 c.parts=c.parts.map(p=>[p[0],p[1],move(p[2]),move(p[3]),p[4]]);
 c.links=c.links.map(p=>[p[0],move(p[1])]);
 c.jump=c.jump.map(p=>[move(p[0]),move(p[1])]);
 c.bench=c.bench.map(p=>[p[0],move(p[1])]);
 c.modulePins=c.modulePins.map(p=>[p[0],move(p[1])]);
 c.key=name;c.question=q.id;c.shift=delta;
 c.sourceUrl="https://www.st.com/resource/en/user_manual/dm00105823.pdf";
 return c;
}
const txt=(x,y,s,size=12,color="#243c53",anchor="start",weight=500)=>'<text x="'+x+'" y="'+y+'" font-family="Arial,sans-serif" font-size="'+size+'" fill="'+color+'" text-anchor="'+anchor+'" font-weight="'+weight+'">'+esc(s)+'</text>';
const rect=(x,y,w,h,c="#fff",stroke="#cbd5e1",r=8)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+r+'" fill="'+c+'" stroke="'+stroke+'"/>';
const line=(x,y,X,Y,c="#283747",w=2.2)=>'<line x1="'+x+'" y1="'+y+'" x2="'+X+'" y2="'+Y+'" stroke="'+c+'" stroke-width="'+w+'" stroke-linecap="round"/>';
function point(h){
 if(h==="P+")return [520,104];
 if(h==="P-")return [950,104];
 const m=String(h).match(/^([a-j])(\d+)$/);
 if(!m)return null;
 const col="abcdefghij".indexOf(m[1]),r=Number(m[2]);
 if(r<1||r>63)return null;
 return [col<5?590+col*24:750+(col-5)*24,135+(r-1)*14];
}
function buildSvg(q,t){
 const c=setup(q,t);if(!c)return "";
 let s=rect(10,10,1360,1110,"#fbfdff","#c4d6e1",15);
 s+=txt(30,87,"Selected question: "+q.id.toUpperCase()+" · "+q.level+" · "+String(q.question).slice(0,95),10,"#567589");
 s+=txt(30,43,"FULL BOARD CIRCUIT · "+c.title,23,"#1b4d6c","start",800);
 s+=txt(30,70,"NUCLEO-L476RG · ST UM1724 Rev 17 · 63-row 830-point module (not full 3220-point assembly)",13,"#4d6b7e");
 s+=rect(24,91,418,770,"#eaf2f8","#9cc3d7",10)+txt(48,117,"ST NUCLEO-L476RG · MB1136",19,"#183e5b","start",800);
 s+=rect(156,142,157,644,"#fafafa","#8ca5b8",8)+rect(189,180,91,42,"#d4e4ee","#b6c8d5",5)+txt(234,206,"ST-LINK",13,"#334e64","middle",800)+
 rect(181,294,108,107,"#2c3e50","#172434",6)+txt(236,355,"STM32L476RG",11,"#fff","middle",800)+txt(236,435,"ARDUINO · MORPHO",10,"#2b4a63","middle",700);
 const activePins=new Set(c.p.map(p=>p==="PA5_CLK"?"PA5":p));
 for(let i=0;i<19;i++){
  const y=164+i*30;
  for(const [x,name,num] of [[74,leftOdd[i],i*2+1],[139,leftEven[i],i*2+2],[322,rightOdd[i],i*2+1],[384,rightEven[i],i*2+2]]){
   const selected=activePins.has(name)||(name==="+3V3"&&activePins.has("3V3"));
   s+=rect(x-7,y-10,17,17,selected?"#ee6bb1":"#245d9c","#1c4368",2);
   s+=txt(x+1,y+2,String(num),8,"#fff","middle",700);
   s+=txt(x+(x<150?-10: x>310? (x===322?-12:12):12),y+3,name,9,selected?"#b01972":"#315874",x<150?"end":x===322?"end":"start",selected?800:500);
  }
 }
 s+=txt(40,755,"Connector pins shown as numbered Morpho header contacts.",10,"#506b7f");
 // Entire 830-point single-module teaching breadboard (630 tie points + 200 rail holes).
 s+=rect(474,92,535,970,"#f0eee5","#b6b5a9",13)+txt(480,121,"SOLDERLESS BREADBOARD · FULL 63 ROWS",15,"#294659","start",800);
 s+=rect(565,128,136,901,"#f7f6f1","#d1d2ca",8)+rect(726,128,136,901,"#f7f6f1","#d1d2ca",8)+rect(704,128,18,901,"#d9d7cb","#d9d7cb",3);
 s+=txt(714,555,"GAP",10,"#73818b","middle",700);
 const letters="abcdefghij";for(let i=0;i<10;i++)s+=txt(i<5?590+i*24:750+(i-5)*24,129,letters[i],11,"#38516b","middle",800);
 for(let r=1;r<=63;r++){
  const y=135+(r-1)*14;
  if(r===1||r%5===0||r===63)s+=txt(550,y+3,String(r),9,"#4c6373","end",700);
  for(let i=0;i<10;i++){
   const x=i<5?590+i*24:750+(i-5)*24;
   s+='<circle cx="'+x+'" cy="'+y+'" r="3" fill="#566775"/>';
  }
 }
 // Rail holes in four independent segments, visually broken around midpoint.
 for(const [x,color,label] of [[504,C.red,"+"],[528,C.blue,"−"],[945,C.red,"+"],[969,C.blue,"−"]]){
  s+=txt(x,146,label,14,color,"middle",800);
  for(let i=0;i<50;i++){
   const y=165+i*17+(i>=25?18:0);
   s+='<circle cx="'+x+'" cy="'+y+'" r="3.1" fill="'+color+'" opacity=".75"/>';
  }
  s+=line(x,158,x,572,color,1.5)+line(x,590,x,1011,color,1.5);
 }
 s+=txt(745,1051,"Each a–e row is a net; f–j is another. Rails may be split.",11,"#526b7d","middle",600);
 // Current-loop teaching jumper routes. The connectors are descriptive,
 // not physically to scale; every terminal is a real labelled board hole.
 let allWires=c.links.slice();const palette=[C.red,C.black,C.blue,C.green,C.gold,C.violet];
 c.jump.forEach(([a,b],i)=>{
  const x=point(a),y=point(b);if(!x||!y)return;
  const offset=i%3===0?-17:i%3===1?17:0;
  s+='<path d="M'+x[0]+' '+x[1]+' Q'+((x[0]+y[0])/2+offset)+' '+(Math.min(x[1],y[1])-26)+' '+y[0]+' '+y[1]+'" stroke="'+palette[(i+2)%palette.length]+'" stroke-width="3.4" fill="none"/>';
  s+='<circle cx="'+x[0]+'" cy="'+x[1]+'" r="5" fill="'+palette[(i+2)%palette.length]+'"/><circle cx="'+y[0]+'" cy="'+y[1]+'" r="5" fill="'+palette[(i+2)%palette.length]+'"/>';
 });
 c.parts.forEach(([name,kind,a,b,value],i)=>{
  if(kind==="MODULE")return;
  const A=point(a),B=point(b);if(!A||!B)return;
  const xm=(A[0]+B[0])/2,ym=(A[1]+B[1])/2;
  s+=line(A[0],A[1],B[0],B[1],"#53697d",2.5);
  const col=kind==="R"?"#d6b784":kind==="C"?"#acd8f3":kind==="LED"?"#ed91aa":"#c4d9ab";
  s+=rect(xm-12,ym-23,24,46,col,"#6b7682",6)+txt(xm,ym-5,kind==="LED"?"▷|":kind,11,"#253b51","middle",800)+
  txt(xm,ym+12,name,9,"#253b51","middle",700);
  s+=txt(xm+18,ym+26,value,10,"#254d68");
 });
 if(c.modulePins.length){
  s+=rect(1030,180,310,205,"#e6f1fa","#6e9bb8",13)+txt(1046,208,c.parts.find(p=>p[1]==="MODULE")?.[4]||"External module",17,"#1a4768","start",800);
  c.modulePins.forEach(([name,h],i)=>{
   const A=point(h),destY=227+i*24;
   if(A)s+='<path d="M'+A[0]+' '+A[1]+' C1004 '+A[1]+' 1010 '+destY+' 1030 '+destY+'" stroke="'+palette[i%palette.length]+'" stroke-width="2.4" fill="none"/>';
   s+=txt(1049,destY+4,name+" ↔ "+h,12,"#284d65","start",700);
  });
 }
 // Connector-to-breadboard wire set: exact connector labels, net hole targets.
 c.links.forEach(([p,h],i)=>{
  const B=point(h),idx=c.p.indexOf(p);
  if(!B)return;
  const name=p==="PA5_CLK"?"PA5":p;
  const lo=leftEven.indexOf(name),ro=rightOdd.indexOf(name),le=leftOdd.indexOf(name),re=rightEven.indexOf(name);
  const headerX=lo>=0?139:le>=0?74:ro>=0?322:re>=0?384:401;
  const headerIndex=Math.max(lo,ro,le,re,0);
  const yy=164+headerIndex*30,col=palette[i%palette.length];
  s+='<path d="M'+headerX+' '+yy+' C460 '+yy+' 468 '+B[1]+' '+B[0]+' '+B[1]+'" stroke="'+col+'" stroke-width="3.4" fill="none"/>'+
   '<circle cx="'+B[0]+'" cy="'+B[1]+'" r="5.1" fill="'+col+'"/>';
  s+=rect(1042,405+i*25,287,23,"#fff","#d6e1e7",4)+txt(1053,421,p+" · "+(pin[p]||["verify connector",""])[0]+" → "+h,12,col,"start",700);
 });
 const descriptions=c.parts.map(p=>p[0]+": "+p[4]+" ["+p[2]+" ↔ "+p[3]+"]");
 s+=txt(1035,118,"LIVE CONNECTIONS FOR "+q.id.toUpperCase(),16,"#245e78","start",800)+
 txt(1035,142,"Question-specific, not a generic pinout",11,"#6b7f8e")+
 txt(1035,170,"PARTS AND BREADBOARD HOLES",12,"#3d5d74","start",800);
 descriptions.forEach((d,i)=>s+=txt(1040,455+c.links.length*25+i*22,d,11,"#3e5670"));
 s+=txt(1040,1012,"POWER OFF when wiring · Never apply 5 V to GPIO",13,"#a04438","start",700);
 s+=txt(1040,1036,"See UM1724 Table 32 and the MCU datasheet.",11,"#647b8c");
 s+=txt(29,1087,"MODE: "+c.key+" · QUESTION: "+q.id+" · connector schematic + training breadboard (illustrative, not a verified hardware build)",13,"#47667b");
 return '<svg class="av-visual-svg av-nucleo-full-svg" viewBox="0 0 1380 1122" role="img" xmlns="http://www.w3.org/2000/svg" aria-label="'+esc("Full 63-row breadboard and Nucleo STM32L476RG pin-mapped exercise for "+q.id)+'">'+s+'</svg>';
}

/* 3220-point Makeronics-style assembly overview: four 630-contact terminal
   strips and seven separate 100-contact power distribution strips.
   The source manufacturer lists 504 separately connected five-contact banks.
   Rail split continuity varies by exact product and must be checked physically. */
function full3220(q){
 let s=rect(1,1,1600,1240,"#fafdff","#c6d4df",16);
 s+=txt(28,43,"3220-POINT ASSEMBLY OVERVIEW · 4 × 630 + 7 × 100",21,"#244d6c","start",800);
 s+=txt(29,69,"Four 63-row double terminal strips, seven distribution strips, four binding posts (manufacturer layout schematic, not a photo)",12,"#567284");
 const bx=[36,104,172,240],bc=[C.red,C.black,C.gold,C.green];
 for(let i=0;i<4;i++){
  s+='<circle cx="'+bx[i]+'" cy="113" r="15" fill="'+bc[i]+'" stroke="#324f65" stroke-width="2"/>';
  s+=txt(bx[i],143,["V1","V2","V3","GND"][i],11,"#3d5a70","middle",700);
 }
 // Seven independent distribution rows. Neither common rail connectivity nor
 // end-to-end continuity is asserted without direct product verification.
 for(let rail=0;rail<7;rail++){
  const y=169+rail*23;
  s+=rect(29,y-12,1540,23,rail%2?"#eaf3f7":"#fff1f3","#d7e0e5",4);
  s+=txt(42,y+4,"P"+(rail+1),12,rail%2?C.blue:C.red,"start",800);
  for(let hole=0;hole<100;hole++)s+='<circle cx="'+(83+hole*14.7)+'" cy="'+y+'" r="3.4" fill="'+(rail%2?C.blue:C.red)+'" opacity=".78"/>';
 }
 for(let g=0;g<4;g++){
  const x=32+g*392;
  s+=rect(x,338,372,875,g===0?"#eef8fe":"#f6f7f5",g===0?"#569ec4":"#c3ccd0",11);
  s+=txt(x+13,360,"STRIP "+String.fromCharCode(65+g)+" · 630 POINTS",15,"#284f67","start",800);
  const cols=[x+35,x+64,x+93,x+122,x+151,x+215,x+244,x+273,x+302,x+331];
  for(let i=0;i<10;i++)s+=txt(cols[i],376,"abcdefghij"[i],9,"#425a69","middle",700);
  s+=rect(x+167,390,34,803,"#e4e4dc","#e4e4dc",2);
  for(let row=1;row<=63;row++){
   const y=396+(row-1)*12.5;
   if(row===1||row%5===0||row===63)s+=txt(x+17,y+3,String(row),8,"#5d6e7b");
   for(let i=0;i<10;i++)s+='<circle cx="'+cols[i]+'" cy="'+y+'" r="2.9" fill="#586777"/>';
  }
  if(g===0){
   s+=rect(x+4,1196,363,15,"#d5efff","#80bfd7",4);
   s+=txt(x+185,1207,"Question "+q.id+" uses a detail from strip A",9,"#1c6283","middle",800);
  }
 }
 return '<svg class="av-3220-overview" viewBox="0 0 1600 1245" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="3220-point breadboard assembly overview with four 630-point terminal strips and seven 100-point distribution rows">'+s+'</svg>';
}

function render(q,t){
 const c=setup(q,t);if(!c)return "";
 return '<section class="av-nucleo-lesson" data-nucleo-q="'+esc(q.id)+'"><h4>Full STM32 Nucleo-64 + solderless breadboard circuit</h4>'+
 '<p>All 63 terminal rows and power rails shown, not the former 9–17 row crop. This illustrates one 830-point breadboard module, NOT a verified 3220-point Makeronics internal layout. Wires follow the selected question and its practice setup.</p>'+
 '<div class="av-nucleo-stage" tabindex="0">'+buildSvg(q,t)+'</div>'+
 '<details class="av-3220-details"><summary>Show full Makeronics-style 3220-point assembly (4 terminal strips + 7 power strips)</summary><div class="av-nucleo-stage" tabindex="0">'+full3220(q)+'</div><p>The highlighted first strip corresponds to the detailed practice module above. The other strips and distribution lanes are intentionally unconnected until you explicitly wire them. Verify internal rail breaks using continuity mode.</p></details>'+
 '<p><strong>Selected probe node(s):</strong> '+esc((c.bench.length?c.bench.map(x=>x[1]):c.links.map(x=>x[1])).filter(x=>/^[a-j]\d+$/.test(x)).slice(0,3).join(" · ")||"Use approved ground/reference measurements")+'</p>'+
 '<p class="av-nucleo-warning">Read the official ST UM1724 board connector table before any physical wiring. Board power, GPIO level limits, jumper configuration, module pinouts and current limits must be independently checked. Never connect powered circuits based only on this illustration.</p>'+
 '<p class="av-nucleo-resources"><a href="https://www.st.com/resource/en/user_manual/dm00105823.pdf" target="_blank" rel="noopener noreferrer">ST UM1724 official connector manual</a> · '+
 '<a href="https://www.st.com/en/development-tools/stm32cubeide.html" target="_blank" rel="noopener noreferrer">STM32CubeIDE (desktop software)</a> · '+
 '<a href="https://www.st.com/en/development-tools/stm32cubemx.html" target="_blank" rel="noopener noreferrer">STM32CubeMX pin configurator (desktop)</a></p>'+
 '<details><summary>Exact training connection list · '+esc(c.title)+'</summary><ol>'+
 c.links.map(([p,h])=>'<li>'+esc(p)+' ('+esc((pin[p]||["confirm board docs"])[0])+') → breadboard '+esc(h)+'</li>').join("")+
 c.jump.map(([a,b])=>'<li>Jumper wire: '+esc(a)+' ↔ '+esc(b)+'</li>').join("")+
 c.parts.map(([name,kind,a,b,v])=>'<li>'+esc(name)+' ('+esc(kind)+', '+esc(v)+'): '+esc(a)+' ↔ '+esc(b)+'</li>').join("")+
 '</ol></details></section>';
}
window.avionicsNucleoWorkbench={render,buildSvg,full3220,setup,choose,includesNucleo:t=>!!t&&["units","ohm","power","series","parallel","kcl-kvl","capacitors","rc","filters","components","power-rails","schematics","instruments","timing","buses"].includes(t.id),pin};
})();
