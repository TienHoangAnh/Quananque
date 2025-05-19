import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert, Card } from 'react-bootstrap';
import { registerStaff } from '../utils/api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const RegisterStaffPage = () => {
  const { currentUser, isAdmin } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pin: '',
    confirmPin: '',
    role: 'staff',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect nếu không phải admin
  if (currentUser && !isAdmin()) {
    return <Navigate to="/dashboard" />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    // Kiểm tra số điện thoại
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam hợp lệ.');
      return false;
    }

    // Kiểm tra mã PIN
    if (formData.pin.length !== 4 || !/^\d+$/.test(formData.pin)) {
      setError('Mã PIN phải là 4 chữ số.');
      return false;
    }

    // Kiểm tra xác nhận mã PIN
    if (formData.pin !== formData.confirmPin) {
      setError('Mã PIN và xác nhận mã PIN không khớp.');
      return false;
    }

    // Kiểm tra tên
    if (formData.name.trim().length < 2) {
      setError('Tên phải có ít nhất 2 ký tự.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      // Loại bỏ confirmPin trước khi gửi
      const { confirmPin, ...registerData } = formData;
      
      await registerStaff(registerData);
      
      setSuccess('Đăng ký nhân viên mới thành công!');
      // Reset form
      setFormData({
        name: '',
        phone: '',
        pin: '',
        confirmPin: '',
        role: 'staff',
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow">
              <Card.Header as="h4" className="text-center bg-primary text-white">
                Đăng Ký Nhân Viên Mới
              </Card.Header>
              <Card.Body className="p-4">
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Họ và tên</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Nhập họ và tên nhân viên"
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Số điện thoại</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Nhập số điện thoại (VD: 0912345678)"
                      required
                    />
                    <Form.Text className="text-muted">
                      Nhân viên sẽ sử dụng số điện thoại này để đăng nhập
                    </Form.Text>
                  </Form.Group>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Mã PIN (4 chữ số)</Form.Label>
                        <Form.Control
                          type="password"
                          name="pin"
                          value={formData.pin}
                          onChange={handleChange}
                          placeholder="Nhập mã PIN"
                          maxLength={4}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Xác nhận mã PIN</Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPin"
                          value={formData.confirmPin}
                          onChange={handleChange}
                          placeholder="Xác nhận mã PIN"
                          maxLength={4}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Vai trò</Form.Label>
                    <Form.Select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                    >
                      <option value="staff">Nhân viên</option>
                      <option value="admin">Quản lý</option>
                    </Form.Select>
                  </Form.Group>
                  
                  <div className="d-grid">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      size="lg"
                      disabled={loading}
                    >
                      {loading ? 'Đang xử lý...' : 'Đăng Ký Nhân Viên'}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default RegisterStaffPage; 