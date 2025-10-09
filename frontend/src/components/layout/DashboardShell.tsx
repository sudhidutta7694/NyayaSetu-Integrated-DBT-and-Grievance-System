"use client"
import React from 'react'
import { Sidebar } from './Sidebar'
import { cn } from '@/lib/utils'

interface DashboardShellProps { children: React.ReactNode; className?: string }

export const DashboardShell: React.FC<DashboardShellProps> = ({ children, className }) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <div className={cn('flex-1 p-4 md:p-6 lg:p-8 mx-auto w-full max-w-7xl', className)}>
          {children}
        </div>
      </main>
    </div>
  )
}
