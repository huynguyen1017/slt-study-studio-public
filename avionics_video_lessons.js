"use strict";
/* Verified exact video destinations only where sourced; otherwise source-specific
   YouTube searches, clearly marked as searches rather than falsely vetted videos. */
(function(){
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const verified={
 ohm:[
  ["Ohm's law | Physics","Khan Academy","FuIn1L3qeqI","Derive current versus voltage, unit interpretation and ohmic/non-ohmic devices."],
  ["Ohm's Law","The Organic Chemistry Tutor","_rSHqvjDksg","Worked calculations and series/parallel circuit examples."]
 ],
 series:[
  ["Series and parallel circuits | Physics","Khan Academy","1ASc6piVKhQ","Single current path, shared nodes, and voltage/current comparison."],
  ["Ohm's Law","The Organic Chemistry Tutor","_rSHqvjDksg","Series and parallel numerical practice."]
 ],
 parallel:[
  ["Series and parallel circuits | Physics","Khan Academy","1ASc6piVKhQ","Branch voltages and current division."],
  ["Ohm's Law","The Organic Chemistry Tutor","_rSHqvjDksg","Current paths and equivalent loads."]
 ],
 capacitors:[
  ["Capacitors — Basic Introduction","The Organic Chemistry Tutor","BimpNou0orc","Charge, capacitance and energy calculations."],
  ["Series and parallel circuits | Physics","Khan Academy","1ASc6piVKhQ","First understand nodes and connections (not a capacitor tutorial)."]
 ],
 rc:[
  ["RC Circuits Physics Problems","The Organic Chemistry Tutor","PLQrPqYlPmI","Charging, discharging and time constants."],
  ["Series and parallel circuits | Physics","Khan Academy","1ASc6piVKhQ","Prerequisite: current paths and resistor nodes."]
 ],
 instruments:[
  ["Oscilloscope Pro — How to Use an Oscilloscope","Keysight Labs","t_UTV_9dpTc","Scope probes, scaling, triggers and measured waveforms."],
  ["Getting Started with STM32 Nucleo","DigiKey","hyZS2p1tW-g","A real board, CubeIDE debugger and peripheral connections."]
 ],
 buses:[
  ["Getting Started with Nucleo — SPI","DigiKey","eFKeNPJq50g","NUCLEO-L476RG SPI signals and logic-analyzer waveform."],
  ["Series and parallel circuits | Physics","Khan Academy","1ASc6piVKhQ","Electrical prerequisites only; use the targeted second search for protocol details."]
 ],
 components:[
  ["Getting Started with STM32 and Nucleo","DigiKey","hyZS2p1tW-g","GPIO, LED, built-in debugger and STM32CubeIDE."],
  ["Ohm's Law","The Organic Chemistry Tutor","_rSHqvjDksg","Select resistor values and understand current limiting."]
 ],
 schematics:[
  ["Getting Started with STM32 and Nucleo","DigiKey","hyZS2p1tW-g","Board components and basic debugging."],
  ["Oscilloscope Pro","Keysight Labs","t_UTV_9dpTc","Verify expected node waveforms with proper probes."]
 ],
 "power-rails":[
  ["Oscilloscope Pro","Keysight Labs","t_UTV_9dpTc","Probing rail transients and triggering."],
  ["Ohm's Law","The Organic Chemistry Tutor","_rSHqvjDksg","Fundamental load-current calculation."]
 ],
 timing:[
  ["Oscilloscope Pro","Keysight Labs","t_UTV_9dpTc","Timing, trigger and pulse width."],
  ["Getting Started with STM32 Nucleo","DigiKey","hyZS2p1tW-g","Using the IDE and target board for clocked firmware."]
 ]
};
const channels={
 units:["Khan Academy","The Organic Chemistry Tutor"],
 ohm:["Khan Academy","The Organic Chemistry Tutor"],
 power:["Khan Academy","The Organic Chemistry Tutor"],
 series:["Khan Academy","The Organic Chemistry Tutor"],
 parallel:["Khan Academy","The Organic Chemistry Tutor"],
 "kcl-kvl":["Khan Academy","The Organic Chemistry Tutor"],
 thevenin:["Neso Academy","The Organic Chemistry Tutor"],
 ac:["Khan Academy","The Organic Chemistry Tutor"],
 capacitors:["Khan Academy","The Organic Chemistry Tutor"],
 rc:["Khan Academy","The Organic Chemistry Tutor"],
 inductors:["Khan Academy","The Organic Chemistry Tutor"],
 filters:["Neso Academy","All About Electronics"],
 magnetics:["Khan Academy","The Organic Chemistry Tutor"],
 components:["DigiKey","The Organic Chemistry Tutor"],
 "power-rails":["Keysight Labs","DigiKey"],
 schematics:["DigiKey","Keysight Labs"],
 instruments:["Keysight Labs","Tektronix"],
 timing:["Keysight Labs","DigiKey"],
 buses:["DigiKey","STMicroelectronics"],
 "python-scpi":["Keysight Labs","PyVISA"],
 linux:["DigiKey","freeCodeCamp.org"],
 rf:["Keysight Labs","Rohde & Schwarz"],
 qualification:["NASA","ESA"]
};
const phrase={
 units:"SI base units metric prefixes electrical engineering",power:"electrical power energy watt joule",
 "kcl-kvl":"Kirchhoff current voltage law node mesh",thevenin:"Thevenin Norton equivalent source transformation",
 ac:"alternating current AC RMS phase",inductors:"inductor RL circuits flyback diode",
 filters:"RC high pass low pass frequency response",magnetics:"transformer inductance three phase",
 "power-rails":"power supply ripple load transient probing",schematics:"PCB breadboard circuit troubleshooting",
 instruments:"oscilloscope digital multimeter probe",timing:"oscilloscope PWM timing setup hold",
 buses:"STM32 UART SPI I2C Nucleo L476RG", "python-scpi":"SCPI PyVISA instrument automation",
 linux:"Linux serial embedded validation logs",rf:"VNA S11 return loss spectrum analyzer",
 qualification:"spacecraft avionics testing thermal vacuum"
};
const searchLink=(q,channel)=>"https://www.youtube.com/results?search_query="+encodeURIComponent(q+" "+channel);
function selected(q,t){
 const curated=verified[t.id]||[];
 const subject=String(q.skillName||phrase[t.id]||t.title).replace(/[“”]/g,"").slice(0,100);
 // Preserve subject relevance when numerical questions or failure reports omit a
 // skill name, so a remote search never uses an entire verbose question statement.
 const detail=(q.level==="Calculation"?"examples calculations":q.level==="Troubleshooting"?"troubleshooting measurements":"beginner practical circuit");
 const target=subject+" "+detail;
 const sources=channels[t.id]||["Khan Academy","DigiKey"];
 return sources.slice(0,2).map((source,i)=>{
   const exact=curated.find(x=>x[1]===source);
   const link=exact?"https://www.youtube.com/watch?v="+exact[2]:searchLink(target,source);
   return {source,title:exact?exact[0]:target,kind:exact?"verified-video":"source-targeted-search",
    relevance:exact?exact[3]:"A channel-specific video search for this question; individual video rankings and availability have not been independently verified.",
    url:link,
    searchUrl:searchLink(target,source)};
 });
}
function render(q,t){
 const vids=selected(q,t);
 const phase=q.difficulty<=5?"01 · Understand":q.difficulty<=10?"02 · Apply":q.difficulty<=20?"03 · Calculate":"04 · Diagnose";
 return '<section class="av-video-lessons" data-video-question="'+esc(q.id)+'" aria-label="Watch two video-learning sources for this question">'+
 '<div class="av-video-heading"><h4>Watch & learn — '+esc(q.id.toUpperCase())+'</h4><span>'+phase+' · 2 sources</span></div>'+
 '<p>Two independent teaching sources selected for this question. Open a video, note one idea, then come back to solve without reading the answer. Individual video counts and ratings are not live ranking data.</p>'+
 '<div class="av-video-grid">'+vids.map((v,i)=>
  '<article class="av-video-card"><strong>'+(i===0?'A · ':'B · ')+esc(v.source)+'</strong>'+
  '<p>'+esc(v.title)+'</p><small>'+esc(v.relevance)+'</small>'+
  '<a href="'+esc(v.url)+'" target="_blank" rel="noopener noreferrer">'+(v.kind==="verified-video"?"Watch verified video ↗":"Find matching videos from this source ↗")+'</a>'+
  '<a class="av-video-search" href="'+esc(v.searchUrl)+'" target="_blank" rel="noopener noreferrer">Search exact question concept ↗</a></article>'
 ).join("")+'</div>'+
 '<p class="av-video-note">Video pages are provided by their publishers. A verified link confirms the video subject and source, not that its ranking is currently the highest.</p>'+
 '</section>';
}
window.avionicsVideoLessons={render,selected,channels};
})();