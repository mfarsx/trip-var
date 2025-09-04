import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Home from '../Home';
import authSlice from '../../store/slices/authSlice';
import destinationSlice from '../../store/slices/destinationSlice';

// Mock all the custom hooks
vi.mock('../../hooks/useDestinations', () => ({
  useDestinations: () => ({
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
    filteredDestinations: [
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
    setFilteredDestinations: vi.fn(),
    loading: false,
  }),
}));

vi.mock('../../hooks/useDestinationFilters', () => ({
  useDestinationFilters: () => ({
    activeFilter: 'all',
    setActiveFilter: vi.fn(),
    sortBy: 'featured',
    setSortBy: vi.fn(),
  }),
}));

vi.mock('../../hooks/useSearch', () => ({
  useSearch: () => ({
    searchParams: { destination: '', checkIn: '', checkOut: '', guests: 1 },
    setSearchParams: vi.fn(),
    isSearching: false,
    handleSearch: vi.fn(),
  }),
}));

vi.mock('../../hooks/useCarousel', () => ({
  useCarousel: () => ({
    itemsPerView: 4,
    currentIndex: 0,
    setCurrentIndex: vi.fn(),
  }),
}));

vi.mock('../../hooks/useDestinationActions', () => ({
  useDestinationActions: () => ({
    selectedDestinations: [],
    setSelectedDestinations: vi.fn(),
    handleDestinationClick: vi.fn(),
    handleCompareToggle: vi.fn(),
    handleQuickBook: vi.fn(),
    handleFilterChange: vi.fn(),
    handleSortChange: vi.fn(),
  }),
}));

// Mock components
vi.mock('../../components/header/Header', () => ({
  default: ({ onLogout }) => (
    <header data-testid="header">
      <button onClick={onLogout}>Logout</button>
    </header>
  ),
}));

vi.mock('../../components/hero/HeroSection', () => ({
  default: () => <section data-testid="hero-section">Hero Section</section>,
}));

vi.mock('../../components/search/SearchSection', () => ({
  default: ({ onSearch, isSearching }) => (
    <section data-testid="search-section">
      <button onClick={onSearch} disabled={isSearching}>
        {isSearching ? 'Searching...' : 'Search'}
      </button>
    </section>
  ),
}));

vi.mock('../../components/sections/DestinationsSection', () => ({
  default: ({ destinations }) => (
    <section data-testid="destinations-section">
      <h2>Destinations</h2>
      {destinations.map(dest => (
        <div key={dest._id} data-testid={`destination-${dest._id}`}>
          <h3>{dest.title}</h3>
        </div>
      ))}
    </section>
  ),
}));

vi.mock('../../components/sections/FeaturesSection', () => ({
  default: () => <section data-testid="features-section">Features Section</section>,
}));

vi.mock('../../components/sections/CTASection', () => ({
  default: () => <section data-testid="cta-section">CTA Section</section>,
}));

vi.mock('../../components/layout/Footer', () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

vi.mock('../../components/common/DestinationsErrorBoundary', () => ({
  default: ({ children }) => <div data-testid="error-boundary">{children}</div>,
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
        destinations: [],
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

describe('Home Component - Simple Tests', () => {
  let store;

  beforeEach(() => {
    store = createTestStore();
    vi.clearAllMocks();
  });

  const renderHome = (storeState = {}) => {
    const testStore = createTestStore(storeState);
    return render(
      <TestWrapper store={testStore}>
        <Home />
      </TestWrapper>
    );
  };

  it('renders all main sections', () => {
    renderHome();

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    expect(screen.getByTestId('search-section')).toBeInTheDocument();
    expect(screen.getByTestId('destinations-section')).toBeInTheDocument();
    expect(screen.getByTestId('features-section')).toBeInTheDocument();
    expect(screen.getByTestId('cta-section')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders destinations section with destinations', () => {
    renderHome();

    expect(screen.getByText('Destinations')).toBeInTheDocument();
    expect(screen.getByTestId('destination-1')).toBeInTheDocument();
    expect(screen.getByText('Beach Paradise')).toBeInTheDocument();
  });

  it('renders error boundary around destinations section', () => {
    renderHome();

    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
  });

  it('handles loading states correctly', () => {
    renderHome({
      destinations: { loading: true }
    });

    // Component should still render even when loading
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
  });

  it('handles error states correctly', () => {
    renderHome({
      destinations: { error: 'Failed to load destinations' }
    });

    // Component should still render even when there's an error
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
  });

  it('has proper semantic structure', () => {
    renderHome();

    expect(screen.getByRole('banner')).toBeInTheDocument(); // header
    expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
  });
});