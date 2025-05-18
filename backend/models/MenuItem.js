const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  costPrice: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Khai vị', 'Món chính', 'Tráng miệng', 'Đồ uống', 'Đặc sản']
  },
  image: {
    type: String,
    default: 'default-food.jpg'
  },
  available: {
    type: Boolean,
    default: true
  },
  popular: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Tính lợi nhuận
MenuItemSchema.virtual('profit').get(function() {
  return this.price - this.costPrice;
});

// Tính tỷ lệ lợi nhuận
MenuItemSchema.virtual('profitMargin').get(function() {
  return (this.price - this.costPrice) / this.price * 100;
});

module.exports = mongoose.model('MenuItem', MenuItemSchema, 'menu_items'); 