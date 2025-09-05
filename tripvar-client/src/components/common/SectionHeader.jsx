import { motion } from "framer-motion";
import { FiStar, FiShield, FiZap, FiGlobe } from "react-icons/fi";
import PropTypes from "prop-types";

export default function SectionHeader({
  badgeText = "Featured Collection",
  title = "Featured Destinations",
  description = "Discover amazing places handpicked by our travel experts. Slide through our collection and start your next adventure today.",
  showStats = true,
}) {
  const stats = [
    { 
      icon: FiZap, 
      color: "from-emerald-400 to-green-400", 
      text: "Real-time availability",
      bgColor: "from-emerald-500/20 to-green-500/20"
    },
    { 
      icon: FiShield, 
      color: "from-blue-400 to-cyan-400", 
      text: "Best price guarantee",
      bgColor: "from-blue-500/20 to-cyan-500/20"
    },
    { 
      icon: FiGlobe, 
      color: "from-purple-400 to-violet-400", 
      text: "24/7 support",
      bgColor: "from-purple-500/20 to-violet-500/20"
    },
  ];

  return (
    <div className="text-center mb-20 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-400/10 rounded-full"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0, 0.3, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Section badge */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 mb-8 shadow-lg"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <FiStar className="w-5 h-5 text-yellow-400" />
        </motion.div>
        <span className="text-sm font-semibold text-white/90">{badgeText}</span>
      </motion.div>

      {/* Main title */}
      <motion.h2
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true }}
        className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8"
      >
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-pink-200">
          {title.split(' ').slice(0, -1).join(' ')}
        </span>
        <br />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-300 to-yellow-300">
          {title.split(' ').slice(-1)}
        </span>
      </motion.h2>

      {/* Description */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        viewport={{ once: true }}
        className="text-gray-300 text-xl sm:text-2xl max-w-4xl mx-auto leading-relaxed font-medium"
      >
        {description}
      </motion.p>

      {/* Enhanced stats */}
      {showStats && (
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-8 mt-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group relative p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-500"
            >
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </motion.div>
                <span className="text-white font-semibold text-lg group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                  {stat.text}
                </span>
              </div>
              
              {/* Hover effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

SectionHeader.propTypes = {
  badgeText: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  showStats: PropTypes.bool,
};
