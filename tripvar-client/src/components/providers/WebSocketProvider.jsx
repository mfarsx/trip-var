import React, { createContext, useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import websocketService from '../../services/websocketService';
import logger from '../../utils/logger';
import PropTypes from 'prop-types';

const WebSocketContext = createContext();

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

const WebSocketProvider = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      logger.info('User authenticated, attempting WebSocket connection');
      websocketService.connect();
    } else {
      logger.info('User not authenticated, disconnecting WebSocket');
      websocketService.disconnect();
    }

    // Listen for connection failures
    const unsubscribeConnectionFailed = websocketService.subscribe('connection_failed', (error) => {
      logger.warn('WebSocket connection failed - continuing without real-time features', error);
    });

    const unsubscribeMaxAttempts = websocketService.subscribe('max_reconnect_attempts_reached', () => {
      logger.warn('WebSocket reconnection attempts exhausted - real-time features unavailable');
    });

    // Cleanup on unmount
    return () => {
      unsubscribeConnectionFailed();
      unsubscribeMaxAttempts();
      websocketService.disconnect();
    };
  }, [isAuthenticated]);

  const contextValue = {
    websocketService,
    connectionState: websocketService.getConnectionState(),
    isConnected: websocketService.getConnectionState() === 'CONNECTED',
    isConnecting: websocketService.getConnectionState() === 'CONNECTING'
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

WebSocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default WebSocketProvider;