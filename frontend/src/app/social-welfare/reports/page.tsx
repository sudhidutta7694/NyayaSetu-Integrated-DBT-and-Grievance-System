'use client'
import React, { useEffect, useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Filter, X, BarChart3, MapPin } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

// West Bengal districts
const WB_DISTRICTS = [
  'Alipurduar', 'Bankura', 'Birbhum', 'Cooch Behar', 
  'Dakshin Dinajpur', 'Darjeeling', 'Hooghly', 'Howrah',
  'Jalpaiguri', 'Jhargram', 'Kalimpong', 'Kolkata',
  'Malda', 'Murshidabad', 'Nadia', 'North 24 Parganas',
  'Paschim Bardhaman', 'Paschim Medinipur', 'Purba Bardhaman', 'Purba Medinipur',
  'Purulia', 'South 24 Parganas', 'Uttar Dinajpur'
]

interface DistrictRow { 
  district: string
  beneficiaries: number
  amount: number 
}

interface CategorySlice { 
  label: string
  value: number
  fromClass: string 
}

const COLORS = {
  disbursed: '#10b981',
  approved: '#3b82f6',
  pending: '#f59e0b',
  primary: '#6366f1',
  category1: '#3b82f6',
  category2: '#8b5cf6',
  category3: '#10b981',
  category4: '#f59e0b'
}

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b']

export default function SocialWelfareReportsPage(){
  const [districtData, setDistrictData] = useState<DistrictRow[]>([])
  const [categoryData, setCategoryData] = useState<CategorySlice[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState<string>(() => {
    const d = new Date(Date.now() - 30*86400000)
    return d.toISOString().slice(0,10)
  })
  const [dateTo, setDateTo] = useState<string>(() => new Date().toISOString().slice(0,10))
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictRow | null>(null)
  const [showDistrictFilter, setShowDistrictFilter] = useState(false)
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([])

  useEffect(()=> {
    setTimeout(()=> {
      // Generate mock data for all 23 West Bengal districts
      const mockDistrictData: DistrictRow[] = WB_DISTRICTS.map((district, idx) => {
        // Generate varied amounts based on district index
        const baseBeneficiaries = 50 + (idx * 15) + Math.floor(Math.random() * 100)
        const baseAmount = baseBeneficiaries * (12000 + Math.floor(Math.random() * 38000))
        
        return {
          district,
          beneficiaries: baseBeneficiaries,
          amount: baseAmount
        }
      }).sort((a, b) => b.amount - a.amount) // Sort by amount descending

      setDistrictData(mockDistrictData)

      // Category breakdown for PCR, PoA, and Inter-caste marriage
      const seed = (new Date(dateFrom).getTime() + new Date(dateTo).getTime()) % 97
      setCategoryData([
        { label:'PCR Victim', value: 35 + (seed % 45), fromClass:'from-blue-500' },
        { label:'PoA Victim', value: 28 + (seed % 35), fromClass:'from-purple-500' },
        { label:'Inter Caste Marriage Funds', value: 20 + (seed % 30), fromClass:'from-emerald-500' }
      ])
      
      setLoading(false)
    }, 400)
  },[])

  // Initialize district selection (select all by default)
  useEffect(()=> {
    if(districtData.length && selectedDistricts.length===0){
      setSelectedDistricts(districtData.map(d=> d.district))
    }
  }, [districtData])

  // Recompute category and districts when date range changes
  useEffect(()=> {
    if(!dateFrom || !dateTo) return
    const fromTs = new Date(dateFrom).getTime()
    const toTs = new Date(dateTo).getTime()
    if(Number.isNaN(fromTs) || Number.isNaN(toTs) || fromTs>toTs) return
    const spanDays = Math.max(1, Math.round((toTs - fromTs)/86400000)+1)
    const base = (fromTs % 503) ^ (toTs % 719)
    const rand = (n:number)=> (base * 9301 + 49297 + n*233) % 233280
    
    // Category recompute
    const v1 = 25 + (rand(1) % Math.min(90, 25+spanDays))
    const v2 = 18 + (rand(2) % Math.min(70, 18+Math.floor(spanDays*0.9)))
    const v3 = 12 + (rand(3) % Math.min(55, 12+Math.floor(spanDays*0.7)))
    setCategoryData([
      { label:'PCR Victim', value: v1, fromClass:'from-blue-500' },
      { label:'PoA Victim', value: v2, fromClass:'from-purple-500' },
      { label:'Inter Caste Marriage Funds', value: v3, fromClass:'from-emerald-500' }
    ])
    
    // District recompute
    setDistrictData(d=> d.map((row,i)=> ({
      ...row,
      beneficiaries: Math.max(1, Math.round(row.beneficiaries * (0.9 + ((rand(i+10)%21)/100)))) ,
      amount: Math.max(1, Math.round(row.amount * (0.9 + ((rand(i+20)%21)/100))))
    })))
  }, [dateFrom, dateTo])

  const filteredDistricts = useMemo(()=> {
    if(!selectedDistricts.length) return districtData
    const set = new Set(selectedDistricts)
    return districtData.filter(d=> set.has(d.district))
  }, [districtData, selectedDistricts])

  function toggleDistrictName(name: string){
    setSelectedDistricts(prev => prev.includes(name)? prev.filter(d=> d!==name): [...prev, name])
  }
  function selectAllDistricts(){ setSelectedDistricts(districtData.map(d=> d.district)) }
  function clearAllDistricts(){ setSelectedDistricts([]) }

  return (
    <div className='min-h-screen bg-gray-50'>
      <main className='max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
        <div className='space-y-8'>
          <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4'>
            <div>
              <h1 className='text-2xl font-bold'>Reports & Analytics</h1>
              <p className='text-sm text-gray-600'>Track disbursement and application trends across West Bengal</p>
            </div>
            <div className='flex gap-2'>
              <Button className='bg-orange-600 hover:bg-orange-700'><Download className='h-4 w-4 mr-2' />Export All</Button>
              <Button variant='outline'><Filter className='h-4 w-4 mr-2' />Filters</Button>
            </div>
          </div>

          {/* Category Breakdown */}
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
            <CardContent className='space-y-6'>
              <div className='grid md:grid-cols-2 gap-6'>
                {/* Bar Chart */}
                <div className='h-80'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart data={categoryData.map((c, i) => ({ name: c.label, value: c.value, fill: PIE_COLORS[i] }))} barSize={50}>
                      <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                      <XAxis 
                        dataKey='name' 
                        tick={{ fill: '#6b7280', fontSize: 11 }}
                        angle={-15}
                        textAnchor='end'
                        height={80}
                      />
                      <YAxis 
                        tick={{ fill: '#6b7280', fontSize: 11 }}
                        label={{ value: 'Count', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6b7280' } }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          fontSize: '12px'
                        }}
                      />
                      <Bar 
                        dataKey='value' 
                        name='Applications'
                        radius={[8, 8, 0, 0]}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie Chart and Legend */}
                <div className='h-80 flex flex-col'>
                  <div className='flex-1'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <PieChart>
                        <Pie
                          data={categoryData.map((c, i) => ({ name: c.label, value: c.value }))}
                          cx='50%'
                          cy='50%'
                          labelLine={false}
                          label={(entry: any) => `${entry.name ? entry.name.split(' ')[0] : ''} ${((entry.percent || 0) * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill='#8884d8'
                          dataKey='value'
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className='flex flex-col space-y-2 mt-4'>
                    {categoryData.map((item, idx) => {
                      const total = categoryData.reduce((sum, c) => sum + c.value, 0)
                      const percentage = ((item.value / total) * 100).toFixed(1)
                      return (
                        <div key={idx} className='flex items-center justify-between p-2 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors'>
                          <div className='flex items-center gap-2'>
                            <div className='w-3 h-3 rounded-full' style={{ backgroundColor: PIE_COLORS[idx] }} />
                            <span className='text-xs font-medium text-gray-700'>{item.label}</span>
                          </div>
                          <div className='text-right'>
                            <span className='text-sm font-semibold text-gray-900 mr-2'>{item.value}</span>
                            <span className='text-xs text-gray-500'>{percentage}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
              <p className='text-[11px] text-gray-500'>Category breakdown for the selected date range showing distribution across PCR, PoA, and Inter-caste Marriage schemes.</p>
            </CardContent>
          </Card>

          {/* District Breakdown for West Bengal */}
          <Card className='shadow-lg border-0'>
            <CardHeader>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                <div>
                  <CardTitle className='text-xl flex items-center gap-2'>
                    <MapPin className='h-5 w-5 text-orange-600' />
                    District Breakdown - West Bengal
                  </CardTitle>
                  <p className='text-sm text-gray-500 mt-1'>District-wise distribution of beneficiaries and disbursements</p>
                </div>
                <div className='relative flex items-center gap-2 text-xs'>
                  <label className='text-gray-600'>From</label>
                  <input type='date' value={dateFrom} onChange={e=> setDateFrom(e.target.value)} className='border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500'/>
                  <label className='text-gray-600'>To</label>
                  <input type='date' value={dateTo} onChange={e=> setDateTo(e.target.value)} className='border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500'/>
                  <button onClick={()=> setShowDistrictFilter(s=> !s)} className='ml-2 inline-flex items-center gap-1 px-2 py-1 rounded border hover:bg-gray-50'>
                    Districts
                    <span className='text-[10px] text-gray-500'>({selectedDistricts.length || districtData.length})</span>
                  </button>
                  {showDistrictFilter && (
                    <div className='absolute right-0 top-8 z-20 w-64 rounded-md border bg-white shadow-lg p-3'>
                      <div className='flex items-center justify-between mb-2'>
                        <span className='text-xs font-semibold text-gray-700'>Include Districts</span>
                        <div className='flex gap-2'>
                          <button onClick={selectAllDistricts} className='text-[11px] text-orange-700 hover:underline'>Select all</button>
                          <button onClick={clearAllDistricts} className='text-[11px] text-gray-600 hover:underline'>Clear</button>
                        </div>
                      </div>
                      <div className='max-h-64 overflow-auto pr-1'>
                        {districtData.map(d=> (
                          <label key={d.district} className='flex items-center gap-2 text-xs py-1'>
                            <input type='checkbox' checked={selectedDistricts.includes(d.district)} onChange={()=> toggleDistrictName(d.district)} />
                            <span>{d.district}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-6'>
              {loading? <div className='h-40 flex items-center justify-center text-xs text-gray-500'>Loading district data...</div>:
              <>
                {/* Bar Chart for Top 10 Districts */}
                <div>
                  <h3 className='text-sm font-semibold text-gray-700 mb-3'>Top 10 Districts by Disbursement</h3>
                  <div className='h-96'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <BarChart data={filteredDistricts.slice(0, 10)} layout='vertical'>
                        <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                        <XAxis 
                          type='number' 
                          tick={{ fill: '#6b7280', fontSize: 11 }}
                          tickFormatter={(value) => `₹${(value / 1000000).toFixed(1)}M`}
                        />
                        <YAxis 
                          dataKey='district' 
                          type='category' 
                          tick={{ fill: '#6b7280', fontSize: 11 }}
                          width={150}
                        />
                        <Tooltip 
                          formatter={(value: number, name: string) => {
                            if (name === 'Beneficiaries') return value
                            if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`
                            return `₹${(value / 1000000).toFixed(2)}M`
                          }}
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            fontSize: '12px'
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Bar dataKey='amount' name='Disbursement Amount' fill={COLORS.primary} radius={[0, 8, 8, 0]} />
                        <Bar dataKey='beneficiaries' name='Beneficiaries' fill={COLORS.disbursed} radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Summary Stats */}
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  <div className='p-3 rounded-lg border bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'>
                    <div className='text-xs text-blue-700 font-medium'>Total Districts</div>
                    <div className='text-2xl font-bold text-blue-900'>{filteredDistricts.length}</div>
                  </div>
                  <div className='p-3 rounded-lg border bg-gradient-to-br from-green-50 to-green-100 border-green-200'>
                    <div className='text-xs text-green-700 font-medium'>Total Beneficiaries</div>
                    <div className='text-2xl font-bold text-green-900'>
                      {Intl.NumberFormat('en-IN', { notation: 'compact' }).format(filteredDistricts.reduce((s,x)=> s+x.beneficiaries, 0))}
                    </div>
                  </div>
                  <div className='p-3 rounded-lg border bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'>
                    <div className='text-xs text-purple-700 font-medium'>Total Disbursed</div>
                    <div className='text-2xl font-bold text-purple-900'>
                      ₹{(filteredDistricts.reduce((s,x)=> s+x.amount, 0) / 10000000).toFixed(1)}Cr
                    </div>
                  </div>
                  <div className='p-3 rounded-lg border bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'>
                    <div className='text-xs text-orange-700 font-medium'>Avg per District</div>
                    <div className='text-2xl font-bold text-orange-900'>
                      ₹{((filteredDistricts.reduce((s,x)=> s+x.amount, 0) / filteredDistricts.length) / 1000000).toFixed(1)}M
                    </div>
                  </div>
                </div>

                {/* Detailed Table View - All Districts */}
                <div>
                  <div className='flex items-center justify-between mb-3'>
                    <h3 className='text-sm font-semibold text-gray-700'>All Districts - Detailed View</h3>
                    <span className='text-xs text-gray-500'>Showing {filteredDistricts.length} of {districtData.length} districts</span>
                  </div>
                  <div className='overflow-auto rounded border max-h-96 shadow-inner'>
                    <table className='w-full text-xs'>
                      <thead className='bg-gray-50 sticky top-0'>
                        <tr className='text-gray-600'>
                          <th className='text-left px-3 py-2 font-semibold'>Rank</th>
                          <th className='text-left px-3 py-2 font-semibold'>District</th>
                          <th className='text-right px-3 py-2 font-semibold'>Beneficiaries</th>
                          <th className='text-right px-3 py-2 font-semibold'>Amount</th>
                          <th className='text-left px-3 py-2 font-semibold w-32'>Share</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDistricts.map((d, idx)=> {
                          const total = filteredDistricts.reduce((s,x)=> s+x.amount, 0)
                          const share = (d.amount/total)*100
                          return (
                            <tr key={d.district} className='border-t hover:bg-orange-50/40 cursor-pointer transition-colors' onClick={()=> setSelectedDistrict(d)}>
                              <td className='px-3 py-2 text-gray-500 font-mono'>#{idx + 1}</td>
                              <td className='px-3 py-2 font-medium'>{d.district}</td>
                              <td className='px-3 py-2 text-right tabular-nums'>{Intl.NumberFormat('en-IN').format(d.beneficiaries)}</td>
                              <td className='px-3 py-2 text-right tabular-nums font-semibold'>
                                {d.amount >= 10000000 
                                  ? `₹${(d.amount / 10000000).toFixed(2)}Cr` 
                                  : `₹${(d.amount / 100000).toFixed(2)}L`
                                }
                              </td>
                              <td className='px-3 py-2'>
                                <div className='flex items-center gap-2'>
                                  <div className='flex-1 h-2 bg-gray-100 rounded overflow-hidden'>
                                    <div className='h-full bg-gradient-to-r from-orange-500 to-green-500' style={{width: Math.max(2, share)+'%'}} />
                                  </div>
                                  <span className='text-[10px] text-gray-600 font-medium w-10 text-right'>{share.toFixed(1)}%</span>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
              }
            </CardContent>
          </Card>

          {/* District detail modal */}
          {selectedDistrict && (
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4'>
              <div className='w-full max-w-2xl rounded-xl bg-white shadow-lg border p-6 space-y-5'>
                <div className='flex items-center justify-between'>
                  <h2 className='text-lg font-semibold'>{selectedDistrict.district}: Detailed Statistics</h2>
                  <button aria-label='Close' onClick={()=> setSelectedDistrict(null)} className='p-1 rounded hover:bg-gray-100'><X className='h-4 w-4'/></button>
                </div>
                <div className='grid sm:grid-cols-2 gap-4 text-sm'>
                  <div className='p-3 rounded border bg-gray-50'>
                    <div className='text-xs text-gray-600'>Beneficiaries</div>
                    <div className='text-lg font-semibold'>{selectedDistrict.beneficiaries}</div>
                  </div>
                  <div className='p-3 rounded border bg-gray-50'>
                    <div className='text-xs text-gray-600'>Total Amount</div>
                    <div className='text-lg font-semibold'>{Intl.NumberFormat('en-IN',{ style:'currency', currency:'INR'}).format(selectedDistrict.amount)}</div>
                  </div>
                  <div className='p-3 rounded border bg-gray-50 sm:col-span-2'>
                    <div className='text-xs text-gray-600 mb-2'>Monthly Disbursements</div>
                    <div className='flex gap-2 items-end h-36'>
                      {Array.from({length:6}).map((_,i)=> {
                        const v = (selectedDistrict.beneficiaries % 50) + i*5
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
                  <Button variant='outline' onClick={()=> setSelectedDistrict(null)}>Close</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
