import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  MapPin,
  ShieldAlert,
  Stethoscope,
  Target,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';
import { diagnoseBusiness, generateFounderStrategy } from './services/ai';
import {
  BusinessClinicReport,
  BusinessStage,
  FounderProfile,
  FounderStrategy,
  FounderTask,
  LeadStage,
  SalesLead,
  TaskStatus,
} from './types';

type AppStep = 'landing' | 'onboarding' | 'workspace' | 'clinic';
type WorkspaceTab = 'overview' | 'execution' | 'crm' | 'finance';

type WorkspaceState = {
  profile: FounderProfile;
  strategy: FounderStrategy;
  tasks: FounderTask[];
  leads: SalesLead[];
};

const STORAGE_KEY = 'businessx_founder_workspace';

const stageLabel: Record<BusinessStage, string> = {
  idea: 'Idea',
  mvp: 'Validation',
  traction: 'Traction',
  scale: 'Scale',
};

const taskColumns: TaskStatus[] = ['backlog', 'in_progress', 'done'];
const leadStages: LeadStage[] = ['new', 'contacted', 'proposal', 'won'];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

const createId = () => Math.random().toString(36).slice(2, 10);

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

const Card: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({
  className = '',
  children,
}) => <div className={`panel rounded-[28px] ${className}`}>{children}</div>;

const Button: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit';
}> = ({
  children,
  className = '',
  onClick,
  variant = 'primary',
  disabled = false,
  loading = false,
  type = 'button',
}) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    outline: 'btn-outline',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {loading ? <Zap className="h-4 w-4 animate-spin" /> : children}
    </button>
  );
};

const Pill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="pill inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em]">
    {children}
  </span>
);

export default function App() {
  const [step, setStep] = useState<AppStep>('landing');
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');
  const [workspace, setWorkspace] = useState<WorkspaceState | null>(null);
  const [loading, setLoading] = useState(false);
  const [clinicLoading, setClinicLoading] = useState(false);
  const [clinicInput, setClinicInput] = useState('');
  const [clinicReport, setClinicReport] = useState<BusinessClinicReport | null>(null);
  const [newTask, setNewTask] = useState('');
  const [newLead, setNewLead] = useState({
    name: '',
    company: '',
    value: 1000,
    nextAction: '',
  });

  const [form, setForm] = useState({
    founderName: '',
    businessName: '',
    stage: 'idea' as BusinessStage,
    city: '',
    country: '',
    industry: '',
    targetCustomer: '',
    businessModel: '',
    background: '',
    goals: '',
    capital: 5000,
    monthlyBurn: 1000,
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as WorkspaceState;
      setWorkspace(parsed);
      setStep('workspace');
    } catch (error) {
      console.error('Failed to restore workspace', error);
    }
  }, []);

  useEffect(() => {
    if (!workspace) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
  }, [workspace]);

  const metrics = useMemo(() => {
    if (!workspace) return null;

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
    };
  }, [workspace]);

  const createWorkspace = async () => {
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
      setStep('workspace');
      setActiveTab('overview');
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
    if (!newTask.trim()) return;
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
      if (!current) return current;
      return {
        ...current,
        leads: current.leads.map((lead) => {
          if (lead.id !== leadId) return lead;
          const currentIndex = leadStages.indexOf(lead.stage);
          const nextStage = leadStages[Math.min(currentIndex + 1, leadStages.length - 1)];
          return { ...lead, stage: nextStage };
        }),
      };
    });
  };

  const addLead = () => {
    if (!newLead.name.trim() || !newLead.company.trim()) return;
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
    setNewLead({
      name: '',
      company: '',
      value: 1000,
      nextAction: '',
    });
  };

  const runClinic = async () => {
    if (!workspace || !clinicInput.trim()) return;

    setClinicLoading(true);
    try {
      const report = await diagnoseBusiness(clinicInput.trim(), workspace.profile);
      setClinicReport(report);
      setStep('clinic');
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
    setStep('landing');
  };

  return (
    <div className="app-shell min-h-screen text-slate-900">
      <nav className="sticky top-0 z-50 border-b border-slate-900/[0.08] bg-white/72 px-4 py-4 backdrop-blur-xl md:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <button className="flex items-center gap-3" onClick={() => setStep(workspace ? 'workspace' : 'landing')}>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary)] shadow-lg shadow-sky-900/10">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-lg font-bold tracking-tight text-[var(--heading)]">BusineX AI</p>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Business Operations Workspace</p>
            </div>
          </button>

          <div className="flex items-center gap-2 md:gap-3">
            {workspace && (
              <>
                <Button variant="ghost" className="hidden md:inline-flex" onClick={() => setStep('workspace')}>
                  Workspace
                </Button>
                <Button variant="ghost" className="hidden md:inline-flex" onClick={() => setStep('clinic')}>
                  Review
                </Button>
              </>
            )}
            <Button variant="outline" onClick={resetWorkspace}>
              Reset
            </Button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <AnimatePresence mode="wait">
          {step === 'landing' && (
            <motion.section
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10 md:space-y-16"
            >
              <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                <div className="space-y-6">
                  <Pill>Strategy, execution, and oversight</Pill>
                  <h1 className="max-w-4xl font-display text-5xl font-bold leading-[0.92] tracking-tight md:text-7xl">
                    Business planning and execution support for companies building with discipline.
                  </h1>
                  <p className="max-w-2xl text-lg leading-relaxed text-[var(--text-muted)]">
                    BusineX brings commercial planning, operating priorities, pipeline visibility, and
                    business review workflows into one clear workspace for founders and small teams.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button className="text-base" onClick={() => setStep('onboarding')}>
                      Create Workspace <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="text-base" onClick={() => setStep('clinic')}>
                      Open Business Review
                    </Button>
                  </div>
                </div>

                <Card className="panel-strong overflow-hidden text-white">
                  <div className="space-y-6 p-8">
                    <div className="flex items-center justify-between">
                      <Pill>Platform capabilities</Pill>
                      <Building2 className="h-5 w-5 text-sky-200" />
                    </div>
                    <div className="grid gap-4">
                      {[
                        'Centralize business context, goals, operating assumptions, and financial inputs.',
                        'Generate stage-aware plans with practical priorities and milestones.',
                        'Track delivery tasks, commercial opportunities, and cash exposure in one view.',
                        'Review operating challenges and receive structured recovery recommendations.',
                      ].map((item) => (
                        <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm text-slate-200">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    icon: Target,
                    title: 'Strategic Direction',
                    text: 'Translate company context into priorities that fit the current stage of the business.',
                  },
                  {
                    icon: ClipboardList,
                    title: 'Execution Tracking',
                    text: 'Convert strategic guidance into owned tasks, deadlines, and operating cadence.',
                  },
                  {
                    icon: Users,
                    title: 'Pipeline Management',
                    text: 'Track prospects, proposals, and follow-up activity without leaving the workspace.',
                  },
                  {
                    icon: CircleDollarSign,
                    title: 'Financial Visibility',
                    text: 'Keep cash position, burn rate, and commercial value in view during critical growth periods.',
                  },
                ].map((feature) => (
                  <Card key={feature.title} className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h2 className="mb-2 text-xl font-bold">{feature.title}</h2>
                    <p className="text-sm leading-relaxed text-[var(--text-muted)]">{feature.text}</p>
                  </Card>
                ))}
              </div>
            </motion.section>
          )}

          {step === 'onboarding' && (
            <motion.section
              key="onboarding"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto max-w-4xl"
            >
              <Card className="p-6 md:p-10">
                <div className="mb-8 flex items-start justify-between gap-6">
                  <div>
                    <Pill>Business profile</Pill>
                    <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">Set up your workspace</h1>
                    <p className="mt-3 max-w-2xl text-[var(--text-muted)]">
                      Add the commercial, operational, and financial context for your business. BusineX uses
                      it to prepare a working plan, a task list, and an initial pipeline view.
                    </p>
                  </div>
                  <Building2 className="hidden h-12 w-12 text-slate-300 md:block" />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-[var(--text-muted)]">Founder name</span>
                    <input
                      className="w-full rounded-2xl border border-slate-900/10 bg-white/80 px-4 py-3 outline-none transition"
                      value={form.founderName}
                      onChange={(e) => setForm({ ...form, founderName: e.target.value })}
                      placeholder="Derek David"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-[var(--text-muted)]">Business name</span>
                    <input
                      className="w-full rounded-2xl border border-slate-900/10 bg-white/80 px-4 py-3 outline-none transition"
                      value={form.businessName}
                      onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                      placeholder="BusineX AI"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-[var(--text-muted)]">Stage</span>
                    <select
                      className="w-full rounded-2xl border border-slate-900/10 bg-white/80 px-4 py-3 outline-none transition"
                      value={form.stage}
                      onChange={(e) => setForm({ ...form, stage: e.target.value as BusinessStage })}
                    >
                      <option value="idea">Idea</option>
                      <option value="mvp">Validation</option>
                      <option value="traction">Traction</option>
                      <option value="scale">Scale</option>
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-[var(--text-muted)]">Industry</span>
                    <input
                      className="w-full rounded-2xl border border-slate-900/10 bg-white/80 px-4 py-3 outline-none transition"
                      value={form.industry}
                      onChange={(e) => setForm({ ...form, industry: e.target.value })}
                      placeholder="B2B SaaS"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-[var(--text-muted)]">City</span>
                    <input
                      className="w-full rounded-2xl border border-slate-900/10 bg-white/80 px-4 py-3 outline-none transition"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="Lagos"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-[var(--text-muted)]">Country</span>
                    <input
                      className="w-full rounded-2xl border border-slate-900/10 bg-white/80 px-4 py-3 outline-none transition"
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      placeholder="Nigeria"
                    />
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-semibold text-[var(--text-muted)]">Target customer</span>
                    <input
                      className="w-full rounded-2xl border border-slate-900/10 bg-white/80 px-4 py-3 outline-none transition"
                      value={form.targetCustomer}
                      onChange={(e) => setForm({ ...form, targetCustomer: e.target.value })}
                      placeholder="SME founders who need operational visibility and AI planning"
                    />
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-semibold text-[var(--text-muted)]">Business model</span>
                    <input
                      className="w-full rounded-2xl border border-slate-900/10 bg-white/80 px-4 py-3 outline-none transition"
                      value={form.businessModel}
                      onChange={(e) => setForm({ ...form, businessModel: e.target.value })}
                      placeholder="Subscription with implementation add-on"
                    />
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-semibold text-[var(--text-muted)]">Founder background</span>
                    <textarea
                      className="min-h-28 w-full rounded-2xl border border-slate-900/10 bg-white/80 px-4 py-3 outline-none transition"
                      value={form.background}
                      onChange={(e) => setForm({ ...form, background: e.target.value })}
                      placeholder="Product, growth, engineering, and startup operations..."
                    />
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-semibold text-[var(--text-muted)]">Goals</span>
                    <input
                      className="w-full rounded-2xl border border-slate-900/10 bg-white/80 px-4 py-3 outline-none transition"
                      value={form.goals}
                      onChange={(e) => setForm({ ...form, goals: e.target.value })}
                      placeholder="Close first 5 customers, tighten offer, reach monthly recurring revenue"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-[var(--text-muted)]">Available capital</span>
                    <input
                      type="number"
                      className="w-full rounded-2xl border border-slate-900/10 bg-white/80 px-4 py-3 outline-none transition"
                      value={form.capital}
                      onChange={(e) => setForm({ ...form, capital: Number(e.target.value) })}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-[var(--text-muted)]">Monthly burn</span>
                    <input
                      type="number"
                      className="w-full rounded-2xl border border-slate-900/10 bg-white/80 px-4 py-3 outline-none transition"
                      value={form.monthlyBurn}
                      onChange={(e) => setForm({ ...form, monthlyBurn: Number(e.target.value) })}
                    />
                  </label>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button
                    className="text-base"
                    onClick={createWorkspace}
                    loading={loading}
                    disabled={
                      !form.founderName ||
                      !form.businessName ||
                      !form.city ||
                      !form.country ||
                      !form.industry ||
                      !form.targetCustomer ||
                      !form.businessModel
                    }
                  >
                    Build Workspace <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={() => setStep('landing')}>
                    Back
                  </Button>
                </div>
              </Card>
            </motion.section>
          )}

          {step === 'workspace' && workspace && metrics && (
            <motion.section
              key="workspace"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <Card className="panel-strong overflow-hidden text-white">
                  <div className="space-y-6 p-8">
                    <div className="flex flex-wrap items-center gap-3">
                      <Pill>{stageLabel[workspace.profile.stage]} stage</Pill>
                      <span className="text-sm text-slate-300">
                        <MapPin className="mr-1 inline h-4 w-4" />
                        {workspace.profile.location.city}, {workspace.profile.location.country}
                      </span>
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight md:text-5xl">{workspace.profile.businessName}</h1>
                      <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-200">
                        {workspace.strategy.summary}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="secondary" onClick={() => setActiveTab('execution')}>
                        Open Execution
                      </Button>
                      <Button variant="ghost" className="bg-white/[0.08] text-white hover:bg-white/[0.12]" onClick={() => setStep('clinic')}>
                        Open Business Review
                      </Button>
                    </div>
                  </div>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Runway</p>
                        <p className="mt-2 text-3xl font-bold">{metrics.runwayMonths} months</p>
                      </div>
                      <Wallet className="h-8 w-8 text-[var(--primary)]" />
                    </div>
                  </Card>
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Pipeline value</p>
                        <p className="mt-2 text-3xl font-bold">{formatCurrency(metrics.leadValue)}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-[#1b6b62]" />
                    </div>
                  </Card>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                {[
                  {
                    label: 'Open tasks',
                    value: metrics.openTasks,
                    icon: ClipboardList,
                  },
                  {
                    label: 'Active leads',
                    value: workspace.leads.length,
                    icon: Users,
                  },
                  {
                    label: 'Won deals',
                    value: metrics.wonDeals,
                    icon: CheckCircle2,
                  },
                  {
                    label: 'Monthly burn',
                    value: formatCurrency(workspace.profile.monthlyBurn),
                    icon: ShieldAlert,
                  },
                ].map((item) => (
                  <Card key={item.label} className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">{item.label}</p>
                        <p className="mt-2 text-2xl font-bold">{item.value}</p>
                      </div>
                      <item.icon className="h-6 w-6 text-slate-400" />
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'overview', label: 'Overview', icon: Target },
                  { key: 'execution', label: 'Execution', icon: ClipboardList },
                  { key: 'crm', label: 'CRM', icon: Users },
                  { key: 'finance', label: 'Finance', icon: CircleDollarSign },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as WorkspaceTab)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                      activeTab === tab.key ? 'nav-tab-active' : 'nav-tab'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === 'overview' && (
                <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
                  <Card className="p-6 md:p-8">
                    <h2 className="text-2xl font-bold">Value proposition</h2>
                    <p className="mt-4 leading-relaxed text-[var(--text-muted)]">{workspace.strategy.valueProposition}</p>
                    <div className="mt-8 grid gap-4 md:grid-cols-2">
                      <div className="surface-muted rounded-2xl p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Industry</p>
                        <p className="mt-2 font-semibold">{workspace.profile.industry}</p>
                      </div>
                      <div className="surface-muted rounded-2xl p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Business model</p>
                        <p className="mt-2 font-semibold">{workspace.profile.businessModel}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 md:p-8">
                    <h2 className="text-2xl font-bold">Top priorities</h2>
                    <div className="mt-5 space-y-4">
                      {workspace.strategy.priorities.map((priority) => (
                        <div key={priority} className="surface-muted flex gap-3 rounded-2xl p-4">
                          <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />
                          <p className="text-sm leading-relaxed text-slate-700">{priority}</p>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6 md:p-8">
                    <h2 className="text-2xl font-bold">Milestones</h2>
                    <div className="mt-5 space-y-4">
                      {workspace.strategy.milestones.map((milestone) => (
                        <div key={milestone} className="data-card rounded-2xl p-4 text-sm text-slate-700">
                          {milestone}
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6 md:p-8">
                    <h2 className="text-2xl font-bold">Business risks</h2>
                    <div className="mt-5 space-y-4">
                      {workspace.strategy.risks.map((risk) => (
                        <div key={risk} className="risk-card rounded-2xl p-4 text-sm">
                          {risk}
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'execution' && (
                <div className="space-y-6">
                  <Card className="p-6">
                    <div className="flex flex-col gap-4 md:flex-row">
                      <input
                        className="flex-1 rounded-2xl border border-slate-900/10 bg-white/80 px-4 py-3 outline-none transition"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        placeholder="Add a task..."
                      />
                      <Button onClick={addTask}>Add Task</Button>
                    </div>
                  </Card>

                  <div className="grid gap-5 lg:grid-cols-3">
                    {taskColumns.map((column) => (
                      <Card key={column} className="p-5">
                        <div className="mb-4 flex items-center justify-between">
                          <h2 className="text-lg font-bold capitalize">{column.replace('_', ' ')}</h2>
                          <span className="surface-muted rounded-full px-3 py-1 text-xs font-semibold text-[var(--text-muted)]">
                            {workspace.tasks.filter((task) => task.status === column).length}
                          </span>
                        </div>
                        <div className="space-y-4">
                          {workspace.tasks
                            .filter((task) => task.status === column)
                            .map((task) => (
                              <div key={task.id} className="data-card rounded-2xl p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="font-semibold">{task.title}</p>
                                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                                      {task.owner} • {task.dueDate}
                                    </p>
                                  </div>
                                  <span
                                    className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${
                                      task.priority === 'high'
                                        ? 'risk-card'
                                        : task.priority === 'medium'
                                          ? 'metric-warning'
                                          : 'metric-positive'
                                    }`}
                                  >
                                    {task.priority}
                                  </span>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2">
                                  {taskColumns.map((status) => (
                                    <button
                                      key={status}
                                      onClick={() => updateTaskStatus(task.id, status)}
                                      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                                        task.status === status
                                          ? 'nav-tab-active'
                                          : 'nav-tab'
                                      }`}
                                    >
                                      {status.replace('_', ' ')}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'crm' && (
                <div className="space-y-6">
                  <Card className="p-6">
                    <div className="grid gap-4 md:grid-cols-4">
                      <input
                        className="rounded-2xl border border-slate-900/10 bg-white/80 px-4 py-3 outline-none transition"
                        value={newLead.name}
                        onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                        placeholder="Contact name"
                      />
                      <input
                        className="rounded-2xl border border-slate-900/10 bg-white/80 px-4 py-3 outline-none transition"
                        value={newLead.company}
                        onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                        placeholder="Company"
                      />
                      <input
                        type="number"
                        className="rounded-2xl border border-slate-900/10 bg-white/80 px-4 py-3 outline-none transition"
                        value={newLead.value}
                        onChange={(e) => setNewLead({ ...newLead, value: Number(e.target.value) })}
                        placeholder="Deal value"
                      />
                      <input
                        className="rounded-2xl border border-slate-900/10 bg-white/80 px-4 py-3 outline-none transition"
                        value={newLead.nextAction}
                        onChange={(e) => setNewLead({ ...newLead, nextAction: e.target.value })}
                        placeholder="Next action"
                      />
                    </div>
                    <div className="mt-4">
                      <Button onClick={addLead}>Add Lead</Button>
                    </div>
                  </Card>

                  <div className="grid gap-5 lg:grid-cols-4">
                    {leadStages.map((stage) => (
                      <Card key={stage} className="p-5">
                        <div className="mb-4 flex items-center justify-between">
                          <h2 className="text-lg font-bold capitalize">{stage}</h2>
                          <span className="surface-muted rounded-full px-3 py-1 text-xs font-semibold text-[var(--text-muted)]">
                            {workspace.leads.filter((lead) => lead.stage === stage).length}
                          </span>
                        </div>
                        <div className="space-y-4">
                          {workspace.leads
                            .filter((lead) => lead.stage === stage)
                            .map((lead) => (
                              <div key={lead.id} className="data-card rounded-2xl p-4">
                                <p className="font-semibold">{lead.name}</p>
                                <p className="mt-1 text-sm text-[var(--text-muted)]">{lead.company}</p>
                                <p className="mt-3 text-sm font-semibold text-[#1b6b62]">
                                  {formatCurrency(lead.value)}
                                </p>
                                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                                  Next: {lead.nextAction}
                                </p>
                                <Button className="mt-4 w-full" variant="outline" onClick={() => advanceLead(lead.id)}>
                                  Advance Stage
                                </Button>
                              </div>
                            ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'finance' && (
                <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                  <Card className="p-6 md:p-8">
                    <h2 className="text-2xl font-bold">Cash discipline</h2>
                    <div className="mt-6 space-y-4">
                      <div className="surface-muted rounded-2xl p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Cash in bank</p>
                        <p className="mt-2 text-3xl font-bold">{formatCurrency(workspace.profile.capital)}</p>
                      </div>
                      <div className="surface-muted rounded-2xl p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Monthly burn</p>
                        <p className="mt-2 text-3xl font-bold">{formatCurrency(workspace.profile.monthlyBurn)}</p>
                      </div>
                      <div className="metric-positive rounded-2xl p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em]">Estimated runway</p>
                        <p className="mt-2 text-3xl font-bold">{metrics.runwayMonths} months</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 md:p-8">
                    <h2 className="text-2xl font-bold">Finance guidance</h2>
                    <div className="mt-5 space-y-4">
                      {workspace.strategy.financeNotes.map((note) => (
                        <div key={note} className="data-card rounded-2xl p-4 text-sm leading-relaxed text-slate-700">
                          {note}
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 rounded-3xl bg-[var(--heading)] p-6 text-white">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Management note</p>
                      <p className="mt-3 text-lg leading-relaxed text-slate-200">
                        Treat pipeline value as confidence-adjusted, not real cash. Protect runway by tying every
                        new expense to either delivery quality or revenue velocity.
                      </p>
                    </div>
                  </Card>
                </div>
              )}

              <Card className="p-6 md:p-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">Business review input</h2>
                    <p className="mt-2 text-sm text-[var(--text-muted)]">
                      Describe the current bottleneck and generate a structured assessment with recommended actions.
                    </p>
                    <textarea
                      className="mt-4 min-h-32 w-full rounded-2xl border border-slate-900/10 bg-white/80 px-4 py-3 outline-none transition"
                      value={clinicInput}
                      onChange={(e) => setClinicInput(e.target.value)}
                      placeholder="We have product interest but weak conversion, unclear pricing, and inconsistent delivery..."
                    />
                  </div>
                  <Button className="lg:mb-1" onClick={runClinic} loading={clinicLoading}>
                    Run Review
                  </Button>
                </div>
              </Card>
            </motion.section>
          )}

          {step === 'clinic' && (
            <motion.section
              key="clinic"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto max-w-5xl space-y-6"
            >
              <Card className="panel-strong overflow-hidden text-white">
                <div className="p-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-sky-200">
                      <Stethoscope className="h-6 w-6" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight">Business Review</h1>
                      <p className="text-sm text-slate-300">
                        Assess bottlenecks, refine operating actions, and improve readiness for the next stage of growth.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {workspace && (
                <Card className="p-6 md:p-8">
                  <textarea
                    className="min-h-36 w-full rounded-2xl border border-slate-900/10 bg-white/80 px-4 py-3 outline-none transition"
                    value={clinicInput}
                    onChange={(e) => setClinicInput(e.target.value)}
                    placeholder="Describe your current business challenge in detail..."
                  />
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button onClick={runClinic} loading={clinicLoading}>
                      Generate Review
                    </Button>
                    <Button variant="outline" onClick={() => setStep(workspace ? 'workspace' : 'landing')}>
                      Back to Workspace
                    </Button>
                  </div>
                </Card>
              )}

              {clinicReport ? (
                <div className="grid gap-6">
                  <Card className="border-l-4 border-l-[var(--primary)] p-6 md:p-8">
                    <h2 className="text-2xl font-bold">Assessment</h2>
                    <p className="mt-4 leading-relaxed text-slate-700">{clinicReport.diagnosis}</p>
                  </Card>

                  <div className="grid gap-6 md:grid-cols-2">
                    <Card className="p-6 md:p-8">
                      <h2 className="text-xl font-bold">Recovery strategies</h2>
                      <div className="mt-4 space-y-3">
                        {clinicReport.recoveryStrategies.map((item) => (
                          <div key={item} className="surface-muted rounded-2xl p-4 text-sm text-slate-700">
                            {item}
                          </div>
                        ))}
                      </div>
                    </Card>
                    <Card className="p-6 md:p-8">
                      <h2 className="text-xl font-bold">Growth recommendations</h2>
                      <div className="mt-4 space-y-3">
                        {clinicReport.growthRecommendations.map((item) => (
                          <div key={item} className="surface-muted rounded-2xl p-4 text-sm text-slate-700">
                            {item}
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <Card className="p-6 md:p-8">
                      <h2 className="text-xl font-bold">Pivot opportunities</h2>
                      <div className="mt-4 space-y-3">
                        {clinicReport.pivotOpportunities.map((item) => (
                          <div key={item} className="data-card rounded-2xl p-4 text-sm text-slate-700">
                            {item}
                          </div>
                        ))}
                      </div>
                    </Card>
                    <Card className="p-6 md:p-8">
                      <h2 className="text-xl font-bold">Investor readiness next steps</h2>
                      <div className="mt-4 space-y-3">
                        {clinicReport.investmentReadySteps.map((item, index) => (
                          <div key={item} className="data-card flex gap-3 rounded-2xl p-4 text-sm text-slate-700">
                            <span className="font-bold text-[var(--primary)]">{index + 1}.</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>
              ) : (
                <Card className="p-10 text-center">
                  <h2 className="text-2xl font-bold">No review generated yet</h2>
                  <p className="mt-3 text-[var(--text-muted)]">
                    Add business context above to generate an operational assessment and recommended next steps.
                  </p>
                </Card>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-slate-900/[0.08] px-4 py-8 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-[var(--text-muted)]">BusineX AI supports planning, execution, pipeline management, and business review in one workspace.</p>
          <p className="text-sm text-slate-400">Designed for disciplined operators building sustainable companies.</p>
        </div>
      </footer>
    </div>
  );
}
