import { create } from "zustand";

export const useUserFilterStore = create((set) => ({
  search: undefined,
  role: undefined,

  setFilters: (filters) => set(filters),

  clearFilters: () =>
    set({
      search: undefined,
      role: undefined,
    }),
}));
