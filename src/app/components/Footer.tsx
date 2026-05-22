import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, Check, ClipboardList, MapPin } from 'lucide-react';
import logo from "../../imports/1-2.png";

export default function Footer() {
  const productLinks = [
    { to: '/', label: 'Overview' },
    { to: '/symptom-checker', label: 'Symptom Checker' },
    { to: '/calculator', label: 'Cost Calculator' },
    { to: '/find-dentist', label: 'Find a Dentist' },
  ];

  const planLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/calculator', label: 'Create Estimate' },
  ];

  const supportLinks = [
    { to: '/faq', label: 'FAQ' },
    { to: '/faq#contact-support', label: 'Contact Support' },
    { to: '/privacy', label: 'Privacy Policy' },
    { to: '/terms', label: 'Terms' },
  ];

  const trustItems = [
    'Free to use',
    'Privacy focused',
    'Educational guidance',
    'No credit card required',
  ];

  return (
    <footer className="bg-gray-950 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="mb-14 overflow-hidden rounded-2xl border border-blue-400/20 bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white shadow-2xl shadow-blue-950/20">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-blue-50">
                Plan your next dental step
              </div>
              <h2 className="mb-3 text-3xl font-semibold tracking-tight md:text-4xl">
                Start with clarity, then decide what to do next.
              </h2>
              <p className="max-w-2xl text-blue-50">
                Check symptoms, estimate costs, and find nearby care without jumping between disconnected tools.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <Link
                to="/symptom-checker"
                className="group flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-semibold text-primary shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50 hover:brightness-105"
              >
                <span className="flex items-center gap-2"><ClipboardList className="h-4 w-4" /> Check symptoms</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/calculator"
                className="group flex items-center justify-between rounded-xl bg-blue-900/35 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/20 transition hover:-translate-y-0.5 hover:bg-blue-900/50 hover:brightness-110"
              >
                <span className="flex items-center gap-2"><Calculator className="h-4 w-4" /> Estimate cost</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/find-dentist"
                className="group flex items-center justify-between rounded-xl bg-blue-900/35 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/20 transition hover:-translate-y-0.5 hover:bg-blue-900/50 hover:brightness-110"
              >
                <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Find dentist</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mb-10 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <Check className="h-4 w-4 text-green-400" />
              {item}
            </div>
          ))}
        </div>

        <div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" className="mb-5 inline-flex items-center">
              <img src={logo} alt="MyDentPlan" className="h-16 w-auto brightness-0 invert md:h-20" />
            </Link>
            <p className="max-w-sm text-sm leading-6 text-gray-400">
              Understand symptoms, estimate costs, and plan your dental care with confidence.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">Product</h4>
            <ul className="space-y-3 text-sm">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-gray-400 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">Plan</h4>
            <ul className="space-y-3 text-sm">
              {planLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-gray-400 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">Support</h4>
            <ul className="space-y-3 text-sm">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-gray-400 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-8 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
          <p>
            © 2026 MyDentPlan. MyDentPlan provides educational information only and does not provide medical or dental diagnoses. Cost estimates may vary.
          </p>
        </div>
      </div>
    </footer>
  );
}
