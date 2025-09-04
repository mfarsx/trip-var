const container = require('./index');

// Models
const User = require('../public/models/user.model');
const Destination = require('../public/models/destination.model');
const Booking = require('../public/models/booking.model');
const Review = require('../public/models/review.model');
// const Payment = require('../public/models/payment.model'); // Payment model not implemented yet
const Notification = require('../public/models/notification.model');

// Repositories
const UserRepository = require('../repositories/user.repository');

// Services
const UserService = require('../services/user.service');

// Controllers
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
  container.registerFactory('DestinationRepository', (DestinationModel) => {
    const DestinationRepository = require('../repositories/destination.repository');
    return new DestinationRepository(DestinationModel);
  }, ['Destination']);

  container.registerFactory('BookingRepository', (BookingModel) => {
    const BookingRepository = require('../repositories/booking.repository');
    return new BookingRepository(BookingModel);
  }, ['Booking']);

  container.registerFactory('ReviewRepository', (ReviewModel) => {
    const ReviewRepository = require('../repositories/review.repository');
    return new ReviewRepository(ReviewModel);
  }, ['Review']);

  // container.registerFactory('PaymentRepository', (Payment) => {
  //   const PaymentRepository = require('../repositories/payment.repository');
  //   return new PaymentRepository(Payment);
  // }, ['Payment']); // Payment repository not implemented yet

  container.registerFactory('NotificationRepository', (NotificationModel) => {
    const NotificationRepository = require('../repositories/notification.repository');
    return new NotificationRepository(NotificationModel);
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
    // Service registry initialized successfully
  } catch (error) {
    throw new Error(`Failed to initialize service registry: ${error.message}`);
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