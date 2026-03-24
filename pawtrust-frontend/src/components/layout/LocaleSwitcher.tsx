import { useTranslation } from 'react-i18next'

export function LocaleSwitcher() {
  const { i18n } = useTranslation()
  const current = i18n.resolvedLanguage ?? i18n.language

  return (
    <div className="flex items-center gap-1 text-sm font-medium">
      <button
        onClick={() => i18n.changeLanguage('ro')}
        className={`px-1 ${current === 'ro' ? 'font-bold underline text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
        aria-pressed={current === 'ro'}
      >
        RO
      </button>
      <span className="text-gray-300">|</span>
      <button
        onClick={() => i18n.changeLanguage('ru')}
        className={`px-1 ${current === 'ru' ? 'font-bold underline text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
        aria-pressed={current === 'ru'}
      >
        RU
      </button>
    </div>
  )
}
