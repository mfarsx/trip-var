import React from "react";

const TravelHeader = () => (
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
);

export default TravelHeader;
