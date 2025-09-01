import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiHeart, FiMapPin, FiStar, FiDollarSign, FiTrash2 } from "react-icons/fi";
import { fetchProfile } from "../store/slices/authSlice";
import { toggleFavorite } from "../services/userService";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import Footer from "../components/layout/Footer";
import toast from "react-hot-toast";

const Favorites = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user && !user.favorites) {
      dispatch(fetchProfile());
    }
  }, [dispatch, user]);

  const handleRemoveFavorite = async (destinationId) => {
    try {
      await toggleFavorite(destinationId);
      dispatch(fetchProfile()); // Refresh user data
      toast.success("Removed from favorites");
    } catch {
      toast.error("Failed to remove from favorites");
    }
  };

  const handleDestinationClick = (destinationId) => {
    navigate(`/destinations/${destinationId}`);
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!user) {
    return <ErrorState error="Please log in to view your favorites" />;
  }

  const favorites = user.favorites || [];

  return (
    <div className="min-h-screen bg-[#1a1f2d] text-white">
      <div className="pt-20 pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              My Favorites
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Your saved destinations for future adventures.
            </p>
          </div>
          
          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <FiHeart className="mx-auto text-6xl text-gray-400 mb-4" />
              <h2 className="text-xl text-gray-400 mb-2">No favorites yet</h2>
              <p className="text-gray-500 mb-6">Start exploring destinations and add them to your favorites!</p>
              <button
                onClick={() => navigate("/destinations")}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Explore Destinations
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((destination) => (
                <div
                  key={destination._id}
                  className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/50 hover:border-gray-600/50 transition-colors group"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={destination.imageUrl}
                      alt={destination.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={() => handleRemoveFavorite(destination._id)}
                        className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors"
                        title="Remove from favorites"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">
                        {destination.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-200">
                        <FiMapPin className="w-3 h-3" />
                        <span>{destination.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{destination.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiDollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-lg font-semibold text-green-400">
                          ${destination.price}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {destination.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 bg-purple-600/20 text-purple-400 text-xs rounded-full">
                        {destination.category}
                      </span>
                      <button
                        onClick={() => handleDestinationClick(destination._id)}
                        className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Favorites;