"use client";
import { useEffect } from "react";
import { useAuth } from '@/components/providers/AuthProvider';
import { useTranslations } from 'next-intl';

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GovernmentHeader } from '@/components/layout/GovernmentHeader'
import { GovernmentFooter } from '@/components/layout/GovernmentFooter'
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
  const { user, logout } = useAuth();
  const t = useTranslations('home');
  
  useEffect(() => {
    if (user) {
      logout();
    }
    // eslint-disable-next-line
  }, [user]);
  
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Skip Link for Accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-orange-600 text-white px-4 py-2 rounded z-50">{t('accessibility.skipToMain')}</a>
      <GovernmentHeader />
      {/* Main Content Area */}
      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-orange-600 to-green-600 text-white py-24 overflow-hidden">
          {/* Soft blurred gradient background shape */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute -top-32 -left-32 w-[600px] h-[400px] bg-gradient-to-br from-white/30 via-orange-200/40 to-green-200/40 rounded-full blur-3xl opacity-60" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-gradient-to-tr from-green-200/40 via-orange-100/30 to-white/0 rounded-full blur-2xl opacity-50" />
          </div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <span className="inline-block bg-white/20 text-white text-xs md:text-sm font-semibold px-4 py-1 rounded-full mb-6 tracking-widest uppercase shadow-sm backdrop-blur-sm">
              {t('hero.badge')}
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 drop-shadow-lg text-center">
              {t('hero.title')}
            </h1>
            <h2 className="text-xl md:text-2xl font-medium mb-6 text-white/90 text-center max-w-2xl">
              {t('hero.subtitle')}
            </h2>
            <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed text-white/90 text-center">
              {t('hero.description')}
            </p>
            <div className="flex justify-center w-full">
              <Link href="/login">
                <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-3 text-lg">
                  {t('hero.cta')}
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
                {t('about.title')}
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {t('about.description')}
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
                      <CardTitle className="text-xl text-gray-900">{t('about.pcrAct.title')}</CardTitle>
                      <CardDescription className="text-gray-600">{t('about.pcrAct.subtitle')}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    {t('about.pcrAct.description')}
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
                      <CardTitle className="text-xl text-gray-900">{t('about.poaAct.title')}</CardTitle>
                      <CardDescription className="text-gray-600">{t('about.poaAct.subtitle')}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    {t('about.poaAct.description')}
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
                {t('features.title')}
              </h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                {t('features.description')}
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
                  {t('features.secure.title')}
                </h3>
                <p className="text-gray-600 leading-relaxed text-base">
                  {t('features.secure.description')}
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
                  {t('features.multiRole.title')}
                </h3>
                <p className="text-gray-600 leading-relaxed text-base">
                  {t('features.multiRole.description')}
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
                  {t('features.realTime.title')}
                </h3>
                <p className="text-gray-600 leading-relaxed text-base">
                  {t('features.realTime.description')}
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
                {t('services.title')}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Application Submission */}
              <Card className="border-2 border-orange-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-700">{t('services.applicationSubmission.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {t('services.applicationSubmission.description')}
                  </p>
                </CardContent>
              </Card>

              {/* Application Tracking */}
              <Card className="border-2 border-blue-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Eye className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-700">{t('services.applicationTracking.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {t('services.applicationTracking.description')}
                  </p>
                </CardContent>
              </Card>

              {/* Document Verification */}
              <Card className="border-2 border-green-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <FileCheck className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-700">{t('services.documentVerification.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {t('services.documentVerification.description')}
                  </p>
                </CardContent>
              </Card>

              {/* Fund Disbursement */}
              <Card className="border-2 border-purple-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <DollarSign className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-700">{t('services.fundDisbursement.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {t('services.fundDisbursement.description')}
                  </p>
                </CardContent>
              </Card>

              {/* Grievance Redressal */}
              <Card className="border-2 border-red-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-700">{t('services.grievanceRedressal.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {t('services.grievanceRedressal.description')}
                  </p>
                </CardContent>
              </Card>

              {/* Support Services */}
              <Card className="border-2 border-yellow-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8 text-yellow-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-700">{t('services.supportServices.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {t('services.supportServices.description')}
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
                {t('contact.title')}
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {t('contact.description')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Helpline Card */}
              <div className="text-center bg-gray-50 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="mx-auto w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <Phone className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{t('contact.helpline.title')}</h3>
                <p className="text-gray-700 mb-1">{t('contact.helpline.phone1')}</p>
                <p className="text-gray-700 mb-1">{t('contact.helpline.phone2')}</p>
                <p className="text-xs text-gray-500 mt-2">{t('contact.helpline.note')}</p>
              </div>
              {/* Email Card */}
              <div className="text-center bg-gray-50 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="mx-auto w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{t('contact.email.title')}</h3>
                <p className="text-gray-700 mb-1">{t('contact.email.email1')}</p>
                <p className="text-gray-700 mb-1">{t('contact.email.email2')}</p>
                <p className="text-xs text-gray-500 mt-2">{t('contact.email.note')}</p>
              </div>
              {/* Address Card */}
              <div className="text-center bg-gray-50 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="mx-auto w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{t('contact.address.title')}</h3>
                <p className="text-gray-700 mb-1">{t('contact.address.line1')}</p>
                <p className="text-gray-700 mb-1">{t('contact.address.line2')}</p>
                <p className="text-gray-700 mb-1">{t('contact.address.line3')}</p>
              </div>
              {/* Working Hours Card */}
              <div className="text-center bg-gray-50 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="mx-auto w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{t('contact.hours.title')}</h3>
                <p className="text-gray-700 mb-1">{t('contact.hours.days')}</p>
                <p className="text-gray-700 mb-1">{t('contact.hours.time')}</p>
                <p className="text-xs text-gray-500 mt-2">{t('contact.hours.note')}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <GovernmentFooter />
    </div>
  )
}
