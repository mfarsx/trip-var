// Theme configuration for the application
export const theme = {
  // Color palette
  colors: {
    primary: {
      light: "text-indigo-400",
      DEFAULT: "text-indigo-600",
      dark: "text-indigo-800",
      bg: {
        light: "bg-indigo-400",
        DEFAULT: "bg-indigo-600",
        dark: "bg-indigo-800",
      },
      border: {
        light: "border-indigo-400",
        DEFAULT: "border-indigo-600",
        dark: "border-indigo-800",
      },
    },
    background: {
      light: "bg-white",
      dark: "dark:bg-gray-800",
      page: {
        light: "bg-gray-50",
        dark: "dark:bg-gray-900",
      },
    },
    text: {
      primary: "text-gray-900 dark:text-white",
      secondary: "text-gray-700 dark:text-gray-300",
      muted: "text-gray-500 dark:text-gray-400",
    },
  },

  // Component specific styles
  components: {
    // Button variants
    button: {
      base: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2",
      primary:
        "text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600",
      secondary:
        "text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-600 dark:text-white",
      danger: "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500",
    },

    // Card variants
    card: {
      base: "bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden",
      header: "px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6",
      body: "px-4 py-5 sm:p-6",
      footer: "px-4 py-4 sm:px-6 bg-gray-50 dark:bg-gray-700",
    },

    // Form elements
    input: {
      base: "block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm",
      error:
        "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500",
      disabled: "bg-gray-100 cursor-not-allowed dark:bg-gray-600",
    },

    // Navigation
    nav: {
      link: {
        base: "inline-flex items-center px-1 pt-1 text-sm font-medium",
        active: "border-indigo-500 text-gray-900 dark:text-white border-b-2",
        inactive:
          "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white border-b-2",
      },
      mobileLlink: {
        base: "block pl-3 pr-4 py-2 border-l-4 text-base font-medium",
        active:
          "bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-gray-700 dark:text-white",
        inactive:
          "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
      },
    },

    // Layout
    layout: {
      container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
      section: "py-8",
    },
  },

  // Animation variants
  animation: {
    spin: "animate-spin",
    pulse: "animate-pulse",
    bounce: "animate-bounce",
  },
};
