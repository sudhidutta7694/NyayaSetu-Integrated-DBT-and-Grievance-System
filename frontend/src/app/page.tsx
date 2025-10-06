import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Shield, 
  Users, 
  Clock, 
  FileText, 
  DollarSign, 
  Phone, 
  Mail, 
  MapPin,
  ArrowRight,
  Eye,
  FileCheck,
  AlertCircle,
  MessageSquare,
  Gavel
} from 'lucide-react'

import FAQSection from '@/components/landing/FAQSection'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-orange-600 to-green-600 text-white py-24 overflow-hidden">
          {/* Soft blurred gradient background shape */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute -top-32 -left-32 w-[600px] h-[400px] bg-gradient-to-br from-white/30 via-orange-200/40 to-green-200/40 rounded-full blur-3xl opacity-60" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-gradient-to-tr from-green-200/40 via-orange-100/30 to-white/0 rounded-full blur-2xl opacity-50" />
          </div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <span className="inline-block bg-white/20 text-white text-xs md:text-sm font-semibold px-4 py-1 rounded-full mb-6 tracking-widest uppercase shadow-sm backdrop-blur-sm">
              Empowering Justice & Dignity
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 drop-shadow-lg text-center">
              NyayaSetu
            </h1>
            <h2 className="text-xl md:text-2xl font-medium mb-6 text-white/90 text-center max-w-2xl">
              Integrated DBT & Grievance System for Social Justice
            </h2>
            <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed text-white/90 text-center">
              A unified platform for Direct Benefit Transfer and Grievance Redressal, ensuring effective implementation of PCR Act and PoA Act. Technology-driven, transparent, and accessible for all citizens.
            </p>
            <div className="flex justify-center w-full">
              <Link href="/login">
                <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-3 text-lg">
                  Apply Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Legal Framework Section */}
  <section id="about" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                About Us
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                NyayaSetu is a dedicated platform built to ensure the efficient implementation and seamless delivery of benefits under two key legislations.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-2 border-blue-200">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Gavel className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-gray-900">PCR Act, 1955</CardTitle>
                      <CardDescription className="text-gray-600">Protection of Civil Rights Act</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    The Protection of Civil Rights Act, 1955 aims to abolish untouchability and ensure equal civil rights for all citizens.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Shield className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-gray-900">PoA Act, 1989</CardTitle>
                      <CardDescription className="text-gray-600">Prevention of Atrocities Act</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    Prevention of Atrocities Act, 1989 aims to prevent atrocities and ensure justice for Scheduled Castes and Scheduled Tribes.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
  <section id="features" className="py-20 bg-gradient-to-b from-white to-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-4xl font-extrabold text-orange-600 mb-3 tracking-tight drop-shadow-sm">
                Key Features
              </h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                NyayaSetu is a comprehensive platform designed for effective implementation of the PCR Act and PoA Act.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Feature 1 */}
              <div className="group bg-white rounded-2xl shadow-lg border border-orange-100 hover:shadow-2xl transition-all duration-300 p-8 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute -top-6 right-6 opacity-10 text-orange-200 text-7xl pointer-events-none select-none">
                  <Shield className="w-20 h-20" />
                </div>
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-200 to-orange-400 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="h-8 w-8 text-orange-700" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-orange-700 transition-colors">
                  Secure & Transparent
                </h3>
                <p className="text-gray-600 leading-relaxed text-base">
                  End-to-end encryption and blockchain-ready architecture for maximum security and transparency in all transactions.
                </p>
              </div>
              {/* Feature 2 */}
              <div className="group bg-white rounded-2xl shadow-lg border border-blue-100 hover:shadow-2xl transition-all duration-300 p-8 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute -top-6 right-6 opacity-10 text-blue-200 text-7xl pointer-events-none select-none">
                  <Users className="w-20 h-20" />
                </div>
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-200 to-blue-400 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-blue-700" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">
                  Multi-Role Support
                </h3>
                <p className="text-gray-600 leading-relaxed text-base">
                  Designed for citizens, district authorities, social welfare departments, and financial institutions.
                </p>
              </div>
              {/* Feature 3 */}
              <div className="group bg-white rounded-2xl shadow-lg border border-green-100 hover:shadow-2xl transition-all duration-300 p-8 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute -top-6 right-6 opacity-10 text-green-200 text-7xl pointer-events-none select-none">
                  <Clock className="w-20 h-20" />
                </div>
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-200 to-green-400 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Clock className="h-8 w-8 text-green-700" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-700 transition-colors">
                  Real-time Processing
                </h3>
                <p className="text-gray-600 leading-relaxed text-base">
                  Instant verification, tracking, and disbursement with real-time notifications and updates.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Services Section */}
  <section id="services" className="py-16 bg-white">
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
                    Submit new applications under the PCR Act and PoA Act through a fast, secure, and hassle-free process.
                  </p>
                </CardContent>
              </Card>

              {/* Application Tracking */}
              <Card className="border-2 border-blue-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Eye className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-700">Application Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Effortlessly track your application’s real-time status with complete transparency, ensuring you stay informed at every step.
                  </p>
                </CardContent>
              </Card>

              {/* Document Verification */}
              <Card className="border-2 border-green-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <FileCheck className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-700">Document Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Upload and verify your documents seamlessly through DigiLocker, ensuring a secure and hassle-free process.
                  </p>
                </CardContent>
              </Card>

              {/* Fund Disbursement */}
              <Card className="border-2 border-purple-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <DollarSign className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-700">Fund Disbursement</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Receive funds directly in your bank account, ensuring a fast, transparent, and highly secure disbursement process.
                  </p>
                </CardContent>
              </Card>

              {/* Grievance Redressal */}
              <Card className="border-2 border-red-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-700">Grievance Redressal</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Removed Hindi description */}
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Easily register your grievances and receive prompt redressal with dedicated 24×7 support to assist you at every step.
                  </p>
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
                    Access support through chatbot, helpline, and email, with multilingual assistance to ensure smooth communication.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <div id="faq">
          <FAQSection />
        </div>

        {/* Contact Information Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Contact Information
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Reach out to us through various channels. We are here to assist you.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Helpline Card */}
              <div className="text-center bg-gray-50 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="mx-auto w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <Phone className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Helpline</h3>
                <p className="text-gray-700 mb-1">+91-11-2338-1234</p>
                <p className="text-gray-700 mb-1">+91-11-2338-5678</p>
                <p className="text-xs text-gray-500 mt-2">24x7 Support</p>
              </div>
              {/* Email Card */}
              <div className="text-center bg-gray-50 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="mx-auto w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Email</h3>
                <p className="text-gray-700 mb-1">info@nyayasetu.gov.in</p>
                <p className="text-gray-700 mb-1">support@nyayasetu.gov.in</p>
                <p className="text-xs text-gray-500 mt-2">Response within 24 hours</p>
              </div>
              {/* Address Card */}
              <div className="text-center bg-gray-50 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="mx-auto w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Address</h3>
                <p className="text-gray-700 mb-1">Ministry of Social Justice & Empowerment</p>
                <p className="text-gray-700 mb-1">Shastri Bhawan</p>
                <p className="text-gray-700 mb-1">New Delhi - 110001</p>
              </div>
              {/* Working Hours Card */}
              <div className="text-center bg-gray-50 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="mx-auto w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Working Hours</h3>
                <p className="text-gray-700 mb-1">Mon - Fri</p>
                <p className="text-gray-700 mb-1">9:00 AM - 6:00 PM</p>
                <p className="text-xs text-gray-500 mt-2">Helpline 24x7</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
