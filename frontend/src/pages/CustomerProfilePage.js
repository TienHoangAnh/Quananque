import React, { useState, useEffect, useContext } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getCustomerProfile, updateCustomerProfile } from '../utils/api';
import { CustomerContext } from '../context/CustomerContext';
import CustomerLayout from '../components/CustomerLayout';

const CustomerProfilePage = () => {
  const { customerInfo, setCustomerInfo, loading: authLoading } = useContext(CustomerContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getCustomerProfile();
        const data = res.data;
        setFormData(prevState => ({
          ...prevState,
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || ''
        }));
        setCustomerInfo(data);
      } catch (error) {
        setError('Không thể tải thông tin hồ sơ');
      }
    };
    if (!authLoading && !customerInfo) {
      navigate('/customer/login');
      return;
    }
    if (customerInfo) {
      setFormData(prevState => ({
        ...prevState,
        name: customerInfo.name || '',
        email: customerInfo.email || '',
        phone: customerInfo.phone || '',
        address: customerInfo.address || ''
      }));
    } else {
      fetchProfile();
    }
  }, [customerInfo, authLoading, navigate, setCustomerInfo]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    // Kiểm tra mật khẩu nếu có nhập
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    // Kiểm tra số điện thoại
    if (formData.phone) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(formData.phone)) {
        setError('Số điện thoại không hợp lệ (10 số)');
        return;
      }
    }

    setLoading(true);
    
    try {
      // Chỉ gửi các trường cần cập nhật
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address
      };
      
      // Chỉ thêm mật khẩu nếu có nhập
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      const res = await updateCustomerProfile(updateData);
      
      // Cập nhật thông tin vào context
      setCustomerInfo(res.data);
      
      // Xóa mật khẩu khỏi form
      setFormData(prevState => ({
        ...prevState,
        password: '',
        confirmPassword: ''
      }));
      
      setSuccess(true);
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'Không thể cập nhật thông tin. Vui lòng thử lại!'
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div>Đang tải...</div>;
  }

  return (
    <CustomerLayout>
      <Container className="py-5">
        <h1 className="mb-4">Thông Tin Cá Nhân</h1>
        
        <Row>
          <Col md={8} className="mx-auto">
            <Card className="shadow-sm">
              <Card.Body className="p-4">
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">Cập nhật thông tin thành công!</Alert>}
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Họ tên</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
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
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Địa chỉ</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  
                  <hr className="my-4" />
                  <h5>Đổi mật khẩu</h5>
                  <p className="text-muted small">Chỉ điền nếu bạn muốn thay đổi mật khẩu</p>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Mật khẩu mới</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      minLength={6}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Xác nhận mật khẩu mới</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      minLength={6}
                    />
                  </Form.Group>
                  
                  <div className="d-grid">
                    <Button 
                      variant="primary" 
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Đang xử lý...' : 'Cập nhật thông tin'}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </CustomerLayout>
  );
};

export default CustomerProfilePage; 