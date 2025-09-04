import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { FiAlertCircle } from "react-icons/fi";

export default function ErrorState({ error }) {
  return (
    <div className="min-h-screen bg-[#1a1f2d] text-white p-8 flex items-center justify-center">
      <motion.div 
        className="text-center max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiAlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
        <p className="text-red-400 text-lg">{error}</p>
      </motion.div>
    </div>
  );
}

ErrorState.propTypes = {
  error: PropTypes.string.isRequired,
};
