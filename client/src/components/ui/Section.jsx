import PropTypes from 'prop-types';
import React from 'react';

const Section = ({
  children,
  className = '',
  title = '',
  subtitle = '',
  centered = false,
  titleClassName = '',
  subtitleClassName = '',
}) => {
  const containerClasses = `py-16 sm:py-24 ${className}`;
  const contentClasses = centered ? 'text-center' : '';

  return (
    <div className={containerClasses}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className={`mx-auto max-w-2xl lg:max-w-3xl ${contentClasses}`}>
            {title && (
              <h2
                className={`text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl ${titleClassName}`}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={`mt-4 text-xl leading-8 text-gray-600 ${subtitleClassName}`}>
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div className="mt-8 sm:mt-12">{children}</div>
      </div>
    </div>
  );
};

Section.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  centered: PropTypes.bool,
  titleClassName: PropTypes.string,
  subtitleClassName: PropTypes.string,
};

export { Section };
export default Section;
