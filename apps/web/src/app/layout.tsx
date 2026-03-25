import type { Metadata } from 'next';
import Providers from '@/components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: '曲阜师范大学 QA 问答平台',
  description: '曲阜师范大学校园问答平台，快速找到你需要的答案',
  keywords: ['曲阜师范大学', 'QFNU', '问答', '校园'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
