import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CustomerProvider } from './context/CustomerContext';
import Login from './components/Login';
import OrderList from './components/OrderList';
import PrivateRoute from './components/PrivateRoute';

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
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/menu-public" element={<MenuPublicPage />} />
            <Route path="/reservation" element={<ReservationPage />} />
            <Route path="/order" element={<OrderPage />} />
            <Route path="/track-order" element={<OrderTrackingPage />} />
            <Route path="/order/track/:orderCode" element={<OrderTrackingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/order-history" element={<CustomerOrdersPage />} />

            {/* Customer routes */}
            <Route path="/customer/login" element={<CustomerLoginPage />} />
            <Route path="/customer/register" element={<CustomerRegisterPage />} />
            <Route path="/customer/dashboard" element={<CustomerDashboardPage />} />
            <Route path="/customer/profile" element={<CustomerProfilePage />} />
            <Route path="/customer/orders" element={<CustomerOrdersPage />} />

            {/* Protected routes */}
            <Route
              path="/orders"
              element={
                <PrivateRoute>
                  <OrderList />
                </PrivateRoute>
              }
            />
            
            {/* Protected staff routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/reservations" element={<ReservationsManagePage />} />
              <Route path="/orders" element={<OrdersManagePage />} />
              <Route path="/inventory" element={<InventoryPage />} />
            </Route>

            {/* Admin only routes */}
            <Route element={<ProtectedRoute requireAdmin={true} />}>
              <Route path="/register-staff" element={<RegisterStaffPage />} />
            </Route>

            {/* Redirect root to orders page if authenticated */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Navigate to="/orders" replace />
                </PrivateRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </CustomerProvider>
    </AuthProvider>
  );
}

export default App;
