'use client'
import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageCircle, CheckCircle2, AlertCircle } from 'lucide-react'

interface Issue { id: string; beneficiary: string; type: string; created: string; slaHrs: number; status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' }
interface Cause { label: string; value: number; color: string }
interface Resolution { id: string; ts: string; text: string }

export default function FIGrievancesPage(){
  const [issues, setIssues] = useState<Issue[]>([])
  const [causes, setCauses] = useState<Cause[]>([])
  const [resolutions, setResolutions] = useState<Resolution[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(()=> {
    setTimeout(()=> {
      setIssues([
        { id:'G-1201', beneficiary:'Sita Devi', type:'Payment Failure', created:new Date(Date.now()-6*3600_000).toISOString(), slaHrs:12, status:'IN_PROGRESS' },
        { id:'G-1202', beneficiary:'Ramesh Kumar', type:'Account Mismatch', created:new Date(Date.now()-12*3600_000).toISOString(), slaHrs:24, status:'OPEN' },
        { id:'G-1203', beneficiary:'Anita Rao', type:'Delay Inquiry', created:new Date(Date.now()-30*3600_000).toISOString(), slaHrs:48, status:'OPEN' }
      ])
      setCauses([
        { label:'Account Invalid', value:34, color:'bg-red-500' },
        { label:'Aadhaar Mismatch', value:22, color:'bg-amber-500' },
        { label:'KYC Pending', value:18, color:'bg-blue-500' },
        { label:'Other', value:26, color:'bg-green-500' }
      ])
      setResolutions([
        { id:'R1', ts:new Date(Date.now()-2*3600_000).toISOString(), text:'Resolved: TXN98199 credited after manual retry.' },
        { id:'R2', ts:new Date(Date.now()-8*3600_000).toISOString(), text:'Updated bank details for Rekha (NPCI seed confirmed).' },
        { id:'R3', ts:new Date(Date.now()-20*3600_000).toISOString(), text:'Flag cleared: name mismatch review complete.' }
      ])
      setLoading(false)
    }, 360)
  },[])

  return (
    <div className='space-y-8'>
      <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold'>Grievances & Disputes</h1>
          <p className='text-sm text-gray-600'>Resolve payment failures & beneficiary complaints.</p>
        </div>
        <div className='flex gap-2'>
          <Button className='bg-orange-600 hover:bg-orange-700'><MessageCircle className='h-4 w-4 mr-2' />New Response</Button>
          <Button variant='outline'><CheckCircle2 className='h-4 w-4 mr-2' />Mark Resolved</Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Open Issues</CardTitle>
        </CardHeader>
        <CardContent>
          {loading? <div className='h-40 flex items-center justify-center text-xs text-gray-500'>Loading issues...</div>:
          <div className='overflow-auto rounded border'>
            <table className='w-full text-xs'>
              <thead className='bg-gray-50 text-gray-600'>
                <tr>
                  <th className='px-3 py-2 text-left font-semibold'>Ticket</th>
                  <th className='px-3 py-2 text-left font-semibold'>Beneficiary</th>
                  <th className='px-3 py-2 text-left font-semibold'>Type</th>
                  <th className='px-3 py-2 text-left font-semibold'>Created</th>
                  <th className='px-3 py-2 text-left font-semibold'>SLA (h)</th>
                  <th className='px-3 py-2 text-left font-semibold'>Status</th>
                </tr>
              </thead>
              <tbody>
                {issues.map(i=> (
                  <tr key={i.id} className='border-t hover:bg-orange-50/40'>
                    <td className='px-3 py-2 font-mono'>{i.id}</td>
                    <td className='px-3 py-2'>{i.beneficiary}</td>
                    <td className='px-3 py-2'>{i.type}</td>
                    <td className='px-3 py-2 text-[11px]'>{new Date(i.created).toLocaleString('en-IN')}</td>
                    <td className='px-3 py-2'>{i.slaHrs}</td>
                    <td className='px-3 py-2 text-[11px] font-semibold'>{i.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Failure Root Causes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading? <div className='h-32 flex items-center justify-center text-xs text-gray-500'>Loading root causes...</div>:
          <ul className='space-y-3 text-xs'>
            {causes.map(c=> (
              <li key={c.label} className='flex items-center gap-3'>
                <span className='w-32 text-gray-600'>{c.label}</span>
                <div className='flex-1 h-3 bg-gray-100 rounded overflow-hidden'>
                  <div className={c.color+' h-full'} style={{width: c.value+'%'}} />
                </div>
                <span className='w-10 text-right font-semibold'>{c.value}%</span>
              </li>
            ))}
          </ul>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent Resolutions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading? <div className='h-32 flex items-center justify-center text-xs text-gray-500'>Loading timeline...</div>:
          <ol className='relative pl-4 border-l border-gray-300 text-xs space-y-4'>
            {resolutions.map(r=> (
              <li key={r.id} className='space-y-1'>
                <span className='absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-green-500 ring-4 ring-white' />
                <p className='font-medium text-gray-700'>{new Date(r.ts).toLocaleString('en-IN')}</p>
                <p className='text-gray-600'>{r.text}</p>
              </li>
            ))}
          </ol>}
        </CardContent>
      </Card>
    </div>
  )
}
