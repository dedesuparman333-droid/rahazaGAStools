import React, { useState } from 'react';
import { Plus, Trash2, FileCode2, FileCode, Wand2, CheckCircle2, Copy, Check, Monitor, ChevronDown, ListPlus } from 'lucide-react';
import { MergerModule } from '../types';
import { escapeHtml, base64EncodeSafe } from '../lib/utils';

const BOILERPLATES = [
  {
    name: 'Simple Calculator',
    gs: `function calculate(a, b, op) {
  switch(op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b !== 0 ? a / b : 'Error: Division by zero';
    default: return 'Invalid operation';
  }
}`,
    html: `<div class="p-4 border rounded shadow-sm max-w-sm">
  <h3 class="mb-3">Calculator</h3>
  <div class="mb-3 d-flex gap-2">
    <input type="number" id="calc-a" class="form-control" placeholder="A">
    <select id="calc-op" class="form-select">
      <option value="+">+</option>
      <option value="-">-</option>
      <option value="*">*</option>
      <option value="/">/</option>
    </select>
    <input type="number" id="calc-b" class="form-control" placeholder="B">
  </div>
  <button class="btn btn-primary w-100 mb-3" onclick="doCalc()">Calculate</button>
  <div class="alert alert-info" id="calc-res">Result: -</div>
</div>
<script>
  function doCalc() {
    const a = parseFloat(document.getElementById('calc-a').value) || 0;
    const b = parseFloat(document.getElementById('calc-b').value) || 0;
    const op = document.getElementById('calc-op').value;
    google.script.run.withSuccessHandler(res => {
      document.getElementById('calc-res').innerText = 'Result: ' + res;
    }).calculate(a, b, op);
  }
</script>`
  },
  {
    name: 'Task Tracker',
    gs: `let tasks = []; // Mock database for this session

function getTasks() {
  return tasks;
}

function addTask(title) {
  const task = { id: Date.now(), title, status: 'pending' };
  tasks.push(task);
  return tasks;
}

function toggleTask(id) {
  const t = tasks.find(x => x.id === id);
  if (t) t.status = t.status === 'pending' ? 'done' : 'pending';
  return tasks;
}`,
    html: `<div class="p-4 max-w-md border rounded shadow-sm">
  <h3>Task Tracker</h3>
  <div class="d-flex gap-2 mb-3">
    <input type="text" id="taskInput" class="form-control" placeholder="New task...">
    <button class="btn btn-primary" onclick="addNewTask()">Add</button>
  </div>
  <ul class="list-group" id="taskList"></ul>
</div>
<script>
  function renderTasks(ts) {
    const list = document.getElementById('taskList');
    list.innerHTML = '';
    ts.forEach(t => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.innerHTML = \`
        <span style="\${t.status === 'done' ? 'text-decoration: line-through' : ''}">\${t.title}</span>
        <button class="btn btn-sm btn-outline-secondary" onclick="toggleT(\${t.id})">\${t.status === 'pending' ? 'Done' : 'Undo'}</button>
      \`;
      list.appendChild(li);
    });
  }
  
  function addNewTask() {
    const input = document.getElementById('taskInput');
    if(!input.value.trim()) return;
    google.script.run.withSuccessHandler(renderTasks).addTask(input.value);
    input.value = '';
  }
  
  function toggleT(id) {
    google.script.run.withSuccessHandler(renderTasks).toggleTask(id);
  }
  
  // Initial load
  google.script.run.withSuccessHandler(renderTasks).getTasks();
</script>`
  },
  {
    name: 'Data Table',
    gs: `function getTableData() {
  return [
    { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'Admin' },
    { id: 2, name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Editor' }
  ];
}`,
    html: `<div class="p-4 border rounded shadow-sm">
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h3>User Data</h3>
    <button class="btn btn-primary btn-sm" onclick="loadData()">Refresh</button>
  </div>
  <table class="table table-hover table-bordered">
    <thead class="table-light">
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Email</th>
        <th>Role</th>
      </tr>
    </thead>
    <tbody id="tableBody">
      <tr><td colspan="4" class="text-center text-muted">Loading...</td></tr>
    </tbody>
  </table>
</div>
<script>
  function loadData() {
    document.getElementById('tableBody').innerHTML = '<tr><td colspan="4" class="text-center text-muted">Loading...</td></tr>';
    google.script.run.withSuccessHandler(data => {
      const tbody = document.getElementById('tableBody');
      tbody.innerHTML = '';
      if(!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No data found</td></tr>';
        return;
      }
      data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = \`
          <td>\${row.id}</td>
          <td>\${row.name}</td>
          <td>\${row.email}</td>
          <td><span class="badge bg-secondary">\${row.role}</span></td>
        \`;
        tbody.appendChild(tr);
      });
    }).getTableData();
  }
  
  // Load data initially
  loadData();
</script>`
  }
];

export function Merger() {
  const [modules, setModules] = useState<MergerModule[]>([
    { id: '1', name: 'Dashboard Utama', gs: '', html: '' },
    { id: '2', name: 'Fitur Report', gs: '', html: '' }
  ]);
  
  const [outGs, setOutGs] = useState('');
  const [outHtml, setOutHtml] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [validationError, setValidationError] = useState('');
  const [theme, setTheme] = useState<'default' | 'neubrutalism'>('default');

  const validateSpreadsheetId = (id: string) => {
    if (!id.trim()) {
      setValidationError('');
      return true;
    }
    // Check if it's a typical 44 character base62/64 string
    const regex = /^[a-zA-Z0-9-_]{40,50}$/;
    if (!regex.test(id)) {
      setValidationError('Format Spreadsheet ID tidak valid (biasanya 44 karakter alfanumerik)');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSpreadsheetIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSpreadsheetId(val);
    validateSpreadsheetId(val);
  };

  const addModule = () => {
    const newId = Date.now().toString();
    setModules([...modules, { id: newId, name: `Modul ${modules.length + 1}`, gs: '', html: '' }]);
  };

  const addTemplate = (template: typeof BOILERPLATES[0]) => {
    const newId = Date.now().toString();
    setModules([...modules, { id: newId, name: template.name, gs: template.gs, html: template.html }]);
    setShowTemplates(false);
  };

  const updateModule = (id: string, field: keyof MergerModule, value: string) => {
    setModules(modules.map(mod => mod.id === id ? { ...mod, [field]: value } : mod));
  };

  const removeModule = (id: string) => {
    setModules(modules.filter(mod => mod.id !== id));
  };

  const generateMerge = () => {
    if (validationError) {
      alert("Harap perbaiki error pada Form Validasi: " + validationError);
      return;
    }

    let combinedGS = `/* Gabungan via GAS WebApp Merger */\n\n`;
    if (spreadsheetId) {
      combinedGS += `// Global Configuration\nconst GLOBAL_SPREADSHEET_ID = "${spreadsheetId}";\n// Pastikan Anda memodifikasi fungsi modul Anda agar membaca GLOBAL_SPREADSHEET_ID jika diperlukan.\n\n`;
    }

    let navHtml = '';
    let templatesHtml = '';
    let isFirst = true;

    modules.forEach(mod => {
      combinedGS += `// ===== MODUL: ${mod.name} =====\n${mod.gs}\n\n`;
      navHtml += `<a class="nav-item-btn ${isFirst ? 'active' : ''}" href="#" onclick="switchTab('${mod.id}', this, event, '${escapeHtml(mod.name)}')"><i class="bi bi-app-indicator"></i> <span>${escapeHtml(mod.name)}</span></a>`;
      
      const defaultTheme = `
    <!-- INJECTED DEFAULT THEME -->
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

      const neubrutalismTheme = `
    <!-- INJECTED NEUBRUTALISM THEME -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
      body { font-family: 'Space Grotesk', 'Segoe UI', Tahoma, sans-serif; background-color: transparent; color: #000; padding: 20px; margin: 0; }
      .card { border: 2px solid #000; box-shadow: 4px 4px 0px #000; border-radius: 0; background: #fff; }
      .btn-primary { background-color: #ffde59; color: #000; border: 2px solid #000; box-shadow: 4px 4px 0px #000; font-weight: bold; border-radius: 0; transition: all 0.2s; }
      .btn-primary:hover { background-color: #fce074; color: #000; transform: translate(2px, 2px); box-shadow: 2px 2px 0px #000; }
      .form-control, .form-select { border: 2px solid #000; border-radius: 0; box-shadow: 2px 2px 0px #000; transition: all 0.2s; }
      .form-control:focus, .form-select:focus { box-shadow: 4px 4px 0px #000; outline: none; }
      table { font-size: 0.95rem; border: 2px solid #000; }
      th, td { border: 1px solid #000 !important; }
    </style>
    <!-- END INJECTED THEME -->
`;
      const unifiedTheme = theme === 'neubrutalism' ? neubrutalismTheme : defaultTheme;

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

    const defaultMasterCSS = `
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
`;

    const neubrutalismMasterCSS = `
    :root { --primary: #ffde59; --bg: #f4f4f0; --surface: #ffffff; --border: #000000; }
    body { background: var(--bg); font-family: 'Space Grotesk', system-ui, sans-serif; margin: 0; padding: 0; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
    
    .app-header { background: var(--surface); border-bottom: 2px solid var(--border); padding: 0 1rem; display: flex; align-items: center; justify-content: space-between; height: 60px; z-index: 10; flex-shrink: 0; }
    .brand { font-size: 1.125rem; font-weight: 800; color: #000; display: flex; align-items: center; gap: 0.5rem; text-transform: uppercase; }
    .brand i { color: #000; font-size: 1.25rem; }
    .brand-title { color: #000; font-size: 0.9rem; font-weight: 600; margin-left: 0.5rem; border-left: 2px solid #000; padding-left: 0.75rem; text-transform: uppercase; }
    
    .nav-container { display: flex; gap: 0.5rem; overflow-x: auto; padding: 0.75rem 1rem; background: var(--surface); border-bottom: 2px solid var(--border); scrollbar-width: none; }
    .nav-container::-webkit-scrollbar { display: none; }
    .nav-item-btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 0; font-size: 0.875rem; font-weight: 700; color: #000; border: 2px solid transparent; background: transparent; cursor: pointer; transition: all 0.2s; white-space: nowrap; text-decoration: none; text-transform: uppercase; }
    .nav-item-btn:hover { background: #e0e0e0; border: 2px solid #000; }
    .nav-item-btn.active { background: var(--primary); color: #000; border: 2px solid #000; box-shadow: 2px 2px 0px #000; transform: translate(-2px, -2px); }
    
    .main-workspace { flex: 1; position: relative; overflow: hidden; background: var(--bg); display: flex; flex-direction: column; }
    .sandbox-frame { width: 100%; height: 100%; border: none; display: block; flex: 1; }
`;

    const masterCSS = theme === 'neubrutalism' ? neubrutalismMasterCSS : defaultMasterCSS;

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
${masterCSS}
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
          <h3 className="text-xs font-bold tracking-widest text-gray-500 m-0 uppercase">Rahaza Digital Merger</h3>
          <p className="text-gray-600 text-[10px] uppercase tracking-widest mt-1">Sistem Penggabungan Modul</p>
        </div>
        <div className="flex items-center gap-3 relative">
          <div className="relative">
            <button 
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors"
            >
              <ListPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Templates</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
            </button>
            
            {showTemplates && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-2 border-b border-gray-100 bg-gray-50">
                  <span className="text-[10px] uppercase tracking-widest text-gray-600 font-bold px-2">Pilih Template</span>
                </div>
                <div className="p-1">
                  {BOILERPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      onClick={() => addTemplate(tmpl)}
                      className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <FileCode className="w-4 h-4 text-indigo-500" />
                      {tmpl.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button 
            onClick={addModule}
            className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Tambah Modul</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 shadow-sm">
        <h4 className="font-bold text-gray-900 mb-4 text-sm flex items-center gap-2">
          Global Settings
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-600">
              Global Spreadsheet ID (Opsional)
            </label>
            <input 
              type="text" 
              placeholder="Contoh: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
              value={spreadsheetId}
              onChange={handleSpreadsheetIdChange}
              className={`bg-gray-50 border ${validationError ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-400'} text-gray-900 p-3 rounded-lg text-sm w-full focus:outline-none transition-colors`}
            />
            {validationError && (
              <p className="text-red-500 text-xs mt-1">{validationError}</p>
            )}
            <p className="text-gray-500 text-[10px] mt-1">
              Jika diisi, konstanta <code>GLOBAL_SPREADSHEET_ID</code> akan ditambahkan ke <code>Code.gs</code>.
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-600">
              Tema Tampilan WebApp
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'default' | 'neubrutalism')}
              className="bg-gray-50 border border-gray-200 focus:border-blue-400 text-gray-900 p-3 rounded-lg text-sm w-full focus:outline-none transition-colors appearance-none"
            >
              <option value="default">Default Modern (Clean)</option>
              <option value="neubrutalism">Neubrutalism (Bold & High Contrast)</option>
            </select>
            <p className="text-gray-500 text-[10px] mt-1">
              Pilih gaya visual untuk halaman utama (Dashboard) dari WebApp gabungan Anda.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6 text-blue-800 text-sm leading-relaxed shadow-sm">
        <h4 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
          <Monitor className="w-4 h-4" /> Tips Penggabungan (Wajib Dilakukan Manual oleh User)
        </h4>
        <ul className="list-disc pl-5 space-y-2 text-xs text-blue-700/90">
          <li><strong>Konflik Variabel Global:</strong> Tools ini tidak mengganti nama variabel Anda secara otomatis. Jika menggunakan Spreadsheet ID (<code>var SPREADSHEET_ID = "..."</code>), <strong>Anda harus menggantinya secara manual</strong> (misal <code>ID_MODUL_A</code> dan <code>ID_MODUL_B</code>) pada kode sebelum/sesudah digabung agar tidak bentrok.</li>
          <li><strong>Konflik Nama Fungsi:</strong> <code>google.script.run</code> hanya memanggil fungsi global. <strong>Ubah nama fungsi</strong> secara manual jika ada nama fungsi yang sama (misal <code>simpanData()</code>) di kedua modul. Jangan lupa update juga pemanggilannya di kode HTML!</li>
          <li><strong>Otorisasi Akses:</strong> Setelah kode digabungkan dan di-paste ke Google Apps Script, <strong>Anda wajib menekan tombol "Run"</strong> pada salah satu fungsi secara manual di editor GAS. Ini untuk memicu jendela popup konfirmasi izin akses ke Spreadsheet Anda.</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {modules.map((mod, index) => (
          <div key={mod.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <input 
                type="text" 
                className="bg-transparent border-b border-transparent hover:border-gray-300 font-bold text-lg text-gray-900 focus:outline-none focus:border-blue-400 focus:ring-0 p-1 w-full transition-colors rounded-t" 
                value={mod.name} 
                onChange={(e) => updateModule(mod.id, 'name', e.target.value)}
                placeholder="Nama Modul"
                title="Klik untuk mengubah nama modul"
              />
              {modules.length > 1 && (
                <button onClick={() => removeModule(mod.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="mb-4">
              <label className="text-[10px] font-bold text-blue-600 flex items-center gap-2 mb-2 uppercase tracking-widest">
                <FileCode2 className="w-3 h-3" /> Code.gs
              </label>
              <textarea 
                className="w-full bg-gray-50 text-blue-800 p-3 rounded-lg font-mono text-xs border border-gray-200 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 h-32 resize-none"
                placeholder="// Fungsi server..."
                value={mod.gs}
                onChange={(e) => updateModule(mod.id, 'gs', e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-[10px] font-bold text-indigo-600 flex items-center gap-2 mb-2 uppercase tracking-widest">
                <FileCode className="w-3 h-3" /> index.html
              </label>
              <textarea 
                className="w-full bg-gray-50 text-indigo-800 p-3 rounded-lg font-mono text-xs border border-gray-200 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 h-32 resize-none"
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
          className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-xs tracking-[0.2em] shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:bg-blue-700 transition-all flex items-center gap-3 mx-auto uppercase"
        >
          <Wand2 className="w-5 h-5" />
          Execute Mainframe Sync
        </button>
      </div>

      {/* Output Area */}
      {showOutput && (
        <div id="merger-output" className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="w-full h-px bg-gray-200 my-8" />
          <h4 className="font-bold text-center mb-8 text-blue-600 text-sm tracking-[0.2em] uppercase flex items-center justify-center gap-2">
            SYSTEM SYNC SUCCESSFUL
          </h4>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-3 px-4 border-b border-gray-200 bg-gray-50">
                <span className="font-bold text-[10px] text-blue-600 flex items-center gap-2 uppercase tracking-widest">
                  <FileCode2 className="w-3 h-3" /> Code.gs
                </span>
                <button 
                  onClick={() => copyCode(outGs, 'gs')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-[10px] font-bold tracking-widest uppercase transition-colors ${copiedId === 'gs' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'}`}
                >
                  {copiedId === 'gs' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedId === 'gs' ? 'COPIED' : 'COPY'}
                </button>
              </div>
              <textarea 
                className="w-full h-96 bg-gray-50 text-blue-800 p-4 font-mono text-xs border-0 focus:outline-none focus:ring-0 resize-none"
                value={outGs}
                onChange={(e) => setOutGs(e.target.value)}
              />
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-3 px-4 border-b border-gray-200 bg-gray-50">
                <span className="font-bold text-[10px] text-indigo-600 flex items-center gap-2 uppercase tracking-widest">
                  <FileCode className="w-3 h-3" /> index.html
                </span>
                <button 
                  onClick={() => copyCode(outHtml, 'html')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-[10px] font-bold tracking-widest uppercase transition-colors ${copiedId === 'html' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'}`}
                >
                  {copiedId === 'html' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedId === 'html' ? 'COPIED' : 'COPY'}
                </button>
              </div>
              <textarea 
                className="w-full h-96 bg-gray-50 text-indigo-800 p-4 font-mono text-xs border-0 focus:outline-none focus:ring-0 resize-none"
                value={outHtml}
                onChange={(e) => setOutHtml(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-3 px-4 border-b border-gray-200 bg-gray-50">
              <span className="font-bold text-[10px] text-gray-600 flex items-center gap-2 uppercase tracking-widest">
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
