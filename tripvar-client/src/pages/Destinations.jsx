import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { FiHeart, FiMapPin, FiStar } from "react-icons/fi";
import { fetchDestinations } from "../store/slices/destinationSlice";

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

  const handleDestinationClick = (destinationId) => {
    navigate(`/destinations/${destinationId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1f2d] text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading destinations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1a1f2d] text-white p-8 flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (id) {
    const destination = destinations.find((d) => d._id === id);
    if (!destination)
      return (
        <div className="min-h-screen bg-[#1a1f2d] text-white p-8 flex items-center justify-center">
          <p className="text-red-400">Destination not found</p>
        </div>
      );

    return (
      <div className="min-h-screen bg-[#1a1f2d] text-white p-8">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate("/")}
            className="mb-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          >
            ← Back
          </button>
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <div className="aspect-w-16 aspect-h-9 mb-6 relative">
              <img
                src={destination.imageUrl}
                alt={destination.title}
                className="rounded-lg object-cover w-full h-full"
              />
              <div className="absolute top-4 right-4">
                <button className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors">
                  <FiHeart className="w-5 h-5" />
                </button>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-4">{destination.title}</h1>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-gray-300">
                <FiMapPin className="w-4 h-4" />
                {destination.location}
              </div>
              <div className="flex items-center gap-1">
                <FiStar className="w-4 h-4 text-yellow-500" />
                <span className="text-gray-300">{destination.rating}</span>
              </div>
            </div>
            <p className="text-gray-300 mb-6">{destination.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-700/30 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Category</h3>
                <p className="text-gray-300">{destination.category}</p>
              </div>
              <div className="bg-gray-700/30 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Price</h3>
                <p className="text-purple-400 font-semibold">
                  ${destination.price}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1f2d] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Popular Destinations</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              key={destination._id}
              className="group relative overflow-hidden rounded-xl bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm cursor-pointer"
              onClick={() => handleDestinationClick(destination._id)}
            >
              <div className="aspect-w-16 aspect-h-9 relative">
                <img
                  src={destination.imageUrl}
                  alt={destination.title}
                  className="h-48 w-full object-cover rounded-t-xl"
                />
                <div
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add favorite logic here
                  }}
                >
                  <FiHeart className="w-5 h-5" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-xl font-bold text-white">
                    {destination.title}
                  </h3>
                  <p className="text-gray-200 flex items-center gap-2">
                    <FiMapPin className="w-4 h-4" />
                    {destination.location}
                  </p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-400 mb-3">{destination.description}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-1 text-xs rounded-lg bg-gray-700/50 text-gray-300">
                    {destination.category}
                  </span>
                  {destination.featured && (
                    <span className="px-2 py-1 text-xs rounded-lg bg-yellow-500/20 text-yellow-400">
                      Featured
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <FiStar className="w-4 h-4 text-yellow-500" />
                    <span className="text-gray-200">{destination.rating}</span>
                  </div>
                  <span className="text-lg font-semibold text-purple-400">
                    ${destination.price}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Destinations;
