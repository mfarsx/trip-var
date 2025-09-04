import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiUsers, FiDollarSign, FiMapPin, FiX, FiCheck } from 'react-icons/fi';
import PropTypes from 'prop-types';

export default function BookingConfirmationModal({ 
  isOpen, 
  onClose, 
  booking, 
  destination, 
  onConfirm 
}) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Booking confirmation failed:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateTotalNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotalAmount = () => {
    // Handle both booking data formats (from DestinationDetail and from API)
    const checkInDate = booking.checkInDate || booking.startDate;
    const checkOutDate = booking.checkOutDate || booking.endDate;
    const numberOfGuests = booking.numberOfGuests || parseInt(booking.guests) || 1;
    
    const nights = calculateTotalNights(checkInDate, checkOutDate);
    return nights * destination.price * numberOfGuests;
  };

  if (!isOpen || !booking || !destination) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl border border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Confirm Your Booking</h2>
              <p className="text-gray-400 mt-1">Please review your booking details before confirming</p>
              {booking.bookingReference && (
                <p className="text-sm text-purple-400 mt-1 font-mono">
                  Reference: {booking.bookingReference}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Destination Info */}
          <div className="bg-gray-700/50 rounded-xl p-4 mb-6">
            <div className="flex gap-4">
              <img
                src={destination.imageUrl}
                alt={destination.title}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-1">
                  {destination.title}
                </h3>
                <div className="flex items-center gap-2 text-gray-300 mb-2">
                  <FiMapPin className="w-4 h-4" />
                  <span>{destination.location}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>Category: {destination.category}</span>
                  <span>Rating: {destination.rating}/5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <FiCalendar className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Check-in</p>
                  <p className="font-semibold text-white">{formatDate(booking.checkInDate || booking.startDate)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <FiCalendar className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Check-out</p>
                  <p className="font-semibold text-white">{formatDate(booking.checkOutDate || booking.endDate)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <FiUsers className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Guests</p>
                  <p className="font-semibold text-white">{booking.numberOfGuests || parseInt(booking.guests) || 1} guest{(booking.numberOfGuests || parseInt(booking.guests) || 1) > 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <FiDollarSign className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Payment Method</p>
                  <p className="font-semibold text-white capitalize">
                    {booking.paymentMethod ? booking.paymentMethod.replace('-', ' ') : 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-xl p-6 mb-6 border border-gray-600/30">
            <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
              <FiDollarSign className="w-5 h-5 text-green-400" />
              Pricing Breakdown
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                <div className="text-gray-300">
                  <div className="font-medium">Base Rate</div>
                  <div className="text-sm text-gray-400">
                    ${destination.price} × {calculateTotalNights(booking.checkInDate || booking.startDate, booking.checkOutDate || booking.endDate)} nights × {booking.numberOfGuests || parseInt(booking.guests) || 1} guest{(booking.numberOfGuests || parseInt(booking.guests) || 1) > 1 ? 's' : ''}
                  </div>
                </div>
                <span className="font-semibold text-white">
                  ${destination.price * calculateTotalNights(booking.checkInDate || booking.startDate, booking.checkOutDate || booking.endDate) * (booking.numberOfGuests || parseInt(booking.guests) || 1)}
                </span>
              </div>
              
              <div className="border-t border-gray-600/50 pt-3">
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                  <span className="font-semibold text-white text-lg">Total Amount</span>
                  <span className="font-bold text-green-400 text-2xl">${calculateTotalAmount()}</span>
                </div>
                <div className="text-xs text-gray-400 mt-2 text-center">
                  All prices include taxes and fees
                </div>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-blue-400 mb-2">Important Information</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Booking confirmation will be sent to your email</li>
              <li>• Cancellation policy: 7+ days = 100% refund, 3-6 days = 50% refund, &lt;3 days = no refund</li>
              <li>• Check-in time: 3:00 PM, Check-out time: 11:00 AM</li>
              <li>• Special requests will be forwarded to the property</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isConfirming}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-purple-600/50 disabled:to-pink-600/50 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              {isConfirming ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Confirming...
                </>
              ) : (
                <>
                  <FiCheck className="w-5 h-5" />
                  Confirm Booking
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

BookingConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  booking: PropTypes.shape({
    checkInDate: PropTypes.string,
    checkOutDate: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    numberOfGuests: PropTypes.number,
    guests: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    paymentMethod: PropTypes.string.isRequired,
    bookingReference: PropTypes.string
  }),
  destination: PropTypes.shape({
    title: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    imageUrl: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    rating: PropTypes.number.isRequired,
    price: PropTypes.number.isRequired
  }),
  onConfirm: PropTypes.func.isRequired
};