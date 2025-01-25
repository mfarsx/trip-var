import { forwardRef } from 'react'
import { Link } from 'react-router-dom'

const baseStyles = {
  solid:
    'inline-flex items-center justify-center rounded-md py-2 px-4 text-sm font-semibold focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2',
  outline:
    'inline-flex items-center justify-center rounded-md border py-2 px-4 text-sm font-semibold focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2',
}

const variantStyles = {
  solid: {
    primary:
      'bg-primary-600 text-white hover:bg-primary-500 active:bg-primary-700 focus-visible:outline-primary-600',
    white:
      'bg-white text-primary-600 hover:text-primary-700 active:bg-primary-50 active:text-primary-800 focus-visible:outline-white',
  },
  outline: {
    primary:
      'border-primary-600 text-primary-600 hover:border-primary-500 hover:text-primary-500 active:border-primary-700 active:text-primary-700 focus-visible:outline-primary-600',
    white:
      'border-white text-white hover:border-primary-300 hover:text-primary-300 active:border-primary-400 active:text-primary-400 focus-visible:outline-white',
  },
}

const Button = forwardRef(function Button(
  { variant = 'solid', color = 'primary', className = '', href, ...props },
  ref
) {
  className = `${baseStyles[variant]} ${variantStyles[variant][color]} ${className}`

  return href ? (
    <Link ref={ref} to={href} className={className} {...props} />
  ) : (
    <button ref={ref} className={className} {...props} />
  )
})

export default Button
