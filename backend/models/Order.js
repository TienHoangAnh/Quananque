const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  name: String,
  price: Number,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  note: String
});

const OrderSchema = new mongoose.Schema({
  orderCode: {
    type: String,
    unique: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  customerName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  items: [OrderItemSchema],
  reservationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'served', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'other'],
    default: 'cash'
  },
  serveTime: {
    type: Date
  },
  note: {
    type: String
  }
}, {
  timestamps: true
});

// Tạo mã đơn hàng ngẫu nhiên trước khi lưu
OrderSchema.pre('save', async function(next) {
  if (!this.orderCode) {
    // Tạo mã đơn hàng: ngày + 6 chữ số ngẫu nhiên (VD: 20250518-123456)
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const randomCode = Math.floor(100000 + Math.random() * 900000); // 6 chữ số ngẫu nhiên
    this.orderCode = `${dateStr}-${randomCode}`;
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema, 'orders'); 