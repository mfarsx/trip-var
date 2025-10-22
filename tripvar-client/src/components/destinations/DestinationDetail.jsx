import { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { fetchDestinationById } from "../../store/slices/destinationSlice";
import { setBookingSuccess } from "../../store/slices/bookingFormSlice";
import { useBookingForm } from "../../hooks/useBookingForm";
import DestinationHeader from "./DestinationHeader";
import BookingForm from "./BookingForm";
import ReviewsSection from "../reviews/ReviewsSection";
import BookingConfirmationModal from "../bookings/BookingConfirmationModal";
import { FiCheck } from "react-icons/fi";
import PropTypes from "prop-types";

export default function DestinationDetail({ destination, onBack }) {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const bookingFormRef = useRef(null);
  const [isFetchingDestination, setIsFetchingDestination] = useState(false);

  const { currentDestination } = useSelector((state) => state.destinations);

  // Use currentDestination if available (with updated rating), otherwise fall back to destination prop
  const displayDestination = useMemo(() => {
    return currentDestination || destination;
  }, [currentDestination, destination]);

  // Memoize destinationId to prevent unnecessary re-renders
  const destinationId = useMemo(() => {
    return displayDestination?._id;
  }, [displayDestination?._id]);

  // Load destination data on mount to get latest rating (only once per ID)
  useEffect(() => {
    if (destination._id && !currentDestination && !isFetchingDestination) {
      console.log("Fetching destination data for:", destination._id);
      setIsFetchingDestination(true);
      dispatch(fetchDestinationById(destination._id)).finally(() => {
        setIsFetchingDestination(false);
      });
    }
  }, [dispatch, destination._id, currentDestination, isFetchingDestination]);

  // Use the custom booking form hook
  const {
    formData,
    validation,
    availability,
    isCheckingAvailability,
    availabilityChecked,
    pricingPreview,
    isQuickBooking,
    bookingSuccess,
    loading,
    isFavorite,
    handleFieldChange,
    handleDateChange,
    handleToggleFavorite,
    handleBookingSubmit,
    handleConfirmBooking,
    activateQuickBooking,
  } = useBookingForm(displayDestination);

  // Handle quick booking action from URL parameter
  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "book") {
      activateQuickBooking();

      // Scroll to booking form after a short delay to ensure page is loaded
      setTimeout(() => {
        if (bookingFormRef.current) {
          bookingFormRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
          // Focus on the first input field
          const firstInput = bookingFormRef.current.querySelector("input");
          if (firstInput) {
            firstInput.focus();
          }
        }
      }, 500);
    }
  }, [searchParams, activateQuickBooking]);

  // Reset booking success state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(setBookingSuccess(false));
    };
  }, [dispatch]);

  const handleBookingFormSubmit = async (e) => {
    const isValid = await handleBookingSubmit(e);
    if (isValid) {
      setShowBookingModal(true);
    }
  };

  const [showBookingModal, setShowBookingModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#1a1f2d] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <DestinationHeader
          destination={displayDestination}
          isFavorite={isFavorite}
          onToggleFavorite={handleToggleFavorite}
          onBack={onBack}
        />

        {/* Booking Form Section */}
        <div className="mt-8">
          <BookingForm
            formData={formData}
            validation={validation}
            availability={availability}
            isCheckingAvailability={isCheckingAvailability}
            availabilityChecked={availabilityChecked}
            pricingPreview={pricingPreview}
            isQuickBooking={isQuickBooking}
            loading={loading}
            destination={displayDestination}
            onFieldChange={handleFieldChange}
            onDateChange={handleDateChange}
            onSubmit={handleBookingFormSubmit}
            bookingFormRef={bookingFormRef}
          />
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <ReviewsSection
            destinationId={destinationId}
            destination={displayDestination}
          />
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      <BookingConfirmationModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        booking={formData}
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
            <h3 className="text-2xl font-bold text-white mb-2">
              Booking Confirmed!
            </h3>
            <p className="text-gray-300 mb-4">
              Your booking has been successfully created.
            </p>
            <p className="text-sm text-gray-400">
              Redirecting to your bookings...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

DestinationDetail.propTypes = {
  destination: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    imageUrl: PropTypes.string,
    location: PropTypes.string,
    rating: PropTypes.number,
    description: PropTypes.string,
    price: PropTypes.number,
  }).isRequired,
  onBack: PropTypes.func.isRequired,
};
