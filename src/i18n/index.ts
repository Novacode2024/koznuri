import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translation files
import uzCyrillic from "./locales/uz-cyrillic.json";
import uzLatin from "./locales/uz-latin.json";
import ru from "./locales/ru.json";
import en from "./locales/en.json";
import kz from "./locales/kz.json";
import tg from "./locales/tg.json";
import ky from "./locales/ky.json";

const resources = {
  "uz-cyrillic": {
    translation: uzCyrillic,
  },
  "uz-latin": {
    translation: uzLatin,
  },
  ru: {
    translation: ru,
  },
  en: {
    translation: en,
  },
  kz: {
    translation: kz,
  },
  tg: {
    translation: tg,
  },
  ky: {
    translation: ky,
  },
};

// Set default language to uz-cyrillic
const defaultLanguage = "uz-cyrillic";

// Supported languages list
const supportedLngs = ["uz-cyrillic", "uz-latin", "ru", "en", "kz", "ky", "tg"];

// Get initial language from localStorage or URL query parameter
// This function runs BEFORE i18n.init() to ensure we set the correct language
const getInitialLanguage = (): string => {
  if (typeof window === "undefined") {
    return defaultLanguage;
  }

  // Check URL query parameter first (highest priority)
  const urlParams = new URLSearchParams(window.location.search);
  const queryLang = urlParams.get("lang");
  if (queryLang && supportedLngs.includes(queryLang)) {
    // Save to localStorage for future visits
    localStorage.setItem("i18nextLng", queryLang);
    return queryLang;
  }

  // Check localStorage
  const storedLang = localStorage.getItem("i18nextLng");
  if (storedLang && supportedLngs.includes(storedLang)) {
    return storedLang;
  }

  // Default to uz-cyrillic - ensure it's saved in localStorage
  // This is important for first-time visitors
  localStorage.setItem("i18nextLng", defaultLanguage);
  return defaultLanguage;
};

// Get initial language - MUST be called before i18n.init()
const initialLanguage = getInitialLanguage();


// Monitor language changes and ensure only supported languages are used
// Also save to localStorage when language changes
// Set up BEFORE init() to ensure it's registered
i18n.on("languageChanged", (lng) => {
  // Validate language
  if (!supportedLngs.includes(lng)) {
    // If invalid language, change to default
    i18n.changeLanguage(defaultLanguage).catch(() => {
      // Fallback if changeLanguage fails
      if (typeof window !== "undefined") {
        localStorage.setItem("i18nextLng", defaultLanguage);
      }
    });
    return;
  }

  // Save to localStorage when language changes
  if (typeof window !== "undefined") {
    localStorage.setItem("i18nextLng", lng);
  }
});

// Ensure default language is properly set after initialization
// This will be called after i18n.init() completes
// Use a promise-based approach to ensure resources are loaded

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage, // Set initial language explicitly - this overrides LanguageDetector
    fallbackLng: defaultLanguage, // Single fallback to uz-cyrillic for simplicity
    debug: import.meta.env.DEV, // Enable debug in development

    detection: {
      // Only check localStorage and querystring, NOT browser navigator
      // This ensures browser language is never used for auto-detection
      // IMPORTANT: The order matters - localStorage is checked first
      order: ["localStorage", "querystring"],
      lookupLocalStorage: "i18nextLng",
      lookupQuerystring: "lang",
      caches: ["localStorage"],
      // Don't detect from browser navigator
      excludeCacheFor: ["cimode"],
    },

    // Supported languages - only these languages will be used
    supportedLngs: supportedLngs,
    
    // CRITICAL: Use "all" to load full language code (uz-cyrillic, not uz)
    // This ensures "uz-cyrillic" is loaded as "uz-cyrillic", not stripped to "uz"
    // Without this, i18next might try to load "uz" instead of "uz-cyrillic"
    load: "all",
    
    // Don't use non-explicit supported languages (strict mode)
    // This ensures only languages in supportedLngs are used
    nonExplicitSupportedLngs: false,
    
    // Compatibility mode - handle language variants properly
    compatibilityJSON: "v4",
    
    // Return the key if translation is missing (helps with debugging)
    returnEmptyString: false,
    returnNull: false,
    returnObjects: false,
    
    // Key separator for nested translations (e.g., "common.callCenter")
    keySeparator: ".",
    nsSeparator: false,
    
    // Default namespace
    defaultNS: "translation",
    ns: ["translation"],

    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    
    // React specific options
    react: {
      useSuspense: false, // Disable suspense to prevent loading issues
    },
  })
  .then(() => {
    // After initialization, verify language is set correctly
    const currentLang = i18n.language || i18n.resolvedLanguage || initialLanguage;
    
    // Ensure language is valid
    if (!currentLang || !supportedLngs.includes(currentLang)) {
      return i18n.changeLanguage(defaultLanguage);
    }
    
    // Ensure resource bundle exists
    if (!i18n.hasResourceBundle(currentLang, "translation")) {
      return i18n.changeLanguage(defaultLanguage);
    }
    
    // Everything is OK
    if (typeof window !== "undefined") {
      localStorage.setItem("i18nextLng", currentLang);
    }
  })
  .catch(() => {
    // Fallback to default language
    if (typeof window !== "undefined") {
      localStorage.setItem("i18nextLng", defaultLanguage);
    }
  });

export default i18n;
