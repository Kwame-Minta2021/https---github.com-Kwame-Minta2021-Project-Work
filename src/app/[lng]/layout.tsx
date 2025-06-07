import type { Metadata } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import '../globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/context/theme-provider";
import { dir } from 'i18next';
import { languages } from '@/i18n/config';
import { getTranslations } from '@/i18n';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const robotoMono = Roboto_Mono({
  variable: '--font-roboto-mono',
  subsets: ['latin'],
});

// For generating static paths for internationalized routes
export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

// For localized page metadata
export async function generateMetadata({ params }: { params: { lng: string } }): Promise<Metadata> {
  const { lng } = params;
  const { t } = await getTranslations(lng, 'common');
  return {
    title: t('dashboardTitle'),
    description: 'Air Quality Monitoring Dashboard',
  };
}

// Layout component with localization
export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lng: string }>;
}>) {
  const { lng } = await params;

  return (
    <html lang={lng} dir={dir(lng)} suppressHydrationWarning>
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
