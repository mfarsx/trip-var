import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { FaMapMarkerAlt } from "react-icons/fa";

export default function Logo({ size = "default", className = "" }) {
  const sizeClasses = {
    small: "text-lg",
    default: "text-2xl",
    large: "text-3xl",
  };

  return (
    <Link
      to="/"
      className={`flex items-center gap-2 font-bold ${sizeClasses[size]} ${className} group transition-all`}
      aria-label="Go to home page"
    >
      <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 group-hover:from-pink-500 group-hover:to-purple-500 transition-colors">
        <FaMapMarkerAlt className="text-white" />
      </div>
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 group-hover:from-pink-500 group-hover:to-purple-500 font-extrabold tracking-tight transition-colors">
        TripVar
      </span>
    </Link>
  );
}

Logo.propTypes = {
  size: PropTypes.oneOf(["small", "default", "large"]),
  className: PropTypes.string,
};
