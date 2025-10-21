import {
  FiHeart,
  FiMapPin,
  FiStar,
  FiInfo,
  FiDollarSign,
} from "react-icons/fi";
import PropTypes from "prop-types";
import { OptimizedImage } from "../common/OptimizedImage";

export default function DestinationHeader({
  destination,
  isFavorite,
  onToggleFavorite,
  onBack,
}) {
  return (
    <>
      <button
        onClick={onBack}
        className="mb-8 text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-lg"
      >
        ← Back to Destinations
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Image Section */}
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
          <OptimizedImage
            src={destination.imageUrl}
            alt={destination.title}
            className="w-full h-full object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute top-4 right-4">
            <button
              onClick={onToggleFavorite}
              className={`p-3 rounded-full transition-colors transform hover:scale-110 ${
                isFavorite
                  ? "bg-red-500/80 hover:bg-red-500 text-white"
                  : "bg-black/50 hover:bg-black/70 text-white"
              }`}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <FiHeart
                className={`w-6 h-6 ${isFavorite ? "fill-current" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">{destination.title}</h1>
            <div className="flex items-center gap-4 text-gray-300">
              <div className="flex items-center gap-2">
                <FiMapPin className="w-5 h-5" />
                <span>{destination.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <FiStar className="w-5 h-5 text-yellow-500" />
                <span>{destination.rating}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <FiInfo className="w-6 h-6 text-purple-400" />
                About this Destination
              </h2>
              <p className="text-gray-300 leading-relaxed">
                {destination.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                <h3 className="text-xl font-semibold mb-3">Category</h3>
                <p className="text-gray-300">{destination.category}</p>
              </div>
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <FiDollarSign className="w-5 h-5 text-green-400" />
                  Price
                </h3>
                <p className="text-2xl font-bold text-purple-400">
                  ${destination.price}
                </p>
                <p className="text-gray-400 text-sm mt-1">per person</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

DestinationHeader.propTypes = {
  destination: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    imageUrl: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    rating: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
  }).isRequired,
  isFavorite: PropTypes.bool.isRequired,
  onToggleFavorite: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};
