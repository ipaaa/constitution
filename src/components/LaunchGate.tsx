'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { LAUNCHED_PAGES, ALL_PAGES } from '@/data/launch-status';
import ComingSoon from './ComingSoon';

export default function LaunchGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPublicMode, setIsPublicMode] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // ?public=true sets localStorage, persists across navigation
    if (searchParams.get('public') === 'true') {
      localStorage.setItem('public_mode', 'true');
      setIsPublicMode(true);
    } else if (localStorage.getItem('public_mode') === 'true') {
      setIsPublicMode(true);
    }
    // env var override (build-time)
    if (process.env.NEXT_PUBLIC_PUBLIC_MODE === 'true') {
      setIsPublicMode(true);
    }
    setReady(true);
  }, [searchParams]);

  // Don't flash content before hydration
  if (!ready) return null;

  const pages = isPublicMode ? LAUNCHED_PAGES : ALL_PAGES;

  const isLaunched = pages.some(
    (page) => pathname === page || (page !== '/' && pathname.startsWith(page + '/'))
  );

  if (!isLaunched) {
    return <ComingSoon />;
  }

  return <>{children}</>;
}
