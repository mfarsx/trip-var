import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { commonStyles } from '../../constants/styles';

export const Card = ({ children, className = '', hover = true, ...props }) => {
  const cardClass = `
    ${commonStyles.card.base}
    ${hover ? commonStyles.card.hover : ''}
    ${className}
  `;

  return (
    <div className={cardClass} {...props}>
      {children}
    </div>
  );
};

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={classNames(commonStyles.card.header, className)} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ children, className, ...props }) {
  return (
    <div className={classNames(commonStyles.card.body, className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div className={classNames(commonStyles.card.footer, className)} {...props}>
      {children}
    </div>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  hover: PropTypes.bool,
};

CardHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

CardBody.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

CardFooter.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Card;
