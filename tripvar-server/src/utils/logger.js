const winston = require('winston');

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  })
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
  ],
});

// Create wrapper functions for common log levels
const info = (message, meta = {}) => logger.info(message, meta);
const error = (message, meta = {}) => logger.error(message, meta);
const warn = (message, meta = {}) => logger.warn(message, meta);
const debug = (message, meta = {}) => logger.debug(message, meta);

module.exports = {
  logger,
  info,
  error,
  warn,
  debug,
};
