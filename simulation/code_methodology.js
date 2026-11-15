"use strict";
/* Step-by-Step 5-Part Code & Pseudocode Methodology Renderer (v15)
   1. Problem Statement & Exact Function / Module Signature
   2. Numbered Step-by-Step Pseudocode
   3. Complete Copyable Code with a Meaningful Comment on Every Single Line
   4. "Why I Chose Each Method / Construct" Table & Library Rationale
   5. Worked Step-by-Step Trace Table, Edge Cases & Big-O Complexity */
(function(){
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

const PYTHON_BUILTIN_METHODS=[
 ["input()","Reads test data lines entered into the program from standard input without external I/O packages."],
 [".split()","Separates each input line on whitespace into individual component tokens and status words."],
 ["int()","Converts numeric text strings (such as counts, k lengths, or timestamps) into whole integers."],
 ["{} (dict)","Creates a dictionary mapping each unique component name directly to its failure count (e.g. {\"network\": 3, \"power\": 2})."],
 ["[] (list)","Creates an ordered mutable list to collect selected components before sorting and printing."],
 ["set()","Stores distinct items (such as unique substrings of length k) with automatic duplicate removal and O(1) lookup."],
 ["range()","Iterates cleanly over every valid starting index (0 to len(password) - k + 1) or k-step offset."],
 ["if / else","Branches explicitly on conditions such as PASS vs FAIL or whether a component key already exists in failures."],
 ["in","Checks dictionary key or set membership in O(1) average time before incrementing counts."],
 [".append()","Appends a filtered component entry onto the output list."],
 [".sort()","Sorts a list alphabetically by default — remember: pass a tuple/key comparator when sorting by failure count!"],
 ["len()","Counts total items in a set/list or character length n of an input password string."],
 ["print()","Writes the verified output to stdout cleanly for automated grading."],
 ["Why no pandas / numpy / collections?","Built-ins require zero extra imports, run faster on small-to-medium test inputs, prevent dependency mismatches, and prove core algorithmic mastery in interviews."]
];

const CODING_INTERVIEW_LIBRARY={
 password_strength:{
  id:"password_strength",
  title:"Python Interview · password_strength(password, k)",
  signature:"def password_strength(password, k):",
  problem:"Given a password string of length n and integer k, count all distinct consecutive substrings of length k (example: password = \"aaaaa\", k = 1 -> 1; password = \"P@sswOrd\", k = 4 -> 5; password = \"StrongP@ss\", k = 3 -> 8).",
  pseudocode:[
   "1. Create an empty set (unique_substrings) so duplicates are automatically ignored.",
   "2. Loop outer index i through every valid starting position from 0 to len(password) - k + 1.",
   "3. Initialize substring = \"\" (empty string — never a space \" \"!) for starting position i.",
   "4. Loop inner index j from 0 to k - 1 (do NOT shadow outer variable i) to collect k characters.",
   "5. Add the completed k-character substring to unique_substrings.",
   "6. After the loop completes, return len(unique_substrings) while leaving __main__ unchanged."
  ],
  code:[
   "# Problem: Count the number of unique consecutive substrings of length k.",
   "# Input: A password string and an integer k.",
   "# Output: Total number of distinct consecutive substrings.",
   "",
   "def password_strength(password, k):          # Define the function preserving exact name and parameters.",
   "    unique_substrings = set()                # Step 1: Set automatically rejects duplicate substrings.",
   "    for i in range(len(password) - k + 1):   # Step 2: Visit every valid window start index i.",
   "        substring = \"\"                       # Step 3: Start empty string (avoid \" \" space trap!).",
   "        for j in range(k):                   # Step 4: Use inner index j (never overwrite i) for k chars.",
   "            substring += password[i + j]     # Append character at offset i + j to current window.",
   "        unique_substrings.add(substring)     # Step 5: Store unique k-char substring in set.",
   "    return len(unique_substrings)            # Step 6: Return distinct substring count."
  ].join("\n"),
  bugsFixed:[
   "Line 35 Fix: Changed `for i in range(k):` to `for j in range(k):` so outer start index `i` is not shadowed and `j` is defined.",
   "Line 32 Fix: Changed `substring = \" \"` (single space) to `substring = \"\"` (empty string) so window length stays `k`, not `k + 1`.",
   "Line 43 Fix: Removed leftover stub `pass` statement after `return`."
  ],
  traceHeaders:["Start Index i","Window [i : i+k]","Substring Added","unique_substrings Size"],
  traceRows:[
   ["0","0..3","\"P@ss\"","1"],
   ["1","1..4","\"@ssw\"","2"],
   ["2","2..5","\"sswO\"","3"],
   ["3","3..6","\"swOr\"","4"],
   ["4","4..7","\"wOrd\"","5 -> Return 5"]
  ],
  complexity:"Time: O(n × k) because each of (n - k + 1) starting positions builds a substring of k characters. Space: O(n × k) in the worst case when all substrings are unique."
 },
 failure_counter:{
  id:"failure_counter",
  title:"SLT Validation · Component Failure Counter & Alphabetical/Count Sorter",
  signature:"def rank_failed_components(lines):",
  problem:"Given test log records of `<component> <PASS|FAIL>`, accumulate failure counts per component using a dictionary, then rank or filter failing components without external packages.",
  pseudocode:[
   "1. Read n lines via input() or inspect the input list of log strings.",
   "2. Initialize failures = {} dictionary to pair each component name with its failure count.",
   "3. Split each line using .split() into component and status tokens.",
   "4. If status == \"FAIL\", check `if component in failures:` -> increment count, else set to 1.",
   "5. Append matching failing components to a list [] and sort using count priority + alphabetical tie-break.",
   "6. Return or print() the formatted summary."
  ],
  code:[
   "def rank_failed_components(lines):           # Count failures per subsystem from raw test log lines.",
   "    failures = {}                            # Dictionary maps component string -> integer failure count.",
   "    for line in lines:                       # Visit every log record line once in sequence.",
   "        parts = line.strip().split()         # Separate whitespace-delimited component and PASS/FAIL token.",
   "        if len(parts) < 2:                   # Guard against blank or truncated log lines.",
   "            continue                         # Skip malformed line safely instead of crashing IndexError.",
   "        component, status = parts[0], parts[1]  # Unpack module name and status flag cleanly.",
   "        if status == \"FAIL\":                 # Only tally records where the test step failed.",
   "            if component in failures:        # Check whether component already exists in dictionary.",
   "                failures[component] += 1     # Increment existing failure counter by one.",
   "            else:                            # First observed failure for this component.",
   "                failures[component] = 1      # Initialize dictionary entry count to one.",
   "    ranked = []                              # List collects component names for deterministic ordering.",
   "    for comp in failures:                    # Gather each failing component from the dictionary.",
   "        ranked.append((-failures[comp], comp))  # Store (-count, name) so sort orders high-to-low, then A-Z.",
   "    ranked.sort()                            # Built-in Timsort orders tuples without external libraries.",
   "    return [(comp, -neg) for neg, comp in ranked]  # Restore positive counts and return clean summary."
  ].join("\n"),
  bugsFixed:[
   "Important `.sort()` warning: calling `names.sort()` alone sorts alphabetically, NOT by failure count! Pair `(-failures[comp], comp)` to sort highest failures first.",
   "Membership guard: always check `if component in failures:` before reading `failures[component]` to avoid `KeyError`."
  ],
  traceHeaders:["Log Input Line","Parts","Dictionary `failures` State","Action Taken"],
  traceRows:[
   ["\"network FAIL\"","[\"network\",\"FAIL\"]","{\"network\": 1}","New key initialized to 1"],
   ["\"power FAIL\"","[\"power\",\"FAIL\"]","{\"network\": 1, \"power\": 1}","New key initialized to 1"],
   ["\"network PASS\"","[\"network\",\"PASS\"]","{\"network\": 1, \"power\": 1}","Ignored because status != FAIL"],
   ["\"network FAIL\"","[\"network\",\"FAIL\"]","{\"network\": 2, \"power\": 1}","Key exists -> incremented to 2"]
  ],
  complexity:"Time: O(L + U log U) where L is log lines and U is unique failing components. Space: O(U) to store dictionary and sorted output list."
 }
};

function commentCodeLine(line,lang){
 const raw=String(line||"");
 const trimmed=raw.trim();
 if(!trimmed)return "";
 const l=lang.toLowerCase();
 const isPy=/python/.test(l);
 const cm=isPy?"#":"//";
 if((isPy&&trimmed.includes("#"))||(!isPy&&trimmed.includes("//")))return raw;
 let reason="";
 if(/^module\s+/.test(trimmed))reason="Declare synthesizable hardware module and port interface.";
 else if(/^endmodule/.test(trimmed))reason="End of hardware module boundary.";
 else if(/^always_comb|^always\s*@\s*\(\*\)/.test(trimmed))reason="Combinational evaluation block (updates immediately, zero FFs).";
 else if(/^always_ff|^always\s*@\s*\(posedge/.test(trimmed))reason="Sequential block triggered only on rising clock edge.";
 else if(/^casex|^case/.test(trimmed))reason="Decode bit-pattern cleanly with explicit cases.";
 else if(/^default:/.test(trimmed))reason="Fail-safe default prevents unintended latch synthesis.";
 else if(/^endcase|^end\b/.test(trimmed))reason="Close procedural block scope safely.";
 else if(/^input\s|^output\s|^wire\s|^reg\s|^logic\s/.test(trimmed))reason="Declare explicit bit-width, direction, and signal storage type.";
 else if(/^assign\s/.test(trimmed))reason="Continuous combinational wire assignment.";
 else if(/^def\s+/.test(trimmed))reason="Define function preserving exact signature and parameters.";
 else if(/^class\s+/.test(trimmed))reason="Encapsulate state and reusable methods cleanly.";
 else if(/^import\s|^from\s|^#include/.test(trimmed))reason="Include standard interface header or module.";
 else if(/=\s*\{\}/.test(trimmed))reason="Create dictionary to associate keys directly with state or counts.";
 else if(/=\s*set\(\)/.test(trimmed))reason="Use set for automatic deduplication and O(1) lookup.";
 else if(/=\s*\[\]/.test(trimmed))reason="Initialize ordered list to accumulate verified records.";
 else if(/^for\s|^while\s/.test(trimmed))reason="Iterate deterministically across bounded range/elements.";
 else if(/^if\s|^else|^elif/.test(trimmed))reason="Explicit conditional branch enforcing PASS/FAIL rule.";
 else if(/^return\s/.test(trimmed))reason="Return computed result directly to caller.";
 else if(/HAL_/.test(trimmed))reason="STM32 HAL driver call configuring hardware peripheral registers.";
 else reason="Execute verification step and enforce margin / invariant.";
 return raw+"   "+cm+" "+reason;
}

function buildCardCodePack(c){
 const cd=c.deepDive?.code||{};
 const lang=cd.lang||"Python / Verilog";
 const rawLines=String(cd.code||"// Verify signal timing and assert pass threshold").split(/\r?\n/);
 const fullyCommented=rawLines.map(ln=>commentCodeLine(ln,lang)).join("\n");
 const pseudoRaw=String(cd.pseudo||"").split(/\r?\n|->/).map(x=>x.trim().replace(/^\/\/\s*/,"")).filter(Boolean);
 const pseudoSteps=pseudoRaw.length>=3
  ? pseudoRaw.map((s,i)=>`${i+1}. ${s}`)
  : [
     `1. Inspect initial preconditions and probe/input signature for ${c.id}.`,
     `2. ${pseudoRaw[0]||"Capture input stimulus or read raw telemetry stream."}`,
     `3. Compare observed values against specification limits (${c.deepDive?.equations?.[0]?.eq||"threshold check"}).`,
     `4. Handle error, timeout, or boundary cases explicitly (never silently pass).`,
     `5. ${pseudoRaw[1]||"Return verified PASS/FAIL status with diagnostic evidence."}`
    ];

 const isVer=/verilog|sv|rtl/i.test(lang);
 const isC=/\bc\b|stm32|hal|arduino/i.test(lang);
 const constructRows=isVer?[
  ["logic / wire / reg","Separates combinational nets from edge-triggered registers clearly."],
  ["always_ff / always_comb","Enforces strict synchronous flip-flops vs zero-latch combinational logic."],
  ["casex + default:","Matches don't-care masks while `default:` eliminates unintended latches."],
  ["non-blocking <=","Prevents simulation race conditions inside `@(posedge clk)` sequential blocks."],
  ["assert property / $error","Flags exact cycle and vector mismatches immediately in Synopsys VCS / Verdi."]
 ]:(isC?[
  ["__HAL_RCC_GPIOx_CLK_ENABLE()","Enables peripheral bus clock before touching any GPIO/I2C/UART register."],
  ["HAL_GPIO_Init()","Configures pin mode (Push-Pull Output, EXTI Falling Edge, Pull-Up) atomically."],
  ["EXTI / IRQ Handler","Reacts to button/sensor edge with microseconds latency; keeps ISR short (no blocking print!)."],
  ["uint8_t / uint16_t","Guarantees fixed integer widths for UART binary framing (`0xAA` start + XOR checksum)."],
  ["Ring Buffer + State Machine","Decouples UART RX interrupt byte arrival from deterministic packet parsing."]
 ]:PYTHON_BUILTIN_METHODS);

 const eqHint=c.deepDive?.equations?.[0]?.eq||"Margin >= Spec";
 const eqNote=c.deepDive?.equations?.[0]?.note||"Assert boundary without throwing unhandled exception";
 return {
  id:c.id,
  title:`Card ${c.id} · ${lang} Reference Implementation`,
  signature:cd.code?.match(/(?:def\s+\w+\([^)]*\)|module\s+\w+|void\s+\w+\([^)]*\))/)?.[0]||`${lang} verification handler`,
  problem:c.question,
  pseudocode:pseudoSteps,
  code:fullyCommented,
  constructRows,
  traceHeaders:["Input / Case","Condition","Expected State / Check","Verified Result"],
  traceRows:[
   ["Case 1 · Nominal",eqHint,"Margin satisfied","PASS (within tolerance)"],
   ["Case 2 · Boundary","Marginal / Empty / Timeout",eqNote,"Handled safely (no silent PASS)"],
   ["Case 3 · Fault Inject",c.deepDive?.diagramSpec?.faultNote||"Out-of-spec excursion","Trap / assertion fires","FAIL caught & flagged"]
  ],
  complexity:isVer
   ?"Hardware Cost: Combinational path depth O(1) gate stages; Sequential latency 1–2 clock cycles."
   :(isC?"Time: O(1) per sample/ISR tick (deterministic bound < 50 μs); RAM: O(N) static buffer (zero heap malloc).":"Time: O(N) single pass over input records; Space: O(U) for dictionary/set tracking.")
 };
}

function formatHighlightedCode(code){
 return esc(code).split("\n").map(ln=>{
  const iH=ln.indexOf("#"),iS=ln.indexOf("//");
  const cut=(iS>=0&&(iH<0||iS<iH))?iS:iH;
  if(cut>=0)return ln.slice(0,cut)+'<span class="cm">'+ln.slice(cut)+"</span>";
  return ln;
 }).join("\n");
}

function renderDetailed(card){
 const pack=buildCardCodePack(card);
 const pyPass=CODING_INTERVIEW_LIBRARY.password_strength;
 const pyFail=CODING_INTERVIEW_LIBRARY.failure_counter;

 return `
 <div class="cm-studio" data-cm-root="${esc(card.id)}">
  <div class="cm-sig-box">
   <div class="cm-badge-row"><span>1 · PROBLEM STATEMENT &amp; EXACT SIGNATURE</span><small>${esc(pack.signature)}</small></div>
   <p class="cm-problem-text">${esc(pack.problem)}</p>
   <div class="cm-switch-pills">
    <span class="cm-pill-label">Quick Reference Problem Switcher:</span>
    <button type="button" class="cm-tab-btn active" data-cm-mode="card">Current Card (${esc(card.id)})</button>
    <button type="button" class="cm-tab-btn" data-cm-mode="password_strength">Python: password_strength(password, k)</button>
    <button type="button" class="cm-tab-btn" data-cm-mode="failure_counter">Python: failures = {} Counter &amp; Sorter</button>
   </div>
  </div>

  <div class="cm-view" data-cm-view="card">
   <div class="pseudo-box cm-pseudo-box">
    <strong>2 · Step-by-Step Numbered Pseudocode (${esc(card.id)})</strong>
    <pre>${esc(pack.pseudocode.join("\n"))}</pre>
   </div>
   <div class="code-box cm-code-box">
    <div class="code-box-head"><span>3 · Complete Copyable Solution — Meaningful Comment on Every Line</span><span>${esc(card.id)}</span></div>
    <pre><code>${formatHighlightedCode(pack.code)}</code></pre>
   </div>
   <div class="cm-section-card">
    <strong>4 · Why I Chose Each Method / Construct &amp; Library Rationale</strong>
    <div class="nb-table-scroll"><table class="nb-table cm-methods-table">
     <thead><tr><th>Method / Construct</th><th>Why It Was Chosen for This Problem</th></tr></thead>
     <tbody>${pack.constructRows.map(([m,w])=>`<tr><td><code>${esc(m)}</code></td><td>${esc(w)}</td></tr>`).join("")}</tbody>
    </table></div>
   </div>
   <div class="cm-trace-box">
    <strong>5 · Worked Trace Table, Verification Cases &amp; Complexity</strong>
    <div class="nb-table-scroll"><table class="nb-table">
     <thead><tr>${pack.traceHeaders.map(h=>`<th>${esc(h)}</th>`).join("")}</tr></thead>
     <tbody>${pack.traceRows.map(r=>`<tr>${r.map(x=>`<td>${esc(x)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table></div>
    <div class="cm-complexity">⏱ <b>Time &amp; Space / Hardware Complexity:</b> ${esc(pack.complexity)}</div>
   </div>
  </div>

  <div class="cm-view" data-cm-view="password_strength" hidden>
   <div class="pseudo-box">
    <strong>2 · Numbered Pseudocode — ${esc(pyPass.signature)}</strong>
    <pre>${esc(pyPass.pseudocode.join("\n"))}</pre>
   </div>
   <div class="code-box">
    <div class="code-box-head"><span>3 · Complete Python Code — Every Line Commented</span><span>Keep __main__ unchanged</span></div>
    <pre><code>${formatHighlightedCode(pyPass.code)}</code></pre>
   </div>
   <div class="cm-bug-box">
    <strong>✓ Screenshot Debugging Errors Fixed</strong>
    <ul>${pyPass.bugsFixed.map(b=>`<li>${esc(b)}</li>`).join("")}</ul>
   </div>
   <div class="cm-section-card">
    <strong>4 · Why I Chose Built-in Python Methods Over External Libraries</strong>
    <div class="nb-table-scroll"><table class="nb-table">
     <thead><tr><th>Python Method</th><th>Why I Use It (Instead of pandas/numpy/collections)</th></tr></thead>
     <tbody>${PYTHON_BUILTIN_METHODS.map(([m,w])=>`<tr><td><code>${esc(m)}</code></td><td>${esc(w)}</td></tr>`).join("")}</tbody>
    </table></div>
   </div>
   <div class="cm-trace-box">
    <strong>5 · Worked Trace Example: password = "P@sswOrd", k = 4 -> Output: 5 (and "StrongP@ss", k = 3 -> 8)</strong>
    <div class="nb-table-scroll"><table class="nb-table">
     <thead><tr>${pyPass.traceHeaders.map(h=>`<th>${esc(h)}</th>`).join("")}</tr></thead>
     <tbody>${pyPass.traceRows.map(r=>`<tr>${r.map(x=>`<td>${esc(x)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table></div>
    <div class="cm-complexity">⏱ <b>Complexity:</b> ${esc(pyPass.complexity)}</div>
   </div>
  </div>

  <div class="cm-view" data-cm-view="failure_counter" hidden>
   <div class="pseudo-box">
    <strong>2 · Numbered Pseudocode — SLT Failure Counter &amp; Sorter</strong>
    <pre>${esc(pyFail.pseudocode.join("\n"))}</pre>
   </div>
   <div class="code-box">
    <div class="code-box-head"><span>3 · Complete Python Code — Every Line Commented</span><span>Dictionary + Tuple Sort</span></div>
    <pre><code>${formatHighlightedCode(pyFail.code)}</code></pre>
   </div>
   <div class="cm-bug-box">
    <strong>⚠ Interview Trap Warning (.sort() alone vs failure count)</strong>
    <ul>${pyFail.bugsFixed.map(b=>`<li>${esc(b)}</li>`).join("")}</ul>
   </div>
   <div class="cm-trace-box">
    <strong>5 · Worked Trace &amp; Complexity</strong>
    <div class="nb-table-scroll"><table class="nb-table">
     <thead><tr>${pyFail.traceHeaders.map(h=>`<th>${esc(h)}</th>`).join("")}</tr></thead>
     <tbody>${pyFail.traceRows.map(r=>`<tr>${r.map(x=>`<td>${esc(x)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table></div>
    <div class="cm-complexity">⏱ <b>Complexity:</b> ${esc(pyFail.complexity)}</div>
   </div>
  </div>
 </div>`;
}

function mountDetailed(root){
 if(!root)return;
 root.querySelectorAll("[data-cm-root]").forEach(box=>{
  const btns=box.querySelectorAll("[data-cm-mode]");
  const views=box.querySelectorAll("[data-cm-view]");
  btns.forEach(btn=>{
   btn.onclick=()=>{
    const m=btn.dataset.cmMode;
    btns.forEach(b=>b.classList.toggle("active",b.dataset.cmMode===m));
    views.forEach(v=>{v.hidden=v.dataset.cmView!==m;});
   };
  });
 });
}

window.renderDetailedCodeMethodology=renderDetailed;
window.mountDetailedCodeMethodology=mountDetailed;
window.CODING_INTERVIEW_LIBRARY=CODING_INTERVIEW_LIBRARY;
window.PYTHON_BUILTIN_METHODS=PYTHON_BUILTIN_METHODS;
})();
