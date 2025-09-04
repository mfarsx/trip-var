import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchUserBookings, cancelBooking } from "../store/slices/bookingSlice";
import { 
  FiCalendar, 
  FiMapPin, 
  FiUsers, 
  FiDollarSign, 
  FiX, 
  FiEye, 
  FiSearch, 
  FiFilter, 
  FiChevronDown,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiMoreVertical,
  FiDownload,
  FiEdit
} from "react-icons/fi";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import Footer from "../components/layout/Footer";
import Header from "../components/header/Header";
import PageTransition from "../components/common/PageTransition";
import toast from "react-hot-toast";

const Bookings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bookings, loading, error, cancelling } = useSelector((state) => state.bookings);
  
  // State for filtering, sorting, and search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedBooking, setExpandedBooking] = useState(null);

  useEffect(() => {
    dispatch(fetchUserBookings());
  }, [dispatch]);

  // Filter and sort bookings
  const filteredAndSortedBookings = useMemo(() => {
    let filtered = bookings.filter(booking => {
      const matchesSearch = searchTerm === "" || 
        booking.destination?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.destination?.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.bookingReference?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort bookings
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "checkin":
          return new Date(a.checkInDate) - new Date(b.checkInDate);
        case "amount":
          return b.totalAmount - a.totalAmount;
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return filtered;
  }, [bookings, searchTerm, statusFilter, sortBy]);

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await dispatch(cancelBooking({ bookingId, reason: "User requested cancellation" })).unwrap();
        toast.success("Booking cancelled successfully");
      } catch (error) {
        console.error("Failed to cancel booking:", error);
        toast.error("Failed to cancel booking. Please try again.");
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
        return "text-green-400 bg-green-400/20 border-green-400/30";
      case "cancelled":
        return "text-red-400 bg-red-400/20 border-red-400/30";
      case "completed":
        return "text-blue-400 bg-blue-400/20 border-blue-400/30";
      case "no-show":
        return "text-yellow-400 bg-yellow-400/20 border-yellow-400/30";
      default:
        return "text-gray-400 bg-gray-400/20 border-gray-400/30";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <FiCheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <FiXCircle className="w-4 h-4" />;
      case "completed":
        return <FiCheckCircle className="w-4 h-4" />;
      case "no-show":
        return <FiAlertCircle className="w-4 h-4" />;
      default:
        return <FiClock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "confirmed":
        return "Confirmed";
      case "cancelled":
        return "Cancelled";
      case "completed":
        return "Completed";
      case "no-show":
        return "No Show";
      default:
        return "Unknown";
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
      <Header />
      <PageTransition>
        <div className="pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              My Bookings
            </h1>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto mb-6">
              Manage your travel bookings, view details, and make changes to your reservations.
            </p>
            
            {/* Search and Filter Controls */}
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search bookings by destination, location, or booking ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                </div>
                
                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white hover:border-purple-500 transition-colors flex items-center gap-2"
                >
                  <FiFilter className="w-5 h-5" />
                  Filters
                  <FiChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>
              
              {/* Filter Options */}
              {showFilters && (
                <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-600/30 mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="all">All Statuses</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                        <option value="no-show">No Show</option>
                      </select>
                    </div>
                    
                    {/* Sort By */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="checkin">Check-in Date</option>
                        <option value="amount">Amount (High to Low)</option>
                        <option value="status">Status</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Results Summary */}
              <div className="text-sm text-gray-400 mb-4">
                Showing {filteredAndSortedBookings.length} of {bookings.length} bookings
                {searchTerm && (
                  <span className="ml-2">
                    for "<span className="text-purple-400">{searchTerm}</span>"
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {bookings.length === 0 ? (
          <div className="text-center py-12">
            <FiCalendar className="mx-auto text-6xl text-gray-400 mb-4" />
            <h2 className="text-xl text-gray-400 mb-2">No bookings found</h2>
            <p className="text-gray-500 mb-6">Start exploring destinations to make your first booking!</p>
            <button
              onClick={() => navigate("/destinations")}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
            >
              Explore Destinations
            </button>
          </div>
        ) : filteredAndSortedBookings.length === 0 ? (
          <div className="text-center py-12">
            <FiSearch className="mx-auto text-6xl text-gray-400 mb-4" />
            <h2 className="text-xl text-gray-400 mb-2">No bookings match your search</h2>
            <p className="text-gray-500 mb-6">Try adjusting your search terms or filters.</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setSortBy("newest");
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredAndSortedBookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-gradient-to-br from-gray-800/60 to-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30 hover:border-purple-500/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/20 group"
              >
                {/* Header with destination image and status */}
                <div className="flex gap-4 mb-6">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-700/50 flex-shrink-0">
                    <img
                      src={booking.destination?.imageUrl}
                      alt={booking.destination?.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold text-white truncate">
                        {booking.destination?.title}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1 ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {getStatusIcon(booking.status)}
                        {getStatusText(booking.status)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <FiMapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <span className="truncate">{booking.destination?.location}</span>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      Booking ID: {booking.bookingReference || booking._id.slice(-8)}
                    </div>
                  </div>
                </div>

                {/* Booking Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-700/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <FiCalendar className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-gray-400">Check-in</span>
                    </div>
                    <p className="font-medium text-white">{formatDate(booking.checkInDate)}</p>
                  </div>
                  
                  <div className="bg-gray-700/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <FiCalendar className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-gray-400">Check-out</span>
                    </div>
                    <p className="font-medium text-white">{formatDate(booking.checkOutDate)}</p>
                  </div>
                  
                  <div className="bg-gray-700/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <FiUsers className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-gray-400">Guests</span>
                    </div>
                    <p className="font-medium text-white">{booking.numberOfGuests}</p>
                  </div>
                  
                  <div className="bg-gray-700/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <FiDollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-400">Total</span>
                    </div>
                    <p className="font-medium text-green-400">${booking.totalAmount}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-4 border-t border-gray-700/30">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>{booking.totalNights} night{booking.totalNights > 1 ? "s" : ""}</span>
                    <span>•</span>
                    <span>Booked {formatDate(booking.createdAt)}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/destinations/${booking.destination?._id}`)}
                      className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors flex items-center gap-2"
                      title="View destination"
                    >
                      <FiEye className="w-4 h-4" />
                      View
                    </button>
                    
                    {booking.status === "confirmed" && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        disabled={cancelling}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                        title="Cancel booking"
                      >
                        <FiX className="w-4 h-4" />
                        Cancel
                      </button>
                    )}
                    
                    <button
                      onClick={() => setExpandedBooking(expandedBooking === booking._id ? null : booking._id)}
                      className="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 rounded-lg transition-colors flex items-center gap-2"
                      title="More options"
                    >
                      <FiMoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expandable Details */}
                {expandedBooking === booking._id && (
                  <div className="mt-4 p-4 bg-gray-700/20 rounded-lg border border-gray-600/30">
                    <h4 className="font-semibold text-white mb-3">Booking Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Payment Method:</span>
                        <span className="ml-2 text-white capitalize">
                          {booking.paymentMethod?.replace('-', ' ') || 'Not specified'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Payment Status:</span>
                        <span className="ml-2 text-white capitalize">
                          {booking.paymentStatus || 'Pending'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Price per Night:</span>
                        <span className="ml-2 text-white">${booking.pricePerNight}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Contact Email:</span>
                        <span className="ml-2 text-white">{booking.contactEmail}</span>
                      </div>
                      {booking.specialRequests && (
                        <div className="sm:col-span-2">
                          <span className="text-gray-400">Special Requests:</span>
                          <p className="mt-1 text-white">{booking.specialRequests}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-600/30 flex gap-2">
                      <button className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors flex items-center gap-2 text-sm">
                        <FiDownload className="w-4 h-4" />
                        Download Receipt
                      </button>
                      <button className="px-3 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 rounded-lg transition-colors flex items-center gap-2 text-sm">
                        <FiEdit className="w-4 h-4" />
                        Contact Support
                      </button>
                    </div>
                  </div>
                )}

                {/* Cancellation Details */}
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
                    {booking.cancelledAt && (
                      <p className="text-sm text-gray-400 mt-1">
                        <strong>Cancelled on:</strong> {formatDate(booking.cancelledAt)}
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
      </PageTransition>
      <Footer />
    </div>
  );
};

export default Bookings;