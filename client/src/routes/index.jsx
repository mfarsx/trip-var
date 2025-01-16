import { Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "./config";
import { PrivateRoute } from "../components/route/PrivateRoute";
import { PublicRoute } from "../components/route/PublicRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      {ROUTES.public.map(({ path, component: Component }) => (
        <Route
          key={path}
          path={path}
          element={
            <PublicRoute>
              <Component />
            </PublicRoute>
          }
        />
      ))}

      {/* Private Routes */}
      {ROUTES.private.map(({ path, component: Component }) => (
        <Route
          key={path}
          path={path}
          element={
            <PrivateRoute>
              <Component />
            </PrivateRoute>
          }
        />
      ))}

      {/* Catch all route - redirect to home */}
      <Route path="*" element={<PrivateRoute><Navigate to="/" /></PrivateRoute>} />
    </Routes>
  );
}
