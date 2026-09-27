import React, { createContext, useContext, useState } from "react";
import { LANGUAGES, TRANSLATIONS } from "../data/translations";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  // English language as default as explicitly requested: "keep the english language as the default"
  const [language, setLanguage] = useState("en");

  const t = (key) => {
    const currentDict = TRANSLATIONS[language] || TRANSLATIONS["en"] || TRANSLATIONS["hi"];
    return currentDict[key] || TRANSLATIONS["en"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, languages: LANGUAGES, t }}>
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
