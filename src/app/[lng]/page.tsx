
'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'; // useParams to get lng

export default function LocaleHomePage() {
  const router = useRouter();
  const params = useParams();
  const lng = params.lng as string;

  useEffect(() => {
    if (lng) {
      router.replace(`/${lng}/dashboard`);
    }
  }, [router, lng]);

  return null; // Or a loading spinner
}
