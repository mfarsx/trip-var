import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiStar, FiFilter, FiUser } from 'react-icons/fi';
import { fetchDestinationReviews } from '../../store/slices/reviewSlice';
import CreateReviewModal from './CreateReviewModal';
import ReviewCard from './ReviewCard';
import RatingDistribution from './RatingDistribution';
import PropTypes from 'prop-types';

export default function ReviewsSection({ destinationId, destination }) {
  const dispatch = useDispatch();
  const { destinationReviews, ratingStats, loading, pagination } = useSelector((state) => state.reviews);
  const { user } = useSelector((state) => state.auth);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const hasFetched = useRef(false);
  const lastParams = useRef({ destinationId: null, sortBy: null, currentPage: null });

  useEffect(() => {
    if (destinationId) {
      const currentParams = { destinationId, sortBy, currentPage };
      const paramsChanged = 
        lastParams.current.destinationId !== destinationId ||
        lastParams.current.sortBy !== sortBy ||
        lastParams.current.currentPage !== currentPage;
      
      if (!hasFetched.current || paramsChanged) {
        hasFetched.current = true;
        lastParams.current = currentParams;
        dispatch(fetchDestinationReviews({ 
          destinationId, 
          params: { sort: sortBy, page: currentPage, limit: 5 } 
        }));
      }
    }
  }, [dispatch, destinationId, sortBy, currentPage]);

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleReviewCreated = useCallback(() => {
    // Refresh the reviews list to get updated stats
    if (destinationId) {
      dispatch(fetchDestinationReviews({ 
        destinationId, 
        params: { sort: sortBy, page: currentPage, limit: 5 } 
      }));
    }
  }, [dispatch, destinationId, sortBy, currentPage]);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-400'
        }`}
      />
    ));
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Reviews & Ratings</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex">
                {renderStars(Math.round(ratingStats.averageRating || 0))}
              </div>
              <span className="text-lg font-semibold">
                {(ratingStats.averageRating || 0).toFixed(1)}
              </span>
            </div>
            <span className="text-gray-400">
              ({ratingStats.totalReviews || 0} reviews)
            </span>
          </div>
        </div>
        
        {user && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Rating Distribution */}
      <RatingDistribution ratingStats={ratingStats} />

      {/* Sort and Filter */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <FiFilter className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-1 text-white"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
            <option value="most_helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
        </div>
      ) : destinationReviews.length > 0 ? (
        <div className="space-y-4">
          {destinationReviews.map((review) => (
            <ReviewCard key={review._id} review={review} />
          ))}
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex gap-2">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      page === currentPage
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <FiUser className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg text-gray-400 mb-2">No reviews yet</h3>
          <p className="text-gray-500">
            Be the first to share your experience at this destination!
          </p>
        </div>
      )}

      {/* Create Review Modal */}
      {showCreateModal && (
        <CreateReviewModal
          destination={destination}
          onClose={() => setShowCreateModal(false)}
          onReviewCreated={handleReviewCreated}
        />
      )}
    </div>
  );
}

ReviewsSection.propTypes = {
  destinationId: PropTypes.string.isRequired,
  destination: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired
  }).isRequired
};