import { Link } from 'react-router-dom';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';

export default function Home() {
  return (
    <>
      <section className="pt-32 pb-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-6">
            <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
              No Surprises. Just Clarity.
            </div>
            <h1 className="text-6xl font-semibold text-gray-900 tracking-tight max-w-4xl mx-auto leading-tight">
              Estimate your dental costs before your visit
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Check your symptoms and see what your insurance might cover in seconds. Make informed decisions about your dental care with transparent, accurate cost estimates.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Link
                to="/symptom-checker"
                className="px-8 py-4 bg-primary text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                Get Free Estimate
              </Link>
              <a
                href="#how-it-works"
                className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
              >
                Learn More
              </a>
            </div>
          </div>

          <div className="flex justify-center items-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>100% Free</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Instant results</span>
            </div>
          </div>
        </div>
      </section>

      <Features />
      <HowItWorks />
      <Testimonials />

      <section className="py-20 bg-gradient-to-r from-primary to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-semibold mb-6">
            Ready to take control of your dental costs?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of patients who are making informed decisions about their dental care.
          </p>
          <Link
            to="/symptom-checker"
            className="inline-block px-8 py-4 bg-white text-primary rounded-xl hover:bg-gray-100 transition-all shadow-lg"
          >
            Get Started for Free
          </Link>
        </div>
      </section>
    </>
  );
}
