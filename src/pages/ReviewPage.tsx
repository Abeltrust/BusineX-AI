import { Stethoscope } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useWorkspace } from '../context/WorkspaceContext';
import { useRouter } from '../router/useRouter';

export function ReviewPage() {
  const { navigate } = useRouter();
  const { workspace, clinicInput, clinicReport, clinicLoading, setClinicInput, runClinic } = useWorkspace();

  if (!workspace) {
    return (
      <Card className="mx-auto max-w-3xl p-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight">No business context available</h1>
        <p className="mt-3 text-[var(--text-muted)]">
          Create a workspace first so the review engine has strategy and company context.
        </p>
        <Button className="mt-6" onClick={() => navigate('/setup')}>
          Go to Setup
        </Button>
      </Card>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-5xl space-y-6"
    >
      <Card className="panel-strong overflow-hidden text-white">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-cyan-200">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Business Review</h1>
              <p className="text-sm text-slate-300">
                Assess bottlenecks, refine operating actions, and improve readiness for the next growth stage.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 md:p-8">
        <textarea
          className="field min-h-36"
          value={clinicInput}
          onChange={(event) => setClinicInput(event.target.value)}
          placeholder="Describe your current business challenge in detail..."
        />
        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={runClinic} loading={clinicLoading}>
            Generate Review
          </Button>
          <Button variant="outline" onClick={() => navigate('/workspace')}>
            Back to Workspace
          </Button>
        </div>
      </Card>

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
  );
}
