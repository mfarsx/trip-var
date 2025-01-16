import PropTypes from 'prop-types';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AUTH_CONFIG, AUTH_ERRORS } from '../constants/auth';
import { getToken, removeToken, setToken, getStoredUser } from '../utils/tokenUtils';

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const validateStateUpdates = (updates) => {
  const allowedKeys = ['user', 'isAuthenticated', 'loading', 'error'];
  const invalidKeys = Object.keys(updates).filter((key) => !allowedKeys.includes(key));

  if (invalidKeys.length > 0) {
    throw new Error(`Invalid state update keys: ${invalidKeys.join(', ')}`);
  }
};

const getErrorDetails = (error) => {
  if (!error) {
    return { type: AUTH_ERRORS.UNKNOWN_ERROR, message: 'An unknown error occurred' };
  }

  if (error.response) {
    const { status, data } = error.response;
    switch (status) {
      case 401:
        return { type: AUTH_ERRORS.INVALID_CREDENTIALS, message: data.message };
      case 403:
        return { type: AUTH_ERRORS.FORBIDDEN, message: data.message };
      case 404:
        return { type: AUTH_ERRORS.NOT_FOUND, message: data.message };
      default:
        return { type: AUTH_ERRORS.API_ERROR, message: data.message };
    }
  }

  if (error.request) {
    return { type: AUTH_ERRORS.NETWORK_ERROR, message: 'Network error occurred' };
  }

  return {
    type: AUTH_ERRORS.UNKNOWN_ERROR,
    message: error.message || 'An unknown error occurred',
  };
};

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState(initialState);
  const mountedRef = useRef(true);
  const navigate = useNavigate();

  const updateState = useCallback((newState) => {
    try {
      validateStateUpdates(newState);
      setState((prevState) => ({ ...prevState, ...newState }));
    } catch (error) {
      console.error('Invalid state update:', error);
      if (AUTH_CONFIG.DEV_MODE) {
        throw error;
      }
    }
  }, []);

  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

  const handleAuthError = useCallback(
    (error) => {
      const { type, message } = getErrorDetails(error);

      if ([AUTH_ERRORS.INVALID_TOKEN, AUTH_ERRORS.TOKEN_EXPIRED].includes(type)) {
        removeToken();
        resetState();
        navigate('/login');
      }

      updateState({ error: { type, message } });
    },
    [navigate, resetState, updateState]
  );

  const login = useCallback(
    async (credentials) => {
      try {
        updateState({ loading: true, error: null });

        // Mock API call
        const response = await new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              data: {
                token: 'mock_token',
                user: {
                  id: '1',
                  email: credentials.email,
                  name: 'Test User',
                },
              },
            });
          }, 1000);
        });

        const { token, user } = response.data;
        // Store both token and user data
        setToken(token, user);

        updateState({
          user,
          isAuthenticated: true,
          loading: false,
          error: null,
        });

        navigate('/');
      } catch (error) {
        handleAuthError(error);
        throw error;
      }
    },
    [navigate, handleAuthError, updateState]
  );

  const logout = useCallback(async () => {
    try {
      updateState({ loading: true });

      // Mock API call for logout
      await new Promise((resolve) => setTimeout(resolve, 500));

      // First remove the token
      removeToken();

      // Then reset state and mark as not authenticated
      updateState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });

      // Finally navigate to login
      navigate('/login', { replace: true });
    } catch (error) {
      handleAuthError(error);
      // Even if there's an error, we should clean up
      removeToken();
      updateState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: getErrorDetails(error),
      });
      navigate('/login', { replace: true });
    }
  }, [navigate, handleAuthError, updateState]);

  const signup = useCallback(
    async (userData) => {
      try {
        updateState({ loading: true, error: null });

        // Mock API call
        const response = await new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              data: {
                token: 'mock_token',
                user: {
                  id: '1',
                  email: userData.email,
                  name: userData.name,
                },
              },
            });
          }, 1000);
        });

        const { token, user } = response.data;
        setToken(token);

        updateState({
          user,
          isAuthenticated: true,
          loading: false,
          error: null,
        });

        navigate('/');
      } catch (error) {
        handleAuthError(error);
        throw error;
      }
    },
    [navigate, handleAuthError, updateState]
  );

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getToken();
        const storedUser = getStoredUser();
        
        if (!token || !storedUser) {
          updateState({ loading: false });
          return;
        }

        // Mock API call to validate token and get fresh user data if needed
        const response = await new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              data: {
                user: storedUser // Use stored user data
              },
            });
          }, 500);
        });

        updateState({
          user: response.data.user,
          isAuthenticated: true,
          loading: false,
        });
      } catch (error) {
        handleAuthError(error);
        updateState({ loading: false });
      }
    };

    initAuth();

    return () => {
      mountedRef.current = false;
    };
  }, [handleAuthError, updateState]);

  const value = {
    ...state,
    login,
    logout,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
