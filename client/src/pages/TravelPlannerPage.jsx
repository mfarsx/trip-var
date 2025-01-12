import React, { useState } from "react";
import { withErrorHandling } from "../utils/error";
import { useErrorHandler } from "../hooks/useErrorHandler";
import { logError } from "../utils/logger";
import { ApiError } from "../utils/error";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const INTERESTS = [
  "History",
  "Food",
  "Nature",
  "Art",
  "Shopping",
  "Adventure",
  "Culture",
  "Relaxation",
  "Nightlife",
  "Photography",
];

const BUDGET_OPTIONS = [
  { value: "budget", label: "Budget" },
  { value: "mid-range", label: "Mid-Range" },
  { value: "luxury", label: "Luxury" },
];

const ACCOMMODATION_TYPES = [
  { value: "hotel", label: "Hotel" },
  { value: "hostel", label: "Hostel" },
  { value: "apartment", label: "Apartment" },
  { value: "resort", label: "Resort" },
  { value: "guesthouse", label: "Guesthouse" },
];

const TRAVEL_STYLES = [
  { value: "relaxed", label: "Relaxed" },
  { value: "adventurous", label: "Adventurous" },
  { value: "cultural", label: "Cultural" },
  { value: "luxury", label: "Luxury" },
  { value: "budget", label: "Budget" },
];

export function TravelPlannerPage() {
  const [preferences, setPreferences] = useState({
    destination: "",
    start_date: new Date(),
    end_date: new Date(),
    budget: "",
    interests: [],
    accommodation_type: "",
    travel_style: "",
    num_travelers: 1,
  });
  const [specialRequests, setSpecialRequests] = useState("");
  const [travelPlan, setTravelPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { error, setError, clearError } = useErrorHandler("travel-planner");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPreferences((prev) => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  const handleInterestToggle = (interest) => {
    setPreferences((prev) => {
      const interests = prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!preferences.destination) {
      setError("Please enter a destination");
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_PATH}/travel/plan`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(
              import.meta.env.VITE_AUTH_TOKEN_KEY
            )}`,
          },
          body: JSON.stringify({
            preferences: {
              ...preferences,
              start_date: preferences.start_date.toISOString().split("T")[0],
              end_date: preferences.end_date.toISOString().split("T")[0],
            },
            special_requests: specialRequests,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiError(
          errorData.detail || "Failed to generate travel plan",
          response.status,
          "TRAVEL_PLAN_ERROR",
          { response: errorData }
        );
      }

      const data = await response.json();
      if (!data.success) {
        throw new ApiError(
          data.message || "Failed to generate travel plan",
          response.status,
          "TRAVEL_PLAN_ERROR",
          { response: data }
        );
      }

      setTravelPlan(data.data.plan);
    } catch (error) {
      const apiError =
        error instanceof ApiError
          ? error
          : new ApiError(
              error.message || "Failed to generate travel plan",
              500,
              "TRAVEL_PLAN_ERROR",
              { originalError: error }
            );

      logError(apiError, "travel-planner.submit", {
        destination: preferences.destination,
      });

      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            <span className="block">AI Travel Planner</span>
            <span className="block text-indigo-600 dark:text-indigo-400">
              Plan Your Perfect Trip
            </span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Create personalized travel plans with our AI-powered planner. Just
            tell us your preferences, and we'll handle the rest.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4 mb-6 animate-shake">
              <div className="text-sm text-red-700 dark:text-red-200">
                {error}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden">
            <form onSubmit={handleSubmit} className="p-8">
              {/* Destination */}
              <div className="mb-6">
                <label
                  htmlFor="destination"
                  className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Destination
                </label>
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  value={preferences.destination}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter city or country"
                  disabled={isLoading}
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <DatePicker
                    selected={preferences.start_date}
                    onChange={(date) =>
                      setPreferences((prev) => ({ ...prev, start_date: date }))
                    }
                    minDate={new Date()}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <DatePicker
                    selected={preferences.end_date}
                    onChange={(date) =>
                      setPreferences((prev) => ({ ...prev, end_date: date }))
                    }
                    minDate={preferences.start_date}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Budget and Travelers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label
                    htmlFor="budget"
                    className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Budget Level
                  </label>
                  <select
                    id="budget"
                    name="budget"
                    value={preferences.budget}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    disabled={isLoading}
                  >
                    <option value="">Select budget level</option>
                    {BUDGET_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="num_travelers"
                    className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Number of Travelers
                  </label>
                  <input
                    type="number"
                    id="num_travelers"
                    name="num_travelers"
                    value={preferences.num_travelers}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Interests */}
              <div className="mb-6">
                <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Interests
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleInterestToggle(interest)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        preferences.interests.includes(interest)
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      }`}
                      disabled={isLoading}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accommodation and Travel Style */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label
                    htmlFor="accommodation_type"
                    className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Accommodation Type
                  </label>
                  <select
                    id="accommodation_type"
                    name="accommodation_type"
                    value={preferences.accommodation_type}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    disabled={isLoading}
                  >
                    <option value="">Select accommodation type</option>
                    {ACCOMMODATION_TYPES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="travel_style"
                    className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Travel Style
                  </label>
                  <select
                    id="travel_style"
                    name="travel_style"
                    value={preferences.travel_style}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    disabled={isLoading}
                  >
                    <option value="">Select travel style</option>
                    {TRAVEL_STYLES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Special Requests */}
              <div className="mb-6">
                <label
                  htmlFor="special-requests"
                  className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Special Requests (Optional)
                </label>
                <textarea
                  id="special-requests"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Any special requests or considerations..."
                  disabled={isLoading}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-600 transform transition-all duration-200 hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="5" color="white" />
                      <span className="ml-2">Creating Plan...</span>
                    </>
                  ) : (
                    "Create Travel Plan"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Travel Plan Display */}
          {travelPlan && (
            <div className="mt-8 space-y-8">
              {/* Overview Section */}
              <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Trip Overview
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  {travelPlan.overview}
                </p>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Highlights
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                  {travelPlan.highlights.map((highlight, index) => (
                    <li key={index}>{highlight}</li>
                  ))}
                </ul>
              </div>

              {/* Daily Plans */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Daily Itinerary
                </h2>
                {travelPlan.daily_plans.map((day) => (
                  <div
                    key={day.day}
                    className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Day {day.day} -{" "}
                        {new Date(day.date).toLocaleDateString()}
                      </h3>
                      {day.estimated_cost && (
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                          Estimated: {day.estimated_cost}
                        </span>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          Morning
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300">
                          {day.morning}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          Afternoon
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300">
                          {day.afternoon}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          Evening
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300">
                          {day.evening}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            Accommodation
                          </h4>
                          <p className="text-gray-700 dark:text-gray-300">
                            {day.accommodation}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            Transportation
                          </h4>
                          <p className="text-gray-700 dark:text-gray-300">
                            {day.transportation}
                          </p>
                        </div>
                      </div>
                      {day.notes && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            Notes
                          </h4>
                          <p className="text-gray-700 dark:text-gray-300">
                            {day.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Packing Suggestions */}
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Packing Suggestions
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                    {travelPlan.packing_suggestions.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Travel Tips */}
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Travel Tips
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                    {travelPlan.travel_tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Total Cost */}
              {travelPlan.total_estimated_cost && (
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Total Estimated Cost
                  </h2>
                  <p className="text-2xl text-indigo-600 dark:text-indigo-400 font-semibold">
                    {travelPlan.total_estimated_cost}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default withErrorHandling(TravelPlannerPage, "travel-planner");
