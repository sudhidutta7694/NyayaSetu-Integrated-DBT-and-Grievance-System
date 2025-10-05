'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  FileText, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Shield,
  Building,
  UserCheck
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface DashboardStats {
  totalUsers: number
  verifiedUsers: number
  onboardedUsers: number
  pendingDocuments: number
  verifiedDocuments: number
  rejectedDocuments: number
  usersByRole: Record<string, number>
  verificationRate: number
  onboardingRate: number
}

interface PendingDocument {
  id: string
  documentType: string
  documentName: string
  userName: string
  userEmail: string
  status: string
  createdAt: string
}

const AdminDashboard = () => {
  const { t } = useLanguage()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [pendingDocuments, setPendingDocuments] = useState<PendingDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Mock data - replace with actual API calls
      const mockStats: DashboardStats = {
        totalUsers: 1250,
        verifiedUsers: 980,
        onboardedUsers: 850,
        pendingDocuments: 45,
        verifiedDocuments: 1200,
        rejectedDocuments: 25,
        usersByRole: {
          PUBLIC: 1000,
          DISTRICT_AUTHORITY: 50,
          SOCIAL_WELFARE: 75,
          FINANCIAL_INSTITUTION: 25,
          ADMIN: 5
        },
        verificationRate: 78.4,
        onboardingRate: 68.0
      }

      const mockPendingDocuments: PendingDocument[] = [
        {
          id: '1',
          documentType: 'CASTE_CERTIFICATE',
          documentName: 'Caste Certificate - John Doe',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          status: 'PENDING',
          createdAt: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          documentType: 'BANK_PASSBOOK',
          documentName: 'Bank Passbook - Jane Smith',
          userName: 'Jane Smith',
          userEmail: 'jane@example.com',
          status: 'PENDING',
          createdAt: '2024-01-15T09:15:00Z'
        }
      ]

      setStats(mockStats)
      setPendingDocuments(mockPendingDocuments)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyDocument = async (documentId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      // Mock API call
      console.log(`Verifying document ${documentId} as ${status}`)
      // Update local state
      setPendingDocuments(prev => prev.filter(doc => doc.id !== documentId))
    } catch (error) {
      console.error('Failed to verify document:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('admin.dashboard.title', 'Admin Dashboard')}
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            {t('admin.dashboard.subtitle', 'Monitor and manage the NyayaSetu platform')}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('admin.stats.totalUsers', 'Total Users')}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {t('admin.stats.registeredUsers', 'Registered users')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('admin.stats.verifiedUsers', 'Verified Users')}
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.verifiedUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.verificationRate.toFixed(1)}% {t('admin.stats.verificationRate', 'verification rate')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('admin.stats.onboardedUsers', 'Onboarded Users')}
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.onboardedUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.onboardingRate.toFixed(1)}% {t('admin.stats.onboardingRate', 'onboarding rate')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('admin.stats.pendingDocuments', 'Pending Documents')}
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingDocuments}</div>
              <p className="text-xs text-muted-foreground">
                {t('admin.stats.awaitingVerification', 'Awaiting verification')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">
              {t('admin.tabs.overview', 'Overview')}
            </TabsTrigger>
            <TabsTrigger value="documents">
              {t('admin.tabs.documents', 'Document Verification')}
            </TabsTrigger>
            <TabsTrigger value="users">
              {t('admin.tabs.users', 'User Management')}
            </TabsTrigger>
            <TabsTrigger value="reports">
              {t('admin.tabs.reports', 'Reports')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Users by Role */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('admin.overview.usersByRole', 'Users by Role')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.usersByRole && Object.entries(stats.usersByRole).map(([role, count]) => (
                      <div key={role} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {role === 'PUBLIC' && <Users className="h-4 w-4 text-blue-600" />}
                          {role === 'DISTRICT_AUTHORITY' && <Building className="h-4 w-4 text-green-600" />}
                          {role === 'SOCIAL_WELFARE' && <Shield className="h-4 w-4 text-purple-600" />}
                          {role === 'FINANCIAL_INSTITUTION' && <CreditCard className="h-4 w-4 text-orange-600" />}
                          {role === 'ADMIN' && <UserCheck className="h-4 w-4 text-red-600" />}
                          <span className="text-sm font-medium">
                            {t(`admin.roles.${role.toLowerCase()}`, role)}
                          </span>
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Document Status */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('admin.overview.documentStatus', 'Document Status')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">
                          {t('admin.documents.verified', 'Verified')}
                        </span>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {stats?.verifiedDocuments}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium">
                          {t('admin.documents.pending', 'Pending')}
                        </span>
                      </div>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        {stats?.pendingDocuments}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium">
                          {t('admin.documents.rejected', 'Rejected')}
                        </span>
                      </div>
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        {stats?.rejectedDocuments}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.documents.pendingVerification', 'Pending Document Verification')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingDocuments.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      {t('admin.documents.noPending', 'No pending documents for verification')}
                    </p>
                  ) : (
                    pendingDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <FileText className="h-8 w-8 text-gray-400" />
                          <div>
                            <p className="font-medium">{doc.documentName}</p>
                            <p className="text-sm text-gray-600">
                              {t('admin.documents.uploadedBy', 'Uploaded by')}: {doc.userName} ({doc.userEmail})
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(doc.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleVerifyDocument(doc.id, 'VERIFIED')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {t('admin.documents.verify', 'Verify')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerifyDocument(doc.id, 'REJECTED')}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {t('admin.documents.reject', 'Reject')}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.users.userManagement', 'User Management')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-8">
                  {t('admin.users.comingSoon', 'User management interface coming soon')}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.reports.title', 'Reports & Analytics')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-8">
                  {t('admin.reports.comingSoon', 'Reports and analytics coming soon')}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AdminDashboard

