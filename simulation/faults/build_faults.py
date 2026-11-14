#!/usr/bin/env python3
from pathlib import Path
import subprocess,json,math,hashlib
p=Path(__file__).resolve().parent
cases=[("nominal_1v2",1.2,200.0),("short_1v2",1.2,0.1),("short_5v",5.0,0.1),("overload_12v",12.0,0.1),("high_12v_normal_load",12.0,200.0)]
all_runs=[]
for id,supply,load in cases:
    net=f"""* Fault injection educational hypothetical: model not physical board
* {id} input={supply} V, Rdriver 20 ohm, Radded 33 ohm, load {load} ohm
Vstep vs 0 PULSE(0 {supply} 1n 0.1n 0.1n 45n 90n)
Rdriver vs tx 20
Radded tx p 33
Ltrace p rx 10n
Cpin rx 0 30p
Rload rx 0 {load}
.tran 0.02n 16n 0 0.02n
.control
set wr_singlescale
set wr_vecnames
run
wrdata {id}.dat v(vs) v(tx) v(p) v(rx) i(Ltrace)
quit
.endc
.end
"""
    (p/(id+".cir")).write_text(net)
    r=subprocess.run(['ngspice','-b',id+'.cir','-o',id+'.log'],cwd=p,capture_output=True,text=True,timeout=12)
    if r.returncode or "ngspice-47 done" not in (p/(id+'.log')).read_text():raise RuntimeError('NGSPICE_FAIL '+id)
    rows=[[float(v) for v in line.split()] for line in (p/(id+'.dat')).read_text().splitlines()[1:] if line.strip()]
    if len(rows)<750:raise RuntimeError('Missing rows '+id)
    power=[x[5]**2*33 for x in rows]
    steady=rows[-1]
    runs={"id":id,"supply":supply,"load_ohm":load,"i_steady_a":round(steady[5],7),"resistor_power_w":round(steady[5]**2*33,6),
          "resistor_peak_w":round(max(power),6),"netlist":"simulation/faults/"+id+".cir",
          "raw_sha256":hashlib.sha256((p/(id+'.dat')).read_bytes()).hexdigest(),
          "circuit_sha256":hashlib.sha256((p/(id+'.cir')).read_bytes()).hexdigest(),
          "trace":[[round(a[0]*1e9,5),*[round(q,6) for q in a[1:5]],round(a[5]*1000,6)] for a in rows[::2]]}
    all_runs.append(runs)
    print(id,'I',runs['i_steady_a'],'P_R33',runs['resistor_power_w'])
outfile=p/"fault_data.js"
outfile.write_text("/* ngspice47 fault injection outputs. Damage depiction is conditional/illustrative. */\nwindow.SLT_FAULT_RUNS="+json.dumps(all_runs,separators=(',',':'))+';\n')
(p/'manifest.json').write_text(json.dumps([{k:v for k,v in a.items() if k!='trace'} for a in all_runs],indent=2)+'\n')
print('CASES',len(all_runs),'SAMPLE_ROWS',sum(len(a['trace']) for a in all_runs),'JS_BYTES',outfile.stat().st_size)
