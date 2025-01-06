import config from "../config";

class AuthService {
  constructor() {
    this.baseUrl = `${config.apiUrl}/api/v1/auth`;
  }

  async login(email, password) {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        username: email, // FastAPI OAuth2 expects 'username'
        password: password,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Login failed");
    }

    const data = await response.json();
    return data;
  }

  async register(userData) {
    const response = await fetch(`${this.baseUrl}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Registration failed");
    }

    return response.json();
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
