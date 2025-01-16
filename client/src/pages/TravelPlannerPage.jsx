import React from "react";
import { withErrorHandling } from "../utils/error";
import TravelHeader from "../components/travel/TravelHeader";
import TravelForm from "../components/travel/TravelForm";
import TravelPlan from "../components/travel/TravelPlan";
import { useTravelPlanner } from "../hooks/useTravelPlanner";

export function TravelPlannerPage() {
  const {
    preferences,
    specialRequests,
    travelPlan,
    isLoading,
    error,
    handleInputChange,
    handleInterestToggle,
    handleSpecialRequestsChange,
    generatePlan,
  } = useTravelPlanner();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="space-y-8">
        <TravelHeader />
        <TravelForm
          preferences={preferences}
          specialRequests={specialRequests}
          isLoading={isLoading}
          error={error}
          onInputChange={handleInputChange}
          onInterestToggle={handleInterestToggle}
          onSpecialRequestsChange={handleSpecialRequestsChange}
          onSubmit={generatePlan}
        />
        <TravelPlan plan={travelPlan} />
      </div>
    </div>
  );
}

export default withErrorHandling(TravelPlannerPage);
