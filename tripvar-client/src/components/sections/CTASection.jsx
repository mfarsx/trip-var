import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiCalendar, FiMapPin } from "react-icons/fi";

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gradient-to-r from-purple-900/90 to-indigo-900/90 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Join thousands of travelers who trust TripVar for their booking needs. 
            Start exploring destinations and book your next adventure today!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/destinations")}
              className="bg-white text-purple-900 px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-2 hover:bg-gray-100 transition-colors shadow-lg"
            >
              <FiMapPin className="w-5 h-5" />
              Explore Destinations
              <FiArrowRight className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/bookings")}
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-2 hover:bg-white hover:text-purple-900 transition-colors"
            >
              <FiCalendar className="w-5 h-5" />
              View My Bookings
            </motion.button>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="text-white">
              <div className="text-3xl font-bold text-purple-300 mb-2">1000+</div>
              <div className="text-gray-300">Happy Travelers</div>
            </div>
            <div className="text-white">
              <div className="text-3xl font-bold text-purple-300 mb-2">50+</div>
              <div className="text-gray-300">Destinations</div>
            </div>
            <div className="text-white">
              <div className="text-3xl font-bold text-purple-300 mb-2">24/7</div>
              <div className="text-gray-300">Customer Support</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}