import { create } from 'zustand';
import api from '@/api/axiosClient';

interface AuthState {
  role: string | null;
  fullName: string | null;
  isLoading: boolean;
  fetchUserData: () => Promise<void>;
  logout: () => void;
  setAuth: (role: string, fullName: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  role: null,
  fullName: null,
  isLoading: true,

  setAuth: (role, fullName) => {
    set({ role, fullName, isLoading: false });
  },
  
  fetchUserData: async () => {
    set({ isLoading: true });


    try {
      const res = await api.get("/Auth/me");
      const { role, fullName } = res.data;
      set({ role, fullName, isLoading: false });
    } catch (err){
      console.log("error:", err);
      localStorage.removeItem("token");
      set({ role: null, fullName: null, isLoading: false });
    }
  },


  logout: () => {
    localStorage.removeItem("token");
    set({ role: null, fullName: null, isLoading: false });
  }
  
}));
