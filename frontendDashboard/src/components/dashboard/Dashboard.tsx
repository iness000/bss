import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../layout/Layout';
import WeatherSection from './sections/WeatherSection';
import BatterySection from './sections/BatterySection';
import Navigation from './Navigation';
import { SwapSession } from '../../types/battery';

type DashboardView = 'weather' | 'battery';

const Dashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<DashboardView>('weather');
  const [swapSession, setSwapSession] = useState<SwapSession | null>(null);

  // Debug: Log currentView changes
  useEffect(() => {
    console.log('[Dashboard] currentView changed to:', currentView);
  }, [currentView]);

  const handleViewChange = (view: DashboardView) => {
    setCurrentView(view);
    // Reset swap session when changing views
    if (view !== 'battery') {
      setSwapSession(null);
     
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'weather':
        return <WeatherSection onStartBatterySwap={() => setCurrentView('battery')} />;
      case 'battery':
        return (
          <BatterySection
            swapSession={swapSession}
            setSwapSession={setSwapSession}
           
            onBack={() => setCurrentView('weather')}
          />
        );
      default:
        return <WeatherSection onStartBatterySwap={() => setCurrentView('battery')} />;
    }
  };

  return (
    <Layout title="Battery Swap Station" subtitle="Smart Energy Management System">
      <Navigation currentView={currentView} onViewChange={handleViewChange} />
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="mt-6"
        >
          {renderCurrentView()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
};

export default Dashboard;