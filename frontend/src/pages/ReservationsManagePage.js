import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Modal, Form, Row, Col, Alert } from 'react-bootstrap';
import { getReservations, getReservation, updateReservation, deleteReservation } from '../utils/api';
import Layout from '../components/Layout';

const ReservationsManagePage = () => {
  const [reservations, setReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({
    status: '',
    table: '',
    date: '',
    time: '',
    people: '',
    specialRequests: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Lấy danh sách đặt bàn
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const response = await getReservations();
        setReservations(response.data);
        setLoading(false);
      } catch (error) {
        setError('Không thể tải danh sách đặt bàn');
        setLoading(false);
      }
    };
    
    fetchReservations();
  }, []);

  // Mở modal chi tiết đặt bàn
  const handleShowDetailsModal = async (reservationId) => {
    try {
      const response = await getReservation(reservationId);
      setSelectedReservation(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      setError('Không thể tải chi tiết đặt bàn');
    }
  };

  // Mở modal cập nhật đặt bàn
  const handleShowUpdateModal = (reservation) => {
    setSelectedReservation(reservation);
    setUpdateFormData({
      status: reservation.status,
      table: reservation.table || '',
      date: new Date(reservation.date).toISOString().split('T')[0],
      time: reservation.time,
      people: reservation.people,
      specialRequests: reservation.specialRequests || ''
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

  // Cập nhật đặt bàn
  const handleUpdateReservation = async () => {
    try {
      const response = await updateReservation(selectedReservation._id, updateFormData);
      
      // Cập nhật danh sách đặt bàn
      setReservations(reservations.map(reservation => 
        reservation._id === selectedReservation._id ? { ...reservation, ...response.data } : reservation
      ));
      
      setShowUpdateModal(false);
      setSuccess('Đã cập nhật đặt bàn thành công');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Không thể cập nhật đặt bàn');
    }
  };

  // Hủy đặt bàn
  const handleCancelReservation = async (reservationId) => {
    if (window.confirm('Bạn có chắc muốn hủy đặt bàn này?')) {
      try {
        await updateReservation(reservationId, { status: 'cancelled' });
        
        // Cập nhật danh sách đặt bàn
        setReservations(reservations.map(reservation => 
          reservation._id === reservationId ? { ...reservation, status: 'cancelled' } : reservation
        ));
        
        setSuccess('Đã hủy đặt bàn thành công');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Không thể hủy đặt bàn');
      }
    }
  };

  // Xóa đặt bàn
  const handleDeleteReservation = async (reservationId) => {
    if (window.confirm('Bạn có chắc muốn xóa đặt bàn này? Thao tác này không thể hoàn tác.')) {
      try {
        await deleteReservation(reservationId);
        
        // Cập nhật danh sách đặt bàn
        setReservations(reservations.filter(reservation => reservation._id !== reservationId));
        
        setSuccess('Đã xóa đặt bàn thành công');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Không thể xóa đặt bàn');
      }
    }
  };

  // Định dạng ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Hiển thị trạng thái đặt bàn với màu sắc tương ứng
  const renderStatus = (status) => {
    let badgeColor = 'secondary';
    
    switch (status) {
      case 'pending':
        badgeColor = 'warning';
        break;
      case 'confirmed':
        badgeColor = 'success';
        break;
      case 'cancelled':
        badgeColor = 'danger';
        break;
      case 'completed':
        badgeColor = 'info';
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
        return 'Chờ xác nhận';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'cancelled':
        return 'Đã hủy';
      case 'completed':
        return 'Hoàn thành';
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
      <h1 className="mb-4">Quản Lý Đặt Bàn</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th>Khách hàng</th>
            <th>Số điện thoại</th>
            <th>Ngày</th>
            <th>Giờ</th>
            <th>Số người</th>
            <th>Bàn</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {reservations.length > 0 ? (
            reservations.map(reservation => (
              <tr key={reservation._id}>
                <td>{reservation.customerName}</td>
                <td>{reservation.phone}</td>
                <td>{formatDate(reservation.date)}</td>
                <td>{reservation.time}</td>
                <td>{reservation.people}</td>
                <td>{reservation.table || 'Chưa xác định'}</td>
                <td>{renderStatus(reservation.status)}</td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleShowDetailsModal(reservation._id)}
                  >
                    Chi tiết
                  </Button>
                  {reservation.status !== 'completed' && reservation.status !== 'cancelled' && (
                    <>
                      <Button
                        variant="outline-success"
                        size="sm"
                        className="me-2"
                        onClick={() => handleShowUpdateModal(reservation)}
                      >
                        Cập nhật
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleCancelReservation(reservation._id)}
                      >
                        Hủy
                      </Button>
                    </>
                  )}
                  {reservation.status === 'cancelled' && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteReservation(reservation._id)}
                    >
                      Xóa
                    </Button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">Không có đặt bàn nào</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal chi tiết đặt bàn */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Chi Tiết Đặt Bàn</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReservation && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <p><strong>Khách hàng:</strong> {selectedReservation.customerName}</p>
                  <p><strong>Số điện thoại:</strong> {selectedReservation.phone}</p>
                  <p><strong>Email:</strong> {selectedReservation.email || 'Không có'}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Ngày:</strong> {formatDate(selectedReservation.date)}</p>
                  <p><strong>Giờ:</strong> {selectedReservation.time}</p>
                  <p><strong>Số người:</strong> {selectedReservation.people}</p>
                </Col>
              </Row>
              
              <p><strong>Trạng thái:</strong> {renderStatus(selectedReservation.status)}</p>
              <p><strong>Bàn đã đặt:</strong> {selectedReservation.table || 'Chưa xác định'}</p>
              
              {selectedReservation.specialRequests && (
                <div className="mt-3">
                  <h5>Yêu cầu đặc biệt</h5>
                  <p>{selectedReservation.specialRequests}</p>
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

      {/* Modal cập nhật đặt bàn */}
      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cập Nhật Đặt Bàn</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Trạng thái</Form.Label>
              <Form.Select
                name="status"
                value={updateFormData.status}
                onChange={handleUpdateChange}
              >
                <option value="pending">Chờ xác nhận</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="cancelled">Đã hủy</option>
                <option value="completed">Hoàn thành</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Bàn</Form.Label>
              <Form.Control
                type="text"
                name="table"
                value={updateFormData.table}
                onChange={handleUpdateChange}
                placeholder="Ví dụ: Bàn 1, Bàn VIP, vv."
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={updateFormData.date}
                    onChange={handleUpdateChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giờ</Form.Label>
                  <Form.Control
                    type="text"
                    name="time"
                    value={updateFormData.time}
                    onChange={handleUpdateChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Số người</Form.Label>
              <Form.Control
                type="number"
                name="people"
                value={updateFormData.people}
                onChange={handleUpdateChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Yêu cầu đặc biệt</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="specialRequests"
                value={updateFormData.specialRequests}
                onChange={handleUpdateChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleUpdateReservation}>
            Cập Nhật
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
};

export default ReservationsManagePage; 