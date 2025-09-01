import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiStar, FiThumbsUp, FiUser, FiCalendar, FiEdit3, FiTrash2 } from 'react-icons/fi';
import { markReviewHelpful, deleteReview } from '../../store/slices/reviewSlice';
import EditReviewModal from './EditReviewModal';
import PropTypes from 'prop-types';

export default function ReviewCard({ review }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { deleting } = useSelector((state) => state.reviews);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [isHelpful, setIsHelpful] = useState(false);

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleHelpfulClick = async () => {
    try {
      await dispatch(markReviewHelpful(review._id)).unwrap();
      setIsHelpful(!isHelpful);
    } catch (error) {
      console.error('Failed to mark review as helpful:', error);
    }
  };

  const handleDeleteReview = async () => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await dispatch(deleteReview(review._id)).unwrap();
      } catch (error) {
        console.error('Failed to delete review:', error);
      }
    }
  };

  const isOwner = user && review.user._id === user._id;

  return (
    <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
            <FiUser className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-white">{review.user.name}</h4>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <FiCalendar className="w-3 h-3" />
              <span>{formatDate(review.createdAt)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex">
            {renderStars(review.rating)}
          </div>
          {isOwner && (
            <div className="flex gap-1">
              <button
                onClick={() => setShowEditModal(true)}
                className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                title="Edit review"
              >
                <FiEdit3 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDeleteReview}
                disabled={deleting}
                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                title="Delete review"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-3">
        <h5 className="font-medium text-white mb-2">{review.title}</h5>
        <p className="text-gray-300 leading-relaxed">{review.content}</p>
      </div>

      {/* Additional Ratings */}
      {review.ratings && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          {review.ratings.cleanliness && (
            <div className="text-sm">
              <span className="text-gray-400">Cleanliness:</span>
              <div className="flex">
                {renderStars(review.ratings.cleanliness)}
              </div>
            </div>
          )}
          {review.ratings.location && (
            <div className="text-sm">
              <span className="text-gray-400">Location:</span>
              <div className="flex">
                {renderStars(review.ratings.location)}
              </div>
            </div>
          )}
          {review.ratings.value && (
            <div className="text-sm">
              <span className="text-gray-400">Value:</span>
              <div className="flex">
                {renderStars(review.ratings.value)}
              </div>
            </div>
          )}
          {review.ratings.service && (
            <div className="text-sm">
              <span className="text-gray-400">Service:</span>
              <div className="flex">
                {renderStars(review.ratings.service)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Helpful Button */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-600/30">
        <button
          onClick={handleHelpfulClick}
          className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors"
        >
          <FiThumbsUp className="w-4 h-4" />
          <span>Helpful ({review.helpfulVotes})</span>
        </button>
        
        {review.adminResponse && (
          <div className="text-sm text-blue-400">
            <span className="font-medium">Admin Response:</span>
            <p className="text-gray-300 mt-1">{review.adminResponse.content}</p>
          </div>
        )}
      </div>

      {/* Edit Review Modal */}
      {showEditModal && (
        <EditReviewModal
          review={review}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}

ReviewCard.propTypes = {
  review: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    user: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired,
    createdAt: PropTypes.string.isRequired,
    rating: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    ratings: PropTypes.shape({
      cleanliness: PropTypes.number.isRequired,
      location: PropTypes.number.isRequired,
      value: PropTypes.number.isRequired,
      service: PropTypes.number.isRequired
    }).isRequired,
    helpfulVotes: PropTypes.number.isRequired,
    adminResponse: PropTypes.shape({
      content: PropTypes.string.isRequired
    })
  }).isRequired
};