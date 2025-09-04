const {
  successResponse,
  paginatedResponse
} = require('../utils/response');

const {
  ValidationError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  InternalServerError
} = require('../utils/errors');

const { asyncHandler } = require('../utils/asyncHandler');

describe('Utility Functions', () => {
  describe('Response Utilities', () => {
    describe('successResponse', () => {
      it('should create success response with data', () => {
        const data = { id: 1, name: 'Test' };
        const response = successResponse(data, 'Success message');

        expect(response).toEqual({
          status: 'success',
          message: 'Success message',
          data: data
        });
      });

      it('should create success response with default message', () => {
        const data = { id: 1, name: 'Test' };
        const response = successResponse(data);

        expect(response).toEqual({
          status: 'success',
          message: 'Success',
          data: data
        });
      });

      it('should create success response with null data', () => {
        const response = successResponse(null, 'No data');

        expect(response).toEqual({
          status: 'success',
          message: 'No data',
          data: null
        });
      });
    });

    describe('paginatedResponse', () => {
      it('should create paginated response', () => {
        const data = [{ id: 1 }, { id: 2 }];
        const response = paginatedResponse(data, 1, 10, 25);

        expect(response).toEqual({
          status: 'success',
          data: data,
          pagination: {
            page: 1,
            limit: 10,
            total: 25,
            pages: 3
          }
        });
      });
    });


  });

  describe('Error Classes', () => {
    describe('ValidationError', () => {
      it('should create validation error with message', () => {
        const error = new ValidationError('Invalid input');
        
        expect(error.message).toBe('Invalid input');
        expect(error.statusCode).toBe(400);
        expect(error.constructor.name).toBe('ValidationError');
        expect(error.code).toBe('VALIDATION_ERROR');
      });

      it('should create validation error with default message', () => {
        const error = new ValidationError();
        
        expect(error.message).toBe('Validation failed');
        expect(error.statusCode).toBe(400);
        expect(error.code).toBe('VALIDATION_ERROR');
      });
    });

    describe('NotFoundError', () => {
      it('should create not found error with message', () => {
        const error = new NotFoundError('Resource not found');
        
        expect(error.message).toBe('Resource not found');
        expect(error.statusCode).toBe(404);
        expect(error.constructor.name).toBe('NotFoundError');
        expect(error.code).toBe('RESOURCE_NOT_FOUND');
      });
    });

    describe('ConflictError', () => {
      it('should create conflict error with message', () => {
        const error = new ConflictError('Resource conflict');
        
        expect(error.message).toBe('Resource conflict');
        expect(error.statusCode).toBe(409);
        expect(error.constructor.name).toBe('ConflictError');
        expect(error.code).toBe('CONFLICT');
      });
    });

    describe('UnauthorizedError', () => {
      it('should create unauthorized error with message', () => {
        const error = new UnauthorizedError('Unauthorized access');
        
        expect(error.message).toBe('Unauthorized access');
        expect(error.statusCode).toBe(401);
        expect(error.constructor.name).toBe('UnauthorizedError');
        expect(error.code).toBe('UNAUTHORIZED');
      });
    });

    describe('ForbiddenError', () => {
      it('should create forbidden error with message', () => {
        const error = new ForbiddenError('Access forbidden');
        
        expect(error.message).toBe('Access forbidden');
        expect(error.statusCode).toBe(403);
        expect(error.constructor.name).toBe('ForbiddenError');
        expect(error.code).toBe('FORBIDDEN');
      });
    });

    describe('InternalServerError', () => {
      it('should create server error with message', () => {
        const error = new InternalServerError('Internal server error');
        
        expect(error.message).toBe('Internal server error');
        expect(error.statusCode).toBe(500);
        expect(error.constructor.name).toBe('InternalServerError');
        expect(error.code).toBe('INTERNAL_SERVER_ERROR');
      });
    });
  });

  describe('Async Handler', () => {
    it('should handle successful async function', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const mockReq = {};
      const mockRes = {};
      const mockNext = jest.fn();
      const wrappedFn = asyncHandler(mockFn);
      
      await wrappedFn(mockReq, mockRes, mockNext);
      
      expect(mockFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle async function that throws error', async () => {
      const mockError = new Error('Test error');
      const mockFn = jest.fn().mockRejectedValue(mockError);
      const mockReq = {};
      const mockRes = {};
      const mockNext = jest.fn();
      const wrappedFn = asyncHandler(mockFn);
      
      await wrappedFn(mockReq, mockRes, mockNext);
      
      expect(mockFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });

    it('should handle async function that throws ValidationError', async () => {
      const mockError = new ValidationError('Validation failed');
      const mockFn = jest.fn().mockRejectedValue(mockError);
      const mockReq = {};
      const mockRes = {};
      const mockNext = jest.fn();
      const wrappedFn = asyncHandler(mockFn);
      
      await wrappedFn(mockReq, mockRes, mockNext);
      
      expect(mockFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });

    it('should handle async function that throws NotFoundError', async () => {
      const mockError = new NotFoundError('Not found');
      const mockFn = jest.fn().mockRejectedValue(mockError);
      const mockReq = {};
      const mockRes = {};
      const mockNext = jest.fn();
      const wrappedFn = asyncHandler(mockFn);
      
      await wrappedFn(mockReq, mockRes, mockNext);
      
      expect(mockFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });

    it('should handle async function that throws ConflictError', async () => {
      const mockError = new ConflictError('Conflict');
      const mockFn = jest.fn().mockRejectedValue(mockError);
      const mockReq = {};
      const mockRes = {};
      const mockNext = jest.fn();
      const wrappedFn = asyncHandler(mockFn);
      
      await wrappedFn(mockReq, mockRes, mockNext);
      
      expect(mockFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });

    it('should handle async function that throws UnauthorizedError', async () => {
      const mockError = new UnauthorizedError('Unauthorized');
      const mockFn = jest.fn().mockRejectedValue(mockError);
      const mockReq = {};
      const mockRes = {};
      const mockNext = jest.fn();
      const wrappedFn = asyncHandler(mockFn);
      
      await wrappedFn(mockReq, mockRes, mockNext);
      
      expect(mockFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });

    it('should handle async function that throws ForbiddenError', async () => {
      const mockError = new ForbiddenError('Forbidden');
      const mockFn = jest.fn().mockRejectedValue(mockError);
      const mockReq = {};
      const mockRes = {};
      const mockNext = jest.fn();
      const wrappedFn = asyncHandler(mockFn);
      
      await wrappedFn(mockReq, mockRes, mockNext);
      
      expect(mockFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });

    it('should handle async function that throws InternalServerError', async () => {
      const mockError = new InternalServerError('Server error');
      const mockFn = jest.fn().mockRejectedValue(mockError);
      const mockReq = {};
      const mockRes = {};
      const mockNext = jest.fn();
      const wrappedFn = asyncHandler(mockFn);
      
      await wrappedFn(mockReq, mockRes, mockNext);
      
      expect(mockFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });

    it('should handle async function that throws generic Error', async () => {
      const mockError = new Error('Generic error');
      const mockFn = jest.fn().mockRejectedValue(mockError);
      const mockReq = {};
      const mockRes = {};
      const mockNext = jest.fn();
      const wrappedFn = asyncHandler(mockFn);
      
      await wrappedFn(mockReq, mockRes, mockNext);
      
      expect(mockFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe('Error Handling Integration', () => {
    it('should properly handle error chain', () => {
      const validationError = new ValidationError('Invalid input');
      const notFoundError = new NotFoundError('Resource not found');
      const conflictError = new ConflictError('Resource conflict');
      const unauthorizedError = new UnauthorizedError('Unauthorized');
      const forbiddenError = new ForbiddenError('Forbidden');
      const serverError = new InternalServerError('Server error');

      expect(validationError.statusCode).toBe(400);
      expect(notFoundError.statusCode).toBe(404);
      expect(conflictError.statusCode).toBe(409);
      expect(unauthorizedError.statusCode).toBe(401);
      expect(forbiddenError.statusCode).toBe(403);
      expect(serverError.statusCode).toBe(500);
    });

    it('should maintain error inheritance', () => {
      const validationError = new ValidationError('Test');
      const notFoundError = new NotFoundError('Test');
      const conflictError = new ConflictError('Test');
      const unauthorizedError = new UnauthorizedError('Test');
      const forbiddenError = new ForbiddenError('Test');
      const serverError = new InternalServerError('Test');

      expect(validationError).toBeInstanceOf(Error);
      expect(notFoundError).toBeInstanceOf(Error);
      expect(conflictError).toBeInstanceOf(Error);
      expect(unauthorizedError).toBeInstanceOf(Error);
      expect(forbiddenError).toBeInstanceOf(Error);
      expect(serverError).toBeInstanceOf(Error);
    });
  });
});