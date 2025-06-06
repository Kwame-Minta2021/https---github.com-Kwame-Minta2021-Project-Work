// src/app/[lng]/layout.tsx

import React from "react";

// This layout receives the dynamic `lng` parameter (e.g., 'en', 'fr') from the route
export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lng: string };
}) {
  return (
    <html lang={params.lng}>
      <body>{children}</body>
    </html>
  );
}
