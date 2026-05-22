import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import FAQ from '../components/FAQ';

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="pt-32 pb-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-semibold text-gray-900 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about MyDentPlan
            </p>
          </div>

          <FAQ />

          <div className="mt-20 pt-16 border-t border-gray-200">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-semibold text-gray-900 mb-6 text-center">
                About MyDentPlan
              </h2>
              <div className="space-y-6 text-gray-600 leading-relaxed">
                <p className="text-center">
                  MyDentPlan is a free dental planning tool that helps patients understand possible care paths before a visit.
                </p>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-xl font-semibold text-gray-900">
                    What MyDentPlan helps with
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      'Understand symptoms',
                      'Estimate treatment costs',
                      'Review insurance coverage',
                      'Find nearby dentists',
                      'Plan future care',
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-3 text-gray-700">
                        <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <div className="mb-2 flex items-center gap-2 text-amber-900">
                    <AlertTriangle className="h-5 w-5" />
                    <h3 className="font-semibold">Important Disclaimer</h3>
                  </div>
                  <p className="text-amber-900">
                    MyDentPlan provides educational information and estimates only. It does not provide diagnoses or replace professional dental care.
                  </p>
                </div>
              </div>

              <div className="mt-12 p-6 bg-blue-50 rounded-2xl text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Ready to estimate your dental costs?
                </h3>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/symptom-checker"
                    className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-blue-700 transition-all font-medium"
                  >
                    Check Symptoms
                  </Link>
                  <Link
                    to="/calculator"
                    className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium"
                  >
                    Estimate Costs
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
