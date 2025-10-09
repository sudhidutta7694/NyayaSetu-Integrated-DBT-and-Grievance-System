'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, TrendingUp, Clock, Plus, X, Settings2, Power } from 'lucide-react'
import { DisbursementTable, DisbursementRow } from '@/components/fi/DisbursementTable'

interface Metrics {
  sanctioned: number
  disbursed: number
  pending: number
}
interface BatchDraftRow { id: string; beneficiaries: number; amount: number; status: 'DRAFT' | 'READY' | 'QUEUED' }
interface ReleaseSchedule { enabled: boolean; day: number; time: string } // time HH:MM 24h

export default function FIDashboardPage(){
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [recent, setRecent] = useState<DisbursementRow[]>([])
  // category breakdown moved to Reports & Analytics
  const [batches, setBatches] = useState<BatchDraftRow[]>([])
  const [schedule, setSchedule] = useState<ReleaseSchedule>({ enabled: true, day: 5, time: '10:00' })
  const [showSchedule, setShowSchedule] = useState(false)
  const [savingSchedule, setSavingSchedule] = useState(false)
  useEffect(()=> {
    // mock fetch
    setTimeout(()=> {
  setMetrics({ sanctioned: 18000000, disbursed: 15000000, pending: 2500000 })
      setRecent(Array.from({length:8}).map((_,i)=> ({
        id: 'TXN'+(34210+i),
        beneficiary: ['Sita Devi','Ramesh Kumar','Anita Rao','Mahesh Patil','K. Joseph','P. Lakshmi','A. Narayan','Geeta Bai'][i],
        category: (['PCR','PoA','INCENTIVE'] as const)[i%3],
        amount: [15000, 50000, 25000, 40000, 32000, 18000, 27000, 22000][i],
        status: (['COMPLETED','COMPLETED','PENDING','FAILED','COMPLETED','PROCESSING','COMPLETED','PENDING'] as const)[i],
        createdAt: new Date(Date.now()- i*3600_000).toISOString()
      })))
      // removed fund flow snapshot (no timeline)
      setBatches([
        { id:'BATCH-2401', beneficiaries: 25, amount: 1250000, status:'READY' },
        { id:'BATCH-2402', beneficiaries: 40, amount: 2200000, status:'QUEUED' }
      ])
    }, 320)
  },[])

  function computeNextRun(s: ReleaseSchedule): Date {
    const now = new Date()
    const year = now.getFullYear()
    let month = now.getMonth()
    let day = Math.min(s.day, new Date(year, month+1, 0).getDate())
    const [hh, mm] = s.time.split(':').map(n=> parseInt(n,10))
    let next = new Date(year, month, day, hh||10, mm||0, 0)
    if(next <= now){
      month += 1
      day = Math.min(s.day, new Date(year, month+1, 0).getDate())
      next = new Date(year, month, day, hh||10, mm||0, 0)
    }
    return next
  }
  const nextRun = computeNextRun(schedule)

  return (
    <div className='space-y-8'>
      <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold'>Financial Institution Dashboard</h1>
          <p className='text-sm text-gray-600'>Overview of DBT disbursement operations under PCR & PoA Acts.</p>
        </div>
        <div className='flex gap-2 items-center'>
          <span className='text-[11px] text-gray-500 hidden sm:inline'>Next auto-release:</span>
          <span className='text-xs font-semibold'>{schedule.enabled? nextRun.toLocaleString('en-IN'):'Paused'}</span>
          <Button size='sm' variant='outline' onClick={()=> setShowSchedule(true)}><Settings2 className='h-3.5 w-3.5 mr-1'/>Configure</Button>
        </div>
      </div>

      {/* KPI Cards: Only Total Approved and Total Disbursed */}
      <div className='grid gap-4 sm:grid-cols-2'>
        {metrics? (
          <>
            <MetricCard label='Total Approved' value={metrics.sanctioned} icon={<FileText className='h-5 w-5 text-blue-600' />} />
            <MetricCard label='Total Disbursed' value={metrics.disbursed} icon={<TrendingUp className='h-5 w-5 text-green-600' />} />
          </>
        ): Array.from({length:2}).map((_,i)=>(<div key={i} className='h-28 rounded-lg bg-gray-100 animate-pulse' />)) }
      </div>

      <div className='grid gap-6 lg:grid-cols-12'>
        <Card className='lg:col-span-12'>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle>Recent Disbursements</CardTitle>
            <span className='text-[11px] text-gray-500'>Last {recent.length} txns</span>
          </CardHeader>
          <CardContent>
            {recent.length? <DisbursementTable rows={recent} />: <div className='h-40 flex items-center justify-center text-xs text-gray-500'>Loading...</div>}
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown moved to Reports & Analytics */}

      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div className='space-y-1'>
            <CardTitle>Bulk Batches</CardTitle>
            <p className='text-[11px] text-gray-500'>Approved beneficiaries are auto-collected and released on schedule.</p>
          </div>
          <button onClick={()=> setSchedule(s=> ({...s, enabled: !s.enabled}))} className={'inline-flex items-center gap-2 text-xs px-2.5 py-1 rounded-full ring-1 ring-inset transition ' + (schedule.enabled? 'bg-green-50 text-green-700 ring-green-200 hover:bg-green-100':'bg-gray-50 text-gray-700 ring-gray-200 hover:bg-gray-100')}>
            <Power className='h-3.5 w-3.5'/> {schedule.enabled? 'Auto Release: On':'Auto Release: Off'}
          </button>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='overflow-auto rounded-lg border'>
            <table className='w-full text-xs'>
              <thead className='bg-gray-50'>
                <tr className='text-gray-600'>
                  <th className='text-left px-3 py-2 font-semibold'>Batch</th>
                  <th className='text-left px-3 py-2 font-semibold'>Beneficiaries</th>
                  <th className='text-left px-3 py-2 font-semibold'>Amount</th>
                  <th className='text-left px-3 py-2 font-semibold'>Status</th>
                  <th className='text-left px-3 py-2 font-semibold'>Scheduled For</th>
                  <th className='px-3 py-2 text-right'>Action</th>
                </tr>
              </thead>
              <tbody>
                {batches.map(b=> (
                  <tr key={b.id} className='border-t hover:bg-orange-50/40'>
                    <td className='px-3 py-2 font-mono'>{b.id}</td>
                    <td className='px-3 py-2'>{b.beneficiaries}</td>
                    <td className='px-3 py-2'>{Intl.NumberFormat('en-IN',{ style:'currency', currency:'INR'}).format(b.amount)}</td>
                    <td className='px-3 py-2 text-xs font-semibold'>{schedule.enabled? (b.status==='QUEUED'? 'QUEUED':'READY') : 'PAUSED'}</td>
                    <td className='px-3 py-2 text-[11px]'>
                      {schedule.enabled? nextRun.toLocaleString('en-IN') : '—'}
                    </td>
                    <td className='px-3 py-2 text-right'>
                      <Button size='sm' variant='outline' className='text-orange-700 border-orange-200 hover:bg-orange-50'>Run now (demo)</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className='text-[11px] text-gray-500'>Auto releases will execute on the configured monthly schedule. Manual run is available here only for demonstration.</p>
        </CardContent>
      </Card>

      {showSchedule && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4'>
          <div className='w-full max-w-md rounded-xl bg-white shadow-lg border p-6 space-y-5'>
            <div className='flex items-center justify-between'>
              <h2 className='text-lg font-semibold'>Auto Release Schedule</h2>
              <button aria-label='Close' onClick={()=> setShowSchedule(false)} className='p-1 rounded hover:bg-gray-100'><X className='h-4 w-4' /></button>
            </div>
            <div className='space-y-4 text-sm'>
              <label className='inline-flex items-center gap-2 text-xs font-semibold'>
                <input type='checkbox' checked={schedule.enabled} onChange={e=> setSchedule(s=> ({...s, enabled: e.target.checked}))} />
                Enable monthly auto release
              </label>
              <div className='flex gap-3'>
                <div className='flex-1'>
                  <label className='block text-xs font-medium text-gray-600 mb-1'>Day of month</label>
                  <input type='number' min={1} max={28} value={schedule.day} onChange={e=> setSchedule(s=> ({...s, day: Math.max(1, Math.min(28, Number(e.target.value)||1))}))} className='w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500' />
                  <p className='text-[10px] text-gray-500 mt-1'>Up to 28 to avoid month-end variability.</p>
                </div>
                <div className='flex-1'>
                  <label className='block text-xs font-medium text-gray-600 mb-1'>Time (24h)</label>
                  <input type='time' value={schedule.time} onChange={e=> setSchedule(s=> ({...s, time: e.target.value}))} className='w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500' />
                </div>
              </div>
              <div className='bg-orange-50 border border-orange-200 rounded p-2 text-[11px] text-orange-700'>
                Next run will be {computeNextRun(schedule).toLocaleString('en-IN')}.
              </div>
            </div>
            <div className='flex justify-end gap-2 pt-2'>
              <Button variant='outline' size='sm' onClick={()=> setShowSchedule(false)}>Cancel</Button>
              <Button size='sm' className='bg-orange-600 hover:bg-orange-700 disabled:opacity-60' disabled={savingSchedule} onClick={()=> { setSavingSchedule(true); setTimeout(()=> { setSavingSchedule(false); setShowSchedule(false) }, 500) }}>{savingSchedule? 'Saving...':'Save'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MetricCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }){
  return (
    <div className='p-4 rounded-lg border bg-white shadow-sm flex flex-col gap-2'>
      <div className='flex items-center justify-between'>
        <span className='text-xs font-medium uppercase tracking-wide text-gray-500'>{label}</span>
        {icon}
      </div>
      <span className='text-xl font-semibold'>{Intl.NumberFormat('en-IN',{ notation: 'compact'}).format(value)}</span>
    </div>
  )
}

// Removed generic Placeholder (replaced by concrete UI)

// Category breakdown chart moved to Reports page
