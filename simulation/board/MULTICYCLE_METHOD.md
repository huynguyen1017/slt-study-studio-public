# Multicycle board waveform engineering evidence

## Scope and provenance

The webpage now contains **two separate classes of waveforms**:

- **48 ngspice-47 board-level multicycle datasets:** Each original 16 ns
  circuit was re-simulated for 240 ns without modifying its topology or
  replacing its nonlinear MOSFET model. Source PULSE(0,V,1ns,0.10ns,
  0.10ns,40ns,80ns) and optional gate PULSE(0,3.3V,8ns,0.2ns,
  0.2ns,30ns,60ns) produce three source periods and four gate periods.
  The cycles arise from solving the circuit again; they are not
  duplicated, redrawn or extrapolated from the original edge.
- **Deep Dive / guided-lab illustrations:** Three load pulses with a
  transparent IR-drop + damped mathematical response, intended for
  education. These are not ngspice runs, physical oscilloscope captures,
  or measured CPU2/PDN behavior.

The original 48 short 16 ns files are unchanged. The new generator is
`build_cycles.py`; it uses isolated temporary files and leaves the old
netlists, traces and verification manifest intact. A 0.015 ns
maximum transient step preserves fast edge details. An adaptive
time-point selection stores actual SPICE sample rows densely around
each pulse transition and more sparsely elsewhere. It never synthesizes
noise or paints new samples.

`board_cycles_verification.json` records 48 individual source-run SHA-256
hashes, raw and retained point counts, channel extrema and period
definitions.

## Instrument controls

- CH1: `Vsrc` (volts); 80 ns periodic voltage stimulus, not a clock
- CH2: `Vtx` (volts); after 20 ohm source resistance
- CH3: `Vrx` (volts); load-side node (200 ohm load, capacitor and optional FET)
- CH4: `Vgate` (volts); 3.3 V pulsed NMOS gate when installed
- CH5: `Itrace` (milliamps); ngspice branch current through the inductor
- CH6: `Pseries` (milliwatts); derived `Itrace[A]^2 * Rseries[ohm]`,
  not a measured signal and *not* a thermal-failure prediction

The complete-period scope starts at 0–240 ns and offers a zoomable
16 ns original-transient view, hardware-trigger simulation, per-channel
vertical gain, current and voltage axes, A/B cursors, min/max/pk–pk
values, a detected-edge event list, and a 3.6 ns true-sample microscope
focused on the selected source or gate transition. Its 240 ns capture
includes rising and falling source edges and repeated NMOS switching,
including changing phase relationships between the 80 ns source period
and the 60 ns optional gate period.

**Replay** is a progressive SPICE-data acquisition presentation. It
progressively reveals recorded simulation points and time-correlates
the circuit current path and component readout with the acquisition
cursor. The optional baseline overlay is a separate simulated circuit
with the same supply and MOSFET selection but Rseries=0, L=1 nH,
C=2 pF, allowing a grounded comparison to the selected circuit.
The overlay uses the same ns axis; no simulated source is falsely
presented as a real Keysight waveform.

The Deep Dive and guided-lab analog voltage demonstrations now have
three finite-slew load bursts and damped transients; the model
explicitly shows its assumed IR-drop coefficient. It is a training
function, not calibrated hardware physics.

## Important engineering boundaries

1. Distinguish a pulse repetition rate from a CPU/reference clock.
   An 80 ns source period equals 12.5 MHz *repetition rate*. A 60 ns
   gate period equals approximately 16.67 MHz repetition rate.
2. The lumped L/C undamped resonance estimate is not necessarily
   the measured ringing frequency when damping, nonlinear conduction,
   and loading are present.
3. CH6 power is an instantaneously calculated electrical power rate,
   not temperature. This circuit does not include a resistor thermal
   model and cannot prove overheating, smoke, fire, or permanent damage.
4. The upper 50 ohm transmission-line study and lower PCB-like
   ngspice network are independent circuits. They have different
   topology and samples; the upper 16 ns cursor is deliberately
   not synchronized with the 240 ns board multicycle mode.
5. The public web app selects among **48 precomputed SPICE configurations**;
   it does not run arbitrary new ngspice calculations in the visitor's
   browser, and does not connect to a live oscilloscope.
6. Confidential CPU2 measurement values and original waveform imagery
   were not distributed in this public release.

## Rebuild / verify

In `simulation/board` with ngspice-47 installed:

```sh
python3 build_cycles.py
```

Run the browser and offline tests against a local static HTTP server,
not a `file://` URL. The separate local reference site on port 8789
is not part of this build.
