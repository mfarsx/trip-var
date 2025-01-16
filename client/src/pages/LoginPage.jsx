import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useErrorHandler } from "../hooks/useErrorHandler";
import { wrapWithErrorHandler } from "../utils/error/errorHandler";
import { LoginForm } from "../components/auth/LoginForm";
import { logError, logWarn } from "../utils/logger";

const INITIAL_FORM_STATE = {
  email: "",
  password: "",
};

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const { error, setError, clearError, getErrorMessage } = useErrorHandler({
    context: "login",
    onError: (error) => {
      if (error?.type === "auth") {
        navigate("/login", { replace: true });
      }
    },
  });

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = location.state?.from?.pathname || "/";
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  useEffect(() => {
    document.title = "Sign in - TripVar";
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      clearError();
      setLoading(true);

      try {
        await login(formData); // Pass the entire formData object
        
        // Navigate to intended destination or home
        const redirectTo = location.state?.from?.pathname || "/";
        navigate(redirectTo, { replace: true });
      } catch (err) {
        logError("Login failed:", err, {
          email: formData.email, // Don't log password
          context: "login",
          redirectPath: location.state?.from?.pathname
        });
        setError(err);
        setLoading(false); // Make sure to set loading to false on error
        
        // Focus appropriate field based on error type
        if (err.type === "validation") {
          const fieldElement = document.querySelector(`[name="${err.field}"]`);
          if (fieldElement) {
            fieldElement.focus();
          } else {
            logWarn(`Field element not found: ${err.field}`);
          }
        }
      }
    },
    [login, formData, location.state?.from?.pathname, navigate, clearError, setError]
  );

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  if (isAuthenticated) {
    return null; // Don't render anything if already authenticated
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Or{" "}
          <Link
            to="/signup"
            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            create a new account
          </Link>
        </p>
      </div>

      <LoginForm
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        error={error ? getErrorMessage(error) : null}
        loading={loading}
      />
    </div>
  );
}

export default wrapWithErrorHandler(LoginPage, "login");
