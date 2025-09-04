const { sendSuccess: sendSuccessUtil, sendCreated, sendPaginated: sendPaginatedUtil } = require('../utils/response');
const { asyncHandler } = require('../utils/asyncHandler');
const { ValidationError } = require('../utils/errors');

/**
 * Base controller class with common functionality
 */
class BaseController {
  /**
   * Send success response
   * @param {Object} res - Express response object
   * @param {*} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code
   */
  sendSuccess(res, data = null, message = 'Success', statusCode = 200) {
    return sendSuccessUtil(res, statusCode, message, data);
  }

  /**
   * Send paginated response
   * @param {Object} res - Express response object
   * @param {Array} data - Response data
   * @param {number} page - Current page
   * @param {number} limit - Items per page
   * @param {number} total - Total items
   * @param {string} message - Success message
   */
  sendPaginated(res, data, page, limit, total) {
    return sendPaginatedUtil(res, data, {
      current: page,
      pages: Math.ceil(total / limit),
      total
    });
  }

  /**
   * Validate request body
   * @param {Object} body - Request body
   * @param {Array<string>} requiredFields - Required field names
   * @throws {ValidationError} If validation fails
   */
  validateRequestBody(body, requiredFields) {
    const missingFields = requiredFields.filter(field =>
      body[field] === undefined || body[field] === null || body[field] === ''
    );

    if (missingFields.length > 0) {
      throw new ValidationError(
        `Missing required fields: ${missingFields.join(', ')}`,
        { missingFields }
      );
    }
  }

  /**
   * Validate request parameters
   * @param {Object} params - Request parameters
   * @param {Array<string>} requiredParams - Required parameter names
   * @throws {ValidationError} If validation fails
   */
  validateRequestParams(params, requiredParams) {
    const missingParams = requiredParams.filter(param =>
      !params[param] || params[param] === ''
    );

    if (missingParams.length > 0) {
      throw new ValidationError(
        `Missing required parameters: ${missingParams.join(', ')}`,
        { missingParams }
      );
    }
  }

  /**
   * Sanitize request body
   * @param {Object} body - Request body
   * @param {Array<string>} allowedFields - Allowed field names
   * @returns {Object} Sanitized body
   */
  sanitizeRequestBody(body, allowedFields) {
    const sanitized = {};

    Object.keys(body).forEach(key => {
      if (allowedFields.includes(key)) {
        // Basic sanitization
        if (typeof body[key] === 'string') {
          sanitized[key] = body[key].trim();
        } else {
          sanitized[key] = body[key];
        }
      }
    });

    return sanitized;
  }

  /**
   * Get pagination parameters from query
   * @param {Object} query - Request query object
   * @returns {Object} Pagination parameters
   */
  getPaginationParams(query) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  /**
   * Get sorting parameters from query
   * @param {Object} query - Request query object
   * @param {Array<string>} allowedFields - Allowed sort fields
   * @param {string} defaultSort - Default sort field
   * @returns {Object} Sort parameters
   */
  getSortParams(query, allowedFields = [], defaultSort = 'createdAt') {
    const sortBy = query.sortBy || defaultSort;
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

    // Validate sort field
    if (allowedFields.length > 0 && !allowedFields.includes(sortBy)) {
      throw new ValidationError(
        `Invalid sort field. Allowed fields: ${allowedFields.join(', ')}`,
        { allowedFields, providedField: sortBy }
      );
    }

    return { sortBy, sortOrder };
  }

  /**
   * Get filter parameters from query
   * @param {Object} query - Request query object
   * @param {Array<string>} allowedFilters - Allowed filter fields
   * @returns {Object} Filter parameters
   */
  getFilterParams(query, allowedFilters = []) {
    const filters = {};

    allowedFilters.forEach(field => {
      if (query[field] !== undefined && query[field] !== '') {
        filters[field] = query[field];
      }
    });

    return filters;
  }

  /**
   * Handle service method execution
   * @param {Function} serviceMethod - Service method to execute
   * @param {Array} args - Arguments to pass to service method
   * @returns {Function} Express middleware function
   */
  handleService(serviceMethod, ...args) {
    return asyncHandler(async(req, res, next) => {
      try {
        const result = await serviceMethod(...args);
        this.sendSuccess(res, result);
      } catch (error) {
        next(error);
      }
    });
  }

  /**
   * Handle service method with custom response
   * @param {Function} serviceMethod - Service method to execute
   * @param {Function} responseHandler - Custom response handler
   * @param {Array} args - Arguments to pass to service method
   * @returns {Function} Express middleware function
   */
  handleServiceWithResponse(serviceMethod, responseHandler, ...args) {
    return asyncHandler(async(req, res, next) => {
      try {
        const result = await serviceMethod(...args);
        responseHandler(res, result);
      } catch (error) {
        next(error);
      }
    });
  }

  /**
   * Create CRUD operations for a service
   * @param {Object} service - Service instance
   * @param {string} resourceName - Name of the resource
   * @returns {Object} CRUD operation methods
   */
  createCRUDOperations(service, resourceName) {
    return {
      // Get all resources
      getAll: asyncHandler(async(req, res, next) => {
        try {
          const { page, limit, skip } = this.getPaginationParams(req.query);
          const filters = this.getFilterParams(req.query, service.getAllowedFilters?.() || []);
          const { sortBy, sortOrder } = this.getSortParams(req.query, service.getAllowedSortFields?.() || []);

          const result = await service.getAll({
            page,
            limit,
            skip,
            filters,
            sort: { [sortBy]: sortOrder }
          });

          this.sendPaginated(res, result.data, page, limit, result.total);
        } catch (error) {
          next(error);
        }
      }),

      // Get resource by ID
      getById: asyncHandler(async(req, res, next) => {
        try {
          this.validateRequestParams(req.params, ['id']);
          const result = await service.getById(req.params.id);
          this.sendSuccess(res, result);
        } catch (error) {
          next(error);
        }
      }),

      // Create new resource
      create: asyncHandler(async(req, res, next) => {
        try {
          const sanitizedBody = this.sanitizeRequestBody(req.body, service.getAllowedFields?.() || []);
          const result = await service.create(sanitizedBody);
          this.sendSuccess(res, result, `${resourceName} created successfully`, 201);
        } catch (error) {
          next(error);
        }
      }),

      // Update resource
      update: asyncHandler(async(req, res, next) => {
        try {
          this.validateRequestParams(req.params, ['id']);
          const sanitizedBody = this.sanitizeRequestBody(req.body, service.getAllowedFields?.() || []);
          const result = await service.update(req.params.id, sanitizedBody);
          this.sendSuccess(res, result, `${resourceName} updated successfully`);
        } catch (error) {
          next(error);
        }
      }),

      // Delete resource
      delete: asyncHandler(async(req, res, next) => {
        try {
          this.validateRequestParams(req.params, ['id']);
          await service.delete(req.params.id);
          this.sendSuccess(res, null, `${resourceName} deleted successfully`, 204);
        } catch (error) {
          next(error);
        }
      })
    };
  }
}

module.exports = BaseController;