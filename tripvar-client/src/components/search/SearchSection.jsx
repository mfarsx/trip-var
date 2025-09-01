import { FiMapPin, FiCalendar, FiUsers, FiHome, FiSearch } from "react-icons/fi";
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import Button from "../ui/Button";

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
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="container mx-auto px-4 py-8 max-w-7xl"
    >
      <form 
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 4k:grid-cols-6 gap-4 p-6 bg-gray-800/50 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
      >
        <motion.div whileFocus={{ scale: 1.02 }} className="relative">
          <FiHome className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="from"
            value={searchParams.from}
            onChange={handleInputChange}
            placeholder="From"
            className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-gray-200 placeholder-gray-400 transition-all duration-200 focus:outline-none"
            aria-label="Departure location"
          />
        </motion.div>
        <motion.div whileFocus={{ scale: 1.02 }} className="relative">
          <FiMapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="to"
            value={searchParams.to}
            onChange={handleInputChange}
            placeholder="To"
            className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-gray-200 placeholder-gray-400 transition-all duration-200 focus:outline-none"
            aria-label="Destination location"
            required
          />
        </motion.div>
        <motion.div whileFocus={{ scale: 1.02 }} className="relative">
          <FiCalendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="date"
            name="date"
            value={searchParams.date}
            onChange={handleInputChange}
            className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-gray-200 placeholder-gray-400 transition-all duration-200 focus:outline-none"
            aria-label="Travel date"
          />
        </motion.div>
        <motion.div whileFocus={{ scale: 1.02 }} className="relative">
          <FiUsers className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            name="guests"
            value={searchParams.guests}
            onChange={handleInputChange}
            className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-gray-200 placeholder-gray-400 transition-all duration-200 focus:outline-none appearance-none"
            aria-label="Number of guests"
          >
            <option>1 Guest</option>
            <option>2 Guests</option>
            <option>3 Guests</option>
            <option>4 Guests</option>
            <option>5+ Guests</option>
          </select>
        </motion.div>
        <Button
          type="submit"
          variant="solid"
          color="primary"
          disabled={isSearching}
          className={`w-full h-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 focus:ring-offset-gray-900 ${isSearching ? 'opacity-75 cursor-not-allowed' : ''}`}
          aria-label="Search trips"
        >
          {isSearching ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Searching...
            </>
          ) : (
            <>
              <FiSearch className="text-lg" />
              Search
            </>
          )}
        </Button>
      </form>
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
