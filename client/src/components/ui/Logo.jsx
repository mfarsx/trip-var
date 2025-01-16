import React from "react";
import { Link } from "react-router-dom";

export const Logo = () => (
  <div className="flex-shrink-0 flex items-center">
    <Link
      to="/"
      className="text-2xl font-bold text-indigo-600 dark:text-indigo-400"
    >
      TripVar
    </Link>
  </div>
);
