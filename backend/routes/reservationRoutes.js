const express = require('express');
const router = express.Router();
const { 
  getReservations, 
  getReservationById, 
  createReservation, 
  updateReservation, 
  deleteReservation 
} = require('../controllers/reservationController');
const { protect, staff } = require('../middleware/authMiddleware');

// @route   GET /api/reservations
router.get('/', protect, staff, getReservations);

// @route   GET /api/reservations/:id
router.get('/:id', protect, staff, getReservationById);

// @route   POST /api/reservations
router.post('/', createReservation);

// @route   PUT /api/reservations/:id
router.put('/:id', protect, staff, updateReservation);

// @route   DELETE /api/reservations/:id
router.delete('/:id', protect, staff, deleteReservation);

module.exports = router; 