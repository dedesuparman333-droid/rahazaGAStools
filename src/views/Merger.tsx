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
      navHtml += `<li class="nav-item"><a class="nav-link ${isFirst ? 'active' : ''}" href="#" onclick="switchTab('${mod.id}', this, event, '${mod.name}')"><i class="bi bi-grid-1x2"></i> <span>${escapeHtml(mod.name)}</span></a></li>`;
      
      const unifiedTheme = `
    <!-- INJECTED UNIFIED THEME -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
      body { font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff; color: #1f2937; padding: 20px; margin: 0; }
      .card { border: none; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border-radius: 12px; border: 1px solid #f3f4f6; }
      .btn-primary { background-color: #4f46e5; border-color: #4f46e5; }
      .btn-primary:hover { background-color: #4338ca; border-color: #4338ca; }
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
  <title>App Dashboard</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet">
  <style>
    :root { --primary: #4f46e5; --bg: #f3f4f6; }
    body { background: var(--bg); font-family: 'Inter', 'Segoe UI', sans-serif; margin: 0; padding: 0; display: flex; height: 100vh; overflow: hidden; }
    .sidebar { width: 260px; background: #ffffff; border-right: 1px solid #e5e7eb; display: flex; flex-direction: column; z-index: 10; }
    .sidebar-header { padding: 20px; font-size: 1.25rem; font-weight: 700; color: #111827; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; gap: 10px; }
    .sidebar-header i { color: var(--primary); }
    .nav-pills { flex-direction: column; padding: 15px; gap: 5px; margin: 0; overflow-y: auto; }
    .nav-pills .nav-link { color: #4b5563; border-radius: 8px; padding: 12px 15px; font-weight: 500; display: flex; align-items: center; gap: 10px; transition: all 0.2s; border: none; text-align: left; cursor: pointer; }
    .nav-pills .nav-link:hover { background: #f9fafb; color: #111827; }
    .nav-pills .nav-link.active { background: #eef2ff; color: var(--primary); font-weight: 600; }
    .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
    .topbar { height: 70px; background: #ffffff; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; padding: 0 30px; font-weight: 600; color: #111827; font-size: 1.1rem; }
    .sandbox-container { flex: 1; padding: 20px; overflow: hidden; }
    .sandbox-frame { width: 100%; height: 100%; border: none; background: #fff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #e5e7eb; }
    
    @media (max-width: 768px) {
      body { flex-direction: column; }
      .sidebar { width: 100%; height: auto; border-right: none; border-bottom: 1px solid #e5e7eb; }
      .nav-pills { flex-direction: row; overflow-x: auto; padding: 10px; }
      .nav-pills .nav-link { white-space: nowrap; }
      .nav-pills .nav-link span { display: none; }
      .topbar { display: none; }
      .sandbox-container { padding: 10px; }
    }
  </style>
</head>
<body>
  <div class="sidebar">
    <div class="sidebar-header">
      <i class="bi bi-box-seam-fill"></i> Workspace
    </div>
    <ul class="nav nav-pills" id="appTabs">${navHtml}</ul>
  </div>
  <div class="main-content">
    <div class="topbar" id="topbarTitle">Dashboard</div>
    <div class="sandbox-container">
      <iframe id="sandboxFrame" class="sandbox-frame"></iframe>
    </div>
  </div>
  
  <!-- KODE HTML MASING-MASING MODUL -->${templatesHtml}

  <script>
    function switchTab(id, el, event, name) {
      if(event) event.preventDefault();
      document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
      if(el) el.classList.add('active');
      if(name) document.getElementById('topbarTitle').innerText = name;
      
      const tmpl = document.getElementById('template-' + id);
      if(tmpl) {
        document.getElementById('sandboxFrame').srcdoc = tmpl.innerHTML;
      }
    }
    window.onload = () => {
      const firstTab = document.querySelector('.nav-link');
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
