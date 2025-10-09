'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Shield, Menu, X, ChevronDown, Eye } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { LanguageSelector } from '@/components/accessibility/LanguageSelector'
export function GovernmentHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false)
  const loginDropdownRef = useRef<HTMLDivElement>(null)
  const { t } = useLanguage()
  // Removed notifications & status legend UI per request

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (loginDropdownRef.current && !loginDropdownRef.current.contains(event.target as Node)) {
        setLoginDropdownOpen(false);
      }
    }
    if (loginDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [loginDropdownOpen]);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      {/* Main Header */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex items-center space-x-3">
          <a href="/" className="-m-1.5 p-1.5 flex items-center space-x-2" style={{textDecoration: 'none'}}>
            <div className="h-8 w-8 rounded-lg bg-orange-600 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">{t('home.title', 'NyayaSetu')}</span>
          </a>
        </div>
        {/* Language, Login, and Menu */}
        <div className="flex items-center gap-x-4">
          {/* Notifications & Status Legend removed */}
          {/* Login Dropdown - hidden on mobile */}
          <div className="relative hidden md:block" ref={loginDropdownRef}>
            <button
              className="border border-orange-200 bg-white hover:border-orange-400 px-4 py-2 rounded-lg shadow transition-colors flex items-center"
              onClick={() => setLoginDropdownOpen((open) => !open)}
              aria-haspopup="true"
              aria-expanded={loginDropdownOpen}
              aria-label="Login options"
            >
              {t('header.login', 'Login')}
              <ChevronDown className="ml-2 h-4 w-4" />
            </button>
            {loginDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fade-in" role="menu" aria-label="Login options">
                <ul className="py-2">
                  <li>
                    <a
                      href="/login"
                      className="block px-5 py-3 text-gray-800 hover:bg-orange-50 hover:text-orange-700 transition-colors text-left w-full font-semibold"
                      onClick={() => setLoginDropdownOpen(false)}
                      role="menuitem"
                    >
                      {t('header.loginCitizen', 'Common User')}
                    </a>
                  </li>
                  <li>
                    <a
                      href="/admin/login"
                      className="block px-5 py-3 text-gray-800 hover:bg-orange-50 hover:text-orange-700 transition-colors text-left w-full font-semibold"
                      onClick={() => setLoginDropdownOpen(false)}
                      role="menuitem"
                    >
                      {t('header.loginAuthority', 'Authority Login')}
                    </a>
                  </li>
                </ul>
              </div>
            )}
          </div>
          {/* LanguageSelector - hidden on mobile */}
          <div className="hidden md:block">
            <LanguageSelector />
          </div>
          {/* Accessibility Icon Button - always visible on desktop, hidden on mobile */}
          <button
            onClick={() => {
              const evt = new CustomEvent('open-screen-reader')
              document.dispatchEvent(evt)
              const screenReader = document.querySelector('[data-screen-reader]')
              if (screenReader) {
                (screenReader as HTMLElement).scrollIntoView({ behavior: 'smooth' })
              }
            }}
            className="hidden md:inline hover:bg-orange-50 focus:outline-none text-gray-700 font-medium px-2 py-1 rounded transition-colors"
            aria-label="Screen Reader Accessibility"
            role="button"
          >
            <Eye className="h-5 w-5" />
          </button>
          {/* Mobile menu button - only visible on mobile */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-orange-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="fixed inset-0 z-50" />
            <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
              <div className="flex items-center justify-between">
                <a href="/" className="-m-1.5 p-1.5 flex items-center space-x-2" style={{textDecoration: 'none'}}>
                  <div className="h-8 w-8 rounded-lg bg-orange-600 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">{t('home.title', 'NyayaSetu')}</span>
                </a>
                <button
                  type="button"
                  className="-m-2.5 rounded-md p-2.5 text-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-6 flex flex-col gap-4">
                {/* Login Dropdown (mobile) */}
                <div className="relative" ref={loginDropdownRef}>
                  <button
                    className="border border-orange-200 bg-white hover:border-orange-400 px-4 py-2 rounded-lg shadow transition-colors flex items-center w-full justify-between"
                    onClick={() => setLoginDropdownOpen((open) => !open)}
                    aria-haspopup="true"
                    aria-expanded={loginDropdownOpen}
                    aria-label="Login options"
                  >
                    {t('header.login', 'Login')}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </button>
                  {loginDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fade-in" role="menu" aria-label="Login options">
                      <ul className="py-2">
                        <li>
                          <a
                            href="/login"
                            className="block px-6 py-3 text-gray-800 hover:bg-orange-50 hover:text-orange-700 transition-colors text-left w-full font-semibold"
                            onClick={() => setLoginDropdownOpen(false)}
                            role="menuitem"
                          >
                            {t('header.loginIndividual', 'Common Individual')}
                          </a>
                        </li>
                        <li>
                          <a
                            href="/login/district-authority"
                            className="block px-6 py-3 text-gray-800 hover:bg-orange-50 hover:text-orange-700 transition-colors text-left w-full font-semibold"
                            onClick={() => setLoginDropdownOpen(false)}
                            role="menuitem"
                          >
                            {t('header.loginDistrict', 'District Authorities')}
                          </a>
                        </li>
                        <li>
                          <a
                            href="/login/social-welfare"
                            className="block px-6 py-3 text-gray-800 hover:bg-orange-50 hover:text-orange-700 transition-colors text-left w-full font-semibold"
                            onClick={() => setLoginDropdownOpen(false)}
                            role="menuitem"
                          >
                            {t('header.loginSocialWelfare', 'Social Welfare')}
                          </a>
                        </li>
                        <li>
                          <a
                            href="/login/financial-institution"
                            className="block px-6 py-3 text-gray-800 hover:bg-orange-50 hover:text-orange-700 transition-colors text-left w-full font-semibold"
                            onClick={() => setLoginDropdownOpen(false)}
                            role="menuitem"
                          >
                            {t('header.loginFinancial', 'Financial Institutions')}
                          </a>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
                {/* Language Selector (mobile) */}
                <LanguageSelector />
                {/* Accessibility Icon Button (mobile) */}
                <button
                  onClick={() => {
                    const evt = new CustomEvent('open-screen-reader')
                    document.dispatchEvent(evt)
                    const screenReader = document.querySelector('[data-screen-reader]')
                    if (screenReader) {
                      (screenReader as HTMLElement).scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                  className="flex items-center justify-center border border-orange-200 bg-white hover:border-orange-400 px-4 py-2 rounded-lg shadow w-full"
                  aria-label="Screen Reader Accessibility"
                  role="button"
                >
                  Accessibility
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
