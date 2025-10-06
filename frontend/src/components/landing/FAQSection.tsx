"use client";
import { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqData = [
  {
    question: 'What is NyayaSetu?',
    answer:
      'NyayaSetu is a comprehensive platform designed for effective implementation of the PCR Act and PoA Act. It provides an integrated solution for Direct Benefit Transfer and Grievance System.',
    color: 'orange',
  },
  {
    question: 'How to apply?',
    answer:
      'To apply, first log in using Aadhaar OTP, then upload the required documents and submit your application. The entire process is online.',
    color: 'blue',
  },
  {
    question: 'How to check application status?',
    answer:
      'To check your application status, log in to the dashboard and go to the "Application Status" section. There you can see the real-time status of all your applications.',
    color: 'green',
  },
  {
    question: 'What documents are required?',
    answer:
      'Required documents include caste certificate, bank passbook, Aadhaar card, and other relevant documents. All documents can be uploaded via DigiLocker.',
    color: 'purple',
  },
  {
    question: 'How to register a complaint?',
    answer:
      'To register a complaint, go to the "Help & Support" section and click on "Register Grievance". Your complaint will be resolved within 24-48 hours.',
    color: 'red',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-gray-600">Find answers to the most common questions here.</p>
        </div>
        <div className="space-y-6">
          {faqData.map((faq, idx) => (
            <Card
              key={faq.question}
              className={`border-2 border-${faq.color}-200 transition-shadow duration-200 ${openIndex === idx ? 'shadow-lg' : ''}`}
            >
              <button
                className="w-full flex items-center justify-between px-6 py-5 focus:outline-none"
                onClick={() => handleToggle(idx)}
                aria-expanded={openIndex === idx}
                aria-controls={`faq-answer-${idx}`}
              >
                <CardTitle className="text-lg text-gray-900 text-left">
                  {faq.question}
                </CardTitle>
                {openIndex === idx ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              {openIndex === idx && (
                <CardContent id={`faq-answer-${idx}`} className="px-6 pb-6 pt-0 animate-fade-in">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
