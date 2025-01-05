import { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <h2 className="text-red-700 dark:text-red-400">
            Something went wrong
          </h2>
          <pre className="text-sm">{this.state.error?.message}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}
