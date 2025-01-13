import React from "react";
import PropTypes from "prop-types";
import { FormError } from "./FormError";

export const FormInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  clearError,
  required = false,
  disabled = false,
  placeholder,
  className = "",
  ...props
}) => {
  const handleChange = (e) => {
    if (clearError) clearError(name);
    onChange(e);
  };

  const showError = error?.type === "validation" && error.field === name;
  const inputClassName = `
    appearance-none relative block w-full px-3 py-2 border
    ${
      showError
        ? "border-red-300 dark:border-red-600"
        : "border-gray-300 dark:border-gray-600"
    }
    placeholder-gray-500 dark:placeholder-gray-400 
    text-gray-900 dark:text-white 
    rounded-md focus:outline-none focus:ring-2 
    focus:ring-indigo-500 focus:border-indigo-500 
    sm:text-sm dark:bg-gray-700 
    transition-all duration-200
    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
    ${className}
  `;

  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        className={inputClassName}
        {...props}
      />
      {showError && <FormError error={error} className="mt-1" />}
    </div>
  );
};

FormInput.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  error: PropTypes.object,
  clearError: PropTypes.func,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  className: PropTypes.string,
};

export default FormInput;
