import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="pt-36 pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="mb-10">
            <p className="text-sm font-semibold text-primary mb-3">Terms of Service</p>
            <h1 className="text-5xl font-semibold text-gray-900 mb-4">
              MyDentPlan helps you plan, not diagnose.
            </h1>
            <p className="text-xl text-gray-600">
              These terms explain how to use estimates, symptom checks, and dentist search responsibly.
            </p>
          </div>

          <div className="space-y-8 text-gray-600 leading-7">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Estimates Are Informational</h2>
              <p>
                MyDentPlan provides cost ranges based on typical pricing and coverage assumptions. It does not guarantee insurance benefits, final pricing, or treatment approval.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Not Medical Advice</h2>
              <p>
                Symptom checks are educational and are not a diagnosis. Always consult a licensed dental professional for diagnosis, treatment, urgent pain, swelling, bleeding, or infection concerns.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Dentist Search</h2>
              <p>
                Dentist listings and map results may come from Google Maps. Always confirm hours, services, insurance acceptance, and pricing directly with the office.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Support</h2>
              <p>
                Questions about these terms can be sent to <a href="mailto:support@mydentplan.com" className="text-primary font-medium hover:text-blue-700">support@mydentplan.com</a>.
              </p>
            </section>
          </div>

          <div className="mt-12">
            <Link to="/symptom-checker" className="inline-flex rounded-xl bg-primary px-6 py-3 font-semibold text-white hover:bg-blue-700">
              Start Assessment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
