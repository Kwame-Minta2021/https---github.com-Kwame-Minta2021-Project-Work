
import type { Metadata } from 'next';
import { Geist_Sans, Geist_Mono } from 'next/font/google'; // Corrected import
import '../globals.css'; // Adjusted path
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/context/theme-provider";
import { dir } from 'i18next';
import { languages } from '@/i18n/config';
import { getTranslations } from '@/i18n'; // Use your getTranslations

const geistSans = Geist_Sans({ // Corrected instantiation
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({ // Corrected instantiation
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

// export const metadata: Metadata = { // Metadata can be dynamic based on language
// title: 'BreatheEasy Dashboard',
// description: 'Air Quality Monitoring Dashboard',
// };

export async function generateMetadata({ params: { lng } }: { params: { lng: string } }): Promise<Metadata> {
  const { t } = await getTranslations(lng, 'common');
  return {
    title: t('dashboardTitle'), // Example of using translated title
    description: 'Air Quality Monitoring Dashboard', // This can also be translated
  };
}


export default function LocaleLayout({ // Renamed from RootLayout to avoid confusion
  children,
  params: { lng },
}: Readonly<{
  children: React.ReactNode;
  params: { lng: string };
}>) {
  return (
    <html lang={lng} dir={dir(lng)} suppressHydrationWarning>
      <body 
        className={`${geistSans.variable} ${geistMono.variable} antialiased`} 
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
