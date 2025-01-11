import jwt_decode from "jwt-decode";
import config from "../config";
import axios from "./axiosConfig";
import { asyncHandler } from "./apiUtils";

export const validateToken = (token) => {
  return asyncHandler(
    "validate-token",
    () =>
      axios
        .post(
          `${config.apiUrl}${config.apiPath}/auth/validate-token`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((response) => response.data),
    "auth"
  );
};

export const getTokenExpiration = (token) => {
  try {
    const decoded = jwt_decode(token);
    if (!decoded.exp) return null;
    return decoded.exp * 1000; // Convert to milliseconds
  } catch (error) {
    console.error("Token decode error:", error);
    return null;
  }
};
