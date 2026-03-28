"use client";
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqColors = ['orange', 'blue', 'green', 'purple', 'red'];

export default function FAQSection() {
  const t = useTranslations('home.faq');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  // Get number of questions from translations
  const questionCount = 5; // We know we have 5 questions

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('title')}</h2>
          <p className="text-lg text-gray-600">{t('description')}</p>
        </div>
        <div className="space-y-6">
          {Array.from({ length: questionCount }).map((_, idx) => (
            <Card
              key={idx}
              className={`border-2 border-${faqColors[idx]}-200 transition-shadow duration-200 ${openIndex === idx ? 'shadow-lg' : ''}`}
            >
              <button
                className="w-full flex items-center justify-between px-6 py-5 focus:outline-none"
                onClick={() => handleToggle(idx)}
                aria-expanded={openIndex === idx}
                aria-controls={`faq-answer-${idx}`}
              >
                <CardTitle className="text-lg text-gray-900 text-left">
                  {t(`questions.${idx}.question`)}
                </CardTitle>
                {openIndex === idx ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              {openIndex === idx && (
                <CardContent id={`faq-answer-${idx}`} className="px-6 pb-6 pt-0 animate-fade-in">
                  <p className="text-gray-600 leading-relaxed">{t(`questions.${idx}.answer`)}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
