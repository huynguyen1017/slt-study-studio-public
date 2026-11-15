"use strict";
/* Cross-language editor. Python executes only on explicit opt-in via isolated
 * WebAssembly Web Worker. RTL has a real one-bit assign subset evaluator.
 * C/Arduino/HAL: static diagnostics; never claim native compilation. */
(function(){
const e=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const demos={
 python:{title:"Python 3",file:"divider.py",ext:"py",description:"Actual Python 3 via Pyodide WebAssembly on demand. Internet needed; worker has an 18-second timeout.",libraries:"Uses built-in Python print() and round(); no third-party package is necessary.",src:[
 "# Problem: compute a voltage divider from supply voltage and resistors.",
 "# Input: 9 V, 330 ohms top, 1000 ohms bottom. Output: voltage and current.",
 "# Pseudocode: define inputs -> add resistances -> calculate I -> calculate Vout -> display.",
 "source_v = 9.0  # Store the source voltage using a floating point number.",
 "r_top = 330.0  # Series resistor between source and the output node.",
 "r_bottom = 1000.0  # Resistor between the output node and ground.",
 "total_r = r_top + r_bottom  # Step 1: series resistances add.",
 "current_a = source_v / total_r  # Step 2: Ohm's law I = V / R.",
 "v_out = current_a * r_bottom  # Step 3: voltage across bottom resistor.",
 "print('Current:', round(current_a * 1000, 3), 'mA')  # Show mA, not A.",
 "print('Vout:', round(v_out, 3), 'V')  # Verify against circuit node."
 ].join("\n")},
 c:{title:"C11",file:"divider.c",ext:"c",description:"Static C11 diagnostics. The browser has no GCC/Clang toolchain; this panel does not compile or run native C.",libraries:"stdio.h is needed for printf; double is used for fractional voltages and currents.",src:[
 "#include <stdio.h> // Standard input/output library for printf.",
 "int main(void) { // Entry point for a native C toolchain.",
 "  double source_v = 9.0; // Power supply, in volts.",
 "  double resistance = 1330.0; // Total series resistance, in ohms.",
 "  double current = source_v / resistance; // Ohm's law, in amperes.",
 "  printf(\"Current = %.3f mA\\n\", current * 1000.0); // Print units.",
 "  return 0; // Successful completion.",
 "}"
 ].join("\n")},
 arduino:{title:"Arduino C++",file:"sensor.ino",ext:"ino",description:"Board-aware static inspection. No live Arduino compiler or USB uploader is connected.",libraries:"Arduino.h is supplied by the Arduino core; Serial, pinMode and analogRead require a configured Arduino board.",src:[
 "// Arduino sensor demonstration; this is not a clinical heart-rate monitor.",
 "const int sensorPin = A0; // ADC input from 3.3–5 V compatible sensor.",
 "const int ledPin = 13; // On-board Uno LED.",
 "void setup() { // Initialization once.",
 "  Serial.begin(9600); // Send messages to a serial terminal on real hardware.",
 "  pinMode(ledPin, OUTPUT); // Set D13 to output mode.",
 "}",
 "void loop() { // Execute repeatedly on an Arduino microcontroller.",
 "  int raw = analogRead(sensorPin); // Read a 10-bit ADC sample.",
 "  digitalWrite(ledPin, raw > 512 ? HIGH : LOW); // Simple threshold model.",
 "  Serial.println(raw); // A raw ADC value is not a computed BPM.",
 "  delay(20); // 20 ms interval.",
 "}"
 ].join("\n")},
 stm32:{title:"STM32 HAL C",file:"main.c",ext:"c",description:"STM32CubeMX-inspired teaching analysis. STM32CubeIDE/HAL source generation, compilation and flashing need the real installed toolchain.",libraries:"main.h, stm32l4xx_hal_gpio.h and HAL_Delay come from a generated STM32Cube HAL project.",src:[
 "/* NUCLEO-L476RG GPIO example; generated MX_GPIO_Init() is required. */",
 "#include \"main.h\" // Header from your real STM32CubeMX project.",
 "void lab_poll_button(void) { // Call from the main-loop after initialization.",
 "  GPIO_PinState b = HAL_GPIO_ReadPin(GPIOC, GPIO_PIN_13); // User button.",
 "  HAL_GPIO_WritePin(GPIOA, GPIO_PIN_5, b == GPIO_PIN_RESET ? GPIO_PIN_SET : GPIO_PIN_RESET); // LED.",
 "  HAL_Delay(10); // Delay for simulated polling.",
 "}"
 ].join("\n")},
 verilog:{title:"Verilog",file:"and_gate.v",ext:"v",description:"Executable truth-table simulator for one-bit continuous assign statements (AND/OR/XOR). It is not a full Verilog event-driven simulator.",libraries:"No library needed for a combinational continuous assignment. Use iverilog or commercial HDL tools for complete simulation.",src:[
 "// One-bit combinational AND example.",
 "module and_gate(input wire a, input wire b, output wire y);",
 "  assign y = a & b; // Updates when a or b changes.",
 "endmodule"
 ].join("\n")},
 sv:{title:"SystemVerilog",file:"xor_gate.sv",ext:"sv",description:"Executable one-bit continuous assignment subset. Assertions, classes, UVM and testbenches require a SystemVerilog simulator.",libraries:"SystemVerilog logic is a four-state type, but this limited truth-table runner only evaluates 0 and 1.",src:[
 "// One-bit SystemVerilog XOR demonstration.",
 "module xor_gate(input logic a, input logic b, output logic y);",
 "  assign y = a ^ b; // Explicit combinational output.",
 "endmodule"
 ].join("\n")}
};
function diagnose(src,lang){
 const errors=[];let open=[];
 const pair={"}":"{",")":"(","]":"["};
 // Simplified comments and strings omitted; not a complete compiler parser.
 const sanitized=src.replace(/"([^"\\]|\\.)*"|'([^'\\]|\\.)*'/g,'""').replace(/\/\/.*$/gm,'');
 for(let i=0;i<sanitized.length;i++){
  const ch=sanitized[i];
  if("{([".includes(ch))open.push([ch,i]);
  else if("})]".includes(ch)&&(!open.length||open.pop()[0]!==pair[ch]))errors.push("Unbalanced closing bracket near character "+(i+1));
 }
 if(open.length)errors.push("Unclosed "+open.length+" opening bracket(s)");
 if(lang==="c"||lang==="stm32"||lang==="arduino"){
  if(!src.includes("{"))errors.push("Missing function body");
  if(lang==="c"&&!/int\s+main\s*\(/.test(src))errors.push("C entry point int main(...) not found");
  if(lang==="arduino"&&(!/void\s+setup\s*\(/.test(src)||!/void\s+loop\s*\(/.test(src)))errors.push("Arduino needs setup() and loop()");
  if(lang==="stm32"&&!/HAL_/.test(src))errors.push("No HAL_ API call detected");
  if(/(^|\n)\s*(?:double|int|float)\s+\w+\s*=\s*[^;\n]+$/m.test(src))errors.push("Possible missing semicolon");
 }
 if(lang==="python"){
  if(/^\s*for\s+\w+.+[^:]\s*$/m.test(src))errors.push("Possible missing colon on for statement");
 }
 return errors;
}
function rtl(src){
 const match=src.match(/\bassign\s+([A-Za-z_]\w*)\s*=\s*([A-Za-z_]\w*)\s*([&|^])\s*([A-Za-z_]\w*)\s*;/);
 if(!match)return {error:"Only a one-bit continuous assign of the form 'assign y = a & b;' (also | or ^) is runnable. No hardware simulation was attempted."};
 const [,out,left,op,right]=match;
 const vals=[[0,0],[0,1],[1,0],[1,1]].map(([a,b])=>[a,b,op==="&"?(a&b):op==="|"?(a|b):(a^b)]);
 return {out,left,right,op,vals};
}
function outputRTL(src){
 const r=rtl(src);if(r.error)return "[ERROR] "+r.error;
 return "[SIMULATED SUBSET] Logic assignment parsed: "+r.out+" = "+r.left+" "+r.op+" "+r.right+
 "\n"+r.left+" "+r.right+" | "+r.out+"\n"+r.vals.map(row=>row[0]+" "+row[1]+" | "+row[2]).join("\n")+
 "\n[PASS] 4 binary truth-table combinations were evaluated. X/Z/timing not supported.";
}
function mount(root){
 if(!root)return;
 root.innerHTML='<div class="aca-card"><h3>Multi-language editor and execution terminal</h3><p>Python executes in a WebAssembly worker if the external runtime loads. Verilog/SystemVerilog evaluate a small stated logic subset. C, Arduino and STM32 run static checks only—not fake compilers or firmware.</p>'+
 '<div class="aca-forms"><label>Language / toolchain<select id="ideLang"><option value="python">Python 3</option><option value="c">C11</option><option value="arduino">Arduino C++</option><option value="stm32">STM32 HAL C</option><option value="verilog">Verilog</option><option value="sv">SystemVerilog</option></select></label><button id="ideReset">Load annotated example</button><button id="ideRun">▶ Run / Analyze</button><button id="ideStop">■ Stop</button><button id="ideDownload">Download source</button><button id="ideStore">Save local draft</button></div>'+
 '<div id="ideInfo" class="aca-note"></div><div class="aca-ide"><div class="aca-ide-head"><span id="ideFile"></span><span id="ideLines"></span></div><textarea spellcheck="false" id="ideSource" aria-label="Editable source code"></textarea></div>'+
 '<div class="aca-forms"><label>Sample input / runtime notes<textarea id="ideInput" rows="2" placeholder="Enter notes; Python example uses constants in source. stdin is not interactive here."></textarea></label></div>'+
 '<div class="aca-terminal"><div class="aca-terminal-head"><span>●</span><strong>OUTPUT · DIAGNOSTICS</strong><button id="ideClear">Clear</button></div><pre id="ideOutput" role="status" aria-live="polite">Ready. Choose a language and press Run / Analyze.</pre></div>'+
 '<details><summary>Compiler and package details / genuine runtime limitations</summary><p>Full C11 needs GCC or Clang; Verilog/SystemVerilog needs an HDL simulator; STM32 HAL needs STM32CubeIDE and the exact board project; Arduino needs Arduino CLI or IDE. No arbitrary firmware, pin toggling, HDL timing or native executable is emulated here. Python downloads the Pyodide WebAssembly runtime on explicit execution; use trusted code only, and do not paste passwords or employer source. Worker is terminated on timeout.</p></details></div>';
 const $=q=>root.querySelector(q);let lang="python",worker=null,deadline=null;
 const saved={};
 function log(s){$("#ideOutput").textContent+=(s||"")+"\n"}
 function stop(){if(worker){worker.terminate();worker=null}if(deadline){clearTimeout(deadline);deadline=null}}
 function update(){
  const ex=demos[lang];$("#ideFile").textContent=ex.file;$("#ideInfo").textContent=ex.description+" Library choice: "+ex.libraries;
  const x=$("#ideSource").value;$("#ideLines").textContent=x.split("\n").length+" lines";
 }
 function setLang(next,reset=false){
  if(!reset)saved[lang]=$("#ideSource").value;
  stop();lang=next;$("#ideLang").value=lang;
  let existing=null;try{existing=localStorage.getItem("academy-ide-"+lang)}catch{}
  $("#ideSource").value=reset?demos[lang].src:(saved[lang]||existing||demos[lang].src);
  $("#ideOutput").textContent="Ready. "+demos[lang].description+"\n";update();
 }
 $("#ideLang").onchange=()=>setLang($("#ideLang").value);
 $("#ideSource").oninput=update;
 $("#ideReset").onclick=()=>{saved[lang]="";setLang(lang,true)};
 $("#ideStop").onclick=()=>{stop();log("[STOP] Runtime worker stopped. No code remains executing in this page.")};
 $("#ideClear").onclick=()=>$("#ideOutput").textContent="";
 $("#ideStore").onclick=()=>{try{localStorage.setItem("academy-ide-"+lang,$("#ideSource").value);log("[SAVED] Draft stored locally in this browser.")}catch(e){log("[ERROR] Local storage unavailable: "+e.message)}};
 $("#ideDownload").onclick=()=>{
  const ex=demos[lang],url=URL.createObjectURL(new Blob([$("#ideSource").value],{type:"text/plain"})),a=document.createElement("a");
  a.href=url;a.download=ex.file;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 $("#ideRun").onclick=()=>{
  stop();const code=$("#ideSource").value;$("#ideOutput").textContent="$ "+(lang==="python"?"python3":lang==="verilog"||lang==="sv"?"rtl-subset":lang==="c"?"clang -fsyntax-only (emulated analyzer)":lang==="stm32"?"stm32-project-check":"arduino-project-check")+" "+demos[lang].file+"\n";
  const diagnostics=diagnose(code,lang);
  if(diagnostics.length){diagnostics.forEach(s=>log("[ERROR] "+s));log("[FAILED] Resolve syntax issues before running.");return}
  if(lang==="verilog"||lang==="sv"){log(outputRTL(code));return}
  if(lang!=="python"){log("[STATIC ANALYSIS] Balanced brackets / limited required structure passed.");log("[NOT COMPILED] Native C/C++/HAL compilation and execution are unavailable in this static website.");return}
  log("[PYTHON] Loading WebAssembly worker; network required. Maximum runtime: 18 seconds.");
  worker=new Worker("simulation/academy_pyworker.js?v=15");
  worker.onmessage=event=>{
   const data=event.data||{};
   if(data.kind==="status")log("[PYTHON] "+data.message);
   if(data.kind==="error"){log("[ERROR] "+data.message);stop()}
   if(data.kind==="done"){if(data.stdout)log(data.stdout.trimEnd());if(data.stderr)log("[STDERR]\n"+data.stderr.trimEnd());log(data.stderr?"[FAILED] Python raised an exception.":"[PASS] Python execution completed.");stop()}
  };
  worker.onerror=()=>{log("[ERROR] WebAssembly runtime unavailable or blocked. Check online connectivity.");stop()};
  worker.postMessage({cmd:"run",code});
  deadline=setTimeout(()=>{log("[TIMEOUT] Python worker terminated after 18 seconds.");stop()},18000);
 };
 window.academyUseGeneratedCode=(name,text)=>{saved[lang]=$("#ideSource").value;setLang(name,true);$("#ideSource").value=text;update();log("[IMPORTED] Pin-configuration sketch loaded. Review and validate before hardware use.")};
 setLang("python",true);
}
window.mountAcademyIDE=mount;
window.academyExamplePrograms=demos;
window.academyRtlSubset=rtl;
window.academyStaticDiagnostics=diagnose;
})();