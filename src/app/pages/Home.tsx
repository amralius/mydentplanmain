import { Link } from 'react-router-dom';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';

export default function Home() {
  const journeySteps = [
    {
      step: '1',
      title: 'Start with symptoms',
      description: 'Choose the area that hurts and describe what you feel.',
      action: 'Check Symptoms',
      to: '/symptom-checker',
    },
    {
      step: '2',
      title: 'Review likely treatments',
      description: 'See possible next steps like exams, fillings, crowns, or X-rays.',
      action: 'Start Checker',
      to: '/symptom-checker',
    },
    {
      step: '3',
      title: 'Estimate your cost',
      description: 'Add insurance and ZIP code details to see an out-of-pocket range.',
      action: 'Estimate Cost',
      to: '/calculator',
    },
    {
      step: '4',
      title: 'Find nearby care',
      description: 'Search dentists near you when you are ready to book.',
      action: 'Find Dentist',
      to: '/find-dentist',
    },
  ];

  return (
    <>
      <section className="pt-32 pb-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-6">
            <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
              No Surprises. Just Clarity.
            </div>
            <h1 className="text-6xl font-semibold text-gray-900 tracking-tight max-w-4xl mx-auto leading-tight">
              Understand symptoms and estimate dental costs before your visit
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Check symptoms, understand treatments, estimate insurance coverage, and find nearby care.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200">
              <span aria-hidden="true">⏱</span>
              Takes about 3 minutes
            </div>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Link
                to="/symptom-checker"
                className="px-8 py-4 bg-primary text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                Get Free Estimate
              </Link>
              <a
                href="#care-path"
                className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
              >
                See the Path
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-sm text-gray-600">
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

      <HowItWorks />

      <section id="care-path" className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
            <div>
              <h2 className="text-4xl font-semibold text-gray-900 mb-4">
                A clear path from concern to appointment
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl">
                MyDentPlan is organized around one simple movement: figure out what might be happening, estimate the money, then choose your next step.
              </p>
            </div>
            <Link
              to="/symptom-checker"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-md"
            >
              Start at Step 1
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {journeySteps.map((item) => (
              <Link
                key={item.step}
                to={item.to}
                className="group p-6 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-white hover:border-primary/40 hover:shadow-lg transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center font-semibold mb-5">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-[17px] leading-7 text-gray-600 mb-5">{item.description}</p>
                <span className="text-primary font-medium group-hover:text-blue-700">
                  {item.action}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Features />
      <Testimonials />

      <section className="py-20 bg-gradient-to-r from-primary to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-semibold mb-6">
            Ready to take control of your dental costs?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of patients who are making informed decisions about their dental care.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/symptom-checker"
              className="inline-block px-8 py-4 bg-white text-primary rounded-xl hover:bg-gray-100 transition-all shadow-lg"
            >
              Check Symptoms
            </Link>
            <Link
              to="/find-dentist"
              className="inline-block px-8 py-4 bg-blue-900/30 text-white border border-white/30 rounded-xl hover:bg-blue-900/40 transition-all"
            >
              Find a Dentist
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
