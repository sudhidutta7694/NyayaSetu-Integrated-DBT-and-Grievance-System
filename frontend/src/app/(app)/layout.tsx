'use client'
import React from 'react'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { GovernmentHeader } from '@/components/layout/GovernmentHeader'
import { GovernmentFooter } from '@/components/layout/GovernmentFooter'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <DashboardShell>
        {children}
      </DashboardShell>
    </div>
  )
}
