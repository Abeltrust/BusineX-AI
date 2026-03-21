import { LogOut, Rocket } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBusinessData } from '../contexts/BusinessDataContext';
import { Button } from './ui';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/clinic', label: 'Clinic' },
  { to: '/wallet', label: 'Wallet' },
];

export function AppShell() {
  const navigate = useNavigate();
  const { signOutUser, user } = useAuth();
  const { profile } = useBusinessData();

  async function handleSignOut() {
    await signOutUser();
    navigate('/', { replace: true });
  }

  return (
    <div className="min-h-screen text-zinc-900">
      <nav className="sticky top-0 z-50 border-b border-[#d6d2c4] bg-[#f6f3eb]/92 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <button className="flex items-center gap-3" onClick={() => navigate(profile ? '/dashboard' : '/')}>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1f4f46] text-white shadow-[0_10px_24px_rgba(31,79,70,0.18)]">
              <Rocket className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-lg font-semibold tracking-tight text-[#18211d]">BusineX</p>
              <p className="text-xs uppercase tracking-[0.3em] text-[#6b726b]">Workspace</p>
            </div>
          </button>

          <div className="hidden items-center gap-2 rounded-full border border-[#d6d2c4] bg-[#fbfaf6] p-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `rounded-full px-4 py-2 text-sm font-medium transition ${isActive ? 'bg-[#1f4f46] text-white shadow-sm' : 'text-[#5f655f] hover:bg-[#f1eee4] hover:text-[#18211d]'}`}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs uppercase tracking-[0.25em] text-[#6e746e]">{profile?.type ?? 'account'}</p>
              <p className="text-sm font-semibold text-[#18211d]">{profile?.name ?? user?.displayName ?? 'BusineX user'}</p>
            </div>
            <Button variant="ghost" onClick={handleSignOut} className="px-3">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <Outlet />
      </main>
    </div>
  );
}
