#!/usr/bin/env python3
"""Re-run all 48 existing publicly disclosed SPICE circuit configurations for 3 source periods.
Data are physical circuit simulator output, not repeated/shifted artwork or oscilloscope measurements.
Old 16 ns simulations are unchanged.
"""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from tempfile import TemporaryDirectory
from statistics import mean
import json, subprocess, math, re, hashlib
root=Path(__file__).resolve().parent
old=json.loads((root/"verification.json").read_text())["cases"]
assert len(old)==48
# Source period 80ns, 40ns high; NMOS gate period 60ns, 30ns high. 240ns spans
# three source periods and four gate periods. Max-step 0.015ns resolves
# sub-ns RLC ringing and finite signal-edge slopes.
DURATION_NS=240
def generate(item):
    name=item["id"]
    cir=(root/(name+".cir")).read_text()
    assert ".tran 0.02n 16n 0 0.02n" in cir
    cir=cir.replace(".tran 0.02n 16n 0 0.02n", ".tran 0.04n 240n 0 0.015n")
    cir=re.sub(r"wrdata "+name+r"\.dat ", "wrdata "+name+"_cycle.dat ",cir)
    # ngspice runs in isolated tempfile; leaves original .cir/.dat/.log intact.
    with TemporaryDirectory(prefix="slt-cycle-") as td:
        path=Path(td)
        (path/(name+"_cycle.cir")).write_text(cir)
        proc=subprocess.run(["ngspice","-b",name+"_cycle.cir","-o","run.log"],cwd=path,capture_output=True,text=True,timeout=90)
        if proc.returncode!=0:raise RuntimeError(f"{name}: SPICE exit {proc.returncode}: {proc.stderr[-500:]}")
        logfile=(path/"run.log").read_text()
        if "ngspice-47 done" not in logfile:raise RuntimeError(f"{name}: incomplete ngspice run: {logfile[-600:]}")
        raw=(path/(name+"_cycle.dat")).read_bytes()
        rows=[[float(t) for t in line.split()] for line in raw.decode().splitlines()[1:] if line.strip()]
        if len(rows)<15000:raise RuntimeError(f"{name} too few samples: {len(rows)}")
        if any(len(row)!=7 or not all(math.isfinite(v) for v in row) for row in rows):
            raise RuntimeError(f"{name} invalid number of columns/nonfinite")
        assert all(rows[i][0]>=rows[i-1][0] for i in range(1,len(rows)))
        # Deterministic adaptive selection: 0.03ns near every source/gate edge,
        # 0.12ns elsewhere. Preserve literal simulator samples only; no filters.
        keep=[];last=-1e9
        def near_edge(t):
            src=[1+80*k for k in range(4)]+[41.2+80*k for k in range(4)]
            gate=([8+60*k for k in range(5)]+[38.4+60*k for k in range(5)]) if item["nmos"] else []
            return any(abs(t-e)<2.8 for e in src+gate)
        for r in rows:
            t=r[0]*1e9
            threshold=.029 if near_edge(t) else .115
            if t-last>=threshold:
                keep.append(r);last=t
        if keep[-1]!=rows[-1]:keep.append(rows[-1])
        samples=[[round(r[0]*1e9,5)]+[round(v,7) for v in r[1:6]]+[round(r[6]*1e3,6)] for r in keep]
        peak=max(r[4] for r in rows);low=min(r[4] for r in rows)
        return {"id":name,"samples":samples,"sha256":hashlib.sha256(raw).hexdigest(),
                "peak_rx_v":round(peak,6),"min_rx_v":round(low,6),
                "sample_count":len(samples),"full_rows":len(rows),
                "source_period_ns":80,"gate_period_ns":60 if item["nmos"] else None}
with ThreadPoolExecutor(max_workers=4) as pool:
    results=list(pool.map(generate,old))
assert len(results)==48
assert len({r["id"] for r in results})==48
byid={r["id"]:r for r in results}
# Grounded checks that the source has multiple distinct rising/falling events.
for case in results:
    a=case["samples"];d={int(round(t)) for t,vs,*rest in a if vs>.05}
    assert a[-1][0]>239
    assert any(2<x[0]<10 and x[1]>.1 for x in a)
    assert any(83<x[0]<93 and x[1]>.1 for x in a)
    assert any(163<x[0]<175 and x[1]>.1 for x in a)
    assert any(50<x[0]<78 and x[1]<.05 for x in a)
    assert any(130<x[0]<155 and x[1]<.05 for x in a)
    if next(x for x in old if x["id"]==case["id"])["nmos"]:
        assert any(9<x[0]<20 and x[5]>2 for x in a)
        assert any(40<x[0]<61 and x[5]<.1 for x in a)
# Compact array retains stable original sample ordering, no synthetic values.
outfile=root/"board_cycles.js"
outfile.write_text("/* Multicycle ngspice-47 actual circuit simulation: 240ns; not physically captured. */\nwindow.SLT_BOARD_CYCLES="+json.dumps({r["id"]:r["samples"] for r in results},separators=(",",":"))+";\n")
manifest=root/"board_cycles_verification.json"
manifest.write_text(json.dumps({"simulator":"ngspice-47","periods":{"source_ns":80,"gate_ns":60},"duration_ns":240,
    "original_netlists_unchanged":True,"cases":[{k:v for k,v in r.items() if k!="samples"} for r in results]},indent=2)+"\n")
print("VERIFIED_MULTICYCLE_SPICE",len(results),"cases",sum(x["sample_count"] for x in results),"stored points",
      "size_bytes",outfile.stat().st_size, "min_rows",min(x["full_rows"] for x in results),
      "example b31",byid["b31"]["sample_count"],"range",byid["b31"]["min_rx_v"],byid["b31"]["peak_rx_v"])
