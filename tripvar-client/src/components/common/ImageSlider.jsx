import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PropTypes from "prop-types";

// Constants
const SLIDE_INTERVAL = 5000;
const TRANSITION_DURATION = 1;

/**
 * ImageSlider - Reusable animated image slider component
 *
 * Features:
 * - Automatic slideshow with configurable interval
 * - Smooth transitions with framer-motion
 * - Overlay content support
 * - Responsive design
 * - Performance optimized
 */
const ImageSlider = ({
  images,
  title,
  subtitle,
  className = "hidden lg:flex lg:w-1/2 relative overflow-hidden",
  overlayClassName = "absolute inset-0 bg-gradient-to-r from-purple-900/50 to-indigo-900/50",
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, SLIDE_INTERVAL);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className={className}>
      {images.map((img, index) => (
        <motion.div
          key={img}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: index === currentImageIndex ? 1 : 0 }}
          transition={{ duration: TRANSITION_DURATION }}
        >
          <div className={overlayClassName} />
          <img src={img} alt="Travel" className="object-cover w-full h-full" />
        </motion.div>
      ))}

      {(title || subtitle) && (
        <div className="absolute inset-0 flex items-center justify-center text-white z-10">
          <div className="max-w-md text-center px-8">
            {title && (
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-pink-100"
              >
                {title}
              </motion.h1>
            )}
            {subtitle && (
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl text-gray-200"
              >
                {subtitle}
              </motion.p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

ImageSlider.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  className: PropTypes.string,
  overlayClassName: PropTypes.string,
};

export default ImageSlider;
