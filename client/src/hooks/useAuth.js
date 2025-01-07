import { useContext, createContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/auth/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ email, password }) => {
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/v1/auth/login`,
      formData
    );

    const { access_token } = response.data;
    localStorage.setItem("token", access_token);
    await fetchUser(access_token);
  };

  const signup = async ({ email, password, fullName }) => {
    await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/auth/signup`, {
      email,
      password,
      full_name: fullName,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
