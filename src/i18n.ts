import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../public/locales/en/translation.json';
import id from '../public/locales/id/translation.json';

i18n
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    debug: false,
    resources: {
      en: { translation: en },
      id: { translation: id }
    },
    interpolation: { 
      escapeValue: false,
      prefix: '{',
      suffix: '}'
    }
  });

export default i18n; 