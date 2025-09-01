import React from 'react';
import { motion } from 'framer-motion';

/**
 * Loading spinner component with different variants
 */
const LoadingSpinner = ({ 
  size = 'md', 
  variant = 'primary', 
  text = '', 
  fullScreen = false,
  className = '' 
}) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const variantClasses = {
    primary: 'text-indigo-600',
    secondary: 'text-gray-600',
    white: 'text-white',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600'
  };

  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  };

  const SpinnerIcon = () => (
    <motion.svg
      className={`${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      variants={spinnerVariants}
      animate="animate"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </motion.svg>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="text-center">
          <SpinnerIcon />
          {text && (
            <p className="mt-4 text-sm text-gray-600 animate-pulse">
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <div className="text-center">
        <SpinnerIcon />
        {text && (
          <p className="mt-2 text-sm text-gray-600 animate-pulse">
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * Skeleton loader component
 */
export const SkeletonLoader = ({ 
  lines = 3, 
  className = '',
  animate = true 
}) => {
  const skeletonVariants = {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <motion.div
          key={index}
          className="h-4 bg-gray-200 rounded"
          style={{ width: `${Math.random() * 40 + 60}%` }}
          variants={animate ? skeletonVariants : {}}
          animate={animate ? 'animate' : {}}
        />
      ))}
    </div>
  );
};

/**
 * Card skeleton loader
 */
export const CardSkeleton = ({ className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
    </div>
  </div>
);

/**
 * Table skeleton loader
 */
export const TableSkeleton = ({ rows = 5, columns = 4, className = '' }) => (
  <div className={`overflow-hidden ${className}`}>
    <div className="animate-pulse">
      {/* Header */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className="h-4 bg-gray-200 rounded"></div>
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-4 gap-4 mb-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="h-3 bg-gray-200 rounded"></div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

/**
 * Button loading state
 */
export const LoadingButton = ({ 
  loading = false, 
  children, 
  loadingText = 'Loading...',
  className = '',
  ...props 
}) => (
  <button
    className={`relative ${className}`}
    disabled={loading}
    {...props}
  >
    {loading && (
      <div className="absolute inset-0 flex items-center justify-center">
        <LoadingSpinner size="sm" variant="white" />
      </div>
    )}
    <span className={loading ? 'opacity-0' : 'opacity-100'}>
      {loading ? loadingText : children}
    </span>
  </button>
);

/**
 * Page loading component
 */
export const PageLoader = ({ text = 'Loading...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <LoadingSpinner size="xl" variant="primary" />
      <p className="mt-4 text-lg text-gray-600">{text}</p>
    </div>
  </div>
);

/**
 * Inline loading component
 */
export const InlineLoader = ({ text = 'Loading...' }) => (
  <div className="flex items-center space-x-2 text-sm text-gray-600">
    <LoadingSpinner size="sm" variant="secondary" />
    <span>{text}</span>
  </div>
);

export default LoadingSpinner;