import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { register } from "../store/slices/authSlice";
import Button from "../components/ui/Button";
import ImageSlider from "../components/common/ImageSlider";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import {
  BACKGROUND_IMAGES,
  ANIMATION_CONSTANTS,
  LAYOUT_CONSTANTS,
} from "../constants/pageConstants";

/**
 * Register - User registration page
 *
 * Features:
 * - Image slider with travel photos
 * - Form validation
 * - Social registration options
 * - Responsive design
 * - Error handling
 */
function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth
  );
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(register(formData));
    if (!result.error) {
      navigate("/");
    }
  };

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image slider */}
      <ImageSlider
        images={BACKGROUND_IMAGES.REGISTER}
        title="Start Your Journey Today"
        subtitle="Join our community of adventurers and explore the world"
      />

      {/* Right side - Register form */}
      <div
        className={`w-full lg:w-1/2 flex items-center justify-center ${LAYOUT_CONSTANTS.BACKGROUND_COLOR} p-6 md:p-12`}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: ANIMATION_CONSTANTS.FORM_SCALE_DURATION }}
          className="w-full max-w-[400px] space-y-8"
        >
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-3">
              Create Account
            </h2>
            <p className="text-gray-400">Sign up to start your adventure</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="sr-only">
                  Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-200 text-base transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-200 text-base transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-200 text-base transition-all duration-200"
                    placeholder="Choose a password"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="solid"
              color="primary"
              className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all duration-300 transform hover:-translate-y-0.5 text-base"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#1a1f2d] text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-700 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors duration-300 text-gray-300"
              >
                <FcGoogle className="w-5 h-5" />
                <span>Google</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-700 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors duration-300 text-gray-300"
              >
                <FaGithub className="w-5 h-5" />
                <span>GitHub</span>
              </button>
            </div>

            <p className="mt-8 text-center text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-purple-400 hover:text-purple-300 font-medium"
              >
                Sign in
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

Register.displayName = "Register";

export default Register;
