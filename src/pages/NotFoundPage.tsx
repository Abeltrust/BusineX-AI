import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useRouter } from '../router/useRouter';

export function NotFoundPage() {
  const { navigate } = useRouter();

  return (
    <Card className="mx-auto max-w-3xl p-10 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">404</p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-3 text-[var(--text-muted)]">
        The route does not exist in this workspace. Use the homepage to continue.
      </p>
      <Button className="mt-6" onClick={() => navigate('/')}>
        Back Home
      </Button>
    </Card>
  );
}
