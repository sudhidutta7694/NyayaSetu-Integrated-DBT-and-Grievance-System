'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Edit, Save, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/accessibility/LanguageSwitcher'
import { usersApi, UserProfile, UserUpdateData } from '@/lib/api/users'
import { showSuccessToast, showErrorToast } from '@/lib/toasts'

interface BankFormData {
  account_number: string
  ifsc_code: string
  bank_name: string
  branch_name: string
  account_holder_name: string
}

export default function ProfilePage(){
  const t = useTranslations('userProfile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editingBank, setEditingBank] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState<UserUpdateData>({})
  const [bankFormData, setBankFormData] = useState<BankFormData>({
    account_number: '',
    ifsc_code: '',
    bank_name: '',
    branch_name: '',
    account_holder_name: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const data = await usersApi.getMyProfile()
      setProfile(data)
      // Only initialize editable fields in formData
      setFormData({
        mother_name: data.mother_name || '',
        district: data.district || '',
        state: data.state || '',
        pincode: data.pincode || '',
        category: data.category,
      })
      // Initialize bank form data if bank account exists
      if (data.bank_accounts && data.bank_accounts.length > 0) {
        const firstBank = data.bank_accounts[0]
        setBankFormData({
          account_number: firstBank.account_number,
          ifsc_code: firstBank.ifsc_code,
          bank_name: firstBank.bank_name,
          branch_name: firstBank.branch_name,
          account_holder_name: firstBank.account_holder_name
        })
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      showErrorToast(t('toasts.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleBankSave = async () => {
    try {
      setSaving(true)
      
      // Validate bank form data
      if (!bankFormData.account_number || !bankFormData.ifsc_code || !bankFormData.bank_name || 
          !bankFormData.branch_name || !bankFormData.account_holder_name) {
        showErrorToast(t('toasts.fillAllFields'))
        return
      }
      
      // Validate IFSC code format
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/
      if (!ifscRegex.test(bankFormData.ifsc_code)) {
        showErrorToast(t('toasts.invalidIfsc'))
        return
      }
      
      // Validate account number (9-18 digits)
      if (bankFormData.account_number.length < 9 || bankFormData.account_number.length > 18) {
        showErrorToast(t('toasts.invalidAccountNumber'))
        return
      }
      
      await usersApi.saveBankAccount(bankFormData)
      
      showSuccessToast(t('toasts.bankSaved'))
      setEditingBank(false)
      await fetchProfile() // Refresh profile data
    } catch (error: any) {
      console.error('Failed to save bank details:', error)
      showErrorToast(error.message || t('toasts.bankSaveFailed'))
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      // Only send editable fields (not UIDAI fields)
      // UIDAI fields (cannot be updated): full_name, father_name, date_of_birth, age, gender, address, phone_number
      const editableData: UserUpdateData = {
        mother_name: formData.mother_name,
        category: formData.category,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,
      }
      const updated = await usersApi.updateMyProfile(editableData)
      setProfile(updated)
      setEditing(false)
      showSuccessToast(t('toasts.profileUpdated'))
    } catch (error: any) {
      console.error('Failed to update profile:', error)
      showErrorToast(error.response?.data?.detail || t('toasts.profileUpdateFailed'))
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        mother_name: profile.mother_name || '',
        district: profile.district || '',
        state: profile.state || '',
        pincode: profile.pincode || '',
        category: profile.category,
      })
    }
    setEditing(false)
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 w-40 bg-gray-200 rounded" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">{t('failedToLoad')}</p>
        <Button onClick={fetchProfile} className="mt-4">{t('retry')}</Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-sky-600" />
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {!editing && (
            <Button 
              onClick={() => setEditing(true)} 
              size="sm" 
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              {t('editButton')}
            </Button>
          )}
        </div>
      </div>

      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium tracking-wide text-gray-600">{t('accountDetails.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {editing ? (
            <div className="space-y-4">
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs text-blue-800">
                  <strong>{t('accountDetails.uidaiNote')}</strong>
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="flex items-center gap-1">
                    {t('accountDetails.fields.fullName')} * <span className="text-xs">🔒</span>
                  </Label>
                  <Input
                    id="full_name"
                    value={profile.full_name || ''}
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500">{t('accountDetails.fromUidai')}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="father_name" className="flex items-center gap-1">
                    {t('accountDetails.fields.fatherName')} <span className="text-xs">🔒</span>
                  </Label>
                  <Input
                    id="father_name"
                    value={profile.father_name || ''}
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500">{t('accountDetails.fromUidai')}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mother_name">{t('accountDetails.fields.motherName')}</Label>
                  <Input
                    id="mother_name"
                    value={formData.mother_name || ''}
                    onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth" className="flex items-center gap-2">
                    {t('accountDetails.fields.dateOfBirth')}
                    <span className="text-xs text-gray-500">({t('accountDetails.fromUidai')})</span>
                  </Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={profile.date_of_birth ? new Date(profile.date_of_birth).toISOString().split('T')[0] : ''}
                    disabled
                    className="bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age" className="flex items-center gap-2">
                    {t('accountDetails.fields.age')}
                    <span className="text-xs text-gray-500">({t('accountDetails.calculatedFromDob')})</span>
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={profile.age || ''}
                    disabled
                    className="bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="flex items-center gap-1">
                    {t('accountDetails.fields.gender')} <span className="text-xs">🔒</span>
                  </Label>
                  <select
                    id="gender"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 cursor-not-allowed"
                    value={profile.gender || ''}
                    disabled
                  >
                    <option value="">{t('accountDetails.genderOptions.select')}</option>
                    <option value="MALE">{t('accountDetails.genderOptions.male')}</option>
                    <option value="FEMALE">{t('accountDetails.genderOptions.female')}</option>
                    <option value="OTHER">{t('accountDetails.genderOptions.other')}</option>
                    <option value="PREFER_NOT_TO_SAY">{t('accountDetails.genderOptions.preferNotToSay')}</option>
                  </select>
                  <p className="text-xs text-gray-500">{t('accountDetails.fromUidai')}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">{t('accountDetails.fields.category')}</Label>
                  <select
                    id="category"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  >
                    <option value="">{t('accountDetails.categoryOptions.select')}</option>
                    <option value="SC">{t('accountDetails.categoryOptions.sc')}</option>
                    <option value="ST">{t('accountDetails.categoryOptions.st')}</option>
                    <option value="OBC">{t('accountDetails.categoryOptions.obc')}</option>
                    <option value="GENERAL">{t('accountDetails.categoryOptions.general')}</option>
                    <option value="OTHER">{t('accountDetails.categoryOptions.other')}</option>
                  </select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address" className="flex items-center gap-1">
                    {t('accountDetails.fields.address')} <span className="text-xs">🔒</span>
                  </Label>
                  <Input
                    id="address"
                    value={profile.address || ''}
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500">{t('accountDetails.fromUidai')}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">{t('accountDetails.fields.district')}</Label>
                  <Input
                    id="district"
                    value={formData.district || ''}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">{t('accountDetails.fields.state')}</Label>
                  <Input
                    id="state"
                    value={formData.state || ''}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">{t('accountDetails.fields.pincode')}</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode || ''}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  />
                </div>
              </div>
                            <div className="pt-4 flex gap-3">
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? t('buttons.saving') : t('buttons.saveChanges')}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setEditing(false)
                    setFormData({
                      mother_name: profile?.mother_name || '',
                      district: profile?.district || '',
                      state: profile?.state || '',
                      pincode: profile?.pincode || '',
                      category: profile?.category,
                    })
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  {t('buttons.cancel')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={t('accountDetails.fields.fullName')} value={profile.full_name} />
              <Field label={t('accountDetails.fields.email')} value={profile.email} />
              <Field label={t('accountDetails.fields.phone')} value={profile.phone_number} />
              <Field label={t('accountDetails.fields.aadhaar')} value={profile.aadhaar_number ? `****${profile.aadhaar_number.slice(-4)}` : t('notProvided')} />
              {profile.father_name && <Field label={t('accountDetails.fields.fatherName')} value={profile.father_name} />}
              {profile.mother_name && <Field label={t('accountDetails.fields.motherName')} value={profile.mother_name} />}
              {profile.date_of_birth && <Field label={t('accountDetails.fields.dateOfBirth')} value={new Date(profile.date_of_birth).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })} />}
              {profile.age && <Field label={t('accountDetails.fields.age')} value={t('accountDetails.fields.ageYears', { age: profile.age })} />}
              {profile.gender && <Field label={t('accountDetails.fields.gender')} value={profile.gender} />}
              {profile.category && <Field label={t('accountDetails.fields.category')} value={profile.category} />}
              {profile.address && <Field label={t('accountDetails.fields.address')} value={profile.address} />}
              {profile.district && <Field label={t('accountDetails.fields.district')} value={profile.district} />}
              {profile.state && <Field label={t('accountDetails.fields.state')} value={profile.state} />}
              {profile.pincode && <Field label={t('accountDetails.fields.pincode')} value={profile.pincode} />}
              <Field label={t('accountDetails.fields.role')} value={profile.role} />
              <Field 
                label={t('accountDetails.fields.verification')} 
                value={profile.is_verified ? t('accountDetails.verificationStatus.verified') : t('accountDetails.verificationStatus.pending')} 
                valueClass={profile.is_verified ? 'text-green-600' : 'text-amber-600'} 
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-gray-200">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium tracking-wide text-gray-600">{t('bankDetails.title')}</CardTitle>
          {!editingBank && (
            <Button 
              size="sm" 
              variant="outline"
              className="text-xs"
              onClick={() => setEditingBank(true)}
            >
              <Edit className="h-3 w-3 mr-1" />
              {profile.bank_accounts && profile.bank_accounts.length > 0 ? t('bankDetails.editButton') : t('bankDetails.addButton')} {t('bankDetails.bankDetailsText')}
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {editingBank ? (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account_holder_name" className="text-xs">{t('bankDetails.fields.accountHolderName')} *</Label>
                  <Input
                    id="account_holder_name"
                    value={bankFormData.account_holder_name}
                    onChange={(e) => setBankFormData({...bankFormData, account_holder_name: e.target.value})}
                    placeholder={t('bankDetails.fields.accountHolderPlaceholder')}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account_number" className="text-xs">{t('bankDetails.fields.accountNumber')} *</Label>
                  <Input
                    id="account_number"
                    value={bankFormData.account_number}
                    onChange={(e) => setBankFormData({...bankFormData, account_number: e.target.value})}
                    placeholder={t('bankDetails.fields.accountNumberPlaceholder')}
                    className="text-sm"
                    maxLength={18}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ifsc_code" className="text-xs">{t('bankDetails.fields.ifscCode')} *</Label>
                  <Input
                    id="ifsc_code"
                    value={bankFormData.ifsc_code}
                    onChange={(e) => setBankFormData({...bankFormData, ifsc_code: e.target.value.toUpperCase()})}
                    placeholder={t('bankDetails.fields.ifscPlaceholder')}
                    className="text-sm"
                    maxLength={11}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank_name" className="text-xs">{t('bankDetails.fields.bankName')} *</Label>
                  <Input
                    id="bank_name"
                    value={bankFormData.bank_name}
                    onChange={(e) => setBankFormData({...bankFormData, bank_name: e.target.value})}
                    placeholder={t('bankDetails.fields.bankNamePlaceholder')}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="branch_name" className="text-xs">{t('bankDetails.fields.branchName')} *</Label>
                  <Input
                    id="branch_name"
                    value={bankFormData.branch_name}
                    onChange={(e) => setBankFormData({...bankFormData, branch_name: e.target.value})}
                    placeholder={t('bankDetails.fields.branchPlaceholder')}
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  onClick={handleBankSave}
                  disabled={saving}
                  className="text-xs"
                >
                  <Save className="h-3 w-3 mr-1" />
                  {saving ? t('buttons.saving') : t('buttons.saveBankDetails')}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setEditingBank(false)
                    // Reset form data to current profile
                    if (profile?.bank_accounts && profile.bank_accounts.length > 0) {
                      const firstBank = profile.bank_accounts[0]
                      setBankFormData({
                        account_number: firstBank.account_number,
                        ifsc_code: firstBank.ifsc_code,
                        bank_name: firstBank.bank_name,
                        branch_name: firstBank.branch_name,
                        account_holder_name: firstBank.account_holder_name
                      })
                    }
                  }}
                  disabled={saving}
                  className="text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  {t('buttons.cancel')}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {profile.bank_accounts && profile.bank_accounts.length > 0 ? (
                <div className="space-y-4">
                  {profile.bank_accounts.map((bank: any, index: number) => (
                    <div key={bank.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                      {profile.bank_accounts && profile.bank_accounts.length > 1 && (
                        <div className="text-xs font-medium text-gray-600 mb-2">{t('bankDetails.bankDetailsText')} {t('bankDetails.accountNumber', { index: index + 1 })}</div>
                      )}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Field label={t('bankDetails.fields.accountHolderName')} value={bank.account_holder_name} />
                        <Field label={t('bankDetails.fields.accountNumber')} value={`****${bank.account_number.slice(-4)}`} />
                        <Field label={t('bankDetails.fields.ifscCode')} value={bank.ifsc_code} />
                        <Field label={t('bankDetails.fields.bankName')} value={bank.bank_name} />
                        <Field label={t('bankDetails.fields.branchName')} value={bank.branch_name} />
                        <Field 
                          label={t('bankDetails.fields.status')} 
                          value={bank.is_verified ? t('bankDetails.verificationStatus.verified') : t('bankDetails.verificationStatus.pending')} 
                          valueClass={bank.is_verified ? 'text-green-600' : 'text-amber-600'}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">
                  {t('bankDetails.noBankAccount')}
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Field({ label, value, valueClass }: { label:string; value:string; valueClass?:string }){
  return (
    <div className="space-y-1">
      <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium">{label}</p>
      <p className={`font-medium text-gray-900 ${valueClass||''}`}>{value}</p>
    </div>
  )
}