'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { 
  FileText, 
  Upload, 
  Eye, 
  Download, 
  Loader2, 
  CheckCircle, 
  XCircle,
  ExternalLink,
  Shield,
  RefreshCw
} from 'lucide-react'
import { listUserDocuments, uploadDocument, getDocumentDownloadUrl } from '@/lib/api/documents'
import { Document, DocumentType } from '@/types/user'
import { showSuccessToast, showErrorToast } from '@/lib/toasts'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/accessibility/LanguageSwitcher'

// Document type configurations - Excluding MARRIAGE_CERTIFICATE and conditionally CATEGORY_CERTIFICATE
const getDocumentTypes = (userCategory?: string, t?: any): Array<{
  type: DocumentType
  name: string
  description: string
}> => {
  const baseTypes = [
    {
      type: 'AADHAAR_CARD' as DocumentType,
      name: t ? t('documentTypes.AADHAAR_CARD.name') : 'Aadhaar Card',
      description: t ? t('documentTypes.AADHAAR_CARD.description') : 'Government issued identity proof',
    },
    {
      type: 'PAN_CARD' as DocumentType,
      name: t ? t('documentTypes.PAN_CARD.name') : 'PAN Card',
      description: t ? t('documentTypes.PAN_CARD.description') : 'Permanent Account Number card',
    },
    {
      type: 'BIRTH_CERTIFICATE' as DocumentType,
      name: t ? t('documentTypes.BIRTH_CERTIFICATE.name') : 'Birth Certificate',
      description: t ? t('documentTypes.BIRTH_CERTIFICATE.description') : 'Official birth certificate',
    },
    {
      type: 'BANK_PASSBOOK' as DocumentType,
      name: t ? t('documentTypes.BANK_PASSBOOK.name') : 'Bank Passbook',
      description: t ? t('documentTypes.BANK_PASSBOOK.description') : 'Bank account proof',
    },
    {
      type: 'INCOME_CERTIFICATE' as DocumentType,
      name: t ? t('documentTypes.INCOME_CERTIFICATE.name') : 'Income Certificate',
      description: t ? t('documentTypes.INCOME_CERTIFICATE.description') : 'Annual income proof',
    },
  ]

  // Only add category certificate if user category is not GENERAL
  if (userCategory && userCategory !== 'GENERAL') {
    baseTypes.splice(4, 0, {
      type: 'CATEGORY_CERTIFICATE' as DocumentType,
      name: t ? t('documentTypes.CATEGORY_CERTIFICATE.name') : 'Category Certificate',
      description: t ? t('documentTypes.CATEGORY_CERTIFICATE.description') : 'SC/ST/OBC certificate',
    })
  }

  return baseTypes
}

export default function ManageDocumentsPage() {
  const t = useTranslations('userDocuments')
  const [loading, setLoading] = useState(true)
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploadingType, setUploadingType] = useState<DocumentType | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null)
  const [userCategory, setUserCategory] = useState<string>('GENERAL')
  const [documentTypes, setDocumentTypes] = useState<Array<{type: DocumentType, name: string, description: string}>>([])

  useEffect(() => {
    fetchUserProfile()
    fetchDocuments()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const { usersApi } = await import('@/lib/api/users')
      const profile = await usersApi.getMyProfile()
      setUserCategory(profile.category || 'GENERAL')
      setDocumentTypes(getDocumentTypes(profile.category || 'GENERAL', t))
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      // Fallback to default
      setDocumentTypes(getDocumentTypes('GENERAL', t))
    }
  }

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const docs = await listUserDocuments()
      setDocuments(docs)
    } catch (error) {
      console.error('Failed to fetch documents:', error)
      showErrorToast(t('messages.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (type: DocumentType) => {
    const existingDoc = documents.find(doc => doc.document_type === type)
    
    if (existingDoc) {
      const docTypeName = documentTypes.find(t => t.type === type)?.name || type
      const confirmReplace = window.confirm(
        t('upload.replaceConfirm', { docType: docTypeName })
      )
      if (!confirmReplace) return
    }
    
    setSelectedType(type)
    fileInputRef.current?.click()
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !selectedType) return

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      showErrorToast(t('messages.invalidFileType'))
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      showErrorToast(t('messages.fileSizeExceeded'))
      return
    }

    try {
      setUploadingType(selectedType)
      setUploadProgress(0)

      await uploadDocument(
        file,
        selectedType,
        undefined,
        (progress: number) => {
          setUploadProgress(progress)
        }
      )

      showSuccessToast(t('messages.uploadSuccess'))
      await fetchDocuments()
    } catch (error: any) {
      console.error('Upload failed:', error)
      showErrorToast(error.message || t('messages.uploadFailed'))
    } finally {
      setUploadingType(null)
      setUploadProgress(0)
      setSelectedType(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleView = async (doc: Document) => {
    try {
      // doc.id is already a string, no need to parse
      const downloadUrl = await getDocumentDownloadUrl(doc.id)
      // Create a document object with file_url for the modal
      setViewingDocument({
        ...doc,
        file_url: downloadUrl
      })
    } catch (error) {
      console.error('Failed to view document:', error)
      showErrorToast(t('messages.viewFailed'))
    }
  }

  const handleDownload = async (doc: Document) => {
    try {
      // doc.id is already a string, no need to parse
      const downloadUrl = await getDocumentDownloadUrl(doc.id)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = doc.file_name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      showSuccessToast(t('messages.downloadSuccess'))
    } catch (error) {
      console.error('Failed to download document:', error)
      showErrorToast(t('messages.downloadFailed'))
    }
  }

  const handleDigilockerFetch = async (type: DocumentType) => {
    try {
      setUploadingType(type)
      setUploadProgress(0)
      
      // Simulate DigiLocker authentication and fetch
      showSuccessToast(t('messages.connectingDigilocker'))
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulate progress
      for (let i = 20; i <= 100; i += 20) {
        setUploadProgress(i)
        await new Promise(resolve => setTimeout(resolve, 300))
      }
      
      // Create a mock document file
      const docTypeName = documentTypes.find(t => t.type === type)?.name || type
      const mockFile = new File(
        ['Mock DigiLocker document content'], 
        `${docTypeName}_DigiLocker.pdf`,
        { type: 'application/pdf' }
      )
      
      // Upload via API (backend will mark as DigiLocker document)
      await uploadDocument(
        mockFile,
        type,
        `DL_${type}_${Date.now()}`, // DigiLocker ID
        (progress: number) => {
          setUploadProgress(progress)
        }
      )
      
      showSuccessToast(t('messages.digilockerSuccess'))
      await fetchDocuments()
    } catch (error: any) {
      console.error('DigiLocker fetch failed:', error)
      showErrorToast(error.message || t('messages.digilockerFailed'))
    } finally {
      setUploadingType(null)
      setUploadProgress(0)
    }
  }

  const getDocumentByType = (type: DocumentType): Document | undefined => {
    return documents.find(doc => doc.document_type === type)
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Language Switcher - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {t('subtitle')}
          </p>
        </div>
        <Button onClick={fetchDocuments} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          {t('buttons.refresh')}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documentTypes.map((docType) => {
          const existingDoc = getDocumentByType(docType.type)
          const isUploading = uploadingType === docType.type

          return (
            <div key={docType.type} className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm flex flex-col gap-4 min-h-[240px]">
              {/* Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-base text-gray-900">{docType.name}</h3>
                  {existingDoc?.status === 'VERIFIED' && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <p className="text-xs text-gray-500">{docType.description}</p>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col gap-3">
                {existingDoc ? (
                  <>
                    {/* Existing Document Info */}
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{existingDoc.file_name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {existingDoc.is_digilocker ? (
                              <span className="inline-flex items-center gap-1 text-blue-600">
                                <Shield className="h-3 w-3" />
                                {t('labels.digilocker')}
                              </span>
                            ) : (
                              `${t('labels.uploaded')}: ${new Date(existingDoc.created_at).toLocaleDateString('en-IN')}`
                            )}
                          </p>
                        </div>
                      </div>
                      
                      {existingDoc.status && (
                        <StatusBadge 
                          status={existingDoc.status} 
                          label={existingDoc.status}
                        />
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 font-medium border-gray-300"
                        onClick={() => handleView(existingDoc)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {t('buttons.view')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 font-medium border-gray-300"
                        onClick={() => handleDownload(existingDoc)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        {t('buttons.download')}
                      </Button>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full font-medium border-gray-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                      onClick={() => handleFileSelect(docType.type)}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      {t('buttons.replace')}
                    </Button>
                  </>
                ) : (
                  <>
                    {/* No Document - Show Upload Options */}
                    {isUploading ? (
                      <div className="space-y-2 mt-auto">
                        <div className="flex items-center justify-between text-sm text-gray-700">
                          <span>{t('upload.uploading')}</span>
                          <span className="font-semibold">{uploadProgress}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-600 transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 mt-auto">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full font-medium border-gray-300"
                          onClick={() => handleFileSelect(docType.type)}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {t('buttons.uploadFile')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full font-medium border-gray-300"
                          onClick={() => handleDigilockerFetch(docType.type)}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {t('buttons.importDigilocker')}
                        </Button>
                        <div className="text-xs text-gray-500 text-center">
                          {t('upload.fileInfo')}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept="application/pdf,image/jpeg,image/jpg,image/png"
        onChange={handleFileUpload}
      />

      {/* Document Viewer Modal */}
      {viewingDocument && viewingDocument.file_url && (
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
                  <h3 className="font-semibold text-lg text-gray-900">{viewingDocument.file_name}</h3>
                  <p className="text-sm text-gray-600">
                    {documentTypes.find(t => t.type === viewingDocument.document_type)?.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {viewingDocument.status && (
                  <StatusBadge 
                    status={viewingDocument.status} 
                    label={viewingDocument.status}
                  />
                )}
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
              {viewingDocument.file_url ? (
                viewingDocument.file_name.toLowerCase().endsWith('.pdf') ? (
                  // PDF Viewer using iframe
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden h-[calc(95vh-180px)]">
                    <iframe
                      src={viewingDocument.file_url}
                      className="w-full h-full"
                      title={viewingDocument.file_name}
                    />
                  </div>
                ) : (
                  // Image Viewer
                  <div className="flex items-center justify-center bg-white rounded-lg shadow-sm p-4 min-h-[calc(95vh-180px)]">
                    <img
                      src={viewingDocument.file_url}
                      alt={viewingDocument.file_name}
                      className="max-w-full h-auto max-h-[calc(95vh-200px)] object-contain rounded-lg"
                    />
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center h-96 bg-white rounded-lg shadow-sm">
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">{t('viewer.noPreview')}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-center gap-3 px-6 py-4 border-t bg-white">
              {viewingDocument.file_url && (
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => {
                    window.open(viewingDocument.file_url, '_blank')
                  }}
                  className="min-w-[160px] font-medium"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t('buttons.openNewTab')}
                </Button>
              )}
              <Button
                variant="default"
                size="default"
                onClick={() => setViewingDocument(null)}
                className="min-w-[120px] bg-orange-600 hover:bg-orange-700 font-medium"
              >
                {t('buttons.close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
