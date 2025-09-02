import { useState } from "react";
import { destinationApi } from "../services/api";
import toast from "react-hot-toast";

export function useSearch() {
  const [searchParams, setSearchParams] = useState({
    from: "",
    to: "",
    date: "",
    guests: "1 Guest",
  });
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (setFilteredDestinations) => {
    // Validate search parameters
    if (!searchParams.to.trim()) {
      toast.error("Please enter a destination");
      return;
    }

    try {
      setIsSearching(true);

      // Use the backend search API
      const response = await destinationApi.searchDestinations(searchParams);

      if (response.data.destinations.length === 0) {
        toast.error("No destinations found matching your criteria");
        return;
      }

      setFilteredDestinations(response.data.destinations);
      toast.success(`Found ${response.data.destinations.length} destinations`);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Error searching for destinations");
    } finally {
      setIsSearching(false);
    }
  };

  return {
    searchParams,
    setSearchParams,
    isSearching,
    handleSearch,
  };
}
