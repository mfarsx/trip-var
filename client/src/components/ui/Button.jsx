import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';

const Button = ({
  children,
  to = null,
  variant = 'primary',
  className = '',
  onClick = null,
  disabled = false,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClasses = {
    primary:
      'bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500 shadow-lg hover:shadow-xl',
    secondary:
      'bg-slate-800 text-white hover:bg-slate-700 focus:ring-slate-500 shadow-lg hover:shadow-xl',
    outline:
      'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 focus:ring-slate-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={buttonClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  to: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'danger']),
  className: PropTypes.string,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
};

export { Button };
export default Button;
