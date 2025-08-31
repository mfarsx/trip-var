import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchDestinations } from "../store/slices/destinationSlice";
import DestinationsGrid from "../components/destinations/DestinationsGrid";
import DestinationDetail from "../components/destinations/DestinationDetail";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import Footer from "../components/layout/Footer";

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
    <div className="min-h-screen bg-[#1a1f2d] text-white">
      <div className="pt-20 pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Discover Amazing Destinations
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Explore our curated collection of destinations and book your next adventure with confidence.
            </p>
          </div>
          
          <div className="mb-8 flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Real-time availability</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Instant booking</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Secure payments</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
              <span>Best price guarantee</span>
            </div>
          </div>
          
          <DestinationsGrid
            destinations={destinations}
            onDestinationClick={(destinationId) => navigate(`/destinations/${destinationId}`)}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Destinations;
