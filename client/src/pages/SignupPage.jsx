import { useState, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { SignupForm } from '../components/auth/SignupForm';
import { withErrorHandling } from '../hoc/withErrorHandling';
import { useAuth } from '../hooks/useAuth.js';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { ValidationError, AuthenticationError, NetworkError } from '../utils/error';

const INITIAL_FORM_STATE = {
  full_name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { setError: handleError } = useErrorHandler({
    context: 'signup',
    onError: (error) => {
      if (error?.type === 'auth') {
        navigate('/login', { replace: true });
      }
    },
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  useEffect(() => {
    document.title = 'Create Account - TripVar';
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.full_name?.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password?.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setErrors({});

      // Client-side validation
      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        // Focus the first field with an error
        const firstErrorField = Object.keys(validationErrors)[0];
        document.querySelector(`[name="${firstErrorField}"]`)?.focus();
        return;
      }

      setLoading(true);

      try {
        await signup({
          full_name: formData.full_name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        });
        // Use replace to prevent going back to signup page
        navigate('/', { replace: true });
      } catch (err) {
        if (err instanceof ValidationError) {
          setErrors({
            [err.field]: err.message,
          });
          document.querySelector(`[name="${err.field}"]`)?.focus();
        } else if (err instanceof NetworkError) {
          setErrors({
            form: 'Network error occurred. Please check your connection and try again.',
          });
        } else if (err instanceof AuthenticationError) {
          setErrors({ form: err.message });
        } else {
          handleError(err);
        }
      } finally {
        setLoading(false);
      }
    },
    [formData, signup, navigate, handleError, validateForm]
  );

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: '',
        }));
      }
    },
    [errors]
  );

  return (
    <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Sign in
          </Link>
        </p>
      </div>

      <SignupForm
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        errors={errors}
        loading={loading}
      />
    </div>
  );
}

export default withErrorHandling(SignupPage, 'signup');
