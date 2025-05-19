const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

// Khởi tạo Express app
const app = express();

// Kết nối tới MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Cấu hình CORS chi tiết hơn
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://quananque.netlify.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Thêm middleware để log các requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Định nghĩa các route
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));

// API kiểm tra
app.get('/', (req, res) => {
  res.json({ message: 'API của Quán Ăn Quê đang hoạt động' });
});

// Xử lý route không tồn tại
app.use((req, res) => {
  res.status(404).json({ message: 'API không tồn tại' });
});

// Xử lý lỗi
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Lỗi server' });
});

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại cổng ${PORT}`);
}); 