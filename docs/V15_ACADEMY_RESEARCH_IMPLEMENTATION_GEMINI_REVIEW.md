# V15 · Virtual Electronics Academy — requirements, sources, limits and review

## Safety and confidentiality
This is a **public** GitHub Pages educational repository. The user's uploaded CPU2 Workload Profiling deck explicitly says **Confidential + Proprietary**. Do not commit or distribute its slides, device IDs, logs, firmware commands, figures or measured values. All v15 circuit calculations and schematics are independently generated from classroom electronics principles using the user's TECH 60/Physics 2B instructions, not employer material. Original classroom reports and the student's name are likewise not copied into public assets.

## Source-grounded lab designs
**TECH 60 Lab 7 — Series/parallel:** Vs=9 V, R1=330 Ω, R2=1 kΩ, R3=470 Ω, R4=220 Ω. Original handwritten/computer circuit: R1 in series with (R2 parallel R3) in series with R4, DMM and 9 V supply. Derived *ideal predictions*:
- Rparallel = 1000×470/(1000+470) = 319.727891 Ω.
- Rtotal = 869.727891 Ω, current ≈ 10.348064 mA.
- Branch node voltage, KCL and KVL are all recomputed from user input. Physical original breadboard numbers are NOT displayed as fresh measurements.
- Wired validation checks six explicit interconnects; virtual power is not enabled before all six match. Built-in schematic and jumper-wire board visual, voltage probes, DMM readout, and calculated-node CSV.

**Physics 2B — RC:** 4.5 V low-voltage power, 150 Ω resistor, 1.0 F capacitor, charge/discharge. τ=RC, Vcharge(t)=V[1-exp(-t/τ)], Vdischarge(t)=V0 exp(-t/τ), I(t)=±V/R exp(-t/τ), t_half=τ ln2. Scalable waveform, time cursor, sample CSV. Avoid translating the manual's **separate high-voltage neon experiment** into a casual do-it-yourself project.

**TECH 60 Arduino ideas:** sensor, LED/OLED/button architecture inspires raw-ADC and pin-mux teaching exercises. It is a proposal; do not claim demonstrated medical heart-rate accuracy or hardware validation. No live pulse sensor data are collected.

**Physics 2B lab report:** seven sections Title, Purpose, Description, Procedure, Data/Observations, Analysis, Conclusions, with local text areas, simulated-data insertion, preview and Markdown export. Explicitly require response to experiment questions; an exported report is a draft, not an instructor-graded result.

## Public manufacturer pinout references
- Arduino Uno Rev3 official: https://docs.arduino.cc/hardware/uno-rev3/ — ATmega328P, 16 MHz, 14 digital pins, 6 PWM and 6 ADC; 5 V I/O.
- STM32 NUCLEO-L476RG in UM1724 Rev 17, Table 23: https://www.st.com/resource/en/user_manual/dm00105823.pdf — PA5/D13 LED; PA0/A0 ADC, PA6/D12, PA7/D11, PB8/D15 I2C1_SCL, PB9/D14 I2C1_SDA, PA2 TX, PA3 RX. PC13 is user button.
- Pin selector deliberately covers only the curated subset and detects invalid alternate-function selection and duplicate use of single UART/I2C signals. Not a replacement for STM32CubeMX or complete electrical/AF database.

## ENGR 844 GPIO and quadrature lesson
The user's ENGR 844 Lab 1 report (October 2026, supplied via connected Drive) documents a NUCLEO-L476RG plus Keysight EDU33212A generator and EDUX1052G oscilloscope:
- Square wave generator input: PA10 / Arduino D2 on CN9.
- LED indicator: PA5 / Arduino D13 on CN5.
- Quadrature A output: PB5 / D4, quadrature B output: PB4 / D5.
- PC13: active-low user button, and common ground between generator, board and oscilloscope.
- Demonstration source starts with 100 Hz, 0-3.3 V equivalent square, 50% duty, DC-coupled scope near 1.65 V edge trigger. Hardware wiring is verified independently.
The v15 board selector includes an **ENGR 844 reference pin preset** and a runnable *logical* quadrature state cursor `00 → 01 → 11 → 10`. This is a synthetic digital model, not the recorded oscilloscope trace or verified hardware limit. The actual course report’s polling code responded to both rising and falling edges; when each edge toggles the output, a missed-edge-free output cycle can match the input frequency—do not blindly apply a half-frequency claim.

## Keysight bench reference (v14 preserved)
The four-channel scope bench inherited from v14 supports modeled/current-sample processing; no hardware remote-control path is present. N7020A is a 2 GHz power-rail probe with ±24 V offset and ±850 mV active signal range; 1169B is a **12 GHz differential voltage** probe amplifier, not a self-contained current clamp. Current from a differential shunt reading requires I=Vdiff/Rshunt with proper units and real calibration. Genuine scope functions such as SCPI/VISA and licensed serial/jitter/eye-mask options are not implied.
- https://www.keysight.com/us/en/product/N7020A/power-rail-probe-2-ghz.html
- https://www.keysight.com/zz/en/product/1169B/infiniimax-ii-series-probe-amplifier-12-ghz.html

## Code/IDE truthfulness
- Python 3: user-initiated Pyodide 0.27.7 download from pinned jsDelivr CDN URL; run in a worker with 18 s timeout, no DOM access. It requires connectivity and should be used only with trusted code. This is a real Python interpreter when it successfully loads, not fake console output.
- Verilog/SystemVerilog: a **real but narrow** JavaScript evaluator for one-bit continuous `assign y = a & b;`, `|`, `^` with all four 0/1 input patterns. No 4-state X/Z propagation, HDL event scheduling, wave dump, or UVM simulation; logs state the subset.
- C11, Arduino C++, STM32 HAL C: editable examples, basic static diagnostics, download and local draft saving. **No claim** to compile, execute, flash MCU or use physical debugger. Actual tools GCC/Clang, Arduino CLI and STM32CubeIDE required for native execution.
- Source code includes ordinary requirements/pseudocode comments before beginner-style implementation. Respect original test function signatures if adapting user coding problems. Avoid claiming screenshots have been individually solved by prewritten examples.
- No arbitrary user code is committed; drafts are stored locally only on explicit Save.

## Equation formatting
`notebook.js` now uses existing `window.studyMath(..., true)` native offline MathML for **every defined Deep Dive equation** while leaving a copyable source equation underneath. Cards' mathematical equations may vary in syntax, so cross-browser review remains necessary. The new circuit/RC labs show interpreted MathML plus numerically substituted calculations.

## User interface + source preservation
- Original v14 handwritten Overview Q box, graph-paper diagram, yellow Remember callout remain unchanged.
- Original flashcards, deep-dive KeySight scope, board SPICE data, local VCD viewer, lab scoring, and local progress key remain unchanged.
- Add a fifth nav: **Virtual electronics academy**, containing circuit/probes, pins, code terminal and lab-report sections; independent local report key `aca-report-v1`.
- Preserve v14 baseline in `backup/v14-before-virtual-academy-20261115`.

## Acceptance and what remains
Required CI: JS syntax, existing numerical scope checks, ideal R calculation against 869.727891 Ω, KCL/KVL residual, RC τ/charge/discharge, pin presence, 1-bit Verilog truth table, browser desktop/phone navigation, virtual wiring and DMM, source changes, pin assignment to generated sketch, code terminal diagnostics, report export, and restored Overview/MathML.

Not yet full feature parity: interactive arbitrary topology SPICE solver; realistic breadboard parasitics; comprehensive MCU pin mux/CubeMX code generation; C/C++/HAL native compilers; full SystemVerilog/VCS; offline Python interpreter bundle; actual SCPI/VISA Keysight integration; image-labeled lab report with physical photo capture; multi-user cloud report syncing; independent Safari accessibility audit.

## Separate Gemini independent review handoff
No independent Gemini run was performed in this ChatGPT session. Give Gemini this document and the branch PR to validate independently:
1. Compare TECH 60 resistor topology and Physics 2B seven-section rubric with provided originals, without uploading restricted employer content.
2. Run the site and change every resistor, wire and virtual probe; verify current and voltages with independent calculations.
3. Inspect STEM pin mapping against ST UM1724 and Arduino datasheets (especially I2C alternate pins and PC13, PA5).
4. Exercise all language modes: correct Python WebAssembly run, unsupported C no fake execution, Verilog truth-table update after edit, errors/timeout, local Save/Download.
5. Audit native MathML across all 100 cards, compare before/after visual notebook, run at 320px/390px/1280px and mobile Safari if available.
6. Flag every control that changes only the appearance rather than its numerical measurement, and every claim exceeding its verified behavior.
7. Do not mark native Keysight, ngspice on-demand, CubeMX or hardware code execution as PASS without traceable external evidence.
