import { create } from "zustand";

export type Lang = "es" | "en";

interface LangState {
  lang: Lang;
  toggleLang: () => void;
}

export const useLanguageStore = create<LangState>((set) => ({
  lang: (localStorage.getItem("vantage_lang") as Lang) ?? "es",
  toggleLang: () =>
    set((s) => {
      const next: Lang = s.lang === "es" ? "en" : "es";
      localStorage.setItem("vantage_lang", next);
      return { lang: next };
    }),
}));
