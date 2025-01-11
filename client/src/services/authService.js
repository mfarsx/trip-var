import axios from "../utils/axiosConfig";
import { asyncHandler } from "../utils/apiUtils";

class AuthService {
  signup(userData) {
    const { email, password, full_name } = userData;
    return asyncHandler(
      "register",
      () =>
        axios
          .post("/api/v1/auth/register", { email, password, full_name })
          .then((response) => response.data),
      "auth"
    );
  }

  login(credentials) {
    return asyncHandler(
      "login",
      () =>
        axios
          .post("/api/v1/auth/login", credentials)
          .then((response) => response.data),
      "auth"
    );
  }

  logout() {
    return asyncHandler(
      "logout",
      () => axios.post("/api/v1/auth/logout"),
      "auth"
    );
  }

  checkAuth() {
    return asyncHandler(
      "check",
      () => axios.get("/api/v1/auth/me").then((response) => response.data),
      "auth"
    );
  }
}

export const authService = new AuthService();
