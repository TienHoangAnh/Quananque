import React from 'react';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <Navbar bg="primary" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/dashboard">Quán Ăn Quê - Quản Lý</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/dashboard">Tổng quan</Nav.Link>
              <Nav.Link as={Link} to="/menu">Thực đơn</Nav.Link>
              <Nav.Link as={Link} to="/reservations">Đặt bàn</Nav.Link>
              <Nav.Link as={Link} to="/orders">Đơn hàng</Nav.Link>
              <Nav.Link as={Link} to="/inventory">Kho hàng</Nav.Link>
            </Nav>
            {user && (
              <Nav>
                <NavDropdown title={user.name || 'Người dùng'} id="basic-nav-dropdown">
                  {isAdmin() && (
                    <NavDropdown.Item as={Link} to="/register-staff">Thêm nhân viên</NavDropdown.Item>
                  )}
                  <NavDropdown.Item onClick={handleLogout}>Đăng xuất</NavDropdown.Item>
                </NavDropdown>
              </Nav>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="mt-4 mb-5">
        {children}
      </Container>
    </div>
  );
};

export default Layout; 