"use strict";
(function(){
/* Exact SVG connectivity for the teaching networks. Not a photorealistic board,
 * and not a claim that a 12-V textbook network is safe on an STM32 GPIO. */
const lib=window.avionicsVisuals;if(!lib)throw Error("Load base visuals first");
const baseRender=lib.render,baseDescribe=lib.describe;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const num=n=>String(Number(Number(n).toPrecision(5)));
const line=(a,b,c,d,color="#263c50",w=3)=>'<line x1="'+a+'" y1="'+b+'" x2="'+c+'" y2="'+d+'" stroke="'+color+'" stroke-width="'+w+'" stroke-linecap="round"/>';
const txt=(x,y,s,size=15,color="#1e4963",anchor="start",weight=650)=>'<text x="'+x+'" y="'+y+'" font-size="'+size+'" fill="'+color+'" font-family="Arial,sans-serif" font-weight="'+weight+'" text-anchor="'+anchor+'">'+esc(s)+'</text>';
const node=(x,y,name)=>'<circle cx="'+x+'" cy="'+y+'" r="5.5" fill="#2489bf"/>'+txt(x+12,y-10,name,14,"#176b99");
const zigH=(x1,x2,y,name,value)=>{
 const m=(x1+x2)/2,k=23;
 let s=line(x1,y,m-38,y)+line(m+38,y,x2,y),pts=[[-38,0],[-28,-13],[-16,13],[-4,-13],[8,13],[20,-13],[32,13],[38,0]];
 s+='<polyline points="'+pts.map(p=>(m+p[0])+","+(y+p[1])).join(" ")+'" stroke="#283a4c" stroke-width="3" fill="none"/>';
 s+=txt(m,y-32,name,16,"#173f5c","middle",800)+txt(m,y+41,value,14,"#235b7b","middle");
 return s;
};
const zigV=(x,y1,y2,name,value,side=1)=>{
 const m=(y1+y2)/2;
 let s=line(x,y1,x,m-38)+line(x,m+38,x,y2),pts=[[0,-38],[-13,-28],[13,-16],[-13,-4],[13,8],[-13,20],[13,32],[0,38]];
 s+='<polyline points="'+pts.map(p=>(x+p[0])+","+(m+p[1])).join(" ")+'" stroke="#283a4c" stroke-width="3" fill="none"/>';
 const dx=side>0?22:-22;
 s+=txt(x+dx,m-4,name,15,"#173f5c",side>0?"start":"end",800)+txt(x+dx,m+15,value,13,"#235b7b",side>0?"start":"end");
 return s;
};
function svg(q,mode){
 const n=q.network||{},v=n.values||{},kind=n.kind;
 const a=v.a||100,b=v.b||200,c=v.c||300,d=v.d||80;
 const top=v.top||2000,bot=v.bot||2000,load=v.load||2000,meter=v.meter||1000000;
 const supply=v.v||12;
 let s='<rect x="2" y="2" width="996" height="555" rx="13" fill="#fcfeff" stroke="#c4dce8"/>';
 s+=txt(26,36,mode==="concept"?"HOW CURRENT AND VOLTAGE RELATE":mode==="wiring"?"IDEAL CIRCUIT + SAFE TEST POINTS":"QUESTION-SPECIFIC CONNECTED CIRCUIT",20,"#185578","start",800);
 s+=txt(26,62,"Reference: source negative = B / return · theoretical circuit, not measured flight telemetry",12,"#537288");
 // Source, positive/negative rails and source labels (common to every topology)
 s+=line(115,149,115,210);
 s+=line(115,250,115,410);
 s+=line(92,217,138,217,"#1f3548",4)+line(100,229,130,229,"#1f3548",4)+line(92,241,138,241,"#1f3548",4);
 s+=txt(64,205,"+",23,"#cc327b","middle")+txt(64,267,"−",23,"#cc327b","middle");
 s+=txt(29,300, n.illustrative?"Vₛ: illustrative "+num(supply)+" V":"Vₛ = "+num(supply)+" V",14,"#1b5b83");
 s+=node(115,149,"+");
 s+=node(115,410,"B · GND");
 if(kind==="series"||kind==="series2"||kind==="divider"||kind==="miswire"){
  if(kind==="divider"){
   s+=line(115,149,430,149)+zigV(430,165,264,"Rtop",num(top)+" Ω");
   s+=line(430,149,430,165)+node(430,285,"A · Vout");
   s+=line(430,264,430,285)+zigV(430,296,399,"Rbottom",num(bot)+" Ω");
   s+=line(430,285,430,296)+line(430,399,430,410)+line(115,410,430,410);
  }else{
   const vals=kind==="miswire"?[a,b,c,d]:kind==="series2"?[a,b]:[a,b,d];
   const starts=kind==="miswire"?[185,345,505,665]:kind==="series2"?[260,590]:[205,425,645];
   const ends=starts.map(x=>x+125);
   let x=115;
   for(let i=0;i<vals.length;i++){s+=zigH(x,ends[i],149,"R"+(i+1),num(vals[i])+" Ω");x=ends[i];}
   s+=line(x,149,835,149)+line(835,149,835,410)+line(115,410,835,410);
  }
 }else if(kind==="parallel"||kind==="parallel3"){
   s+=line(115,149,855,149)+line(115,410,855,410);
   const bs=kind==="parallel3"?[[350,a,"R1"],[530,b,"R2"],[710,c,"R3"]]:[[440,b,"R2"],[680,c,"R3"]];
   for(const br of bs){s+=node(br[0],149,br[2]+" top")+zigV(br[0],149,410,br[2],num(br[1])+" Ω");}
 }else if(kind==="mixed3"){
   s+=zigH(115,355,149,"R1",num(a)+" Ω")+line(355,149,835,149);
   s+=line(115,410,835,410);
   s+=node(465,149,"A")+node(465,410,"B")+zigV(465,149,410,"R2",num(b)+" Ω",-1)+zigV(705,149,410,"R3",num(c)+" Ω");
 }else if(kind==="parallelSeries"){
   s+=line(115,149,835,149)+line(115,410,835,410);
   for(const [x1,rup,rdown,label] of [[425,a,b,"A"],[695,c,d,"B"]]){
    s+=node(x1,149,"Branch "+label)+zigV(x1,149,277,label+"1",num(rup)+" Ω",-1)+node(x1,281,"Mid "+label)+zigV(x1,281,410,label+"2",num(rdown)+" Ω",-1);
   }
 }else if(kind==="mixed4"){
   s+=zigH(115,355,149,"R1",num(a)+" Ω")+line(355,149,850,149);
   s+=node(465,149,"A")+zigV(465,149,410,"R2",num(b)+" Ω",-1);
   s+=zigV(705,149,410,"R3",num(c)+" Ω");
   s+=line(465,410,850,410)+node(465,410,"B");
   s+=zigH(115,355,410,"R4",num(d)+" Ω")+line(355,410,465,410);
 }else if(kind==="loadedDivider"){
   s+=line(115,149,450,149)+zigV(450,149,278,"Rtop",num(top)+" Ω",-1)+node(450,287,"A · Vout");
   s+=line(450,278,450,287)+line(450,287,725,287);
   s+=zigV(450,287,410,"Rbottom",num(bot)+" Ω",-1);
   const isMeter=n.focus==="probe"||q.learningObjective?.toLowerCase().includes("meter");
   s+=zigV(720,287,410,isMeter?"Rmeter":"Rload",num(isMeter?meter:load)+" Ω");
   s+=line(115,410,735,410);
 }else {
  return "";
 }
 const caption=mode==="wiring"?"Probe across nodes, not by shorting the source. Disconnect power before Ω-mode tests.":mode==="concept"?
 "Single pink current arrow before a split; blue dots mark connected nodes.": "Each resistor and wire belongs to the exact topology named above.";
 s+='<path d="M158 112 L200 112" stroke="#da369b" stroke-width="3" fill="none"/>'+
 '<path d="M200 112 l-11 -7 l0 14 z" fill="#da369b"/>'+txt(218,118,"I (conventional current)",12,"#a72e80");
 s+='<rect x="22" y="469" width="956" height="66" rx="10" fill="#eef7fc" stroke="#cee0ea"/>';
 s+=txt(40,494,caption,14,"#285d79");
 s+=txt(40,515,"Blue nodes = electrical junctions · Black symbols = ideal resistors · Not a verified Nucleo / flight harness build",11,"#59768b");
 return '<svg class="av-mixed-network-svg" viewBox="0 0 1000 560" role="img" xmlns="http://www.w3.org/2000/svg" aria-label="'+esc("Network diagram for "+q.id+": "+q.learningObjective)+'">'+s+'</svg>';
}
function render(q,t,mode){
 if(!q||!q.network)return baseRender(q,t,mode);
 if(!["schematic","concept","wiring"].includes(mode))return "";
 const drawn=svg(q,mode);
 if(!drawn)return baseRender(q,t,mode);
 const lbl=mode==="schematic"?"Exact series / parallel topology":mode==="concept"?"Conceptual current-path and common-node explanation":"Network + approved bench verification points";
 return '<figure class="av-visual-figure av-integrated-circuit-figure" data-visual-question="'+esc(q.id)+'" data-visual-mode="'+esc(mode)+'" data-network-type="'+esc(q.network.kind)+'">'+
 '<div class="av-visual-top"><strong>'+esc(lbl)+'</strong><span>Question '+esc(q.id)+' · '+esc(q.level)+'</span></div>'+
 drawn+'<div class="av-visual-question-line"><strong>Question:</strong> '+esc(q.question)+'</div>'+
 '<div class="av-visual-focus"><strong>'+esc(q.learningObjective)+'.</strong> '+esc(q.lesson?.summary||"Identify which resistors truly share the same node pair.")+'</div>'+
 '<figcaption>This diagram is built from the specific question model, not inferred from arbitrary numbers in the problem statement. Advanced 9–12 V examples are theoretical; never wire such levels directly to STM32 I/O.</figcaption></figure>';
}
lib.render=render;
lib.describe=function(q,t){if(q&&q.network){const m=baseDescribe(q,t);return {...m,board:false,wiring:"Theoretical node-by-node lab fixture; no implied Nucleo power wiring"};}return baseDescribe(q,t);};
window.avionicsIntegratedCircuitVisuals={render,svg};
})();