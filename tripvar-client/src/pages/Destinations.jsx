import React, { useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import {
  toggleDestinationSelection,
  clearSelection,
  setComparing,
} from "../store/slices/comparisonSlice";
import { useDestinations } from "../hooks/useDestinations";
import DestinationsGrid from "../components/destinations/DestinationsGrid";
import DestinationDetail from "../components/destinations/DestinationDetail";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import Footer from "../components/layout/Footer";
import Header from "../components/header/Header";
import PageTransition from "../components/common/PageTransition";
import toast from "react-hot-toast";

const Destinations = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Use the custom hook for better data management
  const { destinations, loading, error } = useDestinations();
  const selectedDestinations = useSelector(
    (state) => state.comparison.selectedDestinations
  );

  // Memoize destination lookup for better performance
  const destination = useMemo(() => {
    if (!id || !destinations.length) return null;
    return destinations.find((d) => d._id === id) || null;
  }, [destinations, id]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleLogout = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const handleQuickBook = useCallback(
    (destinationId) => {
      // Navigate to destination detail page with quick booking action
      toast.success("Opening quick booking...");
      navigate(`/destinations/${destinationId}?action=book`);
    },
    [navigate]
  );

  const handleCompareToggle = useCallback(
    (destinationId) => {
      dispatch(toggleDestinationSelection(destinationId));

      // Check if we're at max capacity
      if (
        selectedDestinations.length >= 3 &&
        !selectedDestinations.includes(destinationId)
      ) {
        toast.error("You can compare up to 3 destinations at a time");
      }
    },
    [dispatch, selectedDestinations]
  );

  const handleClearComparison = useCallback(() => {
    dispatch(clearSelection());
  }, [dispatch]);

  const handleStartComparison = useCallback(() => {
    if (selectedDestinations.length >= 2) {
      dispatch(setComparing(true));
      // TODO: Implement comparison modal/page
      toast.success("Comparison feature coming soon!");
    }
  }, [dispatch, selectedDestinations.length]);

  // Early returns for error and loading states
  if (error) {
    return (
      <div className="min-h-screen bg-[#1a1f2d] text-white">
        <Header onLogout={handleLogout} />
        <ErrorState error={error} />
      </div>
    );
  }

  if (loading && !destinations.length) {
    return (
      <div className="min-h-screen bg-[#1a1f2d] text-white">
        <Header onLogout={handleLogout} />
        <LoadingState />
      </div>
    );
  }

  // Handle destination detail view
  if (id) {
    if (!destination) {
      return (
        <div className="min-h-screen bg-[#1a1f2d] text-white">
          <Header onLogout={handleLogout} />
          <ErrorState error="Destination not found" />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#1a1f2d] text-white">
        <Header onLogout={handleLogout} />
        <PageTransition>
          <DestinationDetail
            destination={destination}
            onBack={() => navigate("/destinations")}
          />
        </PageTransition>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1f2d] text-white">
      <Header onLogout={handleLogout} />
      <PageTransition>
        <div className="pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="mb-6">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <button
                  onClick={() => navigate("/")}
                  className="hover:text-purple-400 transition-colors"
                >
                  Home
                </button>
                <span>/</span>
                <span className="text-white">Destinations</span>
              </div>
            </nav>

            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Destinations
              </h1>
              <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
                Explore our destinations and book your next adventure.
              </p>
            </div>

            {/* Comparison Bar */}
            {selectedDestinations.length > 0 && (
              <div className="mb-6 p-3 sm:p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <span className="text-white font-medium text-sm sm:text-base">
                      {selectedDestinations.length} destination
                      {selectedDestinations.length > 1 ? "s" : ""} selected
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedDestinations.map((id) => {
                        const dest = destinations.find((d) => d._id === id);
                        return dest ? (
                          <div
                            key={id}
                            className="flex items-center gap-2 bg-gray-700/50 px-2 sm:px-3 py-1 rounded-lg"
                          >
                            <img
                              src={dest.imageUrl}
                              alt={dest.title}
                              className="w-5 h-5 sm:w-6 sm:h-6 rounded object-cover"
                            />
                            <span className="text-xs sm:text-sm text-gray-300 truncate max-w-20 sm:max-w-none">
                              {dest.title}
                            </span>
                            <button
                              onClick={() => handleCompareToggle(id)}
                              className="text-gray-400 hover:text-white transition-colors text-sm"
                            >
                              ×
                            </button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleClearComparison}
                      className="px-3 sm:px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      Clear All
                    </button>
                    {selectedDestinations.length >= 2 && (
                      <button
                        onClick={handleStartComparison}
                        className="px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                      >
                        Compare Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <DestinationsGrid
              destinations={destinations}
              onDestinationClick={(destinationId) => {
                toast.success("Loading destination details...");
                navigate(`/destinations/${destinationId}`);
              }}
              onQuickBook={handleQuickBook}
              onCompareToggle={handleCompareToggle}
              selectedDestinations={selectedDestinations}
            />
          </div>
        </div>
      </PageTransition>
      <Footer />
    </div>
  );
};

export default Destinations;
