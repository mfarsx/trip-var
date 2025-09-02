import PropTypes from "prop-types";

export default function LoadingSkeleton({ itemsPerView = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(itemsPerView)].map((_, index) => (
        <div
          key={index}
          className="bg-gray-800/50 rounded-2xl overflow-hidden animate-pulse"
        >
          <div className="h-56 bg-gray-700"></div>
          <div className="p-5 space-y-3">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            <div className="h-3 bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-gray-700 rounded w-2/3"></div>
            <div className="flex justify-between items-center pt-2">
              <div className="h-6 bg-gray-700 rounded w-16"></div>
              <div className="h-4 bg-gray-700 rounded w-12"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

LoadingSkeleton.propTypes = {
  itemsPerView: PropTypes.number,
};
