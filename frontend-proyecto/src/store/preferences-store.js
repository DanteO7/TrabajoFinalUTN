import { create } from "zustand";
import { persist } from "zustand/middleware";
import i18n from "../i18n";

export const usePreferencesStore = create(
  persist(
    (set) => ({
      theme: "light",
      language: "es",

      setTheme: (theme) => {
        set({ theme });
      },

      setLanguage: (language) => {
        i18n.changeLanguage(language);
        set({ language });
      },
    }),
    {
      name: "preferences-storage",
    },
  ),
);
