import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  FiUser,
  FiMail,
  FiLock,
  FiKey,
  FiRefreshCcw,
  FiCalendar,
  FiFlag,
  FiAlertCircle,
} from "react-icons/fi";
import userService from "../services/userService";
import { fetchProfile, logout } from "../store/slices/authSlice";
import PageLayout from "../components/layout/PageLayout";
import {
  formatDateForInput,
  calculateAge,
  isAgeValid,
  getMaxDate,
} from "../utils/dateUtils";
import {
  COUNTRIES,
  ANIMATION_CONSTANTS,
  LAYOUT_CONSTANTS,
} from "../constants/pageConstants";

/**
 * Settings - User account settings page
 *
 * Features:
 * - Profile information management
 * - Password change functionality
 * - Age validation
 * - Nationality selection with flags
 * - Form validation
 * - Responsive design
 */

function Settings() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dateOfBirth: "",
    nationality: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [ageError, setAgeError] = useState("");

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        dateOfBirth: user.dateOfBirth
          ? formatDateForInput(user.dateOfBirth)
          : "",
        nationality: user.nationality || "",
      }));
    }
  }, [user]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "dateOfBirth") {
      // Validate minimum age
      if (!isAgeValid(value)) {
        setAgeError("You must be at least 20 years old");
      } else {
        setAgeError("");
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (ageError) {
      return;
    }

    try {
      setLoading(true);
      const updateData = {
        name: formData.name,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth,
        nationality: formData.nationality,
      };

      await userService.updateProfile(updateData);
      await dispatch(fetchProfile()).unwrap();
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await userService.updatePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast.success("Password updated successfully");

      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout
      onLogout={handleLogout}
      containerClassName={LAYOUT_CONSTANTS.CONTAINER_MAX_WIDTH_SMALL}
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Account Settings
        </h1>
        <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
          Manage your profile information and account preferences.
        </p>
      </div>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: ANIMATION_CONSTANTS.FORM_SCALE_DURATION }}
        className="bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-700/30 space-y-8"
      >
        {/* Profile Information Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Profile Information
          </h3>
          <div className="space-y-6">
            <div className="relative">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-lg bg-gray-800/50 border border-gray-700/50 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div className="relative">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-lg bg-gray-800/50 border border-gray-700/50 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div className="relative">
              <label
                htmlFor="dateOfBirth"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Date of Birth
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  max={getMaxDate()}
                  className="pl-10 block w-full rounded-lg bg-gray-800/50 border border-gray-700/50 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              {formData.dateOfBirth && (
                <div className="mt-2 flex items-center">
                  <span
                    className={`text-sm ${
                      isAgeValid(formData.dateOfBirth)
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    Age: {calculateAge(formData.dateOfBirth)} years old
                  </span>
                  {!isAgeValid(formData.dateOfBirth) && (
                    <div className="ml-2 flex items-center text-red-400">
                      <FiAlertCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">
                        Must be at least 20 years old
                      </span>
                    </div>
                  )}
                </div>
              )}
              {ageError && (
                <p className="mt-2 text-red-400 text-sm">{ageError}</p>
              )}
            </div>

            <div className="relative">
              <label
                htmlFor="nationality"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Nationality
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiFlag className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="nationality"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-lg bg-gray-800/50 border border-gray-700/50 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select your nationality</option>
                  {COUNTRIES.map((country) => (
                    <option
                      key={country.code}
                      value={country.name}
                      className="flex items-center"
                    >
                      <img
                        src={`https://flagcdn.com/24x18/${country.code.toLowerCase()}.png`}
                        alt={`${country.name} flag`}
                        className="inline-block mr-2 w-6 h-4"
                      />
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
              {formData.nationality && (
                <div className="mt-2 flex items-center">
                  <img
                    src={`https://flagcdn.com/24x18/${COUNTRIES.find(
                      (c) => c.name === formData.nationality
                    )?.code.toLowerCase()}.png`}
                    alt={`${formData.nationality} flag`}
                    className="w-6 h-4 mr-2"
                  />
                  <span className="text-sm text-gray-400">
                    Selected: {formData.nationality}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || !!ageError}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? (
                <FiRefreshCcw className="w-5 h-5 animate-spin" />
              ) : (
                "Update Profile"
              )}
            </button>
          </div>
        </form>

        {/* Password Update Form */}
        <form
          onSubmit={handlePasswordUpdate}
          className="space-y-6 pt-6 border-t border-gray-700"
        >
          <h3 className="text-xl font-semibold text-white mb-4">
            Change Password
          </h3>
          <div className="space-y-6">
            <div className="relative">
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Current Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiKey className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-lg bg-gray-800/50 border border-gray-700/50 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div className="relative">
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-lg bg-gray-800/50 border border-gray-700/50 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div className="relative">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-lg bg-gray-800/50 border border-gray-700/50 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? (
                <FiRefreshCcw className="w-5 h-5 animate-spin" />
              ) : (
                "Update Password"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </PageLayout>
  );
}

Settings.displayName = "Settings";

export default Settings;
