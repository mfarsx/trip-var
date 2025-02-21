import { FiMapPin, FiCalendar, FiUsers } from "react-icons/fi";
import { motion } from "framer-motion";
import PropTypes from 'prop-types';
import Button from "../ui/Button";

export default function SearchSection({ searchParams, onSearchParamsChange, onSearch }) {
  const handleInputChange = (e) => {
    onSearchParamsChange({
      ...searchParams,
      [e.target.name]: e.target.value,
    });
  };

  return (
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
          onClick={onSearch}
          className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl flex items-center justify-center gap-2"
        >
          Search
        </Button>
      </div>
    </motion.div>
  );
}

SearchSection.propTypes = {
  searchParams: PropTypes.shape({
    location: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    guests: PropTypes.string.isRequired
  }).isRequired,
  onSearchParamsChange: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired
};
