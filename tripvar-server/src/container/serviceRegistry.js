const container = require('./index');

// Models
const User = require('../models/user.model');
const Destination = require('../models/destination.model');
const Booking = require('../models/booking.model');
const Review = require('../models/review.model');
// const Payment = require('../models/payment.model'); // Payment model not implemented yet
const Notification = require('../models/notification.model');

// Repositories
const BaseRepository = require('../repositories/base.repository');
const UserRepository = require('../repositories/user.repository');

// Services
const BaseService = require('../services/base.service');
const UserService = require('../services/user.service');

// Controllers
const BaseController = require('../controllers/base.controller');
const AuthController = require('../controllers/auth.controller');

// Utils
const { redisUtils } = require('../middleware/redisCache');

/**
 * Register all services in the container
 */
function registerServices() {
  // Register models as singletons
  container.registerInstance('User', User);
  container.registerInstance('Destination', Destination);
  container.registerInstance('Booking', Booking);
  container.registerInstance('Review', Review);
  // container.registerInstance('Payment', Payment); // Payment model not implemented yet
  container.registerInstance('Notification', Notification);

  // Register repositories
  container.register('UserRepository', UserRepository, [], { singleton: true });

  // Register other repositories as factories
  container.registerFactory('DestinationRepository', (Destination) => {
    const DestinationRepository = require('../repositories/destination.repository');
    return new DestinationRepository(Destination);
  }, ['Destination']);

  container.registerFactory('BookingRepository', (Booking) => {
    const BookingRepository = require('../repositories/booking.repository');
    return new BookingRepository(Booking);
  }, ['Booking']);

  container.registerFactory('ReviewRepository', (Review) => {
    const ReviewRepository = require('../repositories/review.repository');
    return new ReviewRepository(Review);
  }, ['Review']);

  // container.registerFactory('PaymentRepository', (Payment) => {
  //   const PaymentRepository = require('../repositories/payment.repository');
  //   return new PaymentRepository(Payment);
  // }, ['Payment']); // Payment repository not implemented yet

  container.registerFactory('NotificationRepository', (Notification) => {
    const NotificationRepository = require('../repositories/notification.repository');
    return new NotificationRepository(Notification);
  }, ['Notification']);

  // Register services
  container.register('UserService', UserService, ['UserRepository'], { singleton: true });

  // Register other services as factories
  container.registerFactory('DestinationService', (DestinationRepository) => {
    const DestinationService = require('../services/destination.service');
    return new DestinationService(DestinationRepository);
  }, ['DestinationRepository']);

  container.registerFactory('BookingService', (BookingRepository) => {
    const BookingService = require('../services/booking.service');
    return new BookingService(BookingRepository);
  }, ['BookingRepository']);

  container.registerFactory('ReviewService', (ReviewRepository) => {
    const ReviewService = require('../services/review.service');
    return new ReviewService(ReviewRepository);
  }, ['ReviewRepository']);

  // container.registerFactory('PaymentService', (PaymentRepository) => {
  //   const PaymentService = require('../services/payment.service');
  //   return new PaymentService(PaymentRepository);
  // }, ['PaymentRepository']); // Payment service not implemented yet

  container.registerFactory('NotificationService', (NotificationRepository) => {
    const NotificationService = require('../services/notification.service');
    return new NotificationService(NotificationRepository);
  }, ['NotificationRepository']);

  // Register controllers
  container.register('AuthController', AuthController, ['UserService'], { singleton: true });

  // Register other controllers as factories
  container.registerFactory('DestinationController', (DestinationService) => {
    const DestinationController = require('../controllers/destination.controller');
    return new DestinationController(DestinationService);
  }, ['DestinationService']);

  container.registerFactory('BookingController', (BookingService) => {
    const BookingController = require('../controllers/booking.controller');
    return new BookingController(BookingService);
  }, ['BookingService']);

  container.registerFactory('ReviewController', (ReviewService) => {
    const ReviewController = require('../controllers/review.controller');
    return new ReviewController(ReviewService);
  }, ['ReviewService']);

  // container.registerFactory('PaymentController', (PaymentService) => {
  //   const PaymentController = require('../controllers/payment.controller');
  //   return new PaymentController(PaymentService);
  // }, ['PaymentService']); // Payment controller not implemented yet

  container.registerFactory('NotificationController', (NotificationService) => {
    const NotificationController = require('../controllers/notification.controller');
    return new NotificationController(NotificationService);
  }, ['NotificationService']);

  // Register utilities
  container.registerInstance('redisUtils', redisUtils);
}

/**
 * Initialize the service registry
 */
function initialize() {
  try {
    registerServices();
    console.log('Service registry initialized successfully');
  } catch (error) {
    console.error('Failed to initialize service registry:', error);
    throw error;
  }
}

/**
 * Get a service from the container
 * @param {string} serviceName - Name of the service
 * @returns {*} Service instance
 */
function get(serviceName) {
  return container.get(serviceName);
}

/**
 * Check if a service is registered
 * @param {string} serviceName - Name of the service
 * @returns {boolean} Registration status
 */
function has(serviceName) {
  return container.has(serviceName);
}

module.exports = {
  initialize,
  get,
  has,
  container
};