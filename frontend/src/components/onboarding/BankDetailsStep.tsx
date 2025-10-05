'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  Building2,
  MapPin,
  Hash,
  User,
  Shield,
  Loader2
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import toast from 'react-hot-toast'

const bankDetailsSchema = z.object({
  accountNumber: z.string()
    .min(9, 'Account number must be at least 9 digits')
    .max(18, 'Account number must be at most 18 digits')
    .regex(/^\d+$/, 'Account number must contain only digits'),
  ifscCode: z.string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format'),
  bankName: z.string().min(2, 'Bank name is required'),
  branchName: z.string().min(2, 'Branch name is required'),
  accountHolderName: z.string().min(2, 'Account holder name is required'),
})

type BankDetailsForm = z.infer<typeof bankDetailsSchema>

interface BankDetailsStepProps {
  onComplete: (data: BankDetailsForm) => void
  onPrevious: () => void
  initialData?: any
}

interface BankValidationResult {
  isValid: boolean
  bankName?: string
  branchName?: string
  ifscCode?: string
  micrCode?: string
  error?: string
}

export default function BankDetailsStep({ onComplete, onPrevious, initialData }: BankDetailsStepProps) {
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<BankValidationResult | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BankDetailsForm>({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: {
      accountNumber: initialData?.accountNumber || '',
      ifscCode: initialData?.ifscCode || '',
      bankName: initialData?.bankName || '',
      branchName: initialData?.branchName || '',
      accountHolderName: initialData?.accountHolderName || '',
    },
  })

  const watchedIfscCode = watch('ifscCode')
  const watchedAccountNumber = watch('accountNumber')

  const validateBankDetails = async () => {
    if (!watchedIfscCode || !watchedAccountNumber) {
      toast.error('Please enter both account number and IFSC code')
      return
    }

    setIsValidating(true)
    try {
      // Simulate bank validation API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock validation result
      const result: BankValidationResult = {
        isValid: true,
        bankName: 'State Bank of India',
        branchName: 'Main Branch',
        ifscCode: watchedIfscCode,
        micrCode: '110002001',
      }

      setValidationResult(result)
      
      // Auto-fill bank details if validation is successful
      if (result.isValid) {
        setValue('bankName', result.bankName || '')
        setValue('branchName', result.branchName || '')
        toast.success('Bank details validated successfully!')
      }
    } catch (error) {
      const result: BankValidationResult = {
        isValid: false,
        error: 'Failed to validate bank details. Please check your information.',
      }
      setValidationResult(result)
      toast.error('Bank validation failed')
    } finally {
      setIsValidating(false)
    }
  }

  const onSubmit = async (data: BankDetailsForm) => {
    if (!validationResult?.isValid) {
      toast.error('Please validate your bank details first')
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Bank details saved successfully!')
      onComplete(data)
    } catch (error) {
      toast.error('Failed to save bank details')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-6 w-6 text-orange-600" />
          <span>{t('onboarding.step3.title', 'Bank Details')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Security Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-green-800">
                  {t('bank.securityTitle', 'Security Notice')}
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  {t('bank.securityDescription', 'Your bank account information is encrypted and stored securely. We will only use this information for legitimate government benefit disbursements.')}
                </p>
              </div>
            </div>
          </div>

          {/* Bank Account Information */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>{t('bank.infoTitle', 'Bank Account Information')}</span>
            </h3>
            <p className="text-sm text-gray-600">
              {t('bank.infoDescription', 'Please provide your bank account details for fund disbursement. This information will be verified before any payments are processed.')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountNumber" className="flex items-center space-x-2">
                  <Hash className="h-4 w-4" />
                  <span>{t('bank.accountNumber', 'Account Number')} *</span>
                </Label>
                <Input
                  id="accountNumber"
                  {...register('accountNumber')}
                  placeholder={t('bank.accountNumberPlaceholder', 'Enter account number')}
                  className={errors.accountNumber ? 'border-red-500' : ''}
                />
                {errors.accountNumber && (
                  <p className="text-sm text-red-500">{errors.accountNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ifscCode" className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span>{t('bank.ifscCode', 'IFSC Code')} *</span>
                </Label>
                <Input
                  id="ifscCode"
                  {...register('ifscCode')}
                  placeholder={t('bank.ifscCodePlaceholder', 'Enter IFSC code')}
                  className={errors.ifscCode ? 'border-red-500' : ''}
                  style={{ textTransform: 'uppercase' }}
                />
                {errors.ifscCode && (
                  <p className="text-sm text-red-500">{errors.ifscCode.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName" className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span>{t('bank.bankName', 'Bank Name')} *</span>
                </Label>
                <Input
                  id="bankName"
                  {...register('bankName')}
                  placeholder={t('bank.bankNamePlaceholder', 'Enter bank name')}
                  className={errors.bankName ? 'border-red-500' : ''}
                />
                {errors.bankName && (
                  <p className="text-sm text-red-500">{errors.bankName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="branchName" className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{t('bank.branchName', 'Branch Name')} *</span>
                </Label>
                <Input
                  id="branchName"
                  {...register('branchName')}
                  placeholder={t('bank.branchNamePlaceholder', 'Enter branch name')}
                  className={errors.branchName ? 'border-red-500' : ''}
                />
                {errors.branchName && (
                  <p className="text-sm text-red-500">{errors.branchName.message}</p>
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="accountHolderName" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{t('bank.accountHolderName', 'Account Holder Name')} *</span>
                </Label>
                <Input
                  id="accountHolderName"
                  {...register('accountHolderName')}
                  placeholder={t('bank.accountHolderNamePlaceholder', 'Enter account holder name')}
                  className={errors.accountHolderName ? 'border-red-500' : ''}
                />
                {errors.accountHolderName && (
                  <p className="text-sm text-red-500">{errors.accountHolderName.message}</p>
                )}
              </div>
            </div>

            {/* Validation Button */}
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={validateBankDetails}
                disabled={isValidating || !watchedIfscCode || !watchedAccountNumber}
                className="flex items-center space-x-2"
              >
                {isValidating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <span>
                  {isValidating 
                    ? t('bank.validating', 'Validating...') 
                    : t('bank.validate', 'Validate Bank Details')
                  }
                </span>
              </Button>
            </div>
          </div>

          {/* Validation Result */}
          {validationResult && (
            <div className={`border rounded-lg p-4 ${
              validationResult.isValid 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                {validationResult.isValid ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <h3 className={`font-medium ${
                  validationResult.isValid ? 'text-green-800' : 'text-red-800'
                }`}>
                  {validationResult.isValid 
                    ? t('bank.validationSuccess', 'Bank Details Validated')
                    : t('bank.validationFailed', 'Validation Failed')
                  }
                </h3>
              </div>
              
              {validationResult.isValid ? (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-green-600" />
                    <span className="text-green-700">
                      <strong>{t('bank.bank', 'Bank')}:</strong> {validationResult.bankName}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span className="text-green-700">
                      <strong>{t('bank.branch', 'Branch')}:</strong> {validationResult.branchName}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Hash className="h-4 w-4 text-green-600" />
                    <span className="text-green-700">
                      <strong>{t('bank.ifsc', 'IFSC')}:</strong> {validationResult.ifscCode}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Hash className="h-4 w-4 text-green-600" />
                    <span className="text-green-700">
                      <strong>{t('bank.micr', 'MICR')}:</strong> {validationResult.micrCode}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-red-700 mt-2">{validationResult.error}</p>
              )}
            </div>
          )}

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
              type="submit"
              className="bg-orange-600 hover:bg-orange-700"
              disabled={isLoading || !validationResult?.isValid}
            >
              {isLoading ? t('onboarding.saving', 'Saving...') : t('onboarding.continue', 'Continue')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}