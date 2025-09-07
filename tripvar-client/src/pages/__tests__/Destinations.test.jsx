import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Destinations from '../Destinations';
import authSlice from '../../store/slices/authSlice';
import destinationSlice from '../../store/slices/destinationSlice';

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockUseParams = vi.fn(() => ({ id: null }));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: mockUseParams,
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
  default: ({ destinations, onDestinationClick, onQuickBook, onCompareToggle, selectedDestinations }) => (
    <div data-testid="destinations-grid">
      <h2>Destinations Grid</h2>
      {destinations.map(dest => (
        <div key={dest._id} data-testid={`destination-${dest._id}`}>
          <h3>{dest.title}</h3>
          <button onClick={() => onDestinationClick(dest._id)}>View Details</button>
          <button onClick={() => onQuickBook(dest._id)}>Quick Book</button>
          <button onClick={() => onCompareToggle(dest._id)}>Compare</button>
        </div>
      ))}
      <div data-testid="selected-count">Selected: {selectedDestinations.length}</div>
    </div>
  ),
}));

vi.mock('../../components/destinations/DestinationDetail', () => ({
  default: ({ destination, onBack }) => (
    <div data-testid="destination-detail">
      <h2>{destination.title}</h2>
      <button onClick={onBack}>Back to Destinations</button>
    </div>
  ),
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
          {
            _id: '2',
            title: 'Mountain Retreat',
            location: 'Switzerland',
            description: 'A peaceful mountain getaway',
            imageUrl: 'https://example.com/mountain.jpg',
            rating: 4.6,
            ratingCount: 89,
            price: 799,
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

describe('Destinations Component', () => {
  let store;
  let mockDispatch;

  beforeEach(() => {
    vi.clearAllMocks();
    store = createTestStore();
    mockDispatch = vi.spyOn(store, 'dispatch');
  });

  const renderDestinations = (storeState = {}) => {
    const testStore = createTestStore({
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
          {
            _id: '2',
            title: 'Mountain Retreat',
            location: 'Switzerland',
            description: 'A peaceful mountain getaway',
            imageUrl: 'https://example.com/mountain.jpg',
            rating: 4.6,
            ratingCount: 89,
            price: 799,
          },
        ],
        ...storeState.destinations,
      },
    });
    return render(
      <TestWrapper store={testStore}>
        <Destinations />
      </TestWrapper>
    );
  };

  describe('Rendering', () => {
    it('renders destinations page with header and footer', () => {
      renderDestinations();

      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('page-transition')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('renders destinations grid with destinations', () => {
      renderDestinations();

      expect(screen.getByTestId('destinations-grid')).toBeInTheDocument();
      expect(screen.getByTestId('destination-1')).toBeInTheDocument();
      expect(screen.getByTestId('destination-2')).toBeInTheDocument();
      expect(screen.getByText('Beach Paradise')).toBeInTheDocument();
      expect(screen.getByText('Mountain Retreat')).toBeInTheDocument();
    });

    it('renders breadcrumb navigation', () => {
      renderDestinations();

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Destinations')).toBeInTheDocument();
    });

    it('renders page title and description', () => {
      renderDestinations();

      expect(screen.getByText('Discover Amazing Destinations')).toBeInTheDocument();
      expect(screen.getByText(/Explore our curated collection/)).toBeInTheDocument();
    });

    it('renders feature indicators', () => {
      renderDestinations();

      expect(screen.getByText('Real-time availability')).toBeInTheDocument();
      expect(screen.getByText('Instant booking')).toBeInTheDocument();
      expect(screen.getByText('Secure payments')).toBeInTheDocument();
      expect(screen.getByText('Best price guarantee')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('renders loading state when destinations are loading', () => {
      renderDestinations({
        destinations: { loading: true }
      });

      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('renders error state when there is an error', () => {
      renderDestinations({
        destinations: { error: 'Failed to load destinations' }
      });

      expect(screen.getByTestId('error-state')).toBeInTheDocument();
      expect(screen.getByText('Error: Failed to load destinations')).toBeInTheDocument();
    });
  });

  describe('Destination Selection and Comparison', () => {
    it('handles destination selection for comparison', () => {
      renderDestinations();

      const compareButton = screen.getAllByText('Compare')[0];
      fireEvent.click(compareButton);

      expect(screen.getByTestId('selected-count')).toHaveTextContent('Selected: 1');
    });

    it('limits comparison to 3 destinations', () => {
      renderDestinations();

      // Add a third destination to the mock
      const testStore = createTestStore({
        destinations: {
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
            {
              _id: '2',
              title: 'Mountain Retreat',
              location: 'Switzerland',
              description: 'A peaceful mountain getaway',
              imageUrl: 'https://example.com/mountain.jpg',
              rating: 4.6,
              ratingCount: 89,
              price: 799,
            },
            {
              _id: '3',
              title: 'City Adventure',
              location: 'Tokyo',
              description: 'An exciting urban experience',
              imageUrl: 'https://example.com/city.jpg',
              rating: 4.7,
              ratingCount: 120,
              price: 699,
            },
            {
              _id: '4',
              title: 'Desert Oasis',
              location: 'Dubai',
              description: 'A luxurious desert experience',
              imageUrl: 'https://example.com/desert.jpg',
              rating: 4.9,
              ratingCount: 200,
              price: 899,
            },
          ],
        },
      });

      render(
        <TestWrapper store={testStore}>
          <Destinations />
        </TestWrapper>
      );

      // Select 3 destinations
      const compareButtons = screen.getAllByText('Compare');
      fireEvent.click(compareButtons[0]);
      fireEvent.click(compareButtons[1]);
      fireEvent.click(compareButtons[2]);

      expect(screen.getByTestId('selected-count')).toHaveTextContent('Selected: 3');

      // Try to select a 4th destination
      fireEvent.click(compareButtons[3]);

      // Should still be 3
      expect(screen.getByTestId('selected-count')).toHaveTextContent('Selected: 3');
    });

    it('shows comparison bar when destinations are selected', () => {
      renderDestinations();

      const compareButton = screen.getAllByText('Compare')[0];
      fireEvent.click(compareButton);

      expect(screen.getByText(/1 destination selected/)).toBeInTheDocument();
      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });

    it('clears all selected destinations', () => {
      renderDestinations();

      // Select some destinations
      const compareButtons = screen.getAllByText('Compare');
      fireEvent.click(compareButtons[0]);
      fireEvent.click(compareButtons[1]);

      expect(screen.getByTestId('selected-count')).toHaveTextContent('Selected: 2');

      // Clear all
      const clearAllButton = screen.getByText('Clear All');
      fireEvent.click(clearAllButton);

      expect(screen.getByTestId('selected-count')).toHaveTextContent('Selected: 0');
    });
  });

  describe('Navigation', () => {
    it('navigates to home when clicking breadcrumb', () => {
      renderDestinations();

      const homeLink = screen.getByText('Home');
      fireEvent.click(homeLink);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('navigates to destination detail when clicking view details', () => {
      renderDestinations();

      const viewDetailsButton = screen.getAllByText('View Details')[0];
      fireEvent.click(viewDetailsButton);

      expect(mockNavigate).toHaveBeenCalledWith('/destinations/1');
    });

    it('navigates to destination detail with booking action for quick book', () => {
      renderDestinations();

      const quickBookButton = screen.getAllByText('Quick Book')[0];
      fireEvent.click(quickBookButton);

      expect(mockNavigate).toHaveBeenCalledWith('/destinations/1?action=book');
    });
  });

  describe('Logout Functionality', () => {
    it('renders header with logout button', () => {
      renderDestinations();

      expect(screen.getByTestId('logout-button')).toBeInTheDocument();
    });

    it('dispatches logout action when logout button is clicked', () => {
      renderDestinations();

      const logoutButton = screen.getByTestId('logout-button');
      fireEvent.click(logoutButton);

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('auth/logout'),
        })
      );
    });
  });

  describe('Destination Detail View', () => {
    it('renders destination detail when id is provided', () => {
      // Mock useParams to return an id
      mockUseParams.mockReturnValue({ id: '1' });

      renderDestinations();

      expect(screen.getByTestId('destination-detail')).toBeInTheDocument();
      expect(screen.getByText('Beach Paradise')).toBeInTheDocument();
      expect(screen.getByText('Back to Destinations')).toBeInTheDocument();
    });

    it('renders error when destination is not found', () => {
      // Mock useParams to return a non-existent id
      mockUseParams.mockReturnValue({ id: '999' });

      renderDestinations();

      expect(screen.getByTestId('error-state')).toBeInTheDocument();
      expect(screen.getByText('Error: Destination not found')).toBeInTheDocument();
    });

    it('navigates back to destinations list', () => {
      // Mock useParams to return an id
      mockUseParams.mockReturnValue({ id: '1' });

      renderDestinations();

      const backButton = screen.getByText('Back to Destinations');
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/destinations');
    });
  });

  describe('Data Fetching', () => {
    it('dispatches fetchDestinations action on mount', () => {
      renderDestinations();

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('destinations/fetchDestinations'),
        })
      );
    });
  });
});