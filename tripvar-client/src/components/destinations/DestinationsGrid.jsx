import { motion } from "framer-motion";
import { FiHeart, FiStar, FiMapPin } from "react-icons/fi";
import PropTypes from "prop-types";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  hover: { scale: 1.02, transition: { type: "spring", stiffness: 300 } }
};

export default function DestinationsGrid({ destinations, onDestinationClick }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-4">
      {destinations.map((destination, index) => (
        <motion.div
          key={destination._id}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          whileHover="hover"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ delay: index * 0.1 }}
          className="group relative bg-gray-800/50 rounded-xl overflow-hidden shadow-lg cursor-pointer"
          onClick={() => onDestinationClick(destination._id)}
        >
          <div className="relative h-48 w-full">
            <img
              src={destination.imageUrl}
              alt={destination.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = `https://source.unsplash.com/random/400x300?${destination.title}`;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <button className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors transform hover:scale-110">
              <FiHeart className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 left-3 right-3">
              <h3 className="text-lg font-semibold text-white line-clamp-1">
                {destination.title}
              </h3>
              <div className="flex items-center gap-1 text-gray-300 mt-1">
                <FiMapPin className="w-4 h-4" />
                <span className="text-sm line-clamp-1">
                  {destination.location}
                </span>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-2">
            <div className="flex items-center gap-1 text-gray-300">
              <FiStar className="w-4 h-4 text-yellow-500" />
              <span>{destination.rating}</span>
              <span className="text-gray-500 text-sm">
                ({destination.reviews} reviews)
              </span>
            </div>
            <p className="text-gray-400 line-clamp-2 text-sm">
              {destination.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-purple-400 font-semibold">
                ${destination.price}
              </span>
              <span className="text-gray-500 text-sm">per person</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

DestinationsGrid.propTypes = {
  destinations: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      imageUrl: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      location: PropTypes.string.isRequired,
      rating: PropTypes.number.isRequired,
      reviews: PropTypes.number.isRequired,
      description: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
    })
  ).isRequired,
  onDestinationClick: PropTypes.func.isRequired,
};
