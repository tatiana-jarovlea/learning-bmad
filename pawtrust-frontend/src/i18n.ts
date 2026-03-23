import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import HttpBackend from 'i18next-http-backend'
import { useAuthStore } from '@/store/authStore'

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: useAuthStore.getState().locale,
    fallbackLng: 'ro',
    supportedLngs: ['ro', 'ru'],
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
