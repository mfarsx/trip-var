import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import destinationReducer from "./slices/destinationSlice";
import bookingReducer from "./slices/bookingSlice";
import reviewReducer from "./slices/reviewSlice";
import notificationReducer from "./slices/notificationSlice";
import paymentReducer from "./slices/paymentSlice";
import favoritesReducer from "./slices/favoritesSlice";
import logger from '../utils/logger'
import loggerMiddleware from './middleware/loggerMiddleware'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    destinations: destinationReducer,
    bookings: bookingReducer,
    reviews: reviewReducer,
    notifications: notificationReducer,
    payments: paymentReducer,
    favorites: favoritesReducer,
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
