import axios from "axios";

const api = axios.create({
  baseURL: "http://103.176.78.120:8080/api",
  withCredentials: false, // Membutuhkan cookies untuk autentikasi
  headers: {
    "Content-Type": "application/json",
  },
});

// api.interceptors.request.use((config) => {
//   return config;
// });

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
