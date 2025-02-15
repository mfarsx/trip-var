import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiLock,
  FiKey,
  FiRefreshCcw,
  FiCalendar,
  FiFlag,
  FiAlertCircle,
} from 'react-icons/fi';
import userService from '../services/userService';
import { fetchProfile } from '../store/slices/authSlice';

// List of countries with their codes for flag display
const COUNTRIES = [
  { name: 'Afghanistan', code: 'AF' },
  { name: 'Albania', code: 'AL' },
  { name: 'Algeria', code: 'DZ' },
  { name: 'Andorra', code: 'AD' },
  { name: 'Angola', code: 'AO' },
  { name: 'Argentina', code: 'AR' },
  { name: 'Australia', code: 'AU' },
  { name: 'Austria', code: 'AT' },
  { name: 'Azerbaijan', code: 'AZ' },
  { name: 'Bahamas', code: 'BS' },
  { name: 'Bahrain', code: 'BH' },
  { name: 'Bangladesh', code: 'BD' },
  { name: 'Belgium', code: 'BE' },
  { name: 'Brazil', code: 'BR' },
  { name: 'Canada', code: 'CA' },
  { name: 'China', code: 'CN' },
  { name: 'Denmark', code: 'DK' },
  { name: 'Egypt', code: 'EG' },
  { name: 'Finland', code: 'FI' },
  { name: 'France', code: 'FR' },
  { name: 'Germany', code: 'DE' },
  { name: 'Greece', code: 'GR' },
  { name: 'Hong Kong', code: 'HK' },
  { name: 'Iceland', code: 'IS' },
  { name: 'India', code: 'IN' },
  { name: 'Indonesia', code: 'ID' },
  { name: 'Iran', code: 'IR' },
  { name: 'Iraq', code: 'IQ' },
  { name: 'Ireland', code: 'IE' },
  { name: 'Israel', code: 'IL' },
  { name: 'Italy', code: 'IT' },
  { name: 'Japan', code: 'JP' },
  { name: 'Kazakhstan', code: 'KZ' },
  { name: 'Kenya', code: 'KE' },
  { name: 'Kuwait', code: 'KW' },
  { name: 'Malaysia', code: 'MY' },
  { name: 'Mexico', code: 'MX' },
  { name: 'Netherlands', code: 'NL' },
  { name: 'New Zealand', code: 'NZ' },
  { name: 'Norway', code: 'NO' },
  { name: 'Pakistan', code: 'PK' },
  { name: 'Philippines', code: 'PH' },
  { name: 'Poland', code: 'PL' },
  { name: 'Portugal', code: 'PT' },
  { name: 'Qatar', code: 'QA' },
  { name: 'Russia', code: 'RU' },
  { name: 'Saudi Arabia', code: 'SA' },
  { name: 'Singapore', code: 'SG' },
  { name: 'South Africa', code: 'ZA' },
  { name: 'South Korea', code: 'KR' },
  { name: 'Spain', code: 'ES' },
  { name: 'Sweden', code: 'SE' },
  { name: 'Switzerland', code: 'CH' },
  { name: 'Taiwan', code: 'TW' },
  { name: 'Thailand', code: 'TH' },
  { name: 'Turkey', code: 'TR' },
  { name: 'Ukraine', code: 'UA' },
  { name: 'United Arab Emirates', code: 'AE' },
  { name: 'United Kingdom', code: 'GB' },
  { name: 'United States', code: 'US' },
  { name: 'Vietnam', code: 'VN' }
].sort((a, b) => a.name.localeCompare(b.name));

const formatDateForInput = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD format
};

export default function Settings() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dateOfBirth: '',
    nationality: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [ageError, setAgeError] = useState("");

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        dateOfBirth: user.dateOfBirth ? formatDateForInput(user.dateOfBirth) : '',
        nationality: user.nationality || '',
      }));
    }
  }, [user]);

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const isAgeValid = (birthDate) => {
    const age = calculateAge(birthDate);
    return age >= 20;
  };

  const getMaxDate = () => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 20);
    return today.toISOString().split('T')[0];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'dateOfBirth') {
      // Calculate age
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      // Validate minimum age
      if (age < 20) {
        setAgeError("You must be at least 20 years old");
      } else {
        setAgeError("");
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await userService.updatePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      toast.success('Password updated successfully');
      
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-gray-800/50 transition-colors"
            aria-label="Go back"
          >
            <FiArrowLeft className="w-6 h-6 text-gray-400 hover:text-purple-400" />
          </button>
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 ml-4">Account Settings</h2>
        </div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800/50 rounded-xl shadow-xl p-8 border border-gray-700 space-y-8"
        >
          {/* Profile Information Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Profile Information</h3>
            <div className="space-y-6">
              <div className="relative">
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
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
                    className="pl-10 block w-full rounded-lg bg-gray-800/50 border border-gray-700 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
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
                    className="pl-10 block w-full rounded-lg bg-gray-800/50 border border-gray-700 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-300 mb-2">
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
                    className="pl-10 block w-full rounded-lg bg-gray-800/50 border border-gray-700 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                {formData.dateOfBirth && (
                  <div className="mt-2 flex items-center">
                    <span className={`text-sm ${isAgeValid(formData.dateOfBirth) ? 'text-green-400' : 'text-red-400'}`}>
                      Age: {calculateAge(formData.dateOfBirth)} years old
                    </span>
                    {!isAgeValid(formData.dateOfBirth) && (
                      <div className="ml-2 flex items-center text-red-400">
                        <FiAlertCircle className="h-4 w-4 mr-1" />
                        <span className="text-sm">Must be at least 20 years old</span>
                      </div>
                    )}
                  </div>
                )}
                {ageError && (
                  <p className="mt-2 text-red-400 text-sm">{ageError}</p>
                )}
              </div>

              <div className="relative">
                <label htmlFor="nationality" className="block text-sm font-medium text-gray-300 mb-2">
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
                    className="pl-10 block w-full rounded-lg bg-gray-800/50 border border-gray-700 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select your nationality</option>
                    {COUNTRIES.map(country => (
                      <option key={country.code} value={country.name} className="flex items-center">
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
                      src={`https://flagcdn.com/24x18/${COUNTRIES.find(c => c.name === formData.nationality)?.code.toLowerCase()}.png`}
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
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <FiRefreshCcw className="w-5 h-5 animate-spin" />
                ) : (
                  'Update Profile'
                )}
              </button>
            </div>
          </form>

          {/* Password Update Form */}
          <form onSubmit={handlePasswordUpdate} className="space-y-6 pt-6 border-t border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Change Password</h3>
            <div className="space-y-6">
              <div className="relative">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-2">
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
                    className="pl-10 block w-full rounded-lg bg-gray-800/50 border border-gray-700 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
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
                    className="pl-10 block w-full rounded-lg bg-gray-800/50 border border-gray-700 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
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
                    className="pl-10 block w-full rounded-lg bg-gray-800/50 border border-gray-700 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <FiRefreshCcw className="w-5 h-5 animate-spin" />
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}
