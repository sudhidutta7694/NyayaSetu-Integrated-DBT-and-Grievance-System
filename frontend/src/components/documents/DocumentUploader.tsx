'use client'
import React, { useCallback, useRef, useState } from 'react'
import { X, UploadCloud, File as FileIcon, Loader2, Trash2, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export interface UploadFileMeta {
  id: string
  file: File
  progress: number
  status: 'PENDING' | 'UPLOADING' | 'COMPLETE' | 'ERROR' | 'CANCELLED'
  error?: string
  uploadedAt?: string
  reusable?: boolean
}

export interface DocumentUploaderProps {
  accept?: string[]
  maxSizeMB?: number
  onFilesChange?: (files: UploadFileMeta[]) => void
  onFileUploaded?: (file: UploadFileMeta) => void
  allowReusePicker?: boolean
  existingDocs?: { id: string; name: string; type: string; uploadedAt: string; status: string }[]
}

const DEFAULT_ACCEPT = ['application/pdf','image/jpeg','image/png']
const genId = () => Math.random().toString(36).slice(2)

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({ accept = DEFAULT_ACCEPT, maxSizeMB = 5, onFilesChange, onFileUploaded, allowReusePicker, existingDocs = [] }) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [files, setFiles] = useState<UploadFileMeta[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [showReuse, setShowReuse] = useState(false)

  function update(next: UploadFileMeta[] | ((prev: UploadFileMeta[]) => UploadFileMeta[])) {
    setFiles(prev => {
      const resolved = typeof next === 'function' ? (next as (p: UploadFileMeta[]) => UploadFileMeta[])(prev) : next
      onFilesChange?.(resolved)
      return resolved
    })
  }

  const validateFile = (file: File): string | null => {
    if (!accept.includes(file.type)) return 'Unsupported file type'
    if (file.size > maxSizeMB * 1024 * 1024) return `File exceeds ${maxSizeMB}MB`
    return null
  }

  const handleFiles = (fileList: FileList | null) => {
    if(!fileList) return
    const next: UploadFileMeta[] = []
    for (const file of Array.from(fileList)) {
      const err = validateFile(file)
      if (err) {
        toast.error(err)
        continue
      }
      next.push({ id: genId(), file, progress: 0, status: 'PENDING' })
    }
    if(!next.length) return
    update([...files, ...next])
    next.forEach(f=> simulateUpload(f.id))
  }

  const simulateUpload = (id: string, failOnce = false) => {
  update(prev => prev.map(f => f.id===id ? { ...f, status: 'UPLOADING' as const, progress: 5 }: f))
    const interval = setInterval(()=> {
      setFiles(prev => prev.map(f => {
        if(f.id !== id) return f
        if(f.status==='CANCELLED') { clearInterval(interval); return f }
        if(f.progress >= 100) {
          clearInterval(interval)
          if(failOnce && f.status==='UPLOADING') {
            return { ...f, status: 'ERROR', error: 'Network error (mock)' }
          }
          const complete: UploadFileMeta = { ...f, status: 'COMPLETE', uploadedAt: new Date().toISOString(), progress: 100 }
          onFileUploaded?.(complete)
          return complete
        }
        return { ...f, progress: Math.min(100, f.progress + 15) }
      }))
    }, 300)
  }

  const cancelUpload = (id: string) => {
  update(prev => prev.map(f => f.id===id ? { ...f, status: 'CANCELLED' as const }: f))
    toast('Upload cancelled')
  }

  const removeFile = (id: string) => {
    update(files.filter(f => f.id !== id))
  }

  const retryUpload = (id: string) => {
    update(prev => prev.map(f => f.id===id ? { ...f, status: 'PENDING', progress: 0, error: undefined }: f))
    setTimeout(()=> simulateUpload(id, false), 200)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [])

  return (
    <div className="space-y-4" aria-live="polite">
      <div
        className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition ${isDragging? 'border-orange-500 bg-orange-50':'border-gray-300 hover:border-orange-400'}`}
        onDragOver={e=> { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={e=> { e.preventDefault(); setIsDragging(false) }}
        onDrop={onDrop}
        onClick={()=> inputRef.current?.click()}
        role="button"
        aria-label="File uploader dropzone"
        tabIndex={0}
        onKeyDown={e=> { if(e.key==='Enter' || e.key===' '){ inputRef.current?.click() }}}
      >
        <UploadCloud className="h-8 w-8 mx-auto text-orange-600 mb-2" />
        <p className="text-sm font-medium">Drag & drop files here or click to browse</p>
  <p className="text-xs text-gray-500 mt-1">Accepted: PDF, JPG, PNG • Max {maxSizeMB}MB each</p>
  <p className="text-[11px] text-gray-400 mt-1">On mobile, images will be auto-compressed (mock)</p>
        {allowReusePicker && (
          <button type="button" className="mt-3 text-xs underline text-orange-700" onClick={(e)=> { e.stopPropagation(); setShowReuse(s=> !s) }}>{showReuse? 'Hide reusable documents':'Use existing document'}</button>
        )}
      </div>
      <input ref={inputRef} type="file" multiple hidden accept={accept.join(',')} onChange={e=> handleFiles(e.target.files)} />
      {showReuse && existingDocs.length>0 && (
        <div className="border rounded-md p-3 bg-gray-50">
          <p className="text-xs font-semibold mb-2">Reusable Documents</p>
          <ul className="space-y-1 max-h-40 overflow-auto text-xs">
            {existingDocs.map(d => (
              <li key={d.id} className="flex items-center justify-between">
                <span className="truncate pr-2">{d.name}</span>
                <button type="button" className="text-orange-600 hover:underline" onClick={()=> toast.success('Attached existing (mock)')}>Attach</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <ul className="space-y-3">
        {files.map(f => (
          <li key={f.id} className="border rounded-md p-3 text-sm flex items-start gap-3 bg-white relative">
            {f.file.type==='application/pdf' && <FileIcon className="h-5 w-5 text-red-500 mt-0.5" />}
            {f.file.type.startsWith('image/') && <img src={URL.createObjectURL(f.file)} alt={f.file.name} className="h-10 w-10 object-cover rounded" />}
            {!f.file.type.startsWith('image/') && f.file.type!=='application/pdf' && <FileIcon className="h-5 w-5 text-gray-400 mt-0.5" />}
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium text-xs md:text-sm">{f.file.name}</p>
              <p className="text-[11px] text-gray-500">{(f.file.size/1024/1024).toFixed(2)} MB</p>
              <div className="h-2 bg-gray-200 rounded mt-2 overflow-hidden">
                <div className={`h-full transition-all ${f.status==='ERROR'? 'bg-red-500': 'bg-orange-600'}`} style={{ width: `${f.progress}%`}} />
              </div>
              <p className="text-[11px] mt-1 text-gray-500">{f.status==='UPLOADING' && 'Uploading...'}{f.status==='COMPLETE' && 'Uploaded'}{f.status==='ERROR' && f.error}{f.status==='CANCELLED' && 'Cancelled'}</p>
            </div>
            <div className="flex flex-col gap-1">
              {f.status==='UPLOADING' && <button onClick={()=> cancelUpload(f.id)} className="text-xs text-red-600 hover:underline" aria-label="Cancel upload">Cancel</button>}
              {f.status==='COMPLETE' && <button onClick={()=> removeFile(f.id)} className="text-xs text-gray-500 hover:text-gray-700" aria-label="Remove file"><Trash2 className="h-4 w-4" /></button>}
              {f.status==='ERROR' && <button onClick={()=> retryUpload(f.id)} className="text-xs text-orange-600 hover:underline flex items-center gap-1" aria-label="Retry upload"><RefreshCw className="h-3 w-3" />Retry</button>}
            </div>
            {f.status==='UPLOADING' && <Loader2 className="h-4 w-4 animate-spin absolute top-2 right-2 text-orange-600" />}
            {f.status==='ERROR' && <X className="h-4 w-4 absolute top-2 right-2 text-red-500" />}
          </li>
        ))}
      </ul>
    </div>
  )
}
