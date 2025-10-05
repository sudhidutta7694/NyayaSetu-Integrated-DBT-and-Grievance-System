'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
// import { Progress } from '@/components/ui/progress'
import { CheckCircle, Circle, FileText, CreditCard, Shield, Upload } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import PersonalInfoStep from '@/components/onboarding/PersonalInfoStep'
import DocumentUploadStep from '@/components/onboarding/DocumentUploadStep'
import BankDetailsStep from '@/components/onboarding/BankDetailsStep'
import VerificationStep from '@/components/onboarding/VerificationStep'

const OnboardingPage = () => {
  const { t } = useLanguage()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [onboardingData, setOnboardingData] = useState({
    personalInfo: undefined,
    documents: [],
    bankDetails: undefined,
    verification: undefined
  })

  const steps = [
    {
      id: 1,
      title: t('onboarding.step1.title', 'Personal Information'),
      description: t('onboarding.step1.description', 'Basic personal details'),
      icon: FileText
    },
    {
      id: 2,
      title: t('onboarding.step2.title', 'Document Upload'),
      description: t('onboarding.step2.description', 'Upload required documents'),
      icon: Upload
    },
    {
      id: 3,
      title: t('onboarding.step3.title', 'Bank Details'),
      description: t('onboarding.step3.description', 'Bank account information'),
      icon: CreditCard
    },
    {
      id: 4,
      title: t('onboarding.step4.title', 'Verification'),
      description: t('onboarding.step4.description', 'Document verification'),
      icon: Shield
    }
  ]

  const progress = (currentStep / steps.length) * 100

  const handleStepComplete = (stepId: number, data: any) => {
    setOnboardingData(prev => ({
      ...prev,
      [steps[stepId - 1].title.toLowerCase().replace(' ', '')]: data
    }))
    
    if (stepId < steps.length) {
      setCurrentStep(stepId + 1)
    } else {
      // Onboarding complete
      router.push('/dashboard')
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoStep
            onComplete={(data) => handleStepComplete(1, data)}
            onPrevious={() => setCurrentStep(1)}
            initialData={onboardingData.personalInfo}
          />
        )
      case 2:
        return (
          <DocumentUploadStep
            onComplete={(data) => handleStepComplete(2, data)}
            onPrevious={() => setCurrentStep(1)}
            initialData={onboardingData.documents}
          />
        )
      case 3:
        return (
          <BankDetailsStep
            onComplete={(data) => handleStepComplete(3, data)}
            onPrevious={() => setCurrentStep(2)}
            initialData={onboardingData.bankDetails}
          />
        )
      case 4:
        return (
          <VerificationStep
            onComplete={() => handleStepComplete(4, {})}
            onPrevious={() => setCurrentStep(3)}
            personalInfo={onboardingData.personalInfo}
            documents={onboardingData.documents}
            bankDetails={onboardingData.bankDetails}
          />
        )
      default:
        return <div>Invalid step</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('onboarding.title', 'Complete Your Profile')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('onboarding.subtitle', 'Please complete all steps to access government services')}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">
              {t('onboarding.progress', 'Progress')}: {Math.round(progress)}%
            </span>
            <span className="text-sm text-gray-500">
              {t('onboarding.step', 'Step')} {currentStep} {t('onboarding.of', 'of')} {steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-orange-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Steps Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isCompleted = currentStep > step.id
            const isCurrent = currentStep === step.id
            
            return (
              <div
                key={step.id}
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors ${
                  isCurrent
                    ? 'border-orange-500 bg-orange-50'
                    : isCompleted
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className={`flex-shrink-0 ${
                  isCompleted ? 'text-green-600' : isCurrent ? 'text-orange-600' : 'text-gray-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <Icon className="h-6 w-6" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${
                    isCurrent ? 'text-orange-900' : isCompleted ? 'text-green-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className={`text-xs ${
                    isCurrent ? 'text-orange-700' : isCompleted ? 'text-green-700' : 'text-gray-400'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Current Step Content */}
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* Help Section */}
        <div className="text-center">
          <div className="text-sm text-gray-500">
            {t('onboarding.help', 'Need help?')} 
            <a href="/help" className="text-orange-600 hover:text-orange-700 ml-1">
              {t('onboarding.contact', 'Contact Support')}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingPage