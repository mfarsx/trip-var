import { configureStore } from '@reduxjs/toolkit';
import bookingSlice, {
  createBooking,
  clearError,
  clearCurrentBooking,
  clearAvailability,
} from '../bookingSlice';

// Mock bookingApi
vi.mock('../../../services/bookingApi', () => ({
  bookingApi: {
    createBooking: vi.fn(),
    getUserBookings: vi.fn(),
    getBookingById: vi.fn(),
    cancelBooking: vi.fn(),
    checkAvailability: vi.fn(),
  },
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Booking Slice - Simple Tests', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        bookings: bookingSlice,
      },
    });
    vi.clearAllMocks();
  });

  it('has correct initial state', () => {
    const state = store.getState().bookings;
    
    expect(state).toEqual({
      bookings: [],
      currentBooking: null,
      availability: null,
      pagination: {
        current: 1,
        pages: 1,
        total: 0
      },
      loading: false,
      error: null,
      creating: false,
      cancelling: false
    });
  });

  it('handles createBooking pending state', () => {
    store.dispatch(createBooking.pending('', {}));
    const state = store.getState().bookings;
    
    expect(state.creating).toBe(true);
    expect(state.error).toBe(null);
  });

  it('handles createBooking fulfilled state', () => {
    const mockBooking = {
      _id: 'booking-1',
      destination: { _id: 'dest-1', title: 'Test Destination' },
      user: { _id: 'user-1', name: 'Test User' },
      checkInDate: '2024-12-01',
      checkOutDate: '2024-12-05',
      numberOfGuests: 2,
      status: 'confirmed',
      totalAmount: 599,
    };

    store.dispatch(createBooking.fulfilled(mockBooking, '', {}));
    const state = store.getState().bookings;
    
    expect(state.creating).toBe(false);
    expect(state.currentBooking).toEqual(mockBooking);
    expect(state.bookings).toContain(mockBooking);
    expect(state.error).toBe(null);
  });

  it('handles createBooking rejected state', () => {
    const errorMessage = 'Booking failed';
    store.dispatch({
      type: 'booking/createBooking/rejected',
      payload: errorMessage,
      meta: { requestId: 'test', arg: {} }
    });
    const state = store.getState().bookings;
    
    expect(state.creating).toBe(false);
    expect(state.error).toBe(errorMessage);
  });

  it('clearError action clears error state', () => {
    // First set an error
    store.dispatch({
      type: 'booking/createBooking/rejected',
      payload: 'Test error',
      meta: { requestId: 'test', arg: {} }
    });
    expect(store.getState().bookings.error).toBe('Test error');

    // Then clear it
    store.dispatch(clearError());
    expect(store.getState().bookings.error).toBe(null);
  });

  it('clearCurrentBooking action clears current booking', () => {
    // First set a current booking
    const mockBooking = { _id: 'booking-1', status: 'confirmed' };
    store.dispatch(createBooking.fulfilled(mockBooking, '', {}));
    expect(store.getState().bookings.currentBooking).toEqual(mockBooking);

    // Then clear it
    store.dispatch(clearCurrentBooking());
    expect(store.getState().bookings.currentBooking).toBe(null);
  });

  it('clearAvailability action clears availability state', () => {
    // First set availability
    const mockAvailability = { available: true, price: 599 };
    store.dispatch({
      type: 'booking/checkAvailability/fulfilled',
      payload: mockAvailability
    });
    expect(store.getState().bookings.availability).toEqual(mockAvailability);

    // Then clear it
    store.dispatch(clearAvailability());
    expect(store.getState().bookings.availability).toBe(null);
  });
});