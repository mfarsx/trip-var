import PropTypes from 'prop-types';
import React from 'react';

import { FormInput } from '../forms/FormInput';
import { Alert } from '../profile/Alert';

export function SignupForm({ formData = {}, onChange, onSubmit, errors = {}, loading }) {
  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
        {errors.form && <Alert type="error" message={errors.form} />}

        <form onSubmit={onSubmit} className="space-y-6">
          <FormInput
            label="Full Name"
            type="text"
            id="full_name-input"
            name="full_name"
            value={formData.full_name || ''}
            onChange={onChange}
            error={errors.full_name}
            required
            autoComplete="name"
          />

          <FormInput
            label="Email Address"
            type="email"
            id="email-input"
            name="email"
            value={formData.email || ''}
            onChange={onChange}
            error={errors.email}
            required
            autoComplete="email"
          />

          <FormInput
            label="Password"
            type="password"
            id="password-input"
            name="password"
            value={formData.password || ''}
            onChange={onChange}
            error={errors.password}
            required
            autoComplete="new-password"
          />

          <FormInput
            label="Confirm Password"
            type="password"
            id="confirm-password-input"
            name="confirmPassword"
            value={formData.confirmPassword || ''}
            onChange={onChange}
            error={errors.confirmPassword}
            required
            autoComplete="new-password"
          />

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

SignupForm.propTypes = {
  formData: PropTypes.shape({
    full_name: PropTypes.string,
    email: PropTypes.string,
    password: PropTypes.string,
    confirmPassword: PropTypes.string,
  }),
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    form: PropTypes.string,
    full_name: PropTypes.string,
    email: PropTypes.string,
    password: PropTypes.string,
    confirmPassword: PropTypes.string,
  }),
  loading: PropTypes.bool.isRequired,
};

export default SignupForm;
