const mongoose = require('mongoose');

const TransactionItemSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: true
  },
  name: String,
  quantity: {
    type: Number,
    required: true
  },
  cost: Number
});

const TransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['import', 'export'],
    required: true
  },
  items: [TransactionItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  note: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  supplier: {
    type: String
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', TransactionSchema, 'transactions'); 