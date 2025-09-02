import PropTypes from "prop-types";

export default function FilterButtons({ activeFilter, onFilterChange }) {
  const filters = [
    { key: "all", label: "All Destinations" },
    { key: "popular", label: "Popular" },
    { key: "adventure", label: "Adventure" },
    { key: "relaxation", label: "Relaxation" },
    { key: "culture", label: "Culture" },
  ];

  const getButtonClasses = (filterKey) => {
    const baseClasses =
      "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105";
    const activeClasses =
      "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
    const inactiveClasses =
      "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50";

    return `${baseClasses} ${
      activeFilter === filterKey ? activeClasses : inactiveClasses
    }`;
  };

  return (
    <div className="flex flex-wrap justify-center gap-3 mb-8">
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onFilterChange(filter.key)}
          className={getButtonClasses(filter.key)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

FilterButtons.propTypes = {
  activeFilter: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired,
};
