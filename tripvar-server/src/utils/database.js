/**
 * Database utility functions for common operations
 */

const mongoose = require('mongoose');
const { performance } = require('./logger');

/**
 * Execute a database operation with performance logging
 * @param {Function} operation - Database operation to execute
 * @param {string} operationName - Name of the operation for logging
 * @param {Object} meta - Additional metadata for logging
 * @returns {Promise} - Result of the database operation
 */
const executeWithLogging = async (operation, operationName, meta = {}) => {
  const startTime = Date.now();
  
  try {
    const result = await operation();
    const duration = Date.now() - startTime;
    
    performance(operationName, duration, {
      success: true,
      ...meta
    });
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    performance(operationName, duration, {
      success: false,
      error: error.message,
      ...meta
    });
    
    throw error;
  }
};

/**
 * Create a paginated query
 * @param {Object} Model - Mongoose model
 * @param {Object} filter - Query filter
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 20)
 * @param {Object} options.sort - Sort criteria
 * @param {Object} options.populate - Population options
 * @returns {Promise<Object>} - Paginated result
 */
const paginate = async (Model, filter = {}, options = {}) => {
  const {
    page = 1,
    limit = 20,
    sort = { createdAt: -1 },
    populate = null
  } = options;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const query = Model.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

  if (populate) {
    query.populate(populate);
  }

  const [data, total] = await Promise.all([
    query.exec(),
    Model.countDocuments(filter)
  ]);

  return {
    data,
    pagination: {
      current: pageNum,
      pages: Math.ceil(total / limitNum),
      total,
      limit: limitNum,
      hasNext: pageNum < Math.ceil(total / limitNum),
      hasPrev: pageNum > 1
    }
  };
};

/**
 * Create a search query with text search
 * @param {Object} Model - Mongoose model
 * @param {string} searchTerm - Search term
 * @param {Array} searchFields - Fields to search in
 * @param {Object} additionalFilter - Additional filter criteria
 * @returns {Object} - MongoDB query object
 */
const createSearchQuery = (Model, searchTerm, searchFields = [], additionalFilter = {}) => {
  if (!searchTerm || searchFields.length === 0) {
    return additionalFilter;
  }

  const searchConditions = searchFields.map(field => ({
    [field]: { $regex: searchTerm, $options: 'i' }
  }));

  return {
    $and: [
      additionalFilter,
      { $or: searchConditions }
    ]
  };
};

/**
 * Create a date range filter
 * @param {string} startDate - Start date (ISO string)
 * @param {string} endDate - End date (ISO string)
 * @param {string} field - Date field name (default: 'createdAt')
 * @returns {Object} - MongoDB date range filter
 */
const createDateRangeFilter = (startDate, endDate, field = 'createdAt') => {
  const filter = {};
  
  if (startDate) {
    filter[field] = { ...filter[field], $gte: new Date(startDate) };
  }
  
  if (endDate) {
    filter[field] = { ...filter[field], $lte: new Date(endDate) };
  }
  
  return filter;
};

/**
 * Create a sort object from query parameters
 * @param {string} sortField - Field to sort by
 * @param {string} sortOrder - Sort order ('asc' or 'desc')
 * @param {Object} defaultSort - Default sort criteria
 * @returns {Object} - MongoDB sort object
 */
const createSortObject = (sortField, sortOrder = 'desc', defaultSort = { createdAt: -1 }) => {
  if (!sortField) {
    return defaultSort;
  }

  const order = sortOrder === 'asc' ? 1 : -1;
  return { [sortField]: order };
};

/**
 * Soft delete a document
 * @param {Object} Model - Mongoose model
 * @param {string} id - Document ID
 * @param {string} userId - User performing the deletion
 * @returns {Promise<Object>} - Updated document
 */
const softDelete = async (Model, id, userId = null) => {
  const updateData = {
    deletedAt: new Date(),
    deletedBy: userId
  };

  return executeWithLogging(
    () => Model.findByIdAndUpdate(id, updateData, { new: true }),
    'softDelete',
    { model: Model.modelName, id, userId }
  );
};

/**
 * Restore a soft-deleted document
 * @param {Object} Model - Mongoose model
 * @param {string} id - Document ID
 * @param {string} userId - User performing the restoration
 * @returns {Promise<Object>} - Updated document
 */
const restore = async (Model, id, userId = null) => {
  const updateData = {
    $unset: { deletedAt: 1, deletedBy: 1 }
  };

  return executeWithLogging(
    () => Model.findByIdAndUpdate(id, updateData, { new: true }),
    'restore',
    { model: Model.modelName, id, userId }
  );
};

/**
 * Bulk update documents
 * @param {Object} Model - Mongoose model
 * @param {Object} filter - Filter criteria
 * @param {Object} update - Update data
 * @param {Object} options - Update options
 * @returns {Promise<Object>} - Update result
 */
const bulkUpdate = async (Model, filter, update, options = {}) => {
  return executeWithLogging(
    () => Model.updateMany(filter, update, options),
    'bulkUpdate',
    { model: Model.modelName, filter, update }
  );
};

/**
 * Bulk delete documents
 * @param {Object} Model - Mongoose model
 * @param {Object} filter - Filter criteria
 * @param {boolean} softDelete - Whether to soft delete (default: true)
 * @param {string} userId - User performing the deletion
 * @returns {Promise<Object>} - Delete result
 */
const bulkDelete = async (Model, filter, softDelete = true, userId = null) => {
  if (softDelete) {
    const updateData = {
      deletedAt: new Date(),
      deletedBy: userId
    };
    
    return executeWithLogging(
      () => Model.updateMany(filter, updateData),
      'bulkSoftDelete',
      { model: Model.modelName, filter, userId }
    );
  } else {
    return executeWithLogging(
      () => Model.deleteMany(filter),
      'bulkDelete',
      { model: Model.modelName, filter }
    );
  }
};

/**
 * Get document statistics
 * @param {Object} Model - Mongoose model
 * @param {Object} filter - Filter criteria
 * @returns {Promise<Object>} - Statistics object
 */
const getStats = async (Model, filter = {}) => {
  return executeWithLogging(
    async () => {
      const [total, active, deleted] = await Promise.all([
        Model.countDocuments(filter),
        Model.countDocuments({ ...filter, deletedAt: { $exists: false } }),
        Model.countDocuments({ ...filter, deletedAt: { $exists: true } })
      ]);

      return { total, active, deleted };
    },
    'getStats',
    { model: Model.modelName, filter }
  );
};

/**
 * Create a transaction wrapper
 * @param {Function} operations - Operations to execute in transaction
 * @returns {Promise} - Transaction result
 */
const withTransaction = async (operations) => {
  const session = await mongoose.startSession();
  
  try {
    return await session.withTransaction(operations);
  } finally {
    await session.endSession();
  }
};

/**
 * Check if a field value is unique
 * @param {Object} Model - Mongoose model
 * @param {string} field - Field name
 * @param {*} value - Field value
 * @param {string} excludeId - ID to exclude from check
 * @returns {Promise<boolean>} - True if unique
 */
const isUnique = async (Model, field, value, excludeId = null) => {
  const filter = { [field]: value };
  
  if (excludeId) {
    filter._id = { $ne: excludeId };
  }
  
  const count = await Model.countDocuments(filter);
  return count === 0;
};

module.exports = {
  executeWithLogging,
  paginate,
  createSearchQuery,
  createDateRangeFilter,
  createSortObject,
  softDelete,
  restore,
  bulkUpdate,
  bulkDelete,
  getStats,
  withTransaction,
  isUnique
};