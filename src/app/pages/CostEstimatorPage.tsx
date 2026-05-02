import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import EstimateCard from '../components/EstimateCard';
import SaveEstimateModal from '../components/SaveEstimateModal';

export default function CostEstimatorPage() {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const preSelectedTreatments = (location.state as { preSelectedTreatments?: string[] })?.preSelectedTreatments || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-semibold text-gray-900 mb-4">
              Cost Estimator
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get your personalized dental cost estimate in seconds
            </p>
          </div>
          <div className="flex justify-center">
            <EstimateCard
              onSaveClick={() => setIsModalOpen(true)}
              preSelectedTreatments={preSelectedTreatments}
            />
          </div>
        </div>
      </div>
      <SaveEstimateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
