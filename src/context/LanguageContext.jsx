// src/context/LanguageContext.jsx
import React, { createContext, useContext, useState, useMemo, useCallback } from "react";
import { LANGUAGES, TRANSLATIONS } from "../data/translations";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  // Restore language from localStorage (defaults to "te" or "hi" or "en")
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem("jeevika_language") || "en";
    } catch {
      return "en";
    }
  });

  // Track if user explicitly selected language
  const [hasChosenLanguage, setHasChosenLanguage] = useState(() => {
    try {
      return localStorage.getItem("jeevika_language_chosen") === "true";
    } catch {
      return false;
    }
  });

  // Modal open state for pre-login / switcher
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(() => {
    try {
      return localStorage.getItem("jeevika_language_chosen") !== "true";
    } catch {
      return false;
    }
  });

  const setLanguage = useCallback((newLang) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem("jeevika_language", newLang);
      localStorage.setItem("jeevika_language_chosen", "true");
      setHasChosenLanguage(true);
    } catch {}
  }, []);

  const openLanguageModal = useCallback(() => setIsLanguageModalOpen(true), []);
  const closeLanguageModal = useCallback(() => setIsLanguageModalOpen(false), []);

  const t = useCallback((key, fallback) => {
    const currentDict = TRANSLATIONS[language] || TRANSLATIONS["en"] || {};
    if (currentDict[key] !== undefined) return currentDict[key];
    const enDict = TRANSLATIONS["en"] || {};
    if (enDict[key] !== undefined) return enDict[key];
    return fallback !== undefined ? fallback : key;
  }, [language]);

  const currentLanguage = useMemo(() => {
    return LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];
  }, [language]);

  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    languages: LANGUAGES,
    currentLanguage,
    t,
    hasChosenLanguage,
    isLanguageModalOpen,
    openLanguageModal,
    closeLanguageModal
  }), [
    language,
    setLanguage,
    currentLanguage,
    t,
    hasChosenLanguage,
    isLanguageModalOpen,
    openLanguageModal,
    closeLanguageModal
  ]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
