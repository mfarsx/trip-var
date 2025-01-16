import React from "react";

export const HeroPattern = () => (
  <div className="hero-background">
    <div className="relative h-full max-w-7xl mx-auto">
      <svg
        className="absolute right-full transform translate-y-1/4 translate-x-1/4 lg:translate-x-1/2"
        width="404"
        height="784"
        fill="none"
        viewBox="0 0 404 784"
      >
        <defs>
          <pattern
            id="f210dbf6-a58d-4871-961e-36d5016a0f49"
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <rect
              x="0"
              y="0"
              width="4"
              height="4"
              className="text-gray-200 dark:text-gray-700"
              fill="currentColor"
            />
          </pattern>
        </defs>
        <rect
          width="404"
          height="784"
          fill="url(#f210dbf6-a58d-4871-961e-36d5016a0f49)"
        />
      </svg>
    </div>
  </div>
);
