## Beginner-to-advanced Avionics Workbooks with STM32 Nucleo and video resources (v9)

The 23 topics now each have 30 original questions ordered progressively: 1–5 explain/differentiate/draw/predict, 6–10 set up lab experiments, 11–20 calculate with units, and 21–30 isolate faults with controlled evidence. Existing question identifiers and stored numerical answers are retained.

STM32 NUCLEO-L476RG connector truth comes from the official STMicroelectronics UM1724 Rev 17 manual (Figure 23, Arduino Table 23 and Morpho Table 32): https://www.st.com/resource/en/user_manual/dm00105823.pdf . Representative connectors: PA0/A0 CN6 28; +3V3 CN6 16; GND CN6 20; PA5/D13 CN10 11; PB8/SCL CN10 3; PB9/SDA CN10 5; PA2/USART2 TX CN10 35; PA3/USART2 RX CN10 37. Actual alternate-function availability and solder-bridge configuration must be checked with device and board documentation.

The question-specific educational layouts include GPIO LED/resistor, voltage divider/ADC, resistance, 2/3 branch networks, KVL series drops, RC low/high-pass, bypass capacitors, generic logic and MOSFET modules, external pushbutton, oscilloscope, and UART/SPI/I2C peripherals with their signal nets. Generic external module connector assignments are teaching assumptions, not independently verified commercial breakout pinouts. Never connect a physical device just from the drawing.

The detailed 63-row breadboard view is accompanied by a separately expandable overview of the actual 3220 tie-point large-board architecture: four 630-point terminal strips and seven 100-point distribution strips, with four binding posts. Manufacturer: https://makeronics.com/product/makeronics-3220-point-solderless-breadboard/ . Separate terminal and distribution sections must be bridged deliberately; never assume their power rails are electrically continuous. The large image loads only when expanded to keep the workbook responsive.

Voltage examples above the STM32 3.3 V GPIO range are not presented as safe direct Nucleo input wiring. MCU pinout diagrams are not proof of a connected lab circuit. STM32CubeMX and STM32CubeIDE are linked to their official ST product pages as downloadable desktop tools rather than misrepresented as in-page simulators.

Every Understand page now presents two distinct educational video sources. Individually verified URLs include Khan Academy, The Organic Chemistry Tutor, DigiKey's NUCLEO-L476RG STM32CubeIDE tutorials, and Keysight Labs; where an exact video has not been verified, a targeted YouTube search is labeled as a search rather than claiming it is a highly rated video. No direct YouTube playback or external tracking is initialized by default.

The test file tests/avionics-progressive-nucleo-videos.test.cjs checks every 30-step topic, two distinct video sources, ST pin mappings, a 3220-hole large-board overview, engineering SVG output, and GPIO voltage limits. Existing browser and problem-bank regression tests remain included.


## Question-driven 3-panel wiring and optional live simulator (v8)

Source audit, before changes: the 690 questions used only 66 distinct physical wiring configurations across the existing panel templates. The dedicated question-aware wiring model now modifies the fixture category, measured quantity, matched current/voltage/continuity instrument mode, chosen measurement nodes, connected breadboard rows, component values (if provided), optional parallel branch count for conceptual examples, diagnostic fault focus, and per-question wiring arrangements. A standalone test verifies 690 configurations across 23 topics, at least 550 distinct non-ID-only design signatures, and no out-of-range breadboard coordinates. Not all 690 questions describe unique physical circuits; this is variation in meaningful layouts and measurement focus rather than a claim that all circuit topologies differ.

**Corrected routing bug:** Previously `kcl-kvl` was included in the classifier keyword text, which caused an unrelated KVL exercise to be routed to the KCL junction setup. Topic identifiers are now excluded from decision keywords, and Kirchhoff's Voltage Law exercises route to their voltage-loop examples.

**Physical safety:** The solderless-breadboard model is reserved for appropriate introductory, low-voltage circuit topics. RF, protocol, Linux/SCPI and spacecraft test setups are labeled **virtual signal matrix / fixture diagrams**; their coordinates are not real DUT pinouts, verified breadboard rails, manufacturer connections, or build instructions. Unknown sources and component values remain illustrative.

**CircuitJS1:** For supported simple ideal DC and RC families, the Visuals page generates a small CircuitJS1 `?cct=` circuit URL, shows an optional SPICE-reference netlist, and offers an explicitly opt-in external iframe. The iframe is **not loaded** until the student clicks to open it; unsupported digital, RF, qualification and abstract questions are not secretly converted to generic resistor circuits. Source: https://www.falstad.com/circuit/doc/js-interface.html and https://github.com/pfalstad/circuitjs1. The external simulator remains independent from the website's local answer checker. Same-origin hosting would be needed for direct JavaScript control, and no full ngspice WebAssembly engine is bundled into this release.

**Related repository inspection:** https://github.com/huynguyen1017/motion-estimator-asic-lab-notebook-2026 and https://github.com/huynguyen1017/junior-developer provide HDL verification waveform/notebook and test-log methodology, not physically verified avionics breadboard pinouts. https://github.com/huynguyen1017/slt-kahoot-waveform-studio and this public repository inform the existing waveform and classroom/lab UI. The new wiring renderer builds on local assets in `avionics_visuals.js`, `simulation/lab_bench_studio.js`, and the scoped physical-pin examples in `simulation/academy_pins.js`, without publishing private logs or treating illustrative pin assignments as certified.


## Source-informed Notebook Circuit Labs

The public Avionics workbook now includes 23 original, interactive numeric mini-labs (one per topic), in addition to the existing 690 graded questions. Each has a fresh SVG circuit/logic/waveform/bench diagram, a mathematical equation, numerical substitution, four baby steps, feedback and browser-local completion tracking.

Source basis: the user's 12 Tech 60 and Tech 63 files, including Chapter 1 units, HW2 Ohm's law, HW8 source transformations, Lab 7 circuit measurements, and Tech 63 handwritten logic gates, number systems, full adders, and digital waveforms. No original homework images, handwritten scans, personal names or bench photos are published.

Historical Lab 7: 9 V, R1=330 ohms, R2=1 kilo-ohm, R3=470 ohms, R4=220 ohms, equivalent resistance about 869.73 ohms, expected source current about 10.35 mA. Recorded 9.009 mA total minus recorded branch values (2.968+5.723 mA) yields a 0.318 mA mismatch; conflicting branch voltages also require investigation. Neither deviation establishes a particular root cause.

Original homework errors are teaching opportunities, not certified reference answers: 0.0002 equals 2x10^-4, 3.3x10^6 ohms equals 3.3 mega-ohms, and V=IR. Logic operations must be evaluated as Boolean logic, not unconstrained arithmetic. These corrections are displayed as cautions.

Advanced topics (SCPI, Linux logs, RF and spacecraft verification) are explicitly marked as engineering extensions, not as chapters taught in the attached historical coursework. The website examples are illustrative, not measured hardware outputs or equipment pinouts.

Regression: tests/avionics-notebook.test.cjs independently recomputes all 23 example keys, checks the authored diagrams and grading, and verifies source/privacy boundaries. The existing browser suite tests selected mini-lab interactions and MathML.

### SI textbook accuracy review (Chapter 1)

The original SI base-unit question previously defined *ampere* and *volt* without defining what makes a **base** unit fundamental. The dedicated Chapter 1 teaching panel now distinguishes all **seven SI base units** (m, kg, s, A, K, cd, mol), common derived units (including volt, ohm and watt), historical supplementary units (radian, steradian), and quantity symbols in italic versus unit symbols in upright roman type. Native MathML is used for relationships such as 1 V = 1 W/A. The definition/rubric and visual illustrations were corrected together.

**Source distinction:** The supplied Floyd/Buchla excerpt calls radian and steradian supplementary units (historically correct); this separate SI classification was abolished in 1995. The excerpt also calls gauss a magnetic-flux unit, while NIST/NBS tables identify gauss as **magnetic flux density** and maxwell as **magnetic flux**. The lesson explicitly labels these discrepancies instead of silently rewriting the excerpt.

**Scope:** The user-supplied textbook excerpt covers Chapter 1's *Base and Derived Units* section. Other chapters' complete textbook or lecture pages were not accessible for page-by-page comparison; their lessons remain original engineering explanations, not verified quotations. The automated curriculum audit checks internal alignment of all 23 topics and 690 generated questions, independently evaluates 230 numerical substitutions, and checks the SI distinctions; it is not a claim that every original chapter exercise was matched against the book.

Sources: [BIPM SI Brochure](https://www.bipm.org/en/publications/si-brochure) · [BIPM supplementary-unit reclassification](https://www.bipm.org/en/publications/si-brochure/annex-1/derived-units) · [NIST base units](https://www.nist.gov/si-redefinition/definitions-si-base-units) · [NIST/NBS magnetic units](https://www.govinfo.gov/content/pkg/GOVPUB-C13-aaf879474ebe03fd4c45a247d099163e/pdf/GOVPUB-C13-aaf879474ebe03fd4c45a247d099163e.pdf)


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
