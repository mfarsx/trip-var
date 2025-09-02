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

export default function DestinationsSection({
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
  navigate,
}) {
  return (
    <section
      id="destinations-section"
      className="py-20 px-4 relative overflow-hidden"
    >
      <BackgroundDecorations />

      <div className="max-w-7xl mx-auto relative">
        <SectionHeader />

        <FilterButtons
          activeFilter={activeFilter}
          onFilterChange={onFilterChange}
        />

        <SortAndFilterControls
          sortBy={sortBy}
          onSortChange={onSortChange}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          resultsCount={filteredDestinations.length}
        />

        {loading ? (
          <LoadingSkeleton itemsPerView={itemsPerView} />
        ) : filteredDestinations.length > 0 ? (
          <DestinationsCarousel
            destinations={filteredDestinations}
            onDestinationClick={onDestinationClick}
            onCompareToggle={onCompareToggle}
            onQuickBook={onQuickBook}
            selectedDestinations={selectedDestinations}
            itemsPerView={itemsPerView}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            showArrows={true}
            showDots={false}
            autoPlay={false}
            autoPlayInterval={6000}
          />
        ) : (
          <EmptyState
            onButtonClick={() => setFilteredDestinations(destinations)}
          />
        )}

        <ComparisonPanel
          selectedDestinations={selectedDestinations}
          onCompare={() =>
            navigate("/compare", {
              state: { destinationIds: selectedDestinations },
            })
          }
          onClear={() => setSelectedDestinations([])}
        />

        {filteredDestinations.length > 0 && (
          <>
            <ExploreButton onNavigate={() => navigate("/destinations")} />
            <FeatureBadges />
          </>
        )}
      </div>
    </section>
  );
}

DestinationsSection.propTypes = {
  destinations: PropTypes.array.isRequired,
  filteredDestinations: PropTypes.array.isRequired,
  setFilteredDestinations: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  activeFilter: PropTypes.string.isRequired,
  sortBy: PropTypes.string.isRequired,
  showFilters: PropTypes.bool.isRequired,
  setShowFilters: PropTypes.func.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onSortChange: PropTypes.func.isRequired,
  onDestinationClick: PropTypes.func.isRequired,
  onCompareToggle: PropTypes.func.isRequired,
  onQuickBook: PropTypes.func.isRequired,
  selectedDestinations: PropTypes.array.isRequired,
  setSelectedDestinations: PropTypes.func.isRequired,
  itemsPerView: PropTypes.number.isRequired,
  currentIndex: PropTypes.number.isRequired,
  setCurrentIndex: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired,
};
