import React, { useState, useEffect, useContext } from 'react';
import { Container, Table, Badge, Row, Col, Card, Alert, Button } from 'react-bootstrap';
import { getCustomerOrders } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import CustomerLayout from '../components/CustomerLayout';
import { CustomerContext } from '../context/CustomerContext';

const CustomerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { customerInfo, loading: authLoading } = useContext(CustomerContext);

  useEffect(() => {
    // Kiểm tra customer đã đăng nhập chưa
    if (!authLoading && !customerInfo) {
      navigate('/customer/login');
      return;
    }
    
    // Lấy lịch sử đơn hàng nếu đã đăng nhập
    if (customerInfo) {
      const fetchOrders = async () => {
        try {
          setLoading(true);
          console.log('Đang lấy danh sách đơn hàng cho khách hàng:', customerInfo.name);
          
          // Kiểm tra xem có customerToken không
          const customerToken = localStorage.getItem('customerToken');
          if (!customerToken) {
            console.error('Không tìm thấy customerToken trong localStorage');
            setError('Phiên làm việc hết hạn, vui lòng đăng nhập lại');
            setLoading(false);
            return;
          }
          
          console.log('Gửi yêu cầu API getCustomerOrders với customerToken');
          const response = await getCustomerOrders();
          console.log('Kết quả API đơn hàng:', response.data);
          
          setOrders(response.data);
          setError('');
        } catch (error) {
          console.error('Lỗi lấy lịch sử đơn hàng:', error);
          
          // Kiểm tra lỗi xác thực
          if (error.response && error.response.status === 401) {
            setError('Phiên làm việc hết hạn, vui lòng đăng nhập lại');
          } else {
            setError('Không thể tải lịch sử đơn hàng. Vui lòng thử lại sau.');
          }
        } finally {
          setLoading(false);
        }
      };

      fetchOrders();
    }
  }, [navigate, customerInfo, authLoading]);

  // Định dạng ngày tháng
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  // Định dạng tiền tệ
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Hiển thị trạng thái đơn hàng với màu sắc
  const renderStatus = (status) => {
    let variant;
    let text;
    
    switch (status) {
      case 'pending':
        variant = 'warning';
        text = 'Đang chờ';
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
        text = 'Không xác định';
    }
    
    return <Badge bg={variant}>{text}</Badge>;
  };

  // Hiển thị loading indicator khi đang kiểm tra authentication
  if (authLoading) {
    return (
      <CustomerLayout>
        <Container className="my-4 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="mt-2">Đang kiểm tra đăng nhập...</p>
        </Container>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <Container className="my-4">
        <h1 className="mb-4">Lịch sử đơn hàng của bạn</h1>
        
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
            Bạn chưa có đơn hàng nào. <a href="/order">Đặt món ngay!</a>
          </Alert>
        ) : (
          <>
            <p className="mb-4">Tổng số đơn hàng: <strong>{orders.length}</strong></p>
            
            <Row>
              {orders.map(order => (
                <Col md={12} key={order._id} className="mb-4">
                  <Card className="shadow-sm">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Mã đơn: {order.orderCode}</strong>
                      </div>
                      <div>
                        {renderStatus(order.status)}
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
                </Col>
              ))}
            </Row>
          </>
        )}
      </Container>
    </CustomerLayout>
  );
};

export default CustomerOrdersPage;