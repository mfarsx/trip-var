import PropTypes from "prop-types";

export default function EmptyState({
  title = "No destinations found",
  message = "Try adjusting your search criteria or explore our destinations.",
  buttonText = "View All Destinations",
  onButtonClick,
}) {
  return (
    <div className="text-center py-12">
      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
        <svg
          className="w-12 h-12 text-purple-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-300 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6">{message}</p>
      <button onClick={onButtonClick} className="btn btn-primary">
        {buttonText}
      </button>
    </div>
  );
}

EmptyState.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  buttonText: PropTypes.string,
  onButtonClick: PropTypes.func.isRequired,
};
