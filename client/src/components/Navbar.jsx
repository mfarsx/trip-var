import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "./ui";
import { theme, classNames, NAV_ITEMS } from "../utils/imports";

export function Navbar() {
  const { logout, user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={classNames(
        theme.colors.background.light,
        theme.colors.background.dark,
        "shadow-lg"
      )}
    >
      <div className={theme.components.layout.container}>
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link
                to="/"
                className={classNames(
                  "text-xl font-bold",
                  theme.colors.primary.DEFAULT,
                  theme.colors.primary.light
                )}
              >
                Tripvar AI
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={classNames(
                    theme.components.nav.link.base,
                    isActive(item.path)
                      ? theme.components.nav.link.active
                      : theme.components.nav.link.inactive
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            {user && (
              <div className="flex items-center space-x-4">
                <span className={theme.colors.text.secondary}>
                  {user.full_name || user.email}
                </span>
                <Button onClick={logout} variant="primary">
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={classNames(
                theme.components.nav.mobileLlink.base,
                isActive(item.path)
                  ? theme.components.nav.mobileLlink.active
                  : theme.components.nav.mobileLlink.inactive
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
