'use client'
import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Send, X } from 'lucide-react'

interface Batch { id: string; beneficiaries: number; amount: number; createdAt: string; status: 'PENDING' | 'QUEUED' | 'PROCESSING' | 'COMPLETED' }
interface LiveEvent { id: string; ts: string; msg: string; type: 'INFO' | 'SUCCESS' | 'ERROR' }

export default function FIDisbursementsPage(){
  const [batches, setBatches] = useState<Batch[]>([])
  const [events, setEvents] = useState<LiveEvent[]>([])
  const [showUpload, setShowUpload] = useState(false)
  const [showInitiate, setShowInitiate] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(()=> {
    setTimeout(()=> {
      setBatches([
        { id:'BATCH-2398', beneficiaries: 28, amount: 1350000, createdAt:new Date(Date.now()-3600_000).toISOString(), status:'PENDING' },
        { id:'BATCH-2399', beneficiaries: 42, amount: 2420000, createdAt:new Date(Date.now()-2*3600_000).toISOString(), status:'QUEUED' }
      ])
      setEvents([
        { id:'E1', ts:new Date().toISOString(), msg:'Batch BATCH-2399 queued for processing', type:'INFO' },
        { id:'E2', ts:new Date(Date.now()-120000).toISOString(), msg:'TXN98199 marked COMPLETED', type:'SUCCESS' },
        { id:'E3', ts:new Date(Date.now()-300000).toISOString(), msg:'TXN98196 failed (Account mismatch)', type:'ERROR' }
      ])
    }, 340)
  },[])

  function addEvent(msg: string, type: LiveEvent['type']='INFO'){
    setEvents(e=> [{ id:'E'+(Date.now()), ts:new Date().toISOString(), msg, type }, ...e.slice(0,49)])
  }
  function simulateUpload(){
    setProcessing(true)
    setTimeout(()=> {
      addEvent('Bulk file parsed: 37 beneficiaries draft', 'SUCCESS')
      setShowUpload(false); setProcessing(false)
    }, 900)
  }
  function simulateInitiate(){
    setProcessing(true)
    setTimeout(()=> {
      const newBatch: Batch = { id:'BATCH-'+(Math.floor(Math.random()*9000)+1000), beneficiaries: Math.floor(Math.random()*40)+10, amount:(Math.floor(Math.random()*40)+10)*10_000, createdAt:new Date().toISOString(), status:'PENDING' }
      setBatches(b=> [newBatch, ...b])
      addEvent('Created new batch '+newBatch.id, 'SUCCESS')
      setShowInitiate(false); setProcessing(false)
    }, 800)
  }

  return (
    <div className='space-y-8'>
      <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold'>Disbursements</h1>
          <p className='text-sm text-gray-600'>Initiate & track DBT fund transfers.</p>
        </div>
        <div className='flex gap-2'>
          <Button className='bg-orange-600 hover:bg-orange-700' onClick={()=> setShowUpload(true)}><Upload className='h-4 w-4 mr-2' />Bulk Upload</Button>
          <Button variant='outline' onClick={()=> setShowInitiate(true)}><Send className='h-4 w-4 mr-2' />Initiate Batch</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending / Active Batches</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='overflow-auto rounded border'>
            <table className='w-full text-xs'>
              <thead className='bg-gray-50 text-gray-600'>
                <tr>
                  <th className='px-3 py-2 text-left font-semibold'>Batch</th>
                  <th className='px-3 py-2 text-left font-semibold'>Beneficiaries</th>
                  <th className='px-3 py-2 text-left font-semibold'>Amount (INR)</th>
                  <th className='px-3 py-2 text-left font-semibold'>Created</th>
                  <th className='px-3 py-2 text-left font-semibold'>Status</th>
                </tr>
              </thead>
              <tbody>
                {batches.map(b=> (
                  <tr key={b.id} className='border-t hover:bg-orange-50/40'>
                    <td className='px-3 py-2 font-mono'>{b.id}</td>
                    <td className='px-3 py-2'>{b.beneficiaries}</td>
                    <td className='px-3 py-2'>{Intl.NumberFormat('en-IN').format(b.amount)}</td>
                    <td className='px-3 py-2 text-[11px]'>{new Date(b.createdAt).toLocaleString('en-IN')}</td>
                    <td className='px-3 py-2 text-[11px] font-semibold'>{b.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className='text-[11px] text-gray-500'>Queued batches move to processing automatically (mock).</p>
        </CardContent>
      </Card>

      {(showUpload || showInitiate) && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4'>
          <div className='w-full max-w-md rounded-xl bg-white shadow-lg border p-6 space-y-5'>
            <div className='flex items-center justify-between'>
              <h2 className='text-lg font-semibold'>{showUpload? 'Bulk Upload Beneficiaries':'Initiate New Batch'}</h2>
              <button aria-label='Close' onClick={()=> { setShowUpload(false); setShowInitiate(false) }} className='p-1 rounded hover:bg-gray-100'><X className='h-4 w-4' /></button>
            </div>
            {showUpload && (
              <div className='space-y-4 text-sm'>
                <div className='border rounded p-3 bg-orange-50 text-xs text-gray-700'>Drag & drop CSV with columns: name,aadhaar,amount,category</div>
                <input type='file' className='w-full text-xs' />
              </div>
            )}
            {showInitiate && (
              <div className='space-y-4 text-sm'>
                <div>
                  <label className='block text-xs font-medium text-gray-600 mb-1'>Reference Label</label>
                  <input type='text' className='w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500' defaultValue={'Relief Batch '+ new Date().toLocaleDateString('en-IN')} />
                </div>
                <div className='flex gap-3'>
                  <div className='flex-1'>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>Est. Beneficiaries</label>
                    <input type='number' defaultValue={30} className='w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500' />
                  </div>
                  <div className='flex-1'>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>Total Amount (INR)</label>
                    <input type='number' defaultValue={1500000} className='w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500' />
                  </div>
                </div>
                <div>
                  <label className='block text-xs font-medium text-gray-600 mb-1'>Notes</label>
                  <textarea rows={3} className='w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none' placeholder='Internal remarks' />
                </div>
              </div>
            )}
            <div className='flex justify-end gap-2 pt-2'>
              <Button variant='outline' size='sm' onClick={()=> { setShowUpload(false); setShowInitiate(false) }}>Cancel</Button>
              <Button size='sm' className='bg-orange-600 hover:bg-orange-700 disabled:opacity-60' disabled={processing} onClick={showUpload? simulateUpload: simulateInitiate}>{processing? 'Processing...': showUpload? 'Upload':'Create'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
