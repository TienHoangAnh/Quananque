import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Form, Button, Alert } from 'react-bootstrap';
import Layout from '../components/Layout';
import { getTodayStats, getRevenueStats, getTopItems, getProfitStats } from '../utils/api';

const DashboardPage = () => {
  const [todayStats, setTodayStats] = useState(null);
  const [revenueStats, setRevenueStats] = useState(null);
  const [topItems, setTopItems] = useState([]);
  const [profitStats, setProfitStats] = useState(null);
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Lấy số liệu thống kê hôm nay
  useEffect(() => {
    const fetchTodayStats = async () => {
      try {
        const response = await getTodayStats();
        setTodayStats(response.data);
      } catch (error) {
        setError('Không thể tải dữ liệu thống kê hôm nay');
        console.error(error);
      }
    };
    fetchTodayStats();
  }, []);

  // Lấy doanh thu theo khoảng thời gian
  useEffect(() => {
    const fetchRevenueStats = async () => {
      try {
        const response = await getRevenueStats({ period });
        setRevenueStats(response.data);
      } catch (error) {
        setError('Không thể tải dữ liệu doanh thu');
        console.error(error);
      }
    };

    // Lấy các món ăn bán chạy
    const fetchTopItems = async () => {
      try {
        const response = await getTopItems({ period, limit: 5 });
        setTopItems(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    // Lấy thống kê lợi nhuận
    const fetchProfitStats = async () => {
      try {
        const response = await getProfitStats({ period });
        setProfitStats(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueStats();
    fetchTopItems();
    fetchProfitStats();
  }, [period]);

  // Hàm chuyển đổi số thành định dạng tiền tệ
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Hàm chuyển đổi ngày thành định dạng Việt Nam
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).format(date);
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center p-5">Đang tải dữ liệu...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="mb-4">Tổng Quan</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Thống kê ngày hôm nay */}
      <h3>Hôm nay</h3>
      <Row className="mb-4">
        {todayStats && (
          <>
            <Col md={3}>
              <Card className="text-center mb-3">
                <Card.Body>
                  <Card.Title>Doanh Thu Hôm nay</Card.Title>
                  <h3 className="text-success">{formatCurrency(todayStats.totalRevenue)}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center mb-3">
                <Card.Body>
                  <Card.Title>Đơn Hàng</Card.Title>
                  <h3>{todayStats.orderCount}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center mb-3">
                <Card.Body>
                  <Card.Title>Đơn Thanh Toán</Card.Title>
                  <h3>{todayStats.paidOrders}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center mb-3">
                <Card.Body>
                  <Card.Title>Đặt Bàn</Card.Title>
                  <h3>{todayStats.reservationCount}</h3>
                </Card.Body>
              </Card>
            </Col>
          </>
        )}
      </Row>

      {/* Chọn khoảng thời gian */}
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label><h3>Thống kê theo</h3></Form.Label>
            <Form.Select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="today">Hôm nay</option>
              <option value="week">7 ngày qua</option>
              <option value="month">30 ngày qua</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Thống kê doanh thu */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Doanh Thu {period === 'today' ? 'Hôm Nay' : period === 'week' ? '7 Ngày Qua' : '30 Ngày Qua'}</h5>
            </Card.Header>
            <Card.Body>
              {revenueStats && (
                <div>
                  <h3 className="text-success mb-3">{formatCurrency(revenueStats.totalRevenue)}</h3>
                  <p>Tổng số đơn hàng: <strong>{revenueStats.orderCount}</strong></p>
                  <p>Từ ngày: <strong>{formatDate(revenueStats.startDate)}</strong></p>
                  <p>Đến ngày: <strong>{formatDate(revenueStats.endDate)}</strong></p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        {/* Thống kê lợi nhuận */}
        <Col md={6}>
          <Card>
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">Lợi Nhuận {period === 'today' ? 'Hôm Nay' : period === 'week' ? '7 Ngày Qua' : '30 Ngày Qua'}</h5>
            </Card.Header>
            <Card.Body>
              {profitStats && (
                <div>
                  <h3 className="text-success mb-3">{formatCurrency(profitStats.grossProfit)}</h3>
                  <p>Tổng doanh thu: <strong>{formatCurrency(profitStats.totalRevenue)}</strong></p>
                  <p>Tổng chi phí: <strong>{formatCurrency(profitStats.totalCost)}</strong></p>
                  <p>Tỷ suất lợi nhuận: <strong>{profitStats.profitMargin.toFixed(2)}%</strong></p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Món ăn bán chạy */}
      <Row>
        <Col md={12}>
          <Card>
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">Món ăn bán chạy {period === 'today' ? 'Hôm Nay' : period === 'week' ? '7 Ngày Qua' : '30 Ngày Qua'}</h5>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Tên món</th>
                    <th>Số lượng bán</th>
                    <th>Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {topItems.length > 0 ? (
                    topItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.revenue)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center">Không có dữ liệu</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Layout>
  );
};

export default DashboardPage; 