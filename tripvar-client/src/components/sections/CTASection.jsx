import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiCalendar, FiMapPin, FiUsers, FiGlobe, FiHeadphones, FiStar } from "react-icons/fi";

export default function CTASection() {
  const navigate = useNavigate();

  const stats = [
    { icon: FiUsers, value: "10,000+", label: "Happy Travelers", color: "from-blue-400 to-cyan-400" },
    { icon: FiGlobe, value: "50+", label: "Destinations", color: "from-green-400 to-emerald-400" },
    { icon: FiHeadphones, value: "24/7", label: "Customer Support", color: "from-purple-400 to-violet-400" },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/95 via-indigo-900/90 to-pink-900/95" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-8"
          >
            <FiStar className="w-4 h-4 text-yellow-400" />
            <span>Join thousands of satisfied travelers</span>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-pink-200">
                Ready to Start
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-300 to-yellow-300">
                Your Journey?
              </span>
            </h2>
            
            <p className="text-xl sm:text-2xl text-gray-200 mb-12 max-w-4xl mx-auto leading-relaxed">
              Join thousands of travelers who trust TripVar for their booking needs. 
              Start exploring destinations and book your next adventure today with our 
              cutting-edge platform designed for modern explorers.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <motion.button
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/destinations")}
                className="group relative px-10 py-5 bg-white text-purple-900 font-bold text-xl rounded-2xl shadow-2xl hover:shadow-white/25 transition-all duration-300 overflow-hidden flex items-center gap-3"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <FiMapPin className="w-6 h-6" />
                  Explore Destinations
                  <FiArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/bookings")}
                className="group px-10 py-5 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white font-bold text-xl rounded-2xl hover:bg-white/20 hover:border-white/50 transition-all duration-300 flex items-center gap-3"
              >
                <FiCalendar className="w-6 h-6" />
                View My Bookings
              </motion.button>
            </div>
          </motion.div>
          
          {/* Stats */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group relative p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 hover:border-white/20 transition-all duration-500"
              >
                <div className="text-center">
                  <motion.div
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}
                  >
                    <stat.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  
                  <div className="text-4xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                    {stat.value}
                  </div>
                  <div className="text-gray-300 text-lg font-medium">
                    {stat.label}
                  </div>
                </div>
                
                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom message */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-gray-300 text-lg">
              Trusted by travelers worldwide • Secure booking • 24/7 support
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}