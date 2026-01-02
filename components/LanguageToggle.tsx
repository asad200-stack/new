'use client'

import { useState, useEffect } from 'react'

type Language = 'en' | 'ar'

export default function LanguageToggle() {
  const [lang, setLang] = useState<Language>('en')

  useEffect(() => {
    // Get language from localStorage or cookie
    const savedLang = localStorage.getItem('lang') as Language
    if (savedLang && (savedLang === 'en' || savedLang === 'ar')) {
      setLang(savedLang)
      applyLanguage(savedLang)
    }
  }, [])

  const applyLanguage = (newLang: Language) => {
    document.documentElement.lang = newLang
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr'
    localStorage.setItem('lang', newLang)
  }

  const toggleLanguage = () => {
    const newLang: Language = lang === 'en' ? 'ar' : 'en'
    setLang(newLang)
    applyLanguage(newLang)
  }

  return (
    <button
      onClick={toggleLanguage}
      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition text-sm font-medium"
      aria-label="Toggle language"
    >
      {lang === 'en' ? 'العربية' : 'English'}
    </button>
  )
}
