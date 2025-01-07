import config from "../config";

class AuthService {
  constructor() {
    this.baseUrl = `${config.apiUrl}${config.apiPath}/auth`;
  }

  async login(email, password) {
    try {
      console.log("Attempting login for:", email);

      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await fetch(`${this.baseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      const data = await response.json();
      console.log("Login response:", data);

      if (!response.ok) {
        const error = data.detail || "Login failed";
        console.error("Login failed:", error);
        throw new Error(error);
      }

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async register(userData) {
    try {
      const requestData = {
        email: userData.email,
        password: userData.password,
        full_name: userData.full_name,
      };

      console.log("Sending registration data:", requestData);

      const response = await fetch(`${this.baseUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Registration failed:", data);
        throw new Error(data.detail || "Registration failed");
      }

      console.log("Registration successful:", data);
      return data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  async getCurrentUser() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const response = await fetch(`${this.baseUrl}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      localStorage.removeItem("token");
      return null;
    }

    return response.json();
  }

  logout() {
    localStorage.removeItem("token");
  }
}

export const authService = new AuthService();
