import { Link } from 'react-router-dom';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="pt-36 pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="mb-10">
            <p className="text-sm font-semibold text-primary mb-3">Privacy Policy</p>
            <h1 className="text-5xl font-semibold text-gray-900 mb-4">
              Your dental planning information should stay private.
            </h1>
            <p className="text-xl text-gray-600">
              MyDentPlan is designed to help you estimate and organize care without selling your personal information.
            </p>
          </div>

          <div className="space-y-8 text-gray-600 leading-7">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">What We Store</h2>
              <p>
                If you create an account, MyDentPlan may store your email, profile details, saved estimates, symptom checks, and saved dentists so you can return to your plan later.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">What We Do Not Do</h2>
              <p>
                We do not sell your personal information. Estimate results are informational and are not sent to insurance companies unless you choose to share information outside MyDentPlan.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Location and Dentist Search</h2>
              <p>
                If you use current location search, your browser asks for permission first. Location is used to show nearby dental offices on Google Maps.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Questions</h2>
              <p>
                For privacy questions, contact support at <a href="mailto:amralius@gmail.com" className="text-primary font-medium hover:text-blue-700">amralius@gmail.com</a>.
              </p>
            </section>
          </div>

          <div className="mt-12">
            <Link to="/faq#contact-support" className="inline-flex rounded-xl bg-primary px-6 py-3 font-semibold text-white hover:bg-blue-700">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
