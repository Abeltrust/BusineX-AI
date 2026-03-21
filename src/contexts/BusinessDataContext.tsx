import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import {
  diagnoseBusiness,
  generateBusinessIdeas,
  generateInvestmentOpportunities,
  generatePitchDeck,
  generateRoadmap,
} from '../services/ai';
import type {
  BusinessClinicReport,
  BusinessIdea,
  UserProfile,
  UserType,
} from '../types';
import { useAuth } from './AuthContext';
import { ensureWorkspace, loadWorkspace, saveWorkspace } from '../lib/firestore';

export interface OnboardingInput {
  type: UserType;
  name: string;
  city: string;
  country: string;
  background: string;
  skills: string;
  interests: string;
  capital: number;
  riskAppetite: 'low' | 'medium' | 'high';
  industryPreferences: string;
  minInvestment: number;
  maxInvestment: number;
}

interface BusinessDataContextValue {
  clinicInput: string;
  clinicReport: BusinessClinicReport | null;
  ideas: BusinessIdea[];
  loading: boolean;
  profile: UserProfile | null;
  profileReady: boolean;
  completeOnboarding: (input: OnboardingInput) => Promise<void>;
  generateIdeaDetails: (idea: BusinessIdea) => Promise<void>;
  investInIdea: (idea: BusinessIdea) => Promise<void>;
  refreshIdeas: () => Promise<void>;
  submitClinic: (businessInfo: string) => Promise<void>;
}

const BusinessDataContext = createContext<BusinessDataContextValue | undefined>(undefined);

const emptyWallet = (capital: number) => ({
  balance: capital,
  investments: [],
  receivedFunds: 0,
  returns: 0,
});

export function BusinessDataProvider({ children }: PropsWithChildren) {
  const { authReady, user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ideas, setIdeas] = useState<BusinessIdea[]>([]);
  const [clinicInput, setClinicInput] = useState('');
  const [clinicReport, setClinicReport] = useState<BusinessClinicReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [profileReady, setProfileReady] = useState(false);

  useEffect(() => {
    async function hydrateWorkspace() {
      if (!authReady) {
        return;
      }

      if (!user) {
        setProfile(null);
        setIdeas([]);
        setClinicInput('');
        setClinicReport(null);
        setProfileReady(true);
        return;
      }

      setProfileReady(false);
      await ensureWorkspace(user.uid);
      const snapshot = await loadWorkspace(user.uid);
      setProfile(snapshot?.profile ?? null);
      setIdeas(snapshot?.ideas ?? []);
      setClinicInput(snapshot?.clinicInput ?? '');
      setClinicReport(snapshot?.clinicReport ?? null);
      setProfileReady(true);
    }

    void hydrateWorkspace();
  }, [authReady, user]);

  async function persist(next: Partial<{
    clinicInput: string | null;
    profile: UserProfile | null;
    ideas: BusinessIdea[];
    clinicReport: BusinessClinicReport | null;
  }>) {
    if (!user) {
      return;
    }

    await saveWorkspace(user.uid, next);
  }

  async function refreshIdeas() {
    if (!profile || !user) {
      return;
    }

    setLoading(true);
    try {
      const nextIdeas = profile.type === 'founder'
        ? await generateBusinessIdeas(profile)
        : await generateInvestmentOpportunities(profile);
      setIdeas(nextIdeas);
      await persist({ ideas: nextIdeas });
    } finally {
      setLoading(false);
    }
  }

  async function completeOnboarding(input: OnboardingInput) {
    if (!user) {
      throw new Error('You must be signed in to continue.');
    }

    const nextProfile: UserProfile = {
      uid: user.uid,
      email: user.email ?? '',
      photoURL: user.photoURL ?? '',
      type: input.type,
      name: input.name,
      location: {
        city: input.city,
        country: input.country,
      },
      background: input.background,
      skills: input.skills.split(',').map((value) => value.trim()).filter(Boolean),
      interests: input.interests.split(',').map((value) => value.trim()).filter(Boolean),
      capital: input.capital,
      wallet: emptyWallet(input.capital),
      investorProfile: input.type === 'investor'
        ? {
          riskAppetite: input.riskAppetite,
          industryPreferences: input.industryPreferences.split(',').map((value) => value.trim()).filter(Boolean),
          minInvestment: input.minInvestment,
          maxInvestment: input.maxInvestment,
        }
        : undefined,
    };

    setLoading(true);
    try {
      setProfile(nextProfile);
      setClinicInput('');
      await persist({ profile: nextProfile, clinicInput: '', clinicReport: null });
      const nextIdeas = nextProfile.type === 'founder'
        ? await generateBusinessIdeas(nextProfile)
        : await generateInvestmentOpportunities(nextProfile);
      setIdeas(nextIdeas);
      setClinicReport(null);
      await persist({ profile: nextProfile, ideas: nextIdeas, clinicInput: '', clinicReport: null });
    } finally {
      setLoading(false);
      setProfileReady(true);
    }
  }

  async function generateIdeaDetails(idea: BusinessIdea) {
    if (!profile) {
      return;
    }

    const existing = ideas.find((entry) => entry.id === idea.id);
    if (existing?.roadmap && existing?.investorReady) {
      return;
    }

    setLoading(true);
    try {
      const roadmap = existing?.roadmap ?? await generateRoadmap(idea, profile);
      const investorReady = existing?.investorReady ?? await generatePitchDeck(idea);
      const nextIdeas = ideas.map((entry) => (
        entry.id === idea.id ? { ...entry, roadmap, investorReady } : entry
      ));
      setIdeas(nextIdeas);
      await persist({ ideas: nextIdeas });
    } finally {
      setLoading(false);
    }
  }

  async function submitClinic(businessInfo: string) {
    if (!profile) {
      return;
    }

    setLoading(true);
    try {
      const nextReport = await diagnoseBusiness(businessInfo, profile);
      setClinicInput(businessInfo);
      setClinicReport(nextReport);
      await persist({ clinicInput: businessInfo, clinicReport: nextReport });
    } finally {
      setLoading(false);
    }
  }

  async function investInIdea(idea: BusinessIdea) {
    if (!profile?.investorProfile || !idea.investorReady) {
      return;
    }

    const amount = idea.investorReady.fundingRequired;
    if (profile.wallet.balance < amount) {
      throw new Error('Insufficient funds in wallet.');
    }

    const nextProfile: UserProfile = {
      ...profile,
      wallet: {
        ...profile.wallet,
        balance: profile.wallet.balance - amount,
        investments: [
          ...profile.wallet.investments,
          {
            id: crypto.randomUUID(),
            businessId: idea.id,
            businessName: idea.name,
            amount,
            equity: idea.investorReady.suggestedEquity,
            date: new Date().toISOString(),
          },
        ],
      },
    };

    setProfile(nextProfile);
    await persist({ profile: nextProfile });
  }

  return (
    <BusinessDataContext.Provider
      value={{
        clinicInput,
        clinicReport,
        ideas,
        loading,
        profile,
        profileReady,
        completeOnboarding,
        generateIdeaDetails,
        investInIdea,
        refreshIdeas,
        submitClinic,
      }}
    >
      {children}
    </BusinessDataContext.Provider>
  );
}

export function useBusinessData() {
  const context = useContext(BusinessDataContext);
  if (!context) {
    throw new Error('useBusinessData must be used inside BusinessDataProvider');
  }

  return context;
}
