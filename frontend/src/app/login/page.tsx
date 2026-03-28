'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Shield, Clock, User, Phone } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { tokenStorage } from '@/lib/tokenStorage'
import { LanguageSwitcher } from '@/components/accessibility/LanguageSwitcher'

export default function LoginPage() {
  const t = useTranslations('login')
  const [step, setStep] = useState<'aadhaar' | 'otp'>('aadhaar')
  const [aadhaarNumber, setAadhaarNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)
  const [aadhaarInfo, setAadhaarInfo] = useState<any>(null)
  const router = useRouter()

  // Schema with translated validation messages
  const aadhaarSchema = z.object({
    aadhaar_number: z.string()
      .min(12, t('validation.aadhaarMin'))
      .max(12, t('validation.aadhaarMax'))
      .regex(/^\d{12}$/, t('validation.aadhaarDigitsOnly')),
  })

  const otpSchema = z.object({
    otp_code: z.string().length(6, t('validation.otpLength')),
  })

  type AadhaarForm = z.infer<typeof aadhaarSchema>
  type OTPForm = z.infer<typeof otpSchema>

  const {
    register: registerAadhaar,
    handleSubmit: handleAadhaarSubmit,
    formState: { errors: aadhaarErrors },
  } = useForm<AadhaarForm>({
    resolver: zodResolver(aadhaarSchema),
  })

  const {
    register: registerOTP,
    handleSubmit: handleOTPSubmit,
    formState: { errors: otpErrors },
  } = useForm<OTPForm>({
    resolver: zodResolver(otpSchema),
  })

  const startOTPTimer = () => {
    setOtpTimer(300) // 5 minutes
    const interval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const onAadhaarSubmit = async (data: AadhaarForm) => {
    setIsLoading(true)
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${API_BASE_URL}/auth/aadhaar-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ aadhaar_number: data.aadhaar_number }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setAadhaarNumber(data.aadhaar_number)
        setAadhaarInfo(result.aadhaar_info)
        setStep('otp')
        startOTPTimer()
        toast.success(t('messages.otpSent'))
      } else {
        // Handle error response from backend
        const errorMessage = result.detail || result.message || 'Failed to send OTP'
        toast.error(errorMessage)
      }
    } catch (error: any) {
      console.error('Aadhaar login error:', error)
      toast.error(t('messages.error'))
    } finally {
      setIsLoading(false)
    }
  }

  const onOTPSubmit = async (data: OTPForm) => {
    setIsLoading(true)
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${API_BASE_URL}/auth/aadhaar-verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aadhaar_number: aadhaarNumber,
          otp_code: data.otp_code,
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Store user data and token
        // IMPORTANT: Store token using tokenStorage (stores in both localStorage and cookies)
        // console.log('Login result:', result)
        // console.log('Access token:', result.user?.access_token)
        
        localStorage.setItem('user', JSON.stringify(result.user))
        tokenStorage.setToken(result.user.access_token)
        
        // console.log('Token stored:', tokenStorage.getToken())
        
        toast.success(t('messages.loginSuccess'))
        // Role-based redirect: if FI, go to FI dashboard directly
        const role = result.user?.role
        if (role === 'FINANCIAL_INSTITUTION') {
          router.push('/fi/dashboard')
        } else if (result.requires_onboarding) {
          router.push('/onboarding')
        } else {
          router.push('/dashboard')
        }
      } else {
        toast.error(result.message || t('messages.invalidOtp'))
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      toast.error(t('messages.error'))
    } finally {
      setIsLoading(false)
    }
  }

  const resendOTP = async () => {
    setIsLoading(true)
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${API_BASE_URL}/auth/aadhaar-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ aadhaar_number: aadhaarNumber }),
      })

      const result = await response.json()

      if (result.success) {
        startOTPTimer()
        toast.success(t('messages.otpResent'))
      } else {
        toast.error(result.message || 'Failed to resend OTP')
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
      toast.error(t('messages.error'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Back to Home Button */}
      <Link href='/' aria-label='Back to Home'
        className='fixed top-4 left-4 z-50 inline-flex items-center gap-2 bg-white/90 backdrop-blur border border-orange-300 text-orange-700 hover:bg-orange-50 px-3 py-2 rounded-full shadow-md transition-colors'>
        <ArrowLeft className='h-4 w-4' />
        <span className='hidden sm:inline text-sm font-medium'>{t('backToHome')}</span>
      </Link>
      
      {/* Language Switcher */}
      <div className='fixed top-4 right-4 z-50'>
        <LanguageSwitcher />
      </div>
      
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-orange-600 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              {step === 'aadhaar' ? t('title.aadhaar') : t('title.otp')}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {step === 'aadhaar' ? t('subtitle.aadhaar') : t('subtitle.otp')}
            </p>
          </div>

          {/* Test Credentials Card */}
          <Card className="shadow-lg border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">{t('testCredentials.title')}</h3>
                  {step === 'aadhaar' ? (
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">{t('testCredentials.aadhaar')}</span> <code className="bg-white px-2 py-0.5 rounded border border-blue-200">362851176122</code>
                    </p>
                  ) : (
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">{t('testCredentials.otp')}</span> <code className="bg-white px-2 py-0.5 rounded border border-blue-200">123456</code>
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-orange-200">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-green-50">
              <CardTitle className="text-center text-xl font-semibold text-gray-800">
                {step === 'aadhaar' ? t('card.title.aadhaar') : t('card.title.otp')}
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                {step === 'aadhaar' ? t('card.description.aadhaar') : t('card.description.otp')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {step === 'aadhaar' ? (
                <form onSubmit={handleAadhaarSubmit(onAadhaarSubmit)} className="space-y-6">
                  <div>
                    <Label htmlFor="aadhaar_number" className="text-sm font-medium text-gray-700">
                      {t('form.aadhaarLabel')}
                    </Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="aadhaar_number"
                        type="text"
                        placeholder={t('form.aadhaarPlaceholder')}
                        className="pl-10 border-2 border-gray-300 focus:border-orange-500"
                        {...registerAadhaar('aadhaar_number')}
                      />
                    </div>
                    {aadhaarErrors.aadhaar_number && (
                      <p className="mt-1 text-sm text-red-600">
                        {aadhaarErrors.aadhaar_number.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3"
                  >
                    {isLoading ? t('form.processing') : t('form.sendOtp')}
                  </Button>
                </form>
              ) : (
                <div className="space-y-6">
                  <form onSubmit={handleOTPSubmit(onOTPSubmit)} className="space-y-6">
                    <div>
                      <Label htmlFor="otp_code" className="text-sm font-medium text-gray-700">
                        {t('form.otpLabel')}
                      </Label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="otp_code"
                          type="text"
                          placeholder={t('form.otpPlaceholder')}
                          className="pl-10 border-2 border-gray-300 focus:border-orange-500"
                          {...registerOTP('otp_code')}
                        />
                      </div>
                      {otpErrors.otp_code && (
                        <p className="mt-1 text-sm text-red-600">
                          {otpErrors.otp_code.message}
                        </p>
                      )}
                    </div>

                    {otpTimer > 0 && (
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{t('messages.otpExpires')} {formatTime(otpTimer)}</span>
                      </div>
                    )}

                    <div className="space-y-3">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3"
                      >
                        {isLoading ? t('form.verifying') : t('form.verify')}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep('aadhaar')}
                        className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {t('form.goBack')}
                      </Button>

                      {otpTimer === 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={resendOTP}
                          disabled={isLoading}
                          className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                          {t('form.resendOtp')}
                        </Button>
                      )}
                    </div>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">{t('security.title')}</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {t('security.message')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}