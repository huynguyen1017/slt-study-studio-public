# Instrument Workbench — public teaching methods

The interactive waveform console reproduces **general instrument workflow**:
four configurable channels, channel-specific vertical axes and units,
a timebase (time/div), rising-edge trigger source and threshold,
run/stop/single controls, zoom/auto-scale, two time cursors,
event markers, min/max/peak-to-peak tables and mobile channel views.

The reference supplied for layout evaluation was an oscilloscope screenshot
and a 37-slide presentation marked confidential/proprietary. **Neither
its screenshot nor proprietary board, clock, command, identifying, or
measured information was copied into the published app**. No instrument
vendor artwork, exact UI clone, or proprietary binary is distributed.

There are two explicit provenance classes:

1. **NGSPICE STORED TRACE + DERIVED CURRENT** — Channel 1–3 are from
   the seven stored ngspice transmission-line cases already on this
   website. Channel 4 is calculated as V(rx)/R(load) and is marked
   mathematically derived, not independently recorded.
2. **ILLUSTRATIVE TEACHING SIGNALS** — Domain-specific synthetic
   waveforms for reset, power/rail, digital timing, clocks, DRAM,
   PCIe, I2C, high-speed serial, RTL buses, differential channels,
   UART, and debug-event traces. They are *not* board measurements,
   VCS/Verdi output, oscilloscope captures, or calibrated device specs.

Profiles are determined by the active flashcard subject or graded lab;
in addition, guided lab steps move the first cursor to their specific
event. The 100 existing source flashcards and seven labs remain intact.

The A/B cursor reciprocal (1/Δt) is a mathematical reciprocal of the
selected cursor distance; it is not inherently the clock frequency.
Different lanes can have different physical units and scaling.
The source photo from the uploader is not published.

The training waveform's numerical scale and logic pattern are
educational assumptions. Do not confuse them with a measured limit,
vendor sign-off, physical damage, or a verification result.
