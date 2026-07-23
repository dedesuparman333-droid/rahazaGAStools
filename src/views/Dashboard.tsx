import React from 'react';
import { Puzzle, AppWindow } from 'lucide-react';
import { View } from '../types';

interface DashboardProps {
  setView: (view: View) => void;
}

export function Dashboard({ setView }: DashboardProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-xs font-bold tracking-widest text-gray-400 mb-6 uppercase">Dashboard Workspace</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Merger Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col h-full relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[50px] pointer-events-none"></div>
          <h5 className="text-xs font-bold tracking-widest text-white mb-4 flex items-center gap-2 uppercase">
            <Puzzle className="text-blue-400 w-5 h-5" />
            GAS WebApp Merger
          </h5>
          <p className="text-sm text-gray-400 mb-6 flex-grow leading-relaxed">
            Gabungkan beberapa project Google Apps Script (HTML/JS) ke dalam satu SPA menggunakan isolasi Iframe (Sandbox Architecture). Aman dari konflik variabel dan CSS.
          </p>
          <div>
            <button 
              onClick={() => setView('merger')}
              className="w-full py-3 bg-white/10 text-white border border-white/10 text-xs font-bold tracking-[0.2em] rounded-xl hover:bg-blue-500/20 hover:text-blue-400 hover:border-blue-500/30 transition-all uppercase"
            >
              Buka Alat Merger
            </button>
          </div>
        </div>

        {/* PWA Card */}
        <div className="bg-gradient-to-br from-indigo-900/20 to-transparent border border-white/10 rounded-2xl p-6 flex flex-col h-full relative overflow-hidden shadow-xl">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[50px] pointer-events-none"></div>
          <h5 className="text-xs font-bold tracking-widest text-white mb-4 flex items-center gap-2 uppercase">
            <AppWindow className="text-indigo-400 w-5 h-5" />
            PWA XML Generator
          </h5>
          <p className="text-sm text-gray-400 mb-6 flex-grow leading-relaxed">
            Ubah WebApp GAS menjadi aplikasi yang bisa diinstall di beranda (PWA) melalui inject template XML Blogger.
          </p>
          <div>
            <button 
              onClick={() => setView('pwa')}
              className="w-full py-3 bg-white/10 text-white border border-white/10 text-xs font-bold tracking-[0.2em] rounded-xl hover:bg-indigo-500/20 hover:text-indigo-400 hover:border-indigo-500/30 transition-all uppercase"
            >
              Buka XML Generator
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
