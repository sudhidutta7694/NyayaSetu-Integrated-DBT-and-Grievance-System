'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, Building, Landmark, Users, ArrowLeft, Copy } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface DummyCred {
  role: 'DISTRICT_AUTHORITY' | 'FINANCIAL_INSTITUTION' | 'SOCIAL_WELFARE'
  title: string
  username: string
  password: string
  icon: React.ReactNode
  color: string
  blurb: string
}

const DUMMY_CREDS: DummyCred[] = [
  {
    role: 'DISTRICT_AUTHORITY',
    title: 'District Authority',
    username: 'district.admin@example.com',
    password: 'District@123',
    icon: <Building className='h-6 w-6' />,
    color: 'from-blue-50 to-blue-100 border-blue-200',
    blurb: 'Review & approve applications, manage district level verifications.'
  },
  {
    role: 'FINANCIAL_INSTITUTION',
    title: 'Financial Institution',
    username: 'finance.admin@example.com',
    password: 'Finance@123',
    icon: <Landmark className='h-6 w-6' />,
    color: 'from-purple-50 to-purple-100 border-purple-200',
    blurb: 'Handle fund disbursement & reconciliation workflows.'
  },
  {
    role: 'SOCIAL_WELFARE',
    title: 'Social Welfare',
    username: 'social.admin@example.com',
    password: 'Social@123',
    icon: <Users className='h-6 w-6' />,
    color: 'from-emerald-50 to-emerald-100 border-emerald-200',
    blurb: 'Oversee grievance redressal & beneficiary onboarding integrity.'
  }
]

export default function AdminLoginPage(){
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ username: '', password: '' })

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied`)
    } catch {
      toast.error('Copy failed')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Placeholder: simulate auth request
      await new Promise(r=> setTimeout(r, 800))

      // Determine role by matching entered credentials against demo list
      const matched = DUMMY_CREDS.find(c => c.username === form.username && c.password === form.password)
      if(!matched){
        toast.error('Invalid demo credentials')
        return
      }

      // Store mock session
      const mockUser = {
        id: 'mock-'+matched.role,
        role: matched.role,
        name: matched.title + ' User',
        access_token: 'mock-token-'+Date.now()
      }
      localStorage.setItem('user', JSON.stringify(mockUser))
      localStorage.setItem('token', mockUser.access_token)
      toast.success('Logged in as '+ matched.title)
      // Redirect based on role
      if (matched.role === 'FINANCIAL_INSTITUTION') {
        router.push('/fi/dashboard')
      } else {
        router.push('/admin/dashboard')
      }
    } catch(err){
      console.error(err)
      toast.error('Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 px-4 py-6'>
      {/* Floating back to home button */}
      <Link href='/' aria-label='Back to Home'
        className='fixed top-4 left-4 z-50 inline-flex items-center gap-2 bg-white/90 backdrop-blur border border-orange-300 text-orange-700 hover:bg-orange-50 px-3 py-2 rounded-full shadow-md transition-colors'>
        <ArrowLeft className='h-4 w-4' />
        <span className='hidden sm:inline text-sm font-medium'>Home</span>
      </Link>
      <div className='mx-auto h-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-14 items-center justify-items-center'>
        {/* Left: Heading + Form */}
        <div className='flex flex-col justify-center w-full max-w-md'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='h-14 w-14 bg-orange-600 rounded-full flex items-center justify-center shadow-md'>
              <Shield className='h-8 w-8 text-white' />
            </div>
            <div>
              <h1 className='text-2xl font-bold text-gray-900 leading-tight'>Authority Login</h1>
              <p className='text-xs text-gray-600 mt-1 max-w-sm'>Choose a role to auto-fill the demo credentials. No real authentication occurs.</p>
            </div>
          </div>
          <Card className='border-2 border-orange-200 shadow-lg'>
            <CardHeader className='bg-gradient-to-r from-orange-50 to-green-50 py-4'>
              <CardTitle className='text-left text-lg font-semibold text-gray-800'>Enter Credentials</CardTitle>
              <CardDescription className='text-left text-gray-600 text-sm'>Use the demo credentials shown on the right</CardDescription>
            </CardHeader>
            <CardContent className='p-5'>
              <form onSubmit={handleSubmit} className='space-y-5'>
                <div>
                  <Label htmlFor='username' className='text-sm font-medium text-gray-700'>Username</Label>
                  <Input id='username' type='text' value={form.username} onChange={e=> setForm(f=> ({...f, username: e.target.value}))} className='mt-1 border-2 border-gray-300 focus:border-orange-500' placeholder='Select role or type manually' />
                </div>
                <div>
                  <Label htmlFor='password' className='text-sm font-medium text-gray-700'>Password</Label>
                  <Input id='password' type='password' value={form.password} onChange={e=> setForm(f=> ({...f, password: e.target.value}))} className='mt-1 border-2 border-gray-300 focus:border-orange-500' placeholder='••••••••' />
                </div>
                <Button type='submit' disabled={loading} className='w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 text-sm'>
                  {loading ? 'Signing in...' : 'Login'}
                </Button>
                <p className='text-[10px] text-gray-500 text-center leading-snug'>Demo only – mock credentials & token stored locally.</p>
              </form>
            </CardContent>
          </Card>
        </div>
        {/* Right: Role Cards */}
        <div className='w-full flex justify-center'>
          <div className='w-full max-w-md flex flex-col gap-5'>
            {DUMMY_CREDS.map(c => (
              <div key={c.role}
                className={`group relative text-left rounded-xl border-2 p-4 transition-all bg-gradient-to-br ${c.color} focus:outline-none focus:ring-4 focus:ring-orange-300 hover:border-orange-400`}>
                <div className='flex items-start justify-between mb-2'>
                  <span className='p-2.5 rounded-lg bg-white/70 shadow-inner text-gray-700 group-hover:scale-105 transition-transform'>
                    {c.icon}
                  </span>
                </div>
                <h3 className='font-semibold text-gray-900 text-sm mb-1'>{c.title}</h3>
                <p className='text-[11px] text-gray-600 leading-snug mb-3'>{c.blurb}</p>

                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <span className='text-[11px] w-20 text-gray-600'>Username</span>
                    <code className='flex-1 text-[11px] bg-white/70 rounded px-2 py-1 border'>{c.username}</code>
                    <Button type='button' size='sm' variant='outline' className='h-7 text-[11px]'
                      onClick={()=> copyText(c.username, 'Username')}>
                      <Copy className='h-3.5 w-3.5 mr-1'/>Copy
                    </Button>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-[11px] w-20 text-gray-600'>Password</span>
                    <code className='flex-1 text-[11px] bg-white/70 rounded px-2 py-1 border'>{c.password}</code>
                    <Button type='button' size='sm' variant='outline' className='h-7 text-[11px]'
                      onClick={()=> copyText(c.password, 'Password')}>
                      <Copy className='h-3.5 w-3.5 mr-1'/>Copy
                    </Button>
                  </div>
                </div>

                <p className='text-[10px] italic text-gray-500 opacity-80 mt-2'>Copy and paste into the form on the left</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
