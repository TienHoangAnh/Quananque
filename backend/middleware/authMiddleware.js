const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Kiểm tra token JWT và phân quyền
exports.protect = async (req, res, next) => {
  let token;
  
  console.log('Headers:', req.headers);

  // Kiểm tra xem có token trong headers không
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Lấy token từ header
      token = req.headers.authorization.split(' ')[1];
      console.log('Received token:', token);

      // Giải mã token
      const secret = process.env.JWT_SECRET || 'quananque2025';
      console.log('JWT Secret:', secret.substring(0, 3) + '...');
      
      const decoded = jwt.verify(token, secret);
      console.log('Decoded token:', decoded);

      // Tìm user từ id trong token và loại bỏ pin khi trả về
      req.user = await User.findById(decoded.id).select('-pin');
      
      if (!req.user) {
        console.log('User not found with ID:', decoded.id);
        return res.status(401).json({ message: 'User not found' });
      }
      
      console.log('Authenticated as:', req.user.name, '(Role:', req.user.role, ')');
      next();
    } catch (error) {
      console.error('Lỗi xác thực token:', error);
      res.status(401).json({ message: 'Không có quyền truy cập, token không hợp lệ' });
    }
  } else if (!token) {
    console.log('No token provided');
    res.status(401).json({ message: 'Không có quyền truy cập, không có token' });
  }
};

// Giới hạn quyền truy cập dựa vào vai trò
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Không đủ quyền, chỉ Admin mới có thể thực hiện' });
  }
};

// Kiểm tra quyền truy cập cho nhân viên và admin
exports.staff = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
    next();
  } else {
    res.status(403).json({ message: 'Không đủ quyền, chỉ nhân viên mới có thể thực hiện' });
  }
}; 