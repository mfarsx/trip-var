import { FiHeart, FiMapPin, FiStar, FiInfo, FiDollarSign } from "react-icons/fi";
import PropTypes from 'prop-types';
import { useState } from 'react';

export default function DestinationDetail({ destination, onBack }) {
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    guests: 1,
    paymentMethod: 'credit-card',
    agreeTerms: false
  });

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    // Handle booking submission
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-gray-300 mb-2" htmlFor="startDate">Start Date</label>
                      <input
                        type="date"
                        id="startDate"
                        value={bookingData.startDate}
                        onChange={(e) => setBookingData({ ...bookingData, startDate: e.target.value })}
                        className="bg-gray-700/50 p-3 rounded-lg border border-gray-600/50"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-gray-300 mb-2" htmlFor="endDate">End Date</label>
                      <input
                        type="date"
                        id="endDate"
                        value={bookingData.endDate}
                        onChange={(e) => setBookingData({ ...bookingData, endDate: e.target.value })}
                        className="bg-gray-700/50 p-3 rounded-lg border border-gray-600/50"
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
                    className="bg-purple-400 hover:bg-purple-500 text-white p-3 rounded-lg mt-4"
                  >
                    Book Now
                  </button>
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
