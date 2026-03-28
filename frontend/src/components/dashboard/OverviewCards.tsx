'use client'
import React from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, FileText, CheckCircle, Clock, Loader2, ListChecks } from 'lucide-react'

interface OverviewCardsProps {
  applicationsCount: number
  verifiedDocs: number
  inProgress: number
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ applicationsCount, verifiedDocs, inProgress }) => {
  const t = useTranslations('userDashboard.cards')
  
  const items = [
    { label: t('allApplications'), value: applicationsCount, icon: <FileText className="h-5 w-5" />, color: 'bg-orange-600/10 text-orange-700' },
    { label: t('verifiedDocs'), value: verifiedDocs, icon: <CheckCircle className="h-5 w-5" />, color: 'bg-green-600/10 text-green-700' },
    { label: t('inProgress'), value: inProgress, icon: <Loader2 className="h-5 w-5" />, color: 'bg-sky-600/10 text-sky-700' },
  ]
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(i => (
        <Card key={i.label} className="border border-gray-200 hover:shadow-sm transition">
          <CardContent className="p-4 flex items-center gap-4">
            <div className={`h-10 w-10 rounded-md flex items-center justify-center ${i.color}`}>{i.icon}</div>
            <div className="space-y-0.5">
              <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">{i.label}</p>
              <p className="text-xl font-semibold tabular-nums">{i.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
