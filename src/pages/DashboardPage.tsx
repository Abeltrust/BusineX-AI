import { Download, RefreshCcw, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Button, Card, EmptyState, PageHeader } from '../components/ui';
import { useBusinessData } from '../contexts/BusinessDataContext';
import type { BusinessIdea } from '../types';

export function DashboardPage() {
  const { generateIdeaDetails, ideas, loading, profile, refreshIdeas, investInIdea } = useBusinessData();
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const selectedIdea = ideas.find((idea) => idea.id === selectedIdeaId) ?? ideas[0] ?? null;

  async function handleSelectIdea(idea: BusinessIdea) {
    setSelectedIdeaId(idea.id);
    setError('');

    try {
      await generateIdeaDetails(idea);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to expand this idea.');
    }
  }

  async function handleInvest(idea: BusinessIdea) {
    setError('');

    try {
      await investInIdea(idea);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to complete this investment.');
    }
  }

  if (!profile) {
    return null;
  }

  if (!ideas.length) {
    return (
      <EmptyState
        title="No ideas in your workspace yet"
        description="Generate a fresh set of opportunities from your onboarding profile."
        action={<Button onClick={() => void refreshIdeas()} loading={loading}>Generate ideas</Button>}
      />
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={profile.type === 'founder' ? 'Founder workspace' : 'Investor workspace'}
        title={`Welcome back, ${profile.name}`}
        description={`Review opportunities matched to ${profile.location.city}, ${profile.location.country}, then expand the ones worth pursuing.`}
        actions={(
          <Button variant="outline" onClick={() => void refreshIdeas()} loading={loading}>
            <RefreshCcw className="h-4 w-4" />
            Refresh list
          </Button>
        )}
      />

      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <SummaryCard label="Profile type" value={profile.type === 'founder' ? 'Founder' : 'Investor'} note="Current workspace mode" />
        <SummaryCard label="Available opportunities" value={String(ideas.length)} note="Saved to your workspace" />
        <SummaryCard label="Capital" value={`$${profile.wallet.balance.toLocaleString()}`} note="Current wallet balance" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-4">
          {ideas.map((idea) => (
            <Card key={idea.id} className={`p-6 transition ${selectedIdea?.id === idea.id ? 'border-[#8ea69a] shadow-[0_14px_36px_rgba(36,43,38,0.08)]' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="section-label">{profile.type === 'founder' ? 'Opportunity' : 'Investment target'}</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#18211d]">{idea.name}</h2>
                </div>
                <Button variant="ghost" onClick={() => void handleSelectIdea(idea)}>
                  <Sparkles className="h-4 w-4" />
                  Review
                </Button>
              </div>
              <p className="text-soft mt-4 text-sm leading-6">{idea.concept}</p>
            </Card>
          ))}
        </div>

        {selectedIdea ? (
          <Card className="p-6 md:p-8">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="section-label">Selected opportunity</p>
                <h2 className="text-3xl font-semibold tracking-tight text-[#18211d]">{selectedIdea.name}</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <InfoBlock label="Problem" value={selectedIdea.problem} />
              <InfoBlock label="Solution" value={selectedIdea.solution} />
              <InfoBlock label="Target market" value={selectedIdea.targetMarket} />
              <InfoBlock label="Advantage" value={selectedIdea.competitiveAdvantage} />
            </div>

            {selectedIdea.roadmap ? (
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <InfoBlock label="Day 1" value={selectedIdea.roadmap.day1} />
                <InfoBlock label="First 30 days" value={selectedIdea.roadmap.first30Days} />
                <InfoBlock label="Six months" value={selectedIdea.roadmap.sixMonths} />
                <InfoBlock label="Five to ten years" value={selectedIdea.roadmap.fiveToTenYears} />
              </div>
            ) : (
              <div className="surface-muted mt-8 rounded-[1.75rem] border-dashed p-6 text-sm text-[#5f655f]">
                Generate supporting materials to add the operating plan and funding summary for this opportunity.
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={() => void handleSelectIdea(selectedIdea)} loading={loading}>
                Build plan
              </Button>
              {selectedIdea.roadmap ? (
                <Button variant="outline" onClick={() => downloadPdf('roadmap', selectedIdea)}>
                  <Download className="h-4 w-4" />
                  Export plan
                </Button>
              ) : null}
              {selectedIdea.investorReady ? (
                <Button variant={profile.type === 'investor' ? 'secondary' : 'outline'} onClick={() => profile.type === 'investor' ? void handleInvest(selectedIdea) : downloadPdf('pitch', selectedIdea)}>
                  {profile.type === 'investor' ? 'Record investment' : 'Export brief'}
                </Button>
              ) : null}
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-muted rounded-[1.5rem] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#6e746e]">{label}</p>
      <p className="mt-3 text-sm leading-6 text-[#25302a]">{value}</p>
    </div>
  );
}

function SummaryCard({ label, note, value }: { label: string; note: string; value: string }) {
  return (
    <Card className="p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#6e746e]">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-[#18211d]">{value}</p>
      <p className="mt-2 text-sm text-[#5f655f]">{note}</p>
    </Card>
  );
}

function downloadPdf(type: 'roadmap' | 'pitch', idea: BusinessIdea) {
  const doc = new jsPDF();
  const sections = type === 'roadmap' && idea.roadmap
    ? [
      ['Day 1', idea.roadmap.day1],
      ['First 30 Days', idea.roadmap.first30Days],
      ['Six Months', idea.roadmap.sixMonths],
      ['Five to Ten Years', idea.roadmap.fiveToTenYears],
    ]
    : idea.investorReady
      ? [
        ['Executive Summary', idea.investorReady.executiveSummary],
        ['Market Opportunity', idea.investorReady.marketOpportunity],
        ['Business Model', idea.investorReady.businessModel],
        ['Financial Projections', idea.investorReady.financialProjections],
      ]
      : [];

  let y = 20;
  doc.setFontSize(20);
  doc.text(idea.name, 20, y);
  y += 14;

  sections.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(value, 170);
    doc.text(lines, 20, y);
    y += lines.length * 7 + 6;
  });

  doc.save(`${idea.name}-${type}.pdf`);
}
