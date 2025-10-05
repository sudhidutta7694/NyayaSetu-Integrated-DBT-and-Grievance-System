'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Volume2, 
  VolumeX, 
  Type, 
  Eye, 
  EyeOff,
  Plus,
  Minus,
  RotateCcw
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface ScreenReaderProps {
  className?: string
}

export const ScreenReader: React.FC<ScreenReaderProps> = ({ className }) => {
  const { t, currentLanguage } = useLanguage()
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [fontSize, setFontSize] = useState(16)
  const [highContrast, setHighContrast] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const speechSynthesis = useRef<SpeechSynthesis | null>(null)
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      speechSynthesis.current = window.speechSynthesis
    }
  }, [])

  useEffect(() => {
    // Apply font size changes
    document.documentElement.style.fontSize = `${fontSize}px`
    
    return () => {
      document.documentElement.style.fontSize = ''
    }
  }, [fontSize])

  useEffect(() => {
    // Apply high contrast
    if (highContrast) {
      document.body.classList.add('high-contrast')
    } else {
      document.body.classList.remove('high-contrast')
    }
    
    return () => {
      document.body.classList.remove('high-contrast')
    }
  }, [highContrast])

  const speakText = (text: string) => {
    if (!speechSynthesis.current) return

    // Stop any current speech
    stopSpeaking()

    const utterance = new SpeechSynthesisUtterance(text)
    
    // Set voice based on language
    const voices = speechSynthesis.current.getVoices()
  const preferredVoice = voices.find((voice: SpeechSynthesisVoice) => {
      const langCode = currentLanguage === 'hi' ? 'hi-IN' : 
                      currentLanguage === 'bn' ? 'bn-IN' :
                      currentLanguage === 'mr' ? 'mr-IN' :
                      currentLanguage === 'ta' ? 'ta-IN' :
                      currentLanguage === 'te' ? 'te-IN' :
                      'en-IN'
      return voice.lang === langCode || voice.lang.startsWith(currentLanguage)
    })

    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 0.8

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    currentUtterance.current = utterance
    speechSynthesis.current.speak(utterance)
  }

  const stopSpeaking = () => {
    if (speechSynthesis.current) {
      speechSynthesis.current.cancel()
      setIsSpeaking(false)
    }
  }

  const speakPage = () => {
    const mainContent = document.querySelector('main')
    if (mainContent) {
      const text = mainContent.innerText || mainContent.textContent || ''
      speakText(text)
    }
  }

  const increaseFontSize = () => {
    setFontSize((prev: number) => Math.min(prev + 2, 24))
  }

  const decreaseFontSize = () => {
    setFontSize((prev: number) => Math.max(prev - 2, 12))
  }

  const resetFontSize = () => {
    setFontSize(16)
  }

  const toggleHighContrast = () => {
    setHighContrast((prev: boolean) => !prev)
  }

  const skipToContent = () => {
    const mainContent = document.querySelector('main')
    if (mainContent) {
      mainContent.focus()
      mainContent.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!isExpanded) return
      if (!wrapperRef.current) return
      if (!wrapperRef.current.contains(e.target as Node)) {
        setIsExpanded(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isExpanded])

  // Listen for a custom event to open the screen reader from elsewhere (e.g., header)
  useEffect(() => {
    const handleOpen = (e: Event) => {
      setIsExpanded(true)
      // scroll into view when opened
      setTimeout(() => {
        if (wrapperRef.current) {
          wrapperRef.current.scrollIntoView({ behavior: 'smooth' })
        }
      }, 0)
    }

    document.addEventListener('open-screen-reader', handleOpen as EventListener)

    return () => {
      document.removeEventListener('open-screen-reader', handleOpen as EventListener)
    }
  }, [])

  return (
    <div ref={wrapperRef} data-screen-reader className={`fixed top-4 right-4 z-50 ${className}`}> 
      {/* The component is present in the DOM (so header can reference it via [data-screen-reader])
          The full dialog is rendered only when expanded. */}
      {isExpanded && (
        <Card className="w-80 shadow-lg border-2 border-orange-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5 text-orange-600" />
                {t('accessibility.screenReader', 'Screen Reader')}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1"
                aria-label={t('accessibility.closeScreenReader', 'Close screen reader dialog')}
              >
                {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
          {/* Skip to Content */}
          <Button
            onClick={skipToContent}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            {t('header.skipToContent', 'Skip to main content')}
          </Button>

          {/* Text to Speech Controls */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">
              {t('accessibility.textToSpeech', 'Text to Speech')}
            </h4>
            <div className="flex gap-2">
              <Button
                onClick={speakPage}
                disabled={isSpeaking}
                className="flex-1 bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <Volume2 className="h-4 w-4 mr-1" />
                {t('accessibility.speakPage', 'Speak Page')}
              </Button>
              <Button
                onClick={stopSpeaking}
                disabled={!isSpeaking}
                variant="outline"
                size="sm"
              >
                <VolumeX className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Font Size Controls */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">
              {t('accessibility.fontSize', 'Font Size')}
            </h4>
            <div className="flex items-center gap-2">
              <Button
                onClick={decreaseFontSize}
                variant="outline"
                size="sm"
                className="p-2"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[3rem] text-center">
                {fontSize}px
              </span>
              <Button
                onClick={increaseFontSize}
                variant="outline"
                size="sm"
                className="p-2"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                onClick={resetFontSize}
                variant="ghost"
                size="sm"
                className="p-2"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* High Contrast Toggle */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">
              {t('accessibility.contrast', 'Contrast')}
            </h4>
            <Button
              onClick={toggleHighContrast}
              variant={highContrast ? "default" : "outline"}
              className="w-full"
              size="sm"
            >
              <Type className="h-4 w-4 mr-2" />
              {highContrast 
                ? t('accessibility.normalContrast', 'Normal Contrast')
                : t('accessibility.highContrast', 'High Contrast')
              }
            </Button>
          </div>

          {/* Language Info */}
          <div className="text-xs text-gray-500 pt-2 border-t">
            {t('accessibility.currentLanguage', 'Current Language')}: {currentLanguage.toUpperCase()}
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  )
}

