import PropTypes from "prop-types";
import { motion } from "framer-motion";

export default function LoadingState({ message = "Loading..." }) {
  return (
    <div className="min-h-screen bg-[#1a1f2d] text-white p-8 flex items-center justify-center">
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-12 h-12 border-3 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400 text-lg font-medium">{message}</p>
      </motion.div>
    </div>
  );
}

LoadingState.propTypes = {
  message: PropTypes.string,
};
