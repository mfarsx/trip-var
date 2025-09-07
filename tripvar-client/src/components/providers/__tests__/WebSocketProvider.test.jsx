import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import WebSocketProvider, { useWebSocketContext } from '../WebSocketProvider';
import websocketService from '../../../services/websocketService';
import authSlice from '../../../store/slices/authSlice';

// Mock WebSocket service
vi.mock('../../../services/websocketService', () => ({
  default: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    subscribe: vi.fn(),
    getConnectionState: vi.fn(),
  },
}));

// Mock logger
vi.mock('../../../utils/logger', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Test component that uses the WebSocket context
const TestComponent = () => {
  const { connectionState, isConnected, isConnecting, isFailed } = useWebSocketContext();
  
  return (
    <div>
      <div data-testid="connection-state">{connectionState}</div>
      <div data-testid="is-connected">{isConnected.toString()}</div>
      <div data-testid="is-connecting">{isConnecting.toString()}</div>
      <div data-testid="is-failed">{isFailed.toString()}</div>
    </div>
  );
};

// Test utilities
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice,
    },
    preloadedState: {
      auth: {
        loading: false,
        error: null,
        isAuthenticated: false,
        user: null,
        ...initialState.auth,
      },
    },
  });
};

const TestWrapper = ({ children, store }) => (
  <Provider store={store}>
    <WebSocketProvider>
      {children}
    </WebSocketProvider>
  </Provider>
);

describe('WebSocketProvider', () => {
  let store;
  let mockSubscribe;
  let mockUnsubscribe;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUnsubscribe = vi.fn();
    mockSubscribe = vi.fn().mockReturnValue(mockUnsubscribe);
    
    websocketService.subscribe = mockSubscribe;
    websocketService.getConnectionState = vi.fn().mockReturnValue('DISCONNECTED');
    
    store = createTestStore();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Context Provider', () => {
    it('provides WebSocket context to children', () => {
      render(
        <TestWrapper store={store}>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId('connection-state')).toBeInTheDocument();
      expect(screen.getByTestId('is-connected')).toBeInTheDocument();
      expect(screen.getByTestId('is-connecting')).toBeInTheDocument();
      expect(screen.getByTestId('is-failed')).toBeInTheDocument();
    });

    it('throws error when used outside provider', () => {
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useWebSocketContext must be used within a WebSocketProvider');
    });
  });

  describe('Authentication State Changes', () => {
    it('connects WebSocket when user becomes authenticated', () => {
      const authenticatedStore = createTestStore({
        auth: {
          isAuthenticated: true,
          user: { id: '1', name: 'Test User' },
        },
      });

      render(
        <TestWrapper store={authenticatedStore}>
          <TestComponent />
        </TestWrapper>
      );

      expect(websocketService.connect).toHaveBeenCalled();
    });

    it('disconnects WebSocket when user becomes unauthenticated', () => {
      const unauthenticatedStore = createTestStore({
        auth: {
          isAuthenticated: false,
          user: null,
        },
      });

      render(
        <TestWrapper store={unauthenticatedStore}>
          <TestComponent />
        </TestWrapper>
      );

      expect(websocketService.disconnect).toHaveBeenCalled();
    });

    it('does not connect when user is not authenticated', () => {
      render(
        <TestWrapper store={store}>
          <TestComponent />
        </TestWrapper>
      );

      expect(websocketService.connect).not.toHaveBeenCalled();
    });
  });

  describe('Event Subscriptions', () => {
    it('subscribes to WebSocket events', () => {
      render(
        <TestWrapper store={store}>
          <TestComponent />
        </TestWrapper>
      );

      expect(mockSubscribe).toHaveBeenCalledWith('connected', expect.any(Function));
      expect(mockSubscribe).toHaveBeenCalledWith('disconnected', expect.any(Function));
      expect(mockSubscribe).toHaveBeenCalledWith('connection_failed', expect.any(Function));
      expect(mockSubscribe).toHaveBeenCalledWith('max_reconnect_attempts_reached', expect.any(Function));
    });

    it('unsubscribes from events on unmount', () => {
      const { unmount } = render(
        <TestWrapper store={store}>
          <TestComponent />
        </TestWrapper>
      );

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalledTimes(4);
    });
  });

  describe('Connection State Management', () => {
    it('updates connection state to CONNECTED', () => {
      const { rerender } = render(
        <TestWrapper store={store}>
          <TestComponent />
        </TestWrapper>
      );

      // Simulate connected event
      const connectedCallback = mockSubscribe.mock.calls.find(
        call => call[0] === 'connected'
      )[1];
      
      connectedCallback();

      rerender(
        <TestWrapper store={store}>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId('connection-state')).toHaveTextContent('CONNECTED');
      expect(screen.getByTestId('is-connected')).toHaveTextContent('true');
      expect(screen.getByTestId('is-connecting')).toHaveTextContent('false');
      expect(screen.getByTestId('is-failed')).toHaveTextContent('false');
    });

    it('updates connection state to DISCONNECTED', () => {
      const { rerender } = render(
        <TestWrapper store={store}>
          <TestComponent />
        </TestWrapper>
      );

      // Simulate disconnected event
      const disconnectedCallback = mockSubscribe.mock.calls.find(
        call => call[0] === 'disconnected'
      )[1];
      
      disconnectedCallback();

      rerender(
        <TestWrapper store={store}>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId('connection-state')).toHaveTextContent('DISCONNECTED');
      expect(screen.getByTestId('is-connected')).toHaveTextContent('false');
      expect(screen.getByTestId('is-connecting')).toHaveTextContent('false');
      expect(screen.getByTestId('is-failed')).toHaveTextContent('false');
    });

    it('updates connection state to FAILED on connection failure', () => {
      const { rerender } = render(
        <TestWrapper store={store}>
          <TestComponent />
        </TestWrapper>
      );

      // Simulate connection failed event
      const connectionFailedCallback = mockSubscribe.mock.calls.find(
        call => call[0] === 'connection_failed'
      )[1];
      
      connectionFailedCallback(new Error('Connection failed'));

      rerender(
        <TestWrapper store={store}>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId('connection-state')).toHaveTextContent('FAILED');
      expect(screen.getByTestId('is-connected')).toHaveTextContent('false');
      expect(screen.getByTestId('is-connecting')).toHaveTextContent('false');
      expect(screen.getByTestId('is-failed')).toHaveTextContent('true');
    });

    it('updates connection state to FAILED on max reconnect attempts', () => {
      const { rerender } = render(
        <TestWrapper store={store}>
          <TestComponent />
        </TestWrapper>
      );

      // Simulate max reconnect attempts reached event
      const maxAttemptsCallback = mockSubscribe.mock.calls.find(
        call => call[0] === 'max_reconnect_attempts_reached'
      )[1];
      
      maxAttemptsCallback();

      rerender(
        <TestWrapper store={store}>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId('connection-state')).toHaveTextContent('FAILED');
      expect(screen.getByTestId('is-connected')).toHaveTextContent('false');
      expect(screen.getByTestId('is-connecting')).toHaveTextContent('false');
      expect(screen.getByTestId('is-failed')).toHaveTextContent('true');
    });
  });

  describe('Cleanup Behavior', () => {
    it('disconnects WebSocket on unmount when user is authenticated', () => {
      const authenticatedStore = createTestStore({
        auth: {
          isAuthenticated: true,
          user: { id: '1', name: 'Test User' },
        },
      });

      const { unmount } = render(
        <TestWrapper store={authenticatedStore}>
          <TestComponent />
        </TestWrapper>
      );

      unmount();

      expect(websocketService.disconnect).toHaveBeenCalled();
    });

    it('does not disconnect WebSocket on unmount when user is not authenticated', () => {
      const { unmount } = render(
        <TestWrapper store={store}>
          <TestComponent />
        </TestWrapper>
      );

      unmount();

      // Should not call disconnect since user is not authenticated
      expect(websocketService.disconnect).not.toHaveBeenCalled();
    });
  });

  describe('Context Value', () => {
    it('provides correct context values', () => {
      const TestContextComponent = () => {
        const context = useWebSocketContext();
        
        return (
          <div>
            <div data-testid="has-websocket-service">{!!context.websocketService}</div>
            <div data-testid="connection-state-value">{context.connectionState}</div>
            <div data-testid="is-connected-value">{context.isConnected.toString()}</div>
            <div data-testid="is-connecting-value">{context.isConnecting.toString()}</div>
            <div data-testid="is-failed-value">{context.isFailed.toString()}</div>
          </div>
        );
      };

      render(
        <TestWrapper store={store}>
          <TestContextComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId('has-websocket-service')).toHaveTextContent('true');
      expect(screen.getByTestId('connection-state-value')).toHaveTextContent('DISCONNECTED');
      expect(screen.getByTestId('is-connected-value')).toHaveTextContent('false');
      expect(screen.getByTestId('is-connecting-value')).toHaveTextContent('false');
      expect(screen.getByTestId('is-failed-value')).toHaveTextContent('false');
    });
  });

  describe('Error Handling', () => {
    it('handles WebSocket service errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock WebSocket service to throw error
      websocketService.connect.mockImplementation(() => {
        throw new Error('WebSocket connection failed');
      });

      expect(() => {
        render(
          <TestWrapper store={store}>
            <TestComponent />
          </TestWrapper>
        );
      }).not.toThrow();

      consoleSpy.mockRestore();
    });
  });
});