import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Bookings from '../Bookings';
import authSlice from '../../store/slices/authSlice';
import bookingSlice from '../../store/slices/bookingSlice';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
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
            checkInDate: '2024-01-15',
            checkOutDate: '2024-01-20',
            numberOfGuests: 2,
            totalAmount: 2995,
            totalNights: 5,
            pricePerNight: 599,
            status: 'confirmed',
            createdAt: '2024-01-01T00:00:00Z',
            bookingReference: 'BK001',
            contactEmail: 'test@example.com',
            paymentMethod: 'credit-card',
            paymentStatus: 'paid',
          },
          {
            _id: '2',
            destination: {
              _id: 'dest2',
              title: 'Mountain Retreat',
              location: 'Switzerland',
              imageUrl: 'https://example.com/mountain.jpg',
            },
            checkInDate: '2024-02-01',
            checkOutDate: '2024-02-05',
            numberOfGuests: 1,
            totalAmount: 3995,
            totalNights: 4,
            pricePerNight: 998.75,
            status: 'completed',
            createdAt: '2024-01-15T00:00:00Z',
            bookingReference: 'BK002',
            contactEmail: 'test2@example.com',
            paymentMethod: 'paypal',
            paymentStatus: 'paid',
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

describe('Bookings Component', () => {
  let store;
  let mockDispatch;

  beforeEach(() => {
    vi.clearAllMocks();
    store = createTestStore();
    mockDispatch = vi.spyOn(store, 'dispatch');
  });

  const renderBookings = (storeState = {}) => {
    const testStore = createTestStore({
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
            checkInDate: '2024-01-15',
            checkOutDate: '2024-01-20',
            numberOfGuests: 2,
            totalAmount: 2995,
            totalNights: 5,
            pricePerNight: 599,
            status: 'confirmed',
            createdAt: '2024-01-01T00:00:00Z',
            bookingReference: 'BK001',
            contactEmail: 'test@example.com',
          },
          {
            _id: '2',
            destination: {
              _id: 'dest2',
              title: 'Mountain Retreat',
              location: 'Switzerland',
              imageUrl: 'https://example.com/mountain.jpg',
            },
            checkInDate: '2024-02-01',
            checkOutDate: '2024-02-05',
            numberOfGuests: 1,
            totalAmount: 3995,
            totalNights: 4,
            pricePerNight: 998.75,
            status: 'completed',
            createdAt: '2024-01-15T00:00:00Z',
            bookingReference: 'BK002',
            contactEmail: 'test2@example.com',
          },
        ],
        cancelling: false,
        ...storeState.bookings,
      },
    });
    return render(
      <TestWrapper store={testStore}>
        <Bookings />
      </TestWrapper>
    );
  };

  describe('Rendering', () => {
    it('renders bookings page with header and footer', async () => {
      renderBookings();

      await waitFor(() => {
        expect(screen.getByTestId('header')).toBeInTheDocument();
      });
      
      expect(screen.getByTestId('page-transition')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('renders page title', async () => {
      renderBookings();

      await waitFor(() => {
        expect(screen.getByText('My Bookings')).toBeInTheDocument();
      });
    });

    it('renders bookings list', async () => {
      renderBookings();

      await waitFor(() => {
        expect(screen.getByText('Beach Paradise')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Mountain Retreat')).toBeInTheDocument();
      expect(screen.getByText('Maldives')).toBeInTheDocument();
      expect(screen.getByText('Switzerland')).toBeInTheDocument();
    });

    it('renders booking details', async () => {
      renderBookings();

      await waitFor(() => {
        expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();
      });
      
      expect(screen.getByText(/Jan 20, 2024/)).toBeInTheDocument();
      expect(screen.getByText(/Feb 1, 2024/)).toBeInTheDocument();
      expect(screen.getByText(/Feb 5, 2024/)).toBeInTheDocument();
      expect(screen.getByText('$2,995')).toBeInTheDocument();
      expect(screen.getByText('$3,995')).toBeInTheDocument();
    });

    it('renders booking status badges', async () => {
      renderBookings();

      await waitFor(() => {
        expect(screen.getByText('Confirmed')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('renders loading state when bookings are loading', () => {
      renderBookings({
        bookings: { loading: true }
      });

      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('renders error state when there is an error', () => {
      renderBookings({
        bookings: { error: 'Failed to load bookings' }
      });

      expect(screen.getByTestId('error-state')).toBeInTheDocument();
      expect(screen.getByText('Error: Failed to load bookings')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('renders empty state when no bookings exist', () => {
      renderBookings({
        bookings: { bookings: [] }
      });

      expect(screen.getByText(/No bookings found/)).toBeInTheDocument();
      expect(screen.getByText(/Start planning your next adventure/)).toBeInTheDocument();
    });
  });

  describe('Search and Filtering', () => {
    it('filters bookings by search term', () => {
      renderBookings();

      const searchInput = screen.getByPlaceholderText(/Search bookings by destination/);
      fireEvent.change(searchInput, { target: { value: 'Beach' } });

      expect(screen.getByText('Beach Paradise')).toBeInTheDocument();
      expect(screen.queryByText('Mountain Retreat')).not.toBeInTheDocument();
    });

    it('filters bookings by status', () => {
      renderBookings();

      const statusFilter = screen.getByDisplayValue('All Statuses');
      fireEvent.change(statusFilter, { target: { value: 'all' } });
      
      // Filter by status
      fireEvent.change(statusFilter, { target: { value: 'confirmed' } });

      expect(screen.getByText('Beach Paradise')).toBeInTheDocument();
      expect(screen.queryByText('Mountain Retreat')).not.toBeInTheDocument();
    });

    it('sorts bookings by date', () => {
      renderBookings();

      const sortSelect = screen.getByDisplayValue('Newest First');
      fireEvent.change(sortSelect, { target: { value: 'oldest' } });

      // The bookings should be reordered
      const bookingCards = screen.getAllByTestId(/booking-card-/);
      expect(bookingCards).toHaveLength(2);
    });
  });

  describe('Booking Actions', () => {
    it('expands booking details when clicked', () => {
      renderBookings();

      const expandButton = screen.getAllByLabelText(/View details/)[0];
      fireEvent.click(expandButton);

      expect(screen.getByText(/Booking Details/)).toBeInTheDocument();
    });

    it('shows cancel button for cancellable bookings', () => {
      renderBookings();

      const expandButton = screen.getAllByLabelText(/View details/)[0];
      fireEvent.click(expandButton);

      expect(screen.getByText('Cancel Booking')).toBeInTheDocument();
    });

    it('dispatches cancel booking action', async () => {
      renderBookings();

      const expandButton = screen.getAllByLabelText(/View details/)[0];
      fireEvent.click(expandButton);

      const cancelButton = screen.getByText('Cancel Booking');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            type: expect.stringContaining('bookings/cancelBooking'),
          })
        );
      });
    });
  });

  describe('Logout Functionality', () => {
    it('renders header with logout button', () => {
      renderBookings();

      expect(screen.getByTestId('logout-button')).toBeInTheDocument();
    });

    it('dispatches logout action when logout button is clicked', () => {
      renderBookings();

      const logoutButton = screen.getByTestId('logout-button');
      fireEvent.click(logoutButton);

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('auth/logout'),
        })
      );
    });
  });

  describe('Data Fetching', () => {
    it('dispatches fetchUserBookings action on mount', () => {
      renderBookings();

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('bookings/fetchUserBookings'),
        })
      );
    });
  });

  describe('Responsive Design', () => {
    it('shows mobile filters toggle on small screens', () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      });

      renderBookings();

      expect(screen.getByLabelText(/Toggle filters/)).toBeInTheDocument();
    });

    it('toggles filter visibility on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      });

      renderBookings();

      const toggleButton = screen.getByLabelText(/Toggle filters/);
      fireEvent.click(toggleButton);

      expect(screen.getByText(/Search bookings/)).toBeVisible();
    });
  });
});