import { useState, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { useSwapManagement, Swap as BackendSwap, CreateSwapData } from '../hooks/useSwap';
import {
  RotateCcw, Search, Download, Filter, Calendar, Plus,
  User, MapPin, ArrowUpDown, Trash2, Edit, Battery,
  Clock, CheckCircle, AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';

// Import types from DashboardContext
import type { User as DashboardUser, Station as DashboardStation, Battery as DashboardBattery } from '../context/DashboardContext';

// Swap status type
type SwapStatus = 'active' | 'completed' | 'cancelled';

// Define a type for the swap data structure used within this component for display
interface DisplaySwap {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  issuedBatteryId?: number;
  returnedBatteryId?: number;
  pickupStationId?: number;
  depositStationId?: number;
  pickupStationName: string;
  depositStationName: string;
  startTime?: string;
  endTime?: string;
  batteryPercentageStart?: number;
  batteryPercentageEnd?: number;
  ahUsed?: number;
  status: SwapStatus;
  duration: string;
  createdAt: string;
  updatedAt: string;
}

// Modal component for creating/editing swaps
interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSwapData) => void;
  swap?: DisplaySwap | null;
  isLoading?: boolean;
  users: DashboardUser[];
  stations: DashboardStation[];
  batteries: DashboardBattery[];
}

const SwapModal = ({ isOpen, onClose, onSubmit, swap, isLoading, users, stations, batteries }: SwapModalProps) => {
  const [formData, setFormData] = useState({
    user_id: swap?.userId || '',
    issued_battery_id: swap?.issuedBatteryId || '',
    returned_battery_id: swap?.returnedBatteryId || '',
    pickup_station_id: swap?.pickupStationId || '',
    deposit_station_id: swap?.depositStationId || '',
    start_time: swap?.startTime ? new Date(swap.startTime).toISOString().slice(0, 16) : '',
    end_time: swap?.endTime ? new Date(swap.endTime).toISOString().slice(0, 16) : '',
    battery_percentage_start: swap?.batteryPercentageStart || '',
    battery_percentage_end: swap?.batteryPercentageEnd || '',
    ah_used: swap?.ahUsed || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.user_id) {
      const submitData = {
        ...formData,
        user_id: Number(formData.user_id),
        issued_battery_id: formData.issued_battery_id ? Number(formData.issued_battery_id) : undefined,
        returned_battery_id: formData.returned_battery_id ? Number(formData.returned_battery_id) : undefined,
        pickup_station_id: formData.pickup_station_id ? Number(formData.pickup_station_id) : undefined,
        deposit_station_id: formData.deposit_station_id ? Number(formData.deposit_station_id) : undefined,
        battery_percentage_start: formData.battery_percentage_start ? Number(formData.battery_percentage_start) : undefined,
        battery_percentage_end: formData.battery_percentage_end ? Number(formData.battery_percentage_end) : undefined,
        ah_used: formData.ah_used ? Number(formData.ah_used) : undefined,
        start_time: formData.start_time || undefined,
        end_time: formData.end_time || undefined
      };
      onSubmit(submitData);
    }
  };

  const handleClose = () => {
    setFormData({
      user_id: '',
      issued_battery_id: '',
      returned_battery_id: '',
      pickup_station_id: '',
      deposit_station_id: '',
      start_time: '',
      end_time: '',
      battery_percentage_start: '',
      battery_percentage_end: '',
      ah_used: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {swap ? 'Edit Swap Activity' : 'Add New Swap Activity'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="user_id" className="block text-sm font-medium text-gray-700 mb-1">
                User *
              </label>
              <select
                id="user_id"
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Select User</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="issued_battery_id" className="block text-sm font-medium text-gray-700 mb-1">
                Issued Battery
              </label>
              <select
                id="issued_battery_id"
                value={formData.issued_battery_id}
                onChange={(e) => setFormData({ ...formData, issued_battery_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select Battery</option>
                {batteries.map(battery => (
                  <option key={battery.id} value={battery.id}>
                    {battery.serialNumber} (ID: {battery.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="returned_battery_id" className="block text-sm font-medium text-gray-700 mb-1">
                Returned Battery
              </label>
              <select
                id="returned_battery_id"
                value={formData.returned_battery_id}
                onChange={(e) => setFormData({ ...formData, returned_battery_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select Battery</option>
                {batteries.map(battery => (
                  <option key={battery.id} value={battery.id}>
                    {battery.serialNumber} (ID: {battery.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="pickup_station_id" className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Station
              </label>
              <select
                id="pickup_station_id"
                value={formData.pickup_station_id}
                onChange={(e) => setFormData({ ...formData, pickup_station_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select Station</option>
                {stations.map(station => (
                  <option key={station.id} value={station.id}>
                    {station.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="deposit_station_id" className="block text-sm font-medium text-gray-700 mb-1">
                Deposit Station
              </label>
              <select
                id="deposit_station_id"
                value={formData.deposit_station_id}
                onChange={(e) => setFormData({ ...formData, deposit_station_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select Station</option>
                {stations.map(station => (
                  <option key={station.id} value={station.id}>
                    {station.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="datetime-local"
                id="start_time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="datetime-local"
                id="end_time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label htmlFor="battery_percentage_start" className="block text-sm font-medium text-gray-700 mb-1">
                Start Battery %
              </label>
              <input
                type="number"
                id="battery_percentage_start"
                min="0"
                max="100"
                value={formData.battery_percentage_start}
                onChange={(e) => setFormData({ ...formData, battery_percentage_start: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="0-100"
              />
            </div>

            <div>
              <label htmlFor="battery_percentage_end" className="block text-sm font-medium text-gray-700 mb-1">
                End Battery %
              </label>
              <input
                type="number"
                id="battery_percentage_end"
                min="0"
                max="100"
                value={formData.battery_percentage_end}
                onChange={(e) => setFormData({ ...formData, battery_percentage_end: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="0-100"
              />
            </div>

            <div>
              <label htmlFor="ah_used" className="block text-sm font-medium text-gray-700 mb-1">
                Ah Used
              </label>
              <input
                type="number"
                id="ah_used"
                step="0.1"
                min="0"
                value={formData.ah_used}
                onChange={(e) => setFormData({ ...formData, ah_used: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ampere hours"
              />
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.user_id}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : swap ? 'Update Swap' : 'Create Swap'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const SwapActivityPage = () => {
  const { stations: rawStations, users: rawUsers, batteries } = useDashboard(); // Still using this for reference data

  const users = Array.isArray(rawUsers) ? rawUsers : [];
  const stations = Array.isArray(rawStations) ? rawStations : [];
  const { 
    swaps: fetchedSwaps, 
    loading: swapsLoading, 
    error: swapsError, 
    createSwap,
    updateSwap,
    deleteSwap,
    creating,
    updating,
    deleting
  } = useSwapManagement();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<SwapStatus | 'all'>('all');
  const [stationFilter, setStationFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSwap, setEditingSwap] = useState<DisplaySwap | null>(null);

  // Process and transform backend swaps to display format
  const processedSwaps = useMemo((): DisplaySwap[] => {
    return (fetchedSwaps || []).map((s: BackendSwap) => {
      // Find user info
            // At this point, 'users' and 'stations' are guaranteed to be arrays by the declarations above.
      const user = users.find(u => typeof s.user_id === 'number' && u.id === s.user_id);
      
      // Find station names
            const pickupStation = stations.find(st => typeof s.pickup_station_id === 'number' && st.id === s.pickup_station_id);
            const depositStation = stations.find(st => typeof s.deposit_station_id === 'number' && st.id === s.deposit_station_id);
      
      // Determine status
      let status: SwapStatus = 'active';
      if (s.end_time) {
        status = 'completed';
      }
      
      // Calculate duration
      let duration = 'Active';
      if (s.start_time && s.end_time) {
        const start = new Date(s.start_time).getTime();
        const end = new Date(s.end_time).getTime();
        const durationMinutes = Math.round((end - start) / (1000 * 60));
        
        if (durationMinutes < 60) {
          duration = `${durationMinutes} min`;
        } else {
          const hours = Math.floor(durationMinutes / 60);
          const minutes = durationMinutes % 60;
          duration = `${hours}h ${minutes}m`;
        }
      }

      return {
        id: s.id,
        userId: s.user_id,
        userName: user?.username || s.user_name || 'Unknown User',
        userEmail: user?.email || s.user_email || '',
        issuedBatteryId: s.issued_battery_id,
        returnedBatteryId: s.returned_battery_id,
        pickupStationId: s.pickup_station_id,
        depositStationId: s.deposit_station_id,
        pickupStationName: pickupStation?.name || 'Unknown Station',
        depositStationName: depositStation?.name || 'Unknown Station',
        startTime: s.start_time,
        endTime: s.end_time,
        batteryPercentageStart: s.battery_percentage_start,
        batteryPercentageEnd: s.battery_percentage_end,
        ahUsed: s.ah_used,
        status,
        duration,
        createdAt: s.created_at,
        updatedAt: s.updated_at,
      };
    });
  }, [fetchedSwaps, users, stations]); // Added dependency array

  // Filter and sort swaps
  const filteredAndSortedSwaps = useMemo(() => {
    return processedSwaps
      .filter(swap => {
        const matchesSearch = 
          swap.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          swap.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          swap.pickupStationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          swap.depositStationName.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || swap.status === statusFilter;
        const matchesStation = stationFilter === 'all' || 
          String(swap.pickupStationId) === stationFilter || 
          String(swap.depositStationId) === stationFilter;
        
        // Date filtering
        let matchesDate = true;
        if (dateFilter !== 'all' && swap.startTime) {
          const swapDate = new Date(swap.startTime);
          const now = new Date();
          
          switch (dateFilter) {
            case 'today': {
              matchesDate = swapDate.toDateString() === now.toDateString();
              break;
            }
            case 'yesterday': {
              const yesterday = new Date(now);
              yesterday.setDate(yesterday.getDate() - 1);
              matchesDate = swapDate.toDateString() === yesterday.toDateString();
              break;
            }
            case 'week': {
              const weekAgo = new Date(now);
              weekAgo.setDate(weekAgo.getDate() - 7);
              matchesDate = swapDate >= weekAgo;
              break;
            }
            case 'month': {
              const monthAgo = new Date(now);
              monthAgo.setDate(monthAgo.getDate() - 30);
              matchesDate = swapDate >= monthAgo;
              break;
            }
          }
        }
        
        return matchesSearch && matchesStatus && matchesStation && matchesDate;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'userName':
            return sortDirection === 'asc' 
              ? a.userName.localeCompare(b.userName)
              : b.userName.localeCompare(a.userName);
          case 'pickupStationName':
            return sortDirection === 'asc' 
              ? a.pickupStationName.localeCompare(b.pickupStationName)
              : b.pickupStationName.localeCompare(a.pickupStationName);
          case 'startTime': {
            const aTime = a.startTime ? new Date(a.startTime).getTime() : 0;
            const bTime = b.startTime ? new Date(b.startTime).getTime() : 0;
            return sortDirection === 'asc' ? aTime - bTime : bTime - aTime;
          }
          case 'endTime': {
            const aEndTime = a.endTime ? new Date(a.endTime).getTime() : 0;
            const bEndTime = b.endTime ? new Date(b.endTime).getTime() : 0;
            return sortDirection === 'asc' ? aEndTime - bEndTime : bEndTime - aEndTime;
          }
          case 'createdAt':
          default: {
            const aCreated = new Date(a.createdAt).getTime();
            const bCreated = new Date(b.createdAt).getTime();
            return sortDirection === 'asc' ? aCreated - bCreated : bCreated - aCreated;
          }
        }
      });
  }, [processedSwaps, searchTerm, statusFilter, stationFilter, dateFilter, sortBy, sortDirection]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const handleCreateSwap = async (data: CreateSwapData) => {
    try {
      await createSwap(data);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create swap:', error);
    }
  };

  const handleUpdateSwap = async (data: CreateSwapData) => {
    if (!editingSwap) return;
    
    try {
      await updateSwap(editingSwap.id, data);
      setEditingSwap(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to update swap:', error);
    }
  };

  const handleDeleteSwap = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this swap activity? This action cannot be undone.')) {
      try {
        await deleteSwap(id);
      } catch (error) {
        console.error('Failed to delete swap:', error);
      }
    }
  };

  const handleEditSwap = (swap: DisplaySwap) => {
    setEditingSwap(swap);
    setIsModalOpen(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: SwapStatus) => {
    switch (status) {
      case 'active':
        return (
          <div className="flex items-center space-x-1 px-2 py-1 bg-accent-100 text-accent-800 rounded-full text-xs font-medium">
            <Clock size={12} />
            <span>Active</span>
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center space-x-1 px-2 py-1 bg-success-100 text-success-800 rounded-full text-xs font-medium">
            <CheckCircle size={12} />
            <span>Completed</span>
          </div>
        );
      case 'cancelled':
        return (
          <div className="flex items-center space-x-1 px-2 py-1 bg-error-100 text-error-800 rounded-full text-xs font-medium">
            <AlertTriangle size={12} />
            <span>Cancelled</span>
          </div>
        );
    }
  };

  if (swapsLoading) {
    return <div className="p-6 text-center">Loading swap activities...</div>;
  }

  if (swapsError) {
    return <div className="p-6 text-center text-red-500">Error loading swap activities: {swapsError.message}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Swap Activity</h1>
          <p className="text-gray-600">Monitor battery swap transactions and history</p>
        </div>
        
        <div className="flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
            <Download size={16} className="mr-2" />
            Export Activity
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
          >
            <Plus size={16} className="mr-2" />
            Add New Swap
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-soft"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
              <RotateCcw size={24} className="text-primary-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Total Swaps</div>
              <div className="text-2xl font-semibold">{processedSwaps.length}</div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-soft"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-lg bg-accent-100 flex items-center justify-center">
              <Clock size={24} className="text-accent-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Active Swaps</div>
              <div className="text-2xl font-semibold text-accent-600">
                {processedSwaps.filter(s => s.status === 'active').length}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-soft"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-lg bg-success-100 flex items-center justify-center">
              <CheckCircle size={24} className="text-success-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Completed</div>
              <div className="text-2xl font-semibold text-success-600">
                {processedSwaps.filter(s => s.status === 'completed').length}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-soft"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-lg bg-accent-100 flex items-center justify-center">
              <Battery size={24} className="text-accent-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Avg Duration</div>
              <div className="text-2xl font-semibold">
                {processedSwaps.filter(s => s.status === 'completed').length > 0 ? '2.5h' : '-'}
              </div>
            </div>
          </div>
        </motion.div>
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
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Search by user, station, or battery..."
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
                  onChange={(e) => setStatusFilter(e.target.value as SwapStatus | 'all')}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Swaps</option>
                  <option value="completed">Completed Swaps</option>
                  <option value="cancelled">Cancelled Swaps</option>
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
                  {stations.map(station => (
                    <option key={station.id} value={station.id}>
                      {station.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar size={16} className="text-gray-400" />
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="week">Last 7 days</option>
                  <option value="month">Last 30 days</option>
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
                  onClick={() => handleSort('userName')}
                >
                  <div className="flex items-center space-x-1">
                    <span>User</span>
                    {sortBy === 'userName' && (
                      <ArrowUpDown size={14} className={sortDirection === 'asc' ? 'transform rotate-180' : ''} />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('pickupStationName')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Stations</span>
                    {sortBy === 'pickupStationName' && (
                      <ArrowUpDown size={14} className={sortDirection === 'asc' ? 'transform rotate-180' : ''} />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batteries
                </th>
                <th 
                  className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('startTime')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Start Time</span>
                    {sortBy === 'startTime' && (
                      <ArrowUpDown size={14} className={sortDirection === 'asc' ? 'transform rotate-180' : ''} />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('endTime')}
                >
                  <div className="flex items-center space-x-1">
                    <span>End Time</span>
                    {sortBy === 'endTime' && (
                      <ArrowUpDown size={14} className={sortDirection === 'asc' ? 'transform rotate-180' : ''} />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSortedSwaps.map((swap) => (
                <tr key={swap.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                        <User size={16} />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{swap.userName}</div>
                        <div className="text-xs text-gray-500">{swap.userEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div>From: {swap.pickupStationName}</div>
                      <div className="text-xs text-gray-500">To: {swap.depositStationName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div>Out: {swap.issuedBatteryId ? `#${swap.issuedBatteryId}` : '-'}</div>
                      <div className="text-xs text-gray-500">In: {swap.returnedBatteryId ? `#${swap.returnedBatteryId}` : '-'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(swap.startTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(swap.endTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {swap.duration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(swap.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditSwap(swap)}
                        className="p-1 rounded-full text-gray-400 hover:text-primary-600 hover:bg-primary-50"
                        disabled={updating}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteSwap(swap.id)}
                        className="p-1 rounded-full text-gray-400 hover:text-error-600 hover:bg-error-50"
                        disabled={deleting}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredAndSortedSwaps.length === 0 && !swapsLoading && (
            <div className="text-center py-8 text-gray-500">
              No swap activities found matching your search criteria
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{filteredAndSortedSwaps.length}</span> of <span className="font-medium">{processedSwaps.length}</span> swap activities
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

      {/* Swap Modal */}
      <SwapModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSwap(null);
        }}
        onSubmit={editingSwap ? handleUpdateSwap : handleCreateSwap}
        swap={editingSwap}
        isLoading={creating || updating}
        users={users}
        stations={stations}
        batteries={batteries}
      />
    </div>
  );
};

export default SwapActivityPage;