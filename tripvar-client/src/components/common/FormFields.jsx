import PropTypes from 'prop-types';
import { FiCalendar, FiUsers, FiDollarSign } from 'react-icons/fi';

export const FormField = ({ 
  label, 
  icon: Icon, 
  error, 
  children, 
  required = false,
  className = ""
}) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <label className="text-gray-300 mb-2 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
          <span className="w-1 h-1 bg-red-400 rounded-full"></span>
          {error}
        </p>
      )}
    </div>
  );
};

FormField.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType,
  error: PropTypes.string,
  children: PropTypes.node.isRequired,
  required: PropTypes.bool,
  className: PropTypes.string
};

export const DateField = ({ 
  id, 
  label, 
  value, 
  onChange, 
  error, 
  min, 
  onKeyDown,
  required = true 
}) => {
  return (
    <FormField label={label} icon={FiCalendar} error={error} required={required}>
      <input
        type="date"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        className={`bg-gray-700/50 p-3 rounded-lg border transition-all duration-200 ${
          error 
            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
            : 'border-gray-600/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
        }`}
        min={min}
        aria-describedby={error ? `${id}-error` : undefined}
      />
    </FormField>
  );
};

DateField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  min: PropTypes.string,
  onKeyDown: PropTypes.func,
  required: PropTypes.bool
};

export const NumberField = ({ 
  id, 
  label, 
  value, 
  onChange, 
  error, 
  min, 
  max,
  required = true 
}) => {
  return (
    <FormField label={label} icon={FiUsers} error={error} required={required}>
      <input
        type="number"
        id={id}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`bg-gray-700/50 p-3 rounded-lg border transition-all duration-200 ${
          error 
            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
            : 'border-gray-600/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
        }`}
      />
    </FormField>
  );
};

NumberField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
  required: PropTypes.bool
};

export const SelectField = ({ 
  id, 
  label, 
  value, 
  onChange, 
  options, 
  error,
  required = true 
}) => {
  return (
    <FormField label={label} icon={FiDollarSign} error={error} required={required}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-gray-700/50 p-3 rounded-lg border border-gray-600/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
};

SelectField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
  })).isRequired,
  error: PropTypes.string,
  required: PropTypes.bool
};

export const CheckboxField = ({ 
  id, 
  label, 
  checked, 
  onChange, 
  error,
  required = true 
}) => {
  return (
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={`mt-1 w-4 h-4 rounded border-2 transition-colors ${
          error 
            ? 'border-red-500 focus:border-red-500' 
            : 'border-gray-600 focus:border-purple-500'
        }`}
      />
      <div className="flex-1">
        <FormField label={label} error={error} required={required}>
          <div></div> {/* Empty div since label is handled above */}
        </FormField>
      </div>
    </div>
  );
};

CheckboxField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  required: PropTypes.bool
};
