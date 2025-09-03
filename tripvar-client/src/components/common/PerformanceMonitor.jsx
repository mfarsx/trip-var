import { useEffect, useRef } from "react";
import PropTypes from "prop-types";

/**
 * Performance Monitor Component
 * Tracks and logs performance metrics for the DestinationsSection
 * Only active in development mode
 */
const PerformanceMonitor = ({ componentName, children }) => {
  const startTime = useRef(null);
  const renderCount = useRef(0);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      startTime.current = performance.now();
      renderCount.current += 1;

      // Log performance metrics
      const endTime = performance.now();
      const renderTime = endTime - startTime.current;

      console.log(`🚀 ${componentName} Performance:`, {
        renderCount: renderCount.current,
        renderTime: `${renderTime.toFixed(2)}ms`,
        timestamp: new Date().toISOString(),
      });

      // Warn if render time is too high
      if (renderTime > 16) {
        // 60fps threshold
        console.warn(
          `⚠️ ${componentName} slow render: ${renderTime.toFixed(2)}ms`
        );
      }
    }
  });

  return children;
};

PerformanceMonitor.propTypes = {
  componentName: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default PerformanceMonitor;
