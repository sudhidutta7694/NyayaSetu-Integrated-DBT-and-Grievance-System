"use client"
import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, FolderOpen, User, Megaphone, Menu, ChevronLeft, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/providers/AuthProvider'

interface NavItem { label: string; href: string; icon: React.ReactNode }

function getRole(): string | null {
  try {
    const raw = localStorage.getItem('user')
    if(!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.role || null
  } catch { return null }
}

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onMobileClose }) => {
  const t = useTranslations('sidebar')
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const { logout } = useAuth()
  useEffect(()=> { setMounted(true) },[])
  useEffect(()=> { try { const stored = localStorage.getItem('nyaya.sidebar'); if(stored==='1') setCollapsed(true) } catch{} },[])
  useEffect(()=> { try { localStorage.setItem('nyaya.sidebar', collapsed? '1':'0') } catch{} },[collapsed])

  // Build role-based nav (extensible: add more roles later)
  const role = mounted && typeof window !== 'undefined'? getRole(): null
  let primary: NavItem[] | null = null
  if (mounted) {
    // Base nav for generic/public role
    const baseNav: NavItem[] = [
      { label: t('nav.dashboard'), href: '/dashboard', icon: <FileText className="h-4 w-4" /> },
      { label: t('nav.applications'), href: '/applications', icon: <FolderOpen className="h-4 w-4" /> },
      { label: t('nav.documents'), href: '/documents', icon: <FileText className="h-4 w-4" /> },
      { label: t('nav.announcements'), href: '/announcements', icon: <Megaphone className="h-4 w-4" /> }
    ]
    
    primary = baseNav
    if(role === 'FINANCIAL_INSTITUTION') {
      primary = [
        { label: t('nav.dashboard'), href: '/fi/dashboard', icon: <FileText className="h-4 w-4" /> },
        { label: t('nav.beneficiaries'), href: '/fi/beneficiaries', icon: <User className="h-4 w-4" /> },
        { label: t('nav.disbursements'), href: '/fi/disbursements', icon: <FolderOpen className="h-4 w-4" /> },
        { label: t('nav.reports'), href: '/fi/reports', icon: <FileText className="h-4 w-4" /> },
        { label: t('nav.grievances'), href: '/fi/grievances', icon: <Megaphone className="h-4 w-4" /> }
      ]
    } else if(role === 'DISTRICT_AUTHORITY') {
      primary = [
        { label: t('nav.dashboard'), href: '/district/dashboard', icon: <FileText className="h-4 w-4" /> }
      ]
    } else if(role === 'SOCIAL_WELFARE') {
      primary = [
        { label: t('nav.dashboard'), href: '/social-welfare/dashboard', icon: <FileText className="h-4 w-4" /> },
        { label: t('nav.reports'), href: '/social-welfare/reports', icon: <FileText className="h-4 w-4" /> }
      ]
    }
  }

  return (
  <aside className={cn(
    'group flex flex-col border-r bg-white/80 backdrop-blur-sm supports-[backdrop-filter]:bg-white/60 transition-all duration-300 text-sm md:text-base h-screen sticky top-0',
    // Mobile: hidden by default, fixed when open
    'fixed md:sticky z-50 md:z-auto',
    mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
    collapsed ? 'w-16' : 'w-56'
  )} aria-label="Primary">
      <div className="relative flex items-center justify-between h-14 px-3 border-b">
        <div className={cn('flex items-center gap-3 transition-all', collapsed && 'mx-auto')}> 
          <div className={cn('shrink-0 flex items-center justify-center rounded-md ring-1 ring-gray-200 bg-white p-1', collapsed? '':'')}> 
            <Image src="/gov-india-emblem.svg" alt="Government of India" width={32} height={32} priority className="h-8 w-8" />
          </div>
          {!collapsed && <span className='font-semibold text-base tracking-tight'>NyayaSetu</span>}
        </div>
        
        {/* Mobile Close Button */}
        <button
          aria-label={t('aria.closeSidebar')}
          onClick={onMobileClose}
          className={cn(
            'md:hidden p-1 rounded bg-white/70 backdrop-blur hover:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 ml-2 transition shadow-sm'
          )}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Desktop Collapse Button */}
        <button
          aria-label={collapsed? t('aria.expandSidebar'): t('aria.collapseSidebar')}
          onClick={()=> setCollapsed(c=> !c)}
          className={cn(
            'hidden md:block p-1 rounded bg-white/70 backdrop-blur hover:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 ml-2 transition shadow-sm',
            collapsed && 'absolute top-1 -right-8 ml-0 z-20 border border-gray-200'
          )}
        > 
          {collapsed? <Menu className="h-5 w-5" />: <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>
      <nav className="flex-1 py-2 overflow-hidden">
        <ul className="px-2 space-y-1">
          {!mounted || !primary ? (
            Array.from({length:4}).map((_,i)=> (
              <li key={i}>
                <div className={cn('px-3 py-2 rounded-md', collapsed? 'mx-2':'')}>
                  <div className='h-8 bg-gray-100 rounded animate-pulse' />
                </div>
              </li>
            ))
          ) : primary.map(item => {
            const active = pathname === item.href
            return (
              <li key={item.href}>
                <Link 
                  href={item.href} 
                  onClick={() => onMobileClose?.()} 
                  className={cn('flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500', active? 'bg-orange-600 text-white shadow-sm':'text-gray-700 hover:bg-orange-50')}
                >
                  <span className={cn('flex items-center justify-center', collapsed && 'mx-auto')}>{item.icon}</span>
                  <span className={cn('truncate', collapsed && 'hidden')}>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="mt-auto pt-2">
        <div className="px-2 pb-1">
          <button
            type="button"
            onClick={logout}
            className={cn('w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 text-left', 'text-gray-700 hover:bg-red-50 hover:text-red-700')}
          >
            <span className={cn('flex items-center justify-center', collapsed && 'mx-auto')}><LogOut className='h-4 w-4' /></span>
            <span className={cn('truncate', collapsed && 'hidden')}>{t('nav.logout')}</span>
          </button>
        </div>       
          <div className="px-2 pb-0.5">
            <Link 
              href='/profile' 
              onClick={() => onMobileClose?.()} 
              className={cn('flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500', pathname==='/profile'? 'bg-sky-600 text-white shadow-sm':'text-gray-700 hover:bg-sky-50')}
            >
              <span className={cn('flex items-center justify-center', collapsed && 'mx-auto')}><User className='h-4 w-4' /></span>
              <span className={cn('truncate', collapsed && 'hidden')}>{t('nav.profile')}</span>
            </Link>
          </div>
        <div className={cn('px-3 py-2 border-t text-[10px] leading-tight text-gray-500 transition-opacity', collapsed && 'opacity-0 pointer-events-none')}>
          <p className='truncate'>{t('copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </aside>
  )
}
