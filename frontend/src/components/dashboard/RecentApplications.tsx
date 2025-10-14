'use client'
import React from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'

export interface RecentAppItem { id: string; title: string; number: string; status: string; updatedAt: string; amount: number | null; approved?: number | null }

export const RecentApplications: React.FC<{ items: RecentAppItem[] }> = ({ items }) => {
  const t = useTranslations('userDashboard.recentApplications')
  
  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium tracking-wide text-gray-600">{t('title')}</CardTitle>
        <Link href="/applications" className="text-xs text-orange-600 hover:underline">{t('viewAll')}</Link>
      </CardHeader>
      <CardContent className="divide-y">
        {items.length===0 && <p className="text-xs text-gray-500 py-4">{t('noApplications')}</p>}
        {items.map(a => (
          <Link key={a.id} href={`/applications/${a.id}`} className="group flex items-start justify-between py-3 gap-4 focus:outline-none focus:ring-2 focus:ring-orange-500">
            <div className="space-y-1 min-w-0">
              <p className="text-sm font-medium truncate group-hover:text-gray-900 transition">{a.title}</p>
              <p className="text-[11px] text-gray-500">{a.number} • {new Date(a.updatedAt).toLocaleDateString()}</p>
              {/* <p className="text-[11px] text-gray-500">
                {a.amount != null ? `₹${a.amount.toLocaleString()}` : 'Amount not specified'}
                {a.approved != null && <span className="ml-1 text-green-600">/ ₹{a.approved.toLocaleString()}</span>}
              </p> */}
            </div>
            <StatusBadge status={a.status} label={a.status.replace('_',' ')} className="shrink-0" />
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
