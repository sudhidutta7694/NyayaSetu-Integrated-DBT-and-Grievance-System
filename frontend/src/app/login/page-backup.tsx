'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Phone, Mail, Shield, Clock } from 'lucide-react'
import { authApi } from '@/lib/api/auth'
import { useAuth } from '@/components/providers/AuthProvider'
import toast from 'react-hot-toast'

const loginSchema = z.object({
  phone_number: z.string().min(10, 'Phone number must be at least 10 digits'),
})

const otpSchema = z.object({
  otp_code: z.string().length(6, 'OTP must be 6 digits'),
})

type LoginForm = z.infer<typeof loginSchema>
type OTPForm = z.infer<typeof otpSchema>

export default function LoginPage() {
  const [step, setStep] = useState<'login' | 'otp'>('login')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)
  const router = useRouter()
  const { login } = useAuth()

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const {
    register: registerOTP,
    handleSubmit: handleOTPSubmit,
    formState: { errors: otpErrors },
  } = useForm<OTPForm>({
    resolver: zodResolver(otpSchema),
  })

  const onLoginSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      await authApi.login({ phone_number: data.phone_number })
      setPhoneNumber(data.phone_number)
      setStep('otp')
      setOtpTimer(300) // 5 minutes
      startOTPTimer()
      toast.success('OTP sent to your phone number')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const onOTPSubmit = async (data: OTPForm) => {
    setIsLoading(true)
    try {
      await login(phoneNumber, data.otp_code)
      toast.success('Login successful!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'OTP verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  const resendOTP = async () => {
    setIsLoading(true)
    try {
      await authApi.login({ phone_number: phoneNumber })
      setOtpTimer(300)
      startOTPTimer()
      toast.success('OTP resent successfully')
    } catch (error: any) {
      toast.error('Failed to resend OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const startOTPTimer = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-nyaya-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-nyaya-600 rounded-lg flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {step === 'login' ? 'Sign in to your account' : 'Verify OTP'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 'login' 
              ? 'Enter your phone number to receive OTP'
              : `Enter the OTP sent to ${phoneNumber}`
            }
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {step === 'login' ? 'Login' : 'OTP Verification'}
            </CardTitle>
            <CardDescription className="text-center">
              {step === 'login' 
                ? 'Enter your registered phone number'
                : 'Enter the 6-digit OTP sent to your phone'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'login' ? (
              <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone_number"
                      type="tel"
                      placeholder="+91 9876543210"
                      className="pl-10"
                      {...registerLogin('phone_number')}
                    />
                  </div>
                  {loginErrors.phone_number && (
                    <p className="text-sm text-red-600 mt-1">
                      {loginErrors.phone_number.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleOTPSubmit(onOTPSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="otp_code">OTP Code</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="otp_code"
                      type="text"
                      placeholder="123456"
                      className="pl-10 text-center text-lg tracking-widest"
                      maxLength={6}
                      {...registerOTP('otp_code')}
                    />
                  </div>
                  {otpErrors.otp_code && (
                    <p className="text-sm text-red-600 mt-1">
                      {otpErrors.otp_code.message}
                    </p>
                  )}
                </div>

                {otpTimer > 0 && (
                  <div className="text-center text-sm text-gray-600">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Resend OTP in {formatTime(otpTimer)}
                  </div>
                )}

                <div className="space-y-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={resendOTP}
                    disabled={isLoading || otpTimer > 0}
                  >
                    Resend OTP
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setStep('login')}
                    disabled={isLoading}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Login
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-blue-600">
            <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Security Notice</h3>
              <p className="text-sm text-blue-700 mt-1">
                Your OTP is valid for 5 minutes. Never share your OTP with anyone. 
                NyayaSetu will never ask for your OTP via phone or email.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

