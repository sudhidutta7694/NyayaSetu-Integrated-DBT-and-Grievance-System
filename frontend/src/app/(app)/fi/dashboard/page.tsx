// 'use client'
// import React, { useEffect, useMemo, useState } from 'react'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { FileText, TrendingUp, Clock, Plus, X, Settings2, Power } from 'lucide-react'
// import { DisbursementTable, DisbursementRow } from '@/components/fi/DisbursementTable'

// interface Metrics {
//   sanctioned: number
//   disbursed: number
//   pending: number
// }
// interface BatchDraftRow { id: string; beneficiaries: number; amount: number; status: 'DRAFT' | 'READY' | 'QUEUED' }
// interface ReleaseSchedule { enabled: boolean; day: number; time: string } // time HH:MM 24h

// export default function FIDashboardPage(){
//   const [metrics, setMetrics] = useState<Metrics | null>(null)
//   const [recent, setRecent] = useState<DisbursementRow[]>([])
//   // category breakdown moved to Reports & Analytics
//   const [batches, setBatches] = useState<BatchDraftRow[]>([])
//   const [schedule, setSchedule] = useState<ReleaseSchedule>({ enabled: true, day: 5, time: '10:00' })
//   const [showSchedule, setShowSchedule] = useState(false)
//   const [savingSchedule, setSavingSchedule] = useState(false)
//   useEffect(()=> {
//     // mock fetch
//     setTimeout(()=> {
//   setMetrics({ sanctioned: 18000000, disbursed: 15000000, pending: 2500000 })
//       setRecent(Array.from({length:8}).map((_,i)=> ({
//         id: 'TXN'+(34210+i),
//         beneficiary: ['Sita Devi','Ramesh Kumar','Anita Rao','Mahesh Patil','K. Joseph','P. Lakshmi','A. Narayan','Geeta Bai'][i],
//         category: (['PCR','PoA','INCENTIVE'] as const)[i%3],
//         amount: [15000, 50000, 25000, 40000, 32000, 18000, 27000, 22000][i],
//         status: (['COMPLETED','COMPLETED','PENDING','FAILED','COMPLETED','PROCESSING','COMPLETED','PENDING'] as const)[i],
//         createdAt: new Date(Date.now()- i*3600_000).toISOString()
//       })))
//       // removed fund flow snapshot (no timeline)
//       setBatches([
//         { id:'BATCH-2401', beneficiaries: 25, amount: 1250000, status:'READY' },
//         { id:'BATCH-2402', beneficiaries: 40, amount: 2200000, status:'QUEUED' }
//       ])
//     }, 320)
//   },[])

//   function computeNextRun(s: ReleaseSchedule): Date {
//     const now = new Date()
//     const year = now.getFullYear()
//     let month = now.getMonth()
//     let day = Math.min(s.day, new Date(year, month+1, 0).getDate())
//     const [hh, mm] = s.time.split(':').map(n=> parseInt(n,10))
//     let next = new Date(year, month, day, hh||10, mm||0, 0)
//     if(next <= now){
//       month += 1
//       day = Math.min(s.day, new Date(year, month+1, 0).getDate())
//       next = new Date(year, month, day, hh||10, mm||0, 0)
//     }
//     return next
//   }
//   const nextRun = computeNextRun(schedule)

//   return (
//     <div className='space-y-8'>
//       <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4'>
//         <div>
//           <h1 className='text-2xl font-bold'>Financial Institution Dashboard</h1>
//           <p className='text-sm text-gray-600'>Overview of DBT disbursement operations under PCR & PoA Acts.</p>
//         </div>
//         <div className='flex gap-2 items-center'>
//           <span className='text-[11px] text-gray-500 hidden sm:inline'>Next auto-release:</span>
//           <span className='text-xs font-semibold'>{schedule.enabled? nextRun.toLocaleString('en-IN'):'Paused'}</span>
//           <Button size='sm' variant='outline' onClick={()=> setShowSchedule(true)}><Settings2 className='h-3.5 w-3.5 mr-1'/>Configure</Button>
//         </div>
//       </div>

//       <div className='grid gap-6 lg:grid-cols-12'>
//         <Card className='lg:col-span-12'>
//           <CardHeader className='flex flex-row items-center justify-between'>
//             <CardTitle>Recent Disbursements</CardTitle>
//             <span className='text-[11px] text-gray-500'>Last {recent.length} txns</span>
//           </CardHeader>
//           <CardContent>
//             {recent.length? <DisbursementTable rows={recent} />: <div className='h-40 flex items-center justify-center text-xs text-gray-500'>Loading...</div>}
//           </CardContent>
//         </Card>
//       </div>

//       {/* Category Breakdown moved to Reports & Analytics */}

//       <Card>
//         <CardHeader className='flex flex-row items-center justify-between'>
//           <div className='space-y-1'>
//             <CardTitle>Bulk Batches</CardTitle>
//             <p className='text-[11px] text-gray-500'>Approved beneficiaries are auto-collected and released on schedule.</p>
//           </div>
//           <button onClick={()=> setSchedule(s=> ({...s, enabled: !s.enabled}))} className={'inline-flex items-center gap-2 text-xs px-2.5 py-1 rounded-full ring-1 ring-inset transition ' + (schedule.enabled? 'bg-green-50 text-green-700 ring-green-200 hover:bg-green-100':'bg-gray-50 text-gray-700 ring-gray-200 hover:bg-gray-100')}>
//             <Power className='h-3.5 w-3.5'/> {schedule.enabled? 'Auto Release: On':'Auto Release: Off'}
//           </button>
//         </CardHeader>
//         <CardContent className='space-y-4'>
//           <div className='overflow-auto rounded-lg border'>
//             <table className='w-full text-xs'>
//               <thead className='bg-gray-50'>
//                 <tr className='text-gray-600'>
//                   <th className='text-left px-3 py-2 font-semibold'>Batch</th>
//                   <th className='text-left px-3 py-2 font-semibold'>Beneficiaries</th>
//                   <th className='text-left px-3 py-2 font-semibold'>Amount</th>
//                   <th className='text-left px-3 py-2 font-semibold'>Status</th>
//                   <th className='text-left px-3 py-2 font-semibold'>Scheduled For</th>
//                   <th className='px-3 py-2 text-right'>Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {batches.map(b=> (
//                   <tr key={b.id} className='border-t hover:bg-orange-50/40'>
//                     <td className='px-3 py-2 font-mono'>{b.id}</td>
//                     <td className='px-3 py-2'>{b.beneficiaries}</td>
//                     <td className='px-3 py-2'>{Intl.NumberFormat('en-IN',{ style:'currency', currency:'INR'}).format(b.amount)}</td>
//                     <td className='px-3 py-2 text-xs font-semibold'>{schedule.enabled? (b.status==='QUEUED'? 'QUEUED':'READY') : 'PAUSED'}</td>
//                     <td className='px-3 py-2 text-[11px]'>
//                       {schedule.enabled? nextRun.toLocaleString('en-IN') : '—'}
//                     </td>
//                     <td className='px-3 py-2 text-right'>
//                       <Button size='sm' variant='outline' className='text-orange-700 border-orange-200 hover:bg-orange-50'>Run now (demo)</Button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//           <p className='text-[11px] text-gray-500'>Auto releases will execute on the configured monthly schedule. Manual run is available here only for demonstration.</p>
//         </CardContent>
//       </Card>

//       {showSchedule && (
//         <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4'>
//           <div className='w-full max-w-md rounded-xl bg-white shadow-lg border p-6 space-y-5'>
//             <div className='flex items-center justify-between'>
//               <h2 className='text-lg font-semibold'>Auto Release Schedule</h2>
//               <button aria-label='Close' onClick={()=> setShowSchedule(false)} className='p-1 rounded hover:bg-gray-100'><X className='h-4 w-4' /></button>
//             </div>
//             <div className='space-y-4 text-sm'>
//               <label className='inline-flex items-center gap-2 text-xs font-semibold'>
//                 <input type='checkbox' checked={schedule.enabled} onChange={e=> setSchedule(s=> ({...s, enabled: e.target.checked}))} />
//                 Enable monthly auto release
//               </label>
//               <div className='flex gap-3'>
//                 <div className='flex-1'>
//                   <label className='block text-xs font-medium text-gray-600 mb-1'>Day of month</label>
//                   <input type='number' min={1} max={28} value={schedule.day} onChange={e=> setSchedule(s=> ({...s, day: Math.max(1, Math.min(28, Number(e.target.value)||1))}))} className='w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500' />
//                   <p className='text-[10px] text-gray-500 mt-1'>Up to 28 to avoid month-end variability.</p>
//                 </div>
//                 <div className='flex-1'>
//                   <label className='block text-xs font-medium text-gray-600 mb-1'>Time (24h)</label>
//                   <input type='time' value={schedule.time} onChange={e=> setSchedule(s=> ({...s, time: e.target.value}))} className='w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500' />
//                 </div>
//               </div>
//               <div className='bg-orange-50 border border-orange-200 rounded p-2 text-[11px] text-orange-700'>
//                 Next run will be {computeNextRun(schedule).toLocaleString('en-IN')}.
//               </div>
//             </div>
//             <div className='flex justify-end gap-2 pt-2'>
//               <Button variant='outline' size='sm' onClick={()=> setShowSchedule(false)}>Cancel</Button>
//               <Button size='sm' className='bg-orange-600 hover:bg-orange-700 disabled:opacity-60' disabled={savingSchedule} onClick={()=> { setSavingSchedule(true); setTimeout(()=> { setSavingSchedule(false); setShowSchedule(false) }, 500) }}>{savingSchedule? 'Saving...':'Save'}</Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// function MetricCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }){
//   return (
//     <div className='p-4 rounded-lg border bg-white shadow-sm flex flex-col gap-2'>
//       <div className='flex items-center justify-between'>
//         <span className='text-xs font-medium uppercase tracking-wide text-gray-500'>{label}</span>
//         {icon}
//       </div>
//       <span className='text-xl font-semibold'>{Intl.NumberFormat('en-IN',{ notation: 'compact'}).format(value)}</span>
//     </div>
//   )
// }

// // Removed generic Placeholder (replaced by concrete UI)

// // Category breakdown chart moved to Reports page

'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Clock, Settings2, Power, FileText, X, Eye, Loader2 } from 'lucide-react'
import { fiDashboardApi } from '@/lib/api/fiDashboard'
import toast from 'react-hot-toast'

interface Application {
  id: string
  application_number: string
  title: string
  application_type: string | null
  amount_approved: string | null
  status: string
  submitted_at: string
  updated_at: string
}

interface BatchDraftRow { 
  id: string
  beneficiaries: number
  amount: number
  status: 'DRAFT' | 'READY' | 'QUEUED' 
}

interface ReleaseSchedule { 
  enabled: boolean
  day: number
  time: string 
}

export default function FIDashboardPage(){
  const router = useRouter()
  const [pendingApplications, setPendingApplications] = useState<Application[]>([])
  const [processedApplications, setProcessedApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [batches, setBatches] = useState<BatchDraftRow[]>([])
  const [schedule, setSchedule] = useState<ReleaseSchedule>({ enabled: true, day: 5, time: '10:00' })
  const [showSchedule, setShowSchedule] = useState(false)
  const [savingSchedule, setSavingSchedule] = useState(false)
  
  useEffect(()=> {
    fetchApplications()
  },[])

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const [pending, processed] = await Promise.all([
        fiDashboardApi.getPendingApplications(),
        fiDashboardApi.getProcessedApplications()
      ])
      setPendingApplications(pending)
      setProcessedApplications(processed)
      
      // Only create batch if there are approved applications (FUND_DISBURSED status)
      const approvedForDisbursement = processed.filter((app: Application) => app.status === 'FUND_DISBURSED')
      
      if (approvedForDisbursement.length > 0) {
        setBatches([
          { 
            id: `BATCH-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}01`, 
            beneficiaries: approvedForDisbursement.length, 
            amount: approvedForDisbursement.reduce((sum: number, app: Application) => sum + (parseFloat(app.amount_approved || '0')), 0), 
            status: 'READY' 
          }
        ])
      } else {
        setBatches([])
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const handleDisburseBatch = async () => {
    try {
      const result = await fiDashboardApi.disburseBatch()
      toast.success('Successfully disbursed allocated funds')
      // Refresh data to show updated status
      await fetchApplications()
    } catch (error: any) {
      console.error('Failed to disburse batch:', error)
      toast.error(error.response?.data?.detail || 'Failed to disburse funds')
    }
  }

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
      <div>
        <h1 className='text-2xl font-bold'>Financial Institution Dashboard</h1>
        <p className='text-sm text-gray-600'>Overview of DBT disbursement operations under PCR & PoA Acts.</p>
      </div>

      {/* Pending Approvals Section */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle>Pending Approvals</CardTitle>
            <p className='text-xs text-gray-600 mt-1'>Applications approved by Social Welfare - awaiting FI approval for disbursement</p>
          </div>
          <span className='text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-semibold'>{pendingApplications.length} pending</span>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='h-40 flex items-center justify-center'>
              <Loader2 className='h-6 w-6 animate-spin text-gray-400' />
            </div>
          ) : (
            <>
              <div className='overflow-auto rounded-lg border'>
                <table className='w-full text-xs'>
                  <thead className='bg-gray-50'>
                    <tr className='text-gray-600'>
                      <th className='text-left px-3 py-2 font-semibold'>Application ID</th>
                      <th className='text-left px-3 py-2 font-semibold'>Title</th>
                      <th className='text-left px-3 py-2 font-semibold'>Type</th>
                      <th className='text-left px-3 py-2 font-semibold'>Amount Approved</th>
                      <th className='text-left px-3 py-2 font-semibold'>Submitted Date</th>
                      <th className='px-3 py-2 text-right font-semibold'>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingApplications.map(app=> (
                      <tr key={app.id} className='border-t hover:bg-orange-50/40'>
                        <td className='px-3 py-2 font-mono text-[11px]'>{app.application_number}</td>
                        <td className='px-3 py-2 max-w-xs truncate'>{app.title}</td>
                        <td className='px-3 py-2'>
                          <span className={'px-2 py-0.5 rounded text-[10px] font-semibold ' + (
                            app.application_type === 'PCR' ? 'bg-blue-100 text-blue-700' :
                            app.application_type === 'PoA' ? 'bg-purple-100 text-purple-700' :
                            'bg-green-100 text-green-700'
                          )}>
                            {app.application_type || 'N/A'}
                          </span>
                        </td>
                        <td className='px-3 py-2 font-semibold'>
                          {app.amount_approved ? Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(parseFloat(app.amount_approved)) : 'N/A'}
                        </td>
                        <td className='px-3 py-2 text-[11px]'>{new Date(app.submitted_at).toLocaleDateString('en-IN')}</td>
                        <td className='px-3 py-2 text-right'>
                          <Button 
                            size='sm' 
                            variant='outline' 
                            className='h-7 px-3 gap-1' 
                            onClick={() => router.push(`/fi/case-detail?id=${app.id}`)}
                          >
                            <Eye className='h-3 w-3' />
                            Review
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pendingApplications.length === 0 && (
                <div className='h-40 flex items-center justify-center text-xs text-gray-500'>
                  No pending applications for approval at this time
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4'>
            <div className='space-y-1 flex-1'>
              <CardTitle>Bulk Batches</CardTitle>
              <p className='text-[11px] text-gray-500'>Approved beneficiaries are auto-collected and released on schedule.</p>
            </div>
            <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3'>
              <div className='flex flex-col items-end gap-1'>
                <span className='text-[11px] text-gray-500'>Next auto-release:</span>
                <span className='text-xs font-semibold'>{schedule.enabled? nextRun.toLocaleString('en-IN'):'Paused'}</span>
              </div>
              <div className='flex gap-2'>
                <Button size='sm' variant='outline' onClick={()=> setShowSchedule(true)}>
                  <Settings2 className='h-3.5 w-3.5 mr-1'/>
                  Configure
                </Button>
                <button 
                  onClick={()=> setSchedule(s=> ({...s, enabled: !s.enabled}))} 
                  className={'inline-flex items-center gap-2 text-xs px-2.5 py-1 rounded-full ring-1 ring-inset transition ' + (schedule.enabled? 'bg-green-50 text-green-700 ring-green-200 hover:bg-green-100':'bg-gray-50 text-gray-700 ring-gray-200 hover:bg-gray-100')}
                >
                  <Power className='h-3.5 w-3.5'/> {schedule.enabled? 'On':'Off'}
                </button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          {batches.length > 0 ? (
            <>
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
                          <Button 
                            size='sm' 
                            variant='outline' 
                            className='text-orange-700 border-orange-200 hover:bg-orange-50'
                            onClick={handleDisburseBatch}
                          >
                            Run now
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className='text-[11px] text-gray-500'>Auto releases will execute on the configured monthly schedule. Manual run is available here only for demonstration.</p>
            </>
          ) : (
            <div className='h-40 flex flex-col items-center justify-center text-center space-y-2'>
              <FileText className='h-10 w-10 text-gray-300' />
              <div>
                <p className='text-sm font-medium text-gray-600'>No batches available</p>
                <p className='text-xs text-gray-500 mt-1'>Batches will be created automatically once applications are approved for disbursement</p>
              </div>
            </div>
          )}
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
