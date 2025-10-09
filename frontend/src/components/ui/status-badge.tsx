'use client'
import React from 'react'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'

export interface StatusBadgeProps {
  status: string
  label?: string
  tooltip?: string
  officerName?: string
  className?: string
}

const ICONS: Record<string, JSX.Element> = {
  APPROVED: <CheckCircle className="h-3.5 w-3.5" />,
  VERIFIED: <CheckCircle className="h-3.5 w-3.5" />,
  UNDER_REVIEW: <Clock className="h-3.5 w-3.5" />,
  SUBMITTED: <Clock className="h-3.5 w-3.5" />,
  PENDING: <Clock className="h-3.5 w-3.5" />,
  DRAFT: <Clock className="h-3.5 w-3.5" />,
  REJECTED: <AlertCircle className="h-3.5 w-3.5" />,
  DISBURSED: <CheckCircle className="h-3.5 w-3.5" />
}

function classFor(status: string){
  const map: Record<string,string> = {
    DRAFT: 'status-badge status-draft',
    SUBMITTED: 'status-badge status-submitted',
    UNDER_REVIEW: 'status-badge status-under-review',
    APPROVED: 'status-badge status-approved',
    REJECTED: 'status-badge status-rejected',
    DISBURSED: 'status-badge status-disbursed',
    VERIFIED: 'status-badge status-approved',
    PENDING: 'status-badge status-pending'
  }
  return map[status] || 'status-badge status-draft'
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, tooltip, officerName, className }) => {
  const base = classFor(status)
  const content = label || status.replace(/_/g,' ')
  return (
    <span className={`relative group ${base} ${className||''}`} aria-label={`Status ${content}${officerName? ' verified by '+officerName:''}`}>
      <span className="flex items-center gap-1">
        {ICONS[status] || ICONS['DRAFT']}
        <span>{content}</span>
      </span>
      {(tooltip || officerName) && (
        <span role="tooltip" className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-gray-900 text-white text-[11px] rounded px-2 py-1 whitespace-nowrap z-20">
          {tooltip}
          {officerName && <span className="block text-[10px] mt-0.5 opacity-80">Verified by: {officerName}</span>}
        </span>
      )}
    </span>
  )
}
