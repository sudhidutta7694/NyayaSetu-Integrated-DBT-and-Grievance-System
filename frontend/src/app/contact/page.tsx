import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageSquare, 
  Send,
  Building,
  User,
  FileText,
  Globe,
  Headphones
} from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-orange-600 to-green-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                संपर्क करें | Contact Us
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
                हमसे संपर्क करें। हम आपकी सहायता के लिए यहाँ हैं। 24x7 सहायता उपलब्ध है।
              </p>
              <p className="text-lg md:text-xl max-w-4xl mx-auto leading-relaxed">
                Get in touch with us. We are here to help you. 24x7 support is available.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Information Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                संपर्क जानकारी | Contact Information
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                विभिन्न तरीकों से हमसे संपर्क करें। हम आपकी सहायता के लिए तैयार हैं।
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center border-2 border-orange-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <Phone className="h-8 w-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">हेल्पलाइन | Helpline</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-2">+91-11-2338-1234</p>
                  <p className="text-gray-600 mb-2">+91-11-2338-5678</p>
                  <p className="text-sm text-gray-500">24x7 सहायता | 24x7 Support</p>
                </CardContent>
              </Card>

              <Card className="text-center border-2 border-blue-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Mail className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">ईमेल | Email</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-2">info@nyayasetu.gov.in</p>
                  <p className="text-gray-600 mb-2">support@nyayasetu.gov.in</p>
                  <p className="text-sm text-gray-500">24 घंटे में जवाब | Response within 24 hours</p>
                </CardContent>
              </Card>

              <Card className="text-center border-2 border-green-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">पता | Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-2">Ministry of Social Justice & Empowerment</p>
                  <p className="text-gray-600 mb-2">Shastri Bhawan</p>
                  <p className="text-gray-600 mb-2">New Delhi - 110001</p>
                </CardContent>
              </Card>

              <Card className="text-center border-2 border-purple-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <Clock className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">कार्य समय | Working Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-2">सोमवार - शुक्रवार | Mon - Fri</p>
                  <p className="text-gray-600 mb-2">9:00 AM - 6:00 PM</p>
                  <p className="text-sm text-gray-500">हेल्पलाइन 24x7 | Helpline 24x7</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                संपर्क फॉर्म | Contact Form
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                अपनी जांच या शिकायत यहाँ दर्ज करें। हम जल्द से जल्द आपसे संपर्क करेंगे।
              </p>
            </div>
            
            <Card className="border-2 border-orange-200">
              <CardHeader>
                <CardTitle className="text-2xl text-center text-gray-900">
                  हमसे संपर्क करें | Get in Touch
                </CardTitle>
                <CardDescription className="text-center text-gray-600">
                  अपनी जानकारी भरें और हमसे संपर्क करें | Fill in your details and contact us
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700">
                      नाम | Name *
                    </Label>
                    <Input 
                      id="name" 
                      placeholder="अपना नाम दर्ज करें | Enter your name"
                      className="border-gray-300 focus:border-orange-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">
                      ईमेल | Email *
                    </Label>
                    <Input 
                      id="email" 
                      type="email"
                      placeholder="अपना ईमेल दर्ज करें | Enter your email"
                      className="border-gray-300 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700">
                      फोन नंबर | Phone Number
                    </Label>
                    <Input 
                      id="phone" 
                      placeholder="अपना फोन नंबर दर्ज करें | Enter your phone number"
                      className="border-gray-300 focus:border-orange-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-gray-700">
                      विषय | Subject *
                    </Label>
                    <Input 
                      id="subject" 
                      placeholder="विषय दर्ज करें | Enter subject"
                      className="border-gray-300 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-gray-700">
                    संदेश | Message *
                  </Label>
                  <Textarea 
                    id="message" 
                    placeholder="अपना संदेश यहाँ लिखें | Write your message here"
                    className="min-h-[120px] border-gray-300 focus:border-orange-500"
                  />
                </div>

                <div className="text-center">
                  <Button className="bg-orange-600 hover:bg-orange-700 px-8 py-3 text-lg">
                    <Send className="mr-2 h-5 w-5" />
                    संदेश भेजें | Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Department Contacts Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                विभागीय संपर्क | Departmental Contacts
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                विभिन्न विभागों के लिए विशिष्ट संपर्क जानकारी।
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-2 border-orange-200">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Building className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-gray-900">सामाजिक न्याय विभाग</CardTitle>
                      <CardDescription className="text-gray-600">Social Justice Department</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">+91-11-2338-1234</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">socialjustice@nyayasetu.gov.in</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-200">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-gray-900">अधिकारिता विभाग</CardTitle>
                      <CardDescription className="text-gray-600">Empowerment Department</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">+91-11-2338-5678</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">empowerment@nyayasetu.gov.in</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Headphones className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-gray-900">तकनीकी सहायता</CardTitle>
                      <CardDescription className="text-gray-600">Technical Support</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">+91-11-2338-9999</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">techsupport@nyayasetu.gov.in</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Regional Offices Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                क्षेत्रीय कार्यालय | Regional Offices
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                देश भर में स्थित क्षेत्रीय कार्यालयों की जानकारी।
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center border-2 border-orange-200">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">दिल्ली | Delhi</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-2">Shastri Bhawan</p>
                  <p className="text-gray-600 mb-2">New Delhi - 110001</p>
                  <p className="text-gray-600">+91-11-2338-1234</p>
                </CardContent>
              </Card>

              <Card className="text-center border-2 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">मुंबई | Mumbai</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-2">Bandra Kurla Complex</p>
                  <p className="text-gray-600 mb-2">Mumbai - 400051</p>
                  <p className="text-gray-600">+91-22-2654-1234</p>
                </CardContent>
              </Card>

              <Card className="text-center border-2 border-green-200">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">बैंगलोर | Bangalore</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-2">Cubbon Road</p>
                  <p className="text-gray-600 mb-2">Bangalore - 560001</p>
                  <p className="text-gray-600">+91-80-2225-1234</p>
                </CardContent>
              </Card>

              <Card className="text-center border-2 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">कोलकाता | Kolkata</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-2">Salt Lake City</p>
                  <p className="text-gray-600 mb-2">Kolkata - 700064</p>
                  <p className="text-gray-600">+91-33-2334-1234</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Emergency Contact Section */}
        <section className="py-16 bg-red-50 border-t-4 border-red-500">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-8">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Phone className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                आपातकालीन संपर्क | Emergency Contact
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                आपातकालीन स्थितियों के लिए 24x7 हेल्पलाइन उपलब्ध है।
              </p>
            </div>
            
            <Card className="border-2 border-red-200 bg-white">
              <CardContent className="py-8">
                <div className="text-4xl font-bold text-red-600 mb-4">
                  +91-11-2338-EMERGENCY
                </div>
                <p className="text-lg text-gray-700 mb-4">
                  आपातकालीन स्थितियों के लिए तुरंत संपर्क करें
                </p>
                <p className="text-lg text-gray-700">
                  Contact immediately for emergency situations
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}

