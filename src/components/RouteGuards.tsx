import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBusinessData } from '../contexts/BusinessDataContext';

function FullScreenMessage({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f4ef] px-6 text-center text-sm text-zinc-500">
      {message}
    </div>
  );
}

export function ProtectedRoute({ children }: { children?: ReactNode }) {
  const location = useLocation();
  const { authReady, user } = useAuth();

  if (!authReady) {
    return <FullScreenMessage message="Checking your session..." />;
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children ?? <Outlet />;
}

export function ProfileRoute() {
  const { profile, profileReady } = useBusinessData();

  if (!profileReady) {
    return <FullScreenMessage message="Loading your workspace..." />;
  }

  if (!profile) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
