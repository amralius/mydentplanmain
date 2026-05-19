import { useState } from 'react';
import { Mail, MessageCircle, ShieldQuestion } from 'lucide-react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How accurate are the cost estimates?",
      answer: "Our estimates are based on national averages and typical insurance coverage rates. Actual costs may vary depending on your specific plan, location, and dentist. We recommend verifying with your insurance provider for the most accurate information."
    },
    {
      question: "Do you share my information with insurance companies?",
      answer: "No. Your privacy is our top priority. We never share your personal information with insurance companies or third parties. All estimates are calculated locally using industry-standard coverage rates."
    },
    {
      question: "What if my insurance isn't listed?",
      answer: "While we support major insurance providers, you can still use our tool by selecting 'No Insurance' to see base costs, or choose a similar provider to get a rough estimate. We're constantly adding more insurance providers."
    },
    {
      question: "Can I save multiple estimates?",
      answer: "Yes. With a free account, you can save estimates, symptom checks, and dentists so your dashboard becomes your planning hub."
    },
    {
      question: "How often are prices updated?",
      answer: "We update our cost database quarterly based on the latest industry data and insurance provider information to ensure you get the most current estimates."
    },
    {
      question: "Can dental offices use this tool?",
      answer: "Absolutely. Our Practice plan is designed for dental offices to help patients understand their costs upfront. It includes custom branding, API access, and multi-user support."
    },
    {
      question: "How do I contact support?",
      answer: "You can email support@mydentplan.com with questions about estimates, account access, saved plans, or issues using the dentist finder."
    }
  ];

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-semibold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about MyDentPlan
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-2xl overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 pr-8">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        <div id="contact-support" className="mt-12 rounded-2xl border border-blue-100 bg-blue-50 p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-primary">
                <ShieldQuestion className="h-4 w-4" />
                Support
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Still have questions?
              </h3>
              <p className="text-gray-600">
                Contact MyDentPlan support for account help, estimate questions, or dentist finder issues.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="mailto:support@mydentplan.com?subject=MyDentPlan%20Support"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                <Mail className="h-4 w-4" />
                Email Support
              </a>
              <a
                href="mailto:support@mydentplan.com?subject=MyDentPlan%20Feedback"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-3 font-semibold text-gray-700 transition hover:bg-blue-50"
              >
                <MessageCircle className="h-4 w-4" />
                Send Feedback
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
