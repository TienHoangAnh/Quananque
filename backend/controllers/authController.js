const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Tạo JWT token
// Tạo JWT token
const generateToken = (id, role) => {
  const secret = process.env.JWT_SECRET || 'quananque2025';
  return jwt.sign({ id, role }, secret, {
    expiresIn: '30d'
  });
};

// @desc    Đăng nhập người dùng
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { phone, pin } = req.body;

    if (!phone || !pin) {
      return res.status(400).json({ message: 'Vui lòng nhập số điện thoại và mã PIN' });
    }

    const user = await User.findOne({ phone });

    if (!user || !(await user.comparePin(pin))) {
      return res.status(401).json({ message: 'Số điện thoại hoặc mã PIN không đúng' });
    }

    if (user.role === 'customer') {
      return res.status(401).json({ message: 'Tài khoản này không có quyền đăng nhập hệ thống' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Lấy thông tin người dùng hiện tại
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-pin');
    res.json(user);
  } catch (error) {
    console.error('Lỗi lấy thông tin:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Đăng ký tài khoản nhân viên (chỉ admin)
// @route   POST /api/auth/register
// @access  Private/Admin
exports.registerStaff = async (req, res) => {
  try {
    const { name, phone, email, pin, role } = req.body;

    if (!name || !phone || !pin) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }

    const userExists = await User.findOne({ phone });
    if (userExists) {
      return res.status(400).json({ message: 'Số điện thoại đã được sử dụng' });
    }

    const user = await User.create({
      name,
      phone,
      email: email || undefined,
      pin,
      role: role || 'staff'
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role
      });
    } else {
      res.status(400).json({ message: 'Thông tin không hợp lệ' });
    }
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 

// @desc    Đăng nhập người dùng
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { phone, pin } = req.body;

    if (!phone || !pin) {
      return res.status(400).json({ message: 'Vui lòng nhập số điện thoại và mã PIN' });
    }

    const user = await User.findOne({ phone });

    if (!user || !(await user.comparePin(pin))) {
      return res.status(401).json({ message: 'Số điện thoại hoặc mã PIN không đúng' });
    }

    if (user.role === 'customer') {
      return res.status(401).json({ message: 'Tài khoản này không có quyền đăng nhập hệ thống' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Lấy thông tin người dùng hiện tại
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-pin');
    res.json(user);
  } catch (error) {
    console.error('Lỗi lấy thông tin:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Đăng ký tài khoản nhân viên (chỉ admin)
// @route   POST /api/auth/register
// @access  Private/Admin
exports.registerStaff = async (req, res) => {
  try {
    const { name, phone, email, pin, role } = req.body;

    if (!name || !phone || !pin) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }

    const userExists = await User.findOne({ phone });
    if (userExists) {
      return res.status(400).json({ message: 'Số điện thoại đã được sử dụng' });
    }

    const user = await User.create({
      name,
      phone,
      email: email || undefined,
      pin,
      role: role || 'staff'
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role
      });
    } else {
      res.status(400).json({ message: 'Thông tin không hợp lệ' });
    }
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 