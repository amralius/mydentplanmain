import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import InsuranceVerificationModal from './InsuranceVerificationModal';

interface EstimateCardProps {
  onSaveClick: () => void;
  preSelectedTreatments?: string[];
}

const TREATMENT_COSTS: Record<string, { min: number; max: number }> = {
  // Diagnostic
  'Dental Exam': { min: 75, max: 150 },
  'Emergency Exam': { min: 100, max: 200 },
  'X-rays': { min: 50, max: 250 },
  'Consultation': { min: 50, max: 125 },
  // Preventive
  'Cleaning': { min: 100, max: 200 },
  'Deep Cleaning': { min: 200, max: 400 },
  'Fluoride Treatment': { min: 30, max: 75 },
  // Restorative
  'Filling': { min: 150, max: 400 },
  'Crown': { min: 900, max: 1800 },
  'Root Canal': { min: 800, max: 1500 },
  'Extraction': { min: 150, max: 350 },
  // Advanced
  'Implant': { min: 3000, max: 5000 },
  'Wisdom Tooth Removal': { min: 200, max: 600 },
  'Braces/Invisalign': { min: 3500, max: 8000 },
  'Whitening': { min: 300, max: 650 },
};

const INSURANCE_COVERAGE: Record<string, { preventive: number; basic: number; major: number; diagnostic: number }> = {
  // Popular Providers
  'Delta Dental': { diagnostic: 100, preventive: 100, basic: 80, major: 50 },
  'Aetna Dental': { diagnostic: 100, preventive: 100, basic: 80, major: 50 },
  'Cigna Dental': { diagnostic: 100, preventive: 100, basic: 80, major: 50 },
  'MetLife Dental': { diagnostic: 100, preventive: 100, basic: 70, major: 50 },
  'Guardian Dental': { diagnostic: 100, preventive: 100, basic: 75, major: 50 },
  'UnitedHealthcare Dental': { diagnostic: 100, preventive: 100, basic: 80, major: 50 },
  // New York Providers
  'Anthem Blue Cross Blue Shield Dental': { diagnostic: 100, preventive: 100, basic: 80, major: 50 },
  'EmblemHealth Dental': { diagnostic: 100, preventive: 100, basic: 75, major: 50 },
  'Healthfirst Dental': { diagnostic: 100, preventive: 100, basic: 75, major: 50 },
  'Fidelis Care Dental': { diagnostic: 90, preventive: 90, basic: 70, major: 50 },
  'No Insurance': { diagnostic: 0, preventive: 0, basic: 0, major: 0 },
};

const TREATMENT_TYPES: Record<string, 'diagnostic' | 'preventive' | 'basic' | 'major'> = {
  // Diagnostic
  'Dental Exam': 'diagnostic',
  'Emergency Exam': 'diagnostic',
  'X-rays': 'diagnostic',
  'Consultation': 'diagnostic',
  // Preventive
  'Cleaning': 'preventive',
  'Deep Cleaning': 'preventive',
  'Fluoride Treatment': 'preventive',
  // Restorative
  'Filling': 'basic',
  'Crown': 'major',
  'Root Canal': 'major',
  'Extraction': 'basic',
  // Advanced
  'Implant': 'major',
  'Wisdom Tooth Removal': 'major',
  'Braces/Invisalign': 'major',
  'Whitening': 'preventive',
};

const TREATMENT_CATEGORIES = {
  'Diagnostic': ['Dental Exam', 'Emergency Exam', 'X-rays', 'Consultation'],
  'Preventive': ['Cleaning', 'Deep Cleaning', 'Fluoride Treatment'],
  'Restorative': ['Filling', 'Crown', 'Root Canal', 'Extraction'],
  'Advanced': ['Implant', 'Wisdom Tooth Removal', 'Braces/Invisalign', 'Whitening'],
};

const TREATMENT_DESCRIPTIONS: Record<string, string> = {
  'Dental Exam': 'Routine evaluation of teeth and oral health.',
  'Emergency Exam': 'Focused exam for urgent pain, swelling, or injury.',
  'X-rays': 'Images used to identify issues beneath the surface.',
  'Consultation': 'Visit to discuss concerns and possible treatment options.',
  'Cleaning': 'Removal of plaque and tartar buildup.',
  'Deep Cleaning': 'Gum-focused cleaning below the gumline.',
  'Fluoride Treatment': 'Protective treatment for sensitivity or cavity prevention.',
  'Filling': 'Repair for a cavity or small damaged area of a tooth.',
  'Crown': 'Cap used to protect or restore a weakened tooth.',
  'Root Canal': 'Treatment for infected or inflamed tooth pulp.',
  'Extraction': 'Removal of a tooth when it cannot be saved.',
  'Implant': 'Replacement tooth root and crown for a missing tooth.',
  'Wisdom Tooth Removal': 'Removal of one or more wisdom teeth.',
  'Braces/Invisalign': 'Orthodontic treatment to align teeth.',
  'Whitening': 'Cosmetic treatment to brighten tooth shade.',
};

export default function EstimateCard({ onSaveClick, preSelectedTreatments = [] }: EstimateCardProps) {
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>(preSelectedTreatments);
  const [treatmentSearch, setTreatmentSearch] = useState('');
  const [insurance, setInsurance] = useState('');
  const [insuranceSearch, setInsuranceSearch] = useState('');
  const [metDeductible, setMetDeductible] = useState(false);
  const [showInsuranceDropdown, setShowInsuranceDropdown] = useState(false);
  const [zipCode, setZipCode] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [saveState, setSaveState] = useState<'unsaved' | 'saved' | 'error'>('unsaved');
  const [saveError, setSaveError] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { isAuthenticated, saveEstimate } = useAuth();

  useEffect(() => {
    if (preSelectedTreatments.length > 0) {
      setSelectedTreatments(preSelectedTreatments);
    }
  }, [preSelectedTreatments]);

  // Reset save state when user modifies the estimate
  useEffect(() => {
    if (saveState === 'saved') {
      setSaveState('unsaved');
    }
  }, [selectedTreatments, insurance, zipCode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowInsuranceDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetForm = () => {
    setSelectedTreatments([]);
    setTreatmentSearch('');
    setInsurance('');
    setInsuranceSearch('');
    setMetDeductible(false);
    setShowInsuranceDropdown(false);
    setZipCode('');
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

  const filteredTreatmentCategories = Object.entries(TREATMENT_CATEGORIES)
    .map(([category, treatments]) => ({
      category,
      treatments: treatments.filter((treatment) => {
        const query = treatmentSearch.trim().toLowerCase();
        if (!query) return true;
        return (
          treatment.toLowerCase().includes(query) ||
          TREATMENT_DESCRIPTIONS[treatment]?.toLowerCase().includes(query)
        );
      }),
    }))
    .filter(({ treatments }) => treatments.length > 0);

  const handleTreatmentToggle = (treatment: string) => {
    setSelectedTreatments(prev =>
      prev.includes(treatment)
        ? prev.filter(t => t !== treatment)
        : [...prev, treatment]
    );
  };

  const calculateEstimate = () => {
    if (selectedTreatments.length === 0 || !insurance) {
      return null;
    }

    const locationMultiplier = getLocationMultiplier(zipCode);
    let totalMinCost = 0;
    let totalMaxCost = 0;
    let insuranceCoverageMin = 0;
    let insuranceCoverageMax = 0;

    selectedTreatments.forEach(treatment => {
      const baseCost = TREATMENT_COSTS[treatment];
      if (!baseCost) return;

      const adjustedMinCost = Math.round(baseCost.min * locationMultiplier);
      const adjustedMaxCost = Math.round(baseCost.max * locationMultiplier);
      const treatmentType = TREATMENT_TYPES[treatment];
      const coverageRate = INSURANCE_COVERAGE[insurance]?.[treatmentType] || 0;

      const adjustedRate = metDeductible ? coverageRate : Math.max(0, coverageRate - 20);

      totalMinCost += adjustedMinCost;
      totalMaxCost += adjustedMaxCost;
      insuranceCoverageMin += (adjustedMinCost * adjustedRate) / 100;
      insuranceCoverageMax += (adjustedMaxCost * adjustedRate) / 100;
    });

    const youPayMin = Math.max(0, totalMinCost - insuranceCoverageMax);
    const youPayMax = Math.max(0, totalMaxCost - insuranceCoverageMin);
    const avgTotal = (totalMinCost + totalMaxCost) / 2;
    const avgCoverage = (insuranceCoverageMin + insuranceCoverageMax) / 2;
    const coveragePercent = avgTotal > 0 ? Math.round((avgCoverage / avgTotal) * 100) : 0;

    return {
      totalMinCost,
      totalMaxCost,
      insuranceCoverageMin,
      insuranceCoverageMax,
      youPayMin,
      youPayMax,
      coveragePercent,
    };
  };

  const estimate = calculateEstimate();
  const progressSteps = [
    { label: 'Select treatments', complete: selectedTreatments.length > 0 },
    { label: 'Add insurance', complete: Boolean(insurance) },
    { label: 'Review estimate', complete: Boolean(estimate) },
  ];

  const handleSaveEstimate = () => {
    if (!estimate) return;

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    const result = saveEstimate({
      treatments: selectedTreatments,
      totalMinCost: estimate.totalMinCost,
      totalMaxCost: estimate.totalMaxCost,
      insurance,
      zipCode,
    });

    if (result.success) {
      setSaveState('saved');
    } else {
      setSaveState('error');
      if (result.error === 'duplicate') {
        setSaveError('This estimate is already saved to your dashboard.');
      } else {
        setSaveError('Couldn\'t save. Please try again.');
      }
    }
  };

  return (
    <>
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8">
      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {progressSteps.map((step, index) => (
          <div
            key={step.label}
            className={`rounded-xl border px-4 py-3 ${
              step.complete
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-gray-200 bg-gray-50 text-gray-500'
            }`}
          >
            <div className="text-sm font-semibold">
              {index + 1} {step.label} {step.complete ? '✓' : ''}
            </div>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column - Treatment Selection */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Select Treatments</h3>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Search treatments
            </label>
            <input
              type="text"
              value={treatmentSearch}
              onChange={(e) => setTreatmentSearch(e.target.value)}
              placeholder="Search treatments..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
            {filteredTreatmentCategories.map(({ category, treatments }) => (
              <div key={category}>
                <h4 className="text-sm font-semibold text-gray-500 mb-3">{category}</h4>
                <div className="space-y-2">
                  {treatments.map(treatment => (
                    <label
                      key={treatment}
                      className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedTreatments.includes(treatment)
                          ? 'bg-primary/5 border-primary'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedTreatments.includes(treatment)}
                          onChange={() => handleTreatmentToggle(treatment)}
                          className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span>
                          <span className="block text-gray-800">{treatment}</span>
                          <span className="block text-xs leading-5 text-gray-500">
                            {TREATMENT_DESCRIPTIONS[treatment]}
                          </span>
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        ${TREATMENT_COSTS[treatment]?.min.toLocaleString()}–${TREATMENT_COSTS[treatment]?.max.toLocaleString()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            {filteredTreatmentCategories.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-5 text-center text-sm text-gray-500">
                No treatments found. Try another search.
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Insurance & Estimate */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Insurance Details</h3>
            <p className="text-sm text-gray-600 mb-6">Choose how to estimate your coverage</p>

            <div className="space-y-4">
              {/* Option 1: Estimate with basic info */}
              <div className="p-4 border-2 border-primary bg-primary/5 rounded-xl">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-semibold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Quick Estimate</h4>
                    <p className="text-xs text-gray-600">Get estimated coverage range based on your insurance provider</p>
                  </div>
                </div>

                <div className="space-y-4 ml-9">
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

              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all">
                <input
                  type="checkbox"
                  checked={insurance === 'No Insurance'}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setInsurance('No Insurance');
                      setInsuranceSearch('');
                      setShowInsuranceDropdown(false);
                    } else {
                      setInsurance('');
                    }
                  }}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">I don't have dental insurance</span>
              </label>

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
                <p className="text-sm text-gray-600 mt-2">
                  Helps provide more accurate cost estimates for your area
                </p>
              </div>

                  <div>
                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all">
                      <input
                        type="checkbox"
                        id="deductible"
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
                      <h4 className="font-semibold text-gray-900">Real-Time Insurance Verification</h4>
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
          </div>

          {/* Live Estimate Summary */}
          {estimate && selectedTreatments.length > 0 && insurance && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Cost Estimate</h3>

              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-2">Selected Treatments ({selectedTreatments.length})</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedTreatments.map((treatment, index) => {
                      const treatmentType = TREATMENT_TYPES[treatment];
                      const coverageRate = INSURANCE_COVERAGE[insurance]?.[treatmentType] || 0;
                      return (
                        <span key={index} className="px-3 py-1.5 bg-gradient-to-br from-blue-50 to-white border border-blue-200 text-gray-700 rounded-lg text-sm">
                          {treatment}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl">
                    <div className="text-sm font-medium text-gray-600 mb-1">Typical Cost Range</div>
                    <div className="text-3xl font-semibold text-gray-900">
                      ${estimate.totalMinCost.toLocaleString()} – ${estimate.totalMaxCost.toLocaleString()}
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
                      ${Math.round(estimate.insuranceCoverageMin).toLocaleString()} – ${Math.round(estimate.insuranceCoverageMax).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600 mt-2">
                      Insurance estimate based on typical {insurance} coverage
                    </div>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-blue-50 to-white border-2 border-primary rounded-xl">
                    <div className="text-sm font-medium text-gray-600 mb-1">Estimated Out-of-Pocket Cost</div>
                    <div className="text-4xl font-semibold text-primary">
                      {estimate.youPayMin === 0 && estimate.youPayMax === 0 ? (
                        <span className="text-green-700">$0 (Fully Covered)</span>
                      ) : (
                        `$${Math.round(estimate.youPayMin).toLocaleString()} – $${Math.round(estimate.youPayMax).toLocaleString()}`
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mt-2">
                      What you may pay after insurance
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <div className="flex gap-2 items-start">
                    <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="text-xs text-gray-700 leading-relaxed">
                      <strong>Important:</strong> These are estimated costs based on typical pricing and insurance coverage in your area. This is not a diagnosis or guarantee of coverage. Final treatment and pricing must be confirmed by a licensed dentist and your insurance provider.
                    </div>
                  </div>
                </div>

                {saveState === 'saved' && (
                  <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl mb-4">
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
                  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl mb-4">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="font-medium text-red-800">{saveError}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={resetForm}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleSaveEstimate}
                    disabled={saveState === 'saved'}
                    className={`flex-1 px-6 py-3 rounded-xl transition-all font-medium shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
                      saveState === 'saved'
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-primary text-white hover:bg-blue-700'
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
                      ? 'Save Estimate'
                      : 'Sign In to Save'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedTreatments.length === 0 && (
            <div className="border-t border-gray-200 pt-6">
              <div className="text-center text-gray-500 py-8">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p>Select treatments to see cost estimate</p>
              </div>
            </div>
          )}

          {selectedTreatments.length > 0 && !insurance && (
            <div className="border-t border-gray-200 pt-6">
              <div className="text-center text-gray-500 py-8">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p>Select your insurance to see estimate</p>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>

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
