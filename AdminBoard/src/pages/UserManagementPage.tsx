import { useState } from 'react';
import { UserPlus, Edit, Trash2, Eye, Search, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDeleteUser, useGetUsers, useCreateUser } from '../hooks/useUser';
import { User } from '../api/userApi';

const UserManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const { data: users = [] } = useGetUsers();
  const { mutate: deleteUser } = useDeleteUser();
  const { mutate: createUser, isPending: isCreating } = useCreateUser();

  // Form state for new user
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password_hash: '',
    phone: '',
    address: '',
    license_number: '',
    license_expiry: '',
    motocycle_model: '',
    motocycle_year: '',
    role: 'customer',
    rfid_code: ''
  });

  const [error, setError] = useState('');
  // Filter users based on search term and selected role
  const filteredUsers = users.filter((user: User) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = selectedRole === 'all' || user.role === selectedRole;

    return matchesSearch && matchesRole;
  });


  const handleAddUser = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setNewUser({
      name: '',
      email: '',
      password_hash: '',
      phone: '',
      address: '',
      license_number: '',
      license_expiry: '',
      motocycle_model: '',
      motocycle_year: '',
      role: 'customer',
      rfid_code: ''
    });
  };

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate RFID code
    if (!newUser.rfid_code) {
      setError('RFID code is required');
      return;
    }

    // Create user data with RFID code
    const userData = {
      name: newUser.name,
      email: newUser.email,
      password_hash: newUser.password_hash,
      phone: newUser.phone || undefined,
      address: newUser.address || undefined,
      license_number: newUser.license_number || undefined,
      license_expiry: newUser.license_expiry || undefined,
      motocycle_model: newUser.motocycle_model || undefined,
      motocycle_year: newUser.motocycle_year || undefined,
      role: newUser.role,
      is_active: true,
      rfid_code: newUser.rfid_code
    };

    // Create user first
    createUser(userData, {
      onSuccess: async (response: { user_id: number }) => {
        // If RFID code is provided, create RFID card
        if (newUser.rfid_code && response?.user_id) {
          const rfidData = {
            user_id: response.user_id,
            rfid_code: newUser.rfid_code,
            status: 'active'
          };
          
          // Create RFID card
          await fetch('http://localhost:5000/api/rfid_cards', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(rfidData),
          });
        }
        
        handleCloseModal();
      },
      onError: (error: Error) => {
        console.error('Error creating user:', error);
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage users and their access to the system</p>
        </div>

        <button
          onClick={handleAddUser}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
        >
          <UserPlus size={16} className="mr-2" />
          Add New User
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
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-4">
              <label htmlFor="role-filter" className="text-sm font-medium text-gray-700">
                Filter by Role:
              </label>
              <select
                id="role-filter"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="technician">Technician</option>
                <option value="customer">Customer</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user: User) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                        {user.name.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full capitalize"
                      style={{
                        backgroundColor:
                          user.role === 'admin' ? 'rgba(79, 70, 229, 0.1)' :
                            user.role === 'manager' ? 'rgba(245, 158, 11, 0.1)' :
                              user.role === 'technician' ? 'rgba(16, 185, 129, 0.1)' :
                                'rgba(59, 130, 246, 0.1)',
                        color:
                          user.role === 'admin' ? 'rgb(79, 70, 229)' :
                            user.role === 'manager' ? 'rgb(217, 119, 6)' :
                              user.role === 'technician' ? 'rgb(5, 150, 105)' :
                                'rgb(37, 99, 235)'
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.status === 'true'
                        ? 'bg-success-100 text-success-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button className="p-1 rounded-full text-gray-400 hover:text-primary-600 hover:bg-primary-50">
                        <Eye size={16} />
                      </button>
                      <button className="p-1 rounded-full text-gray-400 hover:text-primary-600 hover:bg-primary-50">
                        <Edit size={16} />
                      </button>
                      <button
                        className="p-1 rounded-full text-gray-400 hover:text-error-600 hover:bg-error-50"
                        onClick={() => deleteUser(user.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No users found matching your search criteria
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{filteredUsers.length}</span> of <span className="font-medium">{users.length}</span> users
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

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Add New User</h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
              {error && (
                <div className="mt-3 p-3 rounded-md bg-error-50 text-error-700 text-sm">
                  {error}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmitUser} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newUser.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password_hash"
                    value={newUser.password_hash}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={newUser.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={newUser.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Number
                  </label>
                  <input
                    type="text"
                    name="license_number"
                    value={newUser.license_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Expiry
                  </label>
                  <input
                    type="date"
                    name="license_expiry"
                    value={newUser.license_expiry}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motorcycle Model
                  </label>
                  <input
                    type="text"
                    name="motocycle_model"
                    value={newUser.motocycle_model}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motorcycle Year
                  </label>
                  <input
                    type="text"
                    name="motocycle_year"
                    value={newUser.motocycle_year}
                    onChange={handleInputChange}
                    maxLength={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    name="role"
                    value={newUser.role}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="technician">Technician</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RFID Card Code
                  </label>
                  <input
                    type="text"
                    name="rfid_code"
                    value={newUser.rfid_code}
                    onChange={handleInputChange}
                    placeholder="RFID card code"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
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
                  {isCreating ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;