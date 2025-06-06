import type { Metadata } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google'; // Changed font imports
import '../globals.css'; // Adjusted path
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/context/theme-provider";
import { dir } from 'i18next';
import { languages } from '@/i18n/config';
import { getTranslations } from '@/i18n'; // Use your getTranslations

const inter = Inter({ // Changed font instantiation
  variable: '--font-inter', // Changed CSS variable name
  subsets: ['latin'],
});

const robotoMono = Roboto_Mono({ // Changed font instantiation
  variable: '--font-roboto-mono', // Changed CSS variable name
  subsets: ['latin'],
});

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export async function generateMetadata({ params }: { params: { lng: string } }): Promise<Metadata> {
  const { lng } = await params;
  const { t } = await getTranslations(lng, 'common');
  return {
    title: t('dashboardTitle'), // Example of using translated title
    description: 'Air Quality Monitoring Dashboard', // This can also be translated
  };
}


export default async function LocaleLayout({ // Renamed from RootLayout to avoid confusion
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lng: string }>;
}>) {
  const { lng } = await params; {
  return (
    <html lang={lng} dir={dir(lng)} suppressHydrationWarning>
      <body 
        className={`${inter.variable} ${robotoMono.variable} antialiased`} // Used updated font variables
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