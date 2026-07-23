import React, { useState } from 'react';
import { Plus, Trash2, FileCode2, FileCode, Wand2, CheckCircle2, Copy, Check, Monitor } from 'lucide-react';
import { MergerModule } from '../types';
import { escapeHtml, base64EncodeSafe } from '../lib/utils';

export function Merger() {
  const [modules, setModules] = useState<MergerModule[]>([
    { id: '1', name: 'Dashboard Utama', gs: '', html: '' },
    { id: '2', name: 'Fitur Report', gs: '', html: '' }
  ]);
  
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

  const generateMerge = () => {
    let combinedGS = `/* Gabungan via GAS WebApp Merger */\n\n`;
    let navHtml = '';
    let templatesHtml = '';
    let isFirst = true;

    modules.forEach(mod => {
      combinedGS += `// ===== MODUL: ${mod.name} =====\n${mod.gs}\n\n`;
      navHtml += `<a class="nav-item-btn ${isFirst ? 'active' : ''}" href="#" onclick="switchTab('${mod.id}', this, event, '${escapeHtml(mod.name)}')"><i class="bi bi-app-indicator"></i> <span>${escapeHtml(mod.name)}</span></a>`;
      
      const unifiedTheme = `
    <!-- INJECTED UNIFIED THEME -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
      body { font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: transparent; color: #1f2937; padding: 20px; margin: 0; }
      .card { border: none; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border-radius: 12px; border: 1px solid #f3f4f6; }
      .btn-primary { background-color: #2563eb; border-color: #2563eb; }
      .btn-primary:hover { background-color: #1d4ed8; border-color: #1d4ed8; }
      table { font-size: 0.95rem; }
    </style>
    <!-- END INJECTED THEME -->
`;
      let finalHtml = mod.html || `<h1>${mod.name} (Kosong)</h1>`;
      if (!finalHtml.includes('bootstrap.min.css')) {
          if (finalHtml.includes('<head>')) {
              finalHtml = finalHtml.replace('<head>', '<head>\n' + unifiedTheme);
          } else {
              finalHtml = unifiedTheme + finalHtml;
          }
      }

      templatesHtml += `\n  <template id="template-${mod.id}">\n    ${finalHtml}\n  </template>`;
      isFirst = false;
    });

    if (!combinedGS.includes('function doGet')) {
      combinedGS += `\n// --- DEFAULT GET ENTRY POINT ---\nfunction doGet(e) {\n  return HtmlService.createHtmlOutputFromFile('index')\n    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);\n}\n`;
    } else if (!combinedGS.includes('ALLOWALL') && !combinedGS.includes('XFrameOptionsMode')) {
      combinedGS = `// [PERINGATAN SYSTEM] Fungsi doGet terdeteksi tanpa konfigurasi ALLOWALL.\n// Tambahkan .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL) pada kembalian HtmlService Anda\n// agar WebApp dapat diakses di luar Google/Iframe.\n\n` + combinedGS;
    }

    if (!combinedGS.includes('function doPost')) {
      combinedGS += `\n// --- DEFAULT POST ENTRY POINT ---\nfunction doPost(e) {\n  return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Webapp active" }))\n    .setMimeType(ContentService.MimeType.JSON);\n}\n`;
    }

    const masterHTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <base target="_top">
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>App Workspace</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet">
  <style>
    :root { --primary: #2563eb; --bg: #f8fafc; --surface: #ffffff; --border: #e2e8f0; }
    body { background: var(--bg); font-family: 'Inter', system-ui, sans-serif; margin: 0; padding: 0; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
    
    .app-header { background: var(--surface); border-bottom: 1px solid var(--border); padding: 0 1rem; display: flex; align-items: center; justify-content: space-between; height: 60px; z-index: 10; flex-shrink: 0; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
    .brand { font-size: 1.125rem; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 0.5rem; }
    .brand i { color: var(--primary); font-size: 1.25rem; }
    .brand-title { color: #64748b; font-size: 0.9rem; font-weight: 500; margin-left: 0.5rem; border-left: 1px solid #cbd5e1; padding-left: 0.75rem; }
    
    .nav-container { display: flex; gap: 0.5rem; overflow-x: auto; padding: 0.75rem 1rem; background: var(--surface); border-bottom: 1px solid var(--border); scrollbar-width: none; }
    .nav-container::-webkit-scrollbar { display: none; }
    .nav-item-btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 500; color: #475569; border: 1px solid transparent; background: transparent; cursor: pointer; transition: all 0.2s; white-space: nowrap; text-decoration: none; }
    .nav-item-btn:hover { background: #f1f5f9; color: #0f172a; }
    .nav-item-btn.active { background: var(--primary); color: #ffffff; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); }
    
    .main-workspace { flex: 1; position: relative; overflow: hidden; background: var(--bg); display: flex; flex-direction: column; }
    .sandbox-frame { width: 100%; height: 100%; border: none; display: block; flex: 1; }
  </style>
</head>
<body>
  <header class="app-header">
    <div class="brand">
      <i class="bi bi-layers-fill"></i> 
      <span>Workspace</span>
      <span class="brand-title" id="topbarTitle">Dashboard</span>
    </div>
  </header>
  
  <nav class="nav-container" id="appTabs">
    ${navHtml}
  </nav>
  
  <main class="main-workspace">
    <iframe id="sandboxFrame" class="sandbox-frame"></iframe>
  </main>
  
  <!-- KODE HTML MASING-MASING MODUL -->${templatesHtml}

  <script>
    function switchTab(id, el, event, name) {
      if(event) event.preventDefault();
      document.querySelectorAll('.nav-item-btn').forEach(n => n.classList.remove('active'));
      if(el) el.classList.add('active');
      if(name) document.getElementById('topbarTitle').innerText = name;
      
      const tmpl = document.getElementById('template-' + id);
      if(tmpl) {
        document.getElementById('sandboxFrame').srcdoc = tmpl.innerHTML;
      }
    }
    window.onload = () => {
      const firstTab = document.querySelector('.nav-item-btn');
      if(firstTab) firstTab.click();
    };
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
                value={outGs}
                onChange={(e) => setOutGs(e.target.value)}
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
                value={outHtml}
                onChange={(e) => setOutHtml(e.target.value)}
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
