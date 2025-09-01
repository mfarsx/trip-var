const { NotFoundError, ValidationError } = require('../utils/errors');

/**
 * Base repository class with common database operations
 */
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  /**
   * Create a new document
   * @param {Object} data - Document data
   * @returns {Promise<Object>} Created document
   */
  async create(data) {
    try {
      const document = await this.model.create(data);
      return document;
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  /**
   * Find document by ID
   * @param {string} id - Document ID
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>} Found document
   */
  async findById(id, options = {}) {
    try {
      const { select, populate, lean = false } = options;
      let query = this.model.findById(id);

      if (select) {
        query = query.select(select);
      }

      if (populate) {
        if (Array.isArray(populate)) {
          populate.forEach(pop => query = query.populate(pop));
        } else {
          query = query.populate(populate);
        }
      }

      if (lean) {
        query = query.lean();
      }

      const document = await query;
      return document;
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  /**
   * Find one document by criteria
   * @param {Object} criteria - Search criteria
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>} Found document
   */
  async findOne(criteria, options = {}) {
    try {
      const { select, populate, lean = false } = options;
      let query = this.model.findOne(criteria);

      if (select) {
        query = query.select(select);
      }

      if (populate) {
        if (Array.isArray(populate)) {
          populate.forEach(pop => query = query.populate(pop));
        } else {
          query = query.populate(populate);
        }
      }

      if (lean) {
        query = query.lean();
      }

      const document = await query;
      return document;
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  /**
   * Find multiple documents
   * @param {Object} criteria - Search criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Found documents
   */
  async find(criteria = {}, options = {}) {
    try {
      const { 
        select, 
        populate, 
        lean = false, 
        sort = { createdAt: -1 }, 
        limit, 
        skip 
      } = options;
      
      let query = this.model.find(criteria);

      if (select) {
        query = query.select(select);
      }

      if (populate) {
        if (Array.isArray(populate)) {
          populate.forEach(pop => query = query.populate(pop));
        } else {
          query = query.populate(populate);
        }
      }

      if (sort) {
        query = query.sort(sort);
      }

      if (skip) {
        query = query.skip(skip);
      }

      if (limit) {
        query = query.limit(limit);
      }

      if (lean) {
        query = query.lean();
      }

      const documents = await query;
      return documents;
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  /**
   * Find documents with pagination
   * @param {Object} criteria - Search criteria
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated results
   */
  async findWithPagination(criteria = {}, options = {}) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        select, 
        populate, 
        lean = false, 
        sort = { createdAt: -1 } 
      } = options;
      
      const skip = (page - 1) * limit;
      
      const [documents, total] = await Promise.all([
        this.find(criteria, { select, populate, lean, sort, limit, skip }),
        this.count(criteria)
      ]);

      return {
        data: documents,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  /**
   * Update document by ID
   * @param {string} id - Document ID
   * @param {Object} data - Update data
   * @param {Object} options - Update options
   * @returns {Promise<Object|null>} Updated document
   */
  async updateById(id, data, options = {}) {
    try {
      const { 
        new: returnNew = true, 
        runValidators = true, 
        select, 
        populate 
      } = options;
      
      let query = this.model.findByIdAndUpdate(id, data, {
        new: returnNew,
        runValidators
      });

      if (select) {
        query = query.select(select);
      }

      if (populate) {
        if (Array.isArray(populate)) {
          populate.forEach(pop => query = query.populate(pop));
        } else {
          query = query.populate(populate);
        }
      }

      const document = await query;
      
      if (!document) {
        throw new NotFoundError(`${this.model.modelName} not found`);
      }

      return document;
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  /**
   * Update one document by criteria
   * @param {Object} criteria - Search criteria
   * @param {Object} data - Update data
   * @param {Object} options - Update options
   * @returns {Promise<Object|null>} Updated document
   */
  async updateOne(criteria, data, options = {}) {
    try {
      const { 
        new: returnNew = true, 
        runValidators = true, 
        select, 
        populate 
      } = options;
      
      let query = this.model.findOneAndUpdate(criteria, data, {
        new: returnNew,
        runValidators
      });

      if (select) {
        query = query.select(select);
      }

      if (populate) {
        if (Array.isArray(populate)) {
          populate.forEach(pop => query = query.populate(pop));
        } else {
          query = query.populate(populate);
        }
      }

      const document = await query;
      return document;
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  /**
   * Update multiple documents
   * @param {Object} criteria - Search criteria
   * @param {Object} data - Update data
   * @param {Object} options - Update options
   * @returns {Promise<Object>} Update result
   */
  async updateMany(criteria, data, options = {}) {
    try {
      const { runValidators = true } = options;
      
      const result = await this.model.updateMany(criteria, data, {
        runValidators
      });

      return result;
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  /**
   * Delete document by ID
   * @param {string} id - Document ID
   * @param {Object} options - Delete options
   * @returns {Promise<Object|null>} Deleted document
   */
  async deleteById(id, options = {}) {
    try {
      const { select, populate } = options;
      
      let query = this.model.findByIdAndDelete(id);

      if (select) {
        query = query.select(select);
      }

      if (populate) {
        if (Array.isArray(populate)) {
          populate.forEach(pop => query = query.populate(pop));
        } else {
          query = query.populate(populate);
        }
      }

      const document = await query;
      
      if (!document) {
        throw new NotFoundError(`${this.model.modelName} not found`);
      }

      return document;
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  /**
   * Delete one document by criteria
   * @param {Object} criteria - Search criteria
   * @param {Object} options - Delete options
   * @returns {Promise<Object|null>} Deleted document
   */
  async deleteOne(criteria, options = {}) {
    try {
      const { select, populate } = options;
      
      let query = this.model.findOneAndDelete(criteria);

      if (select) {
        query = query.select(select);
      }

      if (populate) {
        if (Array.isArray(populate)) {
          populate.forEach(pop => query = query.populate(pop));
        } else {
          query = query.populate(populate);
        }
      }

      const document = await query;
      return document;
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  /**
   * Delete multiple documents
   * @param {Object} criteria - Search criteria
   * @returns {Promise<Object>} Delete result
   */
  async deleteMany(criteria) {
    try {
      const result = await this.model.deleteMany(criteria);
      return result;
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  /**
   * Count documents
   * @param {Object} criteria - Search criteria
   * @returns {Promise<number>} Document count
   */
  async count(criteria = {}) {
    try {
      const count = await this.model.countDocuments(criteria);
      return count;
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  /**
   * Check if document exists
   * @param {Object} criteria - Search criteria
   * @returns {Promise<boolean>} Existence status
   */
  async exists(criteria) {
    try {
      const count = await this.model.countDocuments(criteria);
      return count > 0;
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  /**
   * Aggregate documents
   * @param {Array} pipeline - Aggregation pipeline
   * @returns {Promise<Array>} Aggregation results
   */
  async aggregate(pipeline) {
    try {
      const results = await this.model.aggregate(pipeline);
      return results;
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  /**
   * Handle database errors
   * @param {Error} error - Database error
   * @throws {Error} Appropriate error type
   */
  handleDatabaseError(error) {
    if (error.name === 'CastError') {
      throw new ValidationError(`Invalid ${error.path}: ${error.value}`);
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(el => ({
        field: el.path,
        message: el.message,
        value: el.value
      }));
      throw new ValidationError(
        `Validation failed: ${errors.map(e => e.message).join(', ')}`,
        errors
      );
    }
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];
      throw new ValidationError(`${field} '${value}' already exists`);
    }
    
    // Re-throw other errors
    throw error;
  }
}

module.exports = BaseRepository;