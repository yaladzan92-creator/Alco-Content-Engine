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
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
