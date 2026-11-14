"use strict";
(function(){
const scenes=[
 [{type:"ghost",head:"The load is still connected",detail:"The 200 Ω load cannot vanish because a learner guessed wrong."},{type:"conduct",head:"NMOS ON: current flows to ground",detail:"The modeled receiver drops when the low-side switch conducts."},{type:"fixed",head:"The source voltage stays constant",detail:"The source is programmed independently of the NMOS gate."},{type:"wire",head:"Copper does not change length",detail:"Voltage changes; physical routing does not stretch."}],
 [{type:"ohm",head:"Series drop grows with resistance",detail:"Current follows the series path; power and voltage obey Ohm's law."},{type:"fixed",head:"Adding R doesn't boost Vsource",detail:"The source voltage remains under its programmed control."},{type:"device",head:"Device threshold is unchanged",detail:"A MOSFET Vth is not automatically reprogrammed by series R."},{type:"ghost",head:"Receiver load stays fitted",detail:"The 200 Ω receiver load remains connected to ground."}],
 [{type:"charge",head:"Charge accumulates at the capacitor",detail:"Shunt capacitance increases charging demand and can slow the edge."},{type:"slow",head:"Big C can slow a clock edge",detail:"A larger load can delay rising transitions."},{type:"return",head:"Ground current completes the loop",detail:"No capacitor eliminates the need for a return path."},{type:"fixed",head:"A capacitor isn't an endless voltage source",detail:"It stores charge but cannot perpetually raise the source."}],
 [{type:"risk",head:"Random MOSFET can add unwanted current",detail:"New conduction branch needs design verification."},{type:"probe",head:"Simulation is not physical evidence",detail:"A real oscilloscope reading needs a suitable probe and reference."},{type:"verify",head:"Engineer investigates before modifying",detail:"Check measurement, ratings, root cause, proposed fix, then validate."},{type:"heat",head:"Real overload is conditional",detail:"A DIFFERENT 12 V short-circuit model dissipates 1.685 W in R33, exceeding an assumed 0.25 W rating."}]
];
const base='<svg viewBox="0 0 680 205" class="fx-svg" role="img" aria-label="Circuit consequence animation">'+
'<rect width="680" height="205" rx="15" fill="#0c2538"/>'+
'<path d="M60 85 H154 M219 85 H300 M362 85 H565 V123 M565 166 V187 H60" fill="none" stroke="#cdbd7e" stroke-width="6"/>'+
'<circle cx="60" cy="85" r="13" fill="#91dafa"/><rect x="154" y="68" width="65" height="34" rx="5" fill="#eec296"/>'+
'<path d="M300 85 Q318 53 330 85 Q350 53 362 85" fill="none" stroke="#eec981" stroke-width="5"/>'+
'<rect x="545" y="123" width="40" height="43" rx="5" fill="#d8ad83" stroke="#ffefc6" stroke-width="3"/>'+
'<text x="58" y="51" fill="#eafbff" text-anchor="middle" font-size="15">Vsource</text>'+
'<text x="188" y="54" fill="#eafbff" text-anchor="middle" font-size="15">Rseries</text>'+
'<text x="330" y="51" fill="#eafbff" text-anchor="middle" font-size="15">L</text>'+
'<text x="565" y="53" fill="#eafbff" text-anchor="middle" font-size="15">RX</text>';
function picture(x){
 const a='#7de8d4',b='#ffdd85',c='#fb7579';
 switch(x.type){
 case "ghost":return '<rect class="fx-dashed" x="532" y="114" width="66" height="59" rx="8" stroke="'+c+'" stroke-width="3" fill="none" stroke-dasharray="6 5"/><text x="400" y="145" fill="'+b+'" font-size="17">STILL FITTED ✓</text>';
 case "conduct":return '<path class="fx-flow" d="M375 85 H565 V175" stroke="'+a+'" fill="none" stroke-width="6" stroke-dasharray="12 15"/><text x="407" y="160" fill="'+b+'" font-size="16">I ↑ , RX ↓</text>';
 case "fixed":return '<path d="M65 147 H155" stroke="'+a+'" stroke-width="5"/><text x="65" y="176" fill="'+a+'" font-size="16">Vsource = fixed</text>';
 case "wire":return '<path d="M225 130 H535" stroke="'+a+'" stroke-dasharray="6 6" stroke-width="3"/><text x="344" y="163" fill="'+b+'" font-size="16">length unchanged</text>';
 case "ohm":return '<path class="fx-flow" d="M68 85 H540" stroke="'+a+'" stroke-width="5" stroke-dasharray="10 13"/><text x="225" y="150" fill="'+b+'" font-size="19">ΔV = I × R</text>';
 case "device":return '<rect x="401" y="132" width="168" height="43" rx="9" fill="#30435d"/><text x="482" y="160" text-anchor="middle" fill="'+a+'" font-size="16">Vth unchanged</text>';
 case "charge":return '<path class="fx-flow" d="M375 85 H545" stroke="'+a+'" stroke-width="5" stroke-dasharray="9 12"/><path d="M440 136 H488 M440 151 H488" stroke="'+b+'" stroke-width="6"/><text x="367" y="177" fill="'+a+'" font-size="16">Q = C·V</text>';
 case "slow":return '<path d="M375 178 V134 H414 V108" stroke="'+c+'" stroke-width="4" fill="none"/><path d="M375 178 Q425 179 454 108" stroke="'+a+'" stroke-width="4" fill="none"/><text x="452" y="167" fill="'+b+'" font-size="16">rise time ↑</text>';
 case "return":return '<path class="fx-flow" d="M565 90 V187 H70" stroke="'+a+'" fill="none" stroke-width="6" stroke-dasharray="11 12"/><text x="326" y="161" fill="'+a+'" font-size="16">return current</text>';
 case "risk":return '<circle class="fx-alert" cx="566" cy="143" r="35" stroke="'+c+'" stroke-width="5" fill="none"/><text x="375" y="174" fill="'+b+'" font-size="15">Unverified current</text>';
 case "probe":return '<path class="fx-probe" d="M455 30 L548 115" stroke="'+a+'" stroke-width="6"/><circle cx="549" cy="117" r="8" fill="'+b+'"/><text x="401" y="168" fill="'+a+'" font-size="16">Probe + reference</text>';
 case "verify":return '<text x="245" y="156" fill="'+a+'" font-size="17">① Measure</text><text x="395" y="156" fill="'+b+'" font-size="17">② Isolate</text><text x="520" y="184" fill="'+a+'" font-size="17">③ Verify</text>';
 case "heat":return '<rect class="fx-hot" x="152" y="66" width="69" height="38" rx="6" fill="'+c+'"/><path class="fx-sparks" d="M175 45 l12 -25 l9 24 l10 -17" stroke="'+b+'" stroke-width="5" fill="none"/><text x="242" y="151" fill="'+b+'" font-size="17">1.685 W / 0.25 W</text><text x="242" y="174" fill="'+c+'" font-size="15">Separate fault model</text>';
 default:return '<circle class="fx-alert" cx="545" cy="90" r="22" fill="none" stroke="'+a+'" stroke-width="4"/>';
 }
}

const highlight={
 ghost:["LOAD","CONNECTED"],conduct:["NMOS","CURRENT ON"],fixed:["VSRC","NO CHANGE"],wire:["TRACE","FIXED LENGTH"],
 ohm:["RSERIES","V DROP"],device:["NMOS","Vth FIXED"],charge:["CAPACITOR","CHARGING"],slow:["CAPACITOR","SLOWER EDGE"],
 return:["GROUND","RETURN PATH"],risk:["NMOS","RECHECK"],probe:["PROBE","MEASURE"],verify:["BOARD","VERIFY FIRST"],heat:["RESISTOR","OVERLOAD"]
};
function mobile(scene){
 const type=scene.type,label=highlight[type]||["CIRCUIT","CHECK"],thermal=type==="heat";
 const target=thermal?"#fa6a64":type==="conduct"?"#5fe8b8":"#ffdf84";
 return '<div class="fx-mobile-scene"><svg viewBox="0 0 320 185" role="img" aria-label="Mobile component-consequence animation">'+
 '<rect width="320" height="185" rx="14" fill="#092b3d"/>'+
 '<text x="14" y="22" fill="#e3f7fd" font-size="12">SIGNAL PATH · SELECTED COMPONENT</text>'+
 '<path d="M23 86 H91 M158 86 H247 V127 M247 154 H23" stroke="#ebc87a" stroke-width="6" fill="none"/>'+
 '<circle cx="23" cy="86" r="11" fill="#b2e9ff"/>'+
 '<rect class="fx-mobile-target '+(thermal?"fx-hot":"")+'" x="91" y="66" width="67" height="40" rx="6" fill="'+(thermal?"#ed5b59":"#e5bb8d")+'" stroke="'+target+'" stroke-width="4"/>'+
 '<rect x="231" y="127" width="32" height="27" rx="4" fill="#6caca9" stroke="#fff1b5" stroke-width="3"/>'+
 (["conduct","return","ohm","charge"].includes(type)?'<path class="fx-flow" d="M40 86 H241 V147 H60" stroke="#5ff2d0" fill="none" stroke-width="5" stroke-dasharray="12 12"/>':'')+
 (thermal?'<path class="fx-sparks" d="M116 55 l9 -22 l10 17 l9 -20" fill="none" stroke="#fff1a0" stroke-width="5"/>':'')+
 (type==="ghost"?'<rect class="fx-dashed" x="224" y="117" width="48" height="45" rx="9" fill="none" stroke="#ffea85" stroke-width="3" stroke-dasharray="6 5"/>':'')+
 '<text x="124" y="58" text-anchor="middle" fill="#fff" font-size="14" font-weight="800">'+label[0]+'</text>'+
 '<text x="160" y="129" text-anchor="middle" fill="'+target+'" font-size="15" font-weight="850">'+label[1]+'</text>'+
 '<text x="160" y="172" text-anchor="middle" fill="#e3f7fd" font-size="11">ILLUSTRATIVE · NOT HARDWARE DAMAGE</text></svg></div>';
}
const prev=window.showAnswerConsequence,reset=window.resetAnswerConsequence;
window.showAnswerConsequence=function(root,step,choice,correct){
 if(prev)prev(root,step,choice,correct);const panel=root.querySelector("#answerConsequence");if(!panel)return;
 const scenario=(scenes[step]||scenes[0])[choice];if(!scenario)return;
 let stage=panel.querySelector("#fxCustom");if(!stage){stage=document.createElement("div");stage.id="fxCustom";panel.appendChild(stage)}
 stage.className="fx-stage "+(correct?"fx-right":"fx-wrong");stage.dataset.effect=scenario.type;stage.dataset.step=step;stage.dataset.choice=choice;
 stage.innerHTML='<div class="fx-title"><span>'+(correct?"✓ CORRECT PHYSICAL BEHAVIOR":"◈ EXPLORE THIS MISCONCEPTION")+'</span><strong>'+scenario.head+'</strong></div>'+
 base+picture(scenario)+'</svg>'+mobile(scenario)+'<p class="fx-explain">'+scenario.detail+'</p><p class="fx-disclaimer">Illustrative animated overlay · no real components are affected or burned.</p>';
};
window.resetAnswerConsequence=function(root){if(reset)reset(root);const stage=root.querySelector("#fxCustom");if(stage)stage.remove()};
})();
