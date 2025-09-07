import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import api from '../api';
import logger from '../../utils/logger';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

// Mock logger
vi.mock('../../utils/logger', () => ({
  default: {
    logRequest: vi.fn(),
    logResponse: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.location
const mockLocation = {
  href: '',
  pathname: '/',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
});

// Mock dynamic imports
const mockStore = {
  dispatch: vi.fn(),
};
const mockLogoutAction = vi.fn();

vi.mock('../store', () => ({
  store: mockStore,
}));

vi.mock('../store/slices/authSlice', () => ({
  logout: mockLogoutAction,
}));

describe('API Service', () => {
  let mockAxiosInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create a mock axios instance
    mockAxiosInstance = {
      interceptors: {
        request: {
          use: vi.fn(),
        },
        response: {
          use: vi.fn(),
        },
      },
      create: vi.fn(),
    };
    
    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    
    // Mock the interceptors to call the actual functions
    mockAxiosInstance.interceptors.request.use.mockImplementation((onFulfilled, onRejected) => {
      mockAxiosInstance.requestInterceptor = { onFulfilled, onRejected };
    });
    
    mockAxiosInstance.interceptors.response.use.mockImplementation((onFulfilled, onRejected) => {
      mockAxiosInstance.responseInterceptor = { onFulfilled, onRejected };
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Configuration', () => {
    it('should create axios instance with correct base URL in development', () => {
      // Mock environment
      vi.stubGlobal('import', {
        meta: {
          env: {
            DEV: true,
            VITE_API_URL: 'http://localhost:8000',
          },
        },
      });

      // Re-import to trigger the configuration
      vi.resetModules();
      require('../api');

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: '/api/v1',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should create axios instance with correct base URL in production', () => {
      // Mock environment
      vi.stubGlobal('import', {
        meta: {
          env: {
            DEV: false,
            VITE_API_URL: 'https://api.tripvar.com',
          },
        },
      });

      // Re-import to trigger the configuration
      vi.resetModules();
      require('../api');

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.tripvar.com/api/v1',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('Request Interceptor', () => {
    it('should add authorization header when token exists', () => {
      localStorageMock.getItem.mockReturnValue('test-token');
      
      const config = {
        method: 'get',
        url: '/test',
        headers: {},
      };

      const result = mockAxiosInstance.requestInterceptor.onFulfilled(config);

      expect(result.headers.Authorization).toBe('Bearer test-token');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
    });

    it('should not add authorization header when no token', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const config = {
        method: 'get',
        url: '/test',
        headers: {},
      };

      const result = mockAxiosInstance.requestInterceptor.onFulfilled(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('should log request and add metadata', () => {
      localStorageMock.getItem.mockReturnValue('test-token');
      
      const config = {
        method: 'post',
        url: '/test',
        headers: {},
        data: { test: 'data' },
      };

      const result = mockAxiosInstance.requestInterceptor.onFulfilled(config);

      expect(logger.logRequest).toHaveBeenCalledWith('POST', '/test', { test: 'data' });
      expect(result.metadata).toHaveProperty('startTime');
      expect(result.metadata.startTime).toBeInstanceOf(Date);
    });

    it('should handle request errors', () => {
      const error = new Error('Request failed');
      
      expect(() => {
        mockAxiosInstance.requestInterceptor.onRejected(error);
      }).toThrow(error);
      
      expect(logger.error).toHaveBeenCalledWith('Request error', error);
    });
  });

  describe('Response Interceptor', () => {
    it('should log successful response', () => {
      const response = {
        config: {
          method: 'get',
          url: '/test',
          metadata: { startTime: new Date(Date.now() - 100) },
        },
        status: 200,
        data: { success: true },
      };

      const result = mockAxiosInstance.responseInterceptor.onFulfilled(response);

      expect(logger.logResponse).toHaveBeenCalledWith(
        'GET',
        '/test',
        response,
        expect.any(Number)
      );
      expect(result).toBe(response);
    });

    it('should handle 401 unauthorized error', async () => {
      localStorageMock.getItem.mockReturnValue('invalid-token');
      mockLocation.pathname = '/dashboard';
      
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
        config: {
          method: 'get',
          url: '/test',
          metadata: { startTime: new Date(Date.now() - 100) },
        },
      };

      // Mock dynamic imports
      vi.doMock('../store', () => ({ store: mockStore }));
      vi.doMock('../store/slices/authSlice', () => ({ logout: mockLogoutAction }));

      await expect(mockAxiosInstance.responseInterceptor.onRejected(error)).rejects.toBe(error);

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(mockStore.dispatch).toHaveBeenCalledWith(mockLogoutAction);
      expect(mockLocation.href).toBe('/login');
    });

    it('should not handle 401 error when on login page', async () => {
      mockLocation.pathname = '/login';
      
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
        config: {
          method: 'get',
          url: '/test',
          metadata: { startTime: new Date(Date.now() - 100) },
        },
      };

      await expect(mockAxiosInstance.responseInterceptor.onRejected(error)).rejects.toBe(error);

      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
      expect(mockStore.dispatch).not.toHaveBeenCalled();
    });

    it('should not handle 401 error when already refreshing', async () => {
      // Set isRefreshing to true
      vi.doMock('../api', () => ({
        default: mockAxiosInstance,
        isRefreshing: true,
      }));
      
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
        config: {
          method: 'get',
          url: '/test',
          metadata: { startTime: new Date(Date.now() - 100) },
        },
      };

      await expect(mockAxiosInstance.responseInterceptor.onRejected(error)).rejects.toBe(error);

      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
    });

    it('should handle non-401 errors', async () => {
      const error = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' },
        },
        config: {
          method: 'get',
          url: '/test',
          metadata: { startTime: new Date(Date.now() - 100) },
        },
      };

      await expect(mockAxiosInstance.responseInterceptor.onRejected(error)).rejects.toBe(error);

      expect(logger.error).toHaveBeenCalledWith('Response error', {
        method: 'GET',
        url: '/test',
        duration: expect.stringMatching(/\d+ms/),
        error: { message: 'Internal Server Error' },
      });
    });

    it('should handle network errors', async () => {
      const error = {
        message: 'Network Error',
        config: {
          method: 'get',
          url: '/test',
          metadata: { startTime: new Date(Date.now() - 100) },
        },
      };

      await expect(mockAxiosInstance.responseInterceptor.onRejected(error)).rejects.toBe(error);

      expect(logger.error).toHaveBeenCalledWith('Response error', {
        method: 'GET',
        url: '/test',
        duration: expect.stringMatching(/\d+ms/),
        error: 'Network Error',
      });
    });
  });

  describe('API Methods', () => {
    it('should export destination API methods', async () => {
      const { destinationApi } = await import('../api');
      expect(destinationApi.getDestinations).toBeDefined();
      expect(destinationApi.getDestinationById).toBeDefined();
      expect(destinationApi.searchDestinations).toBeDefined();
    });

    it('should export default api instance', () => {
      expect(api).toBeDefined();
      expect(api.defaults).toBeDefined();
      expect(api.defaults.baseURL).toBeDefined();
    });
  });
});