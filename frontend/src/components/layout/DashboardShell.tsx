"use client"
import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { cn } from '@/lib/utils'
import { Menu } from 'lucide-react'

interface DashboardShellProps { children: React.ReactNode; className?: string }

export const DashboardShell: React.FC<DashboardShellProps> = ({ children, className }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  return (
    <div className="flex min-h-screen">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-white border border-gray-200 shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-gray-700" />
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
      
      <main className="flex-1 flex flex-col">
        <div className={cn('flex-1 p-4 md:p-6 lg:p-8 mx-auto w-full max-w-7xl', className)}>
          {children}
        </div>
      </main>
    </div>
  )
}
