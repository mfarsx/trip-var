import { FiHeart, FiMapPin, FiStar, FiInfo, FiDollarSign } from "react-icons/fi";
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createBooking, checkAvailability } from '../../store/slices/bookingSlice';

export default function DestinationDetail({ destination, onBack }) {
  const dispatch = useDispatch();
  const { creating, availability } = useSelector((state) => state.bookings);
  
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    guests: 1,
    paymentMethod: 'credit-card',
    agreeTerms: false
  });

  const [availabilityChecked, setAvailabilityChecked] = useState(false);

  const handleDateChange = async (field, value) => {
    const newBookingData = { ...bookingData, [field]: value };
    setBookingData(newBookingData);

    // Check availability when both dates are selected
    if (newBookingData.startDate && newBookingData.endDate) {
      try {
        await dispatch(checkAvailability({
          destinationId: destination._id,
          checkInDate: newBookingData.startDate,
          checkOutDate: newBookingData.endDate
        })).unwrap();
        setAvailabilityChecked(true);
      } catch (error) {
        console.error('Availability check failed:', error);
      }
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!bookingData.startDate || !bookingData.endDate) {
      alert('Please select both check-in and check-out dates');
      return;
    }

    if (!bookingData.agreeTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    if (!availabilityChecked || !availability?.available) {
      alert('Please check availability first');
      return;
    }

    try {
      const bookingPayload = {
        destinationId: destination._id,
        checkInDate: bookingData.startDate,
        checkOutDate: bookingData.endDate,
        numberOfGuests: parseInt(bookingData.guests),
        paymentMethod: bookingData.paymentMethod,
        specialRequests: '',
        contactEmail: '',
        contactPhone: ''
      };

      await dispatch(createBooking(bookingPayload)).unwrap();
      
      // Show success message
      alert('Booking created successfully! You can view it in your bookings.');
      
      // Reset form
      setBookingData({
        startDate: '',
        endDate: '',
        guests: 1,
        paymentMethod: 'credit-card',
        agreeTerms: false
      });
      setAvailabilityChecked(false);
      
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Failed to create booking. Please try again.');
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
              src={destination.imageUrl}
              alt={destination.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute top-4 right-4">
              <button className="p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors transform hover:scale-110">
                <FiHeart className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">{destination.title}</h1>
              <div className="flex items-center gap-4 text-gray-300">
                <div className="flex items-center gap-2">
                  <FiMapPin className="w-5 h-5" />
                  <span>{destination.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiStar className="w-5 h-5 text-yellow-500" />
                  <span>{destination.rating}</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <FiInfo className="w-6 h-6 text-purple-400" />
                  About this Destination
                </h2>
                <p className="text-gray-300 leading-relaxed">{destination.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                  <h3 className="text-xl font-semibold mb-3">Category</h3>
                  <p className="text-gray-300">{destination.category}</p>
                </div>
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <FiDollarSign className="w-5 h-5 text-green-400" />
                    Price
                  </h3>
                  <p className="text-2xl font-bold text-purple-400">
                    ${destination.price}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">per person</p>
                </div>
              </div>

              {/* Booking Form */}
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                <h2 className="text-2xl font-semibold mb-4">Book Your Stay</h2>
                <form onSubmit={handleBookingSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-gray-300 mb-2" htmlFor="startDate">Start Date</label>
                      <input
                        type="date"
                        id="startDate"
                        value={bookingData.startDate}
                        onChange={(e) => handleDateChange('startDate', e.target.value)}
                        className="bg-gray-700/50 p-3 rounded-lg border border-gray-600/50"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-gray-300 mb-2" htmlFor="endDate">End Date</label>
                      <input
                        type="date"
                        id="endDate"
                        value={bookingData.endDate}
                        onChange={(e) => handleDateChange('endDate', e.target.value)}
                        className="bg-gray-700/50 p-3 rounded-lg border border-gray-600/50"
                        min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-gray-300 mb-2" htmlFor="guests">Number of Guests</label>
                      <input
                        type="number"
                        id="guests"
                        value={bookingData.guests}
                        onChange={(e) => setBookingData({ ...bookingData, guests: e.target.value })}
                        className="bg-gray-700/50 p-3 rounded-lg border border-gray-600/50"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-gray-300 mb-2" htmlFor="paymentMethod">Payment Method</label>
                      <select
                        id="paymentMethod"
                        value={bookingData.paymentMethod}
                        onChange={(e) => setBookingData({ ...bookingData, paymentMethod: e.target.value })}
                        className="bg-gray-700/50 p-3 rounded-lg border border-gray-600/50"
                      >
                        <option value="credit-card">Credit Card</option>
                        <option value="paypal">PayPal</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Availability Status */}
                  {availabilityChecked && (
                    <div className="mt-4 p-3 rounded-lg border">
                      {availability?.available ? (
                        <div className="flex items-center gap-2 text-green-400">
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          <span>Available for selected dates</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-400">
                          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                          <span>Not available for selected dates</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-4">
                    <input
                      type="checkbox"
                      id="agreeTerms"
                      checked={bookingData.agreeTerms}
                      onChange={(e) => setBookingData({ ...bookingData, agreeTerms: e.target.checked })}
                    />
                    <label className="text-gray-300" htmlFor="agreeTerms">I agree to the terms and conditions</label>
                  </div>
                  <button
                    type="submit"
                    disabled={creating || !bookingData.startDate || !bookingData.endDate || !availabilityChecked || !availability?.available || !bookingData.agreeTerms}
                    className={`w-full p-3 rounded-lg mt-4 transition-colors ${
                      creating || !bookingData.startDate || !bookingData.endDate || !availabilityChecked || !availability?.available || !bookingData.agreeTerms
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-purple-400 hover:bg-purple-500 text-white'
                    }`}
                  >
                    {creating ? 'Creating Booking...' : 'Book Now'}
                  </button>
                  
                  {(!bookingData.startDate || !bookingData.endDate) && (
                    <p className="text-yellow-400 text-sm mt-2 text-center">
                      Please select both check-in and check-out dates
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

DestinationDetail.propTypes = {
  destination: PropTypes.shape({
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
