#!/usr/bin/env python3
from pathlib import Path
from itertools import product
from concurrent.futures import ThreadPoolExecutor
import json, math, subprocess, hashlib
root=Path(__file__).resolve().parent
specs=list(product([0.8,1.2,1.8],[0,33],[1,10],[2,30],[False,True]))
def generate(k,sp):
    vs,rs,ln,cp,mos=sp
    name=f'b{k:02d}'
    net=f"""* SLT educational PCB circuit: transient analysis
* Source={vs} V, added series R={rs} ohm, L={ln}nH, C={cp}pF, MOS switch enabled={int(mos)}
Vsrc vs 0 PULSE(0 {vs} 1n 0.10n 0.10n 40n 80n)
Rdriver vs tx 20
Rseries tx p {rs if rs else 0.1}
Ltrace p rx {ln}n
Cload rx 0 {cp}p
Rload rx 0 200
"""
    if mos:net+="""Vgate gate 0 PULSE(0 3.3 8n 0.2n 0.2n 30n 60n)
Mpull rx gate 0 0 SWNM W=150u L=1u
.model SWNM NMOS LEVEL=1 VTO=1.1 KP=0.0001 LAMBDA=0.01
"""
    else:net+="Vgate gate 0 DC 0\n"
    net+=f""".tran 0.02n 16n 0 0.02n
.control
set wr_singlescale
set wr_vecnames
run
wrdata {name}.dat v(vs) v(tx) v(p) v(rx) v(gate) i(Ltrace)
quit
.endc
.end
"""
    (root/(name+'.cir')).write_text(net)
    p=subprocess.run(["ngspice","-b",name+".cir","-o",name+".log"],cwd=root,capture_output=True,text=True,timeout=18)
    if p.returncode!=0:raise RuntimeError((name,p.returncode,p.stderr))
    log=(root/(name+'.log')).read_text()
    if "ngspice-47 done" not in log:raise RuntimeError(f"Spice did not complete: {name}")
    rows=[[float(t) for t in line.split()] for line in (root/(name+'.dat')).read_text().splitlines()[1:] if line.strip()]
    if len(rows)<750 or any(len(a)!=7 for a in rows):raise RuntimeError(f"Invalid data {name}")
    if not all(math.isfinite(v) for a in rows for v in a):raise RuntimeError(f"Nonfinite data {name}")
    if any(rows[i][0]<rows[i-1][0] for i in range(1,len(rows))):raise RuntimeError(f"Unordered data {name}")
    selected=rows[::2]
    if selected[-1]!=rows[-1]:selected.append(rows[-1])
    values=[[round(a[0]*1e9,5)]+[round(v,7) for v in a[1:6]]+[round(a[6]*1000,6)] for a in selected]
    before=min(rows,key=lambda a:abs(a[0]-7.8e-9))
    after=min(rows,key=lambda a:abs(a[0]-15.5e-9))
    peak=max(a[4] for a in rows)
    return {"id":name,"supply":vs,"series_r":rs,"inductor_nh":ln,"cap_pf":cp,"nmos":mos,
            "peak_v":round(peak,5),"pre_nmos_rx_v":round(before[4],5),"post_nmos_rx_v":round(after[4],5),
            "netlist":"simulation/board/"+name+".cir",
            "raw_sha256":hashlib.sha256((root/(name+'.dat')).read_bytes()).hexdigest(),
            "circuit_sha256":hashlib.sha256((root/(name+'.cir')).read_bytes()).hexdigest(),
            "samples":values}
with ThreadPoolExecutor(max_workers=5) as pool:
    results=list(pool.map(lambda it:generate(*it),enumerate(specs)))
if len(results)!=48:raise RuntimeError("Missing models")
assert all(x['pre_nmos_rx_v']>=-1e-4 for x in results)
assert all(x['post_nmos_rx_v']<x['pre_nmos_rx_v'] for x in results if x['nmos'])
for sp in results:
    if not sp['nmos'] and abs(sp['pre_nmos_rx_v']-sp['post_nmos_rx_v'])>.01:raise RuntimeError("Passive circuit not settled: "+sp['id'])
outfile=root/'board_data.js'
outfile.write_text("/* ngspice-47 circuit results; each selectable configuration simulated independently. */\nwindow.SLT_BOARD_RUNS="+json.dumps(results,separators=(",",":"),ensure_ascii=False)+";\n")
manifest={"simulator":"ngspice-47","model":"Pulse source, 20Ω driver, selectable added 0/33Ω series R, 1/10nH L, 2/30pF shunt C, 200Ω load, optional Level-1 NMOS shunt gated at 8ns","supply_options_volts":[0.8,1.2,1.8],"cases":[{k:v for k,v in a.items() if k!="samples"} for a in results]}
(root/'verification.json').write_text(json.dumps(manifest,indent=2)+"\n")
print("VERIFIED",len(results),"SPICE RUNS",sum(len(a['samples']) for a in results),"samples",outfile.stat().st_size,"bytes")
for a in results:
    if a['supply']==1.2 and a['series_r']==33 and a['inductor_nh']==10 and a['cap_pf']==30:
        print("KEY_CASE",a['nmos'],"peak",a['peak_v'],"rx before",a['pre_nmos_rx_v'],"rx after",a['post_nmos_rx_v'])
