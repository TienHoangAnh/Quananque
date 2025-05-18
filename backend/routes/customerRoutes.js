const express = require('express');
const router = express.Router();
const { 
  registerCustomer,
  loginCustomer,
  getCustomerProfile,
  updateCustomerProfile,
  getCustomerOrders
} = require('../controllers/customerController');
const { protectCustomer } = require('../middleware/customerAuthMiddleware');

// @route   POST /api/customers/register
router.post('/register', registerCustomer);

// @route   POST /api/customers/login
router.post('/login', loginCustomer);

// @route   GET /api/customers/profile
router.get('/profile', protectCustomer, getCustomerProfile);

// @route   PUT /api/customers/profile
router.put('/profile', protectCustomer, updateCustomerProfile);

// @route   GET /api/customers/orders
router.get('/orders', protectCustomer, getCustomerOrders);

module.exports = router; 