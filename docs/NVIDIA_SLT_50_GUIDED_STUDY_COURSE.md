# NVIDIA System Level Test Engineer — separate zero-to-bench learning academy

**Target from user-provided job description:** System Level Test Engineer, L&T Technology Services (LTTS) implementation partner, customer NVIDIA, Santa Clara, California. This is a role-training tool, not an official NVIDIA course or a claim that an NVIDIA interview has taken place.

## Why this is a NEW tab

The Muon Avionics Academy remains untouched at its existing 23 × 50 = 1,150 questions and retains the existing browser-local progress key. The new NVIDIA tab independently stores the learner's own notes and mastered answers as `slt-nvidia-soc-academy-v1`. Never reassign any original Muon question IDs.

## Actual requirements from the job-description file

The supplied LTTS/NVIDIA position emphasizes SoC diagnostic development, system-level verification, post-silicon validation, product characterization, QA, yield enhancement, specifications, cross-functional fault isolation (ASIC, ATE, DFT, fab, software, quality), preventative corrective actions, shell and Python. PCIe, DRAM/DDR, PC hardware assembly and architecture are explicitly favorable skills. This is not a spacecraft avionics test vacancy.

## Curriculum architecture

12 independent topics, each containing **50** original exercises, from first exposure to integrated release judgment. 600 questions total, 120 numerical problems with independently recalculated answers, and 5,160 explanatory steps.

| 50-slot tier | What the learner does |
|---|---|
| 1–10: Foundation | Define ten genuinely different topic concepts, identify observations, technical meaning and common misinterpretations |
| 11–20: Hands-on thinking | Write safe instrument/test setup, identify source/return, design independent checks and preserve first-failure evidence |
| 21–30: Calculations | Ten different numeric methods per topic, one per slot; physically consistent new-number rerolls on the SAME page |
| 31–40: Diagnosis | Perform failure isolation, controlled A/B/A, distinguish DUT/fixture/firmware/script and name falsifying evidence |
| 41–50: Multi-fault interview | Integrate three different subsystem observations and defend PASS, FAIL, INVALID or BLOCKED; Q50 is a full readiness review |

**Topics:** Electrical Foundations; SoC Architecture & Boot; DRAM/DDR Training; PCIe/SerDes; GPU Health/DCGM/Xid; ATE/DFT/MBIST; PVT/Voltage/Power Characterization; Oscilloscope/DAQ/DMM; Linux Hardware Debug; Python and Shell Automation; Yield/Quality; Technical Interviews/Cross-Functional RCA.

## Real-world grounded study materials used privately to identify concepts

1. Uploaded **Job Title: System Level Test Engineer** (LTTS / NVIDIA customer; original job description).
2. Uploaded **MASTER_HUY_NVIDIA_SLT_INTERVIEW_STUDY_GUIDE_FILLED.docx** (three-part interview answers, mock panels, Python questions, Linux debugging and hardware timing equations).
3. Uploaded **MUON SPACE — Avionics Test Engineer — Tailored SLT Interview Q&A Master** (transferable safe instrumentation/bring-up and a strict truthfulness boundary, rather than role-specific avionics material).
4. Earlier introductory electronics coursework and series/parallel labs. These support explanations of SI prefixes, Ohm's law, measurement, and safe experimental procedure.

Do not upload, quote at length, or embed names, private personal contact information, proprietary test logs, internal project commands, proprietary DVFS rail readings, or full interview-answer transcripts into this public repository.

## Public manufacturer and language references

- [NVIDIA DCGM Diagnostics](https://docs.nvidia.com/datacenter/dcgm/latest/user-guide/dcgm-diagnostics.html) — what active diagnostics test, compatible platforms, scope/limitations.
- [NVIDIA DCGM Health Monitoring](https://docs.nvidia.com/datacenter/dcgm/latest/learn/modules/health-monitoring.html) — active versus passive health.
- [NVIDIA Xid Catalog](https://docs.nvidia.com/deploy/xid-errors/latest/analyzing-xid-catalog.html) — interpret error IDs in context.
- [Python documentation](https://docs.python.org/3/library/) — `csv`, `math.isfinite`, `subprocess` and test harness components.

Diagnostic suites may disrupt an occupied GPU. Use only approved, idle resources; simulation on this site is education, not a command to run stress on real shared hardware.

## Two beginner worked examples

### Q24 — shunt current (Electrical Foundations)

Example from the generator: a Kelvin shunt reads **25 mV** across **5 mΩ**.

1. Identify current, in amperes (A), as the unknown.
2. Convert to base units: 25 mV = 0.025 V; 5 mΩ = 0.005 Ω.
3. Use Ohm's law: `I = V / R`.
4. Substitute: `I = 0.025 / 0.005 = 5 A`.
5. Double-check that the two milli prefixes cancel, and that the shunt and sense amplifier can safely handle the inferred load.
6. On hardware verify differential sensing, calibrated gains and instrument grounding.

The 🎲 button changes the given voltage and resistor independently and recomputes the answer, without switching to a different solving method.

### Q30 — maximum-limit guardband

Synthetic limit = 5.20 V, reading = 4.85 V, uncertainty = ±0.22 V.
1. Worst credible upper reading = 4.85 + 0.22 = 5.07 V.
2. Signed margin = 5.20 - 5.07 = **+0.13 V**.
3. Positive margin means this one requirement is within the assumed limit **only if the test station, instrument and configuration are valid**. Invalid equipment makes test INVALID rather than PASS.

## Study instructions

Start with Electrical Foundations Q1 and do not skip a question simply because you recognize a word. In each page: read **Understand**; inspect the **conceptual evidence flow** (not actual board wiring); work through **Baby steps**; answer in **Try it**; compare the reference. An explanation check is a guided self-assessment, **not** an AI semantic grader. Numeric answers receive actual arithmetic grading with an explicit target unit. Mastery status is stored only after the user checks the answer and marks that they can explain it.

Use problem sets to build skills and interview responses, never to overclaim NVIDIA-specific hands-on work. Professional experiences included in the source materials should only be described at the supported level; hypothetical diagnostics are proposed methods, not historical accomplishments.

## Release acceptance checklist

- [ ] 12 topics × 50 = 600 unique stable IDs, exactly 10 different numeric operations per topic
- [ ] 840 reroll checks, same operation/unit, numerically verified expressions, consecutive changed answers
- [ ] Every question has concept, 7–10 worked steps, safe first check, alternative hypothesis and evidence/disposition
- [ ] Test desktop and mobile, deep link `#nvidia`, independent source and Muon tab, score isolation, full progress export
- [ ] New assets all cached offline with new cache version; existing Muon acceptance and scope regression still pass
- [ ] Confirm public GitHub Pages serves the new cache and the separate JS modules after merge
