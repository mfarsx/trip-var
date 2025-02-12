import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const baseStyles = {
  solid:
    'inline-flex items-center justify-center rounded-xl py-2 px-4 text-sm font-medium transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2',
  outline:
    'inline-flex items-center justify-center rounded-xl border py-2 px-4 text-sm font-medium transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2',
  ghost:
    'inline-flex items-center justify-center rounded-xl py-2 px-4 text-sm font-medium transition-all duration-300 hover:bg-gray-800/50 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2',
  link:
    'inline-flex items-center justify-center py-2 px-4 text-sm font-medium transition-colors duration-300 hover:text-purple-400 focus:outline-none',
  secondary:
    'inline-flex items-center justify-center rounded-xl py-2 px-4 text-sm font-medium transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2',
};

const variantStyles = {
  solid: {
    primary:
      'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 focus-visible:outline-purple-500',
    secondary:
      'bg-gray-800/50 text-gray-200 hover:bg-gray-800 border border-gray-700 focus-visible:outline-gray-700',
    success:
      'bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600 focus-visible:outline-emerald-500',
    danger:
      'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 focus-visible:outline-red-500',
    white:
      'bg-white text-gray-900 hover:bg-gray-100 focus-visible:outline-white',
  },
  outline: {
    primary:
      'border-purple-500 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 focus-visible:outline-purple-500',
    secondary:
      'border-gray-700 text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 focus-visible:outline-gray-700',
    success:
      'border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 focus-visible:outline-emerald-500',
    danger:
      'border-red-500 text-red-400 hover:bg-red-500/10 hover:text-red-300 focus-visible:outline-red-500',
    white:
      'border-white text-white hover:bg-white/10 focus-visible:outline-white',
  },
  ghost: {
    primary:
      'text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 focus-visible:outline-purple-500',
    secondary:
      'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 focus-visible:outline-gray-700',
    success:
      'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 focus-visible:outline-emerald-500',
    danger:
      'text-red-400 hover:text-red-300 hover:bg-red-500/10 focus-visible:outline-red-500',
    white:
      'text-white hover:bg-white/10 focus-visible:outline-white',
  },
  link: {
    primary:
      'text-purple-400 hover:text-purple-300 focus-visible:outline-purple-500',
    secondary:
      'text-gray-400 hover:text-gray-200 focus-visible:outline-gray-700',
    success:
      'text-emerald-400 hover:text-emerald-300 focus-visible:outline-emerald-500',
    danger:
      'text-red-400 hover:text-red-300 focus-visible:outline-red-500',
    white:
      'text-white hover:text-gray-100 focus-visible:outline-white',
  },
  secondary: {
    primary: 'bg-gray-800/50 text-gray-200 hover:bg-gray-800 border border-gray-700 focus-visible:outline-gray-700',
    secondary: 'bg-gray-800/50 text-gray-200 hover:bg-gray-800 border border-gray-700 focus-visible:outline-gray-700',
    success: 'bg-gray-800/50 text-emerald-400 hover:bg-gray-800 border border-gray-700 focus-visible:outline-gray-700',
    danger: 'bg-gray-800/50 text-red-400 hover:bg-gray-800 border border-gray-700 focus-visible:outline-gray-700',
    white: 'bg-gray-800/50 text-white hover:bg-gray-800 border border-gray-700 focus-visible:outline-gray-700',
  },
};

const Button = forwardRef(function Button(
  { variant = 'solid', color = 'primary', className = '', href, disabled, as: Component = 'button', ...props },
  ref
) {
  const safeVariant = baseStyles[variant] ? variant : 'solid';
  const safeColor = variantStyles[safeVariant][color] ? color : 'primary';
  
  const baseClassName = `${baseStyles[safeVariant]} ${variantStyles[safeVariant][safeColor]}`;
  const disabledClassName = disabled ? 'opacity-50 cursor-not-allowed' : '';
  className = `${baseClassName} ${disabledClassName} ${className}`;

  const buttonProps = {
    ref,
    className,
    disabled,
    ...props,
  };

  if (href) {
    return <Link to={href} {...buttonProps} />;
  }

  if (Component === Link) {
    return <Link {...buttonProps} />;
  }

  return <Component {...buttonProps} />;
});

Button.propTypes = {
  variant: PropTypes.oneOf(['solid', 'outline', 'ghost', 'link', 'secondary']),
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'white']),
  className: PropTypes.string,
  href: PropTypes.string,
  disabled: PropTypes.bool,
  as: PropTypes.elementType,
  children: PropTypes.node.isRequired,
};

Button.displayName = 'Button';

export default Button;
