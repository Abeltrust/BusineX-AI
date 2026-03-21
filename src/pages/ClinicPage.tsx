import { useEffect, useState } from 'react';
import { Button, Card, EmptyState, PageHeader } from '../components/ui';
import { useBusinessData } from '../contexts/BusinessDataContext';

export function ClinicPage() {
  const { clinicInput, clinicReport, loading, profile, submitClinic } = useBusinessData();
  const [businessInfo, setBusinessInfo] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setBusinessInfo(clinicInput);
  }, [clinicInput]);

  if (!profile) {
    return null;
  }

  async function handleSubmit() {
    setError('');

    try {
      await submitClinic(businessInfo);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to generate a clinic report.');
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Business review"
        title="Assess an operating business"
        description="Capture the current situation, then generate a structured review with recommendations you can revisit later."
      />

      <Card className="p-6 md:p-8">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-[#6e746e]">Business summary</span>
          <textarea
            className="min-h-40 w-full rounded-[1.75rem] border border-[#d2ccbd] bg-[#fdfcf8] px-4 py-4 text-sm text-[#18211d] outline-none transition focus:border-[#1f4f46]"
            value={businessInfo}
            onChange={(event) => setBusinessInfo(event.target.value)}
            placeholder={`Describe ${profile.name}'s business, current traction, bottlenecks, team structure, and financial pressure points.`}
          />
        </label>

        {error ? <p className="mt-4 text-sm text-rose-700">{error}</p> : null}

        <div className="mt-6">
          <Button onClick={handleSubmit} loading={loading} disabled={!businessInfo.trim()}>
            Generate review
          </Button>
        </div>
      </Card>

      {clinicReport ? (
        <div className="grid gap-4 md:grid-cols-2">
          <ReportCard title="Diagnosis" items={[clinicReport.diagnosis]} />
          <ReportCard title="Recovery strategies" items={clinicReport.recoveryStrategies} />
          <ReportCard title="Growth hacks" items={clinicReport.growthHacks} />
          <ReportCard title="Pivot opportunities" items={clinicReport.pivotOpportunities} />
          <ReportCard title="Investment readiness" items={clinicReport.investmentReadySteps} />
        </div>
      ) : (
        <EmptyState
          title="No saved review yet"
          description="Submit a business summary above to create a saved operating review for this workspace."
        />
      )}
    </div>
  );
}

function ReportCard({ items, title }: { items: string[]; title: string }) {
  return (
    <Card className="p-6">
      <p className="section-label">{title}</p>
      <div className="mt-4 space-y-3 text-sm leading-6 text-[#5f655f]">
        {items.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>
    </Card>
  );
}
