import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Destinations from '../Destinations';
import authSlice from '../../store/slices/authSlice';
import destinationSlice from '../../store/slices/destinationSlice';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ id: null }),
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
vi.mock('../../components/destinations/DestinationsGrid', () => ({
  default: () => <div data-testid="destinations-grid">Destinations Grid</div>,
}));

vi.mock('../../components/destinations/DestinationDetail', () => ({
  default: () => <div data-testid="destination-detail">Destination Detail</div>,
}));

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

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

// Mock the fetchDestinations action to prevent loading state
vi.mock('../../store/slices/destinationSlice', async () => {
  const actual = await vi.importActual('../../store/slices/destinationSlice');
  return {
    ...actual,
    fetchDestinations: vi.fn(() => ({ type: 'destinations/fetchDestinations' })),
  };
});

// Test utilities
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice,
      destinations: destinationSlice,
    },
    preloadedState: {
      auth: {
        loading: false,
        error: null,
        isAuthenticated: true,
        user: { id: '1', name: 'Test User' },
        ...initialState.auth,
      },
      destinations: {
        loading: false,
        error: null,
        destinations: [
          {
            _id: '1',
            title: 'Beach Paradise',
            location: 'Maldives',
            description: 'A beautiful tropical destination',
            imageUrl: 'https://example.com/beach.jpg',
            rating: 4.8,
            ratingCount: 150,
            price: 599,
          },
        ],
        ...initialState.destinations,
      },
    },
  });
};

const TestWrapper = ({ children, store }) => (
  <Provider store={store}>
    <BrowserRouter>{children}</BrowserRouter>
  </Provider>
);

describe('Destinations Component - Simple Tests', () => {
  it('renders without crashing', () => {
    const store = createTestStore();
    
    render(
      <TestWrapper store={store}>
        <Destinations />
      </TestWrapper>
    );

    // Should render without throwing an error
    expect(screen.getByTestId('page-transition')).toBeInTheDocument();
  });

  it('renders loading state when loading is true', () => {
    const store = createTestStore({
      destinations: { loading: true }
    });
    
    render(
      <TestWrapper store={store}>
        <Destinations />
      </TestWrapper>
    );

    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('renders error state when there is an error', () => {
    const store = createTestStore({
      destinations: { error: 'Failed to load destinations' }
    });
    
    render(
      <TestWrapper store={store}>
        <Destinations />
      </TestWrapper>
    );

    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByText('Error: Failed to load destinations')).toBeInTheDocument();
  });

  it('renders destinations grid when not loading and no error', () => {
    const store = createTestStore();
    
    render(
      <TestWrapper store={store}>
        <Destinations />
      </TestWrapper>
    );

    expect(screen.getByTestId('destinations-grid')).toBeInTheDocument();
  });

  it('renders header with logout button', () => {
    const store = createTestStore();
    
    render(
      <TestWrapper store={store}>
        <Destinations />
      </TestWrapper>
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('logout-button')).toBeInTheDocument();
  });
});