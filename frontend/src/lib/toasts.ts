'use client'
import toast from 'react-hot-toast'

interface ToastOptions { meta?: Record<string, any> }

export const toastDocumentUploaded = (docType: string, opts: ToastOptions = {}) => {
  toast.success(`Document uploaded: ${humanize(docType)}`)
  analytics('document.upload', { docType, ...opts.meta })
}

export const toastDocumentRejected = (docType: string, reason?: string) => {
  toast.error(`Document rejected: ${humanize(docType)}${reason? ' – '+reason:''}`)
  analytics('document.reject', { docType, reason })
}

export const toastStatusChanged = (newStatus: string) => {
  toast(`Status changed to ${humanize(newStatus)}`, { icon: 'ℹ️' })
  if(newStatus.toUpperCase()==='APPROVED') analytics('application.status.approved')
}

export const toastDraftSaved = () => toast.success('Draft saved')

// Stub analytics (to be wired to real service later)
export function analytics(event: string, meta: Record<string, any> = {}) {
  if (typeof window !== 'undefined') {
    (window as any).__nyayaAnalytics = (window as any).__nyayaAnalytics || []
    ;(window as any).__nyayaAnalytics.push({ event, meta, ts: Date.now() })
  }
}

function humanize(v: string){
  return v.replace(/_/g,' ').replace(/\b\w/g,c=> c.toUpperCase())
}