'use client'
import React from 'react'
import { CheckCircle, Clock, XCircle } from 'lucide-react'

export interface StatusBadgeProps {
  status: string
  label?: string
  tooltip?: string
  officerName?: string
  className?: string
}

function getIconForStatus(status: string): JSX.Element {
  const upperStatus = status?.toUpperCase() || '';
  
  // Red - Rejection states
  if (upperStatus.includes('REJECT')) {
    return <XCircle className="h-3.5 w-3.5" />;
  }
  
  // Green - Approval states
  if (upperStatus.includes('APPROVED') || upperStatus.includes('DISBURSED') || 
      upperStatus.includes('COMPLETED') || upperStatus.includes('VERIFIED')) {
    return <CheckCircle className="h-3.5 w-3.5" />;
  }
  
  // Blue - Submitted/In Progress states (default)
  return <Clock className="h-3.5 w-3.5" />;
}

function classFor(status: string){
  // Convert status to lowercase and replace underscores with hyphens for CSS class
  const statusKey = status?.toLowerCase().replace(/_/g, '-') || 'draft'
  return `status-badge status-${statusKey}`
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, tooltip, officerName, className }) => {
  const base = classFor(status)
  const content = (label || status.replace(/_/g,' ')).toUpperCase()
  const icon = getIconForStatus(status)
  
  return (
    <span className={`relative group ${base} ${className||''}`} aria-label={`Status ${content}${officerName? ' verified by '+officerName:''}`}>
      <span className="flex items-center gap-1">
        {icon}
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
