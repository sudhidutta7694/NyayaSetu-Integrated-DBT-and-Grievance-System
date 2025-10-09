'use client'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useParams } from 'next/navigation'
import { Download, MessageSquare, Printer, Clock } from 'lucide-react'

interface TimelineEvent { stage:string; occurredAt:string; actorName:string; remarks?:string }

export default function ApplicationDetailPage(){
  const params=useParams() as { id?:string }
  const [loading,setLoading]=useState(true)
  const [timeline,setTimeline]=useState<TimelineEvent[]>([])
  const [status,setStatus]=useState('UNDER_REVIEW')
  const [title,setTitle]=useState('Application Title (Mock)')
  const [applicationNumber,setApplicationNumber]=useState('APP-2024-001')
  const [amountRequested,setAmountRequested]=useState(50000)
  const [amountApproved,setAmountApproved]=useState<number|undefined>(45000)

  useEffect(()=>{ setTimeout(()=> { setTimeline([
    { stage:'DRAFT', occurredAt:new Date(Date.now()-5*86400000).toISOString(), actorName:'You', remarks:'Started draft' },
    { stage:'SUBMITTED', occurredAt:new Date(Date.now()-4*86400000).toISOString(), actorName:'You' },
    { stage:'DISTRICT_REVIEW', occurredAt:new Date(Date.now()-2*86400000).toISOString(), actorName:'District Officer A', remarks:'Review initiated' },
    { stage:'STATE_REVIEW', occurredAt:new Date(Date.now()-1*86400000).toISOString(), actorName:'State Officer B' }
  ]); setLoading(false)}, 400)},[])

  const orderedStages=['DRAFT','SUBMITTED','DISTRICT_REVIEW','STATE_REVIEW','FINANCE','DISBURSED']
  const currentIndex = timeline.length // first incomplete stage index
  // Keyboard navigation between nodes
  const nodeRefs = useRef<(HTMLButtonElement|null)[]>([])
  const focusNode = useCallback((idx:number)=> { const el=nodeRefs.current[idx]; if(el) el.focus() },[])
  const handleKeyNav = (e:React.KeyboardEvent, idx:number)=> {
    if(e.key==='ArrowRight' || e.key==='ArrowDown'){ e.preventDefault(); focusNode(Math.min(orderedStages.length-1, idx+1)) }
    if(e.key==='ArrowLeft' || e.key==='ArrowUp'){ e.preventDefault(); focusNode(Math.max(0, idx-1)) }
  }
  function stageLabel(stage:string){ const map:Record<string,string>={ DRAFT:'Draft', SUBMITTED:'Submitted', DISTRICT_REVIEW:'District Review', STATE_REVIEW:'State Review', FINANCE:'Finance', DISBURSED:'Disbursed' }; return map[stage]||stage }

  if(loading) return <div className='text-sm text-gray-500 p-6'>Loading…</div>

  return (
    <div className='space-y-10'>
      <header className='flex flex-col md:flex-row md:items-start md:justify-between gap-4'>
        <div className='space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>{title}</h1>
          <div className='flex flex-wrap gap-4 text-sm text-gray-600'>
            <span>{applicationNumber}</span>
            <span>Requested: ₹{amountRequested.toLocaleString()}</span>
            {amountApproved!==undefined && <span className='text-green-600'>Approved: ₹{amountApproved.toLocaleString()}</span>}
            <span className={`status-badge status-${status.toLowerCase().replace(/_/g,'-')}`}>{status.replace('_',' ')}</span>
          </div>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' size='sm'><Download className='h-4 w-4 mr-1' />Download</Button>
          <Button variant='outline' size='sm'><MessageSquare className='h-4 w-4 mr-1' />Query</Button>
          <Button variant='outline' size='sm'><Printer className='h-4 w-4 mr-1' />Print</Button>
        </div>
      </header>

      <section aria-label='Timeline'>
        <Card>
          <CardHeader><CardTitle className='text-sm uppercase tracking-wide text-gray-500'>Timeline</CardTitle></CardHeader>
          <CardContent>
            {/* Responsive horizontal tracker on md+, vertical on small */}
            <div className='relative'>
              {/* Horizontal connector line (md+) */}
              <div className='hidden md:block absolute top-[22px] left-0 right-0 h-[2px] bg-gradient-to-r from-gray-200 via-gray-200 to-gray-200 pointer-events-none' aria-hidden='true'></div>
              {/* Progress fill (md+) based on completed stages */}
              <div className='hidden md:block absolute top-[22px] left-0 h-[2px] bg-orange-500 transition-all duration-500 ease-out pointer-events-none'
                style={{ width: `${Math.max(0,(timeline.length-1)/(orderedStages.length-1))*100}%` }} aria-hidden='true'></div>
              <ol className='flex md:flex-row flex-col md:justify-between gap-8 md:gap-0 relative z-10' role='list'>
                {orderedStages.map((stage,idx)=>{ const event=timeline.find(e=> e.stage===stage); const isCompleted=!!event; const isActive = !isCompleted && currentIndex===idx; const isFuture = !isCompleted && !isActive; const fullTimestamp = event? new Date(event.occurredAt).toLocaleString(): '—';
                  return (
                  <li key={stage} className='flex-1 min-w-[120px] relative md:text-center timeline-node-anim' role='listitem' style={{ animationDelay:`${idx*80}ms` }}>
                    {/* Vertical connector for small screens */}
                    {idx<orderedStages.length-1 && <span className='md:hidden absolute left-[11px] top-10 h-full w-[2px] bg-gray-200 rounded'></span>}
                    {idx<currentIndex && <span className='md:hidden absolute left-[11px] top-10 h-full w-[2px] bg-orange-500 rounded'></span>}
                    {/* No partial sub-step indicator now */}
                    <div className='flex md:flex-col items-start md:items-center gap-3 md:gap-2'>
                      <button
                        ref={el=> { nodeRefs.current[idx]=el }}
                        onKeyDown={(e)=> handleKeyNav(e,idx)}
                        tabIndex={0}
                        aria-current={isActive? 'step': undefined}
                        aria-label={`${stageLabel(stage)} ${isCompleted? 'completed': isActive? 'in progress': 'pending'} ${event? 'on '+fullTimestamp: ''}`}
                        className={`group relative h-9 w-9 flex items-center justify-center rounded-full border-2 text-[11px] font-semibold outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-300
                          ${isCompleted? 'bg-orange-600 border-orange-600 text-white shadow-sm': isActive? 'bg-white border-orange-500 text-orange-600': 'bg-white border-dashed border-gray-300 text-gray-400'}
                        `}
                      >
                        <span className='relative'>{isCompleted? '✓': idx+1}</span>
                        {/* Tooltip */}
                        <span role='tooltip' className='pointer-events-none opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition rounded-md bg-gray-900 text-white text-[10px] px-2 py-1 absolute top-full left-1/2 -translate-x-1/2 mt-2 z-20 whitespace-nowrap shadow'>
                          <span className='font-medium'>{stageLabel(stage)}</span>{event? ` • ${fullTimestamp}`: isActive? ' • In progress': ' • Pending'}{event?.actorName? ` • ${event.actorName}`:''}
                        </span>
                      </button>
                      <div className='flex-1 md:flex md:flex-col md:items-center md:space-y-1'>
                        <p className='text-xs font-medium md:mt-1'>{stageLabel(stage)}</p>
                        {event && <p className='text-[11px] text-gray-500 flex items-center gap-1 md:justify-center'><Clock className='h-3 w-3' />{new Date(event.occurredAt).toLocaleDateString()} {event.actorName && '• '+event.actorName}</p>}
                        {event?.remarks && <p className='text-[11px] text-gray-400 italic md:text-center'>{event.remarks}</p>}
                        {!event && !isFuture && <p className='text-[10px] text-orange-600 md:text-center'>In progress…</p>}
                        {!event && isFuture && <p className='text-[10px] text-gray-400 md:text-center'>Pending</p>}
                        {/* Removed sub-step progress bar */}
                      </div>
                    </div>
                  </li>) })}
              </ol>
            </div>
            <div className='mt-4 flex flex-wrap gap-4 text-[11px] text-gray-500'>
              <div className='flex items-center gap-1'><span className='h-3 w-3 rounded-full bg-orange-600 inline-block'></span> Completed</div>
              <div className='flex items-center gap-1'><span className='h-3 w-3 rounded-full border-2 border-orange-500 inline-block'></span> Current</div>
              <div className='flex items-center gap-1'><span className='h-3 w-3 rounded-full border-2 border-dashed border-gray-300 inline-block'></span> Upcoming</div>
            </div>
          </CardContent>
        </Card>
      </section>

      <div className='grid gap-6 lg:grid-cols-3'>
        <Card className='lg:col-span-2'>
          <CardHeader><CardTitle>Next Action</CardTitle></CardHeader>
          <CardContent><p className='text-sm text-gray-600'>Under District Review — expected response in 10 days (mock)</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Activity Log</CardTitle></CardHeader>
          <CardContent>
            <ul className='text-xs space-y-2'>
              <li>2024-01-11 • District Officer A note (mock)</li>
              <li>2024-01-10 • Submitted</li>
              <li>2024-01-09 • Draft created</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-6 lg:grid-cols-3'>
        <Card className='lg:col-span-2'>
          <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
          <CardContent>
            <p className='text-sm text-gray-600 mb-4'>Grouped by category (placeholder).</p>
            <div className='grid md:grid-cols-2 gap-4 text-sm'>
              <div><h4 className='font-semibold mb-2'>Identity</h4><ul className='space-y-1 text-xs'><li>Caste Certificate.pdf — <span className='text-green-600'>Verified</span></li></ul></div>
              <div><h4 className='font-semibold mb-2'>Financial</h4><ul className='space-y-1 text-xs'><li>Bank Passbook.pdf — <span className='text-green-600'>Verified</span></li></ul></div>
              <div><h4 className='font-semibold mb-2'>FIR</h4><ul className='space-y-1 text-xs'><li>FIR-Scan.pdf — <span className='text-yellow-600'>Pending</span></li></ul></div>
              <div><h4 className='font-semibold mb-2'>Other</h4><ul className='space-y-1 text-xs'><li>Photo.jpg — <span className='text-green-600'>Verified</span></li></ul></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Messages / Reviewer Comments</CardTitle></CardHeader>
          <CardContent>
            <div className='space-y-3 text-sm max-h-64 overflow-auto'>
              <div className='bg-gray-100 rounded p-2'><p className='text-[11px] text-gray-500'>2024-01-11</p><p>District Officer: Please upload clearer FIR scan.</p></div>
              <div className='bg-orange-50 rounded p-2 ml-auto'><p className='text-[11px] text-gray-500'>2024-01-11</p><p>You: Uploaded new FIR scan.</p></div>
            </div>
            <form className='mt-4 flex gap-2'>
              <input className='flex-1 border rounded px-2 py-1 text-sm' placeholder='Type a message (mock)' />
              <Button type='button' size='sm' variant='outline'>Send</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader><CardTitle>Requests for Additional Info</CardTitle></CardHeader>
          <CardContent>
            <ul className='text-sm space-y-3'>
              <li className='flex items-center justify-between border rounded px-3 py-2'><span>Provide higher resolution FIR scan</span><Button size='sm' variant='outline'>Upload</Button></li>
              <li className='flex items-center justify-between border rounded px-3 py-2'><span>Clarify bank branch name</span><Button size='sm' variant='outline'>Update</Button></li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
