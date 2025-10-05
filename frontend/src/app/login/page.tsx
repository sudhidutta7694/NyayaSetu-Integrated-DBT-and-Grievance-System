'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Shield, Clock, User, Phone } from 'lucide-react'
import toast from 'react-hot-toast'

const aadhaarSchema = z.object({
  aadhaar_number: z.string()
    .min(12, 'Aadhaar number must be 12 digits')
    .max(12, 'Aadhaar number must be 12 digits')
    .regex(/^\d{12}$/, 'Aadhaar number must contain only digits'),
})

const otpSchema = z.object({
  otp_code: z.string().length(6, 'OTP must be 6 digits'),
})

type AadhaarForm = z.infer<typeof aadhaarSchema>
type OTPForm = z.infer<typeof otpSchema>

export default function LoginPage() {
  const [step, setStep] = useState<'aadhaar' | 'otp'>('aadhaar')
  const [aadhaarNumber, setAadhaarNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)
  const [aadhaarInfo, setAadhaarInfo] = useState<any>(null)
  const router = useRouter()

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
      const response = await fetch('http://localhost:8000/api/v1/auth/aadhaar-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ aadhaar_number: data.aadhaar_number }),
      })

      const result = await response.json()

      if (result.success) {
        setAadhaarNumber(data.aadhaar_number)
        setAadhaarInfo(result.aadhaar_info)
        setStep('otp')
        startOTPTimer()
        toast.success('OTP sent to your registered mobile number')
      } else {
        toast.error(result.message || 'Failed to send OTP')
      }
    } catch (error) {
      console.error('Aadhaar login error:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const onOTPSubmit = async (data: OTPForm) => {
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/aadhaar-verify-otp', {
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
        localStorage.setItem('user', JSON.stringify(result.user))
        localStorage.setItem('token', result.user.access_token)
        
        toast.success('Login successful!')
        
        if (result.requires_onboarding) {
          router.push('/onboarding')
        } else {
          router.push('/dashboard')
        }
      } else {
        toast.error(result.message || 'Invalid OTP')
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const resendOTP = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/aadhaar-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ aadhaar_number: aadhaarNumber }),
      })

      const result = await response.json()

      if (result.success) {
        startOTPTimer()
        toast.success('OTP resent successfully')
      } else {
        toast.error(result.message || 'Failed to resend OTP')
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-orange-600 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              {step === 'aadhaar' ? 'Login with Aadhaar' : 'OTP Verification'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {step === 'aadhaar' 
                ? 'Enter your 12-digit Aadhaar number' 
                : 'Enter the OTP sent to your registered mobile number'
              }
            </p>
          </div>

          <Card className="shadow-lg border-2 border-orange-200">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-green-50">
              <CardTitle className="text-center text-xl font-semibold text-gray-800">
                {step === 'aadhaar' ? 'Aadhaar Authentication' : 'OTP Verification'}
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                {step === 'aadhaar' 
                  ? 'Use your Aadhaar number for secure login'
                  : 'Enter your OTP'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {step === 'aadhaar' ? (
                <form onSubmit={handleAadhaarSubmit(onAadhaarSubmit)} className="space-y-6">
                  <div>
                    <Label htmlFor="aadhaar_number" className="text-sm font-medium text-gray-700">
                      Aadhaar Number
                    </Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="aadhaar_number"
                        type="text"
                        placeholder="1234 5678 9012"
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
                    {isLoading ? 'Processing...' : 'Send OTP'}
                  </Button>
                </form>
              ) : (
                <div className="space-y-6">
                  {aadhaarInfo && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-blue-800">
                            Name: {aadhaarInfo.name}
                          </p>
                          <p className="text-sm text-blue-600">
                            Father's Name: {aadhaarInfo.father_name}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleOTPSubmit(onOTPSubmit)} className="space-y-6">
                    <div>
                      <Label htmlFor="otp_code" className="text-sm font-medium text-gray-700">
                        OTP Code
                      </Label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="otp_code"
                          type="text"
                          placeholder="123456"
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
                        <span>OTP expires in: {formatTime(otpTimer)}</span>
                      </div>
                    )}

                    <div className="space-y-3">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3"
                      >
                        {isLoading ? 'Verifying...' : 'Verify'}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep('aadhaar')}
                        className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go Back
                      </Button>

                      {otpTimer === 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={resendOTP}
                          disabled={isLoading}
                          className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                          Resend OTP
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
                <h3 className="text-sm font-medium text-yellow-800">Security Notice</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Your OTP is valid for 5 minutes. Do not share your OTP with anyone. NyayaSetu will never ask for your OTP via phone or email.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}