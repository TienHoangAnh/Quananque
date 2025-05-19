import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { getCustomerOrders } from '../utils/api';
import { CustomerContext } from '../context/CustomerContext';
import CustomerLayout from '../components/CustomerLayout';

const CustomerDashboardPage = () => {
  const { customerInfo, loading: authLoading } = useContext(CustomerContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        console.log('Đang lấy danh sách đơn hàng cho khách hàng:', customerInfo?.name);
        const customerToken = localStorage.getItem('customerToken');
        if (!customerToken) {
          setError('Phiên làm việc hết hạn, vui lòng đăng nhập lại');
          setLoading(false);
          return;
        }
        const res = await getCustomerOrders();
        setOrders(res.data);
        setLoading(false);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          setError('Phiên làm việc hết hạn, vui lòng đăng nhập lại');
        } else {
          setError('Không thể tải danh sách đơn hàng');
        }
        setLoading(false);
      }
    };
    if (!authLoading && !customerInfo) {
      navigate('/customer/login');
      return;
    }
    if (customerInfo) {
      fetchOrders();
    }
  }, [customerInfo, authLoading, navigate]);

  // Rendering helpers
  const renderOrderStatus = (status) => {
    let variant = 'secondary';
    let text = 'Không xác định';
    
    switch (status) {
      case 'pending':
        variant = 'warning';
        text = 'Đang xử lý';
        break;
      case 'preparing':
        variant = 'info';
        text = 'Đang chuẩn bị';
        break;
      case 'ready':
        variant = 'primary';
        text = 'Sẵn sàng phục vụ';
        break;
      case 'served':
        variant = 'success';
        text = 'Đã phục vụ';
        break;
      case 'completed':
        variant = 'success';
        text = 'Hoàn thành';
        break;
      case 'cancelled':
        variant = 'danger';
        text = 'Đã hủy';
        break;
      default:
        variant = 'secondary';
        text = status;
    }
    
    return <Badge bg={variant}>{text}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (authLoading) {
    return <div>Đang tải...</div>;
  }

  return (
    <CustomerLayout>
      <Container className="py-5">
        <h1 className="mb-4">Trang Quản Lý Của Tôi</h1>
        
        {customerInfo && (
          <Row className="mb-5">
            <Col md={4}>
              <Card className="shadow-sm mb-4">
                <Card.Body>
                  <Card.Title>Thông Tin Cá Nhân</Card.Title>
                  <hr />
                  <p><strong>Họ tên:</strong> {customerInfo.name}</p>
                  <p><strong>Email:</strong> {customerInfo.email}</p>
                  <p><strong>Số điện thoại:</strong> {customerInfo.phone}</p>
                  {customerInfo.address && (
                    <p><strong>Địa chỉ:</strong> {customerInfo.address}</p>
                  )}
                  <Button 
                    as={Link} 
                    to="/customer/profile" 
                    variant="outline-primary"
                    size="sm"
                  >
                    Cập nhật thông tin
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={8}>
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title>Thao Tác Nhanh</Card.Title>
                  <hr />
                  <Row className="gy-3">
                    <Col xs={6} md={3}>
                      <Button 
                        as={Link} 
                        to="/menu-public" 
                        variant="outline-primary" 
                        className="w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3"
                      >
                        <i className="bi bi-list-ul mb-2" style={{ fontSize: '1.5rem' }}></i>
                        Xem thực đơn
                      </Button>
                    </Col>
                    <Col xs={6} md={3}>
                      <Button 
                        as={Link} 
                        to="/order" 
                        variant="outline-success" 
                        className="w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3"
                      >
                        <i className="bi bi-cart-plus mb-2" style={{ fontSize: '1.5rem' }}></i>
                        Đặt món
                      </Button>
                    </Col>
                    <Col xs={6} md={3}>
                      <Button 
                        as={Link} 
                        to="/reservation" 
                        variant="outline-info" 
                        className="w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3"
                      >
                        <i className="bi bi-calendar-event mb-2" style={{ fontSize: '1.5rem' }}></i>
                        Đặt bàn
                      </Button>
                    </Col>
                    <Col xs={6} md={3}>
                      <Button 
                        as={Link}
                        to="/order-history"
                        variant="outline-warning" 
                        className="w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3"
                      >
                        <i className="bi bi-clock-history mb-2" style={{ fontSize: '1.5rem' }}></i>
                        Lịch sử đơn hàng
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        <div id="order-history">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="m-0">Đơn Hàng Gần Đây</h2>
            <Button
              as={Link}
              to="/order-history"
              variant="outline-primary"
            >
              Xem tất cả đơn hàng
            </Button>
          </div>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          {loading ? (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
              <p className="mt-2">Đang tải dữ liệu...</p>
            </div>
          ) : orders.length === 0 ? (
            <Alert variant="info">
              Bạn chưa có đơn hàng nào. <Link to="/order">Đặt món ngay</Link>!
            </Alert>
          ) : (
            <>
              {/* Lấy 3 đơn hàng mới nhất */}
              {orders.slice(0, 3).map(order => (
                <Card className="shadow-sm mb-4" key={order._id}>
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>Mã đơn: {order.orderCode}</strong>
                    </div>
                    <div>
                      {renderOrderStatus(order.status)}
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <Row className="mb-3">
                      <Col md={6}>
                        <p className="mb-2"><strong>Ngày đặt:</strong> {formatDate(order.createdAt)}</p>
                        <p className="mb-2"><strong>Tên khách hàng:</strong> {order.customerName}</p>
                      </Col>
                      <Col md={6}>
                        <p className="mb-2"><strong>Số điện thoại:</strong> {order.phone}</p>
                        <p className="mb-2"><strong>Tổng tiền:</strong> {formatCurrency(order.totalAmount)}</p>
                      </Col>
                    </Row>
                    
                    <Table responsive striped bordered className="mb-0">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Món ăn</th>
                          <th className="text-center">Số lượng</th>
                          <th className="text-end">Đơn giá</th>
                          <th className="text-end">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{item.name}</td>
                            <td className="text-center">{item.quantity}</td>
                            <td className="text-end">{formatCurrency(item.price)}</td>
                            <td className="text-end">{formatCurrency(item.price * item.quantity)}</td>
                          </tr>
                        ))}
                        <tr>
                          <td colSpan="4" className="text-end"><strong>Tổng cộng:</strong></td>
                          <td className="text-end"><strong>{formatCurrency(order.totalAmount)}</strong></td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                  <Card.Footer className="bg-white">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => navigate(`/order/track/${order.orderCode}`)}
                    >
                      Theo dõi đơn hàng
                    </Button>
                  </Card.Footer>
                </Card>
              ))}
              
              {orders.length > 3 && (
                <div className="text-center mt-3 mb-5">
                  <p>Hiển thị 3/{orders.length} đơn hàng gần nhất</p>
                  <Button
                    as={Link}
                    to="/order-history"
                    variant="primary"
                  >
                    Xem tất cả đơn hàng
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </Container>
    </CustomerLayout>
  );
};

export default CustomerDashboardPage; 