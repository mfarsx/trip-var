import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const PageTransition = ({ children, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to ensure smooth transition
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 30);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className={`page-container ${className}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ 
        opacity: isVisible ? 1 : 0, 
        y: isVisible ? 0 : 8 
      }}
      transition={{ 
        duration: 0.15, 
        ease: [0.4, 0.0, 0.2, 1] // Custom easing for smoother feel
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;