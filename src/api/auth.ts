
import api from "./axiosClient";
import { useAuthStore } from "@/store/useAuthStore";

export const login = async (email: string, password: string) => {
  const response = await api.post("/Auth/login", { email, password });
  console.log("Login response:", response.data);
  
  const { role, userName, token, userId } = response.data;

  // Simpan token ke localStorage
  localStorage.setItem("token", token);
  localStorage.setItem("userId", userId);

  const authStore = useAuthStore.getState();
  authStore.setAuth(role, userName);

  return response.data;
};