import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { createReservation } from '../utils/api';
import PublicLayout from '../components/PublicLayout';
import './ReservationPage.css';

const ReservationPage = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    date: new Date(),
    time: '18:00',
    people: 2,
    specialRequests: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      date
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    // Kiểm tra dữ liệu
    if (!formData.customerName || !formData.phone || !formData.time) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      setLoading(false);
      return;
    }

    // Kiểm tra số điện thoại hợp lệ
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Số điện thoại không hợp lệ (10 số)');
      setLoading(false);
      return;
    }

    try {
      await createReservation(formData);
      setSuccess(true);
      setFormData({
        customerName: '',
        phone: '',
        email: '',
        date: new Date(),
        time: '18:00',
        people: 2,
        specialRequests: ''
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Đã xảy ra lỗi khi đặt bàn');
    } finally {
      setLoading(false);
    }
  };

  // Danh sách các khung giờ
  const timeSlots = [
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
  ];

  return (
    <PublicLayout>
      <Row>
        <Col md={7}>
          <h1 className="mb-4">Đặt Bàn Trước</h1>
          <p className="lead mb-4">
            Đặt bàn trước để đảm bảo bạn có chỗ ngồi thoải mái nhất và không phải chờ đợi khi đến quán.
          </p>
          <Card>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && (
                <Alert variant="success">
                  Đặt bàn thành công! Chúng tôi sẽ liên hệ để xác nhận trong thời gian sớm nhất.
                </Alert>
              )}
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Họ tên <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Số điện thoại <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Row className="reservation-datetime-row">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Ngày <span className="text-danger">*</span></Form.Label>
                      <DatePicker
                        selected={formData.date}
                        onChange={handleDateChange}
                        minDate={new Date()}
                        dateFormat="dd/MM/yyyy"
                        className="form-control date-picker-input"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Giờ <span className="text-danger">*</span></Form.Label>
                      <Form.Select
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        className="time-select-input"
                        required
                      >
                        {timeSlots.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Số người <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="people"
                    value={formData.people}
                    onChange={handleChange}
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>{num} người</option>
                    ))}
                    <option value="15">10-15 người</option>
                    <option value="20">15-20 người</option>
                    <option value="30">Trên 20 người</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Yêu cầu đặc biệt</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    placeholder="Vui lòng chia sẻ yêu cầu đặc biệt của bạn (nếu có)"
                  />
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100" 
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : 'Đặt Bàn Ngay'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col md={5}>
          <Card className="mt-4 mt-md-0">
            <Card.Header className="bg-success text-white">
              <h4 className="mb-0">Thông tin liên hệ</h4>
            </Card.Header>
            <Card.Body>
              <p><strong>Địa chỉ:</strong> 123 Đường Làng, Huyện Quê, Tỉnh Xa</p>
              <p><strong>Điện thoại:</strong> 0987 654 321</p>
              <p><strong>Email:</strong> info@quananque.com</p>
              <hr />
              <h5>Giờ mở cửa</h5>
              <p>Thứ 2 - Thứ 6: 10:00 - 22:00</p>
              <p>Thứ 7 - Chủ nhật: 08:00 - 23:00</p>
              <hr />
              <div className="alert alert-info">
                <strong>Lưu ý:</strong> Đặt bàn trước ít nhất 2 giờ. Đối với nhóm trên 10 người, vui lòng đặt trước 1 ngày.
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </PublicLayout>
  );
};

export default ReservationPage; 