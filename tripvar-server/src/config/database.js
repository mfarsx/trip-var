const mongoose = require('mongoose');
const { info, error, warn } = require('../utils/logger');
const config = require('./config');

const connectDB = async() => {
  try {
    const { database } = config;

    // Validate MongoDB URI
    if (!database.uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Connection event handlers
    mongoose.connection.on('connected', () => {
      info('MongoDB connected successfully', {
        uri: database.uri.replace(/\/\/.*@/, '//***:***@'), // Hide credentials in logs
        nodeEnv: config.server.nodeEnv
      });
    });

    mongoose.connection.on('error', (err) => {
      error('MongoDB connection error', {
        error: err.message,
        code: err.code,
        name: err.name
      });
    });

    mongoose.connection.on('disconnected', () => {
      warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      info('MongoDB reconnected');
    });

    // Set mongoose options
    mongoose.set('strictQuery', false);

    // Enhanced connection options
    const connectionOptions = {
      ...database.options,
      authSource: 'tripvar', // Specify authentication database
      retryWrites: true,
      w: 'majority'
    };

    info('Attempting to connect to MongoDB', {
      uri: database.uri.replace(/\/\/.*@/, '//***:***@'),
      options: connectionOptions
    });

    // Connect with configuration
    await mongoose.connect(database.uri, connectionOptions);

    // Graceful shutdown
    process.on('SIGINT', async() => {
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
    throw err;
  }
};

module.exports = connectDB;
