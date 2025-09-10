import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchDestinations } from "../store/slices/destinationSlice";

export function useDestinations() {
  const dispatch = useDispatch();
  const { destinations, loading } = useSelector((state) => state.destinations);
  const [filteredDestinations, setFilteredDestinations] = useState([]);

  useEffect(() => {
    dispatch(fetchDestinations());
  }, [dispatch]);

  useEffect(() => {
    setFilteredDestinations(destinations);
  }, [destinations]);

  return {
    destinations,
    filteredDestinations,
    setFilteredDestinations,
    loading,
  };
}
