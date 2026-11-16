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
