import { AppShell } from './components/layout/AppShell';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { AppRouter } from './router/AppRouter';
import { RouterProvider } from './router/useRouter';

export default function App() {
  return (
    <RouterProvider>
      <WorkspaceProvider>
        <AppShell>
          <AppRouter />
        </AppShell>
      </WorkspaceProvider>
    </RouterProvider>
  );
}
