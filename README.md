# Open SLT Study Studio
Free, publicly accessible learning practice for system-level testing and post-silicon hardware validation.
No account required. Progress stays in browser localStorage on the visitor's own device.

* **100 public-safe flashcards**, with short explanations and debugging reasoning.
* **7 guided labs**, including wrong-answer hints and retry logic.
* Interactive illustrative clock/power/reset waveform lab.
* Static HTML/CSS/JavaScript only; no credentials, cookies, analytics, backend, or private Drive links.
* Not affiliated with NVIDIA or any employer. Numerical timing examples are teaching models, not guaranteed hardware specifications.
* The private source edition and user's personal work records are not part of this distribution.
* Code is publicly viewable, but no open-source redistribution license has been granted.

## Source content protection
This is a filtered and generalized educational edition. Never upload the private cards.js, mobile_server.py, .config, passwords, or original work records.

## Three-page illustrated answers
Each of the 100 public cards opens a three-page, responsive engineering-notebook answer:
1. **Overview** — core idea, source-based explanation, and an annotated system diagram.
2. **Deep dive** — conceptual waveform or block-diagram illustration, relevant equations, and mechanism explanations.
3. **Lab steps** — source-derived debugging steps, a conceptual bench diagram, and links to the unchanged interactive practice modes.

Vector illustrations are interactive/browser-rendered and remain readable when scrolling horizontally on phones. They are **not hardware captures** and are not presented as measured validation results.

The separate graded-lab questions (7 labs / 26 steps) and the adjustable waveform lab are still active, with their original logic preserved. Existing browser progress remains in its same localStorage namespace. Expanded public excerpts were editorially checked for cut-off sentence fragments.

## Circuit-simulator waveform flashcard (ngspice-47)

The first Signal Integrity flashcard, **Page 2 · Deep Dive**, now includes an
interactive oscilloscope-like viewer based on actual ngspice-47 transient output.

- Select among 7 completed simulation runs and compare the source, transmitter,
  and receiver voltages.
- Move a cursor to inspect time and voltage, replay, zoom, pan, toggle traces,
  download CSV, and open a reproducible source netlist.
- Answer 4 stepwise questions about reflection coefficient, first arrival,
  package parasitics, and the meaning of a matched load.
- Incorrect choices reveal hints and allow retries. The original 7 guided
  labs / 26 steps and the original reset waveform lab remain unchanged.

The ngspice model uses a 50-ohm ideal transmission line with 1-ns propagation delay.
It is an illustrative *circuit simulation*, not a measurement of a physical board.
Synopsys VCS, HSPICE and Verdi were not used or independently verified for these
waveforms. GitHub Pages serves precomputed samples, not an on-demand ngspice backend.
See simulation/README.md and simulation/verification_manifest.json for details.

## Component and board-level interactive SPICE lab

Signal Integrity flashcard, Page 2 (Deep Dive) now includes a new
component-and-board lab below the existing waveform viewer. It includes:

- Connected source, 20Ω driver, bypass/33Ω series resistor, 1/10nH
  trace inductance, 2/30pF shunt capacitor, 200Ω load and optional NMOS.
- 48 independently computed ngspice-47 model runs, selectable by
  0.8/1.2/1.8V source, R, L, C and MOSFET branch.
- Node voltage colors and readings linked to the waveform time cursor;
  source, TX, RX, gate and trace-current waveforms.
- Derived component voltage drops, charge, energy and resistor power.
- Four guided component-selection quiz questions with hints and retries.
- Reproducible circuit netlists, raw data, and hash verification under
  simulation/board.

The public static app switches between **completed** ngspice simulations,
rather than executing ngspice on demand in the browser. It does not
claim to simulate measured physical boards or Synopsys/Verdi output.
Original flashcards, seven guided labs, and original waveform mode remain.

## Math, diagnostic quiz, instrument cursors and fault injection

The first Signal Integrity Deep Dive now includes native MathML
equations (structured fractions, subscripts, superscripts), dual
instrument-style cursors (A/B, difference in time and voltage),
event annotations, and a more detailed scope readout. The VCD studio
on the user's local port 8789 was consulted for the methodology of
time-indexed signal inspection, cursor, zoom/pan, and event tracking.

Correct and incorrect selections in the component quiz now highlight
the actual connected source, resistor, load or NMOS branch and explain
the associated physical behavior. A wrong click cannot burn hardware.

The separate Fault-Injection Explorer exposes five independently
completed ngspice-47 circuits under normal/shorted conditions. Their
voltage/current and resistor power are computed electrically. A
clearly labeled first-order thermal estimate can animate an assumed
overheating risk for severe overload. It does not claim a real fire
or simulate electrothermal failure. See simulation/faults/README.md.

The public flashcard content, the seven original graded labs and the
separate original waveform-practice mode are preserved.
