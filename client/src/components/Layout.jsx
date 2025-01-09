import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Navbar } from "./Navbar";
import { ErrorBoundaryWithFallback } from "../utils/error/errorHandler";
import { logError } from "../utils/logger";
import { Card, CardBody } from "./ui";
import { theme, classNames } from "../utils/imports";

export function Layout() {
  const { isAuthenticated, checkAuth, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const validateAuth = async () => {
      try {
        if (mounted) {
          const isValid = await checkAuth();
          if (!isValid) {
            logError("User not authenticated", "layout.auth");
            navigate("/login", { replace: true });
          }
          setLoading(false);
        }
      } catch (error) {
        if (mounted) {
          logError("Auth validation failed", "layout.auth", {
            error: error?.message,
          });
          navigate("/login", { replace: true });
          setLoading(false);
        }
      }
    };

    if (!isAuthenticated && !authLoading) {
      validateAuth();
    } else {
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, checkAuth, navigate, authLoading]);

  if (loading || authLoading) {
    return (
      <div
        className={classNames(
          "min-h-screen flex items-center justify-center",
          theme.colors.background.page.light,
          theme.colors.background.page.dark
        )}
      >
        <div
          className={classNames(
            "h-12 w-12 border-t-2 border-b-2 rounded-full",
            theme.animation.spin,
            theme.colors.primary.border.DEFAULT,
            theme.colors.primary.border.light
          )}
        />
      </div>
    );
  }

  return (
    <div
      className={classNames(
        "min-h-screen",
        theme.colors.background.page.light,
        theme.colors.background.page.dark
      )}
    >
      <ErrorBoundaryWithFallback>
        <Navbar />
        <main
          className={classNames(
            theme.components.layout.container,
            theme.components.layout.section
          )}
        >
          <Card>
            <CardBody>
              <Outlet />
            </CardBody>
          </Card>
        </main>
      </ErrorBoundaryWithFallback>
    </div>
  );
}
