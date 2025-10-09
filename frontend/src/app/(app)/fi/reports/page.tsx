'use client'
import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Filter, X } from 'lucide-react'

interface KPI { label: string; value: string; sub?: string; color: string }
interface GeoRow { state: string; beneficiaries: number; amount: number }
interface TrendPoint { month: string; PCR: number; PoA: number; INC: number }
interface CategorySlice { label: string; value: number; fromClass: string }

export default function FIReportsPage(){
  const [kpis, setKpis] = useState<KPI[]>([])
  const [geo, setGeo] = useState<GeoRow[]>([])
  const [trends, setTrends] = useState<TrendPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState<string>(() => {
    const d = new Date(Date.now() - 30*86400000)
    return d.toISOString().slice(0,10)
  })
  const [dateTo, setDateTo] = useState<string>(() => new Date().toISOString().slice(0,10))
  const [category, setCategory] = useState<CategorySlice[]>([])
  const [selectedState, setSelectedState] = useState<GeoRow | null>(null)
  const [showStateFilter, setShowStateFilter] = useState(false)
  const [selectedStates, setSelectedStates] = useState<string[]>([])

  useEffect(()=> {
    setTimeout(()=> {
      // Only two KPIs as requested
      setKpis([
        { label:'Total Approved', value:'₹18.0Cr', sub:'Last 12 months', color:'bg-blue-500' },
        { label:'Total Disbursed', value:'₹15.0Cr', sub:'Last 12 months', color:'bg-green-500' }
      ])
      setGeo([
        { state:'Maharashtra', beneficiaries: 542, amount: 21000000 },
        { state:'Tamil Nadu', beneficiaries: 420, amount: 16500000 },
        { state:'Gujarat', beneficiaries: 305, amount: 11200000 },
        { state:'Odisha', beneficiaries: 255, amount: 9800000 },
        { state:'Rajasthan', beneficiaries: 190, amount: 7500000 }
      ])
      setTrends([
        { month:'Apr', PCR:40, PoA:35, INC:15 },
        { month:'May', PCR:42, PoA:33, INC:16 },
        { month:'Jun', PCR:44, PoA:32, INC:17 },
        { month:'Jul', PCR:46, PoA:31, INC:18 },
        { month:'Aug', PCR:47, PoA:30, INC:19 }
      ])
      // Initialize category breakdown (moved from dashboard)
      const seed = (new Date(dateFrom).getTime() + new Date(dateTo).getTime()) % 97
      setCategory([
        { label:'PCR Victim', value: 20 + (seed % 30), fromClass:'from-blue-500' },
        { label:'PoA Victim', value: 15 + (seed % 25), fromClass:'from-purple-500' },
        { label:'PCR Incentive', value: 10 + (seed % 20), fromClass:'from-emerald-500' },
        { label:'PoA Incentive', value: 8 + (seed % 18), fromClass:'from-orange-500' }
      ])
      setLoading(false)
    }, 400)
  },[])

  // Recompute category and geo when date range changes (mock)
  useEffect(()=> {
    if(!dateFrom || !dateTo) return
    const fromTs = new Date(dateFrom).getTime()
    const toTs = new Date(dateTo).getTime()
    if(Number.isNaN(fromTs) || Number.isNaN(toTs) || fromTs>toTs) return
    const spanDays = Math.max(1, Math.round((toTs - fromTs)/86400000)+1)
    const base = (fromTs % 503) ^ (toTs % 719)
    const rand = (n:number)=> (base * 9301 + 49297 + n*233) % 233280
    // Category recompute
    const v1 = 10 + (rand(1) % Math.min(70, 10+spanDays))
    const v2 = 8 + (rand(2) % Math.min(60, 8+Math.floor(spanDays*0.9)))
    const v3 = 5 + (rand(3) % Math.min(40, 5+Math.floor(spanDays*0.7)))
    const v4 = 4 + (rand(4) % Math.min(35, 4+Math.floor(spanDays*0.6)))
    setCategory([
      { label:'PCR Victim', value: v1, fromClass:'from-blue-500' },
      { label:'PoA Victim', value: v2, fromClass:'from-purple-500' },
      { label:'PCR Incentive', value: v3, fromClass:'from-emerald-500' },
      { label:'PoA Incentive', value: v4, fromClass:'from-orange-500' }
    ])
    // Geo recompute (mock scale)
    setGeo(g=> g.map((row,i)=> ({
      ...row,
      beneficiaries: Math.max(1, Math.round(row.beneficiaries * (0.9 + ((rand(i+10)%21)/100)))) ,
      amount: Math.max(1, Math.round(row.amount * (0.9 + ((rand(i+20)%21)/100))))
    })))
  }, [dateFrom, dateTo])

  // Initialize the state selection once geo is loaded (select all by default)
  useEffect(()=> {
    if(geo.length && selectedStates.length===0){
      setSelectedStates(geo.map(g=> g.state))
    }
  }, [geo])

  const filteredGeo = React.useMemo(()=> {
    if(!selectedStates.length) return geo
    const set = new Set(selectedStates)
    return geo.filter(g=> set.has(g.state))
  }, [geo, selectedStates])

  function toggleStateName(name: string){
    setSelectedStates(prev => prev.includes(name)? prev.filter(s=> s!==name): [...prev, name])
  }
  function selectAllStates(){ setSelectedStates(geo.map(g=> g.state)) }
  function clearAllStates(){ setSelectedStates([]) }

  return (
    <div className='space-y-8'>
      <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold'>Reports & Analytics</h1>
          <p className='text-sm text-gray-600'>Generate compliance & performance reports.</p>
        </div>
        <div className='flex gap-2'>
          <Button className='bg-orange-600 hover:bg-orange-700'><Download className='h-4 w-4 mr-2' />Export All</Button>
          <Button variant='outline'><Filter className='h-4 w-4 mr-2' />Filters</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>Summary KPIs</CardTitle>
            <div className='flex items-center gap-2 text-xs'>
              <label className='text-gray-600'>From</label>
              <input type='date' value={dateFrom} onChange={e=> setDateFrom(e.target.value)} className='border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500'/>
              <label className='text-gray-600'>To</label>
              <input type='date' value={dateTo} onChange={e=> setDateTo(e.target.value)} className='border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500'/>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading? <div className='h-32 flex items-center justify-center text-xs text-gray-500'>Loading KPIs...</div>:
          <div className='grid sm:grid-cols-2 gap-4'>
            {kpis.map(k=> (
              <div key={k.label} className='p-4 rounded-lg border bg-white shadow-sm flex flex-col gap-1'>
                <span className='text-xs font-medium text-gray-600'>{k.label}</span>
                <span className='text-xl font-semibold'>{k.value}</span>
                <span className='text-[11px] text-gray-500'>{k.sub}</span>
                <div className='h-1.5 rounded-full mt-1 bg-gray-100 overflow-hidden'>
                  <div className={k.color+' h-full w-3/4'} />
                </div>
              </div>
            ))}
          </div>}
        </CardContent>
      </Card>

      {/* Category Breakdown moved from Dashboard */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between gap-3 flex-wrap'>
            <CardTitle>Category Breakdown</CardTitle>
            <div className='flex items-center gap-2 text-xs'>
              <label className='text-gray-600'>From</label>
              <input type='date' value={dateFrom} onChange={e=> setDateFrom(e.target.value)} className='border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500'/>
              <label className='text-gray-600'>To</label>
              <input type='date' value={dateTo} onChange={e=> setDateTo(e.target.value)} className='border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500'/>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <BarChart data={category} />
          <p className='text-[11px] text-gray-500'>Counts by category for the selected date range (mock data).</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>Geographic Breakdown</CardTitle>
            <div className='relative flex items-center gap-2 text-xs'>
              <label className='text-gray-600'>From</label>
              <input type='date' value={dateFrom} onChange={e=> setDateFrom(e.target.value)} className='border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500'/>
              <label className='text-gray-600'>To</label>
              <input type='date' value={dateTo} onChange={e=> setDateTo(e.target.value)} className='border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500'/>
              <button onClick={()=> setShowStateFilter(s=> !s)} className='ml-2 inline-flex items-center gap-1 px-2 py-1 rounded border hover:bg-gray-50'>
                States
                <span className='text-[10px] text-gray-500'>({selectedStates.length || geo.length})</span>
              </button>
              {showStateFilter && (
                <div className='absolute right-0 top-8 z-20 w-64 rounded-md border bg-white shadow-lg p-3'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-xs font-semibold text-gray-700'>Include States</span>
                    <div className='flex gap-2'>
                      <button onClick={selectAllStates} className='text-[11px] text-orange-700 hover:underline'>Select all</button>
                      <button onClick={clearAllStates} className='text-[11px] text-gray-600 hover:underline'>Clear</button>
                    </div>
                  </div>
                  <div className='max-h-64 overflow-auto pr-1'>
                    {geo.map(g=> (
                      <label key={g.state} className='flex items-center gap-2 text-xs py-1'>
                        <input type='checkbox' checked={selectedStates.includes(g.state)} onChange={()=> toggleStateName(g.state)} />
                        <span>{g.state}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading? <div className='h-40 flex items-center justify-center text-xs text-gray-500'>Loading geography...</div>:
          <div className='overflow-auto rounded border'>
            <table className='w-full text-xs'>
              <thead className='bg-gray-50'>
                <tr className='text-gray-600'>
                  <th className='text-left px-3 py-2 font-semibold'>State</th>
                  <th className='text-left px-3 py-2 font-semibold'>Beneficiaries</th>
                  <th className='text-left px-3 py-2 font-semibold'>Amount (INR)</th>
                  <th className='text-left px-3 py-2 font-semibold'>Share</th>
                </tr>
              </thead>
              <tbody>
                {filteredGeo.map(g=> {
                  const total = filteredGeo.reduce((s,x)=> s+x.amount, 0)
                  const share = (g.amount/total)*100
                  return (
                    <tr key={g.state} className='border-t hover:bg-orange-50/40 cursor-pointer' onClick={()=> setSelectedState(g)}>
                      <td className='px-3 py-2'>{g.state}</td>
                      <td className='px-3 py-2'>{g.beneficiaries}</td>
                      <td className='px-3 py-2'>{Intl.NumberFormat('en-IN').format(g.amount)}</td>
                      <td className='px-3 py-2 w-48'>
                        <div className='h-2 bg-gray-100 rounded overflow-hidden'>
                          <div className='h-full bg-gradient-to-r from-orange-500 to-green-500' style={{width: share+'%'}} />
                        </div>
                        <span className='text-[10px] text-gray-500'>{share.toFixed(1)}%</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>Scheme Category Trends</CardTitle>
            <div className='flex items-center gap-2 text-xs'>
              <label className='text-gray-600'>From</label>
              <input type='date' value={dateFrom} onChange={e=> setDateFrom(e.target.value)} className='border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500'/>
              <label className='text-gray-600'>To</label>
              <input type='date' value={dateTo} onChange={e=> setDateTo(e.target.value)} className='border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500'/>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading? <div className='h-40 flex items-center justify-center text-xs text-gray-500'>Loading trends...</div>:
          <div className='space-y-4'>
            {trends.map(t=> (
              <div key={t.month} className='space-y-1'>
                <div className='flex items-center justify-between text-[11px] text-gray-600'><span>{t.month}</span><span>{t.PCR + t.PoA + t.INC}</span></div>
                <div className='h-5 flex rounded overflow-hidden ring-1 ring-gray-200'>
                  <div className='bg-blue-500 h-full' style={{width: t.PCR+'%'}} title={'PCR '+t.PCR+'%'} />
                  <div className='bg-purple-500 h-full' style={{width: t.PoA+'%'}} title={'PoA '+t.PoA+'%'} />
                  <div className='bg-emerald-500 h-full' style={{width: t.INC+'%'}} title={'Incentive '+t.INC+'%'} />
                </div>
              </div>
            ))}
            <p className='text-[10px] text-gray-500'>Stacked proportional bars represent distribution per month (mock percentages).</p>
          </div>}
        </CardContent>
      </Card>

      {/* State detail modal */}
      {selectedState && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4'>
          <div className='w-full max-w-2xl rounded-xl bg-white shadow-lg border p-6 space-y-5'>
            <div className='flex items-center justify-between'>
              <h2 className='text-lg font-semibold'>{selectedState.state}: Detailed Statistics</h2>
              <button aria-label='Close' onClick={()=> setSelectedState(null)} className='p-1 rounded hover:bg-gray-100'><X className='h-4 w-4'/></button>
            </div>
            <div className='grid sm:grid-cols-2 gap-4 text-sm'>
              <div className='p-3 rounded border bg-gray-50'>
                <div className='text-xs text-gray-600'>Beneficiaries</div>
                <div className='text-lg font-semibold'>{selectedState.beneficiaries}</div>
              </div>
              <div className='p-3 rounded border bg-gray-50'>
                <div className='text-xs text-gray-600'>Total Amount</div>
                <div className='text-lg font-semibold'>{Intl.NumberFormat('en-IN',{ style:'currency', currency:'INR'}).format(selectedState.amount)}</div>
              </div>
              <div className='p-3 rounded border bg-gray-50 sm:col-span-2'>
                <div className='text-xs text-gray-600 mb-2'>Monthly Disbursements</div>
                <div className='flex gap-2 items-end h-36'>
                  {Array.from({length:6}).map((_,i)=> {
                    const v = (selectedState.beneficiaries % 50) + i*5
                    return (
                      <div key={i} className='w-8 h-full bg-white border rounded shadow-sm flex items-end justify-center'>
                        <div className='w-full bg-gradient-to-t from-orange-500 to-green-400 rounded-b' style={{height: Math.min(100, 20+v)+'%'}} />
                      </div>
                    )
                  })}
                </div>
                <div className='flex justify-between text-[10px] text-gray-600 mt-1'>
                  {['Apr','May','Jun','Jul','Aug','Sep'].map(m=> <span key={m}>{m}</span>)}
                </div>
              </div>
            </div>
            <div className='flex justify-end'>
              <Button variant='outline' onClick={()=> setSelectedState(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function BarChart({ data }: { data: { label: string; value: number; fromClass: string }[] }){
  const max = Math.max(1, ...data.map(d=> d.value))
  return (
    <div className='w-full overflow-x-auto'>
      <div className='flex items-end gap-6 px-4 relative' style={{height: 240}}>
        <div className='absolute left-0 right-0 top-0 bottom-8 pointer-events-none'>
          {Array.from({length:4}).map((_,i)=>{
            const y = (i+1)/4
            return (
              <div key={i} className='absolute left-0 right-0 border-t border-dashed border-gray-200' style={{bottom: `${y*100}%`}} />
            )
          })}
        </div>
        {data.map(d=> {
          const pct = (d.value/max)*100
          const grad = `${d.fromClass} to-orange-300`
          return (
            <div key={d.label} className='group flex flex-col items-center gap-2 min-w-[68px]'>
              <div className='w-10 sm:w-12 bg-white rounded-lg border border-gray-200 shadow-sm relative overflow-visible flex items-end justify-center' style={{height: 200}}>
                <div className={`w-full rounded-b-lg bg-gradient-to-t ${grad} transition-all duration-500`} style={{height: `${pct}%`}} />
                <div className='absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-gray-900 text-white px-2 py-1 rounded shadow pointer-events-none'>
                  {d.label}: {d.value}
                </div>
              </div>
              <div className='text-center'>
                <div className='text-[11px] font-semibold tabular-nums'>{d.value}</div>
                <div className='text-[10px] text-gray-600 whitespace-pre-line leading-tight'>{d.label}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
