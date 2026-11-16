# Open SLT Study Studio

## Avionics EE Practice Academy (23 topics × 30 original questions)

### Updated question browser and answer feedback (v4)

- **Browse all 30 questions** presents actual question titles, their learning levels and progress states. Selecting a card opens that exact question at the top of the workbook and resets filters if necessary.
- **Try It** now has an offline formative checker: numeric questions validate values and compatible units (plus likely 1000× conversion errors); written answers receive a transparent concept rubric with **likely correct / partially correct / needs correction**, recognized and missing ideas, and targeted suggestions. Written grading uses keyword/rule heuristics and is **not a reliable judge of all valid paraphrases**; it does not call a hosted AI grader. Full mastery requires a successful check.
- **Baby Steps** includes the question's circuit schematic on each step, and conditionally opens a waveform/response graph or wiring/test-setup illustration when relevant.
- Existing browser-local completion records remain under \`slt-avionics-ee-practice-v1\`; new feedback and responses are stored separately within that same local record. No learner answers are uploaded.
- New regression \`tests/avionics-assessor.test.cjs\` checks all 690 question rubrics, textbook-important SI base-vs-derived distinctions, numerical unit conversions, partial answers and misconceptions. The workbook browser test now checks selecting question 13 of 30, circuit visuals in baby steps, and answer feedback.

### Per-question original SVG visual explorer (v3)

Every existing Avionics EE Practice question now has a **four-page** guided workbook: Understand → Visuals → Baby Steps → Try It. The Visuals page contains three independently zoomable, accessible SVG figures:

- **Circuit schematic:** resistor/source, series/parallel, reactive components, signals or an engineering test-system path; labels reflect known quantities from the question, with unknowns shown symbolically.
- **Concept graph:** source/signal behavior, current-flow illustration or response curve. Simulated/normalized plots are explicitly marked as illustrative rather than real instrument captures.
- **Breadboard or bench wiring:** labeled breadboard rows/columns for simple low-voltage topologies; otherwise a relevant instrument/DUT connection diagram. Generic drawings **are not verified manufacturer pinouts or safe build instructions**.

The original 690 questions, numerical MathML equations, grading, review status and browser-local progress key remain unchanged. Everything renders locally without uploading user data, downloading image assets or reproducing textbook figures. Renderer: `avionics_visuals.js` and `avionics_visuals.css`. Regression verifies all 690 × 3 SVGs and desktop/mobile visual navigation.



Open [Avionics EE Practice](https://huynguyen1017.github.io/slt-study-studio-public/#avionics) in the navigation bar.

- 690 original practice exercises: five foundations, five applications, ten numerical calculations, and ten troubleshooting scenarios per topic.
- Coverage: SI units, Ohm's law, power, series/parallel, KCL/KVL, Thevenin/Norton, AC, capacitors, RC, RL, RLC/filters, magnetics/transformers, diodes/MOSFETs, power rails, schematic reading and PCBA bring-up, oscilloscope/DMM measurements, digital timing, UART/SPI/I2C/CAN, Python SCPI/VISA, Linux logs, RF, and spacecraft qualification.
- Worked numerical solutions have symbolic equations and actual numeric substitution displayed as **native MathML** using the existing offline math renderer.
- Numeric answers accept scientific notation with 1.2% rounding tolerance; every question has step-by-step explanations, optional hints, and self-assessment.
- Progress is separate from original cards and stored locally under `slt-avionics-ee-practice-v1`; users can export it.
- Exercises are originally authored using the broad chapter topics of Floyd and Buchla's *Principles of Electric Circuits* as curriculum guidance. No protected textbook problem text is copied.
- Avionics examples are educational and not proprietary Muon Space procedures.
- Tests: `node tests/avionics-academy.test.cjs` plus Chromium desktop/mobile regression in `.github/workflows/avionics-academy.yml`.

Files: `avionics_data.js`, `avionics_questions.js`, `avionics_practice.js`, and `avionics_practice.css`.
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


## Public release: offline + interactive electrical consequences

The public site contains the original 100 cards, seven original graded labs,
the waveform and board-level ngspice exercises, plus these additions:

- **16 distinct interactive quiz-choice effects** (4 questions × 4 choices).
  Each reveals a physical mechanism or misconception. Spark/heat imagery is
  restricted to the clearly identified separate 12V/near-short fault example,
  whose electrical power is simulated but thermal/smoke effects are hypothetical.
- **Phone-fit analog plots and board diagram**: compact 360-unit SVG layouts
  on portrait phones, with synchronized time cursor and component readings.
  Original higher-detail SVGs remain visible on larger screens; no 850px forced
  scroll width on phone displays.
- **Offline-first install**: PWA manifest plus same-origin service worker
  caching 90 HTML/CSS/JS/image/netlist assets. After the first successful online
  visit, core cards, labs, simulations and mathematical formatting are available
  offline. Storage policies vary by browser. No external API results are
  required to operate the core practice experience.
- **Privacy-first learning agents**: an on-device, rules-based concept coach,
  a connectivity monitor with offline/degraded status, and an optional online
  research assistant. The research assistant searches Wikipedia and OpenAlex
  on demand, with opt-in 25-second rotation. No paid AI API or embedded
  secret credentials are required; the coach is not represented as a cloud LLM.
- **3D cards and local study notes**: flip, next/previous, shuffle,
  15-second opt-in autoplay, Again/Good/Easy review scheduling, custom cards
  saved to browser storage, and JSON backup. The separate pasted 645-card
  catalog was a reference; only the 100 reviewed public cards already in this
  repository were reused, not fabricated or silently bulk-imported.
- **University resources**: direct links to official SFSU ENGR 852,
  Berkeley EECS 151, MIT 6.5910 (former 6.375), Stanford EE 271 pages.
- **Public-brand/tracking audit**: no assistant-branded labels, referral
  parameters, credential files or private work folders in the shipped site.

The 8789 local developer/VCD studio was inspected only as a *read-only*
reference for time-based signal inspection. Nothing in that site's code or
runtime was changed, stopped, overwritten or deployed.


## Professional four-channel waveform console (2026-11)

The original phone-fit waveform and SPICE labs remain available.
A newly integrated, independently calibrated, four-channel instrument
console is now shown on every flashcard's Deep Dive page, at every
step in all seven graded Guided Labs, and alongside the interactive
reset-sequencing Waveform Lab. It supports trigger, time/div,
run/stop/single, zoom, interactive A/B cursors, annotated events,
min/max/peak-to-peak readouts and responsive mobile channel views.

The signal profile changes with the question: electrical rail,
I2C, DRAM, PCIe, RTL bus, setup/hold, clock, UART boot, differential
signaling, transmission-line reflection, serial link, and
diagnostic/debug event timeline all use different labeled signals.
Stored ngspice samples are identified separately from synthetic
educational traces. See simulation/INSTRUMENT_METHOD.md for
measurement limitations, provenance and channel interpretation.

An uploaded confidential oscilloscope deck served solely as private
design reference for the look and interpretation of instrument
controls. No confidential screenshot, board identifier, test command,
or measured numeric values was published.

## Multicycle transient oscilloscope (November 2026)

The lower board-level waveform viewer now defaults to a **240 ns,
six-channel multicycle ngspice trace** for the selected circuit.
All 48 original selectable configurations were re-simulated with
a pulsed 80 ns source and optional 60 ns pulsed low-side NMOS.
Changing Rseries, L, C, Vsource, or NMOS selects its corresponding
actual simulated trace. The original 16 ns transient can still be
selected for single-edge examination.

Playback is a progressive acquisition animation of recorded samples
rather than a cursor gliding over a static chart. Event selection and
the 3.6 ns edge microscope expose real SPICE-simulated ringing,
overshoot, settling and rising/falling edges. The diagram and physical
node readouts track the acquisition time. A baseline comparison
option overlays a separately simulated reference circuit. Voltage,
current, and derived resistor dissipation use different calibrated
lanes; power is not a validated thermal failure forecast.

For phone users, an **Open full screen** control displays a
full-viewport interactive scope without making the rest of the
notebook horizontally overflow. The companion Deep Dive voltage
teaching model also gained three illustrative load bursts and
progressive replay.

Simulation evidence, build instructions and limitations are in
[simulation/board/MULTICYCLE_METHOD.md](simulation/board/MULTICYCLE_METHOD.md).
A simulated result is **not** a measured oscilloscope capture. The
public static site uses precomputed runs rather than executing ngspice
on users' devices. The local reference application on port 8789 was
not changed.
