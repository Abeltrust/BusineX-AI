import { Briefcase, LayoutDashboard, RefreshCcw, Stethoscope } from 'lucide-react';
import type { ReactNode } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useRouter } from '../../router/useRouter';
import { Button } from '../ui/Button';

type AppShellProps = {
  children: ReactNode;
};

const navigation = [
  { label: 'Home', path: '/' },
  { label: 'Setup', path: '/setup' },
  { label: 'Workspace', path: '/workspace', icon: LayoutDashboard },
  { label: 'Review', path: '/review', icon: Stethoscope },
];

export function AppShell({ children }: AppShellProps) {
  const { navigate, pathname } = useRouter();
  const { workspace, resetWorkspace } = useWorkspace();

  return (
    <div className="app-shell min-h-screen text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-900/10 bg-[color:rgba(246,249,252,0.84)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
          <button className="flex items-center gap-3 text-left" onClick={() => navigate('/')}>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary)] shadow-lg shadow-cyan-950/20">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-[var(--heading)]">BusineX AI</p>
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">
                Business Operating System
              </p>
            </div>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {navigation.map((item) => {
              const isProtected = item.path === '/workspace' || item.path === '/review';
              const disabled = isProtected && !workspace;

              return (
                <Button
                  key={item.path}
                  variant={pathname === item.path ? 'primary' : 'ghost'}
                  className="min-w-[104px]"
                  disabled={disabled}
                  onClick={() => navigate(item.path)}
                >
                  {item.icon ? <item.icon className="h-4 w-4" /> : null}
                  {item.label}
                </Button>
              );
            })}
            <Button variant="outline" onClick={resetWorkspace}>
              <RefreshCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">{children}</main>

      <footer className="border-t border-slate-900/10 px-4 py-8 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-[var(--text-muted)]">
            Strategy, execution, pipeline, and business review in one founder workspace.
          </p>
          <p className="text-sm text-slate-400">Built for disciplined operators who need clarity, not clutter.</p>
        </div>
      </footer>
    </div>
  );
}
