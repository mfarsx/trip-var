import { axiosInstance as axios } from '../config/axios';
import { ApiError } from '../utils/error/errorHandler';
import { logError } from '../utils/logger';

class TravelService {
  constructor() {
    this.baseUrl = `${import.meta.env.VITE_API_PATH}/travel`;
  }

  async generatePlan(preferences) {
    try {
      const response = await axios.post(`${this.baseUrl}/plan`, {
        preferences: {
          ...preferences,
          start_date: preferences.start_date.toISOString().split('T')[0],
          end_date: preferences.end_date.toISOString().split('T')[0],
        },
        special_requests: preferences.specialRequests,
      });

      if (!response.data.success) {
        throw new ApiError(
          response.data.message || 'Failed to generate travel plan',
          response.status,
          'TRAVEL_PLAN_ERROR',
          { response: response.data }
        );
      }

      return response.data.data.plan;
    } catch (error) {
      logError('Travel plan generation failed:', error, {
        context: 'travel',
        preferences: JSON.stringify(preferences),
      });

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        error.message || 'Failed to generate travel plan',
        error.response?.status || 500,
        'TRAVEL_PLAN_ERROR',
        { originalError: error }
      );
    }
  }
}

export const travelService = new TravelService();
