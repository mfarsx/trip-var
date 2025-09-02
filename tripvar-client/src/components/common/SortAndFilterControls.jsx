import { useState } from "react";
import PropTypes from "prop-types";

export default function SortAndFilterControls({
  sortBy,
  onSortChange,
  showFilters,
  onToggleFilters,
  resultsCount,
}) {
  const [priceRange, setPriceRange] = useState([0, 10000]);

  const quickPriceFilters = [
    { label: "Under $500", range: [0, 500] },
    { label: "$500 - $1000", range: [500, 1000] },
    { label: "$1000 - $2000", range: [1000, 2000] },
    { label: "$2000+", range: [2000, 10000] },
  ];

  return (
    <>
      {/* Sort and Filter Controls */}
      <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="appearance-none bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-2 text-gray-300 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
          >
            <option value="featured">Sort by: Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="popularity">Most Popular</option>
          </select>
          <svg
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={onToggleFilters}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-700/50 transition-all duration-300 border border-gray-700/50"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"
            />
          </svg>
          Advanced Filters
        </button>

        {/* Results Count */}
        <div className="text-gray-400 text-sm">
          {resultsCount} destinations found
          <span className="ml-2 text-purple-400">(Slide to explore)</span>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="mb-8 p-6 bg-gray-800/30 rounded-2xl border border-gray-700/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price Range */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-3">
                Price Range: ${priceRange[0]} - ${priceRange[1]}
              </label>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], parseInt(e.target.value)])
                  }
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={priceRange[0]}
                  onChange={(e) =>
                    setPriceRange([parseInt(e.target.value), priceRange[1]])
                  }
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider absolute top-0"
                />
              </div>
            </div>

            {/* Quick Price Buttons */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-3">
                Quick Price Filters
              </label>
              <div className="flex flex-wrap gap-2">
                {quickPriceFilters.map((filter, index) => (
                  <button
                    key={index}
                    onClick={() => setPriceRange(filter.range)}
                    className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-lg text-xs hover:bg-gray-600/50 transition-colors"
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

SortAndFilterControls.propTypes = {
  sortBy: PropTypes.string.isRequired,
  onSortChange: PropTypes.func.isRequired,
  showFilters: PropTypes.bool.isRequired,
  onToggleFilters: PropTypes.func.isRequired,
  resultsCount: PropTypes.number.isRequired,
};
