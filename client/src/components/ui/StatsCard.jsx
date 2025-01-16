import PropTypes from 'prop-types';
import React from 'react';

import { commonStyles } from '../../constants/styles';

import { Card } from './Card';

export const StatsCard = ({ stats }) => (
  <Card className="stats-grid">
    {stats.map(({ label, value }) => (
      <div key={label} className="text-center">
        <p className={`text-2xl font-semibold ${commonStyles.text.accent}`}>{value}</p>
        <p className={`mt-2 text-sm font-medium ${commonStyles.text.secondary}`}>{label}</p>
      </div>
    ))}
  </Card>
);

StatsCard.propTypes = {
  stats: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default StatsCard;
