
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fallbackLng } from '@/i18n/config';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the default language's dashboard
    // or a landing page if you have one at /:lng
    router.replace(`/${fallbackLng}/dashboard`);
  }, [router]);

  return null; // Or a loading spinner
}
