import PropTypes from "prop-types";

export default function LoadingState({ message = "Loading..." }) {
  return (
    <div className="min-h-screen bg-[#1a1f2d] text-white p-8 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-400 mt-4">{message}</p>
      </div>
    </div>
  );
}

LoadingState.propTypes = {
  message: PropTypes.string,
};
