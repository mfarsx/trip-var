import PropTypes from "prop-types";

export default function ErrorState({ error }) {
  return (
    <div className="min-h-screen bg-[#1a1f2d] text-white p-8 flex items-center justify-center">
      <p className="text-red-400">{error}</p>
    </div>
  );
}

ErrorState.propTypes = {
  error: PropTypes.string.isRequired,
};
