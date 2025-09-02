import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export function useDestinationActions() {
  const navigate = useNavigate();
  const [selectedDestinations, setSelectedDestinations] = useState([]);

  const handleDestinationClick = (destinationId) => {
    navigate(`/destinations/${destinationId}`);
  };

  const handleCompareToggle = (destinationId) => {
    setSelectedDestinations((prev) => {
      if (prev.includes(destinationId)) {
        return prev.filter((id) => id !== destinationId);
      } else if (prev.length < 3) {
        return [...prev, destinationId];
      } else {
        toast.error("You can compare up to 3 destinations");
        return prev;
      }
    });
  };

  const handleQuickBook = (destinationId) => {
    navigate(`/destinations/${destinationId}?action=book`);
  };

  const handleFilterChange = (filter) => {
    const filterLabels = {
      all: "All Destinations",
      popular: "Popular",
      adventure: "Adventure",
      relaxation: "Relaxation",
      culture: "Culture",
    };
    toast.success(`Filtered by: ${filterLabels[filter] || filter}`);
  };

  const handleSortChange = (sort) => {
    const sortLabels = {
      featured: "Featured",
      "price-low": "Price: Low to High",
      "price-high": "Price: High to Low",
      rating: "Highest Rated",
      popularity: "Most Popular",
    };
    toast.success(`Sorted by: ${sortLabels[sort]}`);
  };

  return {
    selectedDestinations,
    setSelectedDestinations,
    handleDestinationClick,
    handleCompareToggle,
    handleQuickBook,
    handleFilterChange,
    handleSortChange,
  };
}
