import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFoundPage(){
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-8 bg-gradient-to-br from-orange-50/40 to-white">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-500">404</h1>
          <h2 className="text-xl font-semibold">Page Not Found</h2>
          <p className="text-sm text-gray-600 leading-relaxed">The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
        </div>
        <div className="flex flex-col gap-3">
          <Link href="/dashboard"><Button className="bg-orange-600 hover:bg-orange-700">Go to Dashboard</Button></Link>
          <Link href="/"><Button variant="outline">Home</Button></Link>
        </div>
      </div>
    </div>
  )
}
