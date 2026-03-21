import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type RouterContextValue = {
  pathname: string;
  navigate: (to: string) => void;
};

const RouterContext = createContext<RouterContextValue | null>(null);

function getCurrentPath() {
  return window.location.pathname || '/';
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [pathname, setPathname] = useState(getCurrentPath);

  useEffect(() => {
    const handlePopState = () => setPathname(getCurrentPath());
    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const value = useMemo(
    () => ({
      pathname,
      navigate: (to: string) => {
        if (to === pathname) {
          return;
        }

        window.history.pushState({}, '', to);
        setPathname(to);
      },
    }),
    [pathname],
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  const context = useContext(RouterContext);

  if (!context) {
    throw new Error('useRouter must be used within RouterProvider');
  }

  return context;
}
