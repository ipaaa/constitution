'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { CrossTrackLink } from '@/data/cross-track-links';

const TRACK_STYLES: Record<
  CrossTrackLink['track'],
  { badge: string; badgeText: string; accent: string; bg: string; hoverBg: string }
> = {
  past: {
    badge: 'bg-[#1565C0]',
    badgeText: 'T1 過去',
    accent: 'border-[#1565C0]/30',
    bg: 'bg-[#1565C0]/5',
    hoverBg: 'hover:bg-[#1565C0]/10',
  },
  present: {
    badge: 'bg-gray-800',
    badgeText: 'T2 現在',
    accent: 'border-gray-300',
    bg: 'bg-gray-50',
    hoverBg: 'hover:bg-gray-100',
  },
  future: {
    badge: 'bg-[#D32F2F]',
    badgeText: 'T3 未來',
    accent: 'border-[#D32F2F]/30',
    bg: 'bg-[#D32F2F]/5',
    hoverBg: 'hover:bg-[#D32F2F]/10',
  },
};

interface CrossTrackLinksProps {
  links: CrossTrackLink[];
  heading?: string;
  compact?: boolean;
}

export default function CrossTrackLinks({ links, heading, compact = false }: CrossTrackLinksProps) {
  if (links.length === 0) return null;

  return (
    <div className={compact ? '' : 'mt-6'}>
      {heading && (
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          {heading}
        </p>
      )}
      <div className={`flex flex-col ${compact ? 'gap-1.5' : 'gap-2'}`}>
        {links.map((link, i) => {
          const style = TRACK_STYLES[link.track];
          return (
            <Link
              key={`${link.track}-${i}`}
              href={link.href}
              className={`group flex items-center gap-3 border ${style.accent} ${style.bg} ${style.hoverBg} rounded-sm transition-all ${
                compact ? 'px-3 py-2' : 'px-4 py-3'
              }`}
            >
              <span
                className={`${style.badge} text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm tracking-wider uppercase shrink-0`}
              >
                {style.badgeText}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className={`font-medium text-gray-900 truncate ${
                    compact ? 'text-xs' : 'text-sm'
                  }`}
                >
                  {link.label}
                </p>
                {!compact && link.description && (
                  <p className="text-[11px] text-gray-500 truncate">{link.description}</p>
                )}
              </div>
              <ArrowRight
                size={compact ? 12 : 14}
                className="text-gray-400 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all shrink-0"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
