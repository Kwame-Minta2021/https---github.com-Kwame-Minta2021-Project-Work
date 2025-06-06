// src/app/[lng]/dashboard/page.tsx
import React from 'react';
import DashboardClientContent from '@/components/dashboard/dashboard-client-content';
import AIAnalyzerWrapper from '@/components/dashboard/ai-analyzer-wrapper';
import type { CustomAlertSettings } from '@/types'; 

interface DashboardPageProps {
  params: { lng: string }; 
  customAlertSettings?: CustomAlertSettings;
}

export default async function DashboardPage({ params, customAlertSettings }: DashboardPageProps) {
  const { lng } = await params;

  return (
    <DashboardClientContent 
      lng={lng}
      initialCustomAlertSettings={customAlertSettings || {}}
    >
      <AIAnalyzerWrapper lng={lng} />
    </DashboardClientContent>
  );
}