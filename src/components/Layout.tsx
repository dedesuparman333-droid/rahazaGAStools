import React from 'react';
import { LayoutDashboard, Puzzle, AppWindow, UserCircle, Menu, Sun, Moon } from 'lucide-react';
import { View } from '../types';

interface LayoutProps {
  currentView: View;
  setView: (view: View) => void;
  children: React.ReactNode;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export function Layout({ currentView, setView, children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'merger', label: 'GAS Merger', icon: Puzzle },
    { id: 'pwa', label: 'PWA XML', icon: AppWindow },
  ] as const;

  return (
    <div className="h-screen bg-[#050505] text-[#e0e0e0] font-sans flex flex-col overflow-hidden relative border-4 border-[#1a1a1a]">
      {/* Atmospheric Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* Top Navigation Bar */}
      <header className="h-[64px] shrink-0 border-b border-white/10 flex items-center justify-between px-8 bg-black/40 backdrop-blur-md z-20">
        <div className="flex items-center space-x-4">
          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <div className="w-4 h-4 border-2 border-white rounded-sm transform rotate-45"></div>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white uppercase hidden sm:block">Aether Control <span className="text-blue-400">v2.0</span></h1>
        </div>
        <div className="flex items-center space-x-8 text-xs font-medium tracking-widest text-gray-400">
          <div className="hidden sm:flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></div>
            <span>NODE STATUS: OPTIMAL</span>
          </div>
          <div className="hidden md:block text-blue-400">REGION: US-EAST-1</div>
          <div className="flex items-center space-x-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <span className="opacity-60 hidden sm:inline">ADMIN_SECURE</span>
            <div className="w-5 h-5 rounded-full bg-gray-600 flex items-center justify-center">
               <UserCircle className="w-4 h-4 text-white/70" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden z-10 relative">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden" 
            onClick={() => setIsSidebarOpen(false)} 
          />
        )}

        {/* Sidebar Nav */}
        <nav className={`fixed md:static inset-y-0 left-0 w-[240px] md:w-[80px] border-r border-white/5 flex flex-col py-8 space-y-8 bg-black/80 md:bg-black/20 backdrop-blur-md z-50 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 shrink-0`}>
          <div className="flex flex-col items-center space-y-8 px-4 md:px-0">
            {navItems.map(item => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setView(item.id as View); setIsSidebarOpen(false); }}
                  className={`w-full md:w-10 h-12 md:h-10 flex items-center justify-start md:justify-center px-4 md:px-0 rounded-xl cursor-pointer transition-colors ${isActive ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]' : 'text-gray-500 hover:text-gray-200 border border-transparent'}`}
                  title={item.label}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className={`ml-3 md:hidden text-xs font-bold tracking-widest uppercase ${isActive ? 'text-blue-400' : ''}`}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto w-full p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>

      {/* Bottom Info Rail */}
      <footer className="h-[30px] shrink-0 bg-black/60 border-t border-white/5 px-6 flex items-center justify-between text-[10px] font-mono text-gray-500 z-20">
        <div className="flex space-x-6">
          <span className="hidden sm:inline">LATENCY: 14MS</span>
          <span className="hidden sm:inline">UPTIME: 124:12:09</span>
          <span className="hidden md:inline">ENCRYPTION: AES-4096-Q</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="hidden sm:inline">TERMINAL: /DEV/TTY0</span>
          <span className="text-blue-500">SECURE_LINK_ESTABLISHED</span>
        </div>
      </footer>
    </div>
  );
}
