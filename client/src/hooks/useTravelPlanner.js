import { useState } from "react";
import { useErrorHandler } from "./useErrorHandler";
import { logError, logInfo } from "../utils/logger";
import { travelService } from "../services/travelService";
import { DEFAULT_PREFERENCES } from "../constants/travel";
import { useAuth } from "./useAuth";

export const useTravelPlanner = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [specialRequests, setSpecialRequests] = useState("");
  const [travelPlan, setTravelPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { error, setError: handleError, clearError } = useErrorHandler({ 
    context: "travel-planner",
    onError: (error) => {
      if (error?.type === "api") {
        logError("Failed to generate travel plan", error);
      }
    }
  });

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

  const handleSpecialRequestsChange = (e) => {
    setSpecialRequests(e.target.value);
  };

  const generatePlan = async () => {
    setIsLoading(true);
    clearError();
    
    try {
      logInfo("Generating travel plan", "travel", {
        userId: user?.id,
        preferences: JSON.stringify(preferences),
      });

      const plan = await travelService.generatePlan({
        ...preferences,
        specialRequests,
      });
      
      setTravelPlan(plan);
      
      logInfo("Travel plan generated successfully", "travel", {
        userId: user?.id,
        planId: plan.id,
      });
    } catch (err) {
      logError("Failed to generate travel plan", err, {
        userId: user?.id,
        preferences: JSON.stringify(preferences),
      });
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    preferences,
    specialRequests,
    travelPlan,
    isLoading,
    error,
    handleInputChange,
    handleInterestToggle,
    handleSpecialRequestsChange,
    generatePlan,
  };
};
