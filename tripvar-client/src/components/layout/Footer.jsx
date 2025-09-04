import { FiHeart, FiMail, FiPhone, FiMapPin } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-gray-900/95 backdrop-blur-sm border-t border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4">TripVar</h3>
            <p className="text-gray-400 mb-6 max-w-md">
              Your trusted partner for discovering and booking amazing travel destinations. 
              Experience the world with confidence and convenience.
            </p>
            <div className="flex items-center gap-2 text-gray-400">
              <FiHeart className="w-4 h-4 text-red-400" />
              <span>Made with love for travelers</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/destinations" className="text-gray-400 hover:text-white transition-colors">
                  Destinations
                </a>
              </li>
              <li>
                <a href="/bookings" className="text-gray-400 hover:text-white transition-colors">
                  My Bookings
                </a>
              </li>
              <li>
                <a href="/settings" className="text-gray-400 hover:text-white transition-colors">
                  Account Settings
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-400">
                <FiMail className="w-4 h-4" />
                <span>support@tripvar.com</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <FiPhone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <FiMapPin className="w-4 h-4" />
                <span>San Francisco, CA</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 TripVar. All rights reserved. | 
            <a href="#" className="hover:text-white transition-colors ml-1">Privacy Policy</a> | 
            <a href="#" className="hover:text-white transition-colors ml-1">Terms of Service</a>
          </p>
        </div>
      </div>
    </footer>
  );
}