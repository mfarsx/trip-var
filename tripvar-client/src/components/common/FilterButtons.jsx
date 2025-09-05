import { motion } from "framer-motion";
import { FiMapPin, FiTrendingUp, FiZap, FiSun, FiBook } from "react-icons/fi";
import PropTypes from "prop-types";

export default function FilterButtons({ activeFilter, onFilterChange }) {
  const filters = [
    { 
      key: "all", 
      label: "All Destinations", 
      icon: FiMapPin,
      color: "from-gray-400 to-gray-600",
      bgColor: "from-gray-500/20 to-gray-600/20"
    },
    { 
      key: "popular", 
      label: "Popular", 
      icon: FiTrendingUp,
      color: "from-red-400 to-pink-500",
      bgColor: "from-red-500/20 to-pink-500/20"
    },
    { 
      key: "adventure", 
      label: "Adventure", 
      icon: FiZap,
      color: "from-orange-400 to-yellow-500",
      bgColor: "from-orange-500/20 to-yellow-500/20"
    },
    { 
      key: "relaxation", 
      label: "Relaxation", 
      icon: FiSun,
      color: "from-blue-400 to-cyan-500",
      bgColor: "from-blue-500/20 to-cyan-500/20"
    },
    { 
      key: "culture", 
      label: "Culture", 
      icon: FiBook,
      color: "from-purple-400 to-violet-500",
      bgColor: "from-purple-500/20 to-violet-500/20"
    },
  ];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="flex flex-wrap justify-center gap-4 mb-12"
    >
      {filters.map((filter, index) => (
        <motion.button
          key={filter.key}
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onFilterChange(filter.key)}
          className={`group relative px-6 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 overflow-hidden ${
            activeFilter === filter.key
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
              : 'bg-white/10 backdrop-blur-xl border border-white/20 text-gray-300 hover:bg-white/20 hover:border-white/30'
          }`}
        >
          <span className="relative z-10 flex items-center gap-2">
            <filter.icon className={`w-4 h-4 transition-transform duration-300 ${
              activeFilter === filter.key ? 'scale-110' : 'group-hover:scale-110'
            }`} />
            {filter.label}
          </span>
          
          {/* Active state background */}
          {activeFilter === filter.key && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700"
            />
          )}
          
          {/* Hover effect for inactive buttons */}
          {activeFilter !== filter.key && (
            <div className={`absolute inset-0 bg-gradient-to-r ${filter.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
          )}
        </motion.button>
      ))}
    </motion.div>
  );
}

FilterButtons.propTypes = {
  activeFilter: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired,
};
