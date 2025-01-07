import jwt_decode from "jwt-decode";
import config from "../config";

export const validateToken = async (token) => {
  try {
    const response = await fetch(
      `${config.apiUrl}${config.apiPath}/auth/validate-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Invalid token");
    }

    return await response.json();
  } catch (error) {
    console.error("Token validation error:", error);
    throw new Error("Invalid token");
  }
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
