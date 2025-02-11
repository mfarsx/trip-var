import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../store/slices/authSlice";
import Button from "../components/ui/Button";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

const backgroundImages = [
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1",
  "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd",
];

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image slider */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        {backgroundImages.map((img, index) => (
          <div
            key={img}
            className="absolute inset-0"
            style={{
              opacity: index === currentImageIndex ? 1 : 0,
              transition: "opacity 1s ease-in-out",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-indigo-900/50" />
            <img src={img} alt="Travel" className="object-cover w-full h-full" />
          </div>
        ))}
        <div className="absolute inset-0 flex items-center justify-center text-white z-10">
          <div className="max-w-md text-center px-8">
            <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-pink-100">
              Start Your Journey
              <br />
              Today
            </h1>
            <p className="text-xl text-gray-200">
              Join our community of adventurers and explore the world
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Register form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#1a1f2d] p-6 md:p-12">
        <div className="w-full max-w-[400px] space-y-8">
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
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-200 text-base"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-200 text-base"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-200 text-base"
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
        </div>
      </div>
    </div>
  );
}
