'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
// import { Progress } from '@/components/ui/progress' // Temporarily commented out due to build error
import { 
  User, 
  FileText, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Plus,
  Eye,
  Download,
  Bell
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import Link from 'next/link'

interface UserProfile {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  isVerified: boolean
  isOnboarded: boolean
  onboardingStep: number
  role: string
}

interface Application {
  id: string
  applicationNumber: string
  title: string
  status: string
  amountRequested: number
  amountApproved?: number
  createdAt: string
  updatedAt: string
}

interface Document {
  id: string
  documentType: string
  documentName: string
  status: string
  uploadedAt: string
}

const UserDashboard = () => {
  const { t } = useLanguage()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      // Mock data - replace with actual API calls
      const mockProfile: UserProfile = {
        id: '1',
        fullName: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '+91 9876543210',
        isVerified: true,
        isOnboarded: true,
        onboardingStep: 4,
        role: 'PUBLIC'
      }

      const mockApplications: Application[] = [
        {
          id: '1',
          applicationNumber: 'APP-2024-001',
          title: 'PCR Act Compensation Application',
          status: 'UNDER_REVIEW',
          amountRequested: 50000,
          amountApproved: 45000,
          createdAt: '2024-01-10T10:00:00Z',
          updatedAt: '2024-01-15T14:30:00Z'
        },
        {
          id: '2',
          applicationNumber: 'APP-2024-002',
          title: 'PoA Act Legal Aid Application',
          status: 'APPROVED',
          amountRequested: 25000,
          amountApproved: 25000,
          createdAt: '2024-01-05T09:00:00Z',
          updatedAt: '2024-01-12T16:45:00Z'
        }
      ]

      const mockDocuments: Document[] = [
        {
          id: '1',
          documentType: 'CASTE_CERTIFICATE',
          documentName: 'Caste Certificate.pdf',
          status: 'VERIFIED',
          uploadedAt: '2024-01-08T11:00:00Z'
        },
        {
          id: '2',
          documentType: 'BANK_PASSBOOK',
          documentName: 'Bank Passbook.pdf',
          status: 'VERIFIED',
          uploadedAt: '2024-01-08T11:30:00Z'
        }
      ]

      setUserProfile(mockProfile)
      setApplications(mockApplications)
      setDocuments(mockDocuments)
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'UNDER_REVIEW':
        return 'bg-yellow-100 text-yellow-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'VERIFIED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'VERIFIED':
        return <CheckCircle className="h-4 w-4" />
      case 'UNDER_REVIEW':
      case 'PENDING':
        return <Clock className="h-4 w-4" />
      case 'REJECTED':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('dashboard.error.title', 'Error Loading Dashboard')}
          </h2>
          <p className="text-gray-600">
            {t('dashboard.error.message', 'Unable to load your dashboard. Please try again.')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('dashboard.welcome', 'Welcome back')}, {userProfile.fullName}!
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                {t('dashboard.subtitle', 'Manage your applications and track your benefits')}
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                {t('dashboard.notifications', 'Notifications')}
              </Button>
              <Link href="/applications/new">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('dashboard.newApplication', 'New Application')}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Profile Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.profile.verification', 'Account Verification')}
              </CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {userProfile.isVerified ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="text-sm font-medium">
                  {userProfile.isVerified 
                    ? t('dashboard.profile.verified', 'Verified')
                    : t('dashboard.profile.notVerified', 'Not Verified')
                  }
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.profile.onboarding', 'Profile Completion')}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{t('dashboard.profile.progress', 'Progress')}</span>
                  <span>{userProfile.onboardingStep}/4</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${(userProfile.onboardingStep / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.profile.documents', 'Documents')}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documents.length}</div>
              <p className="text-xs text-muted-foreground">
                {documents.filter(doc => doc.status === 'VERIFIED').length} {t('dashboard.profile.verified', 'verified')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Applications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t('dashboard.applications.title', 'My Applications')}</CardTitle>
                <Link href="/applications">
                  <Button variant="outline" size="sm">
                    {t('dashboard.applications.viewAll', 'View All')}
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      {t('dashboard.applications.noApplications', 'No applications yet')}
                    </p>
                    <Link href="/applications/new">
                      <Button className="bg-orange-600 hover:bg-orange-700">
                        <Plus className="h-4 w-4 mr-2" />
                        {t('dashboard.applications.createFirst', 'Create Your First Application')}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  applications.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <FileText className="h-8 w-8 text-gray-400" />
                        <div>
                          <p className="font-medium">{app.title}</p>
                          <p className="text-sm text-gray-600">
                            {t('dashboard.applications.applicationNumber', 'Application')}: {app.applicationNumber}
                          </p>
                          <p className="text-sm text-gray-600">
                            {t('dashboard.applications.amount', 'Amount')}: ₹{app.amountRequested.toLocaleString()}
                            {app.amountApproved && (
                              <span className="text-green-600 ml-2">
                                (₹{app.amountApproved.toLocaleString()} {t('dashboard.applications.approved', 'approved')})
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(app.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(app.status)}
                            <span className="text-xs">
                              {t(`dashboard.applications.status.${app.status.toLowerCase()}`, app.status)}
                            </span>
                          </div>
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t('dashboard.documents.title', 'My Documents')}</CardTitle>
                <Link href="/documents">
                  <Button variant="outline" size="sm">
                    {t('dashboard.documents.viewAll', 'View All')}
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      {t('dashboard.documents.noDocuments', 'No documents uploaded')}
                    </p>
                    <Link href="/onboarding">
                      <Button className="bg-orange-600 hover:bg-orange-700">
                        {t('dashboard.documents.uploadDocuments', 'Upload Documents')}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <FileText className="h-8 w-8 text-gray-400" />
                        <div>
                          <p className="font-medium">{doc.documentName}</p>
                          <p className="text-sm text-gray-600">
                            {t(`dashboard.documents.types.${doc.documentType.toLowerCase()}`, doc.documentType)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(doc.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(doc.status)}
                            <span className="text-xs">
                              {t(`dashboard.documents.status.${doc.status.toLowerCase()}`, doc.status)}
                            </span>
                          </div>
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{t('dashboard.quickActions.title', 'Quick Actions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link href="/applications/new">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                  <Plus className="h-6 w-6" />
                  <span>{t('dashboard.quickActions.newApplication', 'New Application')}</span>
                </Button>
              </Link>
              <Link href="/documents">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                  <FileText className="h-6 w-6" />
                  <span>{t('dashboard.quickActions.manageDocuments', 'Manage Documents')}</span>
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                  <User className="h-6 w-6" />
                  <span>{t('dashboard.quickActions.updateProfile', 'Update Profile')}</span>
                </Button>
              </Link>
              <Link href="/help">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                  <Bell className="h-6 w-6" />
                  <span>{t('dashboard.quickActions.getHelp', 'Get Help')}</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default UserDashboard