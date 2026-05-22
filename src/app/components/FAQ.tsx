import { useState } from 'react';
import { MessageCircle, Send, ShieldQuestion } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [supportName, setSupportName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportTopic, setSupportTopic] = useState('Estimate question');
  const [supportMessage, setSupportMessage] = useState('');
  const [ticketStatus, setTicketStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const faqs = [
    {
      question: "Is MyDentPlan free?",
      answer: "Yes. MyDentPlan is free to use for checking symptoms, estimating costs, and finding nearby dentists."
    },
    {
      question: "Does MyDentPlan diagnose dental conditions?",
      answer: "No. MyDentPlan provides educational guidance only. It can help you understand possible next steps, but it does not diagnose conditions or replace a licensed dentist."
    },
    {
      question: "Is my information private?",
      answer: "We do not sell personal information. Your saved estimates, symptoms, and dentists are used to help you plan care inside MyDentPlan."
    },
    {
      question: "Can I use MyDentPlan without insurance?",
      answer: "Yes. You can choose the no-insurance option to see estimated self-pay costs and still use the symptom checker and dentist finder."
    },
    {
      question: "How does symptom matching work?",
      answer: "MyDentPlan uses your selected symptoms to suggest possible treatments and dentist types, such as a general dentist, endodontist, periodontist, or pediatric dentist."
    },
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
      answer: "Use the support form below to create a ticket for estimate questions, account access, saved plans, or issues using the dentist finder."
    }
  ];

  const handleSupportSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTicketStatus('sending');

    const { error } = await supabase.from('support_tickets').insert({
      name: supportName.trim(),
      email: supportEmail.trim(),
      topic: supportTopic,
      message: supportMessage.trim(),
      source: 'faq',
    });

    if (error) {
      console.error(error);
      setTicketStatus('error');
      return;
    }

    setSupportName('');
    setSupportEmail('');
    setSupportTopic('Estimate question');
    setSupportMessage('');
    setTicketStatus('sent');
  };

  return (
    <section id="faq" className="bg-white">
      <div className="max-w-3xl mx-auto px-6">
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
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-primary">
                <ShieldQuestion className="h-4 w-4" />
                Support
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Need help?
              </h3>
              <p className="text-gray-600">
                Send a ticket for account help, estimate questions, saved dentist issues, or dentist finder problems.
              </p>
              <div className="mt-5 rounded-xl bg-white p-4 text-sm text-gray-600">
                Your support requests are saved so you can track them later.
              </div>
            </div>

            <form onSubmit={handleSupportSubmit} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Name</label>
                  <input
                    value={supportName}
                    onChange={(event) => setSupportName(event.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Email</label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(event) => setSupportEmail(event.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-semibold text-gray-700">What do you need help with?</label>
                <select
                  value={supportTopic}
                  onChange={(event) => setSupportTopic(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option>Estimate question</option>
                  <option>Account access</option>
                  <option>Saved dentists</option>
                  <option>Dentist finder</option>
                  <option>Bug report</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-semibold text-gray-700">Message</label>
                <textarea
                  value={supportMessage}
                  onChange={(event) => setSupportMessage(event.target.value)}
                  required
                  rows={4}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Tell us what happened or what you need help with."
                />
              </div>

              {ticketStatus === 'sent' && (
                <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  Ticket sent. Thanks, we saved your request.
                </div>
              )}

              {ticketStatus === 'error' && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  Could not send your ticket yet. Please try again in a moment.
                </div>
              )}

              <button
                type="submit"
                disabled={ticketStatus === 'sending'}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:bg-gray-300"
              >
                {ticketStatus === 'sending' ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Ticket
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
