import { motion } from "framer-motion";
import { FiSearch, FiCalendar, FiCreditCard, FiShield, FiUsers, FiStar } from "react-icons/fi";

const features = [
  {
    icon: FiSearch,
    title: "Smart Search",
    description: "Find your perfect destination with our intelligent search and filtering system.",
    color: "text-blue-400"
  },
  {
    icon: FiCalendar,
    title: "Real-time Availability",
    description: "Check availability instantly and book your preferred dates without any hassle.",
    color: "text-green-400"
  },
  {
    icon: FiCreditCard,
    title: "Secure Booking",
    description: "Book with confidence using our secure payment system and instant confirmations.",
    color: "text-purple-400"
  },
  {
    icon: FiShield,
    title: "Safe & Secure",
    description: "Your data and payments are protected with enterprise-grade security.",
    color: "text-red-400"
  },
  {
    icon: FiUsers,
    title: "Group Bookings",
    description: "Easily manage bookings for multiple guests with our group booking features.",
    color: "text-yellow-400"
  },
  {
    icon: FiStar,
    title: "Premium Destinations",
    description: "Access to curated, high-quality destinations with verified reviews and ratings.",
    color: "text-pink-400"
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Why Choose TripVar?
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Experience the future of travel booking with our comprehensive platform designed for modern travelers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:transform hover:scale-105"
            >
              <div className={`w-12 h-12 rounded-lg bg-gray-700/50 flex items-center justify-center mb-4 ${feature.color}`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}