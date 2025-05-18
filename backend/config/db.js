const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://ti3n120903:0zgW1nza35Bd9vsw@etutoringdb.kw8ho.mongodb.net/quananque';
    await mongoose.connect(mongoURI);
    console.log('Kết nối MongoDB thành công');
  } catch (err) {
    console.error('Lỗi kết nối MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB; 