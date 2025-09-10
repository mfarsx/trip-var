import { motion } from "framer-motion";
import { useMemo } from "react";
import PropTypes from "prop-types";

/**
 * BackgroundEffects - Reusable component for animated background effects
 *
 * Features:
 * - Animated gradient background
 * - Floating particle animations
 * - Configurable particle count and animation properties
 * - Performance optimized with memoization
 */
const BackgroundEffects = ({
  particleCount = 30,
  gradientColors = "from-purple-900/20 via-indigo-900/10 to-pink-900/20",
  particleColor = "bg-purple-400/10",
}) => {
  // Memoize particle data to prevent recreation on every render
  const particles = useMemo(
    () =>
      Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 6 + Math.random() * 4,
        delay: Math.random() * 5,
      })),
    [particleCount]
  );

  return (
    <div className="fixed inset-0 -z-10">
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientColors}`} />

      {/* Animated particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className={`absolute w-1 h-1 ${particleColor} rounded-full`}
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0, 0.5, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
            }}
          />
        ))}
      </div>
    </div>
  );
};

BackgroundEffects.propTypes = {
  particleCount: PropTypes.number,
  gradientColors: PropTypes.string,
  particleColor: PropTypes.string,
};

export default BackgroundEffects;
