import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
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

export function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });
  const [loading, setLoading] = useState(false);
  const { error, setError, clearError, clearFieldError } =
    useErrorHandler("login");
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = location.state?.from?.pathname || "/";
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const validateField = useCallback((name, value) => {
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
        if (value.length < 6) {
          throw new ValidationError(
            "Password must be at least 6 characters",
            "password"
          );
        }
        break;
    }
  }, []);

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
    });

    try {
      validateForm();
      await login(formData);
      // Navigation is handled by the useEffect above
    } catch (error) {
      console.error("Login error:", error);

      if (error instanceof ValidationError) {
        setError(error);
      } else if (error instanceof NetworkError) {
        setError({
          type: "api",
          message: "Network error. Please check your connection.",
        });
      } else if (error.response?.status === 401) {
        setError({
          type: "api",
          message:
            error.response.data?.message || "Incorrect email or password",
          status: 401,
        });
      } else if (
        error instanceof AuthenticationError ||
        error.response?.status === 403
      ) {
        setError({
          type: "api",
          message: error.message || "Authentication failed",
          status: error.response?.status,
        });
      } else {
        setError({
          type: "generic",
          message:
            error.response?.data?.message ||
            error.message ||
            "An unexpected error occurred. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      // Clear any existing errors when user starts typing
      clearFieldError(name);
    },
    [clearFieldError]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      <div className="relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 transform transition-all hover:scale-[1.01]">
          <div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Welcome back to Tripvar AI
            </p>
          </div>

          {/* Show all types of errors at the form level */}
          {error && <FormError error={error} className="mt-4" />}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="rounded-md -space-y-px">
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
                autoComplete="current-password"
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
                {loading ? "Signing in..." : "Sign in"}
              </button>
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Sign up
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

export default withErrorHandling(LoginPage, "login");
