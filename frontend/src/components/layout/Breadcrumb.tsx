'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { ChevronRight, Home, FileText } from 'lucide-react'

const Breadcrumb = () => {
  const { t } = useLanguage()
  const pathname = usePathname()

  const getBreadcrumbItems = () => {
    const paths = pathname.split('/').filter(Boolean)
    const items = [
      {
        label: t('breadcrumb.home', 'Home'),
        href: '/',
        icon: Home
      }
    ]

    let currentPath = ''
    paths.forEach((path, index) => {
      currentPath += `/${path}`
      
      // Map path segments to readable labels
      let label = path
      switch (path) {
        case 'login':
          label = t('breadcrumb.login', 'Login')
          break
        case 'onboarding':
          label = t('breadcrumb.onboarding', 'Onboarding')
          break
        case 'dashboard':
          label = t('breadcrumb.dashboard', 'Dashboard')
          break
        case 'admin':
          label = t('breadcrumb.admin', 'Admin')
          break
        case 'about':
          label = t('breadcrumb.about', 'About')
          break
        case 'services':
          label = t('breadcrumb.services', 'Services')
          break
        case 'contact':
          label = t('breadcrumb.contact', 'Contact')
          break
        case 'help':
          label = t('breadcrumb.help', 'Help')
          break
        case 'applications':
          label = t('breadcrumb.applications', 'Applications')
          break
        case 'documents':
          label = t('breadcrumb.documents', 'Documents')
          break
        case 'profile':
          label = t('breadcrumb.profile', 'Profile')
          break
        default:
          // Capitalize first letter and replace hyphens with spaces
          label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ')
      }

      items.push({
        label,
        href: currentPath,
        icon: FileText
      })
    })

    return items
  }

  const breadcrumbItems = getBreadcrumbItems()

  return (
    <nav className="text-sm text-gray-600" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1
          const Icon = item.icon

          return (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
              )}
              
              {isLast ? (
                <span className="text-orange-600 font-medium flex items-center">
                  {Icon && <Icon className="h-4 w-4 mr-1" />}
                  {item.label}
                </span>
              ) : (
                <Link 
                  href={item.href}
                  className="text-gray-600 hover:text-orange-600 transition-colors flex items-center"
                >
                  {Icon && <Icon className="h-4 w-4 mr-1" />}
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumb
