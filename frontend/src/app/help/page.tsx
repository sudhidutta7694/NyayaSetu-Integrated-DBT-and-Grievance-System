import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  Search,
  HelpCircle,
  BookOpen,
  Video,
  Download,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Globe,
  Headphones,
  Send,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-orange-600 to-green-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Help & Support
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
                We are here to help you. Get answers to common questions, guides and support.
              </p>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Search Help
              </h2>
              <p className="text-gray-600">
                Find answers to your questions
              </p>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input 
                placeholder="Type your question here"
                className="pl-10 pr-4 py-3 text-lg border-2 border-gray-300 focus:border-orange-500"
              />
              <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-600 hover:bg-orange-700">
                Search
              </Button>
            </div>
          </div>
        </section>

        {/* Quick Help Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Quick Help
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Find answers to the most common questions here.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center border-2 border-orange-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <HelpCircle className="h-8 w-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">FAQ</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Answers to the most common questions
                  </p>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    View
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center border-2 border-blue-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <BookOpen className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">User Guide</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Step-by-step guide
                  </p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Read
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center border-2 border-green-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Video className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">Video Tutorials</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Video guides and tutorials
                  </p>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Watch
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center border-2 border-purple-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <Download className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Downloadable documents
                  </p>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Download
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-gray-600">
                Find answers to the most common questions here.
              </p>
            </div>
            
            <div className="space-y-6">
              <Card className="border-2 border-orange-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-gray-900">
                      What is NyayaSetu?
                    </CardTitle>
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    NyayaSetu is a comprehensive platform designed for effective implementation of the PCR Act and PoA Act. It provides an integrated solution for Direct Benefit Transfer and Grievance System.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-gray-900">
                      How to apply?
                    </CardTitle>
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    To apply, first log in using Aadhaar OTP, then upload the required documents and submit your application. The entire process is online.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-gray-900">
                      How to check application status?
                    </CardTitle>
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    To check your application status, log in to the dashboard and go to the "Application Status" section. There you can see the real-time status of all your applications.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-gray-900">
                      What documents are required?
                    </CardTitle>
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    Required documents include caste certificate, bank passbook, Aadhaar card, and other relevant documents. All documents can be uploaded via DigiLocker.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-red-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-gray-900">
                      How to register a complaint?
                    </CardTitle>
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    To register a complaint, go to the "Help & Support" section and click on "Register Grievance". Your complaint will be resolved within 24-48 hours.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Support Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Contact Support
              </h2>
              <p className="text-lg text-gray-600">
                If you need any assistance, please contact us.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <Card className="text-center border-2 border-orange-200">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <Phone className="h-8 w-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">Helpline</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-2">+91-11-2338-1234</p>
                  <p className="text-sm text-gray-500">24x7 Support</p>
                </CardContent>
              </Card>

              <Card className="text-center border-2 border-blue-200">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">Chat Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-2">24x7 Chatbot</p>
                  <p className="text-sm text-gray-500">Multilingual Support</p>
                </CardContent>
              </Card>

              <Card className="text-center border-2 border-green-200">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Mail className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">Email Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-2">support@nyayasetu.gov.in</p>
                  <p className="text-sm text-gray-500">Response within 24 hours</p>
                </CardContent>
              </Card>
            </div>

            {/* Support Form */}
            <Card className="border-2 border-orange-200">
              <CardHeader>
                <CardTitle className="text-2xl text-center text-gray-900">
                  Support Request
                </CardTitle>
                <CardDescription className="text-center text-gray-600">
                  Describe your problem
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="support-name" className="text-gray-700">
                      Name *
                    </Label>
                    <Input 
                      id="support-name" 
                      placeholder="Enter your name"
                      className="border-gray-300 focus:border-orange-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="support-email" className="text-gray-700">
                      Email *
                    </Label>
                    <Input 
                      id="support-email" 
                      type="email"
                      placeholder="Enter your email"
                      className="border-gray-300 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support-subject" className="text-gray-700">
                    Subject *
                  </Label>
                  <Input 
                    id="support-subject" 
                    placeholder="Subject of the problem"
                    className="border-gray-300 focus:border-orange-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support-message" className="text-gray-700">
                    Problem Description *
                  </Label>
                  <Textarea 
                    id="support-message" 
                    placeholder="Provide detailed description of your problem"
                    className="min-h-[120px] border-gray-300 focus:border-orange-500"
                  />
                </div>

                <div className="text-center">
                  <Button className="bg-orange-600 hover:bg-orange-700 px-8 py-3 text-lg">
                    <Send className="mr-2 h-5 w-5" />
                    Send Support Request
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Emergency Contact Section */}
        <section className="py-16 bg-red-50 border-t-4 border-red-500">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-8">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Emergency Support
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Contact immediately in case of emergency situations.
              </p>
            </div>
            
            <Card className="border-2 border-red-200 bg-white">
              <CardContent className="py-8">
                <div className="text-4xl font-bold text-red-600 mb-4">
                  +91-11-2338-EMERGENCY
                </div>
                <p className="text-lg text-gray-700 mb-4">
                  24x7 helpline for emergency situations
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}

