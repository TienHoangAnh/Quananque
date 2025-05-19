import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Modal, Form, Row, Col, Alert, Nav, Tab } from 'react-bootstrap';
import { 
  getInventory, 
  createInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem,
  importInventory,
  exportInventory,
  getTransactions
} from '../utils/api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const InventoryPage = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [transactionFilter, setTransactionFilter] = useState('all');
  const [inventory, setInventory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [transactionType, setTransactionType] = useState('import');
  const [selectedItems, setSelectedItems] = useState([]);
  const [itemFormData, setItemFormData] = useState({
    name: '',
    unit: '',
    quantity: 0,
    costPerUnit: 0,
    supplier: '',
    category: 'Nguyên liệu',
    minimumStock: 5
  });
  const [transactionFormData, setTransactionFormData] = useState({
    supplier: '',
    note: '',
    orderId: '',
    items: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { isAdmin } = useAuth();

  // Danh sách danh mục hàng
  const categories = ['Nguyên liệu', 'Gia vị', 'Đồ uống', 'Khác'];

  // Lấy danh sách hàng tồn kho
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const response = await getInventory();
        setInventory(response.data);
        setLoading(false);
      } catch (error) {
        setError('Không thể tải danh sách hàng tồn kho');
        setLoading(false);
      }
    };
    
    fetchInventory();
  }, []);

  // Lấy danh sách giao dịch
  useEffect(() => {
    const fetchTransactions = async () => {
      if (activeTab === 'transactions') {
        try {
          setLoading(true);
          setError('');
          console.log('Đang tải danh sách giao dịch...');
          
          // Kiểm tra xem có token không
          const token = localStorage.getItem('token');
          if (!token) {
            console.error('Không có token đăng nhập');
            setError('Bạn cần đăng nhập để xem lịch sử giao dịch');
            setLoading(false);
            return;
          }
          
          const response = await getTransactions();
          console.log(`Đã tải ${response.data.length} giao dịch`, response.data);
          setTransactions(response.data);
        } catch (error) {
          console.error('Lỗi lấy giao dịch:', error);
          
          // Xử lý lỗi authentication cụ thể
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            setError('Bạn không có quyền truy cập. Vui lòng đăng nhập lại.');
          } else {
            setError('Không thể tải danh sách giao dịch. Lỗi: ' + (error.response?.data?.message || error.message));
          }
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchTransactions();
    
    // Thiết lập auto-refresh mỗi 30 giây khi đang ở tab giao dịch thay vì 10 giây
    let intervalId;
    if (activeTab === 'transactions') {
      intervalId = setInterval(fetchTransactions, 30000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeTab]);

  // Mở modal thêm/sửa hàng
  const handleShowItemModal = (item = null) => {
    if (item) {
      setCurrentItem(item);
      setItemFormData({
        name: item.name,
        unit: item.unit,
        quantity: item.quantity,
        costPerUnit: item.costPerUnit,
        supplier: item.supplier || '',
        category: item.category,
        minimumStock: item.minimumStock
      });
    } else {
      setCurrentItem(null);
      setItemFormData({
        name: '',
        unit: '',
        quantity: 0,
        costPerUnit: 0,
        supplier: '',
        category: 'Nguyên liệu',
        minimumStock: 5
      });
    }
    setShowItemModal(true);
  };

  // Mở modal nhập/xuất kho
  const handleShowTransactionModal = (type) => {
    setTransactionType(type);
    setSelectedItems([]);
    setError('');
    setTransactionFormData({
      supplier: '',
      note: '',
      orderId: '',
      items: []
    });
    setShowTransactionModal(true);
  };

  // Xử lý thay đổi trong form hàng
  const handleItemChange = (e) => {
    const { name, value, type } = e.target;
    setItemFormData({
      ...itemFormData,
      [name]: type === 'number' ? parseFloat(value) : value
    });
  };

  // Xử lý thay đổi trong form giao dịch
  const handleTransactionChange = (e) => {
    const { name, value } = e.target;
    setTransactionFormData({
      ...transactionFormData,
      [name]: value
    });
  };

  // Thêm hàng vào giao dịch
  const handleAddItemToTransaction = (inventoryId) => {
    // Kiểm tra xem đã chọn hàng này chưa
    if (selectedItems.some(item => item.inventoryId === inventoryId)) {
      return;
    }
    
    const inventoryItem = inventory.find(item => item._id === inventoryId);
    
    if (inventoryItem) {
      const newItem = {
        inventoryId: inventoryItem._id,
        name: inventoryItem.name,
        quantity: 1,
        unit: inventoryItem.unit,
        cost: inventoryItem.costPerUnit,
        maxQuantity: transactionType === 'export' ? inventoryItem.quantity : 9999
      };
      
      setSelectedItems([...selectedItems, newItem]);
    }
  };

  // Cập nhật số lượng hàng trong giao dịch
  const handleUpdateItemQuantity = (index, quantity) => {
    const updatedItems = [...selectedItems];
    updatedItems[index].quantity = Math.max(1, Math.min(updatedItems[index].maxQuantity, quantity));
    updatedItems[index].cost = updatedItems[index].quantity * inventory.find(item => item._id === updatedItems[index].inventoryId).costPerUnit;
    setSelectedItems(updatedItems);
  };

  // Xóa hàng khỏi giao dịch
  const handleRemoveItemFromTransaction = (index) => {
    const updatedItems = [...selectedItems];
    updatedItems.splice(index, 1);
    setSelectedItems(updatedItems);
  };

  // Tính tổng tiền giao dịch
  const calculateTransactionTotal = () => {
    return selectedItems.reduce((total, item) => total + item.cost, 0);
  };

  // Lưu hàng tồn kho
  const handleSaveItem = async () => {
    try {
      // Kiểm tra dữ liệu
      if (!itemFormData.name || !itemFormData.unit) {
        setError('Vui lòng điền đầy đủ thông tin cần thiết');
        return;
      }

      if (currentItem) {
        // Cập nhật hàng
        await updateInventoryItem(currentItem._id, itemFormData);
        setInventory(
          inventory.map(item => (item._id === currentItem._id ? { ...item, ...itemFormData } : item))
        );
        setSuccess('Đã cập nhật hàng tồn kho thành công');
      } else {
        // Thêm hàng mới
        const response = await createInventoryItem(itemFormData);
        setInventory([...inventory, response.data]);
        setSuccess('Đã thêm hàng tồn kho mới thành công');
      }
      
      setShowItemModal(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Đã xảy ra lỗi khi lưu hàng tồn kho');
    }
  };

  // Lưu giao dịch
  const handleSaveTransaction = async () => {
    try {
      if (selectedItems.length === 0) {
        setError('Vui lòng chọn ít nhất một mặt hàng');
        return;
      }

      if (transactionType === 'import' && !transactionFormData.supplier) {
        setError('Vui lòng nhập thông tin nhà cung cấp');
        return;
      }

      setLoading(true);
      setError('');

      // Chuẩn bị dữ liệu giao dịch
      const transactionData = {
        ...transactionFormData,
        items: selectedItems.map(item => ({
          item: item.inventoryId,
          quantity: item.quantity,
          cost: item.cost
        })),
        totalAmount: calculateTransactionTotal()
      };

      // Chuyển orderId thành null nếu là chuỗi rỗng để tránh lỗi khi chuyển thành ObjectId
      if (transactionData.orderId === '') {
        transactionData.orderId = null;
      }

      let response;
      if (transactionType === 'import') {
        // Nếu là nhập kho
        console.log('Đang thực hiện nhập kho với dữ liệu:', {
          itemCount: transactionData.items.length,
          totalAmount: transactionData.totalAmount,
          supplier: transactionData.supplier
        });
        response = await importInventory(transactionData);
        console.log('Nhập kho thành công:', response.data);
      } else {
        // Nếu là xuất kho và không có orderId, thì thêm note để ghi rõ
        if (!transactionData.orderId) {
          transactionData.note = `${transactionData.note ? transactionData.note + ' - ' : ''}Xuất kho không liên kết đơn hàng`;
        }
        console.log('Đang thực hiện xuất kho với dữ liệu:', {
          itemCount: transactionData.items.length,
          totalAmount: transactionData.totalAmount
        });
        response = await exportInventory(transactionData);
        console.log('Xuất kho thành công:', response.data);
      }

      // Cập nhật lại danh sách hàng tồn kho
      const inventoryResponse = await getInventory();
      setInventory(inventoryResponse.data);
      
      // Luôn cập nhật lại danh sách giao dịch sau khi thực hiện giao dịch thành công
      try {
        const transactionsResponse = await getTransactions();
        setTransactions(transactionsResponse.data);
        console.log('Đã cập nhật giao dịch:', transactionsResponse.data.length, 'giao dịch');
      } catch (err) {
        console.error('Lỗi cập nhật giao dịch sau khi lưu:', err);
      }
      
      setShowTransactionModal(false);
      setSuccess(`Đã ${transactionType === 'import' ? 'nhập' : 'xuất'} kho thành công`);
      
      // Chuyển sang tab lịch sử giao dịch sau khi thực hiện giao dịch thành công
      setTimeout(() => {
        setActiveTab('transactions');
      }, 500);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Lỗi giao dịch:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          `Đã xảy ra lỗi khi ${transactionType === 'import' ? 'nhập' : 'xuất'} kho`;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Xóa hàng tồn kho
  const handleDeleteItem = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa hàng này?')) {
      try {
        await deleteInventoryItem(id);
        setInventory(inventory.filter(item => item._id !== id));
        setSuccess('Đã xóa hàng tồn kho thành công');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Không thể xóa hàng tồn kho');
      }
    }
  };

  // Định dạng tiền tệ
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Định dạng ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Lỗi định dạng ngày:', error);
      return dateString;
    }
  };

  // Lọc giao dịch theo loại
  const getFilteredTransactions = () => {
    if (!transactions || transactions.length === 0) return [];
    if (transactionFilter === 'all') return transactions;
    return transactions.filter(transaction => transaction.type === transactionFilter);
  };

  if (loading && activeTab === 'inventory') {
    return (
      <Layout>
        <div className="text-center p-5">Đang tải...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="mb-4">Quản Lý Kho Hàng</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="inventory">Hàng Tồn Kho</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="transactions">Lịch Sử Giao Dịch</Nav.Link>
          </Nav.Item>
        </Nav>
        
        <Tab.Content>
          {/* Tab Hàng Tồn Kho */}
          <Tab.Pane eventKey="inventory">
            <div className="mb-3 d-flex justify-content-end">
              <Button 
                variant="success" 
                className="me-2"
                onClick={() => handleShowTransactionModal('import')}
              >
                Nhập Kho
              </Button>
              <Button 
                variant="warning" 
                className="me-2"
                onClick={() => handleShowTransactionModal('export')}
              >
                Xuất Kho
              </Button>
              {isAdmin() && (
                <Button 
                  variant="primary"
                  onClick={() => handleShowItemModal()}
                >
                  Thêm Hàng Mới
                </Button>
              )}
            </div>
            
            <Table responsive striped bordered hover>
              <thead>
                <tr>
                  <th>Tên hàng</th>
                  <th>Danh mục</th>
                  <th>Số lượng</th>
                  <th>Đơn vị</th>
                  <th>Giá/Đơn vị</th>
                  <th>Nhà cung cấp</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {inventory.length > 0 ? (
                  inventory.map(item => (
                    <tr key={item._id}>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td>{item.quantity}</td>
                      <td>{item.unit}</td>
                      <td>{formatCurrency(item.costPerUnit)}</td>
                      <td>{item.supplier || 'Không có'}</td>
                      <td>
                        <Badge bg={item.quantity <= item.minimumStock ? 'danger' : 'success'}>
                          {item.quantity <= item.minimumStock ? 'Sắp hết' : 'Còn hàng'}
                        </Badge>
                      </td>
                      <td>
                        {isAdmin() && (
                          <>
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              className="me-2"
                              onClick={() => handleShowItemModal(item)}
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
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">Không có hàng tồn kho nào</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Tab.Pane>
          
          {/* Tab Lịch Sử Giao Dịch */}
          <Tab.Pane eventKey="transactions">
            {activeTab === 'transactions' && error && <Alert variant="danger">{error}</Alert>}
            <div className="mb-4">
              <div className="mb-3">
                <Nav variant="pills" className="transaction-filter-tabs">
                  <Nav.Item>
                    <Nav.Link 
                      active={transactionFilter === 'all'} 
                      onClick={() => setTransactionFilter('all')}
                      className="px-4"
                    >
                      Tất cả
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link 
                      active={transactionFilter === 'import'} 
                      onClick={() => setTransactionFilter('import')}
                      className="px-4"
                    >
                      <Badge bg="success" className="me-1">Nhập kho</Badge>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link 
                      active={transactionFilter === 'export'} 
                      onClick={() => setTransactionFilter('export')}
                      className="px-4"
                    >
                      <Badge bg="warning" className="me-1">Xuất kho</Badge>
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </div>
              
              <div className="d-flex justify-content-between align-items-center">
                <strong>Số lượng giao dịch: {getFilteredTransactions().length}/{transactions ? transactions.length : 0}</strong>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  disabled={loading}
                  onClick={async () => {
                    try {
                      setLoading(true);
                      setError('');
                      
                      // Kiểm tra xem có token không
                      const token = localStorage.getItem('token');
                      if (!token) {
                        console.error('Không có token đăng nhập');
                        setError('Bạn cần đăng nhập để xem lịch sử giao dịch');
                        setLoading(false);
                        return;
                      }
                      
                      const response = await getTransactions();
                      if (response && response.data) {
                        setTransactions(response.data);
                        console.log(`Đã làm mới dữ liệu: ${response.data.length} giao dịch`);
                      } else {
                        throw new Error('Không nhận được dữ liệu từ server');
                      }
                    } catch (error) {
                      console.error('Lỗi làm mới:', error);
                      
                      // Xử lý lỗi authentication cụ thể
                      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                        setError('Bạn không có quyền truy cập. Vui lòng đăng nhập lại.');
                      } else {
                        setError('Không thể làm mới danh sách giao dịch. Lỗi: ' + (error.response?.data?.message || error.message));
                      }
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Đang tải...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-arrow-clockwise me-1"></i> Làm mới
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {loading && activeTab === 'transactions' ? (
              <div className="text-center p-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Đang tải...</span>
                </div>
                <p className="mt-2">Đang tải dữ liệu giao dịch...</p>
              </div>
            ) : (
              <Table responsive striped bordered hover>
                <thead>
                  <tr>
                    <th>Mã giao dịch</th>
                    <th>Loại</th>
                    <th>Số lượng mặt hàng</th>
                    <th>Tổng tiền</th>
                    <th>Nhà cung cấp/Đơn hàng</th>
                    <th>Ngày tạo</th>
                    <th>Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredTransactions().length > 0 ? (
                    getFilteredTransactions().map(transaction => (
                      <tr key={transaction._id}>
                        <td>{transaction._id.substring(transaction._id.length - 6)}</td>
                        <td>
                          <Badge bg={transaction.type === 'import' ? 'success' : 'warning'}>
                            {transaction.type === 'import' ? 'Nhập kho' : 'Xuất kho'}
                          </Badge>
                        </td>
                        <td>{transaction.items.length}</td>
                        <td>{formatCurrency(transaction.totalAmount)}</td>
                        <td>
                          {transaction.type === 'import'
                            ? (transaction.supplier || 'Không xác định')
                            : (transaction.orderId && transaction.orderId.customerName
                                ? `Đơn hàng: ${transaction.orderId.customerName}`
                                : 'Xuất không đơn hàng')}
                        </td>
                        <td>{formatDate(transaction.createdAt)}</td>
                        <td>{transaction.note || 'Không có'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">Không có giao dịch nào</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}
            
            {/* Thống kê giao dịch nhập xuất */}
            {transactions && transactions.length > 0 && (
              <div className="mt-4">
                <h5>Thống kê giao dịch</h5>
                <Row className="mt-3">
                  <Col md={6}>
                    <div className="border rounded p-3 mb-3">
                      <h6>
                        <Badge bg="success" className="me-2">Nhập kho</Badge>
                        Tổng số: {transactions.filter(t => t.type === 'import').length} giao dịch
                      </h6>
                      <div className="mt-2">
                        Tổng giá trị: {formatCurrency(
                          transactions
                            .filter(t => t.type === 'import')
                            .reduce((sum, t) => sum + t.totalAmount, 0)
                        )}
                      </div>
                      <div className="mt-2">
                        Số lượng mặt hàng: {
                          transactions
                            .filter(t => t.type === 'import')
                            .reduce((sum, t) => sum + t.items.length, 0)
                        }
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="border rounded p-3 mb-3">
                      <h6>
                        <Badge bg="warning" className="me-2">Xuất kho</Badge>
                        Tổng số: {transactions.filter(t => t.type === 'export').length} giao dịch
                      </h6>
                      <div className="mt-2">
                        Tổng giá trị: {formatCurrency(
                          transactions
                            .filter(t => t.type === 'export')
                            .reduce((sum, t) => sum + t.totalAmount, 0)
                        )}
                      </div>
                      <div className="mt-2">
                        Số lượng mặt hàng: {
                          transactions
                            .filter(t => t.type === 'export')
                            .reduce((sum, t) => sum + t.items.length, 0)
                        }
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            )}
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>

      {/* Modal thêm/sửa hàng tồn kho */}
      <Modal show={showItemModal} onHide={() => setShowItemModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{currentItem ? 'Sửa Hàng Tồn Kho' : 'Thêm Hàng Tồn Kho Mới'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tên hàng <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={itemFormData.name}
                onChange={handleItemChange}
                required
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Đơn vị <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="unit"
                    value={itemFormData.unit}
                    onChange={handleItemChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Danh mục</Form.Label>
                  <Form.Select
                    name="category"
                    value={itemFormData.category}
                    onChange={handleItemChange}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Số lượng</Form.Label>
                  <Form.Control
                    type="number"
                    name="quantity"
                    value={itemFormData.quantity}
                    onChange={handleItemChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá mỗi đơn vị <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="costPerUnit"
                    value={itemFormData.costPerUnit}
                    onChange={handleItemChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nhà cung cấp</Form.Label>
                  <Form.Control
                    type="text"
                    name="supplier"
                    value={itemFormData.supplier}
                    onChange={handleItemChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tồn kho tối thiểu</Form.Label>
                  <Form.Control
                    type="number"
                    name="minimumStock"
                    value={itemFormData.minimumStock}
                    onChange={handleItemChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowItemModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSaveItem}>
            {currentItem ? 'Lưu Thay Đổi' : 'Thêm Hàng'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal nhập/xuất kho */}
      <Modal show={showTransactionModal} onHide={() => setShowTransactionModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{transactionType === 'import' ? 'Nhập Kho' : 'Xuất Kho'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {transactionType === 'import' && (
              <Form.Group className="mb-3">
                <Form.Label>Nhà cung cấp <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="supplier"
                  value={transactionFormData.supplier}
                  onChange={handleTransactionChange}
                  required
                />
              </Form.Group>
            )}
            
            {transactionType === 'export' && (
              <Form.Group className="mb-3">
                <Form.Label>Mã đơn hàng</Form.Label>
                <Form.Control
                  type="text"
                  name="orderId"
                  value={transactionFormData.orderId}
                  onChange={handleTransactionChange}
                  placeholder="Nhập mã đơn hàng (nếu có)"
                />
              </Form.Group>
            )}
            
            <Form.Group className="mb-3">
              <Form.Label>Ghi chú</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="note"
                value={transactionFormData.note}
                onChange={handleTransactionChange}
              />
            </Form.Group>
            
            {/* Danh sách sản phẩm đã chọn */}
            <h5 className="mt-4">Danh sách hàng {transactionType === 'import' ? 'nhập' : 'xuất'}</h5>
            {selectedItems.length > 0 && (
              <Table responsive striped bordered className="mt-2">
                <thead>
                  <tr>
                    <th>Tên hàng</th>
                    <th>Đơn vị</th>
                    <th>Số lượng</th>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItems.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{item.unit}</td>
                      <td>
                        <Form.Control
                          type="number"
                          min="1"
                          max={item.maxQuantity}
                          value={item.quantity}
                          onChange={(e) => handleUpdateItemQuantity(index, parseInt(e.target.value, 10))}
                          size="sm"
                        />
                      </td>
                      <td>{formatCurrency(inventory.find(invItem => invItem._id === item.inventoryId).costPerUnit)}</td>
                      <td>{formatCurrency(item.cost)}</td>
                      <td>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRemoveItemFromTransaction(index)}
                        >
                          Xóa
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="4" className="text-end"><strong>Tổng cộng:</strong></td>
                    <td colSpan="2"><strong>{formatCurrency(calculateTransactionTotal())}</strong></td>
                  </tr>
                </tfoot>
              </Table>
            )}
            
            {/* Danh sách hàng tồn kho để chọn */}
            <h5 className="mt-4">Chọn hàng từ kho</h5>
            <Table responsive striped bordered className="mt-2">
              <thead>
                <tr>
                  <th>Tên hàng</th>
                  <th>Đơn vị</th>
                  <th>Tồn kho</th>
                  <th>Đơn giá</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map(item => (
                  <tr key={item._id}>
                    <td>{item.name}</td>
                    <td>{item.unit}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.costPerUnit)}</td>
                    <td>
                      {(transactionType === 'import' || (transactionType === 'export' && item.quantity > 0)) && (
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleAddItemToTransaction(item._id)}
                          disabled={selectedItems.some(selectedItem => selectedItem.inventoryId === item._id)}
                        >
                          Thêm
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTransactionModal(false)}>
            Hủy
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveTransaction}
            disabled={selectedItems.length === 0}
          >
            {transactionType === 'import' ? 'Nhập Kho' : 'Xuất Kho'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
};

export default InventoryPage; 