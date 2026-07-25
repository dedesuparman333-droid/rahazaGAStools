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
    <div className="h-screen bg-gray-50 text-gray-800 font-sans flex flex-col overflow-hidden relative">
      {/* Atmospheric Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-indigo-100 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* Top Navigation Bar */}
      <header className="h-[64px] shrink-0 border-b border-gray-200 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md z-20 shadow-sm">
        <div className="flex items-center space-x-4">
          <button className="md:hidden text-gray-500 hover:text-gray-900" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
            <div className="w-4 h-4 border-2 border-white rounded-sm transform rotate-45"></div>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 uppercase hidden sm:block">Rahaza Digital <span className="text-blue-600">v2.0</span></h1>
        </div>
        <div className="flex items-center space-x-8 text-xs font-medium tracking-widest text-gray-500">
          <div className="hidden sm:flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            <span>NODE STATUS: OPTIMAL</span>
          </div>
          <div className="hidden md:block text-blue-600">REGION: US-EAST-1</div>
          <div className="flex items-center space-x-3 bg-gray-100 px-4 py-2 rounded-full border border-gray-200">
            <span className="opacity-80 hidden sm:inline">ADMIN_SECURE</span>
            <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center">
               <UserCircle className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden z-10 relative">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-40 md:hidden" 
            onClick={() => setIsSidebarOpen(false)} 
          />
        )}

        {/* Sidebar Nav */}
        <nav className={`fixed md:static inset-y-0 left-0 w-[240px] md:w-[80px] border-r border-gray-200 flex flex-col py-8 space-y-8 bg-white/95 md:bg-white/80 backdrop-blur-md z-50 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 shrink-0 shadow-sm`}>
          <div className="flex flex-col items-center space-y-8 px-4 md:px-0">
            {navItems.map(item => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setView(item.id as View); setIsSidebarOpen(false); }}
                  className={`w-full md:w-10 h-12 md:h-10 flex items-center justify-start md:justify-center px-4 md:px-0 rounded-xl cursor-pointer transition-colors ${isActive ? 'text-blue-600 bg-blue-50 border border-blue-200 shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100 border border-transparent'}`}
                  title={item.label}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className={`ml-3 md:hidden text-xs font-bold tracking-widest uppercase ${isActive ? 'text-blue-600' : ''}`}>{item.label}</span>
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
      <footer className="h-[30px] shrink-0 bg-white border-t border-gray-200 px-6 flex items-center justify-between text-[10px] font-mono text-gray-500 z-20">
        <div className="flex space-x-6">
          <span className="hidden sm:inline">LATENCY: 14MS</span>
          <span className="hidden sm:inline">UPTIME: 124:12:09</span>
          <span className="hidden md:inline">ENCRYPTION: AES-4096-Q</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="hidden sm:inline">TERMINAL: /DEV/TTY0</span>
          <span className="text-blue-600">SECURE_LINK_ESTABLISHED</span>
        </div>
      </footer>
    </div>
  );
}
