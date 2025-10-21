import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiStar, FiX, FiRefreshCcw } from 'react-icons/fi';
import { createReview } from '../../store/slices/reviewSlice';
import PropTypes from 'prop-types';

export default function CreateReviewModal({ destination, onClose, onReviewCreated }) {
  const dispatch = useDispatch();
  const { creating } = useSelector((state) => state.reviews);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    rating: 0,
    ratings: {
      cleanliness: 0,
      location: 0,
      value: 0,
      service: 0
    }
  });

  const [hoveredRating, setHoveredRating] = useState(0);
  const [hoveredSubRating, setHoveredSubRating] = useState({});

  const renderStars = (rating, hovered, onHover, onClick, size = 'w-5 h-5') => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => onClick(i + 1)}
        onMouseEnter={() => onHover(i + 1)}
        onMouseLeave={() => onHover(0)}
        className="focus:outline-none"
      >
        <FiStar
          className={`${size} ${
            i < (hovered || rating) ? 'text-yellow-400 fill-current' : 'text-gray-400'
          } transition-colors`}
        />
      </button>
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim() || formData.rating === 0) {
      alert('Please fill in all required fields and provide a rating');
      return;
    }

    try {
      await dispatch(createReview({
        destinationId: destination._id,
        title: formData.title,
        content: formData.content,
        rating: formData.rating,
        ratings: formData.ratings
      })).unwrap();
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        rating: 0,
        ratings: {
          cleanliness: 0,
          location: 0,
          value: 0,
          service: 0
        }
      });
      
      // Call the callback if provided
      if (onReviewCreated) {
        onReviewCreated();
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to create review:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubRatingChange = (category, rating) => {
    setFormData(prev => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [category]: rating
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Write a Review</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6 p-4 bg-gray-700/30 rounded-lg">
            <h3 className="font-semibold mb-2">{destination.title}</h3>
            <p className="text-gray-400 text-sm">{destination.location}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Overall Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Overall Rating *
              </label>
              <div className="flex items-center gap-2">
                {renderStars(
                  formData.rating,
                  hoveredRating,
                  setHoveredRating,
                  (rating) => setFormData(prev => ({ ...prev, rating }))
                )}
                <span className="text-gray-400 ml-2">
                  {formData.rating > 0 && `${formData.rating} star${formData.rating > 1 ? 's' : ''}`}
                </span>
              </div>
            </div>

            {/* Additional Ratings */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Additional Ratings (Optional)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'cleanliness', label: 'Cleanliness' },
                  { key: 'location', label: 'Location' },
                  { key: 'value', label: 'Value for Money' },
                  { key: 'service', label: 'Service' }
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm text-gray-400 mb-1">{label}</label>
                    <div className="flex items-center gap-1">
                      {renderStars(
                        formData.ratings[key],
                        hoveredSubRating[key],
                        (rating) => setHoveredSubRating(prev => ({ ...prev, [key]: rating })),
                        (rating) => handleSubRatingChange(key, rating),
                        'w-4 h-4'
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Review Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Review Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Summarize your experience"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* Review Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
                Your Review *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Share your experience with other travelers..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                required
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating || !formData.title.trim() || !formData.content.trim() || formData.rating === 0}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <FiRefreshCcw className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

CreateReviewModal.propTypes = {
  destination: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired
};