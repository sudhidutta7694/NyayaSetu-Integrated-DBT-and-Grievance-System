'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Send, RefreshCw, X } from 'lucide-react'
import { DisbursementTable, DisbursementRow } from '@/components/fi/DisbursementTable'

interface Batch { id: string; beneficiaries: number; amount: number; createdAt: string; status: 'PENDING' | 'QUEUED' | 'PROCESSING' | 'COMPLETED' }
interface LiveEvent { id: string; ts: string; msg: string; type: 'INFO' | 'SUCCESS' | 'ERROR' }

export default function FIDisbursementsPage(){
  const [batches, setBatches] = useState<Batch[]>([])
  const [recent, setRecent] = useState<DisbursementRow[]>([])
  const [events, setEvents] = useState<LiveEvent[]>([])
  const [showUpload, setShowUpload] = useState(false)
  const [showInitiate, setShowInitiate] = useState(false)
  const [processing, setProcessing] = useState(false)
  // Analytics controls
  const [granularity, setGranularity] = useState<'monthly'|'yearly'>('monthly')
  const [from, setFrom] = useState<string>(()=> {
    const d = new Date(); d.setMonth(d.getMonth()-5); d.setDate(1); return d.toISOString().slice(0,10)
  })
  const [to, setTo] = useState<string>(()=> new Date().toISOString().slice(0,10))

  useEffect(()=> {
    setTimeout(()=> {
      setBatches([
        { id:'BATCH-2398', beneficiaries: 28, amount: 1350000, createdAt:new Date(Date.now()-3600_000).toISOString(), status:'PENDING' },
        { id:'BATCH-2399', beneficiaries: 42, amount: 2420000, createdAt:new Date(Date.now()-2*3600_000).toISOString(), status:'QUEUED' }
      ])
      setRecent(Array.from({length:10}).map((_,i)=> ({
        id: 'TXN'+(98200+i),
        beneficiary: ['Rekha','Thomas','Aarti','Vinod','Nisha','Karan','Deepa','Salim','Charu','Omkar'][i],
        category: (['PCR','PoA','INCENTIVE'] as const)[i%3],
        amount: [12000,15000,25000,18000,40000,30000,22000,27000,16000,19500][i],
        status: (['COMPLETED','COMPLETED','PENDING','FAILED','COMPLETED','PROCESSING','COMPLETED','COMPLETED','PENDING','COMPLETED'] as const)[i],
        createdAt: new Date(Date.now()- i*1800_000).toISOString()
      })))
      setEvents([
        { id:'E1', ts:new Date().toISOString(), msg:'Batch BATCH-2399 queued for processing', type:'INFO' },
        { id:'E2', ts:new Date(Date.now()-120000).toISOString(), msg:'TXN98199 marked COMPLETED', type:'SUCCESS' },
        { id:'E3', ts:new Date(Date.now()-300000).toISOString(), msg:'TXN98196 failed (Account mismatch)', type:'ERROR' }
      ])
    }, 340)
  },[])

  // Build mock analytics series based on date range & granularity
  type SeriesPoint = { label: string; completed: number; pending: number; processing: number; failed: number }
  const analytics = useMemo<SeriesPoint[]>(()=>{
    const fromTs = new Date(from).getTime(); const toTs = new Date(to).getTime()
    if (Number.isNaN(fromTs) || Number.isNaN(toTs) || fromTs>toTs) return []
    const points: SeriesPoint[] = []
    const start = new Date(fromTs)
    const end = new Date(toTs)
    if (granularity==='monthly'){
      const cur = new Date(start.getFullYear(), start.getMonth(), 1)
      while (cur <= end){
        const label = cur.toLocaleString('en-IN', { month:'short', year:'2-digit' })
        const seed = (cur.getFullYear()*100 + cur.getMonth()+1)
        const base = (seed*9301 + 49297) % 233280
        const completed = 20 + (base % 60)
        const pending = 5 + (base % 20)
        const processing = 3 + (base % 15)
        const failed = 1 + (base % 7)
        points.push({ label, completed, pending, processing, failed })
        cur.setMonth(cur.getMonth()+1)
      }
    } else {
      // yearly
      const cur = new Date(start.getFullYear(), 0, 1)
      const last = end.getFullYear()
      while (cur.getFullYear() <= last){
        const label = String(cur.getFullYear())
        const base = ((cur.getFullYear()%97)*9301 + 49297) % 233280
        const completed = 200 + (base % 600)
        const pending = 50 + (base % 200)
        const processing = 30 + (base % 150)
        const failed = 10 + (base % 70)
        points.push({ label, completed, pending, processing, failed })
        cur.setFullYear(cur.getFullYear()+1)
      }
    }
    return points
  },[from, to, granularity])

  const totals = useMemo(()=> {
    return analytics.reduce((acc, p)=> ({
      completed: acc.completed + p.completed,
      pending: acc.pending + p.pending,
      processing: acc.processing + p.processing,
      failed: acc.failed + p.failed
    }), { completed:0, pending:0, processing:0, failed:0 })
  },[analytics])

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
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>Disbursement Analytics</CardTitle>
          <div className='flex items-center gap-2 text-xs'>
            <div className='inline-flex rounded-md overflow-hidden border'>
              <button onClick={()=> setGranularity('monthly')} className={'px-2 py-1 '+ (granularity==='monthly'? 'bg-orange-600 text-white':'bg-white hover:bg-orange-50')}>Monthly</button>
              <button onClick={()=> setGranularity('yearly')} className={'px-2 py-1 '+ (granularity==='yearly'? 'bg-orange-600 text-white':'bg-white hover:bg-orange-50')}>Yearly</button>
            </div>
            <label className='text-gray-600'>From</label>
            <input type='date' value={from} onChange={e=> setFrom(e.target.value)} className='border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500'/>
            <label className='text-gray-600'>To</label>
            <input type='date' value={to} onChange={e=> setTo(e.target.value)} className='border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500'/>
          </div>
        </CardHeader>
        <CardContent className='space-y-3'>
          <StackedBarChart data={analytics} />
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs'>
            <StatPill color='bg-green-100 text-green-700 ring-green-200' label='Completed' value={totals.completed} />
            <StatPill color='bg-amber-100 text-amber-700 ring-amber-200' label='Pending' value={totals.pending} />
            <StatPill color='bg-blue-100 text-blue-700 ring-blue-200' label='Processing' value={totals.processing} />
            <StatPill color='bg-red-100 text-red-700 ring-red-200' label='Failed' value={totals.failed} />
          </div>
          {/* Legend and long description removed for a cleaner look */}
        </CardContent>
      </Card>

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
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>Recent Transfers</CardTitle>
          <Button size='sm' variant='outline'><RefreshCw className='h-3 w-3 mr-1' />Refresh</Button>
        </CardHeader>
        <CardContent>
          {recent.length? <DisbursementTable rows={recent} />: <div className='h-40 flex items-center justify-center text-xs text-gray-500'>Loading transfers...</div>}
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

function StatPill({ color, label, value }: { color: string; label: string; value: number }){
  return (
    <div className={`inline-flex items-center justify-between px-3 py-2 rounded-lg ring-1 ring-inset ${color}`}>
      <span className='font-semibold'>{label}</span>
      <span className='tabular-nums'>{Intl.NumberFormat('en-IN').format(value)}</span>
    </div>
  )
}

function StackedBarChart({ data }: { data: { label: string; completed: number; pending: number; processing: number; failed: number }[] }){
  const max = Math.max(1, ...data.map(d=> d.completed + d.pending + d.processing + d.failed))
  return (
    <div className='w-full overflow-x-auto'>
      <div className='flex items-end gap-6 px-2 sm:px-4 relative' style={{height: 240}}>
        <div className='absolute left-0 right-0 top-0 bottom-8 pointer-events-none'>
          {Array.from({length:4}).map((_,i)=> (
            <div key={i} className='absolute left-0 right-0 border-t border-dashed border-gray-200' style={{bottom: `${((i+1)/4)*100}%`}} />
          ))}
        </div>
        {data.map((d, idx)=> {
          const total = d.completed + d.pending + d.processing + d.failed
          const cPct = (d.completed/total)*100
          const pPct = (d.pending/total)*100
          const prPct = (d.processing/total)*100
          const fPct = (d.failed/total)*100
          const h = (total/max)*100
          return (
            <div key={d.label+idx} className='group flex flex-col items-center gap-2 min-w-[52px]'>
              <div className='w-8 sm:w-10 bg-white rounded-lg border border-gray-200 shadow-sm relative overflow-hidden flex items-end justify-center' style={{height: 200}}>
                <div className='w-full absolute bottom-0' style={{height: `${h}%`}}>
                  <div className='w-full bg-green-500' style={{height: `${cPct}%`}} />
                  <div className='w-full bg-amber-400' style={{height: `${pPct}%`}} />
                  <div className='w-full bg-blue-500' style={{height: `${prPct}%`}} />
                  <div className='w-full bg-red-500' style={{height: `${fPct}%`}} />
                </div>
                <div className='absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-gray-900 text-white px-2 py-1 rounded shadow pointer-events-none'>
                  {d.label}: {Intl.NumberFormat('en-IN').format(total)}
                </div>
              </div>
              <div className='text-center'>
                <div className='text-[10px] text-gray-600'>{d.label}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
