import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import logo from "../../imports/1-2.png";

export default function Navigation() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    navigate('/');
  };
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/symptom-checker', label: 'Symptom Checker' },
    { to: '/calculator', label: 'Cost Estimator' },
    { to: '/find-dentist', label: 'Find Dentist' },
    { to: '/faq', label: 'FAQ' },
  ];

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setIsMenuOpen(false);
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-4 py-2 text-sm transition-colors font-medium ${
      isActive ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:bg-white/70 hover:text-gray-900'
    }`;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
        <div className="max-w-7xl mx-auto rounded-2xl border border-blue-100/80 bg-white/90 px-4 py-3 shadow-[0_14px_40px_rgba(37,99,235,0.10)] backdrop-blur-md">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
            <Link to="/" className="flex min-w-0 items-center gap-2">
              <img src={logo} alt="MyDentPlan" className="h-12 md:h-16 w-auto" />
            </Link>

            <div className="hidden lg:flex justify-center">
              <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50/90 p-1">
              {navLinks.map((link) => (
                <NavLink key={link.to} to={link.to} className={linkClass}>
                  {link.label}
                </NavLink>
              ))}
              {isAuthenticated && (
                <NavLink to="/dashboard" className={linkClass}>
                  Dashboard
                </NavLink>
              )}
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-end gap-2 rounded-full border border-gray-200 bg-gray-50/90 p-1">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="rounded-full px-5 py-2.5 text-sm text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm transition-all font-medium"
                >
                  Log Out
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleAuthClick('login')}
                    className="rounded-full px-5 py-2.5 text-sm text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm transition-all font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleAuthClick('signup')}
                    className="rounded-full bg-primary px-6 py-2.5 text-sm text-white hover:bg-blue-700 transition-all font-semibold shadow-md hover:shadow-lg"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="lg:hidden justify-self-end p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="lg:hidden mt-4 border-t border-gray-200 pt-4 pb-2">
              <div className="grid gap-2">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMenuOpen(false)}
                    className={linkClass}
                  >
                    {link.label}
                  </NavLink>
                ))}
                {isAuthenticated && (
                  <NavLink
                    to="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className={linkClass}
                  >
                    Dashboard
                  </NavLink>
                )}
              </div>

              <div className="mt-5 flex flex-col gap-3">
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-xl bg-gray-100 px-5 py-3 text-left text-gray-700 hover:bg-gray-200 transition-colors font-medium"
                  >
                    Log Out
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleAuthClick('login')}
                      className="w-full rounded-xl border border-gray-200 bg-white px-5 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => handleAuthClick('signup')}
                      className="w-full px-6 py-3 bg-primary text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-md"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </>
  );
}
