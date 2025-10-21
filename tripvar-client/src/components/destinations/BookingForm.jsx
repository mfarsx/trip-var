import { FiCalendar, FiDollarSign } from "react-icons/fi";
import PropTypes from "prop-types";
import {
  DateField,
  NumberField,
  SelectField,
  CheckboxField,
} from "../common/FormFields";

export default function BookingForm({
  formData,
  validation,
  availability,
  isCheckingAvailability,
  availabilityChecked,
  pricingPreview,
  isQuickBooking,
  loading,
  destination,
  onFieldChange,
  onDateChange,
  onSubmit,
  bookingFormRef,
}) {
  const paymentOptions = [
    { value: "credit-card", label: "Credit Card" },
    { value: "paypal", label: "PayPal" },
    { value: "bank-transfer", label: "Bank Transfer" },
  ];

  const isFormValid =
    formData.startDate &&
    formData.endDate &&
    availabilityChecked &&
    availability?.available &&
    formData.agreeTerms &&
    !isCheckingAvailability;

  return (
    <div
      ref={bookingFormRef}
      className={`bg-gray-800/50 p-6 rounded-xl border transition-all duration-500 ${
        isQuickBooking
          ? "border-purple-500/50 shadow-lg shadow-purple-500/20 bg-gradient-to-br from-gray-800/60 to-purple-900/20"
          : "border-gray-700/50"
      }`}
    >
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
          <div
            className={`flex items-center gap-2 ${
              formData.startDate && formData.endDate
                ? "text-green-400"
                : "text-gray-400"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                formData.startDate && formData.endDate
                  ? "bg-green-500 text-white"
                  : "bg-gray-600 text-gray-300"
              }`}
            >
              {formData.startDate && formData.endDate ? "✓" : "1"}
            </div>
            <span>Select Dates</span>
          </div>

          <div className="w-8 h-0.5 bg-gray-600"></div>

          <div
            className={`flex items-center gap-2 ${
              availabilityChecked && availability?.available
                ? "text-green-400"
                : "text-gray-400"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                availabilityChecked && availability?.available
                  ? "bg-green-500 text-white"
                  : "bg-gray-600 text-gray-300"
              }`}
            >
              {availabilityChecked && availability?.available ? "✓" : "2"}
            </div>
            <span>Check Availability</span>
          </div>

          <div className="w-8 h-0.5 bg-gray-600"></div>

          <div
            className={`flex items-center gap-2 ${
              formData.agreeTerms ? "text-green-400" : "text-gray-400"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                formData.agreeTerms
                  ? "bg-green-500 text-white"
                  : "bg-gray-600 text-gray-300"
              }`}
            >
              {formData.agreeTerms ? "✓" : "3"}
            </div>
            <span>Confirm & Book</span>
          </div>
        </div>
      </div>

      {isQuickBooking && (
        <div className="mb-4 p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg">
          <p className="text-purple-200 text-sm">
            🚀 <strong>Quick booking activated!</strong> We&apos;ve pre-filled
            some dates for you. Review and adjust as needed, then complete your
            booking.
          </p>
        </div>
      )}

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DateField
            id="startDate"
            label="Check-in Date"
            value={formData.startDate}
            onChange={(value) => onDateChange("startDate", value)}
            error={validation.startDate}
            min={new Date().toISOString().split("T")[0]}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                document.getElementById("endDate")?.focus();
              }
            }}
          />

          <DateField
            id="endDate"
            label="Check-out Date"
            value={formData.endDate}
            onChange={(value) => onDateChange("endDate", value)}
            error={validation.endDate}
            min={formData.startDate || new Date().toISOString().split("T")[0]}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                document.getElementById("guests")?.focus();
              }
            }}
          />

          <NumberField
            id="guests"
            label="Number of Guests"
            value={formData.guests}
            onChange={(value) => onFieldChange("guests", value)}
            error={validation.guests}
            min={1}
            max={10}
          />

          <SelectField
            id="paymentMethod"
            label="Payment Method"
            value={formData.paymentMethod}
            onChange={(value) => onFieldChange("paymentMethod", value)}
            options={paymentOptions}
          />
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
                <span>
                  ${destination.price} × {pricingPreview.nights} nights ×{" "}
                  {pricingPreview.guests} guest
                  {pricingPreview.guests > 1 ? "s" : ""}
                </span>
                <span className="font-medium">
                  ${pricingPreview.totalAmount}
                </span>
              </div>
              <div className="border-t border-gray-600/50 pt-2 flex justify-between">
                <span className="font-semibold text-white">
                  Estimated Total
                </span>
                <span className="font-bold text-green-400 text-lg">
                  ${pricingPreview.totalAmount}
                </span>
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

        <CheckboxField
          id="agreeTerms"
          label="I agree to the terms and conditions"
          checked={formData.agreeTerms}
          onChange={(checked) => onFieldChange("agreeTerms", checked)}
          error={validation.agreeTerms}
        />

        <button
          type="submit"
          disabled={loading || !isFormValid}
          className={`w-full p-4 rounded-lg mt-4 transition-all duration-200 font-semibold ${
            loading || !isFormValid
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {isCheckingAvailability
                ? "Checking Availability..."
                : "Creating Booking..."}
            </div>
          ) : (
            "Book Now"
          )}
        </button>

        {/* Form Status Messages */}
        {(!formData.startDate || !formData.endDate) &&
          !Object.keys(validation).length && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-400 text-sm text-center flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                Please select both check-in and check-out dates to see pricing
              </p>
            </div>
          )}

        {Object.keys(validation).length > 0 && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm text-center flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-red-400 rounded-full"></span>
              Please fix the errors above to continue
            </p>
          </div>
        )}
      </form>
    </div>
  );
}

BookingForm.propTypes = {
  formData: PropTypes.shape({
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string.isRequired,
    guests: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    paymentMethod: PropTypes.string.isRequired,
    agreeTerms: PropTypes.bool.isRequired,
  }).isRequired,
  validation: PropTypes.object.isRequired,
  availability: PropTypes.object,
  isCheckingAvailability: PropTypes.bool.isRequired,
  availabilityChecked: PropTypes.bool.isRequired,
  pricingPreview: PropTypes.object,
  isQuickBooking: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  destination: PropTypes.object.isRequired,
  onFieldChange: PropTypes.func.isRequired,
  onDateChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  bookingFormRef: PropTypes.object,
};
