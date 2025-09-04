import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DestinationsGrid from '../DestinationsGrid';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

// Mock userService
vi.mock('../../../services/userService', () => ({
  userService: {
    getFavorites: vi.fn().mockResolvedValue({
      data: {
        data: {
          favorites: []
        }
      }
    }),
    toggleFavorite: vi.fn().mockResolvedValue({
      data: {
        data: {
          isFavorite: true
        }
      }
    }),
  },
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockDestinations = [
  {
    _id: '1',
    title: 'Beach Paradise',
    location: 'Maldives',
    description: 'A beautiful tropical destination with crystal clear waters.',
    imageUrl: 'https://example.com/beach.jpg',
    rating: 4.8,
    ratingCount: 150,
    price: 599,
  },
];

describe('DestinationsGrid Component - Simple Tests', () => {
  const mockProps = {
    destinations: mockDestinations,
    onDestinationClick: vi.fn(),
    onCompareToggle: vi.fn(),
    onQuickBook: vi.fn(),
    selectedDestinations: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders destinations correctly', () => {
    render(<DestinationsGrid {...mockProps} />);

    expect(screen.getByText('Beach Paradise')).toBeInTheDocument();
    expect(screen.getByText('Maldives')).toBeInTheDocument();
    expect(screen.getByText('$599')).toBeInTheDocument();
  });

  it('calls onDestinationClick when destination is clicked', async () => {
    const user = userEvent.setup();
    render(<DestinationsGrid {...mockProps} />);

    const destinationCard = screen.getByText('Beach Paradise').closest('div');
    await user.click(destinationCard);

    expect(mockProps.onDestinationClick).toHaveBeenCalledWith('1');
  });

  it('calls onQuickBook when Book button is clicked', async () => {
    const user = userEvent.setup();
    render(<DestinationsGrid {...mockProps} />);

    const bookButton = screen.getByText('Book');
    await user.click(bookButton);

    expect(mockProps.onQuickBook).toHaveBeenCalledWith('1');
  });

  it('calls onCompareToggle when compare button is clicked', async () => {
    const user = userEvent.setup();
    render(<DestinationsGrid {...mockProps} />);

    const compareButton = screen.getByTitle(/add to comparison/i);
    await user.click(compareButton);

    expect(mockProps.onCompareToggle).toHaveBeenCalledWith('1');
  });
});