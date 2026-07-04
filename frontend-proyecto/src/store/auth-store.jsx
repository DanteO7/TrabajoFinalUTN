import { create } from "zustand";

const handler = (set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,

  login: (user) =>
    set({
      isAuthenticated: true,
      user,
      isLoading: false,
    }),

  logout: () =>
    set({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    }),
});

export const useAuthStore = create(handler);
