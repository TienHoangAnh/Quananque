const jwt = require('jsonwebtoken');

/**
 * Tạo JWT token từ ID người dùng
 * @param {string} id ID của người dùng
 * @returns {string} JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d', // Token hết hạn sau 30 ngày
  });
};

module.exports = generateToken; 