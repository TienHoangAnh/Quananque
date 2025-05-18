import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Component bảo vệ route yêu cầu đăng nhập
const ProtectedRoute = ({ requireAdmin = false }) => {
  const { user, loading, isStaff, isAdmin } = useAuth();

  // Nếu đang tải, hiển thị loading
  if (loading) {
    return <div className="text-center p-5">Đang tải...</div>;
  }

  // Nếu không đăng nhập, chuyển đến trang đăng nhập
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Nếu yêu cầu admin nhưng người dùng không phải admin
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  // Nếu yêu cầu nhân viên nhưng người dùng không phải nhân viên hoặc admin
  if (!isStaff()) {
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập và có quyền phù hợp, hiển thị nội dung
  return <Outlet />;
};

export default ProtectedRoute; 