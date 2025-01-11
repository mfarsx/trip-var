import React from "react";
import { commonStyles } from "../../constants/styles";

export const Section = ({
  children,
  className = "",
  title,
  subtitle,
  centered = false,
  ...props
}) => {
  return (
    <div
      className={`${commonStyles.section} ${commonStyles.container} ${className}`}
      {...props}
    >
      {(title || subtitle) && (
        <div
          className={`max-w-3xl ${centered ? "mx-auto text-center" : ""} mb-12`}
        >
          {title && <h2 className={commonStyles.heading.h2}>{title}</h2>}
          {subtitle && (
            <p className={`mt-4 text-lg ${commonStyles.text.secondary}`}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};
