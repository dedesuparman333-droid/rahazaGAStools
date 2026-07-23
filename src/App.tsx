import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './views/Dashboard';
import { Merger } from './views/Merger';
import { PwaGenerator } from './views/PwaGenerator';
import { View } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  return (
    <Layout 
      currentView={currentView} 
      setView={setCurrentView} 
    >
      {currentView === 'dashboard' && <Dashboard setView={setCurrentView} />}
      {currentView === 'merger' && <Merger />}
      {currentView === 'pwa' && <PwaGenerator />}
    </Layout>
  );
}
