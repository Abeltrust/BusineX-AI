import { Link } from 'react-router-dom';
import { Button, Card } from '../components/ui';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f4ef] px-4">
      <Card className="max-w-lg p-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400">404</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-500">The route you requested does not exist in this workspace.</p>
        <div className="mt-6">
          <Link to="/">
            <Button>Back home</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
