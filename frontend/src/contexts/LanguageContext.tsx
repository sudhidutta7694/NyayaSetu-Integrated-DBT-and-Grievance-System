'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

// Statically import available locale JSON to avoid dynamic import issues in Next.js
// Only import languages that actually have files present. Others will gracefully fallback to English.
import en from '@/locales/en.json'
import hi from '@/locales/hi.json'
import bn from '@/locales/bn.json'
import mr from '@/locales/mr.json'
import ta from '@/locales/ta.json'
import te from '@/locales/te.json'

// Supported languages
export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', nativeName: 'English', code: 'en' },
  hi: { name: 'Hindi', nativeName: 'हिंदी', code: 'hi' },
  bn: { name: 'Bengali', nativeName: 'বাংলা', code: 'bn' },
  mr: { name: 'Marathi', nativeName: 'मराठी', code: 'mr' },
  ta: { name: 'Tamil', nativeName: 'தமிழ்', code: 'ta' },
  te: { name: 'Telugu', nativeName: 'తెలుగు', code: 'te' },
  // Future languages below (no JSON yet) — will fallback to English until files are added:
  gu: { name: 'Gujarati', nativeName: 'ગુજરાતી', code: 'gu' },
  kn: { name: 'Kannada', nativeName: 'ಕನ್ನಡ', code: 'kn' },
  ml: { name: 'Malayalam', nativeName: 'മലയാളം', code: 'ml' },
  pa: { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', code: 'pa' },
  or: { name: 'Odia', nativeName: 'ଓଡ଼ିଆ', code: 'or' },
  as: { name: 'Assamese', nativeName: 'অসমীয়া', code: 'as' }
} as const

// Map of available translation objects
const TRANSLATIONS: Record<string, any> = {
  en,
  hi,
  bn,
  mr,
  ta,
  te
}

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES

interface LanguageContextType {
  currentLanguage: LanguageCode
  setLanguage: (language: LanguageCode) => void
  t: (key: string, fallback?: string) => string
  isRTL: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

interface LanguageProviderProps {
  children: React.ReactNode
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en')
  const [translations, setTranslations] = useState<Record<string, any>>(TRANSLATIONS.en)

  // Update translations synchronously when language changes
  useEffect(() => {
    const next = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en
    setTranslations(next)
  }, [currentLanguage])

  // Load saved language from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('nyayasetu-language') as LanguageCode
    if (savedLanguage && SUPPORTED_LANGUAGES[savedLanguage]) {
      setCurrentLanguage(savedLanguage)
    }
  }, [])

  const setLanguage = (language: LanguageCode) => {
    setCurrentLanguage(language)
    localStorage.setItem('nyayasetu-language', language)
    
    // Update document language
    document.documentElement.lang = language
    
    // Update page title and meta description if needed
    // Title will update after translations state refreshes
    setTimeout(() => {
      const title = (TRANSLATIONS[language] || TRANSLATIONS.en)['site.title'] || 'NyayaSetu - Integrated DBT and Grievance System'
      document.title = title
    }, 0)
  }

  const t = (key: string, fallback?: string): string => {
    const keys = key.split('.')
    let value = translations
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return fallback || key
      }
    }
    
    return typeof value === 'string' ? value : (fallback || key)
  }

  const isRTL = false // Indian languages are LTR

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    t,
    isRTL
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

