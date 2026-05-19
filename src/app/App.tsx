import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Home from './pages/Home';
import SymptomCheckerPage from './pages/SymptomCheckerPage';
import CostEstimatorPage from './pages/CostEstimatorPage';
import FAQPage from './pages/FAQPage';
import DashboardPage from './pages/DashboardPage';
import FindDentistPage from './pages/FindDentistPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-white">
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/symptom-checker" element={<SymptomCheckerPage />} />
            <Route path="/calculator" element={<CostEstimatorPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/find-dentist" element={<FindDentistPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
          </Routes>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
