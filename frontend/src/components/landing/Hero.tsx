'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Shield, Users, Zap } from 'lucide-react'
import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-nyaya-600 via-nyaya-700 to-nyaya-800">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            NyayaSetu
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-nyaya-100">
            Integrated DBT and Grievance System for effective implementation of PCR Act and PoA Act. 
            Ensuring justice and dignity for all citizens through technology-driven solutions.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/register">
              <Button size="lg" className="bg-white text-nyaya-700 hover:bg-nyaya-50">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-nyaya-700">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Feature highlights */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">Secure & Transparent</h3>
            <p className="mt-2 text-sm text-nyaya-200">
              End-to-end encryption and blockchain-ready architecture for maximum security
            </p>
          </div>
          
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">Multi-Role Support</h3>
            <p className="mt-2 text-sm text-nyaya-200">
              Designed for citizens, district authorities, social welfare departments, and financial institutions
            </p>
          </div>
          
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">Real-time Processing</h3>
            <p className="mt-2 text-sm text-nyaya-200">
              Instant verification, tracking, and disbursement with real-time notifications
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

