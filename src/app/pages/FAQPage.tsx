import { Link } from 'react-router-dom';
import FAQ from '../components/FAQ';

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-semibold text-gray-900 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about MyDentPlan
            </p>
          </div>

          <FAQ />

          <div className="mt-20 pt-20 border-t border-gray-200">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-semibold text-gray-900 mb-6 text-center">
                About MyDentPlan
              </h2>
              <div className="space-y-6 text-gray-600 leading-relaxed">
                <p>
                  MyDentPlan is a free dental cost estimation tool designed to help patients make informed decisions about their dental care. We believe everyone deserves transparency when it comes to healthcare costs.
                </p>
                <p>
                  Our platform helps you:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Understand potential dental costs before visiting your dentist</li>
                  <li>Check your symptoms and see recommended treatments</li>
                  <li>Estimate what your insurance might cover</li>
                  <li>Compare costs across different procedures</li>
                  <li>Plan and budget for your dental care</li>
                </ul>
                <p>
                  <strong>Important:</strong> MyDentPlan provides estimates only. We are not a dental practice and do not provide diagnoses or medical advice. All cost estimates are based on typical pricing and insurance coverage rates. Actual costs and coverage may vary. Always consult with a licensed dentist for diagnosis and treatment.
                </p>
                <p>
                  Our estimates are based on aggregated data from dental practices across the United States and typical insurance coverage rates. We update our pricing data regularly to ensure accuracy.
                </p>
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
                    Start Symptom Checker
                  </Link>
                  <Link
                    to="/calculator"
                    className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium"
                  >
                    Use Cost Calculator
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
