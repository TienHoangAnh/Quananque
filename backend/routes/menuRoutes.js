const express = require('express');
const router = express.Router();
const { 
  getMenuItems, 
  getMenuItemById, 
  createMenuItem, 
  updateMenuItem, 
  deleteMenuItem 
} = require('../controllers/menuController');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   GET /api/menu
router.get('/', getMenuItems);

// @route   GET /api/menu/:id
router.get('/:id', getMenuItemById);

// @route   POST /api/menu
router.post('/', protect, admin, createMenuItem);

// @route   PUT /api/menu/:id
router.put('/:id', protect, admin, updateMenuItem);

// @route   DELETE /api/menu/:id
router.delete('/:id', protect, admin, deleteMenuItem);

module.exports = router; 