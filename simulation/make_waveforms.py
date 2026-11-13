#!/usr/bin/env python3
from pathlib import Path
import json,math
BASE=Path(__file__).resolve().parent
CASES=[
    ("matched_50","Matched 50 Ω load",20.0,50.0,0.10,False,"No load reflection (ΓL=0)."),
    ("high_200","High 200 Ω load",20.0,200.0,0.10,False,"Positive reflection: receiver voltage initially overshoots DC."),
    ("open_1meg","Nearly open load (1 MΩ)",20.0,1000000.0,0.10,False,"Reflection coefficient approaches +1."),
    ("low_10","Low 10 Ω load",20.0,10.0,0.10,False,"Negative reflection: reduced first receiver level."),
    ("high_slow","High load, 600 ps edge",20.0,200.0,0.60,False,"Same impedance mismatch; slower edge smooths transitions."),
    ("short_1","Nearly shorted load (1 Ω)",20.0,1.0,0.10,False,"Reflection coefficient approaches −1."),
    ("package_ring","Package L/C + high load",20.0,200.0,0.10,True,"Lumped 8 nH package inductance and 3 pF pin capacitance produce extra ringing."),
]
runs=[]
for key,label,rs,rl,tr,parasitic,note in CASES:
    fn=BASE/(key+".dat")
    raw=[[float(t) for t in s.split()] for s in fn.read_text().splitlines()[1:] if s.strip()]
    if len(raw)<1000 or len(raw[0])!=4 or len(raw[-1])!=4:raise ValueError("unexpected ngspice output "+key)
    if not all(math.isfinite(x) for row in raw for x in row):raise ValueError("Nonfinite sim sample")
    if not all(raw[i][0]>=raw[i-1][0] for i in range(1,len(raw))):raise ValueError("Non-monotonic time")
    indices=list(range(0,len(raw),2))
    if indices[-1]!=len(raw)-1:indices.append(len(raw)-1)
    samples=[[round(raw[i][0]*1e9,5),round(raw[i][1],5),round(raw[i][2],5),round(raw[i][3],5)] for i in indices]
    peak=max(row[3] for row in raw)
    minpost=min(row[3] for row in raw if row[0]>2.2e-9)
    final_expected=rl/(rs+rl)
    first_target=(50/(rs+50))*(1+(rl-50)/(rl+50))
    actual_first=next(row[3] for row in raw if row[0]>=(2.10+tr+0.12)*1e-9)
    if key!="package_ring" and abs(actual_first-first_target)>0.012:
        raise ValueError(f"First reflection plateau mismatch {key} actual={actual_first} expected={first_target}")
    if key=="matched_50" and abs(peak-final_expected)>1e-3:raise ValueError("Match does not match")
    if key=="high_200" and peak<=final_expected+0.20:raise ValueError("Expected overshoot absent")
    runs.append(dict(id=key,label=label,rs=rs,rl=rl,tr_ns=tr,td_ns=1.0,z0=50.0,parasitic=parasitic,
                     note=note,peak_v=round(peak,5),min_post_v=round(minpost,5),
                     dc_expected_v=round(final_expected,5),initial_plateau_expected_v=round(first_target,5),
                     gamma_load=round((rl-50)/(rl+50),5),gamma_source=round((rs-50)/(rs+50),5),
                     trace=samples,source_circuit="simulation/"+key+".cir"))
target=BASE/"si_spice_data.js"
target.write_text("/* Deterministic samples exported from ngspice-47. Educational model, not measured hardware. */\n"+
                  "window.SI_SPICE_RUNS = "+json.dumps(runs,ensure_ascii=False,separators=(",",":"))+";\n")
readme=BASE/"README.md"
readme.write_text("""# Transmission-line waveform simulator evidence
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
""")
print("BUILT",len(runs),"runs",sum(len(x['trace']) for x in runs),"sample rows",target.stat().st_size,"bytes")
for r in runs:print(r['id'],"gamma",r['gamma_load'],"peak",r['peak_v'],"dc",r['dc_expected_v'],"first",r['initial_plateau_expected_v'])
