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
  CheckCircle,
  Star,
  Award,
  TrendingUp,
  Target,
  Heart,
  BookOpen,
  Gavel
} from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-orange-600 to-green-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                About Us
              </h1>
              <p className="text-lg md:text-xl max-w-4xl mx-auto leading-relaxed">
                NyayaSetu is a comprehensive platform designed for effective implementation of PCR Act and PoA Act, ensuring justice and dignity for all citizens.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <Card className="border-2 border-orange-200">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                    <Target className="h-8 w-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-2xl text-gray-900">Our Mission</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    Our mission is to ensure justice and dignity for all citizens through technology-driven solutions for effective implementation of PCR Act and PoA Act.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <Heart className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl text-gray-900">Our Vision</CardTitle>
                </CardHeader>
                <CardContent><p className="text-gray-600 leading-relaxed">
                    A India where every citizen gets equal rights and justice, where social justice is established and dignified life is ensured for all.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Legal Framework Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Legal Framework
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                NyayaSetu is designed for the effective implementation of two important laws.
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
                    Developed and managed by a dedicated team from the Ministry of Social Justice and Empowerment.
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
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Key Features
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Content specialists ensuring multilingual content and accessibility features.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                  <Shield className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Quality Team
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  End-to-end encryption and blockchain-ready architecture for maximum security and transparency in all transactions.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Quality assurance specialists ensuring the security and reliability of the platform.
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
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                  <Globe className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Multilingual Support
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Support for multiple Indian languages with proper localization and accessibility features.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                  <DollarSign className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Direct Benefit Transfer
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Direct Benefit Transfer integration for seamless and transparent fund disbursement.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                  <Bell className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Smart Notifications
                </h3>
                <p className="text-gray-600">24x7 Support</p>
                <p className="text-gray-600 leading-relaxed">
                  Intelligent notification system with SMS, email, and push notification support.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* Team Section */}
                                Email
        {/* Team Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Our Team
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                NyayaSetu is developed and managed by a dedicated team from the Ministry of Social Justice and Empowerment.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center border-2 border-orange-200">
                <CardHeader>
                  <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <Users className="h-10 w-10 text-orange-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">Development Team</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    A dedicated team of technical experts developing the platform using the latest technologies.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-2 border-blue-200">
                <CardHeader>
                  <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <BookOpen className="h-10 w-10 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">Content Team</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    Content specialists ensuring multilingual content and accessibility features.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-2 border-green-200">
                <CardHeader>
                  <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Award className="h-10 w-10 text-green-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">Quality Team</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    Quality assurance specialists ensuring the security and reliability of the platform.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-16 bg-white">
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

