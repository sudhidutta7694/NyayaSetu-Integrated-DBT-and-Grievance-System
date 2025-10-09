'use client'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'

export interface RecentDocItem { id: string; name: string; status: string; uploadedAt: string }

export const RecentDocuments: React.FC<{ items: RecentDocItem[] }> = ({ items }) => {
  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium tracking-wide text-gray-600">Recent Documents</CardTitle>
      </CardHeader>
      <CardContent className="divide-y">
        {items.length===0 && <p className="text-xs text-gray-500 py-4">No documents uploaded.</p>}
        {items.map(d => (
          <div key={d.id} className="flex items-center justify-between py-3">
            <div className="min-w-0 pr-2">
              <p className="text-sm font-medium truncate">{d.name}</p>
              <p className="text-[11px] text-gray-500">{new Date(d.uploadedAt).toLocaleDateString()}</p>
            </div>
            <StatusBadge status={d.status} label={d.status} />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
