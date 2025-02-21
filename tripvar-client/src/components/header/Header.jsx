import { useState } from "react";
import { useSelector } from "react-redux";
import PropTypes from 'prop-types';
import ProfileDropdown from "./ProfileDropdown";

export default function Header({ onLogout }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, loading: authLoading } = useSelector((state) => state.auth);

  return (
    <div className="fixed top-0 right-0 p-4 z-50">
      <div className="relative">
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center text-lg font-medium hover:bg-purple-700 transition-colors border-2 border-gray-700/50 cursor-pointer"
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
          <ProfileDropdown onLogout={onLogout} />
        )}
      </div>
    </div>
  );
}

Header.propTypes = {
  onLogout: PropTypes.func.isRequired
};
