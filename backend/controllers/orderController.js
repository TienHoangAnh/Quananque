const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

// @desc    Lấy tất cả đơn hàng
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Lỗi lấy danh sách đơn hàng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Lấy chi tiết đơn hàng theo ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('reservationId', 'customerName date time people')
      .populate('items.menuItem', 'name price');

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
  } catch (error) {
    console.error('Lỗi lấy chi tiết đơn hàng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Tra cứu đơn hàng theo mã đơn
// @route   GET /api/orders/track/:code
// @access  Public
exports.trackOrderByCode = async (req, res) => {
  try {
    const orderCode = req.params.code;
    const order = await Order.findOne({ orderCode })
      .populate('items.menuItem', 'name image');

    if (order) {
      // Chỉ trả về thông tin cần thiết cho khách hàng
      const orderInfo = {
        orderCode: order.orderCode,
        customerName: order.customerName,
        phone: order.phone.substring(0, 4) + '****' + order.phone.substring(order.phone.length - 3), // Ẩn số điện thoại
        status: order.status,
        statusText: getStatusText(order.status),
        items: order.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      };
      
      res.json(orderInfo);
    } else {
      res.status(404).json({ message: 'Không tìm thấy đơn hàng với mã này' });
    }
  } catch (error) {
    console.error('Lỗi tra cứu đơn hàng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Hàm chuyển đổi trạng thái đơn hàng sang tiếng Việt
const getStatusText = (status) => {
  const statusMap = {
    'pending': 'Đang xử lý',
    'preparing': 'Đang chuẩn bị',
    'ready': 'Sẵn sàng phục vụ',
    'served': 'Đã phục vụ',
    'completed': 'Hoàn thành',
    'cancelled': 'Đã hủy'
  };
  return statusMap[status] || status;
};

// @desc    Tạo đơn hàng mới
// @route   POST /api/orders
// @access  Public
exports.createOrder = async (req, res) => {
  try {
    const { customerName, phone, email, items, reservationId, note, customerId } = req.body;

    if (!customerName || !phone || !items || items.length === 0) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin cần thiết' });
    }

    // Tính tổng tiền đơn hàng
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      if (!menuItem) {
        return res.status(404).json({ message: `Không tìm thấy món ${item.menuItem}` });
      }

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        note: item.note || ''
      });

      totalAmount += menuItem.price * item.quantity;
    }

    const order = new Order({
      customerName,
      phone,
      email,
      items: orderItems,
      reservationId,
      totalAmount,
      note,
      customerId
    });

    const createdOrder = await order.save();
    
    // Cập nhật danh sách đơn hàng cho khách hàng nếu có tài khoản
    if (customerId) {
      const Customer = require('../models/Customer');
      await Customer.findByIdAndUpdate(
        customerId,
        { $push: { orders: createdOrder._id } }
      );
    }
    
    res.status(201).json({
      _id: createdOrder._id,
      orderCode: createdOrder.orderCode,
      customerName: createdOrder.customerName,
      totalAmount: createdOrder.totalAmount,
      status: createdOrder.status,
      statusText: getStatusText(createdOrder.status),
      createdAt: createdOrder.createdAt
    });
  } catch (error) {
    console.error('Lỗi tạo đơn hàng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Cập nhật trạng thái đơn hàng
// @route   PUT /api/orders/:id
// @access  Private
exports.updateOrder = async (req, res) => {
  try {
    const { status, paymentStatus, paymentMethod, serveTime, note } = req.body;

    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = status || order.status;
      order.paymentStatus = paymentStatus || order.paymentStatus;
      order.paymentMethod = paymentMethod || order.paymentMethod;
      order.serveTime = serveTime || order.serveTime;
      order.note = note !== undefined ? note : order.note;

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
  } catch (error) {
    console.error('Lỗi cập nhật đơn hàng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Hủy đơn hàng
// @route   DELETE /api/orders/:id
// @access  Private
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      await order.remove();
      res.json({ message: 'Đã hủy đơn hàng' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
  } catch (error) {
    console.error('Lỗi hủy đơn hàng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 