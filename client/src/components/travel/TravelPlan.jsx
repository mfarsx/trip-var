import PropTypes from 'prop-types';
import React from 'react';

const TravelPlan = ({ plan }) => {
  if (!plan) return null;

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Your Travel Plan
          </h2>
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: plan }}
          />
        </div>
      </div>
    </div>
  );
};

TravelPlan.propTypes = {
  plan: PropTypes.string,
};

export default TravelPlan;
