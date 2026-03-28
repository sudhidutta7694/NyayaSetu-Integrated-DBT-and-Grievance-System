"use client"
import React, { useMemo, useState } from 'react'
import { Megaphone } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Announcement { id:string; title:string; body:string; act:string; date:string }
export default function AnnouncementsClient({ announcements }: { announcements: Announcement[] }) {
  const [actFilter,setActFilter]=useState<string>('ALL')
  const [page,setPage]=useState(1)
  const PAGE_SIZE=6
  const filtered=useMemo(()=> announcements.filter(a=> actFilter==='ALL' || a.act===actFilter),[actFilter,announcements])
  const totalPages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE))
  const pageItems=filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE)
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-orange-600" /><h1 className="text-2xl font-bold tracking-tight">Announcements</h1></div>
        <div className="flex gap-2 items-center text-xs">
          <label className='font-medium text-gray-600'>Act</label>
          <select value={actFilter} onChange={e=> { setPage(1); setActFilter(e.target.value) }} className='border rounded px-2 py-1'>
            <option value='ALL'>All</option>
            <option value='PCR'>PCR</option>
            <option value='POA'>PoA</option>
            <option value='INCENTIVE'>Incentive</option>
          </select>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {pageItems.map(a => (
          <Card key={a.id} className="border-gray-200 flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium leading-snug">
                {a.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-600 space-y-3 flex-1 flex flex-col">
              <p className="line-clamp-5 leading-relaxed">{a.body}</p>
              <div className="mt-auto pt-3 flex items-center justify-between text-[11px] text-gray-500 border-t">
                <span className="uppercase tracking-wide font-medium">{a.act}</span>
                <time>{new Date(a.date).toLocaleDateString()}</time>
              </div>
            </CardContent>
          </Card>
        ))}
        {pageItems.length===0 && <p className='text-xs text-gray-500 col-span-full'>No announcements.</p>}
      </div>
      <div className='flex items-center justify-center gap-4 text-xs'>
        <button disabled={page===1} onClick={()=> setPage(p=> Math.max(1,p-1))} className='px-3 py-1 border rounded disabled:opacity-40'>Prev</button>
        <span className='font-medium'>Page {page} / {totalPages}</span>
        <button disabled={page===totalPages} onClick={()=> setPage(p=> Math.min(totalPages,p+1))} className='px-3 py-1 border rounded disabled:opacity-40'>Next</button>
      </div>
    </div>
  )
}