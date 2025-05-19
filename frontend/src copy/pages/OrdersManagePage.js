import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Modal, Form, Row, Col, Alert } from 'react-bootstrap';
import { getOrders, getOrder, updateOrder, deleteOrder } from '../utils/api';
import Layout from '../components/Layout';

const OrdersManagePage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({
    status: '',
    paymentStatus: '',
    paymentMethod: '',
    note: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Lấy danh sách đơn hàng
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getOrders();
        setOrders(response.data);
        setLoading(false);
      } catch (error) {
        setError('Không thể tải danh sách đơn hàng');
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);

  // Mở modal chi tiết đơn hàng
  const handleShowDetailsModal = async (orderId) => {
    try {
      const response = await getOrder(orderId);
      setSelectedOrder(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      setError('Không thể tải chi tiết đơn hàng');
    }
  };

  // Mở modal cập nhật đơn hàng
  const handleShowUpdateModal = (order) => {
    setSelectedOrder(order);
    setUpdateFormData({
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      note: order.note || ''
    });
    setShowUpdateModal(true);
  };

  // Xử lý thay đổi trong form cập nhật
  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData({
      ...updateFormData,
      [name]: value
    });
  };

  // Cập nhật đơn hàng
  const handleUpdateOrder = async () => {
    try {
      const response = await updateOrder(selectedOrder._id, updateFormData);
      
      // Cập nhật danh sách đơn hàng
      setOrders(orders.map(order => 
        order._id === selectedOrder._id ? { ...order, ...response.data } : order
      ));
      
      setShowUpdateModal(false);
      setSuccess('Đã cập nhật đơn hàng thành công');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Không thể cập nhật đơn hàng');
    }
  };

  // Hủy đơn hàng
  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
      try {
        await deleteOrder(orderId);
        
        // Cập nhật danh sách đơn hàng
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, status: 'cancelled' } : order
        ));
        
        setSuccess('Đã hủy đơn hàng thành công');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Không thể hủy đơn hàng');
      }
    }
  };

  // Định dạng tiền tệ
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Định dạng ngày giờ
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN')}`;
  };

  // Hiển thị trạng thái đơn hàng với màu sắc tương ứng
  const renderStatus = (status) => {
    let badgeColor = 'secondary';
    
    switch (status) {
      case 'pending':
        badgeColor = 'warning';
        break;
      case 'preparing':
        badgeColor = 'info';
        break;
      case 'ready':
        badgeColor = 'primary';
        break;
      case 'served':
        badgeColor = 'success';
        break;
      case 'completed':
        badgeColor = 'success';
        break;
      case 'cancelled':
        badgeColor = 'danger';
        break;
      default:
        badgeColor = 'secondary';
    }
    
    return <Badge bg={badgeColor}>{getStatusText(status)}</Badge>;
  };

  // Chuyển đổi trạng thái sang tiếng Việt
  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý';
      case 'preparing':
        return 'Đang chuẩn bị';
      case 'ready':
        return 'Sẵn sàng phục vụ';
      case 'served':
        return 'Đã phục vụ';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      case 'unpaid':
        return 'Chưa thanh toán';
      case 'paid':
        return 'Đã thanh toán';
      case 'cash':
        return 'Tiền mặt';
      case 'bank_transfer':
        return 'Chuyển khoản';
      case 'other':
        return 'Khác';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center p-5">Đang tải...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="mb-4">Quản Lý Đơn Hàng</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Khách hàng</th>
            <th>Số điện thoại</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Thanh toán</th>
            <th>Ngày tạo</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map(order => (
              <tr key={order._id}>
                <td>{order.orderCode}</td>
                <td>{order.customerName}</td>
                <td>{order.phone}</td>
                <td>{formatCurrency(order.totalAmount)}</td>
                <td>{renderStatus(order.status)}</td>
                <td>{renderStatus(order.paymentStatus)}</td>
                <td>{formatDateTime(order.createdAt)}</td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleShowDetailsModal(order._id)}
                  >
                    Chi tiết
                  </Button>
                  {order.status !== 'completed' && order.status !== 'cancelled' && (
                    <>
                      <Button
                        variant="outline-success"
                        size="sm"
                        className="me-2"
                        onClick={() => handleShowUpdateModal(order)}
                      >
                        Cập nhật
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleCancelOrder(order._id)}
                      >
                        Hủy
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">Không có đơn hàng nào</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal chi tiết đơn hàng */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chi Tiết Đơn Hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <p><strong>Mã đơn hàng:</strong> {selectedOrder.orderCode}</p>
                  <p><strong>Khách hàng:</strong> {selectedOrder.customerName}</p>
                  <p><strong>Số điện thoại:</strong> {selectedOrder.phone}</p>
                  <p><strong>Email:</strong> {selectedOrder.email || 'Không có'}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Trạng thái:</strong> {renderStatus(selectedOrder.status)}</p>
                  <p><strong>Thanh toán:</strong> {renderStatus(selectedOrder.paymentStatus)}</p>
                  <p><strong>Phương thức:</strong> {renderStatus(selectedOrder.paymentMethod)}</p>
                </Col>
              </Row>
              
              <h5>Danh sách món</h5>
              <Table responsive striped bordered>
                <thead>
                  <tr>
                    <th>Tên món</th>
                    <th>Giá</th>
                    <th>Số lượng</th>
                    <th>Thành tiền</th>
                    <th>Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{formatCurrency(item.price)}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.price * item.quantity)}</td>
                      <td>{item.note || 'Không có'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="text-end"><strong>Tổng cộng:</strong></td>
                    <td colSpan="2"><strong>{formatCurrency(selectedOrder.totalAmount)}</strong></td>
                  </tr>
                </tfoot>
              </Table>
              
              {selectedOrder.note && (
                <div className="mt-3">
                  <h5>Ghi chú đơn hàng</h5>
                  <p>{selectedOrder.note}</p>
                </div>
              )}
              
              {selectedOrder.reservationId && (
                <div className="mt-3">
                  <h5>Thông tin đặt bàn</h5>
                  <p><strong>Mã đặt bàn:</strong> {selectedOrder.reservationId._id}</p>
                  <p><strong>Ngày đặt:</strong> {formatDateTime(selectedOrder.reservationId.date)}</p>
                  <p><strong>Giờ đặt:</strong> {selectedOrder.reservationId.time}</p>
                  <p><strong>Số người:</strong> {selectedOrder.reservationId.people}</p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal cập nhật đơn hàng */}
      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cập Nhật Đơn Hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Trạng thái đơn hàng</Form.Label>
              <Form.Select
                name="status"
                value={updateFormData.status}
                onChange={handleUpdateChange}
              >
                <option value="pending">Chờ xử lý</option>
                <option value="preparing">Đang chuẩn bị</option>
                <option value="ready">Sẵn sàng phục vụ</option>
                <option value="served">Đã phục vụ</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Trạng thái thanh toán</Form.Label>
              <Form.Select
                name="paymentStatus"
                value={updateFormData.paymentStatus}
                onChange={handleUpdateChange}
              >
                <option value="unpaid">Chưa thanh toán</option>
                <option value="paid">Đã thanh toán</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Phương thức thanh toán</Form.Label>
              <Form.Select
                name="paymentMethod"
                value={updateFormData.paymentMethod}
                onChange={handleUpdateChange}
              >
                <option value="cash">Tiền mặt</option>
                <option value="bank_transfer">Chuyển khoản</option>
                <option value="other">Khác</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Ghi chú</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="note"
                value={updateFormData.note}
                onChange={handleUpdateChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleUpdateOrder}>
            Cập Nhật
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
};

export default OrdersManagePage; 