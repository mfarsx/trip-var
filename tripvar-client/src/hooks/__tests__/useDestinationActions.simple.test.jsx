import { renderHook, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useDestinationActions } from '../useDestinationActions';

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

const wrapper = ({ children }) => <BrowserRouter>{children}</BrowserRouter>;

describe('useDestinationActions Hook - Simple Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty selected destinations', () => {
    const { result } = renderHook(() => useDestinationActions(), { wrapper });

    expect(result.current.selectedDestinations).toEqual([]);
  });

  it('navigates to destination detail when handleDestinationClick is called', () => {
    const { result } = renderHook(() => useDestinationActions(), { wrapper });

    act(() => {
      result.current.handleDestinationClick('destination-123');
    });

    expect(mockNavigate).toHaveBeenCalledWith('/destinations/destination-123');
  });

  it('navigates to quick book when handleQuickBook is called', () => {
    const { result } = renderHook(() => useDestinationActions(), { wrapper });

    act(() => {
      result.current.handleQuickBook('destination-123');
    });

    expect(mockNavigate).toHaveBeenCalledWith('/destinations/destination-123?action=book');
  });

  it('adds destination to comparison when handleCompareToggle is called', () => {
    const { result } = renderHook(() => useDestinationActions(), { wrapper });

    act(() => {
      result.current.handleCompareToggle('destination-1');
    });

    expect(result.current.selectedDestinations).toEqual(['destination-1']);
  });

  it('removes destination from comparison when already selected', () => {
    const { result } = renderHook(() => useDestinationActions(), { wrapper });

    // Add destination
    act(() => {
      result.current.handleCompareToggle('destination-1');
    });

    expect(result.current.selectedDestinations).toEqual(['destination-1']);

    // Remove destination
    act(() => {
      result.current.handleCompareToggle('destination-1');
    });

    expect(result.current.selectedDestinations).toEqual([]);
  });
});