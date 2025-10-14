'use client'

import React, { useState, useEffect } from 'react'
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
  Loader2,
  Upload,
  FileText,
  Eye,
  Trash2
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'
import { uploadDocument } from '@/lib/api/documents'

const bankDetailsSchema = z.object({
  accountNumber: z.string()
    .min(9, 'Account number must be at least 9 digits')
    .max(18, 'Account number must be at most 18 digits')
    .regex(/^\d+$/, 'Account number must contain only digits'),
  ifscCode: z.string()
    .length(11, 'IFSC code must be exactly 11 characters')
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'IFSC code must start with 4 letters, followed by 0, then 6 alphanumeric characters (e.g., SBIN0001234)'),
  bankName: z.string().min(2, 'Bank name is required'),
  branchName: z.string().min(2, 'Branch name is required'),
  accountHolderName: z.string().min(2, 'Account holder name is required'),
})

type BankDetailsForm = z.infer<typeof bankDetailsSchema>

interface BankDetailsStepProps {
  onComplete: (data: BankDetailsForm & { documents?: any[], uploadedDocumentsS3?: any[], _navigatingBack?: boolean }) => void
  onPrevious: () => void
  initialData?: any
  initialDocuments?: any[]  // Full BankDocument[] array with UI state
}

interface BankDocument {
  id: string
  type: 'BANK_PASSBOOK' | 'PAN_CARD'
  name: string
  file?: File
  status: 'PENDING' | 'UPLOADED' | 'REJECTED'
  uploadProgress?: number
  s3Key?: string
  fileUrl?: string
  fileSize?: number
  contentType?: string
  error?: string
}

export default function BankDetailsStep({ onComplete, onPrevious, initialData, initialDocuments }: BankDetailsStepProps) {
  const t = useTranslations('onboardingBank')
  const [isLoading, setIsLoading] = useState(false)
  const [bankDocuments, setBankDocuments] = useState<BankDocument[]>([])
  const [viewingDocument, setViewingDocument] = useState<BankDocument | null>(null)
  const passbookInputRef = React.useRef<HTMLInputElement>(null)
  const panInputRef = React.useRef<HTMLInputElement>(null)

  // Load initial documents when component mounts or initialDocuments changes
  useEffect(() => {
    if (initialDocuments && Array.isArray(initialDocuments)) {
      setBankDocuments(initialDocuments)
    }
  }, [initialDocuments])

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

  const handleFileSelect = (type: 'BANK_PASSBOOK' | 'PAN_CARD') => {
    if (type === 'BANK_PASSBOOK') {
      passbookInputRef.current?.click()
    } else {
      panInputRef.current?.click()
    }
  }

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'BANK_PASSBOOK' | 'PAN_CARD'
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      toast.error(t('validation.fileType'))
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('validation.fileSize'))
      return
    }

    // Check if document type already exists and offer to replace
    const existingDoc = bankDocuments.find(doc => doc.type === type)
    if (existingDoc) {
      const docName = type === 'PAN_CARD' ? t('documentTypes.PAN_CARD') : t('documentTypes.BANK_PASSBOOK')
      const confirmReplace = window.confirm(
        t('messages.replaceConfirm', { documentName: docName })
      )
      
      if (!confirmReplace) {
        return
      }
      
      // Remove old document from state before uploading new one
      setBankDocuments(prev => prev.filter(doc => doc.type !== type))
      toast.success(t('messages.replacing', { documentName: docName }))
    }

    const tempId = `temp_${type}_${Date.now()}`
    const newDocument: BankDocument = {
      id: tempId,
      type,
      name: file.name,
      file,
      status: 'PENDING',
      uploadProgress: 0,
    }

    setBankDocuments(prev => [...prev, newDocument])

    // Upload to S3 using presigned URL
    try {
      const result = await uploadDocument(
        file,
        type,
        undefined,
        (progress: number) => {
          setBankDocuments(prev => prev.map(doc => 
            doc.id === tempId 
              ? { ...doc, uploadProgress: progress }
              : doc
          ))
        }
      )

      // Update document with S3 details
      // Note: document_id is NOT returned during onboarding - only after completion
      setBankDocuments(prev => prev.map(doc => 
        doc.id === tempId
          ? {
              ...doc,
              // Keep tempId - real DB id will be assigned after onboarding completes
              s3Key: result.data.s3_key,
              fileUrl: result.data.file_url,
              fileSize: file.size,
              contentType: file.type,
              status: 'UPLOADED' as const,
              uploadProgress: 100,
            }
          : doc
      ))

      toast.success(t('messages.uploadSuccess', { 
        documentName: type === 'PAN_CARD' ? t('documentTypes.PAN_CARD') : t('documentTypes.BANK_PASSBOOK')
      }))
    } catch (error: any) {
      console.error('Upload error:', error)
      setBankDocuments(prev => prev.map(doc => 
        doc.id === tempId
          ? {
              ...doc,
              status: 'REJECTED' as const,
              error: error.message || t('messages.uploadFailed'),
              uploadProgress: 0,
            }
          : doc
      ))
      toast.error(error.message || t('messages.uploadFailed'))
    }

    // Reset input
    event.target.value = ''
  }

  const removeDocument = (documentId: string) => {
    setBankDocuments(prev => prev.filter(doc => doc.id !== documentId))
    toast.success(t('messages.documentRemoved'))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPLOADED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'UPLOADED':
        return <CheckCircle className="h-4 w-4" />
      case 'REJECTED':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Loader2 className="h-4 w-4 animate-spin" />
    }
  }

  const onSubmit = async (data: BankDetailsForm) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Collect uploaded documents (same pattern as DocumentUploadStep)
      const s3Documents = bankDocuments
        .filter(doc => doc.status === 'UPLOADED' && doc.s3Key)
        .map(doc => ({
          s3Key: doc.s3Key,
          fileUrl: doc.fileUrl,
          documentType: doc.type,
          fileName: doc.name,
          fileSize: doc.fileSize || 0,
          contentType: doc.contentType || 'application/pdf'
        }))
      
      toast.success(t('messages.saveSuccess'))
      
      // Pass data in same format as DocumentUploadStep
      onComplete({
        ...data,
        documents: bankDocuments,  // Full document array with UI state
        uploadedDocumentsS3: s3Documents  // S3-formatted for backend
      } as any)
    } catch (error) {
      toast.error(t('messages.saveFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrevious = () => {
    // Save current state before going back (preserve uploaded documents and form data)
    const s3Documents = bankDocuments
      .filter(doc => doc.status === 'UPLOADED' && doc.s3Key)
      .map(doc => ({
        s3Key: doc.s3Key,
        fileUrl: doc.fileUrl,
        documentType: doc.type,
        fileName: doc.name,
        fileSize: doc.fileSize || 0,
        contentType: doc.contentType || 'application/pdf'
      }))
    
    // Get current form values
    const currentFormData = watch()
    
    // Save to parent state with navigation flag
    onComplete({
      ...currentFormData,
      documents: bankDocuments,  // Preserve uploaded documents
      uploadedDocumentsS3: s3Documents,  // S3-formatted for backend
      _navigatingBack: true  // Flag to trigger backward navigation in parent
    } as any)
  }

  const handleSkip = () => {
    toast(t('messages.skipNotice'), {
      icon: 'ℹ️',
    })
    
    // Collect uploaded documents even when skipping (same pattern as onSubmit)
    const s3Documents = bankDocuments
      .filter(doc => doc.status === 'UPLOADED' && doc.s3Key)
      .map(doc => ({
        s3Key: doc.s3Key,
        fileUrl: doc.fileUrl,
        documentType: doc.type,
        fileName: doc.name,
        fileSize: doc.fileSize || 0,
        contentType: doc.contentType || 'application/pdf'
      }))
    
    onComplete({
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      branchName: '',
      accountHolderName: '',
      documents: bankDocuments,  // Preserve uploaded documents
      uploadedDocumentsS3: s3Documents  // S3-formatted for backend
    } as any)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-6 w-6 text-orange-600" />
          <span>{t('title')}</span>
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
                  {t('securityNotice.title')}
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  {t('securityNotice.description')}
                </p>
              </div>
            </div>
          </div>

          {/* Bank Account Information */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>{t('sections.bankInfo.title')}</span>
            </h3>
            <p className="text-sm text-gray-600">
              {t('sections.bankInfo.description')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountNumber" className="flex items-center space-x-2">
                  <Hash className="h-4 w-4" />
                  <span>{t('fields.accountNumber.label')} *</span>
                </Label>
                <Input
                  id="accountNumber"
                  {...register('accountNumber')}
                  placeholder={t('fields.accountNumber.placeholder')}
                  className={errors.accountNumber ? 'border-red-500' : ''}
                />
                {!errors.accountNumber && (
                  <p className="text-xs text-gray-500">
                    {t('fields.accountNumber.hint')}
                  </p>
                )}
                {errors.accountNumber && (
                  <p className="text-sm text-red-500">{errors.accountNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ifscCode" className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span>{t('fields.ifscCode.label')} *</span>
                </Label>
                <Input
                  id="ifscCode"
                  {...register('ifscCode')}
                  placeholder={t('fields.ifscCode.placeholder')}
                  className={errors.ifscCode ? 'border-red-500' : ''}
                  style={{ textTransform: 'uppercase' }}
                  maxLength={11}
                />
                {!errors.ifscCode && (
                  <p className="text-xs text-gray-500">
                    {t('fields.ifscCode.hint')}
                  </p>
                )}
                {errors.ifscCode && (
                  <p className="text-sm text-red-500">{errors.ifscCode.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName" className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span>{t('fields.bankName.label')} *</span>
                </Label>
                <Input
                  id="bankName"
                  {...register('bankName')}
                  placeholder={t('fields.bankName.placeholder')}
                  className={errors.bankName ? 'border-red-500' : ''}
                />
                {errors.bankName && (
                  <p className="text-sm text-red-500">{errors.bankName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="branchName" className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{t('fields.branchName.label')} *</span>
                </Label>
                <Input
                  id="branchName"
                  {...register('branchName')}
                  placeholder={t('fields.branchName.placeholder')}
                  className={errors.branchName ? 'border-red-500' : ''}
                />
                {errors.branchName && (
                  <p className="text-sm text-red-500">{errors.branchName.message}</p>
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="accountHolderName" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{t('fields.accountHolderName.label')} *</span>
                </Label>
                <Input
                  id="accountHolderName"
                  {...register('accountHolderName')}
                  placeholder={t('fields.accountHolderName.placeholder')}
                  className={errors.accountHolderName ? 'border-red-500' : ''}
                />
                {errors.accountHolderName && (
                  <p className="text-sm text-red-500">{errors.accountHolderName.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Document Upload Section */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="font-medium flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>{t('sections.documents.title')}</span>
            </h3>
            <p className="text-sm text-gray-600">
              {t('sections.documents.description')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* PAN Card Upload */}
              <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-orange-600" />
                  <h4 className="font-semibold text-gray-900">
                    {t('documentTypes.PAN_CARD')}
                  </h4>
                  <Badge variant="secondary" className="ml-auto">{t('badges.optional')}</Badge>
                </div>
                
                {!bankDocuments.find(doc => doc.type === 'PAN_CARD') ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleFileSelect('PAN_CARD')}
                    className="w-full font-medium"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {t('buttons.uploadFile')}
                  </Button>
                ) : (
                  <div className="text-sm text-green-600 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {t('buttons.uploaded')}
                  </div>
                )}
              </div>

              {/* Bank Passbook Upload */}
              <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-orange-600" />
                  <h4 className="font-semibold text-gray-900">
                    {t('documentTypes.BANK_PASSBOOK')}
                  </h4>
                  <Badge variant="secondary" className="ml-auto">{t('badges.optional')}</Badge>
                </div>
                
                {!bankDocuments.find(doc => doc.type === 'BANK_PASSBOOK') ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleFileSelect('BANK_PASSBOOK')}
                    className="w-full font-medium"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {t('buttons.uploadFile')}
                  </Button>
                ) : (
                  <div className="text-sm text-green-600 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {t('buttons.uploaded')}
                  </div>
                )}
              </div>
            </div>

            {/* Hidden file inputs */}
            <input
              ref={panInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload(e, 'PAN_CARD')}
              className="hidden"
            />
            <input
              ref={passbookInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload(e, 'BANK_PASSBOOK')}
              className="hidden"
            />

            {/* Uploaded Documents List */}
            {bankDocuments.length > 0 && (
              <div className="space-y-3 mt-4">
                <h4 className="font-medium text-sm">{t('uploadedDocuments.title')}</h4>
                {bankDocuments.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium text-sm">{doc.name}</p>
                          <p className="text-xs text-gray-600">
                            {doc.type === 'PAN_CARD' ? t('documentTypes.PAN_CARD') : t('documentTypes.BANK_PASSBOOK')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(doc.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(doc.status)}
                            <span className="text-xs">{doc.status}</span>
                          </div>
                        </Badge>
                        
                        {doc.fileUrl && doc.status === 'UPLOADED' && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewingDocument(doc)}
                            title="View Document"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDocument(doc.id)}
                          title="Remove Document"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    
                    {doc.uploadProgress !== undefined && doc.uploadProgress < 100 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>{t('uploadedDocuments.uploading')}</span>
                          <span>{doc.uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${doc.uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {doc.error && (
                      <p className="text-sm text-red-500 mt-2">{doc.error}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={isLoading}
            >
              {t('buttons.previous')}
            </Button>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleSkip}
                disabled={isLoading}
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                {t('buttons.skip')}
              </Button>
              <Button
                type="submit"
                className="bg-orange-600 hover:bg-orange-700"
                disabled={isLoading}
              >
                {isLoading ? t('buttons.saving') : t('buttons.complete')}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>

      {/* Document Viewer Modal */}
      {viewingDocument && viewingDocument.fileUrl && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
          onClick={() => setViewingDocument(null)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-orange-50 to-white">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FileText className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{viewingDocument.name}</h3>
                  <p className="text-sm text-gray-600">
                    {viewingDocument.type === 'PAN_CARD' ? 'PAN Card' : 'Bank Passbook'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewingDocument(null)}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg h-9 w-9 p-0"
              >
                <span className="text-xl">×</span>
              </Button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6 bg-gray-50">
              {viewingDocument.name.toLowerCase().endsWith('.pdf') ? (
                // PDF Viewer using iframe
                <div className="bg-white rounded-lg shadow-sm overflow-hidden h-[calc(95vh-180px)]">
                  <iframe
                    src={viewingDocument.fileUrl}
                    className="w-full h-full"
                    title={viewingDocument.name}
                  />
                </div>
              ) : (
                // Image Viewer
                <div className="flex items-center justify-center bg-white rounded-lg shadow-sm p-4 min-h-[calc(95vh-180px)]">
                  <img
                    src={viewingDocument.fileUrl}
                    alt={viewingDocument.name}
                    className="max-w-full h-auto max-h-[calc(95vh-200px)] object-contain rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-center gap-3 px-6 py-4 border-t bg-white">
              <Button
                variant="outline"
                size="default"
                onClick={() => window.open(viewingDocument.fileUrl, '_blank')}
                className="min-w-[160px] font-medium"
              >
                <Eye className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
              <Button
                variant="default"
                size="default"
                onClick={() => setViewingDocument(null)}
                className="min-w-[120px] bg-orange-600 hover:bg-orange-700 font-medium"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}