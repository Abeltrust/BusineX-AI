import { ArrowRight, Building2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from '../components/ui/Card';
import { Pill } from '../components/ui/Pill';
import { Button } from '../components/ui/Button';
import { useWorkspace } from '../context/WorkspaceContext';
import type { BusinessStage } from '../types';

export function SetupPage() {
  const { form, setForm, createWorkspace, loading, canSubmitWorkspace } = useWorkspace();

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl"
    >
      <Card className="p-6 md:p-10">
        <div className="mb-8 flex items-start justify-between gap-6">
          <div>
            <Pill>Business profile</Pill>
            <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">Set up the operating workspace</h1>
            <p className="mt-3 max-w-2xl text-[var(--text-muted)]">
              Capture the company context once. BusineX turns it into a practical workspace with strategy,
              execution, CRM, and business review support.
            </p>
          </div>
          <Building2 className="hidden h-12 w-12 text-slate-300 md:block" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-[var(--text-muted)]">Founder name</span>
            <input
              className="field"
              value={form.founderName}
              onChange={(event) => setForm({ ...form, founderName: event.target.value })}
              placeholder="Derek David"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-[var(--text-muted)]">Business name</span>
            <input
              className="field"
              value={form.businessName}
              onChange={(event) => setForm({ ...form, businessName: event.target.value })}
              placeholder="BusineX AI"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-[var(--text-muted)]">Stage</span>
            <select
              className="field"
              value={form.stage}
              onChange={(event) => setForm({ ...form, stage: event.target.value as BusinessStage })}
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
              className="field"
              value={form.industry}
              onChange={(event) => setForm({ ...form, industry: event.target.value })}
              placeholder="B2B SaaS"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-[var(--text-muted)]">City</span>
            <input
              className="field"
              value={form.city}
              onChange={(event) => setForm({ ...form, city: event.target.value })}
              placeholder="Lagos"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-[var(--text-muted)]">Country</span>
            <input
              className="field"
              value={form.country}
              onChange={(event) => setForm({ ...form, country: event.target.value })}
              placeholder="Nigeria"
            />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-[var(--text-muted)]">Target customer</span>
            <input
              className="field"
              value={form.targetCustomer}
              onChange={(event) => setForm({ ...form, targetCustomer: event.target.value })}
              placeholder="Small and mid-market founders who need operational visibility"
            />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-[var(--text-muted)]">Business model</span>
            <input
              className="field"
              value={form.businessModel}
              onChange={(event) => setForm({ ...form, businessModel: event.target.value })}
              placeholder="Subscription with implementation services"
            />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-[var(--text-muted)]">Founder background</span>
            <textarea
              className="field min-h-28"
              value={form.background}
              onChange={(event) => setForm({ ...form, background: event.target.value })}
              placeholder="Product, operations, engineering, go-to-market..."
            />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-[var(--text-muted)]">Goals</span>
            <input
              className="field"
              value={form.goals}
              onChange={(event) => setForm({ ...form, goals: event.target.value })}
              placeholder="Close first 5 customers, tighten positioning, reach predictable revenue"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-[var(--text-muted)]">Available capital</span>
            <input
              type="number"
              className="field"
              value={form.capital}
              onChange={(event) => setForm({ ...form, capital: Number(event.target.value) })}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-[var(--text-muted)]">Monthly burn</span>
            <input
              type="number"
              className="field"
              value={form.monthlyBurn}
              onChange={(event) => setForm({ ...form, monthlyBurn: Number(event.target.value) })}
            />
          </label>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button className="text-base" onClick={createWorkspace} loading={loading} disabled={!canSubmitWorkspace}>
            Build Workspace <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </motion.section>
  );
}
