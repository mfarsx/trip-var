import { motion } from "framer-motion";
import { FiHeart, FiStar, FiMapPin, FiClock, FiUsers, FiTrendingUp, FiCheck, FiBookmark, FiZap } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { userService } from "../../services/userService";
import { toast } from "react-hot-toast";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  hover: { scale: 1.02, transition: { type: "spring", stiffness: 300 } }
};

export default function DestinationsGrid({ destinations, onDestinationClick, onCompareToggle, onQuickBook, selectedDestinations = [] }) {
  const [favoriteDestinations, setFavoriteDestinations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await userService.getFavorites();
      if (response && response.data && response.data.data) {
        const favoriteIds = response.data.data.favorites.map(fav => fav._id);
        setFavoriteDestinations(favoriteIds);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
      // Don't show toast error here as it might not be relevant for all users
    }
  };

  const handleToggleFavorite = async (e, destinationId) => {
    e.stopPropagation(); // Prevent triggering the destination click
    
    if (loading) return;
    
    try {
      setLoading(true);
      const response = await userService.toggleFavorite(destinationId);
      
      if (response && response.data && response.data.data) {
        const { isFavorite } = response.data.data;
        
        if (isFavorite) {
          setFavoriteDestinations([...favoriteDestinations, destinationId]);
          toast.success("Added to favorites");
        } else {
          setFavoriteDestinations(favoriteDestinations.filter(id => id !== destinationId));
          toast.success("Removed from favorites");
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorites. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = (destinationId) => {
    return favoriteDestinations.includes(destinationId);
  };

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
          className="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 cursor-pointer border border-gray-700/50 hover:border-purple-500/30 card-hover"
          onClick={() => onDestinationClick(destination._id)}
        >
          <div className="relative h-56 w-full overflow-hidden">
            <img
              src={destination.imageUrl}
              alt={destination.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                e.target.src = `https://source.unsplash.com/random/400x300?${destination.title}`;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              {/* Compare Button */}
              <button 
                className={`p-2.5 rounded-full backdrop-blur-sm transition-all duration-300 transform hover:scale-110 ${
                  selectedDestinations.includes(destination._id)
                    ? 'bg-green-500/90 text-white'
                    : 'bg-black/60 hover:bg-black/80 text-white'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onCompareToggle(destination._id);
                }}
                title={selectedDestinations.includes(destination._id) ? 'Remove from comparison' : 'Add to comparison'}
              >
                {selectedDestinations.includes(destination._id) ? (
                  <FiCheck className="w-4 h-4" />
                ) : (
                  <FiBookmark className="w-4 h-4" />
                )}
              </button>

              {/* Favorite Button */}
              <button 
                className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all duration-300 transform hover:scale-110 backdrop-blur-sm"
                onClick={(e) => handleToggleFavorite(e, destination._id)}
                disabled={loading}
                title={isFavorite(destination._id) ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorite(destination._id) ? (
                  <FaHeart className="w-4 h-4 text-red-500" />
                ) : (
                  <FiHeart className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Rating Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-yellow-400/30">
              <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-white text-sm font-medium">{destination.rating}</span>
            </div>

            {/* Category Badge */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-gradient-to-r from-purple-500/80 to-pink-500/80 backdrop-blur-sm rounded-full border border-purple-400/30">
              <span className="text-white text-xs font-medium">Featured</span>
            </div>

            {/* Availability Status */}
            <div className="absolute bottom-20 right-4 flex items-center gap-1 bg-green-500/90 backdrop-blur-sm px-2 py-1 rounded-full">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-white text-xs font-medium">Available</span>
            </div>

            {/* Location Info */}
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-xl font-bold text-white mb-1 line-clamp-1 group-hover:text-purple-300 transition-colors">
                {destination.title}
              </h3>
              <div className="flex items-center gap-1.5 text-gray-200">
                <FiMapPin className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium line-clamp-1">
                  {destination.location}
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-5 space-y-4">
            {/* Description */}
            <p className="text-gray-300 line-clamp-2 text-sm leading-relaxed">
              {destination.description}
            </p>
            
            {/* Quick Info */}
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <FiClock className="w-3 h-3" />
                <span>3-5 days</span>
              </div>
              <div className="flex items-center gap-1">
                <FiUsers className="w-3 h-3" />
                <span>2-8 people</span>
              </div>
              <div className="flex items-center gap-1">
                <FiTrendingUp className="w-3 h-3" />
                <span>Popular</span>
              </div>
            </div>
            
            {/* Price and Rating Section */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    ${destination.price}
                  </span>
                  <span className="text-gray-500 text-xs line-through">${Math.round(destination.price * 1.2)}</span>
                </div>
                <span className="text-gray-500 text-xs">per person</span>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-green-400 text-xs font-medium">Save 20%</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-gray-400 text-xs mb-1">
                  {destination.ratingCount} reviews
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FiStar 
                      key={i} 
                      className={`w-3 h-3 ${
                        i < Math.floor(destination.rating) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-600'
                      }`} 
                    />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Quick Action Buttons */}
            <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button 
                className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
                onClick={(e) => {
                  e.stopPropagation();
                  onDestinationClick(destination._id);
                }}
              >
                View Details
              </button>
              <button 
                className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-sm font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 flex items-center gap-1"
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
    })
  ).isRequired,
  onDestinationClick: PropTypes.func.isRequired,
  onCompareToggle: PropTypes.func.isRequired,
  onQuickBook: PropTypes.func.isRequired,
  selectedDestinations: PropTypes.arrayOf(PropTypes.string),
};
