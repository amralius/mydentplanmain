import { useNavigate } from 'react-router-dom';
import SymptomChecker from '../components/SymptomChecker';

export default function SymptomCheckerPage() {
  const navigate = useNavigate();

  const handleEstimateCost = (treatments?: string[]) => {
    navigate('/calculator', { state: { preSelectedTreatments: treatments || [] } });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-32 pb-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-6">
            <h1 className="text-5xl font-semibold text-gray-900 mb-4">
              Dental Symptom Checker
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Select where you feel discomfort, describe your symptoms, and receive possible treatment insights and cost estimates.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-primary">
              <span aria-hidden="true">⏱</span>
              Takes about 2–3 minutes
            </div>
          </div>
          <SymptomChecker onEstimateCost={handleEstimateCost} />
        </div>
      </div>
    </div>
  );
}
