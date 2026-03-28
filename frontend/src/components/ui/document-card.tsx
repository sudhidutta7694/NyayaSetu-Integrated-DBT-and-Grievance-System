'use client'

import React, { useState } from 'react'
import { FileText, Eye, CheckCircle, Clock, AlertCircle, ExternalLink, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Document } from '@/types/user'

interface DocumentCardProps {
  document: Document
  showActions?: boolean
  onDelete?: (documentId: string) => void
  className?: string
}

export function DocumentCard({ 
  document, 
  showActions = true, 
  onDelete,
  className = '' 
}: DocumentCardProps) {
  const [viewingDocument, setViewingDocument] = useState(false)

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'APPROVED':
      case 'VERIFIED':
        return 'bg-green-100 text-green-800'
      case 'UNDER_REVIEW':
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'APPROVED':
      case 'VERIFIED':
        return <CheckCircle className="h-4 w-4" />
      case 'UNDER_REVIEW':
      case 'PENDING':
        return <Clock className="h-4 w-4" />
      case 'REJECTED':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <CheckCircle className="h-4 w-4" />
    }
  }

  const handleViewDocument = () => {
    if (document.file_url) {
      setViewingDocument(true)
    }
  }

  const isPDF = document.file_name?.toLowerCase().endsWith('.pdf')

  return (
    <>
      {/* Document Card */}
      <div className={`flex items-center justify-between p-4 border rounded-lg bg-white hover:shadow-md transition-shadow ${className}`}>
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-orange-50 rounded-lg">
            <FileText className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{document.file_name}</p>
            <p className="text-sm text-gray-600">{document.document_type}</p>
            <p className="text-xs text-gray-500">
              {document.created_at ? new Date(document.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {document.status && (
            <Badge className={getStatusColor(document.status)}>
              <div className="flex items-center space-x-1">
                {getStatusIcon(document.status)}
                <span className="text-xs">{document.status}</span>
              </div>
            </Badge>
          )}
          
          {showActions && document.file_url && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleViewDocument}
              title="View Document"
              className="hover:bg-orange-50"
            >
              <Eye className="h-4 w-4 text-orange-600" />
            </Button>
          )}
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewingDocument && document.file_url && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
          onClick={() => setViewingDocument(false)}
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
                  <h3 className="font-semibold text-lg text-gray-900">{document.file_name}</h3>
                  <p className="text-sm text-gray-600">{document.document_type}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {document.status && (
                  <Badge className={`${getStatusColor(document.status)} px-3 py-1`}>
                    <div className="flex items-center space-x-1.5">
                      {getStatusIcon(document.status)}
                      <span className="text-xs font-medium">{document.status}</span>
                    </div>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewingDocument(false)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg h-9 w-9 p-0"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6 bg-gray-50">
              {isPDF ? (
                // PDF Viewer using iframe
                <div className="bg-white rounded-lg shadow-sm overflow-hidden h-[calc(95vh-180px)]">
                  <iframe
                    src={document.file_url}
                    className="w-full h-full"
                    title={document.file_name}
                  />
                </div>
              ) : (
                // Image Viewer
                <div className="flex items-center justify-center bg-white rounded-lg shadow-sm p-4 min-h-[calc(95vh-180px)]">
                  <img
                    src={document.file_url}
                    alt={document.file_name}
                    className="max-w-full h-auto max-h-[calc(95vh-200px)] object-contain rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-center gap-3 px-6 py-4 border-t bg-white">
              <Button
                variant="outline"
                size="default"
                onClick={() => window.open(document.file_url, '_blank')}
                className="min-w-[160px] font-medium"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
              <Button
                variant="default"
                size="default"
                onClick={() => setViewingDocument(false)}
                className="min-w-[120px] bg-orange-600 hover:bg-orange-700 font-medium"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default DocumentCard
