'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Globe } from 'lucide-react'
import { useLanguage, SUPPORTED_LANGUAGES, LanguageCode } from '@/contexts/LanguageContext'

interface LanguageSelectorProps {
  className?: string
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className }) => {
  const { currentLanguage, setLanguage } = useLanguage()

  const handleLanguageChange = (value: string) => {
    setLanguage(value as LanguageCode)
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Globe className="h-4 w-4 text-gray-600" />
      <Select value={currentLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-32 border-none bg-transparent text-gray-700 focus:outline-none">
          <SelectValue>
            {SUPPORTED_LANGUAGES[currentLanguage].nativeName}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(SUPPORTED_LANGUAGES).map(([code, language]) => (
            <SelectItem key={code} value={code}>
              <div className="flex items-center space-x-2">
                <span>{language.nativeName}</span>
                <span className="text-gray-500 text-sm">({language.name})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

