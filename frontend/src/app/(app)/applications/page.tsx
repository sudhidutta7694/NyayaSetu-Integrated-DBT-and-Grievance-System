'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FileText, Filter, Search, Download } from 'lucide-react'
import { SkeletonLines } from '@/components/ui/skeleton'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/accessibility/LanguageSwitcher'

interface ApplicationRow { 
  id: string
  applicationNumber: string
  title: string
  applicationType: string
  status: string
  amountRequested?: number
  amountApproved?: number
  updatedAt: string
}

const PAGE_SIZE = 10

export default function ApplicationsListPage(){
  const t = useTranslations('userApplications.list')
  const [apps, setApps] = useState<ApplicationRow[]>([])
  const [allApps, setAllApps] = useState<ApplicationRow[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilters, setStatusFilters] = useState<string[]>([])
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [isLoading, setIsLoading] = useState(true)

  const formatStatusDisplay = (status: string): string => {
    const statusMap: Record<string, string> = {
      'DOCUMENTS_APPROVED': t('statuses.documentsApproved'),
      'APPROVED': t('statuses.approved'),
      'DOCUMENTS_REJECTED': t('statuses.documentsRejected'),
      'DISTRICT_AUTHORITY_REJECTED': t('statuses.documentsRejected'),
      'SOCIAL_WELFARE_REJECTED': t('statuses.socialWelfareRejected'),
      'FI_REJECTED': t('statuses.fiRejected'),
      'DRAFT': t('statuses.draft'),
      'SUBMITTED': t('statuses.submitted'),
      'UNDER_REVIEW': t('statuses.underReview'),
      'REJECTED': t('statuses.rejected'),
      'DISBURSED': t('statuses.disbursed')
    }
    return statusMap[status] || status.replace(/_/g, ' ')
  }

  // Fetch all applications once
  useEffect(() => {
    async function fetchAllApplications() {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
        const token = localStorage.getItem('access_token')
        
        const res = await fetch(`${API_BASE_URL}/applications/my?limit=1000&skip=0`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        })
        
        if (res.ok) {
          const data = await res.json()
          const mapped = data.map((a: any) => ({
            id: a.id,
            applicationNumber: a.application_number || a.id,
            title: a.title || a.application_type || 'Application',
            applicationType: a.application_type || 'UNKNOWN',
            status: a.status,
            amountRequested: a.amount_requested,
            amountApproved: a.amount_approved,
            updatedAt: a.updated_at || a.created_at
          }))
          setAllApps(mapped)
        }
      } catch (err) {
        console.error('Failed to fetch applications:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAllApplications()
  }, [])

  // Apply filters and pagination client-side
  useEffect(() => {
    let filtered = [...allApps]
    
    // Filter by type
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(a => a.applicationType.includes(typeFilter))
    }
    
    // Filter by status
    if (statusFilters.length > 0) {
      filtered = filtered.filter(a => statusFilters.includes(a.status))
    }
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(a => 
        a.applicationNumber.toLowerCase().includes(searchLower) ||
        a.title.toLowerCase().includes(searchLower) ||
        a.applicationType.toLowerCase().includes(searchLower)
      )
    }
    
    setTotal(filtered.length)
    
    // Paginate
    const start = (page - 1) * PAGE_SIZE
    setApps(filtered.slice(start, start + PAGE_SIZE))
  }, [allApps, page, search, statusFilters, typeFilter])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className='space-y-8'>
      {/* Language Switcher - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold tracking-tight'>{t('title')}</h1>
          <p className='text-sm text-gray-600 mt-1'>{t('subtitle')}</p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' size='sm'>
            <Download className='h-4 w-4 mr-1' />
            {t('buttons.export')}
          </Button>
          <Link href='/applications/new'>
            <Button className='bg-orange-600 hover:bg-orange-700'>
              {t('buttons.new')}
            </Button>
          </Link>
        </div>
      </div>

      <Card className='border-gray-200'>
        <CardContent className='pt-6 flex flex-wrap gap-3 items-center text-sm'>
          <div className='flex items-center gap-2'>
            <Filter className='h-4 w-4 text-gray-500' />
            <select 
              value={typeFilter} 
              onChange={e=>{ setPage(1); setTypeFilter(e.target.value)}} 
              className='border rounded px-2 py-1 text-sm'
            >
              <option value='ALL'>{t('filters.allTypes')}</option>
              <option value='COMPENSATION'>{t('filters.compensation')}</option>
              <option value='POA_COMPENSATION'>{t('filters.poaCompensation')}</option>
              <option value='LEGAL_AID'>{t('filters.legalAid')}</option>
              <option value='INCENTIVE'>{t('filters.incentive')}</option>
            </select>
          </div>
          <div className='flex items-center gap-1'>
            {['DRAFT','SUBMITTED','UNDER_REVIEW','APPROVED','REJECTED','DISBURSED'].map(st=>{ 
              const active=statusFilters.includes(st);
              // Convert UNDER_REVIEW to underReview (camelCase) for translation key
              const statusKey = st.split('_').map((word, idx) => 
                idx === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              ).join('');
              return (
                <button 
                  key={st} 
                  onClick={()=> setStatusFilters(prev=> prev.includes(st)? prev.filter(p=>p!==st):[...prev,st])} 
                  className={`px-2 py-0.5 rounded-full border text-xs ${active?'bg-orange-600 text-white border-orange-600':'bg-white hover:bg-gray-100'}`} 
                  aria-pressed={active}
                >
                  {t(`statuses.${statusKey}`)}
                </button>
              )
            })}
          </div>
          <div className='relative ml-auto'>
            <Search className='h-4 w-4 absolute left-2 top-1.5 text-gray-400' />
            <input 
              value={search} 
              onChange={e=>{ setPage(1); setSearch(e.target.value)}} 
              placeholder={t('search.placeholder')} 
              className='pl-8 pr-2 py-1 border rounded text-sm w-64' 
            />
          </div>
        </CardContent>
      </Card>

      <Card className='border-gray-200'>
        <CardHeader>
          <CardTitle className='text-xs uppercase tracking-wide text-gray-500'>
            {t('results.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className='py-6 space-y-4'>
              {Array.from({length:5}).map((_,i)=>(
                <div key={i} className='border-b pb-4 last:border-b-0'>
                  <SkeletonLines lines={3} />
                </div>
              ))}
            </div>
          )}
          
          {!isLoading && apps.length===0 && (
            <div className='py-12 text-center text-gray-500 flex flex-col items-center gap-3'>
              <FileText className='h-10 w-10 text-gray-300' />
              {t('results.empty')}
              <Link href='/applications/new' className='text-orange-600 text-sm underline'>
                {t('results.createNew')}
              </Link>
            </div>
          )}
          
          <div className='grid grid-cols-1 gap-4'>
            {apps.map(a=> (
              <Link 
                key={a.id} 
                href={`/applications/${a.id}`} 
                className='block focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-xl'
              >
                <div className='border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-orange-300 transition-all duration-200 bg-gradient-to-br from-white to-gray-50'>
                  <div className='flex items-start justify-between gap-6 mb-3'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-3 mb-2'>
                        <div className='p-2 bg-orange-100 rounded-lg'>
                          <FileText className='h-5 w-5 text-orange-600' />
                        </div>
                        <div className='flex-1'>
                          <h3 className='font-semibold text-gray-900 leading-tight'>{a.title}</h3>
                          <p className='text-sm text-gray-500 font-mono mt-0.5'>#{a.applicationNumber}</p>
                        </div>
                      </div>
                    </div>
                    <span className={`status-badge status-${a.status.toLowerCase().replace(/_/g,'-')} shrink-0`}>
                      {formatStatusDisplay(a.status)}
                    </span>
                  </div>
                  
                  <div className='flex flex-wrap items-center gap-4 text-sm text-gray-600 pl-14'>
                    <div className='flex items-center gap-1.5'>
                      <span className='text-gray-400'>{t('card.type')}</span>
                      <span className='font-medium'>{a.applicationType.replace(/_/g, ' ')}</span>
                    </div>
                    {a.amountRequested && (
                      <div className='flex items-center gap-1.5'>
                        <span className='text-gray-400'>{t('card.requested')}</span>
                        <span className='font-semibold text-orange-600'>₹{a.amountRequested.toLocaleString()}</span>
                      </div>
                    )}
                    {a.amountApproved !== undefined && a.amountApproved !== null && (
                      <div className='flex items-center gap-1.5'>
                        <span className='text-gray-400'>{t('card.approved')}</span>
                        <span className='font-semibold text-green-600'>₹{a.amountApproved.toLocaleString()}</span>
                      </div>
                    )}
                    <div className='flex items-center gap-1.5 ml-auto text-xs text-gray-400'>
                      <span>{t('card.updated')}</span>
                      <span>{new Date(a.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className='flex items-center justify-between mt-6 text-sm'>
            <span>
              {t('pagination.page')} {page} {t('pagination.of')} {totalPages} ({total} {t('pagination.total')})
            </span>
            <div className='flex gap-2'>
              <Button 
                variant='outline' 
                size='sm' 
                disabled={page===1} 
                onClick={()=> setPage(p=> p-1)}
              >
                {t('pagination.prev')}
              </Button>
              <Button 
                variant='outline' 
                size='sm' 
                disabled={page===totalPages} 
                onClick={()=> setPage(p=> p+1)}
              >
                {t('pagination.next')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
