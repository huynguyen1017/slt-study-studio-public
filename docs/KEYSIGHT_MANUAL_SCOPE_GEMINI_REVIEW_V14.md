# Keysight four-channel workbench: source audit, implementation, and Gemini review brief

## Equipment and wiring from the user-provided setup
1. CH1 = CLKOUT1, divided/exported SoC clock, SMA-to-BNC 50 Ω connection.
2. CH2 = VDD_CORE, Keysight N7020A power-rail probe.
3. CH3 = V_RSENSE (differential) using Keysight 1169B probe across the shunt. Current is derived as I(t) = V_diff(t)/R_sense. If sample series already stores amperes, use the "Current already in A" selection. **A 1169B is a differential voltage probe, not a clamp-on current probe.**
4. CH4 = VDD_M / VDD_CORE_M, N7020A power-rail probe.
The lab preset is a **software teaching model**, not verified original captured scope data.

## Authoritative manual and probe references (checked 2026-11-15)
- Keysight Infiniium 2026 manual table of contents:
  https://helpfiles.keysight.com/csg/d9300a/Help/Infiniium-UG/Content/Topics/Home/In_This_Guide.htm
- Acquisition: normal/average, sample-rate, interpolation, memory depth:
  https://helpfiles.keysight.com/csg/d9300a/Help/Infiniium-UG/Content/Topics/Acquisition_Controls/Infiniium-setup-acquisition-tab.htm
- Start, stop, single, clear, autoscale:
  https://helpfiles.keysight.com/csg/d9300a/Help/Infiniium-UG/Content/Topics/Acquisition_Controls/a_acquisition_controls.htm
- Trigger setup and conditions:
  https://helpfiles.keysight.com/csg/d9300a/Help/Infiniium-UG/Content/Topics/Triggering/a_triggering.htm
- Threshold crossings/rise time:
  https://helpfiles.keysight.com/csg/d9300a/Help/Infiniium-UG/Content/Topics/Measurements/Time_Measurements/rise_time.htm
- Rise/fall threshold definitions:
  https://helpfiles.keysight.com/csg/d9300a/Help/Infiniium-UG/Content/Topics/Configure_Meas/Thresholds_Rise_Fall.htm
- Persistence behavior:
  https://helpfiles.keysight.com/csg/d9300a/Help/Infiniium-UG/Content/Topics/Display/Graticule_Persistence.htm
- N7020A official user guide:
  https://prc.keysight.com/Content/PDF_Files/N7020-97005.pdf
- 1169B differential probe specifications (12 GHz, high-side differential voltage limits):
  https://www.keysight.com/us/en/product/1169B/infiniimax-ii-series-probe-amplifier-12-ghz.html

## Physical constraints to teach rather than fake
N7020A is a power-rail probe with approximately 2 GHz bandwidth, large ±24 V probe offset and a roughly ±850 mV **active signal range about the offset**. It is designed to resolve small rail variations over a large DC supply. Avoid long loop-inductance ground leads. Users should never treat a simulated low-pass filter as a calibrated N7020A response.

1169B is a 12 GHz InfiniiMax II probe amplifier. Its differential voltage measurement may be converted to current only after confirming the correct shunt resistance, its Kelvin measurement connection, deskew and measurement bandwidth. The conversion is **not** performed if CH3 is already a current waveform.

## Implemented web features (v14)
- Prior v13 four-channel oscillator, event and FFT visualizations retained.
- Classic illustrated Page 1 restored from GitHub source commit 30c5c175, including question, handwritten conceptual graph, yellow Remember and graph-paper look.
- Four-channel manual bench uses selected active preset/CSV source and performs bounded local numerical processing: normal samples, peak detection of bucket maxima/minima, modeled repetitive acquisition averaging, high-resolution boxcar, AC mean removal / GND display / DC, display gain and offset, first-order sampled low-pass display filter, edge/droop/runt/pulse-width detection, 10–90% / 20–80% time measurement, numerical min/max/Vpp/mean/RMS, A/B time-aligned cursor comparison, FFT strongest non-DC bin, voltage difference, shunt-derived I(t), P(t), dI/dt, trapezoidal energy, downloadable CSV/SVG and local JSON setup save/restore.
- Separate independent VCD viewer continues to display real imported digital addresses/counters/BestDist 0/1/X/Z data from source files, never inventing RTL values.
- Numerical model explicitly reports **effective software sample rate**, avoiding claims of physically simulating true hardware ADC at GSa/s scale.

## Not implemented / not honestly possible on an offline webpage alone
True analog front end, calibration, probe self-diagnostics, memory hardware, signal-source interaction, actual GSa/s ADC capture, Keysight firmware/SCPI/VISA, licensed jitter/eye/mask/serial-decoding software, deskew fixtures, true noise floor, advanced trigger ASIC performance, hardware trigger holdoff or physical acquisition. These require specific instrument model/firmware, connected transport, license and measured signal data. Keep them as taught concepts, not PASS indicators.

## Gemini independent review tasks (handoff, not a completed Gemini session)
**Do not modify production main until CI passes.** Examine the documented hook-up, source references, code diff under `feature/v14-notebook-keysight-manual`, the page 1 screenshot and the v14 browser regression. Independently check:
1. Restore question and yellow Remember on 100/100 cards, desktop and phone.
2. Audit each scope control for real effect (no inert controls). For every control, compare exact formula/threshold with Keysight manual and identify model vs hardware gaps.
3. Validate Vdiff/Rshunt units, N7020A offset headroom, 1169B differential limits, channel assignments and trigger conditions.
4. Test normal vs average vs peak vs HiRes, AC coupling, edge/droop/glitch, math, FFT, A/B, imported CSV and existing SPICE traces.
5. Look for UI layout regressions, stale offline service worker caches, accessibility errors and pseudomeasured claims.
6. Produce a reviewed patch and independent test evidence; do not claim measured hardware results from reconstructed/simulated data.

## Release gate
Require CI: parser and baseline SPICE numerical checks; restored Page 1 question/diagram/Remember; 4 interactive channels; effective software sample rate label; physical/synthetic separation; desktop/mobile Playwright tests. Preserve backup `backup/v13-before-notebook-keysight-20261115`.
