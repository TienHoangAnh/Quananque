import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Container, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { login, user, error: authError } = useAuth();
  const navigate = useNavigate();

  // Nếu đã đăng nhập, chuyển đến trang dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !pin) {
      setError('Vui lòng nhập số điện thoại và mã PIN');
      return;
    }

    const success = await login(phone, pin);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <Row className="w-100">
        <Col md={6} className="mx-auto">
          <Card>
            <Card.Header className="bg-primary text-white text-center">
              <h3>Đăng Nhập Quản Lý</h3>
            </Card.Header>
            <Card.Body>
              {(error || authError) && <Alert variant="danger">{error || authError}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formPhone">
                  <Form.Label>Số điện thoại</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Nhập số điện thoại" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPin">
                  <Form.Label>Mã PIN</Form.Label>
                  <Form.Control 
                    type="password" 
                    placeholder="Nhập mã PIN" 
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                  Đăng Nhập
                </Button>
              </Form>
            </Card.Body>
            <Card.Footer className="text-center">
              <small>Chỉ nhân viên và quản lý mới có thể đăng nhập vào hệ thống</small>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage; 