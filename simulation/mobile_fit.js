"use strict";
(function(){
 const ns="http://www.w3.org/2000/svg",isPhone=()=>matchMedia("(max-width:700px)").matches;
 function nearest(a,t){let l=0,h=a.length-1;while(l<h){let m=(l+h)>>1;if(a[m][0]<t)l=m+1;else h=m}return l&&Math.abs(a[l-1][0]-t)<Math.abs(a[l][0]-t)?a[l-1]:a[l]}
 function siChVal(r,ch,run){
  if(ch<3)return r[ch+1];
  return window.sltRxCurrentScaled?window.sltRxCurrentScaled(r,run):Math.max(-0.18,Math.min(1.58,(r[3]/Math.max(25,Math.min(250,Number(run&&run.rl)||50)))*35));
 }
 function paths(rows,x,y,col,run){return rows.map((r,i)=>(i?"L":"M")+x(r[0]).toFixed(2)+" "+y(run?siChVal(r,col-1,run):r[col]).toFixed(2)).join(" ")}
 function scope(run,st,root){
  const area=root.querySelector("#siMobilePlot");if(!area||!isPhone())return;
  const min=st.start,max=st.end,W=360,H=340,L=45,R=345,TOP=31,BOT=273;
  const relevant=run.trace.filter(r=>r[0]>=min-.03&&r[0]<=max+.03);
  const yvals=relevant.flatMap(r=>[r[1],r[2],r[3],siChVal(r,3,run)]);const ymax=Math.max(1.1,...yvals)+.12,ymin=Math.min(0,...yvals)-.12;
  const X=t=>L+(t-min)/(max-min)*(R-L),Y=v=>BOT-(v-ymin)/(ymax-ymin)*(BOT-TOP);
  const color=["#6a99ff","#39d4ad","#ff7393","#f4be6b"],labels=["SRC","TX","RX","I(rx)"];
  const spState=root.__scopeProState;
  const tA=(spState&&typeof spState.a==="number")?spState.a:st.time;
  const tB=(spState&&typeof spState.b==="number")?spState.b:((tA+3.7<=14.8)?tA+3.7:Math.max(0.2,tA-3.7));
  let svg='<svg viewBox="0 0 360 340" role="img" aria-label="Fit-to-screen ngspice 4-channel voltage and current waveforms"><rect width="360" height="340" rx="12" fill="#101d33"/>';
  for(let j=0;j<=4;j++){let v=ymin+j*(ymax-ymin)/4,q=Y(v);
   svg+='<path d="M45 '+q+' H345" stroke="#33465f" stroke-dasharray="3 5"/><text x="39" y="'+(q+4)+'" fill="#d7e4f2" text-anchor="end" font-size="11">'+v.toFixed(2)+'</text>'}
  for(let j=0;j<=4;j++){let t=min+j*(max-min)/4,p=X(t);
    svg+='<path d="M'+p+' 30 V277" stroke="#203650"/><text x="'+p+'" y="295" fill="#dde9f5" font-size="11" text-anchor="middle">'+t.toFixed(1)+'</text>'}
  for(let i=0;i<4;i++)if(st.channels[i]!==false)svg+='<path d="'+paths(relevant,X,Y,i+1,run)+'" fill="none" stroke="'+color[i]+'" stroke-width="'+(i===2?2.7:(i===3?1.9:2))+'"'+(i===3?' stroke-dasharray="5 3"':'')+'/>';
  const aIn=tA>=min&&tA<=max,bIn=tB>=min&&tB<=max;
  const rowA=nearest(run.trace,tA),rowB=nearest(run.trace,tB);
  if(aIn&&bIn){
   for(let j=0;j<4;j++)if(st.channels[j]!==false){
    svg+='<line class="ks-corr-line" x1="'+X(tA).toFixed(1)+'" y1="'+Y(siChVal(rowA,j,run)).toFixed(1)+'" x2="'+X(tB).toFixed(1)+'" y2="'+Y(siChVal(rowB,j,run)).toFixed(1)+'" stroke="'+color[j]+'" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.88"/>';
   }
  }
  if(aIn){
   let x=X(tA);
   svg+='<path d="M'+x+' 30 V277" stroke="#f6c86f" stroke-width="1.6" stroke-dasharray="5 4"/>';
   for(let j=0;j<4;j++)if(st.channels[j]!==false)svg+='<circle class="ks-dot-a" cx="'+x+'" cy="'+Y(siChVal(rowA,j,run))+'" r="3.6" fill="'+color[j]+'" stroke="#fff"/>';
  }
  if(bIn){
   let xb=X(tB);
   svg+='<path d="M'+xb+' 30 V277" stroke="#5fe2c4" stroke-width="1.6" stroke-dasharray="5 4"/>';
   for(let j=0;j<4;j++)if(st.channels[j]!==false)svg+='<circle class="ks-marker-b-dot ks-dot-b" cx="'+xb+'" cy="'+Y(siChVal(rowB,j,run))+'" r="3.8" fill="'+color[j]+'" stroke="#0b172d" stroke-width="1.3"/>';
  }
  for(let i=0;i<4;i++){svg+='<rect x="'+(14+i*85)+'" y="313" width="8" height="8" rx="2" fill="'+color[i]+'"/><text x="'+(26+i*85)+'" y="322" fill="#eaf3fc" font-size="11">'+labels[i]+'</text>'}
  area.innerHTML=svg+'</svg>';
 }
 function boardCircuit(r,a,root){
  let target=root.querySelector("#blMobileCircuit");if(!target||!isPhone())return;
  let amp=Math.abs(a[6]),gate=a[5],active=r.nmos&&gate>1.1;
  const n=v=>Number(v).toFixed(2),warn=active?"#f3cb77":"#789dbc";
  target.innerHTML='<svg viewBox="0 0 360 330" role="img" aria-label="Phone fit board connection overview with branching load capacitor and MOSFET">'+
  '<rect width="360" height="330" rx="13" fill="#133d3a"/>'+
  '<text x="15" y="24" font-size="14" font-weight="800" fill="#e7fff2">PCB CIRCUIT · ALL NODES CONNECTED</text>'+
  '<path d="M22 100 H73 M119 100 H154 M206 100 H242" fill="none" stroke="#f3cb79" stroke-width="5"/>'+
  '<circle cx="22" cy="100" r="9" fill="#9ad0ff"/><text x="18" y="74" fill="#fff" font-size="12">SRC '+n(a[1])+'V</text>'+
  '<rect x="73" y="87" width="46" height="26" rx="4" fill="#f4cca1"/><text x="96" y="126" text-anchor="middle" font-size="11" fill="#fff">R20</text>'+
  '<rect x="154" y="87" width="52" height="26" rx="4" fill="#f3a787"/><text x="180" y="126" text-anchor="middle" font-size="11" fill="#fff">R'+r.series_r+'</text>'+
  '<path d="M242 100 Q251 74 260 100 Q270 74 278 100 Q290 74 300 100" stroke="#f5d07a" stroke-width="5" fill="none"/>'+
  '<path d="M300 100 H338" stroke="#f3cb79" stroke-width="5"/><text x="277" y="70" fill="#fff" font-size="11">L '+r.inductor_nh+'nH</text>'+
  '<circle cx="338" cy="100" r="8" fill="#f58fa4"/><text x="337" y="45" fill="#fff" text-anchor="end" font-size="13">RX '+n(a[4])+' V</text>'+
  '<path d="M338 100 V146 H288 M338 146 H184 M338 146 H70" fill="none" stroke="#f3cb79" stroke-width="4"/>'+
  '<path d="M70 146 V193 M70 217 V263 M184 146 V182 M184 212 V263 M288 146 V187 M288 233 V263" stroke="#f3cb79" stroke-width="4" fill="none"/>'+
  '<rect x="55" y="193" width="30" height="24" fill="#eecba1"/><text x="70" y="238" fill="#fff" text-anchor="middle" font-size="11">200Ω</text>'+
  '<path d="M163 182 H205 M163 212 H205" stroke="#fff" stroke-width="5"/>'+
  '<text x="184" y="238" fill="#fff" text-anchor="middle" font-size="11">C '+r.cap_pf+'pF</text>'+
  '<rect x="273" y="187" width="30" height="46" rx="5" fill="'+(r.nmos?(active?"#d89c65":"#789cac"):"#355f61")+'" stroke="'+warn+'" stroke-width="2"/>'+
  '<text x="288" y="253" text-anchor="middle" fill="#fff" font-size="11">'+(r.nmos?(active?"NMOS ON":"NMOS OFF"):"NOT FITTED")+'</text>'+
  '<path d="M34 263 H337" stroke="#d6b874" stroke-width="7"/>'+
  '<text x="177" y="288" text-anchor="middle" font-size="12" fill="#ecfff3">Common GND / return</text>'+
  '<text x="177" y="314" text-anchor="middle" font-size="12" fill="#dbf6f4">Itrace '+n(amp)+' mA · gate '+n(gate)+' V</text></svg>';
 }
 function boardWave(r,time,root){
  const target=root.querySelector("#blWaveMobile");if(!target||!isPhone())return;
  const rows=r.samples,x=t=>48+t/16*290,max=Math.max(1.8,r.supply*1.2),y=v=>265-v/max*215;
  const tB=(time+3.2<=15.6)?(time+3.2):Math.max(0.2,time-3.2);
  const nA=nearest(rows,time),nB=nearest(rows,tB);
  let svg='<svg viewBox="0 0 360 360" role="img" aria-label="Phone fit board waveform with source, transmitter, receiver and gate"><rect width="360" height="360" rx="12" fill="#0e1930"/>';
  for(let j=0;j<=4;j++){let v=max*j/4,Y=y(v);svg+='<path d="M48 '+Y+' H338" stroke="#31435d" stroke-dasharray="3 4"/><text x="40" y="'+(Y+4)+'" fill="#dce8f6" text-anchor="end" font-size="10">'+v.toFixed(1)+'</text>'}
  for(let i=0;i<=4;i++){let t=i*4;svg+='<path d="M'+x(t)+' 35 V270" stroke="#263754"/><text x="'+x(t)+'" y="291" text-anchor="middle" fill="#e6f0ff" font-size="12">'+t+'</text>'}
  const chDefs=[[1,"#74b4ff"],[2,"#f5cc64"],[4,"#f47599"],[5,"#5fe2c4"]];
  chDefs.forEach(([col,c])=>{svg+='<path d="'+paths(rows,x,y,col)+'" fill="none" stroke="'+c+'" stroke-width="'+(col===5?1.8:2.8)+'"'+(col===5?' stroke-dasharray="4 3"':'')+'/>'});
  chDefs.forEach(([col,c])=>{
   svg+='<line class="ks-corr-line" x1="'+x(time).toFixed(1)+'" y1="'+y(nA[col]).toFixed(1)+'" x2="'+x(tB).toFixed(1)+'" y2="'+y(nB[col]).toFixed(1)+'" stroke="'+c+'" stroke-width="1.4" stroke-dasharray="4 3"/>';
   svg+='<circle class="ks-dot-a" cx="'+x(time).toFixed(1)+'" cy="'+y(nA[col]).toFixed(1)+'" r="3.4" fill="'+c+'" stroke="#fff"/>';
   svg+='<circle class="ks-marker-b-dot ks-dot-b" cx="'+x(tB).toFixed(1)+'" cy="'+y(nB[col]).toFixed(1)+'" r="3.6" fill="'+c+'" stroke="#0e1930" stroke-width="1.2"/>';
  });
  let line=x(time),lineB=x(tB);svg+='<path d="M'+line+' 29 V271" stroke="#fff2b9" stroke-dasharray="6 4"/><path d="M'+lineB+' 29 V271" stroke="#5fe2c4" stroke-dasharray="5 4"/>';
  svg+='<text x="49" y="19" font-size="12" fill="#fff">Board nodes + Gate (V)</text>'+
  '<text x="12" y="324" fill="#74b4ff" font-size="11">● Source</text><text x="98" y="324" fill="#f5cc64" font-size="11">● TX</text><text x="166" y="324" fill="#f47599" font-size="11">● RX</text><text x="236" y="324" fill="#5fe2c4" font-size="11">● Gate(B)</text>'+
  '<text x="180" y="347" text-anchor="middle" fill="#dce8f6" font-size="11">A '+time.toFixed(2)+' ns ↔ B '+tB.toFixed(2)+' ns (gate '+nA[5].toFixed(2)+' V)</text>';
  target.innerHTML=svg+'</svg>';
 }
 window.sltMobileScope=scope;window.sltMobileBoard=function(run,z,root,t){boardCircuit(run,z,root);boardWave(run,t,root)};
})();
