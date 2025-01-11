import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// İstek interceptor'ı
instance.interceptors.request.use(
  (config) => {
    // İsteğe token ekle
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Hata mesajını formatla
const formatErrorMessage = (error) => {
  // Backend'den gelen detaylı hata mesajı
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }

  // Backend'den gelen genel hata mesajı
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Backend'den gelen error objesi
  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  // Backend'den gelen validation hataları
  if (error.response?.data?.errors) {
    const errors = error.response.data.errors;
    if (Array.isArray(errors)) {
      return errors.join(", ");
    }
    if (typeof errors === "object") {
      return Object.values(errors).flat().join(", ");
    }
  }

  // Backend'den gelen string hata mesajı
  if (typeof error.response?.data === "string") {
    return error.response.data;
  }

  // Ağ hatası
  if (error.message === "Network Error") {
    return "Unable to connect to server. Please check your internet connection.";
  }

  // Timeout hatası
  if (error.code === "ECONNABORTED") {
    return "Request timed out. Please try again.";
  }

  return error.message || "An unexpected error occurred";
};

// Cevap interceptor'ı
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Auth ile ilgili endpointlerde 401 hatası alındığında yönlendirme yapmıyoruz
    const isAuthEndpoint = error.config.url.includes("/auth/");

    if (error.response?.status === 401 && !isAuthEndpoint) {
      // Token geçersiz veya süresi dolmuş
      localStorage.removeItem("token");
      // Eğer zaten login sayfasında değilsek yönlendir
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    // Hata mesajını formatla ve yeni bir error objesi oluştur
    const formattedError = new Error(formatErrorMessage(error));
    formattedError.status = error.response?.status;
    formattedError.originalError = error;

    return Promise.reject(formattedError);
  }
);

export default instance;
