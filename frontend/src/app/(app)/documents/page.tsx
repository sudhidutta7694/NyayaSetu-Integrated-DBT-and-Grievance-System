'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { DocumentUploader, UploadFileMeta } from '@/components/documents/DocumentUploader'
import { StatusBadge } from '@/components/ui/status-badge'

interface CommonDoc { id:string; name:string; type:string; status:string; uploadedAt:string }
const mockExisting:CommonDoc[]=[ { id:'1', name:'Caste Certificate.pdf', type:'CASTE_CERTIFICATE', status:'VERIFIED', uploadedAt:'2024-01-08' }, { id:'2', name:'Bank Passbook.pdf', type:'BANK_PASSBOOK', status:'VERIFIED', uploadedAt:'2024-01-08' } ]

export default function ManageDocumentsPage(){
  const [uploaded,setUploaded]=useState<UploadFileMeta[]>([])
  const [loading,setLoading]=useState(true)
  useEffect(()=> { const t=setTimeout(()=> setLoading(false),500); return ()=> clearTimeout(t)},[])
  return (
    <div className='space-y-10'>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl font-semibold tracking-tight'>Documents</h1>
      </div>
      <Card className='border-gray-200'>
        <CardHeader><CardTitle className='text-sm font-medium tracking-wide text-gray-600'>Upload / Reuse</CardTitle></CardHeader>
        <CardContent>
          <DocumentUploader allowReusePicker existingDocs={mockExisting.map(d=> ({id:d.id, name:d.name, type:d.type, uploadedAt:d.uploadedAt, status:d.status}))} onFilesChange={setUploaded} />
        </CardContent>
      </Card>
      <Card className='border-gray-200'>
        <CardHeader><CardTitle className='text-sm font-medium tracking-wide text-gray-600'>Your Documents</CardTitle></CardHeader>
        <CardContent>
          {loading && <div className='space-y-4'>{Array.from({length:4}).map((_,i)=><div key={i} className='h-24 bg-gray-200 animate-pulse rounded' />)}</div>}
          {!loading && <div className='grid md:grid-cols-2 gap-4'>
            {mockExisting.map(doc=> (
              <div key={doc.id} className='border rounded-md p-4 flex flex-col gap-2 bg-white'>
                <p className='font-medium text-sm truncate'>{doc.name}</p>
                <p className='text-[11px] text-gray-500'>Uploaded: {doc.uploadedAt}</p>
                <StatusBadge status={doc.status} label={doc.status} officerName={doc.status==='VERIFIED'? 'Officer X': undefined} />
                <div className='flex gap-2 mt-auto'>
                  <button className='text-xs text-orange-600 underline'>Preview</button>
                  <button className='text-xs text-gray-600 underline'>Download</button>
                </div>
              </div>
            ))}
            {uploaded.filter(u=> u.status==='COMPLETE').map(f=> (
              <div key={f.id} className='border rounded-md p-4 flex flex-col gap-2 bg-white'>
                <p className='font-medium text-sm truncate'>{f.file.name}</p>
                <p className='text-[11px] text-gray-500'>Uploaded: just now (mock)</p>
                <StatusBadge status='PENDING' label='Pending' />
              </div>
            ))}
          </div>}
        </CardContent>
      </Card>
    </div>
  )
}
