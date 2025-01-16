import React from "react";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";

export function DesktopNav({ items }) {
  return (
    <div className="hidden md:ml-6 md:flex md:space-x-4">
      {items.map(({ name, path }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            `inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive
                ? "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/50"
                : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 dark:text-gray-200 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/50"
            }`
          }
        >
          {name}
        </NavLink>
      ))}
    </div>
  );
}

DesktopNav.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
    })
  ).isRequired,
};
