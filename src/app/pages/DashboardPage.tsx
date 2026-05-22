import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ConfirmModal from '../components/ConfirmModal';

type SavedDentist = {
  name: string;
  specialty?: string;
  rating?: number | 'N/A';
  userRatings?: number;
  distanceMiles?: number;
  address: string;
  phone?: string;
  placeId: string;
  mapsUrl?: string;
  directionsUrl?: string;
};

export default function DashboardPage() {
  const { user, loading, savedEstimates, symptomHistory, updateProfile, deleteEstimate, deleteSymptomCheck, updateEstimateStatus, updateSymptomStatus } = useAuth();
  const navigate = useNavigate();

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileInsurance, setProfileInsurance] = useState('');
  const [profileZipCode, setProfileZipCode] = useState('');
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [memberSince, setMemberSince] = useState('');
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; type: 'estimate' | 'symptom' | null; id: string | null }>({
    isOpen: false,
    type: null,
    id: null,
  });
  const [savedDentists, setSavedDentists] = useState<SavedDentist[]>(() => {
    const saved = localStorage.getItem('savedDentists');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileInsurance(user.insurance || '');
      setProfileZipCode(user.zipCode || '');
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const storageKey = `mydentplan_member_since_${user.id}`;
    const existing = localStorage.getItem(storageKey);

    if (existing) {
      setMemberSince(existing);
      return;
    }

    const created = new Date().toISOString();
    localStorage.setItem(storageKey, created);
    setMemberSince(created);
  }, [user]);

useEffect(() => {
  if (!loading && !user) {
    navigate("/");
  }
}, [loading, user, navigate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfile({ profilePicture: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    updateProfile({
      name: profileName,
      insurance: profileInsurance,
      zipCode: profileZipCode,
    });
    setEditingProfile(false);
  };

  const handleDeleteClick = (type: 'estimate' | 'symptom', id: string) => {
    setDeleteConfirmModal({ isOpen: true, type, id });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmModal.type === 'estimate' && deleteConfirmModal.id) {
      deleteEstimate(deleteConfirmModal.id);
      if (selectedHistoryId === deleteConfirmModal.id) {
        setSelectedHistoryId(null);
      }
    } else if (deleteConfirmModal.type === 'symptom' && deleteConfirmModal.id) {
      deleteSymptomCheck(deleteConfirmModal.id);
      if (selectedHistoryId === deleteConfirmModal.id) {
        setSelectedHistoryId(null);
      }
    }
    setDeleteConfirmModal({ isOpen: false, type: null, id: null });
  };

  const removeSavedDentist = (placeId: string) => {
    const updated = savedDentists.filter((dentist) => dentist.placeId !== placeId);
    setSavedDentists(updated);
    localStorage.setItem('savedDentists', JSON.stringify(updated));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const diffMs = Date.now() - date.getTime();
    const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  const getHealthStatus = () => {
    if (symptomHistory.length === 0) {
      return {
        level: 'low',
        label: 'Low Concern',
        color: 'green',
        note: 'No symptom checks completed yet',
      };
    }

    const recentSymptom = symptomHistory[0];
    const symptomCount = recentSymptom.symptoms.length;
    const symptoms = recentSymptom.symptoms.join(' ').toLowerCase();
    const lastCheck = `Last symptom check: ${formatRelativeDate(recentSymptom.date)}`;

    if (symptoms.includes('swelling') || symptoms.includes('severe')) {
      return { level: 'high', label: 'High Concern', color: 'red', note: 'Swelling or severe symptoms reported' };
    }

    if (symptoms.includes('cold') || symptoms.includes('persistent') || symptomCount >= 2) {
      return { level: 'moderate', label: 'Moderate Concern', color: 'yellow', note: 'Persistent sensitivity or multiple symptoms detected' };
    }

    if (symptomCount >= 3) return { level: 'high', label: 'High Concern', color: 'red', note: lastCheck };
    return { level: 'low', label: 'Low Concern', color: 'green', note: lastCheck };
  };

  const healthStatus = getHealthStatus();

  const allHistory = [
    ...symptomHistory.map(s => ({ ...s, type: 'symptom' as const })),
    ...savedEstimates.map(e => ({ ...e, type: 'estimate' as const }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Auto-select first history item or clear if deleted
  useEffect(() => {
    if (allHistory.length > 0) {
      // If no selection or selected item doesn't exist anymore, select first item
      const selectedExists = allHistory.some(item => item.id === selectedHistoryId);
      if (!selectedHistoryId || !selectedExists) {
        setSelectedHistoryId(allHistory[0].id);
      }
    } else {
      setSelectedHistoryId(null);
    }
  }, [allHistory.length, allHistory, selectedHistoryId]);

  const selectedItem = allHistory.find(item => item.id === selectedHistoryId);

  const getCurrentStatus = () => {
    const latestSymptom = symptomHistory[0];

    if (!latestSymptom) {
      return {
        title: 'Current Dental Status',
        detail: 'No symptom checks completed yet. Start a symptom check or create a cost estimate.',
        next: 'Start with a quick symptom check when something feels off.',
      };
    }

    const symptoms = latestSymptom.symptoms.join(', ');
    const teeth = latestSymptom.teeth?.length ? `, tooth ${latestSymptom.teeth.join(', ')}` : '';

    return {
      title: 'Current Concern',
      detail: `${symptoms}${teeth}`,
      next: 'Suggested next step: schedule an evaluation or review estimated treatment costs.',
    };
  };

  const getNextSteps = () => {
    const latestSymptom = symptomHistory[0];
    const symptoms = latestSymptom?.symptoms.join(' ').toLowerCase() || '';

    if (symptoms.includes('bleeding') || symptoms.includes('gum')) {
      return [
        { title: 'Schedule a cleaning', description: 'A professional cleaning can help address plaque and gum irritation.' },
        { title: 'Improve home care routine', description: 'Track brushing, flossing, and gum symptoms over the next few days.' },
        { title: 'Consult a dentist if symptoms persist', description: 'Bleeding gums should be checked if they continue or worsen.' },
      ];
    }

    if (symptoms.includes('cold') || symptoms.includes('sensitivity') || symptoms.includes('sharp')) {
      return [
        { title: 'Schedule examination', description: 'Temperature sensitivity and sharp pain should be evaluated by a dentist.' },
        { title: 'Consider x-rays', description: 'X-rays can help identify issues not visible during a visual exam.' },
        { title: 'Review estimated treatment costs', description: 'Compare possible treatment ranges before booking care.' },
      ];
    }

    return [
      { title: 'Schedule examination', description: 'Book an appointment with a dentist for a professional evaluation.' },
      { title: 'Review estimated treatment costs', description: 'Use your saved estimates to understand likely out-of-pocket cost.' },
      { title: 'Find a nearby dentist', description: 'Compare saved offices, directions, and insurance fit.' },
    ];
  };

  const currentStatus = getCurrentStatus();
  const nextSteps = getNextSteps();
  const sampleTimeline = [
    { date: 'May 14', title: 'Completed symptom check', detail: 'Reviewed sensitivity and discomfort' },
    { date: 'May 15', title: 'Estimated cleaning + x-rays', detail: 'Checked expected cost range' },
    { date: 'May 17', title: 'Saved Smile Shack', detail: 'Added dentist to saved offices' },
  ];

if (loading) return null;
if (!user) return null;

return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-semibold text-gray-900 mb-2">
                My Dashboard
              </h1>
              <p className="text-xl text-gray-600">
                Welcome back, {user.name}!
              </p>
            </div>
            <button
              onClick={() => navigate('/symptom-checker')}
              className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-lg hover:shadow-xl"
            >
              Start New Check
            </button>
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
              <div className="text-sm font-medium text-gray-500">Symptom checks</div>
              <div className="mt-2 text-3xl font-semibold text-gray-900">{symptomHistory.length}</div>
            </div>
            <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
              <div className="text-sm font-medium text-gray-500">Saved estimates</div>
              <div className="mt-2 text-3xl font-semibold text-gray-900">{savedEstimates.length}</div>
            </div>
            <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
              <div className="text-sm font-medium text-gray-500">Saved dentists</div>
              <div className="mt-2 text-3xl font-semibold text-gray-900">{savedDentists.length}</div>
            </div>
          </div>

          {/* Oral Health Status */}
          <div className="mb-8">
            <div className={`inline-flex flex-wrap items-center gap-3 px-6 py-3 rounded-xl ${
              healthStatus.color === 'green' ? 'bg-green-50 border-2 border-green-200' :
              healthStatus.color === 'yellow' ? 'bg-yellow-50 border-2 border-yellow-200' :
              'bg-red-50 border-2 border-red-200'
            }`}>
              <div className={`w-3 h-3 rounded-full ${
                healthStatus.color === 'green' ? 'bg-green-500' :
                healthStatus.color === 'yellow' ? 'bg-yellow-500' :
                'bg-red-500'
              }`} />
              <span className="font-medium text-gray-900">Oral Health Status:</span>
              <span className={`font-semibold ${
                healthStatus.color === 'green' ? 'text-green-700' :
                healthStatus.color === 'yellow' ? 'text-yellow-700' :
                'text-red-700'
              }`}>{healthStatus.label}</span>
              <span className="text-sm text-gray-600">{healthStatus.note}</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Current Status */}
              {selectedItem ? (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {selectedItem.type === 'symptom' ? 'Current Concern' : 'Current Estimate'}
                    </h2>
                    <select
                      value={selectedItem.status || 'not_started'}
                      onChange={(e) => {
                        const newStatus = e.target.value as 'not_started' | 'in_progress' | 'completed';
                        if (selectedItem.type === 'symptom') {
                          updateSymptomStatus(selectedItem.id, newStatus);
                        } else {
                          updateEstimateStatus(selectedItem.id, newStatus);
                        }
                      }}
                      className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm font-medium"
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {selectedItem.type === 'symptom' ? (
                    <>
                      {selectedItem.symptoms.length > 0 && (
                        <div className="mb-4">
                          <div className="text-sm font-medium text-gray-500 mb-2">Symptoms</div>
                          <div className="flex flex-wrap gap-2">
                            {selectedItem.symptoms.map((symptom, index) => (
                              <span
                                key={index}
                                className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium"
                              >
                                {symptom}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedItem.suggestedTreatments.length > 0 && (
                        <div className="mb-4">
                          <div className="text-sm font-medium text-gray-500 mb-2">Suggested Treatments</div>
                          <div className="flex flex-wrap gap-2">
                            {selectedItem.suggestedTreatments.map((treatment, index) => (
                              <span
                                key={index}
                                className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                              >
                                {treatment}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {selectedItem.treatments.length > 0 && (
                        <div className="mb-4">
                          <div className="text-sm font-medium text-gray-500 mb-2">Treatments</div>
                          <div className="flex flex-wrap gap-2">
                            {selectedItem.treatments.map((treatment, index) => (
                              <span
                                key={index}
                                className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                              >
                                {treatment}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                        <div className="text-sm font-medium text-gray-500 mb-1">Estimated Cost Range</div>
                        <div className="text-2xl font-semibold text-primary">
                          ${selectedItem.totalMinCost.toLocaleString()} - ${selectedItem.totalMaxCost.toLocaleString()}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    {currentStatus.title}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {allHistory.length === 0 ? currentStatus.detail : 'Select an item from your history timeline to view details.'}
                  </p>
                  {allHistory.length === 0 && (
                    <div className="mb-6 rounded-xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-800">
                      {currentStatus.next}
                    </div>
                  )}
                  {allHistory.length === 0 && (
                    <div className="flex gap-4">
                      <button
                        onClick={() => navigate('/symptom-checker')}
                        className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-blue-700 transition-all font-medium"
                      >
                        Check Symptoms
                      </button>
                      <button
                        onClick={() => navigate('/calculator')}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
                      >
                        Create Estimate
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Next Steps */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Recommended Next Steps
                </h2>
                <div className="space-y-4">
                  {nextSteps.map((step, index) => (
                    <div key={step.title} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        index === 0 ? 'bg-blue-100 text-primary' :
                        index === 1 ? 'bg-purple-100 text-purple-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        <span className="font-semibold">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 mb-1">{step.title}</div>
                        <div className="text-sm text-gray-600">{step.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Saved Dentists */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      Saved Dentists
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Offices you saved from the dentist finder.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/find-dentist?zip=${user.zipCode || ""}`)}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                  >
                    Find More Dentists
                  </button>
                </div>

                {savedDentists.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6">
                    <p className="text-gray-600 mb-4">
                      No saved dentists yet. Search nearby offices and save the ones you want to compare.
                    </p>
                    <button
                      onClick={() => navigate(`/find-dentist?zip=${user.zipCode || ""}`)}
                      className="px-5 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all font-medium"
                    >
                      Search Dentists
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedDentists.map((dentist) => (
                      <div
                        key={dentist.placeId}
                        className="rounded-xl border border-gray-200 p-5"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{dentist.name}</h3>
                              {dentist.rating && (
                                <span className="rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-700">
                                  Rating {dentist.rating}{dentist.userRatings ? ` (${dentist.userRatings} reviews)` : ''}
                                </span>
                              )}
                            </div>
                            {dentist.specialty && (
                              <p className="text-sm text-gray-600">{dentist.specialty}</p>
                            )}
                            <p className="text-sm text-gray-500">{dentist.address}</p>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                              {dentist.distanceMiles !== undefined && (
                                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
                                  {dentist.distanceMiles} miles away
                                </span>
                              )}
                              <span className="rounded-full bg-green-50 px-2.5 py-1 text-green-700">
                                {user.insurance ? `${user.insurance} accepted` : 'Insurance check needed'}
                              </span>
                            </div>
                            {dentist.phone && (
                              <p className="text-sm text-gray-500 mt-1">{dentist.phone}</p>
                            )}
                          </div>

                          <button
                            onClick={() => removeSavedDentist(dentist.placeId)}
                            className="text-sm font-medium text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-3 mt-4">
                          {dentist.directionsUrl && (
                            <a
                              href={dentist.directionsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                            >
                              Directions
                            </a>
                          )}
                          {dentist.phone && (
                            <a
                              href={`tel:${dentist.phone}`}
                              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition"
                            >
                              Call
                            </a>
                          )}
                          {dentist.mapsUrl && (
                            <a
                              href={dentist.mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                            >
                              View on Maps
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* History Timeline */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  History Timeline
                </h2>

                {allHistory.length === 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                      Your activity will appear here. Here is what a plan timeline can look like.
                    </p>
                    {sampleTimeline.map((item) => (
                      <div key={item.title} className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4">
                        <div className="flex items-start gap-4">
                          <div className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-gray-700">
                            {item.date}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{item.title}</div>
                            <div className="text-sm text-gray-600">{item.detail}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {allHistory.map((item, index) => (
                      <div key={item.id} className="relative">
                        {index !== allHistory.length - 1 && (
                          <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
                        )}
                        <div
                          className={`flex gap-4 p-4 rounded-xl cursor-pointer transition-all group ${
                            selectedHistoryId === item.id
                              ? 'bg-blue-50 border-2 border-primary shadow-sm'
                              : 'hover:bg-gray-50 border-2 border-transparent'
                          }`}
                          onClick={() => setSelectedHistoryId(item.id)}
                        >
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                            item.type === 'symptom' ? 'bg-purple-100' : 'bg-blue-100'
                          }`}>
                            {item.type === 'symptom' ? (
                              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            ) : (
                              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 pb-2">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="font-medium text-gray-900">
                                  {item.type === 'symptom' ? 'Symptom Check' : 'Cost Estimate'}
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  item.status === 'completed' ? 'bg-green-100 text-green-700' :
                                  item.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {item.status === 'completed' ? 'Completed' :
                                   item.status === 'in_progress' ? 'In Progress' :
                                   'Not Started'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-sm text-gray-500">{formatDate(item.date)}</div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(item.type, item.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                  title="Delete"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            {item.type === 'symptom' ? (
                              <div className="space-y-2">
                                {item.symptoms.length > 0 && (
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">Symptoms:</div>
                                    <div className="flex flex-wrap gap-1">
                                      {item.symptoms.map((symptom, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">
                                          {symptom}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {item.treatments.length > 0 && (
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">Treatments:</div>
                                    <div className="flex flex-wrap gap-1">
                                      {item.treatments.map((treatment, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                                          {treatment}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <div className="text-sm font-semibold text-primary">
                                  ${item.totalMinCost.toLocaleString()} - ${item.totalMaxCost.toLocaleString()}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div> {/* END Main Content */}

            {/* Profile Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-32">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Profile
                </h2>

                <div className="flex flex-col items-center mb-6">
                  <div className="relative mb-4">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center border-4 border-primary/20">
                        <span className="text-4xl font-semibold text-white">
                          {getInitials(user.name)}
                        </span>
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors border-2 border-gray-200">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {editingProfile ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Provider</label>
                      <input
                        type="text"
                        value={profileInsurance}
                        onChange={(e) => setProfileInsurance(e.target.value)}
                        placeholder="e.g., Delta Dental"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                      <input
                        type="text"
                        value={profileZipCode}
                        onChange={(e) => setProfileZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                        placeholder="e.g., 10001"
                        maxLength={5}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => setEditingProfile(false)}
                        className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Name</div>
                      <div className="text-gray-900">{user.name}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Email</div>
                      <div className="text-gray-900">{user.email}</div>
                    </div>
                    {memberSince && (
                      <div>
                        <div className="text-sm font-medium text-gray-500 mb-1">Member Since</div>
                        <div className="text-gray-900">{formatDate(memberSince)}</div>
                      </div>
                    )}
                    {user.insurance && (
                      <div>
                        <div className="text-sm font-medium text-gray-500 mb-1">Insurance Provider</div>
                        <div className="text-gray-900">{user.insurance}</div>
                      </div>
                    )}
                    {user.zipCode && (
                      <div>
                        <div className="text-sm font-medium text-gray-500 mb-1">ZIP Code</div>
                        <div className="text-gray-900">{user.zipCode}</div>
                      </div>
                    )}
                    {user.lastUpdated && (
                      <div className="pt-2 border-t border-gray-100">
                        <div className="text-xs text-gray-400">
                          Last updated: {formatDate(user.lastUpdated)}
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => setEditingProfile(true)}
                      className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium mt-4"
                    >
                      Edit Profile
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteConfirmModal.isOpen}
        onClose={() => setDeleteConfirmModal({ isOpen: false, type: null, id: null })}
        onConfirm={handleConfirmDelete}
        title={deleteConfirmModal.type === 'estimate' ? 'Delete Estimate?' : 'Delete Symptom Check?'}
        message={
          deleteConfirmModal.type === 'estimate'
            ? 'Are you sure you want to remove this saved estimate? This action cannot be undone.'
            : 'Are you sure you want to remove this symptom check? This action cannot be undone.'
        }
      />
    </div>
  );
}
