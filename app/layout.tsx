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
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#f6f3ee] text-[#1f2933] antialiased min-h-screen selection:bg-[#0f766e] selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
