import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ToothChart from './ToothChart';
import AuthModal from './AuthModal';
import InsuranceVerificationModal from './InsuranceVerificationModal';

type Screen = 'entry' | 'selection' | 'treatment-suggestions' | 'insurance' | 'cost-estimate';
type Area = 'gums' | 'jaw' | 'left-side' | 'right-side';
type Duration = 'today' | 'few-days' | '1-2-weeks' | 'longer';

interface SymptomCheckerProps {
  onEstimateCost: (treatments?: string[]) => void;
}

export default function SymptomChecker({ onEstimateCost }: SymptomCheckerProps) {
  const [screen, setScreen] = useState<Screen>('entry');
  const [isPediatric, setIsPediatric] = useState(false);
  const [selectedTeeth, setSelectedTeeth] = useState<(number | string)[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<Area[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [duration, setDuration] = useState<Duration>('today');
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);
  const [insurance, setInsurance] = useState('');
  const [insuranceSearch, setInsuranceSearch] = useState('');
  const [showInsuranceDropdown, setShowInsuranceDropdown] = useState(false);
  const [metDeductible, setMetDeductible] = useState(false);
  const [annualMaxRemaining, setAnnualMaxRemaining] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [saveState, setSaveState] = useState<'unsaved' | 'saved' | 'error'>('unsaved');
  const [saveError, setSaveError] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { isAuthenticated, saveSymptomCheck } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowInsuranceDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset save state when user modifies the symptom check
  useEffect(() => {
    if (saveState === 'saved') {
      setSaveState('unsaved');
    }
  }, [selectedTeeth, symptoms, selectedTreatments, insurance, zipCode]);

  const symptomOptions = [
    'Sharp pain',
    'Throbbing pain',
    'Pain when biting',
    'Sensitivity to cold',
    'Sensitivity to heat',
    'Swelling',
    'Bleeding gums',
    'Bad taste in mouth',
    'Loose tooth',
    'Broken/chipped tooth',
    'Wisdom tooth pain',
  ];

  const areas: { id: Area; label: string }[] = [
    { id: 'gums', label: 'Gums' },
    { id: 'jaw', label: 'Jaw' },
    { id: 'left-side', label: 'Left Side' },
    { id: 'right-side', label: 'Right Side' },
  ];

  const quickSymptoms = [
    'Sharp pain',
    'Throbbing pain',
    'Sensitive to cold',
    'Sensitive to heat',
    'Pain when biting',
    'Swelling',
    'Bleeding gums',
    'No pain, just concern',
  ];

  const handleToothClick = (tooth: number | string) => {
    setSelectedTeeth((prev) =>
      prev.includes(tooth) ? prev.filter((t) => t !== tooth) : [...prev, tooth]
    );
  };

  const handleAreaToggle = (area: Area) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleSymptomToggle = (symptom: string) => {
    setSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleSubmit = () => {
    const suggested = getSuggestedTreatments();
    setSelectedTreatments(suggested);
    setScreen('treatment-suggestions');
  };

  const handleReset = () => {
    setScreen('entry');
    setSelectedTeeth([]);
    setSelectedAreas([]);
    setSymptoms([]);
    setDuration('today');
    setIsPediatric(false);
    setSelectedTreatments([]);
    setInsurance('');
    setInsuranceSearch('');
    setMetDeductible(false);
    setAnnualMaxRemaining('');
    setZipCode('');
  };

  const handleSaveSymptomCheck = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    const result = saveSymptomCheck({
      teeth: selectedTeeth,
      symptoms,
      suggestedTreatments: selectedTreatments,
    });

    if (result.success) {
      setSaveState('saved');
    } else {
      setSaveState('error');
      if (result.error === 'duplicate') {
        setSaveError('This symptom check is already saved to your dashboard.');
      } else {
        setSaveError('Couldn\'t save. Please try again.');
      }
    }
  };

  const getLocationMultiplier = (zip: string): number => {
    if (!zip || zip.length < 3) return 1.0;

    const highCostPrefixes = [
      '100', '101', '102', '103', '104', // NYC
      '941', '943', '944', // San Francisco
      '900', '902', '903', // Los Angeles
      '021', '022', // Boston
      '981', // Seattle
      '606', '607', '608', // Chicago
      '200', '202', // DC
      '331', '332', '333', // Miami
      '946', '947', '948', // San Jose
      '970', '973', // Portland
    ];

    const zipPrefix = zip.substring(0, 3);
    return highCostPrefixes.includes(zipPrefix) ? 1.3 : 1.0;
  };

  const getLocationName = (zip: string): string => {
    if (!zip || zip.length < 3) return 'your area';

    const zipPrefix = zip.substring(0, 3);
    const highCostPrefixes = [
      '100', '101', '102', '103', '104',
      '941', '943', '944',
      '900', '902', '903',
      '021', '022',
      '981',
      '606', '607', '608',
      '200', '202',
      '331', '332', '333',
      '946', '947', '948',
      '970', '973',
    ];

    return highCostPrefixes.includes(zipPrefix) ? 'your metro area' : 'your area';
  };

  const popularProviders = [
    'Delta Dental',
    'Aetna Dental',
    'Cigna Dental',
    'MetLife Dental',
    'Guardian Dental',
    'UnitedHealthcare Dental',
  ];

  const nyProviders = [
    'Anthem Blue Cross Blue Shield Dental',
    'EmblemHealth Dental',
    'Healthfirst Dental',
    'Fidelis Care Dental',
  ];

  const allProviders = [...popularProviders, ...nyProviders, 'No Insurance'];

  const filteredProviders = allProviders.filter(provider =>
    provider.toLowerCase().includes(insuranceSearch.toLowerCase())
  );

  const isUrgent = () => {
    return (
      symptoms.includes('Swelling') ||
      symptoms.includes('Throbbing pain') ||
      selectedTeeth.length > 3 ||
      selectedAreas.length > 2
    );
  };

  const getPossibleCauses = () => {
    const causes = [];

    if (symptoms.includes('Sharp pain') && symptoms.includes('Sensitivity to cold')) {
      causes.push({
        name: 'Possible Cavity',
        description: 'Tooth decay may have reached the inner layers of your tooth.',
      });
    }

    if (symptoms.includes('Bleeding gums') || symptoms.includes('Swelling')) {
      causes.push({
        name: 'Gum Inflammation (Gingivitis)',
        description: 'Your gums may be inflamed due to plaque buildup or infection.',
      });
    }

    if (symptoms.includes('Pain when biting') || symptoms.includes('Broken/chipped tooth')) {
      causes.push({
        name: 'Cracked or Damaged Tooth',
        description: 'A crack or fracture may be causing pain when pressure is applied.',
      });
    }

    if (symptoms.includes('Throbbing pain') && symptoms.includes('Sensitivity to heat')) {
      causes.push({
        name: 'Possible Infection',
        description: 'The tooth pulp may be infected, requiring immediate attention.',
      });
    }

    if (symptoms.includes('Wisdom tooth pain')) {
      causes.push({
        name: 'Wisdom Tooth Issues',
        description: 'Your wisdom teeth may be impacted or growing incorrectly.',
      });
    }

    if (causes.length === 0) {
      causes.push({
        name: 'General Dental Concern',
        description: 'Based on your symptoms, a dental examination is recommended.',
      });
    }

    return causes.slice(0, 4);
  };

  const getSuggestedTreatments = () => {
    const treatments = new Set<string>();

    if (symptoms.includes('Sharp pain') || symptoms.includes('Sensitivity to cold')) {
      treatments.add('Filling');
      treatments.add('Dental Exam');
    }

    if (symptoms.includes('Bleeding gums') || selectedAreas.includes('gums')) {
      treatments.add('Cleaning');
      treatments.add('Deep Cleaning');
      treatments.add('Dental Exam');
    }

    if (symptoms.includes('Broken/chipped tooth')) {
      treatments.add('Crown');
      treatments.add('X-rays');
    }

    if (symptoms.includes('Throbbing pain') && symptoms.includes('Swelling')) {
      treatments.add('Root Canal');
      treatments.add('X-rays');
      treatments.add('Emergency Exam');
    }

    if (symptoms.includes('Wisdom tooth pain')) {
      treatments.add('Wisdom Tooth Removal');
      treatments.add('X-rays');
      treatments.add('Consultation');
    }

    if (symptoms.includes('Loose tooth')) {
      treatments.add('Dental Exam');
      treatments.add('Extraction');
    }

    if (symptoms.includes('Sensitivity to heat') || symptoms.includes('Sensitivity to cold')) {
      treatments.add('Fluoride Treatment');
      treatments.add('Filling');
    }

    if (treatments.size === 0) {
      treatments.add('Dental Exam');
    }

    return Array.from(treatments);
  };

  if (screen === 'entry') {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h2 className="text-4xl font-semibold text-gray-900 mb-4">
            Check Your Dental Symptoms
          </h2>
          <p className="text-xl text-gray-600 max-w-xl mx-auto">
            Select where you feel discomfort and describe your symptoms to get guidance.
          </p>
        </div>
        <button
          onClick={() => setScreen('selection')}
          className="px-8 py-4 bg-primary text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg"
        >
          Start Symptom Check
        </button>
      </div>
    );
  }

  if (screen === 'selection') {
    const hasSelections = selectedTeeth.length > 0 || selectedAreas.length > 0;

    const handleRegionSelect = (region: string) => {
      const upperTeethList = isPediatric ? ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
      const lowerTeethList = isPediatric ? ['T', 'S', 'R', 'Q', 'P', 'O', 'N', 'M', 'L', 'K'] : [32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17];

      let teethToSelect: (number | string)[] = [];

      if (region === 'left') {
        teethToSelect = isPediatric
          ? ['F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O']
          : [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
      } else if (region === 'right') {
        teethToSelect = isPediatric
          ? ['A', 'B', 'C', 'D', 'E', 'P', 'Q', 'R', 'S', 'T']
          : [1, 2, 3, 4, 5, 6, 7, 8, 25, 26, 27, 28, 29, 30, 31, 32];
      } else if (region === 'front') {
        teethToSelect = isPediatric
          ? ['D', 'E', 'F', 'G', 'N', 'O', 'P', 'Q']
          : [6, 7, 8, 9, 10, 11, 22, 23, 24, 25, 26, 27];
      } else if (region === 'back') {
        teethToSelect = isPediatric
          ? ['A', 'B', 'C', 'H', 'I', 'J', 'K', 'L', 'M', 'R', 'S', 'T']
          : [1, 2, 3, 4, 5, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 28, 29, 30, 31, 32];
      }

      setSelectedTeeth(prev => {
        const allSelected = teethToSelect.every(t => prev.includes(t));
        return allSelected ? prev.filter(t => !teethToSelect.includes(t)) : [...new Set([...prev, ...teethToSelect])];
      });
    };

    const steps = [
      { num: 1, label: 'Select Area', active: true },
      { num: 2, label: 'Symptoms', active: hasSelections && symptoms.length > 0 },
      { num: 3, label: 'Review Treatments', active: false },
      { num: 4, label: 'Estimate Cost', active: false },
    ];

    return (
      <div className="max-w-7xl mx-auto py-12">
        {/* Step Progress */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((step, index) => (
              <div key={step.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step.active
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step.num}
                  </div>
                  <div className={`text-xs mt-2 font-medium ${step.active ? 'text-primary' : 'text-gray-500'}`}>
                    {step.label}
                  </div>
                </div>
                {index < 3 && (
                  <div className={`w-16 h-1 mx-2 ${step.active ? 'bg-primary' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2 text-center">
            Step 1: Select Area of Pain
          </h2>
          <p className="text-gray-600 text-center">Tap on teeth or select regions where you feel discomfort</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
              <div className="flex gap-3 mb-6 justify-center">
                <button
                  onClick={() => setIsPediatric(false)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    !isPediatric
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Adult Teeth
                </button>
                <button
                  onClick={() => setIsPediatric(true)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    isPediatric
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Pediatric Teeth
                </button>
              </div>

              <ToothChart
                selectedTeeth={selectedTeeth}
                onToothClick={handleToothClick}
                isPediatric={isPediatric}
              />

              <div className="mt-8 pt-8 border-t-2 border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 text-center">Region Shortcuts</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  <button
                    onClick={() => handleRegionSelect('left')}
                    className="px-5 py-4 rounded-xl bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 text-gray-700 font-semibold transition-all hover:from-blue-100 hover:to-blue-50 hover:border-blue-300 hover:shadow-md active:scale-95"
                  >
                    <div className="text-2xl mb-1">←</div>
                    <div className="text-sm">Left Side</div>
                  </button>
                  <button
                    onClick={() => handleRegionSelect('right')}
                    className="px-5 py-4 rounded-xl bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 text-gray-700 font-semibold transition-all hover:from-blue-100 hover:to-blue-50 hover:border-blue-300 hover:shadow-md active:scale-95"
                  >
                    <div className="text-2xl mb-1">→</div>
                    <div className="text-sm">Right Side</div>
                  </button>
                  <button
                    onClick={() => handleRegionSelect('front')}
                    className="px-5 py-4 rounded-xl bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 text-gray-700 font-semibold transition-all hover:from-purple-100 hover:to-purple-50 hover:border-purple-300 hover:shadow-md active:scale-95"
                  >
                    <div className="text-2xl mb-1">😁</div>
                    <div className="text-sm">Front Teeth</div>
                  </button>
                  <button
                    onClick={() => handleRegionSelect('back')}
                    className="px-5 py-4 rounded-xl bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 text-gray-700 font-semibold transition-all hover:from-purple-100 hover:to-purple-50 hover:border-purple-300 hover:shadow-md active:scale-95"
                  >
                    <div className="text-2xl mb-1">🦷</div>
                    <div className="text-sm">Back Teeth</div>
                  </button>
                </div>

                <h3 className="font-semibold text-gray-900 mb-4 text-center">Additional Areas</h3>
                <div className="flex flex-wrap gap-3 justify-center">
                  {areas.map((area) => (
                    <button
                      key={area.id}
                      onClick={() => handleAreaToggle(area.id)}
                      className={`px-6 py-3 rounded-xl border-2 font-medium transition-all transform hover:scale-105 active:scale-95 ${
                        selectedAreas.includes(area.id)
                          ? 'bg-primary border-primary text-white shadow-lg'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      {area.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className={`sticky top-24 transition-all ${hasSelections ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-3xl shadow-xl p-6 border-2 border-blue-100">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Selected Area
                </h3>

                {selectedTeeth.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">Teeth:</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedTeeth.map((tooth, index) => (
                        <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                          {tooth}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedAreas.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">Areas:</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedAreas.map((area, index) => (
                        <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                          {areas.find(a => a.id === area)?.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {hasSelections && (
                  <>
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3 text-sm">Quick Symptom Select</h4>
                      <div className="space-y-2">
                        {quickSymptoms.map((symptom) => (
                          <label
                            key={symptom}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                              symptoms.includes(symptom)
                                ? 'bg-primary/10 border border-primary'
                                : 'bg-white border border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={symptoms.includes(symptom)}
                              onChange={() => handleSymptomToggle(symptom)}
                              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-gray-700">{symptom}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        How long have you had this?
                      </label>
                      <select
                        value={duration}
                        onChange={(e) => setDuration(e.target.value as Duration)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="today">Today</option>
                        <option value="few-days">Few days</option>
                        <option value="1-2-weeks">1–2 weeks</option>
                        <option value="longer">Longer</option>
                      </select>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={symptoms.length === 0}
                      className="w-full mt-6 px-6 py-4 bg-primary text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl font-semibold flex items-center justify-center gap-2"
                    >
                      Continue to Results
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </>
                )}

                {!hasSelections && (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-sm text-gray-500">Select teeth or areas to continue</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'treatment-suggestions') {
    const allTreatments = [
      'Dental Exam',
      'Emergency Exam',
      'X-rays',
      'Consultation',
      'Cleaning',
      'Deep Cleaning',
      'Fluoride Treatment',
      'Filling',
      'Crown',
      'Root Canal',
      'Extraction',
      'Implant',
      'Wisdom Tooth Removal',
      'Braces/Invisalign',
      'Whitening',
    ];

    const steps = [
      { num: 1, label: 'Select Area', active: true },
      { num: 2, label: 'Symptoms', active: true },
      { num: 3, label: 'Review Treatments', active: true },
      { num: 4, label: 'Estimate Cost', active: false },
    ];

    return (
      <div className="max-w-4xl mx-auto py-12">
        {/* Step Progress */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((step, index) => (
              <div key={step.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step.active
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step.num}
                  </div>
                  <div className={`text-xs mt-2 font-medium ${step.active ? 'text-primary' : 'text-gray-500'}`}>
                    {step.label}
                  </div>
                </div>
                {index < 3 && (
                  <div className={`w-16 h-1 mx-2 ${step.active ? 'bg-primary' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {isUrgent() && (
          <div className="mb-8 p-6 bg-red-50 border-2 border-red-500 rounded-2xl">
            <div className="flex gap-4">
              <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Urgent Dental Care May Be Needed</h3>
                <p className="text-red-800">
                  Seek professional treatment if you have swelling, fever, or severe pain.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-semibold text-gray-900 mb-2">
            Review Suggested Treatments
          </h2>
          <p className="text-gray-600 mb-8">
            Based on your symptoms, these are common treatments that may be recommended. Select the ones you'd like to estimate.
          </p>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Possible Causes</h3>
            <div className="space-y-3">
              {getPossibleCauses().map((cause, index) => (
                <div key={index} className="p-4 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-1">{cause.name}</h4>
                  <p className="text-gray-600 text-sm">{cause.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Select Treatments to Estimate</h3>
            <p className="text-sm text-gray-600 mb-4">Choose all that may apply to get a comprehensive cost estimate</p>
            <div className="grid md:grid-cols-2 gap-3">
              {allTreatments.map((treatment) => (
                <label
                  key={treatment}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedTreatments.includes(treatment)
                      ? 'bg-primary/5 border-primary shadow-sm'
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedTreatments.includes(treatment)}
                    onChange={() => {
                      setSelectedTreatments(prev =>
                        prev.includes(treatment)
                          ? prev.filter(t => t !== treatment)
                          : [...prev, treatment]
                      );
                    }}
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-gray-700 font-medium">{treatment}</span>
                </label>
              ))}
            </div>
            {selectedTreatments.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-gray-700">
                  <strong>{selectedTreatments.length}</strong> {selectedTreatments.length === 1 ? 'treatment' : 'treatments'} selected
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setScreen('selection')}
              className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
            >
              ← Back
            </button>
            <button
              onClick={() => setScreen('insurance')}
              disabled={selectedTreatments.length === 0}
              className="flex-1 px-6 py-4 bg-primary text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-medium shadow-lg hover:shadow-xl"
            >
              Continue to Estimate →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'insurance') {
    const steps = [
      { num: 1, label: 'Select Area', active: true },
      { num: 2, label: 'Symptoms', active: true },
      { num: 3, label: 'Review Treatments', active: true },
      { num: 4, label: 'Estimate Cost', active: true },
    ];

    return (
      <div className="max-w-3xl mx-auto py-12">
        {/* Step Progress */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((step, index) => (
              <div key={step.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step.active
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step.num}
                  </div>
                  <div className={`text-xs mt-2 font-medium ${step.active ? 'text-primary' : 'text-gray-500'}`}>
                    {step.label}
                  </div>
                </div>
                {index < 3 && (
                  <div className={`w-16 h-1 mx-2 ${step.active ? 'bg-primary' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-semibold text-gray-900 mb-2">
            Insurance & Location Details
          </h2>
          <p className="text-gray-600 mb-6">
            Choose how to estimate your coverage
          </p>

          <div className="space-y-6">
            {/* Option 1: Estimate with basic info */}
            <div className="p-4 border-2 border-primary bg-primary/5 rounded-xl">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-semibold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Estimate with Basic Info</h4>
                  <p className="text-xs text-gray-600">Get estimated coverage range based on your insurance provider</p>
                </div>
              </div>

              <div className="space-y-6 ml-9">
            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Insurance Provider <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={insurance || insuranceSearch}
                onChange={(e) => {
                  setInsuranceSearch(e.target.value);
                  setInsurance('');
                  setShowInsuranceDropdown(true);
                }}
                onFocus={() => setShowInsuranceDropdown(true)}
                placeholder="Search insurance providers..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              {showInsuranceDropdown && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                  {filteredProviders.filter(p => popularProviders.includes(p)).length > 0 && (
                    <div>
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">Popular Providers</div>
                      {filteredProviders
                        .filter(p => popularProviders.includes(p))
                        .map((provider) => (
                          <button
                            key={provider}
                            onClick={() => {
                              setInsurance(provider);
                              setInsuranceSearch('');
                              setShowInsuranceDropdown(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                          >
                            {provider}
                          </button>
                        ))}
                    </div>
                  )}
                  {filteredProviders.filter(p => nyProviders.includes(p)).length > 0 && (
                    <div>
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">New York Providers</div>
                      {filteredProviders
                        .filter(p => nyProviders.includes(p))
                        .map((provider) => (
                          <button
                            key={provider}
                            onClick={() => {
                              setInsurance(provider);
                              setInsuranceSearch('');
                              setShowInsuranceDropdown(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                          >
                            {provider}
                          </button>
                        ))}
                    </div>
                  )}
                  {filteredProviders.includes('No Insurance') && (
                    <button
                      onClick={() => {
                        setInsurance('No Insurance');
                        setInsuranceSearch('');
                        setShowInsuranceDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-t border-gray-200"
                    >
                      No Insurance
                    </button>
                  )}
                  {filteredProviders.length === 0 && (
                    <div className="px-4 py-3 text-gray-500 text-sm">No providers found</div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                ZIP Code <span className="text-gray-500 font-normal">(for location-based pricing)</span>
              </label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                  setZipCode(value);
                }}
                placeholder="e.g., 10001"
                maxLength={5}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                Helps provide more accurate cost estimates for your area
              </p>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all">
                <input
                  type="checkbox"
                  checked={metDeductible}
                  onChange={(e) => setMetDeductible(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">I have met my annual deductible</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-1">
                Check this if you've already met your insurance deductible this year
              </p>
            </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Annual Maximum Remaining <span className="text-gray-500 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500">$</span>
                    <input
                      type="number"
                      value={annualMaxRemaining}
                      onChange={(e) => setAnnualMaxRemaining(e.target.value)}
                      placeholder="1500"
                      className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Most dental plans have an annual maximum (typically $1,000-$2,000). Enter how much coverage you have left for this year.
                  </p>
                </div>
              </div>
            </div>

            {/* Option 2: Verify Insurance */}
            <div className="p-4 border-2 border-gray-200 rounded-xl bg-gray-50">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-semibold">2</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">Verify My Insurance</h4>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    Real-time insurance verification will be available in a future version.
                  </p>
                  <button
                    onClick={() => setShowVerificationModal(true)}
                    className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed opacity-75"
                    disabled
                  >
                    Verify My Insurance
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => setScreen('treatment-suggestions')}
              className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
            >
              ← Back
            </button>
            <button
              onClick={() => setScreen('cost-estimate')}
              disabled={!insurance}
              className="flex-1 px-6 py-4 bg-primary text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-medium shadow-lg hover:shadow-xl"
            >
              Calculate My Estimate →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'cost-estimate') {
    const steps = [
      { num: 1, label: 'Select Area', active: true },
      { num: 2, label: 'Symptoms', active: true },
      { num: 3, label: 'Review Treatments', active: true },
      { num: 4, label: 'Estimate Cost', active: true },
    ];

    const TREATMENT_COSTS: Record<string, { min: number; max: number; type: 'diagnostic' | 'preventive' | 'basic' | 'major' }> = {
      'Dental Exam': { min: 75, max: 125, type: 'diagnostic' },
      'Emergency Exam': { min: 125, max: 200, type: 'diagnostic' },
      'X-rays': { min: 100, max: 150, type: 'diagnostic' },
      'Consultation': { min: 50, max: 100, type: 'diagnostic' },
      'Cleaning': { min: 100, max: 200, type: 'preventive' },
      'Deep Cleaning': { min: 250, max: 400, type: 'preventive' },
      'Fluoride Treatment': { min: 30, max: 75, type: 'preventive' },
      'Filling': { min: 150, max: 350, type: 'basic' },
      'Crown': { min: 1000, max: 1500, type: 'major' },
      'Root Canal': { min: 1200, max: 2000, type: 'major' },
      'Extraction': { min: 200, max: 400, type: 'basic' },
      'Implant': { min: 3000, max: 4500, type: 'major' },
      'Wisdom Tooth Removal': { min: 300, max: 600, type: 'major' },
      'Braces/Invisalign': { min: 4000, max: 6000, type: 'major' },
      'Whitening': { min: 400, max: 600, type: 'preventive' },
    };

    const INSURANCE_COVERAGE: Record<string, { diagnostic: number; preventive: number; basic: number; major: number }> = {
      'Delta Dental': { diagnostic: 100, preventive: 100, basic: 80, major: 50 },
      'Aetna Dental': { diagnostic: 100, preventive: 100, basic: 80, major: 50 },
      'Cigna Dental': { diagnostic: 100, preventive: 100, basic: 80, major: 50 },
      'MetLife Dental': { diagnostic: 100, preventive: 100, basic: 70, major: 50 },
      'Guardian Dental': { diagnostic: 100, preventive: 100, basic: 75, major: 50 },
      'UnitedHealthcare Dental': { diagnostic: 100, preventive: 100, basic: 80, major: 50 },
      'Anthem Blue Cross Blue Shield Dental': { diagnostic: 100, preventive: 100, basic: 80, major: 50 },
      'EmblemHealth Dental': { diagnostic: 100, preventive: 100, basic: 75, major: 50 },
      'Healthfirst Dental': { diagnostic: 100, preventive: 100, basic: 75, major: 50 },
      'Fidelis Care Dental': { diagnostic: 90, preventive: 90, basic: 70, major: 50 },
      'No Insurance': { diagnostic: 0, preventive: 0, basic: 0, major: 0 },
    };

    const locationMultiplier = getLocationMultiplier(zipCode);
    let totalMinCost = 0;
    let totalMaxCost = 0;
    let insuranceCoverageMin = 0;
    let insuranceCoverageMax = 0;

    selectedTreatments.forEach(treatment => {
      const cost = TREATMENT_COSTS[treatment];
      if (cost) {
        const adjustedMinCost = Math.round(cost.min * locationMultiplier);
        const adjustedMaxCost = Math.round(cost.max * locationMultiplier);

        totalMinCost += adjustedMinCost;
        totalMaxCost += adjustedMaxCost;

        const coverageRate = INSURANCE_COVERAGE[insurance]?.[cost.type] || 0;
        const adjustedRate = metDeductible ? coverageRate : Math.max(0, coverageRate - 20);

        insuranceCoverageMin += (adjustedMinCost * adjustedRate) / 100;
        insuranceCoverageMax += (adjustedMaxCost * adjustedRate) / 100;
      }
    });

    const maxRemainingNumber = annualMaxRemaining ? parseInt(annualMaxRemaining) : Infinity;
    insuranceCoverageMin = Math.min(insuranceCoverageMin, maxRemainingNumber);
    insuranceCoverageMax = Math.min(insuranceCoverageMax, maxRemainingNumber);

    const outOfPocketMin = Math.max(0, totalMinCost - insuranceCoverageMax);
    const outOfPocketMax = Math.max(0, totalMaxCost - insuranceCoverageMin);

    return (
      <div className="max-w-3xl mx-auto py-12">
        {/* Step Progress */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((step, index) => (
              <div key={step.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step.active
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step.num}
                  </div>
                  <div className={`text-xs mt-2 font-medium ${step.active ? 'text-primary' : 'text-gray-500'}`}>
                    {step.label}
                  </div>
                </div>
                {index < 3 && (
                  <div className={`w-16 h-1 mx-2 ${step.active ? 'bg-primary' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-semibold text-gray-900 mb-2">
            Your Cost Estimate
          </h2>
          <p className="text-gray-600 mb-8">
            Based on your symptoms and selected treatments
          </p>

          <div className="space-y-4 mb-8">
            <div>
              <div className="text-sm font-medium text-gray-600 mb-2">Selected Treatments ({selectedTreatments.length})</div>
              <div className="flex flex-wrap gap-2">
                {selectedTreatments.map((treatment, index) => (
                  <span key={index} className="px-3 py-1.5 bg-gradient-to-br from-blue-50 to-white border border-blue-200 text-gray-700 rounded-lg text-sm">
                    {treatment}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <div className="p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl">
                <div className="text-sm font-medium text-gray-600 mb-1">Typical Cost Range</div>
                <div className="text-3xl font-semibold text-gray-900">
                  ${totalMinCost.toLocaleString()} – ${totalMaxCost.toLocaleString()}
                </div>
                {zipCode && (
                  <div className="text-xs text-gray-500 mt-1">
                    Based on costs in your area ({zipCode})
                  </div>
                )}
              </div>

              <div className="p-5 bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-xl">
                <div className="text-sm font-medium text-gray-600 mb-1">Estimated Insurance Coverage</div>
                <div className="text-3xl font-semibold text-green-700">
                  ${Math.round(insuranceCoverageMin).toLocaleString()} – ${Math.round(insuranceCoverageMax).toLocaleString()}
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  Insurance estimate based on typical {insurance} coverage
                </div>
              </div>

              <div className="p-5 bg-gradient-to-br from-blue-50 to-white border-2 border-primary rounded-xl">
                <div className="text-sm font-medium text-gray-600 mb-1">Estimated Out-of-Pocket Cost</div>
                <div className="text-4xl font-semibold text-primary">
                  {outOfPocketMin === 0 && outOfPocketMax === 0 ? (
                    <span className="text-green-700">$0 (Fully Covered)</span>
                  ) : (
                    `$${Math.round(outOfPocketMin).toLocaleString()} – $${Math.round(outOfPocketMax).toLocaleString()}`
                  )}
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  What you may pay after insurance
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-6">
            <div className="flex gap-2 items-start">
              <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="text-xs text-gray-700 leading-relaxed">
                <strong>Important:</strong> These are estimated costs based on typical pricing and insurance coverage {zipCode ? `in ${getLocationName(zipCode)}` : 'in your area'}. This is not a diagnosis or guarantee of coverage. Final treatment and pricing must be confirmed by a licensed dentist and your insurance provider.
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {saveState === 'saved' && (
              <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium text-green-800">Saved to your dashboard</span>
                </div>
                <Link
                  to="/dashboard"
                  className="text-sm text-green-700 hover:text-green-800 font-medium underline"
                >
                  View Dashboard →
                </Link>
              </div>
            )}

            {saveState === 'error' && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="font-medium text-red-800">{saveError}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleSaveSymptomCheck}
              disabled={saveState === 'saved'}
              className={`w-full px-6 py-4 rounded-xl transition-all font-medium shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
                saveState === 'saved'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {saveState === 'saved' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {saveState === 'saved'
                ? 'Saved'
                : isAuthenticated
                ? 'Save Symptom Check'
                : 'Sign In to Save'}
            </button>
            <button
              onClick={() => onEstimateCost(selectedTreatments)}
              className="w-full px-6 py-4 bg-primary text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-lg hover:shadow-xl"
            >
              Compare with Main Calculator
            </button>
            <div className="flex gap-4">
              <button
                onClick={handleReset}
                className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
              >
                Start New Check
              </button>
              <button
                onClick={() => setScreen('insurance')}
                className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
              >
                ← Adjust Details
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="signup"
      />

      <InsuranceVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
      />
    </>
  );
}
