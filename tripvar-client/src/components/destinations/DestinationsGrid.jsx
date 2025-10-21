import { motion } from "framer-motion";
import {
  FiHeart,
  FiStar,
  FiMapPin,
  FiCheck,
  FiBookmark,
  FiZap,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import PropTypes from "prop-types";
import { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toggleFavorite } from "../../store/slices/favoritesSlice";
import { toast } from "react-hot-toast";
import { OptimizedImage } from "../common/OptimizedImage";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  hover: { scale: 1.02, transition: { type: "spring", stiffness: 300 } },
};

export default function DestinationsGrid({
  destinations,
  onDestinationClick,
  onCompareToggle,
  onQuickBook,
  selectedDestinations = [],
}) {
  const dispatch = useDispatch();
  const favoriteIds = useSelector((state) => state.favorites.favoriteIds);
  const toggling = useSelector((state) => state.favorites.toggling);

  const handleToggleFavorite = useCallback(
    async (e, destinationId) => {
      e.stopPropagation(); // Prevent triggering the destination click

      if (toggling) return;

      try {
        await dispatch(toggleFavorite(destinationId)).unwrap();
      } catch (error) {
        console.error("Error toggling favorite:", error);
        toast.error("Failed to update favorites. Please try again.");
      }
    },
    [dispatch, toggling]
  );

  const isFavorite = useCallback(
    (destinationId) => {
      return favoriteIds.has(destinationId);
    },
    [favoriteIds]
  );

  // Handle empty or invalid destinations
  if (!destinations || destinations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
          <svg
            className="w-12 h-12 text-purple-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-300 mb-2">
          No destinations found
        </h3>
        <p className="text-gray-500">
          Try adjusting your search criteria or check back later.
        </p>
      </div>
    );
  }

  // Validate required callback props
  if (!onDestinationClick || !onCompareToggle || !onQuickBook) {
    console.error("DestinationsGrid: Missing required callback props");
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-red-400 mb-2">
          Configuration Error
        </h3>
        <p className="text-gray-500">Please check component configuration.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {destinations.map((destination, index) => (
        <motion.div
          key={destination._id}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          whileHover="hover"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ delay: index * 0.1 }}
          className="group relative bg-gray-800/60 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer border border-gray-700/30 hover:border-purple-500/50 transition-all duration-300"
          onClick={() => onDestinationClick(destination._id)}
        >
          <div className="relative h-56 w-full overflow-hidden">
            <OptimizedImage
              src={destination.imageUrl}
              alt={destination.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Action Buttons */}
            <div className="absolute top-3 right-3 flex gap-2">
              {/* Favorite Button */}
              <button
                className="p-2 rounded-full bg-black/70 hover:bg-black/90 text-white transition-all duration-200 backdrop-blur-sm"
                onClick={(e) => handleToggleFavorite(e, destination._id)}
                disabled={toggling}
                title={
                  isFavorite(destination._id)
                    ? "Remove from favorites"
                    : "Add to favorites"
                }
              >
                {isFavorite(destination._id) ? (
                  <FaHeart className="w-4 h-4 text-red-500" />
                ) : (
                  <FiHeart className="w-4 h-4" />
                )}
              </button>

              {/* Compare Button */}
              <button
                className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
                  selectedDestinations.includes(destination._id)
                    ? "bg-green-500/90 text-white"
                    : "bg-black/70 hover:bg-black/90 text-white"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onCompareToggle(destination._id);
                }}
                title={
                  selectedDestinations.includes(destination._id)
                    ? "Remove from comparison"
                    : "Add to comparison"
                }
              >
                {selectedDestinations.includes(destination._id) ? (
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
                onClick={(e) => {
                  e.stopPropagation();
                  onDestinationClick(destination._id);
                }}
              >
                View Details
              </button>
              <button
                className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickBook(destination._id);
                }}
                title="Quick Book"
              >
                <FiZap className="w-4 h-4" />
                Book
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

DestinationsGrid.propTypes = {
  destinations: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      imageUrl: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      location: PropTypes.string.isRequired,
      rating: PropTypes.number.isRequired,
      ratingCount: PropTypes.number.isRequired,
      description: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      duration: PropTypes.string,
      groupSize: PropTypes.string,
      category: PropTypes.string,
    })
  ).isRequired,
  onDestinationClick: PropTypes.func.isRequired,
  onCompareToggle: PropTypes.func.isRequired,
  onQuickBook: PropTypes.func.isRequired,
  selectedDestinations: PropTypes.arrayOf(PropTypes.string),
};
