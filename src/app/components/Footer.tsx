import { Link } from 'react-router-dom';
import logo from "../../imports/1-2.png";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <img src={logo} alt="MyDentPlan" className="h-12 md:h-16 w-auto brightness-0 invert" />
            </div>
            <p className="text-sm text-gray-400">
              Making dental care costs transparent and easier to plan.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Overview</Link></li>
              <li><Link to="/symptom-checker" className="hover:text-white transition-colors">Symptom Checker</Link></li>
              <li><Link to="/calculator" className="hover:text-white transition-colors">Cost Calculator</Link></li>
              <li><Link to="/find-dentist" className="hover:text-white transition-colors">Find a Dentist</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Plan</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link to="/calculator" className="hover:text-white transition-colors">Create Estimate</Link></li>
              <li><Link to="/symptom-checker" className="hover:text-white transition-colors">Save Symptom Check</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">About MyDentPlan</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">How estimates work</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">Coverage questions</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">Important disclaimer</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © 2026 MyDentPlan. Estimates are informational and are not a dental diagnosis or coverage guarantee.
          </p>
          <Link to="/symptom-checker" className="text-sm text-gray-300 hover:text-white transition-colors">
            Start a symptom check
          </Link>
        </div>
      </div>
    </footer>
  );
}
