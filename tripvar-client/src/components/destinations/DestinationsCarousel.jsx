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
  itemsPerView = 4,
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
        <p className="text-gray-500">Try adjusting your search criteria or explore our featured destinations.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full group">
      {/* Carousel Container */}
      <div 
        ref={carouselRef}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900/20 to-gray-800/20 backdrop-blur-sm border border-gray-700/30 p-4"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          className={`flex transition-transform duration-700 ease-out ${
            destinations.length <= itemsPerView ? 'justify-center' : ''
          }`}
          style={{
            transform: destinations.length <= itemsPerView 
              ? 'translateX(0%)'
              : `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            width: destinations.length <= itemsPerView 
              ? '100%' 
              : `${(destinations.length / itemsPerView) * 100}%`
          }}
        >
          {destinations.map((destination, index) => (
            <motion.div
              key={destination._id}
              className="flex-shrink-0 px-1.5"
              style={{ width: `${100 / itemsPerView}%` }}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
            >
              <div className="group relative bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden cursor-pointer border border-white/10 hover:border-purple-400/50 transition-all duration-500 h-full flex flex-col shadow-2xl hover:shadow-purple-500/20 destination-card" style={{minHeight: '500px'}}>
                {/* Image Container - Updated */}
                <div className="relative h-72 w-full overflow-hidden">
                  <img
                    src={destination.imageUrl}
                    alt={destination.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = `https://source.unsplash.com/random/400x300?${destination.title}`;
                    }}
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {/* Favorite Button */}
                  <button 
                    className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg ${
                      isFavorite(destination._id)
                        ? 'bg-red-500/90 text-white'
                        : 'bg-white/20 hover:bg-white/30 text-white'
                    }`}
                    onClick={(e) => handleToggleFavorite(e, destination._id)}
                    disabled={loading}
                  >
                    {isFavorite(destination._id) ? (
                      <FaHeart className="w-4 h-4" />
                    ) : (
                      <FiHeart className="w-4 h-4" />
                    )}
                  </button>

                  {/* Rating */}
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full">
                    <FiStar className="w-4 h-4 text-amber-400 fill-current" />
                    <span className="text-white text-sm font-bold">{destination.rating}</span>
                  </div>

                  {/* Price Badge */}
                  <div className="absolute bottom-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full shadow-lg">
                    <span className="text-lg font-bold">${destination.price}</span>
                  </div>

                  {/* Title and Location */}
                  <div className="absolute bottom-4 left-4 right-20">
                    <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">
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
                
                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  {/* Description */}
                  <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
                    {destination.description}
                  </p>
                  
                  {/* Quick Info */}
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                    <div className="flex items-center gap-1.5">
                      <FiClock className="w-3.5 h-3.5 text-blue-400" />
                      <span className="font-medium">3-5 days</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FiUsers className="w-3.5 h-3.5 text-green-400" />
                      <span className="font-medium">2-8 people</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FiTrendingUp className="w-3.5 h-3.5 text-purple-400" />
                      <span className="font-medium">Popular</span>
                    </div>
                  </div>
                  
                  {/* Bottom Section */}
                  <div className="space-y-4">
                    {/* Reviews */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <FiStar 
                            key={i} 
                            className={`w-3.5 h-3.5 ${
                              i < Math.floor(destination.rating) 
                                ? 'text-amber-400 fill-current' 
                                : 'text-gray-600'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-gray-400 text-xs">
                        {destination.ratingCount} reviews
                      </span>
                    </div>
                    
                    {/* Action Button */}
                    <button 
                      className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 btn-modern"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDestinationClick(destination._id);
                      }}
                    >
                      Explore Now
                    </button>
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
          <button
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-10 w-14 h-14 bg-white/15 backdrop-blur-xl border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/25 hover:border-purple-400/60 transition-all duration-300 transform hover:scale-110 shadow-2xl group opacity-0 group-hover:opacity-100"
            aria-label="Previous destinations"
          >
            <FiChevronLeft className="w-6 h-6 group-hover:text-purple-300 transition-colors" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-10 w-14 h-14 bg-white/15 backdrop-blur-xl border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/25 hover:border-purple-400/60 transition-all duration-300 transform hover:scale-110 shadow-2xl group opacity-0 group-hover:opacity-100"
            aria-label="Next destinations"
          >
            <FiChevronRight className="w-6 h-6 group-hover:text-purple-300 transition-colors" />
          </button>
        </>
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