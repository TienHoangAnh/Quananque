import React, { useState, useContext } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { registerCustomer } from '../utils/api';
import PublicLayout from '../components/PublicLayout';
import { CustomerContext } from '../context/CustomerContext';

const CustomerRegisterPage = () => {
  const { setCustomerInfo } = useContext(CustomerContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const { name, email, phone, password, confirmPassword, address } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Kiểm tra mật khẩu
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    // Kiểm tra số điện thoại
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      setError('Số điện thoại không hợp lệ (10 số)');
      return;
    }

    setLoading(true);
    try {
      const res = await registerCustomer({
        name,
        email,
        phone,
        password,
        address
      });
      
      // Lưu token vào localStorage
      localStorage.setItem('customerToken', res.data.token);
      
      // Lưu thông tin customer vào localStorage và Context
      const customerData = {
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        phone: res.data.phone,
        address: address || ''
      };
      
      localStorage.setItem('customerInfo', JSON.stringify(customerData));
      
      // Cập nhật Context
      setCustomerInfo(customerData);
      
      // Debug
      console.log('Đăng ký thành công:', customerData);
      
      setSuccess(true);
      setTimeout(() => {
        console.log('Chuyển hướng đến /customer/dashboard');
        navigate('/customer/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Chi tiết lỗi đăng ký:', error);
      setError(
        error.response?.data?.message || 
        'Không thể đăng ký tài khoản. Vui lòng thử lại!'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <Container className="py-5">
        <div className="text-center mb-4">
          <h1>Đăng Ký Tài Khoản</h1>
          <p className="lead">Tạo tài khoản để đặt món và theo dõi đơn hàng dễ dàng hơn</p>
        </div>

        <Card className="shadow mx-auto" style={{ maxWidth: '600px' }}>
          <Card.Body className="p-4">
            {error && <Alert variant="danger">{error}</Alert>}
            {success && (
              <Alert variant="success">
                Đăng ký thành công! Đang chuyển hướng...
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Họ tên</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  required
                />
                <Form.Text className="text-muted">
                  Email của bạn sẽ được sử dụng để đăng nhập
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Số điện thoại</Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={phone}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Địa chỉ</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="address"
                  value={address}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mật khẩu</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Xác nhận mật khẩu</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </Form.Group>

              <div className="d-grid">
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : 'Đăng ký'}
                </Button>
              </div>
            </Form>

            <div className="text-center mt-3">
              <p>
                Đã có tài khoản?{' '}
                <Link to="/customer/login">Đăng nhập</Link>
              </p>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </PublicLayout>
  );
};

export default CustomerRegisterPage; 