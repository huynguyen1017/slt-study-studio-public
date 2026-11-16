# Avionics EE from zero → 50 guided questions per topic

This is an **educational practice curriculum**, not the official training material, electrical specifications or interview question bank of any particular employer. It is based on public job-skill categories plus original lesson content. Do not publish private interview transcripts, employer work product, internal measurement logs or proprietary procedures to this public repository.

## Read this before starting

**There are 23 topics and 1,150 stable practice questions.** Each topic now has 50 canonical problems, and every canonical question has a saved mastery status.

- **Q1–5: Basics.** Identify definitions, symbols, units and the physical meaning. It is normal to repeat these until comfortable.
- **Q6–10: Guided lab.** Learn the parts of a safe bench check: DMM versus scope, ground, power off resistance, current-limited supplies, expected outcomes.
- **Q11–20: Calculations.** Read the question, draw the circuit topology, list given quantities, convert units, write the governing equation, insert values, compute, check physical plausibility. Practice New Numbers changes numerical values without changing the learning method.
- **Q21–30: Fault diagnosis.** Distinguish an observation from a hypothesis; test a fixture, component, probe, operating condition, log and calibration independently.
- **Q31–36: Measurement fluency and safety.** Trace the signal path, design a staged bring-up, choose independent evidence, and discriminate hardware from test-station problems.
- **Q37: Independent quantitative prediction.** Work a new numeric model with all conversions, substitutions, predicted measurement, units and limitations.
- **Q38–43: Root-cause analysis.** Controlled A/B/A swaps, competing causes, cause-and-effect models, thermal trials, grounding and repeatability.
- **Q44: Guardband numerical calculation.** Determine whether a worst-case measurement plus uncertainty truly meets an explicitly fictional requirement. A negative margin means the conservative measurement fails; if calibration/configuration is invalid, classify the test **INVALID**, not PASS.
- **Q45–49: Test automation and production evidence.** Python instrument initialization, numeric parsing, timeout/NaN handling, raw logs, acceptance criteria, false-PASS negative tests and reproducibility.
- **Q50: Three-symptom GO/NO-GO capstone.** Integrate circuits, instrument uncertainty, source/fixture isolation, firmware version and independent physical evidence.

## Seven habits for learning every circuit

1. **Name the physical quantity** being requested (e.g., current in A, voltage in V, resistance in Ω).
2. **Sketch the actual connections** and identify which components share a single path (series) or both endpoints (parallel).
3. **Mark the reference node** and the direction of current or voltage polarity. Never assume a displayed negative sign indicates defective hardware.
4. **List given values including prefixes** before touching the calculator: milli = 10⁻³, micro = 10⁻⁶, kilo = 10³.
5. **Write the equation symbolically** and define what every term means.
6. **Substitute and calculate line by line**, keeping physical units, checking signs, and verifying the answer against conservation laws.
7. **Predict an independent real measurement** with an appropriate DMM, oscilloscope, current-sense shunt, scope probe or log; describe a falsifiable outcome.

## Fully worked examples

### Series/parallel Q37

A 12 V source drives **100 Ω + (200 Ω || 300 Ω) + 80 Ω**.

1. Parallel leg: `Rparallel = (200 × 300) / (200 + 300) = 120 Ω`.
2. Series path: `Rtotal = 100 + 120 + 80 = 300 Ω`.
3. Total current: `I = 12 V / 300 Ω = 0.04 A = 40 mA`.
4. Cross-check: voltage drops are `4.0 V + 4.8 V + 3.2 V = 12.0 V`; parallel currents are `4.8/200=24 mA` and `4.8/300=16 mA`; branch-current sum = 40 mA.
5. The physical bench check requires a safe, properly wired circuit and an appropriate current-limited supply; 12 V must not be connected directly to an STM32 3.3 V GPIO.

### Guardband Q44

A hypothetical divider output has maximum limit 1.8 V; the calibrated reading is 1.72 V with uncertainty ±0.12 V.

1. Upper possible reading = `1.72 + 0.12 = 1.84 V`.
2. Guardband margin = `1.80 − 1.84 = −0.04 V`.
3. Because the margin is negative, a bare nominal reading of 1.72 V cannot justify acceptance against this stated fictional maximum.
4. Independently confirm the test equipment is valid; if the test setup is untrustworthy, the correct result is **INVALID**, not a manufactured PASS.

## Interview skills taught, and what not to claim

| Job competency | Workbook topics |
|---|---|
| Safe PCBA bring-up and reading schematics | Units, Ohm, Series, Parallel, KCL/KVL, Schematics, Components |
| Analog and digital electrical reasoning | AC, Capacitors, RC, Inductors, Filters, Timing, Logic |
| Oscilloscope, DMM and measurement instrumentation | Instruments, Power Rails, Timing, AC |
| Hardware debug and production GO/NO-GO evidence | All topics Q21–50, especially Schematics and Qualification |
| Test racks, scripting, Linux and failure-log analysis | Python/SCPI, Linux, Buses |
| Power electronics and power distribution | Power, Magnetics, Power Rails, Components |
| RF awareness and qualification literacy | RF, Qualification |
| Independent physical verification and troubleshooting | All topics Q31–50 |

**Truthfulness:** completing a simulated RF/VNA or spacecraft acceptance exercise improves conceptual readiness; it does not constitute hands-on RF instrumentation, independently qualified flight hardware, or a verified historical accomplishment.

## Maintaining the website safely

- Keep all 690 existing original IDs unchanged and store the additional questions as `-X1` through `-X20` per topic.
- Do **not** reset a learner's local storage solely to expand the count; keep the active curriculum version and previous ratings.
- New content is loaded by `avionics_advanced_50_v12.js` after all preceding curriculum rewrites.
- Verify exact answers for every one of the **46 additional numerical cases**, all 460 eight-step answer guides, and each topic's final multi-fault scenario.
- Validate the desktop/mobile 50-card navigator, numerical grading, offline asset caching and canonical quiz restoration, then inspect the public GitHub Pages service worker after merge.
