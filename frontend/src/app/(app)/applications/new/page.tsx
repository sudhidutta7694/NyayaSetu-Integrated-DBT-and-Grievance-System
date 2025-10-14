'use client'
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react'
import { DocumentUploader, UploadFileMeta } from '@/components/documents/DocumentUploader'
import { DocumentChecklistProvider, useDocumentChecklist } from '@/contexts/DocumentChecklistContext'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/accessibility/LanguageSwitcher'

interface DraftApplication { id:string; step:number; data:Record<string,any>; updatedAt:string }
interface MappedDoc { id:string; requirementType:string; meta:UploadFileMeta; verificationStatus:'PENDING'|'VERIFIED'|'REJECTED' }
interface TempDocument { file: File; type: string; label: string; uploadedAt: string }
const TOTAL_STEPS=5

function WizardInner(){
  const t = useTranslations('userNewApplication')
  const { act, setAct, requirements, setUserCategory } = useDocumentChecklist()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [applicationData, setApplicationData] = useState<Record<string,any>>({})
  const [tempFormData, setTempFormData] = useState<Record<string,any>>({})
  const [isSaving,setIsSaving]=useState(false)
  const [errors,setErrors]=useState<Record<string,string>>({})
  const [docs,setDocs]=useState<UploadFileMeta[]>([])
  const [mapped,setMapped]=useState<MappedDoc[]>([])
  const [declaration,setDeclaration]=useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [existingDocuments, setExistingDocuments] = useState<any[]>([])
  const [tempDocuments, setTempDocuments] = useState<TempDocument[]>([])
  const [viewingDocument, setViewingDocument] = useState<any | null>(null)
  const [uploadingType, setUploadingType] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [selectedRequirementType, setSelectedRequirementType] = useState<string | null>(null)

  // Step labels with translations
  const stepLabels = [
    t('steps.applicantInfo'),
    t('steps.incidentDetails'),
    t('steps.documentChecklist'),
    t('steps.bankDetails'),
    t('steps.reviewConsent')
  ]

  // Reset act when component mounts
  useEffect(() => {
    setAct('')
  }, [])

  // Fetch user profile, existing documents, and bank details
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
        const token = localStorage.getItem('access_token')
        const response = await fetch(`${API_BASE_URL}/users/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          setUserProfile(data)
          
          if (data.category) {
            setUserCategory(data.category)
          }
          
          const todayDate = new Date().toISOString().split('T')[0]
          const firstBank = data.bank_accounts && data.bank_accounts.length > 0 ? data.bank_accounts[0] : null
          
          setApplicationData(prev => ({
            ...prev,
            fullName: data.full_name || '',
            email: data.email || '',
            phone: data.phone_number || '',
            address: data.address || '',
            district: data.district || '',
            incidentDate: todayDate,
            bankAccountNumber: firstBank?.account_number || '',
            bankIfscCode: firstBank?.ifsc_code || '',
            bankName: firstBank?.bank_name || '',
            bankBranch: firstBank?.branch_name || '',
            accountHolderName: firstBank?.account_holder_name || ''
          }))
        }
      } catch (error) {
        // Failed to fetch profile
      }
    }
    
    const fetchExistingDocuments = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
        const token = localStorage.getItem('access_token')
        const response = await fetch(`${API_BASE_URL}/documents/list`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          const result = await response.json()
          setExistingDocuments(result.data || [])
        }
      } catch (error) {
        // Failed to fetch documents
      }
    }
    
    fetchProfile()
    fetchExistingDocuments()
  }, [])

  const currentData = useMemo(() => ({...applicationData, ...tempFormData}), [applicationData, tempFormData])

  const effectiveRequirements = useMemo(()=>{
    const base = requirements.map(r=> ({...r}))
    const benefits: string[] = Array.isArray(applicationData.requestedBenefits)? applicationData.requestedBenefits: []
    const selectedActType = currentData.actType || ''
    if(selectedActType==='PCR_RELIEF'){
      if(benefits.includes('LEGAL_AID')){
        const idx = base.findIndex(r=> r.type==='COURT_ORDER'); if(idx>=0) base[idx].required = true
      }
      if((applicationData.amountRequested||0) > 0){
        const idx = base.findIndex(r=> r.type==='MEDICAL_REPORT'); if(idx>=0) base[idx].required = true
      }
    } else if(selectedActType==='POA_COMPENSATION'){
      if(benefits.includes('LEGAL_AID')){
        const idx = base.findIndex(r=> r.type==='COURT_PROCEEDINGS'); if(idx>=0) base[idx].required = true
      }
      if(benefits.includes('REHABILITATION')){
        const idx = base.findIndex(r=> r.type==='REHAB_PROOF'); if(idx>=0) base[idx].required = true
      }
      if((applicationData.amountRequested||0) > 0){
        const idx = base.findIndex(r=> r.type==='MEDICAL_REPORT'); if(idx>=0) base[idx].required = true
      }
    } else if(selectedActType==='INTER_CASTE_MARRIAGE'){
      if(benefits.includes('INCENTIVE')){
        const idx = base.findIndex(r=> r.type==='ADDRESS_PROOF_BOTH'); if(idx>=0) base[idx].required = true
      }
    }
    return base
  }, [requirements, applicationData, tempFormData])

  function handleFieldChange(name:string,value:any){ 
    setTempFormData(prev => ({...prev, [name]: value}))
  }
  
  function next(){ 
    if(validate(currentStep)){
      setApplicationData(prev => ({...prev, ...tempFormData}))
      setTempFormData({})
      setCurrentStep(prev => Math.min(TOTAL_STEPS, prev + 1))
    }
  }
  
  function prev(){ 
    setCurrentStep(prev => Math.max(1, prev - 1))
  }

  const stepSchemas: Record<number,z.ZodSchema<any>> = {
    1: z.object({ 
      actType: z.string().min(1, t('step1.errors.typeRequired')),
      district: z.string().min(1, t('step1.errors.districtRequired'))
    }),
    2: z.object({ 
      incidentDate: z.string().min(1, t('step2.errors.dateRequired')), 
      policeStation: z.string().min(1, t('step2.errors.policeStationRequired')),
      firNumber: z.string().optional(),
      incidentDescription: z.string().min(10, t('step2.errors.descriptionMinLength'))
    }),
    4: z.object({
      bankAccountNumber: z.string()
        .min(9, t('step4.errors.accountNumberMinLength'))
        .max(18, t('step4.errors.accountNumberMaxLength'))
        .regex(/^\d+$/, t('step4.errors.accountNumberDigitsOnly')),
      bankIfscCode: z.string()
        .length(11, t('step4.errors.ifscLength'))
        .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, t('step4.errors.ifscFormat')),
      bankName: z.string().min(1, t('step4.errors.bankNameRequired')),
      bankBranch: z.string().min(1, t('step4.errors.branchRequired')),
      accountHolderName: z.string().min(1, t('step4.errors.accountHolderRequired'))
    })
  }
  
  function validate(step=currentStep){
    const e:Record<string,string>={}
    for(let s=1; s<=step; s++){
      const schema=stepSchemas[s]
      if(schema){
        const parse = schema.safeParse(currentData)
        if(!parse.success){
          parse.error.issues.forEach(i=> { if(i.path[0]) e[i.path[0] as string]= i.message })
        }
      }
    }
    
    if(step>=2 && currentData.actType !== 'INTER_CASTE_MARRIAGE'){
      if(!currentData.firNumber || currentData.firNumber.trim() === ''){
        e.firNumber = t('step2.errors.firRequired')
      }
    }
    if(step>=3){
      const required = effectiveRequirements.filter(r=> r.required)
      const allDocs = [...tempDocuments, ...existingDocuments.map(d => ({type: d.document_type}))]
      const covered = required.every(r=> allDocs.some(doc=> doc.type === r.type))
      
      if(!covered) {
        const missing = required.filter(r=> !allDocs.some(doc=> doc.type === r.type))
        // Use translated document names in error message
        const missingNames = missing.map(m => t(`step3.documentTypes.${m.type}`, { defaultValue: m.label })).join(', ')
        e.documents = t('step3.errors.documentsRequired', { missing: missingNames })
      }
    }
    if(step>=5 && !declaration) e.declaration = t('step5.declaration.error')
    setErrors(e)
    return Object.keys(e).length===0
  }
  
  const maxNavigableStep = useMemo(()=>{
    for(let s=1; s<=TOTAL_STEPS; s++){
      const schema = stepSchemas[s]
      if(s===5){
        return 5
      }
      if(schema){
        const parse = schema.safeParse(currentData)
        if(!parse.success){
          return Math.max(1, s)
        }
      }
    }
    return TOTAL_STEPS
  }, [currentData])

  const isStep5Valid = useMemo(() => {
    const finalData = { ...applicationData, ...tempFormData }

    for (let s = 1; s <= 4; s++) {
      const schema = stepSchemas[s]
      if (schema) {
        if (!schema.safeParse(finalData).success) {
          return false
        }
      }
    }
    
    const required = effectiveRequirements.filter(r => r.required)
    const allDocs = [...tempDocuments, ...existingDocuments.map(d => ({type: d.document_type}))]
    const covered = required.every(r => allDocs.some(doc => doc.type === r.type))
    if (!covered) {
      return false
    }
    
    if (!declaration) {
      return false
    }
    
    return true
  }, [applicationData, tempFormData, stepSchemas, effectiveRequirements, existingDocuments, tempDocuments, declaration])

  async function submit(){
    const finalData = {...applicationData, ...tempFormData}
    
    if(!validate(4)){ toast.error(t('validation.fixErrors')); return }
    
    setIsSaving(true)
    
    try {
      const token = localStorage.getItem('access_token')
      
      if (tempDocuments.length > 0) {
        toast(t('messages.uploadingDocuments'))
        
        const { uploadDocument } = await import('@/lib/api/documents')
        
        for (const tempDoc of tempDocuments) {
          try {
            await uploadDocument(
              tempDoc.file,
              tempDoc.type,
              undefined,
              (progress) => {}
            )
          } catch (err: any) {
            throw new Error(t('step3.toasts.uploadFailed', { label: tempDoc.label, error: err.message }))
          }
        }
        
        toast.success(t('messages.documentsUploaded'))
      }
      
      if (finalData.bankAccountNumber && finalData.bankIfscCode) {
        const hasExistingBank = userProfile?.bank_accounts && userProfile.bank_accounts.length > 0
        const firstBank = hasExistingBank ? userProfile.bank_accounts[0] : null
        
        const isBankDifferent = !firstBank || 
          firstBank.account_number !== finalData.bankAccountNumber ||
          firstBank.ifsc_code !== finalData.bankIfscCode ||
          firstBank.bank_name !== finalData.bankName ||
          firstBank.branch_name !== finalData.bankBranch ||
          firstBank.account_holder_name !== finalData.accountHolderName
        
        if (isBankDifferent) {
          try {
            toast(t('messages.savingBankDetails'))
            const { usersApi } = await import('@/lib/api/users')
            
            await usersApi.saveBankAccount({
              account_number: finalData.bankAccountNumber,
              ifsc_code: finalData.bankIfscCode,
              bank_name: finalData.bankName,
              branch_name: finalData.bankBranch,
              account_holder_name: finalData.accountHolderName
            })
            
            toast.success(t('messages.bankDetailsSaved'))
          } catch (err: any) {
            toast.error(t('messages.bankSaveWarning'))
          }
        }
      }
      
      const title = `${finalData.actType} Application`.trim()
      let incidentDatetime = null
      if (finalData.incidentDate) {
        incidentDatetime = `${finalData.incidentDate}T00:00:00`
      }
      
      const payload = {
        title: title || 'Application',
        description: finalData.incidentDescription || '',
        application_type: finalData.actType,
        incident_date: incidentDatetime,
        incident_description: finalData.incidentDescription || '',
        incident_district: finalData.district,
        police_station: finalData.policeStation || null,
        fir_number: finalData.firNumber || null,
        bank_account_number: finalData.bankAccountNumber || null,
        bank_ifsc_code: finalData.bankIfscCode || null,
        bank_name: finalData.bankName || null,
        bank_branch: finalData.bankBranch || null,
        account_holder_name: finalData.accountHolderName || null
      }
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${API_BASE_URL}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        const error = await response.json()
        let errorMessage = t('messages.submissionFailed')
        if (typeof error.detail === 'string') {
          errorMessage = error.detail
        } else if (Array.isArray(error.detail)) {
          errorMessage = error.detail.map((e: any) => e.msg || e.message || JSON.stringify(e)).join(', ')
        } else if (error.detail) {
          errorMessage = JSON.stringify(error.detail)
        }
        throw new Error(errorMessage)
      }
      
      const result = await response.json()
      toast.success(t('messages.submissionSuccess'))
      setTimeout(()=> router.push('/applications'), 1000)
      
    } catch (error: any) {
      toast.error(error.message || t('messages.submissionFailed'))
    } finally {
      setIsSaving(false)
    }
  }

  function renderStep(){
    switch(currentStep){
      case 1:
        return (
          <div className='space-y-4'>
            <label className='block text-sm font-medium'>{t('step1.title')} <span className='text-red-600'>*</span>
              <select
                className='mt-1 w-full border rounded px-3 py-2 text-sm'
                value={tempFormData.actType || currentData.actType || ''}
                onChange={e=> { 
                  const value = e.target.value
                  setAct(value)
                  handleFieldChange('actType', value)
                }}
              >
                <option value=''>{t('step1.selectType')}</option>
                <option value='PCR_RELIEF'>{t('step1.types.pcrRelief')}</option>
                <option value='POA_COMPENSATION'>{t('step1.types.poaCompensation')}</option>
                <option value='INTER_CASTE_MARRIAGE'>{t('step1.types.interCasteMarriage')}</option>
                <option value='OTHER'>{t('step1.types.other')}</option>
              </select>
              {errors.actType && <span className='text-red-600 text-xs mt-1 block'>{errors.actType}</span>}
            </label>
            
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3'>
              <p className='text-sm font-medium text-blue-900'>{t('step1.profileSection.title')}</p>
              <div className='grid md:grid-cols-2 gap-3'>
                <div>
                  <label className='text-xs text-gray-600'>{t('step1.profileSection.fullName')}</label>
                  <div className='text-sm font-medium text-gray-900'>{currentData.fullName || t('common.loading')}</div>
                </div>
                <div>
                  <label className='text-xs text-gray-600'>{t('step1.profileSection.phone')}</label>
                  <div className='text-sm font-medium text-gray-900'>{currentData.phone || t('common.loading')}</div>
                </div>
                <div>
                  <label className='text-xs text-gray-600'>{t('step1.profileSection.email')}</label>
                  <div className='text-sm font-medium text-gray-900'>{currentData.email || t('common.loading')}</div>
                </div>
                <div>
                  <label className='text-xs text-gray-600'>{t('step1.profileSection.district')}</label>
                  <div className='text-sm font-medium text-gray-900'>{currentData.district || t('common.loading')}</div>
                </div>
                <div className='md:col-span-2'>
                  <label className='text-xs text-gray-600'>{t('step1.profileSection.address')}</label>
                  <div className='text-sm font-medium text-gray-900'>{currentData.address || t('common.loading')}</div>
                </div>
              </div>
              <p className='text-xs text-gray-500 mt-2'>{t('step1.profileSection.updateNote')}</p>
            </div>
          </div>
        )
      case 2:
        return (
          <div className='space-y-4'>
            <div className='grid md:grid-cols-2 gap-4'>
              <div>
                <label className='text-sm font-medium'>
                  {t('step2.incidentDate')} <span className='text-red-600'>*</span>
                </label>
                <input 
                  type='date' 
                  className='mt-1 w-full border rounded px-3 py-2 text-sm' 
                  value={tempFormData.incidentDate || currentData.incidentDate || ''} 
                  onChange={e=> handleFieldChange('incidentDate',e.target.value)} 
                />
                {errors.incidentDate && <span className='text-red-600 text-xs mt-1 block'>{errors.incidentDate}</span>}
              </div>
              <div>
                <label className='text-sm font-medium'>
                  {t('step2.policeStation')} <span className='text-red-600'>*</span>
                </label>
                <input 
                  className='mt-1 w-full border rounded px-3 py-2 text-sm' 
                  value={tempFormData.policeStation || currentData.policeStation||''} 
                  onChange={e=> handleFieldChange('policeStation',e.target.value)} 
                />
                {errors.policeStation && <span className='text-red-600 text-xs mt-1 block'>{errors.policeStation}</span>}
              </div>
            </div>
            {(currentData.actType !== 'INTER_CASTE_MARRIAGE') && (
              <div>
                <label className='text-sm font-medium'>
                  {t('step2.firNumber')} <span className='text-red-600'>*</span>
                </label>
                <input 
                  className='mt-1 w-full border rounded px-3 py-2 text-sm' 
                  value={tempFormData.firNumber || currentData.firNumber||''} 
                  onChange={e=> handleFieldChange('firNumber',e.target.value)} 
                />
                {errors.firNumber ? (
                  <span className='text-red-600 text-xs mt-1 block'>{errors.firNumber}</span>
                ) : (
                  <span className='text-gray-500 text-xs mt-1 block'>{t('step2.firHint')}</span>
                )}
              </div>
            )}
            <div>
              <label className='text-sm font-medium'>
                {t('step2.incidentDescription')} <span className='text-red-600'>*</span>
              </label>
              <textarea 
                className='mt-1 w-full border rounded px-3 py-2 text-sm' 
                rows={4}
                placeholder={t('step2.descriptionPlaceholder')}
                value={tempFormData.incidentDescription || currentData.incidentDescription||''} 
                onChange={e=> handleFieldChange('incidentDescription',e.target.value)} 
              />
              {errors.incidentDescription && <span className='text-red-600 text-xs mt-1 block'>{errors.incidentDescription}</span>}
            </div>
          </div>
        )
      case 3:
        const handleFileSelect = (requirementType: string) => {
          setSelectedRequirementType(requirementType)
          fileInputRef.current?.click()
        }
        
        const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
          const file = event.target.files?.[0]
          if (!file || !selectedRequirementType) return

          const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
          if (!allowedTypes.includes(file.type)) {
            toast.error(t('step3.errors.invalidFileType'))
            return
          }

          if (file.size > 10 * 1024 * 1024) {
            toast.error(t('step3.errors.fileSizeExceeded'))
            return
          }

          try {
            setUploadingType(selectedRequirementType)
            setUploadProgress(0)

            for (let i = 0; i <= 100; i += 20) {
              setUploadProgress(i)
              await new Promise(resolve => setTimeout(resolve, 100))
            }

            const reqLabel = effectiveRequirements.find(r => r.type === selectedRequirementType)?.label || selectedRequirementType
            const tempDoc: TempDocument = {
              file: file,
              type: selectedRequirementType,
              label: reqLabel,
              uploadedAt: new Date().toISOString()
            }
            
            setTempDocuments(prev => {
              const filtered = prev.filter(d => d.type !== selectedRequirementType)
              return [...filtered, tempDoc]
            })
            
            toast.success(t('step3.toasts.uploadSuccess'))
          } catch (error: any) {
            toast.error(error.message || t('messages.submissionFailed'))
          } finally {
            setUploadingType(null)
            setUploadProgress(0)
            setSelectedRequirementType(null)
            if (fileInputRef.current) {
              fileInputRef.current.value = ''
            }
          }
        }
        
        const handleDigilockerImport = async (requirementType: string) => {
          try {
            setUploadingType(requirementType)
            setUploadProgress(0)
            
            toast(t('step3.toasts.digilockerConnecting'), { icon: '🔗' })
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            for (let i = 20; i <= 100; i += 20) {
              setUploadProgress(i)
              await new Promise(resolve => setTimeout(resolve, 300))
            }
            
            const requirement = effectiveRequirements.find(r => r.type === requirementType)
            const docLabel = requirement?.label || requirementType
            const mockFile = new File(
              ['Mock DigiLocker document content'], 
              `${docLabel}_DigiLocker.pdf`,
              { type: 'application/pdf' }
            )
            
            const tempDoc: TempDocument = {
              file: mockFile,
              type: requirementType,
              label: docLabel,
              uploadedAt: new Date().toISOString()
            }
            
            setTempDocuments(prev => {
              const filtered = prev.filter(d => d.type !== requirementType)
              return [...filtered, tempDoc]
            })
            
            toast.success(t('step3.toasts.digilockerSuccess'))
          } catch (error: any) {
            toast.error(error.message || t('messages.submissionFailed'))
          } finally {
            setUploadingType(null)
            setUploadProgress(0)
          }
        }
        
        const handleView = async (doc: any) => {
          try {
            if (doc.is_temp) {
              const tempDoc = tempDocuments.find(d => d.type === doc.document_type)
              if (tempDoc) {
                const blobUrl = URL.createObjectURL(tempDoc.file)
                setViewingDocument({
                  ...doc,
                  file_url: blobUrl
                })
              }
              return
            }
            
            const { getDocumentDownloadUrl } = await import('@/lib/api/documents')
            const downloadUrl = await getDocumentDownloadUrl(doc.id)
            setViewingDocument({
              ...doc,
              file_url: downloadUrl
            })
          } catch (error) {
            toast.error(t('step3.toasts.viewFailed'))
          }
        }
        
        const getDocumentForRequirement = (requirementType: string) => {
          const tempDoc = tempDocuments.find(doc => doc.type === requirementType)
          if (tempDoc) {
            return {
              file_name: tempDoc.file.name,
              created_at: tempDoc.uploadedAt,
              status: 'PENDING',
              document_type: tempDoc.type,
              is_temp: true
            }
          }
          const doc = existingDocuments.find(doc => doc.document_type === requirementType)
          return doc
        }
        
        return (
          <div className='space-y-6'>
            <p className='text-sm text-gray-600'>{t('step3.subtitle')}</p>
            <div className='text-xs text-gray-500 mb-2'>
              {t('step3.uploadStatus', { temp: tempDocuments.length, saved: existingDocuments.length })}
            </div>
            <div className='grid md:grid-cols-2 gap-4'>
              {effectiveRequirements.map(r=> {
                const existingDoc = getDocumentForRequirement(r.type)
                const isUploading = uploadingType === r.type
                // Get translated label for the document type
                const translatedLabel = t(`step3.documentTypes.${r.type}`, { defaultValue: r.label })
                
                return (
                  <div key={r.type} className='border border-gray-200 rounded-xl p-6 bg-white shadow-sm flex flex-col gap-4 min-h-[240px]'>
                    <div>
                      <div className='mb-2'>
                        <h3 className='font-semibold text-base text-gray-900'>{translatedLabel}</h3>
                      </div>
                      {r.sampleUrl && (
                        <a href={r.sampleUrl} target='_blank' rel='noopener noreferrer' className='text-xs text-orange-600 hover:underline'>
                          {t('step3.viewSample')}
                        </a>
                      )}
                    </div>

                    <div className='flex-1 flex flex-col gap-3'>
                      {existingDoc ? (
                        <>
                          <div className='bg-gray-50 rounded-lg p-3 space-y-2'>
                            <div className='flex items-start gap-2'>
                              <svg className='h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                              </svg>
                              <div className='flex-1 min-w-0'>
                                <p className='text-sm font-medium text-gray-900 truncate'>{existingDoc.file_name}</p>
                                <p className='text-xs text-gray-500 mt-1'>
                                  {t('step3.docInfo.uploaded')} {new Date(existingDoc.created_at).toLocaleDateString('en-IN')}
                                </p>
                              </div>
                            </div>
                            
                            {existingDoc.status && (
                              <div className='inline-flex'>
                                <span className={`text-[10px] px-2 py-1 rounded font-medium ${
                                  existingDoc.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                                  existingDoc.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {t(`step3.statuses.${existingDoc.status.toLowerCase()}`)}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className='flex gap-2 mt-auto'>
                            <button
                              type='button'
                              className='flex-1 text-sm px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 font-medium flex items-center justify-center gap-1'
                              onClick={() => handleView(existingDoc)}
                            >
                              <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                              </svg>
                              {t('buttons.view')}
                            </button>
                            <button
                              type='button'
                              className='flex-1 text-sm px-3 py-2 border border-orange-300 text-orange-600 rounded-md hover:bg-orange-50 font-medium flex items-center justify-center gap-1'
                              onClick={() => handleFileSelect(r.type)}
                            >
                              <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                              </svg>
                              {t('buttons.replace')}
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          {isUploading ? (
                            <div className='space-y-2 mt-auto'>
                              <div className='flex items-center justify-between text-sm text-gray-700'>
                                <span>{t('step3.uploading')}</span>
                                <span className='font-semibold'>{t('step3.uploadProgress', { progress: uploadProgress })}</span>
                              </div>
                              <div className='h-2 bg-gray-200 rounded-full overflow-hidden'>
                                <div
                                  className='h-full bg-orange-600 transition-all duration-300'
                                  style={{ width: `${uploadProgress}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className='flex flex-col gap-3 mt-auto'>
                              <button
                                type='button'
                                className='w-full text-sm px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 font-medium flex items-center justify-center gap-2'
                                onClick={() => handleFileSelect(r.type)}
                              >
                                <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' />
                                </svg>
                                {t('buttons.uploadFile')}
                              </button>
                              <button
                                type='button'
                                className='w-full text-sm px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 font-medium flex items-center justify-center gap-2'
                                onClick={() => handleDigilockerImport(r.type)}
                              >
                                <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
                                </svg>
                                {t('buttons.importDigilocker')}
                              </button>
                              <div className='text-xs text-gray-500 text-center'>
                                {t('step3.fileTypes')}
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
            
            <input
              ref={fileInputRef}
              type='file'
              hidden
              accept='application/pdf,image/jpeg,image/jpg,image/png'
              onChange={handleFileUpload}
            />
            
            {errors.documents && <div className='text-red-600 text-sm mt-4'>{errors.documents}</div>}
          </div>
        )
      case 4:
        const hasExistingBank = userProfile?.bank_accounts && userProfile.bank_accounts.length > 0
        const statusKey = hasExistingBank ? 'statusAutoFilled' : 'statusWillBeSaved'
        return (
          <div className='space-y-6'>
            <p className='text-sm text-gray-600'>{t('step4.subtitle', { status: t(`step4.${statusKey}`) })}</p>
            <div className='grid sm:grid-cols-2 gap-4'>
              <div>
                <label className='text-sm font-medium'>
                  {t('step4.accountHolderName')} <span className='text-red-600'>*</span>
                </label>
                <input 
                  className='mt-1 w-full border rounded px-3 py-2 text-sm' 
                  value={tempFormData.accountHolderName !== undefined ? tempFormData.accountHolderName : currentData.accountHolderName||''} 
                  onChange={e=> handleFieldChange('accountHolderName',e.target.value)} 
                  placeholder={t('step4.accountHolderPlaceholder')}
                />
                {errors.accountHolderName && <span className='text-red-600 text-xs mt-1 block'>{errors.accountHolderName}</span>}
              </div>
              <div>
                <label className='text-sm font-medium'>
                  {t('step4.accountNumber')} <span className='text-red-600'>*</span>
                </label>
                <input 
                  className='mt-1 w-full border rounded px-3 py-2 text-sm' 
                  value={tempFormData.bankAccountNumber !== undefined ? tempFormData.bankAccountNumber : currentData.bankAccountNumber||''} 
                  onChange={e=> handleFieldChange('bankAccountNumber',e.target.value)} 
                  placeholder={t('step4.accountNumberPlaceholder')}
                />
                {errors.bankAccountNumber ? (
                  <span className='text-red-600 text-xs mt-1 block'>{errors.bankAccountNumber}</span>
                ) : (
                  <span className='text-gray-500 text-xs mt-1 block'>{t('step4.accountNumberHint')}</span>
                )}
              </div>
              <div>
                <label className='text-sm font-medium'>
                  {t('step4.ifscCode')} <span className='text-red-600'>*</span>
                </label>
                <input 
                  className='mt-1 w-full border rounded px-3 py-2 text-sm uppercase' 
                  value={tempFormData.bankIfscCode !== undefined ? tempFormData.bankIfscCode : currentData.bankIfscCode||''} 
                  onChange={e=> handleFieldChange('bankIfscCode',e.target.value.toUpperCase())} 
                  placeholder={t('step4.ifscPlaceholder')}
                  maxLength={11}
                />
                {errors.bankIfscCode ? (
                  <span className='text-red-600 text-xs mt-1 block'>{errors.bankIfscCode}</span>
                ) : (
                  <span className='text-gray-500 text-xs mt-1 block'>{t('step4.ifscHint')}</span>
                )}
              </div>
              <div>
                <label className='text-sm font-medium'>
                  {t('step4.bankName')} <span className='text-red-600'>*</span>
                </label>
                <input 
                  className='mt-1 w-full border rounded px-3 py-2 text-sm' 
                  value={tempFormData.bankName !== undefined ? tempFormData.bankName : currentData.bankName||''} 
                  onChange={e=> handleFieldChange('bankName',e.target.value)} 
                  placeholder={t('step4.bankNamePlaceholder')}
                />
                {errors.bankName && <span className='text-red-600 text-xs mt-1 block'>{errors.bankName}</span>}
              </div>
              <div className='sm:col-span-2'>
                <label className='text-sm font-medium'>
                  {t('step4.branchName')} <span className='text-red-600'>*</span>
                </label>
                <input 
                  className='mt-1 w-full border rounded px-3 py-2 text-sm' 
                  value={tempFormData.bankBranch !== undefined ? tempFormData.bankBranch : currentData.bankBranch||''} 
                  onChange={e=> handleFieldChange('bankBranch',e.target.value)} 
                  placeholder={t('step4.branchPlaceholder')}
                />
                {errors.bankBranch && <span className='text-red-600 text-xs mt-1 block'>{errors.bankBranch}</span>}
              </div>
            </div>
          </div>
        )
      case 5:
        return (
          <div className='space-y-4'>
            <div className='border rounded-md p-4 bg-gray-50 text-sm space-y-2'>
              <p><strong>{t('step5.applicant')}:</strong> {currentData.fullName||t('step5.notProvided')} • {currentData.phone||t('step5.notProvided')}</p>
              <p><strong>{t('step5.email')}:</strong> {currentData.email||t('step5.notProvided')}</p>
              <p><strong>{t('step5.applicationType')}:</strong> {currentData.actType?.replace(/_/g, ' ') || t('step5.typeNotSelected')}</p>
              <p><strong>{t('step5.incidentDate')}:</strong> {currentData.incidentDate||t('step5.notProvided')}</p>
              <p><strong>{t('step5.district')}:</strong> {currentData.district||t('step5.notProvided')}</p>
              {currentData.policeStation && <p><strong>{t('step5.policeStation')}:</strong> {currentData.policeStation}</p>}
              {currentData.firNumber && currentData.actType !== 'INTER_CASTE_MARRIAGE' && (
                <p><strong>{t('step5.firNumber')}:</strong> {currentData.firNumber}</p>
              )}
              <div className='pt-2'>
                <p className='font-medium'>{t('step5.incidentDescription')}:</p>
                <p className='text-xs text-gray-700 bg-white p-2 rounded border'>{currentData.incidentDescription || t('step5.notProvided')}</p>
              </div>
              <p><strong>{t('step5.documentsAttached')}:</strong> {t('step5.requiredDocs', { uploaded: tempDocuments.length + existingDocuments.length, required: effectiveRequirements.filter(r=> r.required).length })}</p>
              <div className='pt-2'>
                <p className='font-medium'>{t('step5.bankDetails')}</p>
                <p className='text-[13px] text-gray-700'>{currentData.accountHolderName || t('step5.notProvided')} • {currentData.bankAccountNumber ? t('step5.accountMasked', { last4: currentData.bankAccountNumber.slice(-4) }) : t('step5.notProvided')}</p>
                <p className='text-[13px] text-gray-700'>{currentData.bankName || t('step5.notProvided')} ({currentData.bankIfscCode || t('step5.notProvided')})</p>
              </div>
            </div>
            <label className='flex items-start gap-2 text-sm'>
              <input type='checkbox' checked={declaration} onChange={e=> setDeclaration(e.target.checked)} />
              <span>{t('step5.declaration.text')}</span>
            </label>
            {errors.declaration && <div className='text-red-600 text-xs'>{errors.declaration}</div>}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className='space-y-8' aria-label='New application wizard'>
      {/* Language Switcher - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>
      
      <div className='flex items-center justify-between'>
        <h1 className='text-xl font-semibold tracking-tight'>{t('title')}</h1>
      </div>
      <nav aria-label='Progress steps'>
        <ol className='grid grid-cols-1 md:grid-cols-5 gap-3'>
          {stepLabels.map((label,idx)=> { const stepNum=idx+1; const active=stepNum===currentStep; const complete=stepNum<currentStep; const allowed=stepNum<=maxNavigableStep; return (
            <li key={label} className='flex items-center' aria-current={active? 'step':undefined}>
              <button disabled={!allowed} onClick={()=> allowed && setCurrentStep(stepNum)} className={`group flex-1 border rounded-md px-3 py-2 text-left text-xs md:text-sm focus:outline-none ${active?'ring-2 ring-orange-500':''} ${allowed? 'bg-white hover:bg-gray-50 focus:ring-2 focus:ring-orange-500':'bg-gray-100 text-gray-400 cursor-not-allowed'}`} title={!allowed? t('validation.completePreviousSteps'): undefined}>
                <span className='flex items-center gap-2'>
                  <span className={`h-5 w-5 inline-flex items-center justify-center rounded-full text-[11px] font-medium ${complete?'bg-green-600 text-white': active? 'bg-orange-600 text-white':'bg-gray-200 text-gray-600'}`}>{complete? <CheckCircle className='h-3 w-3' />: stepNum}</span>
                  <span>{label}</span>
                </span>
              </button>
            </li>) })}
        </ol>
      </nav>
      <Card className='border-gray-200'>
        <CardHeader><CardTitle className='text-lg'>{stepLabels[currentStep-1]}</CardTitle></CardHeader>
        <CardContent>
          {renderStep()}
          <div className='flex items-center justify-between mt-10'>
            <div className='flex gap-2'>
              <Button variant='outline' disabled={currentStep===1} onClick={prev}><ChevronLeft className='h-4 w-4 mr-1' />{t('buttons.prev')}</Button>
              {currentStep<TOTAL_STEPS && <Button onClick={next}>{t('buttons.next')}<ChevronRight className='h-4 w-4 ml-1' /></Button>}
            </div>
            <div className='flex gap-2'>
              {currentStep===TOTAL_STEPS && <Button className='bg-orange-600 hover:bg-orange-700' disabled={!isStep5Valid || isSaving} onClick={submit}>
                {isSaving ? t('buttons.submitting') : t('buttons.submit')}
              </Button>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Viewer Modal */}
      {viewingDocument && viewingDocument.file_url && (
        <div 
          className='fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4'
          onClick={() => setViewingDocument(null)}
        >
          <div 
            className='bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] flex flex-col'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-orange-50 to-white'>
              <div className='flex items-center space-x-3'>
                <div className='p-2 bg-orange-100 rounded-lg'>
                  <svg className='h-5 w-5 text-orange-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                  </svg>
                </div>
                <div>
                  <h3 className='font-semibold text-lg text-gray-900'>{viewingDocument.file_name}</h3>
                  <p className='text-sm text-gray-600'>{viewingDocument.document_type?.replace(/_/g, ' ')}</p>
                </div>
              </div>
              <button
                type='button'
                onClick={() => setViewingDocument(null)}
                className='text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg h-9 w-9 p-0 flex items-center justify-center'
              >
                <span className='text-xl'>×</span>
              </button>
            </div>

            <div className='flex-1 overflow-auto p-6 bg-gray-50'>
              {viewingDocument.file_url ? (
                viewingDocument.file_name.toLowerCase().endsWith('.pdf') ? (
                  <div className='bg-white rounded-lg shadow-sm overflow-hidden h-[calc(95vh-180px)]'>
                    <iframe
                      src={viewingDocument.file_url}
                      className='w-full h-full'
                      title={viewingDocument.file_name}
                    />
                  </div>
                ) : (
                  <div className='flex items-center justify-center bg-white rounded-lg shadow-sm p-4 min-h-[calc(95vh-180px)]'>
                    <img
                      src={viewingDocument.file_url}
                      alt={viewingDocument.file_name}
                      className='max-w-full h-auto max-h-[calc(95vh-200px)] object-contain rounded-lg'
                    />
                  </div>
                )
              ) : (
                <div className='flex items-center justify-center h-96 bg-white rounded-lg shadow-sm'>
                  <div className='text-center'>
                    <svg className='h-16 w-16 text-gray-300 mx-auto mb-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                    </svg>
                    <p className='text-gray-500'>No preview available</p>
                  </div>
                </div>
              )}
            </div>

            <div className='flex items-center justify-center gap-3 px-6 py-4 border-t bg-white'>
              {viewingDocument.file_url && (
                <button
                  type='button'
                  onClick={() => window.open(viewingDocument.file_url, '_blank')}
                  className='px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 font-medium flex items-center gap-2'
                >
                  <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14' />
                  </svg>
                  {t('buttons.openNewTab')}
                </button>
              )}
              <button
                type='button'
                onClick={() => setViewingDocument(null)}
                className='px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md font-medium'
              >
                {t('buttons.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function NewApplicationWizard(){
  return <DocumentChecklistProvider><WizardInner /></DocumentChecklistProvider>
}
