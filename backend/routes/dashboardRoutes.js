const express = require('express');
const router = express.Router();
const { 
  getTodayStats, 
  getRevenueStats, 
  getTopItems,
  getProfitStats
} = require('../controllers/dashboardController');
const { protect, staff } = require('../middleware/authMiddleware');

// @route   GET /api/dashboard/today
router.get('/today', protect, staff, getTodayStats);

// @route   GET /api/dashboard/revenue
router.get('/revenue', protect, staff, getRevenueStats);

// @route   GET /api/dashboard/top-items
router.get('/top-items', protect, staff, getTopItems);

// @route   GET /api/dashboard/profit
router.get('/profit', protect, staff, getProfitStats);

module.exports = router; 