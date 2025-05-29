
// This is now a minimal root layout, as [lng]/layout.tsx will be the main one.
import './globals.css'; // Keep global styles accessible

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  );
}
