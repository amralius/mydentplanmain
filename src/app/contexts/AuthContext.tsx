import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from "../../lib/supabase";

interface User {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  insurance?: string;
  zipCode?: string;
  lastUpdated?: string;
}

interface SavedEstimate {
  id: string;
  date: string;
  treatments: string[];
  totalMinCost: number;
  totalMaxCost: number;
  insurance: string;
  zipCode: string;
  status?: 'not_started' | 'in_progress' | 'completed';
}

interface SymptomHistory {
  id: string;
  date: string;
  teeth: (number | string)[];
  symptoms: string[];
  suggestedTreatments: string[];
  status?: 'not_started' | 'in_progress' | 'completed';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  savedEstimates: SavedEstimate[];
  symptomHistory: SymptomHistory[];
  saveEstimate: (estimate: Omit<SavedEstimate, 'id' | 'date'>) => { success: boolean; error?: string };
  saveSymptomCheck: (symptomCheck: Omit<SymptomHistory, 'id' | 'date'>) => { success: boolean; error?: string };
  deleteEstimate: (id: string) => void;
  deleteSymptomCheck: (id: string) => void;
  updateEstimateStatus: (id: string, status: 'not_started' | 'in_progress' | 'completed') => void;
  updateSymptomStatus: (id: string, status: 'not_started' | 'in_progress' | 'completed') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [savedEstimates, setSavedEstimates] = useState<SavedEstimate[]>([]);
  const [symptomHistory, setSymptomHistory] = useState<SymptomHistory[]>([]);

  useEffect(() => {
  async function loadUser() {
    const { data } = await supabase.auth.getUser()

    if (data.user) {
      const user = {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.email!.split('@')[0],
      }

      setUser(user)
      await loadUserData(user.id)
    }
  }

  loadUser()
}, [])

  const loadUserData = async (userId: string) => {
  const { data: estimates } = await supabase
    .from('saved_estimates')
    .select('*')
    .eq('user_id', userId)

  const { data: symptoms } = await supabase
    .from('symptom_checks')
    .select('*')
    .eq('user_id', userId)

  setSavedEstimates(estimates || [])
  setSymptomHistory(symptoms || [])
};

const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw new Error(error.message)

  const user = {
    id: data.user.id,
    email: data.user.email!,
    name: data.user.email!.split('@')[0],
  }

  setUser(user)
  await loadUserData(user.id)
};

  const signup = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) throw new Error(error.message)

  const user = {
    id: data.user!.id,
    email: data.user!.email!,
    name,
  }

  setUser(user)

  await supabase.from('profiles').insert({
    id: data.user!.id,
    full_name: name,
    email: email,
  })
};

  const logout = async () => {
  await supabase.auth.signOut()
  setUser(null)
};

  const saveEstimate = (estimate: Omit<SavedEstimate, 'id' | 'date'>) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    // Check for duplicates - same treatments and insurance
    const isDuplicate = savedEstimates.some(saved =>
      JSON.stringify(saved.treatments.sort()) === JSON.stringify(estimate.treatments.sort()) &&
      saved.insurance === estimate.insurance &&
      saved.zipCode === estimate.zipCode
    );

    if (isDuplicate) {
      return { success: false, error: 'duplicate' };
    }

    try {
      const newEstimate: SavedEstimate = {
        ...estimate,
        id: Date.now().toString(),
        date: new Date().toISOString(),
        status: 'not_started',
      };

      const updatedEstimates = [newEstimate, ...savedEstimates];
      setSavedEstimates(updatedEstimates);
      localStorage.setItem(`mydentplan_estimates_${user.id}`, JSON.stringify(updatedEstimates));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to save estimate' };
    }
  };

  const saveSymptomCheck = (symptomCheck: Omit<SymptomHistory, 'id' | 'date'>) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    // Check for duplicates - same teeth, symptoms, and treatments
    const isDuplicate = symptomHistory.some(saved =>
      JSON.stringify(saved.teeth.sort()) === JSON.stringify(symptomCheck.teeth.sort()) &&
      JSON.stringify(saved.symptoms.sort()) === JSON.stringify(symptomCheck.symptoms.sort()) &&
      JSON.stringify(saved.suggestedTreatments.sort()) === JSON.stringify(symptomCheck.suggestedTreatments.sort())
    );

    if (isDuplicate) {
      return { success: false, error: 'duplicate' };
    }

    try {
      const newSymptomCheck: SymptomHistory = {
        ...symptomCheck,
        id: Date.now().toString(),
        date: new Date().toISOString(),
        status: 'not_started',
      };

      const updatedHistory = [newSymptomCheck, ...symptomHistory];
      setSymptomHistory(updatedHistory);
      localStorage.setItem(`mydentplan_symptoms_${user.id}`, JSON.stringify(updatedHistory));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to save symptom check' };
    }
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updates, lastUpdated: new Date().toISOString() };
    setUser(updatedUser);
    localStorage.setItem('mydentplan_user', JSON.stringify(updatedUser));

    // Also update the user in the users list
    const storedUsers = localStorage.getItem('mydentplan_users');
    if (storedUsers) {
      const users = JSON.parse(storedUsers);
      const userIndex = users.findIndex((u: any) => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates };
        localStorage.setItem('mydentplan_users', JSON.stringify(users));
      }
    }
  };

  const deleteEstimate = (id: string) => {
    if (!user) return;

    const updatedEstimates = savedEstimates.filter(estimate => estimate.id !== id);
    setSavedEstimates(updatedEstimates);
    localStorage.setItem(`mydentplan_estimates_${user.id}`, JSON.stringify(updatedEstimates));
  };

  const deleteSymptomCheck = (id: string) => {
    if (!user) return;

    const updatedHistory = symptomHistory.filter(check => check.id !== id);
    setSymptomHistory(updatedHistory);
    localStorage.setItem(`mydentplan_symptoms_${user.id}`, JSON.stringify(updatedHistory));
  };

  const updateEstimateStatus = (id: string, status: 'not_started' | 'in_progress' | 'completed') => {
    if (!user) return;

    const updatedEstimates = savedEstimates.map(estimate =>
      estimate.id === id ? { ...estimate, status } : estimate
    );
    setSavedEstimates(updatedEstimates);
    localStorage.setItem(`mydentplan_estimates_${user.id}`, JSON.stringify(updatedEstimates));
  };

  const updateSymptomStatus = (id: string, status: 'not_started' | 'in_progress' | 'completed') => {
    if (!user) return;

    const updatedHistory = symptomHistory.map(check =>
      check.id === id ? { ...check, status } : check
    );
    setSymptomHistory(updatedHistory);
    localStorage.setItem(`mydentplan_symptoms_${user.id}`, JSON.stringify(updatedHistory));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateProfile,
        savedEstimates,
        symptomHistory,
        saveEstimate,
        saveSymptomCheck,
        deleteEstimate,
        deleteSymptomCheck,
        updateEstimateStatus,
        updateSymptomStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
