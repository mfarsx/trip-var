import { FiHeart, FiMapPin, FiStar, FiInfo, FiDollarSign, FiCalendar, FiUsers, FiCheck } from "react-icons/fi";
import PropTypes from 'prop-types';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { createBooking, checkAvailability } from '../../store/slices/bookingSlice';
import { fetchProfile } from '../../store/slices/authSlice';
import { fetchDestinationById } from '../../store/slices/destinationSlice';
import { toggleFavorite } from '../../services/userService';
import ReviewsSection from '../reviews/ReviewsSection';
import BookingConfirmationModal from '../bookings/BookingConfirmationModal';
import toast from 'react-hot-toast';

export default function DestinationDetail({ destination, onBack }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { creating, availability } = useSelector((state) => state.bookings);
  const { user } = useSelector((state) => state.auth);
  const { currentDestination } = useSelector((state) => state.destinations);
  const [searchParams] = useSearchParams();
  const bookingFormRef = useRef(null);
  const fetchedDestinationId = useRef(null);
  
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    guests: 1,
    paymentMethod: 'credit-card',
    agreeTerms: false
  });

  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isQuickBooking, setIsQuickBooking] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const isFavorite = user?.favorites?.some(fav => fav._id === destination._id);
  
  // Use currentDestination if available (with updated rating), otherwise fall back to destination prop
  const displayDestination = useMemo(() => {
    return currentDestination || destination;
  }, [currentDestination, destination]);
  
  // Load destination data on mount to get latest rating
  useEffect(() => {
    if (destination._id && fetchedDestinationId.current !== destination._id) {
      console.log('Fetching destination data for:', destination._id);
      fetchedDestinationId.current = destination._id;
      dispatch(fetchDestinationById(destination._id));
    }
  }, [dispatch, destination._id]);

  // Reset fetched destination ID when component unmounts
  useEffect(() => {
    return () => {
      fetchedDestinationId.current = null;
    };
  }, []);

  // Form validation functions
  const validateForm = () => {
    const errors = {};
    
    if (!bookingData.startDate) {
      errors.startDate = 'Check-in date is required';
    } else if (new Date(bookingData.startDate) <= new Date()) {
      errors.startDate = 'Check-in date must be in the future';
    }
    
    if (!bookingData.endDate) {
      errors.endDate = 'Check-out date is required';
    } else if (bookingData.startDate && new Date(bookingData.endDate) <= new Date(bookingData.startDate)) {
      errors.endDate = 'Check-out date must be after check-in date';
    }
    
    if (!bookingData.guests || bookingData.guests < 1) {
      errors.guests = 'At least 1 guest is required';
    } else if (bookingData.guests > 10) {
      errors.guests = 'Maximum 10 guests allowed';
    }
    
    if (!bookingData.agreeTerms) {
      errors.agreeTerms = 'You must agree to the terms and conditions';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearFieldError = (field) => {
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Calculate pricing preview
  const calculatePricingPreview = () => {
    if (!bookingData.startDate || !bookingData.endDate || !bookingData.guests) {
      return null;
    }
    
    const startDate = new Date(bookingData.startDate);
    const endDate = new Date(bookingData.endDate);
    const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const guests = parseInt(bookingData.guests) || 1;
    const totalAmount = nights * displayDestination.price * guests;
    
    return { nights, guests, totalAmount };
  };

  const pricingPreview = calculatePricingPreview();

  // Handle quick booking action from URL parameter
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'book') {
      setIsQuickBooking(true);
      
      // Pre-fill default dates for quick booking
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfterTomorrow = new Date(today);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
      
      setBookingData(prev => ({
        ...prev,
        startDate: tomorrow.toISOString().split('T')[0],
        endDate: dayAfterTomorrow.toISOString().split('T')[0],
        guests: 2 // Default to 2 guests
      }));
      
      // Scroll to booking form after a short delay to ensure page is loaded
      setTimeout(() => {
        if (bookingFormRef.current) {
          bookingFormRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
          // Focus on the first input field
          const firstInput = bookingFormRef.current.querySelector('input');
          if (firstInput) {
            firstInput.focus();
          }
        }
      }, 500);
      
      // Show a toast message to guide the user
      toast.success('Ready to book! We\'ve pre-filled some dates for you. Please review and adjust as needed.', {
        duration: 5000,
      });
    }
  }, [searchParams]);

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error("Please log in to add favorites");
      return;
    }

    try {
      await toggleFavorite(displayDestination._id);
      dispatch(fetchProfile()); // Refresh user data
      toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
    } catch {
      toast.error("Failed to update favorites");
    }
  };

  const handleDateChange = async (field, value) => {
    const newBookingData = { ...bookingData, [field]: value };
    setBookingData(newBookingData);
    
    // Clear field error when user starts typing
    clearFieldError(field);

    // Check availability when both dates are selected
    if (newBookingData.startDate && newBookingData.endDate) {
      setIsCheckingAvailability(true);
      try {
        await dispatch(checkAvailability({
          destinationId: destination._id,
          checkInDate: newBookingData.startDate,
          checkOutDate: newBookingData.endDate
        })).unwrap();
        setAvailabilityChecked(true);
      } catch (error) {
        console.error('Availability check failed:', error);
        setAvailabilityChecked(false);
      } finally {
        setIsCheckingAvailability(false);
      }
    } else {
      setAvailabilityChecked(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    if (!availabilityChecked || !availability?.available) {
      toast.error('Please check availability first');
      return;
    }

    // Show booking confirmation modal
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    try {
      const bookingPayload = {
        destinationId: displayDestination._id,
        checkInDate: bookingData.startDate,
        checkOutDate: bookingData.endDate,
        numberOfGuests: parseInt(bookingData.guests),
        paymentMethod: bookingData.paymentMethod,
        specialRequests: '',
        contactEmail: user?.email || '',
        contactPhone: ''
      };

      await dispatch(createBooking(bookingPayload)).unwrap();
      
      // Show success state
      setBookingSuccess(true);
      setShowBookingModal(false);
      
      // Show success message
      toast.success('🎉 Booking created successfully! You can view it in your bookings.');
      
      // Reset form after showing success
      setTimeout(() => {
        setBookingData({
          startDate: '',
          endDate: '',
          guests: 1,
          paymentMethod: 'credit-card',
          agreeTerms: false
        });
        setAvailabilityChecked(false);
        setBookingSuccess(false);
        
        // Navigate to bookings page
        navigate('/bookings');
      }, 3000);
      
    } catch (error) {
      console.error('Booking failed:', error);
      toast.error('Failed to create booking. Please try again.');
      throw error; // Re-throw to handle in modal
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1f2d] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={onBack}
          className="mb-8 text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-lg"
        >
          ← Back to Destinations
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Image Section */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
            <img
              src={displayDestination.imageUrl}
              alt={displayDestination.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute top-4 right-4">
              <button 
                onClick={handleToggleFavorite}
                className={`p-3 rounded-full transition-colors transform hover:scale-110 ${
                  isFavorite 
                    ? 'bg-red-500/80 hover:bg-red-500 text-white' 
                    : 'bg-black/50 hover:bg-black/70 text-white'
                }`}
                title={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <FiHeart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">{displayDestination.title}</h1>
              <div className="flex items-center gap-4 text-gray-300">
                <div className="flex items-center gap-2">
                  <FiMapPin className="w-5 h-5" />
                  <span>{displayDestination.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiStar className="w-5 h-5 text-yellow-500" />
                  <span>{displayDestination.rating}</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <FiInfo className="w-6 h-6 text-purple-400" />
                  About this Destination
                </h2>
                <p className="text-gray-300 leading-relaxed">{displayDestination.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                  <h3 className="text-xl font-semibold mb-3">Category</h3>
                  <p className="text-gray-300">{displayDestination.category}</p>
                </div>
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <FiDollarSign className="w-5 h-5 text-green-400" />
                    Price
                  </h3>
                  <p className="text-2xl font-bold text-purple-400">
                    ${displayDestination.price}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">per person</p>
                </div>
              </div>

              {/* Booking Form */}
              <div ref={bookingFormRef} className={`bg-gray-800/50 p-6 rounded-xl border transition-all duration-500 ${
                isQuickBooking 
                  ? 'border-purple-500/50 shadow-lg shadow-purple-500/20 bg-gradient-to-br from-gray-800/60 to-purple-900/20' 
                  : 'border-gray-700/50'
              }`}>
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <FiCalendar className="w-6 h-6 text-purple-400" />
                    Book Your Stay
                    {isQuickBooking && (
                      <span className="ml-2 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium rounded-full animate-pulse">
                        Quick Book
                      </span>
                    )}
                  </h2>
                  
                  {/* Progress Indicator */}
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`flex items-center gap-2 ${bookingData.startDate && bookingData.endDate ? 'text-green-400' : 'text-gray-400'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        bookingData.startDate && bookingData.endDate ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
                      }`}>
                        {bookingData.startDate && bookingData.endDate ? '✓' : '1'}
                      </div>
                      <span>Select Dates</span>
                    </div>
                    
                    <div className="w-8 h-0.5 bg-gray-600"></div>
                    
                    <div className={`flex items-center gap-2 ${availabilityChecked && availability?.available ? 'text-green-400' : 'text-gray-400'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        availabilityChecked && availability?.available ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
                      }`}>
                        {availabilityChecked && availability?.available ? '✓' : '2'}
                      </div>
                      <span>Check Availability</span>
                    </div>
                    
                    <div className="w-8 h-0.5 bg-gray-600"></div>
                    
                    <div className={`flex items-center gap-2 ${bookingData.agreeTerms ? 'text-green-400' : 'text-gray-400'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        bookingData.agreeTerms ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
                      }`}>
                        {bookingData.agreeTerms ? '✓' : '3'}
                      </div>
                      <span>Confirm & Book</span>
                    </div>
                  </div>
                </div>
                {isQuickBooking && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg">
                    <p className="text-purple-200 text-sm">
                      🚀 <strong>Quick booking activated!</strong> We've pre-filled some dates for you. Review and adjust as needed, then complete your booking.
                    </p>
                  </div>
                )}
                <form onSubmit={handleBookingSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-gray-300 mb-2 flex items-center gap-2" htmlFor="startDate">
                        <FiCalendar className="w-4 h-4" />
                        Check-in Date
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        value={bookingData.startDate}
                        onChange={(e) => handleDateChange('startDate', e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            document.getElementById('endDate')?.focus();
                          }
                        }}
                        className={`bg-gray-700/50 p-3 rounded-lg border transition-all duration-200 ${
                          formErrors.startDate 
                            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                            : 'border-gray-600/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                        }`}
                        min={new Date().toISOString().split('T')[0]}
                        aria-describedby={formErrors.startDate ? 'startDate-error' : undefined}
                      />
                      {formErrors.startDate && (
                        <p id="startDate-error" className="text-red-400 text-sm mt-1 flex items-center gap-1">
                          <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                          {formErrors.startDate}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <label className="text-gray-300 mb-2 flex items-center gap-2" htmlFor="endDate">
                        <FiCalendar className="w-4 h-4" />
                        Check-out Date
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        value={bookingData.endDate}
                        onChange={(e) => handleDateChange('endDate', e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            document.getElementById('guests')?.focus();
                          }
                        }}
                        className={`bg-gray-700/50 p-3 rounded-lg border transition-all duration-200 ${
                          formErrors.endDate 
                            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                            : 'border-gray-600/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                        }`}
                        min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                        aria-describedby={formErrors.endDate ? 'endDate-error' : undefined}
                      />
                      {formErrors.endDate && (
                        <p id="endDate-error" className="text-red-400 text-sm mt-1 flex items-center gap-1">
                          <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                          {formErrors.endDate}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <label className="text-gray-300 mb-2 flex items-center gap-2" htmlFor="guests">
                        <FiUsers className="w-4 h-4" />
                        Number of Guests
                      </label>
                      <input
                        type="number"
                        id="guests"
                        min="1"
                        max="10"
                        value={bookingData.guests}
                        onChange={(e) => {
                          setBookingData({ ...bookingData, guests: e.target.value });
                          clearFieldError('guests');
                        }}
                        className={`bg-gray-700/50 p-3 rounded-lg border transition-all duration-200 ${
                          formErrors.guests 
                            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                            : 'border-gray-600/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                        }`}
                      />
                      {formErrors.guests && (
                        <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                          <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                          {formErrors.guests}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <label className="text-gray-300 mb-2 flex items-center gap-2" htmlFor="paymentMethod">
                        <FiDollarSign className="w-4 h-4" />
                        Payment Method
                      </label>
                      <select
                        id="paymentMethod"
                        value={bookingData.paymentMethod}
                        onChange={(e) => setBookingData({ ...bookingData, paymentMethod: e.target.value })}
                        className="bg-gray-700/50 p-3 rounded-lg border border-gray-600/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                      >
                        <option value="credit-card">Credit Card</option>
                        <option value="paypal">PayPal</option>
                        <option value="bank-transfer">Bank Transfer</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Pricing Preview */}
                  {pricingPreview && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg">
                      <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                        <FiDollarSign className="w-4 h-4" />
                        Pricing Preview
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-300">
                          <span>${displayDestination.price} × {pricingPreview.nights} nights × {pricingPreview.guests} guest{pricingPreview.guests > 1 ? 's' : ''}</span>
                          <span className="font-medium">${pricingPreview.totalAmount}</span>
                        </div>
                        <div className="border-t border-gray-600/50 pt-2 flex justify-between">
                          <span className="font-semibold text-white">Estimated Total</span>
                          <span className="font-bold text-green-400 text-lg">${pricingPreview.totalAmount}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Availability Status */}
                  {(availabilityChecked || isCheckingAvailability) && (
                    <div className="mt-4 p-3 rounded-lg border border-gray-600/50">
                      {isCheckingAvailability ? (
                        <div className="flex items-center gap-2 text-blue-400">
                          <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                          <span>Checking availability...</span>
                        </div>
                      ) : availability?.available ? (
                        <div className="flex items-center gap-2 text-green-400">
                          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                          <span>✅ Available for selected dates</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-400">
                          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                          <span>❌ Not available for selected dates</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-start gap-3 mt-4">
                    <input
                      type="checkbox"
                      id="agreeTerms"
                      checked={bookingData.agreeTerms}
                      onChange={(e) => {
                        setBookingData({ ...bookingData, agreeTerms: e.target.checked });
                        clearFieldError('agreeTerms');
                      }}
                      className={`mt-1 w-4 h-4 rounded border-2 transition-colors ${
                        formErrors.agreeTerms 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-gray-600 focus:border-purple-500'
                      }`}
                    />
                    <div className="flex-1">
                      <label className="text-gray-300 cursor-pointer" htmlFor="agreeTerms">
                        I agree to the terms and conditions
                      </label>
                      {formErrors.agreeTerms && (
                        <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                          <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                          {formErrors.agreeTerms}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={creating || !bookingData.startDate || !bookingData.endDate || !availabilityChecked || !availability?.available || !bookingData.agreeTerms || isCheckingAvailability}
                    className={`w-full p-4 rounded-lg mt-4 transition-all duration-200 font-semibold ${
                      creating || !bookingData.startDate || !bookingData.endDate || !availabilityChecked || !availability?.available || !bookingData.agreeTerms || isCheckingAvailability
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                    }`}
                  >
                    {creating ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating Booking...
                      </div>
                    ) : isCheckingAvailability ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Checking Availability...
                      </div>
                    ) : (
                      'Book Now'
                    )}
                  </button>
                  
                  {/* Form Status Messages */}
                  {(!bookingData.startDate || !bookingData.endDate) && !Object.keys(formErrors).length && (
                    <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <p className="text-yellow-400 text-sm text-center flex items-center justify-center gap-2">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                        Please select both check-in and check-out dates to see pricing
                      </p>
                    </div>
                  )}
                  
                  {Object.keys(formErrors).length > 0 && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-400 text-sm text-center flex items-center justify-center gap-2">
                        <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                        Please fix the errors above to continue
                      </p>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <ReviewsSection destinationId={displayDestination._id} destination={displayDestination} />
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      <BookingConfirmationModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        booking={bookingData}
        destination={displayDestination}
        onConfirm={handleConfirmBooking}
      />

      {/* Success Animation Overlay */}
      {bookingSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-2xl p-8 text-center border border-gray-700 animate-pulse">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <FiCheck className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h3>
            <p className="text-gray-300 mb-4">Your booking has been successfully created.</p>
            <p className="text-sm text-gray-400">Redirecting to your bookings...</p>
          </div>
        </div>
      )}
    </div>
  );
}

DestinationDetail.propTypes = {
  destination: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    imageUrl: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    rating: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired
  }).isRequired,
  onBack: PropTypes.func.isRequired
};
