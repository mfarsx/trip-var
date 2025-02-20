import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../components/ui/Button";
import {
  FiSearch,
  FiMapPin,
  FiCalendar,
  FiUsers,
  FiHeart,
  FiStar,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";
import { IoAirplaneOutline } from "react-icons/io5";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { fetchDestinations } from "../store/slices/destinationSlice";

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const { destinations, loading, error } = useSelector(
    (state) => state.destinations
  );
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchParams, setSearchParams] = useState({
    location: "",
    date: "",
    guests: "1 Guest",
  });
  const [filteredDestinations, setFilteredDestinations] = useState([]);

  useEffect(() => {
    dispatch(fetchDestinations({ featured: true }));
  }, [dispatch]);

  useEffect(() => {
    setFilteredDestinations(destinations);
  }, [destinations]);

  const handleSearch = () => {
    const filtered = destinations.filter((destination) => {
      return destination.title
        .toLowerCase()
        .includes(searchParams.location.toLowerCase());
    });
    setFilteredDestinations(filtered);
  };

  const handleInputChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleDestinationClick = (destinationId) => {
    navigate(`/destinations/${destinationId}`);
  };

  return (
    <div className="min-h-screen bg-[#1a1f2d]">
      {/* Header */}
      <div className="fixed top-0 right-0 p-4 z-50">
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center text-lg font-medium hover:bg-purple-700 transition-colors border-2 border-gray-700/50 cursor-pointer"
          >
            {authLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              user?.name?.charAt(0)
            )}
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && !authLoading && user && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-xl shadow-lg border border-gray-700/50 overflow-hidden"
            >
              <div className="p-2">
                <button
                  onClick={() => navigate("/settings")}
                  className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700/50 rounded-lg flex items-center gap-2"
                >
                  <FiSettings className="w-4 h-4" />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700/50 rounded-lg flex items-center gap-2"
                >
                  <FiLogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative isolate overflow-hidden py-24 sm:py-32"
      >
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 to-indigo-900/90" />
          <img
            src="https://images.unsplash.com/photo-1682686581362-796145f0e123"
            alt="Hero background"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-bold tracking-tight text-white sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-pink-100"
            >
              Your Journey Begins Here
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-lg leading-8 text-gray-200"
            >
              Discover extraordinary destinations, create unforgettable
              memories, and explore the world with confidence.
            </motion.p>

            {/* Search Section */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-10 flex flex-col gap-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-800/50 rounded-xl">
                <div className="relative">
                  <FiMapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="location"
                    value={searchParams.location}
                    onChange={handleInputChange}
                    placeholder="Where to?"
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-200"
                  />
                </div>
                <div className="relative">
                  <FiCalendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    name="date"
                    value={searchParams.date}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-200"
                  />
                </div>
                <div className="relative">
                  <FiUsers className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    name="guests"
                    value={searchParams.guests}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-200"
                  >
                    <option>1 Guest</option>
                    <option>2 Guests</option>
                    <option>3 Guests</option>
                    <option>4 Guests</option>
                    <option>5+ Guests</option>
                  </select>
                </div>
                <Button
                  variant="solid"
                  color="primary"
                  onClick={handleSearch}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl flex items-center justify-center gap-2"
                >
                  <FiSearch className="w-5 h-5" />
                  <span>Search</span>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Popular Destinations */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold gradient-text">
              Popular Destinations
            </h2>
            <Button
              variant="secondary"
              className="flex items-center gap-2 bg-gray-800/50 border border-gray-700 hover:bg-gray-800"
            >
              <IoAirplaneOutline className="w-5 h-5" />
              View All
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading destinations...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400">{error}</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDestinations.map((destination) => (
                <motion.div
                  key={destination._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
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
                    <p className="text-gray-400 mb-3">
                      {destination.description}
                    </p>
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
                        <span className="text-gray-200">
                          {destination.rating}
                        </span>
                      </div>
                      <span className="text-lg font-semibold text-purple-400">
                        ${destination.price}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
