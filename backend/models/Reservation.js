const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  people: {
    type: Number,
    required: true,
    min: 1
  },
  specialRequests: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  table: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Reservation', ReservationSchema, 'reservations'); 