import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { diagnoseBusiness, generateFounderStrategy } from '../services/ai';
import type {
  BusinessClinicReport,
  BusinessStage,
  FounderProfile,
  FounderStrategy,
  FounderTask,
  LeadStage,
  SalesLead,
  TaskStatus,
} from '../types';
import { createId, formatCurrency, leadStages, stageLabel, taskColumns } from '../lib/workspace';
import { useRouter } from '../router/useRouter';

type WorkspaceState = {
  profile: FounderProfile;
  strategy: FounderStrategy;
  tasks: FounderTask[];
  leads: SalesLead[];
};

type WorkspaceMetrics = {
  leadValue: number;
  openTasks: number;
  wonDeals: number;
  runwayMonths: number;
  formattedLeadValue: string;
};

export type WorkspaceForm = {
  founderName: string;
  businessName: string;
  stage: BusinessStage;
  city: string;
  country: string;
  industry: string;
  targetCustomer: string;
  businessModel: string;
  background: string;
  goals: string;
  capital: number;
  monthlyBurn: number;
};

type LeadDraft = {
  name: string;
  company: string;
  value: number;
  nextAction: string;
};

type WorkspaceContextValue = {
  workspace: WorkspaceState | null;
  metrics: WorkspaceMetrics | null;
  form: WorkspaceForm;
  clinicInput: string;
  clinicReport: BusinessClinicReport | null;
  loading: boolean;
  clinicLoading: boolean;
  newTask: string;
  newLead: LeadDraft;
  stageLabel: typeof stageLabel;
  taskColumns: TaskStatus[];
  leadStages: LeadStage[];
  setForm: (form: WorkspaceForm) => void;
  setClinicInput: (value: string) => void;
  setNewTask: (value: string) => void;
  setNewLead: (value: LeadDraft) => void;
  createWorkspace: () => Promise<void>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  addTask: () => void;
  advanceLead: (leadId: string) => void;
  addLead: () => void;
  runClinic: () => Promise<void>;
  resetWorkspace: () => void;
  canSubmitWorkspace: boolean;
};

const STORAGE_KEY = 'businessx_founder_workspace';

const defaultForm: WorkspaceForm = {
  founderName: '',
  businessName: '',
  stage: 'idea',
  city: '',
  country: '',
  industry: '',
  targetCustomer: '',
  businessModel: '',
  background: '',
  goals: '',
  capital: 5000,
  monthlyBurn: 1000,
};

const defaultLead: LeadDraft = {
  name: '',
  company: '',
  value: 1000,
  nextAction: '',
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

const createInitialTasks = (profile: FounderProfile, strategy: FounderStrategy): FounderTask[] => [
  {
    id: createId(),
    title: `Define the core ${profile.businessName} offer`,
    owner: profile.founderName,
    dueDate: 'This week',
    status: 'backlog',
    priority: 'high',
  },
  {
    id: createId(),
    title: strategy.priorities[0] || 'Run five customer discovery calls',
    owner: profile.founderName,
    dueDate: 'This week',
    status: 'in_progress',
    priority: 'high',
  },
  {
    id: createId(),
    title: 'Create a repeatable weekly operating review',
    owner: profile.founderName,
    dueDate: 'Next week',
    status: 'done',
    priority: 'medium',
  },
];

const createInitialLeads = (profile: FounderProfile): SalesLead[] => [
  {
    id: createId(),
    name: 'Aisha Bello',
    company: `${profile.location.city} Growth Network`,
    stage: 'new',
    value: 1200,
    nextAction: 'Schedule discovery call',
  },
  {
    id: createId(),
    name: 'Michael Chen',
    company: 'Pilot Customer',
    stage: 'proposal',
    value: 3500,
    nextAction: 'Send proposal and timeline',
  },
  {
    id: createId(),
    name: 'Nora James',
    company: 'Referral Partner',
    stage: 'contacted',
    value: 1800,
    nextAction: 'Share one-pager and case study',
  },
];

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { navigate, pathname } = useRouter();
  const [workspace, setWorkspace] = useState<WorkspaceState | null>(null);
  const [form, setForm] = useState<WorkspaceForm>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [clinicLoading, setClinicLoading] = useState(false);
  const [clinicInput, setClinicInput] = useState('');
  const [clinicReport, setClinicReport] = useState<BusinessClinicReport | null>(null);
  const [newTask, setNewTask] = useState('');
  const [newLead, setNewLead] = useState<LeadDraft>(defaultLead);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return;
    }

    try {
      setWorkspace(JSON.parse(saved) as WorkspaceState);
    } catch (error) {
      console.error('Failed to restore workspace', error);
    }
  }, []);

  useEffect(() => {
    if (!workspace) {
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
  }, [workspace]);

  useEffect(() => {
    const protectedPath = pathname === '/workspace' || pathname === '/review';
    if (protectedPath && !workspace) {
      navigate('/');
    }
  }, [navigate, pathname, workspace]);

  const metrics = useMemo(() => {
    if (!workspace) {
      return null;
    }

    const leadValue = workspace.leads.reduce((sum, lead) => sum + lead.value, 0);
    const openTasks = workspace.tasks.filter((task) => task.status !== 'done').length;
    const wonDeals = workspace.leads.filter((lead) => lead.stage === 'won').length;
    const runwayMonths = Math.max(
      1,
      Math.floor(workspace.profile.capital / Math.max(workspace.profile.monthlyBurn, 1)),
    );

    return {
      leadValue,
      openTasks,
      wonDeals,
      runwayMonths,
      formattedLeadValue: formatCurrency(leadValue),
    };
  }, [workspace]);

  const canSubmitWorkspace =
    !!form.founderName &&
    !!form.businessName &&
    !!form.city &&
    !!form.country &&
    !!form.industry &&
    !!form.targetCustomer &&
    !!form.businessModel;

  const createWorkspace = async () => {
    if (!canSubmitWorkspace) {
      return;
    }

    const profile: FounderProfile = {
      founderName: form.founderName,
      businessName: form.businessName,
      stage: form.stage,
      location: {
        city: form.city,
        country: form.country,
      },
      industry: form.industry,
      targetCustomer: form.targetCustomer,
      businessModel: form.businessModel,
      background: form.background,
      goals: form.goals
        .split(',')
        .map((goal) => goal.trim())
        .filter(Boolean),
      capital: form.capital,
      monthlyBurn: form.monthlyBurn,
    };

    setLoading(true);

    try {
      const strategy = await generateFounderStrategy(profile);
      setWorkspace({
        profile,
        strategy,
        tasks: createInitialTasks(profile, strategy),
        leads: createInitialLeads(profile),
      });
      navigate('/workspace');
    } catch (error) {
      console.error('Failed to create workspace', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setWorkspace((current) =>
      current
        ? {
            ...current,
            tasks: current.tasks.map((task) => (task.id === taskId ? { ...task, status } : task)),
          }
        : current,
    );
  };

  const addTask = () => {
    if (!newTask.trim()) {
      return;
    }

    setWorkspace((current) =>
      current
        ? {
            ...current,
            tasks: [
              {
                id: createId(),
                title: newTask.trim(),
                owner: current.profile.founderName,
                dueDate: 'This week',
                status: 'backlog',
                priority: 'medium',
              },
              ...current.tasks,
            ],
          }
        : current,
    );
    setNewTask('');
  };

  const advanceLead = (leadId: string) => {
    setWorkspace((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        leads: current.leads.map((lead) => {
          if (lead.id !== leadId) {
            return lead;
          }

          const currentIndex = leadStages.indexOf(lead.stage);
          const nextStage = leadStages[Math.min(currentIndex + 1, leadStages.length - 1)];
          return { ...lead, stage: nextStage };
        }),
      };
    });
  };

  const addLead = () => {
    if (!newLead.name.trim() || !newLead.company.trim()) {
      return;
    }

    setWorkspace((current) =>
      current
        ? {
            ...current,
            leads: [
              {
                id: createId(),
                name: newLead.name.trim(),
                company: newLead.company.trim(),
                stage: 'new',
                value: newLead.value,
                nextAction: newLead.nextAction.trim() || 'Send intro message',
              },
              ...current.leads,
            ],
          }
        : current,
    );
    setNewLead(defaultLead);
  };

  const runClinic = async () => {
    if (!workspace || !clinicInput.trim()) {
      return;
    }

    setClinicLoading(true);

    try {
      const report = await diagnoseBusiness(clinicInput.trim(), workspace.profile);
      setClinicReport(report);
      navigate('/review');
    } catch (error) {
      console.error('Failed to diagnose business', error);
    } finally {
      setClinicLoading(false);
    }
  };

  const resetWorkspace = () => {
    localStorage.removeItem(STORAGE_KEY);
    setWorkspace(null);
    setClinicReport(null);
    setClinicInput('');
    setNewTask('');
    setNewLead(defaultLead);
    setForm(defaultForm);
    navigate('/');
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        metrics,
        form,
        clinicInput,
        clinicReport,
        loading,
        clinicLoading,
        newTask,
        newLead,
        stageLabel,
        taskColumns,
        leadStages,
        setForm,
        setClinicInput,
        setNewTask,
        setNewLead,
        createWorkspace,
        updateTaskStatus,
        addTask,
        advanceLead,
        addLead,
        runClinic,
        resetWorkspace,
        canSubmitWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider');
  }

  return context;
}
