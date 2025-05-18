import React, { useState, useEffect, useContext } from 'react';
import { Card, Row, Col, Form, Button, ListGroup, Badge, Alert, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getMenuItems, createOrder } from '../utils/api';
import { CustomerContext } from '../context/CustomerContext';
import PublicLayout from '../components/PublicLayout';

const OrderPage = () => {
  const { customerInfo } = useContext(CustomerContext);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [customerData, setCustomerData] = useState({
    customerName: '',
    phone: '',
    email: '',
    note: '',
    customerId: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  // Lấy danh sách món ăn
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await getMenuItems();
        // Chỉ hiển thị món ăn đang có sẵn
        const availableItems = response.data.filter(item => item.available);
        setMenuItems(availableItems);
        
        // Trích xuất danh sách danh mục
        const uniqueCategories = [...new Set(availableItems.map(item => item.category))];
        setCategories(uniqueCategories);
        
        setFilteredItems(availableItems);
        setLoading(false);
      } catch (error) {
        setError('Không thể tải danh sách món ăn');
        setLoading(false);
      }
    };
    
    fetchMenuItems();
  }, []);

  // Điền thông tin khách hàng nếu đã đăng nhập
  useEffect(() => {
    if (customerInfo) {
      setCustomerData({
        customerName: customerInfo.name || '',
        phone: customerInfo.phone || '',
        email: customerInfo.email || '',
        note: '',
        customerId: customerInfo._id
      });
    }
  }, [customerInfo]);

  // Lọc món ăn theo danh mục và tìm kiếm
  useEffect(() => {
    let filtered = menuItems;
    
    // Lọc theo danh mục
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredItems(filtered);
  }, [selectedCategory, searchTerm, menuItems]);

  // Thêm món vào giỏ hàng
  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem._id === item._id);
    
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem._id === item._id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 } 
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1, note: '' }]);
    }
  };

  // Cập nhật số lượng món trong giỏ hàng
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item._id !== id));
    } else {
      setCart(cart.map(item => 
        item._id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  // Cập nhật ghi chú cho món
  const updateNote = (id, note) => {
    setCart(cart.map(item => 
      item._id === id ? { ...item, note } : item
    ));
  };

  // Tính tổng tiền
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Xử lý thay đổi thông tin khách hàng
  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomerData({
      ...customerData,
      [name]: value
    });
  };

  // Gửi đơn hàng
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSuccessOrder(null);
    setSubmitting(true);

    // Kiểm tra dữ liệu
    if (!customerData.customerName || !customerData.phone) {
      setError('Vui lòng nhập họ tên và số điện thoại');
      setSubmitting(false);
      return;
    }

    if (cart.length === 0) {
      setError('Vui lòng thêm ít nhất một món vào giỏ hàng');
      setSubmitting(false);
      return;
    }

    // Kiểm tra số điện thoại hợp lệ
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(customerData.phone)) {
      setError('Số điện thoại không hợp lệ (10 số)');
      setSubmitting(false);
      return;
    }

    // Chuẩn bị dữ liệu đơn hàng
    const orderData = {
      customerName: customerData.customerName,
      phone: customerData.phone,
      email: customerData.email,
      note: customerData.note,
      items: cart.map(item => ({
        menuItem: item._id,
        quantity: item.quantity,
        note: item.note
      })),
      totalAmount: calculateTotal()
    };

    // Thêm ID khách hàng nếu đã đăng nhập
    if (customerData.customerId) {
      orderData.customerId = customerData.customerId;
    }

    try {
      const response = await createOrder(orderData);
      setSuccess(true);
      setSuccessOrder(response.data);
      setCart([]);
      
      // Chỉ reset form nếu không đăng nhập
      if (!customerInfo) {
        setCustomerData({
          customerName: '',
          phone: '',
          email: '',
          note: '',
          customerId: ''
        });
      } else {
        setCustomerData({
          ...customerData,
          note: ''
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Đã xảy ra lỗi khi đặt món');
    } finally {
      setSubmitting(false);
    }
  };

  // Định dạng tiền tệ
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="text-center p-5">Đang tải thực đơn...</div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <h1 className="mb-4">Đặt Món Trước</h1>
      <p className="lead mb-4">
        Đặt món trước để tiết kiệm thời gian chờ đợi, đảm bảo món ăn của bạn sẽ được chuẩn bị khi bạn đến.
      </p>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {success && (
        <Alert variant="success">
          <Alert.Heading>Đặt món thành công!</Alert.Heading>
          <p>
            Đơn hàng của bạn đã được tiếp nhận. Nhà hàng sẽ liên hệ để xác nhận trong thời gian sớm nhất.
          </p>
          {successOrder && (
            <>
              <hr />
              <p className="mb-0">
                <strong>Mã đơn hàng của bạn:</strong> <span className="fw-bold">{successOrder.orderCode}</span>
              </p>
              <p className="mb-0">
                <strong>Trạng thái:</strong> <Badge bg="warning">{successOrder.statusText}</Badge>
              </p>
              <p>
                Bạn có thể <Link to={`/track-order`}>tra cứu trạng thái đơn hàng</Link> bằng mã đơn hàng này.
              </p>
              {!customerInfo && (
                <p>
                  <Alert variant="info">
                    <i className="bi bi-info-circle-fill me-2"></i>
                    Tạo <Link to="/customer/register">tài khoản</Link> để dễ dàng theo dõi đơn hàng và đặt món sau này!
                  </Alert>
                </p>
              )}
            </>
          )}
        </Alert>
      )}
      
      <Row>
        <Col lg={8}>
          {/* Tìm kiếm và lọc */}
          <Card className="mb-4">
            <Card.Body>
              <Row>
                <Col md={8}>
                  <Form.Group className="mb-3 mb-md-0">
                    <Form.Control
                      type="text"
                      placeholder="Tìm kiếm món ăn..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">Tất cả danh mục</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Danh sách món ăn */}
          <Row>
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <Col md={6} key={item._id} className="mb-4">
                  <Card className="h-100">
                    <Card.Body>
                      <Card.Title>{item.name}</Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">{item.category}</Card.Subtitle>
                      <Card.Text>{item.description}</Card.Text>
                      <div className="d-flex justify-content-between align-items-center">
                        <strong>{formatCurrency(item.price)}</strong>
                        <Button 
                          variant="outline-primary" 
                          onClick={() => addToCart(item)}
                        >
                          + Thêm vào giỏ
                        </Button>
                      </div>
                      {item.popular && (
                        <Badge bg="danger" className="mt-2">Món phổ biến</Badge>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <Col>
                <Alert variant="info">Không tìm thấy món ăn nào</Alert>
              </Col>
            )}
          </Row>
        </Col>
        
        <Col lg={4}>
          {/* Giỏ hàng */}
          <Card className="mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Giỏ hàng của bạn</h5>
            </Card.Header>
            <Card.Body>
              {cart.length === 0 ? (
                <p className="text-center">Giỏ hàng trống</p>
              ) : (
                <ListGroup variant="flush">
                  {cart.map(item => (
                    <ListGroup.Item key={item._id}>
                      <div className="d-flex justify-content-between">
                        <div>
                          <h6>{item.name}</h6>
                          <small className="text-muted">{formatCurrency(item.price)}</small>
                        </div>
                        <div className="text-end">
                          <div className="d-flex align-items-center mb-2">
                            <Button 
                              size="sm" 
                              variant="outline-secondary"
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            >
                              -
                            </Button>
                            <span className="mx-2">{item.quantity}</span>
                            <Button 
                              size="sm" 
                              variant="outline-secondary"
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                          <small>{formatCurrency(item.price * item.quantity)}</small>
                        </div>
                      </div>
                      <Form.Control
                        type="text"
                        placeholder="Ghi chú đặc biệt"
                        value={item.note || ''}
                        onChange={(e) => updateNote(item._id, e.target.value)}
                        className="mt-2"
                        size="sm"
                      />
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
              
              <div className="mt-3">
                <div className="d-flex justify-content-between">
                  <strong>Tổng cộng:</strong>
                  <strong>{formatCurrency(calculateTotal())}</strong>
                </div>
              </div>
            </Card.Body>
          </Card>
          
          {/* Thông tin khách hàng */}
          <Card>
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">Thông tin khách hàng</h5>
            </Card.Header>
            <Card.Body>
              {!customerInfo && (
                <Alert variant="info" className="mb-3">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-info-circle-fill me-2"></i>
                    <div>
                      Đã có tài khoản?{' '}
                      <Link to="/customer/login">Đăng nhập</Link> để đặt món nhanh hơn
                    </div>
                  </div>
                </Alert>
              )}
            
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Họ tên <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="customerName"
                    value={customerData.customerName}
                    onChange={handleCustomerChange}
                    required
                    readOnly={!!customerInfo}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Số điện thoại <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={customerData.phone}
                    onChange={handleCustomerChange}
                    required
                    readOnly={!!customerInfo}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={customerData.email}
                    onChange={handleCustomerChange}
                    readOnly={!!customerInfo}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Ghi chú đơn hàng</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="note"
                    value={customerData.note}
                    onChange={handleCustomerChange}
                    placeholder="Thời gian lấy món, yêu cầu đặc biệt, v.v."
                  />
                </Form.Group>
                
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100"
                  disabled={submitting || cart.length === 0}
                >
                  {submitting ? 'Đang xử lý...' : 'Gửi đơn hàng'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </PublicLayout>
  );
};

export default OrderPage;