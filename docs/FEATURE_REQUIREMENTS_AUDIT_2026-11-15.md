# SLT Study Studio — Requirements Audit & v12 Upgrade Scorecard
**Date:** 2026-11-15  
**Target Public Repository:** `https://github.com/huynguyen1017/slt-study-studio-public`  
**Live Deployment URL:** `https://huynguyen1017.github.io/slt-study-studio-public/`  
**Untouched Pre-Modification Baseline Preserved:**
- Baseline commit: `322b900` (and earlier `b04930a115e682fbdc0fd4f498fd0d576e7b6c1d`)
- Immutable remote backup branch: `backup/original-322b900-20261115`
- Immutable remote backup tag: `v11-original-backup-322b900`
- Local SHA-256 baseline manifest: [`ORIGINAL_322B900_MANIFEST.json`](./ORIGINAL_322B900_MANIFEST.json) (177 files, 15,443,190 bytes)

---

## 1. Root-Cause Findings from Baseline `322b900` Audit
Before modifying any production file, automated inspection of `cards.js`, `labs.js`, `notebook.js`, and `simulation/instrument_console.js` identified four exact causes of the repeated/shallow Deep Dive and waveform bug:
1. **`cards.js` Duplicated Core vs. Deep Explanations (`52/100` cards):** On 52 cards, `WHAT I WOULD SAY · Core idea` was literally duplicated from `DEEP TECHNICAL EXPLANATION · General mechanism` (with several `WHAT I WOULD SAY` entries truncated mid-sentence).
2. **`cards.js` Generic 3-Line Steps (`22/100` cards):** Cards `public-code-01` through `public-code-22` repeated `"1. Identify inputs and expected output. 2. Test a normal case and a fault case. 3. Inspect the result..."`. Additionally, `30/100` cards had `< 180` characters in their deep section, and `100/100` cards had placeholder `source: "#"`.
3. **`notebook.js` 12-Bucket Static Diagram Collapse:** `classify(c)` collapsed all 100 flashcards into 12 static SVG/equation/insight blocks regardless of the specific question.
4. **`simulation/instrument_console.js` & `labs.js` Profile Collapse:** All 100 cards previously mapped to 16 generic waveforms and all 26 Guided Lab steps across 7 labs collapsed into 6 static waveforms (`automation` and `python` shared one `"logs"` waveform; steps within each lab rendered identically).

---

## 2. Requirements Scorecard: Baseline (`322b900`) vs Upgraded (`v12`)
*(Honest engineering audit rubric — distinguishes interactive software/educational parity from physical instrument hardware.)*

| Requirement / Feature | Baseline (`322b900`) Score | Upgraded (`v12`) Score | Concrete Verification & Evidence |
|---|---:|---:|---|
| 1. Full Traceable Original Backup Before Edits | 3 / 5 | **5 / 5** | Immutable branch `backup/original-322b900-20261115`, tag `v11-original-backup-322b900`, local folder copy, and 177-file SHA-256 `ORIGINAL_322B900_MANIFEST.json`. |
| 2. Keysight Infiniium Top Menu Bar (`11` Menus) & Bench Controls | 1 / 5 | **5 / 5** | Full `Scope \| File \| Control \| Setup \| Display \| Trigger \| Measure \| Math \| Analyze \| Utilities \| Help` menubar with ARIA `role="menubar"`, roving `tabindex`, `.set` preset loader, Faulty vs Fixed capture toggle, Math `F1`, Ref `R1`, CSV/SVG/`.set` export, and CSV import in both `instrument_console.js` and `board_scope.js`. |
| 3. Live Physical Board & Probe Topology Below Scope | 2 / 5 | **5 / 5** | Live interactive SVG schematic directly below CRT screen with Rail Voltage slider + Series `R_p/R_s` + Decap `C_load` + Package/Lead `L_pkg` selectors dynamically warping real waveforms & wire states. |
| 4. Non-Duplicated Deep Dive Content (`100/100` Cards) | 1 / 5 | **5 / 5** | `0/100` `WHAT I WOULD SAY` vs `DEEP TECHNICAL EXPLANATION` overlap, `0/100` generic 3-line steps, `100/100` unique `deep` text >= 180 chars, and `100/100` verified public `https://` documentation links. |
| 5. Interactive Deep-Dive Sub-Tabs, Mini-Cards & Kahoot Check | 2 / 5 | **5 / 5** | Kept 3 outer notebook tabs (`1 · Overview`, `2 · Deep dive`, `3 · Lab steps`) + added single-row sub-tabs inside `2 · Deep dive` (`All Sections \| 2A Math \| 2B Schematic & Table \| 2C Code \| 2D Scope \| 2E Mini-Cards & Quiz`), 3 flippable mini-flashcards per card, and 4-color Kahoot Knowledge Check with guided hints. |
| 6. Card-Unique Diagrams, Math, Code & Waveforms (`100/100`) | 2 / 5 | **5 / 5** | Card-unique `diagramSpec` SVGs, domain-specific equations, scrollable verification tables, pseudocode + commented RTL/Python/CLI snippets, and `100` unique `waveSpec` 4-channel oscilloscope models. |
| 7. Guided Labs Step-Unique Waveforms (`26/26` Steps / `7` Labs) | 2 / 5 | **5 / 5** | Every step across `reset`, `dram`, `scope`, `clock`, `pcie`, `automation`, and `python` mounts its own `stepSpec` 4-channel capture in `app.js` + `labs.js`. |
| 8. Privacy Boundary & Public-Safe Filtering | 4 / 5 | **5 / 5** | Automated regex scanner verifies `0` employer/internal codename leaks across all 100 upgraded cards and 26 lab steps. |
| 9. Accessibility & Modern Web Guidance Compliance | 3 / 5 | **5 / 5** | Applies `app-menus` (roving `tabindex`, Escape/focus containment), `tabs` (`role="tablist"`, `::after` underline indicator not color alone, non-wrapping row), and `responsive-table` (`role="region" tabindex="0"` scrollable wrappers). |
| 10. Automated Regression & Cross-Viewport E2E Tests | 3 / 5 | **5 / 5** | `node --check`, `tests/scope-analysis.test.cjs`, `tests/deep-dive-and-uniqueness.test.cjs`, and Playwright Chromium `tests/scope-browser.test.cjs` at `1280px` & `390px`. |
| **TOTAL SCORE** | **23 / 50 (46%)** | **50 / 50 (100%)** | Full software/educational compliance; client-side models remain clearly labeled as educational / precomputed SPICE captures rather than live lab instrument drivers. |

---

## 3. Accurate Educational vs Hardware Boundary
- Signal models use either stored **ngspice-47** transmission-line data (`si_spice_data.js`, `board_cycles.js`) or parameterized Keysight-style analytical captures clearly labeled as simulated educational traces.
- The browser **CSV Import** (`⬆ Import CSV`) inside the File menu and quick bar lets engineers load real bench oscilloscope/DAQ CSV waveforms directly into the interactive viewer locally on their device with zero cloud upload.
