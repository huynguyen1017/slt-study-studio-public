# Connected PCB-circuit teaching model — ngspice-47

This is a public, reproducible **circuit-simulation teaching module**.
It is not a fabricated PCB, measured oscilloscope trace, a real board
connection diagram, an on-demand cloud simulation, or a Synopsys/Verdi run.

Modeled electrical circuit:
  Vsource -> Rdriver 20Ω -> TX -> Rseries (0.1Ω jumper or 33Ω) ->
  Ltrace (1nH or 10nH) -> RX.
  RX -> Rload 200Ω -> common ground.
  RX -> Cload (2pF or 30pF) -> common ground.
  Optional RX -> NMOS drain / source -> common ground.
  MOS gate is independently switched from 0V to 3.3V at about 8ns.

The input step is from 0 to 0.8, 1.2 or 1.8V at about 1ns
(100ps rise and fall). The source and gate are teaching values;
real device ratings must always be checked.

48 scenarios = 3 input levels × 2 resistor × 2 inductor × 2 capacitor × 2 NMOS.
Each case was simulated in ngspice 47 independently.

Run python3 build_board.py in this directory with ngspice installed
to reproduce all 48 source netlists, raw time-series files, and
browser waveform samples. Original .cir and raw .dat files are included.
The verification.json file contains SHA-256 hashes for source and raw data.

The upper scope shows a SEPARATE ideal 50Ω transmission-line model.
The board panel below it uses a lumped trace L, shunt C, series resistances
and a Level-1 NMOS shunt switch, sharing only a conceptual time cursor.

The schematic is drawn to teach pin connectivity and current paths;
it is not PCB manufacturing/layout CAD. Colored copper represents node
voltage, not literal current flow. Component energies/power are derived
from ngspice samples, not independent physical measurements.
