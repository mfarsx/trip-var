import React from "react";
import PropTypes from "prop-types";

/**
 * Error Boundary specifically for DestinationsSection
 * Provides graceful error handling and recovery options
 */
class DestinationsErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("DestinationsSection Error:", error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });

    // Here you could also log the error to an error reporting service
    // Example: logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <section
          id="destinations-section"
          className="py-20 px-4 relative overflow-hidden"
          aria-label="Destinations section"
          role="region"
        >
          <div className="max-w-7xl mx-auto relative">
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-gray-300 mb-4">
                Oops! Something went wrong
              </h2>

              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                We encountered an error while loading the destinations. Please
                try again or contact support if the problem persists.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={this.handleRetry}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
                >
                  Try Again
                </button>

                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-gray-800/50 text-gray-300 rounded-xl font-medium hover:bg-gray-800 transition-all duration-300 border border-gray-700"
                >
                  Refresh Page
                </button>
              </div>

              {/* Development error details */}
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mt-8 text-left max-w-4xl mx-auto">
                  <summary className="cursor-pointer text-gray-400 hover:text-gray-300 mb-4">
                    Error Details (Development Only)
                  </summary>
                  <div className="bg-gray-900/50 rounded-lg p-4 text-sm">
                    <pre className="text-red-400 whitespace-pre-wrap">
                      {this.state.error && this.state.error.toString()}
                    </pre>
                    <pre className="text-gray-400 whitespace-pre-wrap mt-4">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                </details>
              )}
            </div>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}

DestinationsErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DestinationsErrorBoundary;
