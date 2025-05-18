const express = require('express');
const router = express.Router();
const { 
  getInventory, 
  getInventoryItemById, 
  createInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem,
  importInventory,
  exportInventory,
  getTransactions
} = require('../controllers/inventoryController');
const { protect, admin, staff } = require('../middleware/authMiddleware');

// @route   GET /api/inventory
router.get('/', protect, staff, getInventory);

// @route   GET /api/inventory/transactions
router.get('/transactions', protect, staff, getTransactions);

// @route   GET /api/inventory/:id
router.get('/:id', protect, staff, getInventoryItemById);

// @route   POST /api/inventory
router.post('/', protect, admin, createInventoryItem);

// @route   PUT /api/inventory/:id
router.put('/:id', protect, admin, updateInventoryItem);

// @route   DELETE /api/inventory/:id
router.delete('/:id', protect, admin, deleteInventoryItem);

// @route   POST /api/inventory/import
router.post('/import', protect, staff, importInventory);

// @route   POST /api/inventory/export
router.post('/export', protect, staff, exportInventory);

module.exports = router; 