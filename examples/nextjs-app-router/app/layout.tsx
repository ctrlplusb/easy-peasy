import type { ReactNode } from 'react';

export const metadata = {
  title: 'Easy Peasy v7 — Next.js App Router',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui', maxWidth: 720, margin: '2rem auto' }}>
        {children}
      </body>
    </html>
  );
}
