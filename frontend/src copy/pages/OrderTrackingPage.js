import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col, Table, Badge, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { trackOrder } from '../utils/api';
import PublicLayout from '../components/PublicLayout';

const OrderTrackingPage = () => {
  const { orderCode: urlOrderCode } = useParams();
  const [orderCode, setOrderCode] = useState(urlOrderCode || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Tự động tìm kiếm nếu có mã đơn từ URL
  useEffect(() => {
    if (urlOrderCode) {
      handleTrackOrder(urlOrderCode);
    }
  }, [urlOrderCode]);

  const handleTrackOrder = async (code) => {
    if (!code || !code.trim()) {
      setError('Vui lòng nhập mã đơn hàng');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const response = await trackOrder(code.trim());
      setOrder(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Không tìm thấy đơn hàng với mã này. Vui lòng kiểm tra lại mã đơn.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleTrackOrder(orderCode);
  };

  // Hiển thị trạng thái đơn hàng với màu sắc
  const renderStatus = (status, statusText) => {
    let variant = 'secondary';
    
    switch (status) {
      case 'pending':
        variant = 'warning';
        break;
      case 'preparing':
        variant = 'info';
        break;
      case 'ready':
        variant = 'primary';
        break;
      case 'served':
      case 'completed':
        variant = 'success';
        break;
      case 'cancelled':
        variant = 'danger';
        break;
      default:
        variant = 'secondary';
    }
    
    return <Badge bg={variant}>{statusText}</Badge>;
  };

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

  return (
    <PublicLayout>
      <Container className="my-5">
        <h1 className="mb-4 text-center">Tra cứu đơn hàng</h1>
        <p className="text-center mb-5">
          Nhập mã đơn hàng của bạn để kiểm tra tình trạng đơn hàng
        </p>

        <Row className="justify-content-center mb-5">
          <Col md={8} lg={6}>
            <Card className="shadow-sm">
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Mã đơn hàng</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nhập mã đơn hàng (VD: 20250518-123456)"
                      value={orderCode}
                      onChange={(e) => setOrderCode(e.target.value)}
                      required
                    />
                    <Form.Text className="text-muted">
                      Mã đơn hàng được cung cấp khi bạn đặt hàng thành công
                    </Form.Text>
                  </Form.Group>
                  <div className="d-grid">
                    <Button 
                      variant="primary" 
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Đang tìm kiếm...' : 'Kiểm tra'}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {error && (
          <Row className="justify-content-center">
            <Col md={10}>
              <Alert variant="danger">{error}</Alert>
            </Col>
          </Row>
        )}

        {order && (
          <Row className="justify-content-center">
            <Col md={10}>
              <Card className="shadow-sm mb-4">
                <Card.Header as="h5" className="bg-light">
                  Thông tin đơn hàng <span className="text-muted">#{order.orderCode}</span>
                </Card.Header>
                <Card.Body>
                  <Row className="mb-4">
                    <Col md={6}>
                      <p><strong>Khách hàng:</strong> {order.customerName}</p>
                      <p><strong>Số điện thoại:</strong> {order.phone}</p>
                    </Col>
                    <Col md={6}>
                      <p>
                        <strong>Trạng thái:</strong>{' '}
                        {renderStatus(order.status, order.statusText)}
                      </p>
                      <p>
                        <strong>Thời gian đặt:</strong>{' '}
                        {formatDate(order.createdAt)}
                      </p>
                    </Col>
                  </Row>

                  <h5 className="mb-3">Chi tiết món ăn</h5>
                  <Table responsive striped>
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
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="4" className="text-end"><strong>Tổng cộng:</strong></td>
                        <td className="text-end"><strong>{formatCurrency(order.totalAmount)}</strong></td>
                      </tr>
                    </tfoot>
                  </Table>

                  <div className="mt-4 text-muted">
                    <p className="mb-0"><small>* Trạng thái đơn hàng được cập nhật tự động. Vui lòng làm mới trang để xem trạng thái mới nhất.</small></p>
                    <p><small>* Với bất kỳ thắc mắc nào, vui lòng liên hệ với nhà hàng theo số điện thoại trên website.</small></p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </PublicLayout>
  );
};

export default OrderTrackingPage; 