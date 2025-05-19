import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Badge } from 'react-bootstrap';
import { getMenuItems } from '../utils/api';
import PublicLayout from '../components/PublicLayout';

const MenuPublicPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      <Container>
        <h1 className="mb-4">Thực Đơn</h1>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <Row className="mb-4">
          <Col md={8}>
            <Form.Group>
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
        
        {categories.map(category => {
          // Chỉ hiển thị danh mục nếu được chọn hoặc hiển thị tất cả
          if (selectedCategory !== 'all' && selectedCategory !== category) {
            return null;
          }
          
          const categoryItems = filteredItems.filter(item => item.category === category);
          
          // Bỏ qua danh mục nếu không có món ăn nào
          if (categoryItems.length === 0) {
            return null;
          }
          
          return (
            <div key={category} className="mb-5">
              <h2 className="border-bottom pb-2 mb-4">{category}</h2>
              <Row>
                {categoryItems.map(item => (
                  <Col md={6} lg={4} key={item._id} className="mb-4">
                    <Card className="h-100">
                      <Card.Body>
                        <Card.Title>{item.name}</Card.Title>
                        <Card.Text>{item.description}</Card.Text>
                        <div className="d-flex justify-content-between align-items-center">
                          <h5 className="text-primary mb-0">{formatCurrency(item.price)}</h5>
                          {item.popular && (
                            <Badge bg="danger">Món phổ biến</Badge>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          );
        })}
        
        {filteredItems.length === 0 && (
          <div className="alert alert-info">Không tìm thấy món ăn phù hợp với tiêu chí tìm kiếm.</div>
        )}
      </Container>
    </PublicLayout>
  );
};

export default MenuPublicPage; 