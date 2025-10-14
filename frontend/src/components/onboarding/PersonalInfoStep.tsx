'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileText, User, Phone, MapPin, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'

// Move schema creation inside component to access translations
type PersonalInfoForm = {
  fullName: string
  fatherName: string
  motherName: string
  dateOfBirth: string
  age: number
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY'
  category: 'SC' | 'ST' | 'OBC' | 'GENERAL'
  mobileNumber: string
  email?: string
  address: string
  district: string
  state: string
  pincode: string
}

interface PersonalInfoStepProps {
  onComplete: (data: PersonalInfoForm) => void
  onPrevious: () => void
  initialData?: any
}

// Helper functions
function parseDateString(str: string): Date | null {
  const [day, month, year] = str.split('/')
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  return isNaN(date.getTime()) ? null : date
}

function formatDate(date: Date | string): string {
  // If it's already a string in DD/MM/YYYY format, return it
  if (typeof date === 'string' && date.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    return date
  }
  // If it's an ISO string, parse it
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const d = dateObj.getDate().toString().padStart(2, '0')
  const m = (dateObj.getMonth() + 1).toString().padStart(2, '0')
  const y = dateObj.getFullYear().toString()
  return `${d}/${m}/${y}`
}

export default function PersonalInfoStep({ onComplete, onPrevious, initialData }: PersonalInfoStepProps) {
  const t = useTranslations('onboardingPersonalInfo')
  const [isLoading, setIsLoading] = useState(false)
  const [dobString, setDobString] = useState(initialData?.dateOfBirth ? formatDate(initialData.dateOfBirth) : '')

  // Create schema with translations
  const personalInfoSchema = z.object({
    fullName: z.string().min(2, t('validation.fullName')),
    fatherName: z.string().min(2, t('validation.fatherName')),
    motherName: z.string().min(2, t('validation.motherName')),
    dateOfBirth: z.string().regex(
      /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
      t('validation.dateOfBirth')
    ),
    age: z.number().min(1, t('validation.ageMin')).max(120, t('validation.ageMax')),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'], {
      required_error: t('validation.gender'),
    }),
    category: z.enum(['SC', 'ST', 'OBC', 'GENERAL'], {
      required_error: t('validation.category'),
    }),
    mobileNumber: z.string().regex(/^[6-9]\d{9}$/, t('validation.mobileNumber')),
    email: z.string().email(t('validation.email')).optional().or(z.literal('')),
    address: z.string().min(10, t('validation.address')),
    district: z.string().min(2, t('validation.district')),
    state: z.string().min(2, t('validation.state')),
    pincode: z.string().regex(/^\d{6}$/, t('validation.pincode')),
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PersonalInfoForm>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: initialData?.fullName || '',
      fatherName: initialData?.fatherName || '',
      motherName: initialData?.motherName || '',
      age: initialData?.age || 0,
      gender: initialData?.gender || undefined,
      category: initialData?.category || undefined,
      mobileNumber: initialData?.mobileNumber || '',
      email: initialData?.email || '',
      address: initialData?.address || '',
      district: initialData?.district || '',
      state: initialData?.state || '',
      pincode: initialData?.pincode || '',
    },
  })

  const watchedDate = watch('dateOfBirth')

  const calculateAge = (birthDate: Date) => {
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }


  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setDobString(value)
    setValue('dateOfBirth', value)
    const parsed = parseDateString(value)
    if (parsed) {
      const age = calculateAge(parsed)
      setValue('age', age)
    } else {
      setValue('age', 0)
    }
  }

  const onSubmit = async (data: PersonalInfoForm) => {
    setIsLoading(true)
    try {
      // No API call - just save locally
      // Data will be submitted all at once in final step
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate processing
      
      toast.success(t('toast.success'))
      onComplete(data)
    } catch (error: any) {
      console.error('Failed to save personal information:', error)
      toast.error(error.message || t('toast.error'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-6 w-6 text-orange-600" />
            <span>{t('title')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t('fields.fullName.label')} *</Label>
              <Input
                id="fullName"
                {...register('fullName')}
                placeholder={t('fields.fullName.placeholder')}
                className={errors.fullName ? 'border-red-500' : 'bg-gray-100'}
                disabled
              />
              {errors.fullName && (
                <p className="text-sm text-red-500">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fatherName">{t('fields.fatherName.label')} *</Label>
              <Input
                id="fatherName"
                {...register('fatherName')}
                placeholder={t('fields.fatherName.placeholder')}
                className={errors.fatherName ? 'border-red-500' : 'bg-gray-100'}
                disabled
              />
              {errors.fatherName && (
                <p className="text-sm text-red-500">{errors.fatherName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="motherName">{t('fields.motherName.label')} *</Label>
              <Input
                id="motherName"
                {...register('motherName')}
                placeholder={t('fields.motherName.placeholder')}
                className={errors.motherName ? 'border-red-500' : ''}
              />
              {errors.motherName && (
                <p className="text-sm text-red-500">{errors.motherName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">{t('fields.dateOfBirth.label')} *</Label>
              <Input
                id="dateOfBirth"
                placeholder={t('fields.dateOfBirth.placeholder')}
                {...register('dateOfBirth')}
                value={dobString}
                onChange={handleDobChange}
                className={errors.dateOfBirth ? 'border-red-500' : 'bg-gray-100'}
                maxLength={10}
                disabled
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">{t('fields.age.label')}</Label>
              <Input
                id="age"
                type="number"
                {...register('age', { valueAsNumber: true })}
                placeholder="0"
                readOnly
                className="bg-gray-100"
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label>{t('fields.gender.label')} *</Label>
              <Select 
                onValueChange={(value) => setValue('gender', value as any)}
                defaultValue={initialData?.gender}
                disabled
              >
                <SelectTrigger className={errors.gender ? 'border-red-500' : 'bg-gray-100'}>
                  <SelectValue placeholder={t('fields.gender.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">{t('fields.gender.options.MALE')}</SelectItem>
                  <SelectItem value="FEMALE">{t('fields.gender.options.FEMALE')}</SelectItem>
                  <SelectItem value="OTHER">{t('fields.gender.options.OTHER')}</SelectItem>
                  <SelectItem value="PREFER_NOT_TO_SAY">{t('fields.gender.options.PREFER_NOT_TO_SAY')}</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-sm text-red-500">{errors.gender.message}</p>
              )}
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label>{t('fields.category.label')} *</Label>
            <Select 
              onValueChange={(value) => setValue('category', value as any)}
              defaultValue={initialData?.category}
            >
              <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                <SelectValue placeholder={t('fields.category.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SC">{t('fields.category.options.SC')}</SelectItem>
                <SelectItem value="ST">{t('fields.category.options.ST')}</SelectItem>
                <SelectItem value="OBC">{t('fields.category.options.OBC')}</SelectItem>
                <SelectItem value="GENERAL">{t('fields.category.options.GENERAL')}</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mobileNumber" className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>{t('fields.mobileNumber.label')} *</span>
              </Label>
              <Input
                id="mobileNumber"
                {...register('mobileNumber')}
                placeholder={t('fields.mobileNumber.placeholder')}
                className={errors.mobileNumber ? 'border-red-500' : 'bg-gray-100'}
                disabled
              />
              {errors.mobileNumber && (
                <p className="text-sm text-red-500">{errors.mobileNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                {t('fields.email.label')}
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder={t('fields.email.placeholder')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pincode" className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>{t('fields.pincode.label')} *</span>
              </Label>
              <Input
                id="pincode"
                {...register('pincode')}
                placeholder={t('fields.pincode.placeholder')}
                className={errors.pincode ? 'border-red-500' : ''}
              />
              {errors.pincode && (
                <p className="text-sm text-red-500">{errors.pincode.message}</p>
              )}
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>{t('fields.address.label')} *</span>
              </Label>
              <Input
                id="address"
                {...register('address')}
                placeholder={t('fields.address.placeholder')}
                className={errors.address ? 'border-red-500' : 'bg-gray-100'}
                disabled
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="district">{t('fields.district.label')} *</Label>
                <Input
                  id="district"
                  {...register('district')}
                  placeholder={t('fields.district.placeholder')}
                  className={errors.district ? 'border-red-500' : ''}
                />
                {errors.district && (
                  <p className="text-sm text-red-500">{errors.district.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">{t('fields.state.label')} *</Label>
                <Select 
                  onValueChange={(value) => setValue('state', value)}
                  defaultValue={initialData?.state}
                >
                  <SelectTrigger className={errors.state ? 'border-red-500' : ''}>
                    <SelectValue placeholder={t('fields.state.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Andhra Pradesh">{t('fields.state.options.Andhra Pradesh')}</SelectItem>
                    <SelectItem value="Arunachal Pradesh">{t('fields.state.options.Arunachal Pradesh')}</SelectItem>
                    <SelectItem value="Assam">{t('fields.state.options.Assam')}</SelectItem>
                    <SelectItem value="Bihar">{t('fields.state.options.Bihar')}</SelectItem>
                    <SelectItem value="Chhattisgarh">{t('fields.state.options.Chhattisgarh')}</SelectItem>
                    <SelectItem value="Goa">{t('fields.state.options.Goa')}</SelectItem>
                    <SelectItem value="Gujarat">{t('fields.state.options.Gujarat')}</SelectItem>
                    <SelectItem value="Haryana">{t('fields.state.options.Haryana')}</SelectItem>
                    <SelectItem value="Himachal Pradesh">{t('fields.state.options.Himachal Pradesh')}</SelectItem>
                    <SelectItem value="Jharkhand">{t('fields.state.options.Jharkhand')}</SelectItem>
                    <SelectItem value="Karnataka">{t('fields.state.options.Karnataka')}</SelectItem>
                    <SelectItem value="Kerala">{t('fields.state.options.Kerala')}</SelectItem>
                    <SelectItem value="Madhya Pradesh">{t('fields.state.options.Madhya Pradesh')}</SelectItem>
                    <SelectItem value="Maharashtra">{t('fields.state.options.Maharashtra')}</SelectItem>
                    <SelectItem value="Manipur">{t('fields.state.options.Manipur')}</SelectItem>
                    <SelectItem value="Meghalaya">{t('fields.state.options.Meghalaya')}</SelectItem>
                    <SelectItem value="Mizoram">{t('fields.state.options.Mizoram')}</SelectItem>
                    <SelectItem value="Nagaland">{t('fields.state.options.Nagaland')}</SelectItem>
                    <SelectItem value="Odisha">{t('fields.state.options.Odisha')}</SelectItem>
                    <SelectItem value="Punjab">{t('fields.state.options.Punjab')}</SelectItem>
                    <SelectItem value="Rajasthan">{t('fields.state.options.Rajasthan')}</SelectItem>
                    <SelectItem value="Sikkim">{t('fields.state.options.Sikkim')}</SelectItem>
                    <SelectItem value="Tamil Nadu">{t('fields.state.options.Tamil Nadu')}</SelectItem>
                    <SelectItem value="Telangana">{t('fields.state.options.Telangana')}</SelectItem>
                    <SelectItem value="Tripura">{t('fields.state.options.Tripura')}</SelectItem>
                    <SelectItem value="Uttar Pradesh">{t('fields.state.options.Uttar Pradesh')}</SelectItem>
                    <SelectItem value="Uttarakhand">{t('fields.state.options.Uttarakhand')}</SelectItem>
                    <SelectItem value="West Bengal">{t('fields.state.options.West Bengal')}</SelectItem>
                    <SelectItem value="Andaman and Nicobar Islands">{t('fields.state.options.Andaman and Nicobar Islands')}</SelectItem>
                    <SelectItem value="Chandigarh">{t('fields.state.options.Chandigarh')}</SelectItem>
                    <SelectItem value="Dadra and Nagar Haveli and Daman and Diu">{t('fields.state.options.Dadra and Nagar Haveli and Daman and Diu')}</SelectItem>
                    <SelectItem value="Delhi">{t('fields.state.options.Delhi')}</SelectItem>
                    <SelectItem value="Jammu and Kashmir">{t('fields.state.options.Jammu and Kashmir')}</SelectItem>
                    <SelectItem value="Ladakh">{t('fields.state.options.Ladakh')}</SelectItem>
                    <SelectItem value="Lakshadweep">{t('fields.state.options.Lakshadweep')}</SelectItem>
                    <SelectItem value="Puducherry">{t('fields.state.options.Puducherry')}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.state && (
                  <p className="text-sm text-red-500">{errors.state.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              disabled={true}
            >
              {t('buttons.previous')}
            </Button>
            <Button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700"
              disabled={isLoading}
            >
              {isLoading ? t('buttons.saving') : t('buttons.continue')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}