const mongoose = require('mongoose');

const InventoryItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
  costPerUnit: {
    type: Number,
    required: true
  },
  supplier: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['Nguyên liệu', 'Gia vị', 'Đồ uống', 'Khác'],
    default: 'Nguyên liệu'
  },
  minimumStock: {
    type: Number,
    default: 5
  }
}, {
  timestamps: true
});

// Virtual for checking if stock is low
InventoryItemSchema.virtual('isLowStock').get(function() {
  return this.quantity <= this.minimumStock;
});

module.exports = mongoose.model('InventoryItem', InventoryItemSchema, 'inventory'); 