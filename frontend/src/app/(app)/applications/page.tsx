'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FileText, Filter, Search, Download } from 'lucide-react'
import { SkeletonLines } from '@/components/ui/skeleton'

interface ApplicationRow { id:string; applicationNumber:string; title:string; status:string; amountRequested:number; amountApproved?:number; updatedAt:string }
const PAGE_SIZE=10

export default function ApplicationsListPage(){
  const [apps,setApps]=useState<ApplicationRow[]>([])
  const [page,setPage]=useState(1)
  const [total,setTotal]=useState(0)
  const [search,setSearch]=useState('')
  const [statusFilters,setStatusFilters]=useState<string[]>([])
  const [actFilter,setActFilter]=useState('ALL')
  const [isLoading,setIsLoading]=useState(true)

  useEffect(()=>{ fetchData() },[page,search,statusFilters,actFilter])
  function mockFetch():{data:ApplicationRow[]; total:number}{
    const base:Array<ApplicationRow>=Array.from({length:22}).map((_,i)=>({ id:String(i+1), applicationNumber:`APP-2024-${String(i+1).padStart(3,'0')}`, title:i%2===0?'PCR Act Compensation Application':'PoA Act Legal Aid Application', status:['DRAFT','SUBMITTED','UNDER_REVIEW','APPROVED','REJECTED','DISBURSED'][i%6], amountRequested:10000+i*500, amountApproved:i%3===0?8000+i*400:undefined, updatedAt:new Date(Date.now()-i*86400000).toISOString() }))
    let filtered=base
    if(actFilter!=='ALL') filtered=filtered.filter(a=> a.title.toUpperCase().includes(actFilter))
    if(statusFilters.length) filtered=filtered.filter(a=> statusFilters.includes(a.status))
    if(search) filtered=filtered.filter(a=> a.applicationNumber.includes(search) || a.title.toLowerCase().includes(search.toLowerCase()))
    const start=(page-1)*PAGE_SIZE
    return { data: filtered.slice(start,start+PAGE_SIZE), total: filtered.length }
  }
  function fetchData(){ setIsLoading(true); const res=mockFetch(); setApps(res.data); setTotal(res.total); setIsLoading(false) }
  const totalPages=Math.max(1,Math.ceil(total/PAGE_SIZE))

  return (
    <div className='space-y-8'>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl font-semibold tracking-tight'>Applications</h1>
        <div className='flex gap-2'>
          <Button variant='outline' size='sm'><Download className='h-4 w-4 mr-1' />Export</Button>
          <Link href='/applications/new'><Button className='bg-orange-600 hover:bg-orange-700'>New</Button></Link>
        </div>
      </div>
      <Card className='border-gray-200'>
        <CardContent className='pt-6 flex flex-wrap gap-3 items-center text-sm'>
          <div className='flex items-center gap-2'><Filter className='h-4 w-4 text-gray-500' />
            <select value={actFilter} onChange={e=>{ setPage(1); setActFilter(e.target.value)}} className='border rounded px-2 py-1 text-sm'>
              <option value='ALL'>All Acts</option>
              <option value='PCR'>PCR Act</option>
              <option value='POA'>PoA Act</option>
              <option value='INCENTIVE'>Incentive</option>
            </select>
          </div>
          <div className='flex items-center gap-1'>
            {['DRAFT','SUBMITTED','UNDER_REVIEW','APPROVED','REJECTED','DISBURSED'].map(st=>{ const active=statusFilters.includes(st); return <button key={st} onClick={()=> setStatusFilters(prev=> prev.includes(st)? prev.filter(p=>p!==st):[...prev,st])} className={`px-2 py-0.5 rounded-full border text-xs ${active?'bg-orange-600 text-white border-orange-600':'bg-white hover:bg-gray-100'}`} aria-pressed={active}>{st.replace('_',' ')}</button> })}
          </div>
          <div className='relative ml-auto'>
            <Search className='h-4 w-4 absolute left-2 top-1.5 text-gray-400' />
            <input value={search} onChange={e=>{ setPage(1); setSearch(e.target.value)}} placeholder='Search ID or title' className='pl-8 pr-2 py-1 border rounded text-sm w-64' />
          </div>
        </CardContent>
      </Card>
      <Card className='border-gray-200'>
        <CardHeader><CardTitle className='text-xs uppercase tracking-wide text-gray-500'>Results</CardTitle></CardHeader>
        <CardContent>
          {isLoading && <div className='py-6 space-y-4'>{Array.from({length:5}).map((_,i)=><div key={i} className='border-b pb-4 last:border-b-0'><SkeletonLines lines={3} /></div>)}</div>}
          {!isLoading && apps.length===0 && <div className='py-12 text-center text-gray-500 flex flex-col items-center gap-3'><FileText className='h-10 w-10 text-gray-300' />No applications.<Link href='/applications/new' className='text-orange-600 text-sm underline'>Create one</Link></div>}
          <div className='divide-y'>
            {apps.map(a=> (
              <Link key={a.id} href={`/applications/${a.id}`} className='block focus:outline-none focus:ring-2 focus:ring-orange-500'>
                <div className='flex items-start justify-between py-4 gap-6'>
                  <div className='space-y-1'>
                    <p className='font-medium leading-tight'>{a.title}</p>
                    <p className='text-xs text-gray-500'>{a.applicationNumber}</p>
                    <p className='text-xs text-gray-600'>Requested: ₹{a.amountRequested.toLocaleString()} {a.amountApproved!==undefined && <span className='text-green-600 ml-2'>Approved: ₹{a.amountApproved.toLocaleString()}</span>}</p>
                    <p className='text-[11px] text-gray-400'>Updated: {new Date(a.updatedAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`status-badge status-${a.status.toLowerCase().replace(/_/g,'-')}`}>{a.status.replace('_',' ')}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className='flex items-center justify-between mt-6 text-sm'>
            <span>Page {page} / {totalPages} ({total} total)</span>
            <div className='flex gap-2'>
              <Button variant='outline' size='sm' disabled={page===1} onClick={()=> setPage(p=> p-1)}>Prev</Button>
              <Button variant='outline' size='sm' disabled={page===totalPages} onClick={()=> setPage(p=> p+1)}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
