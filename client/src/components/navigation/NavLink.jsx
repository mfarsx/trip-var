import React from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";

export const NavLink = ({ to, icon, children, isMobile = false }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  if (isMobile) {
    return (
      <Link
        to={to}
        className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
          isActive
            ? "border-indigo-500 text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/50"
            : "border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
        }`}
      >
        <span className="mr-2">{icon}</span>
        {children}
      </Link>
    );
  }

  return (
    <Link
      to={to}
      className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
        isActive
          ? "border-indigo-500 text-gray-900 dark:text-white"
          : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
      }`}
    >
      <span className="mr-2">{icon}</span>
      {children}
    </Link>
  );
};

NavLink.propTypes = {
  to: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  isMobile: PropTypes.bool,
};
