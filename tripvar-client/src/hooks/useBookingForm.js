import { useCallback, useMemo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createBooking, checkAvailability } from "../store/slices/bookingSlice";
import { fetchProfile } from "../store/slices/authSlice";
import { toggleFavorite } from "../services/userService";
import {
  updateFormData,
  setValidation,
  clearFieldError,
  setAvailability,
  setCheckingAvailability,
  clearAvailability,
  setPricingPreview,
  setQuickBooking,
  setBookingSuccess,
  resetFormData,
  selectFormData,
  selectValidation,
  selectAvailability,
  selectIsCheckingAvailability,
  selectAvailabilityChecked,
  selectPricingPreview,
  selectIsQuickBooking,
  selectBookingSuccess,
  selectBookingLoading,
  selectBookingError,
} from "../store/slices/bookingFormSlice";
import toast from "react-hot-toast";

export const useBookingForm = (destination) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Selectors
  const formData = useSelector(selectFormData);
  const validation = useSelector(selectValidation);
  const availability = useSelector(selectAvailability);
  const isCheckingAvailability = useSelector(selectIsCheckingAvailability);
  const availabilityChecked = useSelector(selectAvailabilityChecked);
  const pricingPreview = useSelector(selectPricingPreview);
  const isQuickBooking = useSelector(selectIsQuickBooking);
  const bookingSuccess = useSelector(selectBookingSuccess);
  const loading = useSelector(selectBookingLoading);
  const error = useSelector(selectBookingError);

  const { creating } = useSelector((state) => state.bookings);
  const { user } = useSelector((state) => state.auth);

  // Form validation
  const validateForm = useCallback(() => {
    const errors = {};

    if (!formData.startDate) {
      errors.startDate = "Check-in date is required";
    } else if (new Date(formData.startDate) <= new Date()) {
      errors.startDate = "Check-in date must be in the future";
    }

    if (!formData.endDate) {
      errors.endDate = "Check-out date is required";
    } else if (
      formData.startDate &&
      new Date(formData.endDate) <= new Date(formData.startDate)
    ) {
      errors.endDate = "Check-out date must be after check-in date";
    }

    if (!formData.guests || formData.guests < 1) {
      errors.guests = "At least 1 guest is required";
    } else if (formData.guests > 10) {
      errors.guests = "Maximum 10 guests allowed";
    }

    if (!formData.agreeTerms) {
      errors.agreeTerms = "You must agree to the terms and conditions";
    }

    dispatch(setValidation(errors));
    return Object.keys(errors).length === 0;
  }, [formData, dispatch]);

  // Calculate pricing preview
  const calculatePricingPreview = useCallback(() => {
    if (
      !formData.startDate ||
      !formData.endDate ||
      !formData.guests ||
      !destination
    ) {
      return null;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const guests = parseInt(formData.guests) || 1;
    const totalAmount = nights * destination.price * guests;

    return { nights, guests, totalAmount };
  }, [formData, destination]);

  // Update pricing preview when form data changes
  useEffect(() => {
    const preview = calculatePricingPreview();
    dispatch(setPricingPreview(preview));
  }, [formData, destination, dispatch]);

  // Handle form field changes
  const handleFieldChange = useCallback(
    (field, value) => {
      dispatch(updateFormData({ [field]: value }));
      dispatch(clearFieldError(field));
    },
    [dispatch]
  );

  // Handle date changes with availability checking
  const handleDateChange = useCallback(
    async (field, value) => {
      dispatch(updateFormData({ [field]: value }));
      dispatch(clearFieldError(field));

      const newFormData = { ...formData, [field]: value };

      // Check availability when both dates are selected
      if (newFormData.startDate && newFormData.endDate) {
        dispatch(setCheckingAvailability(true));
        try {
          await dispatch(
            checkAvailability({
              destinationId: destination._id,
              checkInDate: newFormData.startDate,
              checkOutDate: newFormData.endDate,
            })
          ).unwrap();
          dispatch(setAvailability({ available: true }));
        } catch (error) {
          console.error("Availability check failed:", error);
          dispatch(setAvailability({ available: false }));
        } finally {
          dispatch(setCheckingAvailability(false));
        }
      } else {
        dispatch(clearAvailability());
      }
    },
    [dispatch, formData, destination]
  );

  // Handle favorite toggle
  const handleToggleFavorite = useCallback(async () => {
    if (!user) {
      toast.error("Please log in to add favorites");
      return;
    }

    try {
      await toggleFavorite(destination._id);
      dispatch(fetchProfile());
      const isFavorite = user?.favorites?.some(
        (fav) => fav._id === destination._id
      );
      toast.success(
        isFavorite ? "Removed from favorites" : "Added to favorites"
      );
    } catch {
      toast.error("Failed to update favorites");
    }
  }, [user, destination._id, dispatch]);

  // Handle booking submission
  const handleBookingSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!validateForm()) {
        toast.error("Please fix the errors in the form");
        return;
      }

      if (!availabilityChecked || !availability?.available) {
        toast.error("Please check availability first");
        return;
      }

      return true; // Return true to indicate form is valid
    },
    [validateForm, availabilityChecked, availability]
  );

  // Handle booking confirmation
  const handleConfirmBooking = useCallback(async () => {
    try {
      const bookingPayload = {
        destinationId: destination._id,
        checkInDate: formData.startDate,
        checkOutDate: formData.endDate,
        numberOfGuests: parseInt(formData.guests),
        paymentMethod: formData.paymentMethod,
        specialRequests: "",
        contactEmail: user?.email || "",
        contactPhone: "",
      };

      await dispatch(createBooking(bookingPayload)).unwrap();

      dispatch(setBookingSuccess(true));

      toast.success(
        "🎉 Booking created successfully! You can view it in your bookings."
      );

      // Reset form and navigate after delay
      setTimeout(() => {
        dispatch(resetFormData());
        navigate("/bookings");
      }, 3000);
    } catch (error) {
      console.error("Booking failed:", error);
      toast.error("Failed to create booking. Please try again.");
      throw error;
    }
  }, [dispatch, destination._id, formData, user, navigate]);

  // Handle quick booking activation
  const activateQuickBooking = useCallback(() => {
    dispatch(setQuickBooking(true));
    toast.success(
      "Ready to book! We've pre-filled some dates for you. Please review and adjust as needed.",
      {
        duration: 5000,
      }
    );
  }, [dispatch]);

  // Reset form
  const resetForm = useCallback(() => {
    dispatch(resetFormData());
  }, [dispatch]);

  return {
    // State
    formData,
    validation,
    availability,
    isCheckingAvailability,
    availabilityChecked,
    pricingPreview,
    isQuickBooking,
    bookingSuccess,
    loading: loading || creating,
    error,

    // Computed values
    isFavorite: user?.favorites?.some((fav) => fav._id === destination._id),

    // Actions
    handleFieldChange,
    handleDateChange,
    handleToggleFavorite,
    handleBookingSubmit,
    handleConfirmBooking,
    activateQuickBooking,
    resetForm,
    validateForm,
  };
};
