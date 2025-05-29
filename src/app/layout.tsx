// src/app/layout.tsx
import './globals.css'; // Keep global styles accessible

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // This RootLayout delegates the <html> and <body> structure
  // to the [lng]/layout.tsx when using internationalized routing.
  // It should not render <html> or <body> tags itself.
  return <>{children}</>;
}
