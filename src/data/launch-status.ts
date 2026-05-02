const ALL_PAGES = ['/', '/controversy-timeline', '/future', '/opinion-lazybag', '/past', '/present', '/about'];

const PUBLIC_PAGES = ['/', '/controversy-timeline', '/future'];

export const LAUNCHED_PAGES =
  process.env.NEXT_PUBLIC_PREVIEW_MODE === 'true'
    ? ALL_PAGES
    : PUBLIC_PAGES;
