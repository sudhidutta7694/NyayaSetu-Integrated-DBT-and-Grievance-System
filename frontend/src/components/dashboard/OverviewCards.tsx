'use client'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, FileText, CheckCircle, Clock, Loader2, ListChecks } from 'lucide-react'

interface OverviewCardsProps {
  applicationsCount: number
  pendingCount: number
  verifiedDocs: number
  inProgress: number
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ applicationsCount, pendingCount, verifiedDocs, inProgress }) => {
  const items = [
    { label: 'Applications', value: applicationsCount, icon: <FileText className="h-5 w-5" />, color: 'bg-orange-600/10 text-orange-700' },
    { label: 'Pending Actions', value: pendingCount, icon: <ListChecks className="h-5 w-5" />, color: 'bg-amber-500/10 text-amber-600' },
    { label: 'Verified Docs', value: verifiedDocs, icon: <CheckCircle className="h-5 w-5" />, color: 'bg-green-600/10 text-green-700' },
    { label: 'In Progress', value: inProgress, icon: <Loader2 className="h-5 w-5" />, color: 'bg-sky-600/10 text-sky-700 animate-spin-slow' },
  ]
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
