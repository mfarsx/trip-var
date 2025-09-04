import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Home from "./pages/Home";
import Destinations from "./pages/Destinations";
import Bookings from "./pages/Bookings";
import Favorites from "./pages/Favorites";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import ErrorBoundary from "./components/ErrorBoundary";
import RealTimeNotifications from "./components/notifications/RealTimeNotifications";
import WebSocketProvider from "./components/providers/WebSocketProvider";
import WebSocketStatus from "./components/common/WebSocketStatus";
import "./App.css";

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <WebSocketProvider>
          <Router>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "#242937",
                  color: "#fff",
                },
                success: {
                  iconTheme: {
                    primary: "#8B5CF6",
                    secondary: "#fff",
                  },
                },
              }}
            />
            <RealTimeNotifications />
            <WebSocketStatus />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                element={
                  <ProtectedRoute>
                    <Outlet />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Home />} />
                <Route path="destinations" element={<Destinations />} />
                <Route path="destinations/:id" element={<Destinations />} />
                <Route path="bookings" element={<Bookings />} />
                <Route path="favorites" element={<Favorites />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </WebSocketProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
