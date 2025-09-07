import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Bookings from '../Bookings';
import authSlice from '../../store/slices/authSlice';
import bookingSlice from '../../store/slices/bookingSlice';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock components
vi.mock('../../components/header/Header', () => ({
  default: ({ onLogout }) => (
    <header data-testid="header">
      <button onClick={onLogout} data-testid="logout-button">Logout</button>
    </header>
  ),
}));

vi.mock('../../components/common/LoadingState', () => ({
  default: () => <div data-testid="loading-state">Loading...</div>,
}));

vi.mock('../../components/common/ErrorState', () => ({
  default: ({ error }) => <div data-testid="error-state">Error: {error}</div>,
}));

vi.mock('../../components/common/PageTransition', () => ({
  default: ({ children }) => <div data-testid="page-transition">{children}</div>,
}));

vi.mock('../../components/layout/Footer', () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

// Mock the fetchUserBookings action to prevent loading state
vi.mock('../../store/slices/bookingSlice', async () => {
  const actual = await vi.importActual('../../store/slices/bookingSlice');
  return {
    ...actual,
    fetchUserBookings: vi.fn(() => ({ type: 'bookings/fetchUserBookings' })),
  };
});

// Test utilities
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice,
      bookings: bookingSlice,
    },
    preloadedState: {
      auth: {
        loading: false,
        error: null,
        isAuthenticated: true,
        user: { id: '1', name: 'Test User' },
        ...initialState.auth,
      },
      bookings: {
        loading: false,
        error: null,
        bookings: [
          {
            _id: '1',
            destination: {
              _id: 'dest1',
              title: 'Beach Paradise',
              location: 'Maldives',
              imageUrl: 'https://example.com/beach.jpg',
            },
            checkIn: '2024-01-15',
            checkOut: '2024-01-20',
            guests: 2,
            totalAmount: 2995,
            status: 'confirmed',
            createdAt: '2024-01-01T00:00:00Z',
          },
        ],
        cancelling: false,
        ...initialState.bookings,
      },
    },
  });
};

const TestWrapper = ({ children, store }) => (
  <Provider store={store}>
    <BrowserRouter>{children}</BrowserRouter>
  </Provider>
);

describe('Bookings Component - Simple Tests', () => {
  it('renders without crashing', () => {
    const store = createTestStore();
    
    render(
      <TestWrapper store={store}>
        <Bookings />
      </TestWrapper>
    );

    // Should render without throwing an error
    expect(screen.getByTestId('page-transition')).toBeInTheDocument();
  });

  it('renders loading state when loading is true', () => {
    const store = createTestStore({
      bookings: { loading: true }
    });
    
    render(
      <TestWrapper store={store}>
        <Bookings />
      </TestWrapper>
    );

    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('renders error state when there is an error', () => {
    const store = createTestStore({
      bookings: { error: 'Failed to load bookings' }
    });
    
    render(
      <TestWrapper store={store}>
        <Bookings />
      </TestWrapper>
    );

    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByText('Error: Failed to load bookings')).toBeInTheDocument();
  });

  it('renders bookings content when not loading and no error', () => {
    const store = createTestStore();
    
    render(
      <TestWrapper store={store}>
        <Bookings />
      </TestWrapper>
    );

    // Should render the main content (not loading state)
    expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    expect(screen.queryByTestId('error-state')).not.toBeInTheDocument();
  });

  it('renders header with logout button', () => {
    const store = createTestStore();
    
    render(
      <TestWrapper store={store}>
        <Bookings />
      </TestWrapper>
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('logout-button')).toBeInTheDocument();
  });
});