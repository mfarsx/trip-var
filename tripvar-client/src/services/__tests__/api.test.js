import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

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

// Mock environment variables
vi.stubGlobal('import', {
  meta: {
    env: {
      DEV: true,
      VITE_API_URL: 'http://localhost:8000',
    },
  },
});

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
  let apiModule;

  beforeEach(async () => {
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
      defaults: {
        baseURL: '/api/v1',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    };
    
    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    
    // Import the API module after mocking
    apiModule = await import('../api');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Configuration', () => {
    it('should create axios instance with correct configuration', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: '/api/v1',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('Interceptors', () => {
    it('should set up request and response interceptors', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('API Methods', () => {
    it('should export destination API methods', () => {
      expect(apiModule.destinationApi).toBeDefined();
      expect(apiModule.destinationApi.getDestinations).toBeDefined();
      expect(apiModule.destinationApi.getDestinationById).toBeDefined();
      expect(apiModule.destinationApi.searchDestinations).toBeDefined();
    });

    it('should export default api instance', () => {
      expect(apiModule.default).toBeDefined();
      expect(apiModule.default.defaults).toBeDefined();
      expect(apiModule.default.defaults.baseURL).toBeDefined();
    });
  });
});