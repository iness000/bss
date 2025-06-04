import { useState, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { useStationManagement, Station as BackendStation } from '../hooks/useStation';
import { 
  MapPin, Plus, Filter, Edit, Trash2, ArrowUpDown, Search,
  CheckCircle, AlertTriangle, Clock, Battery
} from 'lucide-react';
import { cn } from '../utils/cn';
import { motion } from 'framer-motion';

// Station status type
type StationStatus = 'online' | 'offline' | 'maintenance';

// Define a type for the station data structure used within this component for display
interface DisplayStation {
  id: number;
  name: string;
  location: string;
  status: StationStatus;
  capacity: number;
  batteryCount: number;
  lastMaintenanceDate: string;
  createdAt: string;
  updatedAt: string;
}

// Modal component for creating/editing stations
interface StationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; location: string }) => void;
  station?: DisplayStation | null;
  isLoading?: boolean;
}

const StationModal = ({ isOpen, onClose, onSubmit, station, isLoading }: StationModalProps) => {
  const [formData, setFormData] = useState({
    name: station?.name || '',
    location: station?.location || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSubmit(formData);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', location: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {station ? 'Edit Station' : 'Add New Station'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Station Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter station name"
              required
            />
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter station location"
            />
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
              disabled={isLoading || !formData.name.trim()}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : station ? 'Update Station' : 'Create Station'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const StationManagementPage = () => {
  const { batteries } = useDashboard(); // Still using this for battery data
  const { 
    stations: fetchedStations, 
    loading: stationsLoading, 
    error: stationsError, 
    createStation,
    updateStation,
    deleteStation,
    creating,
    updating,
    deleting
  } = useStationManagement();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StationStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<DisplayStation | null>(null);

  // Process and transform backend stations to display format
  const processedStations = useMemo((): DisplayStation[] => {
    return fetchedStations.map((s: BackendStation) => {
      // Calculate battery count for this station
      const stationBatteries = batteries.filter(b => String(b.assignedStationId) === String(s.id));
      
      // Mock status and capacity for now (these would come from backend in real implementation)
      const mockStatus: StationStatus = Math.random() > 0.8 ? 'offline' : Math.random() > 0.9 ? 'maintenance' : 'online';
      const mockCapacity = 20; // Default capacity
      const mockLastMaintenance = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      return {
        id: s.id,
        name: s.name,
        location: s.location || 'Unknown Location',
        status: mockStatus,
        capacity: mockCapacity,
        batteryCount: stationBatteries.length,
        lastMaintenanceDate: mockLastMaintenance,
        createdAt: s.created_at,
        updatedAt: s.updated_at,
      };
    });
  }, [fetchedStations, batteries]);

  // Filter and sort stations
  const filteredAndSortedStations = useMemo(() => {
    return processedStations
      .filter(station => {
        const matchesSearch = 
          station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          station.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || station.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return sortDirection === 'asc'
              ? a.name.localeCompare(b.name)
              : b.name.localeCompare(a.name);
          case 'location':
            return sortDirection === 'asc'
              ? a.location.localeCompare(b.location)
              : b.location.localeCompare(a.location);
          case 'batteryCount':
            return sortDirection === 'asc'
              ? a.batteryCount - b.batteryCount
              : b.batteryCount - a.batteryCount;
          case 'capacity':
            return sortDirection === 'asc'
              ? a.capacity - b.capacity
              : b.capacity - a.capacity;
          default:
            return 0;
        }
      });
  }, [processedStations, searchTerm, statusFilter, sortBy, sortDirection]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const handleCreateStation = async (data: { name: string; location: string }) => {
    try {
      await createStation(data);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create station:', error);
    }
  };

  const handleUpdateStation = async (data: { name: string; location: string }) => {
    if (!editingStation) return;
    
    try {
      await updateStation(editingStation.id, data);
      setEditingStation(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to update station:', error);
    }
  };

  const handleDeleteStation = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this station? This action cannot be undone.')) {
      try {
        await deleteStation(id);
      } catch (error) {
        console.error('Failed to delete station:', error);
      }
    }
  };

  const handleEditStation = (station: DisplayStation) => {
    setEditingStation(station);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: StationStatus) => {
    switch (status) {
      case 'online':
        return (
          <div className="flex items-center space-x-1 px-2 py-1 bg-success-100 text-success-800 rounded-full text-xs font-medium">
            <CheckCircle size={12} />
            <span>Online</span>
          </div>
        );
      case 'offline':
        return (
          <div className="flex items-center space-x-1 px-2 py-1 bg-error-100 text-error-800 rounded-full text-xs font-medium">
            <AlertTriangle size={12} />
            <span>Offline</span>
          </div>
        );
      case 'maintenance':
        return (
          <div className="flex items-center space-x-1 px-2 py-1 bg-accent-100 text-accent-800 rounded-full text-xs font-medium">
            <Clock size={12} />
            <span>Maintenance</span>
          </div>
        );
    }
  };

  if (stationsLoading) {
    return <div className="p-6 text-center">Loading stations...</div>;
  }

  if (stationsError) {
    return <div className="p-6 text-center text-red-500">Error loading stations: {stationsError.message}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Station Management</h1>
          <p className="text-gray-600">Manage battery swap stations and monitor their status</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
        >
          <Plus size={16} className="mr-2" />
          Add New Station
        </button>
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
              <MapPin size={24} className="text-primary-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Total Stations</div>
              <div className="text-2xl font-semibold">{processedStations.length}</div>
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
            <div className="w-12 h-12 rounded-lg bg-success-100 flex items-center justify-center">
              <CheckCircle size={24} className="text-success-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Online</div>
              <div className="text-2xl font-semibold text-success-600">
                {processedStations.filter(s => s.status === 'online').length}
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
            <div className="w-12 h-12 rounded-lg bg-accent-100 flex items-center justify-center">
              <Battery size={24} className="text-accent-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Total Batteries</div>
              <div className="text-2xl font-semibold">
                {processedStations.reduce((sum, station) => sum + station.batteryCount, 0)}
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
            <div className="w-12 h-12 rounded-lg bg-error-100 flex items-center justify-center">
              <AlertTriangle size={24} className="text-error-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Offline</div>
              <div className="text-2xl font-semibold text-error-600">
                {processedStations.filter(s => s.status === 'offline').length}
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
                placeholder="Search stations by name or location..."
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
                  onChange={(e) => setStatusFilter(e.target.value as StationStatus | 'all')}
                >
                  <option value="all">All Statuses</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="maintenance">Maintenance</option>
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
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Station Name</span>
                    {sortBy === 'name' && (
                      <ArrowUpDown size={14} className={sortDirection === 'asc' ? 'transform rotate-180' : ''} />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('location')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Location</span>
                    {sortBy === 'location' && (
                      <ArrowUpDown size={14} className={sortDirection === 'asc' ? 'transform rotate-180' : ''} />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th 
                  className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('batteryCount')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Batteries</span>
                    {sortBy === 'batteryCount' && (
                      <ArrowUpDown size={14} className={sortDirection === 'asc' ? 'transform rotate-180' : ''} />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('capacity')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Capacity</span>
                    {sortBy === 'capacity' && (
                      <ArrowUpDown size={14} className={sortDirection === 'asc' ? 'transform rotate-180' : ''} />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Maintenance
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSortedStations.map((station) => (
                <tr key={station.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                        <MapPin size={16} />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{station.name}</div>
                        <div className="text-xs text-gray-500">ID: {station.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{station.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(station.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="mr-2 text-sm font-medium">{station.batteryCount}/{station.capacity}</div>
                      <div className="w-full max-w-[100px] bg-gray-200 rounded-full h-2">
                        <div 
                          className={cn(
                            "h-2 rounded-full",
                            station.batteryCount / station.capacity < 0.3 ? "bg-error-500" :
                            station.batteryCount / station.capacity < 0.7 ? "bg-accent-500" :
                            "bg-success-500"
                          )}
                          style={{ width: `${(station.batteryCount / station.capacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {station.capacity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {station.lastMaintenanceDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditStation(station)}
                        className="p-1 rounded-full text-gray-400 hover:text-primary-600 hover:bg-primary-50"
                        disabled={updating}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteStation(station.id)}
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
          
          {filteredAndSortedStations.length === 0 && !stationsLoading && (
            <div className="text-center py-8 text-gray-500">
              No stations found matching your search criteria
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{filteredAndSortedStations.length}</span> of <span className="font-medium">{processedStations.length}</span> stations
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

      {/* Station Modal */}
      <StationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingStation(null);
        }}
        onSubmit={editingStation ? handleUpdateStation : handleCreateStation}
        station={editingStation}
        isLoading={creating || updating}
      />
    </div>
  );
};

export default StationManagementPage;