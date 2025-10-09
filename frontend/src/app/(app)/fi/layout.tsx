'use client'
import React from 'react'

export default function FILayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='space-y-6'>
      {children}
    </div>
  )
}
