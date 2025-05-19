import React, { useContext } from 'react';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { CustomerContext } from '../context/CustomerContext';

const CustomerLayout = ({ children }) => {
  const { customerInfo, logout } = useContext(CustomerContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">Quán Ăn Quê</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Trang chủ</Nav.Link>
              <Nav.Link as={Link} to="/menu-public">Thực đơn</Nav.Link>
              <Nav.Link as={Link} to="/reservation">Đặt bàn</Nav.Link>
              <Nav.Link as={Link} to="/order">Đặt món</Nav.Link>
              <Nav.Link as={Link} to="/track-order">Tra cứu đơn hàng</Nav.Link>
              <Nav.Link as={Link} to="/customer/orders">Lịch sử đơn hàng</Nav.Link>
            </Nav>
            <Nav>
              {customerInfo ? (
                <NavDropdown title={customerInfo.name} id="customer-dropdown">
                  <NavDropdown.Item as={Link} to="/customer/dashboard">Trang quản lý</NavDropdown.Item>
                  <NavDropdown.Item 
                    as={Link} 
                    to="/customer/dashboard#order-history"
                    onClick={(e) => {
                      if (window.location.pathname === '/customer/dashboard') {
                        e.preventDefault();
                        document.getElementById('order-history')?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    Lịch sử đơn hàng
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/customer/profile">Thông tin cá nhân</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>Đăng xuất</NavDropdown.Item>
                </NavDropdown>
              ) : (
                <>
                  <Nav.Link as={Link} to="/customer/login">Đăng nhập</Nav.Link>
                  <Nav.Link as={Link} to="/customer/register">Đăng ký</Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="mt-4 mb-5">
        {children}
      </Container>
      <footer className="bg-dark text-white py-4 mt-5">
        <Container>
          <div className="row">
            <div className="col-md-4">
              <h5>Quán Ăn Quê</h5>
              <p>Nơi mang lại hương vị đậm đà của đồng quê Việt Nam.</p>
            </div>
            <div className="col-md-4">
              <h5>Liên hệ</h5>
              <p>Địa chỉ: 123 Đường Làng, Huyện Quê, Tỉnh Xa</p>
              <p>Điện thoại: 0987 654 321</p>
              <p>Email: info@quananque.com</p>
            </div>
            <div className="col-md-4">
              <h5>Giờ mở cửa</h5>
              <p>Thứ 2 - Thứ 6: 10:00 - 22:00</p>
              <p>Thứ 7 - Chủ nhật: 08:00 - 23:00</p>
            </div>
          </div>
          <div className="text-center mt-3">
            <p>&copy; {new Date().getFullYear()} Quán Ăn Quê. All rights reserved.</p>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default CustomerLayout; 