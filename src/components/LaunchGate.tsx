'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { LAUNCHED_PAGES } from '@/data/launch-status';
import ComingSoon from './ComingSoon';

const ALL_PAGES = ['/', '/controversy-timeline', '/future', '/opinion-lazybag', '/past', '/present', '/about'];

export default function LaunchGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';

  const pages = isPreview ? ALL_PAGES : LAUNCHED_PAGES;

  const isLaunched = pages.some(
    (page) => pathname === page || (page !== '/' && pathname.startsWith(page + '/'))
  );

  if (!isLaunched) {
    return <ComingSoon />;
  }

  return <>{children}</>;
}
