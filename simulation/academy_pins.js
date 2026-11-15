"use strict";
(function(){
const e=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const map={
 "Arduino UNO R3":[
 ["D2","GPIO IN","EXT INTERRUPT"],["D3","GPIO OUT","PWM"],["D9","GPIO OUT","PWM"],["D10","GPIO OUT","PWM","SPI CS"],["D11","GPIO OUT","PWM","SPI MOSI"],["D13","GPIO OUT","LED","SPI SCK"],["A0","ADC"],["A1","ADC"],["A4","ADC","I2C SDA"],["A5","ADC","I2C SCL"],["D0","UART RX"],["D1","UART TX"]],
 "STM32 NUCLEO-L476RG":[
 ["PA0","ADC","GPIO IN"],["PA5","GPIO OUT","LED","SPI SCK"],["PA6","GPIO IN","SPI MISO"],["PA7","GPIO OUT","SPI MOSI"],["PA10","GPIO IN","EXT INTERRUPT"],["PB5","GPIO OUT"],["PC13","GPIO IN","USER BUTTON","EXT INTERRUPT"],["PA2","UART TX","GPIO OUT"],["PA3","UART RX","GPIO IN"],["PB8","I2C SCL","GPIO IN"],["PB9","I2C SDA","GPIO IN"],["PB6","GPIO OUT","PWM"],["PB4","GPIO OUT","PWM"]]
};
function source(board,assigned){
 const keys=Object.keys(assigned);
 if(board==="Arduino UNO R3")return [
  "// Generated Arduino teaching sketch; verify real board pins before wiring.",
  "// Requirements: configure assigned GPIO and sample the sensor.",
  "// Pseudocode: define pins -> initialize IO -> loop -> measure -> report.",
  "void setup() {",
  "  Serial.begin(9600); // Serial debugging needs the serial library in Arduino core.",
  ...keys.map(k=>assigned[k]==="ADC"?"  // "+k+": analogRead("+k+") reads a 10-bit ADC sample.":"  pinMode("+k.replace(/^D/,"")+", "+(/IN|BUTTON|INTERRUPT/.test(assigned[k])?"INPUT":"OUTPUT")+"); // "+k+" = "+assigned[k]),
  "}",
  "void loop() {",
  "  // Verify and debounce inputs before making hardware decisions.",
  "  delay(10); // Explicit update interval.",
  "}"
 ].join("\n");
 return [
  "/* STM32CubeMX-style teaching mapping for NUCLEO-L476RG */",
  "/* Use STM32CubeMX + installed HAL to generate RCC/GPIO/UART setup. */",
  "#include \"main.h\" // Actual generated HAL project header.",
  ...keys.map(k=>"// "+k+" → "+assigned[k]+"; confirm alternate function, pull, speed and electrical level."),
  "void lab_poll_button(void) {",
  "  // PC13 is a user button input on this board.",
  "  GPIO_PinState b = HAL_GPIO_ReadPin(GPIOC, GPIO_PIN_13);",
  "  HAL_GPIO_WritePin(GPIOA, GPIO_PIN_5, b == GPIO_PIN_RESET ? GPIO_PIN_SET : GPIO_PIN_RESET);",
  "  HAL_Delay(10);",
  "}"
 ].join("\n");
}
function mount(root){
 if(!root)return;
 root.innerHTML='<div class="aca-card"><h3>CubeMX-inspired board and alternate-function explorer</h3><p>Choose a real pin name and a manufacturer-supported role. The configured mapping controls the generated code sketch; it does not change a physical device.</p>'+
 '<div class="aca-forms"><label>Board<select id="acaBoard"><option>Arduino UNO R3</option><option>STM32 NUCLEO-L476RG</option></select></label><label>Pin<select id="acaPin"></select></label><label>Alternate function<select id="acaRole"></select></label><button id="acaAssign">Assign function</button><button id="acaPinClear">Clear all</button></div>'+
 '<div class="aca-forms"><button id="acaEngr844">Load ENGR 844 Lab 1 pin example</button><label>Quadrature position<input id="acaQuadStep" type="range" min="0" max="15" value="0"></label></div><div id="acaQuad" class="aca-svg" aria-label="Two digital quadrature waveform signals with state indicator"></div><div id="acaPinStatus" class="aca-status" role="status"></div><div id="acaPinGrid" class="aca-pin-grid"></div><div class="aca-columns"><div class="aca-card"><h4>Assigned pin table</h4><div id="acaAssigned"></div></div><div class="aca-card"><h4>Generated initialization sketch</h4><pre id="acaPinGenerated" class="aca-code"></pre><button id="acaSendIDE">Use sketch in code terminal</button></div></div>'+
 '<p class="aca-note">Arduino UNO: 5 V ATmega328P, 16 MHz; D13 on-board LED, A0 analog ADC. NUCLEO-L476RG: PC13 user button, PA5 user LED, PA0 ADC; ST UM1724 documents pin alternate functions. This is a curated subset, not the full STM32CubeMX database. Avoid connecting 5 V signals directly to arbitrary 3.3 V-only pins.</p>'+
 '<p>Official board references: <a href="https://docs.arduino.cc/hardware/uno-rev3/" target="_blank" rel="noopener">Arduino UNO pinout</a> and <a href="https://www.st.com/resource/en/user_manual/dm00105823.pdf" target="_blank" rel="noopener">ST UM1724 Nucleo-64 manual</a>.</p></div>';
 const $=q=>root.querySelector(q);
 let board="Arduino UNO R3",assigned={};
 function roles(){return map[board]}
 function paintRoles(){
  const p=roles().find(x=>x[0]===$("#acaPin").value)||roles()[0];
  $("#acaRole").innerHTML=p.slice(1).map(k=>'<option>'+e(k)+'</option>').join("");
 }
 function plotQuadrature(){
  const states=[[0,0],[0,1],[1,1],[1,0]],step=Number($("#acaQuadStep").value)||0;
  const n=states[step%4],line=(idx,y)=>states.map((_,i)=>i);
  let svg='<svg viewBox="0 0 760 182" role="img" aria-label="Quadrature A B logic timing sequence"><rect width="760" height="182" rx="9" fill="#091b2b"/>';
  for(const [k,name,col,y0] of [[0,"PB5 · QUAD_A","#69eead",24],[1,"PB4 · QUAD_B","#6bb5ff",87]]){
   let path="";
   for(let i=0;i<16;i++){const x=130+i*36,v=states[i%4][k],Y=v?y0+7:y0+40;
    path+=(i?" H":"M")+x+(i?" V"+Y:" "+Y)+" H"+(x+36);
    svg+='<text x="'+(x+18)+'" y="'+(y0+53)+'" fill="'+col+'" font-size="9" text-anchor="middle">'+v+'</text>';
   }
   svg+='<text x="12" y="'+(y0+20)+'" fill="'+col+'" font-size="12" font-weight="bold">'+name+'</text><path d="'+path+'" stroke="'+col+'" stroke-width="2.5" fill="none"/>';
  }
  const tx=130+step*36;
  svg+='<path d="M'+tx+' 10 V142" stroke="#ffda86" stroke-dasharray="5 4"/><text x="15" y="169" fill="#eaf5ff" font-size="12">State '+step+': '+n[0]+n[1]+' · sequence 00→01→11→10 · 90° phase shift</text></svg>';
  $("#acaQuad").innerHTML=svg;
 }
 function paint(){
  $("#acaPinGrid").innerHTML=roles().map(p=>'<button data-pin="'+p[0]+'" class="'+(assigned[p[0]]?"aca-active-pin":"")+'"><strong>'+p[0]+'</strong><small>'+e(assigned[p[0]]||p.slice(1).join(" / "))+'</small></button>').join("");
  $("#acaAssigned").innerHTML='<table class="aca-table"><tr><th>Pin</th><th>Mode</th></tr>'+Object.entries(assigned).map(x=>'<tr><td>'+e(x[0])+'</td><td>'+e(x[1])+'</td></tr>').join("")+'</table>';
  $("#acaPinGenerated").textContent=source(board,assigned);
 }
 function options(){
  $("#acaPin").innerHTML=roles().map(x=>'<option>'+x[0]+'</option>').join("");
  paintRoles();paint();
 }
 $("#acaBoard").onchange=()=>{board=$("#acaBoard").value;assigned={};options();$("#acaPinStatus").textContent="Board selected: "+board};
 $("#acaPin").onchange=paintRoles;
 $("#acaAssign").onclick=()=>{
  const pin=$("#acaPin").value,role=$("#acaRole").value,rule=roles().find(r=>r[0]===pin);
  if(!rule||!rule.slice(1).includes(role)){$("#acaPinStatus").textContent="INVALID: role is not supported on this pin.";return}
  if(["I2C SDA","I2C SCL","UART TX","UART RX"].includes(role)&&Object.entries(assigned).some(([p,r])=>p!==pin&&r===role)){$("#acaPinStatus").textContent="CONFLICT: "+role+" is already assigned to another pin.";return}
  assigned[pin]=role;paint();$("#acaPinStatus").textContent="Validated selection "+pin+" → "+role+". Hardware configuration and firmware compilation are separate.";
 };
 $("#acaPinClear").onclick=()=>{assigned={};paint();$("#acaPinStatus").textContent="Assignments cleared."};
 $("#acaEngr844").onclick=()=>{
  board="STM32 NUCLEO-L476RG";$("#acaBoard").value=board;
  assigned={PA10:"EXT INTERRUPT",PA5:"LED",PB5:"GPIO OUT",PB4:"GPIO OUT",PC13:"USER BUTTON"};
  options();paint();plotQuadrature();
  $("#acaPinStatus").textContent="ENGR 844 reference model selected: PA10 generator input; PA5 LED; PB5/PB4 2-bit quadrature; PC13 button. Configure real CubeMX project before physical tests.";
 };
 $("#acaQuadStep").oninput=plotQuadrature;
 $("#acaPinGrid").onclick=ev=>{const b=ev.target.closest("[data-pin]");if(!b)return;$("#acaPin").value=b.dataset.pin;paintRoles()};
 $("#acaSendIDE").onclick=()=>{const parent=root.closest("#academyView");parent.querySelector('[data-aca="code"]')?.click();if(window.academyUseGeneratedCode)window.academyUseGeneratedCode(board==="Arduino UNO R3"?"arduino":"stm32",source(board,assigned));};
 options();plotQuadrature();
}
window.mountAcademyPins=mount;
window.academyPinData=map;
window.academyPinSource=source;
})();