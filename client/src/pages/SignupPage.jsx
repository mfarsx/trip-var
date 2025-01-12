import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  ValidationError,
  NetworkError,
  AuthenticationError,
  wrapWithErrorHandler,
  useErrorHandler,
  withErrorHandling,
} from "../utils/error";

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
  const { error, setError, clearError } = useErrorHandler("signup");
  const navigate = useNavigate();
  const { signup } = useAuth();

  const validateForm = () => {
    if (!formData.email) {
      throw new ValidationError("Email is required", 400, "signup.validation");
    }
    if (!formData.password) {
      throw new ValidationError(
        "Password is required",
        400,
        "signup.validation"
      );
    }
    if (!formData.full_name) {
      throw new ValidationError(
        "Full name is required",
        400,
        "signup.validation"
      );
    }
    if (!formData.email.includes("@")) {
      throw new ValidationError(
        "Invalid email format",
        400,
        "signup.validation"
      );
    }
    if (formData.password.length < 8) {
      throw new ValidationError(
        "Password must be at least 8 characters",
        400,
        "signup.validation"
      );
    }
    if (formData.password !== formData.confirmPassword) {
      throw new ValidationError(
        "Passwords do not match",
        400,
        "signup.validation"
      );
    }
  };

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const getFieldError = useCallback(
    (field) => {
      if (!touched[field]) return "";

      switch (field) {
        case "email":
          if (!formData.email?.trim()) return "Email is required";
          if (!formData.email.includes("@")) return "Invalid email format";
          return "";
        case "password":
          if (!formData.password?.trim()) return "Password is required";
          if (formData.password.length < 8)
            return "Password must be at least 8 characters";
          return "";
        case "confirmPassword":
          if (!formData.confirmPassword?.trim())
            return "Please confirm your password";
          if (formData.password !== formData.confirmPassword)
            return "Passwords do not match";
          return "";
        case "full_name":
          if (!formData.full_name?.trim()) return "Full name is required";
          return "";
        default:
          return "";
      }
    },
    [formData, touched]
  );

  const handleSubmit = wrapWithErrorHandler(async (e) => {
    e.preventDefault();
    setLoading(true);
    clearError();

    // Set all fields as touched to show validation errors
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
        setError(error.message);
      } else if (error instanceof NetworkError) {
        setError("Unable to connect to server. Please check your connection.");
      } else if (error instanceof AuthenticationError) {
        setError(error.message);
      } else {
        setError(
          error.message || "Failed to create account. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }, "signup.submit");

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      if (error) clearError();
    },
    [error, clearError]
  );

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

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4 animate-shake">
              <div className="text-sm text-red-700 dark:text-red-200">
                {error}
              </div>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="rounded-md -space-y-px">
              <div className="mb-4">
                <label
                  htmlFor="full_name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Full Name
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  required
                  className={`appearance-none relative block w-full px-3 py-2 border ${
                    touched.full_name && getFieldError("full_name")
                      ? "border-red-300 dark:border-red-600"
                      : "border-gray-300 dark:border-gray-600"
                  } placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 transition-all duration-200`}
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={loading}
                />
                {touched.full_name && getFieldError("full_name") && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {getFieldError("full_name")}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none relative block w-full px-3 py-2 border ${
                    touched.email && getFieldError("email")
                      ? "border-red-300 dark:border-red-600"
                      : "border-gray-300 dark:border-gray-600"
                  } placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 transition-all duration-200`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={loading}
                />
                {touched.email && getFieldError("email") && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {getFieldError("email")}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`appearance-none relative block w-full px-3 py-2 border ${
                    touched.password && getFieldError("password")
                      ? "border-red-300 dark:border-red-600"
                      : "border-gray-300 dark:border-gray-600"
                  } placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 transition-all duration-200`}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={loading}
                />
                {touched.password && getFieldError("password") && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {getFieldError("password")}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`appearance-none relative block w-full px-3 py-2 border ${
                    touched.confirmPassword && getFieldError("confirmPassword")
                      ? "border-red-300 dark:border-red-600"
                      : "border-gray-300 dark:border-gray-600"
                  } placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 transition-all duration-200`}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={loading}
                />
                {touched.confirmPassword &&
                  getFieldError("confirmPassword") && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {getFieldError("confirmPassword")}
                    </p>
                  )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transform transition-all duration-200 hover:scale-[1.02]"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default withErrorHandling(SignupPage, "signup");
