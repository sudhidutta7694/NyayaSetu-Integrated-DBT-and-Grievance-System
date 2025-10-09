'use client'
import React, { useEffect, useState } from 'react'
import { OverviewCards } from '@/components/dashboard/OverviewCards'
import { RecentApplications, RecentAppItem } from '@/components/dashboard/RecentApplications'
import { RecentDocuments, RecentDocItem } from '@/components/dashboard/RecentDocuments'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface UserProfile { id: string; fullName: string }

export default function DashboardPage(){
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [apps, setApps] = useState<RecentAppItem[]>([])
  const [docs, setDocs] = useState<RecentDocItem[]>([])

  useEffect(()=> {
    // Mock fetch
    setTimeout(()=> {
      setProfile({ id: '1', fullName: 'John Doe' })
      setApps([
        { id:'1', title:'PCR Act Compensation Application', number:'APP-2024-001', status:'UNDER_REVIEW', updatedAt: new Date().toISOString(), amount:50000, approved:45000 },
        { id:'2', title:'PoA Act Legal Aid Application', number:'APP-2024-002', status:'APPROVED', updatedAt: new Date(Date.now()-86400000).toISOString(), amount:25000, approved:25000 }
      ])
      setDocs([
        { id:'1', name:'Caste Certificate.pdf', status:'VERIFIED', uploadedAt: new Date(Date.now()-2*86400000).toISOString() },
        { id:'2', name:'FIR-Scan.pdf', status:'PENDING', uploadedAt: new Date(Date.now()-86400000).toISOString() }
      ])
      setLoading(false)
    }, 400)
  },[])

  if(loading) return (
    <div className='space-y-8 animate-pulse'>
      <div className='h-6 w-40 bg-gray-200 rounded' />
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {Array.from({length:4}).map((_,i)=>(<div key={i} className='h-28 bg-gray-200 rounded' />))}
      </div>
      <div className='grid gap-6 xl:grid-cols-12'>
        <div className='space-y-4 xl:col-span-7'>
          <div className='h-64 bg-gray-200 rounded' />
        </div>
        <div className='space-y-4 xl:col-span-5'>
          <div className='h-64 bg-gray-200 rounded' />
          <div className='h-56 bg-gray-200 rounded' />
        </div>
      </div>
    </div>
  )

  // Redundant sections (profile snapshot & announcements) removed for cleaner minimal dashboard

  return (
    <div className='space-y-10'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4'>
        <div className='space-y-1'>
          <h1 className='text-2xl font-bold tracking-tight'>Welcome{profile? `, ${profile.fullName.split(' ')[0]}`:''}</h1>
          <p className='text-sm text-gray-600'>Track applications, manage documents, and view status updates.</p>
        </div>
        <div className='flex gap-2'>
          <Link href='/applications/new'><Button className='bg-orange-600 hover:bg-orange-700'>New Application</Button></Link>
        </div>
      </div>
      {/* KPI Cards */}
      <OverviewCards applicationsCount={apps.length} pendingCount={1} verifiedDocs={docs.filter(d=> d.status==='VERIFIED').length} inProgress={apps.filter(a=> a.status==='UNDER_REVIEW').length} />
      <div className='grid gap-6 xl:grid-cols-12'>
        <div className='space-y-6 xl:col-span-7'>
          <RecentApplications items={apps} />
        </div>
        <div className='space-y-6 xl:col-span-5'>
          <RecentDocuments items={docs} />
        </div>
      </div>
    </div>
  )
}
