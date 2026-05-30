import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SUPPORTED_LANGUAGES = [
  'en', 'de', 'fr', 'es', 'it', 'pt',
  'ja', 'ko', 'nl', 'sv', 'tr', 'zh',
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// IP → ülke kodu → dil eşlemesi
const COUNTRY_TO_LANG: Record<string, SupportedLanguage> = {
  US: 'en', GB: 'en', AU: 'en', CA: 'en', NZ: 'en', IE: 'en',
  DE: 'de', AT: 'de', CH: 'de',
  FR: 'fr', BE: 'fr', LU: 'fr',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es',
  IT: 'it',
  PT: 'pt', BR: 'pt',
  JP: 'ja',
  KR: 'ko',
  NL: 'nl',
  SE: 'sv',
  TR: 'tr',
  CN: 'zh', TW: 'zh', HK: 'zh',
};

const resources = {
  en: { common: require('./locales/en/common.json'), pets: require('./locales/en/pets.json'), health: require('./locales/en/health.json'), paywall: require('./locales/en/paywall.json') },
  de: { common: require('./locales/de/common.json'), pets: require('./locales/de/pets.json'), health: require('./locales/de/health.json'), paywall: require('./locales/de/paywall.json') },
  fr: { common: require('./locales/fr/common.json'), pets: require('./locales/fr/pets.json'), health: require('./locales/fr/health.json'), paywall: require('./locales/fr/paywall.json') },
  es: { common: require('./locales/es/common.json'), pets: require('./locales/es/pets.json'), health: require('./locales/es/health.json'), paywall: require('./locales/es/paywall.json') },
  it: { common: require('./locales/it/common.json'), pets: require('./locales/it/pets.json'), health: require('./locales/it/health.json'), paywall: require('./locales/it/paywall.json') },
  pt: { common: require('./locales/pt/common.json'), pets: require('./locales/pt/pets.json'), health: require('./locales/pt/health.json'), paywall: require('./locales/pt/paywall.json') },
  ja: { common: require('./locales/ja/common.json'), pets: require('./locales/ja/pets.json'), health: require('./locales/ja/health.json'), paywall: require('./locales/ja/paywall.json') },
  ko: { common: require('./locales/ko/common.json'), pets: require('./locales/ko/pets.json'), health: require('./locales/ko/health.json'), paywall: require('./locales/ko/paywall.json') },
  nl: { common: require('./locales/nl/common.json'), pets: require('./locales/nl/pets.json'), health: require('./locales/nl/health.json'), paywall: require('./locales/nl/paywall.json') },
  sv: { common: require('./locales/sv/common.json'), pets: require('./locales/sv/pets.json'), health: require('./locales/sv/health.json'), paywall: require('./locales/sv/paywall.json') },
  tr: { common: require('./locales/tr/common.json'), pets: require('./locales/tr/pets.json'), health: require('./locales/tr/health.json'), paywall: require('./locales/tr/paywall.json') },
  zh: { common: require('./locales/zh/common.json'), pets: require('./locales/zh/pets.json'), health: require('./locales/zh/health.json'), paywall: require('./locales/zh/paywall.json') },
};

function detectFromDevice(): SupportedLanguage {
  const locales = getLocales();
  for (const locale of locales) {
    const lang = locale.languageCode as SupportedLanguage;
    if (SUPPORTED_LANGUAGES.includes(lang)) return lang;
  }
  return 'en';
}

async function detectFromIP(): Promise<SupportedLanguage | null> {
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    const country = data.country_code as string;
    return COUNTRY_TO_LANG[country] ?? null;
  } catch {
    return null;
  }
}

i18n.use(initReactI18next).init({
  resources,
  lng: detectFromDevice(),
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'pets', 'health', 'paywall'],
  interpolation: { escapeValue: false },
});

export async function changeLanguage(lang: SupportedLanguage) {
  await i18n.changeLanguage(lang);
  await AsyncStorage.setItem('user_language', lang);
}

export async function restoreLanguage() {
  // 1. Önce kayıtlı tercih
  const saved = await AsyncStorage.getItem('user_language');
  if (saved && SUPPORTED_LANGUAGES.includes(saved as SupportedLanguage)) {
    await i18n.changeLanguage(saved);
    return;
  }
  // 2. Cihaz diline bak
  const device = detectFromDevice();
  // 3. IP'den ülke kontrolü (background, ağır değil)
  const ipLang = await detectFromIP();
  // IP ve cihaz dili aynıysa veya IP null ise cihaz dilini kullan
  const final = ipLang ?? device;
  await i18n.changeLanguage(final);
  // İlk kez kullanıcıya göster, kaydetme (kullanıcı seçmedi henüz)
}

export default i18n;
