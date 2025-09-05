import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import PropTypes from 'prop-types';
import ProfileDropdown from "./ProfileDropdown";
import Logo from "../common/Logo";
import NotificationBell from "../notifications/NotificationBell";
import { FiHome, FiMapPin, FiCalendar, FiHeart, FiSettings } from "react-icons/fi";

export default function Header({ onLogout }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navigationItems = [
    { path: '/', label: 'Home', icon: FiHome },
    { path: '/destinations', label: 'Destinations', icon: FiMapPin },
    { path: '/bookings', label: 'Bookings', icon: FiCalendar },
    { path: '/favorites', label: 'Favorites', icon: FiHeart },
    { path: '/settings', label: 'Settings', icon: FiSettings },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-xl shadow-2xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo size="default" />
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`group flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                      : 'text-gray-300 hover:text-white hover:bg-white/10 backdrop-blur-sm'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="relative">
                    {item.label}
                    {isActive(item.path) && (
                      <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white rounded-full" />
                    )}
                  </span>
                </button>
              );
            })}
          </nav>
          
          {/* Right side - Notifications and Profile */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            {user && <NotificationBell />}
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
            >
              <motion.svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </motion.svg>
            </button>
            
            {/* Profile button */}
            <div className="relative" ref={dropdownRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center text-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 border-2 border-white/20 cursor-pointer shadow-lg hover:shadow-purple-500/25"
              >
                {authLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  user?.name?.charAt(0)
                )}
              </motion.button>

              {isProfileOpen && !authLoading && user && (
                <ProfileDropdown onLogout={onLogout} onClose={() => setIsProfileOpen(false)} />
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <motion.div
          initial={false}
          animate={{ 
            height: isMobileMenuOpen ? "auto" : 0,
            opacity: isMobileMenuOpen ? 1 : 0
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="md:hidden overflow-hidden"
        >
          <div className="px-2 pt-4 pb-6 space-y-2 bg-white/5 backdrop-blur-xl border-t border-white/10">
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.path}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ 
                    x: isMobileMenuOpen ? 0 : -20, 
                    opacity: isMobileMenuOpen ? 1 : 0 
                  }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-4 w-full px-4 py-4 rounded-2xl text-sm font-medium transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10 backdrop-blur-sm'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </header>
  );
}

Header.propTypes = {
  onLogout: PropTypes.func.isRequired
};
