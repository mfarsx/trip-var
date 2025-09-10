import { memo } from "react";
import PropTypes from "prop-types";

/**
 * DestinationsSection - Clean component that renders nothing
 * This component has been cleaned up to remove all featured collection references
 * and now simply returns null to render nothing.
 */
const DestinationsSection = memo(function DestinationsSection({
  destinations = [],
  filteredDestinations = [],
  setFilteredDestinations,
  loading = false,
  activeFilter = "all",
  sortBy = "price-low",
  showFilters = false,
  setShowFilters,
  onFilterChange,
  onSortChange,
  onDestinationClick,
  onCompareToggle,
  onQuickBook,
  selectedDestinations = [],
  setSelectedDestinations,
  itemsPerView = 5,
  currentIndex = 0,
  setCurrentIndex,
}) {
  // Return null - this component renders nothing
  return null;
});

// Enhanced PropTypes with more specific validation
DestinationsSection.propTypes = {
  // Data props
  destinations: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      location: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      rating: PropTypes.number.isRequired,
      ratingCount: PropTypes.number.isRequired,
      imageUrl: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      category: PropTypes.string,
    })
  ),

  filteredDestinations: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      location: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      rating: PropTypes.number.isRequired,
      ratingCount: PropTypes.number.isRequired,
      imageUrl: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      category: PropTypes.string,
    })
  ),

  // State management props
  setFilteredDestinations: PropTypes.func.isRequired,
  loading: PropTypes.bool,

  // Filter and sort props
  activeFilter: PropTypes.oneOf([
    "all",
    "popular",
    "adventure",
    "relaxation",
    "culture",
  ]),
  sortBy: PropTypes.oneOf([
    "price-low",
    "price-high",
    "rating",
    "popularity",
  ]),
  showFilters: PropTypes.bool,
  setShowFilters: PropTypes.func.isRequired,

  // Event handlers
  onFilterChange: PropTypes.func.isRequired,
  onSortChange: PropTypes.func.isRequired,
  onDestinationClick: PropTypes.func.isRequired,
  onCompareToggle: PropTypes.func.isRequired,
  onQuickBook: PropTypes.func.isRequired,

  // Selection state
  selectedDestinations: PropTypes.arrayOf(PropTypes.string),
  setSelectedDestinations: PropTypes.func.isRequired,

  // Carousel props
  itemsPerView: PropTypes.number,
  currentIndex: PropTypes.number,
  setCurrentIndex: PropTypes.func.isRequired,
};

DestinationsSection.displayName = "DestinationsSection";

export default DestinationsSection;