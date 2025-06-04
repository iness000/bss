import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginPage from '../pages/LoginPage';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../components/layouts/DashboardLayout';
import DashboardPage from '../pages/DashboardPage';
import UserManagementPage from '../pages/UserManagementPage';
import StationManagementPage from '../pages/StationManagementPage';
import BatteryManagementPage from '../pages/BatteryManagementPage';
import SwapActivityPage from '../pages/SwapActivityPage';

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
      } />
      
      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="stations" element={<StationManagementPage />} />
        <Route path="batteries" element={<BatteryManagementPage />} />
        <Route path="swaps" element={<SwapActivityPage />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;