import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiHeart, 
  FiStar, 
  FiMapPin, 
  FiClock, 
  FiUsers, 
  FiTrendingUp, 
  FiCheck, 
  FiBookmark, 
  FiZap,
  FiPlay,
  FiPause
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import PropTypes from "prop-types";
import { userService } from "../../services/userService";
import { toast } from "react-hot-toast";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  hover: { 
    y: -4,
    transition: { 
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

export default function DestinationsCarousel({ 
  destinations, 
  onDestinationClick, 
  onCompareToggle, 
  onQuickBook, 
  selectedDestinations = [],
  itemsPerView = 5,
  currentIndex = 0,
  setCurrentIndex,
  showArrows = true,
  showDots = true,
  autoPlay = false,
  autoPlayInterval = 5000
}) {
  const [favoriteDestinations, setFavoriteDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);
  const carouselRef = useRef(null);
  const intervalRef = useRef(null);

  const maxIndex = Math.max(0, destinations.length - itemsPerView);
  
  // Ensure currentIndex doesn't exceed maxIndex when destinations change
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [destinations.length, maxIndex, currentIndex, setCurrentIndex]);

  useEffect(() => {
    fetchFavorites();
  }, []);

  useEffect(() => {
    if (isAutoPlaying && destinations.length > itemsPerView) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
      }, autoPlayInterval);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isAutoPlaying, destinations.length, itemsPerView, maxIndex, autoPlayInterval]);

  const fetchFavorites = async () => {
    try {
      const response = await userService.getFavorites();
      if (response && response.data && response.data.data) {
        const favoriteIds = response.data.data.favorites.map(fav => fav._id);
        setFavoriteDestinations(favoriteIds);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const handleToggleFavorite = async (e, destinationId) => {
    e.stopPropagation();
    
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

  const nextSlide = () => {
    setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
    setIsAutoPlaying(false); // Stop auto-play when user interacts
  };

  const prevSlide = () => {
    setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
    setIsAutoPlaying(false); // Stop auto-play when user interacts
  };

  const handleMouseEnter = () => {
    if (autoPlay) {
      setIsAutoPlaying(false);
    }
  };

  const handleMouseLeave = () => {
    if (autoPlay) {
      setIsAutoPlaying(true);
    }
  };

  if (!destinations || destinations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-300 mb-2">No destinations found</h3>
        <p className="text-gray-500">Try adjusting your search criteria or explore our destinations.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full group">
      {/* Carousel Container */}
      <div 
        ref={carouselRef}
        className="relative overflow-hidden rounded-2xl w-full"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ width: '100%' }}
      >
        <motion.div
          className="flex transition-transform duration-700 ease-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            width: `${(destinations.length / itemsPerView) * 100}%`
          }}
        >
          {destinations.map((destination, index) => (
            <motion.div
              key={destination._id}
              className="flex-shrink-0 px-2"
              style={{ 
                width: `${100 / itemsPerView}%`,
                minWidth: `${100 / itemsPerView}%`,
                maxWidth: `${100 / itemsPerView}%`
              }}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
            >
              {/* Minimalist Card Design */}
              <div className="relative bg-gray-900/50 rounded-xl overflow-hidden cursor-pointer border border-gray-800/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 w-full max-w-full">
                {/* Image with Overlay */}
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={destination.imageUrl}
                    alt={destination.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = `https://source.unsplash.com/random/400x300?${destination.title}`;
                    }}
                  />
                  
                  {/* Simple overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Top badges */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                    {/* Rating */}
                    <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-md">
                      <FiStar className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-white text-xs font-medium">{destination.rating}</span>
                    </div>
                    
                    {/* Favorite */}
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`p-2 rounded-md backdrop-blur-sm transition-all duration-200 ${
                        isFavorite(destination._id)
                          ? 'bg-red-500/80 text-white'
                          : 'bg-black/50 text-white hover:bg-red-500/50'
                      }`}
                      onClick={(e) => handleToggleFavorite(e, destination._id)}
                      disabled={loading}
                    >
                      {isFavorite(destination._id) ? (
                        <FaHeart className="w-3 h-3" />
                      ) : (
                        <FiHeart className="w-3 h-3" />
                      )}
                    </motion.button>
                  </div>
                  
                  {/* Price */}
                  <div className="absolute bottom-3 right-3 bg-purple-600 text-white px-3 py-1.5 rounded-md">
                    <span className="text-sm font-bold">${destination.price}</span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4">
                  {/* Title and Location */}
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1 group-hover:text-purple-300 transition-colors">
                      {destination.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <FiMapPin className="w-3 h-3" />
                      <span className="text-sm">{destination.location}</span>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-2">
                    {destination.description}
                  </p>
                  
                  {/* Quick info */}
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
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
                  
                  {/* Reviews and Button */}
                  <div className="flex items-center justify-between">
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
                      <span className="text-xs text-gray-400 ml-1">
                        ({destination.ratingCount})
                      </span>
                    </div>
                    
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDestinationClick(destination._id);
                      }}
                    >
                      View Details
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && destinations.length > itemsPerView && (
        <>
          <motion.button
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 hover:border-purple-400/50 transition-all duration-300 shadow-xl group opacity-0 group-hover:opacity-100"
            aria-label="Previous destinations"
          >
            <FiChevronLeft className="w-6 h-6 group-hover:text-purple-300 transition-colors" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, x: 2 }}
            whileTap={{ scale: 0.9 }}
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 hover:border-purple-400/50 transition-all duration-300 shadow-xl group opacity-0 group-hover:opacity-100"
            aria-label="Next destinations"
          >
            <FiChevronRight className="w-6 h-6 group-hover:text-purple-300 transition-colors" />
          </motion.button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && destinations.length > itemsPerView && (
        <div className="flex justify-center mt-8 gap-2">
          {Array.from({ length: Math.ceil(destinations.length / itemsPerView) }).map((_, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

DestinationsCarousel.propTypes = {
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
  itemsPerView: PropTypes.number,
  currentIndex: PropTypes.number,
  setCurrentIndex: PropTypes.func,
  showArrows: PropTypes.bool,
  showDots: PropTypes.bool,
  autoPlay: PropTypes.bool,
  autoPlayInterval: PropTypes.number,
};