/**
 * @param {Object} data - The data to be sent in the response
 * @param {String} message - Optional message to be sent with the response
 * @returns {Object} Standardized success response object
 */
exports.successResponse = (data = null, message = 'Success') => ({
  status: 'success',
  message,
  data
});

/**
 * @param {Array} data - The paginated data array
 * @param {Number} page - Current page number
 * @param {Number} limit - Items per page
 * @param {Number} total - Total number of items
 * @returns {Object} Standardized paginated response object
 */
exports.paginatedResponse = (data, page, limit, total) => ({
  status: 'success',
  data,
  pagination: {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / limit)
  }
});
