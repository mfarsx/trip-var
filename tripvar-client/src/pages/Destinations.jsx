import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchDestinations } from "../store/slices/destinationSlice";
import DestinationsGrid from "../components/destinations/DestinationsGrid";
import DestinationDetail from "../components/destinations/DestinationDetail";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";

const Destinations = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { destinations, loading, error } = useSelector(
    (state) => state.destinations
  );

  useEffect(() => {
    dispatch(fetchDestinations());
  }, [dispatch]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (id) {
    const destination = destinations.find((d) => d._id === id);
    if (!destination) {
      return <ErrorState error="Destination not found" />;
    }
    return <DestinationDetail destination={destination} onBack={() => navigate("/")} />;
  }

  return (
    <div className="min-h-screen bg-[#1a1f2d] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Popular Destinations</h1>
        <DestinationsGrid
          destinations={destinations}
          onDestinationClick={(destinationId) => navigate(`/destinations/${destinationId}`)}
        />
      </div>
    </div>
  );
};

export default Destinations;
