import {
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  MapPin,
  ShieldAlert,
  Target,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Pill } from '../components/ui/Pill';
import { useWorkspace } from '../context/WorkspaceContext';
import { formatCurrency } from '../lib/workspace';
import type { TaskStatus } from '../types';
import { useRouter } from '../router/useRouter';

type WorkspaceTab = 'overview' | 'execution' | 'crm' | 'finance';

const tabItems = [
  { key: 'overview', label: 'Overview', icon: Target },
  { key: 'execution', label: 'Execution', icon: ClipboardList },
  { key: 'crm', label: 'CRM', icon: Users },
  { key: 'finance', label: 'Finance', icon: CircleDollarSign },
] as const;

export function WorkspacePage() {
  const { navigate } = useRouter();
  const {
    workspace,
    metrics,
    stageLabel,
    taskColumns,
    leadStages,
    newTask,
    newLead,
    clinicInput,
    clinicLoading,
    setNewTask,
    setNewLead,
    setClinicInput,
    updateTaskStatus,
    addTask,
    advanceLead,
    addLead,
    runClinic,
  } = useWorkspace();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');

  if (!workspace || !metrics) {
    return (
      <Card className="mx-auto max-w-3xl p-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight">No workspace available</h1>
        <p className="mt-3 text-[var(--text-muted)]">
          Start with company setup to generate a strategic operating workspace.
        </p>
        <Button className="mt-6" onClick={() => navigate('/setup')}>
          Go to Setup
        </Button>
      </Card>
    );
  }

  return (
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
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
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-200">{workspace.strategy.summary}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => setActiveTab('execution')}>
                Open Execution
              </Button>
              <Button
                variant="ghost"
                className="bg-white/[0.08] text-white hover:bg-white/[0.12]"
                onClick={() => navigate('/review')}
              >
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
                <p className="mt-2 text-3xl font-bold">{metrics.formattedLeadValue}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-[#0f766e]" />
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Open tasks', value: metrics.openTasks, icon: ClipboardList },
          { label: 'Active leads', value: workspace.leads.length, icon: Users },
          { label: 'Won deals', value: metrics.wonDeals, icon: CheckCircle2 },
          { label: 'Monthly burn', value: formatCurrency(workspace.profile.monthlyBurn), icon: ShieldAlert },
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
        {tabItems.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.key ? 'nav-tab-active' : 'nav-tab'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' ? <OverviewTab /> : null}
      {activeTab === 'execution' ? (
        <ExecutionTab
          newTask={newTask}
          setNewTask={setNewTask}
          addTask={addTask}
          taskColumns={taskColumns}
          tasks={workspace.tasks}
          updateTaskStatus={updateTaskStatus}
        />
      ) : null}
      {activeTab === 'crm' ? (
        <CrmTab
          leadStages={leadStages}
          leads={workspace.leads}
          newLead={newLead}
          setNewLead={setNewLead}
          addLead={addLead}
          advanceLead={advanceLead}
        />
      ) : null}
      {activeTab === 'finance' ? <FinanceTab /> : null}

      <Card className="p-6 md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex-1">
            <h2 className="text-2xl font-bold">Business review input</h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Describe the current bottleneck and generate a structured assessment with recommended actions.
            </p>
            <textarea
              className="field mt-4 min-h-32"
              value={clinicInput}
              onChange={(event) => setClinicInput(event.target.value)}
              placeholder="We have product interest but weak conversion, unclear pricing, and inconsistent delivery..."
            />
          </div>
          <Button className="lg:mb-1" onClick={runClinic} loading={clinicLoading}>
            Run Review
          </Button>
        </div>
      </Card>
    </motion.section>
  );
}

function OverviewTab() {
  const { workspace } = useWorkspace();

  if (!workspace) {
    return null;
  }

  return (
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
  );
}

type ExecutionTabProps = {
  newTask: string;
  setNewTask: (value: string) => void;
  addTask: () => void;
  taskColumns: TaskStatus[];
  tasks: ReturnType<typeof useWorkspace>['workspace']['tasks'];
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
};

function ExecutionTab({ newTask, setNewTask, addTask, taskColumns, tasks, updateTaskStatus }: ExecutionTabProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 md:flex-row">
          <input
            className="field flex-1"
            value={newTask}
            onChange={(event) => setNewTask(event.target.value)}
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
                {tasks.filter((task) => task.status === column).length}
              </span>
            </div>
            <div className="space-y-4">
              {tasks
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
                            task.status === status ? 'nav-tab-active' : 'nav-tab'
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
  );
}

type CrmTabProps = {
  leads: NonNullable<ReturnType<typeof useWorkspace>['workspace']>['leads'];
  leadStages: ReturnType<typeof useWorkspace>['leadStages'];
  newLead: ReturnType<typeof useWorkspace>['newLead'];
  setNewLead: ReturnType<typeof useWorkspace>['setNewLead'];
  addLead: () => void;
  advanceLead: (leadId: string) => void;
};

function CrmTab({ leads, leadStages, newLead, setNewLead, addLead, advanceLead }: CrmTabProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <input
            className="field"
            value={newLead.name}
            onChange={(event) => setNewLead({ ...newLead, name: event.target.value })}
            placeholder="Contact name"
          />
          <input
            className="field"
            value={newLead.company}
            onChange={(event) => setNewLead({ ...newLead, company: event.target.value })}
            placeholder="Company"
          />
          <input
            type="number"
            className="field"
            value={newLead.value}
            onChange={(event) => setNewLead({ ...newLead, value: Number(event.target.value) })}
            placeholder="Deal value"
          />
          <input
            className="field"
            value={newLead.nextAction}
            onChange={(event) => setNewLead({ ...newLead, nextAction: event.target.value })}
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
                {leads.filter((lead) => lead.stage === stage).length}
              </span>
            </div>
            <div className="space-y-4">
              {leads
                .filter((lead) => lead.stage === stage)
                .map((lead) => (
                  <div key={lead.id} className="data-card rounded-2xl p-4">
                    <p className="font-semibold">{lead.name}</p>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">{lead.company}</p>
                    <p className="mt-3 text-sm font-semibold text-[#0f766e]">{formatCurrency(lead.value)}</p>
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
  );
}

function FinanceTab() {
  const { workspace, metrics } = useWorkspace();

  if (!workspace || !metrics) {
    return null;
  }

  return (
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
            Treat pipeline value as confidence-adjusted rather than booked cash. Tie each incremental expense to
            either delivery quality or revenue velocity.
          </p>
        </div>
      </Card>
    </div>
  );
}
