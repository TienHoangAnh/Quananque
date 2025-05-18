import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CustomerProvider } from './context/CustomerContext';

// Public Pages
import HomePage from './pages/HomePage';
import MenuPublicPage from './pages/MenuPublicPage';
import ReservationPage from './pages/ReservationPage';
import OrderPage from './pages/OrderPage';
import OrderTrackingPage from './pages/OrderTrackingPage';

// Customer Pages
import CustomerLoginPage from './pages/CustomerLoginPage';
import CustomerRegisterPage from './pages/CustomerRegisterPage';
import CustomerDashboardPage from './pages/CustomerDashboardPage';
import CustomerProfilePage from './pages/CustomerProfilePage';
import CustomerOrdersPage from './pages/CustomerOrdersPage';

// Admin Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MenuPage from './pages/MenuPage';
import ReservationsManagePage from './pages/ReservationsManagePage';
import OrdersManagePage from './pages/OrdersManagePage';
import InventoryPage from './pages/InventoryPage';
import RegisterStaffPage from './pages/RegisterStaffPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CustomerProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/menu-public" element={<MenuPublicPage />} />
            <Route path="/reservation" element={<ReservationPage />} />
            <Route path="/order" element={<OrderPage />} />
            <Route path="/track-order" element={<OrderTrackingPage />} />
            <Route path="/order/track/:orderCode" element={<OrderTrackingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/order-history" element={<CustomerOrdersPage />} />

            {/* Customer Routes */}
            <Route path="/customer/login" element={<CustomerLoginPage />} />
            <Route path="/customer/register" element={<CustomerRegisterPage />} />
            <Route path="/customer/dashboard" element={<CustomerDashboardPage />} />
            <Route path="/customer/profile" element={<CustomerProfilePage />} />
            <Route path="/customer/orders" element={<CustomerOrdersPage />} />

            {/* Protected Staff Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/reservations" element={<ReservationsManagePage />} />
              <Route path="/orders" element={<OrdersManagePage />} />
              <Route path="/inventory" element={<InventoryPage />} />
            </Route>

            {/* Admin Only Routes */}
            <Route element={<ProtectedRoute requireAdmin={true} />}>
              <Route path="/register-staff" element={<RegisterStaffPage />} />
            </Route>
          </Routes>
        </Router>
      </CustomerProvider>
    </AuthProvider>
  );
}

export default App;
