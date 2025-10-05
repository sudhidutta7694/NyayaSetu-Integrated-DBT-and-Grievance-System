'use client'

import React from 'react'
import { Shield, Mail, Phone, MapPin, ExternalLink } from 'lucide-react'

export function GovernmentFooter() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <a href="/" className="flex items-center space-x-2 mb-4 hover:opacity-80 transition-opacity" style={{textDecoration: 'none'}}>
              <Shield className="h-6 w-6 text-orange-500" />
              <h3 className="text-lg font-semibold">NyayaSetu</h3>
            </a>
            <p className="text-gray-300 text-sm mb-4">
              A comprehensive platform for implementing Direct Benefit Transfer (DBT) 
              under the Centrally Sponsored Scheme for effective implementation of 
              PCR Act and PoA Act.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/#about" className="text-gray-300 hover:text-orange-400 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/#services" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Services
                </a>
              </li>
              <li>
                <a href="/#faq" className="text-gray-300 hover:text-orange-400 transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Important Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Important Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://uidai.gov.in" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-orange-400 transition-colors flex items-center"
                >
                  UIDAI <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
              <li>
                <a 
                  href="https://digilocker.gov.in" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-orange-400 transition-colors flex items-center"
                >
                  DigiLocker <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
              <li>
                <a 
                  href="https://socialjustice.gov.in" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-orange-400 transition-colors flex items-center"
                >
                  Social Justice Ministry <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
              <li>
                <a 
                  href="https://india.gov.in" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-orange-400 transition-colors flex items-center"
                >
                  India.gov.in <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-orange-500 mt-0.5" />
                <div>
                  <p className="text-gray-300">
                    Ministry of Social Justice & Empowerment<br />
                    Shastri Bhawan, New Delhi - 110001
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-orange-500" />
                <span className="text-gray-300">+91-11-2338-1234</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-orange-500" />
                <span className="text-gray-300">info@nyayasetu.gov.in</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © 2024 NyayaSetu. All rights reserved. | 
              <a href="/privacy" className="hover:text-orange-400 ml-2">Privacy Policy</a> | 
              <a href="/terms" className="hover:text-orange-400 ml-2">Terms of Service</a>
            </div>
            <div className="text-sm text-gray-400">
              Last Updated: {new Date().toLocaleDateString('en-IN')} | 
              <span className="ml-2">Version 1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

