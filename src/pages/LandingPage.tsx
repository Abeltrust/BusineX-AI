import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  ChevronRight,
  Landmark,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button, Card } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useBusinessData } from '../contexts/BusinessDataContext';
import { isFirebaseConfigured } from '../lib/firebase';

const features = [
  {
    icon: BriefcaseBusiness,
    title: 'Founder mode',
    description: 'A focused workspace for new venture exploration, operating plans, and exportable materials.',
  },
  {
    icon: Landmark,
    title: 'Investor mode',
    description: 'A capital-aware workflow for reviewing targets, recording commitments, and tracking activity.',
  },
  {
    icon: Wallet,
    title: 'Persistent records',
    description: 'Profiles, opportunity data, reviews, and wallet entries stay available across sessions in Firebase.',
  },
  {
    icon: BarChart3,
    title: 'Practical outputs',
    description: 'The product is organized around decisions and records, not generic chat responses.',
  },
];

const audienceCards = [
  {
    icon: Building2,
    title: 'Founders',
    description: 'For operators who need a more structured path from initial concept to a workable plan.',
  },
  {
    icon: ShieldCheck,
    title: 'Investors',
    description: 'For capital allocators who want consistent opportunity framing and a simple investment log.',
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authLoading, authReady, signInWithGoogle, user } = useAuth();
  const { profile, profileReady } = useBusinessData();
  const [signInError, setSignInError] = useState('');

  if (user && authReady && profileReady) {
    return <Navigate to={profile ? '/dashboard' : '/onboarding'} replace />;
  }

  async function handleGoogleSignIn() {
    setSignInError('');

    try {
      await signInWithGoogle();
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      navigate(from ?? '/onboarding');
    } catch (error) {
      const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';

      if (code === 'auth/cancelled-popup-request' || code === 'auth/popup-closed-by-user') {
        return;
      }

      setSignInError('Google sign-in failed. Confirm localhost is in Firebase authorized domains and try again.');
    }
  }

  return (
    <div className="min-h-screen text-zinc-900">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <header className="surface flex flex-col gap-4 rounded-[2rem] px-5 py-4 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1f4f46] text-white shadow-[0_10px_24px_rgba(31,79,70,0.18)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight text-[#18211d]">BusineX</p>
              <p className="text-xs uppercase tracking-[0.3em] text-[#6e746e]">Business workspace</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleGoogleSignIn} loading={authLoading} disabled={!authReady || authLoading}>
              Sign in with Google
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="space-y-8 py-8 md:space-y-10 md:py-10">
          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Card className="overflow-hidden !border-0 !bg-[#18211d] p-8 text-white shadow-[0_30px_80px_rgba(28,36,31,0.18)] md:p-12">
              <p className="inline-flex items-center gap-2 rounded-full border border-[#f4efe4]/20 bg-[#f4efe4]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#f7f2e8]">
                <ShieldCheck className="h-4 w-4" />
                Business planning and investment workflow
              </p>

              <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-[0.95] tracking-tight text-[#fffdf8] md:text-6xl">
                One workspace for opportunity review, planning, and business records.
              </h1>

              <p className="mt-6 max-w-2xl text-sm leading-7 text-[#f0ebe1] md:text-base">
                BusineX helps founders and investors move from profile setup to real working outputs. Generate opportunities, expand them into plans,
                run business reviews, and keep everything saved in one persistent workspace.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button
                  onClick={handleGoogleSignIn}
                  loading={authLoading}
                  disabled={!authReady || authLoading}
                  className="min-w-[220px] !bg-[#e4c98a] px-6 py-3.5 !text-[#18211d] hover:!bg-[#d9bb74]"
                >
                  Enter the workspace
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/onboarding')}
                  className="min-w-[220px] !border-[#c8d1cb]/50 !bg-[#24312b] px-6 py-3.5 !text-[#fffdf8] hover:!bg-[#2b3932]"
                >
                  Explore the flow
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {!isFirebaseConfigured ? (
                <p className="mt-6 text-sm text-[#f3c98b]">
                  Firebase env vars are missing. Add them before Google auth and Firestore will work.
                </p>
              ) : null}
              {signInError ? (
                <p className="mt-4 text-sm text-[#ffb3b3]">{signInError}</p>
              ) : null}
            </Card>

            <div className="grid gap-6">
              <Card className="p-7">
                <p className="section-label">Workflow</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#18211d]">A straightforward operating flow</h2>
                <div className="mt-6 space-y-4">
                  {[
                    'Sign in and create a founder or investor profile.',
                    'Generate opportunities matched to location, background, and capital.',
                    'Expand selected items into plans, briefs, and review records.',
                    'Keep everything available in the same workspace over time.',
                  ].map((item, index) => (
                    <div key={item} className="surface-muted rounded-[1.5rem] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#6e746e]">Step {index + 1}</p>
                      <p className="mt-2 text-sm leading-6 text-[#25302a]">{item}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-7">
                <p className="section-label">Built for</p>
                <div className="mt-5 grid gap-4">
                  {audienceCards.map((item) => (
                    <div key={item.title} className="surface-muted rounded-[1.5rem] p-5">
                      <item.icon className="h-5 w-5 text-[#1f4f46]" />
                      <h3 className="mt-3 text-lg font-semibold tracking-tight text-[#18211d]">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#5f655f]">{item.description}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="p-6">
                <feature.icon className="h-6 w-6 text-[#1f4f46]" />
                <h2 className="mt-5 text-xl font-semibold tracking-tight text-[#18211d]">{feature.title}</h2>
                <p className="mt-3 text-sm leading-6 text-[#5f655f]">{feature.description}</p>
              </Card>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}
