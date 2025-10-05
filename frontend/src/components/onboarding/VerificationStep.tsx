'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileText,
  CreditCard,
  User,
  Bell,
  ExternalLink,
  RefreshCw
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import toast from 'react-hot-toast'

interface VerificationStepProps {
  onComplete: () => void
  onPrevious: () => void
  personalInfo?: any
  documents?: any[]
  bankDetails?: any
}

interface VerificationStatus {
  personalInfo: 'PENDING' | 'VERIFIED' | 'REJECTED'
  documents: 'PENDING' | 'VERIFIED' | 'REJECTED'
  bankDetails: 'PENDING' | 'VERIFIED' | 'REJECTED'
  overall: 'PENDING' | 'VERIFIED' | 'REJECTED'
}

export default function VerificationStep({ onComplete, onPrevious, personalInfo, documents, bankDetails }: VerificationStepProps) {
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    personalInfo: 'PENDING',
    documents: 'PENDING',
    bankDetails: 'PENDING',
    overall: 'PENDING',
  })
  const [verificationProgress, setVerificationProgress] = useState(0)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'REJECTED':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return t('verification.verified', 'Verified')
      case 'REJECTED':
        return t('verification.rejected', 'Rejected')
      default:
        return t('verification.pending', 'Pending')
    }
  }

  const simulateVerification = async () => {
    setIsLoading(true)
    setVerificationProgress(0)

    // Simulate verification process
    const steps = [
      { step: 'personalInfo', delay: 1000 },
      { step: 'documents', delay: 2000 },
      { step: 'bankDetails', delay: 1500 },
    ]

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, steps[i].delay))
      
      setVerificationStatus(prev => ({
        ...prev,
        [steps[i].step]: 'VERIFIED' as const,
      }))
      
      setVerificationProgress(((i + 1) / steps.length) * 100)
    }

    // Final verification
    await new Promise(resolve => setTimeout(resolve, 500))
    setVerificationStatus(prev => ({
      ...prev,
      overall: 'VERIFIED' as const,
    }))

    setIsLoading(false)
    toast.success('Verification completed successfully!')
  }

  const handleComplete = () => {
    if (verificationStatus.overall === 'VERIFIED') {
      onComplete()
    } else {
      toast.error('Please complete verification first')
    }
  }

  const verificationSteps = [
    {
      id: 'personalInfo',
      title: t('verification.personalInfo', 'Personal Information'),
      description: t('verification.personalInfoDesc', 'Verifying your personal details'),
      icon: User,
      status: verificationStatus.personalInfo,
    },
    {
      id: 'documents',
      title: t('verification.documents', 'Document Verification'),
      description: t('verification.documentsDesc', 'Verifying uploaded documents'),
      icon: FileText,
      status: verificationStatus.documents,
    },
    {
      id: 'bankDetails',
      title: t('verification.bankDetails', 'Bank Account Verification'),
      description: t('verification.bankDetailsDesc', 'Verifying bank account details'),
      icon: CreditCard,
      status: verificationStatus.bankDetails,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-orange-600" />
          <span>{t('onboarding.step4.title', 'Verification')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Verification Overview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">
              {t('verification.overview', 'Verification Overview')}
            </h3>
            <p className="text-sm text-blue-800">
              {t('verification.overviewDesc', 'Your information will be verified by our team. This process typically takes 1-2 business days. You will receive notifications about the verification status.')}
            </p>
          </div>

          {/* Verification Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{t('verification.progress', 'Verification Progress')}</h3>
              <span className="text-sm text-gray-600">{Math.round(verificationProgress)}%</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-orange-600 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${verificationProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Verification Steps */}
          <div className="space-y-4">
            {verificationSteps.map((step) => {
              const Icon = step.icon
              return (
                <div key={step.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5 text-gray-500" />
                      <div>
                        <h4 className="font-medium">{step.title}</h4>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(step.status)}
                      <Badge className={getStatusColor(step.status)}>
                        {getStatusText(step.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Overall Status */}
          <div className={`border rounded-lg p-4 ${
            verificationStatus.overall === 'VERIFIED' 
              ? 'bg-green-50 border-green-200' 
              : verificationStatus.overall === 'REJECTED'
              ? 'bg-red-50 border-red-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className={`h-6 w-6 ${
                  verificationStatus.overall === 'VERIFIED' 
                    ? 'text-green-600' 
                    : verificationStatus.overall === 'REJECTED'
                    ? 'text-red-600'
                    : 'text-yellow-600'
                }`} />
                <div>
                  <h3 className={`font-medium ${
                    verificationStatus.overall === 'VERIFIED' 
                      ? 'text-green-800' 
                      : verificationStatus.overall === 'REJECTED'
                      ? 'text-red-800'
                      : 'text-yellow-800'
                  }`}>
                    {t('verification.overallStatus', 'Overall Verification Status')}
                  </h3>
                  <p className={`text-sm ${
                    verificationStatus.overall === 'VERIFIED' 
                      ? 'text-green-700' 
                      : verificationStatus.overall === 'REJECTED'
                      ? 'text-red-700'
                      : 'text-yellow-700'
                  }`}>
                    {verificationStatus.overall === 'VERIFIED' 
                      ? t('verification.overallSuccess', 'All verifications completed successfully!')
                      : verificationStatus.overall === 'REJECTED'
                      ? t('verification.overallFailed', 'Some verifications failed. Please check and resubmit.')
                      : t('verification.overallPending', 'Verification in progress...')
                    }
                  </p>
                </div>
              </div>
              
              <Badge className={getStatusColor(verificationStatus.overall)}>
                {getStatusText(verificationStatus.overall)}
              </Badge>
            </div>
          </div>

          {/* Verification Actions */}
          <div className="space-y-4">
            {verificationStatus.overall === 'PENDING' && (
              <div className="text-center">
                <Button
                  onClick={simulateVerification}
                  disabled={isLoading}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      {t('verification.verifying', 'Verifying...')}
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      {t('verification.startVerification', 'Start Verification')}
                    </>
                  )}
                </Button>
              </div>
            )}

            {verificationStatus.overall === 'VERIFIED' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="font-medium text-green-800">
                      {t('verification.successTitle', 'Verification Complete!')}
                    </h3>
                    <p className="text-sm text-green-700">
                      {t('verification.successMessage', 'Your profile has been successfully verified. You can now access all government services and benefits.')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {verificationStatus.overall === 'REJECTED' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                  <div>
                    <h3 className="font-medium text-red-800">
                      {t('verification.failedTitle', 'Verification Failed')}
                    </h3>
                    <p className="text-sm text-red-700">
                      {t('verification.failedMessage', 'Some of your information could not be verified. Please check the details and resubmit.')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notification Settings */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium flex items-center space-x-2 mb-3">
              <Bell className="h-5 w-5" />
              <span>{t('verification.notifications', 'Notification Settings')}</span>
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• {t('verification.notification1', 'SMS notifications for verification status updates')}</p>
              <p>• {t('verification.notification2', 'Email notifications for important updates')}</p>
              <p>• {t('verification.notification3', 'Push notifications for mobile app users')}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              disabled={isLoading}
            >
              {t('onboarding.previous', 'Previous')}
            </Button>
            <Button
              onClick={handleComplete}
              className="bg-green-600 hover:bg-green-700"
              disabled={isLoading || verificationStatus.overall !== 'VERIFIED'}
            >
              {t('onboarding.complete', 'Complete Onboarding')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}