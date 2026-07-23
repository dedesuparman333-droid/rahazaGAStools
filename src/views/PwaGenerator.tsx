import React, { useState, useEffect } from 'react';
import { AppWindow, SlidersHorizontal, Link as LinkIcon, Download, Copy, Code, Check } from 'lucide-react';
import { PwaConfig, IconType } from '../types';
import { base64EncodeSafe, createSVGString, getKbSize } from '../lib/utils';

export function PwaGenerator() {
  const [config, setConfig] = useState<PwaConfig>({
    url: 'https://script.google.com/macros/s/AKfycbwRMgTWzMfUhkwJSNlV84ecoLJ8w1j79qOIt5GhvWRkrQA7fEfsy5uXanVYqmaGI569CA/exec',
    name: 'Toko Online',
    shortName: 'Toko',
    desc: 'Toko online - katalog produk dan keranjang belanja',
    themeColor: '#E63946',
    bgColor: '#1A1A2E',
    iconType: 'url',
    iconUrl: '',
    iconText: 'T',
    icon192Src: null,
    icon512Src: null
  });

  const [xmlOutput, setXmlOutput] = useState('');
  const [kbSize, setKbSize] = useState('0');
  const [copied, setCopied] = useState(false);

  // File upload & Canvas compression
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // 192x192
        const canvas192 = document.createElement('canvas');
        canvas192.width = 192; canvas192.height = 192;
        canvas192.getContext('2d')?.drawImage(img, 0, 0, 192, 192);
        const src192 = canvas192.toDataURL('image/webp', 0.8);

        // 512x512
        const canvas512 = document.createElement('canvas');
        canvas512.width = 512; canvas512.height = 512;
        canvas512.getContext('2d')?.drawImage(img, 0, 0, 512, 512);
        const src512 = canvas512.toDataURL('image/webp', 0.8);

        setConfig(prev => ({ ...prev, icon192Src: src192, icon512Src: src512 }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // XML Generator
  useEffect(() => {
    let icon192 = '';
    let icon512 = '';
    let mimeType = 'image/png';

    if (config.iconType === 'url') {
      if (config.iconUrl) {
        icon192 = config.iconUrl;
        icon512 = config.iconUrl;
      } else {
        const svg = createSVGString(192, config.bgColor, config.themeColor, config.iconText || '?');
        const b64 = `data:image/svg+xml;base64,${base64EncodeSafe(svg)}`;
        icon192 = b64; icon512 = b64;
        mimeType = 'image/svg+xml';
      }
    } else if (config.iconType === 'text') {
      icon192 = `data:image/svg+xml;base64,${base64EncodeSafe(createSVGString(192, config.bgColor, config.themeColor, config.iconText || '?'))}`;
      icon512 = `data:image/svg+xml;base64,${base64EncodeSafe(createSVGString(512, config.bgColor, config.themeColor, config.iconText || '?'))}`;
      mimeType = 'image/svg+xml';
    } else if (config.iconType === 'image') {
      if (config.icon192Src && config.icon512Src) {
        icon192 = config.icon192Src;
        icon512 = config.icon512Src;
        mimeType = 'image/webp';
      } else {
        const svg = createSVGString(192, config.bgColor, config.themeColor, "?");
        const b64 = `data:image/svg+xml;base64,${base64EncodeSafe(svg)}`;
        icon192 = b64; icon512 = b64;
        mimeType = 'image/svg+xml';
      }
    }

    const manifest = {
      name: config.name || 'App',
      short_name: config.shortName || 'App',
      description: config.desc,
      start_url: "/",
      display: "standalone",
      background_color: config.bgColor,
      theme_color: config.themeColor,
      orientation: "portrait-primary",
      icons: [
        { src: icon192, sizes: "192x192", type: mimeType, purpose: "any maskable" },
        { src: icon512, sizes: "512x512", type: mimeType, purpose: "any maskable" }
      ]
    };

    const b64Manifest = base64EncodeSafe(JSON.stringify(manifest));

    // Breaking prologue to avoid GAS execution issues if used in template
    const xmlPrologue = '<' + '?xml version="1.0" encoding="UTF-8" ?' + '>';
    const xmlTemplate = `${xmlPrologue}
<!DOCTYPE html>
<html b:css='false' b:defaultwidgetversion='2' b:layoutsversion='3' xmlns='http://www.w3.org/1999/xhtml' xmlns:b='http://www.google.com/namespaces/gae/2008' xmlns:data='http://www.google.com/namespaces/atom' xmlns:expr='http://www.google.com/namespaces/all/0.8'>
<head>
  <title><data:blog.pageTitle/></title>
  <meta content='width=device-width,initial-scale=1,viewport-fit=cover' name='viewport'/>

  <!-- PWA Manifest -->
  <link href='data:application/manifest+json;base64,${b64Manifest}' rel='manifest'/>

  <!-- PWA Meta Tags -->
  <meta content='${config.themeColor}' name='theme-color'/>
  <meta content='yes' name='mobile-web-app-capable'/>
  <meta content='yes' name='apple-mobile-web-app-capable'/>
  <meta content='black-translucent' name='apple-mobile-web-app-status-bar-style'/>
  <meta content='${config.shortName || 'App'}' name='apple-mobile-web-app-title'/>
  <link href='${icon192}' rel='apple-touch-icon'/>

  <b:skin><![CDATA[
    /* Fullscreen Reset */
    body {
      margin: 0; padding: 0; overflow: hidden; 
      background-color: ${config.bgColor};
    }
    iframe {
      position: absolute; top: 0; left: 0;
      width: 100%; height: 100%; border: none;
    }
  ]]></b:skin>
</head>
<body>
  <iframe allow='camera; microphone; display-capture; autoplay' src='${config.url || '#'}' />
  <b:section id='main' showaddelement='no'>
    <b:widget id='Blog1' locked='true' title='Blog Posts' type='Blog' visible='false'/>
  </b:section>
</body>
</html>`;

    setXmlOutput(xmlTemplate);
    setKbSize(getKbSize(xmlTemplate));
  }, [config]);

  const downloadXML = () => {
    const fileName = `theme-${(config.shortName || 'App').toLowerCase().replace(/[^a-z0-9]/g, '-')}.xml`;
    const blob = new Blob([xmlOutput], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadIconAsset = (size: 192 | 512) => {
    const src = size === 192 ? config.icon192Src : config.icon512Src;
    if (!src) {
      alert('Silakan upload logo terlebih dahulu.');
      return;
    }
    const fileName = `icon-${(config.shortName || 'App').toLowerCase()}-${size}x${size}.webp`;
    const a = document.createElement('a');
    a.href = src;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(xmlOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-8">
        <h3 className="text-xs font-bold tracking-widest text-gray-400 m-0 uppercase">PWA XML Generator</h3>
        <span className="bg-white/10 text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-[0.2em] border border-white/20">PRO</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Config Form */}
        <div className="xl:col-span-5 flex flex-col">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex-grow">
            <h6 className="text-xs font-bold tracking-[0.2em] border-b border-white/10 pb-4 mb-6 flex items-center gap-2 text-white uppercase">
              <SlidersHorizontal className="text-blue-400 w-4 h-4" />
              Konfigurasi Aplikasi
            </h6>

            <div className="space-y-6">
              {/* URL */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-2">URL Google Apps Script (exec)</label>
                <div className="flex items-center">
                  <span className="bg-black/40 border border-white/10 border-r-0 px-3 py-2 rounded-l-lg text-gray-500">
                    <LinkIcon className="w-4 h-4" />
                  </span>
                  <input 
                    type="url" 
                    value={config.url}
                    onChange={e => setConfig({...config, url: e.target.value})}
                    className="flex-grow border border-white/10 bg-black/40 text-blue-300 px-3 py-2 rounded-r-lg focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-xs font-mono"
                    placeholder="https://script.google.com/.../exec"
                  />
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-2">Nama Aplikasi</label>
                  <input 
                    type="text" 
                    value={config.name}
                    onChange={e => setConfig({...config, name: e.target.value})}
                    className="w-full border border-white/10 bg-black/40 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-2">Nama Pendek</label>
                  <input 
                    type="text" 
                    value={config.shortName}
                    onChange={e => setConfig({...config, shortName: e.target.value})}
                    className="w-full border border-white/10 bg-black/40 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-xs"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-2">Deskripsi Singkat</label>
                <input 
                  type="text" 
                  value={config.desc}
                  onChange={e => setConfig({...config, desc: e.target.value})}
                  className="w-full border border-white/10 bg-black/40 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-xs"
                />
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-2">Theme Color</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={config.themeColor}
                      onChange={e => setConfig({...config, themeColor: e.target.value})}
                      className="w-10 h-8 p-0 border-0 rounded cursor-pointer bg-transparent"
                    />
                    <span className="font-mono text-xs text-blue-300 uppercase">{config.themeColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-2">Bg Color</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={config.bgColor}
                      onChange={e => setConfig({...config, bgColor: e.target.value})}
                      className="w-10 h-8 p-0 border-0 rounded cursor-pointer bg-transparent"
                    />
                    <span className="font-mono text-xs text-blue-300 uppercase">{config.bgColor}</span>
                  </div>
                </div>
              </div>

              {/* Icon Source */}
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-3">Sumber Ikon PWA</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" name="iconType" value="url" checked={config.iconType === 'url'} onChange={() => setConfig({...config, iconType: 'url'})} className="w-3 h-3 text-blue-500 bg-black/40 border-white/20 focus:ring-blue-500/50" />
                    <span className="text-xs text-gray-300 group-hover:text-white transition-colors">URL Gambar <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[9px] ml-2 px-2 py-0.5 rounded tracking-widest uppercase">Ringan</span></span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" name="iconType" value="text" checked={config.iconType === 'text'} onChange={() => setConfig({...config, iconType: 'text'})} className="w-3 h-3 text-blue-500 bg-black/40 border-white/20 focus:ring-blue-500/50" />
                    <span className="text-xs text-gray-300 group-hover:text-white transition-colors">Inisial Teks (SVG)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" name="iconType" value="image" checked={config.iconType === 'image'} onChange={() => setConfig({...config, iconType: 'image'})} className="w-3 h-3 text-blue-500 bg-black/40 border-white/20 focus:ring-blue-500/50" />
                    <span className="text-xs text-gray-300 group-hover:text-white transition-colors">Upload Lokal <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[9px] ml-2 px-2 py-0.5 rounded tracking-widest uppercase">Auto-WebP</span></span>
                  </label>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  {config.iconType === 'url' && (
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Link URL Gambar (PNG/JPG/WEBP)</label>
                      <input type="url" value={config.iconUrl} onChange={e => setConfig({...config, iconUrl: e.target.value})} className="w-full border border-white/10 bg-black/40 text-blue-300 px-3 py-2 rounded-lg text-xs font-mono focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50" placeholder="https://example.com/logo.png" />
                    </div>
                  )}
                  {config.iconType === 'text' && (
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Inisial Teks (Maks 2)</label>
                      <input type="text" maxLength={2} value={config.iconText} onChange={e => setConfig({...config, iconText: e.target.value})} className="w-16 text-center font-bold text-lg border border-white/10 bg-black/40 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50" />
                    </div>
                  )}
                  {config.iconType === 'image' && (
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Upload Logo (Auto-resize to 192 & 512)</label>
                      <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleFileUpload} className="w-full text-[10px] file:mr-4 file:py-2 file:px-4 file:rounded file:border file:border-white/10 file:text-[10px] file:font-bold file:uppercase file:tracking-widest file:bg-white/10 file:text-white hover:file:bg-white/20 transition-all text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Preview */}
              <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-dashed border-white/20">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Preview Ikon:</span>
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-colors duration-300"
                  style={{ backgroundColor: config.bgColor, color: config.themeColor }}
                >
                  {(config.iconType === 'text' || (config.iconType === 'url' && !config.iconUrl) || (config.iconType === 'image' && !config.icon192Src)) ? (
                    <span className="text-3xl font-bold">{config.iconText || '?'}</span>
                  ) : (config.iconType === 'url' && config.iconUrl) ? (
                    <img src={config.iconUrl} alt="icon" className="w-full h-full object-cover" />
                  ) : (config.iconType === 'image' && config.icon192Src) ? (
                    <img src={config.icon192Src} alt="icon" className="w-full h-full object-cover" />
                  ) : null}
                </div>
              </div>

              {/* Downloads */}
              {config.iconType === 'image' && (
                <div className="pt-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Download Aset (Hasil Resize):</p>
                  <div className="flex gap-3">
                    <button onClick={() => downloadIconAsset(192)} className="flex-1 flex items-center justify-center gap-2 border border-white/10 hover:bg-white/10 text-white py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-colors">
                      <Download className="w-3 h-3" /> 192x192
                    </button>
                    <button onClick={() => downloadIconAsset(512)} className="flex-1 flex items-center justify-center gap-2 border border-white/10 hover:bg-white/10 text-white py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-colors">
                      <Download className="w-3 h-3" /> 512x512
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Output */}
        <div className="xl:col-span-7 flex flex-col h-full min-h-[600px]">
          <div className="bg-white/5 border border-white/10 rounded-2xl shadow-xl flex flex-col h-full overflow-hidden relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none"></div>
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-black/40 relative z-10">
              <div className="flex items-center gap-3">
                <Code className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white">Hasil XML Blogger</span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded border tracking-widest uppercase ${parseFloat(kbSize) > 100 ? 'bg-red-500/20 text-red-400 border-red-500/30' : parseFloat(kbSize) > 30 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                  {kbSize} KB
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={handleCopy} className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-[10px] font-bold tracking-widest uppercase transition-colors ${copied ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/10 border-white/10 text-white hover:bg-white/20'}`}>
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'COPIED' : 'COPY'}
                </button>
                <button onClick={downloadXML} className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-blue-500/30 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-[10px] font-bold tracking-widest uppercase transition-colors">
                  <Download className="w-3 h-3" />
                  DOWNLOAD
                </button>
              </div>
            </div>
            <textarea 
              className="flex-grow w-full bg-black/60 text-indigo-300 p-6 font-mono text-[11px] leading-relaxed border-0 focus:outline-none focus:ring-0 resize-none relative z-10"
              readOnly
              value={xmlOutput}
              placeholder="Generate XML akan muncul di sini..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
