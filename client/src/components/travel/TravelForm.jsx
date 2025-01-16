import PropTypes from 'prop-types';
import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import {
  ACCOMMODATION_TYPES,
  BUDGET_OPTIONS,
  INTERESTS,
  TRAVEL_STYLES,
} from '../../constants/travel';
import { Button } from '../ui/Button';

const TravelForm = ({
  preferences,
  specialRequests,
  isLoading,
  error,
  onInputChange,
  onInterestToggle,
  onSpecialRequestsChange,
  onSubmit,
}) => (
  <div className="max-w-3xl mx-auto">
    {error && (
      <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4 mb-6 animate-shake">
        <div className="text-sm text-red-700 dark:text-red-200">{error}</div>
      </div>
    )}

    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden">
      <form onSubmit={onSubmit} className="p-8 space-y-6">
        {/* Destination */}
        <div>
          <label
            htmlFor="destination"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Destination
          </label>
          <input
            type="text"
            id="destination"
            name="destination"
            value={preferences.destination}
            onChange={onInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            required
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="start_date"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Start Date
            </label>
            <DatePicker
              selected={preferences.start_date}
              onChange={(date) => onInputChange({ target: { name: 'start_date', value: date } })}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              minDate={new Date()}
              required
            />
          </div>
          <div>
            <label
              htmlFor="end_date"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              End Date
            </label>
            <DatePicker
              selected={preferences.end_date}
              onChange={(date) => onInputChange({ target: { name: 'end_date', value: date } })}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              minDate={preferences.start_date}
              required
            />
          </div>
        </div>

        {/* Budget */}
        <div>
          <label
            htmlFor="budget"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Budget
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {BUDGET_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`p-4 rounded-lg border ${
                  preferences.budget === option.value
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
                onClick={() => onInputChange('budget', option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div>
          <label
            htmlFor="interests"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Interests
          </label>
          <div className="flex flex-wrap gap-3">
            {INTERESTS.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => onInterestToggle(interest)}
                className={`px-4 py-2 rounded-full ${
                  preferences.interests.includes(interest)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                } hover:bg-indigo-500 hover:text-white transition-colors`}
                disabled={isLoading}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        {/* Accommodation Type */}
        <div>
          <label
            htmlFor="accommodation_type"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Accommodation Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {ACCOMMODATION_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() =>
                  onInputChange({
                    target: { name: 'accommodation_type', value: type.value },
                  })
                }
                className={`p-3 border rounded-lg ${
                  preferences.accommodation_type === type.value
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                } hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-colors`}
                disabled={isLoading}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Travel Style */}
        <div>
          <label
            htmlFor="travel_style"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Travel Style
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TRAVEL_STYLES.map((style) => (
              <button
                key={style.value}
                type="button"
                onClick={() =>
                  onInputChange({
                    target: { name: 'travel_style', value: style.value },
                  })
                }
                className={`p-3 border rounded-lg ${
                  preferences.travel_style === style.value
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                } hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-colors`}
                disabled={isLoading}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        {/* Number of Travelers */}
        <div>
          <label
            htmlFor="num_travelers"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Number of Travelers
          </label>
          <input
            type="number"
            id="num_travelers"
            name="num_travelers"
            value={preferences.num_travelers}
            onChange={onInputChange}
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            required
          />
        </div>

        {/* Special Requests */}
        <div>
          <label
            htmlFor="special_requests"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Special Requests
          </label>
          <textarea
            id="special_requests"
            value={specialRequests}
            onChange={onSpecialRequestsChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            placeholder="Any special requirements or preferences..."
          />
        </div>

        {/* Submit Button */}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Generating your plan...
            </>
          ) : (
            'Generate Plan'
          )}
        </Button>
      </form>
    </div>
  </div>
);

TravelForm.propTypes = {
  preferences: PropTypes.shape({
    destination: PropTypes.string.isRequired,
    start_date: PropTypes.instanceOf(Date).isRequired,
    end_date: PropTypes.instanceOf(Date).isRequired,
    budget: PropTypes.string.isRequired,
    interests: PropTypes.arrayOf(PropTypes.string).isRequired,
    accommodation_type: PropTypes.string.isRequired,
    travel_style: PropTypes.string.isRequired,
    num_travelers: PropTypes.number.isRequired,
  }).isRequired,
  specialRequests: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  onInputChange: PropTypes.func.isRequired,
  onInterestToggle: PropTypes.func.isRequired,
  onSpecialRequestsChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default TravelForm;
