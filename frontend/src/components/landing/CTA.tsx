import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function CTA() {
  return (
    <section className="bg-nyaya-600">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-nyaya-100">
            Join thousands of citizens who have already benefited from our platform. 
            Register today and experience seamless access to government services.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/register">
              <Button size="lg" className="bg-white text-nyaya-700 hover:bg-nyaya-50">
                Register Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-nyaya-700">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

