'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Circle, FileText, CreditCard, Shield, Upload } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/accessibility/LanguageSwitcher'
import PersonalInfoStep from '@/components/onboarding/PersonalInfoStep'
import DocumentUploadStep from '@/components/onboarding/DocumentUploadStep'
import BankDetailsStep from '@/components/onboarding/BankDetailsStep'
import { 
  getCurrentUser,
  convertPersonalInfoToFrontend,
  completeOnboarding
} from '@/lib/api/onboarding'
import toast from 'react-hot-toast'

const OnboardingPage = () => {
  const t = useTranslations('onboarding')
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [onboardingData, setOnboardingData] = useState<{
    personalInfo?: any
    documents: any[]
    uploadedDocumentsS3: any[]  // Store S3 uploaded documents
    bankDetails?: any
    bankDocuments?: any[]  // Store bank-related documents (PAN, Passbook)
    verification?: any
  }>({
    personalInfo: undefined,
    documents: [],
    uploadedDocumentsS3: [],
    bankDetails: undefined,
    bankDocuments: [],
    verification: undefined
  })

  // Load onboarding status and existing data on mount
  useEffect(() => {
    loadOnboardingData()
  }, [])

  const loadOnboardingData = async () => {
    try {
      setIsLoading(true)
      
      // Get current user data
      const userData = await getCurrentUser()
      
      // Check if user is already onboarded
      if (userData.is_onboarded) {
        toast.success(t('alreadyOnboarded'))
        router.push('/dashboard')
        return
      }
      
      // Set current step from user's onboarding_step (default to 1)
      setCurrentStep(userData.onboarding_step || 1)
      
      // Track which steps are completed based on onboarding_step
      const completed: number[] = []
      if (userData.onboarding_step && userData.onboarding_step > 1) {
        for (let i = 1; i < userData.onboarding_step; i++) {
          completed.push(i)
        }
      }
      setCompletedSteps(completed)
      
      // Load personal info from user data if available
      if (userData) {
        const personalInfo = convertPersonalInfoToFrontend(userData)
        setOnboardingData(prev => ({
          ...prev,
          personalInfo: personalInfo as any
        }))
      }
      
    } catch (error: any) {
      console.error('Failed to load onboarding data:', error)
      toast.error(t('loadError'))
      
      // If error is authentication related, redirect to login
      if (error.message?.includes('authentication') || error.message?.includes('401')) {
        router.push('/login')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const steps = [
    {
      id: 1,
      title: t('steps.personalInfo.title'),
      description: t('steps.personalInfo.description'),
      icon: FileText
    },
    {
      id: 2,
      title: t('steps.documents.title'),
      description: t('steps.documents.description'),
      icon: Upload
    },
    {
      id: 3,
      title: t('steps.bankDetails.title'),
      description: t('steps.bankDetails.description'),
      icon: CreditCard
    }
  ]

  // Calculate progress: 0%, 33%, 67%, 100%
  const progress = Math.round((completedSteps.length / 3) * 100)

  const handleStepComplete = async (stepId: number, data: any) => {
    // If this is a "navigation back" event, just save state and don't advance
    const isNavigatingBack = data._navigatingBack === true;
    if (isNavigatingBack) {
      // Preserve bankDocuments state when navigating back from bank details
      if (stepId === 3) {
        setOnboardingData(prev => ({
          ...prev,
          bankDetails: {
            accountNumber: data.accountNumber,
            ifscCode: data.ifscCode,
            bankName: data.bankName,
            branchName: data.branchName,
            accountHolderName: data.accountHolderName,
          },
          bankDocuments: data.documents || [],
        }));
      }
      if (stepId > 1) {
        setCurrentStep(stepId - 1);
      }
      return;
    }

    // Update local state
    if (stepId === 1) {
      setOnboardingData(prev => ({
        ...prev,
        personalInfo: data
      }))
    } else if (stepId === 2) {
      // For documents, prevent duplicates by filtering unique s3Keys
      const s3Documents = data.uploadedDocumentsS3 || []
      // Merge with existing documents, avoiding duplicates based on s3Key or documentType
      const existingDocs = onboardingData.uploadedDocumentsS3 || []
      const mergedDocs = [...existingDocs]
      s3Documents.forEach((newDoc: any) => {
        const isDuplicate = existingDocs.some((existingDoc: any) => 
          existingDoc.s3Key === newDoc.s3Key || 
          existingDoc.documentType === newDoc.documentType
        )
        if (!isDuplicate) {
          mergedDocs.push(newDoc)
        }
      })
      setOnboardingData(prev => ({
        ...prev,
        documents: data.documents || [],
        uploadedDocumentsS3: mergedDocs
      }))
    } else if (stepId === 3) {
      // For bank details, same pattern as step 2
      const bankDocs = data.documents || []
      const s3BankDocs = data.uploadedDocumentsS3 || []
      const existingS3Docs = onboardingData.uploadedDocumentsS3 || []
      // Merge bank documents with existing documents (avoid duplicates)
      const mergedS3Docs = [...existingS3Docs]
      s3BankDocs.forEach((newDoc: any) => {
        const isDuplicate = existingS3Docs.some((existingDoc: any) => 
          existingDoc.s3Key === newDoc.s3Key || 
          existingDoc.documentType === newDoc.documentType
        )
        if (!isDuplicate) {
          mergedS3Docs.push(newDoc)
        }
      })
      setOnboardingData(prev => ({
        ...prev,
        bankDetails: {
          accountNumber: data.accountNumber,
          ifscCode: data.ifscCode,
          bankName: data.bankName,
          branchName: data.branchName,
          accountHolderName: data.accountHolderName,
        },
        bankDocuments: bankDocs,
        uploadedDocumentsS3: mergedS3Docs
      }))
      if (stepId === 3) {
        try {
          setIsLoading(true)
          // Convert personal info to backend format
          const [day, month, year] = onboardingData.personalInfo.dateOfBirth.split('/')
          const paddedMonth = month.length === 1 ? '0' + month : month
          const paddedDay = day.length === 1 ? '0' + day : day
          const isoDate = `${year}-${paddedMonth}-${paddedDay}T00:00:00Z`
          
          // Prepare DigiLocker documents
          const digilockerDocs = (onboardingData.documents || [])
            .filter((doc: any) => doc.isDigilocker)
            .map((doc: any) => ({
              s3_key: '',  // Empty string for DigiLocker documents (no S3 storage)
              document_type: doc.type,
              filename: doc.name,
              file_size: 0,
              content_type: 'application/pdf',
              is_digilocker: true,
              digilocker_id: doc.digilockerId
            }))
          
          // Prepare uploaded S3 documents
          const uploadedS3Docs = mergedS3Docs.map((doc: any) => ({
            s3_key: doc.s3Key,
            document_type: doc.documentType,
            filename: doc.fileName,
            file_size: doc.fileSize || 0,
            content_type: doc.contentType || 'application/pdf',
            is_digilocker: false,
            digilocker_id: null
          }))
          
          // Combine both DigiLocker and uploaded documents
          const uploadedDocs = [...digilockerDocs, ...uploadedS3Docs]
          // Prepare bank details (may be empty if skipped)
          const bankDetails = data.accountNumber ? {
            account_number: data.accountNumber,
            ifsc_code: data.ifscCode,
            bank_name: data.bankName,
            branch_name: data.branchName,
            account_holder_name: data.accountHolderName,
          } : undefined
          // Call complete onboarding API
          const response = await completeOnboarding({
            personal_info: {
              full_name: onboardingData.personalInfo.fullName,
              father_name: onboardingData.personalInfo.fatherName,
              mother_name: onboardingData.personalInfo.motherName,
              date_of_birth: isoDate,
              age: onboardingData.personalInfo.age,
              gender: onboardingData.personalInfo.gender,
              category: onboardingData.personalInfo.category,
              mobile_number: onboardingData.personalInfo.mobileNumber,
              email: onboardingData.personalInfo.email || null,
              address: onboardingData.personalInfo.address,
              district: onboardingData.personalInfo.district,
              state: onboardingData.personalInfo.state,
              pincode: onboardingData.personalInfo.pincode,
            } as any,
            bank_details: bankDetails as any,
            uploaded_documents: uploadedDocs
          })
          toast.success(response.message || 'Onboarding completed successfully!')
          router.push('/dashboard')
        } catch (error: any) {
          console.error('Failed to complete onboarding:', error)
          toast.error(error.message || 'Failed to complete onboarding. Please try again.')
          setIsLoading(false)
        }
        return
      }
    }
    // Mark current step as completed immediately for UI
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId])
    }
    // Move to next step (only for steps 1-2, step 3 exits via return above)
    if (stepId < 3) {
      setCurrentStep(stepId + 1)
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
            uploadedDocumentsS3={onboardingData.uploadedDocumentsS3}
            category={onboardingData.personalInfo?.category}
          />
        )
      case 3:
        return (
          <BankDetailsStep
            key={`bank-step-${currentStep}`}
            onComplete={(data) => handleStepComplete(3, data)}
            onPrevious={() => setCurrentStep(2)}
            initialData={onboardingData.bankDetails}
            initialDocuments={onboardingData.bankDocuments}
          />
        )
      default:
        return <div>Invalid step</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Language Switcher - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">{t('loading')}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t('title')}
              </h1>
              <p className="text-lg text-gray-600">
                {t('subtitle')}
              </p>
            </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">
              {t('progress')}: {Math.round(progress)}%
            </span>
            <span className="text-sm text-gray-500">
              {t('step', { current: currentStep, total: steps.length })}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isCompleted = completedSteps.includes(step.id)
            const isCurrent = currentStep === step.id
            
            return (
              <div
                key={step.id}
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors ${
                  isCompleted
                    ? 'border-green-500 bg-green-50'
                    : isCurrent
                    ? 'border-orange-500 bg-orange-50'
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
                    isCompleted ? 'text-green-900' : isCurrent ? 'text-orange-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className={`text-xs ${
                    isCompleted ? 'text-green-700' : isCurrent ? 'text-orange-700' : 'text-gray-400'
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
          </>
        )}
      </div>
    </div>
  )
}

export default OnboardingPage