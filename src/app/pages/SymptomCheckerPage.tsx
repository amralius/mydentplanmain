import { useNavigate } from 'react-router-dom';
import SymptomChecker from '../components/SymptomChecker';

export default function SymptomCheckerPage() {
  const navigate = useNavigate();

  const handleEstimateCost = (treatments?: string[]) => {
    navigate('/calculator', { state: { preSelectedTreatments: treatments || [] } });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-semibold text-gray-900 mb-4">
              Dental Symptom Checker
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tell us about your symptoms and we'll help you understand potential treatments and costs
            </p>
          </div>
          <SymptomChecker onEstimateCost={handleEstimateCost} />
        </div>
      </div>
    </div>
  );
}
