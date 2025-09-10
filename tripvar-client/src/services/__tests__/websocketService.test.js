import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import websocketService from '../websocketService';
import logger from '../../utils/logger';

// Mock logger
vi.mock('../../utils/logger', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock WebSocket
class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = MockWebSocket.CONNECTING;
    this.onopen = null;
    this.onclose = null;
    this.onmessage = null;
    this.onerror = null;
    
    // Simulate connection after a short delay
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) {
        this.onopen();
      }
    }, 10);
  }

  close(code = 1000, reason = '') {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose({ code, reason });
    }
  }

  send(data) {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
  }
}

// Mock WebSocket constants
Object.defineProperty(MockWebSocket, 'CONNECTING', { value: 0 });
Object.defineProperty(MockWebSocket, 'OPEN', { value: 1 });
Object.defineProperty(MockWebSocket, 'CLOSING', { value: 2 });
Object.defineProperty(MockWebSocket, 'CLOSED', { value: 3 });

// Mock WebSocket globally
Object.defineProperty(global, 'WebSocket', {
  value: MockWebSocket,
  writable: true,
});

// Also define the constants on the global WebSocket
Object.defineProperty(global.WebSocket, 'CONNECTING', { value: 0 });
Object.defineProperty(global.WebSocket, 'OPEN', { value: 1 });
Object.defineProperty(global.WebSocket, 'CLOSING', { value: 2 });
Object.defineProperty(global.WebSocket, 'CLOSED', { value: 3 });

// Also define constants on the MockWebSocket class
Object.defineProperty(MockWebSocket, 'CONNECTING', { value: 0 });
Object.defineProperty(MockWebSocket, 'OPEN', { value: 1 });
Object.defineProperty(MockWebSocket, 'CLOSING', { value: 2 });
Object.defineProperty(MockWebSocket, 'CLOSED', { value: 3 });

// Mock environment variables
vi.stubGlobal('import', {
  meta: {
    env: {
      VITE_WS_URL: 'ws://localhost:8000',
    },
  },
});

describe('WebSocket Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('test-token');
  });

  afterEach(() => {
    websocketService.disconnect();
    vi.clearAllMocks();
  });

  describe('Connection Management', () => {
    it('should connect with valid token', () => {
      websocketService.connect();
      
      expect(logger.info).toHaveBeenCalledWith('WebSocket connected');
      expect(websocketService.getConnectionState()).toBe('CONNECTED');
    });

    it('should not connect without token', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      websocketService.connect();
      
      expect(logger.warn).toHaveBeenCalledWith('No authentication token found, skipping WebSocket connection');
      expect(websocketService.getConnectionState()).toBe('DISCONNECTED');
    });

    it('should not connect if already connecting', () => {
      websocketService.connect();
      
      // Clear the mock to count only new calls
      logger.info.mockClear();
      
      websocketService.connect(); // Second call should be ignored
      
      // Should not call logger.info for connection since it's already connecting
      expect(logger.info).not.toHaveBeenCalledWith('WebSocket connected');
    });

    it('should not connect if already connected', () => {
      websocketService.connect();
      
      // Wait for connection to establish
      return new Promise(resolve => {
        setTimeout(() => {
          // Clear the mock to count only new calls
          logger.info.mockClear();
          
          websocketService.connect(); // Second call should be ignored
          
          // Should not call logger.info for connection since it's already connected
          expect(logger.info).not.toHaveBeenCalledWith('WebSocket connected');
          resolve();
        }, 20);
      });
    });

    it('should handle WebSocket not supported', () => {
      // Mock WebSocket as undefined
      const originalWebSocket = global.WebSocket;
      delete global.WebSocket;
      
      websocketService.connect();
      
      expect(logger.warn).toHaveBeenCalledWith('WebSocket is not supported in this environment');
      
      // Restore WebSocket
      global.WebSocket = originalWebSocket;
    });
  });

  describe('Message Handling', () => {
    it('should handle notification messages', () => {
      const mockDispatch = vi.fn();
      const mockStore = { dispatch: mockDispatch };
      
      // Mock the store
      vi.doMock('../../store', () => ({ store: mockStore }));
      
      websocketService.connect();
      
      return new Promise(resolve => {
        setTimeout(() => {
          const notification = {
            type: 'notification',
            payload: { message: 'Test notification' },
          };
          
          websocketService.handleMessage(notification);
          
          expect(logger.debug).toHaveBeenCalledWith('WebSocket message received', notification);
          resolve();
        }, 20);
      });
    });

    it('should handle booking update messages', () => {
      websocketService.connect();
      
      return new Promise(resolve => {
        setTimeout(() => {
          const bookingUpdate = {
            type: 'booking_update',
            payload: { id: '1', status: 'confirmed' },
          };
          
          websocketService.handleMessage(bookingUpdate);
          
          expect(logger.debug).toHaveBeenCalledWith('WebSocket message received', bookingUpdate);
          resolve();
        }, 20);
      });
    });

    it('should handle payment update messages', () => {
      websocketService.connect();
      
      return new Promise(resolve => {
        setTimeout(() => {
          const paymentUpdate = {
            type: 'payment_update',
            payload: { id: '1', status: 'completed' },
          };
          
          websocketService.handleMessage(paymentUpdate);
          
          expect(logger.debug).toHaveBeenCalledWith('WebSocket message received', paymentUpdate);
          resolve();
        }, 20);
      });
    });

    it('should handle pong messages', () => {
      websocketService.connect();
      
      return new Promise(resolve => {
        setTimeout(() => {
          const pongMessage = {
            type: 'pong',
            payload: { timestamp: new Date().toISOString() },
          };
          
          websocketService.handleMessage(pongMessage);
          
          expect(logger.debug).toHaveBeenCalledWith('WebSocket pong received', pongMessage.payload);
          resolve();
        }, 20);
      });
    });

    it('should handle unknown message types', () => {
      websocketService.connect();
      
      return new Promise(resolve => {
        setTimeout(() => {
          const unknownMessage = {
            type: 'unknown_type',
            payload: { data: 'test' },
          };
          
          websocketService.handleMessage(unknownMessage);
          
          expect(logger.warn).toHaveBeenCalledWith('Unknown WebSocket message type', 'unknown_type');
          resolve();
        }, 20);
      });
    });
  });

  describe('Heartbeat System', () => {
    it('should start heartbeat when connected', () => {
      websocketService.connect();
      
      return new Promise(resolve => {
        setTimeout(() => {
          // Heartbeat should be started
          expect(websocketService.heartbeatInterval).toBeDefined();
          resolve();
        }, 20);
      });
    });

    it('should stop heartbeat when disconnected', () => {
      websocketService.connect();
      
      return new Promise(resolve => {
        setTimeout(() => {
          websocketService.disconnect();
          expect(websocketService.heartbeatInterval).toBeNull();
          resolve();
        }, 20);
      });
    });

    it('should send ping messages', () => {
      websocketService.connect();
      
      return new Promise(resolve => {
        setTimeout(() => {
          const sendSpy = vi.spyOn(websocketService, 'send');
          
          // Trigger heartbeat
          websocketService.startHeartbeat();
          
          setTimeout(() => {
            expect(sendSpy).toHaveBeenCalledWith({
              type: 'ping',
              payload: { timestamp: expect.any(String) },
            });
            resolve();
          }, 50);
        }, 20);
      });
    });
  });

  describe('Reconnection Logic', () => {
    it('should attempt reconnection on unexpected disconnect', () => {
      websocketService.connect();
      
      return new Promise(resolve => {
        setTimeout(() => {
          const connectSpy = vi.spyOn(websocketService, 'connect');
          
          // Simulate unexpected disconnect
          websocketService.socket.close(1006, 'Connection lost');
          
          setTimeout(() => {
            expect(connectSpy).toHaveBeenCalled();
            resolve();
          }, 100);
        }, 20);
      });
    });

    it('should not reconnect on normal closure', () => {
      websocketService.connect();
      
      return new Promise(resolve => {
        setTimeout(() => {
          const connectSpy = vi.spyOn(websocketService, 'connect');
          
          // Simulate normal closure
          websocketService.socket.close(1000, 'Normal closure');
          
          setTimeout(() => {
            expect(connectSpy).not.toHaveBeenCalled();
            resolve();
          }, 100);
        }, 20);
      });
    });

    it('should respect max reconnection attempts', () => {
      websocketService.maxReconnectAttempts = 2;
      websocketService.connect();
      
      return new Promise(resolve => {
        setTimeout(() => {
          const connectSpy = vi.spyOn(websocketService, 'connect');
          
          // Simulate multiple disconnects
          websocketService.socket.close(1006, 'Connection lost');
          
          setTimeout(() => {
            websocketService.socket.close(1006, 'Connection lost');
            
            setTimeout(() => {
              websocketService.socket.close(1006, 'Connection lost');
              
              setTimeout(() => {
                expect(connectSpy).toHaveBeenCalledTimes(2); // Max attempts reached
                resolve();
              }, 100);
            }, 100);
          }, 100);
        }, 20);
      });
    });
  });

  describe('Event Subscription', () => {
    it('should allow subscribing to events', () => {
      const callback = vi.fn();
      const unsubscribe = websocketService.subscribe('test_event', callback);
      
      expect(typeof unsubscribe).toBe('function');
      
      // Emit event
      websocketService.emit('test_event', { data: 'test' });
      
      expect(callback).toHaveBeenCalledWith({ data: 'test' });
    });

    it('should allow unsubscribing from events', () => {
      const callback = vi.fn();
      const unsubscribe = websocketService.subscribe('test_event', callback);
      
      unsubscribe();
      
      // Emit event after unsubscribe
      websocketService.emit('test_event', { data: 'test' });
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle multiple subscribers for same event', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      websocketService.subscribe('test_event', callback1);
      websocketService.subscribe('test_event', callback2);
      
      websocketService.emit('test_event', { data: 'test' });
      
      expect(callback1).toHaveBeenCalledWith({ data: 'test' });
      expect(callback2).toHaveBeenCalledWith({ data: 'test' });
    });

    it('should handle errors in event callbacks', () => {
      const callback = vi.fn(() => {
        throw new Error('Callback error');
      });
      
      websocketService.subscribe('test_event', callback);
      
      websocketService.emit('test_event', { data: 'test' });
      
      expect(logger.error).toHaveBeenCalledWith(
        'Error in WebSocket event listener for test_event',
        expect.any(Error)
      );
    });
  });

  describe('Connection State', () => {
    it('should return correct connection states', () => {
      expect(websocketService.getConnectionState()).toBe('DISCONNECTED');
      
      websocketService.connect();
      
      return new Promise(resolve => {
        setTimeout(() => {
          expect(websocketService.getConnectionState()).toBe('CONNECTED');
          resolve();
        }, 20);
      });
    });
  });

  describe('Send Messages', () => {
    it('should send messages when connected', () => {
      websocketService.connect();
      
      return new Promise(resolve => {
        setTimeout(() => {
          const sendSpy = vi.spyOn(websocketService.socket, 'send');
          
          websocketService.send({ type: 'test', data: 'message' });
          
          expect(sendSpy).toHaveBeenCalledWith('{"type":"test","data":"message"}');
          resolve();
        }, 20);
      });
    });

    it('should warn when trying to send while disconnected', () => {
      websocketService.send({ type: 'test', data: 'message' });
      
      expect(logger.warn).toHaveBeenCalledWith('WebSocket is not connected, cannot send message');
    });
  });

  describe('Disconnect', () => {
    it('should disconnect gracefully', () => {
      websocketService.connect();
      
      return new Promise(resolve => {
        setTimeout(() => {
          websocketService.disconnect();
          
          expect(websocketService.socket).toBeNull();
          expect(websocketService.getConnectionState()).toBe('DISCONNECTED');
          resolve();
        }, 20);
      });
    });

    it('should handle disconnect when socket is already closed', () => {
      websocketService.connect();
      
      return new Promise(resolve => {
        setTimeout(() => {
          websocketService.socket.close();
          websocketService.disconnect(); // Should not throw error
          
          expect(websocketService.socket).toBeNull();
          resolve();
        }, 20);
      });
    });
  });
});