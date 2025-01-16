import React from 'react';

import { Section, TravelForm, TravelHeader, TravelPlan } from '../components';
import { useTravelPlanner } from '../hooks/useTravelPlanner';
import { withErrorHandling } from '../utils/error';

const TravelPlannerPage = () => {
  const {
    preferences,
    specialRequests,
    isLoading,
    error,
    travelPlan,
    handleInputChange,
    handleInterestToggle,
    handleSpecialRequestsChange,
    generatePlan,
  } = useTravelPlanner();

  return (
    <div className="min-h-screen bg-gray-50">
      <Section>
        <TravelHeader />
      </Section>

      <Section className="bg-white">
        <div className="mx-auto max-w-2xl">
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
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <TravelPlan plan={travelPlan} />
        </div>
      </Section>
    </div>
  );
};

export default withErrorHandling(TravelPlannerPage);
