"use strict";
/* NVIDIA/ LTTS SLT educational curriculum. All scenarios synthetic and
   independent of confidential Google/Intel/Cisco log contents. */
(function(){
const track=(id,title,goal,skills,source)=>({id,title,goal,skills:skills.map(x=>({name:x[0],meaning:x[1],observe:x[2],risk:x[3]})),source});
const T=[
track("electrical","Electrical Foundations & SoC Board Power","Start from V, I and R before using a DMM or blaming silicon.",[
["Voltage","Electric potential difference between two nodes, in volts (V)","measure from a rail test point to the correct return","wrong ground reference gives a false rail reading"],
["Current","Electric charge flow per second, in amperes (A)","read calibrated shunt differential or supply telemetry","connecting a meter in parallel can short the supply"],
["Resistance","Opposition to electric current, in ohms (Ω)","measure with the DUT powered down","in-circuit paths distort the apparent component value"],
["Series and parallel","Series components share one current path; parallel paths share both endpoints","trace branch nodes before reducing the network","misreading a branch as series changes the calculated current"],
["Power","Electrical power is voltage times current, in watts (W)","correlate current telemetry with rail voltage during load","mixing milliamps with amperes creates a 1000-fold error"],
["Power sequencing","Some SoC rails, power-good and reset signals depend on strict ordering","capture startup signals on a common scope timebase","reset before clock lock can prevent reliable boot"],
["Voltage regulators","Regulators hold a rail near its specified voltage over allowed load","compare regulator output and voltage at the consuming chip","source rail may pass while an interconnect causes load droop"],
["Decoupling","Local capacitors supply transient current near fast-switching loads","inspect near-load ripple and current-step behavior","poor probe ground can imitate voltage ringing"],
["Current limits","A current-limited bench supply restricts current under abnormal load","monitor input voltage and supply current at power-on","current limit could indicate inrush or a short, not automatically a bad SoC"],
["Load-line response","Power distribution has resistance and inductance that create voltage droop","plot rail waveform against synchronized workload/current","unexplained transient can be either physical PDN or probe artifact"]
],"introductory electronics labs; hardware-validation interviews"),
track("socboot","SoC Architecture, BIOS & Bring-up","Understand what must work before firmware and system diagnostics can run.",[
["SoC blocks","A system-on-chip combines processor, memory, accelerators, interconnect and interfaces","identify each block in a public block diagram","a subsystem fault can propagate into whole-system hangs"],
["Boot chain","Power, clocks, reset and boot code form a dependency chain","capture earliest console checkpoint and power-good signals","firmware cannot execute before hardware prerequisites"],
["Firmware compatibility","Firmware must match board, silicon stepping and hardware configuration","record image checksum and board revision","an incompatible image can look like a damaged SoC"],
["Boot ROM","The first on-chip code selects the next boot stage","inspect documented boot strap states and earliest accessible logs","no console output does not prove Boot ROM failure"],
["CPLD/FPGA control","Programmable logic may gate enables, resets and status","compare control pins against approved state table","wrong programmed image may hold a rail disabled"],
["Reset and straps","Reset timing and boot straps determine initial system state","view reset release after stable clocks and rail thresholds","an invalid strap prevents expected boot"],
["Clock distribution","Reference oscillators and PLLs provide timing domains","measure known exported or divided clock and its specified ratio","confusing divided clock with internal clock yields false failure"],
["DRAM initialization","Boot usually initializes DRAM before full software services","capture boot stage and memory initialization result","memory training faults prevent later OS boot"],
["PCIe enumeration","PCIe devices become visible after power, reference clock, reset and training","compare enumeration and LTSSM-related evidence","absent device may result from host/slot rather than endpoint"],
["First failing checkpoint","The earliest reliably observed wrong state is most useful for isolation","synchronize serial, GPIO and rail logs","resetting too early destroys root-cause evidence"]
],"NVIDIA SLT study guide; Intel/Cisco bring-up topics"),
track("dram","DDR, LPDDR, Training & Memory Reliability","Progress from memory basics to constrained PVT failure isolation.",[
["DRAM cell","A DRAM bit is represented by charge stored in a capacitor","identify read/write and retention behavior conceptually","refresh failure can corrupt contents over time"],
["Banks and rows","Memory is organized into banks, rows and columns","map a failing address to a bank/row where tools expose it","address-specific errors can imply localized faults"],
["Refresh","DRAM must restore charge before retention decays","inspect refresh mode and temperature condition","thermal sensitivity can change retention margin"],
["tRCD and tRP","Timing parameters constrain activation and precharge operations","compare controller settings against memory requirements","overly aggressive timing can cause sporadic reads"],
["tRAS and tRC","An active row needs sufficient time before precharge and reuse","calculate row-cycle bounds from approved constraints","a test that violates timing produces false device conclusions"],
["DDR training","Initialization calibrates timing and I/O references","log training phase and compare independent channels","one failed training stage is not proof of a bad DRAM chip"],
["DQS and eye","Data strobes and sampling phase affect bit reliability","inspect per-lane passing window and failure offsets","marginal window can fail with temperature or voltage"],
["ZQ calibration","Impedance-related calibration controls driver or termination settings","check vendor-defined calibrated status and channel differences","a register code alone cannot identify root cause"],
["ECC","Error-correcting codes detect and often correct some bit errors","distinguish corrected, uncorrected and reporting fields","a clean summary can hide raw error reports"],
["Memory shmoo","Sweep voltage, frequency or temperature while controlling other factors","plot pass/fail surface with exact image and silicon revision","mixing firmware revisions invalidates apparent PVT margins"]
],"NVIDIA interview DRAM guide and public semiconductor fundamentals"),
track("pcie","PCIe, SerDes & High-Speed Interfaces","Learn training, signal integrity and Linux evidence without implying compliance-lab experience.",[
["PCIe topology","A root complex connects endpoints through lanes and sometimes switches","inspect bus/device/function location on Linux","wrong BDF causes unrelated diagnostics"],
["Speed and width","PCIe link performance depends on generation and negotiated lane count","compare advertised versus trained capability","a lower width may be lane or slot limitation"],
["LTSSM","The link training state machine moves through detect, polling and configuration","check supported training-state evidence and transitions","no enumeration alone cannot isolate electrical versus software"],
["Reference clock","PCIe endpoints require compatible clock source and reset timing","check board-specific REFCLK and PERST timing","release too early can prevent training"],
["Differential pair","Receivers sample the voltage difference between two conductors","use appropriate differential measurement techniques","ground clips across a pair can distort or damage"],
["Termination","Matching transmission-line impedance limits reflections","verify channel components and expected termination","open or mismatched line causes eye closure"],
["Eye diagram","Timing and voltage margins are jointly represented by a data eye","interpret eye width and height at intended receiver","a clean oscilloscope trace is not necessarily compliance"],
["AER and replay","PCIe error reports can expose physical/protocol link instability","preserve dmesg and PCIe advanced error counters","the error source may be host, riser, cable or endpoint"],
["Throughput versus errors","Successful enumeration does not guarantee sustained data integrity","run agreed controlled traffic and monitor retry/errors","traffic-induced errors may not show in idle"],
["A/B/A isolation","Controlled swaps separate endpoint, host slot, riser and firmware","preserve baseline and modify one component at a time","multiple simultaneous swaps erase causal evidence"]
],"NVIDIA SLT interview PCIe questions; Linux PCI utilities"),
track("gpu","GPU SLT, DCGM, ECC & Failure Diagnostics","Distinguish NVIDIA GPU platform diagnostics, telemetry, workload failures and environment.",[
["GPU enumeration","The OS must identify the device before GPU jobs can run","compare lspci and nvidia-smi presence","PCIe device presence does not prove driver readiness"],
["CUDA context","A GPU compute context needs compatible driver, runtime and permissions","inspect error codes and software versions","driver incompatibility looks like a hardware failure"],
["GPU engines","Compute, copy, memory and display engines stress distinct resources","compare workload-specific symptoms","one engine's failure cannot be assigned to all GPU subsystems"],
["HBM or framebuffer","GPU memory stores active data, weights and intermediate results","check supported memory allocation and integrity tests","a memory test failure requires proper error classification"],
["ECC counters","Correctable and uncorrectable memory errors have different severity","capture current versus accumulated counters","historic corrected error does not equal current faulty unit"],
["Xid events","NVIDIA Xid messages are structured error indicators, not final root cause","record error code and full preceding kernel context","treating a code as a diagnosis misses the preceding event"],
["DCGM health","DCGM exposes telemetry and health status for supported GPUs","check passive signals and readiness before stress","passive healthy status does not prove active compute correctness"],
["DCGM diagnostics","Active diagnostic suites exercise selected compute, memory, PCIe and other paths","choose safe suite and supported device while GPU is idle","diagnostics can disrupt running workloads"],
["Power and throttling","GPU clock and throughput may be constrained by power or thermal policies","correlate temperature, power, clocks and performance","thermal throttling is not automatically bad silicon"],
["GPU production SLT","SLT couples workload failures with hardware, driver, host and environment","save run manifest and compare known-good baseline","a single fail in mixed software and hardware needs isolation"]
],"NVIDIA DCGM and Xid official docs; NVIDIA interview guide"),
track("ate","ATE, DFT, Scan/BIST & Silicon Handoffs","Understand why wafer/package ATE and system testing catch different failures.",[
["ATE role","Automated test equipment screens electrical or structural chip behavior","describe packaged versus system fixtures","ATE PASS never proves a whole board passes"],
["SLT role","System-level test runs devices under realistic firmware and platform conditions","identify workloads, configuration and test limits","failures may depend on integration not structural defects"],
["DFT","Design for test inserts observability/controllability into silicon","identify scan and BIST purpose","poor visibility increases fault-isolation time"],
["Scan chains","Scan testing shifts test states through internal flops","interpret test-pattern and chain-result metadata","scan failure signature needs design-team analysis"],
["MBIST","Built-in memory test targets embedded memories","distinguish BIST error from external DRAM test","mixing on-chip SRAM and off-chip DRAM obscures root cause"],
["JTAG","Boundary scan/debug access can observe or control supported pins","verify chain recognition and connection","incorrect voltage or pinout can block access"],
["Coverage","Detection coverage measures observed versus targeted defect mechanisms","define covered fault population and exclusions","100% pass rate is not 100% fault coverage"],
["Silicon stepping","Different revisions may need different programs and thresholds","record stepping, firmware and test-program identity","A0/B0 program mismatch causes invalid comparisons"],
["Yield and escapes","Yield describes pass fraction; escapes are defective units not caught","preserve first-pass and confirmed defect counts","retest passes can mask systemic issues"],
["Handoff","ATE, DFT, ASIC and SLT teams need consistent fail signatures","attach reproducible logs, trace and controlled test matrix","unsupported causal claim wastes root-cause effort"]
],"LTTS job requirements; NVIDIA SLT study guide and Advantest ATE discussion"),
track("pvt","PVT, Power Integrity & Silicon Characterization","Characterize margins instead of guessing from one operating point.",[
["PVT corners","Process, voltage and temperature affect timing and leakage","record actual board and silicon revision","mixing steppings obscures a process trend"],
["Voltage margin","A sweep estimates pass/fail boundary versus supply voltage","change voltage within approved test limits","sweep outside absolute maximum ratings risks damage"],
["Frequency shmoo","A frequency sweep reveals possible timing limits","record pass/fail versus clock and workload","one passing low frequency is not proof of setup fault"],
["Thermal control","Sensor and chamber temperatures may differ","log both channels and stabilization criteria","premature measurement can create false corner failures"],
["Load droop","Current transients interact with PDN impedance","trigger scope on workload transition","a long ground lead creates false ringing"],
["Ripple and noise","Steady ripple differs from single-event overshoot","compare DC- and AC-coupled captures appropriately","AC coupling can hide absolute rail voltage"],
["Clock jitter","Variation in edge timing can reduce interface margin","use appropriate scope timing measurements","overlimited instrument resolution masks true jitter"],
["Parametric limits","Specs require units, operating states and tolerances","calculate signed margin using approved limit","nominal PASS may become FAIL after uncertainty"],
["Repeatability","Stable test setup is prerequisite to claiming a corner trend","repeat A/B/A at same setpoint","uncontrolled fixture changes mimic silicon variation"],
["Shmoo interpretation","Pass/fail surface can expose interacting voltage/frequency/temperature effects","compare contour shifts on known-good baseline","a correlation alone is not root cause proof"]
],"Google CPU2 power/clock validation topics; SLT study guide"),
track("instruments","Oscilloscope, DMM, DAQ & Signal Evidence","Choose safe measurement tools and interpret actual physical waveforms.",[
["DMM voltage","A multimeter measures DC voltage between its two probes","use approved ground and range","wrong reference gives a negative or false voltage"],
["DMM current","An ammeter must normally be inserted in series within rated limits","prefer approved current-sense method on high current rails","shorting a rail through the meter can cause damage"],
["Scope bandwidth","Bandwidth limits edge fidelity and measured amplitude","compare rise time with instrument bandwidth","slow displayed edge can be instrument artifact"],
["Sample rate","Sampling determines time resolution and aliasing risk","check samples per shortest pulse","a missing pulse may reflect insufficient capture resolution"],
["Trigger","A reproducible trigger aligns captures to the event","select edge and pretrigger depth","missing event cannot be debugged from idle trace"],
["Probes","Attenuation and grounding change measurement accuracy","confirm 10x setting and short ground","misconfigured probe shows wrong amplitude"],
["Current shunts","Kelvin differential voltage across known shunt predicts current","calibrate probe gain and ohms","mV misinterpreted as V yields 1000-fold error"],
["DAQ logging","DAQ channels need units, timebase and acquisition range","align DAQ timestamps with scope and workload","samples from two clocks may be falsely correlated"],
["Waveform math","Use droop, overshoot, RMS and integrated energy as appropriate","compute with correctly deskewed current/voltage","misalignment creates false instantaneous power"],
["Evidence packet","A measurement must preserve instrument and station settings","export waveform plus raw logs and test manifest","a screenshot without scales or DUT ID lacks traceability"]
],"Google CPU2 four-channel Keysight setup; basic electronics labs"),
track("linux","Linux Hardware Debug & System Logs","Start with safe read-only evidence before resetting a failing DUT.",[
["uname and host","Identify kernel and OS configuration before comparing runs","run uname -a and read OS release","different kernel can alter driver behavior"],
["lspci","Lists enumerated PCI devices","record BDF and link details from lspci -vv","missing device may be root port or endpoint"],
["dmesg","Kernel ring buffer records driver, bus and hardware events","save dmesg and check timestamps","reboot can erase transient evidence"],
["journalctl","System journal captures service transitions and faults","select boot or service with timestamps","host-level service failure mimics DUT failure"],
["grep","Search log text with exact patterns and case handling","use grep -RniE with context","zero grep matches differs from grep file error"],
["Exit codes","Shell command exit statuses affect automation decisions","record return code and stderr","script can mistakenly pass on command failure"],
["USB serial","Stable device identifiers help preserve UART capture mapping","inspect /dev/serial/by-id/ and lsusb","ttyUSB index can change after reconnect"],
["Processes","Hung workloads and OOM kills require resource evidence","check ps, free, top and kernel messages","memory exhaustion can mimic silicon crash"],
["Version checks","Images and packages need compatibility and integrity checks","record sha256sum and installed driver versions","wrong firmware can appear electrical"],
["Log preservation","Raw records should remain unaltered and linked to exact test run","archive manifest, output and exit codes","summary-only PASS may conceal failing lines"]
],"NVIDIA Linux interview pages; POSIX/Linux manuals"),
track("python","Python, Shell & Hardware Test Automation","Write beginner Python and make test scripts resistant to false PASS.",[
["Variables and types","Python represents numerical readings and strings with different types","parse numeric telemetry to float only after validation","lexical string comparison gives wrong thresholds"],
["Loops","For loops iterate test inputs or hardware sample records","walk every board or test vector explicitly","off-by-one error skips an edge case"],
["Functions","Functions package reproducible checks and return results","use explicit arguments and return values","hidden global state prevents repeatability"],
["CSV parsing","Logs must associate columns, units and timestamps","use csv.DictReader with schema validation","wrong columns silently mix voltage and current"],
["Exceptions","Instrument reads can timeout, disconnect or parse incorrectly","catch known exceptions and preserve raw failure","broad except returning PASS hides errors"],
["NaN safety","Not-a-number and infinity are valid floats but invalid measurements","check math.isfinite before limits","NaN comparisons can evade fail conditions"],
["Three-state result","PASS/FAIL/INVALID separates DUT defects from bad tests","define clear state transitions and evidence rules","timeout can never be interpreted as PASS"],
["Subprocess","Hardware scripts often invoke shell tools","capture stdout, stderr, timeout and return code","ignored nonzero exit masks an incomplete command"],
["Retry policy","Retests should preserve first failure and not erase history","log every attempt with reason and original status","retry-until-pass inflates yield"],
["Test framework","Instrument setup, test matrix, logs and cleanup require repeatable structure","record identifiers and deterministic resource cleanup","unknown calibration invalidates acceptance"]
],"NVIDIA interview coding sections; Python official docs"),
track("quality","Yield, Characterization, Statistics & Corrective Action","Evaluate coverage and evidence instead of simply increasing PASS counts.",[
["First-pass yield","First-pass yield is units passing without rework or retest","count first attempts for each assembly","combining retests inflates true yield"],
["Retest yield","Retest pass fraction is not the same as manufacturing first-pass yield","preserve attempts and hardware changes","hidden rework corrupts manufacturing insight"],
["Failure rate","Failure counts need exposure denominator","compare errors per known loops/boards/hours","raw count lacks context"],
["Guardbands","Measurement uncertainty changes conservative acceptance","calculate worst-case margin","unqualified nominal pass can be unsafe"],
["Measurement system","Accuracy, repeatability and calibration influence a result","test reference source and instrument date","untrusted station implies INVALID"],
["DOE","Designed experiments change variables systematically","plan power/temp/workload matrix","uncontrolled multiple changes defeat causal inference"],
["Pareto","Rank confirmed recurring defects by frequency or cost","count unique fail signatures","one noisy log can overwhelm a summary"],
["RCA","Root cause needs confirming and falsifying evidence","write hypotheses and discriminating tests","fix after one correlation is premature"],
["Corrective action","A verified fix also needs prevention and regression tests","repeat original test plus negative cases","a local patch without coverage leaves escapes"],
["Cross-team signoff","ASIC, ATE, DFT, validation and quality must agree on evidence","summarize test matrix, confirmed failure, next owner","incomplete handoff delays decisions"]
],"LTTS job JD; original interview Q&A"), 
track("interview","SLT Technical Defense & Cross-Functional Interviews","Explain technical decisions clearly and distinguish experience from learning plans.",[
["Role story","Connect professional work to SoC validation without inventing accomplishments","cite a documented experiment and the measured quantity","a vague claim is hard to defend"],
["ATE versus SLT","ATE structural screens and full system workloads have complementary coverage","show what a board adds to chip test","ATE PASS alone doesn't settle failure disposition"],
["CPU2 profiling","Power and exported clock measurements reveal workload-dependent behavior","explain four synchronized scope channels at high level","never share proprietary register addresses"],
["DRAM investigation","A clean summary can contradict raw memory failures","show raw-versus-report discrepancy checks","a reporting bug does not necessarily fix silicon"],
["Intel board bring-up","Board assembly and programming are staged verification tasks","walk power, clock, reset and BIOS steps","do not claim sole board design responsibility"],
["Cisco failure isolation","Socket, contact and system diagnostics can require controlled swaps","describe A/B/A reference-unit evidence","repeated reseating alone is not a root cause"],
["Unknown tool","Engineers should distinguish direct experience from transferable principles","state training needs for unfamiliar tools","do not claim RF/VNA or unperformed test ownership"],
["Disagreement","Data-driven communication separates competing hypotheses","provide reproducible comparison to design engineer","blame before evidence harms teamwork"],
["Priority conflict","Safety and required acceptance tests outrank schedule pressure","create escalation with uncovered risk","silent waiver of test requirements is unacceptable"],
["Executive summary","A concise conclusion links symptom, evidence, uncertainty and next action","present GO/NO-GO/INVALID with ownership","no action or follow-up leaves the issue unresolved"]
],"NVIDIA panel mock interviews; Muon transferable truthfulness checks")
];
if(T.length!==12||T.some(t=>t.skills.length!==10))throw Error("Expected twelve original SLT tracks with ten concepts each");
window.NVIDIA_SLT_TRACKS=T;
window.NVIDIA_SLT_SOURCE_REFERENCES=[
 {title:"User-supplied LTTS NVIDIA System Level Test Engineer JD",type:"user document",note:"Primary role scope: SoC diag, verification, yield, ATE/DFT, Python/Shell, PCIe, DRAM, cross-team RCA"},
 {title:"User-supplied NVIDIA SLT interview guide",type:"user document",note:"Technical, behavioral and coding prompts reviewed as educational coverage, not copied interview answers"},
 {title:"User-supplied Muon avionics interview guide",type:"user document",note:"Transferable safe bring-up and measurement foundations; not a claim of flight-test experience"},
 {title:"NVIDIA DCGM Diagnostics",type:"public",url:"https://docs.nvidia.com/datacenter/dcgm/latest/user-guide/dcgm-diagnostics.html"},
 {title:"NVIDIA Xid Error Catalog",type:"public",url:"https://docs.nvidia.com/deploy/xid-errors/latest/analyzing-xid-catalog.html"},
 {title:"NVIDIA DCGM Health Monitoring",type:"public",url:"https://docs.nvidia.com/datacenter/dcgm/latest/learn/modules/health-monitoring.html"},
 {title:"Python standard library documentation",type:"public",url:"https://docs.python.org/3/library/"}
];
})();
