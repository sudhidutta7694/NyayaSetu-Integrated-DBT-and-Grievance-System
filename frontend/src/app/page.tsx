import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  ArrowRight,
  CheckCircle,
  Star,
  Award,
  TrendingUp
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-orange-600 to-green-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                NyayaSetu
              </h1>
              <h2 className="text-2xl md:text-3xl font-semibold mb-4">
                NyayaSetu - DBT & Grievance System
              </h2>
              <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
                Integrated Direct Benefit Transfer and Grievance System for effective implementation of PCR Act and PoA Act. 
                Ensuring justice and dignity for all citizens through technology-driven solutions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/login">
                  <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-3 text-lg">
                    Apply Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-3 text-lg">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Access Section */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Quick Access
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link href="/login" className="group">
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-2 border-orange-200 group-hover:border-orange-400">
                  <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                      <Shield className="h-6 w-6 text-orange-600" />
                    </div>
                    <CardTitle className="text-lg text-gray-700">Apply Now</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-gray-600">Click here for new applications</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard" className="group">
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-2 border-blue-200 group-hover:border-blue-400">
                  <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg text-gray-700">Application Status</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-gray-600">Check your application status</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/services" className="group">
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-2 border-green-200 group-hover:border-green-400">
                  <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <CardTitle className="text-lg text-gray-700">Services</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-gray-600">Learn about available services</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/help" className="group">
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-2 border-purple-200 group-hover:border-purple-400">
                  <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                      <Bell className="h-6 w-6 text-purple-600" />
                    </div>
                    <CardTitle className="text-lg text-gray-700">Help & Support</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-gray-600">Get help and support</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Key Features
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                NyayaSetu is a comprehensive platform designed for effective implementation of the PCR Act and PoA Act.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                  <Shield className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Secure & Transparent
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  End-to-end encryption and blockchain-ready architecture for maximum security and transparency in all transactions.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Multi-Role Support
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Designed for citizens, district authorities, social welfare departments, and financial institutions.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Real-time Processing
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Instant verification, tracking, and disbursement with real-time notifications and updates.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Our Achievements
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">10,000+</div>
                <div className="text-lg text-gray-700">Successful Applications</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">₹50 Cr+</div>
                <div className="text-lg text-gray-700">Amount Disbursed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">25+</div>
                <div className="text-lg text-gray-700">States Covered</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">99.9%</div>
                <div className="text-lg text-gray-700">Success Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Updates Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Latest Updates
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-2 border-orange-200">
                <CardHeader>
                  <div className="flex items-center space-x-2 mb-2">
                    <Award className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium text-orange-600">Notice</span>
                  </div>
                  <CardTitle className="text-lg text-gray-600">New Features Added</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    DigiLocker integration and enhanced security features have been added.
                  </p>
                  <p className="text-gray-500 text-xs mt-2">October 5, 2024</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-200">
                <CardHeader>
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">Update</span>
                  </div>
                  <CardTitle className="text-lg text-gray-600">Performance Improvements</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Significant improvements have been made to system speed and stability.
                  </p>
                  <p className="text-gray-500 text-xs mt-2">October 3, 2024</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200">
                <CardHeader>
                  <div className="flex items-center space-x-2 mb-2">
                    <Star className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Success</span>
                  </div>
                  <CardTitle className="text-lg text-gray-600">10,000+ Applications Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    We have crossed the milestone of 10,000+ successful applications.
                  </p>
                  <p className="text-gray-500 text-xs mt-2">October 1, 2024</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Information Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Contact Information
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
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Address</h3>
                <p className="text-gray-600">Ministry of Social Justice & Empowerment</p>
                <p className="text-gray-600">Shastri Bhawan, New Delhi - 110001</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
