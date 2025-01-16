'use client';

import PropTypes from 'prop-types';
import React from 'react';

import { useAuth } from '../hooks/useAuth.js';

import { DesktopNav } from './navigation/DesktopNav';
import { MobileNav } from './navigation/MobileNav';
import { UserMenu } from './navigation/UserMenu';
import { Logo } from './ui/Logo';

const NAV_ITEMS = [
  {
    name: 'Home',
    path: '/',
    icon: 'HomeIcon',
  },
  {
    name: 'Text Generator',
    path: '/text-generator',
    icon: 'DocumentTextIcon',
  },
  {
    name: 'Travel Planner',
    path: '/travel-planner',
    icon: 'GlobeAltIcon',
  },
];

/**
 * Layout component that provides the main application structure
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @returns {React.ReactElement} Layout component
 */
export function Layout({ children }) {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Logo />
              <DesktopNav items={NAV_ITEMS} />
            </div>

            {/* Right side - Profile Menu */}
            <div className="flex items-center">
              <UserMenu user={user} onLogout={logout} />
              <MobileNav items={NAV_ITEMS} />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
      </main>
    </div>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
