import { useDashboard } from '../context/DashboardContext';
import { MapPin, RotateCcw, Users, BatteryMedium, BatteryWarning, Battery as BatteryIcon } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import BatteryHealthChart from '../components/dashboard/BatteryHealthChart';
import SwapActivityTimeline from '../components/dashboard/SwapActivityTimeline';
import { motion } from 'framer-motion';
import { useGetUsers } from '../hooks/useUser';
import { User } from '../context/DashboardContext'; // Assuming User type from useUser
import SwapStatusChart from "../components/dashboard/SwapStatusChart";
const DashboardPage = () => {
  const { batteries, stations, swapActivities } = useDashboard();
  const { data: users = [] }  = useGetUsers();
  // Calculate statistics
  const totalBatteries = batteries.length;
  const activeBatteries = batteries.filter(b => b.status === 'in-use').length;
  const chargingBatteries = batteries.filter(b => b.status === 'charging').length;
  const faultyBatteries = batteries.filter(b => b.status === 'faulty').length;
  
  const totalStations = stations.length;
  const onlineStations = stations.filter(s => s.status === 'online').length;
  
  const activeSwaps = swapActivities.filter(s => s.status === 'active').length;
  const completedSwaps = swapActivities.filter(s => s.status === 'completed').length;
  
  const totalUsers = users.length;
  const activeUsers = users.filter((u: User) => u.status === 'active').length; // Assuming 'is_active' field from User model

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Monitor your battery swap system at a glance</p>
        </div>
        
        <div className="flex space-x-2">
          <select className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>Year to date</option>
          </select>
          
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
            Export
          </button>
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={item}>
          <StatCard
            title="Total Batteries"
            value={totalBatteries}
            icon={<BatteryIcon size={24} />}
            change={`${Math.round((activeBatteries / totalBatteries) * 100)}% in use`}
            trend="neutral"
          />
        </motion.div>
        
        <motion.div variants={item}>
          <StatCard
            title="Swap Stations"
            value={totalStations}
            icon={<MapPin size={24} />}
            change={`${onlineStations} online`}
            trend={onlineStations === totalStations ? "up" : "neutral"}
          />
        </motion.div>
        
        <motion.div variants={item}>
          <StatCard
            title="Active Swaps"
            value={activeSwaps}
            icon={<RotateCcw size={24} />}
            change={`${completedSwaps} completed today`}
            trend="up"
          />
        </motion.div>
        
        <motion.div variants={item}>
          <StatCard
            title="Registered Users"
            value={totalUsers}
            icon={<Users size={24} />}
            change={`${activeUsers} active`}
            trend="neutral"
          />
        </motion.div>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <motion.div variants={item}>
          <BatteryHealthChart batteries={batteries} />
        </motion.div>
        
        <motion.div variants={item}>
        <SwapStatusChart 
                activities={swapActivities} 
                stations={stations} 
        />
        </motion.div>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show" 
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div variants={item} className="md:col-span-2">
          <SwapActivityTimeline activities={swapActivities} limit={6} />
        </motion.div>
        
        <motion.div variants={item}>
          <div className="bg-white p-6 rounded-xl shadow-soft h-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Battery Status</h3>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <BatteryMedium size={18} className="text-success-500 mr-2" />
                    <span className="font-medium">Charging</span>
                  </div>
                  <span className="text-xl font-semibold">{chargingBatteries}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-success-500 h-2.5 rounded-full" 
                    style={{ width: `${(chargingBatteries / totalBatteries) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <BatteryIcon size={18} className="text-primary-500 mr-2" />
                    <span className="font-medium">In Use</span>
                  </div>
                  <span className="text-xl font-semibold">{activeBatteries}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-primary-500 h-2.5 rounded-full" 
                    style={{ width: `${(activeBatteries / totalBatteries) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <BatteryWarning size={18} className="text-error-500 mr-2" />
                    <span className="font-medium">Faulty</span>
                  </div>
                  <span className="text-xl font-semibold">{faultyBatteries}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-error-500 h-2.5 rounded-full" 
                    style={{ width: `${(faultyBatteries / totalBatteries) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Batteries needing attention</h4>
                
                {faultyBatteries > 0 ? (
                  <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
                    {batteries
                      .filter(b => b.status === 'faulty')
                      .slice(0, 3)
                      .map(battery => (
                        <div key={battery.id} className="p-3 flex justify-between items-center">
                          <div>
                            <div className="font-medium">{battery.serial_number}</div>
                            <div className="text-xs text-gray-500">Health: {battery.latest_soh_percent}%</div>
                          </div>
                          <span className="px-2 py-1 text-xs font-medium bg-error-100 text-error-800 rounded-full">
                            Faulty
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                    No batteries need attention
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;