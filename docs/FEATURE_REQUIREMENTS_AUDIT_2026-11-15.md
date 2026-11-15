# SLT Study Studio: requirement traceability and release audit
**Date:** 2026-11-15  
**Baseline preserved:** `b04930a115e682fbdc0fd4f498fd0d576e7b6c1d`  
**Backup:** `backup/pre-oscilloscope-upgrade-b04930a-20261115`  
**Scope:** Public educational GitHub Pages app; **not** the private 195-question interview master, native Synopsys/Verdi environment, or localhost:8789.

## Scoring (provisional engineering rubric, not a performance benchmark)
| Workstream / requirement | Baseline /5 | Updated branch /5 | Evidence and remaining gate |
|---|---:|---:|---|
| Flashcard deck coverage and sourcing | 3 | 3 | 100 public cards; original private reference material references a 195-question master. All 100 public `source` fields are `#`; placeholder links are hidden in branch. Individual source citations still missing. |
| Three-page engineering notebook explanations | 4 | 4 | Overview, Deep Dive, Lab Steps; conceptual diagrams; independent source-to-question validation remains incomplete. |
| Guided labs and progress | 4 | 4 | 7 independent labs, 26 steps; localStorage tracking and review queue; comprehensive state transition E2E not yet covered. |
| Physically derived board transient fidelity | 4 | 4 | 48 ngspice-47 configurations; 240ns / 3 source periods and 4 NMOS periods; old 16ns originals remain. SPICE rerun and calibration against physical bench not independently reproduced during this audit. |
| Oscilloscope-like controls | 3 | 4 | Existing 6 lanes, cursors, replay, event zoom, baseline and Time/div; new edge/mode/holdoff, vertical display coupling/inversion/offset, autoset, spectral DFT, XY, CSV and SVG. Not hardware feature-equivalent. |
| Mobile & accessibility | 3 | 3 | Existing responsive layout; automated Chromium regression at desktop 1280 and phone 390. Full WCAG and iPhone Safari audit not done. |
| Performance and offline behavior | 3 | 3 | Static GitHub Pages, service worker, full 7.86 MB board_cycles.js. Cache revision bumped to v11. Network/offline + loading-speed profiling on real phones is pending. |
| Reproducibility / technical integrity | 4 | 4 | Netlists, original data, 48-case manifest, method statements distinguish SPICE, equations and illustrative guided-lab traces. No in-browser on-demand SPICE solver. |
| Privacy and public-content filtering | 4 | 4 | Static client-side only, no authentication or external telemetry. Must recheck each proposed additional card before public release; do not publish employer logs, private study materials, or instrument captures. |
| Automated regression | 2 | 4 | New syntax, dataset/manifest, numerical engine, and Chromium browser interactions. Still needs cross-browser/manual exploratory verification. |
| **Overall (equal-weight indicative)** | **34/50** | **37/50** | **68% → 74%** under this explicitly bounded rubric; not a verified 100% grade. |

## Previous request recovery and implementation map
- Keep existing study-app structure, quiz logic, and local progress intact: no content rewrite or localStorage key change.
- Preserve original repository: immutable baseline commit and separate backup branch; implement upgrades in feature branch.
- Strengthen waveform realism: the multicycle SPICE rerun from the baseline solves 240ns with unchanged circuit topology, 0.015ns maximum timestep, and documented event-adaptive sample selection. No copied/repeated edge pictures.
- Enhance Deep Dive/board learner: existing board circuit, current path annotations, edge microscope, true-sample event replay, and separate illustrative analog lab models retained.
- Add practical oscilloscope operation: vertical display transforms, horizontal zoom/timebase, edge trigger slope/mode/holdoff, autoset, A/B cursors, event navigation, spectrum, XY, exports.
- Keep units and provenance clear: Vsrc/TX/RX/Vgate in V, Ltrace current in mA, Pseries in mW calculated as I²R. 80ns source = 12.5MHz repetition, not a CPU/reference clock; gate period 60ns.
- Preserve privacy and separation: source simulation versus physical oscilloscope data, backend/hardware limitation, private reference documents, and separate 127.0.0.1:8789 environment.

## Accurate limits of the virtual instrument
This is an interactive viewer for precomputed samples. It **does not** implement the analog input front-end, a hardware ADC, user-adjustable impedance/bandwidth, actual probes/compensation, true stochastic acquisition averaging, segmented hardware memory, calibrated trigger jitter, or a remote lab instrument. Normal/Single triggers are searches over stored rows and cannot capture events outside the 240ns dataset. AC view removes the selected-window mean; it is **not** a physical analog AC-coupling transfer function. FFT is a 128-point Hann-windowed DFT after linear interpolation of irregular ngspice timestamps, with frequency resolution approximately `1 / window seconds`. XY is a correlation plot from stored samples.

## Critical remaining work / release gates
1. **P1**: Reconcile the 195-question private interview master with only 100 public-safe cards; review publication permissions and filter confidentiality *before* expanding the public deck. Do not silently copy a private file.
2. **P1**: Provide per-card verified **public** references. Current `source: '#'` placeholders do not substantiate the card answers.
3. **P1**: Real hardware oscilloscope feature parity cannot be claimed from GitHub Pages simulation alone. Offer an explicit data-import path (CSV/VCD/bench data, with privacy controls) or authorized hardware adapter if needed.
4. **P2**: Run a fresh ngspice-47 reproducer and independently compare the per-run hashes and edge extrema; automated tests currently validate manifest completeness and numerical display algorithms, not the simulator's original provenance.
5. **P2**: Verify offline first-visit and subsequent no-network reload on real mobile devices. Profile 7.86 MB JavaScript asset parsing, cache errors, and memory use.
6. **P2**: Extend browser E2E coverage to all study modes, changing board parts, browser persistence/reset, keyboard and screen-reader operation, and 320/430/768px viewports.
7. **P3**: Publish source-safe teaching notes and browser instrument quick-start guides, without implying hardware measurement or interview-specific NDA compliance.

## Verification
CI workflow `.github/workflows/scope-validation.yml` runs:
- Node parsing and deterministic threshold, period, duty, holdoff, FFT, XY, CSV and manifest checks.
- Headless Chromium with viewport 1280px and 390px to open first Signal Integrity flashcard → Deep Dive → board scope, change trigger slope/mode, confirm no false capture, exercise Autoset and export.
- It must pass before merge. CI does not constitute a physical oscilloscope calibration or completed accessibility audit.
