'use client'

import React from 'react'
import { Shield, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { LanguageSelector } from '@/components/accessibility/LanguageSelector'
import Breadcrumb from './Breadcrumb'

export function GovernmentHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { t } = useLanguage()

  return (
    <header className="bg-white shadow-lg border-b-4 border-orange-500">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-orange-600 to-green-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span>🇮🇳 {t('header.government', 'भारत सरकार | Government of India')}</span>
              <span>|</span>
              <span>{t('header.ministry', 'सामाजिक न्याय और अधिकारिता मंत्रालय | Ministry of Social Justice & Empowerment')}</span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => {
                  const mainContent = document.querySelector('main')
                  if (mainContent) {
                    mainContent.focus()
                    mainContent.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
                className="hover:underline focus:outline-none focus:underline"
              >
                {t('header.skipToContent', 'Skip to main content')}
              </button>
              <span>|</span>
              <button 
                onClick={() => {
                  const screenReader = document.querySelector('[data-screen-reader]')
                  if (screenReader) {
                    screenReader.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
                className="hover:underline focus:outline-none focus:underline"
              >
                {t('header.screenReaderAccess', 'Screen Reader Access')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('home.title', 'न्यायसेतु')}</h1>
                <p className="text-sm text-gray-600">{t('home.subtitle', 'NyayaSetu - DBT & Grievance System')}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-gray-700 hover:text-orange-600 font-medium">
              {t('navigation.home', 'होम | Home')}
            </a>
            <a href="/about" className="text-gray-700 hover:text-orange-600 font-medium">
              {t('navigation.about', 'के बारे में | About')}
            </a>
            <a href="/services" className="text-gray-700 hover:text-orange-600 font-medium">
              {t('navigation.services', 'सेवाएं | Services')}
            </a>
            <a href="/contact" className="text-gray-700 hover:text-orange-600 font-medium">
              {t('navigation.contact', 'संपर्क | Contact')}
            </a>
            <a href="/help" className="text-gray-700 hover:text-orange-600 font-medium">
              {t('navigation.help', 'सहायता | Help')}
            </a>
          </nav>

          {/* Language and Menu */}
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-orange-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <a href="/" className="text-gray-700 hover:text-orange-600 font-medium">
                {t('navigation.home', 'होम | Home')}
              </a>
              <a href="/about" className="text-gray-700 hover:text-orange-600 font-medium">
                {t('navigation.about', 'के बारे में | About')}
              </a>
              <a href="/services" className="text-gray-700 hover:text-orange-600 font-medium">
                {t('navigation.services', 'सेवाएं | Services')}
              </a>
              <a href="/contact" className="text-gray-700 hover:text-orange-600 font-medium">
                {t('navigation.contact', 'संपर्क | Contact')}
              </a>
              <a href="/help" className="text-gray-700 hover:text-orange-600 font-medium">
                {t('navigation.help', 'सहायता | Help')}
              </a>
            </nav>
          </div>
        )}
      </div>

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <Breadcrumb />
        </div>
      </div>
    </header>
  )
}
