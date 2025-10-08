import type { Metadata } from 'next';
import { Inter, Lexend, Pacifico } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { UserSessionProvider } from '@/context/UserSessionContext';

const fontBody = Lexend({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

const fontHeadline = Lexend({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-headline',
});

const fontBrand = Pacifico({
  subsets: ['latin'],
  display: 'swap',
  weight: '400',
  variable: '--font-brand',
});

const faviconSvg = `
  <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 100,20 C 140,20 180,60 180,100 C 180,140 140,180 100,180 C 60,180 20,140 20,100 C 20,60 60,20 100,20 Z" fill="hsl(250 80% 60%)" />
    <circle cx="100" cy="100" r="30" fill="white" opacity="0.8" />
  </svg>
`.trim();

const faviconDataUri = `data:image/svg+xml,${encodeURIComponent(faviconSvg)}`;

export const metadata: Metadata = {
  title: 'Noether - Simply and Lovely Learning',
  description: 'Your personal AI study assistant to master any subject.',
  icons: {
    icon: faviconDataUri,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'font-body antialiased',
          fontBody.variable,
          fontHeadline.variable,
          fontBrand.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UserSessionProvider>
            {children}
          </UserSessionProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
