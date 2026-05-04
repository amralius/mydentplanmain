import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ConfirmModal from '../components/ConfirmModal';

export default function DashboardPage() {
  const { user, isAuthenticated, loading, savedEstimates, symptomHistory, updateProfile, deleteEstimate, deleteSymptomCheck, updateEstimateStatus, updateSymptomStatus } = useAuth();
  const navigate = useNavigate();

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileInsurance, setProfileInsurance] = useState('');
  const [profileZipCode, setProfileZipCode] = useState('');
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; type: 'estimate' | 'symptom' | null; id: string | null }>({
    isOpen: false,
    type: null,
    id: null,
  });

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileInsurance(user.insurance || '');
      setProfileZipCode(user.zipCode || '');
    }
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getHealthStatus = () => {
    if (symptomHistory.length === 0) return { level: 'low', label: 'Low Concern', color: 'green' };

    const recentSymptom = symptomHistory[0];
    const symptomCount = recentSymptom.symptoms.length;

    if (symptomCount >= 3) return { level: 'high', label: 'High Concern', color: 'red' };
    if (symptomCount >= 2) return { level: 'moderate', label: 'Moderate Concern', color: 'yellow' };
    return { level: 'low', label: 'Low Concern', color: 'green' };
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
  const currentPlan = selectedItem && selectedItem.type === 'symptom' ? selectedItem : null;

if (loading) return null;
if (!user) return null;

return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-semibold text-gray-900 mb-2">
                My Dental Plan
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

          {/* Oral Health Status */}
          <div className="mb-8">
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl ${
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
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Current Issue */}
              {selectedItem ? (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">
                      Current Issue
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
                          ${selectedItem.totalMinCost.toLocaleString()} – ${selectedItem.totalMaxCost.toLocaleString()}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    No Active Issue Selected
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {allHistory.length === 0
                      ? 'Start by checking your symptoms or creating a cost estimate.'
                      : 'Select an item from your history timeline to view details.'}
                  </p>
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
                  Next Steps
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all cursor-pointer">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 mb-1">Schedule a Dental Exam</div>
                      <div className="text-sm text-gray-600">Book an appointment with a dentist for a professional evaluation</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all cursor-pointer">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 mb-1">Get X-rays</div>
                      <div className="text-sm text-gray-600">X-rays can help identify issues not visible during a visual exam</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all cursor-pointer">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 mb-1">Consult a Dentist</div>
                      <div className="text-sm text-gray-600">Discuss your symptoms and treatment options with a professional</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* History Timeline */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  History Timeline
                </h2>

                {allHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500">No history yet</p>
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
                                  ${item.totalMinCost.toLocaleString()} – ${item.totalMaxCost.toLocaleString()}
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
{/* Find a Dentist */}
<div className="bg-white rounded-2xl shadow-lg p-8">

  <div className="flex items-center justify-between mb-4">
    <h2 className="text-2xl font-semibold text-gray-900">
      Find a Dentist
    </h2>

    <button
      onClick={() => navigate(`/find-dentist?zip=${user.zipCode || ""}`)}
      className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
    >
      Find Dentists
    </button>
  </div>

  <p className="text-sm text-gray-500 mt-3">
    Click “Find Dentists” to view nearby offices on a map and get directions.
  </p>

  <p className="text-gray-600 mb-4 mt-4">
    Search real dentists near your ZIP code using Google Maps.
  </p>

  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
    <p className="text-sm text-gray-700">
      Your saved ZIP code: <span className="font-semibold">{user.zipCode || "Not added"}</span>
    </p>
    <p className="text-sm text-gray-700 mt-1">
      Insurance: <span className="font-semibold">{user.insurance || "Not added"}</span>
    </p>
  </div>

</div>
             
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
