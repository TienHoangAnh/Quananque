const express = require('express');
const router = express.Router();
const { login, getMe, registerStaff } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   POST /api/auth/login
router.post('/login', login);

// @route   GET /api/auth/me
router.get('/me', protect, getMe);

// @route   POST /api/auth/register
router.post('/register', protect, admin, registerStaff);

module.exports = router; 