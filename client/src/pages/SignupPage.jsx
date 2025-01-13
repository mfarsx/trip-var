import React, { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useErrorHandler } from "../hooks/useErrorHandler";
import {
  ValidationError,
  NetworkError,
  AuthenticationError,
} from "../utils/error";
import { FormInput } from "../components/ui/FormInput";
import { FormError } from "../components/ui/FormError";
import { withErrorHandling } from "../utils/error";

export function SignupPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmPassword: false,
    full_name: false,
  });
  const [loading, setLoading] = useState(false);
  const { error, setError, clearError, clearFieldError } =
    useErrorHandler("signup");
  const navigate = useNavigate();
  const { signup } = useAuth();

  const validateField = useCallback(
    (name, value) => {
      switch (name) {
        case "email":
          if (!value?.trim()) {
            throw new ValidationError("Email is required", "email");
          }
          if (!value.includes("@")) {
            throw new ValidationError("Invalid email format", "email");
          }
          break;
        case "password":
          if (!value?.trim()) {
            throw new ValidationError("Password is required", "password");
          }
          if (value.length < 8) {
            throw new ValidationError(
              "Password must be at least 8 characters",
              "password"
            );
          }
          break;
        case "confirmPassword":
          if (!value?.trim()) {
            throw new ValidationError(
              "Please confirm your password",
              "confirmPassword"
            );
          }
          if (value !== formData.password) {
            throw new ValidationError(
              "Passwords do not match",
              "confirmPassword"
            );
          }
          break;
        case "full_name":
          if (!value?.trim()) {
            throw new ValidationError("Full name is required", "full_name");
          }
          break;
      }
    },
    [formData.password]
  );

  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      try {
        validateField(name, value);
      } catch (error) {
        if (error instanceof ValidationError) {
          setError({ ...error, field: name });
        }
      }
    },
    [validateField, setError]
  );

  const validateForm = useCallback(() => {
    Object.entries(formData).forEach(([name, value]) => {
      validateField(name, value);
    });
  }, [formData, validateField]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearError();

    // Set all fields as touched
    setTouched({
      email: true,
      password: true,
      confirmPassword: true,
      full_name: true,
    });

    try {
      validateForm();
      await signup(formData);
      navigate("/");
    } catch (error) {
      if (error instanceof ValidationError) {
        setError(error);
      } else if (error instanceof NetworkError) {
        setError({
          type: "api",
          message: "Unable to connect to server. Please check your connection.",
        });
      } else if (error instanceof AuthenticationError) {
        setError({
          type: "api",
          message: error.message,
        });
      } else {
        setError({
          type: "generic",
          message:
            error.message || "Failed to create account. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      <div className="relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 transform transition-all hover:scale-[1.01]">
          <div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Join Tripvar AI and start creating amazing content
            </p>
          </div>

          {error?.type !== "validation" && <FormError error={error} />}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="rounded-md -space-y-px">
              <FormInput
                label="Full Name"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={error}
                clearError={clearFieldError}
                required
                disabled={loading}
                placeholder="Enter your full name"
                autoComplete="name"
              />

              <FormInput
                label="Email address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={error}
                clearError={clearFieldError}
                required
                disabled={loading}
                placeholder="Enter your email"
                autoComplete="email"
              />

              <FormInput
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={error}
                clearError={clearFieldError}
                required
                disabled={loading}
                placeholder="Enter your password"
                autoComplete="new-password"
              />

              <FormInput
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={error}
                clearError={clearFieldError}
                required
                disabled={loading}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default withErrorHandling(SignupPage, "signup");
