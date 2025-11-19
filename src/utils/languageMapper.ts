/**
 * Maps i18n language codes to API language codes
 * @param i18nLang - The i18n language code (e.g., 'uz-cyrillic', 'uz-latin', 'ru', etc.)
 * @returns The API language code (e.g., 'kr', 'uz', 'ru', etc.)
 */
export const mapI18nToApiLanguage = (i18nLang: string): string => {
  const langMap: Record<string, string> = {
    'uz': 'uz',
    'uz-cyrillic': 'kr',
    'uz-latin': 'uz',
    'ru': 'ru',
    'en': 'en',
    'kz': 'kz',
    'ky': 'kg',
    'tg': 'tj',
  };
  return langMap[i18nLang] || 'kr';
};

/**
 * Maps i18n language codes to ServiceLocale type
 * Used for services that require ServiceLocale type
 * @param i18nLang - The i18n language code
 * @returns The ServiceLocale code
 */
export const mapI18nToServiceLocale = (i18nLang: string): 'uz' | 'kr' | 'ru' | 'en' | 'kz' | 'kg' | 'tj' => {
  const langMap: Record<string, 'uz' | 'kr' | 'ru' | 'en' | 'kz' | 'kg' | 'tj'> = {
    'uz': 'uz',
    'uz-cyrillic': 'kr',
    'uz-latin': 'uz',
    'ru': 'ru',
    'en': 'en',
    'kz': 'kz',
    'ky': 'kg',
    'tg': 'tj',
  };
  return langMap[i18nLang] || 'kr';
};

