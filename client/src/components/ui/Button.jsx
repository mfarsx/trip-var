import React from "react";
import { Link } from "react-router-dom";
import { commonStyles } from "../../constants/styles";

export const Button = ({
  children,
  to,
  variant = "primary",
  className = "",
  onClick,
  ...props
}) => {
  const buttonClass = `${commonStyles.button[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={buttonClass} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={buttonClass} onClick={onClick} {...props}>
      {children}
    </button>
  );
};
