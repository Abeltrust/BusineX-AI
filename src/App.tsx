import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { ProtectedRoute, ProfileRoute } from './components/RouteGuards';
import { LandingPage } from './pages/LandingPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ClinicPage } from './pages/ClinicPage';
import { WalletPage } from './pages/WalletPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        element={(
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        )}
      >
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route
          element={<ProfileRoute />}
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/clinic" element={<ClinicPage />} />
          <Route path="/wallet" element={<WalletPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
      <Route path="/app" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
