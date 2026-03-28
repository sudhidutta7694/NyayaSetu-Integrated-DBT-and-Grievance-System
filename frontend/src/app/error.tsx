'use client'
import React, { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Something went wrong</h1>
            <p className="text-sm text-gray-600">An unexpected error occurred. Our team has been notified. You can try again.</p>
            {error.digest && <p className="text-[11px] text-gray-400">Ref: {error.digest}</p>}
          </div>
          <div className="flex flex-col gap-3">
            <Button onClick={()=> reset()} className="bg-orange-600 hover:bg-orange-700">Try Again</Button>
            <Button variant="outline" onClick={()=> window.location.href='/dashboard'}>Go to Dashboard</Button>
          </div>
        </div>
      </body>
    </html>
  )
}
