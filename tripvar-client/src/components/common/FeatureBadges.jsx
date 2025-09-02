export default function FeatureBadges() {
  const features = [
    { icon: "green", text: "Free cancellation" },
    { icon: "blue", text: "Best price guarantee" },
    { icon: "purple", text: "24/7 customer support" },
  ];

  const getIconPath = (color) => {
    const paths = {
      green: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      blue: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1",
      purple:
        "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z",
    };
    return paths[color];
  };

  const getIconColor = (color) => {
    const colors = {
      green: "text-green-400",
      blue: "text-blue-400",
      purple: "text-purple-400",
    };
    return colors[color];
  };

  return (
    <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-400">
      {features.map((feature, index) => (
        <div key={index} className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 ${getIconColor(feature.icon)}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={getIconPath(feature.icon)}
            />
          </svg>
          <span>{feature.text}</span>
        </div>
      ))}
    </div>
  );
}
