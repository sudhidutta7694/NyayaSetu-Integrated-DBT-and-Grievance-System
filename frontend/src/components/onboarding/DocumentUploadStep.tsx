'use client'

import React, { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Eye,
  Trash2,
  ExternalLink,
  Shield
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import toast from 'react-hot-toast'

const documentUploadSchema = z.object({
  documents: z.array(z.object({
    type: z.string(),
    file: z.any().optional(),
    digilockerId: z.string().optional(),
    isDigilocker: z.boolean().default(false),
    status: z.enum(['PENDING', 'UPLOADED', 'VERIFIED', 'REJECTED']).default('PENDING'),
  })).min(1, 'At least one document is required'),
})

type DocumentUploadForm = z.infer<typeof documentUploadSchema>

interface DocumentUploadStepProps {
  onComplete: (data: DocumentUploadForm) => void
  onPrevious: () => void
  initialData?: any
}

interface DocumentFile {
  id: string
  type: string
  name: string
  file?: File
  digilockerId?: string
  isDigilocker: boolean
  status: 'PENDING' | 'UPLOADED' | 'VERIFIED' | 'REJECTED'
  uploadProgress?: number
  error?: string
}

export default function DocumentUploadStep({ onComplete, onPrevious, initialData }: DocumentUploadStepProps) {
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [documents, setDocuments] = useState<DocumentFile[]>([])
  const [selectedType, setSelectedType] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DocumentUploadForm>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      documents: initialData?.documents || [],
    },
  })

  const documentTypes = [
    {
      id: 'CASTE_CERTIFICATE',
      name: t('documents.casteCertificate', 'Caste Certificate'),
      description: t('documents.casteCertificateDesc', 'Upload your caste certificate'),
      required: true,
      icon: Shield,
    },
    {
      id: 'BANK_PASSBOOK',
      name: t('documents.bankPassbook', 'Bank Passbook'),
      description: t('documents.bankPassbookDesc', 'Upload bank passbook or statement'),
      required: true,
      icon: FileText,
    },
    {
      id: 'AADHAAR_CARD',
      name: t('documents.aadhaarCard', 'Aadhaar Card'),
      description: t('documents.aadhaarCardDesc', 'Upload Aadhaar card copy'),
      required: false,
      icon: FileText,
    },
  ]

  const handleFileSelect = (type: string) => {
    setSelectedType(type)
    fileInputRef.current?.click()
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !selectedType) return

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      toast.error(t('documents.invalidFileType', 'Please upload PDF, JPG, or PNG files only'))
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('documents.fileTooLarge', 'File size must be less than 10MB'))
      return
    }

    const newDocument: DocumentFile = {
      id: `${selectedType}_${Date.now()}`,
      type: selectedType,
      name: file.name,
      file,
      isDigilocker: false,
      status: 'PENDING',
      uploadProgress: 0,
    }

    setDocuments(prev => [...prev, newDocument])
    simulateUpload(newDocument.id)
    setSelectedType('')
  }

  const simulateUpload = (documentId: string) => {
    const interval = setInterval(() => {
      setDocuments(prev => prev.map(doc => {
        if (doc.id === documentId && doc.uploadProgress !== undefined) {
          const newProgress = Math.min(doc.uploadProgress + 10, 100)
          if (newProgress === 100) {
            clearInterval(interval)
            return { ...doc, uploadProgress: 100, status: 'UPLOADED' as const }
          }
          return { ...doc, uploadProgress: newProgress }
        }
        return doc
      }))
    }, 200)
  }

  const handleDigilockerImport = async (type: string) => {
    setIsLoading(true)
    try {
      // Simulate DigiLocker API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newDocument: DocumentFile = {
        id: `${type}_digilocker_${Date.now()}`,
        type,
        name: `${type.replace('_', ' ')} - DigiLocker`,
        digilockerId: `DL_${type}_${Date.now()}`,
        isDigilocker: true,
        status: 'VERIFIED', // DigiLocker documents are pre-verified
      }

      setDocuments(prev => [...prev, newDocument])
      toast.success(t('documents.digilockerSuccess', 'Document imported from DigiLocker'))
    } catch (error) {
      toast.error(t('documents.digilockerError', 'Failed to import from DigiLocker'))
    } finally {
      setIsLoading(false)
    }
  }

  const removeDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'UPLOADED':
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      case 'REJECTED':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-green-100 text-green-800'
      case 'UPLOADED':
        return 'bg-blue-100 text-blue-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const onSubmit = async (data: DocumentUploadForm) => {
    setIsLoading(true)
    try {
      // Check if all required documents are uploaded
      const requiredTypes = documentTypes.filter(doc => doc.required).map(doc => doc.id)
      const uploadedTypes = documents.map(doc => doc.type)
      const missingRequired = requiredTypes.filter(type => !uploadedTypes.includes(type))

      if (missingRequired.length > 0) {
        toast.error(t('documents.missingRequired', 'Please upload all required documents'))
        return
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setValue('documents', documents.map(doc => ({
        type: doc.type,
        file: doc.file,
        digilockerId: doc.digilockerId,
        isDigilocker: doc.isDigilocker,
        status: doc.status,
      })))

      toast.success('Documents uploaded successfully!')
      onComplete(data)
    } catch (error) {
      toast.error('Failed to upload documents')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-6 w-6 text-orange-600" />
          <span>{t('onboarding.step2.title', 'Document Upload')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Document Requirements */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">
              {t('documents.requirements', 'Document Requirements')}
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• {t('documents.requirements1', 'Supported formats: PDF, JPG, PNG')}</li>
              <li>• {t('documents.requirements2', 'Maximum file size: 10MB')}</li>
              <li>• {t('documents.requirements3', 'Documents should be clear and readable')}</li>
              <li>• {t('documents.requirements4', 'DigiLocker documents are pre-verified')}</li>
            </ul>
          </div>

          {/* Document Types */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentTypes.map((docType) => {
              const Icon = docType.icon
              const isUploaded = documents.some(doc => doc.type === docType.id)
              
              return (
                <div key={docType.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5 text-orange-600" />
                    <h3 className="font-medium">{docType.name}</h3>
                    {docType.required && (
                      <Badge variant="destructive" className="text-xs">
                        {t('documents.required', 'Required')}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{docType.description}</p>
                  
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleFileSelect(docType.id)}
                      disabled={isUploaded}
                      className="flex-1"
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      {t('documents.upload', 'Upload File')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDigilockerImport(docType.id)}
                      disabled={isUploaded || isLoading}
                      className="flex-1"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      {t('documents.digilocker', 'Import from DigiLocker')}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Uploaded Documents */}
          {documents.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>{t('documents.uploadedDocuments', 'Uploaded Documents')}</span>
              </h3>
              
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-gray-600">
                            {documentTypes.find(t => t.id === doc.type)?.name}
                            {doc.isDigilocker && (
                              <Badge variant="secondary" className="ml-2">
                                DigiLocker
                              </Badge>
                            )}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(doc.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(doc.status)}
                            <span className="text-xs">
                              {t(`documents.status.${doc.status.toLowerCase()}`, doc.status)}
                            </span>
                          </div>
                        </Badge>
                        
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDocument(doc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {doc.uploadProgress !== undefined && doc.uploadProgress < 100 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>{t('documents.uploading', 'Uploading')}...</span>
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
                  </div>
                ))}
              </div>
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
              disabled={isLoading || documents.length === 0}
            >
              {isLoading ? t('onboarding.saving', 'Saving...') : t('onboarding.continue', 'Continue')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}