const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true
  },
  role: {
    type: String,
    enum: ['admin', 'staff', 'customer'],
    default: 'customer'
  },
  pin: {
    type: String,
    required: function() {
      return this.role === 'admin' || this.role === 'staff';
    }
  }
}, {
  timestamps: true
});

// Mã hóa PIN trước khi lưu
UserSchema.pre('save', async function(next) {
  if (this.pin && this.isModified('pin')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.pin = await bcrypt.hash(this.pin, salt);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Phương thức kiểm tra PIN
UserSchema.methods.comparePin = async function(enteredPin) {
  return await bcrypt.compare(enteredPin, this.pin);
};

module.exports = mongoose.model('User', UserSchema, 'users'); 