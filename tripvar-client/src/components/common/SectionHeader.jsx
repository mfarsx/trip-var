import PropTypes from "prop-types";

export default function SectionHeader({
  badgeText = "Featured Collection",
  title = "Featured Destinations",
  description = "Discover amazing places handpicked by our travel experts. Slide through our collection and start your next adventure today.",
  showStats = true,
}) {
  const stats = [
    { color: "emerald", text: "Real-time availability" },
    { color: "blue", text: "Best price guarantee" },
    { color: "purple", text: "24/7 support" },
  ];

  return (
    <div className="text-center mb-16">
      {/* Section badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 mb-6">
        <svg
          className="w-4 h-4 text-purple-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
        <span className="text-sm font-medium text-purple-300">{badgeText}</span>
      </div>

      <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient tracking-tight">
        {title}
      </h2>
      <p className="text-gray-300 text-xl max-w-3xl mx-auto leading-relaxed font-medium">
        {description}
      </p>

      {/* Quick stats */}
      {showStats && (
        <div className="flex flex-wrap justify-center gap-12 mt-12">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center gap-3 text-gray-200">
              <div
                className={`w-3 h-3 bg-${stat.color}-400 rounded-full animate-pulse shadow-lg shadow-${stat.color}-400/50`}
              ></div>
              <span className="text-base font-semibold">{stat.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

SectionHeader.propTypes = {
  badgeText: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  showStats: PropTypes.bool,
};
