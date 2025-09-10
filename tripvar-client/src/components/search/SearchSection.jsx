import {
  FiMapPin,
  FiCalendar,
  FiUsers,
  FiHome,
  FiSearch,
  FiArrowRight,
} from "react-icons/fi";
import { motion } from "framer-motion";
import PropTypes from "prop-types";

export default function SearchSection({
  searchParams,
  onSearchParamsChange,
  onSearch,
  isSearching = false,
}) {
  const handleInputChange = (e) => {
    onSearchParamsChange({
      ...searchParams,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.8 }}
      className="container mx-auto px-4 py-16 max-w-7xl relative z-10"
    >
      {/* Section Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-white mb-3">
          Find Your Perfect Trip
        </h2>
        <p className="text-gray-300 text-lg">
          Search and compare destinations with our advanced booking system
        </p>
      </motion.div>

      {/* Search Form */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="relative"
      >
        <form
          onSubmit={handleSubmit}
          className="relative p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-3xl" />

          {/* Grid layout */}
          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* From Input */}
            <motion.div
              whileFocus={{ scale: 1.02, y: -2 }}
              className="relative group"
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                From
              </label>
              <div className="relative">
                <FiHome className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                <input
                  type="text"
                  name="from"
                  value={searchParams.from}
                  onChange={handleInputChange}
                  placeholder="Departure city"
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:bg-white/15"
                  aria-label="Departure location"
                />
              </div>
            </motion.div>

            {/* To Input */}
            <motion.div
              whileFocus={{ scale: 1.02, y: -2 }}
              className="relative group"
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                To
              </label>
              <div className="relative">
                <FiMapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                <input
                  type="text"
                  name="to"
                  value={searchParams.to}
                  onChange={handleInputChange}
                  placeholder="Destination"
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:bg-white/15"
                  aria-label="Destination location"
                  required
                />
              </div>
            </motion.div>

            {/* Date Input */}
            <motion.div
              whileFocus={{ scale: 1.02, y: -2 }}
              className="relative group"
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                <input
                  type="date"
                  name="date"
                  value={searchParams.date}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:bg-white/15"
                  aria-label="Travel date"
                />
              </div>
            </motion.div>

            {/* Guests Select */}
            <motion.div
              whileFocus={{ scale: 1.02, y: -2 }}
              className="relative group"
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Guests
              </label>
              <div className="relative">
                <FiUsers className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                <select
                  name="guests"
                  value={searchParams.guests}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white transition-all duration-300 focus:outline-none focus:bg-white/15 appearance-none"
                  aria-label="Number of guests"
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests</option>
                  <option value="5+">5+ Guests</option>
                </select>
                <FiArrowRight className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 rotate-90" />
              </div>
            </motion.div>
          </div>

          {/* Search Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 flex justify-center"
          >
            <motion.button
              type="submit"
              disabled={isSearching}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`group relative px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-lg rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 overflow-hidden flex items-center gap-3 ${
                isSearching ? "opacity-75 cursor-not-allowed" : ""
              }`}
              aria-label="Search trips"
            >
              <span className="relative z-10 flex items-center gap-3">
                {isSearching ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <FiSearch className="w-5 h-5" />
                    Search Destinations
                    <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>
          </motion.div>
        </form>
      </motion.div>

      {/* Quick Filters */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="mt-8 flex flex-wrap justify-center gap-3"
      >
        {[
          "Popular Destinations",
          "Adventure Trips",
          "Beach Getaways",
          "City Breaks",
          "Mountain Retreats",
        ].map((filter, index) => (
          <motion.button
            key={filter}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2 + index * 0.1 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm rounded-full hover:bg-white/20 transition-all duration-300"
          >
            {filter}
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}

SearchSection.propTypes = {
  searchParams: PropTypes.shape({
    from: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    guests: PropTypes.string.isRequired,
  }).isRequired,
  onSearchParamsChange: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  isSearching: PropTypes.bool,
};
