import { FormInput } from "../forms/FormInput";
import { Alert } from "../profile/Alert";

export function LoginForm({ formData, onChange, onSubmit, error, loading }) {
  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <Alert type="error" message={error} />
        
        <form onSubmit={onSubmit} className="space-y-6">
          <FormInput
            label="Email Address"
            type="email"
            id="email-input"
            name="email"
            value={formData.email}
            onChange={onChange}
            required
            autoComplete="email"
          />

          <FormInput
            label="Password"
            type="password"
            id="password-input"
            name="password"
            value={formData.password}
            onChange={onChange}
            required
            autoComplete="current-password"
          />

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a
                href="/forgot-password"
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
