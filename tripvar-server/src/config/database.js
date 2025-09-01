const mongoose = require('mongoose');
const { info, error, warn } = require('../utils/logger');
const config = require('./config');

const connectDB = async () => {
  try {
    const { database } = config;
    
    // Connection event handlers
    mongoose.connection.on('connected', () => {
      info('MongoDB connected successfully', { 
        uri: database.uri.replace(/\/\/.*@/, '//***:***@'), // Hide credentials in logs
        nodeEnv: config.server.nodeEnv 
      });
    });

    mongoose.connection.on('error', (err) => {
      error('MongoDB connection error', { error: err.message });
    });

    mongoose.connection.on('disconnected', () => {
      warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      info('MongoDB reconnected');
    });

    // Set mongoose options
    mongoose.set('strictQuery', false);
    
    // Connect with configuration
    await mongoose.connect(database.uri, database.options);
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        info('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        error('Error closing MongoDB connection', { error: err.message });
        process.exit(1);
      }
    });

  } catch (err) {
    error('Failed to connect to MongoDB', { 
      error: err.message,
      stack: config.server.isDevelopment ? err.stack : undefined
    });
    process.exit(1);
  }
};

module.exports = connectDB;
