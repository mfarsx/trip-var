import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import PropTypes from 'prop-types';
import ProfileDropdown from "./ProfileDropdown";
import Logo from "../common/Logo";
import NotificationBell from "../notifications/NotificationBell";

export default function Header({ onLogout }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const dropdownRef = useRef(null);

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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4 bg-gray-900/70 backdrop-blur-sm shadow-md">
      {/* Logo in the top left corner */}
      <div className="ml-2">
        <Logo size="default" />
      </div>
      
      {/* Right side navigation */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        {user && <NotificationBell />}
        
        {/* Profile button */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center text-lg font-medium hover:bg-purple-700 transition-colors border-2 border-gray-700/50 cursor-pointer shadow-md"
          >
            {authLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              user?.name?.charAt(0)
            )}
          </button>

          {isProfileOpen && !authLoading && user && (
            <ProfileDropdown onLogout={onLogout} onClose={() => setIsProfileOpen(false)} />
          )}
        </div>
      </div>
    </header>
  );
}

Header.propTypes = {
  onLogout: PropTypes.func.isRequired
};
