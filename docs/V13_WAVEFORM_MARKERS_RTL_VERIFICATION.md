# V13 — synchronized markers and RTL bus waveform redesign

## Preservation
- Source baseline: `da88b0a38006d3e565d4d914d7c9b5d32266ac0a` (v12)
- Permanent rollback branch: `backup/v12-before-synchronized-markers-20261115`
- Development branch: `feature/v13-synchronized-surfer-waveforms`
- This update is additive: it retains existing flashcard content, 26 guided lab steps, local progress state, SPICE netlists and 240 ns simulation samples.

## Marker behavior (previous bug and fix)
Previously the four-channel `instrument_console.js` progressed A during replay while B stayed at its original time; its readout tab principally showed channel readings at A, so B's purpose was unclear.

V13 defaults to linked mode: when A advances, B advances with it at a configurable separation `Δt = B−A`. Dragging B sets the separation; toggling **Link B to A** enables independent mode. A and B both show a vertical reference across all lanes and a measured endpoint at every channel. The A→B interval is shaded and the table compares actual profile values at both times, including 0→1, bus-to-bus hexadecimal transitions or numerical voltage/current changes. All controls continue to function during capture playback, manual seek and event navigation.

The board-level ngspice viewer similarly links A/B across all six channels. The smaller 50Ω transmission-line viewer synchronizes A and B to the original waveform's replay and lists Vsource, Vtx, Vrx and the **derived** Iload.

## Digital rail presentation
The four-channel Deep Dive instrument now uses:
- binary step traces and explicit **0/1** states when the signal is defined as a digital scalar;
- hex-vector bus segments with waveform-style polygon boundaries for modeled registers and data buses;
- original analog curves for voltage, current, frequency, and measured quantities without applying false 0/1 interpretations.

Some Deep Dive datasets are *illustrative training models*, not captured waveforms; the new visual rendering does not promote them to measured data.

## Real RTL signal view without fabricated addresses
The optional **RTL / Address Bus Viewer** is mounted on page 2, section 2D, of every card. It loads a local VCD file in the browser, reads timescale and declared widths, preserves scalar 0/1/X/Z and unknown/high-impedance vector values, displays hierarchical signal names, and offers radix choices (hex, binary, unsigned, signed). Signal picker supports up to 8 rails and defaults to up to 4. A/B cursor replay, timing deltas, and on-chart seeking use actual file timestamps. Data remains local and is not uploaded, cached or committed to GitHub.

An authentic Synopsys VCS or other HDL VCD **must be provided by the visitor** before address sequences can be displayed. A PNG of a Surfer/Verdi screen cannot be converted into authoritative time-indexed vector values. The original team's protected FSDB/VCD or screenshot is not distributed through this public site.

## ENGR852 8-bit vs 16-bit clarification
The course presentation distinguishes 8-bit **saturation** (`FF`, comparator tie `FF < FF` false) from the 16-bit full-range max SAD of `16'hFF00 = 256 × 255 = 65,280`, compared against initial `16'hFFFF`. The built-in simplified scope preset now matches this distinction and explicitly says it is an *illustrative comparator-edge training sketch*. Actual count/PEready/AddressR/AddressS1/AddressS2/BestDist/motion-vector behavior should be loaded from authentic VCS VCD evidence rather than invented.

## Validation / release criteria
Automated CI:
- syntax parsing on all edited JS files;
- previous board SPICE math regression (48 unchanged configurations);
- previous browser scope interactions;
- new desktop (1280px) and phone (390px) tests of B following A, unlink behavior, 4-channel endpoint markers and comparisons, local VCD decoding of scalar and 8/13/16-bit buses, and invalid VCD handling.

Remaining: real-device Safari/VoiceOver audit, deeper mobile performance profiling, native FSDB ingestion (not currently supported in browser), file-size limits for unusually large HDL dumps, and comparison against a genuinely exported 8/16-bit VCS VCD. Do not mark native VCS/Verdi visualization verified from a design-only demo.
