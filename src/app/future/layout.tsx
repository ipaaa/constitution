import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '未來：憲庭載入中 | Add C0urt 憲庭加好友',
  description: '客觀的系統癱瘓數據。透視五人極限運作的系統瓶頸，待審案件與大法官任期時間軸。',
  openGraph: {
    title: '未來：憲庭載入中 | Add C0urt 憲庭加好友',
    description: '客觀的系統癱瘓數據。透視五人極限運作的系統瓶頸，待審案件與大法官任期時間軸。',
    images: [{ url: '/owl-avatars/owl.png', width: 360, height: 360, alt: 'Add C0urt 貓頭鷹法官吉祥物' }],
  },
};

export default function FutureLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
