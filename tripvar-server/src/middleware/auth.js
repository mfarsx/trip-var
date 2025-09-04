const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../public/models/user.model');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

exports.authenticate = async(req, res, next) => {
  try {
    // 1) Get token and check if it exists
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Additional security: Check for token in cookies as fallback
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in! Please log in to get access.',
        code: 'UNAUTHORIZED'
      });
    }

    // 2) Verify token
    try {
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET, {
        algorithms: ['HS256'] // Explicitly specify algorithm for security
      });

      // 3) Check if user still exists
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          status: 'fail',
          message: 'The user belonging to this token no longer exists.',
          code: 'UNAUTHORIZED'
        });
      }

      // 4) Check if user changed password after the token was issued
      if (user.changedPasswordAfter(decoded.iat)) {
        return res.status(401).json({
          status: 'fail',
          message: 'User recently changed password! Please log in again.',
          code: 'UNAUTHORIZED'
        });
      }

      // Grant access to protected route
      req.user = user;
      next();
    } catch (err) {
      // Handle JWT specific errors with clear messages
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'fail',
          message: 'Your token has expired. Please log in again.',
          code: 'TOKEN_EXPIRED'
        });
      } else if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
          status: 'fail',
          message: 'Invalid token. Please log in again.',
          code: 'INVALID_TOKEN'
        });
      }
      // For other errors, pass to error handler
      next(err);
    }
  } catch (error) {
    next(error);
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError('You do not have permission to perform this action')
      );
    }
    next();
  };
};

// Keep the old exports for backward compatibility
exports.protect = exports.authenticate;
exports.restrictTo = exports.authorize;
