import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { GovernmentHeader } from '@/components/layout/GovernmentHeader'
import { GovernmentFooter } from '@/components/layout/GovernmentFooter'
import { ScreenReader } from '@/components/accessibility/ScreenReader'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NyayaSetu - Integrated DBT and Grievance System',
  description: 'A comprehensive platform for implementing Direct Benefit Transfer (DBT) under the Centrally Sponsored Scheme for effective implementation of PCR Act and PoA Act.',
  keywords: ['DBT', 'PCR Act', 'PoA Act', 'Grievance System', 'Social Welfare', 'India'],
  authors: [{ name: 'NyayaSetu Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'NyayaSetu - Integrated DBT and Grievance System',
    description: 'A comprehensive platform for implementing Direct Benefit Transfer (DBT) under the Centrally Sponsored Scheme for effective implementation of PCR Act and PoA Act.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'NyayaSetu',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NyayaSetu - Integrated DBT and Grievance System',
    description: 'A comprehensive platform for implementing Direct Benefit Transfer (DBT) under the Centrally Sponsored Scheme for effective implementation of PCR Act and PoA Act.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <QueryProvider>
          <LanguageProvider>
            <AuthProvider>
              <div className="min-h-full flex flex-col">
                <GovernmentHeader />
                <main className="flex-1" tabIndex={-1}>
                  {children}
                </main>
                <GovernmentFooter />
              </div>
              <ScreenReader data-screen-reader />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </AuthProvider>
          </LanguageProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
