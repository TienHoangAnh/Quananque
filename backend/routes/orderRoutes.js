const express = require('express');
const router = express.Router();
const { 
  getOrders, 
  getOrderById, 
  createOrder, 
  updateOrder, 
  deleteOrder,
  trackOrderByCode
} = require('../controllers/orderController');
const { protect, staff } = require('../middleware/authMiddleware');

// @route   GET /api/orders
router.get('/', protect, staff, getOrders);

// @route   GET /api/orders/:id
router.get('/:id', protect, staff, getOrderById);

// @route   GET /api/orders/track/:code
router.get('/track/:code', trackOrderByCode);

// @route   POST /api/orders
router.post('/', createOrder);

// @route   PUT /api/orders/:id
router.put('/:id', protect, staff, updateOrder);

// @route   DELETE /api/orders/:id
router.delete('/:id', protect, staff, deleteOrder);

module.exports = router; 