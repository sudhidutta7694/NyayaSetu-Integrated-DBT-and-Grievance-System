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
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Upload, FileText, User, Phone, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'
import toast from 'react-hot-toast'

const personalInfoSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  fatherName: z.string().min(2, 'Father\'s name must be at least 2 characters'),
  motherName: z.string().min(2, 'Mother\'s name must be at least 2 characters'),
  dateOfBirth: z.date({
    required_error: 'Date of birth is required',
  }),
  age: z.number().min(1, 'Age must be at least 1').max(120, 'Age must be less than 120'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'], {
    required_error: 'Please select a gender',
  }),
  category: z.enum(['SC', 'ST', 'OBC', 'GENERAL'], {
    required_error: 'Please select a category',
  }),
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/, 'Invalid mobile number'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  district: z.string().min(2, 'District is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
})

type PersonalInfoForm = z.infer<typeof personalInfoSchema>

interface PersonalInfoStepProps {
  onComplete: (data: PersonalInfoForm) => void
  onPrevious: () => void
  initialData?: any
}

export default function PersonalInfoStep({ onComplete, onPrevious, initialData }: PersonalInfoStepProps) {
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [date, setDate] = useState<Date | undefined>(initialData?.dateOfBirth)

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

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    if (selectedDate) {
      setValue('dateOfBirth', selectedDate)
      const age = calculateAge(selectedDate)
      setValue('age', age)
    }
  }

  const onSubmit = async (data: PersonalInfoForm) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Personal information saved successfully!')
      onComplete(data)
    } catch (error) {
      toast.error('Failed to save personal information')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-6 w-6 text-orange-600" />
          <span>{t('onboarding.step1.title', 'Personal Information')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t('onboarding.fullName', 'Full Name')} *</Label>
              <Input
                id="fullName"
                {...register('fullName')}
                placeholder={t('onboarding.fullNamePlaceholder', 'Enter your full name')}
                className={errors.fullName ? 'border-red-500' : ''}
              />
              {errors.fullName && (
                <p className="text-sm text-red-500">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fatherName">{t('onboarding.fatherName', 'Father\'s Name')} *</Label>
              <Input
                id="fatherName"
                {...register('fatherName')}
                placeholder={t('onboarding.fatherNamePlaceholder', 'Enter father\'s full name')}
                className={errors.fatherName ? 'border-red-500' : ''}
              />
              {errors.fatherName && (
                <p className="text-sm text-red-500">{errors.fatherName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="motherName">{t('onboarding.motherName', 'Mother\'s Name')} *</Label>
              <Input
                id="motherName"
                {...register('motherName')}
                placeholder={t('onboarding.motherNamePlaceholder', 'Enter mother\'s full name')}
                className={errors.motherName ? 'border-red-500' : ''}
              />
              {errors.motherName && (
                <p className="text-sm text-red-500">{errors.motherName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t('onboarding.dateOfBirth', 'Date of Birth')} *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !date && 'text-muted-foreground',
                      errors.dateOfBirth && 'border-red-500'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>{t('onboarding.selectDate', 'Select date')}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.dateOfBirth && (
                <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">{t('onboarding.age', 'Age')}</Label>
              <Input
                id="age"
                type="number"
                {...register('age', { valueAsNumber: true })}
                placeholder="0"
                readOnly
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label>{t('onboarding.gender', 'Gender')} *</Label>
              <Select onValueChange={(value) => setValue('gender', value as any)}>
                <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                  <SelectValue placeholder={t('onboarding.selectGender', 'Select gender')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">{t('onboarding.male', 'Male')}</SelectItem>
                  <SelectItem value="FEMALE">{t('onboarding.female', 'Female')}</SelectItem>
                  <SelectItem value="OTHER">{t('onboarding.other', 'Other')}</SelectItem>
                  <SelectItem value="PREFER_NOT_TO_SAY">{t('onboarding.preferNotToSay', 'Prefer not to say')}</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-sm text-red-500">{errors.gender.message}</p>
              )}
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label>{t('onboarding.category', 'Category')} *</Label>
            <Select onValueChange={(value) => setValue('category', value as any)}>
              <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                <SelectValue placeholder={t('onboarding.selectCategory', 'Select category')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SC">{t('onboarding.sc', 'SC (Scheduled Caste)')}</SelectItem>
                <SelectItem value="ST">{t('onboarding.st', 'ST (Scheduled Tribe)')}</SelectItem>
                <SelectItem value="OBC">{t('onboarding.obc', 'OBC (Other Backward Class)')}</SelectItem>
                <SelectItem value="GENERAL">{t('onboarding.general', 'General')}</SelectItem>
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
                <span>{t('onboarding.mobileNumber', 'Mobile Number')} *</span>
              </Label>
              <Input
                id="mobileNumber"
                {...register('mobileNumber')}
                placeholder={t('onboarding.mobileNumberPlaceholder', 'Enter 10-digit mobile number')}
                className={errors.mobileNumber ? 'border-red-500' : ''}
              />
              {errors.mobileNumber && (
                <p className="text-sm text-red-500">{errors.mobileNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pincode" className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>{t('onboarding.pincode', 'Pincode')} *</span>
              </Label>
              <Input
                id="pincode"
                {...register('pincode')}
                placeholder={t('onboarding.pincodePlaceholder', 'Enter 6-digit pincode')}
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
                <span>{t('onboarding.address', 'Address')} *</span>
              </Label>
              <Input
                id="address"
                {...register('address')}
                placeholder={t('onboarding.addressPlaceholder', 'Enter your complete address')}
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="district">{t('onboarding.district', 'District')} *</Label>
                <Input
                  id="district"
                  {...register('district')}
                  placeholder={t('onboarding.districtPlaceholder', 'Enter district')}
                  className={errors.district ? 'border-red-500' : ''}
                />
                {errors.district && (
                  <p className="text-sm text-red-500">{errors.district.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">{t('onboarding.state', 'State')} *</Label>
                <Input
                  id="state"
                  {...register('state')}
                  placeholder={t('onboarding.statePlaceholder', 'Enter state')}
                  className={errors.state ? 'border-red-500' : ''}
                />
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
              disabled={isLoading}
            >
              {t('onboarding.previous', 'Previous')}
            </Button>
            <Button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700"
              disabled={isLoading}
            >
              {isLoading ? t('onboarding.saving', 'Saving...') : t('onboarding.continue', 'Continue')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}