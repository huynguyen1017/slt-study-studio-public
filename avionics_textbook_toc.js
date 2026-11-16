"use strict";
/* Textbook table-of-contents mapping, not access to full chapter bodies.
   Titles/starting pages observed in user's connected VitalSource reader.
   Source: Floyd/Buchla, Principles of Electric Circuits, ISBN 9780134880068. */
(function(){
const chapters=[
 [1,"Quantities and Units",1,["units"]],
 [2,"Voltage, Current, and Resistance",21,["ohm","schematics","instruments"]],
 [3,"Ohm's Law",76,["ohm"]],
 [4,"Energy and Power",102,["power","power-rails"]],
 [5,"Series Circuits",125,["series"]],
 [6,"Parallel Circuits",181,["parallel"]],
 [7,"Series-Parallel Circuits",235,["series","parallel","thevenin"]],
 [8,"Circuit Theorems and Conversions",290,["thevenin"]],
 [9,"Branch, Loop, and Node Analyses",349,["kcl-kvl"]],
 [10,"Magnetism and Electromagnetism",390,["magnetics","inductors"]],
 [11,"Introduction to Alternating Current and Voltage",437,["ac"]],
 [12,"Capacitors",502,["capacitors"]],
 [13,"Inductors",563,["inductors"]],
 [14,"Transformers",605,["magnetics"]],
 [15,"RC Circuits",644,["rc"]],
 [16,"RL Circuits",724,["inductors"]],
 [17,"RLC Circuits and Resonance",777,["filters"]],
 [18,"Passive Filters",833,["filters"]],
 [19,"Circuit Theorems in AC Analysis",867,["ac","thevenin","filters"]],
 [20,"Time Response of Reactive Circuits",901,["rc","inductors","capacitors"]],
 [21,"Three-Phase Systems in Power Applications",947,["magnetics"]]
];
const all=chapters.map(x=>({number:x[0],title:x[1],startPage:x[2],topics:x[3]}));
const source={title:"Principles of Electric Circuits",authors:"Thomas L. Floyd and David M. Buchla",isbn:"9780134880068",bookUrl:"https://bookshelf.vitalsource.com/reader/books/9780134880068",evidence:"Chapter names and initial pages were read from the connected VitalSource table of contents. Only the supplied Chapter 1 excerpt was available for definition-level checking; this is a subject mapping, not evidence that pages in other chapters have been read.",chapters:all};
window.AVIONICS_TEXTBOOK_TOC=source;
})();