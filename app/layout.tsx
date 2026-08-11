import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ALCO Content Engine',
  description: 'Premium brand-aware content planning and calendar engine powered by Gemini AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 antialiased min-h-screen selection:bg-brand selection:text-black">
        {children}
      </body>
    </html>
  );
}
