'use client'
import React, { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { OverviewCards } from '@/components/dashboard/OverviewCards'
import { RecentApplications, RecentAppItem } from '@/components/dashboard/RecentApplications'
import { LanguageSwitcher } from '@/components/accessibility/LanguageSwitcher'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface UserProfile { id: string; fullName: string }
interface ApplicationStats {
  total_applications: number
  verified_docs: number
  in_progress: number
}

export default function DashboardPage(){
  const t = useTranslations('userDashboard')
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [apps, setApps] = useState<RecentAppItem[]>([])
  const [stats, setStats] = useState<ApplicationStats>({ total_applications: 0, verified_docs: 0, in_progress: 0 })

  useEffect(() => {
    async function fetchProfileAndApps() {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
        const token = localStorage.getItem('access_token')
        
        // Import getCurrentUser dynamically to avoid SSR issues
        const { getCurrentUser } = await import('@/lib/api/onboarding')
        const user = await getCurrentUser()
        setProfile({ id: user.id, fullName: user.full_name })

        // Fetch ALL user applications to calculate stats
        const allRes = await fetch(`${API_BASE_URL}/applications/my?limit=1000&skip=0`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        })
        
        let allAppData = []
        if (allRes.ok) {
          allAppData = await allRes.json()
        }

        // Fetch recent 5 applications for display
        const recentRes = await fetch(`${API_BASE_URL}/applications/my?limit=5&skip=0`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        })
        
        let recentAppData = []
        if (recentRes.ok) {
          recentAppData = await recentRes.json()
        }
        
        // Map recent applications for display
        setApps(recentAppData.map((a:any) => ({
          id: a.id,
          title: a.title || a.application_type || 'Application',
          number: a.application_number || a.id,
          status: a.status,
          updatedAt: a.updated_at || a.created_at,
          amount: a.amount_requested || 0,
          approved: a.amount_approved
        })))

        // Calculate stats from all applications
        const totalApps = allAppData.length
        
        // Count verified documents (applications with all documents verified)
        let verifiedDocsCount = 0
        for (const app of allAppData) {
          if (app.documents && app.documents.length > 0) {
            const allVerified = app.documents.every((doc: any) => doc.status === 'VERIFIED')
            if (allVerified) {
              verifiedDocsCount++
            }
          }
        }
        
        // In Progress = applications not yet FUND_DISBURSED (excluding REJECTED and DRAFT)
        const inProgressCount = allAppData.filter((a: any) => 
          a.status !== 'FUND_DISBURSED' && a.status !== 'REJECTED' && a.status !== 'DRAFT'
        ).length

        setStats({
          total_applications: totalApps,
          verified_docs: verifiedDocsCount,
          in_progress: inProgressCount
        })
        
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        setProfile(null)
        setApps([])
      } finally {
        setLoading(false)
      }
    }
    fetchProfileAndApps()
  }, [])

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
          <h1 className='text-2xl font-bold tracking-tight'>{t('welcome')}{profile? `, ${profile.fullName}`:''}</h1>
          <p className='text-sm text-gray-600'>{t('subtitle')}</p>
        </div>
        <div className='flex flex-col sm:flex-row gap-2 items-end'>
          <LanguageSwitcher />
          <Link href='/applications/new'><Button className='bg-orange-600 hover:bg-orange-700'>{t('newApplication')}</Button></Link>
        </div>
      </div>
      {/* KPI Cards */}
      <OverviewCards 
        applicationsCount={stats.total_applications} 
        verifiedDocs={stats.verified_docs} 
        inProgress={stats.in_progress} 
      />
      <div className='grid gap-6'>
        <RecentApplications items={apps} />
      </div>
    </div>
  )
}
