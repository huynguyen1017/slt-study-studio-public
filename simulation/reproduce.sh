#!/bin/sh
set -eu
cd "$(dirname "$0")"
for circuit in matched_50 high_200 open_1meg low_10 high_slow short_1 package_ring; do
  ngspice -b "$circuit.cir" -o "$circuit.log" >/dev/null
  test -s "$circuit.dat"
done
python3 make_waveforms.py
printf 'Simulation runs reproduced: 7\n'
