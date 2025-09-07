import React, { createContext, useContext, useEffect, useState } from 'react';
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
  const [connectionState, setConnectionState] = useState('DISCONNECTED');

  useEffect(() => {
    if (isAuthenticated) {
      logger.info('User authenticated, attempting WebSocket connection');
      websocketService.connect();
    } else {
      logger.info('User not authenticated, disconnecting WebSocket');
      websocketService.disconnect();
      setConnectionState('DISCONNECTED');
    }

    // Listen for connection state changes
    const unsubscribeConnected = websocketService.subscribe('connected', () => {
      setConnectionState('CONNECTED');
    });

    const unsubscribeDisconnected = websocketService.subscribe('disconnected', () => {
      setConnectionState('DISCONNECTED');
    });

    const unsubscribeConnectionFailed = websocketService.subscribe('connection_failed', (error) => {
      logger.warn('WebSocket connection failed - continuing without real-time features', error);
      setConnectionState('FAILED');
    });

    const unsubscribeMaxAttempts = websocketService.subscribe('max_reconnect_attempts_reached', () => {
      logger.warn('WebSocket reconnection attempts exhausted - real-time features unavailable');
      setConnectionState('FAILED');
    });

    // Cleanup on unmount
    return () => {
      unsubscribeConnected();
      unsubscribeDisconnected();
      unsubscribeConnectionFailed();
      unsubscribeMaxAttempts();
      // Only disconnect if user is no longer authenticated
      if (!isAuthenticated) {
        websocketService.disconnect();
      }
    };
  }, [isAuthenticated]);

  const contextValue = {
    websocketService,
    connectionState,
    isConnected: connectionState === 'CONNECTED',
    isConnecting: connectionState === 'CONNECTING',
    isFailed: connectionState === 'FAILED'
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