import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import destinationReducer from "./slices/destinationSlice";
import logger from '../utils/logger'
import loggerMiddleware from './middleware/loggerMiddleware'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    destinations: destinationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(loggerMiddleware),
  devTools: import.meta.env.MODE !== 'production',
})

// Log when store is created
logger.info('Redux store initialized', {
  initialState: store.getState(),
  environment: import.meta.env.MODE
})
