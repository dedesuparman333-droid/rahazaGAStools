import React, { useState } from 'react';
import { Plus, Trash2, FileCode2, FileCode, Wand2, CheckCircle2, Copy, Check, Activity, AlertCircle, Terminal, Monitor } from 'lucide-react';
import { MergerModule } from '../types';
import { escapeHtml, base64EncodeSafe } from '../lib/utils';

export function Merger() {
  const [modules, setModules] = useState<MergerModule[]>([
    { id: '1', name: 'Dashboard Utama', gs: '', html: '' },
    { id: '2', name: 'Fitur Report', gs: '', html: '' }
  ]);
  const [analysisResult, setAnalysisResult] = useState<{type: 'success'|'warning'|'info', text: string}[] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [outGs, setOutGs] = useState('');
  const [outHtml, setOutHtml] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const addModule = () => {
    const newId = Date.now().toString();
    setModules([...modules, { id: newId, name: `Modul ${modules.length + 1}`, gs: '', html: '' }]);
  };

  const updateModule = (id: string, field: keyof MergerModule, value: string) => {
    setModules(modules.map(mod => mod.id === id ? { ...mod, [field]: value } : mod));
  };

  const removeModule = (id: string) => {
    setModules(modules.filter(mod => mod.id !== id));
  };

  const runDiagnostics = () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setTimeout(() => {
      const results: {type: 'success'|'warning'|'info', text: string}[] = [];
      let allGs = '';
      let allFunctions: string[] = [];

      modules.forEach(mod => {
        allGs += mod.gs + '\n';
        const matches = mod.gs.match(/function\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(/g);
        if (matches) {
          matches.forEach(m => {
            const fnName = m.replace('function', '').replace('(', '').trim();
            allFunctions.push(fnName);
          });
        }
      });

      const duplicates = allFunctions.filter((item, index) => allFunctions.indexOf(item) !== index);
      const uniqueDuplicates = [...new Set(duplicates)];
      
      if (uniqueDuplicates.length > 0) {
        results.push({ type: 'warning', text: `KONFLIK FUNGSI: Ditemukan fungsi ganda (${uniqueDuplicates.join(', ')})` });
      } else {
        results.push({ type: 'success', text: 'STRUKTUR FUNGSI: AMAN (TIDAK ADA DUPLIKASI)' });
      }

      if (!allGs.includes('function doGet')) {
        results.push({ type: 'info', text: 'INFO: FUNGSI DOGET TIDAK DITEMUKAN (AKAN DIGENERATE OTOMATIS)' });
      } else if (!allGs.includes('ALLOWALL') && !allGs.includes('XFrameOptionsMode')) {
        results.push({ type: 'warning', text: 'PERINGATAN: DOGET ANDA BELUM DISET ALLOWALL' });
      } else {
        results.push({ type: 'success', text: 'DOGET ALLOWALL: TERKONFIGURASI' });
      }

      setAnalysisResult(results);
      setIsAnalyzing(false);
    }, 800);
  };

  const generateMerge = () => {
    let combinedGS = `/* Gabungan via GAS WebApp Merger */\n\n`;
    let appsData: Record<string, { name: string, htmlB64: string }> = {};

    modules.forEach(mod => {
      combinedGS += `// ===== MODUL: ${mod.name} =====\n${mod.gs}\n\n`;
      appsData[mod.id] = {
        name: mod.name,
        htmlB64: base64EncodeSafe(mod.html || `<h1>${mod.name} (Kosong)</h1>`)
      };
    });

    if (!combinedGS.includes('function doGet')) {
      combinedGS += `\n// --- DEFAULT GET ENTRY POINT ---\nfunction doGet(e) {\n  return HtmlService.createHtmlOutputFromFile('index')\n    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);\n}\n`;
    } else if (!combinedGS.includes('ALLOWALL') && !combinedGS.includes('XFrameOptionsMode')) {
      combinedGS = `// [PERINGATAN SYSTEM] Fungsi doGet terdeteksi tanpa konfigurasi ALLOWALL.\n// Tambahkan .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL) pada kembalian HtmlService Anda\n// agar WebApp dapat diakses di luar Google/Iframe.\n\n` + combinedGS;
    }

    if (!combinedGS.includes('function doPost')) {
      combinedGS += `\n// --- DEFAULT POST ENTRY POINT ---\nfunction doPost(e) {\n  return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Webapp active" }))\n    .setMimeType(ContentService.MimeType.JSON);\n}\n`;
    }

    let navHtml = '';
    let scriptMap = `const appsData = {`;
    let isFirst = true;

    for (const key in appsData) {
      navHtml += `<li class="nav-item"><a class="nav-link ${isFirst ? 'active' : ''}" href="#" onclick="switchTab('${key}', this)">${escapeHtml(appsData[key].name)}</a></li>`;
      scriptMap += `'${key}': '${appsData[key].htmlB64}',`;
      isFirst = false;
    }
    scriptMap += `};\n`;

    const masterHTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <base target="_top">
  <meta charset="UTF-8">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <style> body { background: #f8f9fa; padding: 10px; } .sandbox-frame { width: 100%; height: 90vh; border: none; background: #fff; border-radius: 8px; } </style>
</head>
<body>
  <ul class="nav nav-pills mb-3" id="appTabs">${navHtml}</ul>
  <iframe id="sandboxFrame" class="sandbox-frame"></iframe>
  <script>
    ${scriptMap}
    function switchTab(id, el) {
      document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
      if(el) el.classList.add('active');
      document.getElementById('sandboxFrame').srcdoc = decodeURIComponent(escape(atob(appsData[id])));
    }
    window.onload = () => switchTab(Object.keys(appsData)[0], document.querySelector('.nav-link'));
  </script>
</body>
</html>`;

    setOutGs(combinedGS);
    setOutHtml(masterHTML);
    setShowOutput(true);
    
    // Scroll to output
    setTimeout(() => {
      document.getElementById('merger-output')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xs font-bold tracking-widest text-gray-400 m-0 uppercase">GAS WebApp Merger</h3>
          <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-1">Sistem Penggabungan Modul</p>
        </div>
        <button 
          onClick={addModule}
          className="flex items-center gap-2 border border-blue-500/50 text-blue-400 hover:bg-blue-500/10 px-4 py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tambah Modul</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {modules.map((mod, index) => (
          <div key={mod.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <input 
                type="text" 
                className="bg-transparent border-b border-transparent hover:border-white/20 font-bold text-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-0 p-1 w-full transition-colors rounded-t" 
                value={mod.name} 
                onChange={(e) => updateModule(mod.id, 'name', e.target.value)}
                placeholder="Nama Modul"
                title="Klik untuk mengubah nama modul"
              />
              {modules.length > 1 && (
                <button onClick={() => removeModule(mod.id)} className="text-red-400 hover:bg-red-500/20 p-2 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="mb-4">
              <label className="text-[10px] font-bold text-blue-400 flex items-center gap-2 mb-2 uppercase tracking-widest">
                <FileCode2 className="w-3 h-3" /> Code.gs
              </label>
              <textarea 
                className="w-full bg-black/40 text-blue-300 p-3 rounded-lg font-mono text-xs border border-white/10 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 h-32 resize-none"
                placeholder="// Fungsi server..."
                value={mod.gs}
                onChange={(e) => updateModule(mod.id, 'gs', e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-[10px] font-bold text-indigo-400 flex items-center gap-2 mb-2 uppercase tracking-widest">
                <FileCode className="w-3 h-3" /> index.html
              </label>
              <textarea 
                className="w-full bg-black/40 text-indigo-300 p-3 rounded-lg font-mono text-xs border border-white/10 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 h-32 resize-none"
                placeholder="<h1>Ini Modul</h1>"
                value={mod.html}
                onChange={(e) => updateModule(mod.id, 'html', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Diagnostics Panel */}
      <div className="bg-gradient-to-br from-indigo-900/20 to-transparent border border-white/10 rounded-2xl p-6 mb-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-[-50%] left-[-10%] w-64 h-64 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <Activity className="text-indigo-400 w-8 h-8" />
            <div>
              <h6 className="font-bold flex items-center gap-2 m-0 text-white uppercase tracking-widest text-xs">
                Static Code Analyzer 
                <span className="bg-white/10 text-white text-[9px] px-2 py-0.5 rounded border border-white/20">DIAGNOSTICS</span>
              </h6>
              <span className="text-[10px] text-indigo-300 tracking-widest uppercase mt-1 block">Cek potensi konflik variabel & struktur</span>
            </div>
          </div>
          <button 
            onClick={runDiagnostics}
            disabled={isAnalyzing}
            className="bg-white/10 border border-white/10 text-white hover:bg-indigo-500/20 hover:text-indigo-400 hover:border-indigo-500/30 px-4 py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all disabled:opacity-50"
          >
            {isAnalyzing ? 'MENGANALISIS...' : 'RUN DIAGNOSTICS'}
          </button>
        </div>
        
        {analysisResult && (
          <div className="mt-6 space-y-2 relative z-10">
            {analysisResult.map((res, i) => (
              <div 
                key={i} 
                className={`p-3 rounded-xl text-xs font-mono border flex items-start gap-3 animate-in fade-in duration-300 ${
                  res.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                  res.type === 'warning' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                  'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {res.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
                {res.type === 'warning' && <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                {res.type === 'info' && <Terminal className="w-4 h-4 shrink-0 mt-0.5" />}
                <span className="leading-relaxed">{res.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-center mb-12">
        <button 
          onClick={generateMerge}
          className="bg-white text-black px-8 py-4 rounded-xl font-bold text-xs tracking-[0.2em] shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(96,165,250,0.4)] hover:bg-blue-400 hover:text-white transition-all flex items-center gap-3 mx-auto uppercase"
        >
          <Wand2 className="w-5 h-5" />
          Execute Mainframe Sync
        </button>
      </div>

      {/* Output Area */}
      {showOutput && (
        <div id="merger-output" className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="w-full h-px bg-white/10 my-8" />
          <h4 className="font-bold text-center mb-8 text-blue-400 text-sm tracking-[0.2em] uppercase flex items-center justify-center gap-2">
            SYSTEM SYNC SUCCESSFUL
          </h4>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl shadow-xl overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-3 px-4 border-b border-white/10 bg-black/40">
                <span className="font-bold text-[10px] text-blue-400 flex items-center gap-2 uppercase tracking-widest">
                  <FileCode2 className="w-3 h-3" /> Code.gs
                </span>
                <button 
                  onClick={() => copyCode(outGs, 'gs')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border border-white/10 text-[10px] font-bold tracking-widest uppercase transition-colors ${copiedId === 'gs' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                >
                  {copiedId === 'gs' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedId === 'gs' ? 'COPIED' : 'COPY'}
                </button>
              </div>
              <textarea 
                className="w-full h-96 bg-black/60 text-blue-300 p-4 font-mono text-xs border-0 focus:outline-none focus:ring-0 resize-none"
                readOnly
                value={outGs}
              />
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl shadow-xl overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-3 px-4 border-b border-white/10 bg-black/40">
                <span className="font-bold text-[10px] text-indigo-400 flex items-center gap-2 uppercase tracking-widest">
                  <FileCode className="w-3 h-3" /> index.html
                </span>
                <button 
                  onClick={() => copyCode(outHtml, 'html')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border border-white/10 text-[10px] font-bold tracking-widest uppercase transition-colors ${copiedId === 'html' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                >
                  {copiedId === 'html' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedId === 'html' ? 'COPIED' : 'COPY'}
                </button>
              </div>
              <textarea 
                className="w-full h-96 bg-black/60 text-indigo-300 p-4 font-mono text-xs border-0 focus:outline-none focus:ring-0 resize-none"
                readOnly
                value={outHtml}
              />
            </div>
          </div>

          <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-3 px-4 border-b border-white/10 bg-black/40">
              <span className="font-bold text-[10px] text-gray-300 flex items-center gap-2 uppercase tracking-widest">
                <Monitor className="w-3 h-3" /> Live Preview
              </span>
            </div>
            <div className="w-full h-[500px] bg-white">
              <iframe
                title="Live Preview"
                srcDoc={outHtml}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
