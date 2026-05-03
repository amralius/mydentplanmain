import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import logo from "../../imports/1-2.png";

export default function Navigation() {
  const { isAuthenticated, logout } = useAuth();
const navigate = useNavigate();

const handleLogout = async () => {
  await logout();
  navigate('/');
};
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="MyDentPlan" className="h-12 md:h-16 w-auto" />
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                Home
              </Link>
              <Link to="/symptom-checker" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                Symptom Checker
              </Link>
              <Link to="/calculator" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                Cost Estimator
              </Link>
              <Link to="/faq" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                FAQ
              </Link>
              {isAuthenticated && (
                <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                  Dashboard
                </Link>
              )}
            </div>

            <div className="flex items-center gap-4">
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
          </div>
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
