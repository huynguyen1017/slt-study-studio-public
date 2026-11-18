# SLT Study Studio — continuation and regression handoff

Updated: 2026-11-16. Source of truth: the current GitHub `main` branch plus tested pull requests; do **not** rebuild or replace the existing site.

## Project locations
- Public practice site: https://huynguyen1017.github.io/slt-study-studio-public/
- Source: https://github.com/huynguyen1017/slt-study-studio-public
- v11 integrated-network release: https://github.com/huynguyen1017/slt-study-studio-public/pull/15 (merged)
- Subsequent main hardening: https://github.com/huynguyen1017/slt-study-studio-public/commit/9c3168b6d5edf60013599f6ce34174b62ca25d0c

## Non-negotiable learning requirements
- Keep existing browser UI, existing 23 × 30 = 690 stable question IDs, answer/progress storage, notebooks, lab content and offline site.
- Difficulty **increases** from #1 to #30, never merely by changing resistor values.
- #1–5: definitions, units, fundamental node/voltage/current concepts with child-friendly, careful explanations.
- #6–10: safe setup, circuit tracing, practical lab procedures and interpreting measurements.
- #11–20: distinct increasing calculations; mixed series/parallel reductions, branch currents, power, measurement loading and cross-checks. Correct engineering units and fully substituted equations.
- #21–27: diagnostic calculations and evidence checks, including KCL/KVL, open, short, miswire, source droop, meter loading and measurement uncertainty.
- #28–30: multi-symptom, multi-subsystem interpretation and verification; #30 must be a genuine integration/release decision, not just a formula substitution.
- Move numerical variations of the *same solving strategy* behind **🎲 Practice New Numbers**, keeping the selected method/question position and separate dice-scoring. Preserve **Restore Canonical Question** and original mastery progress.
- Do not describe conceptually related but different skills as duplicates without considering changed measurement, inference, topology, fault hypothesis or rigor.
- When a physical circuit is not truthfully simulated, explicitly label diagrams illustrative and link to the blank simulator; never suggest 9/12-V theoretical networks can connect directly to STM32 GPIO.

## Current implementations
- `avionics_distinct_labs_v10.js`: authored lab tasks for 23 topics.
- `avionics_distinct_math_v10.js`: 10 progressively distinct numeric methods per topic, with older similar numerical drills in `variantPool`.
- `avionics_distinct_reasoning_v10.js`: staged foundations and diagnostics.
- `avionics_integrative_capstones_v11.js`: unique Q30 scenarios in 21 non-network topics; revision in this branch turns Q26–29 into **two-observation** cases with independent tests, replacing repeated single-symptom reuse.
- `avionics_mixed_networks_v11.js`: bespoke 30-slot series and parallel tracks, 17 numerical operations each and correct numerical re-rolls.
- `avionics_mixed_visuals_v11.js`: circuit-connected schematics and safe unsupported-simulator behavior.
- `avionics_tutor.js`: notebook explanations, practice dice and canonical restoration.

## Verification to rerun for every follow-up
1. `node tests/avionics-curriculum-distinct-v10.test.cjs`
2. `node tests/avionics-integrated-v11.test.cjs`
3. `node tests/avionics-curriculum-accuracy.test.cjs`
4. `node tests/avionics-academy.test.cjs`
5. `node tests/avionics-assessor.test.cjs`
6. Full GitHub Actions `Avionics EE Practice Academy regression`, including desktop/mobile browser smoke.
7. Open the deployed site after merge with a new-tab/hard-refresh, navigate Series Q1/Q12/Q15/Q23/Q30, Parallel Q30, and at least one non-network Q26–29. Confirm explanations, diagrams, per-method dice, score isolation, canonical restoration and persistence.

The prior final branch commit on v11 had successful GitHub Actions workflows, but **this branch must pass its own checks before any claim that the additional changes are deployed**. GitHub Actions and static source tests do not prove genuine electrical connectivity for every possible manually entered network. Continue using explicit simulation limitations.

## Source-material protection
The study site's public repository is not a destination for confidential resumes, private interview history, internal silicon-validation logs, customer documents, or local Mac paths. Use private source materials as references only where appropriately authorized, without copying them into the public repository. No automatic full ChatGPT chat export is assumed; this note preserves the transferable project decisions and source-code pointers.


## November 17, 2026 — Railroad Tracks × Kirchhoff continuation

### Request and learning source references
- Chemistry method: factor-label / railroad-track dimensional analysis; write quantities as fractions with the unwanted unit in the next denominator, cross out matching units, multiply top numerators, divide by bottom denominators.
- User's reference tutorial: https://www.tutoringexpert.ca/how-to-solve-stoichiometry-problems-step-by-step/
- User's Organic Chemistry Tutor mole-ratio lesson: https://www.youtube.com/watch?v=3zmeVamEsWI
- **Teaching translation, not chemistry equivalence:** voltage/current/resistance relationships require topology and Kirchhoff's laws. Chemistry ratios only inspire the layout of SI conversion factors. Do NOT cancel symbols across sums or pretend a factor-label chain solves a multi-node network on its own.
- Visual requirement: fully rendered stacked MathML fractions and drawn strike-through units, annotated topology and arrows, every common-denominator, expansion, decimal and power-of-ten step, boxed numerical values with SI dimensions, independent KCL/KVL/power verification.
- Preserve prior progression (definitions → lab → distinct calculation → multi-fault engineering decision), valid learning-method dice and canonical progress.

### Verified last public release
- PR #27 merged on Nov 17 2026 as main SHA 71a3842c2a0b8da0f7c4f1b8cba0fac448e016d5 (v37).
- Modules: circuit_railroad_whiteboard_v1.js and .css, four reference examples (series, true parallel, mixed, two-loop), integrated via professor_notebook_spreads.js and professor_mastery_engine.js.
- The previous answer's photographic topology correction is important: screenshot wiring = 6 Ω + (12 Ω || 4 Ω), RT = 9 Ω, IT = 12/9 A. The intended ALL-parallel topology is different, RT = 2 Ω. Always trust nodes, not captions.
- **Not completed in v37:** all-equation and all-mode 690+ question-specific audit.

### In-progress v38 changes on PR #28
- Branch: feature/railroad-question-workpad-v38, PR https://github.com/huynguyen1017/slt-study-studio-public/pull/28
- Added a **read-only current-question** railroad scratchpad to the shared notebook renderer used by Avionics and NVIDIA, preserving the existing question's formula, substitution, numerical target and current 🎲 values. No arbitrary algebra results are invented from narrative text. Includes Unicode-aware SI prefix matching; valid 10^(3n) cancellation rails; safe HTML escaping; accessible MathML; offline CSS/JS assets.
- Added a fifth reference whiteboard, a **five-resistor bridge with an actual A-to-C cross-link**, needing two simultaneous node equations rather than series/parallel reduction.
- Bridge illustration: source S=12 V, GND=0 V; R1=1k S→A; R2=2k A→GND; R3=2k S→C; R4=1k C→GND; R5=1k A→C.
  - Node A: (12-A)/1000 = A/2000 + (A-C)/1000 ⇒ 5A-2C=24 V.
  - Node C: (12-C)/2000 + (A-C)/1000 = C/1000 ⇒ -2A+5C=12 V.
  - Eliminate: A=48/7=6.857143 V; C=36/7=5.142857 V.
  - I1=36/7, I2=24/7, I3=24/7, I4=36/7, I5=12/7 mA; Isource=60/7 mA.
  - KCL verified at BOTH nodes; total power supplied = resistor dissipations = 720/7 mW ≈102.857 mW.
- Tests: tests/circuit-question-railroad-v2.test.cjs and expanded tests/circuit-railroad-whiteboard-v1.test.cjs. Workflow and service worker updated.
- v38 must not be described as merged or live unless a fresh check proves PR #28 merged and public Pages serves the new assets.

### Remaining completion checklist
1. Rerun the whole Actions matrix and browser tests. Resolve any real failures before merging; distinguish stale cancelled/failed runs of earlier SHAs from current-head CI.
2. Verify source-specific formula/substitution consistency independently for all original 690 question IDs, and audit the additional 31–50 advanced material separately; do not equate syntactic MathML existence with mathematically correct derivations.
3. Audit every calculation and diagnostics explanation for physically valid topology, node references, current-arrow conventions, dimension algebra, decimal/prefix rounding, symbol italicization and upright SI units; make detailed custom rewrites for incomplete cases rather than generic text.
4. Add source-specific handwritten/baby-step algebra (not just generic reminder) for arbitrary simultaneous systems. The v38 current-question renderer **does not solve new circuits** or replace canonical worked explanations.
5. Test current 🎲 numbers match formulas, displayed diagrams and expected grading; verify canonical restore and score isolation.
6. Confirm both Avionics and NVIDIA visual/work/baby-step/notebook modes, mobile portrait no overflow, airplane offline load, and that user progress keys remain stable.
7. Retain physical realism disclaimers (illustrative diagrams and safe currents/voltages); never claim real instrument/simulator behavior for unsupported configurations.
8. Preserve private silicon logs, resumes, screenshots containing personal data, proprietary work documents, and full ChatGPT transcripts **outside the public repository**. Source references may guide privately authorized work without publishing source contents.

## November 17, 2026 — v39 four-tab equation and SVG-picture follow-up

- PR #29: https://github.com/huynguyen1017/slt-study-studio-public/pull/29 (branch feature/v39-four-tab-math-svg-consistency). Check merge state before claiming it is published.
- All four sections (Understand, Visuals, Baby Steps, Try It) in Avionics EE and NVIDIA SLT Prep use the same selected question object, including currently selected dice rerolls. The new CIRCUIT_CURRENT_QUESTION_RAILROAD.renderStage adapts formulas and format by tab.
- Understand: current question givens, prefix fractions, governing law. Visuals: diagram/node reading, real current source equation and substitution. Baby Steps: existing complete lesson plus original question factor-label, algebra reminder and unit proof. Try It: setup and formula hints, without disclosing the stored answer or completed substitution.
- Both professor Understand lectures switch legacy multi-column SI conversion TABLES to stacked numerator/denominator factor-label fractions with red cancellation strokes.
- professor_notebook_spreads.js draws native SVG numerator, fraction bar, denominator, and cross-out unit identity on the 2600×1400 picture for source-supported clean fractions; ambiguous multi-loop expressions are not guessed.
- The live notebook SVG and its downloaded PNG now use these source-specific formula drawings; the twelve historical pre-rendered raster PNGs under figures/notebook_spreads/ have NOT been changed. Gallery now offers Download Updated Live PNG and describes the old PNG files as archives.
- tests/four-tab-svg-math-v39.test.cjs checks all eight tab surfaces, no Try-answer leakage, prefixes/dice, source-derived SVG, canvas-ready primitives and mobile/desktop browser workflow. Verify latest-head Actions before merging.
- Preserve stable IDs, original question models, offline progress, dice score isolation, existing schematics and simulator limitations.
- Remaining: independent line-by-line correctness audit of all 690 original questions plus additional advanced Q31–Q50 and historical static visuals; display formatting and regression success are not proof of all mathematical correctness.

## November 17, 2026 — v40 source-level math/layout/thermal corrections (PR #30)

PR #30: https://github.com/huynguyen1017/slt-study-studio-public/pull/30

Source investigation from the four screenshots: old prose remains in the PARALLEL-X8 saved question, q.steps, q.lesson, professor interview script and generic chalkboard, Muon hiring-manager guide, HWD-09 simulator and its synthetic IR/power model, and the reference schematic audit. A display overlay from v39 did not rewrite these source strings.

- Added avionics_array_math_v40.js/.css. It creates a canonical eight-step, current-question-specific teaching proof for PARALLEL-X8, reused by Understand, Visuals, Baby Steps, Try It, Worked evidence, Post-math Engineer Resolution, Professor lecture, the Muon interview and HWD simulator. It draws native stacked MathML equations and Ω→mΩ cancellation (0.010 Ω × 1000 mΩ / Ω = 10 mΩ), and unitless branch count after isolating shorts.
- Replaced the original PARALLEL-X8 question, formula, substitution, lesson summary/example/why and all eight original step bodies; fixed invalid N_short/0. Ideal zero-ohm shorts require separate case logic, while real bridges use finite resistance. Theoretically 100×1Ω at 5V draws 500A and 2.5kW; this is not a safe bench setting.
- Physical 2 mΩ short with 99×1Ω healthy parallel: G=500+99=599 S; Req=1/599Ω=1.669449mΩ; at a compliant 2.5A, V=4.17362mV, bridge current=2.08681A and bridge dissipation≈8.71mW. IR hotspot cannot be guaranteed. Check current balance 2.08681A + 99×4.17362mA≈2.5A and P=V×I.
- Physical open-count example after independent short isolation: Req=1/97Ω≈0.010309278Ω; Nhealthy≈(1Ω)/(0.010309278Ω)=97, Nopen=3. 1V across intact 97×1Ω parallel would demand ~97A and 97W: not compliant with 2.5A limit. Under 2.5A actual rail ≈25.77mV and each intact resistor dissipates≈0.664mW, making IR contrast weak/unreliable. If an ideal short has 0Ω, standard finite conductance arithmetic must not divide by 0.
- HWD simulator previously generated false large IR thermal power using 0.18Ω instead of the modeled 0.002Ω bridge and allowed open-mode 1V to exceed a 2.5A limit. Both replaced with real P=I²R and I-limited benchV in BOTH phases. Synthetic thermal model is not real measured evidence.
- Moved the schematic drawing-audit reference into five separate real stacked MathML boxes; as drawn 6Ω+(12Ω∥4Ω)=9Ω, I=1.333A, 8V on 6Ω, 4V across branches (0.3333A +1A =1.3333A). The separate pure parallel schematic remains 2Ω/6A.
- Updated older related X9 / power-X8 explanatory content to avoid unverified guarantees of IR hotspots or safe 1V testing. Updated the Muon guide to label examples as practice, not verified Glassdoor reports.
- tests/avionics-array-math-v40.test.cjs checks core math, 1150 stable Avionics IDs, exact MathML/rail graphics across modes and simulator current/heat; the HWD browser regression now checks realistic temperature, not fabricated 60°C.
- The curriculum-wide independent mathematical and illustration review across all remaining Avionics and NVIDIA Q IDs is still a separate remaining workstream. Do not claim 100% accuracy or a live GitHub Pages deployment solely from static CI. Keep progression/dice/score/privacy intact.

## November 17, 2026 — v41 both NVIDIA tabs equation audit follow-up (PR #31)

PR #31: https://github.com/huynguyen1017/slt-study-studio-public/pull/31. Confirm merge and CI before claiming release.

The NVIDIA SLT Engineer (`#nvidiaView`, rendered by `nvidia_slt_ui.js`) and 🟢 NVIDIA SLT Prep (`#nvidia-sltView`, rendered by `nvidia_slt_tutor.js`) are different, independently scored interfaces. v40 only rewrote the Avionics question data and teaching UI; neither NVIDIA screen had received that source-level audit.

- Shared `nvidia_slt_equations_v41.js/.css` adds question-source-only MathML equations, horizontally stacked numerator/denominator factors, crossed-out identical prefix units, and a source-specific native SVG factor-label illustration. It reads selected canonical or rerolled question without modifying identifiers, grades, answer models or localStorage.
- NVIDIA SLT Engineer: same source workpad on Understand, Baby Steps, Try, Evidence. Read actual q.formula/q.sub instead of the generic physics model with unrelated fixed PDN/DDR values; preserve current source lessons, procedural steps and independent measurement checks.
- NVIDIA SLT Prep: same source workpad on Understand, Visuals, Baby Steps, Try. Remove fixed example numerical substitutions from `inferEngineeringPhysics` fallback. Source-absent conceptual questions explicitly stay qualitative rather than guessing voltage/time data.
- Both NVIDIA modes: interview/professor worked-derivation components use current question rather than an unrelated generic scripted 60-second speech or numeric result. `Try` workpad supplies symbolic law, not computed expected value; Prep input placeholder no longer echoes the correct answer.
- Visually label illustrative NVIDIA Prep SVG mockups *inside the SVG* as `ILLUSTRATIVE • NOT MEASURED`; the separate factor-label SVG uses actual prefix quantities. Not all archived/third-party images have been regenerated, and schematic mockups must not be treated as flight DUT wiring.
- Tests: `tests/nvidia-dual-math-v41.test.cjs` static and desktop/mobile Chromium for both NVIDIA screen pipelines, MathML, dimensioned prefixes, source SVG, dice updates, no Try answer leak. Existing v38/v39 test selectors updated only where replacement NVIDIA renderer requires it. Verify all mandatory Actions on final code before merge.
- Outstanding: independent mathematical audit of every numeric formula and visual asset across both separate 600-question NVIDIA sets, as well as the full Avionics curriculum. Source-derived presentation is not a certification of all authored solution content.


## November 17, 2026 — v42 NVIDIA SLT Engineer original-question math and output conversion (PR #32)

The user's exported live Q21 page (Electrical Foundations, 4 V across 175 Ω, output requested in mA) shows v41 left serious errors: saying "No prefixed SI quantity" because only *input* units were examined even though the *output* needs A→mA conversion; concatenating "I=V/R; substitute: 1000*4/175" into a single malformed MathML equation; repeating unrelated generic PDN droop and four-channel scope demonstrations as if they were answers to this simple resistor problem; 253-Box header when only ten curated modules are displayed.

- New nvidia_slt_math_proofs_v42.js/.css is a source-specific numerical solving pipeline used by NVIDIA SLT Engineer for all 120 canonically numbered numeric Q21–Q30 across twelve tracks and their 🎲 variations, handling fully worked specialized problems in current, actual series + parallel (with KVL), load power, Kelvin shunt, RC, and voltage droop; other numeric methods display their own authored formula and arithmetic expression without claiming an unproven derived physical result. This is not an audit certification of all authored formulas.
- Exact Q21 full solution: I=4 V/175 Ω=0.02285714286 A; factor-label output 0.02285714 canceled A × (1000 mA/1 canceled A)=22.85714 mA. Check IR=4 V and P=(4 V)(4/175 A)=0.091428571 W. No 1000-fold error. The input givens have no prefix; *output* conversion remains essential.
- Native source-driven SVG shows the Q21 A cancellation and current-question numeric units; MathML mfrac/menclose provides fraction bars and struck-through units. Numerator/denominator factor-label units are canceled only when identical, never algebraic terms across sums.
- Numeric-specific professor lecture/60-second defense replaces unrelated hard-coded generic lecture and pseudo-measured oscilloscope setup. Numeric text duplicate panels that rendered an entire semicolon-containing string through MathML are suppressed in favor of the correct source-calculated workpad. Unrelated *conceptual* questions still use prior their own explanations.
- Exact canonical IDs, dice behavior, score isolation and browser localStorage remain untouched; the original separate NVIDIA SLT Prep question bank and scoring are not rewritten.
- tests/nvidia-real-math-v42.test.cjs checks the current-Q21 solution, output conversion even when input prefixes absent, rerolled values, current/power/KVL and other numeric families, no answer leak in Try It, and desktop/mobile UI; full existing suite remains a gate.
- Do not claim a complete independent mathematical audit of all 600+600 NVIDIA and 1150 Avionics questions or live GitHub Pages deployment from this patch alone.


## November 17, 2026 — v43 MathML double-encoding / repeated interview regression

Observed after v42 merged: NVIDIA SLT Engineer Q21 4 V/175 Ω displayed visible escaped XML such as `<math xmlns=...>` for all five paper-math steps and repeated the entire five-step answer in the hiring-manager interview section. Exact root cause in `nvidia_slt_math_proofs_v42.js`: `solved().make(label,s)` always called `studyMath(s)` on ALL strings even when `s` already contained complete native MathML returned by `studyMath()`, `equals()` or `fracCon()`. This re-tokenized XML into ordinary variables, escaped the `<math>` root and corrupted the rendered expressions. `interview()` separately repeated `info.arr.join('')` under the whole question, multiplying duplication.

Fix branch `fix/v43-mathml-double-encoding-deduplicate` (PR #33): supply trusted already-built MathML fragments directly to `box()` and do not parse them again. The five expected Q21 proof cards have exactly one real `<math>` root each; Ohm and conversion stages have real `<mfrac>` children; two `<menclose notation="updiagonalstrike">` ampere labels; equality operators `<mo>=</mo>` and no escaped `&lt;math` tags. Interview displays concise final result and validation rather than a duplicate five-step proof. Q21 numerical answer remains 22.85714286 mA and power 0.09142857 W. No question bank, scores, dice, storage or Avionics changes.

New `tests/nvidia-real-math-v42.test.cjs` assertions exercise each generated card, all specialized numeric families, actual browser MathML DOM namespace on desktop/mobile and a single concise interview result. Bump the script query and service-worker offline cache to v43; verify CI from final branch HEAD and GitHub Pages independently if possible. Full 600+600 NVIDIA mathematical curriculum audit remains outstanding.
