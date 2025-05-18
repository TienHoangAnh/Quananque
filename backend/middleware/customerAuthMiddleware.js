const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');

// Middleware xác thực khách hàng
const protectCustomer = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Lấy token từ header
      token = req.headers.authorization.split(' ')[1];

      // Xác thực token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

      // Tìm khách hàng và gán vào request
      req.customer = await Customer.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error('Lỗi xác thực token:', error);
      res.status(401).json({ message: 'Không được phép, token không hợp lệ' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Không được phép, không có token' });
  }
};

module.exports = { protectCustomer }; 