import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  Shield, 
  Users, 
  Clock, 
  FileText, 
  DollarSign, 
  Bell, 
  Globe, 
  Phone, 
  Mail, 
  MapPin,
  CheckCircle,
  Star,
  Award,
  TrendingUp,
  Target,
  Heart,
  BookOpen,
  Gavel,
  CreditCard,
  UserCheck,
  FileCheck,
  AlertCircle,
  MessageSquare,
  Download,
  Upload,
  Eye,
  Lock
} from 'lucide-react'

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-orange-600 to-green-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Our Services
              </h1>
              {/* Removed Hindi description */}
              <p className="text-lg md:text-xl max-w-4xl mx-auto leading-relaxed">
                Comprehensive services provided by NyayaSetu ensuring effective implementation of PCR Act and PoA Act.
              </p>
            </div>
          </div>
        </section>

        {/* Main Services Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Main Services
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Application Submission */}
              <Card className="border-2 border-orange-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-orange-600" />
                  </div>
                  {/* Removed Hindi title */}
                  <CardTitle className="text-xl text-gray-700">Application Submission</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Removed Hindi description */}
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Submit new applications under PCR Act and PoA Act. Secure and easy process.
                  </p>
                  <Link href="/login">
                    <Button className="w-full bg-orange-600 hover:bg-orange-700">
                      Apply Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Application Tracking */}
              <Card className="border-2 border-blue-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Eye className="h-8 w-8 text-blue-600" />
                  </div>
                  {/* Removed Hindi title */}
                  <CardTitle className="text-xl text-gray-700">Application Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Removed Hindi description */}
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Track real-time status of your application. Complete transparency in the process.
                  </p>
                  <Link href="/dashboard">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Check Status
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Document Verification */}
              <Card className="border-2 border-green-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <FileCheck className="h-8 w-8 text-green-600" />
                  </div>
                  {/* Removed Hindi title */}
                  <CardTitle className="text-xl text-gray-700">Document Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Removed Hindi description */}
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Document upload and verification through DigiLocker. Secure and fast process.
                  </p>
                  <Link href="/onboarding">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Upload Documents
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Fund Disbursement */}
              <Card className="border-2 border-purple-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <DollarSign className="h-8 w-8 text-purple-600" />
                  </div>
                  {/* Removed Hindi title */}
                  <CardTitle className="text-xl text-gray-700">Fund Disbursement</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Removed Hindi description */}
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Direct fund disbursement to bank accounts through DBT. Transparent and secure process.
                  </p>
                  <Link href="/dashboard">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      Check Disbursement
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Grievance Redressal */}
              <Card className="border-2 border-red-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                  {/* Removed Hindi title */}
                  <CardTitle className="text-xl text-gray-700">Grievance Redressal</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Removed Hindi description */}
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Register grievances and get quick redressal. 24x7 support available.
                  </p>
                  <Link href="/help">
                    <Button className="w-full bg-red-600 hover:bg-red-700">
                      Register Grievance
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Support Services */}
              <Card className="border-2 border-yellow-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8 text-yellow-600" />
                  </div>
                  {/* Removed Hindi title */}
                  <CardTitle className="text-xl text-gray-700">Support Services</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Removed Hindi description */}
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Chatbot, helpline and email support. Multilingual support available.
                  </p>
                  <Link href="/help">
                    <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                      Get Support
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Service Categories Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Service Categories
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Citizen Services */}
              <Card className="border-2 border-orange-200">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-gray-900">Citizen Services</CardTitle>
                      <CardDescription className="text-gray-600">For General Public</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-gray-700">Application Submission</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-gray-700">Status Tracking</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-gray-700">Document Upload</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-gray-700">Grievance Redressal</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-gray-700">Support Services</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Administrative Services */}
              <Card className="border-2 border-blue-200">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-gray-900">Administrative Services</CardTitle>
                      <CardDescription className="text-gray-600">For Officials & Authorities</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-gray-700">Application Review</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-gray-700">Document Verification</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-gray-700">Fund Disbursement</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-gray-700">Reporting</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-gray-700">Dashboard</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Process Flow Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Process Flow
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold text-orange-600">1</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Application Submission
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {/* Removed Hindi description */}
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Document Upload
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {/* Removed Hindi description */}
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold text-green-600">3</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Verification
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {/* Removed Hindi description */}
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold text-purple-600">4</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Fund Disbursement
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {/* Removed Hindi description */}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Service Support
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <Phone className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Helpline</h3>
                <p className="text-gray-600">+91-11-2338-1234</p>
                <p className="text-gray-600">24x7 Support</p>
              </div>

              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Email</h3>
                <p className="text-gray-600">info@nyayasetu.gov.in</p>
                <p className="text-gray-600">support@nyayasetu.gov.in</p>
              </div>

              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Chat Support</h3>
                <p className="text-gray-600">24x7 Chatbot</p>
                <p className="text-gray-600">Multilingual Support</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

