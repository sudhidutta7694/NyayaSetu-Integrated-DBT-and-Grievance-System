import { FileText, Smartphone, Shield, Users, Clock, Globe } from 'lucide-react'

const features = [
  {
    name: 'Aadhaar Integration',
    description: 'Seamless Aadhaar-based authentication and verification with OTP support for secure access.',
    icon: Shield,
  },
  {
    name: 'Document Management',
    description: 'Upload and verify documents with DigiLocker integration for instant verification.',
    icon: FileText,
  },
  {
    name: 'Mobile-First Design',
    description: 'Responsive design optimized for mobile devices, ensuring accessibility in rural areas.',
    icon: Smartphone,
  },
  {
    name: 'Multi-Language Support',
    description: 'Available in multiple Indian languages with screen reader support for accessibility.',
    icon: Globe,
  },
  {
    name: 'Real-time Tracking',
    description: 'Track application status, fund disbursement, and case progress in real-time.',
    icon: Clock,
  },
  {
    name: 'Role-based Access',
    description: 'Secure role-based access for different stakeholders in the ecosystem.',
    icon: Users,
  },
]

export function Features() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Comprehensive Features
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Built with modern technology and user-centric design to ensure seamless experience for all stakeholders.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <feature.icon className="h-5 w-5 flex-none text-nyaya-600" aria-hidden="true" />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

