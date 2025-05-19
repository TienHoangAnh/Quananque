import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Row, Col, Alert } from 'react-bootstrap';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../utils/api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    costPrice: '',
    category: 'Món chính',
    image: 'default-food.jpg',
    available: true,
    popular: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { isAdmin } = useAuth();

  // Danh sách danh mục món ăn
  const categories = ['Khai vị', 'Món chính', 'Tráng miệng', 'Đồ uống', 'Đặc sản'];

  // Lấy danh sách món ăn
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const response = await getMenuItems();
        setMenuItems(response.data);
        setLoading(false);
      } catch (error) {
        setError('Không thể tải danh sách món ăn');
        setLoading(false);
      }
    };
    
    fetchMenuItems();
  }, []);

  // Mở modal thêm/sửa món ăn
  const handleShowModal = (item = null) => {
    if (item) {
      setCurrentItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price,
        costPrice: item.costPrice,
        category: item.category,
        image: item.image,
        available: item.available,
        popular: item.popular
      });
    } else {
      setCurrentItem(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        costPrice: '',
        category: 'Món chính',
        image: 'default-food.jpg',
        available: true,
        popular: false
      });
    }
    setShowModal(true);
  };

  // Đóng modal
  const handleCloseModal = () => {
    setShowModal(false);
    setError('');
  };

  // Xử lý thay đổi trong form
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
    });
  };

  // Lưu món ăn
  const handleSaveItem = async () => {
    try {
      // Kiểm tra dữ liệu
      if (!formData.name || !formData.description || !formData.price || !formData.costPrice) {
        setError('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      if (currentItem) {
        // Cập nhật món ăn
        await updateMenuItem(currentItem._id, formData);
        setMenuItems(
          menuItems.map(item => (item._id === currentItem._id ? { ...item, ...formData } : item))
        );
        setSuccess('Đã cập nhật món ăn thành công');
      } else {
        // Thêm món ăn mới
        const response = await createMenuItem(formData);
        setMenuItems([...menuItems, response.data]);
        setSuccess('Đã thêm món ăn mới thành công');
      }
      
      setShowModal(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Đã xảy ra lỗi khi lưu món ăn');
    }
  };

  // Xóa món ăn
  const handleDeleteItem = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa món ăn này?')) {
      try {
        await deleteMenuItem(id);
        setMenuItems(menuItems.filter(item => item._id !== id));
        setSuccess('Đã xóa món ăn thành công');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Không thể xóa món ăn');
      }
    }
  };

  // Định dạng tiền tệ
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Quản Lý Thực Đơn</h1>
        {isAdmin() && (
          <Button variant="primary" onClick={() => handleShowModal()}>
            Thêm Món Mới
          </Button>
        )}
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th>Tên món</th>
            <th>Danh mục</th>
            <th>Giá bán</th>
            <th>Giá vốn</th>
            <th>Lợi nhuận</th>
            <th>Trạng thái</th>
            <th>Phổ biến</th>
            {isAdmin() && <th>Thao tác</th>}
          </tr>
        </thead>
        <tbody>
          {menuItems.map(item => (
            <tr key={item._id}>
              <td>{item.name}</td>
              <td>{item.category}</td>
              <td>{formatCurrency(item.price)}</td>
              <td>{formatCurrency(item.costPrice)}</td>
              <td>{formatCurrency(item.price - item.costPrice)}</td>
              <td>
                <span className={`badge ${item.available ? 'bg-success' : 'bg-danger'}`}>
                  {item.available ? 'Có sẵn' : 'Hết hàng'}
                </span>
              </td>
              <td>
                <span className={`badge ${item.popular ? 'bg-primary' : 'bg-secondary'}`}>
                  {item.popular ? 'Phổ biến' : 'Thường'}
                </span>
              </td>
              {isAdmin() && (
                <td>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="me-2"
                    onClick={() => handleShowModal(item)}
                  >
                    Sửa
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => handleDeleteItem(item._id)}
                  >
                    Xóa
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal thêm/sửa món ăn */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{currentItem ? 'Sửa Món Ăn' : 'Thêm Món Ăn Mới'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tên món <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mô tả <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá bán <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá vốn <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="costPrice"
                    value={formData.costPrice}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Danh mục</Form.Label>
              <Form.Select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ảnh</Form.Label>
              <Form.Control
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Còn hàng"
                name="available"
                checked={formData.available}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Món phổ biến"
                name="popular"
                checked={formData.popular}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSaveItem}>
            {currentItem ? 'Lưu Thay Đổi' : 'Thêm Món'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
};

export default MenuPage; 