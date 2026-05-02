'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { LAUNCHED_PAGES } from '@/data/launch-status';
import ComingSoon from './ComingSoon';

const ALL_PAGES = ['/', '/controversy-timeline', '/future', '/opinion-lazybag', '/past', '/present', '/about'];

export default function LaunchGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isPublicMode = searchParams.get('public') === 'true' || process.env.NEXT_PUBLIC_PUBLIC_MODE === 'true';

  const pages = isPublicMode ? LAUNCHED_PAGES : ALL_PAGES;

  const isLaunched = pages.some(
    (page) => pathname === page || (page !== '/' && pathname.startsWith(page + '/'))
  );

  if (!isLaunched) {
    return <ComingSoon />;
  }

  return <>{children}</>;
}
