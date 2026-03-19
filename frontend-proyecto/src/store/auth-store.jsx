import { persist } from "zustand/middleware";
import { create } from "zustand";

const handler = (set) => ({
  isAuthenticated: false,
  user: null,
  login: ({ token, user }) => set({ isAuthenticated: true, token, user }),
  logout: () => set({ isAuthenticated: false, token: null, user: null }),
});

export const useAuthStore = create(persist(handler, { name: "auth-storage" }));
