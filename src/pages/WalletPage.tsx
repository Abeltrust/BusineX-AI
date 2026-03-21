import { Wallet } from 'lucide-react';
import { Card, EmptyState, PageHeader } from '../components/ui';
import { useBusinessData } from '../contexts/BusinessDataContext';

export function WalletPage() {
  const { profile } = useBusinessData();

  if (!profile) {
    return null;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Wallet"
        title="Capital and investment activity"
        description="Track available balance, committed capital, and historical entries tied to the current profile."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Balance" value={`$${profile.wallet.balance.toLocaleString()}`} />
        <StatCard label="Received funds" value={`$${profile.wallet.receivedFunds.toLocaleString()}`} />
        <StatCard label="Returns" value={`$${profile.wallet.returns.toLocaleString()}`} />
      </div>

      {profile.wallet.investments.length ? (
        <div className="grid gap-4">
          {profile.wallet.investments.map((investment) => (
            <Card key={investment.id} className="p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="section-label">Investment</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#18211d]">{investment.businessName}</h2>
                </div>
                <div className="text-sm text-[#5f655f]">
                  ${investment.amount.toLocaleString()} for {investment.equity}% equity
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No investments yet"
          description="Recorded investments will appear here after you commit capital from the dashboard."
        />
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-6">
      <Wallet className="h-5 w-5 text-[#1f4f46]" />
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#6e746e]">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-[#18211d]">{value}</p>
    </Card>
  );
}
