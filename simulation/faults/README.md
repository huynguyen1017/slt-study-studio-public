# Electrical fault-injection teaching examples

Five circuit cases are actual ngspice-47 electrical transient simulations,
not physical hardware tests or Synopsys/Verdi results.

Circuit: 20-ohm driver, additional 33-ohm series resistor, 10nH lumped
inductance, 30pF shunt capacitance, plus selected load.

- nominal_1v2: 1.2 V, 200-ohm load
- short_1v2: 1.2 V, 0.1-ohm near short
- short_5v: 5 V, 0.1-ohm near short
- overload_12v: 12 V, 0.1-ohm near short
- high_12v_normal_load: 12 V, 200-ohm load

Each ngspice analysis covers 0 to 16ns. The step begins at 1ns.
R33 dissipation is calculated from I(Ltrace)^2 times 33ohm.

Run python3 build_faults.py from this directory on a host with
ngspice-47 installed. Each .cir file specifies the model; its .dat
file contains original raw simulator output. fault_data.js contains
decimated output used by the public browser, and manifest.json records
SHA-256 for raw time series and circuits.

## Thermal overlay: deliberately separate from SPICE output

The SPICE results are electrical only, not electrothermal modeling.
The thermal animation uses this hypothetical first-order estimate:

T(t) = 25 C + P x 110 K/W x (1 - exp(-t/2 seconds)).

The 0.25 W rating, 25 C ambient, 110 K/W thermal resistance,
2-second time constant and 155 C warning threshold are illustrative.
The final simulated current is assumed to persist for seconds
in that separate estimate, whereas the SPICE trace is only 16ns long.

The graphic denotes a hypothetical overheating risk, not a measured
temperature, a guaranteed burned resistor, or combustion. Actual
resistor safety depends on device ratings, PCB, airflow and exposure.
Do not apply the 5 or 12 V short-circuit examples to a real logic DUT.
