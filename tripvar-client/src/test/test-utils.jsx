import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authSlice from '../store/slices/authSlice';

// Mock framer-motion globally
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
  },
}));

// Create test store
export const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: { auth: authSlice },
    preloadedState: {
      auth: {
        loading: false,
        error: null,
        isAuthenticated: false,
        user: null,
        ...initialState,
      },
    },
  });
};

// Test wrapper component
export const TestWrapper = ({ children, store }) => (
  <Provider store={store}>
    <BrowserRouter>{children}</BrowserRouter>
  </Provider>
);

// Custom render function with providers
export const renderWithProviders = (ui, { store = createTestStore(), ...renderOptions } = {}) => {
  const Wrapper = ({ children }) => (
    <TestWrapper store={store}>{children}</TestWrapper>
  );

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

// Mock react-router-dom utilities
export const mockNavigate = vi.fn();
export const mockLocation = { 
  state: null,
  pathname: '/',
  search: '',
  hash: '',
};

// Setup react-router-dom mocks
export const setupRouterMocks = () => {
  vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
      ...actual,
      useNavigate: () => mockNavigate,
      useLocation: () => mockLocation,
      Navigate: ({ to }) => <div data-testid="navigate" data-to={to} />,
    };
  });
};