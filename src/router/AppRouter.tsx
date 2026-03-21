import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ReviewPage } from '../pages/ReviewPage';
import { SetupPage } from '../pages/SetupPage';
import { WorkspacePage } from '../pages/WorkspacePage';
import { useRouter } from './useRouter';

const routeMap: Record<string, ReactNode> = {
  '/': <HomePage />,
  '/setup': <SetupPage />,
  '/workspace': <WorkspacePage />,
  '/review': <ReviewPage />,
};

function RoutedContent() {
  const { pathname } = useRouter();
  const page = routeMap[pathname] ?? <NotFoundPage />;

  return (
    <AnimatePresence mode="wait">
      <motion.div key={pathname} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}>
        {page}
      </motion.div>
    </AnimatePresence>
  );
}

export function AppRouter() {
  return <RoutedContent />;
}
