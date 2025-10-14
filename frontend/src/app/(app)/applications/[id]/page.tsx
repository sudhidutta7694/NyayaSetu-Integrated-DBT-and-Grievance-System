'use client'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useParams, useRouter } from 'next/navigation'
import { Download, MessageSquare, Printer, Clock, FileText, Eye, ExternalLink, ArrowLeft, User2, Mail, Phone, CreditCard, Calendar, MapPin, Shield, IndianRupee, CheckCircle2, XCircle } from 'lucide-react'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/accessibility/LanguageSwitcher'
import axios from 'axios'
import toast from 'react-hot-toast'
import { generateOfficialPDF, generateMockPDF } from '@/lib/generatePDF'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

interface TimelineEvent { 
  stage: string
  occurredAt: string
  actorName: string
  remarks?: string
  status?: string 
}

interface ApplicationDetail {
  id: string
  application_number: string
  title?: string
  description?: string
  application_type: string
  status: string
  fir_number?: string
  cctns_verified?: boolean
  amount_requested?: number
  amount_approved?: number
  submitted_at?: string
  created_at: string
  district_comments?: string
  district_reviewed_at?: string
  social_welfare_comments?: string
  applicant?: {
    id: string
    full_name: string
    email: string
    phone_number: string
    aadhaar_number: string
    date_of_birth: string
    gender?: string
    address_line1?: string
    address_line2?: string
    city?: string
    state?: string
    pincode?: string
  }
}

interface Document {
  id: string
  document_type: string
  file_name: string  // Backend returns 'file_name' not 'document_name'
  file_path: string
  file_url?: string
  file_size: string
  status: string
  mime_type?: string
  is_digilocker?: boolean
  created_at?: string
  verified_at?: string
}

interface StatusLog {
  id: string
  stage: string
  status: string
  comments?: string
  reviewed_by?: string
  reviewer_role?: string
  stage_entered_at: string
  stage_completed_at?: string
}

export default function ApplicationDetailPage() {
  const t = useTranslations('userApplicationDetail')
  const params = useParams() as { id?: string }
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [status, setStatus] = useState('UNDER_REVIEW')
  const [title, setTitle] = useState('Application Title')
  const [applicationNumber, setApplicationNumber] = useState('APP-2024-001')
  const [amountRequested, setAmountRequested] = useState<number | undefined>(undefined)
  const [amountApproved, setAmountApproved] = useState<number | undefined>(undefined)
  const [documents, setDocuments] = useState<Document[]>([])
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null)
  const [fullApplicationData, setFullApplicationData] = useState<ApplicationDetail | null>(null)

  useEffect(() => {
    if (params.id) fetchApplicationDetails(params.id)
  }, [params.id])

  const handleDownloadPDF = () => {
    if (fullApplicationData) {
      // Build full address
      const addressParts = [
        fullApplicationData.applicant?.address_line1,
        fullApplicationData.applicant?.address_line2,
        fullApplicationData.applicant?.city,
        fullApplicationData.applicant?.state,
        fullApplicationData.applicant?.pincode
      ].filter(Boolean)
      
      // Generate PDF with actual data
      generateOfficialPDF({
        application_number: fullApplicationData.application_number,
        applicant_name: fullApplicationData.applicant?.full_name || 'N/A',
        application_type: fullApplicationData.application_type,
        fir_number: fullApplicationData.fir_number,
        incident_description: fullApplicationData.description,
        amount_approved: fullApplicationData.amount_approved,
        status: fullApplicationData.status,
        district: fullApplicationData.applicant?.city || fullApplicationData.applicant?.state || 'N/A',
        submitted_at: fullApplicationData.submitted_at || fullApplicationData.created_at,
        approved_at: fullApplicationData.created_at,
        email: fullApplicationData.applicant?.email,
        phone: fullApplicationData.applicant?.phone_number,
        address: addressParts.join(', '),
        cctns_verified: fullApplicationData.cctns_verified
      })
      toast.success(t('toast.officialDownloaded'))
    } else {
      // Fallback to mock data if no application data
      generateMockPDF()
      toast.success(t('toast.mockDownloaded'))
    }
  }

  const fetchApplicationDetails = async (applicationId: string) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')

      // Fetch application details
      const appResponse = await axios.get(`${API_BASE_URL}/applications/${applicationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const app: ApplicationDetail = appResponse.data

      setFullApplicationData(app) // Store full application data
      // console.log('=== APPLICATION DATA DEBUG ===')
      // console.log('Full application data:', app)
      // console.log('FIR Number:', app.fir_number)
      // console.log('CCTNS Verified:', app.cctns_verified)
      // console.log('CCTNS Verified type:', typeof app.cctns_verified)
      // console.log('==============================')
      
      setTitle(app.title || app.application_type.replace(/_/g, ' '))
      setApplicationNumber(app.application_number)
      setAmountRequested(app.amount_requested)
      setAmountApproved(app.amount_approved)
      setStatus(app.status)

      // Fetch documents
      try {
        const docsResponse = await axios.get(`${API_BASE_URL}/documents?application_id=${applicationId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        // console.log('Documents response:', docsResponse.data)
        const docs = docsResponse.data.data || docsResponse.data || []
        // console.log('Parsed documents:', docs)
        setDocuments(docs)
      } catch (error) {
        console.log('Documents not available:', error)
      }

      // Fetch status logs and convert to timeline
      try {
        const logsResponse = await axios.get(`${API_BASE_URL}/application-status/${applicationId}/logs`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        // console.log('Status logs response:', logsResponse.data)
        const logs: StatusLog[] = logsResponse.data

        // Convert backend logs to timeline events
        const timelineEvents: TimelineEvent[] = logs.map(log => ({
          stage: log.stage,
          occurredAt: log.stage_entered_at,
          actorName: log.reviewer_role ? log.reviewer_role.replace(/_/g, ' ') : 'System',
          remarks: log.comments,
          status: log.status
        }))

        // console.log('Timeline events:', timelineEvents)
        setTimeline(timelineEvents)
      } catch (error) {
        console.log('Status logs not available:', error)
      }
    } catch (error: any) {
      // console.error('Failed to fetch application details:', error)
      toast.error(error.response?.data?.detail || t('toast.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleViewDocument = async (doc: Document) => {
    try {
      // console.log('=== VIEW DOCUMENT DEBUG ===')
      // console.log('Document object:', doc)
      // console.log('Document ID:', doc.id)
      // console.log('Document name:', doc.file_name)
      // console.log('Document file_url:', doc.file_url)
      // console.log('Document file_path:', doc.file_path)
      
      // Backend already provides file_url in the documents list response
      if (doc.file_url) {
        console.log('✅ Using file_url from document:', doc.file_url)
        console.log('Setting viewingDocument to:', doc)
        setViewingDocument(doc)
        console.log('Modal should open now')
        return
      }

      // Fallback: Fetch fresh presigned URL from backend
      // console.log('⚠️ No file_url, fetching presigned URL for document:', doc.id)
      const token = localStorage.getItem('access_token')
      const response = await axios.get(`${API_BASE_URL}/documents/${doc.id}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      // console.log('Download URL response:', response.data)
      const downloadUrl = response.data.data.download_url
      // console.log('Got download URL:', downloadUrl)
      setViewingDocument({ ...doc, file_url: downloadUrl })
      // console.log('Modal should open now')
    } catch (error: any) {
      // console.error('❌ Failed to get document URL:', error)
      toast.error(t('toast.documentLoadFailed'))
    }
  }

  const orderedStages = ['SUBMITTED', 'DISTRICT_AUTHORITY', 'SOCIAL_WELFARE', 'FINANCIAL_INSTITUTION', 'COMPLETED']
  
  // Simple logic: Track which stages are completed or rejected
  const stageStatus: Record<string, 'completed' | 'rejected' | 'pending'> = {
    SUBMITTED: 'completed', // Always completed since application exists
    DISTRICT_AUTHORITY: 'pending',
    SOCIAL_WELFARE: 'pending',
    FINANCIAL_INSTITUTION: 'pending',
    COMPLETED: 'pending'
  }
  
  // Mark stages based on timeline events
  timeline.forEach(log => {
    if (log.status === 'APPROVED' || log.status === 'COMPLETED') {
      stageStatus[log.stage] = 'completed'
    } else if (log.status === 'REJECTED') {
      stageStatus[log.stage] = 'rejected'
    }
  })
  
  // Special handling: If application has district_reviewed_at, mark DISTRICT_AUTHORITY based on status
  if (fullApplicationData?.district_reviewed_at) {
    if (status.includes('DOCUMENTS_APPROVED') || status === 'APPROVED') {
      stageStatus['DISTRICT_AUTHORITY'] = 'completed'
    } else if (status.includes('DOCUMENTS_REJECTED') || status.includes('DISTRICT_AUTHORITY_REJECTED')) {
      stageStatus['DISTRICT_AUTHORITY'] = 'rejected'
    }
  }
  
  // Find the last processed stage (completed or rejected)
  let lastProcessedIndex = 0
  for (let i = orderedStages.length - 1; i >= 0; i--) {
    if (stageStatus[orderedStages[i]] === 'completed' || stageStatus[orderedStages[i]] === 'rejected') {
      lastProcessedIndex = i
      break
    }
  }
  
  // Draw line up to the last processed stage
  // For justify-between layout with n items (5), gaps are at 0%, 25%, 50%, 75%, 100%
  // The circles are 36px (9 * 4) wide, so we need to account for positioning
  // Calculate base percentage, then adjust slightly to stop at circle center
  let progressPercentage = 0
  if (lastProcessedIndex > 0) {
    // Calculate the position where the circle center is
    progressPercentage = (lastProcessedIndex / (orderedStages.length - 1)) * 100
  }
  
  // Determine line color: red if any stage is rejected, orange otherwise
  const hasRejection = Object.values(stageStatus).includes('rejected')
  const lineColor = hasRejection ? 'bg-red-500' : 'bg-orange-500'
  
  // Keyboard navigation between nodes
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([])
  const focusNode = useCallback((idx: number) => { const el = nodeRefs.current[idx]; if (el) el.focus() }, [])
  const handleKeyNav = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); focusNode(Math.min(orderedStages.length - 1, idx + 1)) }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); focusNode(Math.max(0, idx - 1)) }
  }
  
  function stageLabel(stage: string) {
    const map: Record<string, string> = {
      SUBMITTED: t('timeline.stages.submitted'),
      DISTRICT_AUTHORITY: t('timeline.stages.districtReview'),
      SOCIAL_WELFARE: t('timeline.stages.socialWelfareReview'),
      FINANCIAL_INSTITUTION: t('timeline.stages.financialInstitution'),
      COMPLETED: t('timeline.stages.completed')
    }
    return map[stage] || stage.replace(/_/g, ' ')
  }

  function getDisplayStatus(status: string, application: ApplicationDetail | null): string {
    // Map specific statuses to user-friendly text
    if (status === 'DOCUMENTS_APPROVED' || (status === 'APPROVED' && application?.district_reviewed_at)) {
      return t('status.documentsApproved')
    }
    if (status === 'DOCUMENTS_REJECTED' || status === 'DISTRICT_AUTHORITY_REJECTED') {
      return t('status.documentsRejected')
    }
    if (status === 'SOCIAL_WELFARE_REJECTED') {
      return t('status.socialWelfareRejected')
    }
    if (status === 'FI_REJECTED') {
      return t('status.fiRejected')
    }
    if (status === 'REJECTED') {
      return t('status.applicationRejected')
    }
    // Otherwise, format the status nicely
    return status.replace(/_/g, ' ')
  }

  if (loading) return (
    <div className='flex items-center justify-center min-h-[400px]'>
      <div className="relative">
        <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    </div>
  )

  return (
    <div className='space-y-10'>
      {/* Language Switcher - Fixed top right */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      <header className='flex flex-col md:flex-row md:items-start md:justify-between gap-4'>
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            <Button variant='outline' size='sm' onClick={() => router.push('/applications')} className='gap-2'>
              <ArrowLeft className='h-4 w-4' />{t('header.backButton')}
            </Button>
            <h1 className='text-2xl font-bold tracking-tight'>{title}</h1>
          </div>
          <div className='flex flex-wrap gap-4 text-sm text-gray-600'>
            <span>{applicationNumber}</span>
            {amountRequested !== undefined && amountRequested !== null && <span>{t('header.requested')}: ₹{amountRequested.toLocaleString()}</span>}
            {amountApproved !== undefined && amountApproved !== null ? (
              <span className='text-green-600'>{t('header.approved')}: ₹{amountApproved.toLocaleString()}</span>
            ) : (
              <span className='text-gray-400'>{t('header.approved')}: {t('header.notAllocated')}</span>
            )}
            <span className={`status-badge status-${status.toLowerCase().replace(/_/g, '-')}`}>{getDisplayStatus(status, fullApplicationData)}</span>
          </div>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' size='sm' onClick={handleDownloadPDF}>
            <Download className='h-4 w-4 mr-1' />{t('header.downloadPdf')}
          </Button>
          <Button variant='outline' size='sm' onClick={() => {
            handleDownloadPDF()
            setTimeout(() => window.print(), 500)
          }}>
            <Printer className='h-4 w-4 mr-1' />{t('header.print')}
          </Button>
        </div>
      </header>

      {/* Application Details Accordion */}
      {fullApplicationData && (
        <Accordion type="single" collapsible className="w-full bg-white rounded-lg border border-gray-200 shadow-sm">
          <AccordionItem value="application-details" className="border-0">
            <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-orange-600" />
                <span className="font-semibold text-lg">{t('accordion.title')}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <div className="py-2 border-b-2 border-gray-200 mb-3">
                    <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">{t('accordion.basicInformation.title')}</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                      <FileText className="h-4 w-4 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 mb-1">{t('accordion.basicInformation.applicationNumber')}</div>
                        <div className="text-sm text-gray-600 font-mono">{fullApplicationData.application_number}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 mb-1">{t('accordion.basicInformation.titleLabel')}</div>
                        <div className="text-sm text-gray-600">{fullApplicationData.title || t('notAvailable')}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 mb-1">{t('accordion.basicInformation.description')}</div>
                        <div className="text-sm text-gray-600">{fullApplicationData.description || t('notAvailable')}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 mb-1">{t('accordion.basicInformation.applicationType')}</div>
                        <div className="text-sm text-gray-600">{fullApplicationData.application_type?.replace(/_/g, ' ') || t('notAvailable')}</div>
                      </div>
                    </div>
                    {/* Only show FIR for non-inter-caste marriage applications */}
                    {fullApplicationData.fir_number && fullApplicationData.application_type !== 'INTER_CASTE_MARRIAGE' && (
                      <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                        <Shield className="h-4 w-4 text-gray-400 mt-1" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 mb-1">{t('accordion.basicInformation.firNumber')}</div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                              {fullApplicationData.fir_number}
                            </span>
                            {/* Show CCTNS verification chip based on status */}
                            {fullApplicationData.cctns_verified ? (
                              <span className="inline-flex items-center gap-1.5 text-green-600 font-medium text-xs px-2.5 py-1 bg-green-50 rounded-md border border-green-200">
                                <CheckCircle2 className="h-3.5 w-3.5" /> 
                                <span>{t('accordion.basicInformation.cctnsVerified')}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-gray-500 text-xs px-2.5 py-1 bg-gray-50 rounded-md border border-gray-200">
                                <XCircle className="h-3.5 w-3.5" /> 
                                <span>{t('accordion.basicInformation.cctnsNotVerified')}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                      <IndianRupee className="h-4 w-4 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 mb-1">{t('accordion.basicInformation.amountApproved')}</div>
                        <div className="text-sm text-gray-600">
                          {fullApplicationData.amount_approved ? `₹${fullApplicationData.amount_approved.toLocaleString('en-IN')}` : t('header.notAllocated')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Applicant Information */}
                {fullApplicationData.applicant && (
                  <div>
                    <div className="py-2 border-b-2 border-gray-200 mb-3">
                      <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">{t('accordion.applicantInformation.title')}</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                        <User2 className="h-4 w-4 text-gray-400 mt-1" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 mb-1">{t('accordion.applicantInformation.fullName')}</div>
                          <div className="text-sm text-gray-600">{fullApplicationData.applicant.full_name}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                        <Mail className="h-4 w-4 text-gray-400 mt-1" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 mb-1">{t('accordion.applicantInformation.email')}</div>
                          <div className="text-sm text-gray-600">{fullApplicationData.applicant.email}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                        <Phone className="h-4 w-4 text-gray-400 mt-1" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 mb-1">{t('accordion.applicantInformation.phone')}</div>
                          <div className="text-sm text-gray-600">{fullApplicationData.applicant.phone_number}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                        <CreditCard className="h-4 w-4 text-gray-400 mt-1" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 mb-1">{t('accordion.applicantInformation.aadhaar')}</div>
                          <div className="text-sm text-gray-600 font-mono">{fullApplicationData.applicant.aadhaar_number}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                        <Calendar className="h-4 w-4 text-gray-400 mt-1" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 mb-1">{t('accordion.applicantInformation.dateOfBirth')}</div>
                          <div className="text-sm text-gray-600">
                            {fullApplicationData.applicant.date_of_birth ? new Date(fullApplicationData.applicant.date_of_birth).toLocaleDateString() : t('notAvailable')}
                          </div>
                        </div>
                      </div>
                      {fullApplicationData.applicant.gender && (
                        <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 mb-1">{t('accordion.applicantInformation.gender')}</div>
                            <div className="text-sm text-gray-600">{fullApplicationData.applicant.gender}</div>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                        <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 mb-1">{t('accordion.applicantInformation.address')}</div>
                          <div className="text-sm text-gray-600">
                            {[
                              fullApplicationData.applicant.address_line1,
                              fullApplicationData.applicant.address_line2,
                              fullApplicationData.applicant.city,
                              fullApplicationData.applicant.state,
                              fullApplicationData.applicant.pincode
                            ].filter(Boolean).join(', ') || t('notAvailable')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Review Comments */}
                {(fullApplicationData.district_comments || fullApplicationData.social_welfare_comments) && (
                  <div>
                    <div className="py-2 border-b-2 border-gray-200 mb-3">
                      <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">{t('accordion.reviewComments.title')}</h4>
                    </div>
                    <div className="space-y-3">
                      {fullApplicationData.district_comments && (
                        <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 mb-1">{t('accordion.reviewComments.districtComments')}</div>
                            <div className="text-sm text-gray-600">{fullApplicationData.district_comments}</div>
                          </div>
                        </div>
                      )}
                      {fullApplicationData.social_welfare_comments && (
                        <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 mb-1">{t('accordion.reviewComments.socialWelfareComments')}</div>
                            <div className="text-sm text-gray-600">{fullApplicationData.social_welfare_comments}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      <section aria-label='Timeline'>
        <Card>
          <CardHeader><CardTitle className='text-sm uppercase tracking-wide text-gray-500'>{t('timeline.title')}</CardTitle></CardHeader>
          <CardContent>
            {/* Responsive horizontal tracker on md+, vertical on small */}
            <div className='relative'>
              {/* Horizontal connector line (md+) - background gray line */}
              <div className='hidden md:block absolute top-[22px] left-0 right-0 h-[2px] bg-gray-200 pointer-events-none' aria-hidden='true'></div>
              {/* Progress fill (md+) - colored line up to last processed stage */}
              {lastProcessedIndex > 0 && (
                <div className={`hidden md:block absolute top-[22px] left-0 h-[2px] transition-all duration-500 ease-out pointer-events-none ${lineColor}`}
                  style={{ width: `${progressPercentage}%` }} aria-hidden='true'></div>
              )}
              <ol className='flex md:flex-row flex-col md:justify-between gap-8 md:gap-0 relative z-10' role='list'>
                {orderedStages.map((stage, idx) => {
                  const event = timeline.find(e => e.stage === stage)
                  const currentStatus = stageStatus[stage]
                  const isCompleted = currentStatus === 'completed'
                  const isRejected = currentStatus === 'rejected'
                  const isPending = currentStatus === 'pending'
                  const isActive = !!event && event.status === 'PENDING'
                  const fullTimestamp = event ? new Date(event.occurredAt).toLocaleString() : '—'

                  return (
                    <li key={stage} className='flex-1 min-w-[120px] relative md:text-center timeline-node-anim' role='listitem' style={{ animationDelay: `${idx * 80}ms` }}>
                      {/* Vertical connector for small screens - only show colored line if current stage is processed */}
                      {idx < orderedStages.length - 1 && <span className='md:hidden absolute left-[11px] top-10 h-full w-[2px] bg-gray-200 rounded'></span>}
                      {idx <= lastProcessedIndex && idx < orderedStages.length - 1 && (
                        <span className={`md:hidden absolute left-[11px] top-10 h-full w-[2px] rounded ${lineColor}`}></span>
                      )}
                      <div className='flex md:flex-col items-start md:items-center gap-3 md:gap-2'>
                        <button
                          ref={el => { nodeRefs.current[idx] = el }}
                          onKeyDown={(e) => handleKeyNav(e, idx)}
                          tabIndex={0}
                          aria-current={isActive ? 'step' : undefined}
                          aria-label={`${stageLabel(stage)} ${isCompleted ? t('timeline.statusLabels.completed') : isRejected ? t('timeline.statusLabels.rejected') : isActive ? t('timeline.statusLabels.inProgress') : t('timeline.statusLabels.pending')} ${event ? t('timeline.ariaLabels.on') + ' ' + fullTimestamp : ''}`}
                          className={`group relative h-9 w-9 flex items-center justify-center rounded-full border-2 text-[11px] font-semibold outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300
                            ${isRejected ? 'bg-red-600 border-red-600 text-white shadow-sm focus:ring-red-500' : 
                            isCompleted ? 'bg-orange-600 border-orange-600 text-white shadow-sm focus:ring-orange-500' : 
                            isActive ? 'bg-white border-orange-500 text-orange-600 focus:ring-orange-500' : 
                            'bg-white border-dashed border-gray-300 text-gray-400 focus:ring-orange-500'}
                          `}
                        >
                          <span className='relative'>{isRejected ? '✗' : isCompleted ? '✓' : idx + 1}</span>
                          {/* Tooltip */}
                          <span role='tooltip' className='pointer-events-none opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition rounded-md bg-gray-900 text-white text-[10px] px-2 py-1 absolute top-full left-1/2 -translate-x-1/2 mt-2 z-20 whitespace-nowrap shadow'>
                            <span className='font-medium'>{stageLabel(stage)}</span>{event ? ` • ${fullTimestamp}` : isActive ? ' • ' + t('timeline.inProgress') : ' • ' + t('timeline.pendingLabel')}{event?.actorName ? ` • ${event.actorName}` : ''}
                          </span>
                        </button>
                        <div className='flex-1 md:flex md:flex-col md:items-center md:space-y-1'>
                          <p className='text-xs font-medium md:mt-1'>{stageLabel(stage)}</p>
                          {event && <p className='text-[11px] text-gray-500 flex items-center gap-1 md:justify-center'><Clock className='h-3 w-3' />{new Date(event.occurredAt).toLocaleDateString()} {event.actorName && '• ' + event.actorName}</p>}
                          {event?.remarks && <p className='text-[11px] text-gray-400 italic md:text-center'>{event.remarks}</p>}
                          {!event && isActive && <p className='text-[10px] text-orange-600 md:text-center'>{t('timeline.inProgress')}</p>}
                          {!event && isPending && <p className='text-[10px] text-gray-400 md:text-center'>{t('timeline.pendingLabel')}</p>}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>
            <div className='mt-4 flex flex-wrap gap-4 text-[11px] text-gray-500'>
              <div className='flex items-center gap-1'><span className='h-3 w-3 rounded-full bg-orange-600 inline-block'></span> {t('timeline.legend.completed')}</div>
              <div className='flex items-center gap-1'><span className='h-3 w-3 rounded-full bg-red-600 inline-block'></span> {t('timeline.legend.rejected')}</div>
              <div className='flex items-center gap-1'><span className='h-3 w-3 rounded-full border-2 border-orange-500 inline-block'></span> {t('timeline.legend.current')}</div>
              <div className='flex items-center gap-1'><span className='h-3 w-3 rounded-full border-2 border-dashed border-gray-300 inline-block'></span> {t('timeline.legend.upcoming')}</div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Documents Section */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <FileText className='h-5 w-5 text-orange-600' />
            {t('documents.title')} ({documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length > 0 ? (
            <div className='space-y-3'>
              {documents.map((doc) => (
                <div key={doc.id} className='flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors'>
                  <div className='flex items-center gap-4 flex-1 min-w-0'>
                    <div className='p-2 bg-white rounded-lg border border-gray-200'>
                      <FileText className='h-5 w-5 text-orange-600' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='font-medium text-gray-900 truncate'>{doc.file_name}</div>
                      <div className='text-sm text-gray-500'>{doc.document_type.replace(/_/g, ' ')}</div>
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <span className={`text-xs px-2 py-1 rounded-full ${doc.status === 'VERIFIED' ? 'bg-green-100 text-green-700' : doc.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                      {doc.status === 'VERIFIED' ? t('documents.status.verified') : doc.status === 'PENDING' ? t('documents.status.pending') : t('documents.status.rejected')}
                    </span>
                    <Button size='sm' variant='outline' onClick={() => handleViewDocument(doc)} className='gap-2 hover:bg-orange-50 border-orange-200 text-orange-700'>
                      <Eye className='h-4 w-4' />{t('documents.viewButton')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-8'>
              <FileText className='h-16 w-16 text-gray-300 mx-auto mb-3' />
              <p className='text-gray-500'>{t('documents.noDocuments')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Messages and Comments */}
      <Card>
        <CardHeader><CardTitle>{t('messages.title')}</CardTitle></CardHeader>
        <CardContent>
          <div className='space-y-3 text-sm max-h-64 overflow-auto'>
            {timeline.filter(t => t.remarks).map((event, idx) => (
              <div key={idx} className='bg-gray-100 rounded p-2'>
                <p className='text-[11px] text-gray-500'>{new Date(event.occurredAt).toLocaleDateString()}</p>
                <p><strong>{event.actorName}:</strong> {event.remarks}</p>
              </div>
            ))}
            {timeline.filter(t => t.remarks).length === 0 && (
              <p className='text-gray-400 text-center py-4'>{t('messages.noComments')}</p>
            )}
          </div>
          <form className='mt-4 flex gap-2' onSubmit={(e) => { e.preventDefault(); toast(t('toast.messagingComingSoon')) }}>
            <input className='flex-1 border rounded px-2 py-1 text-sm' placeholder={t('messages.placeholder')} />
            <Button type='submit' size='sm' variant='outline'>{t('messages.sendButton')}</Button>
          </form>
        </CardContent>
      </Card>

      {/* Document Viewer Modal - Exact copy from documents tab */}
      {(() => {
        console.log('Modal render check:', {
          hasViewingDocument: !!viewingDocument,
          hasFileUrl: !!viewingDocument?.file_url,
          viewingDocument: viewingDocument,
          shouldRender: !!(viewingDocument && viewingDocument.file_url)
        })
        return null
      })()}
      {viewingDocument && viewingDocument.file_url && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
          onClick={() => {
            // console.log('Modal backdrop clicked - closing')
            setViewingDocument(null)
          }}
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
                  <p className="text-sm text-gray-600">{viewingDocument.document_type?.replace(/_/g, ' ')}</p>
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
                    <p className="text-gray-500">No preview available</p>
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
                  Open in New Tab
                </Button>
              )}
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

      <style jsx>{`
        .timeline-node-anim {
          animation: fadeInUp 0.4s ease-out forwards;
          opacity: 0;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
