import PropTypes from 'prop-types';
import React from 'react';

export const Feature = ({ title, description, icon }) => {
  const isEmoji = icon.length <= 2; // Simple check for emoji

  return (
    <div className="relative">
      <div className="flex flex-col items-start">
        <div className="mb-4 p-3 rounded-xl bg-emerald-100 text-emerald-600">
          {isEmoji ? (
            <span className="text-2xl">{icon}</span>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
            </svg>
          )}
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-base text-slate-600">{description}</p>
      </div>
    </div>
  );
};

Feature.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
};

export default Feature;
