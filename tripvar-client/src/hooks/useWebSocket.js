import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import websocketService from '../services/websocketService';
import logger from '../utils/logger';

export const useWebSocket = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [connectionState, setConnectionState] = useState('DISCONNECTED');
  const [lastMessage, setLastMessage] = useState(null);
  const listenersRef = useRef(new Map());

  useEffect(() => {
    if (isAuthenticated) {
      // Connect when user is authenticated
      websocketService.connect();
    } else {
      // Disconnect when user is not authenticated
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

    const unsubscribeError = websocketService.subscribe('error', (error) => {
      logger.error('WebSocket error in hook', error);
    });

    const unsubscribeMessage = websocketService.subscribe('message', (data) => {
      setLastMessage(data);
    });

    // Store unsubscribe functions
    listenersRef.current.set('connected', unsubscribeConnected);
    listenersRef.current.set('disconnected', unsubscribeDisconnected);
    listenersRef.current.set('error', unsubscribeError);
    listenersRef.current.set('message', unsubscribeMessage);

    return () => {
      // Cleanup listeners
      listenersRef.current.forEach(unsubscribe => unsubscribe());
      listenersRef.current.clear();
    };
  }, [isAuthenticated]);

  const sendMessage = (data) => {
    websocketService.send(data);
  };

  const subscribe = (event, callback) => {
    const unsubscribe = websocketService.subscribe(event, callback);
    
    // Store the unsubscribe function
    const key = `${event}_${Date.now()}`;
    const currentListeners = listenersRef.current;
    currentListeners.set(key, unsubscribe);
    
    return () => {
      unsubscribe();
      currentListeners.delete(key);
    };
  };

  return {
    connectionState,
    lastMessage,
    sendMessage,
    subscribe,
    isConnected: connectionState === 'CONNECTED',
    isConnecting: connectionState === 'CONNECTING'
  };
};

export const useWebSocketNotification = () => {
  const { subscribe } = useWebSocket();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribe('notification', (notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10
    });

    return unsubscribe;
  }, [subscribe]);

  return notifications;
};

export const useWebSocketBookingUpdates = () => {
  const { subscribe } = useWebSocket();
  const [bookingUpdates, setBookingUpdates] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribe('booking_update', (booking) => {
      setBookingUpdates(prev => [booking, ...prev.slice(0, 4)]); // Keep last 5
    });

    return unsubscribe;
  }, [subscribe]);

  return bookingUpdates;
};

export const useWebSocketPaymentUpdates = () => {
  const { subscribe } = useWebSocket();
  const [paymentUpdates, setPaymentUpdates] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribe('payment_update', (payment) => {
      setPaymentUpdates(prev => [payment, ...prev.slice(0, 4)]); // Keep last 5
    });

    return unsubscribe;
  }, [subscribe]);

  return paymentUpdates;
};

export default useWebSocket;