'use client'
import React, { createContext, useContext, useMemo, useState, useEffect } from 'react'

export interface DocRequirement { type: string; label: string; required: boolean; sampleUrl?: string }
interface ChecklistContextValue {
  act: string
  setAct: (act: string) => void
  requirements: DocRequirement[]
}

const DocumentChecklistContext = createContext<ChecklistContextValue | undefined>(undefined)

// Detailed requirements per Act (mandatory first, then optional)
const ACT_MAP: Record<string, DocRequirement[]> = {
  PCR: [
    { type: 'CASTE_CERTIFICATE', label: 'Caste Certificate (SC)', required: true, sampleUrl: '#' },
    { type: 'FIR_COPY', label: 'FIR / Police Report Copy', required: true },
    { type: 'IDENTITY_PROOF', label: 'Identity Proof (Aadhaar / Voter / PAN)', required: true },
    { type: 'BANK_PASSBOOK', label: 'Bank Passbook (First Page)', required: true },
    { type: 'APPLICANT_PHOTO', label: 'Photograph of Applicant', required: true },
    { type: 'MEDICAL_REPORT', label: 'Medical / Injury Certificate', required: false },
    { type: 'COURT_ORDER', label: 'Court Order / Charge Sheet', required: false },
    { type: 'ADDRESS_PROOF', label: 'Address Proof', required: false },
    { type: 'AFFIDAVIT', label: 'Affidavit / Declaration', required: false, sampleUrl: '#' }
  ],
  POA: [
    { type: 'CASTE_CERTIFICATE', label: 'Caste Certificate (SC/ST)', required: true },
    { type: 'FIR_COPY_POA', label: 'FIR Copy (PoA Sections)', required: true },
    { type: 'IDENTITY_PROOF', label: 'Identity Proof (Aadhaar / Voter)', required: true },
    { type: 'BANK_PASSBOOK', label: 'Bank Passbook (First Page)', required: true },
    { type: 'APPLICANT_PHOTO', label: 'Photograph of Applicant', required: true },
    { type: 'MEDICAL_REPORT', label: 'Medical / Post-Mortem / Hospital Cert.', required: false },
    { type: 'COURT_PROCEEDINGS', label: 'Court Proceedings / Charge Sheet', required: false },
    { type: 'LAND_DAMAGE_CERT', label: 'Land Ownership / Damage Certificate', required: false },
    { type: 'REHAB_PROOF', label: 'Rehabilitation / Shelter Proof', required: false },
    { type: 'DISABILITY_CERT', label: 'Disability Certificate', required: false },
    { type: 'AFFIDAVIT', label: 'Declaration / Affidavit', required: false, sampleUrl: '#' }
  ],
  INCENTIVE: [
    { type: 'MARRIAGE_CERTIFICATE', label: 'Marriage Certificate (Registered)', required: true },
    { type: 'CASTE_CERTIFICATE_PARTNER', label: 'Caste Certificates (Both Partners)', required: true },
    { type: 'IDENTITY_PROOF_BOTH', label: 'Identity Proof (Both Partners)', required: true },
    { type: 'COUPLE_PHOTO', label: 'Joint Photograph', required: true },
    { type: 'BANK_PASSBOOK', label: 'Bank Passbook (Joint/Either)', required: true },
    { type: 'ADDRESS_PROOF_BOTH', label: 'Address Proof (Before & After)', required: false },
    { type: 'AFFIDAVIT_BOTH', label: 'Affidavit (Both Partners)', required: false },
    { type: 'MARRIAGE_INVITE', label: 'Marriage Invitation / Witness Statements', required: false },
    { type: 'INCOME_CERTIFICATE', label: 'Income Certificate (Optional)', required: false }
  ]
}

export const DocumentChecklistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [act, setActState] = useState('PCR')
  // hydrate from localStorage
  useEffect(()=> {
    try { const stored = localStorage.getItem('nyaya.act'); if(stored) setActState(stored) } catch {}
  },[])
  const setAct = (next:string) => {
    setActState(next)
    try { localStorage.setItem('nyaya.act', next) } catch {}
  }
  const requirements = useMemo(()=> ACT_MAP[act] || [], [act])
  return (
    <DocumentChecklistContext.Provider value={{ act, setAct, requirements }}>
      {children}
    </DocumentChecklistContext.Provider>
  )
}

export const useDocumentChecklist = () => {
  const ctx = useContext(DocumentChecklistContext)
  if(!ctx) throw new Error('useDocumentChecklist must be used within DocumentChecklistProvider')
  return ctx
}
