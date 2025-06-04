import React from 'react';
import { motion } from 'framer-motion';
import {
  CloudIcon,
  BatteryCharging
} from 'lucide-react';

type DashboardView = 'weather' | 'battery';

interface NavigationProps {
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    {
      id: 'weather' as DashboardView,
      label: 'Weather',
      icon: CloudIcon,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'battery' as DashboardView,
      label: 'Battery Swap',
      icon: BatteryCharging,
      color: 'from-green-500 to-green-600'
    }
  ];

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        
        return (
          <motion.button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`
              relative flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300
              ${isActive 
                ? `bg-gradient-to-r ${item.color} text-white shadow-lg scale-105` 
                : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
              }
            `}
            whileHover={{ scale: isActive ? 1.05 : 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Icon size={20} />
            <span>{item.label}</span>
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-xl bg-white/20"
                layoutId="activeTab"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

export default Navigation;