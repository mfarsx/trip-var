import { FiStar } from 'react-icons/fi';
import PropTypes from 'prop-types';

export default function RatingDistribution({ ratingStats }) {
  const { distribution = {}, totalReviews = 0 } = ratingStats || {};

  const getPercentage = (count) => {
    if (totalReviews === 0) return 0;
    return Math.round((count / totalReviews) * 100);
  };



  return (
    <div className="mb-6 p-4 bg-gray-700/30 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Rating Breakdown</h3>
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => (
          <div key={rating} className="flex items-center gap-3">
            <div className="flex items-center gap-1 w-16">
              <span className="text-sm text-gray-400">{rating}</span>
              <FiStar className="w-3 h-3 text-yellow-400 fill-current" />
            </div>
            <div className="flex-1 bg-gray-600/30 rounded-full h-2">
              <div
                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getPercentage(distribution[rating] || 0)}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-400 w-12 text-right">
              {distribution[rating] || 0}
            </span>
            <span className="text-sm text-gray-500 w-10 text-right">
              ({getPercentage(distribution[rating] || 0)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

RatingDistribution.propTypes = {
  ratingStats: PropTypes.shape({
    distribution: PropTypes.object.isRequired,
    totalReviews: PropTypes.number.isRequired
  }).isRequired
};