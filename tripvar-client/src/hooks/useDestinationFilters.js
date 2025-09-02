import { useState, useEffect } from "react";

export function useDestinationFilters(destinations, setFilteredDestinations) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  const filterMap = {
    popular: "Popular",
    adventure: "Adventure",
    relaxation: "Relaxation",
    culture: "Cultural",
  };

  // Filter and sort destinations
  useEffect(() => {
    let filtered = [...destinations];

    // Apply category filter
    if (activeFilter !== "all") {
      const targetCategory =
        filterMap[activeFilter.toLowerCase()] || activeFilter;

      filtered = filtered.filter((dest) => {
        const category = dest.category || "";
        return category === targetCategory;
      });
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "popularity":
        filtered.sort((a, b) => b.ratingCount - a.ratingCount);
        break;
      case "featured":
      default:
        // Keep original order for featured
        break;
    }

    setFilteredDestinations(filtered);
  }, [destinations, activeFilter, sortBy, setFilteredDestinations]);

  return {
    activeFilter,
    setActiveFilter,
    sortBy,
    setSortBy,
  };
}
