const mongoose = require('mongoose');
const { info, error, warn } = require('../utils/logger');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/tripvar';
    
    mongoose.connection.on('connected', () => {
      info('MongoDB connected successfully', { uri: mongoURI });
    });

    mongoose.connection.on('error', (err) => {
      error('MongoDB connection error', { error: err.message });
    });

    mongoose.connection.on('disconnected', () => {
      warn('MongoDB disconnected');
    });

    await mongoose.connect(mongoURI);
  } catch (err) {
    error('Failed to connect to MongoDB', { error: err.stack });
    process.exit(1);
  }
};

module.exports = connectDB;
