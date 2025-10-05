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
                सहायता | Help & Support
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
                आपकी सहायता के लिए यहाँ हैं। सामान्य प्रश्न, गाइड और समर्थन प्राप्त करें।
              </p>
              <p className="text-lg md:text-xl max-w-4xl mx-auto leading-relaxed">
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
                सहायता खोजें | Search Help
              </h2>
              <p className="text-gray-600">
                अपने प्रश्न का उत्तर खोजें | Find answers to your questions
              </p>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input 
                placeholder="अपना प्रश्न यहाँ टाइप करें | Type your question here"
                className="pl-10 pr-4 py-3 text-lg border-2 border-gray-300 focus:border-orange-500"
              />
              <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-600 hover:bg-orange-700">
                खोजें | Search
              </Button>
            </div>
          </div>
        </section>

        {/* Quick Help Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                त्वरित सहायता | Quick Help
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                सबसे आम प्रश्नों के उत्तर यहाँ मिलेंगे।
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center border-2 border-orange-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <HelpCircle className="h-8 w-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">सामान्य प्रश्न | FAQ</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    सबसे आम प्रश्नों के उत्तर
                  </p>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    देखें | View
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center border-2 border-blue-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <BookOpen className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">उपयोगकर्ता गाइड | User Guide</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    चरण-दर-चरण गाइड
                  </p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    पढ़ें | Read
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center border-2 border-green-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Video className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">वीडियो ट्यूटोरियल | Video Tutorials</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    वीडियो गाइड और ट्यूटोरियल
                  </p>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    देखें | Watch
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center border-2 border-purple-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <Download className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">दस्तावेज़ | Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    डाउनलोड करने योग्य दस्तावेज़
                  </p>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    डाउनलोड | Download
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
                सामान्य प्रश्न | Frequently Asked Questions
              </h2>
              <p className="text-lg text-gray-600">
                सबसे आम प्रश्नों के उत्तर यहाँ मिलेंगे।
              </p>
            </div>
            
            <div className="space-y-6">
              <Card className="border-2 border-orange-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-gray-900">
                      न्यायसेतु क्या है? | What is NyayaSetu?
                    </CardTitle>
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    न्यायसेतु एक व्यापक मंच है जो PCR Act और PoA Act के प्रभावी कार्यान्वयन के लिए डिज़ाइन किया गया है। यह Direct Benefit Transfer और Grievance System का एकीकृत समाधान प्रदान करता है।
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-gray-900">
                      आवेदन कैसे करें? | How to apply?
                    </CardTitle>
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    आवेदन करने के लिए, पहले Aadhaar OTP के माध्यम से लॉगिन करें, फिर आवश्यक दस्तावेज़ अपलोड करें और आवेदन जमा करें। पूरी प्रक्रिया ऑनलाइन है।
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-gray-900">
                      आवेदन की स्थिति कैसे जांचें? | How to check application status?
                    </CardTitle>
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    आवेदन की स्थिति जांचने के लिए, डैशबोर्ड में लॉगिन करें और "Application Status" सेक्शन में जाएं। वहाँ आप अपने सभी आवेदनों की वास्तविक समय स्थिति देख सकते हैं।
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-gray-900">
                      कौन से दस्तावेज़ आवश्यक हैं? | What documents are required?
                    </CardTitle>
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    आवश्यक दस्तावेज़ में जाति प्रमाण पत्र, बैंक पासबुक, आधार कार्ड, और अन्य संबंधित दस्तावेज़ शामिल हैं। सभी दस्तावेज़ DigiLocker के माध्यम से अपलोड किए जा सकते हैं।
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-red-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-gray-900">
                      शिकायत कैसे दर्ज करें? | How to register a complaint?
                    </CardTitle>
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    शिकायत दर्ज करने के लिए, "Help & Support" सेक्शन में जाएं और "Register Grievance" पर क्लिक करें। आपकी शिकायत का निवारण 24-48 घंटों के भीतर किया जाएगा।
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
                सहायता से संपर्क करें | Contact Support
              </h2>
              <p className="text-lg text-gray-600">
                अगर आपको कोई सहायता चाहिए, तो हमसे संपर्क करें।
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <Card className="text-center border-2 border-orange-200">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <Phone className="h-8 w-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">हेल्पलाइन | Helpline</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-2">+91-11-2338-1234</p>
                  <p className="text-sm text-gray-500">24x7 सहायता | 24x7 Support</p>
                </CardContent>
              </Card>

              <Card className="text-center border-2 border-blue-200">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">चैट सहायता | Chat Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-2">24x7 चैटबॉट | 24x7 Chatbot</p>
                  <p className="text-sm text-gray-500">बहुभाषी समर्थन | Multilingual Support</p>
                </CardContent>
              </Card>

              <Card className="text-center border-2 border-green-200">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Mail className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">ईमेल सहायता | Email Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-2">support@nyayasetu.gov.in</p>
                  <p className="text-sm text-gray-500">24 घंटे में जवाब | Response within 24 hours</p>
                </CardContent>
              </Card>
            </div>

            {/* Support Form */}
            <Card className="border-2 border-orange-200">
              <CardHeader>
                <CardTitle className="text-2xl text-center text-gray-900">
                  सहायता अनुरोध | Support Request
                </CardTitle>
                <CardDescription className="text-center text-gray-600">
                  अपनी समस्या का विवरण दें | Describe your problem
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="support-name" className="text-gray-700">
                      नाम | Name *
                    </Label>
                    <Input 
                      id="support-name" 
                      placeholder="अपना नाम दर्ज करें | Enter your name"
                      className="border-gray-300 focus:border-orange-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="support-email" className="text-gray-700">
                      ईमेल | Email *
                    </Label>
                    <Input 
                      id="support-email" 
                      type="email"
                      placeholder="अपना ईमेल दर्ज करें | Enter your email"
                      className="border-gray-300 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support-subject" className="text-gray-700">
                    विषय | Subject *
                  </Label>
                  <Input 
                    id="support-subject" 
                    placeholder="समस्या का विषय | Subject of the problem"
                    className="border-gray-300 focus:border-orange-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support-message" className="text-gray-700">
                    समस्या का विवरण | Problem Description *
                  </Label>
                  <Textarea 
                    id="support-message" 
                    placeholder="अपनी समस्या का विस्तृत विवरण दें | Provide detailed description of your problem"
                    className="min-h-[120px] border-gray-300 focus:border-orange-500"
                  />
                </div>

                <div className="text-center">
                  <Button className="bg-orange-600 hover:bg-orange-700 px-8 py-3 text-lg">
                    <Send className="mr-2 h-5 w-5" />
                    सहायता अनुरोध भेजें | Send Support Request
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
                आपातकालीन सहायता | Emergency Support
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                आपातकालीन स्थितियों के लिए तुरंत संपर्क करें।
              </p>
            </div>
            
            <Card className="border-2 border-red-200 bg-white">
              <CardContent className="py-8">
                <div className="text-4xl font-bold text-red-600 mb-4">
                  +91-11-2338-EMERGENCY
                </div>
                <p className="text-lg text-gray-700 mb-4">
                  आपातकालीन स्थितियों के लिए 24x7 हेल्पलाइन
                </p>
                <p className="text-lg text-gray-700">
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

