import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { logger } from "../utils/logger";
import Button from "./ui/Button";
import { FiAlertTriangle, FiRefreshCw, FiHome } from "react-icons/fi";

const isDevelopment = import.meta.env.MODE === 'development';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    logger.error("React error boundary caught an error", {
      error,
      componentStack: errorInfo.componentStack,
    });
  }

  handleRefresh = () => {
    logger.info("Error boundary: User initiated retry");
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#1a1f2d] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 text-center"
          >
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiAlertTriangle className="w-8 h-8 text-red-500" />
            </div>

            <h1 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-pink-400">
              Oops! Something went wrong
            </h1>

            <p className="text-gray-400 mb-6">
              We apologize for the inconvenience. An unexpected error has occurred.
            </p>

            {isDevelopment && this.state.error && (
              <div className="mb-6 text-left">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
                  <p className="text-red-400 text-sm font-mono">
                    {this.state.error.toString()}
                  </p>
                </div>
                {this.state.errorInfo && (
                  <details className="text-left mt-4">
                    <summary className="text-gray-400 cursor-pointer hover:text-gray-300 mb-2">
                      Stack trace
                    </summary>
                    <pre className="text-xs text-gray-500 bg-gray-900/50 p-4 rounded-lg overflow-auto max-h-64">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="solid"
                color="primary"
                onClick={this.handleRefresh}
                className="flex items-center justify-center gap-2"
              >
                <FiRefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              
              <Button
                variant="outline"
                color="secondary"
                href="/"
                className="flex items-center justify-center gap-2"
              >
                <FiHome className="w-4 h-4" />
                Go Home
              </Button>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              If the problem persists, please contact our support team.
            </p>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

export default ErrorBoundary;
