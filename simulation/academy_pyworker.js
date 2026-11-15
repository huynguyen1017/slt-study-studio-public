"use strict";
/* Opt-in online Python via Pyodide in an isolated Web Worker. No DOM access.
 * Times out from parent; not offered as offline Python. */
let interpreter=null;
const url="https://cdn.jsdelivr.net/pyodide/v0.27.7/full/";
self.onmessage=async event=>{
 const job=event.data||{};
 if(job.cmd!=="run"||typeof job.code!=="string"){self.postMessage({kind:"error",message:"Invalid Python job"});return}
 if(job.code.length>160000){self.postMessage({kind:"error",message:"Python source too long"});return}
 try{
  self.postMessage({kind:"status",message:"Loading Python 3 WebAssembly runtime (internet required)..."});
  if(!interpreter){
   importScripts(url+"pyodide.js");
   interpreter=await loadPyodide({indexURL:url});
  }
  interpreter.globals.set("__studio_code",job.code);
  const run=[
   "import io, sys, traceback",
   "_out, _err = io.StringIO(), io.StringIO()",
   "_saved_out, _saved_err = sys.stdout, sys.stderr",
   "sys.stdout, sys.stderr = _out, _err",
   "try:",
   "    exec(compile(__studio_code, '<study-studio>', 'exec'), {'__name__':'__main__'})",
   "except Exception:",
   "    traceback.print_exc()",
   "finally:",
   "    sys.stdout, sys.stderr = _saved_out, _saved_err",
   "(_out.getvalue(), _err.getvalue())"
  ].join("\n");
  const result=await interpreter.runPythonAsync(run);
  const arr=result.toJs?result.toJs():result;
  if(result.destroy)result.destroy();
  self.postMessage({kind:"done",stdout:String(arr[0]||""),stderr:String(arr[1]||"")});
 }catch(e){self.postMessage({kind:"error",message:String(e.message||e)})}
};