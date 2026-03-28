'use client'
import React, { createContext, useContext, useMemo, useState, useEffect } from 'react'

export interface DocRequirement { type: string; label: string; required: boolean; sampleUrl?: string }
interface ChecklistContextValue {
  act: string
  setAct: (act: string) => void
  requirements: DocRequirement[]
  userCategory: string | null
  setUserCategory: (category: string | null) => void
}

const DocumentChecklistContext = createContext<ChecklistContextValue | undefined>(undefined)

// All documents are mandatory for all application types
// Using backend DocumentType enum values: AADHAAR_CARD, PAN_CARD, BIRTH_CERTIFICATE, BANK_PASSBOOK, CATEGORY_CERTIFICATE, INCOME_CERTIFICATE, MARRIAGE_CERTIFICATE
// Category certificate is only required for non-GENERAL categories (SC/ST/OBC)
const ACT_MAP: Record<string, DocRequirement[]> = {
  PCR_RELIEF: [
    { type: 'AADHAAR_CARD', label: 'Aadhaar Card', required: true },
    { type: 'BANK_PASSBOOK', label: 'Bank Passbook', required: true },
    { type: 'PAN_CARD', label: 'PAN Card', required: true },
    { type: 'BIRTH_CERTIFICATE', label: 'Birth Certificate', required: true },
    { type: 'INCOME_CERTIFICATE', label: 'Income Certificate', required: true }
  ],
  POA_COMPENSATION: [
    { type: 'AADHAAR_CARD', label: 'Aadhaar Card', required: true },
    { type: 'BANK_PASSBOOK', label: 'Bank Passbook', required: true },
    { type: 'PAN_CARD', label: 'PAN Card', required: true },
    { type: 'BIRTH_CERTIFICATE', label: 'Birth Certificate', required: true },
    { type: 'INCOME_CERTIFICATE', label: 'Income Certificate', required: true }
  ],
  INTER_CASTE_MARRIAGE: [
    { type: 'MARRIAGE_CERTIFICATE', label: 'Marriage Certificate', required: true },
    { type: 'AADHAAR_CARD', label: 'Aadhaar Card', required: true },
    { type: 'BANK_PASSBOOK', label: 'Bank Passbook', required: true },
    { type: 'PAN_CARD', label: 'PAN Card', required: true },
    { type: 'BIRTH_CERTIFICATE', label: 'Birth Certificate', required: true },
    { type: 'INCOME_CERTIFICATE', label: 'Income Certificate', required: true }
  ],
  OTHER: [
    { type: 'AADHAAR_CARD', label: 'Aadhaar Card', required: true },
    { type: 'BANK_PASSBOOK', label: 'Bank Passbook', required: true },
    { type: 'PAN_CARD', label: 'PAN Card', required: true },
    { type: 'BIRTH_CERTIFICATE', label: 'Birth Certificate', required: true },
    { type: 'INCOME_CERTIFICATE', label: 'Income Certificate', required: true }
  ]
}

export const DocumentChecklistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [act, setActState] = useState('')
  const [userCategory, setUserCategory] = useState<string | null>(null)
  
  // hydrate from localStorage
  useEffect(()=> {
    try { const stored = localStorage.getItem('nyaya.act'); if(stored) setActState(stored) } catch {}
  },[])
  
  const setAct = (next:string) => {
    setActState(next)
    try { localStorage.setItem('nyaya.act', next) } catch {}
  }
  
  // Get base requirements and add category certificate if user is not GENERAL
  const requirements = useMemo(() => {
    const baseRequirements = ACT_MAP[act] || ACT_MAP['OTHER'] || []
    
    // Add category certificate requirement if user is SC/ST/OBC (not GENERAL)
    if (userCategory && userCategory !== 'GENERAL') {
      // Check if category certificate is already in the list
      const hasCategoryCert = baseRequirements.some(r => r.type === 'CATEGORY_CERTIFICATE')
      if (!hasCategoryCert) {
        return [
          ...baseRequirements,
          { type: 'CATEGORY_CERTIFICATE', label: `Category Certificate (${userCategory})`, required: true }
        ]
      }
    }
    
    return baseRequirements
  }, [act, userCategory])
  
  return (
    <DocumentChecklistContext.Provider value={{ act, setAct, requirements, userCategory, setUserCategory }}>
      {children}
    </DocumentChecklistContext.Provider>
  )
}

export const useDocumentChecklist = () => {
  const ctx = useContext(DocumentChecklistContext)
  if(!ctx) throw new Error('useDocumentChecklist must be used within DocumentChecklistProvider')
  return ctx
}
