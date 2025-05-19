import React, { useState, useContext } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { loginCustomer } from '../utils/api';
import PublicLayout from '../components/PublicLayout';
import { CustomerContext } from '../context/CustomerContext';

const CustomerLoginPage = () => {
  const { setCustomerInfo } = useContext(CustomerContext);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginCustomer({ email, password });
      
      // Lưu token vào localStorage
      localStorage.setItem('customerToken', res.data.token);
      
      // Lưu thông tin customer vào localStorage và Context
      const customerData = {
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        phone: res.data.phone,
        address: res.data.address || ''
      };
      
      localStorage.setItem('customerInfo', JSON.stringify(customerData));
      
      // Cập nhật Context
      setCustomerInfo(customerData);
      
      // Debug
      console.log('Đăng nhập thành công:', customerData);
      console.log('Chuyển hướng đến /customer/dashboard');
      
      // Chuyển hướng ngay lập tức
      setTimeout(() => {
        navigate('/customer/dashboard');
      }, 100);
    } catch (error) {
      console.error('Chi tiết lỗi đăng nhập:', error);
      setError(
        error.response?.data?.message || 
        'Đăng nhập không thành công. Vui lòng kiểm tra lại email và mật khẩu!'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <Container className="py-5">
        <div className="text-center mb-4">
          <h1>Đăng Nhập Khách Hàng</h1>
          <p className="lead">Đăng nhập để theo dõi đơn hàng và đặt bàn dễ dàng hơn</p>
        </div>

        <Card className="shadow mx-auto" style={{ maxWidth: '500px' }}>
          <Card.Body className="p-4">
            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Mật khẩu</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={password}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <div className="d-grid">
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                </Button>
              </div>
            </Form>

            <div className="text-center mt-3">
              <p>
                Chưa có tài khoản?{' '}
                <Link to="/customer/register">Đăng ký ngay</Link>
              </p>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </PublicLayout>
  );
};

export default CustomerLoginPage; 