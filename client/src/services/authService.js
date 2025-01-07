import config from "../config";

class AuthService {
  constructor() {
    this.baseUrl = `${config.apiUrl}${config.apiPath}/auth`;
    this.timeout = config.apiTimeout;
  }

  async login(email, password) {
    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
        credentials: "include",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Login failed");
      }

      const data = await response.json();

      if (data.access_token) {
        localStorage.setItem(config.auth.tokenKey, data.access_token);
        if (data.user) {
          localStorage.setItem(
            config.auth.userDataKey,
            JSON.stringify(data.user)
          );
        }
      }

      return data;
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Request timeout");
      }
      console.error("Login error:", error);
      throw error;
    }
  }

  async register(userData) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          full_name: userData.full_name,
        }),
        credentials: "include",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Registration failed");
      }

      return await response.json();
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Request timeout");
      }
      console.error("Registration error:", error);
      throw error;
    }
  }

  async getCurrentUser() {
    const token = localStorage.getItem(config.auth.tokenKey);
    if (!token) return null;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        localStorage.removeItem(config.auth.tokenKey);
        localStorage.removeItem(config.auth.userDataKey);
        return null;
      }

      return await response.json();
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Request timeout");
      }
      console.error("Get current user error:", error);
      localStorage.removeItem(config.auth.tokenKey);
      localStorage.removeItem(config.auth.userDataKey);
      return null;
    }
  }

  logout() {
    localStorage.removeItem(config.auth.tokenKey);
    localStorage.removeItem(config.auth.userDataKey);
  }
}

export const authService = new AuthService();
