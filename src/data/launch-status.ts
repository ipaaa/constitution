export const ALL_PAGES = ['/', '/controversy-timeline', '/future', '/opinion-lazybag', '/past', '/present', '/about'];

export const PUBLIC_PAGES = ['/', '/controversy-timeline', '/future'];

// Default: all pages open (team mode)
// Set NEXT_PUBLIC_PUBLIC_MODE=true in Vercel Production to lock to PUBLIC_PAGES only
export const LAUNCHED_PAGES =
  process.env.NEXT_PUBLIC_PUBLIC_MODE === 'true'
    ? PUBLIC_PAGES
    : ALL_PAGES;
