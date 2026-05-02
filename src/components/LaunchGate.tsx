'use client';

import { usePathname } from 'next/navigation';
import { LAUNCHED_PAGES } from '@/data/launch-status';
import ComingSoon from './ComingSoon';

export default function LaunchGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isLaunched = LAUNCHED_PAGES.some(
    (page) => pathname === page || (page !== '/' && pathname.startsWith(page + '/'))
  );

  if (!isLaunched) {
    return <ComingSoon />;
  }

  return <>{children}</>;
}
