import { motion } from "framer-motion";
import PropTypes from "prop-types";

export default function ComparisonPanel({
  selectedDestinations,
  onCompare,
  onClear,
}) {
  if (selectedDestinations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
    >
      <div className="bg-gray-800/95 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {selectedDestinations.length}
              </span>
            </div>
            <span className="text-white font-medium">
              {selectedDestinations.length} destination
              {selectedDestinations.length > 1 ? "s" : ""} selected
            </span>
          </div>
          <button
            onClick={onCompare}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
          >
            Compare Now
          </button>
          <button
            onClick={onClear}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Clear selection"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

ComparisonPanel.propTypes = {
  selectedDestinations: PropTypes.arrayOf(PropTypes.string).isRequired,
  onCompare: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
};
