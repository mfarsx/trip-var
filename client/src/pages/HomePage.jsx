import React from "react";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { withErrorHandling } from "../utils/error";

export function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold sm:text-5xl">
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Welcome to Tripvar AI
            </span>
          </h1>
          <p className="mt-6 text-xl text-gray-600">
            {user
              ? `Welcome back, ${user.full_name || user.email}!`
              : "Experience the future of AI assistance"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="group relative">
            <div className="h-full p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <div className="w-12 h-12 mb-4 rounded-xl bg-blue-100 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    AI Chat Assistant
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Get instant help with your tasks using our advanced AI
                    assistant.
                  </p>
                </div>
                <Link
                  to="/chat"
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Start Chat
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="h-full p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <div className="w-12 h-12 mb-4 rounded-xl bg-blue-100 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Profile Settings
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Customize your experience and manage your preferences.
                  </p>
                </div>
                <Link
                  to="/profile"
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  View Profile
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {!user && (
          <div className="mt-16 text-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-lg font-medium"
            >
              Get Started
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default withErrorHandling(HomePage, "home");
