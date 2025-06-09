const mongoose = require('mongoose');
require('dotenv').config();

console.log('Loaded MONGO_URI:', process.env.MONGO_URI);


const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('connection failed :', error);
    process.exit(1);
  }
};

module.exports = connectDB;
