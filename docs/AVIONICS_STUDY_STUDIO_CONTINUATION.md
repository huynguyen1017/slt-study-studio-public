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
