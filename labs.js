window.STUDY_LABS = [
  {
    "id": "reset",
    "title": "A board has no boot log",
    "desc": "Separate the host connection from power, clock and reset.",
    "steps": [
      [
        "A UART adapter appears in lsusb, but the console is silent. What have you established?",
        [
          "The adapter enumerated on the host.",
          "The SoC has booted.",
          "The BIOS is correct.",
          "All board rails are good."
        ],
        0,
        "A USB bridge and its target are separate devices.",
        "Enumeration proves host visibility of the adapter. Check stable serial path, baud rate, wiring, target power and competing readers next."
      ],
      [
        "Before reflashing, which capture best tests startup dependencies?",
        [
          "Four unrelated DMM readings.",
          "Rails, clock and selected reset on a shared scope timebase.",
          "A screenshot of the last successful boot.",
          "CPU utilization on the host."
        ],
        1,
        "You need the relative timing of events.",
        "A shared capture lets you compare rail validity and clock qualification with reset release. Use the platform's actual thresholds and delays."
      ],
      [
        "REFCLK toggles. Can you conclude the internal PLL is locked?",
        [
          "Yes, any transitions prove lock.",
          "Yes, if reset is high.",
          "No; check the documented lock/qualification status.",
          "Only if the host sees USB."
        ],
        2,
        "Activity and qualification are different observations.",
        "An input clock can be active while a PLL is acquiring lock. Verify the appropriate status and measurement requirements."
      ],
      [
        "Reset releases early. What should the next experiment do?",
        [
          "Replace the SoC immediately.",
          "Change firmware, board and voltage together.",
          "Ignore it if one boot succeeds.",
          "Correct the specified sequencing variable and repeat the original failing condition."
        ],
        3,
        "A controlled comparison changes one cause.",
        "Retain the failing capture, make the approved sequencing correction and repeat. A single successful boot is not a reliability study."
      ]
    ],
    "stepSpecs": [
      {
        "id": "lab-reset-s0",
        "presetId": "Startup_4CH_PG_CLK_RST",
        "customChannels": true,
        "title": "A board has no boot log · Step 1: USB Bridge Powered, SoC Cold",
        "unit": "ms",
        "T": 120,
        "t0": 0,
        "sampleRate": "4 GSa/s",
        "memDepth": "10 Mpts",
        "presetName": "Lab_reset_step1.set",
        "kind": "UART/Host",
        "e1": 30.0,
        "e2": 78.0,
        "faultLabel": "Fault Trap (Step 1)",
        "fixedLabel": "Verified Fix (USB Bridge Powered, SoC Cold)",
        "channels": [
          {
            "name": "USB_5V",
            "type": "rail",
            "unit": "V",
            "min": 0,
            "max": 5.5,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "VBUS alive at 5.0V"
          },
          {
            "name": "VDD_CORE",
            "type": "rail",
            "unit": "V",
            "min": 0,
            "max": 1.2,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "Target Core VR stuck 0.0V (unpowered!)"
          },
          {
            "name": "UART_TX",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "UART TX dead low because DUT is unpowered"
          },
          {
            "name": "LSUSB_OK",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "Linux USB bridge enumerates even on dead DUT"
          }
        ],
        "events": [
          {
            "t": 30.0,
            "label": "Step 1 Event",
            "ch": 0,
            "reason": "A UART adapter appears in lsusb, but the console is silent. What have you established?"
          },
          {
            "t": 57.6,
            "label": "Key Evidence Node",
            "ch": 1,
            "reason": "Target Core VR stuck 0.0V (unpowered!)"
          },
          {
            "t": 86.4,
            "label": "Verified Resolution",
            "ch": 3,
            "reason": "Enumeration proves host visibility of the adapter. Check stable serial path, baud rate, wiring, target power and competi"
          }
        ],
        "registers": [
          [
            "Lab Step",
            "RESET #1/4",
            "A UART adapter appears in lsusb, but the console is silent. What have you established?"
          ],
          [
            "Verification Key",
            "USB Bridge Powered, SoC Cold",
            "A USB bridge and its target are separate devices."
          ]
        ],
        "lesson": "Enumeration proves host visibility of the adapter. Check stable serial path, baud rate, wiring, target power and competing readers next."
      },
      {
        "id": "lab-reset-s1",
        "presetId": "Startup_4CH_PG_CLK_RST",
        "customChannels": true,
        "title": "A board has no boot log · Step 2: 4-CH Power-Clock-Reset Capture",
        "unit": "ns",
        "T": 110,
        "t0": 0,
        "sampleRate": "10 GSa/s",
        "memDepth": "10 Mpts",
        "presetName": "Lab_reset_step2.set",
        "kind": "reset",
        "e1": 27.5,
        "e2": 71.5,
        "faultLabel": "Fault Trap (Step 2)",
        "fixedLabel": "Verified Fix (4-CH Power-Clock-Reset Capture)",
        "channels": [
          {
            "name": "CORE_PG",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "Core VR Power-Good"
          },
          {
            "name": "IO_PG",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "IO/PLL VR Power-Good"
          },
          {
            "name": "PLL_LOCK",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "REFCLK valid + internal PLL locked"
          },
          {
            "name": "SYS_RESET_N",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "Fault releases before PLL lock vs Clean post-lock"
          }
        ],
        "events": [
          {
            "t": 27.5,
            "label": "Step 2 Event",
            "ch": 0,
            "reason": "Before reflashing, which capture best tests startup dependencies?"
          },
          {
            "t": 52.8,
            "label": "Key Evidence Node",
            "ch": 1,
            "reason": "IO/PLL VR Power-Good"
          },
          {
            "t": 79.2,
            "label": "Verified Resolution",
            "ch": 3,
            "reason": "A shared capture lets you compare rail validity and clock qualification with reset release. Use the platform's actual th"
          }
        ],
        "registers": [
          [
            "Lab Step",
            "RESET #2/4",
            "Before reflashing, which capture best tests startup dependencies?"
          ],
          [
            "Verification Key",
            "4-CH Power-Clock-Reset Capture",
            "You need the relative timing of events."
          ]
        ],
        "lesson": "A shared capture lets you compare rail validity and clock qualification with reset release. Use the platform's actual thresholds and delays."
      },
      {
        "id": "lab-reset-s2",
        "presetId": null,
        "customChannels": true,
        "title": "A board has no boot log · Step 3: REFCLK Running vs PLL Unlocked",
        "unit": "ns",
        "T": 100,
        "t0": 0,
        "sampleRate": "10 GSa/s",
        "memDepth": "10 Mpts",
        "presetName": "Lab_reset_step3.set",
        "kind": "clock",
        "e1": 25.0,
        "e2": 65.0,
        "faultLabel": "Fault Trap (Step 3)",
        "fixedLabel": "Verified Fix (REFCLK Running vs PLL Unlocked)",
        "channels": [
          {
            "name": "REFCLK_100M",
            "type": "clock",
            "unit": "V",
            "min": 0,
            "max": 1.1,
            "probe": "1169B Diff",
            "coupling": "DC 50Ohm",
            "bw": "12 GHz",
            "desc": "External 100 MHz REFCLK toggling cleanly"
          },
          {
            "name": "AVDD_PLL",
            "type": "rail",
            "unit": "V",
            "min": 0.6,
            "max": 1.2,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "PLL analog rail dips / noisy"
          },
          {
            "name": "CLKOUT_DIV",
            "type": "clock",
            "unit": "MHz",
            "min": 400,
            "max": 1800,
            "probe": "1169B Diff",
            "coupling": "DC 50Ohm",
            "bw": "12 GHz",
            "desc": "Internal PLL unstable until loop locks"
          },
          {
            "name": "PLL_LOCK_REG",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "PLL_LOCK stays LOW proving activity != lock"
          }
        ],
        "events": [
          {
            "t": 25.0,
            "label": "Step 3 Event",
            "ch": 0,
            "reason": "REFCLK toggles. Can you conclude the internal PLL is locked?"
          },
          {
            "t": 48.0,
            "label": "Key Evidence Node",
            "ch": 1,
            "reason": "PLL analog rail dips / noisy"
          },
          {
            "t": 72.0,
            "label": "Verified Resolution",
            "ch": 3,
            "reason": "An input clock can be active while a PLL is acquiring lock. Verify the appropriate status and measurement requirements."
          }
        ],
        "registers": [
          [
            "Lab Step",
            "RESET #3/4",
            "REFCLK toggles. Can you conclude the internal PLL is locked?"
          ],
          [
            "Verification Key",
            "REFCLK Running vs PLL Unlocked",
            "Activity and qualification are different observations."
          ]
        ],
        "lesson": "An input clock can be active while a PLL is acquiring lock. Verify the appropriate status and measurement requirements."
      },
      {
        "id": "lab-reset-s3",
        "presetId": null,
        "customChannels": true,
        "title": "A board has no boot log · Step 4: Hold Reset Past Lock Delay",
        "unit": "ns",
        "T": 140,
        "t0": 0,
        "sampleRate": "10 GSa/s",
        "memDepth": "10 Mpts",
        "presetName": "Lab_reset_step4.set",
        "kind": "reset",
        "e1": 35.0,
        "e2": 91.0,
        "faultLabel": "Fault Trap (Step 4)",
        "fixedLabel": "Verified Fix (Hold Reset Past Lock Delay)",
        "channels": [
          {
            "name": "PWR_GOOD",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "All PMIC power rails stable"
          },
          {
            "name": "PLL_LOCK",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "PLL lock reaches 1 at t=50 ns"
          },
          {
            "name": "RESET_EARLY",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "Early release glitches SoC BootROM"
          },
          {
            "name": "RESET_SAFE",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "Hold low >= t_POR past lock restores clean boot"
          }
        ],
        "events": [
          {
            "t": 35.0,
            "label": "Step 4 Event",
            "ch": 0,
            "reason": "Reset releases early. What should the next experiment do?"
          },
          {
            "t": 67.2,
            "label": "Key Evidence Node",
            "ch": 1,
            "reason": "PLL lock reaches 1 at t=50 ns"
          },
          {
            "t": 100.8,
            "label": "Verified Resolution",
            "ch": 3,
            "reason": "Retain the failing capture, make the approved sequencing correction and repeat. A single successful boot is not a reliab"
          }
        ],
        "registers": [
          [
            "Lab Step",
            "RESET #4/4",
            "Reset releases early. What should the next experiment do?"
          ],
          [
            "Verification Key",
            "Hold Reset Past Lock Delay",
            "A controlled comparison changes one cause."
          ]
        ],
        "lesson": "Retain the failing capture, make the approved sequencing correction and repeat. A single successful boot is not a reliability study."
      }
    ]
  },
  {
    "id": "dram",
    "title": "The report says pass. The log disagrees.",
    "desc": "Learn to separate parser correctness from a DRAM failure.",
    "steps": [
      [
        "The report says no fail directories. A raw run shows two failures. What is defensible?",
        [
          "The DRAM is good.",
          "Treat the summary as untrustworthy and retain the raw failure.",
          "Two DRAM chips are defective.",
          "Rerun until the report says pass."
        ],
        1,
        "The summary is derived evidence.",
        "A disagreement requires investigating the report and the raw run independently. Two failures do not automatically mean two defective chips."
      ],
      [
        "A rerun says “Failure files copied.” What is verified?",
        [
          "The memory fault is fixed.",
          "All CSV classifications are correct.",
          "The reporting message changed; verify copied evidence separately.",
          "A full qualification passed."
        ],
        2,
        "Match the claim to the observation.",
        "The message supports changed failure-handling behavior. Inspect actual files and classifications before declaring reporting closure."
      ],
      [
        "Lowering memory frequency makes a test pass. What does that show?",
        [
          "Signal integrity is conclusively the root cause.",
          "The original failure never mattered.",
          "The silicon is permanently repaired.",
          "The outcome is operating-point-sensitive; isolate timing, power, training and other factors."
        ],
        3,
        "Several physical conditions change with frequency.",
        "Use the result to choose the next controlled experiment. Return to the original condition after the proposed correction."
      ]
    ],
    "stepSpecs": [
      {
        "id": "lab-dram-s0",
        "presetId": null,
        "customChannels": true,
        "title": "The report says pass. The log disagrees. · Step 1: Wrapper Pass vs Raw Fail Evidence",
        "unit": "s",
        "T": 100,
        "t0": 0,
        "sampleRate": "4 GSa/s",
        "memDepth": "10 Mpts",
        "presetName": "Lab_dram_step1.set",
        "kind": "logs",
        "e1": 25.0,
        "e2": 65.0,
        "faultLabel": "Fault Trap (Step 1)",
        "fixedLabel": "Verified Fix (Wrapper Pass vs Raw Fail Evidence)",
        "channels": [
          {
            "name": "WRAPPER_PASS",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "Report claims 'no fail dir needed'"
          },
          {
            "name": "RAW_AP_FAILS",
            "type": "current",
            "unit": "err",
            "min": 0,
            "max": 5,
            "probe": "1169B Diff",
            "coupling": "DC",
            "bw": "12 GHz",
            "desc": "Raw ap.log records 0 pass / 2 failures!"
          },
          {
            "name": "ZQCAL_CODE",
            "type": "bus",
            "unit": "hex",
            "min": 0,
            "max": 511,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "Training hits 0x1ff saturation"
          },
          {
            "name": "EVIDENCE_KEEP",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "Raw logs override misleading summary wrapper"
          }
        ],
        "events": [
          {
            "t": 25.0,
            "label": "Step 1 Event",
            "ch": 0,
            "reason": "The report says no fail directories. A raw run shows two failures. What is defensible?"
          },
          {
            "t": 48.0,
            "label": "Key Evidence Node",
            "ch": 1,
            "reason": "Raw ap.log records 0 pass / 2 failures!"
          },
          {
            "t": 72.0,
            "label": "Verified Resolution",
            "ch": 3,
            "reason": "A disagreement requires investigating the report and the raw run independently. Two failures do not automatically mean t"
          }
        ],
        "registers": [
          [
            "Lab Step",
            "DRAM #1/3",
            "The report says no fail directories. A raw run shows two failures. What is defensible?"
          ],
          [
            "Verification Key",
            "Wrapper Pass vs Raw Fail Evidence",
            "The summary is derived evidence."
          ]
        ],
        "lesson": "A disagreement requires investigating the report and the raw run independently. Two failures do not automatically mean two defective chips."
      },
      {
        "id": "lab-dram-s1",
        "presetId": null,
        "customChannels": true,
        "title": "The report says pass. The log disagrees. · Step 2: Mirrored Fail Log Fix Verified",
        "unit": "s",
        "T": 100,
        "t0": 0,
        "sampleRate": "4 GSa/s",
        "memDepth": "10 Mpts",
        "presetName": "Lab_dram_step2.set",
        "kind": "logs",
        "e1": 25.0,
        "e2": 65.0,
        "faultLabel": "Fault Trap (Step 2)",
        "fixedLabel": "Verified Fix (Mirrored Fail Log Fix Verified)",
        "channels": [
          {
            "name": "FAIL_EVENT",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "Two DRAM training failures injected"
          },
          {
            "name": "MIRROR_COPY",
            "type": "current",
            "unit": "MB",
            "min": 0,
            "max": 25,
            "probe": "1169B Diff",
            "coupling": "DC",
            "bw": "12 GHz",
            "desc": "Fail directory reliably copied on rerun"
          },
          {
            "name": "SILICON_HEALTH",
            "type": "rail",
            "unit": "mV",
            "min": 0,
            "max": 120,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "Electrical eye margin stays unchanged by logging fix!"
          },
          {
            "name": "AUDIT_PASS",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "Reporting fix verified separately from silicon bug"
          }
        ],
        "events": [
          {
            "t": 25.0,
            "label": "Step 2 Event",
            "ch": 0,
            "reason": "A rerun says “Failure files copied.” What is verified?"
          },
          {
            "t": 48.0,
            "label": "Key Evidence Node",
            "ch": 1,
            "reason": "Fail directory reliably copied on rerun"
          },
          {
            "t": 72.0,
            "label": "Verified Resolution",
            "ch": 3,
            "reason": "The message supports changed failure-handling behavior. Inspect actual files and classifications before declaring report"
          }
        ],
        "registers": [
          [
            "Lab Step",
            "DRAM #2/3",
            "A rerun says “Failure files copied.” What is verified?"
          ],
          [
            "Verification Key",
            "Mirrored Fail Log Fix Verified",
            "Match the claim to the observation."
          ]
        ],
        "lesson": "The message supports changed failure-handling behavior. Inspect actual files and classifications before declaring reporting closure."
      },
      {
        "id": "lab-dram-s2",
        "presetId": null,
        "customChannels": true,
        "title": "The report says pass. The log disagrees. · Step 3: Frequency Shmoo Speed-Sensitivity",
        "unit": "ns",
        "T": 80,
        "t0": 0,
        "sampleRate": "10 GSa/s",
        "memDepth": "10 Mpts",
        "presetName": "Lab_dram_step3.set",
        "kind": "shmoo",
        "e1": 20.0,
        "e2": 52.0,
        "faultLabel": "Fault Trap (Step 3)",
        "fixedLabel": "Verified Fix (Frequency Shmoo Speed-Sensitivity)",
        "channels": [
          {
            "name": "MEM_CLK",
            "type": "clock",
            "unit": "MHz",
            "min": 800,
            "max": 3200,
            "probe": "1169B Diff",
            "coupling": "DC 50Ohm",
            "bw": "12 GHz",
            "desc": "Lower F_mem widens T_clk setup window"
          },
          {
            "name": "VDDQ_MEM",
            "type": "rail",
            "unit": "V",
            "min": 0.45,
            "max": 0.65,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "DRAM VDDQ ripple under burst"
          },
          {
            "name": "EYE_WIDTH",
            "type": "rail",
            "unit": "ps",
            "min": 0,
            "max": 300,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "Timing window widens at lower MT/s"
          },
          {
            "name": "TRAINING_OK",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "Lower-speed pass shows speed sensitivity (not root cause yet)"
          }
        ],
        "events": [
          {
            "t": 20.0,
            "label": "Step 3 Event",
            "ch": 0,
            "reason": "Lowering memory frequency makes a test pass. What does that show?"
          },
          {
            "t": 38.4,
            "label": "Key Evidence Node",
            "ch": 1,
            "reason": "DRAM VDDQ ripple under burst"
          },
          {
            "t": 57.6,
            "label": "Verified Resolution",
            "ch": 3,
            "reason": "Use the result to choose the next controlled experiment. Return to the original condition after the proposed correction."
          }
        ],
        "registers": [
          [
            "Lab Step",
            "DRAM #3/3",
            "Lowering memory frequency makes a test pass. What does that show?"
          ],
          [
            "Verification Key",
            "Frequency Shmoo Speed-Sensitivity",
            "Several physical conditions change with frequency."
          ]
        ],
        "lesson": "Use the result to choose the next controlled experiment. Return to the original condition after the proposed correction."
      }
    ]
  },
  {
    "id": "scope",
    "title": "Measure a rail without fooling yourself",
    "desc": "Choose coupling, probing and interpretation.",
    "steps": [
      [
        "You need absolute rail voltage and slow droop. Which is the best starting point?",
        [
          "AC coupling always.",
          "DC coupling with appropriate probe offset and ratings.",
          "A digital logic analyzer.",
          "Only the commanded PMIC voltage."
        ],
        1,
        "AC coupling removes a component you need.",
        "DC coupling retains the absolute level and slow behavior. Offset can make small changes visible without removing the DC information."
      ],
      [
        "You measure a high-side shunt with two ground-referenced scope channels. Where do both grounds go?",
        [
          "One on each shunt terminal.",
          "Either terminal independently.",
          "The same permitted circuit ground; check common-mode and channel ratings.",
          "Disconnect the scope protective earth."
        ],
        2,
        "Subtraction does not isolate the inputs.",
        "Never put common ground clips on opposite high-side terminals. Prefer a suitable differential probe; check common-mode rejection and bandwidth."
      ],
      [
        "A 5 mΩ shunt has 50 mV across it. What is the current?",
        [
          "0.25 A",
          "1 A",
          "10 A",
          "250 A"
        ],
        2,
        "Convert both values to base units, then divide V by R.",
        "0.050 V / 0.005 Ω = 10 A. Account for shunt tolerance, heating, gain and offset."
      ]
    ],
    "stepSpecs": [
      {
        "id": "lab-scope-s0",
        "presetId": "Veagle_1169B_Rsense_16GSa_22Mpts",
        "customChannels": true,
        "title": "Measure a rail without fooling yourself · Step 1: DC Coupling Absolute Rail + Droop",
        "unit": "us",
        "T": 150,
        "t0": 0,
        "sampleRate": "4 GSa/s",
        "memDepth": "10 Mpts",
        "presetName": "Lab_scope_step1.set",
        "kind": "voltage",
        "e1": 37.5,
        "e2": 97.5,
        "faultLabel": "Fault Trap (Step 1)",
        "fixedLabel": "Verified Fix (DC Coupling Absolute Rail + Droop)",
        "channels": [
          {
            "name": "VDD_DC_TRUE",
            "type": "rail",
            "unit": "V",
            "min": 0.5,
            "max": 1.3,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "DC-coupled N7020A catches both 0.85 V DC & droop"
          },
          {
            "name": "VDD_AC_ONLY",
            "type": "rail",
            "unit": "mV",
            "min": -150,
            "max": 150,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "AC coupling hides static 120 mV DC droop!"
          },
          {
            "name": "I_LOAD",
            "type": "current",
            "unit": "A",
            "min": 0,
            "max": 20,
            "probe": "1169B Diff",
            "coupling": "DC",
            "bw": "12 GHz",
            "desc": "Load transient step on rail"
          },
          {
            "name": "ALERT_UVLO",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "UVLO trips when DC level drops below Vmin"
          }
        ],
        "events": [
          {
            "t": 37.5,
            "label": "Step 1 Event",
            "ch": 0,
            "reason": "You need absolute rail voltage and slow droop. Which is the best starting point?"
          },
          {
            "t": 72.0,
            "label": "Key Evidence Node",
            "ch": 1,
            "reason": "AC coupling hides static 120 mV DC droop!"
          },
          {
            "t": 108.0,
            "label": "Verified Resolution",
            "ch": 3,
            "reason": "DC coupling retains the absolute level and slow behavior. Offset can make small changes visible without removing the DC "
          }
        ],
        "registers": [
          [
            "Lab Step",
            "SCOPE #1/3",
            "You need absolute rail voltage and slow droop. Which is the best starting point?"
          ],
          [
            "Verification Key",
            "DC Coupling Absolute Rail + Droop",
            "AC coupling removes a component you need."
          ]
        ],
        "lesson": "DC coupling retains the absolute level and slow behavior. Offset can make small changes visible without removing the DC information."
      },
      {
        "id": "lab-scope-s1",
        "presetId": null,
        "customChannels": true,
        "title": "Measure a rail without fooling yourself · Step 2: High-Side Shunt Ground Short Trap",
        "unit": "us",
        "T": 100,
        "t0": 0,
        "sampleRate": "4 GSa/s",
        "memDepth": "10 Mpts",
        "presetName": "Lab_scope_step2.set",
        "kind": "voltage",
        "e1": 25.0,
        "e2": 65.0,
        "faultLabel": "Fault Trap (Step 2)",
        "fixedLabel": "Verified Fix (High-Side Shunt Ground Short Trap)",
        "channels": [
          {
            "name": "V_BUS_HIGH",
            "type": "rail",
            "unit": "V",
            "min": 11.5,
            "max": 12.5,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "High-side +12 V node"
          },
          {
            "name": "V_SHUNT_LO",
            "type": "rail",
            "unit": "V",
            "min": 11.4,
            "max": 12.4,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "Shunt output still sits +12 V above earth!"
          },
          {
            "name": "GND_SHORT_I",
            "type": "current",
            "unit": "A",
            "min": 0,
            "max": 40,
            "probe": "1169B Diff",
            "coupling": "DC",
            "bw": "12 GHz",
            "desc": "2 passive ground clips short +12 V to earth ground!"
          },
          {
            "name": "DIFF_SAFE",
            "type": "rail",
            "unit": "mV",
            "min": 0,
            "max": 120,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "Isolated 1169B diff probe reads mV safely"
          }
        ],
        "events": [
          {
            "t": 25.0,
            "label": "Step 2 Event",
            "ch": 0,
            "reason": "You measure a high-side shunt with two ground-referenced scope channels. Where do both grounds go?"
          },
          {
            "t": 48.0,
            "label": "Key Evidence Node",
            "ch": 1,
            "reason": "Shunt output still sits +12 V above earth!"
          },
          {
            "t": 72.0,
            "label": "Verified Resolution",
            "ch": 3,
            "reason": "Never put common ground clips on opposite high-side terminals. Prefer a suitable differential probe; check common-mode r"
          }
        ],
        "registers": [
          [
            "Lab Step",
            "SCOPE #2/3",
            "You measure a high-side shunt with two ground-referenced scope channels. Where do both grounds go?"
          ],
          [
            "Verification Key",
            "High-Side Shunt Ground Short Trap",
            "Subtraction does not isolate the inputs."
          ]
        ],
        "lesson": "Never put common ground clips on opposite high-side terminals. Prefer a suitable differential probe; check common-mode rejection and bandwidth."
      },
      {
        "id": "lab-scope-s2",
        "presetId": "Veagle_1169B_Rsense_16GSa_22Mpts",
        "customChannels": true,
        "title": "Measure a rail without fooling yourself · Step 3: Kelvin 5 mOhm Shunt Current Math",
        "unit": "ns",
        "T": 140,
        "t0": 0,
        "sampleRate": "10 GSa/s",
        "memDepth": "10 Mpts",
        "presetName": "Lab_scope_step3.set",
        "kind": "voltage",
        "e1": 35.0,
        "e2": 91.0,
        "faultLabel": "Fault Trap (Step 3)",
        "fixedLabel": "Verified Fix (Kelvin 5 mOhm Shunt Current Math)",
        "channels": [
          {
            "name": "V_RSENSE",
            "type": "rail",
            "unit": "mV",
            "min": 0,
            "max": 100,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "50.0 mV across 5 mOhm Kelvin pads"
          },
          {
            "name": "I_CALC",
            "type": "current",
            "unit": "A",
            "min": 0,
            "max": 20,
            "probe": "1169B Diff",
            "coupling": "DC",
            "bw": "12 GHz",
            "desc": "I = 0.050 V / 0.005 Ohm = 10.0 A!"
          },
          {
            "name": "VDD_DROOP",
            "type": "rail",
            "unit": "V",
            "min": 0.7,
            "max": 1.0,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "Coincident IR+L*dI/dt dip on DUT core"
          },
          {
            "name": "POWER_W",
            "type": "current",
            "unit": "W",
            "min": 0,
            "max": 20,
            "probe": "1169B Diff",
            "coupling": "DC",
            "bw": "12 GHz",
            "desc": "Instantaneous rail power V_load * I"
          }
        ],
        "events": [
          {
            "t": 35.0,
            "label": "Step 3 Event",
            "ch": 0,
            "reason": "A 5 mΩ shunt has 50 mV across it. What is the current?"
          },
          {
            "t": 67.2,
            "label": "Key Evidence Node",
            "ch": 1,
            "reason": "I = 0.050 V / 0.005 Ohm = 10.0 A!"
          },
          {
            "t": 100.8,
            "label": "Verified Resolution",
            "ch": 3,
            "reason": "0.050 V / 0.005 Ω = 10 A. Account for shunt tolerance, heating, gain and offset."
          }
        ],
        "registers": [
          [
            "Lab Step",
            "SCOPE #3/3",
            "A 5 mΩ shunt has 50 mV across it. What is the current?"
          ],
          [
            "Verification Key",
            "Kelvin 5 mOhm Shunt Current Math",
            "Convert both values to base units, then divide V by R."
          ]
        ],
        "lesson": "0.050 V / 0.005 Ω = 10 A. Account for shunt tolerance, heating, gain and offset."
      }
    ]
  },
  {
    "id": "clock",
    "title": "Read clock and timing waveforms",
    "desc": "Period, frequency, active-low reset and sampling.",
    "steps": [
      [
        "A reference clock repeats every 10 ns. Its frequency is…",
        [
          "10 MHz",
          "100 MHz",
          "1 GHz",
          "10 GHz"
        ],
        1,
        "f = 1/T; 10 ns is 10 × 10⁻⁹ s.",
        "1/(10 × 10⁻⁹) = 100 × 10⁶ Hz = 100 MHz."
      ],
      [
        "SYS_RESET# goes from low to high. What happened?",
        [
          "Reset asserted.",
          "The clock stopped.",
          "Active-low reset deasserted.",
          "The rail reached its nominal voltage."
        ],
        2,
        "The # suffix convention indicates active low.",
        "Low is asserted; high is deasserted. SYS_RESET# and PERST# still have different platform requirements."
      ],
      [
        "On a millisecond overview, can you inspect individual 100 MHz edges accurately?",
        [
          "No; use a suitable sample rate and a separate nanosecond-scale detail view.",
          "Yes, if the line is thick.",
          "Yes, all scopes preserve every edge automatically.",
          "Only by changing the trace color."
        ],
        0,
        "One period is 10 ns, much smaller than 1 ms.",
        "Record length, sample rate and bandwidth determine what was captured. Zoom cannot recover samples that were never acquired."
      ],
      [
        "Data changes inside a flip-flop's setup/hold window. What is the right interpretation?",
        [
          "The output must always become zero.",
          "The output must always become one.",
          "There is no risk if the RTL simulation passed.",
          "Capture is not guaranteed; metastability is possible."
        ],
        3,
        "Digital simulation does not establish analog timing margin.",
        "The receiver may capture an unintended value or become metastable. Check timing constraints and the clock-domain crossing design."
      ]
    ],
    "stepSpecs": [
      {
        "id": "lab-clock-s0",
        "presetId": null,
        "customChannels": true,
        "title": "Read clock and timing waveforms · Step 1: Period T=10 ns -> 100 MHz Conversion",
        "unit": "ns",
        "T": 50,
        "t0": 0,
        "sampleRate": "10 GSa/s",
        "memDepth": "10 Mpts",
        "presetName": "Lab_clock_step1.set",
        "kind": "clock",
        "e1": 12.5,
        "e2": 32.5,
        "faultLabel": "Fault Trap (Step 1)",
        "fixedLabel": "Verified Fix (Period T=10 ns -> 100 MHz Conversion)",
        "channels": [
          {
            "name": "REFCLK_10NS",
            "type": "clock",
            "unit": "V",
            "min": 0,
            "max": 1.2,
            "probe": "1169B Diff",
            "coupling": "DC 50Ohm",
            "bw": "12 GHz",
            "desc": "One cycle = 10.0 ns -> f = 1 / 10e-9 = 100 MHz"
          },
          {
            "name": "DUTY_CYCLE",
            "type": "rail",
            "unit": "%",
            "min": 35,
            "max": 65,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "Clean 50% duty cycle (5 ns HIGH / 5 ns LOW)"
          },
          {
            "name": "PHASE_NOISE",
            "type": "rail",
            "unit": "ps",
            "min": -15,
            "max": 15,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "RMS cycle-to-cycle period jitter"
          },
          {
            "name": "EDGE_SYNC",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "Cursor A-to-B delta measures 10.00 ns cleanly"
          }
        ],
        "events": [
          {
            "t": 12.5,
            "label": "Step 1 Event",
            "ch": 0,
            "reason": "A reference clock repeats every 10 ns. Its frequency is…"
          },
          {
            "t": 24.0,
            "label": "Key Evidence Node",
            "ch": 1,
            "reason": "Clean 50% duty cycle (5 ns HIGH / 5 ns LOW)"
          },
          {
            "t": 36.0,
            "label": "Verified Resolution",
            "ch": 3,
            "reason": "1/(10 × 10⁻⁹) = 100 × 10⁶ Hz = 100 MHz."
          }
        ],
        "registers": [
          [
            "Lab Step",
            "CLOCK #1/4",
            "A reference clock repeats every 10 ns. Its frequency is…"
          ],
          [
            "Verification Key",
            "Period T=10 ns -> 100 MHz Conversion",
            "f = 1/T; 10 ns is 10 × 10⁻⁹ s."
          ]
        ],
        "lesson": "1/(10 × 10⁻⁹) = 100 × 10⁶ Hz = 100 MHz."
      },
      {
        "id": "lab-clock-s1",
        "presetId": null,
        "customChannels": true,
        "title": "Read clock and timing waveforms · Step 2: Active-Low SYS_RESET# Rising Edge",
        "unit": "ns",
        "T": 100,
        "t0": 0,
        "sampleRate": "10 GSa/s",
        "memDepth": "10 Mpts",
        "presetName": "Lab_clock_step2.set",
        "kind": "reset",
        "e1": 25.0,
        "e2": 65.0,
        "faultLabel": "Fault Trap (Step 2)",
        "fixedLabel": "Verified Fix (Active-Low SYS_RESET# Rising Edge)",
        "channels": [
          {
            "name": "PWR_VALID",
            "type": "rail",
            "unit": "V",
            "min": 0,
            "max": 1.2,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "Supply stable prior to de-assertion"
          },
          {
            "name": "SYS_RESET_N",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "LOW->HIGH means active-low reset DE-ASSERTED (released)!"
          },
          {
            "name": "BOOTROM_FETCH",
            "type": "bus",
            "unit": "hex",
            "min": 0,
            "max": 15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "CPU immediately begins instruction fetch at t_release"
          },
          {
            "name": "CLK_ACTIVE",
            "type": "clock",
            "unit": "V",
            "min": 0,
            "max": 1.2,
            "probe": "1169B Diff",
            "coupling": "DC 50Ohm",
            "bw": "12 GHz",
            "desc": "Clock must already be locked before # goes HIGH"
          }
        ],
        "events": [
          {
            "t": 25.0,
            "label": "Step 2 Event",
            "ch": 0,
            "reason": "SYS_RESET# goes from low to high. What happened?"
          },
          {
            "t": 48.0,
            "label": "Key Evidence Node",
            "ch": 1,
            "reason": "LOW->HIGH means active-low reset DE-ASSERTED (released)!"
          },
          {
            "t": 72.0,
            "label": "Verified Resolution",
            "ch": 3,
            "reason": "Low is asserted; high is deasserted. SYS_RESET# and PERST# still have different platform requirements."
          }
        ],
        "registers": [
          [
            "Lab Step",
            "CLOCK #2/4",
            "SYS_RESET# goes from low to high. What happened?"
          ],
          [
            "Verification Key",
            "Active-Low SYS_RESET# Rising Edge",
            "The # suffix convention indicates active low."
          ]
        ],
        "lesson": "Low is asserted; high is deasserted. SYS_RESET# and PERST# still have different platform requirements."
      },
      {
        "id": "lab-clock-s2",
        "presetId": null,
        "customChannels": true,
        "title": "Read clock and timing waveforms · Step 3: Aliased ms Window vs ns Clock View",
        "unit": "ns",
        "T": 120,
        "t0": 0,
        "sampleRate": "10 GSa/s",
        "memDepth": "10 Mpts",
        "presetName": "Lab_clock_step3.set",
        "kind": "clock",
        "e1": 30.0,
        "e2": 78.0,
        "faultLabel": "Fault Trap (Step 3)",
        "fixedLabel": "Verified Fix (Aliased ms Window vs ns Clock View)",
        "channels": [
          {
            "name": "FAST_VIEW",
            "type": "clock",
            "unit": "V",
            "min": 0,
            "max": 1.2,
            "probe": "1169B Diff",
            "coupling": "DC 50Ohm",
            "bw": "12 GHz",
            "desc": "High-sample-rate view resolves individual 10 ns pulses"
          },
          {
            "name": "ALIASED_SLOW",
            "type": "rail",
            "unit": "V",
            "min": 0,
            "max": 1.2,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "Course ms timebase aliases 100 MHz into solid smear/ghost"
          },
          {
            "name": "MEM_DEPTH",
            "type": "rail",
            "unit": "Mpts",
            "min": 0,
            "max": 22,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "Deep memory keeps GSa/s rate across wide window"
          },
          {
            "name": "SAMPLE_WARN",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "Nyquist / edge-resolution guard flag"
          }
        ],
        "events": [
          {
            "t": 30.0,
            "label": "Step 3 Event",
            "ch": 0,
            "reason": "On a millisecond overview, can you inspect individual 100 MHz edges accurately?"
          },
          {
            "t": 57.6,
            "label": "Key Evidence Node",
            "ch": 1,
            "reason": "Course ms timebase aliases 100 MHz into solid smear/ghost"
          },
          {
            "t": 86.4,
            "label": "Verified Resolution",
            "ch": 3,
            "reason": "Record length, sample rate and bandwidth determine what was captured. Zoom cannot recover samples that were never acquir"
          }
        ],
        "registers": [
          [
            "Lab Step",
            "CLOCK #3/4",
            "On a millisecond overview, can you inspect individual 100 MHz edges accurately?"
          ],
          [
            "Verification Key",
            "Aliased ms Window vs ns Clock View",
            "One period is 10 ns, much smaller than 1 ms."
          ]
        ],
        "lesson": "Record length, sample rate and bandwidth determine what was captured. Zoom cannot recover samples that were never acquired."
      },
      {
        "id": "lab-clock-s3",
        "presetId": null,
        "customChannels": true,
        "title": "Read clock and timing waveforms · Step 4: Flip-Flop Setup & Hold Violation",
        "unit": "ns",
        "T": 60,
        "t0": 0,
        "sampleRate": "10 GSa/s",
        "memDepth": "10 Mpts",
        "presetName": "Lab_clock_step4.set",
        "kind": "timing",
        "e1": 15.0,
        "e2": 39.0,
        "faultLabel": "Fault Trap (Step 4)",
        "fixedLabel": "Verified Fix (Flip-Flop Setup & Hold Violation)",
        "channels": [
          {
            "name": "CLK_CAPTURE",
            "type": "clock",
            "unit": "V",
            "min": 0,
            "max": 1.2,
            "probe": "1169B Diff",
            "coupling": "DC 50Ohm",
            "bw": "12 GHz",
            "desc": "Capturing DFF rising edge @ aperture center"
          },
          {
            "name": "DATA_SLIDE",
            "type": "rail",
            "unit": "V",
            "min": 0,
            "max": 1.2,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "Transition inside t_su/t_h forbidden window"
          },
          {
            "name": "DFF_Q_META",
            "type": "rail",
            "unit": "V",
            "min": 0,
            "max": 1.2,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "Output hovers mid-rail (metastability) then settles late!"
          },
          {
            "name": "VIOL_FLAG",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "Setup/Hold Timing Check Violation"
          }
        ],
        "events": [
          {
            "t": 15.0,
            "label": "Step 4 Event",
            "ch": 0,
            "reason": "Data changes inside a flip-flop's setup/hold window. What is the right interpretation?"
          },
          {
            "t": 28.8,
            "label": "Key Evidence Node",
            "ch": 1,
            "reason": "Transition inside t_su/t_h forbidden window"
          },
          {
            "t": 43.2,
            "label": "Verified Resolution",
            "ch": 3,
            "reason": "The receiver may capture an unintended value or become metastable. Check timing constraints and the clock-domain crossin"
          }
        ],
        "registers": [
          [
            "Lab Step",
            "CLOCK #4/4",
            "Data changes inside a flip-flop's setup/hold window. What is the right interpretation?"
          ],
          [
            "Verification Key",
            "Flip-Flop Setup & Hold Violation",
            "Digital simulation does not establish analog timing margin."
          ]
        ],
        "lesson": "The receiver may capture an unintended value or become metastable. Check timing constraints and the clock-domain crossing design."
      }
    ]
  },
  {
    "id": "pcie",
    "title": "PCIe works at Gen3 but not Gen4",
    "desc": "Separate a clue from a proven root cause.",
    "steps": [
      [
        "Which comparison distinguishes supported link capability from the negotiated link?",
        [
          "LnkCap versus LnkSta in lspci -vv.",
          "lsusb alone.",
          "Hostname versus username.",
          "The desktop resolution."
        ],
        0,
        "Capability and current state are separate fields.",
        "Read both endpoints where available. Preserve BDF, topology, kernel/AER logs and the actual test outcome."
      ],
      [
        "A lower-speed pass proves…",
        [
          "There can be no firmware issue.",
          "A damaged trace is the only cause.",
          "Speed sensitivity, with cause still to isolate.",
          "A complete hardware fix."
        ],
        2,
        "Equalization, power and protocol conditions can also change.",
        "A speed change is a useful experiment, not a unique diagnosis. Measure repeatability and control other variables."
      ],
      [
        "Which swap best distinguishes a riser fault from a DUT fault?",
        [
          "Change DUT, riser and firmware together.",
          "Compare suspect and reference DUTs across suspect and known-good fixtures with other settings held fixed.",
          "Always buy a new GPU.",
          "Reinstall the OS first."
        ],
        1,
        "Use a comparison matrix.",
        "An A/B cross-comparison shows which component the failure follows, subject to repeatability and interaction effects."
      ],
      [
        "You have 2 failing runs out of 20 attempts. How should you report it?",
        [
          "10% failure rate in these 20 attempts, with conditions and uncertainty.",
          "Guaranteed 10% production failure.",
          "Exactly two defective lanes.",
          "Passed, because most attempts worked."
        ],
        0,
        "Keep the denominator and the tested population.",
        "Report observed counts, conditions and duration. A small lab sample cannot establish a production failure rate by itself."
      ]
    ],
    "stepSpecs": [
      {
        "id": "lab-pcie-s0",
        "presetId": null,
        "customChannels": true,
        "title": "PCIe works at Gen3 but not Gen4 · Step 1: LnkCap Advertised vs LnkSta Negotiated",
        "unit": "ns",
        "T": 100,
        "t0": 0,
        "sampleRate": "10 GSa/s",
        "memDepth": "10 Mpts",
        "presetName": "Lab_pcie_step1.set",
        "kind": "pcie",
        "e1": 25.0,
        "e2": 65.0,
        "faultLabel": "Fault Trap (Step 1)",
        "fixedLabel": "Verified Fix (LnkCap Advertised vs LnkSta Negotiated)",
        "channels": [
          {
            "name": "REFCLK_100",
            "type": "clock",
            "unit": "V",
            "min": -0.4,
            "max": 0.9,
            "probe": "1169B Diff",
            "coupling": "DC 50Ohm",
            "bw": "12 GHz",
            "desc": "100 MHz differential HCSL REFCLK"
          },
          {
            "name": "LNK_GEN4_CAP",
            "type": "rail",
            "unit": "GT/s",
            "min": 0,
            "max": 18,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "LnkCap: Gen4 x16 capable (16 GT/s)"
          },
          {
            "name": "LNK_NEG_STA",
            "type": "rail",
            "unit": "GT/s",
            "min": 0,
            "max": 18,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "LnkSta falls back to Gen3 x8 unless active & trained"
          },
          {
            "name": "ASPM_IDLE",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "Idle ASPM throttles speed down — test under load!"
          }
        ],
        "events": [
          {
            "t": 25.0,
            "label": "Step 1 Event",
            "ch": 0,
            "reason": "Which comparison distinguishes supported link capability from the negotiated link?"
          },
          {
            "t": 48.0,
            "label": "Key Evidence Node",
            "ch": 1,
            "reason": "LnkCap: Gen4 x16 capable (16 GT/s)"
          },
          {
            "t": 72.0,
            "label": "Verified Resolution",
            "ch": 3,
            "reason": "Read both endpoints where available. Preserve BDF, topology, kernel/AER logs and the actual test outcome."
          }
        ],
        "registers": [
          [
            "Lab Step",
            "PCIE #1/4",
            "Which comparison distinguishes supported link capability from the negotiated link?"
          ],
          [
            "Verification Key",
            "LnkCap Advertised vs LnkSta Negotiated",
            "Capability and current state are separate fields."
          ]
        ],
        "lesson": "Read both endpoints where available. Preserve BDF, topology, kernel/AER logs and the actual test outcome."
      },
      {
        "id": "lab-pcie-s1",
        "presetId": null,
        "customChannels": true,
        "title": "PCIe works at Gen3 but not Gen4 · Step 2: Gen3 Pass vs Gen4 Fail Loss Sensitivity",
        "unit": "ns",
        "T": 80,
        "t0": 0,
        "sampleRate": "10 GSa/s",
        "memDepth": "10 Mpts",
        "presetName": "Lab_pcie_step2.set",
        "kind": "pcie",
        "e1": 20.0,
        "e2": 52.0,
        "faultLabel": "Fault Trap (Step 2)",
        "fixedLabel": "Verified Fix (Gen3 Pass vs Gen4 Fail Loss Sensitivity)",
        "channels": [
          {
            "name": "EYE_GEN3",
            "type": "rail",
            "unit": "mV",
            "min": -200,
            "max": 200,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "8 GT/s (4 GHz Nyquist): wide open RX eye"
          },
          {
            "name": "EYE_GEN4",
            "type": "rail",
            "unit": "mV",
            "min": -200,
            "max": 200,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "16 GT/s (8 GHz Nyquist): channel attenuation closes eye"
          },
          {
            "name": "CTLE_GAIN",
            "type": "rail",
            "unit": "dB",
            "min": 0,
            "max": 16,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "RX Equalization fighting PCB/riser loss"
          },
          {
            "name": "BER_FAIL",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "Isolated Gen3 pass shows speed sensitivity"
          }
        ],
        "events": [
          {
            "t": 20.0,
            "label": "Step 2 Event",
            "ch": 0,
            "reason": "A lower-speed pass proves…"
          },
          {
            "t": 38.4,
            "label": "Key Evidence Node",
            "ch": 1,
            "reason": "16 GT/s (8 GHz Nyquist): channel attenuation closes eye"
          },
          {
            "t": 57.6,
            "label": "Verified Resolution",
            "ch": 3,
            "reason": "A speed change is a useful experiment, not a unique diagnosis. Measure repeatability and control other variables."
          }
        ],
        "registers": [
          [
            "Lab Step",
            "PCIE #2/4",
            "A lower-speed pass proves…"
          ],
          [
            "Verification Key",
            "Gen3 Pass vs Gen4 Fail Loss Sensitivity",
            "Equalization, power and protocol conditions can also change."
          ]
        ],
        "lesson": "A speed change is a useful experiment, not a unique diagnosis. Measure repeatability and control other variables."
      },
      {
        "id": "lab-pcie-s2",
        "presetId": null,
        "customChannels": true,
        "title": "PCIe works at Gen3 but not Gen4 · Step 3: 2x2 Riser vs DUT A/B Fault Swap",
        "unit": "ns",
        "T": 100,
        "t0": 0,
        "sampleRate": "10 GSa/s",
        "memDepth": "10 Mpts",
        "presetName": "Lab_pcie_step3.set",
        "kind": "pcie",
        "e1": 25.0,
        "e2": 65.0,
        "faultLabel": "Fault Trap (Step 3)",
        "fixedLabel": "Verified Fix (2x2 Riser vs DUT A/B Fault Swap)",
        "channels": [
          {
            "name": "SLOT_A_GOOD",
            "type": "rail",
            "unit": "GT/s",
            "min": 0,
            "max": 18,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "Suspect DUT moves into known-good Slot B -> still fails!"
          },
          {
            "name": "SLOT_A_TEST",
            "type": "rail",
            "unit": "GT/s",
            "min": 0,
            "max": 18,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "Known-good DUT passes Gen4 x16 inside Suspect Slot A"
          },
          {
            "name": "AER_ERRORS",
            "type": "current",
            "unit": "err",
            "min": 0,
            "max": 30,
            "probe": "1169B Diff",
            "coupling": "DC",
            "bw": "12 GHz",
            "desc": "Replay/BadDLLP follows DUT package pins"
          },
          {
            "name": "OWNER_FLAG",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "A/B swap cleanly assigns root owner (DUT vs Riser)"
          }
        ],
        "events": [
          {
            "t": 25.0,
            "label": "Step 3 Event",
            "ch": 0,
            "reason": "Which swap best distinguishes a riser fault from a DUT fault?"
          },
          {
            "t": 48.0,
            "label": "Key Evidence Node",
            "ch": 1,
            "reason": "Known-good DUT passes Gen4 x16 inside Suspect Slot A"
          },
          {
            "t": 72.0,
            "label": "Verified Resolution",
            "ch": 3,
            "reason": "An A/B cross-comparison shows which component the failure follows, subject to repeatability and interaction effects."
          }
        ],
        "registers": [
          [
            "Lab Step",
            "PCIE #3/4",
            "Which swap best distinguishes a riser fault from a DUT fault?"
          ],
          [
            "Verification Key",
            "2x2 Riser vs DUT A/B Fault Swap",
            "Use a comparison matrix."
          ]
        ],
        "lesson": "An A/B cross-comparison shows which component the failure follows, subject to repeatability and interaction effects."
      },
      {
        "id": "lab-pcie-s3",
        "presetId": null,
        "customChannels": true,
        "title": "PCIe works at Gen3 but not Gen4 · Step 4: 2/20 Intermittent Statistical Reporting",
        "unit": "s",
        "T": 100,
        "t0": 0,
        "sampleRate": "4 GSa/s",
        "memDepth": "10 Mpts",
        "presetName": "Lab_pcie_step4.set",
        "kind": "logs",
        "e1": 25.0,
        "e2": 65.0,
        "faultLabel": "Fault Trap (Step 4)",
        "fixedLabel": "Verified Fix (2/20 Intermittent Statistical Reporting)",
        "channels": [
          {
            "name": "RUN_PASSES",
            "type": "rail",
            "unit": "%",
            "min": 0,
            "max": 100,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "18 Passes + 2 Fails = 90% pass (NOT 'passed once!')"
          },
          {
            "name": "BIN_FAILS",
            "type": "current",
            "unit": "cnt",
            "min": 0,
            "max": 5,
            "probe": "1169B Diff",
            "coupling": "DC",
            "bw": "12 GHz",
            "desc": "Exact fails: #7 and #14 out of 20 attempts"
          },
          {
            "name": "SEED_STATE",
            "type": "bus",
            "unit": "hex",
            "min": 0,
            "max": 15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "Logs exact seed, temp & voltage of fails #7/#14"
          },
          {
            "name": "REPORT_HONEST",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "Reports exact 2/20 rate + env conditions"
          }
        ],
        "events": [
          {
            "t": 25.0,
            "label": "Step 4 Event",
            "ch": 0,
            "reason": "You have 2 failing runs out of 20 attempts. How should you report it?"
          },
          {
            "t": 48.0,
            "label": "Key Evidence Node",
            "ch": 1,
            "reason": "Exact fails: #7 and #14 out of 20 attempts"
          },
          {
            "t": 72.0,
            "label": "Verified Resolution",
            "ch": 3,
            "reason": "Report observed counts, conditions and duration. A small lab sample cannot establish a production failure rate by itself"
          }
        ],
        "registers": [
          [
            "Lab Step",
            "PCIE #4/4",
            "You have 2 failing runs out of 20 attempts. How should you report it?"
          ],
          [
            "Verification Key",
            "2/20 Intermittent Statistical Reporting",
            "Keep the denominator and the tested population."
          ]
        ],
        "lesson": "Report observed counts, conditions and duration. A small lab sample cannot establish a production failure rate by itself."
      }
    ]
  },
  {
    "id": "automation",
    "title": "Make a trustworthy test runner",
    "desc": "Completion, retries, thermal control and evidence.",
    "steps": [
      [
        "The shell exit status is zero. Is the qualification verified?",
        [
          "Always.",
          "Only when a plot exists.",
          "No: verify test completion, expected coverage, and raw pass/fail results.",
          "Only if the script printed a prompt."
        ],
        2,
        "Command delivery, completion and success are different.",
        "A tool can return zero after a failed internal test. Require explicit result parsing and run identity."
      ],
      [
        "A power-toggle command times out. What is the safest retry logic?",
        [
          "Repeat it forever.",
          "Check actual state and reconcile the uncertain outcome before deciding whether to retry.",
          "Mark it passed.",
          "Send two toggles to cancel the first."
        ],
        1,
        "The command may already have executed.",
        "Blind retries of state-changing commands can create a second transition. Use bounded recovery and preserve the first failure."
      ],
      [
        "Does finally guarantee a thermal safe state after host power loss?",
        [
          "Yes.",
          "No; independent equipment protection and verified recovery are needed.",
          "Only in Python.",
          "Yes, with a longer sleep."
        ],
        1,
        "The process may never execute cleanup.",
        "finally helps with handled exits and exceptions. It cannot run after power loss or a forced kill. Use equipment-approved limits and watchdog behavior."
      ],
      [
        "The chamber setpoint is 85°C. What does that establish?",
        [
          "The die is exactly 85°C.",
          "All DRAM packages are 85°C.",
          "The requested chamber target; sensor readings and soak must be checked separately.",
          "The test completed."
        ],
        2,
        "A command is not a physical measurement.",
        "Record sensor identity, timestamps and actual temperature. Setpoint, chamber air, case and on-die temperature are distinct."
      ]
    ],
    "stepSpecs": [
      {
        "id": "lab-automation-s0",
        "presetId": null,
        "customChannels": true,
        "title": "Make a trustworthy test runner · Step 1: Shell rc=0 vs Output Verification",
        "unit": "ms",
        "T": 100,
        "t0": 0,
        "sampleRate": "4 GSa/s",
        "memDepth": "10 Mpts",
        "presetName": "Lab_automation_step1.set",
        "kind": "logs",
        "e1": 25.0,
        "e2": 65.0,
        "faultLabel": "Fault Trap (Step 1)",
        "fixedLabel": "Verified Fix (Shell rc=0 vs Output Verification)",
        "channels": [
          {
            "name": "PROC_EXIT",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "Tool returned rc=0 after catching error internally"
          },
          {
            "name": "LOG_ERRS",
            "type": "current",
            "unit": "err",
            "min": 0,
            "max": 8,
            "probe": "1169B Diff",
            "coupling": "DC",
            "bw": "12 GHz",
            "desc": "Stdout shows 3 hardware training failures!"
          },
          {
            "name": "LOOPS_RAN",
            "type": "rail",
            "unit": "cnt",
            "min": 0,
            "max": 20,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "Zero loops executed on silent arg bug"
          },
          {
            "name": "TRUE_VERDICT",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "Artifact verification rejects fake rc=0 pass"
          }
        ],
        "events": [
          {
            "t": 25.0,
            "label": "Step 1 Event",
            "ch": 0,
            "reason": "The shell exit status is zero. Is the qualification verified?"
          },
          {
            "t": 48.0,
            "label": "Key Evidence Node",
            "ch": 1,
            "reason": "Stdout shows 3 hardware training failures!"
          },
          {
            "t": 72.0,
            "label": "Verified Resolution",
            "ch": 3,
            "reason": "A tool can return zero after a failed internal test. Require explicit result parsing and run identity."
          }
        ],
        "registers": [
          [
            "Lab Step",
            "AUTOMATION #1/4",
            "The shell exit status is zero. Is the qualification verified?"
          ],
          [
            "Verification Key",
            "Shell rc=0 vs Output Verification",
            "Command delivery, completion and success are different."
          ]
        ],
        "lesson": "A tool can return zero after a failed internal test. Require explicit result parsing and run identity."
      },
      {
        "id": "lab-automation-s1",
        "presetId": null,
        "customChannels": true,
        "title": "Make a trustworthy test runner · Step 2: Unsafe Blind Power-Toggle Timeout Retry",
        "unit": "s",
        "T": 60,
        "t0": 0,
        "sampleRate": "4 GSa/s",
        "memDepth": "10 Mpts",
        "presetName": "Lab_automation_step2.set",
        "kind": "rail",
        "e1": 15.0,
        "e2": 39.0,
        "faultLabel": "Fault Trap (Step 2)",
        "fixedLabel": "Verified Fix (Unsafe Blind Power-Toggle Timeout Retry)",
        "channels": [
          {
            "name": "PSU_ENABLE",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "Power-cycle is non-idempotent state mutation"
          },
          {
            "name": "WAIT_ACK",
            "type": "rail",
            "unit": "V",
            "min": 0,
            "max": 3.3,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "Query timed out after PSU actually cycled DUT"
          },
          {
            "name": "REBOOT_COUNT",
            "type": "current",
            "unit": "cnt",
            "min": 0,
            "max": 6,
            "probe": "1169B Diff",
            "coupling": "DC",
            "bw": "12 GHz",
            "desc": "Blind retry re-toggles hardware & masks root freeze"
          },
          {
            "name": "SAFE_POLICY",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "Read state / log status before retrying power cycle"
          }
        ],
        "events": [
          {
            "t": 15.0,
            "label": "Step 2 Event",
            "ch": 0,
            "reason": "A power-toggle command times out. What is the safest retry logic?"
          },
          {
            "t": 28.8,
            "label": "Key Evidence Node",
            "ch": 1,
            "reason": "Query timed out after PSU actually cycled DUT"
          },
          {
            "t": 43.2,
            "label": "Verified Resolution",
            "ch": 3,
            "reason": "Blind retries of state-changing commands can create a second transition. Use bounded recovery and preserve the first fai"
          }
        ],
        "registers": [
          [
            "Lab Step",
            "AUTOMATION #2/4",
            "A power-toggle command times out. What is the safest retry logic?"
          ],
          [
            "Verification Key",
            "Unsafe Blind Power-Toggle Timeout Retry",
            "The command may already have executed."
          ]
        ],
        "lesson": "Blind retries of state-changing commands can create a second transition. Use bounded recovery and preserve the first failure."
      },
      {
        "id": "lab-automation-s2",
        "presetId": null,
        "customChannels": true,
        "title": "Make a trustworthy test runner · Step 3: Host AC Drop Bypasses Python finally",
        "unit": "s",
        "T": 100,
        "t0": 0,
        "sampleRate": "4 GSa/s",
        "memDepth": "10 Mpts",
        "presetName": "Lab_automation_step3.set",
        "kind": "rail",
        "e1": 25.0,
        "e2": 65.0,
        "faultLabel": "Fault Trap (Step 3)",
        "fixedLabel": "Verified Fix (Host AC Drop Bypasses Python finally)",
        "channels": [
          {
            "name": "CHAMBER_SET",
            "type": "rail",
            "unit": "C",
            "min": 20,
            "max": 110,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "Chamber was ramped to 95 C stress"
          },
          {
            "name": "HOST_POWER",
            "type": "rail",
            "unit": "V",
            "min": 0,
            "max": 5,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "Host PC loses AC power -> Python NEVER enters finally!"
          },
          {
            "name": "OVP_HW_GUARD",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "External PSU/chamber watchdog cuts stress automatically"
          },
          {
            "name": "DIE_SAFE",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "Hardware interlock protects uncooled silicon"
          }
        ],
        "events": [
          {
            "t": 25.0,
            "label": "Step 3 Event",
            "ch": 0,
            "reason": "Does finally guarantee a thermal safe state after host power loss?"
          },
          {
            "t": 48.0,
            "label": "Key Evidence Node",
            "ch": 1,
            "reason": "Host PC loses AC power -> Python NEVER enters finally!"
          },
          {
            "t": 72.0,
            "label": "Verified Resolution",
            "ch": 3,
            "reason": "finally helps with handled exits and exceptions. It cannot run after power loss or a forced kill. Use equipment-approved"
          }
        ],
        "registers": [
          [
            "Lab Step",
            "AUTOMATION #3/4",
            "Does finally guarantee a thermal safe state after host power loss?"
          ],
          [
            "Verification Key",
            "Host AC Drop Bypasses Python finally",
            "The process may never execute cleanup."
          ]
        ],
        "lesson": "finally helps with handled exits and exceptions. It cannot run after power loss or a forced kill. Use equipment-approved limits and watchdog behavior."
      },
      {
        "id": "lab-automation-s3",
        "presetId": null,
        "customChannels": true,
        "title": "Make a trustworthy test runner · Step 4: Chamber Setpoint vs Soak Lag",
        "unit": "min",
        "T": 60,
        "t0": 0,
        "sampleRate": "4 GSa/s",
        "memDepth": "10 Mpts",
        "presetName": "Lab_automation_step4.set",
        "kind": "rail",
        "e1": 15.0,
        "e2": 39.0,
        "faultLabel": "Fault Trap (Step 4)",
        "fixedLabel": "Verified Fix (Chamber Setpoint vs Soak Lag)",
        "channels": [
          {
            "name": "AIR_SETPT",
            "type": "rail",
            "unit": "C",
            "min": 20,
            "max": 100,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "Chamber air reaches 85 C within 4 minutes"
          },
          {
            "name": "DIE_RTD",
            "type": "rail",
            "unit": "C",
            "min": 20,
            "max": 100,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "Copper heatsink + SoC lag air by 8-12 minutes!"
          },
          {
            "name": "SOAK_DELTA",
            "type": "rail",
            "unit": "C",
            "min": -10,
            "max": 30,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "Thermal gradient stabilizes only after soak dwell"
          },
          {
            "name": "READY_FLAG",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "Wait for on-die sensor convergence, not air setpoint"
          }
        ],
        "events": [
          {
            "t": 15.0,
            "label": "Step 4 Event",
            "ch": 0,
            "reason": "The chamber setpoint is 85°C. What does that establish?"
          },
          {
            "t": 28.8,
            "label": "Key Evidence Node",
            "ch": 1,
            "reason": "Copper heatsink + SoC lag air by 8-12 minutes!"
          },
          {
            "t": 43.2,
            "label": "Verified Resolution",
            "ch": 3,
            "reason": "Record sensor identity, timestamps and actual temperature. Setpoint, chamber air, case and on-die temperature are distin"
          }
        ],
        "registers": [
          [
            "Lab Step",
            "AUTOMATION #4/4",
            "The chamber setpoint is 85°C. What does that establish?"
          ],
          [
            "Verification Key",
            "Chamber Setpoint vs Soak Lag",
            "A command is not a physical measurement."
          ]
        ],
        "lesson": "Record sensor identity, timestamps and actual temperature. Setpoint, chamber air, case and on-die temperature are distinct."
      }
    ]
  },
  {
    "id": "python",
    "title": "Debug the log parser",
    "desc": "Avoid false passes and explain simple Python clearly.",
    "steps": [
      [
        "A keyword scan matches 'Fail count: 0'. How should it classify the run?",
        [
          "Always FAIL.",
          "Always PASS.",
          "As a candidate line; parse the counter and run completion before classification.",
          "Delete the line."
        ],
        2,
        "A keyword is not the meaning of the whole result.",
        "Separate search from classification. Zero failures alone does not prove complete execution."
      ],
      [
        "A function reads lines but appends every match to a list. Its memory use is…",
        [
          "Always constant.",
          "Proportional to collected matches, plus line buffering.",
          "Always proportional to total disk size.",
          "Zero."
        ],
        1,
        "Look at what the function retains.",
        "Streaming input avoids loading the whole file, but a growing results list still consumes growing memory. Yield or write findings for bounded storage."
      ],
      [
        "Which timestamp should represent a historical failure?",
        [
          "The time the parser ran.",
          "The original event time with its clock basis, retaining ingestion time separately.",
          "The file's copy time.",
          "The current time in any timezone."
        ],
        1,
        "Event time and processing time are different.",
        "Relative boot timestamps need an anchor before comparison with wall-clock thermal logs."
      ],
      [
        "Does file.flush() guarantee survival of a sudden power loss?",
        [
          "Yes.",
          "No; it flushes language buffering, not a complete end-to-end durability guarantee.",
          "Only for CSV.",
          "Yes, if called twice."
        ],
        1,
        "There are buffers beyond the Python file object.",
        "Define a persistence policy, appropriate fsync/checkpoint behavior and recovery tests. Avoid promising zero loss."
      ]
    ],
    "stepSpecs": [
      {
        "id": "lab-python-s0",
        "presetId": null,
        "customChannels": true,
        "title": "Debug the log parser · Step 1: 'Fail count: 0' Naive Substring Bug",
        "unit": "ms",
        "T": 100,
        "t0": 0,
        "sampleRate": "4 GSa/s",
        "memDepth": "10 Mpts",
        "presetName": "Lab_python_step1.set",
        "kind": "logs",
        "e1": 25.0,
        "e2": 65.0,
        "faultLabel": "Fault Trap (Step 1)",
        "fixedLabel": "Verified Fix ('Fail count: 0' Naive Substring Bug)",
        "channels": [
          {
            "name": "PASS_BANNER",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "Log line: 'Summary: Fail count: 0'"
          },
          {
            "name": "NAIVE_MATCH",
            "type": "current",
            "unit": "hits",
            "min": 0,
            "max": 6,
            "probe": "1169B Diff",
            "coupling": "DC",
            "bw": "12 GHz",
            "desc": "Naive `if 'fail' in line` triggers false fail"
          },
          {
            "name": "REGEX_GUARD",
            "type": "current",
            "unit": "hits",
            "min": 0,
            "max": 6,
            "probe": "1169B Diff",
            "coupling": "DC",
            "bw": "12 GHz",
            "desc": "Negative count regex reports 0 true errors"
          },
          {
            "name": "VERDICT",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "Accurately classifies clean run as PASS"
          }
        ],
        "events": [
          {
            "t": 25.0,
            "label": "Step 1 Event",
            "ch": 0,
            "reason": "A keyword scan matches 'Fail count: 0'. How should it classify the run?"
          },
          {
            "t": 48.0,
            "label": "Key Evidence Node",
            "ch": 1,
            "reason": "Naive `if 'fail' in line` triggers false fail"
          },
          {
            "t": 72.0,
            "label": "Verified Resolution",
            "ch": 3,
            "reason": "Separate search from classification. Zero failures alone does not prove complete execution."
          }
        ],
        "registers": [
          [
            "Lab Step",
            "PYTHON #1/4",
            "A keyword scan matches 'Fail count: 0'. How should it classify the run?"
          ],
          [
            "Verification Key",
            "'Fail count: 0' Naive Substring Bug",
            "A keyword is not the meaning of the whole result."
          ]
        ],
        "lesson": "Separate search from classification. Zero failures alone does not prove complete execution."
      },
      {
        "id": "lab-python-s1",
        "presetId": null,
        "customChannels": true,
        "title": "Debug the log parser · Step 2: O(N) Match List Bloat vs Generator",
        "unit": "s",
        "T": 120,
        "t0": 0,
        "sampleRate": "4 GSa/s",
        "memDepth": "10 Mpts",
        "presetName": "Lab_python_step2.set",
        "kind": "logs",
        "e1": 30.0,
        "e2": 78.0,
        "faultLabel": "Fault Trap (Step 2)",
        "fixedLabel": "Verified Fix (O(N) Match List Bloat vs Generator)",
        "channels": [
          {
            "name": "LINES_READ",
            "type": "current",
            "unit": "M",
            "min": 0,
            "max": 50,
            "probe": "1169B Diff",
            "coupling": "DC",
            "bw": "12 GHz",
            "desc": "Multi-million-line stress log fed into analyzer"
          },
          {
            "name": "MEM_APPEND",
            "type": "rail",
            "unit": "GB",
            "min": 0,
            "max": 6,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "Appending all matches accumulates O(N) heap growth"
          },
          {
            "name": "MEM_YIELD",
            "type": "rail",
            "unit": "GB",
            "min": 0,
            "max": 6,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "Streaming generator / Counter stays flat O(1)"
          },
          {
            "name": "GC_STALL",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "Prevents OOM crash on long soak post-processing"
          }
        ],
        "events": [
          {
            "t": 30.0,
            "label": "Step 2 Event",
            "ch": 0,
            "reason": "A function reads lines but appends every match to a list. Its memory use is…"
          },
          {
            "t": 57.6,
            "label": "Key Evidence Node",
            "ch": 1,
            "reason": "Appending all matches accumulates O(N) heap growth"
          },
          {
            "t": 86.4,
            "label": "Verified Resolution",
            "ch": 3,
            "reason": "Streaming input avoids loading the whole file, but a growing results list still consumes growing memory. Yield or write "
          }
        ],
        "registers": [
          [
            "Lab Step",
            "PYTHON #2/4",
            "A function reads lines but appends every match to a list. Its memory use is…"
          ],
          [
            "Verification Key",
            "O(N) Match List Bloat vs Generator",
            "Look at what the function retains."
          ]
        ],
        "lesson": "Streaming input avoids loading the whole file, but a growing results list still consumes growing memory. Yield or write findings for bounded storage."
      },
      {
        "id": "lab-python-s2",
        "presetId": null,
        "customChannels": true,
        "title": "Debug the log parser · Step 3: Historical Event Time vs Parse Time",
        "unit": "s",
        "T": 100,
        "t0": 0,
        "sampleRate": "4 GSa/s",
        "memDepth": "10 Mpts",
        "presetName": "Lab_python_step3.set",
        "kind": "uart",
        "e1": 25.0,
        "e2": 65.0,
        "faultLabel": "Fault Trap (Step 3)",
        "fixedLabel": "Verified Fix (Historical Event Time vs Parse Time)",
        "channels": [
          {
            "name": "EVENT_UTC",
            "type": "rail",
            "unit": "s",
            "min": 0,
            "max": 100,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "Actual failure happened @ 03:14 UTC during -25 C"
          },
          {
            "name": "PARSE_WALL",
            "type": "rail",
            "unit": "s",
            "min": 0,
            "max": 100,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "Script ran 6 hours later at 09:30 UTC (25 C ambient)!"
          },
          {
            "name": "CORREL_ERR",
            "type": "rail",
            "unit": "C",
            "min": -30,
            "max": 60,
            "probe": "N7020A Rail",
            "coupling": "DC 50Ohm",
            "bw": "2 GHz",
            "desc": "Using datetime.now() binds fault to wrong ambient temp!"
          },
          {
            "name": "TS_VALID",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "Always extract embedded line timestamp"
          }
        ],
        "events": [
          {
            "t": 25.0,
            "label": "Step 3 Event",
            "ch": 0,
            "reason": "Which timestamp should represent a historical failure?"
          },
          {
            "t": 48.0,
            "label": "Key Evidence Node",
            "ch": 1,
            "reason": "Script ran 6 hours later at 09:30 UTC (25 C ambient)!"
          },
          {
            "t": 72.0,
            "label": "Verified Resolution",
            "ch": 3,
            "reason": "Relative boot timestamps need an anchor before comparison with wall-clock thermal logs."
          }
        ],
        "registers": [
          [
            "Lab Step",
            "PYTHON #3/4",
            "Which timestamp should represent a historical failure?"
          ],
          [
            "Verification Key",
            "Historical Event Time vs Parse Time",
            "Event time and processing time are different."
          ]
        ],
        "lesson": "Relative boot timestamps need an anchor before comparison with wall-clock thermal logs."
      },
      {
        "id": "lab-python-s3",
        "presetId": null,
        "customChannels": true,
        "title": "Debug the log parser · Step 4: flush() OS Page Cache vs fsync() Power Loss",
        "unit": "ms",
        "T": 100,
        "t0": 0,
        "sampleRate": "4 GSa/s",
        "memDepth": "10 Mpts",
        "presetName": "Lab_python_step4.set",
        "kind": "logs",
        "e1": 25.0,
        "e2": 65.0,
        "faultLabel": "Fault Trap (Step 4)",
        "fixedLabel": "Verified Fix (flush() OS Page Cache vs fsync() Power Loss)",
        "channels": [
          {
            "name": "PY_FLUSH",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "f.flush() pushes bytes to kernel RAM page cache only"
          },
          {
            "name": "OS_FSYNC",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "os.fsync(f.fileno()) commits metadata + blocks to SSD"
          },
          {
            "name": "AC_BLACKOUT",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "Sudden power cut before dirty writeback loses un-synced data"
          },
          {
            "name": "SURVIVED",
            "type": "digital",
            "unit": "logic",
            "min": -0.15,
            "max": 1.15,
            "probe": "Logic Ch",
            "coupling": "DC",
            "bw": "2 GHz",
            "desc": "Explicit flush + os.fsync preserves critical rows"
          }
        ],
        "events": [
          {
            "t": 25.0,
            "label": "Step 4 Event",
            "ch": 0,
            "reason": "Does file.flush() guarantee survival of a sudden power loss?"
          },
          {
            "t": 48.0,
            "label": "Key Evidence Node",
            "ch": 1,
            "reason": "os.fsync(f.fileno()) commits metadata + blocks to SSD"
          },
          {
            "t": 72.0,
            "label": "Verified Resolution",
            "ch": 3,
            "reason": "Define a persistence policy, appropriate fsync/checkpoint behavior and recovery tests. Avoid promising zero loss."
          }
        ],
        "registers": [
          [
            "Lab Step",
            "PYTHON #4/4",
            "Does file.flush() guarantee survival of a sudden power loss?"
          ],
          [
            "Verification Key",
            "flush() OS Page Cache vs fsync() Power Loss",
            "There are buffers beyond the Python file object."
          ]
        ],
        "lesson": "Define a persistence policy, appropriate fsync/checkpoint behavior and recovery tests. Avoid promising zero loss."
      }
    ]
  }
];
