'use client'

import React, { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { ChevronDown } from 'lucide-react'

type LocaleCode = 'en' | 'hi' | 'bn' | 'te' | 'mr' | 'ta' | 'gu' | 'kn' | 'ml' | 'pa' | 'or' | 'as'

const languageNames: Record<LocaleCode, string> = {
  en: 'English',
  hi: 'हिन्दी',
  bn: 'বাংলা',
  te: 'తెలుగు',
  mr: 'मराठी',
  ta: 'தமிழ்',
  gu: 'ગુજરાતી',
  kn: 'ಕನ್ನಡ',
  ml: 'മലയാളം',
  pa: 'ਪੰਜਾਬੀ',
  or: 'ଓଡ଼ିଆ',
  as: 'অসমীয়া'
}

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const [currentLocale, setCurrentLocale] = useState<LocaleCode>('en')
  const [mounted, setMounted] = useState(false)

  // Only read cookie on client side to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
    const locale = (Cookies.get('locale') || 'en') as LocaleCode
    setCurrentLocale(locale)
  }, [])

  const switchLanguage = (locale: LocaleCode) => {
    Cookies.set('locale', locale, { expires: 365 })
    setCurrentLocale(locale)
    router.refresh()
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="relative group">
        <button className="border border-orange-200 bg-white hover:border-orange-400 px-4 py-2 rounded-lg shadow transition-colors flex items-center gap-2">
          <span className="text-sm font-medium">English</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="relative group">
      <button className="border border-orange-200 bg-white hover:border-orange-400 px-4 py-2 rounded-lg shadow transition-colors flex items-center gap-2">
        <span className="text-sm font-medium">{languageNames[currentLocale]}</span>
        <ChevronDown className="h-4 w-4" />
      </button>
      
      {/* Dropdown */}
      <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 max-h-96 overflow-y-auto">
        <ul className="py-2">
          {Object.entries(languageNames).map(([code, name]) => (
            <li key={code}>
              <button
                onClick={() => switchLanguage(code as LocaleCode)}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-orange-50 hover:text-orange-700 transition-colors ${
                  currentLocale === code ? 'bg-orange-50 text-orange-700 font-semibold' : 'text-gray-800'
                }`}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
