# NVIDIA SLT visual lab v2 — per-question diagnostic utilities

This update retires the repeated four-box `Linux host → fixture/software → SoC/GPU → raw evidence` SVG from the NVIDIA academy. Its replacement is designed around the **actual selected question** and changes when the learner navigates to a different question or activates 🎲 Practice New Numbers.

## Learning by doing — four independent tools

1. **Signal / model.** One of 12 topic-specific engineering views, using that question's focus, named measurement and likely pitfall. Connected series + parallel problems retain an exact model with component values from the prompt, including numerical dice rerolls. The other views are explicitly **synthetic teaching diagrams**, not measured captures.
2. **Fault tree.** Choose **DUT/silicon**, **fixture/measurement** or **firmware/parser**. For each alternative, the UI explains the expected pattern, a falsification experiment and a relevant observation from the selected question. Choosing an alternative is exploratory; none is automatically a true root cause.
3. **Controlled A/B/A experiment.** Switch between original baseline, exactly one approved variable changed, and original condition restored. Each stage identifies a different item of physical/software evidence from the question.
4. **Evidence worksheet.** Six specific preparation checkpoints follow this question's measurement, alternate signal, and third corroborating subsystem. Write your own first discriminating check, save it **locally** in the browser (separate from Muon and NVIDIA mastery storage), and copy the proposed plan.

The lab is available from the **1 · Understand** and **4 · Evidence** panels. It does not execute commands on a real host, access a real oscilloscope, imply manufacturer-approved limits, or make a flight/GPU acceptance decision.

## Actual topic-specific models

| NVIDIA topic | New relevant diagram |
|---|---|
| Electrical | Power distribution source, regulator/PDN, load and measurement node; exact connected teaching topology for series+parallel resistance |
| SoC architecture & boot | Power-valid → clock lock → reset → firmware → DRAM initialization and relevant checkpoint |
| DRAM/LPDDR | Training pass/fail tap window, per-lane synthetic heatmap, real numeric tap-window answer when present |
| PCIe/SerDes | Detect → Polling → Configuration → L0 → Recovery stages and specific question's focus |
| GPU SLT | Separate synthetic power, ECC, PCIe/Xid and thermal evidence channels, with limitation labels |
| ATE/DFT | Structural ATE, Scan/BIST, PCBA bring-up and system SLT coverage boundaries |
| PVT/characterization | Synthetic pass/fail margin matrix for voltage/frequency/temperature relationships |
| Instruments | Clearly synthetic four-channel waveform and probe/measurement verification |
| Linux | Read-only synthetic per-question log containing a specific concern and first-run context |
| Python | Source-level parser/command logic; actual custom code where the question includes a worked example |
| Yield/Quality | Separate first-pass, failure, retest and invalid-station groupings (illustrative, not manufactured yield data) |
| Interview | Three distinct, explicitly named subsystem symptoms and independent confirmation paths |

## Correctness and non-claims

The new lab does not replace the question's existing math, safe procedure, guided steps or canonical solution. It uses the displayed **question object** to select values, units and terminology, including the rolled numerical variant. The Q22 connected circuit remains exact. Existing stored mastery and all 1,750 course questions (Muon 1,150 + NVIDIA 600) are unchanged.

A synthetic GPU trend, PCIe state graph, heatmap, oscilloscope trace or test log is *not* a real device capture. The user must record actual parameters and reference genuine approved electrical specifications before working with live hardware. Evidence checkboxes are **study preparations**, not a claim that those hardware tests happened.

## Acceptance tests

- All 600 questions render a topic-specific lab, identified with their exact stable ID and selected skill.
- All 120 numerical exercises show current expected result and method. Dice rerolls retain corrected units and source component values.
- In browser test, 12 topic visual models display distinct technical content rather than the old generic diagram.
- Validate Q22 connected source, Rs, Ra/Rb values; fault-tree hypothesis outcomes; A/B/A stages; worksheet input, checkbox persistence across navigation/reload and source-preserving output.
- Existing Avionics 1,150 questions, NVIDIA 600 questions, formulas, scores, four-stage lessons, and the other virtual instruments must remain intact.
- Test desktop and narrow mobile view, offline precache v35, and public GitHub Pages after merge.
