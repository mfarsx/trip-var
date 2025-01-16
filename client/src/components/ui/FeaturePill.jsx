import PropTypes from 'prop-types';
import React from 'react';

const VARIANTS = {
  indigo: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200',
  green: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
  purple: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
};

export const FeaturePill = ({ icon, text, variant = 'indigo' }) => (
  <span
    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${VARIANTS[variant]}`}
  >
    {icon} {text}
  </span>
);

FeaturePill.propTypes = {
  icon: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(Object.keys(VARIANTS)),
};

export default FeaturePill;
