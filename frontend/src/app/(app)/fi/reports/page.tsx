'use client'
import React, { useEffect, useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Filter, X, BarChart3, MapPin } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts'

interface KPI { label: string; value: string; sub?: string; color: string }
interface GeoRow { state: string; beneficiaries: number; amount: number }
interface TrendPoint { month: string; PCR: number; PoA: number; INC: number }
interface CategorySlice { label: string; value: number; fromClass: string }

interface MonthlyData {
  month: string
  disbursed: number
  approved: number
  pending: number
  count: number
}

interface YearlyData {
  year: string
  totalDisbursed: number
  totalApproved: number
  count: number
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
  
  // Disbursement Analytics state
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [yearlyData, setYearlyData] = useState<YearlyData[]>([])
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly')

  useEffect(()=> {
    setTimeout(()=> {
      // Only two KPIs as requested
      setKpis([
        { label:'Total Approved', value:'₹18.0Cr', sub:'Last 12 months', color:'bg-blue-500' },
        { label:'Total Disbursed', value:'₹15.0Cr', sub:'Last 12 months', color:'bg-green-500' }
      ])
      // All 28 Indian States + 8 UTs (36 total, showing states here)
      setGeo([
        { state:'Maharashtra', beneficiaries: 542, amount: 21000000 },
        { state:'Tamil Nadu', beneficiaries: 420, amount: 16500000 },
        { state:'Gujarat', beneficiaries: 305, amount: 11200000 },
        { state:'Uttar Pradesh', beneficiaries: 485, amount: 18500000 },
        { state:'Karnataka', beneficiaries: 380, amount: 14200000 },
        { state:'West Bengal', beneficiaries: 350, amount: 13100000 },
        { state:'Rajasthan', beneficiaries: 290, amount: 10800000 },
        { state:'Madhya Pradesh', beneficiaries: 275, amount: 10200000 },
        { state:'Andhra Pradesh', beneficiaries: 260, amount: 9700000 },
        { state:'Telangana', beneficiaries: 245, amount: 9100000 },
        { state:'Odisha', beneficiaries: 230, amount: 8600000 },
        { state:'Kerala', beneficiaries: 215, amount: 8000000 },
        { state:'Bihar', beneficiaries: 200, amount: 7400000 },
        { state:'Assam', beneficiaries: 185, amount: 6900000 },
        { state:'Punjab', beneficiaries: 170, amount: 6300000 },
        { state:'Haryana', beneficiaries: 155, amount: 5800000 },
        { state:'Chhattisgarh', beneficiaries: 140, amount: 5200000 },
        { state:'Jharkhand', beneficiaries: 125, amount: 4700000 },
        { state:'Uttarakhand', beneficiaries: 110, amount: 4100000 },
        { state:'Himachal Pradesh', beneficiaries: 95, amount: 3600000 },
        { state:'Goa', beneficiaries: 80, amount: 3000000 },
        { state:'Tripura', beneficiaries: 68, amount: 2500000 },
        { state:'Meghalaya', beneficiaries: 55, amount: 2100000 },
        { state:'Manipur', beneficiaries: 48, amount: 1800000 },
        { state:'Nagaland', beneficiaries: 42, amount: 1600000 },
        { state:'Arunachal Pradesh', beneficiaries: 35, amount: 1300000 },
        { state:'Mizoram', beneficiaries: 28, amount: 1100000 },
        { state:'Sikkim', beneficiaries: 22, amount: 850000 }
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
        { label:'PCR Victim', value: 25 + (seed % 35), fromClass:'from-blue-500' },
        { label:'PoA Victim', value: 20 + (seed % 30), fromClass:'from-purple-500' },
        { label:'Inter Caste Marriage Funds', value: 15 + (seed % 25), fromClass:'from-emerald-500' }
      ])

      // Generate mock monthly data for disbursement analytics
      const mockMonthly: MonthlyData[] = [
        { month: 'Jan 2024', disbursed: 1250000, approved: 450000, pending: 125000, count: 45 },
        { month: 'Feb 2024', disbursed: 1480000, approved: 520000, pending: 98000, count: 52 },
        { month: 'Mar 2024', disbursed: 1620000, approved: 380000, pending: 142000, count: 61 },
        { month: 'Apr 2024', disbursed: 1750000, approved: 620000, pending: 115000, count: 68 },
        { month: 'May 2024', disbursed: 1580000, approved: 480000, pending: 156000, count: 58 },
        { month: 'Jun 2024', disbursed: 1890000, approved: 720000, pending: 98000, count: 74 },
        { month: 'Jul 2024', disbursed: 2100000, approved: 580000, pending: 132000, count: 82 },
        { month: 'Aug 2024', disbursed: 1950000, approved: 640000, pending: 145000, count: 76 },
        { month: 'Sep 2024', disbursed: 2250000, approved: 520000, pending: 108000, count: 89 },
        { month: 'Oct 2024', disbursed: 2080000, approved: 760000, pending: 122000, count: 85 },
        { month: 'Nov 2024', disbursed: 2420000, approved: 680000, pending: 135000, count: 94 },
        { month: 'Dec 2024', disbursed: 2680000, approved: 820000, pending: 156000, count: 102 },
      ]
      setMonthlyData(mockMonthly)

      // Generate mock yearly data
      const mockYearly: YearlyData[] = [
        { year: '2021', totalDisbursed: 15200000, totalApproved: 5800000, count: 542 },
        { year: '2022', totalDisbursed: 18500000, totalApproved: 6200000, count: 658 },
        { year: '2023', totalDisbursed: 21800000, totalApproved: 6900000, count: 782 },
        { year: '2024', totalDisbursed: 23050000, totalApproved: 7180000, count: 886 },
      ]
      setYearlyData(mockYearly)
      
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
    const v1 = 15 + (rand(1) % Math.min(80, 15+spanDays))
    const v2 = 12 + (rand(2) % Math.min(65, 12+Math.floor(spanDays*0.9)))
    const v3 = 8 + (rand(3) % Math.min(50, 8+Math.floor(spanDays*0.7)))
    setCategory([
      { label:'PCR Victim', value: v1, fromClass:'from-blue-500' },
      { label:'PoA Victim', value: v2, fromClass:'from-purple-500' },
      { label:'Inter Caste Marriage Funds', value: v3, fromClass:'from-emerald-500' }
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

      {/* Disbursement Analytics Section - moved from Dashboard */}
      <Card className='shadow-lg border-0'>
        <CardHeader>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div>
              <CardTitle className='text-xl flex items-center gap-2'>
                <BarChart3 className='h-5 w-5 text-orange-600' />
                Disbursement Analytics
              </CardTitle>
              <p className='text-sm text-gray-500 mt-1'>Track disbursement trends over time</p>
            </div>
            <div className='flex items-center gap-2 flex-wrap text-xs'>
              {/* View Mode Toggle */}
              <div className='inline-flex rounded-md overflow-hidden border'>
                <button
                  onClick={() => setViewMode('monthly')}
                  className={'px-2 py-1 ' + (viewMode === 'monthly' ? 'bg-orange-600 text-white' : 'bg-white hover:bg-orange-50')}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setViewMode('yearly')}
                  className={'px-2 py-1 ' + (viewMode === 'yearly' ? 'bg-orange-600 text-white' : 'bg-white hover:bg-orange-50')}
                >
                  Yearly
                </button>
              </div>

              {/* Simple Date Inputs */}
              <label className='text-gray-600'>From</label>
              <input 
                type='date' 
                value={dateFrom} 
                onChange={e => setDateFrom(e.target.value)} 
                className='border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500'
              />
              <label className='text-gray-600'>To</label>
              <input 
                type='date' 
                value={dateTo} 
                onChange={e => setDateTo(e.target.value)} 
                className='border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500'
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          {viewMode === 'monthly' ? (
            <>
              {/* Monthly Bar Chart */}
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                    <XAxis 
                      dataKey='month' 
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      angle={-45}
                      textAnchor='end'
                      height={80}
                    />
                    <YAxis 
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
                    />
                    <Tooltip 
                      formatter={(value: number) => {
                        if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`
                        return `₹${(value / 100000).toFixed(2)}L`
                      }}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '12px'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                      iconType='circle'
                    />
                    <Bar dataKey='disbursed' name='Disbursed' fill={COLORS.disbursed} radius={[8, 8, 0, 0]} />
                    <Bar dataKey='approved' name='Approved' fill={COLORS.approved} radius={[8, 8, 0, 0]} />
                    <Bar dataKey='pending' name='Pending' fill={COLORS.pending} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Monthly Trend Area Chart */}
              <div className='h-64'>
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id='colorDisbursed' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='5%' stopColor={COLORS.disbursed} stopOpacity={0.8}/>
                        <stop offset='95%' stopColor={COLORS.disbursed} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                    <XAxis 
                      dataKey='month' 
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      angle={-45}
                      textAnchor='end'
                      height={80}
                    />
                    <YAxis 
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
                    />
                    <Tooltip 
                      formatter={(value: number) => {
                        if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`
                        return `₹${(value / 100000).toFixed(2)}L`
                      }}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '12px'
                      }}
                    />
                    <Area 
                      type='monotone' 
                      dataKey='disbursed' 
                      name='Disbursed Trend'
                      stroke={COLORS.disbursed} 
                      fillOpacity={1} 
                      fill='url(#colorDisbursed)' 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <>
              {/* Yearly Bar Chart */}
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={yearlyData}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                    <XAxis 
                      dataKey='year' 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      tickFormatter={(value) => `₹${(value / 10000000).toFixed(1)}Cr`}
                    />
                    <Tooltip 
                      formatter={(value: number) => `₹${(value / 10000000).toFixed(2)}Cr`}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '12px'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                      iconType='circle'
                    />
                    <Bar dataKey='totalDisbursed' name='Total Disbursed' fill={COLORS.disbursed} radius={[8, 8, 0, 0]} />
                    <Bar dataKey='totalApproved' name='Total Approved' fill={COLORS.approved} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Yearly Line Chart with Count */}
              <div className='h-64'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={yearlyData}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                    <XAxis 
                      dataKey='year' 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <YAxis 
                      yAxisId='left'
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      tickFormatter={(value) => `₹${(value / 10000000).toFixed(1)}Cr`}
                    />
                    <YAxis 
                      yAxisId='right'
                      orientation='right'
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        if (name === 'Application Count') return value
                        return `₹${(value / 10000000).toFixed(2)}Cr`
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
                    <Line 
                      yAxisId='left'
                      type='monotone' 
                      dataKey='totalDisbursed' 
                      name='Total Disbursed'
                      stroke={COLORS.disbursed} 
                      strokeWidth={3}
                      dot={{ fill: COLORS.disbursed, r: 5 }}
                    />
                    <Line 
                      yAxisId='right'
                      type='monotone' 
                      dataKey='count' 
                      name='Application Count'
                      stroke={COLORS.primary} 
                      strokeWidth={2}
                      strokeDasharray='5 5'
                      dot={{ fill: COLORS.primary, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Category Breakdown with Improved Charts */}
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
                <BarChart data={category.map((c, i) => ({ name: c.label, value: c.value, fill: PIE_COLORS[i] }))} barSize={50}>
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
                    {category.map((entry, index) => (
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
                      data={category.map((c, i) => ({ name: c.label, value: c.value }))}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      label={(entry: any) => `${entry.name ? entry.name.split(' ')[0] : ''} ${((entry.percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='value'
                    >
                      {category.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className='flex flex-col space-y-2 mt-4'>
                {category.map((item, idx) => {
                  const total = category.reduce((sum, c) => sum + c.value, 0)
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
          <p className='text-[11px] text-gray-500'>Category breakdown for the selected date range showing distribution across PCR and PoA schemes.</p>
        </CardContent>
      </Card>

      {/* Geographic Breakdown with Better Visualization */}
      <Card className='shadow-lg border-0'>
        <CardHeader>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div>
              <CardTitle className='text-xl flex items-center gap-2'>
                <MapPin className='h-5 w-5 text-orange-600' />
                Geographic Breakdown
              </CardTitle>
              <p className='text-sm text-gray-500 mt-1'>State-wise distribution of beneficiaries and disbursements</p>
            </div>
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
        <CardContent className='space-y-6'>
          {loading? <div className='h-40 flex items-center justify-center text-xs text-gray-500'>Loading geography...</div>:
          <>
            {/* Bar Chart for Top 10 States */}
            <div>
              <h3 className='text-sm font-semibold text-gray-700 mb-3'>Top 10 States by Disbursement</h3>
              <div className='h-96'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={filteredGeo.slice(0, 10)} layout='vertical'>
                    <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                    <XAxis 
                      type='number' 
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      tickFormatter={(value) => `₹${(value / 1000000).toFixed(1)}M`}
                    />
                    <YAxis 
                      dataKey='state' 
                      type='category' 
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      width={120}
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
                <div className='text-xs text-blue-700 font-medium'>Total States</div>
                <div className='text-2xl font-bold text-blue-900'>{filteredGeo.length}</div>
              </div>
              <div className='p-3 rounded-lg border bg-gradient-to-br from-green-50 to-green-100 border-green-200'>
                <div className='text-xs text-green-700 font-medium'>Total Beneficiaries</div>
                <div className='text-2xl font-bold text-green-900'>
                  {Intl.NumberFormat('en-IN', { notation: 'compact' }).format(filteredGeo.reduce((s,x)=> s+x.beneficiaries, 0))}
                </div>
              </div>
              <div className='p-3 rounded-lg border bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'>
                <div className='text-xs text-purple-700 font-medium'>Total Disbursed</div>
                <div className='text-2xl font-bold text-purple-900'>
                  ₹{(filteredGeo.reduce((s,x)=> s+x.amount, 0) / 10000000).toFixed(1)}Cr
                </div>
              </div>
              <div className='p-3 rounded-lg border bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'>
                <div className='text-xs text-orange-700 font-medium'>Avg per State</div>
                <div className='text-2xl font-bold text-orange-900'>
                  ₹{((filteredGeo.reduce((s,x)=> s+x.amount, 0) / filteredGeo.length) / 1000000).toFixed(1)}M
                </div>
              </div>
            </div>

            {/* Compact Table View - All States with Scrolling */}
            <div>
              <div className='flex items-center justify-between mb-3'>
                <h3 className='text-sm font-semibold text-gray-700'>All States - Detailed View</h3>
                <span className='text-xs text-gray-500'>Showing {filteredGeo.length} of {geo.length} states</span>
              </div>
              <div className='overflow-auto rounded border max-h-96 shadow-inner'>
            <table className='w-full text-xs'>
              <thead className='bg-gray-50 sticky top-0'>
                <tr className='text-gray-600'>
                  <th className='text-left px-3 py-2 font-semibold'>Rank</th>
                  <th className='text-left px-3 py-2 font-semibold'>State</th>
                  <th className='text-right px-3 py-2 font-semibold'>Beneficiaries</th>
                  <th className='text-right px-3 py-2 font-semibold'>Amount</th>
                  <th className='text-left px-3 py-2 font-semibold w-32'>Share</th>
                </tr>
              </thead>
              <tbody>
                {filteredGeo.map((g, idx)=> {
                  const total = filteredGeo.reduce((s,x)=> s+x.amount, 0)
                  const share = (g.amount/total)*100
                  return (
                    <tr key={g.state} className='border-t hover:bg-orange-50/40 cursor-pointer transition-colors' onClick={()=> setSelectedState(g)}>
                      <td className='px-3 py-2 text-gray-500 font-mono'>#{idx + 1}</td>
                      <td className='px-3 py-2 font-medium'>{g.state}</td>
                      <td className='px-3 py-2 text-right tabular-nums'>{Intl.NumberFormat('en-IN').format(g.beneficiaries)}</td>
                      <td className='px-3 py-2 text-right tabular-nums font-semibold'>
                        {g.amount >= 10000000 
                          ? `₹${(g.amount / 10000000).toFixed(2)}Cr` 
                          : `₹${(g.amount / 100000).toFixed(2)}L`
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
