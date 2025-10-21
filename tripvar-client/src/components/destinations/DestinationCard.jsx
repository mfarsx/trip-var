import React, { memo } from "react";
import PropTypes from "prop-types";
import {
  FiHeart,
  FiStar,
  FiMapPin,
  FiBookmark,
  FiCheck,
  FiZap,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";

// Memoized destination card component for better performance
export const DestinationCard = memo(
  ({
    destination,
    isFavorite,
    isSelected,
    loading,
    onDestinationClick,
    onToggleFavorite,
    onCompareToggle,
    onQuickBook,
  }) => {
    const handleCardClick = () => {
      onDestinationClick(destination._id);
    };

    const handleFavoriteClick = (e) => {
      e.stopPropagation();
      onToggleFavorite(e, destination._id);
    };

    const handleCompareClick = (e) => {
      e.stopPropagation();
      onCompareToggle(destination._id);
    };

    const handleQuickBookClick = (e) => {
      e.stopPropagation();
      onQuickBook(destination._id);
    };

    return (
      <div
        className="group relative bg-gray-800/60 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer border border-gray-700/30 hover:border-purple-500/50 transition-all duration-300"
        onClick={handleCardClick}
      >
        {/* Card content */}
        <div className="relative h-56 w-full overflow-hidden">
          <img
            src={destination.imageUrl}
            alt={destination.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.target.src = `https://source.unsplash.com/random/400x300?${destination.title}`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              className="p-2 rounded-full bg-black/70 hover:bg-black/90 text-white transition-all duration-200 backdrop-blur-sm"
              onClick={handleFavoriteClick}
              disabled={loading}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorite ? (
                <FaHeart className="w-4 h-4 text-red-500" />
              ) : (
                <FiHeart className="w-4 h-4" />
              )}
            </button>

            <button
              className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
                isSelected
                  ? "bg-green-500/90 text-white"
                  : "bg-black/70 hover:bg-black/90 text-white"
              }`}
              onClick={handleCompareClick}
              title={
                isSelected ? "Remove from comparison" : "Add to comparison"
              }
            >
              {isSelected ? (
                <FiCheck className="w-4 h-4" />
              ) : (
                <FiBookmark className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Rating Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-full">
            <FiStar className="w-3.5 h-3.5 text-yellow-400 fill-current" />
            <span className="text-white text-xs font-medium">
              {destination.rating}
            </span>
          </div>

          {/* Availability Status */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-green-500/90 backdrop-blur-sm px-2 py-1 rounded-full">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
            <span className="text-white text-xs font-medium">Available</span>
          </div>

          {/* Location Info */}
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-lg font-bold text-white mb-1 line-clamp-1 group-hover:text-purple-300 transition-colors">
              {destination.title}
            </h3>
            <div className="flex items-center gap-1 text-gray-200">
              <FiMapPin className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs font-medium line-clamp-1">
                {destination.location}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* Description */}
          <p className="text-gray-300 line-clamp-2 text-sm leading-relaxed">
            {destination.description}
          </p>

          {/* Price Section */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-700/30">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  ${destination.price}
                </span>
                <span className="text-gray-500 text-xs">per person</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-green-400 text-xs font-medium">
                  Best Price
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-400 text-xs">
                {destination.ratingCount} reviews
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-3">
            <button
              className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
              onClick={handleCardClick}
            >
              View Details
            </button>
            <button
              className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center gap-1"
              onClick={handleQuickBookClick}
              title="Quick Book"
            >
              <FiZap className="w-4 h-4" />
              Book
            </button>
          </div>
        </div>
      </div>
    );
  }
);

DestinationCard.displayName = "DestinationCard";

DestinationCard.propTypes = {
  destination: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    imageUrl: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    rating: PropTypes.number.isRequired,
    ratingCount: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
  }).isRequired,
  isFavorite: PropTypes.bool.isRequired,
  isSelected: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  onDestinationClick: PropTypes.func.isRequired,
  onToggleFavorite: PropTypes.func.isRequired,
  onCompareToggle: PropTypes.func.isRequired,
  onQuickBook: PropTypes.func.isRequired,
};
