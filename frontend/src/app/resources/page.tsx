'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { GovernmentHeader } from '@/components/layout/GovernmentHeader'
import { GovernmentFooter } from '@/components/layout/GovernmentFooter'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FileText, Video, BookOpen, Download, ExternalLink, Shield, Scale, Users, Gavel } from 'lucide-react'

export default function ResourcesPage() {
  const t = useTranslations('resources')
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
      <GovernmentHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-orange-600 to-green-600 text-white py-16 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute -top-32 -left-32 w-[600px] h-[400px] bg-gradient-to-br from-orange-400/30 via-amber-400/20 to-green-400/20 rounded-full blur-3xl opacity-70" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-gradient-to-tr from-green-400/30 via-teal-300/20 to-white/0 rounded-full blur-2xl opacity-60" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center p-3 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-white">
                {t('hero.title')}
              </h1>
              <p className="text-xl md:text-2xl max-w-3xl mx-auto text-white leading-relaxed">
                {t('hero.subtitle')}
              </p>
              <p className="text-base md:text-lg max-w-2xl mx-auto mt-4 text-white/90">
                {t('hero.description')}
              </p>
            </div>
          </div>
        </section>

        {/* Key Statistics Banner */}
        <section className="py-12 bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-3">
                  <Shield className="h-6 w-6 text-orange-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">100%</div>
                <div className="text-sm text-gray-600 mt-1">{t('stats.securePlatform')}</div>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">24/7</div>
                <div className="text-sm text-gray-600 mt-1">{t('stats.supportAvailable')}</div>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                  <Scale className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">2</div>
                <div className="text-sm text-gray-600 mt-1">{t('stats.majorActs')}</div>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
                  <Gavel className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">Fast</div>
                <div className="text-sm text-gray-600 mt-1">{t('stats.fastProcessing')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Educational Videos Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center p-2 bg-orange-100 rounded-full mb-4">
                <Video className="h-6 w-6 text-orange-600" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {t('videos.title')}
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {t('videos.description')}
              </p>
            </div>

            {/* Video 1 - Left Video, Right Content - Coming Soon */}
            <div className="mb-20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Coming Soon Container */}
                <div className="order-2 lg:order-1">
                  <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-orange-200 bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-200 rounded-full mb-4">
                        <Video className="h-10 w-10 text-orange-600" />
                      </div>
                      <h4 className="text-2xl font-bold text-orange-900 mb-2">{t('videos.comingSoon')}</h4>
                      <p className="text-orange-700 text-sm">{t('videos.platformOverview.comingSoonText')}</p>
                    </div>
                  </div>
                </div>
                {/* Content */}
                <div className="order-1 lg:order-2">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-100 rounded-full mb-4">
                    <Video className="h-7 w-7 text-orange-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    {t('videos.platformOverview.title')}
                  </h3>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    {t('videos.platformOverview.description')}
                  </p>
                  <div className="bg-orange-50 border-l-4 border-orange-600 p-4 rounded-r-lg mb-6">
                    <p className="text-sm font-semibold text-orange-900 mb-1">{t('videos.platformOverview.aboutTitle')}</p>
                    <p className="text-sm text-orange-800">
                      {t('videos.platformOverview.aboutDescription')}
                    </p>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="inline-flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>
                      {t('videos.platformOverview.status')}
                    </span>
                    <span className="mx-3">•</span>
                    <span>{t('videos.platformOverview.languages')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Video 2 - Right Video, Left Content - PoA Act */}
            <div className="mb-20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Content */}
                <div className="order-1">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-100 rounded-full mb-4">
                    <Shield className="h-7 w-7 text-purple-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    {t('videos.poaAct.title')}
                  </h3>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    {t('videos.poaAct.description')}
                  </p>
                  <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-r-lg mb-6">
                    <p className="text-sm font-semibold text-purple-900 mb-1">{t('videos.poaAct.aboutTitle')}</p>
                    <p className="text-sm text-purple-800">
                      {t('videos.poaAct.aboutDescription')}
                    </p>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="inline-flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {t('videos.poaAct.duration')}
                    </span>
                    <span className="mx-3">•</span>
                    <span>{t('videos.poaAct.languages')}</span>
                  </div>
                </div>
                {/* Video Container */}
                <div className="order-2">
                  <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-purple-200 hover:border-purple-400 transition-all duration-300 transform hover:scale-[1.02]">
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src="https://www.youtube.com/embed/L9n5YT-VOEQ"
                      title="Understanding PoA Act, 1989"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Video 3 - Left Video, Right Content - PCR Act */}
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Video Container */}
                <div className="order-2 lg:order-1">
                  <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-blue-200 hover:border-blue-400 transition-all duration-300 transform hover:scale-[1.02]">
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src="https://www.youtube.com/embed/kxaneGy4lNM"
                      title="Understanding PCR Act, 1955"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
                {/* Content */}
                <div className="order-1 lg:order-2">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-full mb-4">
                    <Scale className="h-7 w-7 text-blue-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    {t('videos.pcrAct.title')}
                  </h3>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    {t('videos.pcrAct.description')}
                  </p>
                  <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg mb-6">
                    <p className="text-sm font-semibold text-blue-900 mb-1">{t('videos.pcrAct.aboutTitle')}</p>
                    <p className="text-sm text-blue-800">
                      {t('videos.pcrAct.aboutDescription')}
                    </p>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="inline-flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {t('videos.pcrAct.duration')}
                    </span>
                    <span className="mx-3">•</span>
                    <span>{t('videos.pcrAct.languages')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Official Documents Section */}
        {/* <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center p-2 bg-blue-100 rounded-full mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Official Documents
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Download official acts, schemes, guidelines, and forms for reference and application purposes
              </p>
            </div>

            <div className="space-y-16">
             
              <Card className="border-4 border-purple-200 hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-8">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <Shield className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-white">PoA Act, 1989</h3>
                      <p className="text-purple-100 text-lg">Scheduled Castes and the Scheduled Tribes (Prevention of Atrocities) Act</p>
                    </div>
                  </div>
                  <p className="text-purple-50 leading-relaxed text-base">
                    The PoA Act, 1989 is a landmark legislation aimed at preventing atrocities against members of Scheduled Castes and Scheduled Tribes. 
                    It provides for stringent punishment for offenders and ensures relief and rehabilitation for victims, strengthening the enforcement 
                    framework to protect the most vulnerable sections of society.
                  </p>
                </div>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start space-x-4 p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group cursor-pointer border-2 border-purple-100 hover:border-purple-300">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                          <FileText className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-900 group-hover:text-purple-700 mb-2">Complete Act Document</h4>
                        <p className="text-sm text-gray-600 mb-3">Full text of the SC/ST Prevention of Atrocities Act, 1989 with all chapters and sections</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 font-medium">PDF • 3.1 MB</span>
                          <a 
                            href="https://socialjustice.gov.in/writereaddata/UploadFile/poa_1989.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-purple-600 hover:text-purple-700 font-semibold text-sm"
                          >
                            Download <Download className="h-4 w-4 ml-1" />
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group cursor-pointer border-2 border-purple-100 hover:border-purple-300">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                          <Scale className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-900 group-hover:text-purple-700 mb-2">Rules & Regulations</h4>
                        <p className="text-sm text-gray-600 mb-3">SC/ST (PoA) Rules, 1995 and all subsequent amendments for implementation</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 font-medium">PDF • 2.5 MB</span>
                          <button className="inline-flex items-center text-purple-600 hover:text-purple-700 font-semibold text-sm">
                            Download <Download className="h-4 w-4 ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group cursor-pointer border-2 border-purple-100 hover:border-purple-300">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-900 group-hover:text-purple-700 mb-2">Relief & Rehabilitation</h4>
                        <p className="text-sm text-gray-600 mb-3">Monetary relief and rehabilitation scheme guidelines for victims and families</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 font-medium">PDF • 1.5 MB</span>
                          <button className="inline-flex items-center text-purple-600 hover:text-purple-700 font-semibold text-sm">
                            Download <Download className="h-4 w-4 ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group cursor-pointer border-2 border-purple-100 hover:border-purple-300">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                          <Gavel className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-900 group-hover:text-purple-700 mb-2">Supreme Court Judgments</h4>
                        <p className="text-sm text-gray-600 mb-3">Landmark judicial pronouncements and interpretations of the Act</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 font-medium">PDF • 4.2 MB</span>
                          <button className="inline-flex items-center text-purple-600 hover:text-purple-700 font-semibold text-sm">
                            Download <Download className="h-4 w-4 ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-purple-200">
                    <a 
                      href="https://socialjustice.gov.in/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-purple-600 hover:text-purple-700 font-semibold text-base group"
                    >
                      Visit Ministry of Social Justice & Empowerment for More Documents
                      <ExternalLink className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </CardContent>
              </Card>

              
              <Card className="border-4 border-blue-200 hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <Gavel className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-white">PCR Act, 1955</h3>
                      <p className="text-blue-100 text-lg">Protection of Civil Rights Act</p>
                    </div>
                  </div>
                  <p className="text-blue-50 leading-relaxed text-base">
                    The Protection of Civil Rights Act, 1955 is a pivotal legislation for abolishing untouchability and ensuring equal civil rights 
                    for all citizens of India. It criminalizes the practice of untouchability in any form, promotes social equality, and upholds the 
                    dignity and fundamental rights of historically marginalized communities.
                  </p>
                </div>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start space-x-4 p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group cursor-pointer border-2 border-blue-100 hover:border-blue-300">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                          <FileText className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-900 group-hover:text-blue-700 mb-2">Complete Act Document</h4>
                        <p className="text-sm text-gray-600 mb-3">Full text of the Protection of Civil Rights Act, 1955 with all provisions</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 font-medium">PDF • 2.3 MB</span>
                          <a 
                            href="https://socialjustice.gov.in/writereaddata/UploadFile/PCR_ACT_1955.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold text-sm"
                          >
                            Download <Download className="h-4 w-4 ml-1" />
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group cursor-pointer border-2 border-blue-100 hover:border-blue-300">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-900 group-hover:text-blue-700 mb-2">Amendment Acts</h4>
                        <p className="text-sm text-gray-600 mb-3">All amendments to the PCR Act from 1955 to present day</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 font-medium">PDF • 1.8 MB</span>
                          <button className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold text-sm">
                            Download <Download className="h-4 w-4 ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group cursor-pointer border-2 border-blue-100 hover:border-blue-300">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Shield className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-900 group-hover:text-blue-700 mb-2">Scheme Guidelines</h4>
                        <p className="text-sm text-gray-600 mb-3">Centrally Sponsored Scheme for effective implementation guidelines</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 font-medium">PDF • 1.2 MB</span>
                          <button className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold text-sm">
                            Download <Download className="h-4 w-4 ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group cursor-pointer border-2 border-blue-100 hover:border-blue-300">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-900 group-hover:text-blue-700 mb-2">Inter-Caste Marriage Scheme</h4>
                        <p className="text-sm text-gray-600 mb-3">Guidelines and incentives for inter-caste marriages under the scheme</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 font-medium">PDF • 980 KB</span>
                          <button className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold text-sm">
                            Download <Download className="h-4 w-4 ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-blue-200">
                    <a 
                      href="https://socialjustice.gov.in/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold text-base group"
                    >
                      Visit Ministry of Social Justice & Empowerment for More Documents
                      <ExternalLink className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section> */}

        {/* Additional Resources Section */}
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {t('additionalResources.title')}
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {t('additionalResources.description')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-2 border-orange-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="text-center">
                  <div className="mx-auto w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-7 w-7 text-orange-600" />
                  </div>
                  <CardTitle>{t('additionalResources.applicationForms.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center mb-4">
                    {t('additionalResources.applicationForms.description')}
                  </p>
                  <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition-colors font-medium">
                    {t('additionalResources.applicationForms.button')}
                  </button>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="text-center">
                  <div className="mx-auto w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <BookOpen className="h-7 w-7 text-green-600" />
                  </div>
                  <CardTitle>{t('additionalResources.userManual.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center mb-4">
                    {t('additionalResources.userManual.description')}
                  </p>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors font-medium">
                    {t('additionalResources.userManual.button')}
                  </button>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="text-center">
                  <div className="mx-auto w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Scale className="h-7 w-7 text-blue-600" />
                  </div>
                  <CardTitle>{t('additionalResources.legalFaqs.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center mb-4">
                    {t('additionalResources.legalFaqs.description')}
                  </p>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors font-medium">
                    {t('additionalResources.legalFaqs.button')}
                  </button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-r from-orange-600 to-green-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t('cta.title')}
            </h2>
            <p className="text-lg md:text-xl mb-8 text-white/90">
              {t('cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/login" className="inline-flex items-center justify-center bg-white text-orange-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-colors shadow-lg">
                {t('cta.applyNow')}
              </a>
              <a href="https://socialjustice.gov.in/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-3 rounded-lg font-semibold text-lg transition-colors">
                {t('cta.learnMore')}
              </a>
            </div>
          </div>
        </section>
      </main>

      <GovernmentFooter />
    </div>
  )
}
