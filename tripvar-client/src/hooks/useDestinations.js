import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchDestinations } from "../store/slices/destinationSlice";
import apiCallManager from "../utils/apiCallManager";

export function useDestinations() {
  const dispatch = useDispatch();
  const { destinations, loading, error } = useSelector(
    (state) => state.destinations
  );
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const hasFetched = useRef(false);

  // Memoize destinations to prevent unnecessary re-renders
  const memoizedDestinations = useMemo(() => destinations, [destinations]);

  // Single effect to handle fetching
  useEffect(() => {
    if (!hasFetched.current && !loading && destinations.length === 0) {
      hasFetched.current = true;
      apiCallManager
        .executeCall("fetchDestinations", () => dispatch(fetchDestinations()))
        .catch((err) => {
          console.error("Failed to fetch destinations:", err);
          // Error is already handled in the slice, just log here
        });
    }
  }, [dispatch, loading, destinations.length]);

  // Only update filtered destinations when destinations actually change
  useEffect(() => {
    if (memoizedDestinations.length > 0) {
      setFilteredDestinations(memoizedDestinations);
    }
  }, [memoizedDestinations]);

  const refetchDestinations = useCallback(() => {
    hasFetched.current = false;
    apiCallManager.executeCall(
      "fetchDestinations",
      () => dispatch(fetchDestinations(true, null)) // Force refresh with no params
    );
  }, [dispatch]);

  return {
    destinations: memoizedDestinations,
    filteredDestinations,
    setFilteredDestinations,
    loading,
    error,
    refetchDestinations,
  };
}
