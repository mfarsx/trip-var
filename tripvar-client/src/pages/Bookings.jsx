import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchUserBookings, cancelBooking } from "../store/slices/bookingSlice";
import { FiCalendar, FiMapPin, FiUsers, FiDollarSign, FiX } from "react-icons/fi";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import Footer from "../components/layout/Footer";

const Bookings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bookings, loading, error, cancelling } = useSelector((state) => state.bookings);

  useEffect(() => {
    dispatch(fetchUserBookings());
  }, [dispatch]);

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await dispatch(cancelBooking({ bookingId, reason: "User requested cancellation" })).unwrap();
      } catch (error) {
        console.error("Failed to cancel booking:", error);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "text-green-400 bg-green-400/20";
      case "cancelled":
        return "text-red-400 bg-red-400/20";
      case "completed":
        return "text-blue-400 bg-blue-400/20";
      case "no-show":
        return "text-yellow-400 bg-yellow-400/20";
      default:
        return "text-gray-400 bg-gray-400/20";
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="min-h-screen bg-[#1a1f2d] text-white">
      <div className="pt-20 pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              My Bookings
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Manage your travel bookings, view details, and make changes to your reservations.
            </p>
          </div>
        
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <FiCalendar className="mx-auto text-6xl text-gray-400 mb-4" />
            <h2 className="text-xl text-gray-400 mb-2">No bookings found</h2>
            <p className="text-gray-500 mb-6">Start exploring destinations to make your first booking!</p>
            <button
              onClick={() => navigate("/destinations")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Explore Destinations
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {booking.destination?.title}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <FiMapPin className="w-4 h-4" />
                      <span>{booking.destination?.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                    {booking.status === "confirmed" && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        disabled={cancelling}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Cancel booking"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="w-4 h-4 text-purple-400" />
                    <div>
                      <p className="text-sm text-gray-400">Check-in</p>
                      <p className="font-medium">{formatDate(booking.checkInDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCalendar className="w-4 h-4 text-purple-400" />
                    <div>
                      <p className="text-sm text-gray-400">Check-out</p>
                      <p className="font-medium">{formatDate(booking.checkOutDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiUsers className="w-4 h-4 text-purple-400" />
                    <div>
                      <p className="text-sm text-gray-400">Guests</p>
                      <p className="font-medium">{booking.numberOfGuests}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-700/50">
                  <div className="flex items-center gap-2">
                    <FiDollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-lg font-semibold text-green-400">
                      ${booking.totalAmount}
                    </span>
                    <span className="text-sm text-gray-400">
                      for {booking.totalNights} night{booking.totalNights > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Booking ID: {booking.bookingReference}
                  </div>
                </div>

                {booking.status === "cancelled" && booking.cancellationReason && (
                  <div className="mt-4 p-3 bg-red-400/10 border border-red-400/20 rounded-lg">
                    <p className="text-sm text-red-400">
                      <strong>Cancellation reason:</strong> {booking.cancellationReason}
                    </p>
                    {booking.refundAmount > 0 && (
                      <p className="text-sm text-green-400 mt-1">
                        <strong>Refund amount:</strong> ${booking.refundAmount}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Bookings;