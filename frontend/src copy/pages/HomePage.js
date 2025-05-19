import React from 'react';
import { Container, Row, Col, Card, Button, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';

const HomePage = () => {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <Carousel className="mb-5">
        <Carousel.Item>
          <div
            className="d-block w-100"
            style={{
              height: '500px',
              backgroundColor: '#6c757d',
              backgroundImage: 'url(https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          ></div>
          <Carousel.Caption>
            <h1>Quán Ăn Quê</h1>
            <p>Hương vị đậm đà của đồng quê Việt Nam</p>
            <Link to="/reservation">
              <Button variant="primary" size="lg" className="me-2">Đặt Bàn Ngay</Button>
            </Link>
            <Link to="/menu-public">
              <Button variant="outline-light" size="lg">Xem Thực Đơn</Button>
            </Link>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <div
            className="d-block w-100"
            style={{
              height: '500px',
              backgroundColor: '#6c757d',
              backgroundImage: 'url(https://images.unsplash.com/photo-1576280314430-9236c0bd9147?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          ></div>
          <Carousel.Caption>
            <h1>Không gian yên tĩnh</h1>
            <p>Nơi thưởng thức ẩm thực trong không gian đậm chất làng quê</p>
            <Link to="/order">
              <Button variant="success" size="lg">Đặt Món Ngay</Button>
            </Link>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>

      {/* About Section */}
      <Container className="mb-5">
        <Row>
          <Col lg={6} className="mb-4 mb-lg-0">
            <h2 className="mb-4">Về Quán Ăn Quê</h2>
            <p className="lead">
              Quán Ăn Quê là nơi tái hiện không gian ẩm thực đồng quê đích thực với những món ăn
              truyền thống được chế biến từ nguyên liệu tươi ngon nhất.
            </p>
            <p>
              Được thành lập từ năm 2018, chúng tôi luôn giữ gìn hương vị đậm đà của ẩm thực Việt Nam, 
              nơi bạn có thể thưởng thức những món ăn quen thuộc của miền quê trong không gian 
              yên bình, gần gũi với thiên nhiên.
            </p>
            <p>
              Đội ngũ đầu bếp của chúng tôi đều là những người có nhiều năm kinh nghiệm, được đào tạo 
              bài bản và đam mê với ẩm thực Việt truyền thống.
            </p>
            <Link to="/reservation">
              <Button variant="outline-primary">Đặt Bàn Ngay</Button>
            </Link>
          </Col>
          <Col lg={6}>
            <div
              style={{
                height: '400px',
                backgroundColor: '#e9ecef',
                backgroundImage: 'url(https://images.unsplash.com/photo-1636599312432-dae6e753e729?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mjl8fHZpZXRuYW1lc2UlMjBmb29kfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=600&q=60)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '8px'
              }}
            ></div>
          </Col>
        </Row>
      </Container>

      {/* Featured Dishes */}
      <Container className="mb-5">
        <h2 className="text-center mb-4">Món Đặc Sắc</h2>
        <Row>
          <Col md={4} className="mb-4">
            <Card className="h-100">
              <div
                style={{
                  height: '200px',
                  backgroundColor: '#6c757d',
                  backgroundImage: 'url(https://images.unsplash.com/photo-1547592180-64fc376c6089?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTV8fHZpZXRuYW1lc2UlMjBmb29kfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=600&q=60)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              ></div>
              <Card.Body>
                <Card.Title>Cá Kho Tộ</Card.Title>
                <Card.Text>
                  Cá lóc kho trong tộ đất với nước dừa, nước mắm và tiêu.
                </Card.Text>
                <Link to="/menu-public">
                  <Button variant="outline-primary" size="sm">Xem Thực Đơn</Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100">
              <div
                style={{
                  height: '200px',
                  backgroundColor: '#6c757d',
                  backgroundImage: 'url(https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8dmlldG5hbWVzZSUyMGZvb2R8ZW58MHx8MHx8&auto=format&fit=crop&w=600&q=60)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              ></div>
              <Card.Body>
                <Card.Title>Gà Kho Gừng</Card.Title>
                <Card.Text>
                  Gà ta kho với gừng, nước mắm, đường và gia vị đặc trưng.
                </Card.Text>
                <Link to="/menu-public">
                  <Button variant="outline-primary" size="sm">Xem Thực Đơn</Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100">
              <div
                style={{
                  height: '200px',
                  backgroundColor: '#6c757d',
                  backgroundImage: 'url(https://images.unsplash.com/photo-1576140540933-1795193eda7e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MzZ8fHZpZXRuYW1lc2UlMjBmb29kfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=600&q=60)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              ></div>
              <Card.Body>
                <Card.Title>Canh Chua</Card.Title>
                <Card.Text>
                  Canh chua với cá lóc, đậu bắp, giá, me, rau thơm và gia vị.
                </Card.Text>
                <Link to="/menu-public">
                  <Button variant="outline-primary" size="sm">Xem Thực Đơn</Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <div className="text-center mt-4">
          <Link to="/menu-public">
            <Button variant="primary">Xem Tất Cả Món Ăn</Button>
          </Link>
        </div>
      </Container>

      {/* Services */}
      <div className="bg-light py-5 mb-5">
        <Container>
          <h2 className="text-center mb-5">Dịch Vụ Của Chúng Tôi</h2>
          <Row>
            <Col md={4} className="mb-4 mb-md-0">
              <div className="text-center">
                <div className="mb-3">
                  <i className="fas fa-utensils" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                </div>
                <h4>Đặt Bàn</h4>
                <p>Đặt bàn trước để đảm bảo bạn có chỗ ngồi thoải mái nhất khi đến quán.</p>
                <Link to="/reservation">
                  <Button variant="outline-secondary" size="sm">Đặt Bàn</Button>
                </Link>
              </div>
            </Col>
            <Col md={4} className="mb-4 mb-md-0">
              <div className="text-center">
                <div className="mb-3">
                  <i className="fas fa-concierge-bell" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                </div>
                <h4>Đặt Món Trước</h4>
                <p>Tiết kiệm thời gian chờ đợi bằng cách đặt món trước khi đến quán.</p>
                <Link to="/order">
                  <Button variant="outline-secondary" size="sm">Đặt Món</Button>
                </Link>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center">
                <div className="mb-3">
                  <i className="fas fa-home" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                </div>
                <h4>Tổ Chức Tiệc</h4>
                <p>Phục vụ cho các buổi tiệc gia đình, sinh nhật và sự kiện đặc biệt.</p>
                <Link to="/reservation">
                  <Button variant="outline-secondary" size="sm">Liên Hệ</Button>
                </Link>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </PublicLayout>
  );
};

export default HomePage; 