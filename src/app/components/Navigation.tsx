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
    `transition-colors font-medium ${
      isActive ? 'text-primary' : 'text-gray-600 hover:text-gray-900'
    }`;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="MyDentPlan" className="h-11 md:h-14 w-auto" />
            </Link>

            <div className="hidden md:flex items-center gap-8">
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

            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                >
                  Log Out
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleAuthClick('login')}
                    className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleAuthClick('signup')}
                    className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-md hover:shadow-lg"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden mt-4 border-t border-gray-200 pt-4 pb-2">
              <div className="flex flex-col gap-3">
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
                    className="w-full text-left text-gray-600 hover:text-gray-900 transition-colors font-medium"
                  >
                    Log Out
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleAuthClick('login')}
                      className="w-full text-left text-gray-600 hover:text-gray-900 transition-colors font-medium"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => handleAuthClick('signup')}
                      className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-md"
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
