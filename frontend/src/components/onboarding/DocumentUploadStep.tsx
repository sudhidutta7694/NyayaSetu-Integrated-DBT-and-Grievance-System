'use client'

import React, { useState, useRef, useEffect } from 'react'
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
import { uploadDocument } from '@/lib/api/documents'

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
  uploadedDocumentsS3?: any[]  // Pre-uploaded S3 documents
  category?: string // Category from personal info step
}

interface DocumentFile {
  id: string | number
  type: string
  name: string
  file?: File
  digilockerId?: string
  isDigilocker: boolean
  status: 'PENDING' | 'UPLOADED' | 'VERIFIED' | 'REJECTED'
  uploadProgress?: number
  error?: string
  s3Key?: string
  fileUrl?: string
  fileSize?: number
  contentType?: string
}

export default function DocumentUploadStep({ 
  onComplete, 
  onPrevious, 
  initialData, 
  uploadedDocumentsS3,
  category 
}: DocumentUploadStepProps) {
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [documents, setDocuments] = useState<DocumentFile[]>([])
  const [selectedType, setSelectedType] = useState<string>('')
  const [viewingDocument, setViewingDocument] = useState<DocumentFile | null>(null)
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

  // Load initial documents when component mounts or initialData changes
  useEffect(() => {
    if (initialData && Array.isArray(initialData) && initialData.length > 0) {
      // If initialData is an array of documents, use it directly
      setDocuments(initialData)
    } else if (initialData?.documents && Array.isArray(initialData.documents)) {
      // If initialData has a documents property, use that
      setDocuments(initialData.documents)
    }
  }, [initialData])

  // Sync documents state with form value
  useEffect(() => {
    setValue('documents', documents)
  }, [documents, setValue])

  // Document types for Step 2 - Only 4 documents (PAN_CARD and BANK_PASSBOOK moved to Step 3)
  const documentTypes = React.useMemo(() => {
    const types = [
      {
        id: 'AADHAAR_CARD',
        name: t('documents.aadhaarCard', 'Aadhaar Card'),
        required: true,
        description: t('documents.aadhaarDesc', 'Government issued identity proof'),
      },
      {
        id: 'BIRTH_CERTIFICATE',
        name: t('documents.birthCertificate', 'Birth Certificate'),
        required: true,
        description: t('documents.birthDesc', 'Official birth certificate'),
      },
      {
        id: 'INCOME_CERTIFICATE',
        name: t('documents.incomeCertificate', 'Income Certificate'),
        required: true,
        description: t('documents.incomeDesc', 'Annual income proof'),
      },
    ]

    // Only add category certificate if category is not GENERAL
    if (category && category !== 'GENERAL') {
      types.splice(1, 0, {  // Insert after Aadhaar
        id: 'CATEGORY_CERTIFICATE',
        name: t('documents.categoryCertificate', 'Category Certificate (SC/ST/OBC)'),
        required: true,
        description: t('documents.categoryDesc', 'Caste/category certificate'),
      })
    }

    return types
  }, [category, t])

  const handleFileSelect = (type: string) => {
    setSelectedType(type)
    fileInputRef.current?.click()
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    // Check if document of this type already exists
    const existingDoc = documents.find(doc => doc.type === selectedType)
    
    if (existingDoc) {
      // Show confirmation dialog
      const confirmReplace = window.confirm(
        `A ${documentTypes.find(t => t.id === selectedType)?.name} document already exists. Do you want to replace it?`
      )
      
      if (!confirmReplace) {
        setSelectedType('')
        return
      }
      
      // Remove old document from state before uploading new one
      setDocuments(prev => prev.filter(doc => doc.type !== selectedType))
      toast.success(t('documents.replacingDocument', 'Replacing existing document...'))
    }

    const tempId = `temp_${selectedType}_${Date.now()}`
    const newDocument: DocumentFile = {
      id: tempId,
      type: selectedType,
      name: file.name,
      file,
      isDigilocker: false,
      status: 'PENDING',
      uploadProgress: 0,
    }

    setDocuments(prev => [...prev, newDocument])
    setSelectedType('')

    // Upload to S3 using presigned URL
    try {
      const result = await uploadDocument(
        file,
        selectedType,
        undefined,
        (progress: number) => {
          setDocuments(prev => prev.map(doc => 
            doc.id === tempId 
              ? { ...doc, uploadProgress: progress }
              : doc
          ))
        }
      )

      // Update document with S3 details
      // Note: document_id is NOT returned during onboarding - only after completion
      setDocuments(prev => prev.map(doc => 
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

      toast.success(t('documents.uploadSuccess', 'Document uploaded successfully'))
    } catch (error: any) {
      console.error('Upload error:', error)
      setDocuments(prev => prev.map(doc => 
        doc.id === tempId
          ? {
              ...doc,
              status: 'REJECTED' as const,
              error: error.message || 'Upload failed',
              uploadProgress: 0,
            }
          : doc
      ))
      toast.error(error.message || t('documents.uploadError', 'Failed to upload document'))
    }
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

  const removeDocument = (documentId: string | number) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId))
  }

  const handleViewDocument = (doc: DocumentFile) => {
    setViewingDocument(doc)
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
      // No required document check needed

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Documents saved successfully!')
      
      // Collect all uploaded S3 documents
      const s3Documents = documents
        .filter(doc => doc.status === 'UPLOADED' && doc.s3Key)
        .map(doc => ({
          s3Key: doc.s3Key,
          fileUrl: doc.fileUrl,
          documentType: doc.type,
          fileName: doc.name,
          fileSize: doc.fileSize || 0,
          contentType: doc.contentType || 'application/pdf'
        }))
      
      // Pass the documents in the expected format with S3 data
      onComplete({ 
        documents,
        uploadedDocumentsS3: s3Documents
      } as any)
    } catch (error) {
      toast.error('Failed to save documents')
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
              const uploadedDoc = documents.find(doc => doc.type === docType.id)
              const isUploaded = !!uploadedDoc
              return (
                <div key={docType.id} className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm flex flex-col gap-3 min-h-[180px] justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-base text-gray-900">{docType.name}</h3>
                      {docType.required && (
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      )}
                    </div>
                    {isUploaded && uploadedDoc && (
                      <div className="text-xs text-green-600 flex items-center gap-1 mb-2">
                        <CheckCircle className="h-3 w-3" />
                        <span>Uploaded: {uploadedDoc.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-auto flex-wrap">
                    <Button
                      type="button"
                      variant={isUploaded ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => handleFileSelect(docType.id)}
                      disabled={isUploaded || isLoading}
                      className="flex-1 min-w-[120px] font-medium border-gray-300"
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      {isUploaded ? t('documents.uploaded', 'Uploaded') : t('documents.upload', 'Upload File')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDigilockerImport(docType.id)}
                      disabled={isUploaded || isLoading}
                      className="flex-1 min-w-[160px] font-medium border-gray-300"
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
                        
                        {/* View button - only show if document is uploaded and has fileUrl */}
                        {doc.fileUrl && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDocument(doc)}
                            title={t('documents.view', 'View Document')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        
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
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const s3Documents = documents
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
                    documents,
                    uploadedDocumentsS3: s3Documents
                  } as any)
                }}
                disabled={isLoading}
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                {t('onboarding.skip', 'Skip for Now')}
              </Button>
              <Button
                type="submit"
                className="bg-orange-600 hover:bg-orange-700"
                disabled={isLoading}
              >
                {isLoading ? t('onboarding.saving', 'Saving...') : t('onboarding.continue', 'Continue')}
              </Button>
            </div>
          </div>
        </form>

        {/* Document Viewer Modal */}
        {viewingDocument && (
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
                      {documentTypes.find(t => t.id === viewingDocument.type)?.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={`${getStatusColor(viewingDocument.status)} px-3 py-1`}>
                    <div className="flex items-center space-x-1.5">
                      {getStatusIcon(viewingDocument.status)}
                      <span className="text-xs font-medium">
                        {t(`documents.status.${viewingDocument.status.toLowerCase()}`, viewingDocument.status)}
                      </span>
                    </div>
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewingDocument(null)}
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg h-9 w-9 p-0"
                  >
                    <span className="text-xl">×</span>
                  </Button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-auto p-6 bg-gray-50">
                {viewingDocument.fileUrl ? (
                  viewingDocument.name.toLowerCase().endsWith('.pdf') ? (
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
                  )
                ) : (
                  <div className="flex items-center justify-center h-96 bg-white rounded-lg shadow-sm">
                    <div className="text-center">
                      <FileText className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">{t('documents.noPreview', 'No preview available')}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-center gap-3 px-6 py-4 border-t bg-white">
                {viewingDocument.fileUrl && (
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => {
                      window.open(viewingDocument.fileUrl, '_blank')
                    }}
                    className="min-w-[160px] font-medium"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {t('documents.openInNewTab', 'Open in New Tab')}
                  </Button>
                )}
                <Button
                  variant="default"
                  size="default"
                  onClick={() => setViewingDocument(null)}
                  className="min-w-[120px] bg-orange-600 hover:bg-orange-700 font-medium"
                >
                  {t('documents.close', 'Close')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}