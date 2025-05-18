const Customer = require('../models/Customer');
const Order = require('../models/Order');
const generateToken = require('../utils/generateToken');

// @desc    Đăng ký tài khoản khách hàng
// @route   POST /api/customers/register
// @access  Public
exports.registerCustomer = async (req, res) => {
  try {
    const { name, email, phone, password, address } = req.body;

    // Kiểm tra email đã tồn tại
    const customerExists = await Customer.findOne({ email });
    if (customerExists) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    // Tạo khách hàng mới
    const customer = await Customer.create({
      name,
      email,
      phone,
      password,
      address
    });

    if (customer) {
      res.status(201).json({
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        token: generateToken(customer._id)
      });
    } else {
      res.status(400).json({ message: 'Dữ liệu khách hàng không hợp lệ' });
    }
  } catch (error) {
    console.error('Lỗi đăng ký khách hàng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Đăng nhập tài khoản khách hàng
// @route   POST /api/customers/login
// @access  Public
exports.loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm khách hàng theo email
    const customer = await Customer.findOne({ email });

    // Kiểm tra khách hàng tồn tại và mật khẩu khớp
    if (customer && (await customer.matchPassword(password))) {
      res.json({
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        token: generateToken(customer._id)
      });
    } else {
      res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }
  } catch (error) {
    console.error('Lỗi đăng nhập khách hàng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Lấy thông tin khách hàng
// @route   GET /api/customers/profile
// @access  Private
exports.getCustomerProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer._id);

    if (customer) {
      res.json({
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address
      });
    } else {
      res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    }
  } catch (error) {
    console.error('Lỗi lấy thông tin khách hàng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Cập nhật thông tin khách hàng
// @route   PUT /api/customers/profile
// @access  Private
exports.updateCustomerProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer._id);

    if (customer) {
      customer.name = req.body.name || customer.name;
      customer.email = req.body.email || customer.email;
      customer.phone = req.body.phone || customer.phone;
      customer.address = req.body.address || customer.address;
      
      if (req.body.password) {
        customer.password = req.body.password;
      }

      const updatedCustomer = await customer.save();

      res.json({
        _id: updatedCustomer._id,
        name: updatedCustomer.name,
        email: updatedCustomer.email,
        phone: updatedCustomer.phone,
        address: updatedCustomer.address,
        token: generateToken(updatedCustomer._id)
      });
    } else {
      res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    }
  } catch (error) {
    console.error('Lỗi cập nhật thông tin khách hàng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Lấy danh sách đơn hàng của khách hàng
// @route   GET /api/customers/orders
// @access  Private
exports.getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 
      $or: [
        { email: req.customer.email },
        { phone: req.customer.phone }
      ]
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Lỗi lấy danh sách đơn hàng của khách hàng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 