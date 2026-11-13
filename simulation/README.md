# Transmission-line waveform simulator evidence
This folder contains publicly shareable, reproducible teaching circuits created specifically for SLT Study Studio.
ngspice version: 47, using a lossless T line, Z0=50 ohm, propagation delay=1 ns.
Input source: 0 V to 1 V step beginning 1 ns; Rdriver=20 ohm; rise time shown per case.
Loads: 1, 10, 50, 200 ohm and 1 Megohm. Package-ringing variant adds Rpkg=0.3 ohm, Lpkg=8 nH and Cpin=3 pF.
The data are **simulator outputs**, not measured waveforms or Synopsys HSPICE/Verdi runs.

Reproduce a case by running: ngspice -b matched_50.cir -o matched_50.log
It emits a .dat time series with time (seconds), V(source), V(transmitter), V(receiver).
si_spice_data.js is a decimated snapshot of the actual .dat traces for the static browser viewer.

A browser on GitHub Pages cannot invoke ngspice or a remote EDA license, so changing the scenario
displays a *different precomputed ngspice run*, not a new server-side simulation.
Students can inspect sampled values at cursor times and reproduce each run locally.

The ideal lossless line and lumped package elements simplify many real-world effects.
This does not model crosstalk, all connector parasitics, board stackup, jitter, receiver thresholds,
eye compliance, or a physical design. Check device specifications before inferring pass/fail.
There is **no Synopsys/Verdi verification** of these teaching circuits in this environment.
