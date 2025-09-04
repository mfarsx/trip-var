import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

/**
 * Custom hook for DestinationsSection component
 * Handles all the business logic and memoized computations
 */
export function useDestinationsSection({
  destinations,
  filteredDestinations,
  setFilteredDestinations,
  selectedDestinations,
  setSelectedDestinations,
  setShowFilters,
}) {
  const navigate = useNavigate();

  // Memoized computed values
  const hasResults = useMemo(
    () => filteredDestinations.length > 0,
    [filteredDestinations.length]
  );

  const hasSelections = useMemo(
    () => selectedDestinations.length > 0,
    [selectedDestinations.length]
  );

  const resultsCount = useMemo(
    () => filteredDestinations.length,
    [filteredDestinations.length]
  );

  // Memoized event handlers
  const handleToggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, [setShowFilters]);

  const handleResetFilters = useCallback(() => {
    setFilteredDestinations(destinations);
  }, [setFilteredDestinations, destinations]);

  const handleCompare = useCallback(() => {
    navigate("/compare", {
      state: { destinationIds: selectedDestinations },
    });
  }, [navigate, selectedDestinations]);

  const handleClearSelection = useCallback(() => {
    setSelectedDestinations([]);
  }, [setSelectedDestinations]);

  const handleNavigateToDestinations = useCallback(() => {
    toast.success("Exploring all destinations...");
    navigate("/destinations");
  }, [navigate]);

  // Memoized props objects to prevent unnecessary re-renders
  const carouselProps = useCallback(
    ({
      onDestinationClick,
      onCompareToggle,
      onQuickBook,
      itemsPerView,
      currentIndex,
      setCurrentIndex,
    }) => ({
      destinations: filteredDestinations,
      onDestinationClick,
      onCompareToggle,
      onQuickBook,
      selectedDestinations,
      itemsPerView,
      currentIndex,
      setCurrentIndex,
      showArrows: true,
      showDots: false,
      autoPlay: false,
      autoPlayInterval: 6000,
    }),
    [filteredDestinations, selectedDestinations]
  );

  const sortAndFilterProps = useCallback(
    ({ sortBy, onSortChange, showFilters }) => ({
      sortBy,
      onSortChange,
      showFilters,
      onToggleFilters: handleToggleFilters,
      resultsCount,
    }),
    [handleToggleFilters, resultsCount]
  );

  return {
    // Computed values
    hasResults,
    hasSelections,
    resultsCount,

    // Event handlers
    handleToggleFilters,
    handleResetFilters,
    handleCompare,
    handleClearSelection,
    handleNavigateToDestinations,

    // Props builders
    carouselProps,
    sortAndFilterProps,
  };
}
