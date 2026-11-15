/* Three-Page Engineering Spiral Notebook Renderer + Card-Unique Deep Dive + Mini-Cards + Kahoot Check (v12) */
(function(){
const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

function getSections(ans){
 const txt = String(ans || '');
 const core = (txt.match(/WHAT I WOULD SAY[^\n]*\n([\s\S]*?)(?=\n\s*\nDEEP TECHNICAL EXPLANATION|$)/i)||[])[1] || txt;
 const deep = (txt.match(/DEEP TECHNICAL EXPLANATION[^\n]*\n([\s\S]*?)(?=\n\s*\nBABY-STEP|$)/i)||[])[1] || '';
 const babyBlock = (txt.match(/BABY-STEP[^\n]*\n([\s\S]*)$/i)||[])[1] || '';
 const steps = babyBlock.split(/\n+/).map(x=>x.replace(/^\d+[\.\)]\s*/,'').trim()).filter(Boolean);
 return { core: core.trim(), deep: deep.trim(), steps };
}

function classify(c){
 const q = ((c.question||'') + ' ' + (c.topic||'')).toLowerCase();
 if(/signal integrity|reflection|gamma|transmission line/.test(q) || c.id === 't.0-0') return 'si';
 return c?.deepDive?.subdomain || 'generic';
}

function formatCodeLines(code){
 return esc(code).split('\n').map(ln => {
  const idxHash = ln.indexOf('#');
  const idxSlash = ln.indexOf('//');
  const cut = (idxSlash >= 0 && (idxHash < 0 || idxSlash < idxHash)) ? idxSlash : idxHash;
  if(cut >= 0){
   return ln.slice(0, cut) + '<span class="cm">' + ln.slice(cut) + '</span>';
  }
  return ln;
 }).join('\n');
}

function renderCustomDiagram(c, page){
 const ds = c.deepDive?.diagramSpec || {};
 const nodes = (ds.nodes && ds.nodes.length >= 4) ? ds.nodes : ['CH1 Input','CH2 DUT Node','CH3 Telemetry','CH4 Verify'];
 const faultNote = ds.faultNote || 'Unmitigated Fault';
 const fixNote = ds.fixNote || 'Verified Fix';
 const title = ds.title || c.question || 'Engineering Signal Flow';
 const cap = ds.caption || 'Follow signal path from source stimulus through DUT node and measurement probe.';
 const badge = page === 0 ? 'SIGNAL PATH' : (page === 1 ? 'TECHNICAL MECHANISM' : 'BENCH VERIFICATION');
 const palette = page === 0
  ? ['#e8f2fd','#1558b0','#fff3ed','#c84b26']
  : (page === 1 ? ['#eef5fc','#164e99','#eefaf4','#0f7a53'] : ['#f3f0fe','#5c2db0','#fef7e6','#a66300']);

 const svg = `<svg viewBox="0 0 640 205" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(title)} diagram">
  <rect width="640" height="205" rx="8" fill="#fbfdff" stroke="#d5e3f2"/>
  <defs><marker id="nbArr-${esc(c.id)}-${page}" markerWidth="8" markerHeight="8" refX="7" refY="3.5" orient="auto"><polygon points="0 0, 8 3.5, 0 7" fill="#1d5fb8"/></marker></defs>
  <rect x="18" y="20" width="132" height="58" rx="9" fill="${palette[0]}" stroke="${palette[1]}" stroke-width="1.8"/>
  <text x="84" y="45" text-anchor="middle" font-size="11" font-weight="800" fill="${palette[1]}">① ${esc(nodes[0].slice(0,15))}</text>
  <text x="84" y="63" text-anchor="middle" font-size="9.5" fill="#355175">Stimulus / Source</text>
  <line x1="152" y1="49" x2="180" y2="49" stroke="#1d5fb8" stroke-width="2" marker-end="url(#nbArr-${esc(c.id)}-${page})"/>

  <rect x="182" y="20" width="136" height="58" rx="9" fill="#ffffff" stroke="#2266bc" stroke-width="2"/>
  <text x="250" y="45" text-anchor="middle" font-size="11" font-weight="800" fill="#113c78">② ${esc(nodes[1].slice(0,15))}</text>
  <text x="250" y="63" text-anchor="middle" font-size="9.5" fill="#355175">DUT Target Node</text>
  <line x1="320" y1="49" x2="348" y2="49" stroke="#1d5fb8" stroke-width="2" marker-end="url(#nbArr-${esc(c.id)}-${page})"/>

  <rect x="350" y="20" width="132" height="58" rx="9" fill="#fff7e8" stroke="#c2740c" stroke-width="1.8"/>
  <text x="416" y="45" text-anchor="middle" font-size="11" font-weight="800" fill="#8f5300">③ ${esc(nodes[2].slice(0,15))}</text>
  <text x="416" y="63" text-anchor="middle" font-size="9.5" fill="#6b4b1a">Probe / Metric</text>
  <line x1="484" y1="49" x2="508" y2="49" stroke="#1d5fb8" stroke-width="2" marker-end="url(#nbArr-${esc(c.id)}-${page})"/>

  <rect x="510" y="20" width="114" height="58" rx="9" fill="#ebf9f2" stroke="#147c54" stroke-width="1.8"/>
  <text x="567" y="45" text-anchor="middle" font-size="11" font-weight="800" fill="#0d6542">④ ${esc(nodes[3].slice(0,14))}</text>
  <text x="567" y="63" text-anchor="middle" font-size="9.5" fill="#1e5c45">Pass / Assert</text>

  <rect x="18" y="98" width="294" height="44" rx="8" fill="#fff2f0" stroke="#dc5c4b" stroke-width="1.5"/>
  <text x="30" y="116" font-size="10.5" font-weight="800" fill="#a82419">FAULT CONDITION (RED TRACE)</text>
  <text x="30" y="133" font-size="10.5" font-weight="600" fill="#5e211b">${esc(faultNote.slice(0,44))}</text>

  <rect x="328" y="98" width="296" height="44" rx="8" fill="#edfaf4" stroke="#229b68" stroke-width="1.5"/>
  <text x="340" y="116" font-size="10.5" font-weight="800" fill="#0d6b45">VERIFIED FIX (GREEN TRACE)</text>
  <text x="340" y="133" font-size="10.5" font-weight="600" fill="#144c34">${esc(fixNote.slice(0,44))}</text>

  <rect x="18" y="154" width="606" height="36" rx="7" fill="${palette[0]}" stroke="${palette[1]}" stroke-dasharray="4 3"/>
  <text x="321" y="176" text-anchor="middle" font-size="11" font-weight="700" fill="#12315b">${esc(cap.slice(0,86))}</text>
 </svg>`;

 return `<div class="nb-diagram">
  <div class="nb-diagram-head"><span>📊 ${esc(title.slice(0,68))}</span><small>${badge}</small></div>
  ${svg}
  <div class="nb-diagram-cap">${esc(cap)}</div>
 </div>`;
}

let currentPage = 0;
let currentSubTab = 'all';

const smart = s => window.studyMathText ? window.studyMathText(s) : esc(s);

function renderMathSection(c, s){
 const dd = c.deepDive || {};
 const eqHtml = (dd.equations || []).map(e => `
  <div class="formula-card">
   <strong>Fundamental Equation / Constraint · ENGR 852 Stacked Formula</strong>
   ${window.studyMathEquationCard ? window.studyMathEquationCard(e.eq, e.note, c) : `<div class="nb-typeset-equation">${window.studyMath ? window.studyMath(e.eq,true) : esc(e.eq)}</div><code class="nb-equation-source">${esc(e.eq)}</code><div class="formula-note">${smart(e.note)}</div>`}
  </div>`).join('');
 const proofHtml = (dd.proofSteps || []).length ? `
  <div class="ink-section">
   <h4>Step-by-Step Mechanism & Verification Proof</h4>
   <ul class="proof-list">${dd.proofSteps.map((st, idx)=>`<li><span>${idx+1}</span><div>${smart(st)}</div></li>`).join('')}</ul>
  </div>` : '';
 return `
  <div class="ink-section">
   <h4>Deep Technical Mechanism</h4>
   <div class="ink-body">${smart(s.deep || s.core)}</div>
  </div>
  ${eqHtml}
  ${proofHtml}
  ${dd.trapAlert ? `<div class="trap-card"><strong>⚠ Common Trap / Misconception Alert</strong>${smart(dd.trapAlert)}</div>` : ''}
  ${dd.goldenRule ? `<div class="rule-card"><strong>✔ Golden Engineering Rule</strong>${smart(dd.goldenRule)}</div>` : ''}
 `;
}

function renderSchemAndTable(c){
 const dd = c.deepDive || {};
 const t = dd.table;
 const tblHtml = t ? `
  <div class="ink-section">
   <h4>${esc(t.title || 'Engineering Reference Matrix')}</h4>
   <div class="nb-table-scroll" tabindex="0" role="region" aria-label="${esc(t.title || 'Verification comparison table')}">
    <table class="nb-table">
     <thead><tr>${t.headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead>
     <tbody>${t.rows.map(row=>`<tr>${row.map(cell=>`<td>${smart(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>
   </div>
  </div>` : '';
 return renderCustomDiagram(c, 1) + tblHtml;
}

function explainCodeLine(line){
 const x=String(line).trim();
 if(!x)return "Blank separator between logical steps.";
 if(x.startsWith("//")||x.startsWith("# ")||x.startsWith("/*"))return "Author's explanatory comment. Connect it to the next line and the problem requirements.";
 if(/^#include/.test(x)||/^import\s|^from\s/.test(x))return "Adds names or APIs from a library; check why the specific header or package is necessary.";
 if(/^def\s|^function\s|^void\s|^int\s+main/.test(x))return "Declares the entry point or function. Preserve the exact signature required by the problem.";
 if(/^for\s|^for\(/.test(x))return "Loop: inspect start, stop and progress to prevent skipping cases or overrunning data.";
 if(/^while\s|^while\(/.test(x))return "Conditional repetition: check the termination condition and update.";
 if(/^if\s|^if\(/.test(x))return "Branch: identify the condition, input cases and the alternative path.";
 if(/^else\b|^elif\b/.test(x))return "Alternative decision path when the preceding condition does not hold.";
 if(/\breturn\b/.test(x))return "Function result: confirm output type/value and edge-case behavior.";
 if(/\bprint\s*\(|\bprintf\s*\(|\$display/.test(x))return "Outputs a result; check formatting and physical units.";
 if(/\bset\s*\(|\bunique/.test(x))return "Typically tracks distinct entries. Validate uniqueness and memory use.";
 if(/\bappend\s*\(|\bpush\s*\(/.test(x))return "Adds one item to a collection; verify the values and growth.";
 if(/\bsort\s*\(|\.sort\s*\(/.test(x))return "Ordering operation; confirm any required ranking and tie-breaking rules.";
 if(/\bassign\b|\balways_comb\b|\balways_ff\b/.test(x))return "Hardware description: follow signal dependence, widths, signedness and event semantics.";
 if(/\bHAL_\w+|\banalogRead\b|\bdigitalWrite\b/.test(x))return "MCU/board API call. Confirm enabled peripheral, pin function, voltage and board initialization.";
 if(/=/.test(x))return "Assignment or update: trace inputs, intermediate values and the stored output.";
 return "Read the statement in context and verify its purpose with a normal and an edge test case.";
}
function renderCodeWalkthrough(code){
 const lines=String(code||"").split("\n").slice(0,80);
 return '<details class="nb-code-reading"><summary>Step-by-step line walkthrough · control flow, libraries and tests</summary><p>Explanations are general reading hints, not proof that this code compiled or matched every hidden coding-test case.</p><div class="nb-table-scroll"><table class="nb-table"><thead><tr><th>Line</th><th>Source statement</th><th>Why it matters</th></tr></thead><tbody>'+
 lines.map((ln,i)=>'<tr><td>'+(i+1)+'</td><td><code>'+esc(ln)+'</code></td><td>'+esc(explainCodeLine(ln))+'</td></tr>').join('')+
 '</tbody></table></div><p>Complexity: determine iteration counts and stored data structures for this exact code; do not assume a universal Big-O. Test empty input, minimum/maximum values, duplicates and ties where relevant.</p></details>';
}
function renderCodeSection(c, includeIde=true){
 const cd = c.deepDive?.code || {};
 const methodHtml = window.renderDetailedCodeMethodology
  ? window.renderDetailedCodeMethodology(c) +
   `<details class="nb-code-guide"><summary>How to read and verify each step</summary><p>Read the requirements, list inputs and outputs, choose the right library, match each pseudocode step to implementation, test typical/boundary/error cases, then state time and space complexity. A displayed example is not proof it was compiled or executed.</p></details>`
  : `
  <div class="pseudo-box cm-pseudo-box">
   <strong>1. Pseudocode (Algorithm & Bench Flow)</strong>
   <pre>${esc(cd.pseudo || '// Verify preconditions -> acquire signal -> assert margins -> cleanup')}</pre>
  </div>
  <div class="code-box cm-code-box">
   <div class="code-box-head"><span>2. Line-by-Line Commented ${esc(cd.lang || 'Implementation')}</span><span>${esc(c.id)}</span></div>
   <pre><code>${formatCodeLines(cd.code || '# No snippet')}</code></pre>
   ${renderCodeWalkthrough(cd.code || '# No snippet')}
   <details class="nb-code-guide"><summary>How to read and verify each step</summary><p>Read the requirements, list inputs and outputs, choose the right library, match each pseudocode step to implementation, test typical/boundary/error cases, then state time and space complexity. A displayed example is not proof it was compiled or executed.</p></details>
  </div>`;
 const ideHtml = (includeIde && window.renderIdeStudio) ? window.renderIdeStudio(c) : '';
 return methodHtml + ideHtml;
}

function renderMiniAndQuiz(c){
 const dd = c.deepDive || {};
 const minis = (dd.miniCards || []).map((m, idx)=>`
  <button type="button" class="mini-card" data-mini-idx="${idx}" aria-pressed="false">
   <span class="mini-card-tag"><span>${esc(m.tag)}</span><span>Card ${idx+1}/3 ↻</span></span>
   <span class="mini-card-body" data-mini-front="${esc(m.front)}" data-mini-back="${esc(m.back)}">${esc(m.front)}</span>
   <span class="mini-card-hint">Click to reveal deep answer →</span>
  </button>`).join('');

 const qz = dd.quiz || {prompt: c.question, hint: '', choices: []};
 const shapes = ['▲','◆','●','■'];
 const kahoot = `
  <div class="kahoot-box" id="nbKahootBox">
   <div class="kahoot-head">
    <strong>▲◆ Quick Knowledge Check — Resolve with Guided Hints if Wrong</strong>
   </div>
   <p class="kahoot-prompt">${esc(qz.prompt)}</p>
   <div class="kahoot-grid">
    ${(qz.choices || []).map((ch, idx)=>`
     <button type="button" class="kahoot-btn" data-shape="${idx}" data-kidx="${idx}">
      <span>${shapes[idx % 4]}</span>
      <span>${esc(ch.text)}</span>
     </button>`).join('')}
   </div>
   <div class="kahoot-fb" id="nbKahootFb" hidden role="status" aria-live="polite"></div>
  </div>`;

 return `
  <div class="ink-section">
   <h4>Interactive Mini-Flashcards (3 Key Concept Drills inside Deep Dive)</h4>
   <div class="mini-deck-grid">${minis}</div>
  </div>
  ${kahoot}
 `;
}

function renderPage(c, page){
 const s = getSections(c.answer);
 const type = classify(c);
 const dd = c.deepDive || {};
 const p = page;
 const titles = ['Page 1 of 3 · Core Idea & Signal Path', 'Page 2 of 3 · Deep Technical Dive & Live Lab', 'Page 3 of 3 · Step-by-Step Verification & Code'];
 let content = '';

 if(p === 0){
  content = window.renderClassicNotebookOverview
    ? window.renderClassicNotebookOverview(c)
    : '<div class="ink-question"><b>Q:</b> '+esc(c.question)+'</div><div class="ink-section"><h4>① What I would say · short answer</h4><div class="ink-body">'+esc(s.core)+'</div></div>'+renderCustomDiagram(c,0);
 }else if(p === 1){
  const tabs = [
   ['all', 'All Sections'],
   ['math', '2A · Math & Mechanism'],
   ['schem', '2B · Schematic & Table'],
   ['code', '2C · Code, Pseudocode & IDE'],
   ['scope', '2D · Scope & Board Lab'],
   ['lab_ide', '2F · Breadboard & Lab Report'],
   ['quiz', '2E · Mini-Cards & Quiz']
  ];
  const subBar = `<div class="dd-subtabs" role="tablist" aria-label="Deep dive exploration sections">` +
   tabs.map(([id, label])=>`<button type="button" role="tab" class="dd-subtab" data-dd-tab="${id}" aria-selected="${currentSubTab===id?'true':'false'}" tabindex="${currentSubTab===id?'0':'-1'}">${esc(label)}</button>`).join('') +
  `</div>`;

  const spiceSection = (type === 'si')
   ? `<div class="ink-section"><h4>Actual ngspice-47 Transmission Line Waveform Lab</h4>${window.renderSpiceScope ? window.renderSpiceScope() : '<p>SPICE waveform data unavailable.</p>'}</div>`
   : '';
  const scopeHtml = spiceSection + (window.renderInstrumentConsole ? `<div class="ix-deepdive">${window.renderInstrumentConsole()}</div>` : '')+
    (window.renderDigitalVcdLab ? window.renderDigitalVcdLab() : '');
  const labHtml = window.renderLabBenchStudio ? window.renderLabBenchStudio() : '';

  const show = key => currentSubTab === 'all' || currentSubTab === key;
  content = subBar +
   `<div class="dd-panel" data-dd-panel="math" ${show('math')?'':'hidden'}>${renderMathSection(c, s)}</div>` +
   `<div class="dd-panel" data-dd-panel="schem" ${show('schem')?'':'hidden'}>${renderSchemAndTable(c)}</div>` +
   `<div class="dd-panel" data-dd-panel="code" ${show('code')?'':'hidden'}>${renderCodeSection(c, true)}</div>` +
   `<div class="dd-panel" data-dd-panel="scope" ${show('scope')?'':'hidden'}>${scopeHtml}</div>` +
   `<div class="dd-panel" data-dd-panel="lab_ide" ${show('lab_ide')?'':'hidden'}>${labHtml}</div>` +
   `<div class="dd-panel" data-dd-panel="quiz" ${show('quiz')?'':'hidden'}>${renderMiniAndQuiz(c)}</div>`;
 }else{
  content = `
   <div class="ink-section"><h4>Baby-Step Debug / Lab Verification Workflow</h4>
    <ol class="nb-steps">${s.steps.map((st,i)=>`<li><b>${i+1}</b><span>${smart(st)}</span></li>`).join('')}</ol>
   </div>
   ${renderCustomDiagram(c, 2)}
   ${renderCodeSection(c, false)}
   ${dd.goldenRule ? `<div class="rule-card"><strong>✔ Verification Checklist Takeaway</strong>${smart(dd.goldenRule)}</div>` : ''}
  `;
 }

 return `<div class="notebook-book">
  <div class="notebook-top"><span class="notebook-kicker">✎ NOTEBOOK ANSWER · 3 VISUAL PAGES</span><span class="notebook-topic">${esc(c.topic || "ENGINEERING")}</span></div>
  <div class="notebook-tabs" role="tablist" aria-label="3-page engineering notebook">
   <button type="button" role="tab" class="notebook-tab ${p===0?'active':''}" aria-selected="${p===0}" data-note-page="0"><b>1</b><span>Overview</span><small>Core & Path</small></button>
   <button type="button" role="tab" class="notebook-tab ${p===1?'active':''}" aria-selected="${p===1}" data-note-page="1"><b>2</b><span>Deep dive</span><small>Scope + Quiz</small></button>
   <button type="button" role="tab" class="notebook-tab ${p===2?'active':''}" aria-selected="${p===2}" data-note-page="2"><b>3</b><span>Lab steps</span><small>Debug & Code</small></button>
  </div>
  <div class="notebook-paper ${p===0?'notebook-classic':''}">
   <div class="nb-page-head"><div class="nb-page-title">${esc(titles[p])}</div><div class="nb-page-num">${esc(c.id)} · ${p+1} / 3</div></div>
   ${content}
   ${p===0 ? '<details class="notebook-original"><summary>Read the complete source-derived text answer</summary><div class="notebook-transcript">'+esc(c.answer)+'</div></details>': ''}
   <div class="nb-footer">
    <button type="button" class="nb-nav-btn" data-note-nav="-1" ${p===0?'disabled':''}>← Previous page</button>
    <span style="font:600 12px system-ui,sans-serif;color:#4f6886">${esc(dd.subTitle || c.topic)}</span>
    <button type="button" class="nb-nav-btn" data-note-nav="1" ${p===2?'disabled':''}>Next page →</button>
   </div>
  </div>
 </div>`;
}

window.renderStudyNotebook = function(c){
 currentPage = 0;
 return renderPage(c, currentPage);
};

window.wireStudyNotebook = function(c){
 const host = document.getElementById('answer');
 if(!host || !c) return;

 const redraw = () => {
  host.innerHTML = renderPage(c, currentPage);
  mountWidgets();
 };

 function switchSubTab(key){
  currentSubTab = key;
  const tabs = [...host.querySelectorAll('[data-dd-tab]')];
  tabs.forEach(t => {
   const active = t.dataset.ddTab === key;
   t.setAttribute('aria-selected', String(active));
   t.tabIndex = active ? 0 : -1;
  });
  host.querySelectorAll('[data-dd-panel]').forEach(p => {
   p.hidden = !(key === 'all' || p.dataset.ddPanel === key);
  });
 }

 const mountWidgets = () => {
  if(window.mountDetailedCodeMethodology)window.mountDetailedCodeMethodology(host);
  if(currentPage === 1){
   if(classify(c) === 'si' && window.mountSpiceScope){
    window.mountSpiceScope(host.querySelector('.si-studio'));
   }
   const vcdHost=host.querySelector('[data-vcd-lab]');
   if(vcdHost&&window.mountDigitalVcdLab)window.mountDigitalVcdLab(vcdHost);
   if(window.mountIdeStudio)window.mountIdeStudio(host, {kind:'card', card:c});
   if(window.mountLabBenchStudio)window.mountLabBenchStudio(host);
   const panel = host.querySelector('[data-instrument]');
   if(panel && window.mountInstrumentConsole){
    window.mountInstrumentConsole(panel, {kind:'card', card:c, caseId:host.querySelector('#siCase')?.value});
    panel.addEventListener('ks-quick-focus', ev => {
     const focus = ev.detail?.focus;
     if(focus === 'math') switchSubTab('math');
     else if(focus === 'schem') switchSubTab('schem');
     else if(focus === 'code') switchSubTab('code');
     else if(focus === 'quiz') switchSubTab('quiz');
    });
   }
  }
 };

 mountWidgets();

 host.onclick = e => {
  const tab = e.target.closest('[data-note-page]');
  if(tab){
   currentPage = Number(tab.dataset.notePage) || 0;
   redraw();
   return;
  }
  const nav = e.target.closest('[data-note-nav]');
  if(nav){
   currentPage = Math.max(0, Math.min(2, currentPage + Number(nav.dataset.noteNav)));
   redraw();
   return;
  }
  const sub = e.target.closest('[data-dd-tab]');
  if(sub){
   switchSubTab(sub.dataset.ddTab);
   return;
  }
  const mini = e.target.closest('[data-mini-idx]');
  if(mini){
   const pressed = mini.getAttribute('aria-pressed') === 'true';
   mini.setAttribute('aria-pressed', String(!pressed));
   const body = mini.querySelector('.mini-card-body');
   const hint = mini.querySelector('.mini-card-hint');
   body.textContent = !pressed ? body.dataset.miniBack : body.dataset.miniFront;
   hint.textContent = !pressed ? '↺ Click to flip back to prompt' : 'Click to reveal deep answer →';
   return;
  }
  const kbtn = e.target.closest('[data-kidx]');
  if(kbtn){
   const idx = Number(kbtn.dataset.kidx);
   const qz = c.deepDive?.quiz;
   const ch = qz?.choices?.[idx];
   if(!ch) return;
   host.querySelectorAll('[data-kidx]').forEach((b, j)=>{
    b.classList.toggle('selected', j === idx);
    b.classList.toggle('muted', j !== idx && !ch.correct);
   });
   const fb = host.querySelector('#nbKahootFb');
   fb.hidden = false;
   fb.className = 'kahoot-fb ' + (ch.correct ? 'ok' : 'no');
   fb.innerHTML = ch.correct
    ? `<strong>✓ Correct!</strong><div style="margin-top:4px">${esc(ch.explain)}</div>`
    : `<strong>✗ Not quite — Guided Hint:</strong><div style="margin-top:4px">${esc(ch.explain)}</div>${qz.hint ? `<div style="margin-top:5px;opacity:.9"><b>Hint:</b> ${esc(qz.hint)}</div>` : ''}`;
  }
 };

 host.onkeydown = e => {
  const sub = document.activeElement?.closest('[data-dd-tab]');
  if(sub && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')){
   e.preventDefault();
   const tabs = [...host.querySelectorAll('[data-dd-tab]')];
   const i = tabs.indexOf(sub);
   const next = tabs[(i + (e.key==='ArrowRight'?1:-1) + tabs.length) % tabs.length];
   next.focus();
   switchSubTab(next.dataset.ddTab);
  }
 };
};
})();
