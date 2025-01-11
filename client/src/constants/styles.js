export const commonStyles = {
  container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  section: "py-16 lg:py-24",
  heading: {
    h1: "text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl",
    h2: "text-3xl font-extrabold text-gray-900 dark:text-white",
    h3: "text-lg font-medium text-gray-900 dark:text-white",
  },
  text: {
    primary: "text-gray-900 dark:text-white",
    secondary: "text-gray-500 dark:text-gray-400",
    accent: "text-indigo-600 dark:text-indigo-400",
  },
  button: {
    primary:
      "w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 transform transition-all hover:scale-105",
    secondary:
      "w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-indigo-400 md:py-4 md:text-lg md:px-10 transform transition-all hover:scale-105",
  },
  card: {
    base: "bg-white dark:bg-gray-800 rounded-2xl shadow-lg",
    hover: "hover:shadow-xl transition-shadow duration-300",
  },
  grid: {
    base: "grid gap-5",
    cols2: "grid-cols-1 sm:grid-cols-2",
    cols4: "grid-cols-2 sm:grid-cols-4",
  },
};
