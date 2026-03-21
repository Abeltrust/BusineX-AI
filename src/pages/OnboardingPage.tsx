import type { ReactNode } from 'react';
import { ArrowRight, Briefcase, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button, Card, PageHeader } from '../components/ui';
import { useBusinessData, type OnboardingInput } from '../contexts/BusinessDataContext';

const initialState: OnboardingInput = {
  type: 'founder',
  name: '',
  city: '',
  country: '',
  background: '',
  skills: '',
  interests: '',
  capital: 0,
  riskAppetite: 'medium',
  industryPreferences: '',
  minInvestment: 1000,
  maxInvestment: 50000,
};

export function OnboardingPage() {
  const navigate = useNavigate();
  const { completeOnboarding, loading, profile, profileReady } = useBusinessData();
  const [form, setForm] = useState<OnboardingInput>(initialState);
  const [error, setError] = useState('');

  if (profileReady && profile) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit() {
    setError('');

    try {
      await completeOnboarding(form);
      navigate('/dashboard', { replace: true });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to create your profile.');
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Onboarding"
        title="Create your founder or investor profile"
        description="Set up the operating profile used across ideas, diagnostics, and capital tracking."
      />

      <Card className="p-6 md:p-10">
        <div className="grid gap-6 md:grid-cols-2">
          <button
            className={`rounded-[1.75rem] border p-6 text-left transition ${form.type === 'founder' ? 'border-[#1f4f46] bg-[#1f4f46] text-white shadow-[0_12px_30px_rgba(31,79,70,0.18)]' : 'border-[#d2ccbd] bg-[#fbfaf6] hover:border-[#a9b4ad]'}`}
            onClick={() => setForm((current) => ({ ...current, type: 'founder' }))}
          >
            <Briefcase className="h-8 w-8" />
            <h2 className="mt-4 text-xl font-semibold">I&apos;m a founder</h2>
            <p className={`mt-2 text-sm ${form.type === 'founder' ? 'text-[#dfe7e3]' : 'text-[#5f655f]'}`}>
              Focus on venture discovery, planning, and operating direction.
            </p>
          </button>
          <button
            className={`rounded-[1.75rem] border p-6 text-left transition ${form.type === 'investor' ? 'border-[#1f4f46] bg-[#1f4f46] text-white shadow-[0_12px_30px_rgba(31,79,70,0.18)]' : 'border-[#d2ccbd] bg-[#fbfaf6] hover:border-[#a9b4ad]'}`}
            onClick={() => setForm((current) => ({ ...current, type: 'investor' }))}
          >
            <TrendingUp className="h-8 w-8" />
            <h2 className="mt-4 text-xl font-semibold">I&apos;m an investor</h2>
            <p className={`mt-2 text-sm ${form.type === 'investor' ? 'text-[#dfe7e3]' : 'text-[#5f655f]'}`}>
              Focus on opportunity review, funding fit, and portfolio activity.
            </p>
          </button>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Field label="Full name">
            <input className={inputClassName} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          </Field>
          <Field label="City">
            <input className={inputClassName} value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} />
          </Field>
          <Field label="Country">
            <input className={inputClassName} value={form.country} onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))} />
          </Field>
          <Field label="Available capital (USD)">
            <input className={inputClassName} type="number" value={form.capital} onChange={(event) => setForm((current) => ({ ...current, capital: Number(event.target.value) }))} />
          </Field>
          <Field label="Skills">
            <input className={inputClassName} value={form.skills} onChange={(event) => setForm((current) => ({ ...current, skills: event.target.value }))} placeholder="Design, software, operations" />
          </Field>
          <Field label="Interests">
            <input className={inputClassName} value={form.interests} onChange={(event) => setForm((current) => ({ ...current, interests: event.target.value }))} placeholder="Fintech, health, logistics" />
          </Field>
        </div>

        <div className="mt-5">
          <Field label="Background">
            <textarea className={`${inputClassName} min-h-32`} value={form.background} onChange={(event) => setForm((current) => ({ ...current, background: event.target.value }))} />
          </Field>
        </div>

        {form.type === 'investor' ? (
          <div className="mt-8 grid gap-5 border-t border-[#e1dccf] pt-8 md:grid-cols-2">
            <Field label="Risk appetite">
              <select className={inputClassName} value={form.riskAppetite} onChange={(event) => setForm((current) => ({ ...current, riskAppetite: event.target.value as OnboardingInput['riskAppetite'] }))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </Field>
            <Field label="Industry focus">
              <input className={inputClassName} value={form.industryPreferences} onChange={(event) => setForm((current) => ({ ...current, industryPreferences: event.target.value }))} placeholder="AI, mobility, climate" />
            </Field>
            <Field label="Minimum investment">
              <input className={inputClassName} type="number" value={form.minInvestment} onChange={(event) => setForm((current) => ({ ...current, minInvestment: Number(event.target.value) }))} />
            </Field>
            <Field label="Maximum investment">
              <input className={inputClassName} type="number" value={form.maxInvestment} onChange={(event) => setForm((current) => ({ ...current, maxInvestment: Number(event.target.value) }))} />
            </Field>
          </div>
        ) : null}

        {error ? <p className="mt-6 text-sm text-rose-700">{error}</p> : null}

        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleSubmit}
            loading={loading}
            disabled={!form.name.trim() || !form.city.trim() || !form.country.trim()}
          >
            Create workspace
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Field({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-[#6e746e]">{label}</span>
      {children}
    </label>
  );
}

const inputClassName = 'w-full rounded-2xl border border-[#d2ccbd] bg-[#fdfcf8] px-4 py-3 text-sm text-[#18211d] outline-none transition focus:border-[#1f4f46]';
