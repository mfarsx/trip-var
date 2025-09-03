import { memo } from "react";
import PropTypes from "prop-types";
import DestinationsCarousel from "../destinations/DestinationsCarousel";
import EmptyState from "../common/EmptyState";
import ComparisonPanel from "../common/ComparisonPanel";
import ExploreButton from "../common/ExploreButton";
import FeatureBadges from "../common/FeatureBadges";
import SectionHeader from "../common/SectionHeader";
import FilterButtons from "../common/FilterButtons";
import SortAndFilterControls from "../common/SortAndFilterControls";
import BackgroundDecorations from "../common/BackgroundDecorations";
import LoadingSkeleton from "../common/LoadingSkeleton";
import PerformanceMonitor from "../common/PerformanceMonitor";
import { useDestinationsSection } from "../../hooks/useDestinationsSection";

/**
 * DestinationsSection - Main section component for displaying and managing destinations
 *
 * Features:
 * - Responsive carousel with filtering and sorting
 * - Comparison functionality
 * - Loading states and empty states
 * - Advanced filtering controls
 * - Performance optimized with memoization and custom hooks
 * - Enhanced accessibility and error handling
 */
const DestinationsSection = memo(function DestinationsSection({
  destinations,
  filteredDestinations,
  setFilteredDestinations,
  loading,
  activeFilter,
  sortBy,
  showFilters,
  setShowFilters,
  onFilterChange,
  onSortChange,
  onDestinationClick,
  onCompareToggle,
  onQuickBook,
  selectedDestinations,
  setSelectedDestinations,
  itemsPerView,
  currentIndex,
  setCurrentIndex,
}) {
  // Custom hook for business logic
  const {
    hasResults,
    hasSelections,
    handleResetFilters,
    handleCompare,
    handleClearSelection,
    handleNavigateToDestinations,
    carouselProps,
    sortAndFilterProps,
  } = useDestinationsSection({
    destinations,
    filteredDestinations,
    setFilteredDestinations,
    selectedDestinations,
    setSelectedDestinations,
    setShowFilters,
  });

  // Early return for loading state with proper accessibility
  if (loading) {
    return (
      <section
        id="destinations-section"
        className="py-20 px-4 relative overflow-hidden"
        aria-label="Destinations section"
        role="region"
      >
        <BackgroundDecorations />
        <div className="max-w-7xl mx-auto relative">
          <SectionHeader />
          <LoadingSkeleton itemsPerView={itemsPerView} />
        </div>
      </section>
    );
  }

  return (
    <PerformanceMonitor componentName="DestinationsSection">
      <section
        id="destinations-section"
        className="py-20 px-4 relative overflow-hidden"
        aria-label="Destinations section"
        role="region"
      >
        <BackgroundDecorations />

        <div className="max-w-7xl mx-auto relative">
          {/* Section Header */}
          <SectionHeader />

          {/* Filter Controls */}
          <FilterButtons
            activeFilter={activeFilter}
            onFilterChange={onFilterChange}
          />

          {/* Sort and Advanced Filter Controls */}
          <SortAndFilterControls
            {...sortAndFilterProps({
              sortBy,
              onSortChange,
              showFilters,
            })}
          />

          {/* Main Content Area */}
          <div className="relative" role="main" aria-live="polite">
            {hasResults ? (
              <DestinationsCarousel
                {...carouselProps({
                  onDestinationClick,
                  onCompareToggle,
                  onQuickBook,
                  itemsPerView,
                  currentIndex,
                  setCurrentIndex,
                })}
              />
            ) : (
              <EmptyState onButtonClick={handleResetFilters} />
            )}
          </div>

          {/* Comparison Panel - Only show when items are selected */}
          {hasSelections && (
            <ComparisonPanel
              selectedDestinations={selectedDestinations}
              onCompare={handleCompare}
              onClear={handleClearSelection}
            />
          )}

          {/* Call-to-Action Section - Only show when there are results */}
          {hasResults && (
            <div className="mt-16" role="complementary">
              <ExploreButton onNavigate={handleNavigateToDestinations} />
              <FeatureBadges />
            </div>
          )}
        </div>
      </section>
    </PerformanceMonitor>
  );
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
  ).isRequired,

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
  ).isRequired,

  // State management props
  setFilteredDestinations: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,

  // Filter and sort props
  activeFilter: PropTypes.oneOf([
    "all",
    "popular",
    "adventure",
    "relaxation",
    "culture",
  ]).isRequired,
  sortBy: PropTypes.oneOf([
    "featured",
    "price-low",
    "price-high",
    "rating",
    "popularity",
  ]).isRequired,
  showFilters: PropTypes.bool.isRequired,
  setShowFilters: PropTypes.func.isRequired,

  // Event handlers
  onFilterChange: PropTypes.func.isRequired,
  onSortChange: PropTypes.func.isRequired,
  onDestinationClick: PropTypes.func.isRequired,
  onCompareToggle: PropTypes.func.isRequired,
  onQuickBook: PropTypes.func.isRequired,

  // Selection state
  selectedDestinations: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSelectedDestinations: PropTypes.func.isRequired,

  // Carousel props
  itemsPerView: PropTypes.number.isRequired,
  currentIndex: PropTypes.number.isRequired,
  setCurrentIndex: PropTypes.func.isRequired,
};

// Default props for better development experience
DestinationsSection.defaultProps = {
  destinations: [],
  filteredDestinations: [],
  loading: false,
  activeFilter: "all",
  sortBy: "featured",
  showFilters: false,
  selectedDestinations: [],
  itemsPerView: 4,
  currentIndex: 0,
};

DestinationsSection.displayName = "DestinationsSection";

export default DestinationsSection;
