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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, ArrowRight, User, MapPin, Phone, Mail, Calendar, FileText } from 'lucide-react'
import { authApi } from '@/lib/api/auth'
import toast from 'react-hot-toast'

const registrationSchema = z.object({
  // Personal Information
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone_number: z.string().min(10, 'Phone number must be at least 10 digits'),
  aadhaar_number: z.string().optional(),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']),
  category: z.enum(['SC', 'ST', 'OBC', 'GENERAL', 'OTHER']),
  
  // Address Information
  address: z.string().min(10, 'Address must be at least 10 characters'),
  district: z.string().min(2, 'District is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().length(6, 'Pincode must be 6 digits'),
  
  // Terms and Conditions
  accept_terms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
  accept_privacy: z.boolean().refine(val => val === true, 'You must accept the privacy policy'),
})

type RegistrationForm = z.infer<typeof registrationSchema>

const steps = [
  { id: 1, title: 'Personal Information', icon: User },
  { id: 2, title: 'Address Details', icon: MapPin },
  { id: 3, title: 'Contact Information', icon: Phone },
  { id: 4, title: 'Review & Submit', icon: FileText },
]

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    mode: 'onChange',
  })

  const watchedFields = watch()

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep)
    const isValid = await trigger(fieldsToValidate)
    
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const getFieldsForStep = (step: number): (keyof RegistrationForm)[] => {
    switch (step) {
      case 1:
        return ['full_name', 'date_of_birth', 'gender', 'category']
      case 2:
        return ['address', 'district', 'state', 'pincode']
      case 3:
        return ['email', 'phone_number', 'aadhaar_number']
      case 4:
        return ['accept_terms', 'accept_privacy']
      default:
        return []
    }
  }

  const onSubmit = async (data: RegistrationForm) => {
    setIsLoading(true)
    try {
      await authApi.register(data)
      toast.success('Registration successful! Please verify your phone number.')
      router.push('/login')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                {...register('full_name')}
                placeholder="Enter your full name"
                className={errors.full_name ? 'border-red-500' : ''}
              />
              {errors.full_name && (
                <p className="text-sm text-red-500 mt-1">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="date_of_birth">Date of Birth *</Label>
              <Input
                id="date_of_birth"
                type="date"
                {...register('date_of_birth')}
                className={errors.date_of_birth ? 'border-red-500' : ''}
              />
              {errors.date_of_birth && (
                <p className="text-sm text-red-500 mt-1">{errors.date_of_birth.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="gender">Gender *</Label>
              <Select onValueChange={(value) => setValue('gender', value as any)}>
                <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                  <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-sm text-red-500 mt-1">{errors.gender.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select onValueChange={(value) => setValue('category', value as any)}>
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SC">Scheduled Caste (SC)</SelectItem>
                  <SelectItem value="ST">Scheduled Tribe (ST)</SelectItem>
                  <SelectItem value="OBC">Other Backward Class (OBC)</SelectItem>
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>
              )}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                {...register('address')}
                placeholder="Enter your complete address"
                className={errors.address ? 'border-red-500' : ''}
                rows={3}
              />
              {errors.address && (
                <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="district">District *</Label>
                <Input
                  id="district"
                  {...register('district')}
                  placeholder="Enter district"
                  className={errors.district ? 'border-red-500' : ''}
                />
                {errors.district && (
                  <p className="text-sm text-red-500 mt-1">{errors.district.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  {...register('state')}
                  placeholder="Enter state"
                  className={errors.state ? 'border-red-500' : ''}
                />
                {errors.state && (
                  <p className="text-sm text-red-500 mt-1">{errors.state.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="pincode">Pincode *</Label>
              <Input
                id="pincode"
                {...register('pincode')}
                placeholder="Enter 6-digit pincode"
                maxLength={6}
                className={errors.pincode ? 'border-red-500' : ''}
              />
              {errors.pincode && (
                <p className="text-sm text-red-500 mt-1">{errors.pincode.message}</p>
              )}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="Enter your email address"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone_number">Phone Number *</Label>
              <Input
                id="phone_number"
                {...register('phone_number')}
                placeholder="Enter your phone number"
                className={errors.phone_number ? 'border-red-500' : ''}
              />
              {errors.phone_number && (
                <p className="text-sm text-red-500 mt-1">{errors.phone_number.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="aadhaar_number">Aadhaar Number (Optional)</Label>
              <Input
                id="aadhaar_number"
                {...register('aadhaar_number')}
                placeholder="Enter 12-digit Aadhaar number"
                maxLength={12}
                className={errors.aadhaar_number ? 'border-red-500' : ''}
              />
              {errors.aadhaar_number && (
                <p className="text-sm text-red-500 mt-1">{errors.aadhaar_number.message}</p>
              )}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Review Your Information</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {watchedFields.full_name}</p>
                <p><strong>Email:</strong> {watchedFields.email}</p>
                <p><strong>Phone:</strong> {watchedFields.phone_number}</p>
                <p><strong>Category:</strong> {watchedFields.category}</p>
                <p><strong>District:</strong> {watchedFields.district}, {watchedFields.state}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="accept_terms"
                  checked={watchedFields.accept_terms}
                  onCheckedChange={(checked) => setValue('accept_terms', checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="accept_terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    I accept the Terms and Conditions *
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    By checking this box, you agree to our terms of service and privacy policy.
                  </p>
                </div>
              </div>
              {errors.accept_terms && (
                <p className="text-sm text-red-500">{errors.accept_terms.message}</p>
              )}

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="accept_privacy"
                  checked={watchedFields.accept_privacy}
                  onCheckedChange={(checked) => setValue('accept_privacy', checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="accept_privacy" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    I accept the Privacy Policy *
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    I understand how my personal information will be used and protected.
                  </p>
                </div>
              </div>
              {errors.accept_privacy && (
                <p className="text-sm text-red-500">{errors.accept_privacy.message}</p>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-nyaya-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
          <p className="mt-2 text-gray-600">Join NyayaSetu to access government benefits and services</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      isActive
                        ? 'border-nyaya-600 bg-nyaya-600 text-white'
                        : isCompleted
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-gray-300 bg-white text-gray-500'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`mt-2 text-xs font-medium ${
                    isActive ? 'text-nyaya-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {React.createElement(steps[currentStep - 1].icon, { className: "w-5 h-5 mr-2" })}
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              Step {currentStep} of {steps.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              {renderStepContent()}

              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {currentStep < steps.length ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center"
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="font-medium text-nyaya-600 hover:text-nyaya-500">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
