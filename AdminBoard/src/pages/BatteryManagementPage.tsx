import { useState, useMemo } from 'react';
import { useDashboard, BatteryStatus } from '../context/DashboardContext'; // Keep for stations
import { useBatteryManagement, Battery as BackendBattery } from '../hooks/useBatteries';
import {
  Battery, Plus, Filter, Edit, Trash2, ArrowUpDown, RotateCcw,
  MapPin, X
} from 'lucide-react';
import { cn } from '../utils/cn';
import { motion } from 'framer-motion';

// Define a type for the battery data structure used within this component for display
interface DisplayBattery {
  id: number;
  serialNumber: string;
  status: BatteryStatus;
  healthPercentage: number;
  cycleCount: number;
  assignedStationId: number | null | undefined;
  lastServiceDate?: string; // Or use manufacture_date
  // raw: BackendBattery; // Optional: to store the original backend object
}

const BatteryManagementPage = () => {
  const { stations } = useDashboard(); // Still using this for stations list
  const {
    batteries: fetchedBatteries,
    loading: batteriesLoading,
    error: batteriesError,
    updateBatteryStatus, // Use this from the hook
    deleteBattery,       // Use this from the hook
    creating: isCreating // Use this from the hook
  } = useBatteryManagement();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BatteryStatus | 'all'>('all');
  const [stationFilter, setStationFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('serial_number');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for new battery
  const [newBattery, setNewBattery] = useState({
    serial_number: '',
    status: 'available' as BatteryStatus,
    battery_type: '',
    battery_capacity: '',
    manufacture_date: '',
    station_id: '',
    // Health log data
    soh_percent: '',
    cycle_count: '',
    pack_voltage: '',
    cell_voltage_min: '',
    cell_voltage_max: '',
    max_temp: '',
    ambient_temp: '',
    humidity: '',
    internal_resist: ''
  });

  // Process and then filter/sort batteries
  const processedBatteries = useMemo((): DisplayBattery[] => {
    return fetchedBatteries.map((b: BackendBattery) => ({
      id: b.id,
      serialNumber: b.serial_number,
      status: b.status as BatteryStatus, // Assuming backend status strings match BatteryStatus values
      healthPercentage: b.latest_soh_percent ?? 0,
      cycleCount: b.latest_cycle_count ?? 0,
      assignedStationId: b.station_id,
      lastServiceDate: b.manufacture_date || 'N/A', // Using manufacture_date as last service date
      // raw: b, 
    }));
  }, [fetchedBatteries]);

   const filteredAndSortedBatteries = useMemo(() => {
    return processedBatteries
      .filter(battery => {
        const matchesSearch = battery.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || battery.status === statusFilter;
        const matchesStation = stationFilter === 'all' ||
              (stationFilter === 'unassigned' ? battery.assignedStationId == null : String(battery.assignedStationId) === stationFilter);
        return matchesSearch && matchesStatus && matchesStation;
      })
      .sort((a, b) => {
        if (sortBy === 'healthPercentage') {
          return sortDirection === 'asc'
            ? a.healthPercentage - b.healthPercentage
            : b.healthPercentage - a.healthPercentage;
        } else if (sortBy === 'cycleCount') {
          return sortDirection === 'asc'
            ? a.cycleCount - b.cycleCount
            : b.cycleCount - a.cycleCount;

        } else if (sortBy === 'serial_number') { // Match the state value

          return sortDirection === 'asc'
            ? a.serialNumber.localeCompare(b.serialNumber)
            : b.serialNumber.localeCompare(a.serialNumber);
        }
       return 0;
     });
  }, [processedBatteries, searchTerm, statusFilter, stationFilter, sortBy, sortDirection]);

  

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const handleStatusChange = async (id: number, newStatus: BatteryStatus) => {
    await updateBatteryStatus(id, newStatus); // updateBatteryStatus from hook expects {id, status}
  };

  const handleRemoveBattery = async (id: number) => {
  
    if (window.confirm('Are you sure you want to remove this battery?')) {
     await deleteBattery(id); // deleteBattery from hook expects id
    } 
    
  };

  const handleAddBattery = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setNewBattery({
      serial_number: '',
      status: 'available' as BatteryStatus,
      battery_type: '',
      battery_capacity: '',
      manufacture_date: '',
      station_id: '',
      soh_percent: '',
      cycle_count: '',
      pack_voltage: '',
      cell_voltage_min: '',
      cell_voltage_max: '',
      max_temp: '',
      ambient_temp: '',
      humidity: '',
      internal_resist: ''
    });
  };

  const handleSubmitBattery = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create battery data
    const batteryData = {
      serial_number: newBattery.serial_number,
      status: newBattery.status,
      battery_type: newBattery.battery_type || undefined,
      battery_capacity: newBattery.battery_capacity ? parseFloat(newBattery.battery_capacity) : undefined,
      manufacture_date: newBattery.manufacture_date || undefined,
      station_id: newBattery.station_id ? parseInt(newBattery.station_id) : undefined
    };

    try {
      // Create battery first
      const response = await fetch('http://localhost:5000/api/batteries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batteryData),
      });
      
      const result = await response.json();
      
      // If health log data is provided, create initial health log
      if (result.battery_id && (newBattery.soh_percent || newBattery.cycle_count)) {
        const healthLogData = {
          battery_id: result.battery_id,
          soh_percent: newBattery.soh_percent ? parseFloat(newBattery.soh_percent) : undefined,
          cycle_count: newBattery.cycle_count ? parseInt(newBattery.cycle_count) : undefined,
          pack_voltage: newBattery.pack_voltage ? parseFloat(newBattery.pack_voltage) : undefined,
          cell_voltage_min: newBattery.cell_voltage_min ? parseFloat(newBattery.cell_voltage_min) : undefined,
          cell_voltage_max: newBattery.cell_voltage_max ? parseFloat(newBattery.cell_voltage_max) : undefined,
          max_temp: newBattery.max_temp ? parseFloat(newBattery.max_temp) : undefined,
          ambient_temp: newBattery.ambient_temp ? parseFloat(newBattery.ambient_temp) : undefined,
          humidity: newBattery.humidity ? parseFloat(newBattery.humidity) : undefined,
          internal_resist: newBattery.internal_resist ? parseFloat(newBattery.internal_resist) : undefined
        };
        
        // Create health log
        await fetch('http://localhost:5000/api/battery_health_logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(healthLogData),
        });
      }

      // Refresh the batteries list
      window.location.reload(); // Simple refresh for now
      handleCloseModal();
    } catch (error) {
      console.error('Error creating battery:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewBattery(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const getBatteryStatusClass = (status: BatteryStatus) => {
    switch (status) {
      case 'charging':
        return 'bg-success-100 text-success-800';
      case 'in-use':
        return 'bg-primary-100 text-primary-800';
      case 'available':
        return 'bg-accent-100 text-accent-800';
      case 'faulty':
        return 'bg-error-100 text-error-800';
    }
  };
   if (batteriesLoading) {
    return <div className="p-6 text-center">Loading batteries...</div>;
  }

  if (batteriesError) {
    return <div className="p-6 text-center text-red-500">Error loading batteries: {batteriesError.message}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Battery Management</h1>
          <p className="text-gray-600">Monitor and manage battery assets</p>
        </div>
        
        <button
          onClick={handleAddBattery}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
        >
          <Plus size={16} className="mr-2" />
          Add New Battery
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-soft"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Battery size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Search by serial number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Filter size={16} className="text-gray-400" />
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as BatteryStatus | 'all')}
                >
                  <option value="all">All Statuses</option>
                  <option value="charging">Charging</option>
                  <option value="in-use">In Use</option>
                  <option value="available">Available</option>
                  <option value="faulty">Faulty</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <MapPin size={16} className="text-gray-400" />
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={stationFilter}
                  onChange={(e) => setStationFilter(e.target.value)}
                >
                  <option value="all">All Stations</option>
                  <option value="unassigned">Unassigned</option>
                  {stations.map(station => (
                    <option key={station.id} value={station.id}>
                      {station.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th 
                  className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('serial_number')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Serial Number</span>
                    {sortBy === 'serial_number' && (
                      <ArrowUpDown size={14} className={sortDirection === 'asc' ? 'transform rotate-180' : ''} />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th 
                  className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('healthPercentage')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Health</span>
                    {sortBy === 'healthPercentage' && (
                      <ArrowUpDown size={14} className={sortDirection === 'asc' ? 'transform rotate-180' : ''} />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('cycleCount')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Cycle Count</span>
                    {sortBy === 'cycleCount' && (
                      <ArrowUpDown size={14} className={sortDirection === 'asc' ? 'transform rotate-180' : ''} />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Station
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Service
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSortedBatteries.map((battery) => (

                <tr key={battery.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{battery.serialNumber}</div>
                    <div className="text-xs text-gray-500">ID: {battery.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <select
                        value={battery.status}
                        onChange={(e) => handleStatusChange(battery.id, e.target.value as BatteryStatus)}
                        className={cn(
                          "px-2 py-1 text-xs font-medium rounded-full border-0",
                          getBatteryStatusClass(battery.status)
                        )}
                      >
                        <option value="charging">Charging</option>
                        <option value="in-use">In Use</option>
                        <option value="available">Available</option>
                        <option value="faulty">Faulty</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={cn(
                            "h-2 rounded-full",
                            battery.healthPercentage >= 80 ? "bg-success-500" :
                            battery.healthPercentage >= 60 ? "bg-accent-500" :
                            "bg-error-500"
                          )}
                          style={{ width: `${battery.healthPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{battery.healthPercentage}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {battery.cycleCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {battery.assignedStationId ? 
                      stations.find(s => String(s.id) === String(battery.assignedStationId))?.name || 'Unknown' : 
                      <span className="text-gray-400">Unassigned</span>
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {battery.lastServiceDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button className="p-1 rounded-full text-gray-400 hover:text-primary-600 hover:bg-primary-50">
                        <RotateCcw size={16} />
                      </button>
                      <button className="p-1 rounded-full text-gray-400 hover:text-primary-600 hover:bg-primary-50">
                        <Edit size={16} />
                      </button>
                      <button 
                        className="p-1 rounded-full text-gray-400 hover:text-error-600 hover:bg-error-50"
                        onClick={() => handleRemoveBattery(battery.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredAndSortedBatteries.length === 0 && !batteriesLoading && (
            <div className="text-center py-8 text-gray-500">
              No batteries found matching your search criteria
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{filteredAndSortedBatteries.length}</span> of <span className="font-medium">{processedBatteries.length}</span> batteries
          </div>
          
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white text-gray-700 hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white text-gray-700 hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </motion.div>

      {/* Add Battery Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Add New Battery</h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitBattery} className="p-6 space-y-6">
              {/* Basic Battery Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Serial Number *
                    </label>
                    <input
                      type="text"
                      name="serial_number"
                      value={newBattery.serial_number}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={newBattery.status}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="available">Available</option>
                      <option value="charging">Charging</option>
                      <option value="in-use">In Use</option>
                      <option value="faulty">Faulty</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Battery Type
                    </label>
                    <input
                      type="text"
                      name="battery_type"
                      value={newBattery.battery_type}
                      onChange={handleInputChange}
                      placeholder="e.g., Li-ion, LiFePO4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Battery Capacity (Ah)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="battery_capacity"
                      value={newBattery.battery_capacity}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Manufacture Date
                    </label>
                    <input
                      type="date"
                      name="manufacture_date"
                      value={newBattery.manufacture_date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned Station
                    </label>
                    <select
                      name="station_id"
                      value={newBattery.station_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Unassigned</option>
                      {stations.map(station => (
                        <option key={station.id} value={station.id}>
                          {station.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Initial Health Log Data */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Initial Health Data (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SOH Percentage (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      name="soh_percent"
                      value={newBattery.soh_percent}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cycle Count
                    </label>
                    <input
                      type="number"
                      min="0"
                      name="cycle_count"
                      value={newBattery.cycle_count}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pack Voltage (V)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="pack_voltage"
                      value={newBattery.pack_voltage}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Cell Voltage (V)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="cell_voltage_min"
                      value={newBattery.cell_voltage_min}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Cell Voltage (V)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="cell_voltage_max"
                      value={newBattery.cell_voltage_max}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Temperature (°C)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="max_temp"
                      value={newBattery.max_temp}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ambient Temperature (°C)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="ambient_temp"
                      value={newBattery.ambient_temp}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Humidity (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      name="humidity"
                      value={newBattery.humidity}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Internal Resistance (Ω)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      name="internal_resist"
                      value={newBattery.internal_resist}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create Battery'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BatteryManagementPage;